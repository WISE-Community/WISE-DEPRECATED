package org.wise.portal.presentation.web.controllers.teacher;

import org.json.JSONException;
import org.json.JSONObject;
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
@RequestMapping("/site/api/teacher/permission")
public class TeacherPermissionsAPIController {

  @Autowired
  private RunService runService;

  @ResponseBody
  @RequestMapping(value = "/{runId}/{teacherUsername}", method = RequestMethod.PUT)
  protected SharedOwner addSharedOwner(@PathVariable Long runId,
      @PathVariable String teacherUsername) throws JSONException {
    try {
      return runService.addSharedTeacherToRun(runId, teacherUsername);
    } catch (ObjectNotFoundException e) {
      return null;
    } catch (TeacherAlreadySharedWithRunException e2) {
      return null;
    }
  }

  @ResponseBody
  @RequestMapping(value = "/{runId}/{username}", method = RequestMethod.DELETE)
  protected SimpleResponse removeSharedOwner(@PathVariable Long runId, @PathVariable String username)
      throws JSONException {
    try {
      runService.removeSharedTeacherFromRun(username, runId);
      return new SimpleResponse("success", "successfully removed shared owner");
    } catch (ObjectNotFoundException e) {
      return new SimpleResponse("error", "user or run was not found");
    }
  }

  @ResponseBody
  @RequestMapping(value = "/{runId}/{userId}/{permissionId}", method = RequestMethod.PUT)
  protected SimpleResponse addNewPermission(@PathVariable Long runId,
      @PathVariable Long userId, @PathVariable Integer permissionId) throws JSONException {
    try {
      runService.addSharedTeacherPermissionForRun(runId, userId, permissionId);
      return new SimpleResponse("success", "successfully added new permission");
    } catch (ObjectNotFoundException e) {
      return new SimpleResponse("error", "user or run was not found");
    }
  }

  @ResponseBody
  @RequestMapping(value = "/{runId}/{userId}/{permissionId}", method = RequestMethod.DELETE)
  protected SimpleResponse deletePermission(@PathVariable Long runId,
      @PathVariable Long userId, @PathVariable Integer permissionId) {
    try {
      runService.removeSharedTeacherPermissionFromRun(runId, userId, permissionId);
      return new SimpleResponse("success", "successfully removed permission");
    } catch (ObjectNotFoundException e) {
      return new SimpleResponse("error", "user or run was not found");
    }
  }
}
