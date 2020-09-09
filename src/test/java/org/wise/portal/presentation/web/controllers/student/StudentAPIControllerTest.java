package org.wise.portal.presentation.web.controllers.student;

import static org.easymock.EasyMock.*;
import static org.junit.Assert.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Properties;
import java.util.Set;

import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.PeriodNotFoundException;
import org.wise.portal.domain.RunHasEndedException;
import org.wise.portal.domain.StudentUserAlreadyAssociatedWithRunException;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.Projectcode;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.controllers.APIControllerTest;
import org.wise.portal.presentation.web.exception.InvalidNameException;
import org.wise.portal.presentation.web.response.SimpleResponse;
import org.wise.portal.service.attendance.StudentAttendanceService;
import org.wise.portal.service.authentication.DuplicateUsernameException;
import org.wise.portal.service.student.StudentService;

@RunWith(EasyMockRunner.class)
public class StudentAPIControllerTest extends APIControllerTest {

  @TestSubject
  private StudentAPIController studentAPIController = new StudentAPIController();

  @Mock
  private StudentService studentService;

  @Mock
  private StudentAttendanceService studentAttendanceService;

  @Mock(fieldName = "appProperties")
  private Properties appProperties;

  @Mock(fieldName = "i18nProperties")
  private Properties i18nProperties;

  @Test
  public void updateProfile_WithLocale_ReturnSuccess() {
    String language = "ja";
    expect(userService.retrieveUserByUsername(STUDENT_USERNAME)).andReturn(student1);
    userService.updateUser(student1);
    expectLastCall();
    replay(userService);
    SimpleResponse response = studentAPIController.updateProfile(studentAuth, language);
    assertEquals("success", response.getStatus());
    verify(userService);
  }

  @Test
  public void getAssociatedTeachers_WithMultipleTeachersAndRuns_ReturnSameTeacherOnce() {
    expect(userService.retrieveUserByUsername(STUDENT_USERNAME)).andReturn(student1);
    replay(userService);
    expect(runService.getRunList(student1)).andReturn(runs);
    replay(runService);
    Set<HashMap<String, String>> associatedTeacher = studentAPIController
        .getAssociatedTeachers(studentAuth);
    assertEquals(2, associatedTeacher.size());
  }

  @Test
  public void launchRun_OnePresentUser_LaunchRun() throws Exception {
    expect(runService.retrieveById(runId1)).andReturn(run1);
    runService.updateRunStatistics(runId1);
    expectLastCall();
    replay(runService);
    expect(userService.retrieveById(1L)).andReturn(student1);
    expect(userService.retrieveUserByUsername(STUDENT_USERNAME)).andReturn(student1);
    replay(userService);
    expect(workgroupService.isUserInAnyWorkgroupForRun(student1, run1)).andReturn(true);
    List<Workgroup> workgroups = new ArrayList<Workgroup>();
    workgroups.add(workgroup1);
    Set<User> newMembers = new HashSet<User>();
    expect(workgroupService.getWorkgroupListByRunAndUser(run1, student1)).andReturn(workgroups);
    workgroupService.addMembers(workgroup1, newMembers);
    expectLastCall();
    replay(workgroupService);
    expect(projectService.generateStudentStartProjectUrlString(isA(Workgroup.class),
        isA(String.class))).andReturn("/wise/run/1");
    replay(projectService);
    studentAttendanceService.addStudentAttendanceEntry(isA(Long.class), isA(Long.class),
        isA(Date.class), isA(String.class), isA(String.class));
    expect(request.getContextPath()).andReturn("wise");
    replay(request);
    HashMap<String, Object> launchRunMap = studentAPIController.launchRun(studentAuth, runId1, null,
        "[1]", "[]", request);
    assertEquals("/wise/run/1", launchRunMap.get("startProjectUrl"));
    verify(runService);
    verify(userService);
    verify(workgroupService);
    verify(projectService);
    verify(request);
  }

  @Test
  public void getRunInfoByRunCode_RunExistsInDB_ReturnRunInfo() throws ObjectNotFoundException {
    expect(runService.retrieveRunByRuncode(RUN1_RUNCODE)).andReturn(run1);
    replay(runService);
    HashMap<String, Object> info = studentAPIController.getRunInfoByRunCode(RUN1_RUNCODE);
    assertEquals("1", info.get("id"));
    assertEquals(RUN1_RUNCODE, info.get("runCode"));
    verify(runService);
  }

  @Test
  public void getRunInfoByRunCode_RunNotInDB_ReturnRunInfo() throws ObjectNotFoundException {
    String runCodeNotInDB = "runCodeNotInDB";
    expect(runService.retrieveRunByRuncode(runCodeNotInDB))
        .andThrow(new ObjectNotFoundException(runCodeNotInDB, Run.class));
    replay(runService);
    HashMap<String, Object> info = studentAPIController.getRunInfoByRunCode(runCodeNotInDB);
    assertEquals(1, info.size());
    assertEquals("runNotFound", info.get("error"));
    verify(runService);
  }

  @Test
  public void getRunInfoById_RunExistsInDB_ReturnRunInfo() throws ObjectNotFoundException {
    expect(runService.retrieveById(runId1)).andReturn(run1);
    replay(runService);
    HashMap<String, Object> info = studentAPIController.getRunInfoById(runId1);
    assertEquals("1", info.get("id"));
    assertEquals(RUN1_RUNCODE, info.get("runCode"));
    verify(runService);
  }

  @Test
  public void getRunInfoById_RunNotInDB_ReturnRunInfo() throws ObjectNotFoundException {
    Long runIdNotInDB = -1L;
    expect(runService.retrieveById(runIdNotInDB))
        .andThrow(new ObjectNotFoundException(runIdNotInDB, Run.class));
    replay(runService);
    HashMap<String, Object> info = studentAPIController.getRunInfoById(runIdNotInDB);
    assertEquals(1, info.size());
    assertEquals("runNotFound", info.get("error"));
    verify(runService);
  }

  @Test
  public void getSecurityQuestions_DefaultQuestions_ReturnSixQuestions() {
    expect(i18nProperties.getProperty("accountquestions.QUESTION_ONE"))
        .andReturn("account question 1");
    expect(i18nProperties.getProperty("accountquestions.QUESTION_TWO"))
        .andReturn("account question 2");
    expect(i18nProperties.getProperty("accountquestions.QUESTION_THREE"))
        .andReturn("account question 3");
    expect(i18nProperties.getProperty("accountquestions.QUESTION_FOUR"))
        .andReturn("account question 4");
    expect(i18nProperties.getProperty("accountquestions.QUESTION_FIVE"))
        .andReturn("account question 5");
    expect(i18nProperties.getProperty("accountquestions.QUESTION_SIX"))
        .andReturn("account question 6");
    replay(i18nProperties);
    List<HashMap<String, String>> questions = studentAPIController.getSecurityQuestions();
    assertEquals(6, questions.size());
    assertEquals("QUESTION_ONE", questions.get(0).get("key"));
    assertEquals("account question 1", questions.get(0).get("value"));
    assertEquals("QUESTION_SIX", questions.get(5).get("key"));
    assertEquals("account question 6", questions.get(5).get("value"));
    verify(i18nProperties);
  }

  @Test
  public void getRuns_StudentInThreeRuns_ReturnThreeRuns() {
    expect(userService.retrieveUserByUsername(STUDENT_USERNAME)).andReturn(student1);
    replay(userService);
    expect(runService.getRunList(student1)).andReturn(runs);
    replay(runService);
    expect(projectService.getProjectPath(isA(Project.class))).andReturn("/1/project.json").times(3);
    expect(projectService.getProjectSharedOwnersList(isA(Project.class)))
        .andReturn(new ArrayList<HashMap<String, Object>>()).times(3);
    expect(projectService.getProjectURI(isA(Project.class)))
        .andReturn("http://localhost:8080/curriculum/1/project.json").times(3);
    expect(projectService.getLicensePath(isA(Project.class)))
        .andReturn("http://localhost:8080/curriculum/1/license.txt").times(3);
    replay(projectService);
    List<Workgroup> workgroups = new ArrayList<Workgroup>();
    workgroups.add(workgroup1);
    expect(workgroupService.getWorkgroupListByRunAndUser(isA(Run.class), isA(User.class)))
        .andReturn(workgroups).times(3);
    replay(workgroupService);
    expect(appProperties.getProperty("curriculum_base_www"))
        .andReturn("http://localhost:8080/curriculum").times(3);
    replay(appProperties);
    List<HashMap<String, Object>> runs = studentAPIController.getRuns(studentAuth);
    assertEquals(3, runs.size());
    verify(userService);
    verify(runService);
    verify(projectService);
    verify(workgroupService);
    verify(appProperties);
  }

  @Test
  public void addStudentToRun_InValidRunCode_ReturnRunNotFoundResponse()
      throws ObjectNotFoundException, PeriodNotFoundException,
      StudentUserAlreadyAssociatedWithRunException, RunHasEndedException {
    String runCodeNotInDB = "runCodeNotInDB";
    expect(userService.retrieveUserByUsername(STUDENT_USERNAME)).andReturn(student1);
    replay(userService);
    expect(runService.retrieveRunByRuncode(runCodeNotInDB))
        .andThrow(new ObjectNotFoundException(runCodeNotInDB, Run.class));
    replay(runService);
    HashMap<String, Object> response = studentAPIController.addStudentToRun(studentAuth,
        runCodeNotInDB, RUN1_PERIOD1_NAME);
    assertEquals("error", response.get("status"));
    assertEquals("runCodeNotFound", response.get("messageCode"));
    verify(userService);
    verify(runService);
  }

  @Test
  public void addStudentToRun_ValidRunCodeAndPeriod_AddStudentToRun()
      throws ObjectNotFoundException, PeriodNotFoundException,
      StudentUserAlreadyAssociatedWithRunException, RunHasEndedException {
    expect(userService.retrieveUserByUsername(STUDENT_USERNAME)).andReturn(student1);
    replay(userService);
    Projectcode projectCode = new Projectcode(RUN1_RUNCODE, RUN1_PERIOD1_NAME);
    studentService.addStudentToRun(student1, projectCode);
    expectLastCall();
    replay(studentService);
    expect(runService.retrieveRunByRuncode(RUN1_RUNCODE)).andReturn(run1);
    replay(runService);
    expect(projectService.getProjectPath(isA(Project.class))).andReturn("/1/project.json");
    expect(projectService.getProjectSharedOwnersList(isA(Project.class)))
        .andReturn(new ArrayList<HashMap<String, Object>>());
    expect(projectService.getProjectURI(isA(Project.class)))
        .andReturn("http://localhost:8080/curriculum/1/project.json");
    expect(projectService.getLicensePath(isA(Project.class)))
        .andReturn("http://localhost:8080/curriculum/1/license.txt");
    replay(projectService);
    List<Workgroup> workgroups = new ArrayList<Workgroup>();
    workgroups.add(workgroup1);
    expect(workgroupService.getWorkgroupListByRunAndUser(isA(Run.class), isA(User.class)))
        .andReturn(workgroups);
    replay(workgroupService);
    HashMap<String, Object> runMap = studentAPIController.addStudentToRun(studentAuth, RUN1_RUNCODE,
        RUN1_PERIOD1_NAME);
    assertEquals(RUN1_PERIOD1_NAME, runMap.get("periodName"));
    verify(userService);
    verify(studentService);
    verify(runService);
    verify(projectService);
    verify(workgroupService);
  }

  @Test
  public void createStudentAccount_WithGoogleUserId_CreateUser()
      throws DuplicateUsernameException, InvalidNameException {
    HashMap<String, String> studentFields = createDefaultStudentFields();
    studentFields.put("googleUserId", "123456789");
    expect(request.getLocale()).andReturn(Locale.US);
    replay(request);
    expect(userService.createUser(isA(StudentUserDetails.class))).andReturn(student1);
    replay(userService);
    HashMap<String, Object> response = studentAPIController.createStudentAccount(studentFields,
        request);
    assertEquals(STUDENT_USERNAME, response.get("username"));
    verify(request);
    verify(userService);
  }

  private HashMap<String, String> createDefaultStudentFields() {
    HashMap<String, String> studentFields = new HashMap<String, String>();
    studentFields.put("firstName", STUDENT_FIRSTNAME);
    studentFields.put("lastName", STUDENT_LASTNAME);
    studentFields.put("birthMonth", "1");
    studentFields.put("birthDay", "1");
    studentFields.put("gender", "MALE");
    return studentFields;
  }

  @SuppressWarnings("unchecked")
  @Test
  public void canBeAddedToWorkgroup_UserNotInWorkgroup_AddUserToWorkgroup()
      throws ObjectNotFoundException {
    Long studentIdNotInWorkgroup = 123L;
    Long workgroupId = 456L;
    User studentNotInWorkgroup = createNiceMock(UserImpl.class);
    expect(studentNotInWorkgroup.isTeacher()).andReturn(false);
    expect(studentNotInWorkgroup.getUserDetails()).andReturn(student1UserDetails);
    replay(studentNotInWorkgroup);
    expect(userService.retrieveById(studentIdNotInWorkgroup)).andReturn(studentNotInWorkgroup);
    expect(userService.retrieveUserByUsername(STUDENT_USERNAME)).andReturn(student1);
    replay(userService);
    expect(runService.retrieveById(runId1)).andReturn(run1);
    replay(runService);
    expect(workgroupService.retrieveById(workgroupId)).andReturn(workgroup1);
    expect(workgroupService.isUserInAnyWorkgroupForRun(studentNotInWorkgroup, run1))
        .andReturn(false);
    replay(workgroupService);
    HashMap<String, Object> response = studentAPIController.canBeAddedToWorkgroup(studentAuth,
        runId1, workgroupId, studentIdNotInWorkgroup);
    assertEquals(true, response.get("status"));
    assertEquals(2, ((ArrayList<HashMap<String, Object>>) response.get("workgroupMembers")).size());
    verify(studentNotInWorkgroup);
    verify(userService);
    verify(runService);
    verify(workgroupService);
  }
}
