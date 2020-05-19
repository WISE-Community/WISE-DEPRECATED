package org.wise.portal.presentation.web.controllers.teacher;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.presentation.web.exception.TeacherAlreadySharedWithRunException;
import org.wise.portal.presentation.web.response.SharedOwner;
import org.wise.portal.presentation.web.response.SimpleResponse;
import org.wise.portal.service.run.RunService;

/**
 * REST API endpoints for Teacher Permissions
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
@RestController
@RequestMapping("/api/teacher/run/permission")
public class TeacherRunPermissionsAPIController {

  @Autowired
  private RunService runService;

  @RequestMapping(value = "/{runId}/{teacherUsername}", method = RequestMethod.PUT)
  protected SharedOwner addSharedOwner(@PathVariable Long runId,
      @PathVariable String teacherUsername) {
    try {
      return runService.addSharedTeacher(runId, teacherUsername);
    } catch (ObjectNotFoundException e) {
      return null;
    } catch (TeacherAlreadySharedWithRunException e) {
      return null;
    }
  }

  @PutMapping("/transfer/{runId}/{teacherUsername}")
  protected String transferRunOwnership(@PathVariable Long runId,
      @PathVariable String teacherUsername) {
    try {
      return runService.transferRunOwnership(runId, teacherUsername).toString();
    } catch (ObjectNotFoundException e) {
      return null;
    }
  }

  @RequestMapping(value = "/{runId}/{username}", method = RequestMethod.DELETE)
  protected SimpleResponse removeSharedOwner(@PathVariable Long runId,
      @PathVariable String username) {
    try {
      runService.removeSharedTeacher(username, runId);
      return new SimpleResponse("success", "successfully removed shared owner");
    } catch (ObjectNotFoundException e) {
      return new SimpleResponse("error", "user or run was not found");
    }
  }

  @RequestMapping(value = "/{runId}/{userId}/{permissionId}", method = RequestMethod.PUT)
  protected SimpleResponse addPermission(@PathVariable Long runId, @PathVariable Long userId,
      @PathVariable Integer permissionId) {
    try {
      runService.addSharedTeacherPermission(runId, userId, permissionId);
      return new SimpleResponse("success", "successfully added run permission");
    } catch (ObjectNotFoundException e) {
      return new SimpleResponse("error", "user or run was not found");
    }
  }

  @RequestMapping(value = "/{runId}/{userId}/{permissionId}", method = RequestMethod.DELETE)
  protected SimpleResponse deletePermission(@PathVariable Long runId, @PathVariable Long userId,
      @PathVariable Integer permissionId) {
    try {
      runService.removeSharedTeacherPermission(runId, userId, permissionId);
      return new SimpleResponse("success", "successfully removed run permission");
    } catch (ObjectNotFoundException e) {
      return new SimpleResponse("error", "user or run was not found");
    }
  }
}
