package org.wise.portal.presentation.web.controllers.project;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.acls.model.Permission;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.portal.Portal;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.ProjectMetadata;
import org.wise.portal.domain.project.Tag;
import org.wise.portal.domain.project.impl.ProjectMetadataImpl;
import org.wise.portal.domain.project.impl.ProjectParameters;
import org.wise.portal.domain.project.impl.ProjectType;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.presentation.web.controllers.author.project.WISE5AuthorProjectController;
import org.wise.portal.service.portal.PortalService;
import org.wise.portal.service.project.ProjectService;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Properties;
import java.util.Set;
import java.util.TreeSet;

/**
 * Controller for Project REST API
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author Jonathan Lim-Breitbart
 */
@RestController
@RequestMapping("/site/api/project")
public class ProjectAPIController {

  @Autowired
  PortalService portalService;

  @Autowired
  ProjectService projectService;

  @Autowired
  private Properties wiseProperties;

  // path to project thumbnail image relative to project folder
  // TODO: make this dynamic, part of project metadata?
  private static final String PROJECT_THUMB_PATH = "/assets/project_thumb.png";

  @RequestMapping(value = "/library", method = RequestMethod.GET)
  protected String getLibraryProjects(ModelMap modelMap) {
    String projectLibraryGroups = "[]";
    try {
      Portal portal = portalService.getById(new Integer(1));
      projectLibraryGroups = portal.getProjectLibraryGroups();
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    }
    try {
      JSONArray projectLibraryGroupsJSON = new JSONArray(projectLibraryGroups);
      for (int g = 0; g < projectLibraryGroupsJSON.length(); g++) {
        JSONObject projectLibraryGroup = projectLibraryGroupsJSON.getJSONObject(g);
        populateProjectMetadata(projectLibraryGroup);
      }
      return projectLibraryGroupsJSON.toString();
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return projectLibraryGroups;
  }

  @RequestMapping(value = "/community", method = RequestMethod.GET)
  protected String getCommunityLibrayProjects(ModelMap modelMap) throws JSONException {
    List<Project> teacherSharedProjects = projectService.getTeacherSharedProjectList();
    JSONArray projectsJSON = getProjectsJSON(teacherSharedProjects);
    return projectsJSON.toString();
  }

  @RequestMapping(value = "/personal", method = RequestMethod.GET)
  protected String getPersonalLibrayProjects(ModelMap modelMap) throws JSONException {
    User signedInUser = ControllerUtil.getSignedInUser();
    List<Project> projectsWithoutRuns = projectService.getProjectsWithoutRuns(signedInUser);
    JSONArray projectsJSON = getProjectsJSON(projectsWithoutRuns);
    return projectsJSON.toString();
  }

  @RequestMapping(value = "/shared", method = RequestMethod.GET)
  protected String getSharedLibrayProjects(ModelMap modelMap) throws JSONException {
    User signedInUser = ControllerUtil.getSignedInUser();
    List<Project> sharedProjectList = projectService.getSharedProjectList(signedInUser);
    JSONArray projectsJSON = getProjectsJSON(sharedProjectList);
    return projectsJSON.toString();
  }

  @ResponseBody
  @RequestMapping(value = "/info/{projectId}", method = RequestMethod.GET)
  protected String getRun(@PathVariable Long projectId) throws ObjectNotFoundException,
      JSONException {
    Project project = projectService.getById(projectId);
    JSONObject projectJSON = ControllerUtil.getProjectJSON(project);
    return projectJSON.toString();
  }

  private JSONArray getProjectsJSON(List<Project> projectList) throws JSONException {
    JSONArray projectsJSON = new JSONArray();
    for (Project teacherSharedProject : projectList) {
      projectsJSON.put(ControllerUtil.getProjectJSON(teacherSharedProject));
    }
    return projectsJSON;
  }

  private void populateProjectMetadata(JSONObject projectLibraryGroup) throws JSONException {
    if (projectLibraryGroup.getString("type").equals("group")) {
      JSONArray children = projectLibraryGroup.getJSONArray("children");
      for (int c = 0; c < children.length(); c++) {
        populateProjectMetadata(children.getJSONObject(c));
      }
    } else if (projectLibraryGroup.getString("type").equals("project")) {
      Integer projectId = projectLibraryGroup.getInt("id");
      try {
        Project project = projectService.getById(projectId);
        ProjectMetadata metadata = project.getMetadata();
        projectLibraryGroup.put("metadata", metadata.toJSONObject());
        projectLibraryGroup.put("projectThumb", getProjectThumb(project));
        projectLibraryGroup.put("name", project.getName());
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
  }

  private String getProjectThumb(Project project) {
    String projectThumb = "";
    String modulePath = project.getModulePath();
    String curriculumBaseWWW = wiseProperties.getProperty("curriculum_base_www");
    int lastIndexOfSlash = modulePath.lastIndexOf("/");
    if (lastIndexOfSlash != -1) {
      /*
       * The project thumb url by default is the same (/assets/project_thumb.png)
       * for all projects, but this could be overwritten in the future
       * e.g. /253/assets/projectThumb.png
       */
      projectThumb = curriculumBaseWWW + modulePath.substring(0, lastIndexOfSlash) + PROJECT_THUMB_PATH;
    }
    return projectThumb;
  }

  /**
   * Handle user's request to register a new WISE5 project.
   * Registers the new project in DB and returns the new project ID
   * If the parentProjectId is specified, the user is requesting to copy that project
   */
  @RequestMapping(value = "/copy", method = RequestMethod.POST)
  protected String copyProject(HttpServletRequest request,
                             @RequestParam("projectId") String projectId) throws
      ObjectNotFoundException, IOException, JSONException {
    User user = ControllerUtil.getSignedInUser();
    if (!WISE5AuthorProjectController.hasAuthorPermissions(user)) {
      return "";
    }
    Project parentProject = projectService.getById(Long.parseLong(projectId));
    Set<String> tagNames = new TreeSet<String>();
    tagNames.add("library");
    if (parentProject != null &&
        (this.projectService.canReadProject(parentProject, user) ||
          parentProject.isOfficialProject() ||
          parentProject.isCommunityProject())) {
      String curriculumBaseDir = wiseProperties.getProperty("curriculum_base_dir");
      String parentProjectJSONAbsolutePath = curriculumBaseDir + parentProject.getModulePath();
      File parentProjectJSONFile = new File(parentProjectJSONAbsolutePath);
      File parentProjectDir = parentProjectJSONFile.getParentFile();

      String newProjectDirectoryPath = WISE5AuthorProjectController.copyProjectDirectory(parentProjectDir);
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
      return ControllerUtil.getProjectJSON(project).toString();
    }
    return "";
  }
}
