package org.wise.portal.presentation.web.controllers.teacher;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.isA;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.fail;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.PeriodNotFoundException;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.presentation.web.controllers.APIControllerTest;
import org.wise.portal.presentation.web.exception.InvalidNameException;
import org.wise.portal.presentation.web.response.SimpleResponse;
import org.wise.portal.service.authentication.DuplicateUsernameException;
import org.wise.portal.service.authentication.UserDetailsService;

@RunWith(EasyMockRunner.class)
public class TeacherAPIControllerTest extends APIControllerTest {

  @TestSubject
  private TeacherAPIController teacherAPIController = new TeacherAPIController();

  @Mock
  private UserDetailsService userDetailsService;

  @Test
  public void getAllTeacherUsernames_OneTeachersInDB_ReturnOneUsername() {
    List<String> usernames = new ArrayList<String>();
    usernames.add(TEACHER_USERNAME);
    expect(userDetailsService.retrieveAllTeacherUsernames()).andReturn(usernames);
    replay(userDetailsService);
    List<String> usernamesResult = teacherAPIController.getAllTeacherUsernames();
    assertEquals(1, usernamesResult.size());
    assertEquals(TEACHER_USERNAME, usernamesResult.get(0));
    verify(userDetailsService);
  }

  @Test
  public void editRunStartTime_TeacherHasPermissionToChangeRun_ChangeStartTime()
      throws ObjectNotFoundException {
    Long startTime = Calendar.getInstance().getTimeInMillis();
    expect(userService.retrieveUserByUsername(teacherAuth.getName())).andReturn(teacher1);
    replay(userService);
    expect(runService.retrieveById(runId1)).andReturn(run1);
    runService.setStartTime(runId1, startTime);
    expectLastCall();
    replay(runService);
    expect(appProperties.getProperty("curriculum_base_www"))
        .andReturn("http://localhost:8080/curriculum");
    replay(appProperties);
    expectGetRunMapToBeCalled();
    replay(projectService);
    teacherAPIController.editRunStartTime(teacherAuth, runId1, startTime);
    verify(userService);
    verify(runService);
  }

  @Test
  public void editRunEndTime_TeacherHasPermissionToChangeRun_ChangeEndTime()
      throws ObjectNotFoundException {
    Calendar c = Calendar.getInstance();
    c.add(Calendar.MONTH, 1);
    Long endTime = c.getTimeInMillis();
    expect(userService.retrieveUserByUsername(teacherAuth.getName())).andReturn(teacher1);
    replay(userService);
    expect(runService.retrieveById(runId1)).andReturn(run1);
    runService.setEndTime(runId1, endTime);
    expectLastCall();
    replay(runService);
    expect(appProperties.getProperty("curriculum_base_www"))
        .andReturn("http://localhost:8080/curriculum");
    replay(appProperties);
    expectGetRunMapToBeCalled();
    replay(projectService);
    teacherAPIController.editRunEndTime(teacherAuth, runId1, endTime);
    verify(userService);
    verify(runService);
  }

  @SuppressWarnings("unchecked")
  @Test
  public void getRun_NoSharedOwners_ReturnRunMap() throws ObjectNotFoundException {
    expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
    replay(userService);
    expect(runService.retrieveById(runId1)).andReturn(run1);
    replay(runService);
    expectGetRunMapToBeCalled();
    replay(projectService);
    HashMap<String, Object> map = teacherAPIController.getRun(teacherAuth, runId1);
    assertEquals(0, ((List<HashMap<String, Object>>) map.get("sharedOwners")).size());
    verify(userService);
    verify(runService);
    verify(projectService);
  }

  @Test
  public void getProjectLastRun_ProjectWithRun_RuturnRunMap() {
    expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
    replay(userService);
    List<Run> projectRuns = new ArrayList<Run>();
    projectRuns.add(run1);
    expect(runService.getProjectRuns(projectId1)).andReturn(projectRuns);
    replay(runService);
    expectGetRunMapToBeCalled();
    replay(projectService);
    HashMap<String, Object> run = teacherAPIController.getProjectLastRun(teacherAuth, projectId1);
    assertEquals(runId1, run.get("id"));
    verify(userService);
    verify(runService);
    verify(projectService);
  }

  @Test
  public void getProjectLastRun_ProjectWithoutRun_ReturnNull() {
    expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
    replay(userService);
    List<Run> projectRuns = new ArrayList<Run>();
    expect(runService.getProjectRuns(projectId1)).andReturn(projectRuns);
    replay(runService);
    HashMap<String, Object> run = teacherAPIController.getProjectLastRun(teacherAuth, projectId1);
    assertNull(run);
    verify(userService);
    verify(runService);
  }

  @Test
  public void updateProfile_NewDisplayName_ReturnSuccess() {
    expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
    userService.updateUser(teacher1);
    expectLastCall();
    replay(userService);
    String displayName = "Mr. Squid";
    TeacherUserDetails tud = (TeacherUserDetails) teacher1.getUserDetails();
    SimpleResponse response = teacherAPIController.updateProfile(teacherAuth, displayName,
        tud.getEmailAddress(), tud.getCity(), tud.getState(), tud.getCountry(), tud.getSchoolname(),
        tud.getSchoollevel().toString(), tud.getLanguage());
    assertEquals("success", response.getStatus());
    verify(userService);
  }

  @Test
  public void editRunStudentsPerTeam_NotAbleToReduceFrom3To1_ReturnErrorStatus()
      throws ObjectNotFoundException {
    expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
    replay(userService);
    expect(runService.retrieveById(runId1)).andReturn(run1);
    expect(runService.canDecreaseMaxStudentsPerTeam(runId1)).andReturn(false);
    replay(runService);
    expectGetRunMapToBeCalled();
    replay(projectService);
    Integer newMaxStudentsPerTeam = 1;
    HashMap<String, Object> response = teacherAPIController.editRunStudentsPerTeam(teacherAuth,
        runId1, newMaxStudentsPerTeam);
    assertEquals("error", response.get("status"));
    assertEquals("notAllowedToDecreaseMaxStudentsPerTeam", response.get("messageCode"));
    verify(userService);
    verify(runService);
    verify(projectService);
  }

  @Test
  public void editRunStudentsPerTeam_AbleToReduceFrom3To1_UpdateRun()
      throws ObjectNotFoundException {
    expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
    replay(userService);
    expect(runService.retrieveById(runId1)).andReturn(run1);
    expect(runService.canDecreaseMaxStudentsPerTeam(runId1)).andReturn(true);
    Integer newMaxStudentsPerTeam = 1;
    runService.setMaxWorkgroupSize(runId1, newMaxStudentsPerTeam);
    expectLastCall();
    replay(runService);
    expectGetRunMapToBeCalled();
    replay(projectService);
    HashMap<String, Object> response = teacherAPIController.editRunStudentsPerTeam(teacherAuth,
        runId1, newMaxStudentsPerTeam);
    assertEquals("success", response.get("status"));
    verify(userService);
    verify(runService);
    verify(projectService);
  }

  @Test
  public void deletePeriodFromRun_PeriodDoesNotExist_ThrowError() throws ObjectNotFoundException {
    String periodNameNotInRun = "gibberishPeriodName";
    expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
    replay(userService);
    expect(runService.retrieveById(runId1)).andReturn(run1);
    replay(runService);
    try {
      teacherAPIController.deletePeriodFromRun(teacherAuth, runId1, periodNameNotInRun);
      fail("PeriodNotFoundException expected to be thrown, but was not.");
    } catch (PeriodNotFoundException e) {

    }
    verify(userService);
    verify(runService);
  }

  @Test
  public void deletePeriodFromRun_PeriodWithMembers_ReturnError()
      throws ObjectNotFoundException, PeriodNotFoundException {
    expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
    replay(userService);
    expect(runService.retrieveById(runId1)).andReturn(run1);
    replay(runService);
    expectGetRunMapToBeCalled();
    replay(projectService);
    HashMap<String, Object> response = teacherAPIController.deletePeriodFromRun(teacherAuth, runId1,
        RUN1_PERIOD1_NAME);
    assertEquals("error", response.get("status"));
    assertEquals("notAllowedToDeletePeriodWithStudents", response.get("messageCode"));
    verify(userService);
    verify(runService);
    verify(projectService);
  }

  @Test
  public void deletePeriodFromRun_PeriodWithNoMembers_DeletePeriod()
      throws ObjectNotFoundException, PeriodNotFoundException {
    expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
    replay(userService);
    expect(runService.retrieveById(runId1)).andReturn(run1);
    runService.deletePeriodFromRun(runId1, RUN1_PERIOD2_NAME);
    replay(runService);
    expectGetRunMapToBeCalled();
    replay(projectService);
    HashMap<String, Object> response = teacherAPIController.deletePeriodFromRun(teacherAuth, runId1,
        RUN1_PERIOD2_NAME);
    assertEquals("success", response.get("status"));
    verify(userService);
    verify(runService);
    verify(projectService);
  }

  @Test
  public void addPeriodToRun_PeriodNameAlreadyExists_ReturnError() throws ObjectNotFoundException {
    expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
    replay(userService);
    expect(runService.retrieveById(runId1)).andReturn(run1);
    replay(runService);
    expectGetRunMapToBeCalled();
    replay(projectService);
    HashMap<String, Object> response = teacherAPIController.addPeriodToRun(teacherAuth, runId1,
        RUN1_PERIOD2_NAME);
    assertEquals("error", response.get("status"));
    assertEquals("periodNameAlreadyExists", response.get("messageCode"));
    verify(userService);
    verify(runService);
    verify(projectService);
  }

  @Test
  public void addPeriodToRun_NewPeriodName_AddPeriod() throws ObjectNotFoundException {
    String newPeriodName = "fresh period";
    expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
    replay(userService);
    expect(runService.retrieveById(runId1)).andReturn(run1);
    runService.addPeriodToRun(runId1, newPeriodName);
    expectLastCall();
    replay(runService);
    expectGetRunMapToBeCalled();
    replay(projectService);
    HashMap<String, Object> response = teacherAPIController.addPeriodToRun(teacherAuth, runId1,
        newPeriodName);
    assertEquals("success", response.get("status"));
    verify(userService);
    verify(runService);
    verify(projectService);
  }

  @Test
  public void createRun_ThreePeriods_CreateRun() throws Exception {
    expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
    replay(userService);
    expect(request.getLocale()).andReturn(Locale.US);
    replay(request);
    expectGetRunMapToBeCalled();
    replay(projectService);
    Long projectId = 1L;
    String periods = "1,2,free";
    Integer maxStudentsPerTeam = 3;
    Long startDate = Calendar.getInstance().getTimeInMillis();
    Long endDate = null;
    Boolean isLockedAfterEndDate = false;
    Set<String> periodNamesSet = new HashSet<String>();
    periodNamesSet.add("1");
    periodNamesSet.add("2");
    periodNamesSet.add("free");
    expect(runService.createRun(projectId, teacher1, periodNamesSet, maxStudentsPerTeam, startDate,
        endDate, isLockedAfterEndDate, Locale.US)).andReturn(run1);
    replay(runService);
    teacherAPIController.createRun(teacherAuth, request, projectId, periods, maxStudentsPerTeam,
        startDate, endDate, isLockedAfterEndDate);
    verify(userService);
    verify(request);
    verify(projectService);
    verify(runService);
  }

  @Test
  public void createTeacherAccount_WithGoogleUserId_CreateUser()
      throws DuplicateUsernameException, InvalidNameException {
    HashMap<String, String> teacherFields = createDefaultTeacherFields();
    teacherFields.put("googleUserId", "123456789");
    expect(request.getLocale()).andReturn(Locale.US);
    replay(request);
    expect(userService.createUser(isA(TeacherUserDetails.class))).andReturn(teacher1);
    replay(userService);
    HashMap<String, Object> response = teacherAPIController.createTeacherAccount(teacherFields,
        request);
    assertEquals(TEACHER_USERNAME, response.get("username"));
    verify(request);
    verify(userService);
  }

  @Test
  public void editRunEndTime_WithNullEndTime_ChangeEndTime() throws ObjectNotFoundException {
    expect(userService.retrieveUserByUsername(teacherAuth.getName())).andReturn(teacher1);
    replay(userService);
    expect(runService.retrieveById(runId1)).andReturn(run1);
    runService.setEndTime(runId1, null);
    expectLastCall();
    replay(runService);
    expect(appProperties.getProperty("curriculum_base_www"))
        .andReturn("http://localhost:8080/curriculum");
    replay(appProperties);
    expectGetRunMapToBeCalled();
    replay(projectService);
    teacherAPIController.editRunEndTime(teacherAuth, runId1, null);
    verify(userService);
    verify(runService);
  }

  @Test
  public void editRunIsLockedAfterEndDate_WithTrue_ChangeValue() throws ObjectNotFoundException {
    expect(userService.retrieveUserByUsername(teacherAuth.getName())).andReturn(teacher1);
    replay(userService);
    expect(runService.retrieveById(runId1)).andReturn(run1);
    runService.setIsLockedAfterEndDate(runId1, true);
    expectLastCall();
    replay(runService);
    expect(appProperties.getProperty("curriculum_base_www"))
        .andReturn("http://localhost:8080/curriculum");
    replay(appProperties);
    expectGetRunMapToBeCalled();
    replay(projectService);
    teacherAPIController.editRunIsLockedAfterEndDate(teacherAuth, runId1, true);
    verify(userService);
    verify(runService);
  }

  @Test
  public void editRunIsLockedAfterEndDate_WithFalse_ChangeValue() throws ObjectNotFoundException {
    expect(userService.retrieveUserByUsername(teacherAuth.getName())).andReturn(teacher1);
    replay(userService);
    expect(runService.retrieveById(runId1)).andReturn(run1);
    runService.setIsLockedAfterEndDate(runId1, false);
    expectLastCall();
    replay(runService);
    expect(appProperties.getProperty("curriculum_base_www"))
        .andReturn("http://localhost:8080/curriculum");
    replay(appProperties);
    expectGetRunMapToBeCalled();
    replay(projectService);
    teacherAPIController.editRunIsLockedAfterEndDate(teacherAuth, runId1, false);
    verify(userService);
    verify(runService);
  }

  private HashMap<String, String> createDefaultTeacherFields() {
    HashMap<String, String> fields = new HashMap<String, String>();
    fields.put("firstName", TEACHER_FIRSTNAME);
    fields.put("lastName", TEACHER_LASTNAME);
    fields.put("schoolLevel", "COLLEGE");
    fields.put("birthMonth", "1");
    fields.put("birthDay", "1");
    fields.put("gender", "MALE");
    return fields;
  }

  private void expectGetRunMapToBeCalled() {
    expect(projectService.getProjectPath(isA(Project.class))).andReturn("/1/project.json");
    expect(projectService.getProjectSharedOwnersList(isA(Project.class)))
        .andReturn(new ArrayList<HashMap<String, Object>>());
    expect(projectService.getProjectURI(isA(Project.class)))
        .andReturn("http://localhost:8080/curriculum/1/project.json");
    expect(projectService.getLicensePath(isA(Project.class)))
        .andReturn("http://localhost:8080/curriculum/1/license.txt");
  }
}
