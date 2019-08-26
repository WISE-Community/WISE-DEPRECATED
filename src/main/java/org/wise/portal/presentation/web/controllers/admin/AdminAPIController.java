package org.wise.portal.presentation.web.controllers.admin;

import org.bouncycastle.cert.ocsp.Req;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.presentation.web.exception.IncorrectPasswordException;
import org.wise.portal.presentation.web.exception.NotAuthorizedException;
import org.wise.portal.presentation.web.response.SimpleResponse;
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
    @RequestParam("userId") Long userId,
    @RequestParam("runId") Long runId,
    @RequestParam("workgroupId") Long workgroupId,
    @RequestParam("teacherUsername") String teacherUsername
  ) {
    firstName = nullIfEmptyString(firstName);
    lastName = nullIfEmptyString(lastName);
    username = nullIfEmptyString(username);
    teacherUsername = nullIfEmptyString(teacherUsername);
    List<StudentUserDetails> studentUserDetails = userService.searchStudents(firstName, lastName, username, userId,
      runId, workgroupId, teacherUsername);

    JSONArray searchResults = new JSONArray();
    for (StudentUserDetails studentUserDetail: studentUserDetails) {
      searchResults.put(getStudentJSONObject(studentUserDetail));
    }
    return searchResults.toString();
  }

  private JSONObject getStudentJSONObject(StudentUserDetails studentUserDetails) {
    JSONObject studentJSON = new JSONObject();
    try {
      studentJSON.put("userId", studentUserDetails.getId());
      studentJSON.put("firstName", studentUserDetails.getFirstname());
      studentJSON.put("lastName", studentUserDetails.getLastname());
      studentJSON.put("username", studentUserDetails.getUsername());
    } catch (JSONException je) {
      // ignore the exception for now
    }
    return studentJSON;
  }

  @RequestMapping(value = "/search-teachers", method = RequestMethod.GET)
  protected String searchTeachers(
    @RequestParam("firstName") String firstName,
    @RequestParam("lastName") String lastName,
    @RequestParam("username") String username,
    @RequestParam("userId") Long userId,
    @RequestParam("displayName") String displayName,
    @RequestParam("city") String city,
    @RequestParam("state") String state,
    @RequestParam("country") String country,
    @RequestParam("schoolName") String schoolName,
    @RequestParam("schoolLevel") String schoolLevel,
    @RequestParam("curriculumSubjects") String curriculumSubjects,
    @RequestParam("email") String email,
    @RequestParam("runId") Long runId
  ) {
    firstName = nullIfEmptyString(firstName);
    lastName = nullIfEmptyString(lastName);
    username = nullIfEmptyString(username);
    displayName = nullIfEmptyString(displayName);
    city = nullIfEmptyString(city);
    state = nullIfEmptyString(state);
    country = nullIfEmptyString(country);
    schoolName = nullIfEmptyString(schoolName);
    schoolLevel = nullIfEmptyString(schoolLevel);
    curriculumSubjects = nullIfEmptyString(curriculumSubjects);
    email = nullIfEmptyString(email);
    List<TeacherUserDetails> teacherUserDetails = userService.searchTeachers(firstName, lastName, username, userId,
      displayName, city, state, country, schoolName, schoolLevel, curriculumSubjects, email, runId);
    JSONArray searchResults = new JSONArray();
    for (TeacherUserDetails teacherUserDetail: teacherUserDetails) {
      searchResults.put(getTeacherJSONObject(teacherUserDetail));
    }
    return searchResults.toString();
  }

  private JSONObject getTeacherJSONObject(TeacherUserDetails teacherUserDetails) {
    JSONObject teacherJSON = new JSONObject();
    try {
      teacherJSON.put("userId", teacherUserDetails.getId());
      teacherJSON.put("firstName", teacherUserDetails.getFirstname());
      teacherJSON.put("lastName", teacherUserDetails.getLastname());
      teacherJSON.put("username", teacherUserDetails.getUsername());
    } catch (JSONException je) {
      // ignore the exception for now
    }
    return teacherJSON;
  }

  private String nullIfEmptyString(String searchField) {
    if (searchField.equals("")) {
      return null;
    }
    return searchField;
  }

  @RequestMapping(value = "/change-user-password", method = RequestMethod.POST)
  protected SimpleResponse changeUserPassword(
    @RequestParam("username") String username,
    @RequestParam("adminPassword") String adminPassword,
    @RequestParam("newPassword") String newPassword) throws NotAuthorizedException {
    User signedInUser = ControllerUtil.getSignedInUser();
    if (signedInUser != null
        && signedInUser.getUserDetails().getUsername().equals("admin")
        && userService.isPasswordCorrect(signedInUser, adminPassword)) {
      User user = userService.retrieveUserByUsername(username);
      if (user != null) {
        if (isPasswordBlank(newPassword)) {
          return new SimpleResponse("message", "invalid password");
        }
        userService.updateUserPassword(user, newPassword);
        return new SimpleResponse("message", "success");
      } else {
        return new SimpleResponse("message", "username not found");
      }
    }
    return new SimpleResponse("message", "incorrect admin password");
  }

  private boolean isPasswordBlank(String password) {
    return password == null || password.equals("");
  }
}
