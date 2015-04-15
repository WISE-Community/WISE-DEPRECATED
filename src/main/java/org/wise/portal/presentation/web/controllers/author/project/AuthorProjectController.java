/**
 * Copyright (c) 2008-2014 Regents of the University of California (Regents). 
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
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 * 
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.presentation.web.controllers.author.project;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.support.DefaultMultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.module.Curnit;
import org.wise.portal.domain.module.impl.CreateUrlModuleParameters;
import org.wise.portal.domain.module.impl.CurnitGetCurnitUrlVisitor;
import org.wise.portal.domain.project.FamilyTag;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.ProjectMetadata;
import org.wise.portal.domain.project.impl.PreviewProjectParameters;
import org.wise.portal.domain.project.impl.ProjectMetadataImpl;
import org.wise.portal.domain.project.impl.ProjectParameters;
import org.wise.portal.domain.project.impl.ProjectType;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.presentation.web.controllers.CredentialManager;
import org.wise.portal.presentation.web.controllers.TaggerController;
import org.wise.portal.presentation.web.exception.NotAuthorizedException;
import org.wise.portal.presentation.web.filters.WISEAuthenticationProcessingFilter;
import org.wise.portal.presentation.web.listeners.WISESessionListener;
import org.wise.portal.service.acl.AclService;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.module.CurnitService;
import org.wise.portal.service.project.ProjectService;
import org.wise.vle.utils.FileManager;
import org.wise.vle.web.AssetManager;
import org.wise.vle.web.SecurityUtils;

/**
 * Controller for users with author privileges to author projects
 * 
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author Patrick Lawler
 * @version $Id$
 */
@Controller
public class AuthorProjectController {

	private static final String PROJECT_ID_PARAM_NAME = "projectId";

	private static final String FORWARD = "forward";

	private static final String COMMAND = "command";

	@Autowired 
	private ProjectService projectService;

	@Autowired 
	private Properties wiseProperties = null;

	@Autowired 
	private CurnitService curnitService;

	@Autowired 
	private TaggerController taggerController;
	
	@Autowired 
	private AclService<Project> aclService;
	
	@Autowired 
	private ServletContext servletContext;

	private final static List<String> filemanagerProjectlessRequests;

	static {
		filemanagerProjectlessRequests = new ArrayList<String>();
		filemanagerProjectlessRequests.add("createProject");
	}

	@RequestMapping("/author/authorproject.html")
	protected ModelAndView handleRequestInternal(
			HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		User user = ControllerUtil.getSignedInUser();

		String projectIdStr = request.getParameter(PROJECT_ID_PARAM_NAME);
		String forward = request.getParameter(FORWARD);

		Project project;
		if(projectIdStr != null && !projectIdStr.equals("") && !projectIdStr.equals("none")){
			//project = projectService.getProjectWithoutMetadata(Long.parseLong(projectIdStr));
			project = projectService.getById(Long.parseLong(projectIdStr));
		} else {
			project = null;
		}

		/* catch forwarding requests, authenticate and forward request upon successful authentication */
		if(forward != null && !forward.equals("")){
			//get the command
			String command = request.getParameter("command");

			if(forward.equals("filemanager") || forward.equals("assetmanager")){

				if((this.isProjectlessRequest(request, forward) || this.projectService.canAuthorProject(project, user)) ||
						("copyProject".equals(command) && project.getFamilytag().equals(FamilyTag.TELS)) ||
						("retrieveFile".equals(command) && project.getFamilytag().equals(FamilyTag.TELS))){

					if("createProject".equals(command) && !this.hasAuthorPermissions(user)){
						return new ModelAndView(new RedirectView("accessdenied.html"));
					}

					if("copyProject".equals(command) && 
							(project == null || 
							(!project.getFamilytag().equals(FamilyTag.TELS) && !this.projectService.canAuthorProject(project, user)))){
						return new ModelAndView(new RedirectView("accessdenied.html"));
					}

					CredentialManager.setRequestCredentials(request, user);
					
					if(forward.equals("filemanager")) {
						if(command!=null){
							String pathAllowedToAccess = CredentialManager.getAllowedPathAccess(request);
							
							if(command.equals("createProject")){
								String projectName = request.getParameter("projectName");
								String curriculumBaseDir = wiseProperties.getProperty("curriculum_base_dir");
								
								String result = "";
								
								if(SecurityUtils.isAllowedAccess(pathAllowedToAccess, curriculumBaseDir)) {
									result = FileManager.createProject(curriculumBaseDir, projectName);
								} else {
									response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
									result = "unauthorized";
								}
								
								response.getWriter().write(result);
							} else if(command.equals("projectList")){
								String projectPaths = request.getParameter("projectPaths");
								String projectExt = ".project.json";
								
								String result = FileManager.getProjectList(projectPaths, projectExt);
								
								response.getWriter().write(result);
							} else if(command.equals("retrieveFile")){
								//get the file name
								String fileName = request.getParameter("fileName");

								//get the full file path
								String filePath = FileManager.getFilePath(project, fileName);
								
								String result = "";
								
								if(SecurityUtils.isAllowedAccess(pathAllowedToAccess, filePath)) {
									result = FileManager.retrieveFile(filePath);
								} else {
									response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
									result = "unauthorized";
								}
								
								response.getWriter().write(result);
							} else if(command.equals("updateFile")){
								/*
								 * get the project folder path
								 * e.g.
								 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667
								 */
								String projectFolderPath = FileManager.getProjectFolderPath(project);
								
								//get the file name
								String fileName = request.getParameter("fileName");
								
								//get the content to save to the file
								String data = request.getParameter("data");
								
								String result = "";
								
								if(SecurityUtils.isAllowedAccess(pathAllowedToAccess, projectFolderPath)) {
									result = FileManager.updateFile(projectFolderPath, fileName, data);									
								} else {
									response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
									result = "unauthorized";
								}
								
								response.getWriter().write(result);
							} else if(command.equals("createNode")){
								/*
								 * get the project file path
								 * e.g.
								 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667/wise4.project.json
								 */
								String projectPath = FileManager.getProjectFilePath(project);
								String nodeClass = request.getParameter("nodeClass");
								String title = request.getParameter("title");
								String type = request.getParameter("type");
								
								//get the string that contains an array of node template params
								String nodeTemplateParams = request.getParameter("nodeTemplateParams");
								
								String result = "";
								
								if(SecurityUtils.isAllowedAccess(pathAllowedToAccess, projectPath)) {
									result = FileManager.createNode(projectPath, nodeClass, title, type, nodeTemplateParams);
								} else {
									response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
									result = "not authorized";
								}
								
								response.getWriter().write(result);
							} else if(command.equals("createSequence")){
								/*
								 * get the project file name
								 * e.g.
								 * /wise4.project.json
								 */
								String projectFileName = request.getParameter("projectFileName");
								String name = request.getParameter("name");
								String id = request.getParameter("id");
								
								/*
								 * get the project folder path
								 * e.g.
								 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667
								 */
								String projectFolderPath = FileManager.getProjectFolderPath(project);
								
								String result = "";
								
								if(SecurityUtils.isAllowedAccess(pathAllowedToAccess, projectFolderPath)) {
									result = FileManager.createSequence(projectFileName, name, id, projectFolderPath);
								} else {
									response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
									result = "not authorized";
								}
								
								response.getWriter().write(result);
							} else if(command.equals("removeFile")){
								/*
								 * get the project folder path
								 * e.g.
								 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667
								 */
								String projectFolderPath = FileManager.getProjectFolderPath(project);
								
								/*
								 * get the file name
								 * node_1.or
								 */
								String fileName = request.getParameter("fileName");
								
								String result = "";

								if(SecurityUtils.isAllowedAccess(pathAllowedToAccess, projectFolderPath)) {
									result = FileManager.removeFile(projectFolderPath, fileName);
								} else {
									response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
									result = "unauthorized";
								}
								
								response.getWriter().write(result);
							} else if(command.equals("copyNode")){
								//get the parameters for the node
								String data = request.getParameter("data");
								String type = request.getParameter("type");
								String title = request.getParameter("title");
								String nodeClass = request.getParameter("nodeClass");
								String contentFile = request.getParameter("contentFile");
								
								/*
								 * get the file name
								 * e.g.
								 * /node_1.or
								 */
								String projectFileName = request.getParameter("projectFileName");
								
								/*
								 * get the project folder path
								 * e.g.
								 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667
								 */
								String projectFolderPath = FileManager.getProjectFolderPath(project);
								
								String result = "";
								
								if(SecurityUtils.isAllowedAccess(pathAllowedToAccess, projectFolderPath)){
									result = FileManager.copyNode(projectFolderPath, projectFileName, data, type, title, nodeClass, contentFile);									
								} else {
									response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
								}
								
								response.getWriter().write(result);
							} else if(command.equals("createSequenceFromJSON")){
								/*
								 * get the project file name
								 * e.g.
								 * /wise4.project.json
								 */
								String projectFileName = request.getParameter("projectFileName");
								
								//get the json for the new sequence we are going to add to the project
								String data = request.getParameter("data");
								
								/*
								 * get the project folder path
								 * e.g.
								 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667
								 */
								String projectFolderPath = FileManager.getProjectFolderPath(project);
								
								String result = "";
								
								if(SecurityUtils.isAllowedAccess(pathAllowedToAccess, projectFolderPath)){
									result = FileManager.createSequenceFromJSON(projectFolderPath, projectFileName, data);
								} else {
									response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
								}
								
								response.getWriter().write(result);
							} else if(command.equals("getScripts")){
								String data = request.getParameter("param1");
								
								String result = FileManager.getScripts(servletContext, data);
								
								response.getWriter().write(result);
							} else if(command.equals("copyProject")){
								/*
								 * get the project folder path
								 * e.g.
								 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667
								 */
								String projectFolderPath = FileManager.getProjectFolderPath(project);
								
								/*
								 * get the curriculum base
								 * e.g.
								 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum
								 */
								String curriculumBaseDir = wiseProperties.getProperty("curriculum_base_dir");
								
								String result = "";
								
								if(SecurityUtils.isAllowedAccess(pathAllowedToAccess, projectFolderPath)) {
									result = FileManager.copyProject(curriculumBaseDir, projectFolderPath);									
								} else {
									response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
									result = "unauthorized";
								}
								
								response.getWriter().write(result);
							} else if(command.equals("createFile")){
								/*
								 * get the file name
								 * e.g.
								 * /node_1.or
								 */
								String fileName = request.getParameter("path");
								String data = request.getParameter("data");
								
								/*
								 * get the project folder path
								 * e.g.
								 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667
								 */
								String projectFolderPath = FileManager.getProjectFolderPath(project);
								
								String result = "";
								
								if(SecurityUtils.isAllowedAccess(pathAllowedToAccess, projectFolderPath)) {
									result = FileManager.createFile(projectFolderPath, fileName, data);
								} else {
									response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
								}
								
								response.getWriter().write(result);
							} else if(command.equals("reviewUpdateProject")) {
								//get the curriculum base directory e.g. /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum
								String curriculumBaseDir = wiseProperties.getProperty("curriculum_base_dir");
								
								//get the relative child project url e.g. /236/wise4.project.json
								String projectUrl = (String) project.getCurnit().accept(new CurnitGetCurnitUrlVisitor());
								
								//get the parent project id
								Long parentProjectId = project.getParentProjectId();

								//get the parent project
								Project parentProject = projectService.getById(parentProjectId);
								
								//get the relative parent project url e.g. /235/wise4.project.json
								String parentProjectUrl = (String) parentProject.getCurnit().accept(new CurnitGetCurnitUrlVisitor());
								
								String result = FileManager.reviewUpdateProject(curriculumBaseDir, parentProjectUrl, projectUrl);
								
								response.getWriter().write(result);
							} else if(command.equals("updateProject")) {
								//get the curriculum base directory e.g. /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum
								String curriculumBaseDir = wiseProperties.getProperty("curriculum_base_dir");
								
								//get the relative child project url e.g. /236/wise4.project.json
								String childProjectUrl = (String) project.getCurnit().accept(new CurnitGetCurnitUrlVisitor());
								
								//get the child project folder path
								String childProjectFolderPath = FileManager.getProjectFolderPath(project);
								
								//get the parent project id
								Long parentProjectId = project.getParentProjectId();

								//get the parent project
								Project parentProject = projectService.getById(parentProjectId);
								
								//get the relative parent project url e.g. /235/wise4.project.json
								String parentProjectUrl = (String) parentProject.getCurnit().accept(new CurnitGetCurnitUrlVisitor());
								
								String result = "";
								
								if(SecurityUtils.isAllowedAccess(pathAllowedToAccess, childProjectFolderPath)) {
									result = FileManager.updateProject(curriculumBaseDir, parentProjectUrl, childProjectUrl);									
								} else {
									response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
									result = "unauthorized";
								}
								
								response.getWriter().write(result);
							} else if(command.equals("importSteps")) {
								//get the curriculum base directory e.g. /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum
								String curriculumBaseDir = wiseProperties.getProperty("curriculum_base_dir");
								
								//get the relative child project url e.g. /172/wise4.project.json
								String fromProjectUrl = "";
								
								//get the from project id string
								String fromProjectIdStr = request.getParameter("fromProjectId");

								if(fromProjectIdStr != null) {
									try {
										//get the from project id
										long fromProjectId = Long.parseLong(fromProjectIdStr);

										//get the from project
										Project fromProject = projectService.getById(fromProjectId);

										//get the from project url e.g. /172/wise4.project.json
										fromProjectUrl = (String) fromProject.getCurnit().accept(new CurnitGetCurnitUrlVisitor());
									} catch(Exception e) {
										e.printStackTrace();
									}
								}
								
								//get the relative child project url e.g. /236/wise4.project.json
								String toProjectUrl = (String) project.getCurnit().accept(new CurnitGetCurnitUrlVisitor());
								
								//get the child project folder path
								String toProjectFolderPath = FileManager.getProjectFolderPath(project);
								
								//get all the files we need to import
								String nodeIds = (String) request.getParameter("nodeIds");
								
								String result = "";
								
								if(SecurityUtils.isAllowedAccess(pathAllowedToAccess, toProjectFolderPath)) {
									result = FileManager.importSteps(curriculumBaseDir, fromProjectUrl, toProjectUrl, nodeIds);									
								} else {
									response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
									result = "unauthorized";
								}
								
								response.getWriter().write(result);
							} else if(command.equals("getProjectUsageAndMax")) {
								//get the path to the folder
								String path = FileManager.getProjectFolderPath(project);
								
								//get the max project size for this project if it was separately specified for this project
								Long projectMaxTotalAssetsSizeLong = project.getMaxTotalAssetsSize();
								
								String result = FileManager.getProjectUsageAndMax(path, projectMaxTotalAssetsSizeLong);
								
								response.getWriter().write(result);
							} else {
								/* we don't understand this command */
								response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
							}
						} else {
							/* no command was provided */
							response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
						}
					} else if(forward.equals("assetmanager")) {

						if(command == null && ServletFileUpload.isMultipartContent(request)) {
							//user is uploading a file
							
							ServletFileUpload uploader = new ServletFileUpload(new DiskFileItemFactory());
							List<?> fileList = null;
							try {
								//get a list of the files the user is uploading
								fileList = uploader.parseRequest(request);
							} catch (FileUploadException e) {
								e.printStackTrace();
							}
							
							//get the project folder path
							String projectFolderPath = FileManager.getProjectFolderPath(project);
							
							//get the folder name that will contain the assets
							String dirName = "assets";
							String pathToCheckSize = projectFolderPath;
							
							//get the max disk space size this project can use
							Long projectMaxTotalAssetsSize = project.getMaxTotalAssetsSize();
							
							if(projectMaxTotalAssetsSize == null) {
								//get the default max project size
								projectMaxTotalAssetsSize = new Long(wiseProperties.getProperty("project_max_total_assets_size", "15728640"));
							}
							
							String allowedProjectAssetContentTypesStr = wiseProperties.getProperty("normalAuthorAllowedProjectAssetContentTypes");
							if (user.isTrustedAuthor()) {
								allowedProjectAssetContentTypesStr += "," + wiseProperties.getProperty("trustedAuthorAllowedProjectAssetContentTypes");
							}

							DefaultMultipartHttpServletRequest multiRequest = (DefaultMultipartHttpServletRequest) request;
							Map<String,MultipartFile> fileMap = multiRequest.getFileMap();
							
							//get all the file names and files to be uploaded
							Iterator<String> iter = multiRequest.getFileNames();
							while(iter.hasNext()){
								String filename = (String)iter.next();
								MultipartFile oneFile = multiRequest.getFile(filename);
								String contentType = oneFile.getContentType();
								if (!allowedProjectAssetContentTypesStr.contains(contentType)) {
									if (contentType.equals("application/octet-stream") && (filename.endsWith(".mml") || filename.endsWith(".cml") || filename.endsWith(".json"))) {
										// .mml and .cml files are acceptable. Their content-type is not well-known, so it will show up at application/octet-stream
									} else { 
										response.getWriter().write("Uploading this file type is not allowed. Operation aborted.");
										return null;
									}
								}
								fileMap.put(filename, oneFile);
							}
							
							//tell the asset manager to handle the file upload
							String result = AssetManager.uploadAsset(fileList, fileMap, projectFolderPath, dirName, pathToCheckSize, projectMaxTotalAssetsSize);
							response.getWriter().write(result);
						} else if(command.equals("remove")) {
							//get the project folder path
							String path = FileManager.getProjectFolderPath(project);
							
							//get the assets folder name
							String dirName = "assets";
							
							//get the file name that we are going to remove
							String assetFileName = request.getParameter("asset");
							
							//tell the asset manager to remove the file
							String result = AssetManager.removeAsset(path, dirName, assetFileName);
							response.getWriter().write(result);
						} else if(command.equals("getSize")) {
							//get the project folder path
							String path = FileManager.getProjectFolderPath(project);
							
							//get the assets folder name
							String dirName = "assets";
							
							//tell the asset manager to get the size of the assets folder
							String result = AssetManager.getSize(path, dirName);
							response.getWriter().write(result);
						} else if(command.equals("assetList")) {
							//get the project folder path
							String path = FileManager.getProjectFolderPath(project);
							
							//get the assets folder name
							String dirName = "assets";
							
							//get the file names for all the assets in the assets folder
							String assetList = AssetManager.getAssetList(path, dirName);
							response.getWriter().write(assetList);
						} else if(command.equals("studentAssetCopyForReference")) {
							//AssetManager.copyAssetForReference();
						} else {
							response.sendError(HttpServletResponse.SC_BAD_REQUEST);
						}
					}

					if("updateFile".equals(command)) {
						//we have updated a file in a project so we will update the project edited timestamp

						/*
						 * set the project into the request so the handleProjectEdited 
						 * function doesn't have to retrieve it again
						 */
						request.setAttribute("project", project);

						//update the project edited timestamp
						handleProjectEdited(request, response);						
					}

					return null;
				} else {
					return new ModelAndView(new RedirectView("accessdenied.html"));
				}
			} else if(command.equals("getTimestamp")) {
				//get the current timestamp on the server and write it to the response
				response.getWriter().write(String.valueOf(new Date().getTime()));
				return null;
			} 
		}

		String command = request.getParameter(COMMAND);
		if(command != null && command != ""){
			if(command.equals("launchAuthoring")){
				return handleLaunchAuthoring(request, response);
			} else if(command.equals("getTimestamp")) {
                //get the current timestamp on the server and write it to the response
                response.getWriter().write(String.valueOf(new Date().getTime()));
                return null;
            } else if(command.equals("createProject")){
				return handleCreateProject(request, response);
			} else if(command.equals("projectList")){
				return handleProjectList(request, response);
			} else if (command.equals("notifyProjectOpen")) {
				return handleNotifyProjectOpen(request, response);
			} else if (command.equals("notifyProjectClose")){
				return handleNotifyProjectClose(request, response);
			} else if(command.equals("publishMetadata")){
				return this.handlePublishMetadata(request, response);
			} else if(command.equals("getUsername")){
				return this.handleGetUsername(request, response);
			} else if(command.equals("getCurriculumBaseUrl")) {
				return this.handleGetCurriculumBaseUrl(request, response);
			} else if(command.equals("getConfig")) {
				return this.handleGetConfig(request, response);
			} else if(command.equals("getEditors")){
				if(this.projectService.canAuthorProject(project, user)){
					return this.handleGetEditors(request, response);
				} else {
					return new ModelAndView(new RedirectView("accessdenied.html"));
				}
			} else if(command.equals("preview")){
				PreviewProjectParameters previewParams = new PreviewProjectParameters();
				previewParams.setProject(project);
				previewParams.setHttpServletRequest(request);

				return (ModelAndView) this.projectService.previewProject(previewParams);
			} else if(command.equals("createTag") || command.equals("updateTag") || 
					command.equals("removeTag") || command.equals("retrieveProjectTags")){
				return this.taggerController.handleRequestInternal(request, response);
			} else if(command.equals("getMetadata")) {
				request.setAttribute("project", project);
				return handleGetMetadata(request, response);
			} else if(command.equals("postMetadata")) {
				request.setAttribute("project", project);
				return handlePostMetadata(request, response);
			} else if(command.equals("reviewUpdateProject")) {
				return handleReviewUpdateProject(request, response);
			} else if(command.equals("updateProject")) {
				return handleUpdateProject(request, response);
			} else if(command.equals("importSteps")) {
				return handleReviewOrUpdateProject(request, response);
			}
		}

		return handleLaunchAuthoring(request, response);
	}
	
	/**
	 * Launch the authoring tool
	 * @param request
	 * @param response
	 * @return the model and view containing the necessary variables
	 */
	private ModelAndView handleLaunchAuthoring(HttpServletRequest request, HttpServletResponse response) {
		User author = ControllerUtil.getSignedInUser();
		String wiseBaseURL = wiseProperties.getProperty("wiseBaseURL");
		
		String vleUrl = wiseBaseURL + "/vle/author.html";
		String portalAuthorUrl = wiseBaseURL + "/author/authorproject.html";
		String command = request.getParameter("param1");
		
		String projectIdStr = request.getParameter(PROJECT_ID_PARAM_NAME);
		Project project = null;
		if(projectIdStr != null && !projectIdStr.equals("") && !projectIdStr.equals("none")){
			try {
				project = projectService.getById(Long.parseLong(projectIdStr));
			} catch (NumberFormatException e) {
				e.printStackTrace();
			} catch (ObjectNotFoundException e) {
				e.printStackTrace();
			}
		} else {
			project = null;
		}
		
		ModelAndView mav = new ModelAndView("vle");
		mav.addObject("portalAuthorUrl", portalAuthorUrl);
		mav.addObject("vleurl", vleUrl);
		
		if(command != null && command != ""){
			mav.addObject("command", command);
		}
		
		/*
		 * this value will be set to "true" only if the user is opening the premade comments
		 * from the teacher home page. this value is used to tell the authoring tool
		 * to immediately open the premade comments after the vle is loaded because
		 * we will not actually display the authoring tool to the user. we only need
		 * to load the authoring tool so that the vle is loaded and can then open
		 * the editing view for the premade comments.
		 */
		String editPremadeComments = request.getParameter("editPremadeComments");
		mav.addObject("editPremadeComments", editPremadeComments);
		
		if(project != null){
			if(author.isAdmin() || aclService.hasPermission(project, BasePermission.WRITE, author) ||
					aclService.hasPermission(project, BasePermission.ADMINISTRATION, author)){
				String title = null;
				if(project.getMetadata() != null && project.getMetadata().getTitle() != null && !project.getMetadata().getTitle().equals("")){
					title = project.getMetadata().getTitle();
				} else {
					title = project.getName();
				}
				
				if(title != null) {
					/*
					 * replace " with \" because if we don't escape it, the " may
					 * short circuit the parent string that we put the title in
					 */
					title = title.replaceAll("\"", "\\\\\"");					
				}
				
				if(command == null){
					mav.addObject("command", "editProject");
				}
				
				String rawProjectUrl = (String) project.getCurnit().accept(new CurnitGetCurnitUrlVisitor());
				String polishedProjectUrl = null;
				polishedProjectUrl = rawProjectUrl;
				
				//get the project attributes
				String relativeProjectUrl = polishedProjectUrl;
				String projectId = project.getId().toString();
				String projectTitle = title;
				
				//put the project attributes into the model so it can be accessed in the .jsp page
				mav.addObject("relativeProjectUrl", relativeProjectUrl);
				mav.addObject("projectId", projectId);
				mav.addObject("projectTitle", projectTitle);
			} else {
				return new ModelAndView(new RedirectView(wiseBaseURL + "/accessdenied.html"));
			}
		}
		return mav;
	}

	/**
	 * Handles creating a project.
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	private ModelAndView handleCreateProject(HttpServletRequest request, HttpServletResponse response) throws Exception{
		User user = ControllerUtil.getSignedInUser();
		if(this.hasAuthorPermissions(user)){
			/*
			 * get the relative path to the project
			 * e.g.
			 * /510/wise4.project.json
			 */
			String path = request.getParameter("projectPath");

			//get the name of the project
			String name = request.getParameter("projectName");

			String parentProjectId = request.getParameter("parentProjectId");
			Set<User> owners = new HashSet<User>();
			owners.add(user);

			CreateUrlModuleParameters cParams = new CreateUrlModuleParameters();
			cParams.setUrl(path);
			Curnit curnit = curnitService.createCurnit(cParams);

			ProjectParameters pParams = new ProjectParameters();

			pParams.setCurnitId(curnit.getId());
			pParams.setOwners(owners);
			pParams.setProjectname(name);
			pParams.setProjectType(ProjectType.LD);
			if (parentProjectId != null && !parentProjectId.equals("undefined")) {
				Project parentProject = projectService.getById(parentProjectId);
				if (parentProject != null) {
					pParams.setParentProjectId(Long.valueOf(parentProjectId));
					// get the project's metadata from the parent
					ProjectMetadata parentProjectMetadata = parentProject.getMetadata();
					if (parentProjectMetadata != null) {
						// copy into new metadata object
						ProjectMetadata newProjectMetadata = new ProjectMetadataImpl(parentProjectMetadata.toJSONString());
						pParams.setMetadata(newProjectMetadata);
					}
				}
			} else {
				// if this is new original project, set a new fresh metadata object
				ProjectMetadata metadata = new ProjectMetadataImpl();
				metadata.setTitle(name);
				pParams.setMetadata(metadata);
			}
			Project project = projectService.createProject(pParams);
			response.getWriter().write(project.getId().toString());
			return null;
		} else {
			return new ModelAndView(new RedirectView("accessdenied.html"));
		}
	}

	/**
	 * Handles notifications of opened projects
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	private ModelAndView handleNotifyProjectOpen(HttpServletRequest request, HttpServletResponse response) throws Exception{
		User user = ControllerUtil.getSignedInUser();
		if(this.hasAuthorPermissions(user)){

			//get the project object
			String projectId = request.getParameter("projectId");

			HttpSession currentUserSession = request.getSession();
			HashMap<String, ArrayList<String>> openedProjectsToSessions = 
					(HashMap<String, ArrayList<String>>) servletContext.getAttribute("openedProjectsToSessions");

			if (openedProjectsToSessions == null) {
				openedProjectsToSessions = new HashMap<String, ArrayList<String>>(); 
				servletContext.setAttribute("openedProjectsToSessions", openedProjectsToSessions);
			}

			if (openedProjectsToSessions.get(projectId) == null) {
				openedProjectsToSessions.put(projectId, new ArrayList<String>());
			}
			ArrayList<String> sessions = openedProjectsToSessions.get(projectId);  // sessions that are currently authoring this project
			if (!sessions.contains(currentUserSession.getId())) {
				sessions.add(currentUserSession.getId());
			}
			HashMap<String, User> allLoggedInUsers = (HashMap<String, User>) servletContext
					.getAttribute(WISESessionListener.ALL_LOGGED_IN_USERS);

			String otherUsersAlsoEditingProject = "";
			for (String sessionId : sessions) {
				if (sessionId != currentUserSession.getId()) {
					user = allLoggedInUsers.get(sessionId);
					if (user != null) {
						otherUsersAlsoEditingProject += user.getUserDetails().getUsername() + ",";
					}
				}
			}

			/* strip off trailing comma */
			if(otherUsersAlsoEditingProject.contains(",")){
				otherUsersAlsoEditingProject = otherUsersAlsoEditingProject.substring(0, otherUsersAlsoEditingProject.length() - 1);
			}

			response.getWriter().write(otherUsersAlsoEditingProject);
			return null;
		} else {
			return new ModelAndView(new RedirectView("accessdenied.html"));
		}
	}

	/**
	 * Handles notifications of closed projects
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	private ModelAndView handleNotifyProjectClose(HttpServletRequest request, HttpServletResponse response) throws Exception{
		User user = ControllerUtil.getSignedInUser();
		if(this.hasAuthorPermissions(user)){
			String projectId = request.getParameter("projectId");
			HttpSession currentSession = request.getSession();

			Map<String, ArrayList<String>> openedProjectsToSessions = (Map<String, ArrayList<String>>) servletContext.getAttribute("openedProjectsToSessions");

			if(openedProjectsToSessions == null || openedProjectsToSessions.get(projectId) == null){
				return null;
			} else {
				ArrayList<String> sessions = openedProjectsToSessions.get(projectId);
				if(!sessions.contains(currentSession.getId())){
					return null;
				} else {
					sessions.remove(currentSession.getId());
					// if there are no more users authoring this project, remove this project from openedProjectsToSessions
					if (sessions.size() == 0) {
						openedProjectsToSessions.remove(projectId);
					}
					response.getWriter().write("success");
					return null;
				}
			}
		} else {
			return new ModelAndView(new RedirectView("accessdenied.html"));
		}
	}

	/**
	 * Gets other WISE users who are also editing the same project as the logged-in user
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")	
	private ModelAndView handleGetEditors(HttpServletRequest request, HttpServletResponse response) throws Exception{
		String projectPath = request.getParameter("param1");

		// get current user session
		HttpSession currentUserSession = request.getSession();

		// get all sessions of people editing a project.
		HashMap<String, ArrayList<String>> openedProjectsToSessions = 
				(HashMap<String, ArrayList<String>>) servletContext.getAttribute("openedProjectsToSessions");

		if(openedProjectsToSessions != null){
			// if there are ppl editing projects, see if there are people editing the same project as logged in user.
			ArrayList<String> sessions = openedProjectsToSessions.get(projectPath);
			HashMap<String, User> allLoggedInUsers = (HashMap<String, User>) servletContext
					.getAttribute(WISESessionListener.ALL_LOGGED_IN_USERS);

			String otherUsersAlsoEditingProject = "";
			if (sessions != null) {
				for (String sessionId : sessions) {
					if (sessionId != currentUserSession.getId()) {
						User user = allLoggedInUsers.get(sessionId);
						if (user != null) {
							otherUsersAlsoEditingProject += user.getUserDetails().getUsername() + ",";
						}
					}
				}
			}

			/* strip off trailing comma */
			if(otherUsersAlsoEditingProject.contains(",")){
				otherUsersAlsoEditingProject = otherUsersAlsoEditingProject.substring(0, otherUsersAlsoEditingProject.length() - 1);
			}

			response.getWriter().write(otherUsersAlsoEditingProject);
		} else {
			response.getWriter().write("");
		}


		return null;
	}

	/**
	 * Returns a list of projects that the signed in user can author
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	private ModelAndView handleProjectList(HttpServletRequest request, HttpServletResponse response) throws Exception{
		String projectTag = request.getParameter("projectTag");

		JSONArray projects = new JSONArray();

		if(projectTag == null) {
			//get all the projects the current user can author
			projects = getAuthorableProjects(request, response);
		} else if(projectTag.equals("library")) {
			//get all the library projects
			projects = getLibraryProjects(request, response);
		} else if(projectTag.equals("authorable")) {
			//get all the projects the current user can author
			projects = getAuthorableProjects(request, response);
		} else if(projectTag.equals("authorableAndLibrary")) {
			//get all the projects the current user can author
			JSONArray authorableProjects = getAuthorableProjects(request, response);

			//get all the library projects
			JSONArray libraryProjects = getLibraryProjects(request, response);

			//add the authorable projects to the array
			for(int x=0; x<authorableProjects.length(); x++) {
				JSONObject authorableProject = authorableProjects.getJSONObject(x);
				projects.put(authorableProject);
			}

			//add the library projects to the array
			for(int y=0; y<libraryProjects.length(); y++) {
				JSONObject libraryProject = libraryProjects.getJSONObject(y);
				projects.put(libraryProject);
			}
		}

		//write the JSONArray of projects to the response
		response.getWriter().write(projects.toString());

		return null;
	}

	/**
	 * Get all the projects the current user can author
	 * @param request
	 * @param response
	 * @throws Exception
	 * @return the JSONArray of authorable projects
	 */
	private JSONArray getAuthorableProjects(HttpServletRequest request, HttpServletResponse response) throws Exception {
		List<Project> allAuthorableProjects = new ArrayList<Project>();
		User signedInUser = ControllerUtil.getSignedInUser();
		List<Project> projects = projectService.getProjectList(signedInUser);
		List<Project> sharedProjects = projectService.getSharedProjectList(ControllerUtil.getSignedInUser());

		// in the future, we'll want to filter this allAuthorableProjects list even further by what kind of
		// permissions (view, edit, share) the user has on the project.
		allAuthorableProjects.addAll(projects);
		allAuthorableProjects.addAll(sharedProjects);

		//an array to hold the information for the projects
		JSONArray projectArray = new JSONArray();

		//loop through all the projects
		for(Project project : allAuthorableProjects){
			if(project.getProjectType()==ProjectType.LD &&
					projectService.canAuthorProject(project, signedInUser)){
				/*
				 * get the relative project url
				 * e.g.
				 * /235/wise4.project.json
				 */
				String rawProjectUrl = (String) project.getCurnit().accept(new CurnitGetCurnitUrlVisitor());

				//get the title of the project
				String title = project.getName();

				if(rawProjectUrl != null) {
					/*
					 * get the project file name
					 * e.g.
					 * /wise4.project.json
					 */
					String projectFileName = rawProjectUrl.substring(rawProjectUrl.lastIndexOf("/"));

					/*
					 * add the project file name, project id, and project title
					 * to the JSONObject
					 */
					JSONObject projectDetails = new JSONObject();
					projectDetails.put("id", project.getId());
					projectDetails.put("path", projectFileName);
					projectDetails.put("title", title);

					//add the JSONObject to our array
					projectArray.put(projectDetails);
				}
			}
		}

		//return the JSONArray
		return projectArray;
	}

	/**
	 * Get all the library projects
	 * @param request
	 * @param response
	 * @throws Exception
	 * @return the JSONArray of library projects
	 */
	private JSONArray getLibraryProjects(HttpServletRequest request, HttpServletResponse response) throws Exception {

		List<Project> libraryProjects = projectService.getLibraryProjectList();

		//an array to hold the information for the projects
		JSONArray libraryProjectArray = new JSONArray();

		for(Project libraryProject : libraryProjects) {
			if(libraryProject.getProjectType()==ProjectType.LD) {
				/*
				 * get the relative project url
				 * e.g.
				 * /235/wise4.project.json
				 */
				String rawProjectUrl = (String) libraryProject.getCurnit().accept(new CurnitGetCurnitUrlVisitor());

				//get the title of the project
				String title = libraryProject.getName();

				if(rawProjectUrl != null) {
					/*
					 * get the project file name
					 * e.g.
					 * /wise4.project.json
					 */
					String projectFileName = rawProjectUrl.substring(rawProjectUrl.lastIndexOf("/"));

					/*
					 * add the project file name, project id, and project title
					 * to the JSONObject
					 */
					JSONObject projectDetails = new JSONObject();
					projectDetails.put("id", libraryProject.getId());
					projectDetails.put("path", projectFileName);
					projectDetails.put("title", title);

					//add the JSONObject to our array
					libraryProjectArray.put(projectDetails);
				}
			}
		}

		//return the JSONArray
		return libraryProjectArray;
	}

	/**
	 * Handles the publish metadata request from the authoring tool
	 * 
	 * @param request
	 * @param response
	 * @return
	 * @throws ObjectNotFoundException 
	 * @throws IOException 
	 */
	private ModelAndView handlePublishMetadata(HttpServletRequest request, HttpServletResponse response) throws ObjectNotFoundException, IOException{
		Long projectId = Long.parseLong(request.getParameter("projectId"));
		String metadataString = request.getParameter("metadata");
		JSONObject metadata = null;

		try {
			metadata = new JSONObject(metadataString);
		} catch (JSONException e1) {
			e1.printStackTrace();
		}

		Project project = this.projectService.getById(projectId);
		User user = ControllerUtil.getSignedInUser();

		/* set the fields in the ProjectMetadata where appropriate */
		if(metadata != null){
			ProjectMetadata pMeta = project.getMetadata();

			/* if no previous metadata exists for this project, then we want to create one
			 * and set it in the project */
			if(pMeta == null){
				pMeta = new ProjectMetadataImpl();
				pMeta.setProjectId(projectId);
				project.setMetadata(pMeta);
			}

			Object title = this.getJSONFieldValue(metadata, "title");
			if(title != null && ((String) title).trim().length() > 0 && !((String) title).equals("null")){
				pMeta.setTitle((String) title);
				project.setName((String) title);
			}

			Object author = this.getJSONFieldValue(metadata, "author");
			if(author != null){
				pMeta.setAuthor((String) author);
			}

			Object subject = this.getJSONFieldValue(metadata, "subject");
			if(subject != null){
				pMeta.setSubject((String) subject);
			}

			Object summary = this.getJSONFieldValue(metadata, "summary");
			if(summary != null){
				pMeta.setSummary((String) summary);
			}

			Object graderange = this.getJSONFieldValue(metadata, "graderange");
			if(graderange != null){
				pMeta.setGradeRange((String) graderange);
			}

			Object contact = this.getJSONFieldValue(metadata, "contact");
			if(contact != null){
				pMeta.setContact((String) contact);
			}

			Object techreqs = this.getJSONFieldValue(metadata, "techreqs");
			if(techreqs != null){
				pMeta.setTechReqs((String) techreqs);
			}

			Object tools = this.getJSONFieldValue(metadata, "tools");
			if(tools != null){
				pMeta.setTools((String) tools);
			}

			Object lessonplan = this.getJSONFieldValue(metadata, "lessonplan");
			if(lessonplan != null){
				pMeta.setLessonPlan((String) lessonplan);
			}

			Object standards = this.getJSONFieldValue(metadata, "standards");
			if(standards != null){
				pMeta.setStandards((String) standards);
			}

			Object totaltime = this.getJSONFieldValue(metadata, "totaltime");
			if(totaltime != null && !((String) totaltime).equals("")){
				pMeta.setTotalTime((String) totaltime);
			} 

			Object comptime = this.getJSONFieldValue(metadata, "comptime");
			if(comptime != null && !((String) comptime).equals("")){
				pMeta.setCompTime((String) comptime);
			}

			Object keywords = this.getJSONFieldValue(metadata, "keywords");
			if(keywords != null){
				pMeta.setKeywords((String) keywords);
			}

			Object language = this.getJSONFieldValue(metadata, "language");
			if(language != null){
				pMeta.setLanguage((String) language);
			}

			/* save the project */
			try{
				this.projectService.updateProject(project, user);
			} catch (NotAuthorizedException e){
				e.printStackTrace();
				response.getWriter().write(e.getMessage());
			}

			/* write success message */
			response.getWriter().write("Project metadata was successfully published to the portal.");
		} else {
			/* write error message that portal could not access metadata file */
			response.getWriter().write("The portal was unable to access the data in the metadata file. The metadata may be out of sync.");
		}

		return null;
	}

	/**
	 * Returns the value of the given <code>String</code> field name in the given
	 * <code>JSONObject</code> if it exists, returns null otherwise. This function
	 * is provided as a means to catch the JSON error that is associated with retrieving
	 * fields in JSONObjects without the caller having to catch it.
	 * 
	 * @param obj
	 * @param fieldName
	 * @return
	 */
	private Object getJSONFieldValue(JSONObject obj, String fieldName){
		try{
			return obj.get(fieldName);
		} catch(JSONException e){
			e.printStackTrace();
			return null;
		}
	}

	/**
	 * Checks the request command for the given <code>String</code> servlet and returns
	 * <code>boolean</code> true if the request's command parameter value is listed as
	 * projectless, returns false otherwise.
	 * 
	 * @param request
	 * @param servlet
	 * @return boolean
	 */
	private boolean isProjectlessRequest(HttpServletRequest request, String servlet){
		if(servlet.equals("filemanager")){
			return filemanagerProjectlessRequests.contains(request.getParameter("command"));
		}

		return false;
	}

	/**
	 * Returns <code>boolean</code> true if the given <code>User</code> user has sufficient permissions
	 * to create a project, returns false otherwise.
	 * 
	 * @param user
	 * @return boolean
	 */
	private boolean hasAuthorPermissions(User user){
		return user.getUserDetails().hasGrantedAuthority(UserDetailsService.AUTHOR_ROLE) || 
				user.getUserDetails().hasGrantedAuthority(UserDetailsService.TEACHER_ROLE);
	}

	/**
	 * Writes the current user's username to the response
	 * 
	 * @param request
	 * @param response
	 * @return
	 */
	private ModelAndView handleGetUsername(HttpServletRequest request, HttpServletResponse response) throws IOException{
		User user = (User) request.getSession().getAttribute(User.CURRENT_USER_SESSION_KEY);
		response.getWriter().write(user.getUserDetails().getUsername());
		return null;
	}

	/**
	 * Get the url to the curriculum base
	 * e.g.
	 * http://localhost:8080/curriculum
	 * @param request
	 * @param response
	 * @return
	 * @throws IOException
	 */
	private ModelAndView handleGetCurriculumBaseUrl(HttpServletRequest request, HttpServletResponse response) throws IOException{
		//get the curriculum_base_www variable from the wise.properties file
		String curriculumBaseUrl = wiseProperties.getProperty("curriculum_base_www");

		//write the curriculum base url to the response
		response.getWriter().write(curriculumBaseUrl);

		return null;
	}

	/**
	 * Get the config for the authoring tool
	 * @param request
	 * @param response
	 * @return
	 * @throws IOException
	 * @throws ObjectNotFoundException 
	 */
	private ModelAndView handleGetConfig(HttpServletRequest request, HttpServletResponse response) throws IOException, ObjectNotFoundException{
		
		//get the user
		User user = (User) request.getSession().getAttribute(User.CURRENT_USER_SESSION_KEY);

		//get the username
		String username = user.getUserDetails().getUsername();

		//get the wise base url
		String wiseBaseURL = wiseProperties.getProperty("wiseBaseURL");
		
		//get the context path e.g. /wise
		String contextPath = request.getContextPath();
		
		//get the url to get and post metadata
		String projectMetaDataUrl = wiseBaseURL + "/metadata.html";

		//get the url to make CRater requests
		String cRaterRequestUrl = wiseBaseURL + "/cRater.html?type=cRater";

		//get the curriculum_base_www variable from the wise.properties file
		String curriculumBaseUrl = wiseProperties.getProperty("curriculum_base_www");

		//get the url to preview project
		String previewProjectUrl = wiseBaseURL + "/previewproject.html";

		//get the url to make CRater requests
		String deleteProjectUrl = wiseBaseURL + "/teacher/projects/deleteproject.html";

		//get the url to make analyze project requests
		String analyzeProjectUrl = wiseBaseURL + "/teacher/projects/analyzeproject.html";

		//the get url for premade comments
		String getPremadeCommentsUrl = wiseBaseURL + "/teacher/grading/premadeComments.html?action=getData";

		//the post url for premade comments
		String postPremadeCommentsUrl = wiseBaseURL + "/teacher/grading/premadeComments.html?action=postData";
		
		//create a JSONObject to contain the config params
		JSONObject config = new JSONObject();

		try {
			//set the config variables
			config.put("username", username);
			config.put("projectMetaDataUrl", projectMetaDataUrl);
			config.put("curriculumBaseUrl", curriculumBaseUrl);
			config.put("indexUrl", wiseBaseURL + WISEAuthenticationProcessingFilter.TEACHER_DEFAULT_TARGET_PATH);
			int maxInactiveInterval = request.getSession().getMaxInactiveInterval() * 1000;
			config.put("sessionTimeoutInterval", maxInactiveInterval);			// add sessiontimeout interval, in milleseconds
			int sessionTimeoutCheckInterval = maxInactiveInterval / 20;         // check 20 times during the session.
			if (sessionTimeoutCheckInterval > 60000) {
				// session should be checked at least every 60 seconds.
				sessionTimeoutCheckInterval = 60000;
			}
			config.put("sessionTimeoutCheckInterval", sessionTimeoutCheckInterval); // how often session should be checked...check every minute (1 min=60sec=60000 milliseconds)
			config.put("cRaterRequestUrl", cRaterRequestUrl);
			config.put("locale", request.getLocale());
			config.put("previewProjectUrl", previewProjectUrl);
			config.put("deleteProjectUrl", deleteProjectUrl);
			config.put("analyzeProjectUrl", analyzeProjectUrl);
			config.put("getPremadeCommentsUrl", getPremadeCommentsUrl);
			config.put("postPremadeCommentsUrl", postPremadeCommentsUrl);
			config.put("wiseBaseURL", wiseBaseURL);
			config.put("contextPath", contextPath);
			
			// if projectId provided, this is a request for preview
			String projectIdStr = request.getParameter("projectId");
			if(projectIdStr != null){
				Project project = projectService.getById(projectIdStr);
				String curriculumBaseWWW = wiseProperties.getProperty("curriculum_base_www");
				String rawProjectUrl = (String) project.getCurnit().accept(new CurnitGetCurnitUrlVisitor());
				// set the content url 
				String getContentUrl = curriculumBaseWWW + rawProjectUrl;
				
				// get location of last separator in url 
				int lastIndexOfSlash = getContentUrl.lastIndexOf("/");
				if(lastIndexOfSlash==-1){ 
					lastIndexOfSlash = getContentUrl.lastIndexOf("\\");
				}
				
				// set the contentbase based on the contenturl 
				String getContentBaseUrl = getContentUrl.substring(0, lastIndexOfSlash) + "/";

				config.put("getContentBaseUrl", getContentBaseUrl);
			}			
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		
		

		//set the string value of the JSON object in the response
		response.getWriter().write(config.toString());

		return null;
	}

	private ModelAndView handleGetMetadata(HttpServletRequest request, HttpServletResponse response) throws IOException {
		Project project = (Project) request.getAttribute("project");
		User user = ControllerUtil.getSignedInUser();
		ProjectMetadata metadata = project.getMetadata();

		if(metadata == null) {
			metadata = new ProjectMetadataImpl();
			project.setMetadata(metadata);
			try {
				projectService.updateProject(project, user);
			} catch (NotAuthorizedException e) {
				e.printStackTrace();
			}
		}

		response.getWriter().write(metadata.toJSONString());
		return null;
	}

	private ModelAndView handlePostMetadata(HttpServletRequest request, HttpServletResponse response) throws IOException {
		Project project = (Project) request.getAttribute("project");
		User user = ControllerUtil.getSignedInUser();
		String metadataStr = request.getParameter("metadata");
		JSONObject metadataJSON = new JSONObject();
		try {
			metadataJSON = new JSONObject(metadataStr);
		} catch (JSONException e) {
			e.printStackTrace();
		}


		ProjectMetadata metadata = project.getMetadata();
		if (metadata == null) {
			metadata = new ProjectMetadataImpl(metadataJSON);
		} else {
			metadata.populateFromJSON(metadataJSON);
		}

		// get and set the name of the project.
		if(metadataJSON.has("title")) {
			try {
				String title = metadataJSON.getString("title");
				if (title != null && ((String) title).trim().length() > 0 && title != "null") {
					project.setName(title);
				}
			} catch (JSONException e) {
			}	
		}


		project.setMetadata(metadata);
		try {
			projectService.updateProject(project, user);
		} catch (NotAuthorizedException e) {
			e.printStackTrace();
		}

		return null;
	}

	/**
	 * Update the project edited timestamp
	 * @param request
	 * @param response
	 * @return
	 * @throws IOException
	 */
	private ModelAndView handleProjectEdited(HttpServletRequest request, HttpServletResponse response) throws IOException {
		//get the user
		User user = ControllerUtil.getSignedInUser();

		//get the project
		Project project = (Project) request.getAttribute("project");

		if(project != null) {
			//get the project metadata
			ProjectMetadata metadata = project.getMetadata();

			//create a new timestamp with the current time
			Date lastEdited = new Date();

			//set the last edited time
			metadata.setLastEdited(lastEdited);	

			try {
				//update the project in the db
				projectService.updateProject(project, user);
			} catch (NotAuthorizedException e) {
				e.printStackTrace();
			}
		}

		return null;
	}

	/**
	 * Handle the review update project
	 */
	private ModelAndView handleReviewUpdateProject(HttpServletRequest request, HttpServletResponse response) throws IOException {
		return handleReviewOrUpdateProject(request, response);
	}

	/**
	 * Handle the update project
	 */
	private ModelAndView handleUpdateProject(HttpServletRequest request, HttpServletResponse response) throws IOException {
		return handleReviewOrUpdateProject(request, response);
	}

	/**
	 * Handle the review update project or update project 
	 */
	private ModelAndView handleReviewOrUpdateProject(HttpServletRequest request, HttpServletResponse response) throws IOException {
		try {
			//get the service we will forward to, this should be "filemanager"
			String forward = request.getParameter("forward");

			//get the project id
			String projectId = request.getParameter("projectId");

			//get the project
			Project project = this.projectService.getById(projectId);

			//get the signed in user
			User user = ControllerUtil.getSignedInUser();

			//make sure the signed in user has write access
			if(this.projectService.canAuthorProject(project, user)) {
				//get the wise context e.g. /wise
				CredentialManager.setRequestCredentials(request, user);

				//forward the request to the appropriate controller
				servletContext.getRequestDispatcher("/vle/" + forward + ".html").forward(request, response);

				//TODO: update the project edited timestamp
			}
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		} catch (ServletException e) {
			e.printStackTrace();
		}

		return null;
	}
}
