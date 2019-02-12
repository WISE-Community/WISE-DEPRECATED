package org.wise.portal.presentation.web.controllers.user;

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.PersistentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.general.contactwise.IssueType;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.presentation.web.exception.IncorrectPasswordException;
import org.wise.portal.presentation.web.exception.NotAuthorizedException;
import org.wise.portal.presentation.web.filters.WISEAuthenticationProcessingFilter;
import org.wise.portal.presentation.web.response.SimpleResponse;
import org.wise.portal.service.mail.IMailFacade;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.user.UserService;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import java.io.*;
import java.util.*;

/**
 * Controller for User REST API
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author Jonathan Lim-Breitbart
 */
@RestController
@RequestMapping(value = "/api/user", produces = "application/json;charset=UTF-8")
public class UserAPIController {

  @Autowired
  private Properties wiseProperties;

  @Autowired
  protected UserService userService;

  @Autowired
  protected IMailFacade mailService;

  @RequestMapping(value = "/user", method = RequestMethod.GET)
  protected String getUserInfo(ModelMap modelMap,
      HttpServletRequest request,
      @RequestParam(value = "username", required = false) String username,
      @RequestParam(value = "pLT", required = false) String previousLoginTime) throws Exception {
    User user = ControllerUtil.getSignedInUser();
    if (user != null) {
      MutableUserDetails userDetails = user.getUserDetails();

      Boolean isStudent = false;
      Boolean isAdmin = false;
      Boolean isResearcher = false;
      Boolean isTeacher = false;
      for (GrantedAuthority authority : userDetails.getAuthorities()) {
        if (authority.getAuthority().equals("ROLE_STUDENT")) {
          isStudent = true;
          break;
        } else if (authority.getAuthority().equals("ROLE_ADMINISTRATOR")) {
          isAdmin = true;
          break;
        } else if (authority.getAuthority().equals("ROLE_RESEARCHER")) {
          isResearcher = true;
        } else if (authority.getAuthority().equals("ROLE_TEACHER")) {
          isTeacher = true;
        }
      }

      JSONObject userJSON = new JSONObject();
      userJSON.put("id", user.getId());
      userJSON.put("firstName", userDetails.getFirstname());
      userJSON.put("lastName", userDetails.getLastname());
      userJSON.put("userName", userDetails.getUsername());

      if (isStudent) {
        userJSON.put("role", "student");
      } else if (isAdmin) {
        userJSON.put("role", "admin");
      } else if (isResearcher) {
        userJSON.put("role", "researcher");
      } else if (isTeacher) {
        userJSON.put("role", "teacher");
      }

      if (!isStudent) {
        TeacherUserDetails teacherUserDetails = (TeacherUserDetails) userDetails;
        userJSON.put("displayName", teacherUserDetails.getDisplayname());
        userJSON.put("email", teacherUserDetails.getEmailAddress());
        userJSON.put("city", teacherUserDetails.getCity());
        userJSON.put("state", teacherUserDetails.getState());
        userJSON.put("country", teacherUserDetails.getCountry());
        userJSON.put("schoolName", teacherUserDetails.getSchoolname());
        userJSON.put("schoolLevel", teacherUserDetails.getSchoollevel());
      }
      String language = userDetails.getLanguage();
      if (language == null) {
        language = "en";
      }
      userJSON.put("language", language);
      userJSON.put("isGoogleUser", userDetails.isGoogleUser());
      userJSON.put("isRecaptchaRequired", false);

      return userJSON.toString();
    } else {
      JSONObject userJSON = new JSONObject();
      userJSON.put("userName", username);
      userJSON.put("isRecaptchaRequired", ControllerUtil.isReCaptchaRequired(request));
      return userJSON.toString();
    }
  }

  @RequestMapping(value = "/config", method = RequestMethod.GET)
  protected String getConfig(ModelMap modelMap, HttpServletRequest request) throws JSONException {
    JSONObject configJSON = new JSONObject();
    String contextPath = request.getContextPath();
    configJSON.put("contextPath", contextPath);
    configJSON.put("googleClientId", wiseProperties.get("google.clientId"));
    configJSON.put("recaptchaPublicKey", wiseProperties.get("recaptcha_public_key"));
    configJSON.put("logOutURL", contextPath + "/logout");
    return configJSON.toString();
  }

  @RequestMapping(value = "/check-authentication", method = RequestMethod.POST)
  protected String checkAuthentication(@RequestParam("username") String username,
                                       @RequestParam("password") String password) throws JSONException {
    User user = userService.retrieveUserByUsername(username);
    JSONObject response = new JSONObject();
    response.put("isValid", userService.isPasswordCorrect(user, password));
    response.put("userId", user.getId());
    response.put("userName", user.getUserDetails().getUsername());
    response.put("firstName", user.getUserDetails().getFirstname());
    response.put("lastName", user.getUserDetails().getLastname());
    return response.toString();
  }

  @RequestMapping(value = "/password", method = RequestMethod.POST)
  protected SimpleResponse changePassword(@RequestParam("username") String username,
      @RequestParam("oldPassword") String oldPassword,
      @RequestParam("newPassword") String newPassword) throws NotAuthorizedException, JSONException {
    User user = ControllerUtil.getSignedInUser();
    if (user.getUserDetails().getUsername().equals(username)) {
      try {
        User result = userService.updateUserPassword(user, oldPassword, newPassword);
        return new SimpleResponse("message", "success");
      } catch(IncorrectPasswordException e) {
        return new SimpleResponse("message", "incorrect password");
      }
    } else {
      throw new NotAuthorizedException("username is not the same as signed in user");
    }
  }

  @RequestMapping(value = "/languages", method = RequestMethod.GET)
  protected String getSupportedLanguages() throws JSONException {
    String supportedLocales = wiseProperties.getProperty("supportedLocales");
    String[] supportedLocalesArray = supportedLocales.split(",");
    JSONArray supportedLocalesJSONArray = new JSONArray();
    for (String localeString: supportedLocalesArray) {
      String language = getLanguageName(localeString);
      JSONObject localeAndLanguage = new JSONObject();
      localeAndLanguage.put("locale", localeString);
      localeAndLanguage.put("language", language);
      supportedLocalesJSONArray.put(localeAndLanguage);
    }
    return supportedLocalesJSONArray.toString();
  }

  @RequestMapping(value = "/check-google-user-exists", method = RequestMethod.GET)
  protected boolean isGoogleIdExist(@RequestParam String googleUserId) {
    return this.userService.retrieveUserByGoogleUserId(googleUserId) != null;
  }

  @RequestMapping(value = "/check-google-user-matches", method = RequestMethod.GET)
  protected boolean isGoogleIdMatches(@RequestParam String googleUserId,
                                    @RequestParam String userId) {
    User user = this.userService.retrieveUserByGoogleUserId(googleUserId);
    return user != null && user.getId().toString().equals(userId);
  }

  @RequestMapping(value = "/google-user", method = RequestMethod.GET)
  protected String getUserByGoogleId(@RequestParam String googleUserId) throws JSONException {
    JSONObject response = new JSONObject();
    User user = this.userService.retrieveUserByGoogleUserId(googleUserId);
    if (user == null) {
      response.put("status", "error");
    } else {
      response.put("status", "success");
      response.put("userId", user.getId());
      response.put("userName", user.getUserDetails().getUsername());
      response.put("firstName", user.getUserDetails().getFirstname());
      response.put("lastName", user.getUserDetails().getLastname());
    }
    return response.toString();
  }

  protected String getLanguageName(String localeString) {
    if (localeString.toLowerCase().equals("zh_tw")) {
      return "Chinese (Traditional)";
    } else if (localeString.toLowerCase().equals("zh_cn")) {
      return "Chinese (Simplified)";
    } else {
      Locale locale = new Locale(localeString);
      return locale.getDisplayLanguage();
    }
  }
}
