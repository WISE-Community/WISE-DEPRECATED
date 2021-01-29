package org.wise.portal.presentation.web.controllers.user;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
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
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.exception.IncorrectPasswordException;
import org.wise.portal.presentation.web.response.SimpleResponse;
import org.wise.portal.service.mail.IMailFacade;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.workgroup.WorkgroupService;

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
  protected Properties appProperties;

  @Autowired
  protected RunService runService;

  @Autowired
  protected UserService userService;

  @Autowired
  protected WorkgroupService workgroupService;

  @Autowired
  protected ProjectService projectService;

  @Autowired
  protected IMailFacade mailService;

  @Autowired
  protected MessageSource messageSource;

  @Value("${google.clientId:}")
  protected String googleClientId = "";

  @Value("${google.clientSecret:}")
  private String googleClientSecret = "";

  protected static final String PROJECT_THUMB_PATH = "/assets/project_thumb.png";

  @GetMapping("/info")
  HashMap<String, Object> getUserInfo(Authentication auth,
      @RequestParam(value = "username", required = false) String username) {
    HashMap<String, Object> info = new HashMap<String, Object>();
    if (auth != null) {
      User user = userService.retrieveUserByUsername(auth.getName());
      info.put("id", user.getId());
      MutableUserDetails ud = user.getUserDetails();
      info.put("firstName", ud.getFirstname());
      info.put("lastName", ud.getLastname());
      info.put("username", ud.getUsername());
      info.put("isGoogleUser", ud.isGoogleUser());
      info.put("isPreviousAdmin", isPreviousAdmin(auth));
      info.put("language", ud.getLanguage());
      info.put("isGoogleUser", ud.isGoogleUser());

      if (user.isStudent()) {
        info.put("role", "student");
      } else {
        if (user.isAdmin()) {
          info.put("role", "admin");
        } else if (user.isResearcher()) {
          info.put("role", "researcher");
        } else if (user.isTeacher()) {
          info.put("role", "teacher");
        }
        TeacherUserDetails tud = (TeacherUserDetails) ud;
        info.put("displayName", tud.getDisplayname());
        info.put("email", tud.getEmailAddress());
        info.put("city", tud.getCity());
        info.put("state", tud.getState());
        info.put("country", tud.getCountry());
        info.put("schoolName", tud.getSchoolname());
        info.put("schoolLevel", tud.getSchoollevel());
      }
      return info;
    } else {
      info.put("username", username);
    }
    return info;
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
  protected HashMap<String, Object> getConfig(HttpServletRequest request) {
    HashMap<String, Object> config = new HashMap<String, Object>();
    String contextPath = request.getContextPath();
    config.put("contextPath", contextPath);
    config.put("currentTime", System.currentTimeMillis());
    config.put("googleAnalyticsId", appProperties.get("google_analytics_id"));
    config.put("googleClientId", googleClientId);
    config.put("isGoogleClassroomEnabled", isGoogleClassroomEnabled());
    config.put("logOutURL", contextPath + "/logout");
    config.put("recaptchaPublicKey", appProperties.get("recaptcha_public_key"));
    config.put("wiseHostname", appProperties.get("wise.hostname"));
    config.put("wise4Hostname", appProperties.get("wise4.hostname"));
    config.put("discourseURL", appProperties.getOrDefault("discourse_url", null));
    return config;
  }

  private boolean isGoogleClassroomEnabled() {
    return !googleClientId.isEmpty() && !googleClientSecret.isEmpty();
  }

  @PostMapping("/check-authentication")
  HashMap<String, Object> checkAuthentication(@RequestParam("username") String username,
      @RequestParam("password") String password) {
    User user = userService.retrieveUserByUsername(username);
    HashMap<String, Object> response = new HashMap<String, Object>();
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
      return new SimpleResponse("success", "passwordUpdated");
    } catch (IncorrectPasswordException e) {
      return new SimpleResponse("error", "incorrectPassword");
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

  protected HashMap<String, Object> getProjectMap(Project project) {
    HashMap<String, Object> map = new HashMap<String, Object>();
    map.put("id", project.getId());
    map.put("name", project.getName());
    map.put("metadata", project.getMetadata());
    map.put("dateCreated", project.getDateCreated());
    map.put("dateArchived", project.getDateDeleted());
    map.put("projectThumb", projectService.getProjectPath(project) + PROJECT_THUMB_PATH);
    map.put("owner", convertUserToMap(project.getOwner()));
    map.put("sharedOwners", projectService.getProjectSharedOwnersList(project));
    map.put("parentId", project.getParentProjectId());
    map.put("wiseVersion", project.getWiseVersion());
    map.put("uri", projectService.getProjectURI(project));
    map.put("license", projectService.getLicensePath(project));
    return map;
  }

  protected HashMap<String, Object> getRunMap(User user, Run run) {
    HashMap<String, Object> map = new HashMap<String, Object>();
    Project project = run.getProject();
    String curriculumBaseWWW = appProperties.getProperty("curriculum_base_www");
    String projectThumb = "";
    String modulePath = project.getModulePath();
    int lastIndexOfSlash = modulePath.lastIndexOf("/");
    if (lastIndexOfSlash != -1) {
      /*
       * The project thumb url by default is the same (/assets/project_thumb.png) for all projects,
       * but this could be overwritten in the future e.g. /253/assets/projectThumb.png
       */
      projectThumb = curriculumBaseWWW + modulePath.substring(0, lastIndexOfSlash)
          + PROJECT_THUMB_PATH;
    }

    map.put("id", run.getId());
    map.put("name", run.getName());
    map.put("maxStudentsPerTeam", run.getMaxWorkgroupSize());
    map.put("projectThumb", projectThumb);
    map.put("runCode", run.getRuncode());
    map.put("startTime", run.getStartTimeMilliseconds());
    map.put("endTime", run.getEndTimeMilliseconds());
    map.put("isLockedAfterEndDate", run.isLockedAfterEndDate());
    map.put("project", getProjectMap(project));
    map.put("owner", convertUserToMap(run.getOwner()));
    map.put("numStudents", run.getNumStudents());
    map.put("wiseVersion", run.getProject().getWiseVersion());

    if (user.isStudent()) {
      addStudentInfoToRunMap(user, run, map);
    }
    return map;
  }

  private void addStudentInfoToRunMap(User user, Run run, HashMap<String, Object> map) {
    map.put("periodName", run.getPeriodOfStudent(user).getName());
    List<Workgroup> workgroups = workgroupService.getWorkgroupListByRunAndUser(run, user);
    if (workgroups.size() > 0) {
      Workgroup workgroup = workgroups.get(0);
      List<HashMap<String, Object>> workgroupMembers = new ArrayList<HashMap<String, Object>>();
      StringBuilder workgroupNames = new StringBuilder();
      for (User member : workgroup.getMembers()) {
        MutableUserDetails userDetails = (MutableUserDetails) member.getUserDetails();
        HashMap<String, Object> memberMap = new HashMap<String, Object>();
        memberMap.put("id", member.getId());
        String firstName = userDetails.getFirstname();
        memberMap.put("firstName", firstName);
        String lastName = userDetails.getLastname();
        memberMap.put("lastName", lastName);
        memberMap.put("username", userDetails.getUsername());
        memberMap.put("isGoogleUser", userDetails.isGoogleUser());
        workgroupMembers.add(memberMap);
        if (workgroupNames.length() > 0) {
          workgroupNames.append(", ");
        }
        workgroupNames.append(firstName + " " + lastName);
        map.put("workgroupId", workgroup.getId());
        map.put("workgroupNames", workgroupNames.toString());
        map.put("workgroupMembers", workgroupMembers);
      }
    }
  }

  protected HashMap<String, Object> convertUserToMap(User user) {
    HashMap<String, Object> map = new HashMap<String, Object>();
    MutableUserDetails userDetails = user.getUserDetails();
    map.put("id", user.getId());
    map.put("username", userDetails.getUsername());
    map.put("firstName", userDetails.getFirstname());
    map.put("lastName", userDetails.getLastname());
    map.put("isGoogleUser", userDetails.isGoogleUser());
    if (userDetails instanceof TeacherUserDetails) {
      map.put("displayName", ((TeacherUserDetails) userDetails).getDisplayname());
    }
    return map;
  }

  protected Boolean isNameValid(String name) {
    Pattern p = Pattern.compile("[a-zA-Z]+");
    Matcher m = p.matcher(name);
    return m.matches();
  }

  protected Boolean isFirstNameAndLastNameValid(String firstName, String lastName) {
    return isNameValid(firstName) && isNameValid(lastName);
  }

  protected String getInvalidNameMessageCode(String firstName, String lastName) {
    Boolean isFirstNameValid = isNameValid((firstName));
    Boolean isLastNameValid = isNameValid((lastName));
    String messageCode = "";
    if (!isFirstNameValid && !isLastNameValid) {
      messageCode = "invalidFirstAndLastName";
    } else if (!isFirstNameValid) {
      messageCode = "invalidFirstName";
    } else if (!isLastNameValid) {
      messageCode = "invalidLastName";
    }
    return messageCode;
  }

  protected HashMap<String, Object> createRegisterSuccessResponse(String username) {
    HashMap<String, Object> response = new HashMap<String, Object>();
    response.put("status", "success");
    response.put("username", username);
    return response;
  }
}
