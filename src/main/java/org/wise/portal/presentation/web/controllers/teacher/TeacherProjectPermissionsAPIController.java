package org.wise.portal.presentation.web.controllers.teacher;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.presentation.web.exception.TeacherAlreadySharedWithProjectException;
import org.wise.portal.presentation.web.response.SharedOwner;
import org.wise.portal.presentation.web.response.SimpleResponse;
import org.wise.portal.service.project.ProjectService;

/**
 * REST API endpoints for Teacher Permissions
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
@RestController
@RequestMapping("/api/teacher/project/permission")
public class TeacherProjectPermissionsAPIController {

  @Autowired
  private ProjectService projectService;

  @RequestMapping(value = "/{projectId}/{username}", method = RequestMethod.PUT)
  protected SharedOwner addSharedOwner(@PathVariable Long projectId,
                                       @PathVariable String username) {
    try {
      return projectService.addSharedTeacher(projectId, username);
    } catch (ObjectNotFoundException e) {
      return null;
    } catch (TeacherAlreadySharedWithProjectException e2) {
      return null;
    }
  }

  @RequestMapping(value = "/{projectId}/{username}", method = RequestMethod.DELETE)
  protected SimpleResponse removeSharedOwner(@PathVariable Long projectId,
                                             @PathVariable String username) {
    try {
      projectService.removeSharedTeacher(projectId, username);
      return new SimpleResponse("success", "successfully removed project shared owner");
    } catch (ObjectNotFoundException e) {
      return new SimpleResponse("error", "user or project was not found");
    }
  }

  @RequestMapping(value = "/{projectId}/{userId}/{permissionId}", method = RequestMethod.PUT)
  protected SimpleResponse addPermission(@PathVariable Long projectId,
                                         @PathVariable Long userId,
                                         @PathVariable Integer permissionId) {
    try {
      projectService.addSharedTeacherPermission(projectId, userId, permissionId);
      return new SimpleResponse("success", "successfully added project permission");
    } catch (ObjectNotFoundException e) {
      return new SimpleResponse("error", "user or project was not found");
    }
  }

  @RequestMapping(value = "/{projectId}/{userId}/{permissionId}", method = RequestMethod.DELETE)
  protected SimpleResponse deletePermission(@PathVariable Long projectId,
                                            @PathVariable Long userId,
                                            @PathVariable Integer permissionId) {
    try {
      projectService.removeSharedTeacherPermission(projectId, userId, permissionId);
      return new SimpleResponse("success", "successfully removed project permission");
    } catch (ObjectNotFoundException e) {
      return new SimpleResponse("error", "user or project was not found");
    }
  }
}
