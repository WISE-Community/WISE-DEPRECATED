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
package org.telscenter.sail.webapp.presentation.web.controllers.project;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Collection;
import java.util.Properties;
import java.util.TreeSet;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.CurnitGetCurnitUrlVisitor;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;

import org.apache.commons.io.IOUtils;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.domain.project.ProjectMetadata;
import org.telscenter.sail.webapp.service.authentication.UserDetailsService;
import org.telscenter.sail.webapp.service.project.ProjectService;

/**
 * @author hirokiterashima
 * @version $Id:$
 */
public class ExportProjectController extends AbstractController {

	private ProjectService projectService;

	private Properties portalProperties;

	static final int BUFFER = 2048;

	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		User signedInUser = ControllerUtil.getSignedInUser();

		String projectId = request.getParameter("projectId");
		Project project = projectService.getById(projectId);

		// check if user is authorized to export
		boolean authorized = authorize(signedInUser, project);
		if (authorized) {
			// user is admin or is owner of project
		} else if (projectService.projectContainsTag(new Long(projectId), "public")) {
			// project is marked as being public
		} else {
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "You are not authorized to access this page");
			return null;			
		}

		String curriculumBaseDir = portalProperties.getProperty("curriculum_base_dir");

		String sep = System.getProperty("file.separator");

		String rawProjectUrl = (String) project.getCurnit().accept(new CurnitGetCurnitUrlVisitor());
		String projectJSONFullPath = curriculumBaseDir + sep + rawProjectUrl;
		String foldername = rawProjectUrl.substring(1, rawProjectUrl.lastIndexOf(sep));
		String projectJSONDir = projectJSONFullPath.substring(0, projectJSONFullPath.lastIndexOf(sep));

		response.setContentType("application/zip");
		response.addHeader("Content-Disposition", "attachment;filename=\"" + foldername+".zip" + "\"");


		//add project metadata to zip
		ProjectMetadata metadata = project.getMetadata();
		String metadataJSONString = metadata.toJSONString();

		String metaFileName = projectJSONDir + sep + "wise4.project-meta.json";
		PrintWriter metaOut = new PrintWriter(metaFileName);
		metaOut.println(metadataJSONString);
		metaOut.close();

		// zip the folder and write to outputstream		
		ServletOutputStream outputStream = response.getOutputStream();

		//create ZipOutputStream object
		ZipOutputStream out = new ZipOutputStream(
				new BufferedOutputStream(outputStream));


		//path to the folder to be zipped
		File zipFolder = new File(projectJSONDir);

		//get path prefix so that the zip file does not contain the whole path
		// eg. if folder to be zipped is /home/lalit/test
		// the zip file when opened will have test folder and not home/lalit/test folder
		int len = zipFolder.getAbsolutePath().lastIndexOf(File.separator);
		String baseName = zipFolder.getAbsolutePath().substring(0,len+1);

		addFolderToZip(zipFolder, out, baseName);

		//ZipEntry zipEntry = new ZipEntry(updateFilename(projectJSONDir + sep + metaFileName));
		//out.putNextEntry(zipEntry);
		//IOUtils.copy(new FileInputStream(metaFileName), out);
		//out.closeEntry();

		out.close();
		return null;
	}

	/**
	 * Return true iff the logged-in user is allowed to export the project
	 * @param signedInUser user that is signed in
	 * @param project can the signed in user export this project?
	 * @return true/false
	 */
	private boolean authorize(User signedInUser, Project project) {
		if (signedInUser != null) {

			Collection<? extends GrantedAuthority> authorities = signedInUser.getUserDetails().getAuthorities();
			for (GrantedAuthority authority : authorities) {
				if (authority.getAuthority().equals(UserDetailsService.ADMIN_ROLE)) {
					// if signed in user is an admin, (s)he can export all projects.
					return true;
				} else if(authority.getAuthority().equals(UserDetailsService.TEACHER_ROLE)) {
					//the signed in user is a teacher
					return this.projectService.canAuthorProject(project, signedInUser) ||
							this.projectService.canReadProject(project, signedInUser);
				}
			}
		}
		// other request methods are not authorized at this point
		return false;
	}

	private static void addFolderToZip(File folder, ZipOutputStream zip, String baseName) throws IOException {
		File[] files = folder.listFiles();
		for (File file : files) {
			if (file.isDirectory()) {
				// add folder to zip
				String name = file.getAbsolutePath().substring(baseName.length());
				ZipEntry zipEntry = new ZipEntry(name+"/");
				zip.putNextEntry(zipEntry);
				zip.closeEntry();
				addFolderToZip(file, zip, baseName);
			} else {
				// it's a file.				
				String name = file.getAbsolutePath().substring(baseName.length());
				ZipEntry zipEntry = new ZipEntry(updateFilename(name));
				zip.putNextEntry(zipEntry);
				IOUtils.copy(new FileInputStream(file), zip);
				zip.closeEntry();
			}
		}
	}

	/**
	 * Given old filename, returns new, updated filename corresponding with new standards
	 * e.g. "Global Warming.project.json"->"wise4.project.json"
	 * "Global Warming.project-min.json"->wise4.project-min.json"
	 * @param oldFilename
	 * @return newFilename
	 */
	private static String updateFilename(String oldFilename) {
		int lastIndexOfSlash = oldFilename.lastIndexOf("/");
		String prepend = oldFilename.substring(0, lastIndexOfSlash);
		if (oldFilename.endsWith(".project.json")) {
			return prepend+"/wise4.project.json";
		} else if (oldFilename.endsWith(".project-min.json")) {
			return prepend+"/wise4.project-min.json";
		} 
		return oldFilename;
	}

	/**
	 * @param projectService the projectService to set
	 */
	public void setProjectService(ProjectService projectService) {
		this.projectService = projectService;
	}

	/**
	 * @param portalProperties the portalProperties to set
	 */
	public void setPortalProperties(Properties portalProperties) {
		this.portalProperties = portalProperties;
	}

}
