/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
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

import org.apache.commons.io.FileUtils;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.support.DefaultMultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;
import org.springframework.web.socket.WebSocketHandler;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.portal.Portal;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.ProjectMetadata;
import org.wise.portal.domain.project.impl.ProjectMetadataImpl;
import org.wise.portal.domain.project.impl.ProjectParameters;
import org.wise.portal.domain.project.impl.ProjectType;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.presentation.web.exception.NotAuthorizedException;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.portal.PortalService;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.websocket.WISEWebSocketHandler;
import org.wise.vle.utils.FileManager;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.*;
import java.util.*;
import java.util.regex.*;
import java.util.stream.Collectors;

/**
 * Controller for authoring WISE5 projects
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
@Controller
public class WISE5AuthorProjectController {

  @Autowired
  PortalService portalService;

  @Autowired
  ProjectService projectService;

  @Autowired
  RunService runService;

  @Autowired
  Properties wiseProperties;

  @Autowired
  ServletContext servletContext;

  @Autowired
  private WebSocketHandler webSocketHandler;

  /**
   * Handle user's request to launch the Authoring Tool without specified project
   */
  @RequestMapping(value = "/author", method = RequestMethod.GET)
  protected String authorProject(HttpServletRequest request, HttpServletResponse response,
      ModelMap modelMap) {
    try {
      Portal portal = portalService.getById(new Integer(1));
      if (!portal.isLoginAllowed()) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
          new SecurityContextLogoutHandler().logout(request, response, auth);
        }
        SecurityContextHolder.getContext().setAuthentication(null);
        return "redirect:/index.html";
      }
    } catch (ObjectNotFoundException e) {
      // do nothing
    }

    String contextPath = request.getContextPath();
    modelMap.put("configURL", contextPath + "/authorConfig");
    return "author";
  }

  /**
   * Handle user's request to register a new WISE5 project.
   * Registers the new project in DB and returns the new project ID
   * If the parentProjectId is specified, the user is requesting to copy that project
   */
  @RequestMapping(value = "/project/new", method = RequestMethod.POST)
  protected void registerNewProject(
      @RequestParam(value = "parentProjectId", required = false) String parentProjectId,
      @RequestParam(value = "projectJSONString") String projectJSONString,
      @RequestParam(value = "commitMessage") String commitMessage,
      HttpServletResponse response) {
    User user = ControllerUtil.getSignedInUser();
    if (!this.hasAuthorPermissions(user)) {
      return;
    }
    String curriculumBaseDir = wiseProperties.getProperty("curriculum_base_dir");
    File curriculumBaseDirFile = new File(curriculumBaseDir);
    File newProjectPath = FileManager.createNewprojectPath(curriculumBaseDirFile);
    File newProjectAssetsDir = new File(newProjectPath, "assets");
    newProjectAssetsDir.mkdir();

    try {
      JSONObject projectJSONObject = new JSONObject(projectJSONString);
      String projectName = projectJSONObject.getJSONObject("metadata").getString("title");
      String projectJSONFilename = "project.json";
      File newProjectJSONFile = new File(newProjectPath, projectJSONFilename);
      if (!newProjectJSONFile.exists()) {
        newProjectJSONFile.createNewFile();
      }
      // write the project JSON to file system
      Writer writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(newProjectJSONFile), "UTF-8"));
      writer.write(projectJSONString.toString());
      writer.close();

      String projectFolderName = newProjectJSONFile.getParentFile().getName();
      String projectPathRelativeToCurriculumBaseDir = "/" + projectFolderName + "/" + projectJSONFilename;

      ProjectParameters pParams = new ProjectParameters();
      pParams.setModulePath(projectPathRelativeToCurriculumBaseDir);
      pParams.setOwner(user);
      pParams.setProjectname(projectName);
      pParams.setProjectType(ProjectType.LD);
      pParams.setWiseVersion(new Integer(5));

      // since this is new original project, set a new fresh metadata object
      ProjectMetadata metadata = new ProjectMetadataImpl();
      metadata.setTitle(projectName);
      pParams.setMetadata(metadata);

      Project project = projectService.createProject(pParams);
      response.getWriter().write(project.getId().toString());
      // commented below until "W5 AT: new commit message convention #1016" is completed
      //commitChangesToProjectJSON(commitMessage, user, newProjectPath.getAbsolutePath());
    } catch(IOException e) {
      e.printStackTrace();
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  /**
   * Handle user's request to register a new WISE5 project.
   * Registers the new project in DB and returns the new project ID
   * If the parentProjectId is specified, the user is requesting to copy that project
   */
  @RequestMapping(value = "/project/copy/{projectId}", method = RequestMethod.POST)
  protected void copyProject(@PathVariable Long projectId, HttpServletResponse response) {
    User user = ControllerUtil.getSignedInUser();
    if (!this.hasAuthorPermissions(user)) {
      return;
    }
    try {
      Project parentProject = projectService.getById(projectId);
      Set<String> tagNames = new TreeSet<String>();
      tagNames.add("library");
      if (parentProject != null && (this.projectService.canAuthorProject(parentProject, user) || parentProject.hasTags(tagNames))) {
        String curriculumBaseDir = wiseProperties.getProperty("curriculum_base_dir");
        String parentProjectJSONAbsolutePath = curriculumBaseDir + parentProject.getModulePath();
        File parentProjectJSONFile = new File(parentProjectJSONAbsolutePath);
        File parentProjectDir = parentProjectJSONFile.getParentFile();

        String newProjectDirectoryPath = copyProjectDirectory(parentProjectDir);
        String modulePath = "/" + newProjectDirectoryPath + "/project.json";

        ProjectParameters pParams = new ProjectParameters();
        pParams.setModulePath(modulePath);
        pParams.setOwner(user);
        pParams.setProjectname(parentProject.getName());
        pParams.setProjectType(ProjectType.LD);
        pParams.setWiseVersion(new Integer(5));
        pParams.setParentProjectId(Long.valueOf(projectId));

        ProjectMetadata parentProjectMetadata = parentProject.getMetadata(); // get the parent project's metadata
        if (parentProjectMetadata != null) {
          ProjectMetadata newProjectMetadata = new ProjectMetadataImpl(parentProjectMetadata.toJSONString());
          pParams.setMetadata(newProjectMetadata);
        } else {
          ProjectMetadata metadata = new ProjectMetadataImpl();
          metadata.setTitle(parentProject.getName());
          pParams.setMetadata(metadata);
        }

        Project project = projectService.createProject(pParams);
        response.getWriter().write(project.getId().toString());
      }
    } catch (ObjectNotFoundException onfe) {
      onfe.printStackTrace();
      return;
    } catch (IOException ie) {
      ie.printStackTrace();
      return;
    } catch (JSONException je) {
      je.printStackTrace();
      return;
    }
  }

  /**
   * Save project and and commit changes to project.json file
   * @param projectId id of project to save
   * @param commitMessage commit message, can be null
   * @param projectJSONString a valid-JSON string of the project
   */
  @RequestMapping(value = "/project/save/{projectId}", method = RequestMethod.POST)
  @ResponseStatus(value = HttpStatus.OK)
  protected void saveProject(
      @PathVariable Long projectId,
      @RequestParam(value = "commitMessage") String commitMessage,
      @RequestParam(value = "projectJSONString") String projectJSONString) {
    Project project;
    try {
      project = projectService.getById(projectId);
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
      return;
    }

    User user = ControllerUtil.getSignedInUser();
    if (!projectService.canAuthorProject(project, user)) {
      return;
    }

    String curriculumBaseDir = wiseProperties.getProperty("curriculum_base_dir");
    String projectModulePath = project.getModulePath();
    String projectJSONPath = curriculumBaseDir + projectModulePath;

    File projectFile = new File(projectJSONPath);
    try {
      if (!projectFile.exists()) {
        projectFile.createNewFile();
      }
      Writer writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(projectFile), "UTF-8"));
      writer.write(projectJSONString.toString());
      writer.close();

      try {
        JSONObject projectJSONObject = new JSONObject(projectJSONString);
        JSONObject projectMetadataJSON = projectJSONObject.getJSONObject("metadata");
        if (projectMetadataJSON != null) {
          project.setMetadata(projectMetadataJSON.toString());
          String projectTitle = projectMetadataJSON.getString("title");
          if (projectTitle != null && !projectTitle.equals(project.getName())) {
            project.setName(projectTitle);
          }
          this.projectService.updateProject(project, user);
        }
      } catch(JSONException e) {
        e.printStackTrace();
      } catch (NotAuthorizedException e) {
        e.printStackTrace();
      }
      // commented below until "W5 AT: new commit message convention #1016" is completed
      //String projectDirPath = projectJSONPath.substring(0, projectJSONPath.lastIndexOf("/"));
      //commitChangesToProjectJSON(commitMessage, user, projectDirPath);
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  @SuppressWarnings("unused")
  private void commitChangesToProjectJSON(String commitMessage, User user, String projectDirPath)
      throws IOException {
    try {
      String authorUsername = user.getUserDetails().getUsername();
      String authorEmail = user.getUserDetails().getEmailAddress();
      JGitUtils.commitChangesToProjectJSON(projectDirPath, authorUsername, authorEmail,
          commitMessage);
    } catch (GitAPIException e) {
      e.printStackTrace();
    }
  }

  /**
   * Handles request to get a config object for authoring tool without any specific project
   */
  @RequestMapping(value = "/authorConfig", method = RequestMethod.GET)
  protected void getAuthorProjectConfigChooser(HttpServletRequest request,
      HttpServletResponse response) throws IOException {
    JSONObject config = getDefaultAuthoringConfigJsonObject(request);
    PrintWriter writer = response.getWriter();
    writer.write(config.toString());
    writer.close();
  }

  /**
   * Handles request to get a config object for a specific project
   */
  @RequestMapping(value = "/authorConfig/{projectId}", method = RequestMethod.GET)
  protected void getAuthorProjectConfig(HttpServletRequest request, HttpServletResponse response,
      @PathVariable Long projectId) throws IOException {
    Project project;
    try {
      project = projectService.getById(projectId);
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
      return;
    }

    JSONObject config = getDefaultAuthoringConfigJsonObject(request);
    try {
      String contextPath = request.getContextPath();
      String curriculumBaseWWW = wiseProperties.getProperty("curriculum_base_www");
      String rawProjectUrl = project.getModulePath();
      String projectURL = curriculumBaseWWW + rawProjectUrl;
      String projectBaseURL = projectURL.substring(0, projectURL.indexOf("project.json"));
      Long projectAssetTotalSizeMax = project.getMaxTotalAssetsSize();
      if (projectAssetTotalSizeMax == null) {
        projectAssetTotalSizeMax =
            new Long(wiseProperties.getProperty("project_max_total_assets_size",
            "15728640"));
      }

      config.put("projectId", projectId);
      config.put("projectURL", projectURL);
      config.put("projectAssetTotalSizeMax", projectAssetTotalSizeMax);
      config.put("projectAssetURL", contextPath + "/project/asset/" + projectId);
      config.put("projectBaseURL", projectBaseURL);
      config.put("previewProjectURL", contextPath + "/project/" + projectId);
      config.put("cRaterRequestURL", contextPath + "/cRater");
      config.put("importStepsURL", contextPath + "/project/importSteps/" + projectId);
      config.put("mode", "author");

      if (projectService.canAuthorProject(project, ControllerUtil.getSignedInUser())) {
        config.put("saveProjectURL", contextPath + "/project/save/" + projectId);
        config.put("commitProjectURL", contextPath + "/project/commit/" + projectId);
      }

      Long runId = this.getRunId(projectId);
      if (runId != null) {
        config.put("runId", runId);
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    PrintWriter writer = response.getWriter();
    writer.write(config.toString());
    writer.close();
  }

  /**
   * Creates and returns a default Authoring config object that is the same for all projects
   */
  private JSONObject getDefaultAuthoringConfigJsonObject(HttpServletRequest request) {
    JSONObject config = new JSONObject();
    User user = ControllerUtil.getSignedInUser();
    try {
      String contextPath = request.getContextPath();
      config.put("contextPath", contextPath);
      config.put("userType", "teacher");
      config.put("copyProjectURL", contextPath + "/project/copy");
      config.put("mainHomePageURL", contextPath);
      config.put("renewSessionURL", contextPath + "/session/renew");
      config.put("sessionLogOutURL", contextPath + "/logout");
      config.put("registerNewProjectURL", contextPath + "/project/new");
      config.put("wiseBaseURL", contextPath);
      config.put("notifyProjectBeginURL", contextPath + "/project/notifyAuthorBegin/");
      config.put("notifyProjectEndURL", contextPath + "/project/notifyAuthorEnd/");
      config.put("getLibraryProjectsURL", contextPath + "/author/authorproject.html?command=projectList&projectPaths=&projectTag=library&wiseVersion=5");
      config.put("teacherDataURL", contextPath + "/teacher/data");

      String projectMetadataSettings = null;
      try {
        Portal portal = portalService.getById(new Integer(1));
        projectMetadataSettings = portal.getProjectMetadataSettings();
      } catch (ObjectNotFoundException e) {
        // do nothing
      }

      if (projectMetadataSettings == null) {
        projectMetadataSettings = portalService.getDefaultProjectMetadataSettings();
      }
      config.put("projectMetadataSettings", new JSONObject(projectMetadataSettings));

      MutableUserDetails userDetails = user.getUserDetails();
      String userName = userDetails.getUsername();
      String firstName = userDetails.getFirstname();
      String lastName = userDetails.getLastname();
      String fullName = firstName + " " + lastName;
      userName = fullName + " (" + userName + ")";

      // add this teachers's info in config.userInfo.myUserInfo object
      JSONObject myUserInfo = new JSONObject();
      myUserInfo.put("id", user.getId());
      myUserInfo.put("userName", userName);
      myUserInfo.put("firstName", firstName);
      myUserInfo.put("lastName", lastName);
      myUserInfo.put("fullName", fullName);
      JSONObject userInfo = new JSONObject();
      userInfo.put("myUserInfo", myUserInfo);
      config.put("userInfo", userInfo);

      List<Project> allProjectsOwnedByUser = projectService.getProjectList(user);
      List<JSONObject> wise5ProjectsOwnedByUser = new ArrayList<JSONObject>();
      for (Project project : allProjectsOwnedByUser) {
        if (project.getWiseVersion().equals(5)) {
          JSONObject projectJSONObject = new JSONObject();
          projectJSONObject.put("id", project.getId());
          projectJSONObject.put("name", project.getName());
          String projectIdString = project.getId().toString();
          Long projectId = new Long(projectIdString);
          Long runId = this.getRunId(projectId);
          if (runId != null) {
            projectJSONObject.put("runId", runId);
          }
          if (project.isDeleted()) {
            projectJSONObject.put("isDeleted", true);
          }
          wise5ProjectsOwnedByUser.add(projectJSONObject);
        }
      }
      config.put("projects", wise5ProjectsOwnedByUser);

      List<Project> sharedProjects = projectService.getSharedProjectList(user);
      List<JSONObject> wise5SharedProjects = new ArrayList<JSONObject>();
      for (Project project : sharedProjects) {
        if (project.getWiseVersion().equals(5)) {
          JSONObject projectJSONObject = new JSONObject();
          projectJSONObject.put("id", project.getId());
          projectJSONObject.put("name", project.getName());
          String projectIdString = project.getId().toString();
          Long projectId = new Long(projectIdString);
          Long runId = this.getRunId(projectId);
          if (runId != null) {
            projectJSONObject.put("runId", runId);
          }
          if (projectService.canAuthorProject(project, user)) {
            projectJSONObject.put("canEdit", true);
          }
          if (project.isDeleted()) {
            projectJSONObject.put("isDeleted", true);
          }
          wise5SharedProjects.add(projectJSONObject);
        }
      }
      config.put("sharedProjects", wise5SharedProjects);

      // set user's locale
      Locale locale = request.getLocale();
      if (user != null) {
        String userLanguage = user.getUserDetails().getLanguage();
        if (userLanguage != null) {
          if (userLanguage.contains("_")) {
            String language = userLanguage.substring(0, userLanguage.indexOf("_"));
            String country = userLanguage.substring(userLanguage.indexOf("_") + 1);
            locale = new Locale(language, country);
          } else {
            locale = new Locale(userLanguage);
          }
        }
      }
      config.put("locale", locale);
      String webSocketBaseURL = wiseProperties.getProperty("webSocketBaseUrl");

      if (webSocketBaseURL == null) {
        /*
         * if the websocket base url was not provided in the portal properties
         * we will use the default websocket base url.
         * e.g.
         * ws://localhost:8080/wise
         */
        if (contextPath.contains("http")) {
          webSocketBaseURL = contextPath.replace("http", "ws");
        } else {
          String portalContextPath = ControllerUtil.getPortalUrlString(request);
          webSocketBaseURL = portalContextPath.replace("http", "ws");
        }
      }

      config.put("webSocketURL", webSocketBaseURL + "/websocket");
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return config;
  }

  /**
   * Handle request to retrieve commit history for the specified projectId.
   * Optional parameter specifies how many commits to retrieve
   * @param projectId
   * @throws Exception
   */
  @RequestMapping(value = "/project/commit/{projectId}", method = RequestMethod.GET)
  protected void getCommitHistory(@PathVariable Long projectId, HttpServletResponse response)
      throws Exception {
    Project project = projectService.getById(projectId);
    User user = ControllerUtil.getSignedInUser();
    if (!projectService.canAuthorProject(project, user)) {
      return;
    }

    String projectDirPath = getProjectDirectoryPath(project);
    JSONArray commitHistoryJSONArray = JGitUtils.getCommitHistoryJSONArray(projectDirPath);
    response.getWriter().print(commitHistoryJSONArray);
  }

  private String getProjectDirectoryPath(Project project) {
    String curriculumBaseDir = wiseProperties.getProperty("curriculum_base_dir");
    String rawProjectUrl = project.getModulePath();
    String projectDirPath = curriculumBaseDir + rawProjectUrl;
    return projectDirPath.substring(0, projectDirPath.lastIndexOf("/"));
  }

  /**
   * Returns the absolute path to the specified project's assets directory
   */
  private String getProjectAssetsDirectoryPath(Project project) {
    String curriculumBaseDir = wiseProperties.getProperty("curriculum_base_dir");
    String rawProjectUrl = project.getModulePath();
    String projectURL = curriculumBaseDir + rawProjectUrl;
    String projectBaseDir = projectURL.substring(0, projectURL.indexOf("project.json"));
    return projectBaseDir + "/assets";
  }

  /**
   * Prints project assets in output stream.
   */
  @RequestMapping(value = "/project/asset/{projectId}", method = RequestMethod.GET)
  protected void getProjectAssets(HttpServletResponse response, @PathVariable Long projectId) {
    try {
      Project project = projectService.getById(projectId);
      User user = ControllerUtil.getSignedInUser();
      if (projectService.canAuthorProject(project, user)) {
        String projectAssetsDirPath = getProjectAssetsDirectoryPath(project);
        File projectAssetsDir = new File(projectAssetsDirPath);
        JSONObject projectAssetsJSONObject = getDirectoryJSONObject(projectAssetsDir);
        PrintWriter writer = response.getWriter();
        writer.write(projectAssetsJSONObject.toString());
        writer.close();
      }
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    } catch (JSONException je) {
      je.printStackTrace();
    } catch (IOException ioe) {
      ioe.printStackTrace();
    }
  }

  /**
   * Prints specified project asset in output stream so it can be downloaded by the user
   */
  @RequestMapping(value = "/project/asset/{projectId}/download", method = RequestMethod.GET)
  protected void downloadProjectAsset(HttpServletResponse response, @PathVariable Long projectId,
      @RequestParam(value = "assetFileName") String assetFileName) throws Exception {
    try {
      Project project = projectService.getById(projectId);
      User user = ControllerUtil.getSignedInUser();
      if (projectService.canAuthorProject(project, user)) {
        String projectAssetsDirPath = getProjectAssetsDirectoryPath(project);
        File projectAssetFile = new File(projectAssetsDirPath + "/" + assetFileName);
        response.setContentType("application/octet-stream");
        response.setHeader("Content-Disposition", "attachment;filename=\"" + assetFileName + "\"");
        FileUtils.copyFile(projectAssetFile, response.getOutputStream());
      }
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    } catch (IOException ioe) {
      ioe.printStackTrace();
    }
  }

  /**
   * Saves POSTed file into the project's asset folder
   * TODO refactor too many nesting
   */
  @RequestMapping(method = RequestMethod.POST, value = "/project/asset/{projectId}")
  protected void saveProjectAsset(@PathVariable Long projectId, HttpServletRequest request,
      String assetFileName, HttpServletResponse response) throws ServletException, IOException {
    try {
      Project project = projectService.getById(projectId);
      User user = ControllerUtil.getSignedInUser();
      if (projectService.canAuthorProject(project, user)) {
        String projectAssetsDirPath = getProjectAssetsDirectoryPath(project);
        File projectAssetsDir = new File(projectAssetsDirPath);

        if (assetFileName != null) {
          // user wants to delete an existing asset
          File asset = new File(projectAssetsDir, assetFileName);
          if (asset.exists()) {
            asset.delete();
          }
        } else {
          // user wants to add a new asset
          Long projectMaxTotalAssetsSize = project.getMaxTotalAssetsSize();
          if (projectMaxTotalAssetsSize == null) {
            projectMaxTotalAssetsSize = new Long(wiseProperties.getProperty("project_max_total_assets_size", "15728640"));
          }
          long sizeOfAssetsDirectory = FileUtils.sizeOfDirectory(projectAssetsDir);

          DefaultMultipartHttpServletRequest multiRequest = (DefaultMultipartHttpServletRequest) request;
          Map<String, MultipartFile> fileMap = multiRequest.getFileMap();
          if (fileMap != null && fileMap.size() > 0) {
            for (String key : fileMap.keySet()) {
              MultipartFile file = fileMap.get(key);
              if (sizeOfAssetsDirectory + file.getSize() > projectMaxTotalAssetsSize) {
                // Adding this asset will exceed the maximum allowed for the project, so don't add it
                // Show a message to the user
                PrintWriter writer = response.getWriter();
                writer.write("Error: Exceeded project max asset size.\nPlease delete unused assets.\n\nContact WISE if your project needs more disk space.");
                writer.close();
                return;
              } else if (!isUserAllowedToUpload(user, file)) {
                PrintWriter writer = response.getWriter();
                writer.write("Error: Upload file \"" + file.getOriginalFilename() + "\" not allowed.\n");
                writer.close();
                return;
              } else {
                String filename = file.getOriginalFilename();
                File asset = new File(projectAssetsDir, filename);
                if (!asset.exists()) {
                  asset.createNewFile();
                }
                byte[] fileContent = file.getBytes();
                FileOutputStream fos = new FileOutputStream(asset);
                fos.write(fileContent);
                fos.flush();
                fos.close();
              }
            }
          }
        }

        File projectAssetsDirectory = new File(projectAssetsDirPath);
        JSONObject projectAssetsJSONObject = getDirectoryJSONObject(projectAssetsDirectory);
        PrintWriter writer = response.getWriter();
        writer.write(projectAssetsJSONObject.toString());
        writer.close();
      }
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    } catch (JSONException je) {
      je.printStackTrace();
    }
  }

  /**
   * Returns true iff the logged-in user is allowed to post the specified file
   * @param user the user who is trying to upload
   * @param file file that the user is trying to upload
   */
  private boolean isUserAllowedToUpload(User user, MultipartFile file) {
    String allowedProjectAssetContentTypesStr =
        wiseProperties.getProperty("normalAuthorAllowedProjectAssetContentTypes");
    if (user.isTrustedAuthor()) {
      allowedProjectAssetContentTypesStr +=
          "," + wiseProperties.getProperty("trustedAuthorAllowedProjectAssetContentTypes");
    }
    if (!allowedProjectAssetContentTypesStr.contains(file.getContentType())) {
      return false;
    }
    return true;
  }

  /**
   * Returns a JSONObject containing information about the specified directory.
   * This includes totalFileSize and files in the directory
   * @throws JSONException
   */
  private JSONObject getDirectoryJSONObject(File directory) throws JSONException {
    JSONObject directoryJSONObject = new JSONObject();
    JSONArray projectAssetsJSONArray = new JSONArray();
    long totalDirectorySize = 0l;
    File[] filesInProjectAssetsDir = getFilesInDirectory(directory);
    if (filesInProjectAssetsDir != null) {
      for (File file : filesInProjectAssetsDir) {
        try {
          String fileName = file.getName();
          JSONObject fileObject = new JSONObject();
          fileObject.put("fileName", fileName);
          long fileSize = file.length();
          fileObject.put("fileSize", fileSize);
          totalDirectorySize += fileSize;
          projectAssetsJSONArray.put(fileObject);
        } catch (Exception e) {
          e.printStackTrace();
        }
      }
    }
    directoryJSONObject.put("totalFileSize", totalDirectorySize);
    directoryJSONObject.put("files", projectAssetsJSONArray);
    return directoryJSONObject;
  }

  /**
   * Get the file names in the directory. Permission checks should be done before calling this method.
   * @param directory the directory containing the files
   * @return an array of files in the directory
   */
  public static File[] getFilesInDirectory(File directory) {
    if (directory.exists() && directory.isDirectory()) {
      return directory.listFiles();
    }
    return new File[0];
  }

  /**
   * @param user
   * @return boolean true iff the given <code>User</code> user has sufficient permissions
   * to create a project
   */
  private boolean hasAuthorPermissions(User user) {
    return user.getUserDetails().hasGrantedAuthority(UserDetailsService.AUTHOR_ROLE) ||
        user.getUserDetails().hasGrantedAuthority(UserDetailsService.TEACHER_ROLE);
  }

  /**
   * Given a path to curriculum base directory and the path to the project directory that we want to copy,
   * copies the directory and returns <code>String</code> the path to the freshly copied directory.
   *
   * @param srcDir the directory of the project we are copying, e.g. "/tomcat/webapps/curriculum/5"
   * @return the path to the new project
   * @throws IOException
   */
  public static String copyProjectDirectory(File srcDir) throws IOException {
    if (srcDir.exists() && srcDir.isDirectory()) {
      File destDir = createNewprojectPath(srcDir.getParentFile());
      copy(srcDir, destDir);
      return destDir.getName();
    } else {
      throw new IOException("Provided path is not found or is not a directory. Path: " + srcDir.getPath());
    }
  }

  /**
   * Given a parent directory, attempts to generate and return a unique project directory.
   * @param parent
   */
  public static File createNewprojectPath(File parent) {
    Integer counter = 1;
    while (true) {
      File tryMe = new File(parent, String.valueOf(counter));
      if (!tryMe.exists()) {
        tryMe.mkdir();
        return tryMe;
      }
      counter++;
    }
  }

  /**
   * Copies the given <code>File</code> src to the given <code>File</code> dest. If the src is
   * a directories, recursively copies the contents of the directory into dest.
   *
   * @param src directory to copy from
   * @param dest directory to copy to
   * @throws IOException
   */
  public static void copy(File src, File dest) throws IOException {
    if (src.isDirectory()) {
      if (!dest.exists()) {
        dest.mkdir();
      }
      String[] files = src.list();
      for (int a = 0; a < files.length; a++) {
        copy(new File(src, files[a]), new File(dest, files[a]));
      }
    } else {
      InputStream in = new FileInputStream(src);
      FileOutputStream out = new FileOutputStream(dest);
      byte[] buffer = new byte[2048];
      int len;
      while ((len = in.read(buffer)) > 0) {
        out.write(buffer, 0, len);
      }
      in.close();
      out.close();
    }
  }

  /**
   * Get the run id that uses the project id
   * @param projectId the project id
   * @returns the run id that uses the project if the project is used in a run
   */
  private Long getRunId(Long projectId) {
    Long runId = null;
    if (projectId != null) {
      List<Run> runs = this.runService.getProjectRuns(projectId);
      if (runs != null && runs.size() > 0) {
        // get the first run since a project can only be used in one run
        Run run = runs.get(0);
        if (run != null) {
          runId = run.getId();
        }
      }
    }
    return runId;
  }

  /**
   * Handles notifications of opened projects
   * @param request
   * @throws Exception
   */
  @SuppressWarnings("unchecked")
  @RequestMapping(value = "/project/notifyAuthorBegin/{projectId}", method = RequestMethod.POST)
  private ModelAndView handleNotifyAuthorProjectBegin(@PathVariable String projectId,
      HttpServletRequest request) throws Exception {
    User user = ControllerUtil.getSignedInUser();
    if (this.hasAuthorPermissions(user)) {
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
      notifyCurrentAuthors(projectId);
      return null;
    } else {
      return new ModelAndView(new RedirectView("accessdenied.html"));
    }
  }

  /**
   * Handles notifications of closed projects
   * @throws Exception
   */
  @SuppressWarnings("unchecked")
  @RequestMapping(value = "/project/notifyAuthorEnd/{projectId}", method = RequestMethod.POST)
  private ModelAndView handleNotifyAuthorProjectEnd(@PathVariable String projectId,
      HttpServletRequest request) throws Exception {
    User user = ControllerUtil.getSignedInUser();
    if (this.hasAuthorPermissions(user)) {
      HttpSession currentSession = request.getSession();
      Map<String, ArrayList<String>> openedProjectsToSessions =
          (Map<String, ArrayList<String>>) servletContext
          .getAttribute("openedProjectsToSessions");

      if (openedProjectsToSessions == null || openedProjectsToSessions.get(projectId) == null) {
        return null;
      } else {
        ArrayList<String> sessions = openedProjectsToSessions.get(projectId);
        if (!sessions.contains(currentSession.getId())) {
          return null;
        } else {
          sessions.remove(currentSession.getId());
          if (sessions.size() == 0) {
            openedProjectsToSessions.remove(projectId);
          }
          notifyCurrentAuthors(projectId);
          return null;
        }
      }
    } else {
      return new ModelAndView(new RedirectView("accessdenied.html"));
    }
  }

  /**
   * Notify other authors authoring the same project id in real-time with websocket
   * @param projectId
   */
  private void notifyCurrentAuthors(String projectId) {
    try {
      User user = ControllerUtil.getSignedInUser();
      if (webSocketHandler != null) {
        WISEWebSocketHandler wiseWebSocketHandler = (WISEWebSocketHandler) webSocketHandler;
        JSONObject webSocketMessageJSON = new JSONObject();
        webSocketMessageJSON.put("messageType", "currentAuthors");
        webSocketMessageJSON.put("projectId", projectId);
        webSocketMessageJSON.put("messageParticipants", "authorToAuthors");
        wiseWebSocketHandler.handleMessage(user, webSocketMessageJSON.toString());
      }
    } catch (Exception e) {
      // if something fails while sending to websocket, allow the rest to continue
      e.printStackTrace();
    }
  }

  /**
   * Import steps and copy assets if necessary
   * @param steps a string containing a JSONArray of steps
   * @param toProjectId the project id we are importing into
   * @param fromProjectId the project id we are importing from
   */
  @SuppressWarnings("unchecked")
  @RequestMapping(value = "/project/importSteps/{projectId}", method = RequestMethod.POST)
  private ModelAndView handleImportSteps(
      @RequestParam(value = "steps") String steps,
      @RequestParam(value = "toProjectId") Integer toProjectId,
      @RequestParam(value = "fromProjectId") Integer fromProjectId,
      HttpServletResponse response) throws Exception {
    User user = ControllerUtil.getSignedInUser();
    Project project = projectService.getById(toProjectId);
    if (!projectService.canAuthorProject(project, user)) {
      return null;
    }

    /*
     * Regex string to match asset file references in the step/component
     * content.
     * e.g. carbon.png
     */
    String patternString = "(\'|\"|\\\\\'|\\\\\")([^:][^/]?[^/]?[a-zA-Z0-9@\\._\\/\\s\\-]*[.](png|PNG|jpe?g|JPE?G|pdf|PDF|gif|GIF|mov|MOV|mp4|MP4|mp3|MP3|wav|WAV|swf|SWF|css|CSS|txt|TXT|json|JSON|xlsx?|XLSX?|doc|DOC|html.*?|HTML.*?|js|JS)).*?(\'|\"|\\\\\'|\\\\\")";
    Pattern pattern = Pattern.compile(patternString);
    Matcher matcher = pattern.matcher(steps);

    /*
     * this list will hold all the file names that are referenced by the
     * steps that we are importing
     */
    List<String> fileNames = new ArrayList<String>();
    while(matcher.find()) {
      String group0 = matcher.group(0); //\"nyan_cat.png\"
      String group1 = matcher.group(1); //\"
      String group2 = matcher.group(2); //nyan_cat.png
      String group3 = matcher.group(3); //\"
      String fileName = matcher.group(2);
      fileNames.add(fileName);
    }

    // remove duplicates from the list of file names
    fileNames = fileNames.stream().distinct().collect(Collectors.toList());
    Project fromProject = projectService.getById(fromProjectId);
    String fromProjectUrl = fromProject.getModulePath();
    Project toProject = projectService.getById(toProjectId);
    String toProjectUrl = toProject.getModulePath();
    String curriculumBaseDir = wiseProperties.getProperty("curriculum_base_dir");

    // get the index of the last separator from the fromProjectUrl
    int fromProjectUrlLastIndexOfSlash = fromProjectUrl.lastIndexOf("/");
    if (fromProjectUrlLastIndexOfSlash == -1) {
      fromProjectUrlLastIndexOfSlash = fromProjectUrl.lastIndexOf("\\");
    }

    // get the project folder e.g. /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/171
    String fullFromProjectFolderUrl = curriculumBaseDir + fromProjectUrl.substring(0, fromProjectUrlLastIndexOfSlash);

    // get the index of the last separator from the toProjectUrl
    int toProjectUrlLastIndexOfSlash = toProjectUrl.lastIndexOf("/");
    if (toProjectUrlLastIndexOfSlash == -1) {
      toProjectUrlLastIndexOfSlash = toProjectUrl.lastIndexOf("\\");
    }

    // get the project folder e.g. /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/172
    String fullToProjectFolderUrl = curriculumBaseDir + toProjectUrl.substring(0, toProjectUrlLastIndexOfSlash);

    // get the project assets folder e.g. /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/171/assets
    String fromProjectAssetsUrl = fullFromProjectFolderUrl + "/assets";
    File fromProjectAssetsFolder = new File(fromProjectAssetsUrl);

    // get the project assets folder e.g. /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/172/assets
    String toProjectAssetsUrl = fullToProjectFolderUrl + "/assets";
    File toProjectAssetsFolder = new File(toProjectAssetsUrl);

    /*
     * loop through all the asset file names that are referenced in the
     * steps we are importing
     */
    for (String fileName : fileNames) {
      /*
       * Import the asset to the project we are importing to. If the
       * project already contains a file with the same file name and does
       * not have the same file content, it will be given a new file name.
       * The file name that is used will be returned by
       * importAssetInContent().
       */
      String newFileName = FileManager.importAssetInContent(
          fileName, null, fromProjectAssetsFolder, toProjectAssetsFolder);

      if (newFileName != null && !fileName.equals(newFileName)) {
        // the file name was changed so we need to update the step content by replacing
        // all instances of the file name with the new file name
        steps = steps.replaceAll(fileName, newFileName);
      }
    }

    /*
     * send back the steps string which may have been modified if we needed
     * to change a file name
     */
    response.getWriter().write(steps);
    return null;
  }
}
