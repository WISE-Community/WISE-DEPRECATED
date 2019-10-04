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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.support.StandardMultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;
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
import org.wise.portal.service.portal.PortalService;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.session.SessionService;
import org.wise.portal.spring.data.redis.MessagePublisher;
import org.wise.vle.utils.FileManager;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
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
  protected SessionService sessionService;

  @Autowired
  Properties appProperties;

  @Autowired
  ServletContext servletContext;

  @Autowired
  private MessagePublisher redisPublisher;

  private String featuredProjectIconsFolderRelativePath = "wise5/authoringTool/projectIcons";

  @GetMapping("/author")
  protected String authorProject(HttpServletRequest request, HttpServletResponse response)
      throws ObjectNotFoundException {
    Portal portal = portalService.getById(new Integer(1));
    if (!portal.isLoginAllowed()) {
      Authentication auth = SecurityContextHolder.getContext().getAuthentication();
      if (auth != null) {
        new SecurityContextLogoutHandler().logout(request, response, auth);
      }
      SecurityContextHolder.getContext().setAuthentication(null);
      return "redirect:/index.html";
    }
    return "forward:/wise5/authoringTool/dist/index.html";
  }

  /**
   * Handle user's request to register a new WISE5 project. Registers the new
   * project in DB and returns the new project ID If the parentProjectId is
   * specified, the user is requesting to copy that project
   *
   * @throws ObjectNotFoundException
   * @throws JSONException
   * @throws IOException
   */
  @PostMapping("/project/new")
  @ResponseBody
  protected String registerNewProject(
      @RequestParam(value = "parentProjectId", required = false) String parentProjectId,
      @RequestParam("projectJSONString") String projectJSONString,
      @RequestParam("commitMessage") String commitMessage)
      throws ObjectNotFoundException, JSONException, IOException {
    User user = ControllerUtil.getSignedInUser();
    if (!hasAuthorPermissions(user)) {
      return null;
    }
    File curriculumBaseDir = new File(appProperties.getProperty("curriculum_base_dir"));
    long newProjectId = projectService.getNextAvailableProjectId();
    File newProjectDir = new File(curriculumBaseDir, String.valueOf(newProjectId));
    newProjectDir.mkdir();
    File newProjectAssetsDir = new File(newProjectDir, "assets");
    newProjectAssetsDir.mkdir();
    copyRandomFeaturedProjectIconIntoAssetsFolder(newProjectAssetsDir);
    JSONObject projectJSONObject = new JSONObject(projectJSONString);
    String projectName = projectJSONObject.getJSONObject("metadata").getString("title");
    String projectJSONFilename = "project.json";
    File newProjectJSONFile = new File(newProjectDir, projectJSONFilename);
    if (!newProjectJSONFile.exists()) {
      newProjectJSONFile.createNewFile();
    }
    Writer writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(newProjectJSONFile), "UTF-8"));
    writer.write(projectJSONString.toString());
    writer.close();

    ProjectParameters pParams = new ProjectParameters();
    pParams.setProjectId(newProjectId);
    pParams.setModulePath("/" + newProjectId + "/" + projectJSONFilename);
    pParams.setOwner(user);
    pParams.setProjectname(projectName);
    pParams.setProjectType(ProjectType.LD);
    pParams.setWiseVersion(new Integer(5));

    ProjectMetadata metadata = new ProjectMetadataImpl();
    metadata.setTitle(projectName);
    pParams.setMetadata(metadata);
    Project project = projectService.createProject(pParams);
    return project.getId().toString();
  }

  private void copyRandomFeaturedProjectIconIntoAssetsFolder(File folder)
      throws IOException {
    File randomFeaturedProjectIcon = getRandomFeaturedProjectIcon();
    if (randomFeaturedProjectIcon != null) {
      Path fromImagePath = Paths.get(randomFeaturedProjectIcon.getPath());
      Path toImagePath = Paths.get(folder.getPath() + "/project_thumb.png");
      Files.copy(fromImagePath, toImagePath, StandardCopyOption.REPLACE_EXISTING);
    }
  }

  private File getRandomFeaturedProjectIcon() {
    File featuredProjectIconsDir = new File(getFeaturedProjectIconsFolderPathString());
    File[] featuredProjectIcons = featuredProjectIconsDir.listFiles();
    if (featuredProjectIcons != null && featuredProjectIcons.length > 0) {
      return featuredProjectIcons[new Random().nextInt(featuredProjectIcons.length)];
    } else {
      return null;
    }
  }

  @ResponseBody
  @GetMapping("/project/featured/icons")
  protected String getFeaturedProjectIcons() {
    File featuredProjectIconsDir = new File(getFeaturedProjectIconsFolderPathString());
    File[] featuredProjectIcons = featuredProjectIconsDir.listFiles();
    JSONArray featuredProjectIconPaths = new JSONArray();
    for (File featuredProjectIcon : featuredProjectIcons) {
      featuredProjectIconPaths.put(featuredProjectIcon.getName());
    }
    return featuredProjectIconPaths.toString();
  }

  @ResponseBody
  @PostMapping("/project/featured/icon")
  protected String setFeaturedProjectIcon(@RequestParam("projectId") Long projectId,
        @RequestParam("projectIcon") String projectIcon)
        throws JSONException {
    boolean isCustom = false;
    return setProjectIcon(projectId, projectIcon, isCustom);
  }

  @ResponseBody
  @PostMapping("/project/custom/icon")
  protected String setCustomProjectIcon(@RequestParam("projectId") Long projectId,
        @RequestParam("projectIcon") String projectIcon)
        throws JSONException {
    boolean isCustom = true;
    return setProjectIcon(projectId, projectIcon, isCustom);
  }

  private String setProjectIcon(Long projectId, String projectIcon, boolean isCustom) throws JSONException {
    try {
      User user = ControllerUtil.getSignedInUser();
      Project project = projectService.getById(projectId);
      if (projectService.canAuthorProject(project, user)) {
        String projectAssetsFolderPathString = FileManager.getProjectAssetsFolderPath(project);
        Path fromImagePath = null;
        if (isCustom) {
          fromImagePath = Paths.get(projectAssetsFolderPathString + "/" + projectIcon);
        } else {
          fromImagePath = getFeaturedProjectIconPath(projectIcon);
        }
        Path toImagePath = Paths.get(projectAssetsFolderPathString + "/project_thumb.png");
        Files.copy(fromImagePath, toImagePath, StandardCopyOption.REPLACE_EXISTING);
      }
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
    JSONObject response = new JSONObject();
    response.put("projectIcon", projectIcon);
    return response.toString();
  }

  private String getFeaturedProjectIconsFolderPathString() {
    String webappPath = servletContext.getRealPath(File.separator);
    return webappPath + featuredProjectIconsFolderRelativePath;
  }

  private Path getFeaturedProjectIconPath(String fileName) {
    return Paths.get(getFeaturedProjectIconsFolderPathString() + "/" + fileName);
  }

  /**
   * Handle user's request to register a new WISE5 project.
   * Registers the new project in DB and returns the new project ID
   * If the parentProjectId is specified, the user is requesting to copy that project
   */
  @PostMapping("/project/copy/{projectId}")
  @ResponseBody
  protected String copyProject(@PathVariable Long projectId) throws Exception {
    User user = ControllerUtil.getSignedInUser();
    if (!hasAuthorPermissions(user)) {
      return null;
    }
    Project parentProject = projectService.getById(projectId);
    if (parentProject != null && (this.projectService.canReadProject(parentProject, user) ||
        parentProject.isOfficialProject() ||
        parentProject.isCommunityProject())) {
      Project project = projectService.copyProject(projectId.intValue(), user);
      return project.getId().toString();
    }
    return null;
  }

  /**
   * Save project and and commit changes to project.json file
   *
   * @param projectId id of project to save
   * @param commitMessage commit message, can be null
   * @param projectJSONString a valid-JSON string of the project
   * @throws ObjectNotFoundException
   */
  @PostMapping("/project/save/{projectId}")
  @ResponseStatus(HttpStatus.OK)
  protected void saveProject(@PathVariable Long projectId,
      @RequestParam("commitMessage") String commitMessage,
      @RequestParam("projectJSONString") String projectJSONString)
      throws JSONException, ObjectNotFoundException {
    Project project = projectService.getById(projectId);
    User user = ControllerUtil.getSignedInUser();
    if (!projectService.canAuthorProject(project, user)) {
      return;
    }

    String curriculumBaseDir = appProperties.getProperty("curriculum_base_dir");
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
          ProjectMetadata oldProjectMetadata = project.getMetadata();
          ProjectMetadata projectMetadata = new ProjectMetadataImpl(projectMetadataJSON);
          project.setMetadata(projectMetadataJSON.toString());
          if (!oldProjectMetadata.getTitle().equals(projectMetadata.getTitle()) ||
              !oldProjectMetadata.getAuthors().equals(projectMetadata.getAuthors())) {
            String projectFolderPath = FileManager.getProjectFolderPath(project);
            projectService.writeProjectLicenseFile(projectFolderPath, project);
          }
          String projectTitle = projectMetadataJSON.getString("title");
          if (projectTitle != null && !projectTitle.equals(project.getName())) {
            project.setName(projectTitle);
          }
          projectService.updateProject(project, user);
        }
      } catch (JSONException | NotAuthorizedException e) {
        e.printStackTrace();
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  @SuppressWarnings("unused")
  private void commitChangesToProjectJSON(String commitMessage, User user, String projectDirPath)
      throws IOException, GitAPIException {
    String authorUsername = user.getUserDetails().getUsername();
    String authorEmail = user.getUserDetails().getEmailAddress();
    JGitUtils.commitChangesToProjectJSON(projectDirPath, authorUsername, authorEmail,
        commitMessage);
  }

  @GetMapping("/authorConfig")
  @ResponseBody
  protected String getAuthorProjectConfigChooser(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    JSONObject config = getDefaultAuthoringConfigJsonObject(request);
    return config.toString();
  }

  @GetMapping(value = "/authorConfig/{projectId}")
  @ResponseBody
  protected String getAuthorProjectConfig(HttpServletRequest request, HttpServletResponse response,
      @PathVariable Long projectId) throws IOException, ObjectNotFoundException, JSONException {
    Project project = projectService.getById(projectId);
    JSONObject config = getDefaultAuthoringConfigJsonObject(request);
    String contextPath = request.getContextPath();
    String curriculumBaseWWW = appProperties.getProperty("curriculum_base_www");
    String rawProjectUrl = project.getModulePath();
    String projectURL = curriculumBaseWWW + rawProjectUrl;
    String projectBaseURL = projectURL.substring(0, projectURL.indexOf("project.json"));
    Long projectAssetTotalSizeMax = project.getMaxTotalAssetsSize();
    if (projectAssetTotalSizeMax == null) {
      projectAssetTotalSizeMax =
          new Long(appProperties.getProperty("project_max_total_assets_size", "15728640"));
    }

    config.put("projectId", projectId);
    config.put("projectURL", projectURL);
    config.put("projectAssetTotalSizeMax", projectAssetTotalSizeMax);
    config.put("projectAssetURL", contextPath + "/project/asset/" + projectId);
    config.put("projectBaseURL", projectBaseURL);
    config.put("previewProjectURL", contextPath + "/project/" + projectId);
    config.put("cRaterRequestURL", contextPath + "/c-rater");
    config.put("importStepsURL", contextPath + "/project/importSteps/" + projectId);
    config.put("featuredProjectIcons", contextPath + "/project/featured/icons");
    config.put("featuredProjectIcon", contextPath + "/project/featured/icon");
    config.put("customProjectIcon", contextPath + "/project/custom/icon");
    config.put("mode", "author");

    if (projectService.canAuthorProject(project, ControllerUtil.getSignedInUser())) {
      config.put("saveProjectURL", contextPath + "/project/save/" + projectId);
      config.put("commitProjectURL", contextPath + "/project/commit/" + projectId);
    }

    User user = ControllerUtil.getSignedInUser();
    List<Run> runsOwnedByUser = runService.getRunListByOwner(user);
    Long runId = getRunId(projectId, runsOwnedByUser);
    if (runId != null) {
      config.put("runId", runId);
    }
    return config.toString();
  }

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
      String username = userDetails.getUsername();
      String firstName = userDetails.getFirstname();
      String lastName = userDetails.getLastname();

      JSONObject myUserInfo = new JSONObject();
      myUserInfo.put("id", user.getId());
      myUserInfo.put("username", username);
      myUserInfo.put("firstName", firstName);
      myUserInfo.put("lastName", lastName);
      JSONObject userInfo = new JSONObject();
      userInfo.put("myUserInfo", myUserInfo);
      config.put("userInfo", userInfo);

      List<Run> runsOwnedByUser = runService.getRunListByOwner(user);
      List<Project> allProjectsOwnedByUser = projectService.getProjectList(user);
      List<JSONObject> wise5ProjectsOwnedByUser = new ArrayList<JSONObject>();
      for (Project project : allProjectsOwnedByUser) {
        if (project.getWiseVersion().equals(5)) {
          JSONObject projectJSONObject = new JSONObject();
          projectJSONObject.put("id", project.getId());
          projectJSONObject.put("name", project.getName());
          String projectIdString = project.getId().toString();
          Long projectId = new Long(projectIdString);
          Long runId = this.getRunId(projectId, runsOwnedByUser);
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
      List<Run> sharedRuns = runService.getRunListBySharedOwner(user);
      List<JSONObject> wise5SharedProjects = new ArrayList<JSONObject>();
      for (Project project : sharedProjects) {
        if (project.getWiseVersion().equals(5)) {
          JSONObject projectJSONObject = new JSONObject();
          projectJSONObject.put("id", project.getId());
          projectJSONObject.put("name", project.getName());
          String projectIdString = project.getId().toString();
          Long projectId = new Long(projectIdString);
          Long runId = this.getRunId(projectId, sharedRuns);
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
      config.put("webSocketURL", ControllerUtil.getWebSocketURL(request, contextPath));
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
  @GetMapping("/project/commit/{projectId}")
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
    String curriculumBaseDir = appProperties.getProperty("curriculum_base_dir");
    String rawProjectUrl = project.getModulePath();
    String projectDirPath = curriculumBaseDir + rawProjectUrl;
    return projectDirPath.substring(0, projectDirPath.lastIndexOf("/"));
  }

  private String getProjectAssetsDirectoryPath(Project project) {
    String curriculumBaseDir = appProperties.getProperty("curriculum_base_dir");
    String rawProjectUrl = project.getModulePath();
    String projectURL = curriculumBaseDir + rawProjectUrl;
    String projectBaseDir = projectURL.substring(0, projectURL.indexOf("project.json"));
    return projectBaseDir + "/assets";
  }

  @GetMapping("/project/asset/{projectId}")
  protected void getProjectAssets(HttpServletResponse response, @PathVariable Long projectId)
      throws ObjectNotFoundException, JSONException, IOException {
    Project project = projectService.getById(projectId);
    User user = ControllerUtil.getSignedInUser();
    if (projectService.canAuthorProject(project, user)) {
      String projectAssetsDirPath = getProjectAssetsDirectoryPath(project);
      writeAssetsToResponse(response, projectAssetsDirPath);
    }
  }

  @GetMapping("/project/asset/{projectId}/download")
  protected void downloadProjectAsset(HttpServletResponse response, @PathVariable Long projectId,
      @RequestParam("assetFileName") String assetFileName)
      throws ObjectNotFoundException, IOException {
    Project project = projectService.getById(projectId);
    User user = ControllerUtil.getSignedInUser();
    if (projectService.canAuthorProject(project, user)) {
      String projectAssetsDirPath = getProjectAssetsDirectoryPath(project);
      File projectAssetFile = new File(projectAssetsDirPath + "/" + assetFileName);
      response.setContentType("application/octet-stream");
      response.setHeader("Content-Disposition", "attachment;filename=\"" + assetFileName + "\"");
      FileUtils.copyFile(projectAssetFile, response.getOutputStream());
    }
  }

  @PostMapping("/project/asset/{projectId}")
  protected void saveProjectAsset(@PathVariable Long projectId, HttpServletRequest request,
      String assetFileName, HttpServletResponse response) throws ServletException, IOException,
      ObjectNotFoundException, JSONException {
    Project project = projectService.getById(projectId);
    User user = ControllerUtil.getSignedInUser();
    if (projectService.canAuthorProject(project, user)) {
      String projectAssetsDirPath = getProjectAssetsDirectoryPath(project);
      File projectAssetsDir = new File(projectAssetsDirPath);

      if (assetFileName != null) {
        deleteExistingAsset(assetFileName, projectAssetsDir);
      } else {
        if (addNewAsset((StandardMultipartHttpServletRequest) request, response, project,
            user, projectAssetsDir)) {
          return;
        }
      }
      writeAssetsToResponse(response, projectAssetsDirPath);
    }
  }

  private void writeAssetsToResponse(HttpServletResponse response, String projectAssetsDirPath) throws JSONException, IOException {
    File projectAssetsDirectory = new File(projectAssetsDirPath);
    JSONObject projectAssetsJSONObject = getDirectoryJSONObject(projectAssetsDirectory);
    PrintWriter writer = response.getWriter();
    writer.write(projectAssetsJSONObject.toString());
    writer.close();
  }

  private boolean addNewAsset(StandardMultipartHttpServletRequest request, HttpServletResponse response,
      Project project, User user, File projectAssetsDir) throws IOException {
    Long projectMaxTotalAssetsSize = project.getMaxTotalAssetsSize();
    if (projectMaxTotalAssetsSize == null) {
      projectMaxTotalAssetsSize = new Long(appProperties.getProperty("project_max_total_assets_size", "15728640"));
    }
    long sizeOfAssetsDirectory = FileUtils.sizeOfDirectory(projectAssetsDir);

    StandardMultipartHttpServletRequest multiRequest = request;
    Map<String, MultipartFile> fileMap = multiRequest.getFileMap();
    if (fileMap != null && fileMap.size() > 0) {
      for (String key : fileMap.keySet()) {
        MultipartFile file = fileMap.get(key);
        if (sizeOfAssetsDirectory + file.getSize() > projectMaxTotalAssetsSize) {
          PrintWriter writer = response.getWriter();
          writer.write("Error: Exceeded project max asset size.\nPlease delete unused assets.\n\nContact WISE if your project needs more disk space.");
          writer.close();
          return true;
        } else if (!isUserAllowedToUpload(user, file)) {
          PrintWriter writer = response.getWriter();
          writer.write("Error: Upload file \"" + file.getOriginalFilename() + "\" not allowed.\n");
          writer.close();
          return true;
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
    return false;
  }

  private void deleteExistingAsset(String assetFileName, File projectAssetsDir) {
    File asset = new File(projectAssetsDir, assetFileName);
    if (asset.exists()) {
      asset.delete();
    }
  }

  /**
   * Returns true iff the logged-in user is allowed to post the specified file
   * @param user the user who is trying to upload
   * @param file file that the user is trying to upload
   */
  private boolean isUserAllowedToUpload(User user, MultipartFile file) {
    String allowedTypes = appProperties.getProperty("normalAuthorAllowedProjectAssetContentTypes");
    if (user.isTrustedAuthor()) {
      allowedTypes += "," + appProperties.getProperty("trustedAuthorAllowedProjectAssetContentTypes");
    }
    return allowedTypes.contains(file.getContentType());
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
  public static boolean hasAuthorPermissions(User user) {
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
   * @param runs list of runs to look in
   * @returns the run id that uses the project if the project is used in a run
   */
  private Long getRunId(Long projectId, List<Run> runs) {
    for (Run run : runs) {
      if (run.getProject().getId().equals(projectId)) {
        return run.getId();
      }
    }
    return null;
  }

  @PostMapping("/project/notifyAuthorBegin/{projectId}")
  private ModelAndView authorProjectBegin(@PathVariable String projectId) throws Exception {
    User user = ControllerUtil.getSignedInUser();
    Project project = projectService.getById(projectId);
    if (projectService.canAuthorProject(project, user)) {
      sessionService.addCurrentAuthor(project, user.getUserDetails());
      notifyCurrentAuthors(projectId);
      return null;
    } else {
      return new ModelAndView(new RedirectView("accessdenied.html"));
    }
  }

  @PostMapping("/project/notifyAuthorEnd/{projectId}")
  private ModelAndView authorProjectEnd(@PathVariable String projectId) throws Exception {
    User user = ControllerUtil.getSignedInUser();
    Project project = projectService.getById(projectId);
    if (projectService.canAuthorProject(project, user)) {
      sessionService.removeCurrentAuthor(project.getId(), user.getUserDetails());
      notifyCurrentAuthors(projectId);
      return null;
    } else {
      return new ModelAndView(new RedirectView("accessdenied.html"));
    }
  }

  public void notifyCurrentAuthors(String projectId) throws Exception {
    JSONObject message = new JSONObject();
    message.put("type", "currentAuthors");
    message.put("topic", String.format("/topic/current-authors/%s", projectId));
    message.put("currentAuthors", sessionService.getCurrentAuthors(projectId));
    redisPublisher.publish(message.toString());
  }

  /**
   * Import steps and copy assets if necessary
   * @param steps a string containing a JSONArray of steps
   * @param toProjectId the project id we are importing into
   * @param fromProjectId the project id we are importing from
   */
  @PostMapping("/project/importSteps/{projectId}")
  private ModelAndView importSteps(
      @RequestParam("steps") String steps,
      @RequestParam("toProjectId") Integer toProjectId,
      @RequestParam("fromProjectId") Integer fromProjectId,
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
    while (matcher.find()) {
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
    String curriculumBaseDir = appProperties.getProperty("curriculum_base_dir");

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

    // send back the steps string which may have been modified if we needed to change a file name
    response.getWriter().write(steps);
    return null;
  }
}
