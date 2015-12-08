/**
 * Copyright (c) 2008-2015 Regents of the University of California (Regents).
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 * 
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 * 
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 * 
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 * 
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.presentation.web.controllers.admin;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Calendar;
import java.util.Enumeration;
import java.util.Properties;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import org.apache.commons.io.FileUtils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.wise.portal.domain.module.Curnit;
import org.wise.portal.domain.module.impl.ModuleParameters;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.ProjectMetadata;
import org.wise.portal.domain.project.ProjectUpload;
import org.wise.portal.domain.project.impl.ProjectMetadataImpl;
import org.wise.portal.domain.project.impl.ProjectParameters;
import org.wise.portal.domain.project.impl.ProjectType;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.module.CurnitService;
import org.wise.portal.service.project.ProjectService;

/**
 * Admin tool for uploading a zipped WISE project.
 * Unzips to curriculum_base_dir and registers the project (ie creates project in DB).
 * 
 * @author Hiroki Terashima
 */
@Controller
@RequestMapping("/admin/project/import")
public class ImportProjectController {

	@Autowired
	private ProjectService projectService;
	
	@Autowired
	private CurnitService curnitService;

	@Autowired
	private Properties wiseProperties;

	@RequestMapping(method = RequestMethod.POST)
	protected String onSubmit(
            @ModelAttribute("projectZipFile") ProjectUpload projectUpload,
            @RequestParam(value = "projectVersion", required = true) String projectVersion,
            ModelMap modelMap
		) throws Exception {
		// probably should do some kind of virus check. but for now, it's only
		// accessible to admin.

		// uploaded file must be a zip file and have a .zip extension
		MultipartFile file = projectUpload.getFile();

		// upload the zipfile to curriculum_base_dir
		String curriculumBaseDir = wiseProperties.getProperty("curriculum_base_dir");

		File uploadDir = new File(curriculumBaseDir);
		if (!uploadDir.exists()) {
			throw new Exception("Curriculum upload directory \"" + curriculumBaseDir + "\" does not exist. Please verify the path you specified for curriculum_base_dir in wise.properties.");
		}

		// save the upload zip file in the curriculum folder.
		String sep = "/";
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
			
			int i = 0;  // index used later to check for first folder in the zip file

			while (entries.hasMoreElements()) {
				ZipEntry entry = (ZipEntry) entries.nextElement();
				
				if (entry.getName().startsWith("__MACOSX")) {
					// if this entry starts with __MACOSX, this zip file was created by a user using mac's "compress" feature.
					// ignore it.
					continue;
				}

				if (entry.isDirectory()) {
					// first check to see if the user has changed the zip file name and therefore the zipfile name
					// is no longer the same as the name of the first folder in the top-level of the zip file.
					// if this is the case, import will fail, so throw an error.
					if (i == 0) {
						if (!entry.getName().startsWith(filename)) {
						    throw new Exception("Zip file name \"" + entry.getName() + "\" does not match folder name \"" + filename + "\". Do not change zip filename");
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
		
		// now create a project in the db
		String path = "";
		String name = "";

		// get the project path and name from zip file
		try {
            if ("wise4".equals(projectVersion)) {
                path = sep +  newFilename + sep + "wise4.project.json";
                String projectJSONFilePath = newFileFullDir + sep + "wise4.project.json";
                String projectJSONStr = FileUtils.readFileToString(new File(projectJSONFilePath));
                JSONObject projectJSONObj = new JSONObject(projectJSONStr);
                name = projectJSONObj.getString("title");
            } else if ("wise5".equals(projectVersion)) {
                path = sep +  newFilename + sep + "project.json";
                String projectJSONFilePath = newFileFullDir + sep + "project.json";
                String projectJSONStr = FileUtils.readFileToString(new File(projectJSONFilePath));
                JSONObject projectJSONObj = new JSONObject(projectJSONStr);
                name = projectJSONObj.getJSONObject("metadata").getString("title");
            }
		} catch (Exception e) {
			// there was an error getting project title.
			name = "Undefined";
		}

		User signedInUser = ControllerUtil.getSignedInUser();

		ModuleParameters mParams = new ModuleParameters();
		mParams.setUrl(path);
		Curnit curnit = curnitService.createCurnit(mParams);
		
		ProjectParameters pParams = new ProjectParameters();
		pParams.setCurnitId(curnit.getId());
		pParams.setOwner(signedInUser);
		pParams.setProjectname(name);
		pParams.setProjectType(ProjectType.LD);

        if ("wise4".equals(projectVersion)) {
            pParams.setWiseVersion(new Integer(4));
        } else if ("wise5".equals(projectVersion)) {
            pParams.setWiseVersion(new Integer(5));
        }

        ProjectMetadata metadata = null;

		// see if a file called wise4.project-meta.json exists. if yes, try parsing it.
		try {
            metadata = new ProjectMetadataImpl();
            if ("wise4".equals(projectVersion)) {
                String projectMetadataFilePath = newFileFullDir + sep + "wise4.project-meta.json";
                String projectMetadataStr = FileUtils.readFileToString(new File(projectMetadataFilePath));
                JSONObject metadataJSONObj = new JSONObject(projectMetadataStr);
                metadata.populateFromJSON(metadataJSONObj);
            } else if ("wise5".equals(projectVersion)) {
                String projectFilePath = newFileFullDir + sep + "project.json";
                String projectStr = FileUtils.readFileToString(new File(projectFilePath));
                JSONObject projectJSONObj = new JSONObject(projectStr);
                JSONObject metadataJSONObj = projectJSONObj.getJSONObject("metadata");
                metadata.populateFromJSON(metadataJSONObj);
            }
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

		modelMap.put("msg", "Upload project complete!");
		modelMap.put("newProject", project);
		return "admin/project/import";
	}
	
	
    @RequestMapping(method = RequestMethod.GET)
    public void initializeForm(ModelMap modelMap) {
    	modelMap.put("projectZipFile", new ProjectUpload());
    }

	public static final void copyInputStream(InputStream in, OutputStream out)
	throws IOException
	{
		byte[] buffer = new byte[1024];
		int len;

		while ((len = in.read(buffer)) >= 0)
			out.write(buffer, 0, len);

		in.close();
		out.close();
	}
}