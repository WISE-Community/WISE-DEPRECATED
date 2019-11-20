package org.wise.portal.presentation.web.controllers.user;

import java.util.Locale;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.presentation.web.exception.IncorrectPasswordException;
import org.wise.portal.presentation.web.exception.NotAuthorizedException;
import org.wise.portal.presentation.web.response.SimpleResponse;
import org.wise.portal.service.mail.IMailFacade;
import org.wise.portal.service.user.UserService;

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
  private Properties appProperties;

  @Autowired
  protected UserService userService;

  @Autowired
  protected IMailFacade mailService;

  @Value("${google.clientId:}")
  private String googleClientId;

  @Value("${google.clientSecret:}")
  private String googleClientSecret;

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
      userJSON.put("username", userDetails.getUsername());
      userJSON.put("isGoogleUser", userDetails.isGoogleUser());
      userJSON.put("isPreviousAdmin", ControllerUtil.isUserPreviousAdministrator());

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

      return userJSON.toString();
    } else {
      JSONObject userJSON = new JSONObject();
      userJSON.put("username", username);
      return userJSON.toString();
    }
  }

  @RequestMapping(value = "/config", method = RequestMethod.GET)
  protected String getConfig(ModelMap modelMap, HttpServletRequest request) throws JSONException {
    JSONObject configJSON = new JSONObject();
    String contextPath = request.getContextPath();
    configJSON.put("contextPath", contextPath);
    configJSON.put("googleClientId", googleClientId);
    configJSON.put("isGoogleClassroomEnabled", isGoogleClassroomEnabled());
    configJSON.put("recaptchaPublicKey", appProperties.get("recaptcha_public_key"));
    configJSON.put("logOutURL", contextPath + "/logout");
    return configJSON.toString();
  }

  private boolean isGoogleClassroomEnabled() {
    return !googleClientId.equals("") && !googleClientSecret.equals("");
  }

  @RequestMapping(value = "/check-authentication", method = RequestMethod.POST)
  protected String checkAuthentication(@RequestParam("username") String username,
                                       @RequestParam("password") String password) throws JSONException {
    User user = userService.retrieveUserByUsername(username);
    JSONObject response = new JSONObject();
    if (user == null) {
      response.put("isUsernameValid", false);
      response.put("isPasswordValid", false);
    } else {
      response.put("isUsernameValid", true);
      response.put("isPasswordValid", userService.isPasswordCorrect(user, password));
      response.put("userId", user.getId());
      response.put("username", user.getUserDetails().getUsername());
      response.put("firstName", user.getUserDetails().getFirstname());
      response.put("lastName", user.getUserDetails().getLastname());
    }
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
    String supportedLocales = appProperties.getProperty("supportedLocales");
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
      response.put("username", user.getUserDetails().getUsername());
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
