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
package org.telscenter.sail.webapp.service.wiseup.impl;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.Calendar;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.Properties;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import net.sf.sail.webapp.domain.Curnit;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.service.curnit.CurnitService;

import org.apache.commons.io.FileUtils;
import org.telscenter.sail.webapp.domain.impl.CreateUrlModuleParameters;
import org.telscenter.sail.webapp.domain.impl.ProjectParameters;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.domain.project.ProjectMetadata;
import org.telscenter.sail.webapp.domain.project.impl.ProjectMetadataImpl;
import org.telscenter.sail.webapp.domain.project.impl.ProjectType;
import org.telscenter.sail.webapp.presentation.util.json.JSONObject;
import org.telscenter.sail.webapp.service.project.ProjectService;
import org.telscenter.sail.webapp.service.wiseup.WiseUpService;

/**
 * @author h
 * @version $Id:$
 */
public class WiseUpServiceImpl implements WiseUpService {

	private ProjectService projectService;

	private CurnitService curnitService;

	private Properties portalProperties;
	
	private String wiseUpHubUrl;

	/**
	 * @throws Exception 
	 * @see org.telscenter.sail.webapp.service.wiseup.WiseUpService#importExternalProject(net.sf.sail.webapp.domain.User, java.lang.String, java.lang.String)
	 */
	@Override
	public void importExternalProject(User newProjectOwner,
			String externalWiseInstanceId, String externalWiseProjectId) throws Exception {
	
		String exportProjectPath = wiseUpHubUrl + "/projectLibrary/exportProject.php" + "?wiseInstanceId=" + externalWiseInstanceId +"&wiseProjectId=" + externalWiseProjectId ;
		
		// upload the zipfile to curriculum_base_dir
		String curriculumBaseDir = portalProperties.getProperty("curriculum_base_dir");

		File uploadDir = new File(curriculumBaseDir);
		if (!uploadDir.exists()) {
			throw new Exception("curriculum upload directory does not exist.");
		}

		// save the downloaded zip file temporarily in the curriculum folder.
		String sep = System.getProperty("file.separator");
		long timeInMillis = Calendar.getInstance().getTimeInMillis();

		String filename = "";
		String newFilename = "";
		String newFileFullPath = "";
		File downloadedFile = null;
		
				
		try {
			URL url = new URL(exportProjectPath);
			URLConnection conn = url.openConnection();
			InputStream in = conn.getInputStream();
			URL downloadFileUrl = conn.getURL();
			String downloadFileUrlString = downloadFileUrl.toString();

			filename = downloadFileUrlString.substring(downloadFileUrlString.lastIndexOf("/")+1, downloadFileUrlString.indexOf(".zip"));
			newFilename = filename;
			if (new File(curriculumBaseDir + sep + filename).exists()) {
				// if this directory already exists, add a date time in milliseconds to the filename to make it unique
				newFilename = filename + "-" + timeInMillis;
			}
			newFileFullPath = curriculumBaseDir + sep + newFilename + ".zip"; 
			downloadedFile = new File(newFileFullPath);

			
			FileOutputStream out = new FileOutputStream(downloadedFile);
			byte[] b = new byte[1024];
			int count;
			while ((count = in.read(b)) >= 0) {
				out.write(b, 0, count);
			}
			out.flush(); out.close(); in.close();                   

		} catch (IOException e) {
			e.printStackTrace();
		}

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
		downloadedFile.delete();

		// now create a project in the db with the new path
		String path = sep +  newFilename + sep + "wise4.project.json";
		String name = "hiroki's project 4.zip";
		Set<User> owners = new HashSet<User>();
		owners.add(newProjectOwner);

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

	public void setPortalProperties(Properties portalProperties) {
		this.portalProperties = portalProperties;
	}

	public void setCurnitService(CurnitService curnitService) {
		this.curnitService = curnitService;
	}

	public void setWiseUpHubUrl(String wiseUpHubUrl) {
		this.wiseUpHubUrl = wiseUpHubUrl;
	}

}
