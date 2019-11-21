/**
 * Copyright (c) 2008-2019 Regents of the University of California (Regents).
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
package org.wise.portal.presentation.web.controllers.author.project;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.support.StandardMultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.portal.Portal;
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
import org.wise.portal.service.acl.AclService;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.portal.PortalService;
import org.wise.portal.service.project.ProjectService;
import org.wise.vle.utils.FileManager;
import org.wise.vle.web.AssetManager;
import org.wise.vle.web.SecurityUtils;

/**
 * Controller for users with author privileges to author WISE4 projects
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author Patrick Lawler
 */
@Controller
public class AuthorProjectController {

  private static final String PROJECT_ID_PARAM_NAME = "projectId";
  private static final String FORWARD = "forward";
  private static final String COMMAND = "command";

  @Autowired
  private PortalService portalService;

  @Autowired
  private ProjectService projectService;

  @Autowired
  private Properties appProperties;

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
  protected ModelAndView handleRequestInternal(HttpServletRequest request,
      HttpServletResponse response) throws Exception {
    try {
      Portal portal = portalService.getById(new Integer(1));
      if (!portal.isLoginAllowed()) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
          new SecurityContextLogoutHandler().logout(request, response, auth);
        }
        SecurityContextHolder.getContext().setAuthentication(null);
        return new ModelAndView("redirect:/index.html");
      }
    } catch (ObjectNotFoundException e) {
      // do nothing
    }

    User user = ControllerUtil.getSignedInUser();
    String projectIdStr = request.getParameter(PROJECT_ID_PARAM_NAME);
    String forward = request.getParameter(FORWARD);
    Project project;
    if (projectIdStr != null && !projectIdStr.equals("") && !projectIdStr.equals("none")) {
      project = projectService.getById(Long.parseLong(projectIdStr));
      if (project.getWiseVersion().equals(5)) {
        ModelAndView wise5AuthoringView = new ModelAndView(new RedirectView("../author#!/project/" + projectIdStr));
        return wise5AuthoringView;
      }
    } else {
      project = null;
    }

    if (forward != null && !forward.equals("")) {
      String command = request.getParameter("command");
      if (forward.equals("filemanager") || forward.equals("assetmanager")) {
        if ((isProjectlessRequest(request, forward) || projectService.canAuthorProject(project, user)) ||
            ("copyProject".equals(command) && project.getFamilytag().equals(FamilyTag.TELS)) ||
            ("retrieveFile".equals(command) && project.getFamilytag().equals(FamilyTag.TELS))) {
          if ("createProject".equals(command) && !hasAuthorPermissions(user)) {
            return new ModelAndView("errors/accessdenied");
          }

          if ("copyProject".equals(command) &&
              (project == null || (!project.getFamilytag().equals(FamilyTag.TELS) && !projectService.canAuthorProject(project, user)))) {
            return new ModelAndView("errors/accessdenied");
          }

          CredentialManager.setRequestCredentials(request, user);
          if (forward.equals("filemanager")) {
            if (command != null) {
              String pathAllowedToAccess = CredentialManager.getAllowedPathAccess(request);
              if (command.equals("createProject")) {
                String projectName = request.getParameter("projectName");
                String curriculumBaseDir = appProperties.getProperty("curriculum_base_dir");
                String result = "";
                if (SecurityUtils.isAllowedAccess(pathAllowedToAccess, curriculumBaseDir)) {
                  long projectId = projectService.getNextAvailableProjectId();
                  result = FileManager.createProject(curriculumBaseDir, String.valueOf(projectId), projectName);
                } else {
                  response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                  result = "unauthorized";
                }
                response.getWriter().write(result);
              } else if (command.equals("projectList")) {
                String projectPaths = request.getParameter("projectPaths");
                String projectExt = ".project.json";
                String result = FileManager.getProjectList(projectPaths, projectExt);
                response.getWriter().write(result);
              } else if (command.equals("retrieveFile")) {
                String fileName = request.getParameter("fileName");
                String filePath = FileManager.getFilePath(project, fileName);
                String result = "";
                if (SecurityUtils.isAllowedAccess(pathAllowedToAccess, filePath)) {
                  result = FileManager.retrieveFile(filePath);
                } else {
                  response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                  result = "unauthorized";
                }
                response.getWriter().write(result);
              } else if (command.equals("updateFile")) {
                String projectFolderPath = FileManager.getProjectFolderPath(project);
                String fileName = request.getParameter("fileName");
                String data = request.getParameter("data");
                String result = "";
                if (SecurityUtils.isAllowedAccess(pathAllowedToAccess, projectFolderPath)) {
                  result = FileManager.updateFile(projectFolderPath, fileName, data);
                } else {
                  response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                  result = "unauthorized";
                }
                response.getWriter().write(result);
              } else if (command.equals("createNode")) {
                String projectPath = FileManager.getProjectFilePath(project);
                String nodeClass = request.getParameter("nodeClass");
                String title = request.getParameter("title");
                String type = request.getParameter("type");
                String nodeTemplateParams = request.getParameter("nodeTemplateParams");
                String result = "";
                if (SecurityUtils.isAllowedAccess(pathAllowedToAccess, projectPath)) {
                  result = FileManager.createNode(projectPath, nodeClass, title, type, nodeTemplateParams);
                } else {
                  response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                  result = "not authorized";
                }
                response.getWriter().write(result);
              } else if (command.equals("createSequence")) {
                String projectFileName = request.getParameter("projectFileName");
                String name = request.getParameter("name");
                String id = request.getParameter("id");
                String projectFolderPath = FileManager.getProjectFolderPath(project);
                String result = "";
                if (SecurityUtils.isAllowedAccess(pathAllowedToAccess, projectFolderPath)) {
                  result = FileManager.createSequence(projectFileName, name, id, projectFolderPath);
                } else {
                  response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                  result = "not authorized";
                }
                response.getWriter().write(result);
              } else if (command.equals("removeFile")) {
                String projectFolderPath = FileManager.getProjectFolderPath(project);
                String fileName = request.getParameter("fileName");
                String result = "";
                if (SecurityUtils.isAllowedAccess(pathAllowedToAccess, projectFolderPath)) {
                  result = FileManager.removeFile(projectFolderPath, fileName);
                } else {
                  response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                  result = "unauthorized";
                }
                response.getWriter().write(result);
              } else if (command.equals("copyNode")) {
                String data = request.getParameter("data");
                String type = request.getParameter("type");
                String title = request.getParameter("title");
                String nodeClass = request.getParameter("nodeClass");
                String contentFile = request.getParameter("contentFile");
                String projectFileName = request.getParameter("projectFileName");
                String projectFolderPath = FileManager.getProjectFolderPath(project);
                String result = "";
                if (SecurityUtils.isAllowedAccess(pathAllowedToAccess, projectFolderPath)) {
                  result = FileManager.copyNode(projectFolderPath, projectFileName, data, type, title, nodeClass, contentFile);
                } else {
                  response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                }
                response.getWriter().write(result);
              } else if (command.equals("createSequenceFromJSON")) {
                String projectFileName = request.getParameter("projectFileName");
                String data = request.getParameter("data");
                String projectFolderPath = FileManager.getProjectFolderPath(project);
                String result = "";
                if (SecurityUtils.isAllowedAccess(pathAllowedToAccess, projectFolderPath)) {
                  result = FileManager.createSequenceFromJSON(projectFolderPath, projectFileName, data);
                } else {
                  response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                }
                response.getWriter().write(result);
              } else if (command.equals("getScripts")) {
                String data = request.getParameter("param1");
                String result = FileManager.getScripts(servletContext, data);
                response.getWriter().write(result);
              } else if (command.equals("copyProject")) {
                String projectFolderPath = FileManager.getProjectFolderPath(project);
                String curriculumBaseDir = appProperties.getProperty("curriculum_base_dir");
                String result = "";
                if (SecurityUtils.isAllowedAccess(pathAllowedToAccess, projectFolderPath)) {
                  long newProjectId = projectService.getNextAvailableProjectId();
                  result = FileManager.copyProject(curriculumBaseDir, projectFolderPath,
                      String.valueOf(newProjectId));
                } else {
                  response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                  result = "unauthorized";
                }
                response.getWriter().write(result);
              } else if (command.equals("createFile")) {
                String fileName = request.getParameter("path");
                String data = request.getParameter("data");
                String projectFolderPath = FileManager.getProjectFolderPath(project);
                String result = "";
                if (SecurityUtils.isAllowedAccess(pathAllowedToAccess, projectFolderPath)) {
                  result = FileManager.createFile(projectFolderPath, fileName, data);
                } else {
                  response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                }
                response.getWriter().write(result);
              } else if (command.equals("reviewUpdateProject")) {
                String curriculumBaseDir = appProperties.getProperty("curriculum_base_dir");
                String projectUrl = project.getModulePath();
                Long parentProjectId = project.getParentProjectId();
                Project parentProject = projectService.getById(parentProjectId);
                String parentProjectUrl = parentProject.getModulePath();
                String result = FileManager.reviewUpdateProject(curriculumBaseDir, parentProjectUrl, projectUrl);
                response.getWriter().write(result);
              } else if (command.equals("updateProject")) {
                String curriculumBaseDir = appProperties.getProperty("curriculum_base_dir");
                String childProjectUrl = project.getModulePath();
                String childProjectFolderPath = FileManager.getProjectFolderPath(project);
                Long parentProjectId = project.getParentProjectId();
                Project parentProject = projectService.getById(parentProjectId);
                String parentProjectUrl = parentProject.getModulePath();
                String result = "";
                if (SecurityUtils.isAllowedAccess(pathAllowedToAccess, childProjectFolderPath)) {
                  result = FileManager.updateProject(curriculumBaseDir, parentProjectUrl, childProjectUrl);
                } else {
                  response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                  result = "unauthorized";
                }
                response.getWriter().write(result);
              } else if (command.equals("importSteps")) {
                String curriculumBaseDir = appProperties.getProperty("curriculum_base_dir");
                String fromProjectUrl = "";
                String fromProjectIdStr = request.getParameter("fromProjectId");
                if (fromProjectIdStr != null) {
                  try {
                    long fromProjectId = Long.parseLong(fromProjectIdStr);
                    Project fromProject = projectService.getById(fromProjectId);
                    fromProjectUrl = fromProject.getModulePath();
                  } catch(Exception e) {
                    e.printStackTrace();
                  }
                }
                String toProjectUrl = project.getModulePath();
                String toProjectFolderPath = FileManager.getProjectFolderPath(project);
                String nodeIds = request.getParameter("nodeIds");
                String result = "";
                if (SecurityUtils.isAllowedAccess(pathAllowedToAccess, toProjectFolderPath)) {
                  result = FileManager.importSteps(curriculumBaseDir, fromProjectUrl, toProjectUrl, nodeIds);
                } else {
                  response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                  result = "unauthorized";
                }
                response.getWriter().write(result);
              } else if (command.equals("getProjectUsageAndMax")) {
                String path = FileManager.getProjectFolderPath(project);
                Long projectMaxTotalAssetsSizeLong = project.getMaxTotalAssetsSize();
                String result = FileManager.getProjectUsageAndMax(path, projectMaxTotalAssetsSizeLong);
                response.getWriter().write(result);
              } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
              }
            } else {
              response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            }
          } else if (forward.equals("assetmanager")) {
            if (command == null && request.getContentType() != null &&
                request.getContentType().toLowerCase().indexOf("multipart/") > -1 ) {
              String projectFolderPath = FileManager.getProjectFolderPath(project);
              String dirName = "assets";
              String pathToCheckSize = projectFolderPath;
              Long projectMaxTotalAssetsSize = project.getMaxTotalAssetsSize();
              if (projectMaxTotalAssetsSize == null) {
                projectMaxTotalAssetsSize = new Long(appProperties.getProperty("project_max_total_assets_size", "15728640"));
              }
              String allowedProjectAssetContentTypesStr = appProperties.getProperty("normalAuthorAllowedProjectAssetContentTypes");
              if (user.isTrustedAuthor()) {
                allowedProjectAssetContentTypesStr += "," + appProperties.getProperty("trustedAuthorAllowedProjectAssetContentTypes");
              }

              StandardMultipartHttpServletRequest multiRequest = (StandardMultipartHttpServletRequest) request;
              Map<String,MultipartFile> fileMap = multiRequest.getFileMap();

              Iterator<String> iter = multiRequest.getFileNames();
              while (iter.hasNext()) {
                String filename = iter.next();
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
              String result = AssetManager.uploadAsset(fileMap, projectFolderPath, dirName, pathToCheckSize, projectMaxTotalAssetsSize);
              response.getWriter().write(result);
            } else if (command.equals("remove")) {
              String path = FileManager.getProjectFolderPath(project);
              String dirName = "assets";
              String assetFileName = request.getParameter("asset");
              String result = AssetManager.removeAsset(path, dirName, assetFileName);
              response.getWriter().write(result);
            } else if (command.equals("getSize")) {
              String path = FileManager.getProjectFolderPath(project);
              String dirName = "assets";
              String result = AssetManager.getSize(path, dirName);
              response.getWriter().write(result);
            } else if (command.equals("assetList")) {
              String path = FileManager.getProjectFolderPath(project);
              String dirName = "assets";
              JSONArray assetList = AssetManager.getAssetList(path, dirName);
              response.getWriter().write(assetList.toString());
            } else if (command.equals("studentAssetCopyForReference")) {
            } else {
              response.sendError(HttpServletResponse.SC_BAD_REQUEST);
            }
          }

          if ("updateFile".equals(command)) {
            /*
             * set the project into the request so the handleProjectEdited
             * function doesn't have to retrieve it again
             */
            request.setAttribute("project", project);
            handleProjectEdited(request, response);
          }
          return null;
        } else {
          return new ModelAndView("errors/accessdenied");
        }
      } else if (command.equals("getTimestamp")) {
        response.getWriter().write(String.valueOf(new Date().getTime()));
        return null;
      }
    }

    String command = request.getParameter(COMMAND);
    if (command != null && command != "") {
      if (command.equals("launchAuthoring")) {
        return handleLaunchAuthoring(request);
      } else if (command.equals("getTimestamp")) {
        response.getWriter().write(String.valueOf(new Date().getTime()));
        return null;
      } else if (command.equals("createProject")) {
        return handleCreateProject(request, response);
      } else if (command.equals("projectList")) {
        return handleProjectList(request, response);
      } else if (command.equals("notifyProjectOpen")) {
        return handleNotifyProjectOpen(request, response);
      } else if (command.equals("notifyProjectClose")) {
        return handleNotifyProjectClose(request, response);
      } else if (command.equals("publishMetadata")) {
        return handlePublishMetadata(request, response);
      } else if (command.equals("getUsername")) {
        return handleGetUsername(request, response);
      } else if (command.equals("getCurriculumBaseUrl")) {
        return handleGetCurriculumBaseUrl(request, response);
      } else if (command.equals("getConfig")) {
        return handleGetConfig(request, response);
      } else if (command.equals("getEditors")) {
        if (projectService.canAuthorProject(project, user)) {
          return handleGetEditors(response);
        } else {
          return new ModelAndView("errors/accessdenied");
        }
      } else if (command.equals("preview")) {
        PreviewProjectParameters previewParams = new PreviewProjectParameters();
        previewParams.setProject(project);
        previewParams.setHttpServletRequest(request);
        return (ModelAndView) projectService.previewProject(previewParams);
      } else if (command.equals("createTag") || command.equals("updateTag") ||
        command.equals("removeTag") || command.equals("retrieveProjectTags")) {
        return taggerController.handleRequestInternal(request, response);
      } else if (command.equals("getMetadata")) {
        request.setAttribute("project", project);
        return handleGetMetadata(request, response);
      } else if (command.equals("postMetadata")) {
        request.setAttribute("project", project);
        return handlePostMetadata(request, response);
      } else if (command.equals("reviewUpdateProject")) {
        return handleReviewUpdateProject(request, response);
      } else if (command.equals("updateProject")) {
        return handleUpdateProject(request, response);
      } else if (command.equals("importSteps")) {
        return handleReviewOrUpdateProject(request, response);
      }
    }
    return handleLaunchAuthoring(request);
  }

  /**
   * Convert a WISE4 project into a WISE5 project. The WISE5 project will
   * get a new project id and a new project folder. The WISE4 assets folder
   * will be copied over to the WISE5 project folder. The WISE4 project will
   * not be changed in any way and will still exist after the conversion.
   */
  @RequestMapping("/author/convert.html")
  protected ModelAndView handleConvertRequestInternal(HttpServletRequest request,
      HttpServletResponse response) throws Exception {
    User user = ControllerUtil.getSignedInUser();
    if (hasAuthorPermissions(user)) {
      String curriculumBaseDir = appProperties.getProperty("curriculum_base_dir");
      String wise4ProjectId = request.getParameter("wise4ProjectId");
      String wise5ProjectString = request.getParameter("wise5Project");
      JSONObject wise5ProjectJSON = new JSONObject(wise5ProjectString);
      JSONObject metadataJSON = wise5ProjectJSON.getJSONObject("metadata");
      String wise5ProjectName = metadataJSON.getString("title");
      Project wise4Project = projectService.getById(Long.parseLong(wise4ProjectId));
      String wise4ProjectFolderPath = FileManager.getProjectFolderPath(wise4Project);
      String wise4AssetsFolderPath = wise4ProjectFolderPath + "/assets";
      long wise5ProjectId = projectService.getNextAvailableProjectId();
      String relativeWISE5ProjectFilePath =
          FileManager.createWISE5Project(curriculumBaseDir, String.valueOf(wise5ProjectId));
      String wise5ProjectFilePath = curriculumBaseDir + relativeWISE5ProjectFilePath;
      String wise5ProjectFolderPath = wise5ProjectFilePath.substring(0, wise5ProjectFilePath.indexOf("/project.json"));
      String wise5AssetsFolderPath = wise5ProjectFolderPath + "/assets";
      boolean overwrite = true;
      FileManager.writeFile(wise5ProjectFilePath, wise5ProjectString, overwrite);
      File wise4AssetsFolder = new File(wise4AssetsFolderPath);
      File wise5AssetsFolder = new File(wise5AssetsFolderPath);
      FileManager.copy(wise4AssetsFolder, wise5AssetsFolder);
      ProjectParameters pParams = new ProjectParameters();
      pParams.setProjectId(wise5ProjectId);
      pParams.setModulePath(relativeWISE5ProjectFilePath);
      pParams.setOwner(user);
      pParams.setProjectname(wise5ProjectName);
      pParams.setProjectType(ProjectType.LD);
      pParams.setWiseVersion(5);
      if (wise4Project != null) {
        pParams.setParentProjectId(Long.valueOf(wise4ProjectId));
        ProjectMetadata parentProjectMetadata = wise4Project.getMetadata();
        if (parentProjectMetadata != null) {
          ProjectMetadata newProjectMetadata = new ProjectMetadataImpl(parentProjectMetadata.toJSONString());
          pParams.setMetadata(newProjectMetadata);
        }
      } else {
        ProjectMetadata metadata = new ProjectMetadataImpl();
        metadata.setTitle(wise5ProjectName);
        pParams.setMetadata(metadata);
      }
      Project project = projectService.createProject(pParams);
      response.getWriter().write(project.getId().toString());
      return null;
    } else {
      return new ModelAndView("errors/accessdenied");
    }
  }

  /**
   * Launch the authoring tool
   * @param request
   * @return the model and view containing the necessary variables
   */
  private ModelAndView handleLaunchAuthoring(HttpServletRequest request) {
    User author = ControllerUtil.getSignedInUser();
    String contextPath = request.getContextPath();
    String vleUrl = contextPath + "/vle/author.html";
    String portalAuthorUrl = contextPath + "/author/authorproject.html";
    String command = request.getParameter("param1");
    String projectIdStr = request.getParameter(PROJECT_ID_PARAM_NAME);
    Project project = null;
    if (projectIdStr != null && !projectIdStr.equals("") && !projectIdStr.equals("none")) {
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

    if (command != null && command != "") {
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
    if (project != null) {
      if (author.isAdmin() || aclService.hasPermission(project, BasePermission.WRITE, author) ||
          aclService.hasPermission(project, BasePermission.ADMINISTRATION, author)) {
        String title;
        if (project.getMetadata() != null && project.getMetadata().getTitle() != null && !project.getMetadata().getTitle().equals("")) {
          title = project.getMetadata().getTitle();
        } else {
          title = project.getName();
        }

        if (title != null) {
          /*
           * replace " with \" because if we don't escape it, the " may
           * short circuit the parent string that we put the title in
           */
          title = title.replaceAll("\"", "\\\\\"");
        }

        if (command == null) {
          mav.addObject("command", "editProject");
        }

        String rawProjectUrl = project.getModulePath();
        String polishedProjectUrl = null;
        polishedProjectUrl = rawProjectUrl;
        String relativeProjectUrl = polishedProjectUrl;
        String projectId = project.getId().toString();
        String projectTitle = title;
        mav.addObject("relativeProjectUrl", relativeProjectUrl);
        mav.addObject("projectId", projectId);
        mav.addObject("projectTitle", projectTitle);
      } else {
        return new ModelAndView("errors/accessdenied");
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
  private ModelAndView handleCreateProject(HttpServletRequest request, HttpServletResponse response)
      throws Exception {
    User user = ControllerUtil.getSignedInUser();
    if (hasAuthorPermissions(user)) {
      String path = request.getParameter("projectPath");
      String name = request.getParameter("projectName");
      String parentProjectId = request.getParameter("parentProjectId");

      ProjectParameters pParams = new ProjectParameters();
      pParams.setProjectId(getProjectIdFromPath(path));
      pParams.setModulePath(path);
      pParams.setOwner(user);
      pParams.setProjectname(name);
      pParams.setProjectType(ProjectType.LD);
      if (parentProjectId != null && !parentProjectId.equals("undefined")) {
        Project parentProject = projectService.getById(parentProjectId);
        if (parentProject != null) {
          pParams.setParentProjectId(Long.valueOf(parentProjectId));
          ProjectMetadata parentProjectMetadata = parentProject.getMetadata();
          if (parentProjectMetadata != null) {
            ProjectMetadata newProjectMetadata = new ProjectMetadataImpl(parentProjectMetadata.toJSONString());
            pParams.setMetadata(newProjectMetadata);
          }
        }
      } else {
        ProjectMetadata metadata = new ProjectMetadataImpl();
        metadata.setTitle(name);
        pParams.setMetadata(metadata);
      }
      Project project = projectService.createProject(pParams);
      response.getWriter().write(project.getId().toString());
      return null;
    } else {
      return new ModelAndView("errors/accessdenied");
    }
  }

  private long getProjectIdFromPath(String projectPath) {
    return Long.parseLong(projectPath.substring(1, projectPath.lastIndexOf("/")));
  }

  @SuppressWarnings("unchecked")
  private ModelAndView handleNotifyProjectOpen(HttpServletRequest request,
      HttpServletResponse response) throws Exception {
    User user = ControllerUtil.getSignedInUser();
    if (hasAuthorPermissions(user)) {
      return null;
    } else {
      return new ModelAndView("errors/accessdenied");
    }
  }

  @SuppressWarnings("unchecked")
  private ModelAndView handleNotifyProjectClose(HttpServletRequest request,
      HttpServletResponse response) throws Exception {
    User user = ControllerUtil.getSignedInUser();
    if (hasAuthorPermissions(user)) {
      response.getWriter().write("success");
      return null;
    } else {
      return new ModelAndView("errors/accessdenied");
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
  private ModelAndView handleGetEditors(HttpServletResponse response) throws Exception {
    response.getWriter().write("");
    return null;
  }

  /**
   * Returns a list of projects that the signed in user can author
   * @param request
   * @param response
   * @return
   * @throws Exception
   */
  private ModelAndView handleProjectList(HttpServletRequest request, HttpServletResponse response)
      throws Exception {
    String projectTag = request.getParameter("projectTag");
    String wiseVersion = request.getParameter("wiseVersion");
    JSONArray projects = new JSONArray();
    if (projectTag == null) {
      projects = getAuthorableProjects();
    } else if (projectTag.equals("library")) {
      projects = getLibraryProjects(wiseVersion);
    } else if (projectTag.equals("authorable")) {
      projects = getAuthorableProjects();
    } else if (projectTag.equals("authorableAndLibrary")) {
      JSONArray authorableProjects = getAuthorableProjects();
      JSONArray libraryProjects = getLibraryProjects(wiseVersion);
      for (int x = 0; x < authorableProjects.length(); x++) {
        JSONObject authorableProject = authorableProjects.getJSONObject(x);
        projects.put(authorableProject);
      }
      for (int y = 0; y < libraryProjects.length(); y++) {
        JSONObject libraryProject = libraryProjects.getJSONObject(y);
        projects.put(libraryProject);
      }
    }
    response.getWriter().write(projects.toString());
    return null;
  }

  /**
   * Get all the projects the current user can author
   * @throws Exception
   * @return the JSONArray of authorable projects
   */
  private JSONArray getAuthorableProjects() throws Exception {
    List<Project> allAuthorableProjects = new ArrayList<Project>();
    User signedInUser = ControllerUtil.getSignedInUser();
    List<Project> projects = projectService.getProjectList(signedInUser);
    List<Project> sharedProjects = projectService.getSharedProjectList(ControllerUtil.getSignedInUser());
    // in the future, we'll want to filter this allAuthorableProjects list even further by what kind of
    // permissions (view, edit, share) the user has on the project.
    allAuthorableProjects.addAll(projects);
    allAuthorableProjects.addAll(sharedProjects);
    JSONArray projectArray = new JSONArray();
    for (Project project : allAuthorableProjects) {
      if (project.getProjectType() == ProjectType.LD && project.getWiseVersion().equals(4) &&
          projectService.canAuthorProject(project, signedInUser)) {
        String rawProjectUrl = project.getModulePath();
        String title = project.getName();
        if (rawProjectUrl != null) {
          String projectFileName = rawProjectUrl.substring(rawProjectUrl.lastIndexOf("/"));
          JSONObject projectDetails = new JSONObject();
          projectDetails.put("id", project.getId());
          projectDetails.put("path", projectFileName);
          projectDetails.put("title", title);
          projectDetails.put("isDeleted", project.isDeleted());
          projectArray.put(projectDetails);
        }
      }
    }
    return projectArray;
  }

  /**
   * Get all the library projects
   * @throws Exception
   * @return the JSONArray of library projects
   */
  private JSONArray getLibraryProjects(String wiseVersionStr) throws Exception {
    List<Project> libraryProjects = projectService.getLibraryProjectList();
    if (wiseVersionStr == null) {
      wiseVersionStr = "4";
    }
    Integer wiseVersion = Integer.valueOf(wiseVersionStr);
    JSONArray libraryProjectArray = new JSONArray();
    for (Project libraryProject : libraryProjects) {
      if (libraryProject.getProjectType() == ProjectType.LD &&
          libraryProject.getWiseVersion().equals(wiseVersion)) {
        String rawProjectUrl = libraryProject.getModulePath();
        String title = libraryProject.getName();
        if (rawProjectUrl != null) {
          String projectFileName = rawProjectUrl.substring(rawProjectUrl.lastIndexOf("/"));
          JSONObject projectDetails = new JSONObject();
          projectDetails.put("id", libraryProject.getId());
          projectDetails.put("path", projectFileName);
          projectDetails.put("title", title);
          libraryProjectArray.put(projectDetails);
        }
      }
    }
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
  private ModelAndView handlePublishMetadata(HttpServletRequest request,
      HttpServletResponse response) throws ObjectNotFoundException, IOException{
    Long projectId = Long.parseLong(request.getParameter("projectId"));
    String metadataString = request.getParameter("metadata");
    JSONObject metadata = null;
    try {
      metadata = new JSONObject(metadataString);
    } catch (JSONException e1) {
      e1.printStackTrace();
    }
    Project project = projectService.getById(projectId);
    User user = ControllerUtil.getSignedInUser();
    if (metadata != null) {
      ProjectMetadata pMeta = project.getMetadata();
      if (pMeta == null) {
        pMeta = new ProjectMetadataImpl();
        pMeta.setProjectId(projectId);
        project.setMetadata(pMeta);
      }

      Object title = getJSONFieldValue(metadata, "title");
      if (title != null && ((String) title).trim().length() > 0 && !((String) title).equals("null")) {
        pMeta.setTitle((String) title);
        project.setName((String) title);
      }

      Object author = getJSONFieldValue(metadata, "author");
      if (author != null) {
        pMeta.setAuthor((String) author);
      }

      Object subject = getJSONFieldValue(metadata, "subject");
      if (subject != null) {
        pMeta.setSubject((String) subject);
      }

      Object summary = getJSONFieldValue(metadata, "summary");
      if (summary != null) {
        pMeta.setSummary((String) summary);
      }

      Object graderange = getJSONFieldValue(metadata, "graderange");
      if (graderange != null) {
        pMeta.setGradeRange((String) graderange);
      }

      Object contact = getJSONFieldValue(metadata, "contact");
      if (contact != null) {
        pMeta.setContact((String) contact);
      }

      Object techreqs = getJSONFieldValue(metadata, "techreqs");
      if (techreqs != null) {
        pMeta.setTechReqs((String) techreqs);
      }

      Object tools = getJSONFieldValue(metadata, "tools");
      if (tools != null) {
        pMeta.setTools((String) tools);
      }

      Object lessonplan = getJSONFieldValue(metadata, "lessonplan");
      if (lessonplan != null) {
        pMeta.setLessonPlan((String) lessonplan);
      }

      Object standards = getJSONFieldValue(metadata, "standards");
      if (standards != null) {
        pMeta.setStandards((String) standards);
      }

      Object totaltime = getJSONFieldValue(metadata, "totaltime");
      if (totaltime != null && !((String) totaltime).equals("")) {
        pMeta.setTotalTime((String) totaltime);
      }

      Object comptime = getJSONFieldValue(metadata, "comptime");
      if (comptime != null && !((String) comptime).equals("")) {
        pMeta.setCompTime((String) comptime);
      }

      Object keywords = getJSONFieldValue(metadata, "keywords");
      if (keywords != null) {
        pMeta.setKeywords((String) keywords);
      }

      Object language = getJSONFieldValue(metadata, "language");
      if (language != null) {
        pMeta.setLanguage((String) language);
      }

      try {
        projectService.updateProject(project, user);
      } catch (NotAuthorizedException e) {
        e.printStackTrace();
        response.getWriter().write(e.getMessage());
      }
      response.getWriter().write("Project metadata was successfully published to the portal.");
    } else {
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
  private Object getJSONFieldValue(JSONObject obj, String fieldName) {
    try {
      return obj.get(fieldName);
    } catch(JSONException e) {
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
  private boolean isProjectlessRequest(HttpServletRequest request, String servlet) {
    if (servlet.equals("filemanager")) {
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
  private boolean hasAuthorPermissions(User user) {
    return user.getUserDetails().hasGrantedAuthority(UserDetailsService.AUTHOR_ROLE) ||
      user.getUserDetails().hasGrantedAuthority(UserDetailsService.TEACHER_ROLE);
  }

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
  private ModelAndView handleGetCurriculumBaseUrl(HttpServletRequest request,
      HttpServletResponse response) throws IOException {
    String curriculumBaseUrl = appProperties.getProperty("curriculum_base_www");
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
  private ModelAndView handleGetConfig(HttpServletRequest request, HttpServletResponse response)
      throws IOException, ObjectNotFoundException {
    User user = ControllerUtil.getSignedInUser();
    String username = user.getUserDetails().getUsername();
    String contextPath = request.getContextPath();
    String projectMetadataURL = contextPath + "/metadata.html";
    String cRaterRequestURL = contextPath + "/c-rater";
    String curriculumBaseUrl = appProperties.getProperty("curriculum_base_www");
    String previewProjectUrl = contextPath + "/previewproject.html";
    String deleteProjectUrl = contextPath + "/teacher/projects/deleteproject.html";
    String analyzeProjectUrl = contextPath + "/teacher/projects/analyzeproject.html";
    String premadeCommentsURL = contextPath + "/teacher/grading/premadeComments.html";
    JSONObject config = new JSONObject();

    try {
      config.put("username", username);
      config.put("projectMetadataURL", projectMetadataURL);
      config.put("curriculumBaseUrl", curriculumBaseUrl);
      config.put("indexURL", contextPath + WISEAuthenticationProcessingFilter.TEACHER_DEFAULT_TARGET_PATH);
      int maxInactiveInterval = request.getSession().getMaxInactiveInterval() * 1000;
      config.put("sessionTimeoutInterval", maxInactiveInterval);
      int sessionTimeoutCheckInterval = maxInactiveInterval / 20;
      if (sessionTimeoutCheckInterval > 60000) {
        sessionTimeoutCheckInterval = 60000;
      }
      config.put("sessionTimeoutCheckInterval", sessionTimeoutCheckInterval);
      config.put("cRaterRequestURL", cRaterRequestURL);
      config.put("locale", request.getLocale());
      config.put("previewProjectUrl", previewProjectUrl);
      config.put("deleteProjectUrl", deleteProjectUrl);
      config.put("analyzeProjectUrl", analyzeProjectUrl);
      config.put("premadeCommentsURL", premadeCommentsURL);
      config.put("wiseBaseURL", contextPath);
      config.put("contextPath", contextPath);

      String projectIdStr = request.getParameter("projectId");
      if (projectIdStr != null) {
        Project project = projectService.getById(projectIdStr);
        String curriculumBaseWWW = appProperties.getProperty("curriculum_base_www");
        String rawProjectUrl = project.getModulePath();
        String projectURL = curriculumBaseWWW + rawProjectUrl;

        int lastIndexOfSlash = projectURL.lastIndexOf("/");
        if (lastIndexOfSlash == -1) {
          lastIndexOfSlash = projectURL.lastIndexOf("\\");
        }
        String projectBaseURL = projectURL.substring(0, lastIndexOfSlash) + "/";
        config.put("projectBaseURL", projectBaseURL);
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    response.getWriter().write(config.toString());
    return null;
  }

  private ModelAndView handleGetMetadata(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    Project project = (Project) request.getAttribute("project");
    User user = ControllerUtil.getSignedInUser();
    ProjectMetadata metadata = project.getMetadata();
    if (metadata == null) {
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

  private ModelAndView handlePostMetadata(HttpServletRequest request, HttpServletResponse response) {
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

    if (metadataJSON.has("title")) {
      try {
        String title = metadataJSON.getString("title");
        if (title != null && title.trim().length() > 0 && title != "null") {
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

  private ModelAndView handleProjectEdited(HttpServletRequest request, HttpServletResponse response) {
    User user = ControllerUtil.getSignedInUser();
    Project project = (Project) request.getAttribute("project");
    if (project != null) {
      ProjectMetadata metadata = project.getMetadata();
      Date lastEdited = new Date();
      metadata.setLastEdited(lastEdited);
      try {
        projectService.updateProject(project, user);
      } catch (NotAuthorizedException e) {
        e.printStackTrace();
      }
    }
    return null;
  }

  private ModelAndView handleReviewUpdateProject(HttpServletRequest request,
      HttpServletResponse response) throws IOException {
    return handleReviewOrUpdateProject(request, response);
  }

  private ModelAndView handleUpdateProject(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    return handleReviewOrUpdateProject(request, response);
  }

  private ModelAndView handleReviewOrUpdateProject(HttpServletRequest request,
      HttpServletResponse response) throws IOException {
    try {
      String forward = request.getParameter("forward");
      String projectId = request.getParameter("projectId");
      Project project = projectService.getById(projectId);
      User user = ControllerUtil.getSignedInUser();
      if (projectService.canAuthorProject(project, user)) {
        CredentialManager.setRequestCredentials(request, user);
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
