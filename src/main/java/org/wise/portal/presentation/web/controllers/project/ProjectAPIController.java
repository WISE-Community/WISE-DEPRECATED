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
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.portal.PortalService;
import org.wise.portal.service.project.ProjectService;

import java.util.List;
import java.util.Properties;

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

  private JSONArray getProjectsJSON(List<Project> projectList) throws JSONException {
    JSONArray projectsJSON = new JSONArray();
    for (Project teacherSharedProject : projectList) {
      JSONObject projectJSON = new JSONObject();
      projectJSON.put("id", teacherSharedProject.getId());
      projectJSON.put("name", teacherSharedProject.getName());
      projectJSON.put("metadata", teacherSharedProject.getMetadata().toJSONObject());
      projectsJSON.put(projectJSON);
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
        String curriculumBaseWWW = wiseProperties.getProperty("curriculum_base_www");
        String projectThumb = "";
        String modulePath = project.getModulePath();
        int lastIndexOfSlash = modulePath.lastIndexOf("/");
        if (lastIndexOfSlash != -1) {
          /*
           * The project thumb url by default is the same (/assets/project_thumb.png)
           * for all projects, but this could be overwritten in the future
           * e.g. /253/assets/projectThumb.png
           */
          projectThumb = curriculumBaseWWW + modulePath.substring(0, lastIndexOfSlash) + PROJECT_THUMB_PATH;
        }
        projectLibraryGroup.put("projectThumb", projectThumb);
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
  }
}
