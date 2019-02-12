package org.wise.portal.presentation.web.controllers.project;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.portal.Portal;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.ProjectMetadata;
import org.wise.portal.domain.project.impl.ProjectMetadataImpl;
import org.wise.portal.domain.project.impl.ProjectParameters;
import org.wise.portal.domain.project.impl.ProjectType;
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

/**
 * Project REST API
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author Jonathan Lim-Breitbart
 */
@RestController
@RequestMapping(value = "/api/project", produces = "application/json;charset=UTF-8")
public class ProjectAPIController {

  @Autowired
  PortalService portalService;

  @Autowired
  ProjectService projectService;

  @Autowired
  private Properties wiseProperties;

  private static final String PROJECT_THUMB_PATH = "/assets/project_thumb.png";

  @RequestMapping(value = "/library", method = RequestMethod.GET)
  protected String getLibraryProjects(ModelMap modelMap) throws ObjectNotFoundException,
      JSONException {
    Portal portal = portalService.getById(new Integer(1));
    String projectLibraryGroups = portal.getProjectLibraryGroups();
    JSONArray projectLibraryGroupsJSON = new JSONArray(projectLibraryGroups);
    for (int g = 0; g < projectLibraryGroupsJSON.length(); g++) {
      JSONObject projectLibraryGroup = projectLibraryGroupsJSON.getJSONObject(g);
      if (canAccess(projectLibraryGroup)) {
        populateProjectMetadata(projectLibraryGroup);
      } else {
        projectLibraryGroupsJSON.remove(g--);
      }
    }
    return projectLibraryGroupsJSON.toString();
  }

  private boolean canAccess(JSONObject projectLibraryGroup) throws JSONException {
    if (!projectLibraryGroup.has("accessRoles")) {
      return true;
    }
    User signedInUser = ControllerUtil.getSignedInUser();
    if (signedInUser == null) {
      return false;
    } else {
      JSONArray accessRoles = projectLibraryGroup.getJSONArray("accessRoles");
      for (int a = 0; a < accessRoles.length(); a++) {
        String accessRole = accessRoles.getString(a);
        if (accessRole.equals("admin") && signedInUser.isAdmin()) {
          return true;
        } else if (accessRole.equals("researcher") && signedInUser.isResearcher()) {
          return true;
        } else if (accessRole.equals("teacher") && signedInUser.isTeacher()) {
          return true;
        }
      }
      return false;
    }
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

  @RequestMapping(value = "/info/{projectId}", method = RequestMethod.GET)
  protected String getProjectInfo(@PathVariable Long projectId) throws ObjectNotFoundException,
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
        JSONObject child = children.getJSONObject(c);
        if (canAccess(child)) {
          populateProjectMetadata(child);
        } else {
          children.remove(c--);
        }
      }
    } else if (projectLibraryGroup.getString("type").equals("project")) {
      Integer projectId = projectLibraryGroup.getInt("id");
      try {
        Project project = projectService.getById(projectId);
        ProjectMetadata metadata = project.getMetadata();
        projectLibraryGroup.put("metadata", metadata.toJSONObject());
        projectLibraryGroup.put("projectThumb", getProjectThumb(project));
        projectLibraryGroup.put("name", project.getName());
        projectLibraryGroup.put("owner", ControllerUtil.getOwnerJSON(project.getOwner()));
        projectLibraryGroup.put("sharedOwners", ControllerUtil.getProjectSharedOwnersJSON(project));
        projectLibraryGroup.put("dateCreated", project.getDateCreated());
        projectLibraryGroup.put("wiseVersion", project.getWiseVersion());
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

  @RequestMapping(value = "/copy", method = RequestMethod.POST)
  protected String copyProject(HttpServletRequest request,
      @RequestParam("projectId") String projectId) throws Exception {
    User user = ControllerUtil.getSignedInUser();
    if (!WISE5AuthorProjectController.hasAuthorPermissions(user)) {
      return "";
    }
    Project parentProject = projectService.getById(Long.parseLong(projectId));
    if (parentProject != null && (this.projectService.canReadProject(parentProject, user) ||
          parentProject.isOfficialProject() ||
          parentProject.isCommunityProject())) {
      Project project = projectService.copyProject(Integer.parseInt(projectId), user);
      return ControllerUtil.getProjectJSON(project).toString();
    }
    return "";
  }
}
