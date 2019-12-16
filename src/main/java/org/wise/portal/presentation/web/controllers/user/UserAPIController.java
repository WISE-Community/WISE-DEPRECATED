package org.wise.portal.presentation.web.controllers.user;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.switchuser.SwitchUserFilter;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.exception.IncorrectPasswordException;
import org.wise.portal.presentation.web.response.SimpleResponse;
import org.wise.portal.service.mail.IMailFacade;
import org.wise.portal.service.user.UserService;

/**
 * User REST API
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author Jonathan Lim-Breitbart
 */
@RestController
@RequestMapping("/api/user")
public class UserAPIController {

  @Autowired
  private Properties appProperties;

  @Autowired
  protected UserService userService;

  @Autowired
  protected IMailFacade mailService;

  @Value("${google.clientId:}")
  private String googleClientId = "";

  @Value("${google.clientSecret:}")
  private String googleClientSecret = "";

  @GetMapping("/info")
  HashMap<String, Object> getUserInfo(Authentication auth,
      @RequestParam(value = "username", required = false) String username) {
    if (auth != null) {
      User user = userService.retrieveUserByUsername(auth.getName());
      HashMap<String, Object> userMap = new HashMap<String, Object>();
      userMap.put("id", user.getId());
      MutableUserDetails ud = user.getUserDetails();
      userMap.put("firstName", ud.getFirstname());
      userMap.put("lastName", ud.getLastname());
      userMap.put("username", ud.getUsername());
      userMap.put("isGoogleUser", ud.isGoogleUser());
      userMap.put("isPreviousAdmin", isPreviousAdmin(auth));
      userMap.put("language", ud.getLanguage());
      userMap.put("isGoogleUser", ud.isGoogleUser());

      if (user.isStudent()) {
        userMap.put("role", "student");
      } else {
        if (user.isAdmin()) {
          userMap.put("role", "admin");
        } else if (user.isResearcher()) {
          userMap.put("role", "researcher");
        } else if (user.isTeacher()) {
          userMap.put("role", "teacher");
        }
        TeacherUserDetails tud = (TeacherUserDetails) ud;
        userMap.put("displayName", tud.getDisplayname());
        userMap.put("email", tud.getEmailAddress());
        userMap.put("city", tud.getCity());
        userMap.put("state", tud.getState());
        userMap.put("country", tud.getCountry());
        userMap.put("schoolName", tud.getSchoolname());
        userMap.put("schoolLevel", tud.getSchoollevel());
      }
      return userMap;
    } else {
      HashMap<String, Object> userMap = new HashMap<String, Object>();
      userMap.put("username", username);
      return userMap;
    }
  }

  boolean isPreviousAdmin(Authentication authentication) {
    for (GrantedAuthority authority : authentication.getAuthorities()) {
      if (SwitchUserFilter.ROLE_PREVIOUS_ADMINISTRATOR.equals(authority.getAuthority())) {
        return true;
      }
    }
    return false;
  }

  @GetMapping("/config")
  HashMap<String, Object> getConfig(HttpServletRequest request) {
    HashMap<String, Object> config = new HashMap<String, Object>();
    String contextPath = request.getContextPath();
    config.put("contextPath", contextPath);
    config.put("googleClientId", googleClientId);
    config.put("isGoogleClassroomEnabled", isGoogleClassroomEnabled());
    config.put("logOutURL", contextPath + "/logout");
    config.put("recaptchaPublicKey", appProperties.get("recaptcha_public_key"));
    return config;
  }

  private boolean isGoogleClassroomEnabled() {
    return !googleClientId.isEmpty() && !googleClientSecret.isEmpty();
  }

  @PostMapping("/check-authentication")
  HashMap<String, Object> checkAuthentication(@RequestParam("username") String username,
      @RequestParam("password") String password) {
    User user = userService.retrieveUserByUsername(username);
    HashMap<String, Object> response = new HashMap<String, Object> ();
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
    return response;
  }

  @PostMapping("/password")
  SimpleResponse changePassword(Authentication auth,
      @RequestParam("oldPassword") String oldPassword,
      @RequestParam("newPassword") String newPassword) {
    User user = userService.retrieveUserByUsername(auth.getName());
    try {
      userService.updateUserPassword(user, oldPassword, newPassword);
      return new SimpleResponse("message", "success");
    } catch (IncorrectPasswordException e) {
      return new SimpleResponse("message", "incorrect password");
    }
  }

  @GetMapping("/languages")
  List<HashMap<String, String>> getSupportedLanguages() {
    String supportedLocalesStr = appProperties.getProperty("supportedLocales", "");
    List<HashMap<String, String>> langs = new ArrayList<HashMap<String, String>>();
    for (String localeString : supportedLocalesStr.split(",")) {
      String langName = getLanguageName(localeString);
      HashMap<String, String> localeAndLang = new HashMap<String, String>();
      localeAndLang.put("locale", localeString);
      localeAndLang.put("language", langName);
      langs.add(localeAndLang);
    }
    return langs;
  }

  @GetMapping("/check-google-user-exists")
  boolean isGoogleIdExist(@RequestParam String googleUserId) {
    return userService.retrieveUserByGoogleUserId(googleUserId) != null;
  }

  @GetMapping("/check-google-user-matches")
  boolean isGoogleIdMatches(@RequestParam String googleUserId,
      @RequestParam String userId) {
    User user = userService.retrieveUserByGoogleUserId(googleUserId);
    return user != null && user.getId().toString().equals(userId);
  }

  @GetMapping("/google-user")
  HashMap<String, Object> getUserByGoogleId(@RequestParam String googleUserId) {
    User user = userService.retrieveUserByGoogleUserId(googleUserId);
    if (user == null) {
      HashMap<String, Object> response = new HashMap<String, Object>();
      response.put("status", "error");
      return response;
    } else {
      HashMap<String, Object> response = new HashMap<String, Object>();
      response.put("status", "success");
      response.put("userId", user.getId());
      response.put("username", user.getUserDetails().getUsername());
      response.put("firstName", user.getUserDetails().getFirstname());
      response.put("lastName", user.getUserDetails().getLastname());
      return response;
    }
  }

  private String getLanguageName(String localeString) {
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
