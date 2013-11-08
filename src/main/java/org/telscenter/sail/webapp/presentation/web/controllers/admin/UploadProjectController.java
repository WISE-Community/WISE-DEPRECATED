/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU Lesser General Public License, v2.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.telscenter.sail.webapp.presentation.web.controllers.admin;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Calendar;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.Properties;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.Curnit;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;
import net.sf.sail.webapp.service.curnit.CurnitService;

import org.apache.commons.io.FileUtils;
import org.springframework.util.FileCopyUtils;
import org.springframework.validation.BindException;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.SimpleFormController;
import org.telscenter.sail.webapp.domain.impl.CreateUrlModuleParameters;
import org.telscenter.sail.webapp.domain.impl.ProjectParameters;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.domain.project.ProjectMetadata;
import org.telscenter.sail.webapp.domain.project.ProjectUpload;
import org.telscenter.sail.webapp.domain.project.impl.ProjectMetadataImpl;
import org.telscenter.sail.webapp.domain.project.impl.ProjectType;
import org.telscenter.sail.webapp.presentation.util.json.JSONObject;
import org.telscenter.sail.webapp.service.project.ProjectService;

/**
 * Admin tool for uploading a zipped LD project.
 * Unzips to curriculum_base_dir and registers the project (ie creates project in DB).
 * 
 * @author hirokiterashima
 * @version $Id$
 */
public class UploadProjectController extends SimpleFormController {

	private ProjectService projectService;
	
	private CurnitService curnitService;

	private Properties portalProperties;

	/**
	 * @override @see org.springframework.web.servlet.mvc.SimpleFormController#onSubmit(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse, java.lang.Object, org.springframework.validation.BindException)
	 */
	@Override
	protected ModelAndView onSubmit(HttpServletRequest request,
			HttpServletResponse response, Object command, BindException errors)
	throws Exception {
		// probably should do some kind of virus check. but for now, it's only
		// accessible to admin.

		// uploaded file must be a zip file and have a .zip extension

		ProjectUpload projectUpload = (ProjectUpload) command;
		MultipartFile file = projectUpload.getFile();

		// upload the zipfile to curriculum_base_dir
		String curriculumBaseDir = portalProperties.getProperty("curriculum_base_dir");

		File uploadDir = new File(curriculumBaseDir);
		if (!uploadDir.exists()) {
			throw new Exception("curriculum upload directory does not exist.");
		}

		// save the upload zip file in the curriculum folder.
		String sep = System.getProperty("file.separator");
		long timeInMillis = Calendar.getInstance().getTimeInMillis();
		String zipFilename = file.getOriginalFilename();
		String filename = zipFilename.substring(0, zipFilename.indexOf(".zip"));
		String newFilename = filename;
		if (new File(curriculumBaseDir + sep + filename).exists()) {
			// if this directory already exists, add a date time in milliseconds to the filename to make it unique
			newFilename = filename + "-" + timeInMillis;
		}
		String newFileFullPath = curriculumBaseDir + sep + newFilename + ".zip"; 
		
		// copy the zip file inside curriculum_base_dir temporarily
		File uploadedFile = new File(newFileFullPath);
		uploadedFile.createNewFile();
		FileCopyUtils.copy(file.getBytes(),uploadedFile);

		// make a new folder where the contents of the zip should go
		String newFileFullDir = curriculumBaseDir + sep + newFilename;
		File newFileFullDirFile = new File(newFileFullDir);
		newFileFullDirFile.mkdir();
		

		// unzip the zip file
		try {
			ZipFile zipFile = new ZipFile(newFileFullPath);
			Enumeration entries = zipFile.entries();
			
			int i=0;  // index used later to check for first folder in the zip file

			while(entries.hasMoreElements()) {				
				ZipEntry entry = (ZipEntry)entries.nextElement();
				
				if(entry.getName().startsWith("__MACOSX")) {
					// if this entry starts with __MACOSX, this zip file was created by a user using mac's "compress" feature.
					// ignore it.
					continue;
				}

				if(entry.isDirectory()) {
					// first check to see if the user has changed the zip file name and therefore the zipfile name
					// is no longer the same as the name of the first folder in the top-level of the zip file.
					// if this is the case, import will fail, so throw an error.
					if (i==0) {
						if (!entry.getName().startsWith(filename)) {
							throw new Exception("Zip file name does not match folder name. Do not change zip filename");
						}
						i++;						
					}

					// Assume directories are stored parents first then children.
					System.out.println("Extracting directory: " + entry.getName());
					// This is not robust, just for demonstration purposes.
					(new File(entry.getName().replace(filename, newFileFullDir))).mkdir();
					continue;
				}

				System.out.println("Extracting file: " + entry.getName() );
				copyInputStream(zipFile.getInputStream(entry),
						new BufferedOutputStream(new FileOutputStream(entry.getName().replaceFirst(filename, newFileFullDir))));
			}

			zipFile.close();
		} catch (IOException ioe) {
			System.err.println("Unhandled exception during project import. Project was not properly imported.");
			ioe.printStackTrace();
			throw ioe;
		}

		// remove the temp zip file
		uploadedFile.delete();
		
		// now create a project in the db with the new path
		String path = sep +  newFilename + sep + "wise4.project.json";
		String name = projectUpload.getName();
		User signedInUser = ControllerUtil.getSignedInUser();
		Set<User> owners = new HashSet<User>();
		owners.add(signedInUser);
		
		CreateUrlModuleParameters cParams = new CreateUrlModuleParameters();
		cParams.setUrl(path);
		Curnit curnit = curnitService.createCurnit(cParams);
		
		ProjectParameters pParams = new ProjectParameters();
		pParams.setCurnitId(curnit.getId());
		pParams.setOwners(owners);
		pParams.setProjectname(name);
		pParams.setProjectType(ProjectType.LD);

		ProjectMetadata metadata = null;

		// see if a file called wise4.project-meta.json exists. if yes, try parsing it.
		try {
			String projectMetadataFilePath = newFileFullDir + sep + "wise4.project-meta.json";
			String projectMetadataStr = FileUtils.readFileToString(new File(projectMetadataFilePath));
			JSONObject metadataJSONObj = new JSONObject(projectMetadataStr);
			metadata = new ProjectMetadataImpl();
			metadata.populateFromJSON(metadataJSONObj);
		} catch (Exception e) {
			// if there is any error during the parsing of the metadata, set the metadata to null
			metadata = null;
		}
		
		// If metadata is null at this point, either wise4.project-meta.json was not
		// found in the zip file, or there was an error parsing. 
		// Set a new fresh metadata object
		if (metadata == null) {
			metadata = new ProjectMetadataImpl();
			metadata.setTitle(name);
		}

		pParams.setMetadata(metadata);

		Project project = projectService.createProject(pParams);

		ModelAndView modelAndView = new ModelAndView(getSuccessView());		
		modelAndView.addObject("msg", "Upload project complete, new projectId is: " + project.getId());
		return modelAndView;
	}

	public static final void copyInputStream(InputStream in, OutputStream out)
	throws IOException
	{
		byte[] buffer = new byte[1024];
		int len;

		while((len = in.read(buffer)) >= 0)
			out.write(buffer, 0, len);

		in.close();
		out.close();
	}


	/**
	 * @param projectService the projectService to set
	 */
	public void setProjectService(ProjectService projectService) {
		this.projectService = projectService;
	}

	/**
	 * @param curnitService the curnitService to set
	 */
	public void setCurnitService(CurnitService curnitService) {
		this.curnitService = curnitService;
	}

	/**
	 * @param portalProperties the portalProperties to set
	 */
	public void setPortalProperties(Properties portalProperties) {
		this.portalProperties = portalProperties;
	}
}
