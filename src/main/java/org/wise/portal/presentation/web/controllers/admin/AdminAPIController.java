package org.wise.portal.presentation.web.controllers.admin;

import org.json.JSONArray;
import org.json.JSONException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.workgroup.WorkgroupService;

/**
 * Controller for Admin REST API
 *
 * @author Victor Korir
 */
@RestController
@RequestMapping(value = "/api/admin", produces = "application/json;charset=UTF-8")
public class AdminAPIController {

  @Autowired
  private UserService userService;

  @Autowired
  private UserDetailsService userDetailsService;

  @Autowired
  private RunService runService;

  @Autowired
  private WorkgroupService workgroupService;

  @RequestMapping(value = "/search-students", method = RequestMethod.GET)
  protected String searchStudents(
    @RequestParam("firstName") String firstName,
    @RequestParam("lastName") String lastName,
    @RequestParam("username") String username,
    @RequestParam("userId") String userId,
    @RequestParam("runId") String runId,
    @RequestParam("workgroupId") String workgroupId,
    @RequestParam("teacherUsername") String teacherUsername
  ) throws JSONException {
    JSONArray students = new JSONArray();
    try {
      if (!username.equals("")) {
        students.put(userService.retrieveUserByUsername(username));
      } else if (!userId.equals("")) {
        students.put(userService.retrieveById(Long.parseLong(userId)));
      }
    } catch (ObjectNotFoundException onf) {
      // ignore, returns an empty array
    }
    return students.toString();
  }
}
