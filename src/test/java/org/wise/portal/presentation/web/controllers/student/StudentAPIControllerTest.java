package org.wise.portal.presentation.web.controllers.student;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.isA;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertEquals;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Properties;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.impl.PersistentGrantedAuthority;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.domain.workgroup.impl.WorkgroupImpl;
import org.wise.portal.presentation.web.response.SimpleResponse;
import org.wise.portal.service.attendance.StudentAttendanceService;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.workgroup.WorkgroupService;

@RunWith(EasyMockRunner.class)
public class StudentAPIControllerTest {

  @TestSubject
  private StudentAPIController studentAPIController = new StudentAPIController();

  @Mock
  private UserService userService;

  @Mock
  private RunService runService;

  @Mock
  private WorkgroupService workgroupService;

  @Mock
  private ProjectService projectService;

  @Mock
  private StudentAttendanceService studentAttendanceService;

  @Mock
  private HttpServletRequest request;

  @Mock
  private Properties i18nProperties;

  private Authentication studentAuthentication;

  private final String STUDENT_USERNAME = "SpongeBobS0101";

  private User student1, teacher1, teacher2;

  private List<Run> runs;

  private Long runId1;

  private String RUN1_RUNCODE = "orca123";

  private Workgroup workgroup1;

  private Run run1, run2, run3;

  @Before
  public void setUp() {
    student1 = new UserImpl();
    PersistentGrantedAuthority studentAuthority = new PersistentGrantedAuthority();
    studentAuthority.setAuthority(UserDetailsService.STUDENT_ROLE);
    StudentUserDetails studentUserDetails = new StudentUserDetails();
    studentUserDetails.setUsername(STUDENT_USERNAME);
    studentUserDetails
        .setAuthorities(new GrantedAuthority[] { studentAuthority });
    student1.setUserDetails(studentUserDetails);
    Object credentials = null;
    studentAuthentication = new TestingAuthenticationToken(studentUserDetails,
        credentials);
    teacher1 = new UserImpl();
    TeacherUserDetails tud1 = new TeacherUserDetails();
    tud1.setUsername("teacher1");
    teacher1.setUserDetails(tud1);
    teacher2 = new UserImpl();
    TeacherUserDetails tud2 = new TeacherUserDetails();
    tud2.setUsername("teacher2");
    teacher2.setUserDetails(tud2);
    runs = new ArrayList<Run>();
    runId1 = 1L;
    run1 = new RunImpl();
    run1.setId(runId1);
    run1.setOwner(teacher1);
    run1.setStarttime(new Date());
    run1.setMaxWorkgroupSize(3);
    run1.setRuncode(RUN1_RUNCODE);
    HashSet<Group> run1Periods = new HashSet<Group>();
    Group run1Period1 = new PersistentGroup();
    run1Period1.setName("1");
    run1Period1.addMember(student1);
    run1Periods.add(run1Period1);
    run1.setPeriods(run1Periods);
    workgroup1 = new WorkgroupImpl();
    workgroup1.addMember(student1);
    workgroup1.setPeriod(run1Period1);
    run2 = new RunImpl();
    run2.setOwner(teacher1);
    run3 = new RunImpl();
    run3.setOwner(teacher2);
    runs.add(run1);
    runs.add(run2);
    runs.add(run3);
  }

  @After
  public void tearDown() {
    student1 = null;
    teacher1 = null;
    teacher2 = null;
    run1 = null;
    run2 = null;
    run3 = null;
    runs = null;
  }

  @Test
  public void updateProfile_WithLocale_ShouldReturnSuccess() {
    String language = "ja";
    expect(userService.retrieveUserByUsername(STUDENT_USERNAME))
        .andReturn(student1);
    userService.updateUser(student1);
    expectLastCall();
    replay(userService);
    SimpleResponse response = studentAPIController
        .updateProfile(studentAuthentication, language);
    assertEquals("success", response.getStatus());
    verify(userService);
  }

  @Test
  public void getAssociatedTeachers_WithMultipleTeachersAndRuns_ShouldReturnSameTeacherOnce() {
    expect(userService.retrieveUserByUsername(STUDENT_USERNAME))
        .andReturn(student1);
    replay(userService);
    expect(runService.getRunList(student1)).andReturn(runs);
    replay(runService);
    Set<HashMap<String, String>> associatedTeacher = studentAPIController
        .getAssociatedTeachers(studentAuthentication);
    verify(userService);
    verify(runService);
    assertEquals(2, associatedTeacher.size());
  }

  @Test
  public void launchRun_OnePresentUser_ShouldLaunchRun() throws Exception {
    expect(runService.retrieveById(runId1)).andReturn(run1);
    runService.updateRunStatistics(runId1);
    expectLastCall();
    replay(runService);
    expect(userService.retrieveById(1L)).andReturn(student1);
    expect(userService.retrieveUserByUsername(STUDENT_USERNAME))
        .andReturn(student1);
    replay(userService);
    expect(workgroupService.isUserInAnyWorkgroupForRun(student1, run1))
        .andReturn(true);
    List<Workgroup> workgroups = new ArrayList<Workgroup>();
    workgroups.add(workgroup1);
    Set<User> newMembers = new HashSet<User>();
    expect(workgroupService.getWorkgroupListByRunAndUser(run1, student1))
        .andReturn(workgroups);
    workgroupService.addMembers(workgroup1, newMembers);
    expectLastCall();
    replay(workgroupService);
    expect(projectService.generateStudentStartProjectUrlString(
        isA(Workgroup.class), isA(String.class))).andReturn("/wise/run/1");
    replay(projectService);
    studentAttendanceService.addStudentAttendanceEntry(isA(Long.class),
        isA(Long.class), isA(Date.class), isA(String.class), isA(String.class));
    expect(request.getContextPath()).andReturn("wise");
    replay(request);
    HashMap<String, String> launchRunMap = studentAPIController
        .launchRun(studentAuthentication, runId1, null, "[1]", "[]", request);
    assertEquals("/wise/run/1", launchRunMap.get("startProjectUrl"));
    verify(runService);
    verify(userService);
    verify(workgroupService);
    verify(projectService);
    verify(request);
  }

  @Test
  public void getConfig_WISEContextPath_ShouldReturnConfig() {
    expect(request.getContextPath()).andReturn("wise");
    replay(request);
    HashMap<String, String> config = studentAPIController.getConfig(request);
    assertEquals("wise", config.get("contextPath"));
    assertEquals("wise/logout", config.get("logOutURL"));
    verify(request);
  }

  @Test
  public void getRunInfoByRunCode_RunExistsInDB_ShouldReturnRunInfo() throws ObjectNotFoundException {
    expect(runService.retrieveRunByRuncode(RUN1_RUNCODE)).andReturn(run1);
    replay(runService);
    HashMap<String, Object> info = studentAPIController.getRunInfoByRunCode(RUN1_RUNCODE);
    assertEquals("1", info.get("id"));
    assertEquals(RUN1_RUNCODE, info.get("runCode"));
    verify(runService);
  }

  @Test
  public void getRunInfoByRunCode_RunNotInDB_ShouldReturnRunInfo() throws ObjectNotFoundException {
    String runCodeNotInDB = "runCodeNotInDB";
    expect(runService.retrieveRunByRuncode(runCodeNotInDB)).andThrow(
        new ObjectNotFoundException(runCodeNotInDB, Run.class));
    replay(runService);
    HashMap<String, Object> info = studentAPIController.getRunInfoByRunCode(runCodeNotInDB);
    assertEquals(1, info.size());
    assertEquals("runNotFound", info.get("error"));
    verify(runService);
  }

  @Test
  public void getRunInfoById_RunExistsInDB_ShouldReturnRunInfo() throws ObjectNotFoundException {
    expect(runService.retrieveById(runId1)).andReturn(run1);
    replay(runService);
    HashMap<String, Object> info = studentAPIController.getRunInfoById(runId1);
    assertEquals("1", info.get("id"));
    assertEquals(RUN1_RUNCODE, info.get("runCode"));
    verify(runService);
  }

  @Test
  public void getRunInfoById_RunNotInDB_ShouldReturnRunInfo() throws ObjectNotFoundException {
    Long runIdNotInDB = -1L;
    expect(runService.retrieveById(runIdNotInDB)).andThrow(
        new ObjectNotFoundException(runIdNotInDB, Run.class));
    replay(runService);
    HashMap<String, Object> info = studentAPIController.getRunInfoById(runIdNotInDB);
    assertEquals(1, info.size());
    assertEquals("runNotFound", info.get("error"));
    verify(runService);
  }

  @Test
  public void getSecurityQuestions_DefaultQuestions_ShouldReturnSixQuestions() {
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

  // test getRuns

  // test addStudentToRun
}
