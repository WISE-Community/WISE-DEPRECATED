/**
 * Copyright (c) 2007-2019 Regents of the University of California (Regents).
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

import java.util.ArrayList;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.orm.hibernate5.HibernateOptimisticLockingFailureException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.response.ErrorResponse;
import org.wise.portal.presentation.web.response.LaunchRunErrorResponse;
import org.wise.portal.presentation.web.response.SimpleResponse;
import org.wise.portal.service.attendance.StudentAttendanceService;
import org.wise.portal.service.authentication.DuplicateUsernameException;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.student.StudentService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.workgroup.WorkgroupService;

/**
 * Student REST API
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author Jonathan Lim-Breitbart
 */
@RestController
@RequestMapping("/api/student")
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

  private static final String PROJECT_THUMB_PATH = "/assets/project_thumb.png";

  @GetMapping("/runs")
  List<HashMap<String, Object>> getRuns(Authentication authentication) {
    User user = userService.retrieveUserByUsername(authentication.getName());
    List<HashMap<String, Object>> runList = new ArrayList<HashMap<String, Object>>();
    for (Run run : runService.getRunList(user)) {
      runList.add(getRunMap(user, run));
    }
    return runList;
  }

  private HashMap<String, Object> getRunMap(User user, Run run) {
    HashMap<String, Object> runMap = new HashMap<String, Object>();
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

    runMap.put("id", run.getId());
    runMap.put("name", run.getName());
    runMap.put("periodName", run.getPeriodOfStudent(user).getName());
    runMap.put("maxStudentsPerTeam", run.getMaxWorkgroupSize());
    runMap.put("projectThumb", projectThumb);
    runMap.put("runCode", run.getRuncode());
    runMap.put("startTime", run.getStartTimeMilliseconds());
    runMap.put("endTime", run.getEndTimeMilliseconds());
    runMap.put("project", getProjectMap(project));
    runMap.put("owner", convertUserToMap(run.getOwner()));

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
        runMap.put("workgroupId", workgroup.getId());
        runMap.put("workgroupNames", workgroupNames.toString());
        runMap.put("workgroupMembers", workgroupMembers);
      }
    }
    return runMap;
  }

  private HashMap<String, Object> getProjectMap(Project project) {
    HashMap<String, Object> projectMap = new HashMap<String, Object>();
    projectMap.put("id", project.getId());
    projectMap.put("name", project.getName());
    projectMap.put("metadata", project.getMetadata());
    projectMap.put("dateCreated", project.getDateCreated());
    projectMap.put("dateArchived", project.getDateDeleted());
    projectMap.put("projectThumb", projectService.getProjectPath(project) + PROJECT_THUMB_PATH);
    projectMap.put("owner", convertUserToMap(project.getOwner()));
    projectMap.put("sharedOwners", projectService.getProjectSharedOwnersList(project));
    projectMap.put("parentId", project.getParentProjectId());
    projectMap.put("wiseVersion", project.getWiseVersion());
    projectMap.put("uri", projectService.getProjectURI(project));
    projectMap.put("license", projectService.getLicensePath(project));
    return projectMap;
  }

  @GetMapping("/run/info")
  HashMap<String, Object> getRunInfoByRunCode(@RequestParam("runCode") String runCode) {
    try {
      return getRunInfo(runService.retrieveRunByRuncode(runCode));
    } catch (ObjectNotFoundException e) {
      return createRunNotFoundInfo();
    }
  }

  @GetMapping("/run/info-by-id")
  HashMap<String, Object> getRunInfoById(@RequestParam("runId") Long runId) {
    try {
      return getRunInfo(runService.retrieveById(runId));
    } catch (ObjectNotFoundException e) {
      return createRunNotFoundInfo();
    }
  }

  private HashMap<String, Object> createRunNotFoundInfo() {
    HashMap<String, Object> info = new HashMap<String, Object>();
    info.put("error", "runNotFound");
    return info;
  }

  private HashMap<String, Object> getRunInfo(Run run) {
    HashMap<String, Object> info = new HashMap<String, Object>();
    info.put("id", String.valueOf(run.getId()));
    info.put("name", run.getName());
    info.put("runCode", run.getRuncode());
    info.put("startTime", run.getStartTimeMilliseconds());
    info.put("endTime", run.getEndTimeMilliseconds());
    info.put("periods", getPeriodNames(run));
    User owner = run.getOwner();
    info.put("teacherFirstName", owner.getUserDetails().getFirstname());
    info.put("teacherLastName", owner.getUserDetails().getLastname());
    return info;
  }

  @PostMapping("/run/launch")
  HashMap<String, Object> launchRun(Authentication auth,
      @RequestParam("runId") Long runId,
      @RequestParam(value = "workgroupId", required = false) Long workgroupId,
      @RequestParam("presentUserIds") String presentUserIds,
      @RequestParam("absentUserIds") String absentUserIds,
      HttpServletRequest request) throws Exception {
    Run run = runService.retrieveById(runId);
    presentUserIds = presentUserIds.substring(1, presentUserIds.length() - 1);
    String[] presentUserIdsArray = presentUserIds.split(",", 0);
    Set<User> presentMembers = getUsers(presentUserIdsArray);
    Workgroup workgroup = null;
    User user = userService.retrieveUserByUsername(auth.getName());
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
        return getLaunchRunMap(runId, workgroupId, presentUserIds, absentUserIds,
            request, run, presentMembers, workgroup);
      } else {
        ErrorResponse errorResponse = new ErrorResponse("signedInUserNotAssociatedWithRun");
        return errorResponse.toMap();
      }
    } else {
      Set<User> newMembers = membersNotInWorkgroup(workgroup, presentMembers);
      if (newMembers.size() + workgroup.getMembers().size() > run.getMaxWorkgroupSize()) {
        ErrorResponse errorResponse = new LaunchRunErrorResponse("tooManyMembersInWorkgroup", workgroup);
        return errorResponse.toMap();
      }
      workgroupService.addMembers(workgroup, newMembers);
      return getLaunchRunMap(runId, workgroupId, presentUserIds, absentUserIds,
          request, run, presentMembers, workgroup);
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

  private HashMap<String, Object> getLaunchRunMap(Long runId, Long workgroupId, String presentUserIds,
      String absentUserIds, HttpServletRequest request, Run run, Set<User> presentMembers,
      Workgroup workgroup) throws ObjectNotFoundException, PeriodNotFoundException,
      StudentUserAlreadyAssociatedWithRunException, RunHasEndedException {
    addStudentsToRunIfNecessary(run, presentMembers, workgroup);
    if (!run.isEnded()) {
      saveStudentAttendance(runId, workgroupId, presentUserIds, absentUserIds);
      runService.updateRunStatistics(run.getId());
    }
    return generateStartProjectUrlMap(request, workgroup);
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

  private HashMap<String, Object> generateStartProjectUrlMap(
      HttpServletRequest request, Workgroup workgroup) {
    HashMap<String, Object> map = new HashMap<String, Object>();
    map.put("startProjectUrl", projectService.generateStudentStartProjectUrlString(
        workgroup, request.getContextPath()));
    return map;
  }

  private Set<User> getUsers(String[] userIds) throws ObjectNotFoundException {
    Set<User> users = new HashSet<User>();
    for (int i = 0; i < userIds.length; i++) {
      Long userId = Long.parseLong(userIds[i]);
      users.add(userService.retrieveById(userId));
    }
    return users;
  }

  /**
   * Add the logged in student to a run.
   *
   * @param runCode The run code string.
   * @param period The period string.
   * @return If the student is successfully added to the run, we will return a
   *         map that contains the information about the run. If
   *         the student is not successfully added to the run, we will return a
   *         map containing an error field with an error string.
   */
  @PostMapping("/run/register")
  HashMap<String, Object> addStudentToRun(Authentication auth,
      @RequestParam("runCode") String runCode,
      @RequestParam("period") String period) {
    User user = userService.retrieveUserByUsername(auth.getName());
    Projectcode projectCode = new Projectcode(runCode, period);
    int maxLoop = 100; // To ensure that the following while loop gets run at most this many times.
    int currentLoopIndex = 0;
    while (currentLoopIndex < maxLoop) {
      try {
        studentService.addStudentToRun(user, projectCode);
        Run run = runService.retrieveRunByRuncode(runCode);
        HashMap<String, Object> runMap = getRunMap(user, run);
        return runMap;
      } catch (ObjectNotFoundException e) {
        ErrorResponse response = new ErrorResponse("runCodeNotFound");
        return response.toMap();
      } catch (PeriodNotFoundException e) {
        ErrorResponse response = new ErrorResponse("periodNotFound");
        return response.toMap();
      } catch (StudentUserAlreadyAssociatedWithRunException se) {
        ErrorResponse response = new ErrorResponse("alreadyAddedRun");
        return response.toMap();
      } catch (RunHasEndedException e) {
        ErrorResponse response = new ErrorResponse("runHasEnded");
        return response.toMap();
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
      }
    }

    /*
     * there were no errors but we were unable to add the student to the
     * run for some reason so we will just return a generic error message
     */
    ErrorResponse response = new ErrorResponse("failedToAddStudentToRun");
    return response.toMap();
  }

  private List<String> getPeriodNames(Run run) {
    List<String> periods = new ArrayList<String>();
    for (Group period : run.getPeriods()) {
      periods.add(period.getName());
    }
    return periods;
  }

  @GetMapping("/config")
  HashMap<String, String> getConfig(HttpServletRequest request) {
    HashMap<String, String> config = new HashMap<String, String>();
    String contextPath = request.getContextPath();
    config.put("contextPath", contextPath);
    config.put("logOutURL", contextPath + "/logout");
    config.put("googleClientId", googleClientId);
    config.put("currentTime", String.valueOf(System.currentTimeMillis()));
    return config;
  }

  @PostMapping("/register")
  String createStudentAccount(@RequestBody Map<String, String> studentFields,
      HttpServletRequest request) throws DuplicateUsernameException {
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
    User createdUser = userService.createUser(studentUserDetails);
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

  @GetMapping("/register/questions")
  List<HashMap<String, String>> getSecurityQuestions() {
    List<HashMap<String, String>> questions = new ArrayList<HashMap<String, String>>();
    for (AccountQuestion accountQuestionKey : AccountQuestion.class.getEnumConstants()) {
      HashMap<String, String> question = new HashMap<String, String>();
      question.put("key", accountQuestionKey.toString());
      question.put("value", i18nProperties.getProperty("accountquestions." + accountQuestionKey));
      questions.add(question);
    }
    return questions;
  }

  @PostMapping("/profile/update")
  SimpleResponse updateProfile(Authentication auth, @RequestParam("language") String language) {
    User user = userService.retrieveUserByUsername(auth.getName());
    StudentUserDetails studentUserDetails = (StudentUserDetails) user.getUserDetails();
    studentUserDetails.setLanguage(language);
    userService.updateUser(user);
    return new SimpleResponse("success", "profileUpdated");
  }

  @GetMapping("/teacher-list")
  Set<HashMap<String, String>> getAssociatedTeachers(Authentication auth) {
    User user = userService.retrieveUserByUsername(auth.getName());
    Set<HashMap<String, String>> teachers = new HashSet<HashMap<String, String>>();
    for (Run run : runService.getRunList(user)) {
      User teacher = run.getOwner();
      TeacherUserDetails tud = (TeacherUserDetails) teacher.getUserDetails();
      HashMap<String, String> teacherInfo = new HashMap<String, String>();
      teacherInfo.put("username", tud.getUsername());
      teacherInfo.put("displayName", tud.getDisplayname());
      teachers.add(teacherInfo);
    }
    return teachers;
  }

  @GetMapping("/can-be-added-to-workgroup")
  HashMap<String, Object> canBeAddedToWorkgroup(Authentication auth,
      @RequestParam("runId") Long runId,
      @RequestParam(value = "workgroupId", required = false) Long workgroupId,
      @RequestParam("userId") Long userId) throws ObjectNotFoundException {
    User user = userService.retrieveById(userId);
    Run run = runService.retrieveById(runId);
    HashMap<String, Object> response = new HashMap<String, Object>();
    List<HashMap<String, Object>> members = new ArrayList<HashMap<String, Object>>();
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
      members.add(convertUserToMap(user));
      response.put("status", true);
    }
    if (workgroup != null) {
      response.put("addUserToWorkgroup", true);
      response.put("workgroupId", workgroup.getId());
      response.put("status", true);
      for (User member : workgroup.getMembers()) {
        if (!member.getId().equals(userId)) {
          members.add(convertUserToMap(member));
        }
      }
      User signedInUser = userService.retrieveUserByUsername(auth.getName());
      if (workgroup.getMembers().size() == run.getMaxWorkgroupSize() &&
          !workgroup.getMembers().contains(signedInUser)) {
        response.put("status", false);
      }
    }
    response.put("workgroupMembers", members);
    return response;
  }

  private HashMap<String, Object> convertUserToMap(User user) {
    HashMap<String, Object> userMap = new HashMap<String, Object>();
    MutableUserDetails userDetails = user.getUserDetails();
    userMap.put("id", user.getId());
    userMap.put("username", userDetails.getUsername());
    userMap.put("firstName", userDetails.getFirstname());
    userMap.put("lastName", userDetails.getLastname());
    userMap.put("isGoogleUser", userDetails.isGoogleUser());
    if (userDetails instanceof TeacherUserDetails) {
      userMap.put("displayName", ((TeacherUserDetails) userDetails).getDisplayname());
    }
    return userMap;
  }
}
