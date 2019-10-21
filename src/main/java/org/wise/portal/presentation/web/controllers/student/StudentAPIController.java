/**
 * Copyright (c) 2007-2017 Regents of the University of California (Regents).
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 * <p>
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 * <p>
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 * <p>
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 * <p>
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.presentation.web.controllers.student;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.RandomStringUtils;
import org.hibernate.StaleObjectStateException;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.orm.hibernate5.HibernateOptimisticLockingFailureException;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.AccountQuestion;
import org.wise.portal.domain.PeriodNotFoundException;
import org.wise.portal.domain.RunHasEndedException;
import org.wise.portal.domain.StudentUserAlreadyAssociatedWithRunException;
import org.wise.portal.domain.authentication.Gender;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.Projectcode;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.StudentRunInfo;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.presentation.web.exception.NotAuthorizedException;
import org.wise.portal.presentation.web.response.ErrorResponse;
import org.wise.portal.presentation.web.response.LaunchRunErrorResponse;
import org.wise.portal.service.attendance.StudentAttendanceService;
import org.wise.portal.service.authentication.DuplicateUsernameException;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.student.StudentService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.workgroup.WorkgroupService;

/**
 * Controller for Student REST API
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author Jonathan Lim-Breitbart
 */
@RestController
@RequestMapping(value = "/api/student", produces = "application/json;charset=UTF-8")
public class StudentAPIController {

  @Autowired
  private RunService runService;

  @Autowired
  private StudentService studentService;

  @Autowired
  private StudentAttendanceService studentAttendanceService;

  @Autowired
  private Properties appProperties;

  @Autowired
  private UserService userService;

  @Autowired
  private ProjectService projectService;

  @Autowired
  private WorkgroupService workgroupService;

  @Autowired
  private Properties i18nProperties;

  @Value("${google.clientId:}")
  private String googleClientId;

  // path to project thumbnail image relative to project folder
  // TODO: make this dynamic, part of project metadata?
  private static final String PROJECT_THUMB_PATH = "/assets/project_thumb.png";

  @RequestMapping(value = "/runs", method = RequestMethod.GET)
  protected String handleGET(ModelMap modelMap,
      @RequestParam(value = "pLT", required = false) String previousLoginTime) throws Exception {
    User user = ControllerUtil.getSignedInUser();
    List<Run> runlist = runService.getRunList(user);
    JSONArray runListJSONArray = new JSONArray();
    for (Run run : runlist) {
      runListJSONArray.put(getRunJSON(user, run));
    }
    return runListJSONArray.toString();
  }

  private JSONObject getOwnerJSON(User owner) throws JSONException {
    JSONObject ownerJSON = new JSONObject();
    try {
      ownerJSON.put("id", owner.getId());
      TeacherUserDetails ownerUserDetails = (TeacherUserDetails) owner.getUserDetails();
      ownerJSON.put("displayName", ownerUserDetails.getDisplayname());
      ownerJSON.put("username", ownerUserDetails.getUsername());
      ownerJSON.put("firstName", ownerUserDetails.getFirstname());
      ownerJSON.put("lastName", ownerUserDetails.getLastname());
    } catch(org.hibernate.ObjectNotFoundException e) {
      System.out.println(e);
    }
    return ownerJSON;
  }

  /**
   * @param user The signed in User.
   * @param run The run object.
   * @return A JSON object that contains information about the run and workgroup
   * information if applicable.
   * @throws JSONException
   */
  private JSONObject getRunJSON(User user, Run run) throws JSONException {
    JSONObject runJSON = new JSONObject();
    Project project = run.getProject();
    String curriculumBaseWWW = appProperties.getProperty("curriculum_base_www");
    String projectThumb = "";
    String modulePath = project.getModulePath();
    int lastIndexOfSlash = modulePath.lastIndexOf("/");
    if (lastIndexOfSlash != -1) {
      /*
       * The project thumb url by default is the same (/assets/project_thumb.png)
       * for all projects, but this could be overwritten in the future
       * e.g. /253/assets/projectThumb.png
       */
      projectThumb = curriculumBaseWWW + modulePath.substring(0, lastIndexOfSlash) + PROJECT_THUMB_PATH;
    }
    StudentRunInfo studentRunInfo = studentService.getStudentRunInfo(user, run);
    Workgroup workgroup = studentRunInfo.getWorkgroup();
    JSONArray workgroupMembers = new JSONArray();
    StringBuilder workgroupNames = new StringBuilder();

    runJSON.put("id", run.getId());
    runJSON.put("name", run.getName());
    runJSON.put("periodName", run.getPeriodOfStudent(user).getName());
    runJSON.put("maxStudentsPerTeam", run.getMaxWorkgroupSize());
    runJSON.put("projectThumb", projectThumb);
    runJSON.put("runCode", run.getRuncode());
    runJSON.put("startTime", run.getStartTimeMilliseconds());
    runJSON.put("endTime", run.getEndTimeMilliseconds());
    runJSON.put("project", ControllerUtil.getProjectJSON(project));
    runJSON.put("owner", getOwnerJSON(run.getOwner()));

    /*
     * The workgroup can be null if the student registered for a run but
     * hasn't launched the project yet.
     */
    if (workgroup != null) {
      for (User member : workgroup.getMembers()) {
        MutableUserDetails userDetails = (MutableUserDetails) member.getUserDetails();
        JSONObject memberJSON = new JSONObject();
        memberJSON.put("id", member.getId());
        String firstName = userDetails.getFirstname();
        memberJSON.put("firstName", firstName);
        String lastName = userDetails.getLastname();
        memberJSON.put("lastName", lastName);
        memberJSON.put("username", userDetails.getUsername());
        memberJSON.put("isGoogleUser", userDetails.isGoogleUser());
        workgroupMembers.put(memberJSON);
        if (workgroupNames.length() > 0) {
          workgroupNames.append(", ");
        }
        workgroupNames.append(firstName + " " + lastName);
      }
      runJSON.put("workgroupId", studentRunInfo.getWorkgroup().getId());
      runJSON.put("workgroupNames", workgroupNames.toString());
      runJSON.put("workgroupMembers", workgroupMembers);
    }
    return runJSON;
  }

  /**
   * Get the run information to display to the student when they want to register for a run.
   * @param runCode The run code string.
   * @return A JSON object string containing information about the run such as the id, run code, title,
   * teacher name, and periods.
   */
  @RequestMapping(value = "/run/info", method = RequestMethod.GET)
  protected String getRunCodeInfo(@RequestParam("runCode") String runCode) throws JSONException {
    JSONObject runRegisterInfo = new JSONObject();
    try {
      Run run = runService.retrieveRunByRuncode(runCode);
      getRunInfo(runRegisterInfo, run);
    } catch (ObjectNotFoundException e) {
      runRegisterInfo.put("error", "runNotFound");
    }
    return runRegisterInfo.toString();
  }

  @RequestMapping(value = "/run/info-by-id", method = RequestMethod.GET)
  protected String getRunInfoById(@RequestParam("runId") Long runId) throws JSONException {
    JSONObject runRegisterInfo = new JSONObject();
    try {
      Run run = runService.retrieveById(runId);
      getRunInfo(runRegisterInfo, run);
    } catch (ObjectNotFoundException e) {
      runRegisterInfo.put("error", "runNotFound");
    }
    return runRegisterInfo.toString();
  }

  private void getRunInfo(JSONObject runJSONObject, Run run) throws JSONException {
    runJSONObject.put("id", run.getId());
    runJSONObject.put("name", run.getName());
    runJSONObject.put("runCode", run.getRuncode());
    User owner = run.getOwner();
    runJSONObject.put("teacherFirstName", owner.getUserDetails().getFirstname());
    runJSONObject.put("teacherLastName", owner.getUserDetails().getLastname());
    runJSONObject.put("startTime", run.getStartTimeMilliseconds());
    runJSONObject.put("endTime", run.getEndTimeMilliseconds());
    runJSONObject.put("periods", this.getPeriods(run));
  }

  @RequestMapping(value = "/run/launch", method = RequestMethod.POST)
  protected String launchRun(@RequestParam("runId") Long runId,
                             @RequestParam(value = "workgroupId", required = false) Long workgroupId,
                             @RequestParam("presentUserIds") String presentUserIds,
                             @RequestParam("absentUserIds") String absentUserIds,
                             HttpServletRequest request) throws Exception {
    Run run = runService.retrieveById(runId);
    JSONArray presentUserIdsJSONArray = new JSONArray(presentUserIds);
    Set<User> presentMembers = createMembers(presentUserIdsJSONArray);
    Workgroup workgroup = null;
    User user = ControllerUtil.getSignedInUser();

    for (User member: presentMembers) {
      if (workgroupService.isUserInAnyWorkgroupForRun(member, run)) {
        workgroup = workgroupService.getWorkgroupListByRunAndUser(run, member).get(0);
      }
    }
    if (workgroup == null) {
      if (run.isStudentAssociatedToThisRun(user)) {
        Group period = run.getPeriodOfStudent(user);
        String name = "Workgroup for user: " + user.getUserDetails().getUsername();
        workgroup = workgroupService.createWorkgroup(name, presentMembers, run, period);
        JSONObject response = performLaunchRun(runId, workgroupId, presentUserIds, absentUserIds,
            request, run, presentMembers, workgroup);
        return response.toString();
      } else {
        ErrorResponse errorResponse = new ErrorResponse("signedInUserNotAssociatedWithRun");
        return errorResponse.toString();
      }
    } else {
      Set<User> newMembers = membersNotInWorkgroup(workgroup, presentMembers);
      if (newMembers.size() + workgroup.getMembers().size() > run.getMaxWorkgroupSize()) {
        ErrorResponse errorResponse = new LaunchRunErrorResponse("tooManyMembersInWorkgroup", workgroup);
        return errorResponse.toString();
      }
      workgroupService.addMembers(workgroup, newMembers);
      JSONObject response = performLaunchRun(runId, workgroupId, presentUserIds, absentUserIds,
          request, run, presentMembers, workgroup);
      return response.toString();
    }
  }

  private Set<User> membersNotInWorkgroup(Workgroup workgroup, Set<User> presentMembers) {
    Set<User> membersNotInWorkgroup = new HashSet<>();
    for (User member: presentMembers) {
      if (!workgroup.getMembers().contains(member)) {
        membersNotInWorkgroup.add(member);
      }
    }
    return membersNotInWorkgroup;
  }

  private JSONObject performLaunchRun(Long runId, Long workgroupId, String presentUserIds,
      String absentUserIds, HttpServletRequest request, Run run, Set<User> presentMembers,
      Workgroup workgroup) throws ObjectNotFoundException, PeriodNotFoundException,
      StudentUserAlreadyAssociatedWithRunException, RunHasEndedException, JSONException {
    addStudentsToRunIfNecessary(run, presentMembers, workgroup);
    if (!run.isEnded()) {
      saveStudentAttendance(runId, workgroupId, presentUserIds, absentUserIds);
      updateRunStatistics(run);
    }
    StartProjectController.notifyServletSession(request, run);
    return generateStartProjectUrlResponse(request, workgroup);
  }

  private void addStudentsToRunIfNecessary(Run run, Set<User> presentMembers, Workgroup workgroup)
      throws ObjectNotFoundException, PeriodNotFoundException, RunHasEndedException, StudentUserAlreadyAssociatedWithRunException {
    Projectcode projectcode = new Projectcode(run.getRuncode(), workgroup.getPeriod().getName());
    for (User presentMember : presentMembers) {
      if (!run.isStudentAssociatedToThisRun(presentMember)) {
        studentService.addStudentToRun(presentMember, projectcode);
      }
    }
  }

  private void saveStudentAttendance(Long runId, Long workgroupId, String presentUserIds,
      String absentUserIds) {
    Date loginTimestamp = new Date();
    studentAttendanceService.addStudentAttendanceEntry(workgroupId, runId, loginTimestamp,
        presentUserIds, absentUserIds);
  }

  private void updateRunStatistics(Run run) {
    this.runService.updateRunStatistics(run.getId());
  }

  private JSONObject generateStartProjectUrlResponse(HttpServletRequest request, Workgroup workgroup) throws JSONException {
    String startProjectUrl = projectService.generateStudentStartProjectUrlString(workgroup, request.getContextPath());
    JSONObject response = new JSONObject();
    response.put("startProjectUrl", startProjectUrl);
    return response;
  }

  private Set<User> createMembers(JSONArray userIds)
      throws JSONException, ObjectNotFoundException {
    Set<User> members = new HashSet<User>();
    addUserToMembers(members, userIds);
    return members;
  }

  private void addUserToMembers(Set<User> members, JSONArray userIds)
      throws JSONException, ObjectNotFoundException {
    for (int p = 0; p < userIds.length(); p++) {
      long userId = userIds.getInt(p);
      members.add(userService.retrieveById(userId));
    }
  }

  /**
   * Add a student to a run.
   * @param runCode The run code string.
   * @param period The period string.
   * @return If the student is successfully added to the run, we will return a JSON object string
   * that contains the information about the run. If the student is not successfully added to the
   * run, we will return a JSON object string containing an error field with an error string.
   */
  @RequestMapping(value = "/run/register", method = RequestMethod.POST)
  protected String addStudentToRun(@RequestParam("runCode") String runCode,
      @RequestParam("period") String period) {
    JSONObject responseJSONObject = new JSONObject();
    String error = "";
    User user = ControllerUtil.getSignedInUser();
    Projectcode projectCode = new Projectcode(runCode, period);
    boolean addedStudent = false;
    try {
      int maxLoop = 100; // To ensure that the following while loop gets run at most this many times.
      int currentLoopIndex = 0;
      while (currentLoopIndex < maxLoop) {
        try {
          studentService.addStudentToRun(user, projectCode);
          Run run = runService.retrieveRunByRuncode(runCode);
          responseJSONObject = this.getRunJSON(user, run);
          addedStudent = true;
        } catch (HibernateOptimisticLockingFailureException holfe) {
          /*
           * Multiple students tried to create an account at the same time, resulting in this exception.
           * We will try saving again.
           */
          currentLoopIndex++;
          continue;
        } catch (StaleObjectStateException sose) {
          /*
           * Multiple students tried to create an account at the same time, resulting in this exception.
           * We will try saving again.
           */
          currentLoopIndex++;
          continue;
        } catch (JSONException je) {
          je.printStackTrace();
        }
        /*
         * If it reaches here, it means the hibernate optimistic locking exception was not thrown so we
         * can exit the loop.
         */
        break;
      }
    } catch (ObjectNotFoundException e) {
      error = "runCodeNotFound";
    } catch (PeriodNotFoundException e) {
      error = "periodNotFound";
    } catch (StudentUserAlreadyAssociatedWithRunException se) {
      error = "studentAlreadyAssociatedWithRun";
    } catch (RunHasEndedException e) {
      error = "runHasEnded";
    }

    if (!error.equals("")) {
      // there was an error and we were unable to add the student to the run
      try {
        responseJSONObject.put("error", error);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    } else if (!addedStudent) {
      /*
       * there were no errors but we were unable to add the student to the
       * run for some reason so we will just return a generic error message
       */
      try {
        responseJSONObject.put("error", "failedToAddStudentToRun");
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return responseJSONObject.toString();
  }

  /**
   * Get the periods in a run.
   * @param run The run object.
   * @return A JSON array containing strings.
   */
  private JSONArray getPeriods(Run run) {
    JSONArray periodsJSONArray = new JSONArray();
    Set<Group> periods = run.getPeriods();
    for (Group period : periods) {
      periodsJSONArray.put(period.getName());
    }
    return periodsJSONArray;
  }

  @RequestMapping(value = "/config", method = RequestMethod.GET)
  protected String getConfig(ModelMap modelMap, HttpServletRequest request) throws JSONException {
    JSONObject configJSON = new JSONObject();
    String contextPath = request.getContextPath();
    configJSON.put("contextPath", contextPath);
    configJSON.put("googleClientId", googleClientId);
    configJSON.put("logOutURL", contextPath + "/logout");
    configJSON.put("currentTime", System.currentTimeMillis());
    return configJSON.toString();
  }

  private Date getLastLoginTime(String previousLoginTime, User user) {
    Date lastLoginTime = ((StudentUserDetails) user.getUserDetails()).getLastLoginTime();
    if (previousLoginTime != null) {
      Calendar cal = Calendar.getInstance();
      try {
        Long previousLogin = new Long(previousLoginTime);
        cal.setTimeInMillis(previousLogin);
        return cal.getTime();
      } catch (NumberFormatException nfe) {
      }
    }
    return lastLoginTime;
  }

  @RequestMapping(value = "/register", method = RequestMethod.POST)
  protected String createStudentAccount(
      @RequestBody Map<String, String> studentFields, HttpServletRequest request)
      throws DuplicateUsernameException {
    StudentUserDetails studentUserDetails = new StudentUserDetails();
    studentUserDetails.setFirstname(studentFields.get("firstName"));
    studentUserDetails.setLastname(studentFields.get("lastName"));
    studentUserDetails.setGender(getGender(studentFields.get("gender")));
    studentUserDetails.setAccountQuestion(studentFields.get("securityQuestion"));
    studentUserDetails.setAccountAnswer(studentFields.get("securityQuestionAnswer"));
    studentUserDetails.setBirthday(getBirthDate(studentFields.get("birthMonth"), studentFields.get("birthDay")));
    studentUserDetails.setSignupdate(Calendar.getInstance().getTime());
    if (studentFields.containsKey("googleUserId")) {
      studentUserDetails.setGoogleUserId(studentFields.get("googleUserId"));
      studentUserDetails.setPassword(RandomStringUtils.random(10, true, true));
    } else {
      studentUserDetails.setPassword(studentFields.get("password"));
    }
    Locale locale = request.getLocale();
    studentUserDetails.setLanguage(locale.getLanguage());
    User createdUser = this.userService.createUser(studentUserDetails);
    return createdUser.getUserDetails().getUsername();
  }

  private Gender getGender(String gender) {
    if (gender.equals("MALE")) {
      return Gender.MALE;
    } else if (gender.equals("FEMALE")) {
      return Gender.FEMALE;
    } else {
      return Gender.UNSPECIFIED;
    }
  }

  private Date getBirthDate(String birthMonthStr, String birthDayStr) {
    Integer birthMonth = Integer.parseInt(birthMonthStr);
    Integer birthDay = Integer.parseInt(birthDayStr);
    Calendar birthday = Calendar.getInstance();
    birthday.set(Calendar.MONTH, birthMonth - 1); // month is 0 indexed
    birthday.set(Calendar.DATE, birthDay);
    return birthday.getTime();
  }

  @RequestMapping(value = "/register/questions", method = RequestMethod.GET)
  protected String getSecurityQuestions() throws JSONException {
    JSONArray questions = new JSONArray();
    AccountQuestion[] accountQuestionKeys = AccountQuestion.class.getEnumConstants();
    for (AccountQuestion accountQuestionKey: accountQuestionKeys) {
      questions.put(getSecurityQuestionJSONObject(accountQuestionKey));
    }
    return questions.toString();
  }

  protected JSONObject getSecurityQuestionJSONObject(AccountQuestion accountQuestionKey) throws JSONException {
    String accountQuestion = getAccountQuestionValue(accountQuestionKey.name());
    JSONObject accountQuestionObject = new JSONObject();
    accountQuestionObject.put("key", accountQuestionKey);
    accountQuestionObject.put("value", accountQuestion);
    return accountQuestionObject;
  }

  private String getAccountQuestionValue(String accountQuestionKey) {
    return i18nProperties.getProperty("accountquestions." + accountQuestionKey);
  }

  @RequestMapping(value = "/profile/update", method = RequestMethod.POST)
  protected String updateProfile(HttpServletRequest request,
                                 @RequestParam("username") String username,
                                 @RequestParam("language") String language) throws NotAuthorizedException, JSONException {
    User user = ControllerUtil.getSignedInUser();
    if (user.getUserDetails().getUsername().equals(username)) {
      StudentUserDetails studentUserDetails = (StudentUserDetails) user.getUserDetails();
      studentUserDetails.setLanguage(language);
      userService.updateUser(user);
      JSONObject response = new JSONObject();
      response.put("message", "success");
      return response.toString();
    } else {
      throw new NotAuthorizedException("username is not the same as signed in user");
    }
  }

  @RequestMapping(value = "/teacher-list", method = RequestMethod.GET)
  protected String getTeacherList() {
    JSONArray teacherList = new JSONArray();
    User user = ControllerUtil.getSignedInUser();
    if (user != null) {
      HashMap<String, Boolean> foundTeachers = new HashMap<String, Boolean>();
      List<Run> runList = runService.getRunList(user);
      for (Run run: runList) {
        User owner = run.getOwner();
        TeacherUserDetails userDetails = (TeacherUserDetails) owner.getUserDetails();
        String username = userDetails.getUsername();
        if (foundTeachers.get(username) == null) {
          try {
            JSONObject teacherJSON = new JSONObject();
            teacherJSON.put("username", username);
            teacherJSON.put("displayName", userDetails.getDisplayname());
            teacherList.put(teacherJSON);
            foundTeachers.put(username, true);
          } catch(JSONException e) {

          }
        }
      }
    }
    return teacherList.toString();
  }

  @RequestMapping(value = "/can-be-added-to-workgroup", method = RequestMethod.GET)
  protected String canBeAddedToWorkgroup(@RequestParam("runId") Long runId,
                                         @RequestParam(value = "workgroupId", required = false) Long workgroupId,
                                         @RequestParam("userId") Long userId) throws JSONException, ObjectNotFoundException {
    User user = userService.retrieveById(userId);
    Run run = runService.retrieveById(runId);
    JSONObject response = new JSONObject();
    JSONArray members = new JSONArray();
    response.put("status", false);
    response.put("isTeacher", user.isTeacher());
    Workgroup workgroup = null;
    if (workgroupId != null) {
      workgroup = workgroupService.retrieveById(workgroupId);
    } else if (workgroupService.isUserInAnyWorkgroupForRun(user, run)) {
      workgroup = workgroupService.getWorkgroupListByRunAndUser(run, user).get(0);
    }
    if (!workgroupService.isUserInAnyWorkgroupForRun(user, run) ||
        (workgroup != null && workgroupService.isUserInWorkgroupForRun(user, run, workgroup))) {
      members.put(convertUserToJSON(user));
      response.put("status", true);
    }
    if (workgroup != null) {
      response.put("addUserToWorkgroup", true);
      response.put("workgroupId", workgroup.getId());
      response.put("status", true);
      for (User member: workgroup.getMembers()) {
        if (!member.getId().equals(userId)) {
          members.put(convertUserToJSON(member));
        }
      }
      if (workgroup.getMembers().size() == run.getMaxWorkgroupSize() &&
          !workgroup.getMembers().contains(ControllerUtil.getSignedInUser())) {
        response.put("status", false);
      }
    }
    response.put("workgroupMembers", members);
    return response.toString();
  }

  private JSONObject convertUserToJSON(User user) throws JSONException {
    JSONObject userObject = new JSONObject();
    MutableUserDetails userDetails = user.getUserDetails();
    userObject.put("id", user.getId());
    userObject.put("username", userDetails.getUsername());
    userObject.put("firstName", userDetails.getFirstname());
    userObject.put("lastName", userDetails.getLastname());
    userObject.put("isGoogleUser", user.getUserDetails().isGoogleUser());
    return userObject;
  }
}
