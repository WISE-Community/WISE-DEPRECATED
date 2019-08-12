package org.wise.portal.presentation.web.controllers.admin;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.user.UserService;
import java.util.List;

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

  @RequestMapping(value = "/search-students", method = RequestMethod.GET)
  protected String searchStudents(
    @RequestParam("firstName") String firstName,
    @RequestParam("lastName") String lastName,
    @RequestParam("username") String username,
    @RequestParam("userId") String userIdString,
    @RequestParam("runId") String runIdString,
    @RequestParam("workgroupId") String workgroupIdString,
    @RequestParam("teacherUsername") String teacherUsername
  ) {
    firstName = checkAndNullStringSearchField(firstName);
    lastName = checkAndNullStringSearchField(lastName);
    username = checkAndNullStringSearchField(username);
    teacherUsername = checkAndNullStringSearchField(teacherUsername);
    Long userId, runId, workgroupId;
    userId = checkAndNullLongSearchField(userIdString);
    runId = checkAndNullLongSearchField(runIdString);
    workgroupId = checkAndNullLongSearchField(workgroupIdString);
    List<StudentUserDetails> students = userService.searchStudents(firstName, lastName, username, userId, runId,
      workgroupId, teacherUsername);

    JSONArray searchResults = new JSONArray();
    for (StudentUserDetails student: students) {
      searchResults.put(studentToJSONObject(student));
    }
    return searchResults.toString();
  }

  private String checkAndNullStringSearchField(String searchField) {
    if (searchField.equals("")) {
      return null;
    }
    return searchField;
  }

  private Long checkAndNullLongSearchField(String searchField) {
    if (searchField.equals("")) {
      return null;
    }
    return Long.parseLong(searchField);
  }

  private JSONObject studentToJSONObject(StudentUserDetails student) {
    JSONObject studentObject = new JSONObject();
    try {
      studentObject.put("userId", student.getId());
      studentObject.put("firstName", student.getFirstname());
      studentObject.put("lastName", student.getLastname());
      studentObject.put("username", student.getUsername());
    } catch (JSONException je) {
      // ignore the exception for now
    }
    return studentObject;
  }
}
