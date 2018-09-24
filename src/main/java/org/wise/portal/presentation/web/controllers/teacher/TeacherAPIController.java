package org.wise.portal.presentation.web.controllers.teacher;

import org.apache.commons.lang3.RandomStringUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.acls.model.Permission;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.Schoollevel;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.presentation.web.exception.NotAuthorizedException;
import org.wise.portal.presentation.web.response.SimpleResponse;
import org.wise.portal.service.authentication.DuplicateUsernameException;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.user.UserService;

import javax.servlet.http.HttpServletRequest;
import java.util.*;

/**
 * Controller for Teacher REST API
 *
 * @author Jonathan Lim-Breitbart
 * @author Geoffrey Kwan
 * @author Hiroki Terashima
 */
@RestController
@RequestMapping("/site/api/teacher")
public class TeacherAPIController {

  @Autowired
  private Properties wiseProperties;

  @Autowired
  private ProjectService projectService;

  @Autowired
  private RunService runService;

  @Autowired
  private UserService userService;

  @Autowired
  private UserDetailsService userDetailsService;

  @RequestMapping(value = "/config", method = RequestMethod.GET)
  protected String getConfig(ModelMap modelMap, HttpServletRequest request) throws JSONException {
    JSONObject configJSON = new JSONObject();
    String contextPath = request.getContextPath();
    configJSON.put("contextPath", contextPath);
    configJSON.put("googleClientId", wiseProperties.get("google.clientId"));
    configJSON.put("logOutURL", contextPath + "/logout");
    return configJSON.toString();
  }

  @RequestMapping(value = "/runs", method = RequestMethod.GET)
  protected String getRuns() throws JSONException {
    User user = ControllerUtil.getSignedInUser();
    List<Run> runs = runService.getRunListByOwner(user);
    JSONArray runsJSONArray = getRunsJSON(runs);
    return runsJSONArray.toString();
  }

  @RequestMapping(value = "/sharedruns", method = RequestMethod.GET)
  protected String getSharedRuns() throws JSONException {
    User user = ControllerUtil.getSignedInUser();
    List<Run> runs = runService.getRunListBySharedOwner(user);
    JSONArray runsJSONArray = getRunsJSON(runs);
    return runsJSONArray.toString();
  }

  protected JSONArray getRunsJSON(List<Run> runs) throws JSONException {
    JSONArray runsJSONArray = new JSONArray();
    for (Run run : runs) {
      JSONObject runJSON = getRunJSON(run);
      JSONObject projectJSON = getProjectJSON(run.getProject());
      runJSON.put("project", projectJSON);
      runsJSONArray.put(runJSON);
    }
    return runsJSONArray;
  }

  private JSONObject getRunJSON(Run run) throws JSONException {
    JSONObject runJSON = new JSONObject();
    runJSON.put("id", run.getId());
    runJSON.put("name", run.getName());
    runJSON.put("runCode", run.getRuncode());
    runJSON.put("startTime", run.getStarttime());
    runJSON.put("endTime", run.getEndtime());
    Set<Group> periods = run.getPeriods();
    JSONArray periodsArray = new JSONArray();
    for (Group period : periods) {
      periodsArray.put(period.getName());
    }
    runJSON.put("periods", periodsArray);
    runJSON.put("numStudents", getNumStudentsInRun(run));
    runJSON.put("owner", getOwnerJSON(run.getOwner()));
    runJSON.put("sharedOwners", getRunSharedOwners(run));
    runJSON.put("project", getProjectJSON(run.getProject()));
    return runJSON;
  }

  private JSONObject getProjectJSON(Project project) throws JSONException {
    JSONObject projectJSON = new JSONObject();
    projectJSON.put("id", project.getId());
    projectJSON.put("name", project.getName());
    projectJSON.put("dateCreated", project.getDateCreated());
    projectJSON.put("dateArchived", project.getDateDeleted());
    projectJSON.put("projectThumb", getProjectThumbIconPath(project));
    projectJSON.put("owner", getOwnerJSON(project.getOwner()));
    projectJSON.put("sharedOwners", getProjectSharedOwnersJSON(project));
    projectJSON.put("metadata", project.getMetadata().toJSONObject());
    return projectJSON;
  }

  private JSONObject getOwnerJSON(User owner) throws JSONException {
    JSONObject ownerJSON = new JSONObject();
    try {
      ownerJSON.put("id", owner.getId());
      TeacherUserDetails ownerUserDetails = (TeacherUserDetails) owner.getUserDetails();
      ownerJSON.put("displayName", ownerUserDetails.getDisplayname());
      ownerJSON.put("userName", ownerUserDetails.getUsername());
      ownerJSON.put("firstName", ownerUserDetails.getFirstname());
      ownerJSON.put("lastName", ownerUserDetails.getLastname());
    } catch(org.hibernate.ObjectNotFoundException e) {
      System.out.println(e);
    }
    return ownerJSON;
  }

  @ResponseBody
  @RequestMapping(value = "/run/{runId}", method = RequestMethod.GET)
  protected String getRun(@PathVariable Long runId)
      throws ObjectNotFoundException, JSONException {
    Run run = runService.retrieveById(runId);
    JSONObject runJSON = getRunJSON(run);
    JSONObject projectJSON = getProjectJSON(run.getProject());
    runJSON.put("project", projectJSON);
    return runJSON.toString();
  }

  @ResponseBody
  @RequestMapping(value = "/usernames", method = RequestMethod.GET)
  protected List<String> getAllTeacherUsernames() {
    return userDetailsService.retrieveAllUsernames("TeacherUserDetails");
  }

  @ResponseBody
  @RequestMapping(value = "/register", method = RequestMethod.POST)
  protected String createTeacherAccount(
    @RequestBody Map<String, String> teacherFields, HttpServletRequest request
  ) throws DuplicateUsernameException {
    TeacherUserDetails teacherUserDetails = new TeacherUserDetails();
    teacherUserDetails.setFirstname(teacherFields.get("firstName"));
    teacherUserDetails.setLastname(teacherFields.get("lastName"));
    teacherUserDetails.setEmailAddress(teacherFields.get("email"));
    teacherUserDetails.setCity(teacherFields.get("city"));
    teacherUserDetails.setState(teacherFields.get("state"));
    teacherUserDetails.setCountry(teacherFields.get("country"));
    if (teacherFields.containsKey("googleUserId")) {
      teacherUserDetails.setGoogleUserId(teacherFields.get("googleUserId"));
      teacherUserDetails.setPassword(RandomStringUtils.random(10, true, true));
    } else {
      teacherUserDetails.setPassword(teacherFields.get("password"));
    }
    teacherUserDetails.setDisplayname(teacherUserDetails.getFirstname() + " " + teacherUserDetails.getLastname());
    teacherUserDetails.setEmailValid(true);
    teacherUserDetails.setSchoollevel(Schoollevel.valueOf(teacherFields.get("schoolLevel")));
    teacherUserDetails.setSchoolname(teacherFields.get("schoolName"));
    teacherUserDetails.setHowDidYouHearAboutUs(teacherFields.get("howDidYouHearAboutUs"));
    Locale locale = request.getLocale();
    teacherUserDetails.setLanguage(locale.getLanguage());
    User createdUser = this.userService.createUser(teacherUserDetails);
    return createdUser.getUserDetails().getUsername();
  }

  @ResponseBody
  @RequestMapping(value = "/checkGoogleUserId", method = RequestMethod.GET)
  protected boolean isGoogleIdExist(@RequestParam String googleUserId) {
    return this.userService.retrieveUserByGoogleUserId(googleUserId) != null;
  }

  private JSONArray getProjectSharedOwnersJSON(Project project) throws JSONException {
    JSONArray sharedOwners = new JSONArray();
    for (User sharedOwner : project.getSharedowners()) {
      sharedOwners.put(getSharedOwnerJSON(sharedOwner, project));
    }
    return sharedOwners;
  }

  private JSONObject getSharedOwnerJSON(User sharedOwner, Project project) throws JSONException {
    JSONObject sharedOwnerJSON = new JSONObject();
    sharedOwnerJSON.put("id", sharedOwner.getId());
    sharedOwnerJSON.put("username", sharedOwner.getUserDetails().getUsername());
    sharedOwnerJSON.put("firstName", sharedOwner.getUserDetails().getFirstname());
    sharedOwnerJSON.put("lastName", sharedOwner.getUserDetails().getLastname());
    sharedOwnerJSON.put("permissions", getSharedOwnerPermissions(project, sharedOwner));
    return sharedOwnerJSON;
  }

  private JSONArray getSharedOwnerPermissions(Project project, User sharedOwner) {
    JSONArray sharedOwnerPermissions = new JSONArray();
    List<Permission> sharedTeacherPermissions = projectService.getSharedTeacherPermissions(project, sharedOwner);
    for (Permission permission : sharedTeacherPermissions) {
      sharedOwnerPermissions.put(permission.getMask());
    }
    return sharedOwnerPermissions;
  }

  private JSONArray getRunSharedOwners(Run run) throws JSONException {
    JSONArray sharedOwners = new JSONArray();
    for (User sharedOwner : run.getSharedowners()) {
      JSONObject sharedOwnerJSON = getSharedOwnerJSON(sharedOwner, run);
      sharedOwners.put(sharedOwnerJSON);
    }
    return sharedOwners;
  }

  private JSONObject getSharedOwnerJSON(User sharedOwner, Run run) throws JSONException {
    JSONObject sharedOwnerJSON = new JSONObject();
    sharedOwnerJSON.put("id", sharedOwner.getId());
    sharedOwnerJSON.put("username", sharedOwner.getUserDetails().getUsername());
    sharedOwnerJSON.put("firstName", sharedOwner.getUserDetails().getFirstname());
    sharedOwnerJSON.put("lastName", sharedOwner.getUserDetails().getLastname());
    sharedOwnerJSON.put("permissions", getSharedOwnerPermissions(run, sharedOwner));
    return sharedOwnerJSON;
  }

  private JSONArray getSharedOwnerPermissions(Run projectRun, User sharedOwner) {
    JSONArray sharedOwnerPermissions = new JSONArray();
    List<Permission> sharedTeacherPermissions = runService.getSharedTeacherPermissions(projectRun, sharedOwner);
    for (Permission permission : sharedTeacherPermissions) {
      sharedOwnerPermissions.put(permission.getMask());
    }
    return sharedOwnerPermissions;
  }

  private String getProjectThumbIconPath(Project project) {
    String modulePath = project.getModulePath();
    int lastIndexOfSlash = modulePath.lastIndexOf("/");
    if (lastIndexOfSlash != -1) {
      String curriculumBaseWWW = wiseProperties.getProperty("curriculum_base_www");
      return curriculumBaseWWW + modulePath.substring(0, lastIndexOfSlash) + "/assets/project_thumb.png";
    }
    return "";
  }

  private int getNumStudentsInRun(Run projectRun) {
    Set<Group> periods = projectRun.getPeriods();
    int numStudents = 0;
    for (Group period : periods) {
      Set<User> members = period.getMembers();
      numStudents += members.size();
    }
    return numStudents;
  }

  @RequestMapping(value = "/run/create", method = RequestMethod.POST)
  protected String createRun(HttpServletRequest request,
                             @RequestParam("projectId") String projectId,
                             @RequestParam("periods") String periods,
                             @RequestParam("studentsPerTeam") String studentsPerTeam,
                             @RequestParam("startDate") String startDate) throws Exception {
    User user = ControllerUtil.getSignedInUser();
    Locale locale = request.getLocale();
    Set<String> periodNames = createPeriodNamesSet(periods);
    Run run = runService.createRun(Integer.parseInt(projectId), user, periodNames, Integer.parseInt(studentsPerTeam),
        Long.parseLong(startDate), locale);
    JSONObject runJSON = getRunJSON(run);
    return runJSON.toString();
  }

  Set<String> createPeriodNamesSet(String periodsString) {
    Set<String> periods = new TreeSet<String>();
    String[] periodsSplit = periodsString.split(",");
    for (String period : periodsSplit) {
      periods.add(period.trim());
    }
    return periods;
  }

  JSONArray createPeriodNamesArray(Set<Group> periods) {
    JSONArray periodsArray = new JSONArray();
    for (Group period : periods) {
      periodsArray.put(period.getName());
    }
    return periodsArray;
  }

  @RequestMapping(value = "/profile/update", method = RequestMethod.POST)
  protected SimpleResponse updateProfile(HttpServletRequest request,
                                 @RequestParam("username") String username,
                                 @RequestParam("displayName") String displayName,
                                 @RequestParam("email") String email,
                                 @RequestParam("city") String city,
                                 @RequestParam("state") String state,
                                 @RequestParam("country") String country,
                                 @RequestParam("schoolName") String schoolName,
                                 @RequestParam("schoolLevel") String schoolLevel,
                                 @RequestParam("language") String language) throws NotAuthorizedException, JSONException {
    User user = ControllerUtil.getSignedInUser();
    if (user.getUserDetails().getUsername().equals(username)) {
      TeacherUserDetails teacherUserDetails = (TeacherUserDetails) user.getUserDetails();
      teacherUserDetails.setEmailAddress(email);
      teacherUserDetails.setDisplayname(displayName);
      teacherUserDetails.setCity(city);
      teacherUserDetails.setState(state);
      teacherUserDetails.setCountry(country);
      teacherUserDetails.setSchoolname(schoolName);
      teacherUserDetails.setSchoollevel(Schoollevel.valueOf(schoolLevel));
      teacherUserDetails.setLanguage(language);
      userService.updateUser(user);
      return new SimpleResponse("message", "success");
    } else {
      throw new NotAuthorizedException("username is not the same as signed in user");
    }
  }
}
