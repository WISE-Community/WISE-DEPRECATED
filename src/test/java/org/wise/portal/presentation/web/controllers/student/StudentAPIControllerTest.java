package org.wise.portal.presentation.web.controllers.student;

import static org.easymock.EasyMock.*;
import static org.junit.Assert.assertEquals;

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
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.PeriodNotFoundException;
import org.wise.portal.domain.RunHasEndedException;
import org.wise.portal.domain.StudentUserAlreadyAssociatedWithRunException;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.ProjectImpl;
import org.wise.portal.domain.project.impl.Projectcode;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.domain.workgroup.impl.WorkgroupImpl;
import org.wise.portal.presentation.web.controllers.APIControllerTest;
import org.wise.portal.presentation.web.response.SimpleResponse;
import org.wise.portal.service.attendance.StudentAttendanceService;
import org.wise.portal.service.authentication.DuplicateUsernameException;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.student.StudentService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.workgroup.WorkgroupService;

@RunWith(EasyMockRunner.class)
public class StudentAPIControllerTest extends APIControllerTest {

  @TestSubject
  private StudentAPIController studentAPIController = new StudentAPIController();

  @Mock
  private UserService userService;

  @Mock
  private StudentService studentService;

  @Mock
  private RunService runService;

  @Mock
  private WorkgroupService workgroupService;

  @Mock
  private ProjectService projectService;

  @Mock
  private StudentAttendanceService studentAttendanceService;

  @Mock(fieldName = "appProperties")
  private Properties appProperties;

  @Mock(fieldName = "i18nProperties")
  private Properties i18nProperties;

  private List<Run> runs;

  private Long runId1;

  private String RUN1_RUNCODE = "orca123";

  private String RUN1_PERIOD1_NAME = "1";

  private Workgroup workgroup1;

  private Project project1, project2, project3;

  private Run run1, run2, run3;

  @Override
  @Before
  public void setUp() {
    super.setUp();
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
    run1Period1.setName(RUN1_PERIOD1_NAME);
    run1Period1.addMember(student1);
    run1Periods.add(run1Period1);
    run1.setPeriods(run1Periods);
    project1 = new ProjectImpl();
    project1.setModulePath("/1/project.json");
    project1.setOwner(teacher1);
    run1.setProject(project1);
    workgroup1 = new WorkgroupImpl();
    workgroup1.addMember(student1);
    workgroup1.setPeriod(run1Period1);
    run2 = new RunImpl();
    run2.setOwner(teacher1);
    run2.setStarttime(new Date());
    HashSet<Group> run2Periods = new HashSet<Group>();
    Group run2Period2 = new PersistentGroup();
    run2Period2.setName("2");
    run2Period2.addMember(student1);
    run2Periods.add(run2Period2);
    run2.setPeriods(run2Periods);
    project2 = new ProjectImpl();
    project2.setModulePath("/2/project.json");
    project2.setOwner(teacher2);
    run2.setProject(project2);
    run3 = new RunImpl();
    run3.setOwner(teacher2);
    run3.setStarttime(new Date());
    HashSet<Group> run3Periods = new HashSet<Group>();
    Group run3Period4 = new PersistentGroup();
    run3Period4.setName("4");
    run3Period4.addMember(student1);
    run3Periods.add(run3Period4);
    run3.setPeriods(run3Periods);
    project3 = new ProjectImpl();
    project3.setModulePath("/3/project.json");
    project3.setOwner(teacher2);
    run3.setProject(project3);
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
        .updateProfile(studentAuth, language);
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
        .getAssociatedTeachers(studentAuth);
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
    HashMap<String, Object> launchRunMap = studentAPIController
        .launchRun(studentAuth, runId1, null, "[1]", "[]", request);
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
  public void getRunInfoByRunCode_RunExistsInDB_ShouldReturnRunInfo()
      throws ObjectNotFoundException {
    expect(runService.retrieveRunByRuncode(RUN1_RUNCODE)).andReturn(run1);
    replay(runService);
    HashMap<String, Object> info = studentAPIController
        .getRunInfoByRunCode(RUN1_RUNCODE);
    assertEquals("1", info.get("id"));
    assertEquals(RUN1_RUNCODE, info.get("runCode"));
    verify(runService);
  }

  @Test
  public void getRunInfoByRunCode_RunNotInDB_ShouldReturnRunInfo()
      throws ObjectNotFoundException {
    String runCodeNotInDB = "runCodeNotInDB";
    expect(runService.retrieveRunByRuncode(runCodeNotInDB))
        .andThrow(new ObjectNotFoundException(runCodeNotInDB, Run.class));
    replay(runService);
    HashMap<String, Object> info = studentAPIController
        .getRunInfoByRunCode(runCodeNotInDB);
    assertEquals(1, info.size());
    assertEquals("runNotFound", info.get("error"));
    verify(runService);
  }

  @Test
  public void getRunInfoById_RunExistsInDB_ShouldReturnRunInfo()
      throws ObjectNotFoundException {
    expect(runService.retrieveById(runId1)).andReturn(run1);
    replay(runService);
    HashMap<String, Object> info = studentAPIController.getRunInfoById(runId1);
    assertEquals("1", info.get("id"));
    assertEquals(RUN1_RUNCODE, info.get("runCode"));
    verify(runService);
  }

  @Test
  public void getRunInfoById_RunNotInDB_ShouldReturnRunInfo()
      throws ObjectNotFoundException {
    Long runIdNotInDB = -1L;
    expect(runService.retrieveById(runIdNotInDB))
        .andThrow(new ObjectNotFoundException(runIdNotInDB, Run.class));
    replay(runService);
    HashMap<String, Object> info = studentAPIController
        .getRunInfoById(runIdNotInDB);
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
    List<HashMap<String, String>> questions = studentAPIController
        .getSecurityQuestions();
    assertEquals(6, questions.size());
    assertEquals("QUESTION_ONE", questions.get(0).get("key"));
    assertEquals("account question 1", questions.get(0).get("value"));
    assertEquals("QUESTION_SIX", questions.get(5).get("key"));
    assertEquals("account question 6", questions.get(5).get("value"));
    verify(i18nProperties);
  }

  @Test
  public void getRuns_StudentInThreeRuns_ShouldReturnThreeRuns() {
    expect(userService.retrieveUserByUsername(STUDENT_USERNAME))
        .andReturn(student1);
    replay(userService);
    expect(runService.getRunList(student1)).andReturn(runs);
    replay(runService);
    expect(projectService.getProjectPath(isA(Project.class)))
        .andReturn("/1/project.json").times(3);
    expect(projectService.getProjectSharedOwnersList(isA(Project.class)))
        .andReturn(new ArrayList<HashMap<String, Object>>()).times(3);
    expect(projectService.getProjectURI(isA(Project.class)))
        .andReturn("http://localhost:8080/curriculum/1/project.json").times(3);
    expect(projectService.getLicensePath(isA(Project.class)))
        .andReturn("http://localhost:8080/curriculum/1/license.txt").times(3);
    replay(projectService);
    List<Workgroup> workgroups = new ArrayList<Workgroup>();
    workgroups.add(workgroup1);
    expect(workgroupService.getWorkgroupListByRunAndUser(isA(Run.class),
        isA(User.class))).andReturn(workgroups).times(3);
    replay(workgroupService);
    expect(appProperties.getProperty("curriculum_base_www"))
        .andReturn("http://localhost:8080/curriculum").times(3);
    replay(appProperties);
    List<HashMap<String, Object>> runs = studentAPIController
        .getRuns(studentAuth);
    assertEquals(3, runs.size());
    verify(userService);
    verify(runService);
    verify(projectService);
    verify(workgroupService);
    verify(appProperties);
  }

  @Test
  public void addStudentToRun_InValidRunCode_ShouldReturnRunNotFoundResponse()
      throws ObjectNotFoundException, PeriodNotFoundException,
      StudentUserAlreadyAssociatedWithRunException, RunHasEndedException {
    String runCodeNotInDB = "runCodeNotInDB";
    expect(userService.retrieveUserByUsername(STUDENT_USERNAME))
        .andReturn(student1);
    replay(userService);
    Projectcode projectCode = new Projectcode(runCodeNotInDB,
        RUN1_PERIOD1_NAME);
    studentService.addStudentToRun(student1, projectCode);
    expectLastCall();
    replay(studentService);
    expect(runService.retrieveRunByRuncode(runCodeNotInDB))
        .andThrow(new ObjectNotFoundException(runCodeNotInDB, Run.class));
    replay(runService);
    HashMap<String, Object> response = studentAPIController.addStudentToRun(
        studentAuth, runCodeNotInDB, RUN1_PERIOD1_NAME);
    assertEquals("error", response.get("status"));
    assertEquals("runCodeNotFound", response.get("messageCode"));
    verify(userService);
    verify(studentService);
    verify(runService);
  }

  @Test
  public void addStudentToRun_ValidRunCodeAndPeriod_ShouldAddStudentToRun()
      throws ObjectNotFoundException, PeriodNotFoundException,
      StudentUserAlreadyAssociatedWithRunException, RunHasEndedException {
    expect(userService.retrieveUserByUsername(STUDENT_USERNAME))
        .andReturn(student1);
    replay(userService);
    Projectcode projectCode = new Projectcode(RUN1_RUNCODE, RUN1_PERIOD1_NAME);
    studentService.addStudentToRun(student1, projectCode);
    expectLastCall();
    replay(studentService);
    expect(runService.retrieveRunByRuncode(RUN1_RUNCODE)).andReturn(run1);
    replay(runService);
    expect(projectService.getProjectPath(isA(Project.class)))
        .andReturn("/1/project.json");
    expect(projectService.getProjectSharedOwnersList(isA(Project.class)))
        .andReturn(new ArrayList<HashMap<String, Object>>());
    expect(projectService.getProjectURI(isA(Project.class)))
        .andReturn("http://localhost:8080/curriculum/1/project.json");
    expect(projectService.getLicensePath(isA(Project.class)))
        .andReturn("http://localhost:8080/curriculum/1/license.txt");
    replay(projectService);
    List<Workgroup> workgroups = new ArrayList<Workgroup>();
    workgroups.add(workgroup1);
    expect(workgroupService.getWorkgroupListByRunAndUser(isA(Run.class),
        isA(User.class))).andReturn(workgroups);
    replay(workgroupService);
    HashMap<String, Object> runMap = studentAPIController.addStudentToRun(
        studentAuth, RUN1_RUNCODE, RUN1_PERIOD1_NAME);
    assertEquals(RUN1_PERIOD1_NAME, runMap.get("periodName"));
    verify(userService);
    verify(studentService);
    verify(runService);
    verify(projectService);
    verify(workgroupService);
  }

  @Test
  public void createStudentAccount_WithGoogleUserId_ShouldCreateUser()
      throws DuplicateUsernameException {
    HashMap<String, String> studentFields = createDefaultStudentFields();
    studentFields.put("googleUserId", "123456789");
    expect(request.getLocale()).andReturn(Locale.US);
    replay(request);
    expect(userService.createUser(isA(StudentUserDetails.class))).andReturn(student1);
    replay(userService);
    String username = studentAPIController.createStudentAccount(studentFields, request);
    assertEquals(STUDENT_USERNAME, username);
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
  public void canBeAddedToWorkgroup_UserNotInWorkgroup_ShouldAddUserToWorkgroup()
      throws ObjectNotFoundException {
    Long studentIdNotInWorkgroup = 123L;
    Long workgroupId = 456L;
    User studentNotInWorkgroup = createNiceMock(UserImpl.class);
    expect(studentNotInWorkgroup.isTeacher()).andReturn(false);
    expect(studentNotInWorkgroup.getUserDetails()).andReturn(student1UserDetails);
    replay(studentNotInWorkgroup);
    expect(userService.retrieveById(studentIdNotInWorkgroup)).andReturn(studentNotInWorkgroup);
    expect(userService.retrieveUserByUsername(STUDENT_USERNAME))
        .andReturn(student1);
    replay(userService);
    expect(runService.retrieveById(runId1)).andReturn(run1);
    replay(runService);
    expect(workgroupService.retrieveById(workgroupId)).andReturn(workgroup1);
    expect(workgroupService.isUserInAnyWorkgroupForRun(studentNotInWorkgroup, run1))
        .andReturn(false);
    replay(workgroupService);
    HashMap<String, Object> response = studentAPIController
        .canBeAddedToWorkgroup(studentAuth, runId1,
        workgroupId, studentIdNotInWorkgroup);
    assertEquals(true, response.get("status"));
    assertEquals(2,
        ((ArrayList<HashMap<String, Object>>) response.get("workgroupMembers")).size());
    verify(studentNotInWorkgroup);
    verify(userService);
    verify(runService);
    verify(workgroupService);
  }
}
