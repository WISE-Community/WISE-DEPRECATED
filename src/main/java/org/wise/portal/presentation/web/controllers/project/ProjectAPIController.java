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
import org.wise.portal.service.portal.PortalService;
import org.wise.portal.service.project.ProjectService;

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
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
  }
}
