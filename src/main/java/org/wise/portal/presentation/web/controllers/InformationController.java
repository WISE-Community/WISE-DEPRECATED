/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.presentation.web.controllers;

import java.io.IOException;
import java.util.Calendar;
import java.util.List;
import java.util.Locale;
import java.util.Properties;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.ProjectImpl;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.filters.WISEAuthenticationProcessingFilter;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.workgroup.WorkgroupService;
import org.wise.vle.web.SecurityUtils;

/**
 * Handles requests for User information and VLE config
 *
 * @author Patrick Lawler
 * @author Geoffrey Kwan
 * @author Hiroki Terashima
 */
@Controller
public class InformationController {

  @Autowired
  Properties appProperties;

  @Autowired
  ProjectService projectService;

  @Autowired
  RunService runService;

  @Autowired
  UserService userService;

  @Autowired
  WorkgroupService workgroupService;

  /**
   * If the workgroupId is specified in the request, then look up userInfo for that specified
   * workgroup. Otherwise, lookup userInfo for the currently-logged-in user.
   */
  @RequestMapping("/userInfo")
  public void handleGetUserInfo(HttpServletRequest request, HttpServletResponse response)
      throws IOException, NumberFormatException, ObjectNotFoundException {
    String runIdString = request.getParameter("runId");
    Long runId = Long.parseLong(runIdString);
    Run run = runService.retrieveById(runId);
    JSONObject userInfo = getUserInfo(run);
    if (userInfo == null) {
      response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
    }
    printConfigToResponse(response, userInfo);
  }

  /**
   * Usable by anonymous and logged-in users for retrieving public run information, such as run
   * periods given runcode
   */
  @RequestMapping("/runInfo")
  public void handleRunInfo(@RequestParam("runcode") String runcode, HttpServletResponse response)
      throws Exception {
    try {
      Run run = runService.retrieveRunByRuncode(runcode);
      Set<Group> periods = run.getPeriods();
      StringBuffer periodsStr = new StringBuffer();
      for (Group period : periods) {
        periodsStr.append(period.getName());
        periodsStr.append(",");
      }
      response.setContentType("text/plain");
      response.getWriter().print(periodsStr.toString());
    } catch (ObjectNotFoundException e) {
      response.setContentType("text/plain");
      response.getWriter().print("not found");
    }
  }

  /**
   * Handles the get config request from three possible modes for WISE4: grading, preview and run.
   * The run and grading requests are almost identical, the preview request is largely handled when
   * the projectId is found.
   *
   * projectId is found == preview mode runId is found == run mode
   */
  @RequestMapping("/vleconfig")
  public void handleGetConfigWISE4(HttpServletRequest request, HttpServletResponse response)
      throws ObjectNotFoundException, IOException {
    User signedInUser = ControllerUtil.getSignedInUser();
    String mode = request.getParameter("mode");
    String contextPath = request.getContextPath();
    JSONObject config = new JSONObject();
    String projectIdString = request.getParameter("projectId");
    // if projectId provided, this is a request for preview
    if (projectIdString != null) {
      Project project = projectService.getById(Long.parseLong(projectIdString));
      addPreviewConfigParametersWISE4(request, signedInUser, mode, contextPath, config, project);
      printConfigToResponse(response, config);
      return;
    }

    String runId = request.getParameter("runId");
    if (runId != null) {
      Run run = runService.retrieveById(Long.parseLong(runId));
      Workgroup workgroup = getWorkgroup(run);
      if (workgroup == null && signedInUser == null && !signedInUser.isAdmin()) {
        return;
      }
      addRunConfigParametersWISE4(request, signedInUser, mode, contextPath, config, runId, run,
          workgroup);
      printConfigToResponse(response, config);
      return;
    }
  }

  @GetMapping("/config/vle")
  @ResponseBody
  public String getVLEDefaultConfig(HttpServletRequest request) throws JSONException {
    JSONObject config = getDefaultVLEConfig(request);
    return config.toString();
  }

  /**
   * Handles the get config request for WISE5 preview
   */
  @RequestMapping("/config/preview/{projectIdStr}")
  public void handleGetConfigWISE5Preview(HttpServletRequest request, HttpServletResponse response,
      @PathVariable String projectIdStr) throws ObjectNotFoundException, IOException {
    try {
      JSONObject config = new JSONObject();
      config.put("mode", "preview");
      addDummyUserInfoToConfig(config);
      addConstraintsDisabled(request, config);

      if ("demo".equals(projectIdStr)) {
        Project project = new ProjectImpl();
        String rawProjectUrl = "/demo/project.json";
        addCommonConfigParameters(request, config, project, rawProjectUrl);
      } else {
        Project project = projectService.getById(Long.parseLong(projectIdStr));
        addCommonConfigParameters(request, config, project);
      }

      printConfigToResponse(response, config);
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  @RequestMapping("/config/studentRun/{runId}")
  public void handleGetConfigWISE5StudentRun(HttpServletRequest request,
      HttpServletResponse response, @PathVariable Long runId)
      throws ObjectNotFoundException, IOException, JSONException {
    JSONObject config = new JSONObject();
    config.put("mode", "studentRun");
    Run run = runService.retrieveById(runId);
    getRunConfigParameters(request, config, run);
    Project project = run.getProject();
    addCommonConfigParameters(request, config, project);
    printConfigToResponse(response, config);
  }

  @RequestMapping("/config/classroomMonitor/{runId}")
  public void handleGetConfigWISE5ClassroomMonitor(HttpServletRequest request,
      HttpServletResponse response, @PathVariable Long runId)
      throws ObjectNotFoundException, IOException, JSONException {
    JSONObject config = new JSONObject();
    config.put("mode", "classroomMonitor");
    Run run = runService.retrieveById(runId);
    getRunConfigParameters(request, config, run);
    User signedInUser = ControllerUtil.getSignedInUser();
    String contextPath = request.getContextPath();
    if (hasRunReadAccess(signedInUser, run)) {
      config.put("runCode", run.getRuncode());
      config.put("teacherDataURL", contextPath + "/teacher/data");
      config.put("runDataExportURL", contextPath + "/teacher/export");
      config.put("notebookURL", contextPath + "/teacher/notebook/run/" + runId);
    }
    Project project = run.getProject();
    if (hasRunWriteAccess(signedInUser, run)) {
      config.put("canEditProject", true);
      config.put("saveProjectURL",
          contextPath + "/author/project/save/" + project.getId().toString());
    }
    config.put("canViewStudentNames", isAllowedToViewStudentNames(run, signedInUser));
    config.put("canGradeStudentWork", runService.isAllowedToGradeStudentWork(run, signedInUser));
    config.put("canAuthorProject", projectService.canAuthorProject(project, signedInUser));
    addCommonConfigParameters(request, config, project);
    printConfigToResponse(response, config);
  }

  private String getPeriodIds(Run run) {
    StringBuffer periodIds = new StringBuffer();
    Set<Group> periods = run.getPeriods();
    for (Group period : periods) {
      if (periodIds.length() != 0) {
        periodIds.append(":");
      }
      periodIds.append(period.getId());
    }
    return periodIds.toString();
  }

  private String getPeriodNames(Run run) {
    StringBuffer periodNames = new StringBuffer();
    Set<Group> periods = run.getPeriods();
    for (Group period : periods) {
      if (periodNames.length() != 0) {
        periodNames.append(":");
      }
      periodNames.append(period.getName());
    }
    return periodNames.toString();
  }

  /**
   * Get an user info object for the logged in user for the specified run
   *
   * @return UserInfo as JSON object
   * @throws ObjectNotFoundException
   * @throws NumberFormatException
   */
  private JSONObject getUserInfo(Run run) throws ObjectNotFoundException, NumberFormatException {
    String periodId = "";
    Long workgroupId = null;
    String periodName = "";
    User loggedInUser = ControllerUtil.getSignedInUser();
    Workgroup workgroup = getWorkgroup(run);
    if (workgroup != null && workgroup.isStudentWorkgroup()) {
      Group periodGroup = workgroup.getPeriod();
      periodName = periodGroup.getName();
      periodId = periodGroup.getId().toString();
      workgroupId = workgroup.getId();
    } else if (workgroup != null && workgroup.isTeacherWorkgroup()) {
      // if teacher or admin with workgroup, include workgroupId
      workgroupId = workgroup.getId();
      periodId = getPeriodIds(run);
      periodName = getPeriodNames(run);
    } else if (loggedInUser.isAdmin()) {
      // admin without workgroup
      periodId = getPeriodIds(run);
      periodName = getPeriodNames(run);
    }

    try {
      String usernames = "";
      String firstName = "";
      String lastName = "";
      JSONArray userIds = new JSONArray();
      if (loggedInUser.isTeacher()) {
        MutableUserDetails userDetails = loggedInUser.getUserDetails();
        firstName = userDetails.getFirstname();
        lastName = userDetails.getLastname();
        usernames = userDetails.getUsername();
        userIds.put(loggedInUser.getId());
      } else {
        usernames = getUsernamesFromWorkgroup(workgroup);
        userIds = getStudentIdsFromWorkgroup(workgroup);
      }
      JSONObject myUserInfo = getMyUserInfoJSONObject(periodId, periodName, userIds, workgroupId,
          usernames, firstName, lastName);
      myUserInfo.put("myClassInfo", getMyClassInfoJSONObject(run, workgroup, loggedInUser));
      JSONObject userInfo = new JSONObject();
      userInfo.put("myUserInfo", myUserInfo);
      return userInfo;
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return null;
  }

  private JSONObject getMyClassInfoJSONObject(Run run, Workgroup workgroup, User loggedInUser)
      throws JSONException, ObjectNotFoundException {
    JSONObject myClassInfo = new JSONObject();
    myClassInfo.put("classmateUserInfos",
        getClassmateUserInfosJSONArray(run, workgroup, loggedInUser));
    myClassInfo.put("teacherUserInfo", getTeacherUserInfoJSONObject(run));
    myClassInfo.put("sharedTeacherUserInfos", getSharedTeacherUserInfosJSONArray(run));
    myClassInfo.put("periods", getPeriodsJSONArray(run));
    return myClassInfo;
  }

  private JSONArray getSharedTeacherUserInfosJSONArray(Run run) {
    JSONArray sharedTeacherUserInfos = new JSONArray();
    for (User sharedOwner : run.getSharedowners()) {
      List<Workgroup> sharedTeacherWorkgroups = workgroupService.getWorkgroupListByRunAndUser(run,
          sharedOwner);

      /*
       * loop through all the shared teacher workgroups in case a shared owner has multiple
       * workgroups for this run due to a bug which created multiple workgroups for a shared teacher
       */
      for (Workgroup sharedTeacherWorkgroup : sharedTeacherWorkgroups) {
        JSONObject sharedTeacherUserInfo = new JSONObject();
        try {
          sharedTeacherUserInfo.put("workgroupId", sharedTeacherWorkgroup.getId());
          sharedTeacherUserInfo.put("username", sharedTeacherWorkgroup.generateWorkgroupName());

          String sharedTeacherRole = runService.getSharedTeacherRole(run, sharedOwner);
          if (sharedTeacherRole == null) {
            sharedTeacherUserInfo.put("role", "");
          } else if (sharedTeacherRole.equals(UserDetailsService.RUN_READ_ROLE)) {
            sharedTeacherUserInfo.put("role", "read");
          } else if (sharedTeacherRole.equals(UserDetailsService.RUN_GRADE_ROLE)) {
            sharedTeacherUserInfo.put("role", "grade");
          }
        } catch (JSONException e) {
          e.printStackTrace();
        }
        sharedTeacherUserInfos.put(sharedTeacherUserInfo);
      }
    }
    return sharedTeacherUserInfos;
  }

  private JSONObject getTeacherUserInfoJSONObject(Run run) {
    JSONObject teacherUserInfo = new JSONObject();
    User runOwner = run.getOwner();
    try {
      List<Workgroup> workgroupsForRunOwner = workgroupService.getWorkgroupListByRunAndUser(run,
          runOwner);

      // get the workgroup since the owner should only have one workgroup in the run
      Workgroup runOwnerWorkgroup = workgroupsForRunOwner.get(0);

      teacherUserInfo.put("workgroupId", runOwnerWorkgroup.getId());
      teacherUserInfo.put("username", runOwner.getUserDetails().getUsername());
    } catch (JSONException e1) {
      e1.printStackTrace();
    }
    return teacherUserInfo;
  }

  /**
   * Get student classmates except yourself
   *
   * @param run
   * @param workgroup
   * @param loggedInUser
   * @return
   * @throws ObjectNotFoundException
   */
  private JSONArray getClassmateUserInfosJSONArray(Run run, Workgroup workgroup, User loggedInUser)
      throws ObjectNotFoundException {
    JSONArray classmateUserInfos = new JSONArray();
    for (Workgroup classmateWorkgroup : runService.getWorkgroups(run.getId())) {
      if (isClassmateWorkgroup(workgroup, loggedInUser, classmateWorkgroup)) {
        classmateUserInfos.put(getClassmateUserInfoJSON(classmateWorkgroup, run, loggedInUser));
      }
    }
    return classmateUserInfos;
  }

  /**
   * @return true iff the classmateWorkgroup is active classmate workgroup
   */
  private boolean isClassmateWorkgroup(Workgroup workgroup, User loggedInUser,
      Workgroup classmateWorkgroup) {
    return !classmateWorkgroup.getMembers().isEmpty() && !classmateWorkgroup.isTeacherWorkgroup()
        && (loggedInUser.isAdmin() || classmateWorkgroup.getId() != workgroup.getId())
        && classmateWorkgroup.getPeriod() != null;
  }

  private JSONObject getMyUserInfoJSONObject(String periodId, String periodName, JSONArray userIds,
      Long workgroupId, String usernames, String firstName, String lastName) {
    JSONObject myUserInfo = new JSONObject();
    try {
      myUserInfo.put("workgroupId", workgroupId);
      myUserInfo.put("username", usernames);
      myUserInfo.put("isSwitchedUser", ControllerUtil.isUserPreviousAdministrator());
      if (!firstName.isEmpty()) {
        myUserInfo.put("firstName", firstName);
      }
      if (!lastName.isEmpty()) {
        myUserInfo.put("lastName", lastName);
      }

      try {
        myUserInfo.put("periodId", Long.parseLong(periodId));
      } catch (NumberFormatException nfe) {
        myUserInfo.put("periodId", periodId);
      }

      myUserInfo.put("periodName", periodName);
      myUserInfo.put("userIds", userIds);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return myUserInfo;
  }

  private JSONArray getPeriodsJSONArray(Run run) {
    JSONArray periods = new JSONArray();
    Set<Group> runPeriods = run.getPeriods();
    if (runPeriods != null) {
      for (Group runPeriod : runPeriods) {
        try {
          JSONObject periodObject = new JSONObject();
          periodObject.put("periodId", runPeriod.getId());
          periodObject.put("periodName", runPeriod.getName());
          periods.put(periodObject);
        } catch (JSONException e) {
          e.printStackTrace();
        }
      }
    }
    return periods;
  }

  private void addPreviewConfigParametersWISE4(HttpServletRequest request, User signedInUser,
      String mode, String contextPath, JSONObject config, Project project) {
    try {
      config.put("runId", "");
      config.put("runName", "");
      addConstraintsDisabled(request, config);

      String workgroupIdString = request.getParameter("workgroupId");
      if (workgroupIdString != null) {
        /*
         * This is set if the request is to preview the project and use a specific workgroup id.
         * This is usually used to test branching based on workgroup id.
         */
        config.put("workgroupId", new Integer(workgroupIdString));
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    addCommonConfigParametersWISE4(request, signedInUser, mode, contextPath, config, project);
  }

  private void addRunConfigParametersWISE4(HttpServletRequest request, User signedInUser,
      String mode, String contextPath, JSONObject config, String runId, Run run,
      Workgroup workgroup) {
    Long workgroupId = null;
    Long periodId = null;
    if (workgroup != null && workgroup.isStudentWorkgroup()) {
      workgroupId = workgroup.getId();
      periodId = workgroup.getPeriod().getId();
    } else if (workgroup != null && workgroup.isTeacherWorkgroup()) {
      workgroupId = workgroup.getId();
    } else if (signedInUser.isAdmin()) {
      // admin does not need workgroup or period
    }

    try {
      config.put("runId", Long.parseLong(runId));
      config.put("runName", run.getName());
      config.put("isRunActive", !run.isEnded());
      config.put("flagsURL", contextPath + "/annotation?type=flag&runId=" + runId);
      config.put("inappropriateFlagsURL",
          contextPath + "/annotation?type=inappropriateFlag&runId=" + runId);
      config.put("annotationsURL", contextPath + "/annotation?type=annotation&runId=" + runId);
      config.put("studentDataURL", contextPath + "/studentData.html");
      config.put("gradingType", request.getParameter("gradingType"));
      config.put("getRevisions", request.getParameter("getRevisions"));
      config.put("studentAssetManagerURL",
          contextPath + "/assetManager?type=studentAssetManager&runId=" + runId);
      config.put("runInfo", run.getInfo());
      config.put("isRealTimeEnabled", true); // TODO: make this run-specific setting
      config.put("webSocketURL", ControllerUtil.getWebSocketURL(request, contextPath));
      config.put("studentStatusURL", contextPath + "/studentStatus");
      config.put("runStatusURL", contextPath + "/runStatus");
      config.put("postLevel", run.getPostLevel());
      config.put("userInfoURL", contextPath + "/userInfo?runId=" + runId);

      if ("grading".equals(mode)) {
        config.put("getXLSExportURL", contextPath + "/export?type=xlsexport&runId=" + runId);
        config.put("getSpecialExportURL",
            contextPath + "/specialExport?type=specialExport&runId=" + runId);
        config.put("getStudentListURL",
            contextPath + "/teacher/management/studentListExport?runId=" + runId);
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    Project project = run.getProject();
    addCommonConfigParametersWISE4(request, signedInUser, mode, contextPath, config, project);
  }

  private void addCommonConfigParametersWISE4(HttpServletRequest request, User signedInUser,
      String mode, String contextPath, JSONObject config, Project project) {
    assert project != null;
    try {
      config.put("wiseBaseURL", contextPath);
      config.put("contextPath", contextPath);
      config.put("mode", mode);
      config.put("projectMetadataURL", contextPath + "/metadata.html");
      String curriculumBaseWWW = appProperties.getProperty("curriculum_base_www");
      String rawProjectUrl = project.getModulePath();
      String projectURL = curriculumBaseWWW + rawProjectUrl;
      config.put("projectId", project.getId());
      config.put("parentProjectId", project.getParentProjectId());
      config.put("projectURL", projectURL);
      addProjectBaseURL(config, projectURL);
      config.put("studentUploadsBaseURL", appProperties.getProperty("studentuploads_base_www"));
      config.put("theme", "WISE");
      config.put("cRaterRequestURL", contextPath + "/c-rater");
      config.put("mainHomePageURL", contextPath);
      config.put("renewSessionURL", contextPath + "/session/renew");
      config.put("sessionLogOutURL", contextPath + "/logout");
      addStep(request, config);
      setUserLocale(request, signedInUser, config);
      addUserTypeAndHomeURL(request, signedInUser, config);
      addSessionTimeoutInterval(request, config);
      addStudentMaxTotalAssetSize(config);
      addRetrievalTimestamp(config);
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  private void addStep(HttpServletRequest request, JSONObject config) throws JSONException {
    String step = request.getParameter("step");
    if (step != null) {
      // this is set if the request is to preview the project and load a specific step such as 1.2
      config.put("step", step);
    }
  }

  private void addRetrievalTimestamp(JSONObject config) throws JSONException {
    Calendar now = Calendar.getInstance();
    config.put("retrievalTimestamp", now.getTimeInMillis());
  }

  private void addStudentMaxTotalAssetSize(JSONObject config) throws JSONException {
    Long studentMaxTotalAssetsSizeBytes = new Long(
        appProperties.getProperty("student_max_total_assets_size", "5242880"));
    config.put("studentMaxTotalAssetsSize", studentMaxTotalAssetsSizeBytes);
  }

  private void addSessionTimeoutInterval(HttpServletRequest request, JSONObject config)
      throws JSONException {
    int maxInactiveIntervalMS = request.getSession().getMaxInactiveInterval() * 1000;
    config.put("sessionTimeoutInterval", maxInactiveIntervalMS);
    // check 20 times during the session
    int sessionTimeoutCheckInterval = maxInactiveIntervalMS / 20;
    if (sessionTimeoutCheckInterval > 60000) {
      // session should be checked at least every 60 seconds.
      sessionTimeoutCheckInterval = 60000;
    }
    config.put("sessionTimeoutCheckInterval", sessionTimeoutCheckInterval);
  }

  private void addUserTypeAndHomeURL(HttpServletRequest request, User signedInUser,
      JSONObject config) throws JSONException {
    if (signedInUser != null) {
      UserDetails userDetails = (UserDetails) signedInUser.getUserDetails();
      if (userDetails instanceof StudentUserDetails) {
        config.put("userType", "student");
        config.put("indexURL", ControllerUtil.getPortalUrlString(request)
            + WISEAuthenticationProcessingFilter.STUDENT_DEFAULT_TARGET_PATH);
      } else if (userDetails instanceof TeacherUserDetails) {
        config.put("userType", "teacher");
        config.put("indexURL", ControllerUtil.getPortalUrlString(request)
            + WISEAuthenticationProcessingFilter.TEACHER_DEFAULT_TARGET_PATH);
      }
    } else {
      config.put("userType", "none");
    }
  }

  private void setUserLocale(HttpServletRequest request, User signedInUser, JSONObject config)
      throws JSONException {
    Locale locale = request.getLocale();
    String userSpecifiedLang = request.getParameter("lang");
    if (userSpecifiedLang != null) {
      locale = new Locale(userSpecifiedLang);
    } else {
      if (signedInUser != null) {
        String userLanguage = signedInUser.getUserDetails().getLanguage();
        if (userLanguage != null) {
          if (userLanguage.contains("_")) {
            String language = userLanguage.substring(0, userLanguage.indexOf("_"));
            String country = userLanguage.substring(userLanguage.indexOf("_") + 1);
            locale = new Locale(language, country);
          } else {
            locale = new Locale(userLanguage);
          }
        }
      }
    }
    config.put("locale", locale);
  }

  private void getRunConfigParameters(HttpServletRequest request, JSONObject config, Run run)
      throws JSONException, ObjectNotFoundException {
    String contextPath = request.getContextPath();
    Long runId = run.getId();
    config.put("runName", run.getName());
    config.put("runId", runId);
    config.put("annotationsURL", contextPath + "/annotation?type=annotation&runId=" + runId);
    config.put("runInfo", run.getInfo());
    config.put("isRealTimeEnabled", run.isRealTimeEnabled());
    config.put("webSocketURL", ControllerUtil.getWebSocketURL(request, contextPath));
    config.put("studentStatusURL", contextPath + "/studentStatus");
    config.put("runStatusURL", contextPath + "/runStatus");
    config.put("userInfo", getUserInfo(run));
    config.put("studentDataURL", contextPath + "/student/data"); // the url to get/post student data
    config.put("studentAssetsURL", contextPath + "/student/asset/" + runId);
    config.put("notebookURL", contextPath + "/student/notebook/run/" + runId);
    config.put("achievementURL", contextPath + "/achievement/" + runId);
    config.put("notificationURL", contextPath + "/notification/" + runId);
    config.put("startTime", run.getStartTimeMilliseconds());
    config.put("endTime", run.getEndTimeMilliseconds());
    config.put("isLockedAfterEndDate", run.isLockedAfterEndDate());
  }

  private void printConfigToResponse(HttpServletResponse response, JSONObject config)
      throws IOException {
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Pragma", "no-cache");
    response.setDateHeader("Expires", 0);
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.getWriter().write(config.toString());
  }

  private void addConstraintsDisabled(HttpServletRequest request, JSONObject config)
      throws JSONException {
    String isConstraintsDisabledStr = request.getParameter("isConstraintsDisabled");
    if (isConstraintsDisabledStr != null && Boolean.parseBoolean(isConstraintsDisabledStr)) {
      config.put("isConstraintsDisabled", true);
    }
  }

  private boolean hasRunReadAccess(User signedInUser, Run run) {
    return signedInUser.isAdmin()
        || runService.hasRunPermission(run, signedInUser, BasePermission.WRITE)
        || runService.hasRunPermission(run, signedInUser, BasePermission.READ);
  }

  private boolean hasRunWriteAccess(User signedInUser, Run run) {
    return signedInUser.isAdmin()
        || runService.hasRunPermission(run, signedInUser, BasePermission.WRITE);
  }

  private void addCommonConfigParameters(HttpServletRequest request, JSONObject config,
      Project project) throws JSONException {
    String rawProjectUrl = project.getModulePath();
    addCommonConfigParameters(request, config, project, rawProjectUrl);
  }

  private JSONObject getDefaultVLEConfig(HttpServletRequest request) throws JSONException {
    JSONObject config = new JSONObject();
    String contextPath = request.getContextPath();
    config.put("wiseBaseURL", contextPath);
    return config;
  }

  private void addCommonConfigParameters(HttpServletRequest request, JSONObject config,
      Project project, String rawProjectUrl) throws JSONException {
    assert project != null;
    String curriculumBaseWWW = appProperties.getProperty("curriculum_base_www");
    String projectURL = curriculumBaseWWW + rawProjectUrl;

    String contextPath = request.getContextPath();
    config.put("wiseBaseURL", contextPath);
    config.put("projectId", project.getId());
    config.put("parentProjectId", project.getParentProjectId());
    config.put("previewProjectURL", contextPath + "/preview/unit/" + project.getId());
    config.put("theme", "WISE");
    config.put("projectURL", projectURL);
    addProjectBaseURL(config, projectURL);
    config.put("studentUploadsBaseURL", appProperties.getProperty("studentuploads_base_www"));
    config.put("cRaterRequestURL", contextPath + "/c-rater");
    config.put("contextPath", contextPath);
    config.put("mainHomePageURL", contextPath);
    config.put("renewSessionURL", contextPath + "/session/renew");
    config.put("sessionTimeout", request.getSession().getMaxInactiveInterval());
    config.put("sessionLogOutURL", contextPath + "/logout");

    User signedInUser = ControllerUtil.getSignedInUser();
    setUserLocale(request, signedInUser, config);
    addUserTypeAndHomeURL(request, signedInUser, config);
    addStudentMaxTotalAssetSize(config);
    addRetrievalTimestamp(config);
  }

  private void addProjectBaseURL(JSONObject config, String projectURL) throws JSONException {
    int lastIndexOfSlash = projectURL.lastIndexOf("/");
    if (lastIndexOfSlash == -1) {
      lastIndexOfSlash = projectURL.lastIndexOf("\\");
    }
    config.put("projectBaseURL", projectURL.substring(0, lastIndexOfSlash) + "/");
  }

  /**
   * Adds a dummy user info to the config object, used in previewing WISE5 projects
   *
   * @param config
   */
  private void addDummyUserInfoToConfig(JSONObject config) {
    try {
      String dummyUserInfoJSONString = "{\"myUserInfo\": {" + "\"periodId\": 1,"
          + "\"workgroupId\": 1," + "\"myClassInfo\": {" + "\"classmateUserInfos\": [],"
          + "\"sharedTeacherUserInfos\": []," + "\"periods\": [{" + "\"periodId\": 1,"
          + "\"periodName\": \"1\"" + "}]," + "\"teacherUserInfo\": {" + "\"workgroupId\": 1,"
          + "\"username\": \"Preview Teacher\"" + "}" + "}," + "\"userIds\": [1],"
          + "\"periodName\": \"1\"," + "\"username\": \"Preview Team\"" + "}" + "}";
      JSONObject userInfoJSONObject = new JSONObject(dummyUserInfoJSONString);
      config.put("userInfo", userInfoJSONObject);
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  /**
   * Gets the workgroup for the currently-logged in user so that she may view the VLE.
   *
   * @param run
   * @return Workgroup for the currently-logged in user
   * @throws ObjectNotFoundException
   */
  private Workgroup getWorkgroup(Run run) throws ObjectNotFoundException {
    Workgroup workgroup = null;
    SecurityContext context = SecurityContextHolder.getContext();
    if (context.getAuthentication().getPrincipal() instanceof UserDetails) {
      UserDetails userDetails = (UserDetails) context.getAuthentication().getPrincipal();
      User user = userService.retrieveUser(userDetails);

      List<Workgroup> workgroupListByRunAndUser = workgroupService.getWorkgroupListByRunAndUser(run,
          user);

      if (workgroupListByRunAndUser.size() == 1) {
        workgroup = workgroupListByRunAndUser.get(0);
      } else if (workgroupListByRunAndUser.size() > 1) {
        // this user is in more than one workgroup so we will just get the last one
        workgroup = workgroupListByRunAndUser.get(workgroupListByRunAndUser.size() - 1);
      }
    }
    return workgroup;
  }

  /**
   * Obtain the user names for this workgroup
   *
   * @param workgroup
   *                    a Workgroup that we want the names from
   * @return a string of user names delimited by : e.g. "Jennifer Chiu (JenniferC829):helen zhang
   *         (helenz1115a)"
   */
  private String getUsernamesFromWorkgroup(Workgroup workgroup) {
    StringBuffer usernames = new StringBuffer();
    for (User user : workgroup.getMembers()) {
      String firstNameLastNameLogin = getFirstNameLastNameLogin(user);
      if (usernames.length() != 0) {
        usernames.append(":");
      }
      usernames.append(firstNameLastNameLogin);
    }
    return usernames.toString();
  }

  /**
   * Obtain the first name, last name, and login for the user
   *
   * @param user
   *               the User we want to obtain the first, last, login for
   * @return the first, last and login in this format below Jennifer Chiu (JenniferC829)
   */
  private String getFirstNameLastNameLogin(User user) {
    MutableUserDetails userDetails = user.getUserDetails();
    if (userDetails != null) {
      String username = userDetails.getUsername();
      String firstName = userDetails.getFirstname();
      String lastName = userDetails.getLastname();
      return firstName + " " + lastName + " (" + username + ")";
    }
    return "";
  }

  /**
   * Get the student ids from the workgroup
   *
   * @param workgroup
   *                    the workgroup to get student ids from
   * @return a JSONArray containing the student ids
   */
  private JSONArray getStudentIdsFromWorkgroup(Workgroup workgroup) {
    JSONArray studentIds = new JSONArray();
    for (User studentUser : workgroup.getMembers()) {
      studentIds.put(studentUser.getId());
    }
    return studentIds;
  }

  /**
   * Get the classmate user info
   *
   * @param classmateWorkgroup
   *                             the workgroup of the classmate
   * @return a json string containing the info for the classmate
   */
  private JSONObject getClassmateUserInfoJSON(Workgroup classmateWorkgroup, Run run,
      User loggedInUser) {
    JSONObject classmateUserInfo = new JSONObject();
    try {
      classmateUserInfo.put("workgroupId", classmateWorkgroup.getId());
      if (isAllowedToViewStudentNames(run, loggedInUser)) {
        String usernames = getUsernamesFromWorkgroup(classmateWorkgroup);
        classmateUserInfo.put("username", usernames);
      }
      if (classmateWorkgroup.getPeriod() != null) {
        classmateUserInfo.put("periodId", classmateWorkgroup.getPeriod().getId());
        classmateUserInfo.put("periodName", classmateWorkgroup.getPeriod().getName());
        classmateUserInfo.put("userIds", getStudentIdsFromWorkgroup(classmateWorkgroup));
        classmateUserInfo.put("users", getWorkgroupUsers(classmateWorkgroup, run, loggedInUser));
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return classmateUserInfo;
  }

  private boolean isAllowedToViewStudentNames(Run run, User user) {
    return isStudentInRun(run, user) || isTeacherOwnerOfRun(run, user)
        || isTeacherSharedOwnerOfRunWithViewStudentNamesPermission(run, user);
  }

  private boolean isStudentInRun(Run run, User user) {
    return SecurityUtils.isStudent(user) && run.isStudentAssociatedToThisRun(user);
  }

  private boolean isTeacherOwnerOfRun(Run run, User user) {
    return run.isOwner(user);
  }

  private boolean isTeacherSharedOwnerOfRunWithViewStudentNamesPermission(Run run, User user) {
    return SecurityUtils.isTeacher(user) && run.isTeacherAssociatedToThisRun(user)
        && runService.isAllowedToViewStudentNames(run, user);
  }

  /**
   * Get an array of user objects. Each user object contains the user id, name, first name, and last
   * name.
   *
   * @param workgroup
   * @return A JSONArray of user JSONObjects.
   */
  private JSONArray getWorkgroupUsers(Workgroup workgroup, Run run, User loggedInUser) {
    JSONArray users = new JSONArray();
    boolean canViewStudentNames = isAllowedToViewStudentNames(run, loggedInUser);
    for (User user : workgroup.getMembers()) {
      JSONObject userJSONObject = new JSONObject();
      try {
        MutableUserDetails userDetails = user.getUserDetails();
        userJSONObject.put("id", user.getId());
        if (canViewStudentNames) {
          String firstName = userDetails.getFirstname();
          String lastName = userDetails.getLastname();
          userJSONObject.put("name", firstName + " " + lastName);
          userJSONObject.put("firstName", firstName);
          userJSONObject.put("lastName", lastName);
        }
        users.put(userJSONObject);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return users;
  }
}
