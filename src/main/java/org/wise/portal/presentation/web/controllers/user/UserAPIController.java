package org.wise.portal.presentation.web.controllers.user;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Properties;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
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
import org.wise.portal.domain.authentication.MutableGrantedAuthority;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.exception.IncorrectPasswordException;
import org.wise.portal.presentation.web.response.SimpleResponse;
import org.wise.portal.service.authentication.UserDetailsService;
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
  private UserDetailsService userDetailsService;

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
    config.put("googleClientId", googleClientId);
    config.put("isGoogleClassroomEnabled", isGoogleClassroomEnabled());
    config.put("logOutURL", contextPath + "/logout");
    config.put("recaptchaPublicKey", appProperties.get("recaptcha_public_key"));
    config.put("wise4Hostname", appProperties.get("wise4.hostname"));
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

  @GetMapping("/check-google-user-exists")
  boolean isGoogleIdExist(@RequestParam String googleUserId) {
    return userService.retrieveUserByGoogleUserId(googleUserId) != null;
  }

  @GetMapping("/check-google-user-matches")
  boolean isGoogleIdMatches(@RequestParam String googleUserId, @RequestParam String userId) {
    User user = userService.retrieveUserByGoogleUserId(googleUserId);
    return user != null && user.getId().toString().equals(userId);
  }

  @GetMapping("/google-user")
  HashMap<String, Object> getUserByGoogleId(@RequestParam String googleUserId) {
    User user = userService.retrieveUserByGoogleUserId(googleUserId);
    HashMap<String, Object> response = new HashMap<String, Object>();
    if (user == null) {
      response.put("status", "error");
    } else {
      response.put("status", "success");
      response.put("userId", user.getId());
      response.put("username", user.getUserDetails().getUsername());
      response.put("firstName", user.getUserDetails().getFirstname());
      response.put("lastName", user.getUserDetails().getLastname());
    }
    return response;
  }

  @GetMapping("/by-username")
  protected String getUserByUsername(@RequestParam String username) throws JSONException {
    JSONObject response = new JSONObject();
    JSONArray runsArray = new JSONArray();
    User user = userService.retrieveUserByUsername(username);
    if(user.isStudent()){
      StudentUserDetails sud = (StudentUserDetails)user.getUserDetails();
      response.put("userId", user.getId());
      response.put("username", sud.getUsername());
      response.put("firstName", sud.getFirstname());
      response.put("lastName", sud.getLastname());
      response.put("gender", sud.getGender());
      if(sud.isGoogleUser()){
        response.put("email", sud.getEmailAddress());
      }
      LocalDate localDate = sud.getBirthday().
          toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
      int month = localDate.getMonthValue();
      int day = localDate.getDayOfMonth();
      response.put("birthDay", day);
      response.put("birthMonth", month);
      response.put("language", sud.getLanguage());
      response.put("signUpDate", sud.getSignupdate().toString());
      response.put("numberOfLogins", sud.getNumberOfLogins());
      response.put("isGoogleUser", sud.isGoogleUser());
      if(sud.isGoogleUser()){
        response.put("email", sud.getEmailAddress());
      }
      if (sud.getLastLoginTime() != null) {
        response.put("lastLogIn", sud.getLastLoginTime().toString());
      }      
      List<Run> runs = runService.getRunList(user);
      for (Run run: runs) {
        runsArray.put(runToJSON(run, user));
      }
      response.put("runs", runsArray);
    }
    if (user.isTeacher()) {
      TeacherUserDetails tud = (TeacherUserDetails)user.getUserDetails();
      response.put("userId", user.getId());
      response.put("username", tud.getUsername());
      response.put("firstName", tud.getFirstname());
      response.put("lastName", tud.getLastname());
      response.put("displayName", tud.getDisplayname());
      response.put("email", tud.getEmailAddress());
      response.put("city", tud.getCity());
      response.put("state", tud.getState());
      response.put("country", tud.getCountry());
      response.put("schoolName", tud.getSchoolname());
      response.put("schoolLevel", tud.getSchoollevel());
      response.put("language", tud.getLanguage());
      response.put("howDidYouHearAboutUs", tud.getHowDidYouHearAboutUs());
      response.put("signUpDate", tud.getSignupdate().toString());
      response.put("numberOfLogins", tud.getNumberOfLogins());
      if (tud.getLastLoginTime() != null) {
        response.put("lastLogIn", tud.getLastLoginTime().toString());
      }
      List<Run> runs = runService.getRunListByOwner(user);
      for (Run run: runs) {
        runsArray.put(runToJSON(run, user));
      }
      response.put("runs", runsArray);
      JSONArray allAuthorities = new JSONArray();
      JSONArray userAuthorities = new JSONArray();
      for (MutableGrantedAuthority authority: userDetailsService.retrieveAllAuthorities()) {
        if (user.getUserDetails().hasGrantedAuthority(authority.getAuthority())) {
          userAuthorities.put(authority.getAuthority());
        }
        allAuthorities.put(authority.getAuthority());
      }
      response.put("allAuthorities", allAuthorities);
      response.put("userAuthorities", userAuthorities);
    }
    return response.toString();
  }

  private JSONObject runToJSON(Run run, User user) {
    JSONObject runJSON = new JSONObject();
    try {
      runJSON.put("runId", run.getId());
      runJSON.put("id", run.getId());
      runJSON.put("name", run.getName());
      runJSON.put("runCode", run.getRuncode());
      runJSON.put("numberOfPeriods", run.getPeriods().size());
      runJSON.put("numberOfStudents", run.getNumStudents());
      runJSON.put("previewProjectLink",  projectService.getProjectURI(run.getProject()));
      runJSON.put("editProjectLink", "/author#!/project/" + run.getProject().getId());
      runJSON.put("startTime", run.getStartTimeMilliseconds());
      if (user.isStudent()) {
        runJSON.put("workGroupId", run.getPeriodOfStudent(user).getId());
        Set<User> students = run.getPeriodOfStudent(user).getMembers();
        String studentsNames = "";
        for(User u: students) {
          studentsNames += u.getUserDetails().getLastname();
        }
        runJSON.put("studentsInWorkGroup", studentsNames);
      }
    } catch (JSONException je) {
      return null;
    }
    return runJSON;
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
}
