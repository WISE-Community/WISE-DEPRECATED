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
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;
import java.util.Random;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
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
import org.wise.portal.presentation.web.response.ErrorResponse;
import org.wise.portal.presentation.web.response.SimpleResponse;
import org.wise.portal.presentation.web.response.SuccessResponse;
import org.wise.portal.service.portal.PortalService;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.session.SessionService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.spring.data.redis.MessagePublisher;
import org.wise.vle.utils.FileManager;

/**
 * Author API endpoint
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
@Controller
@RequestMapping("/author")
@Secured({ "ROLE_AUTHOR" })
public class AuthorAPIController {

  @Autowired
  protected PortalService portalService;

  @Autowired
  protected UserService userService;

  @Autowired
  protected ProjectService projectService;

  @Autowired
  protected RunService runService;

  @Autowired
  protected SessionService sessionService;

  @Autowired
  protected Properties appProperties;

  @Autowired
  protected ServletContext servletContext;

  @Autowired
  private MessagePublisher redisPublisher;

  private String featuredProjectIconsFolderRelativePath = "wise5/authoringTool/projectIcons";

  @GetMapping
  String authorProject() {
    return "forward:/wise5/authoringTool/dist/index.html";
  }

  @RequestMapping("/authorproject.html")
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

    String projectIdStr = request.getParameter("projectId");
    Project project;
    if (projectIdStr != null && !projectIdStr.equals("") && !projectIdStr.equals("none")) {
      project = projectService.getById(Long.parseLong(projectIdStr));
      if (project.getWiseVersion().equals(5)) {
        ModelAndView wise5AuthoringView = new ModelAndView(
            new RedirectView("../teacher/edit/unit/" + projectIdStr));
        return wise5AuthoringView;
      } else if (project.getWiseVersion().equals(4)) {
        ModelAndView wise4AuthoringView = new ModelAndView(
            new RedirectView("/legacy/author/authorproject.html?projectId=" + projectIdStr));
        return wise4AuthoringView;
      }
    }
    return null;
  }

  @PostMapping("/project/new")
  @ResponseBody
  protected String createProject(Authentication auth, @RequestBody ObjectNode objectNode)
      throws ObjectNotFoundException, IOException, JSONException {
    User user = userService.retrieveUserByUsername(auth.getName());
    long newProjectId = projectService.getNextAvailableProjectId();
    String projectName = objectNode.get("projectName").asText();
    String projectJSONString = objectNode.get("projectJSONString").asText();

    ProjectParameters pParams = new ProjectParameters();
    pParams.setProjectId(newProjectId);
    pParams.setModulePath("/" + newProjectId + "/project.json");
    pParams.setOwner(user);
    pParams.setProjectname(projectName);
    pParams.setProjectType(ProjectType.LD);
    pParams.setWiseVersion(new Integer(5));

    ProjectMetadata metadata = new ProjectMetadataImpl();
    metadata.setTitle(projectName);
    pParams.setMetadata(metadata);
    Project project = projectService.createProject(pParams);
    createNewProjectDirectory(String.valueOf(newProjectId));
    projectService.saveProjectContentToDisk(projectJSONString, project);
    projectService.writeProjectLicenseFile(project);
    return String.valueOf(newProjectId);
  }

  @GetMapping("/project/featured/icons")
  @ResponseBody
  protected List<String> getFeaturedProjectIcons() {
    File featuredProjectIconsDir = new File(getFeaturedProjectIconsFolderPathString());
    List<String> featuredProjectIconPaths = new ArrayList<String>();
    for (File icon : featuredProjectIconsDir.listFiles()) {
      featuredProjectIconPaths.add(icon.getName());
    }
    return featuredProjectIconPaths;
  }

  @PostMapping("/project/icon")
  @ResponseBody
  protected HashMap<String, String> setProjectIcon(Authentication auth,
      @RequestBody ObjectNode objectNode) throws ObjectNotFoundException, IOException {
    Long projectId = objectNode.get("projectId").asLong();
    String projectIcon = objectNode.get("projectIcon").asText();
    boolean isCustom = objectNode.get("isCustom").asBoolean();
    User user = userService.retrieveUserByUsername(auth.getName());
    Project project = projectService.getById(projectId);
    HashMap<String, String> response = new HashMap<String, String>();
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
      response.put("projectIcon", projectIcon);
    }
    return response;
  }

  @PostMapping("/project/copy/{projectId}")
  @ResponseBody
  protected Project copyProject(Authentication auth, @PathVariable Long projectId)
      throws Exception {
    User user = userService.retrieveUserByUsername(auth.getName());
    Project projectToCopy = projectService.getById(projectId);
    if (projectService.canReadProject(projectToCopy, user)) {
      return projectService.copyProject(projectId, user);
    }
    return null;
  }

  @PostMapping("/project/save/{projectId}")
  @ResponseBody
  protected SimpleResponse saveProject(Authentication auth, @PathVariable Long projectId,
      @RequestBody String projectJSONString) throws JSONException, ObjectNotFoundException {
    Project project = projectService.getById(projectId);
    User user = userService.retrieveUserByUsername(auth.getName());
    if (projectService.canAuthorProject(project, user)) {
      try {
        projectService.saveProjectContentToDisk(projectJSONString, project);
        projectService.updateMetadataAndLicenseIfNecessary(project, projectJSONString);
        projectService.saveProjectToDatabase(project, user, projectJSONString);
        return new SuccessResponse("projectSaved");
      } catch (Exception e) {
        return new ErrorResponse("errorSavingProject");
      }
    } else {
      return new ErrorResponse("notAllowedToEditThisProject");
    }
  }

  @GetMapping("/config")
  @ResponseBody
  @SuppressWarnings("unchecked")
  protected HashMap<String, Object> getDefaultAuthorProjectConfig(Authentication auth,
      HttpServletRequest request)
      throws ObjectNotFoundException, JsonMappingException, JsonProcessingException {
    HashMap<String, Object> config = new HashMap<String, Object>();
    User user = userService.retrieveUserByUsername(auth.getName());
    String contextPath = request.getContextPath();
    config.put("contextPath", contextPath);
    config.put("userType", "teacher");
    config.put("copyProjectURL", contextPath + "/author/project/copy");
    config.put("mainHomePageURL", contextPath);
    config.put("renewSessionURL", contextPath + "/session/renew");
    config.put("sessionLogOutURL", contextPath + "/logout");
    config.put("registerNewProjectURL", contextPath + "/author/project/new");
    config.put("wiseBaseURL", contextPath);
    config.put("notifyAuthoringBeginEndURL", contextPath + "/author/project/notify");
    config.put("getLibraryProjectsURL", contextPath + "/api/project/library");
    config.put("teacherDataURL", contextPath + "/teacher/data");
    config.put("sessionTimeout", request.getSession().getMaxInactiveInterval());

    Portal portal = portalService.getById(new Integer(1));
    String projectMetadataSettings = portal.getProjectMetadataSettings();
    if (projectMetadataSettings == null) {
      projectMetadataSettings = portalService.getDefaultProjectMetadataSettings();
    }
    config.put("projectMetadataSettings", projectMetadataSettings);
    String structures = portal.getStructures();
    if (structures != null) {
      ObjectMapper mapper = new ObjectMapper();
      Map<String, Integer> map = mapper.readValue(structures, Map.class);
      config.put("automatedAssessmentProjectId", map.get("automatedAssessmentProjectId"));
    }

    MutableUserDetails userDetails = user.getUserDetails();
    String username = userDetails.getUsername();
    String firstName = userDetails.getFirstname();
    String lastName = userDetails.getLastname();

    HashMap<String, Object> myUserInfo = new HashMap<String, Object>();
    myUserInfo.put("id", user.getId());
    myUserInfo.put("username", username);
    myUserInfo.put("firstName", firstName);
    myUserInfo.put("lastName", lastName);
    HashMap<String, Object> userInfo = new HashMap<String, Object>();
    userInfo.put("myUserInfo", myUserInfo);
    config.put("userInfo", userInfo);

    List<Run> runsOwnedByUser = runService.getRunListByOwner(user);
    List<Project> allProjectsOwnedByUser = projectService.getProjectList(user);
    List<HashMap<String, Object>> projectsOwnedByUser = new ArrayList<HashMap<String, Object>>();
    for (Project project : allProjectsOwnedByUser) {
      if (project.getWiseVersion().equals(5)) {
        HashMap<String, Object> projectMap = new HashMap<String, Object>();
        projectMap.put("id", project.getId());
        projectMap.put("name", project.getName());
        String projectIdString = project.getId().toString();
        Long projectId = new Long(projectIdString);
        Run run = getRun(projectId, runsOwnedByUser);
        if (run != null) {
          projectMap.put("runId", run.getId());
        }
        if (project.isDeleted()) {
          projectMap.put("isDeleted", true);
        }
        projectsOwnedByUser.add(projectMap);
      }
    }
    config.put("projects", projectsOwnedByUser);

    List<Project> sharedProjects = projectService.getSharedProjectList(user);
    List<Run> sharedRuns = runService.getRunListBySharedOwner(user);
    List<HashMap<String, Object>> wise5SharedProjects = new ArrayList<HashMap<String, Object>>();
    for (Project project : sharedProjects) {
      if (project.getWiseVersion().equals(5)) {
        HashMap<String, Object> projectMap = new HashMap<String, Object>();
        projectMap.put("id", project.getId());
        projectMap.put("name", project.getName());
        String projectIdString = project.getId().toString();
        Long projectId = new Long(projectIdString);
        Run run = getRun(projectId, sharedRuns);
        if (run != null) {
          projectMap.put("runId", run.getId());
        }
        if (projectService.canAuthorProject(project, user)) {
          projectMap.put("canEdit", true);
        }
        if (project.isDeleted()) {
          projectMap.put("isDeleted", true);
        }
        wise5SharedProjects.add(projectMap);
      }
    }
    config.put("sharedProjects", wise5SharedProjects);

    Locale locale = request.getLocale();
    String userLanguage = user.getUserDetails().getLanguage();
    if (userLanguage.contains("_")) {
      String language = userLanguage.substring(0, userLanguage.indexOf("_"));
      String country = userLanguage.substring(userLanguage.indexOf("_") + 1);
      locale = new Locale(language, country);
    } else {
      locale = new Locale(userLanguage);
    }
    config.put("locale", locale);
    config.put("webSocketURL", ControllerUtil.getWebSocketURL(request, contextPath));
    return config;
  }

  @GetMapping("/config/{projectId}")
  @ResponseBody
  protected HashMap<String, Object> getAuthorProjectConfig(Authentication auth,
      HttpServletRequest request, @PathVariable Long projectId)
      throws IOException, ObjectNotFoundException {
    Project project = projectService.getById(projectId);
    HashMap<String, Object> config = getDefaultAuthorProjectConfig(auth, request);
    String contextPath = request.getContextPath();
    String curriculumBaseWWW = appProperties.getProperty("curriculum_base_www");
    String rawProjectUrl = project.getModulePath();
    String projectURL = curriculumBaseWWW + rawProjectUrl;
    String projectBaseURL = projectURL.substring(0, projectURL.indexOf("project.json"));
    Long projectAssetTotalSizeMax = project.getMaxTotalAssetsSize();
    if (projectAssetTotalSizeMax == null) {
      projectAssetTotalSizeMax = new Long(
          appProperties.getProperty("project_max_total_assets_size", "15728640"));
    }

    config.put("projectId", projectId);
    config.put("projectURL", projectURL);
    config.put("projectAssetTotalSizeMax", projectAssetTotalSizeMax);
    config.put("projectAssetURL", contextPath + "/author/project/asset/" + projectId);
    config.put("projectBaseURL", projectBaseURL);
    config.put("previewProjectURL", contextPath + "/preview/unit/" + projectId);
    config.put("cRaterRequestURL", contextPath + "/c-rater");
    config.put("importStepsURL", contextPath + "/author/project/importSteps/" + projectId);
    config.put("featuredProjectIconsURL", contextPath + "/author/project/featured/icons");
    config.put("projectIconURL", contextPath + "/author/project/icon");
    config.put("mode", "author");

    User user = userService.retrieveUserByUsername(auth.getName());
    boolean canEditProject = projectService.canAuthorProject(project, user);
    config.put("canEditProject", canEditProject);
    if (canEditProject) {
      config.put("saveProjectURL", contextPath + "/author/project/save/" + projectId);
      config.put("commitProjectURL", contextPath + "/project/commit/" + projectId);
    }
    List<Run> projectRuns = runService.getProjectRuns(projectId);
    if (projectRuns.size() > 0) {
      Run projectRun = projectRuns.get(0);
      config.put("canGradeStudentWork", runService.isAllowedToGradeStudentWork(projectRun, user));
      config.put("runId", projectRun.getId());
      config.put("runCode", projectRun.getRuncode());
    }
    return config;
  }

  /**
   * Get the run that uses the project id
   *
   * @param projectId
   *                    the project id
   * @param runs
   *                    list of runs to look in
   * @returns the run that uses the project if the project is used in a run
   */
  private Run getRun(Long projectId, List<Run> runs) {
    for (Run run : runs) {
      if (run.getProject().getId().equals(projectId)) {
        return run;
      }
    }
    return null;
  }

  @PostMapping("/project/notify/{projectId}/{isBegin}")
  @ResponseBody
  protected void notifyAuthorBeginEnd(Authentication auth, @PathVariable Long projectId,
      @PathVariable boolean isBegin) throws Exception {
    User user = userService.retrieveUserByUsername(auth.getName());
    Project project = projectService.getById(projectId);
    if (projectService.canAuthorProject(project, user)) {
      if (isBegin) {
        sessionService.addCurrentAuthor(projectId, auth.getName());
      } else {
        sessionService.removeCurrentAuthor(projectId, auth.getName());
      }
      notifyCurrentAuthors(projectId);
    }
  }

  private void notifyCurrentAuthors(Long projectId) throws JSONException {
    JSONObject message = new JSONObject();
    message.put("type", "currentAuthors");
    message.put("topic", String.format("/topic/current-authors/%s", projectId));
    message.put("currentAuthors", sessionService.getCurrentAuthors(projectId));
    redisPublisher.publish(message.toString());
  }

  /**
   * Import steps and copy assets if necessary
   *
   * @param steps
   *                        a string containing a JSONArray of steps
   * @param toProjectId
   *                        the project id we are importing into
   * @param fromProjectId
   *                        the project id we are importing from
   */
  @PostMapping("/project/importSteps/{projectId}")
  @ResponseBody
  protected String importSteps(Authentication auth, @RequestBody ObjectNode objectNode)
      throws Exception {
    String steps = objectNode.get("steps").asText();
    Integer toProjectId = objectNode.get("toProjectId").asInt();
    Integer fromProjectId = objectNode.get("fromProjectId").asInt();
    User user = userService.retrieveUserByUsername(auth.getName());
    Project project = projectService.getById(toProjectId);
    if (!projectService.canAuthorProject(project, user)) {
      return null;
    }

    /*
     * Regex string to match asset file references in the step/component content. e.g. carbon.png
     */
    String patternString = "(\'|\"|\\\\\'|\\\\\")([^:][^/]?[^/]?[a-zA-Z0-9@\\._\\/\\s\\-]*[.]"
        + "(png|PNG|jpe?g|JPE?G|pdf|PDF|gif|GIF|mov|MOV|mp4|MP4|mp3|MP3|wav|WAV|swf|SWF|css|CSS"
        + "|txt|TXT|json|JSON|xlsx?|XLSX?|doc|DOC|html.*?|HTML.*?|js|JS)).*?(\'|\"|\\\\\'|\\\\\")";
    Pattern pattern = Pattern.compile(patternString);
    Matcher matcher = pattern.matcher(steps);

    /*
     * this list will hold all the file names that are referenced by the steps that we are importing
     */
    List<String> fileNames = new ArrayList<String>();
    while (matcher.find()) {
      fileNames.add(matcher.group(2));
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

    String fullFromProjectFolderUrl = curriculumBaseDir
        + fromProjectUrl.substring(0, fromProjectUrlLastIndexOfSlash);

    // get the index of the last separator from the toProjectUrl
    int toProjectUrlLastIndexOfSlash = toProjectUrl.lastIndexOf("/");
    if (toProjectUrlLastIndexOfSlash == -1) {
      toProjectUrlLastIndexOfSlash = toProjectUrl.lastIndexOf("\\");
    }

    String fullToProjectFolderUrl = curriculumBaseDir
        + toProjectUrl.substring(0, toProjectUrlLastIndexOfSlash);

    String fromProjectAssetsUrl = fullFromProjectFolderUrl + "/assets";
    File fromProjectAssetsFolder = new File(fromProjectAssetsUrl);

    String toProjectAssetsUrl = fullToProjectFolderUrl + "/assets";
    File toProjectAssetsFolder = new File(toProjectAssetsUrl);

    for (String fileName : fileNames) {
      /*
       * Import the asset to the project we are importing to. If the project already contains a file
       * with the same file name and does not have the same file content, it will be given a new
       * file name. The file name that is used will be returned by importAssetInContent().
       */
      String newFileName = FileManager.importAssetInContent(fileName, null, fromProjectAssetsFolder,
          toProjectAssetsFolder);

      if (newFileName != null && !fileName.equals(newFileName)) {
        // the file name was changed so we need to update the step content by replacing
        // all instances of the file name with the new file name
        steps = steps.replaceAll(fileName, newFileName);
      }
    }

    // send back the steps string which may have been modified if we needed to change a file name
    return steps;
  }

  private void createNewProjectDirectory(String projectId) throws IOException {
    File projectDir = new File(appProperties.getProperty("curriculum_base_dir"), projectId);
    projectDir.mkdir();
    new File(projectDir, "project.json").createNewFile();
    File projectAssetsDir = new File(projectDir, "assets");
    projectAssetsDir.mkdir();
    copyRandomFeaturedProjectIconIntoAssetsFolder(projectAssetsDir);
  }

  private void copyRandomFeaturedProjectIconIntoAssetsFolder(File folder) throws IOException {
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

  private String getFeaturedProjectIconsFolderPathString() {
    return servletContext.getRealPath(File.separator) + featuredProjectIconsFolderRelativePath;
  }

  private Path getFeaturedProjectIconPath(String fileName) {
    return Paths.get(getFeaturedProjectIconsFolderPathString() + "/" + fileName);
  }
}
