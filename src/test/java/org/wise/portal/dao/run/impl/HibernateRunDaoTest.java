/**
 * Copyright (c) 2007 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU Lesser General Public License, v2.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.dao.run.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.group.impl.HibernateGroupDao;
import org.wise.portal.dao.project.impl.HibernateProjectDao;
import org.wise.portal.dao.user.impl.HibernateUserDao;
import org.wise.portal.dao.workgroup.impl.HibernateWorkgroupDao;
import org.wise.portal.domain.authentication.Gender;
import org.wise.portal.domain.authentication.Schoollevel;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.ProjectImpl;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.domain.workgroup.impl.WorkgroupImpl;
import org.wise.portal.junit.AbstractTransactionalDbTests;
import org.wise.portal.service.authentication.DuplicateUsernameException;
import org.wise.portal.service.user.UserService;

/**
 * @author Hiroki Terashima
 */
@SpringBootTest
@RunWith(SpringRunner.class)
public class HibernateRunDaoTest extends AbstractTransactionalDbTests {

  private Project project;
  private Group period1, period2;
  private User teacher1, teacher2, student1, student2;
  private final Date startTime = Calendar.getInstance().getTime();
  private Date endTime = null;
  private final String runCode = "diamonds12345";
  private final String runCodeNotInDB = "diamonds54321";
  private Run run;
  private Long nextAvailableProjectId = 1L;

  @Autowired
  private HibernateRunDao runDao;

  @Autowired
  private HibernateGroupDao groupDao;

  @Autowired
  private HibernateUserDao userDao;

  @Autowired
  private HibernateProjectDao projectDao;

  @Autowired
  private HibernateWorkgroupDao workgroupDao;

  @Autowired
  private UserService userService;

  @Before
  public void setUp() throws Exception {
    super.setUp();
    verifyRunAndJoinTablesAreEmpty();
    period1 = createPeriod("Period 1");
    period2 = createPeriod("Period 2");
    teacher1 = createTeacherUser("Mrs", "Puff", "Mrs. Puff", "boat", "Bikini Bottom",
        "mrspuff@bikinibottom.com", "Boating School", Schoollevel.COLLEGE);
    teacher2 = createTeacherUser("Mr", "Krabs", "Mr. Krabs", "restaurant", "Bikini Bottom",
        "mrkrabs@bikinibottom.com", "Krusty Krab", Schoollevel.COLLEGE);
    student1 = createStudentUser("Spongebob", "Squarepants", "SpongebobS0101", "burger");
    student2 = createStudentUser("Patrick", "Star", "PatrickS0101", "rock");
    Long id = getNextAvailableProjectId();
    String projectName = "Airbags";
    run = createProjectAndRun(id, projectName, teacher1, startTime, runCode);
    project = run.getProject();
    toilet.flush();
  }

  private Long getNextAvailableProjectId() {
    Long nextAvailableProjectId = this.nextAvailableProjectId;
    this.nextAvailableProjectId++;
    return nextAvailableProjectId;
  }

  private Group createPeriod(String name) {
    Group period = new PersistentGroup();
    period.setName(name);
    groupDao.save(period);
    return period;
  }

  private Project createProject(Long id, String name, User owner) {
    Project project = new ProjectImpl();
    project.setId(id);
    project.setName(name);
    project.setDateCreated(new Date());
    project.setOwner(owner);
    return project;
  }

  private Run createRun(Long id, String name, Date startTime, String runCode, User owner,
      Project project) {
    Run run = new RunImpl();
    run.setId(id);
    run.setName(name);
    run.setStarttime(startTime);
    run.setRuncode(runCode);
    run.setArchiveReminderTime(new Date());
    run.setPostLevel(5);
    run.setOwner(owner);
    run.setProject(project);
    return run;
  }

  private Run createProjectAndRun(Long id, String name, User owner, Date startTime,
      String runCode) {
    Project project = createProject(id, name, owner);
    projectDao.save(project);
    Run run = createRun(id, name, startTime, runCode, owner, project);
    runDao.save(run);
    return run;
  }

  private User createTeacherUser(String firstName, String lastName, String username,
      String password, String country, String email, String schoolName,
      Schoollevel schoolLevel)
      throws DuplicateUsernameException {
    TeacherUserDetails userDetails = new TeacherUserDetails();
    userDetails.setFirstname(firstName);
    userDetails.setLastname(lastName);
    userDetails.setUsername(username);
    userDetails.setPassword(password);
    userDetails.setCountry(country);
    userDetails.setEmailAddress(email);
    userDetails.setSchoolname(schoolName);
    userDetails.setSchoollevel(schoolLevel);
    User user = userService.createUser(userDetails);
    userDao.save(user);
    return user;
  }

  private void assertNumRuns(int expected) {
    assertEquals("Number of rows in the [runs] table.", expected, countRowsInTable("runs"));
   }

   @Test
   public void getById_ExistingRunId_Success() throws Exception {
     runDao.save(run);
     assertNotNull(runDao.getById(run.getId()));
   }

  @Test
  public void save_NewRun_Success() {
    assertNumRuns(1);
    List<?> runsList = retrieveRunListFromDb();
    assertEquals(0, retrieveRunsRelatedToGroupsListFromDb().size());
    assertEquals(0, retrieveRunsAndGroupsListFromDb().size());

    Map<?, ?> runMap = (Map<?, ?>) runsList.get(0);
    assertEquals(startTime, runMap.get(RunImpl.COLUMN_NAME_STARTTIME.toUpperCase()));
    assertEquals(runCode, runMap.get(RunImpl.COLUMN_NAME_RUN_CODE.toUpperCase()));
    assertNull(runMap.get(RunImpl.COLUMN_NAME_ENDTIME.toUpperCase()));

    Set<Group> periods = new TreeSet<Group>();
    periods.add(period1);
    periods.add(period2);
    groupDao.save(period1);
    groupDao.save(period2);
    run.setPeriods(periods);

    runDao.save(run);
    toilet.flush();

    runsList = retrieveRunListFromDb();
    assertNumRuns(1);

    List<?> runsAndGroups = retrieveRunsAndGroupsListFromDb();
    assertEquals(1, runsList.size());
    assertEquals(2, retrieveRunsRelatedToGroupsListFromDb().size());
    assertEquals(2, runsAndGroups.size());

    List<String> periodNames = new ArrayList<String>();
    periodNames.add(period1.getName());
    periodNames.add(period2.getName());

    for (int i = 0; i < runsAndGroups.size(); i++) {
      Map<?, ?> allRunMap = (Map<?, ?>) runsAndGroups.get(i);
      String periodName = (String) allRunMap.get("periodName");
      assertTrue(periodNames.contains(periodName));
      periodNames.remove(periodName);
    }

    endTime = Calendar.getInstance().getTime();
    run.setEndtime(endTime);

    runDao.save(run);
    toilet.flush();

    runsList = retrieveRunListFromDb();
    runMap = (Map<?, ?>) runsList.get(0);
    assertEquals(endTime, runMap.get(RunImpl.COLUMN_NAME_ENDTIME .toUpperCase()));
  }

  @Test
  public void save_WithoutProject_ShouldThrowException() {
    run.setProject(null);
    try {
      runDao.save(run);
      toilet.flush();
      fail("Exception expected to be thrown but was not");
    } catch (Exception e) {
    }
  }

  @Test
  public void retrieveByRunCode_ValidRunCode_Success() throws Exception {
    Run run = runDao.retrieveByRunCode(runCode);
    assertTrue(run instanceof RunImpl);
    assertTrue(run.getClass() == RunImpl.class);

    assertEquals(run.getRuncode(), runCode);
    assertEquals(run.getStarttime(), startTime);
  }

  @Test
  public void retrieveByRunCode_NonExistingRunCode_ShouldThrowException() {
    try {
      runDao.retrieveByRunCode(runCodeNotInDB);
      fail ("Expected ObjectNotFoundException");
    } catch (ObjectNotFoundException e) {
    }
  }

  @Test
  public void getWorkgroupsForRun_OnePeriod_Success() throws Exception {
    Long runId = run.getId();
    List<Workgroup> workgroups = runDao.getWorkgroupsForRun(runId);
    assertEquals(workgroups.size(), 0);
    Set<User> members1 = new HashSet<User>();
    members1.add(student1);
    createWorkgroup(members1, run, period1);
    workgroups = runDao.getWorkgroupsForRun(runId);
    assertEquals(workgroups.size(), 1);
  }

  @Test
  public void getWorkgroupsForRun_TwoPeriods_Success() throws Exception {
    Long runId = run.getId();
    List<Workgroup> workgroups = runDao.getWorkgroupsForRun(runId);
    assertEquals(workgroups.size(), 0);
    Set<User> members1 = new HashSet<User>();
    members1.add(student1);
    createWorkgroup(members1, run, period1);
    Set<User> members2 = new HashSet<User>();
    members2.add(student2);
    createWorkgroup(members2, run, period2);
    workgroups = runDao.getWorkgroupsForRun(runId);
    assertEquals(workgroups.size(), 2);
  }

  private User createStudentUser(String firstName, String lastName, String  username, 
      String password) throws DuplicateUsernameException {
    StudentUserDetails userDetails = new StudentUserDetails();
    userDetails.setFirstname(firstName);
    userDetails.setLastname(lastName);
    userDetails.setUsername(username);
    userDetails.setPassword(password);
    userDetails.setBirthday(new Date());
    userDetails.setGender(Gender.MALE);
    User user = userService.createUser(userDetails);
    userDao.save(user);
    return user;
  }

  private Workgroup createWorkgroup(Set<User> members, Run run, Group period) {
    Workgroup workgroup = new WorkgroupImpl();
    for (User member : members) {
      workgroup.addMember(member);
    }
    workgroup.setRun(run);
    workgroup.setPeriod(period);
    groupDao.save(workgroup.getGroup());
    workgroupDao.save(workgroup);
    return workgroup;
  }

  @Test
  public void getWorkgroupsForRunAndPeriod_OnePeriod_Success() throws Exception {
    Long runId = run.getId();
    Long period1Id = period1.getId();
    List<Workgroup> workgroups1 = runDao.getWorkgroupsForRunAndPeriod(runId, period1Id);
    assertEquals(workgroups1.size(), 0);
    Set<User> members1 = new HashSet<User>();
    members1.add(student1);
    createWorkgroup(members1, run, period1);
    workgroups1 = runDao.getWorkgroupsForRunAndPeriod(runId, period1.getId());
    assertEquals(workgroups1.size(), 1);
  }

  @Test
  public void getWorkgroupsForRunAndPeriod_TwoPeriods_Success() throws Exception {
    Long runId = run.getId();
    Long period1Id = period1.getId();
    Long period2Id = period2.getId();
    List<Workgroup> workgroups1 = runDao.getWorkgroupsForRunAndPeriod(runId, period1Id);
    assertEquals(workgroups1.size(), 0);
    Set<User> members1 = new HashSet<User>();
    members1.add(student1);
    createWorkgroup(members1, run, period1);
    List<Workgroup> workgroups2 = runDao.getWorkgroupsForRunAndPeriod(runId, period2Id);
    assertEquals(workgroups2.size(), 0);
    Set<User> members2 = new HashSet<User>();
    members2.add(student2);
    createWorkgroup(members2, run, period2);
    workgroups1 = runDao.getWorkgroupsForRunAndPeriod(runId, period1.getId());
    assertEquals(workgroups1.size(), 1);
    workgroups2 = runDao.getWorkgroupsForRunAndPeriod(runId, period2.getId());
    assertEquals(workgroups2.size(), 1);
  }

  @Test
  public void retrieveByField_Name_Success() {
    String recyclingRunName = "Recycling";
    List<Run> recyclingRuns = runDao.retrieveByField("name", "like", recyclingRunName);
    assertEquals(recyclingRuns.size(), 0);
    String airbagsRunName = "Airbags";
    List<Run> airbagsRuns = runDao.retrieveByField("name", "like", airbagsRunName);
    assertEquals(airbagsRuns.size(), 1);
    assertEquals(airbagsRuns.get(0).getName(), airbagsRunName);
  }

  @Test
  public void retrieveByField_StartTime_Success() {
    Date yesterday = getDateXDaysFromNow(-1);
    List<Run> runsStartedAfterYesterday = runDao.retrieveByField("starttime", ">", yesterday);
    assertEquals(runsStartedAfterYesterday.size(), 1);
    Date tomorrow = getDateXDaysFromNow(1);
    List<Run> runsStartedAfterTomorrow = runDao.retrieveByField("starttime", ">", tomorrow);
    assertEquals(runsStartedAfterTomorrow.size(), 0);
  }

  @Test
  public void getRunListByUser_NoRuns_Success() throws Exception {
    List<Run> runsByUser = runDao.getRunListByUser(student1);
    assertEquals(runsByUser.size(), 0);
  }

  @Test
  public void getRunListByUser_OneRun_Success() throws Exception {
    List<Run> runsByUser = runDao.getRunListByUser(student1);
    assertEquals(runsByUser.size(), 0);
    Set<User> members1 = new HashSet<User>();
    members1.add(student1);
    createWorkgroup(members1, run, period1);
    runsByUser = runDao.getRunListByUser(student1);
    assertEquals(runsByUser.size(), 1);
  }

  @Test
  public void getRunsOfProject_NoRuns_Success() {
    List<Run> runs = runDao.getRunsOfProject(0L);
    assertEquals(runs.size(), 0);
  }

  @Test
  public void getRunsOfProject_OneRun_Success() {
    List<Run> runs = runDao.getRunsOfProject(0L);
    assertEquals(runs.size(), 0);
    runs = runDao.getRunsOfProject((Long) project.getId());
    assertEquals(runs.size(), 1);
  }

  @Test
  public void getRunListByOwner_NoRuns_Success() throws Exception {
    List<Run> runs = runDao.getRunListByOwner(teacher2);
    assertEquals(runs.size(), 0);
  }

  @Test
  public void getRunListByOwner_OneRun_Success() throws Exception {
    List<Run> runs = runDao.getRunListByOwner(teacher1);
    assertEquals(runs.size(), 1);
  }

  @Test
  public void getRunListBySharedOwner_NoRuns_Success() throws Exception {
    List<Run> runs = runDao.getRunListBySharedOwner(teacher2);
    assertEquals(runs.size(), 0);
  }

  @Test
  public void getRunListBySharedOwner_OneRun_Success() throws Exception {
    List<Run> runs = runDao.getRunListBySharedOwner(teacher2);
    assertEquals(runs.size(), 0);
    run.getSharedowners().add(teacher2);
    runDao.save(run);
    runs = runDao.getRunListBySharedOwner(teacher2);
    assertEquals(runs.size(), 1);
  }

  @Test
  public void getRunsRunWithinTimePeriod_Today_Success() {
    run.setLastRun(getDateXDaysFromNow(-2));
    List<Run> runs = runDao.getRunsRunWithinTimePeriod("today");
    assertEquals(0, runs.size());
    run.setLastRun(getDateXDaysFromNow(0));
    runs = runDao.getRunsRunWithinTimePeriod("today");
    assertEquals(1, runs.size());
  }

  @Test
  public void getRunsRunWithinTimePeriod_Week_Success() {
    run.setLastRun(getDateXDaysFromNow(-8));
    List<Run> runs = runDao.getRunsRunWithinTimePeriod("week");
    assertEquals(0, runs.size());
    run.setLastRun(getDateXDaysFromNow(-6));
    runs = runDao.getRunsRunWithinTimePeriod("week");
    assertEquals(1, runs.size());
  }

  @Test
  public void getRunsRunWithinTimePeriod_Month_Success() {
    run.setLastRun(getDateXDaysFromNow(-31));
    List<Run> runs = runDao.getRunsRunWithinTimePeriod("month");
    assertEquals(0, runs.size());
    run.setLastRun(getDateXDaysFromNow(-29));
    runs = runDao.getRunsRunWithinTimePeriod("month");
    assertEquals(1, runs.size());
  }

  private Date getDateXDaysFromNow(int x) {
    Calendar calendar = Calendar.getInstance();
    calendar.add(Calendar.DATE, x); 
    return new Date(calendar.getTimeInMillis());
  }

  @Test
  public void getRunsByActivity_NoneActive_Success() {
    List<Run> runs = runDao.getRunsByActivity();
    assertEquals(0, runs.size());
  }

  @Test
  public void getRunsByActivity_OneActive_Success() {
    List<Run> runs = runDao.getRunsByActivity();
    assertEquals(0, runs.size());
    run.setTimesRun(1);
    runs = runDao.getRunsByActivity();
    assertEquals(1, runs.size());
  }

  @Test
  public void getRunsByActivity_TwoActive_Success() {
    List<Run> runs = runDao.getRunsByActivity();
    assertEquals(0, runs.size());
    String projectName = "Photosynthesis";
    String runCode = "Panda123";
    Long id = getNextAvailableProjectId();
    Run photosynthesisRun = createProjectAndRun(id, projectName, teacher1, startTime, runCode);
    photosynthesisRun.setTimesRun(1);
    run.setTimesRun(1);
    runs = runDao.getRunsByActivity();
    assertEquals(2, runs.size());
  }

  private void verifyRunAndJoinTablesAreEmpty() {
    assertTrue(retrieveRunListFromDb().isEmpty());
    assertTrue(retrieveRunsRelatedToGroupsListFromDb().isEmpty());
  }

  private List<?> retrieveRunsRelatedToGroupsListFromDb() {
    return jdbcTemplate.queryForList("SELECT * FROM " + RunImpl.PERIODS_JOIN_TABLE_NAME);
  }

  private List<?> retrieveRunListFromDb() {
    return jdbcTemplate.queryForList("SELECT * FROM " + RunImpl.DATA_STORE_NAME,
        (Object[]) null);
  }

  private List<?> retrieveRunsAndGroupsListFromDb() {
    return jdbcTemplate.queryForList("SELECT *, " + PersistentGroup.DATA_STORE_NAME + 
        ".name as periodName FROM "
        + RunImpl.DATA_STORE_NAME + ", " + RunImpl.PERIODS_JOIN_TABLE_NAME
        + ", " + PersistentGroup.DATA_STORE_NAME + " WHERE "
        + RunImpl.DATA_STORE_NAME + ".id = " + RunImpl.PERIODS_JOIN_TABLE_NAME
        + "." + RunImpl.RUNS_JOIN_COLUMN_NAME + " AND "
        + PersistentGroup.DATA_STORE_NAME + ".id = "
        + RunImpl.PERIODS_JOIN_TABLE_NAME + "."
        + RunImpl.PERIODS_JOIN_COLUMN_NAME, (Object[]) null);
  }
}
