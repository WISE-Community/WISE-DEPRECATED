package org.wise.portal.presentation.web.controllers.student;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.wise.portal.domain.AccountQuestion;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.user.UserService;

import java.util.List;
import java.util.Properties;

@RestController
@RequestMapping(value = "/api/student/forgot", produces = "application/json;charset=UTF-8")
public class StudentForgotAccountAPIController {

  @Autowired
  private UserService userService;

  @Autowired
  private Properties i18nProperties;

  @RequestMapping(value = "/username/search", method = RequestMethod.GET)
  protected String getStudentUsernames(@RequestParam("firstName") String firstName,
                                       @RequestParam("lastName") String lastName,
                                       @RequestParam("birthMonth") Integer birthMonth,
                                       @RequestParam("birthDay") Integer birthDay) {
    String[] fields = new String[4];
    fields[0] = "firstname";
    fields[1] = "lastname";
    fields[2] = "birthmonth";
    fields[3] = "birthday";

    String[] values = new String[4];
    values[0] = firstName;
    values[1] = lastName;
    values[2] = birthMonth.toString();
    values[3] = birthDay.toString();

    String classVar = "studentUserDetails";
    List<User> accountsThatMatch = userService.retrieveByFields(fields, values, classVar);
    return getUsernamesJSON(accountsThatMatch).toString();
  }

  private JSONArray getUsernamesJSON(List<User> users) {
    JSONArray usernamesJSON = new JSONArray();
    for (User user: users) {
      MutableUserDetails userDetails = user.getUserDetails();
      usernamesJSON.put(userDetails.getUsername());
    }
    return usernamesJSON;
  }

  @RequestMapping(value = "/password/security-question", method = RequestMethod.GET)
  protected String getSecurityQuestion(@RequestParam("username") String username) throws JSONException {
    User user = userService.retrieveUserByUsername(username);
    JSONObject response = new JSONObject();
    if (user != null && user.isStudent()) {
      String accountQuestionKey = getAccountQuestionKey(user);
      String accountQuestionValue = getAccountQuestionValue(accountQuestionKey);
      response.put("question", accountQuestionValue);
      response.put("questionKey", accountQuestionKey);
      response.put("status", "success");
      response.put("messageCode", "usernameFound");
    } else {
      response.put("status", "failure");
      response.put("messageCode", "usernameNotFound");
    }
    return response.toString();
  }

  @RequestMapping(value = "/password/security-question", method = RequestMethod.POST)
  protected String checkSecurityAnswer(@RequestParam("username") String username,
                                       @RequestParam("answer") String answer) throws JSONException {
    User user = userService.retrieveUserByUsername(username);
    JSONObject response = new JSONObject();
    if (user != null) {
      if (isAnswerCorrect(user, answer)) {
        response.put("status", "success");
        response.put("messageCode", "correctAnswer");
      } else {
        response.put("status", "failure");
        response.put("messageCode", "incorrectAnswer");
      }
    } else {
      response.put("status", "failure");
      response.put("messageCode", "invalidUsername");
    }
    return response.toString();
  }

  @RequestMapping(value = "/password/change", method = RequestMethod.POST)
  protected String checkSecurityAnswer(@RequestParam("username") String username,
                                       @RequestParam("answer") String answer,
                                       @RequestParam("password") String password,
                                       @RequestParam("confirmPassword") String confirmPassword) throws JSONException {
    User user = userService.retrieveUserByUsername(username);
    JSONObject response = new JSONObject();
    if (user != null) {
      if (isAnswerCorrect(user, answer)) {
        if (isPasswordBlank(password, confirmPassword)) {
          response.put("status", "failure");
          response.put("messageCode", "passwordIsBlank");
        } else if (!isPasswordsMatch(password, confirmPassword)) {
          response.put("status", "failure");
          response.put("messageCode", "passwordsDoNotMatch");
        } else if (isPasswordsMatch(password, confirmPassword)) {
          userService.updateUserPassword(user, password);
          response.put("status", "success");
          response.put("messageCode", "passwordChanged");
        } else {
          response.put("status", "failure");
          response.put("messageCode", "invalidPassword");
        }
      } else {
        response.put("status", "failure");
        response.put("messageCode", "incorrectAnswer");
      }
    } else {
      response.put("status", "failure");
      response.put("messageCode", "invalidUsername");
    }
    return response.toString();
  }

  private String getAccountQuestionKey(User user) {
    return ((StudentUserDetails) user.getUserDetails()).getAccountQuestion();
  }

  private String getAccountQuestionValue(String accountQuestionKey) {
    return i18nProperties.getProperty("accountquestions." + accountQuestionKey);
  }

  private String getAccountAnswer(User user) {
    return ((StudentUserDetails) user.getUserDetails()).getAccountAnswer();
  }

  private boolean isAnswerCorrect(User user, String answer) {
    String accountSecurityAnswer = getAccountAnswer(user);
    return answer != null && answer.equals(accountSecurityAnswer);
  }

  private boolean isPasswordBlank(String password1, String password2) {
    return password1 == null || password2 == null || password1.equals("") || password2.equals("");
  }

  private boolean isPasswordsMatch(String password1, String password2) {
    return password1.equals(password2);
  }
}
