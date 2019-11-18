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
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
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
import org.wise.portal.domain.authentication.Gender;
import org.wise.portal.domain.authentication.Schoollevel;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.junit.AbstractTransactionalDbTests;

/**
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
@SpringBootTest
@RunWith(SpringRunner.class)
public class HibernateRunDaoTest extends AbstractTransactionalDbTests {

  private Project project;
  private Group period1, period2;
  private User teacher1, teacher2, student1, student2;
  private final Date startTime = Calendar.getInstance().getTime();
  private final String runCode = "diamonds12345";
  private final String runCodeNotInDB = "diamonds54321";
  private Run run;

  @Autowired
  private HibernateRunDao runDao;

  @Autowired
  private HibernateGroupDao groupDao;

  @Before
  public void setUp() throws Exception {
    super.setUp();
    verifyRunAndJoinTablesAreEmpty();
    period1 = createPeriod("Period 1");
    period2 = createPeriod("Period 2");
    teacher1 = createTeacherUser("Mrs", "Puff", "MrsPuff", "Mrs. Puff", "boat", "Bikini Bottom",
        "Water State", "Pacific Ocean", "mrspuff@bikinibottom.com", "Boating School",
        Schoollevel.COLLEGE, "1234567890");
    teacher2 = createTeacherUser("Mr", "Krabs", "MrKrabs", "Mr. Krabs", "restaurant",
        "Bikini Bottom", "Water State", "Pacific Ocean", "mrkrabs@bikinibottom.com",
        "Krusty Krab", Schoollevel.HIGH_SCHOOL, "abcdefghij");
    student1 = createStudentUser("Spongebob", "Squarepants", "SpongebobS0101", "burger", 1, 1,
        Gender.MALE);
    student2 = createStudentUser("Patrick", "Star", "PatrickS0101", "rock", 1, 1, Gender.MALE);
    Long id = getNextAvailableProjectId();
    String projectName = "Airbags";
    run = createProjectAndRun(id, projectName, teacher1, startTime, runCode);
    Set<Group> periods = new TreeSet<Group>();
    periods.add(period1);
    periods.add(period2);
    groupDao.save(period1);
    groupDao.save(period2);
    run.setPeriods(periods);
    project = run.getProject();
    toilet.flush();
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
    Long id = getNextAvailableProjectId();
    String projectName = "How to be a Fry Cook";
    Date startTime = Calendar.getInstance().getTime();
    String runCode = "Panda123";
    run = createProjectAndRun(id, projectName, teacher2, startTime, runCode);
    runDao.save(run);
    toilet.flush();
    assertNumRuns(2);
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
    assertEquals(runCode, run.getRuncode());
    assertEquals(startTime, run.getStarttime());
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
    assertEquals(0, workgroups.size());
    Set<User> members1 = new HashSet<User>();
    members1.add(student1);
    createWorkgroup(members1, run, period1);
    workgroups = runDao.getWorkgroupsForRun(runId);
    assertEquals(1, workgroups.size());
  }

  @Test
  public void getWorkgroupsForRun_TwoPeriods_Success() throws Exception {
    Long runId = run.getId();
    List<Workgroup> workgroups = runDao.getWorkgroupsForRun(runId);
    assertEquals(0, workgroups.size());
    Set<User> members1 = new HashSet<User>();
    members1.add(student1);
    createWorkgroup(members1, run, period1);
    Set<User> members2 = new HashSet<User>();
    members2.add(student2);
    createWorkgroup(members2, run, period2);
    workgroups = runDao.getWorkgroupsForRun(runId);
    assertEquals(2, workgroups.size());
  }

  @Test
  public void getWorkgroupsForRunAndPeriod_OnePeriod_Success() throws Exception {
    Long runId = run.getId();
    Long period1Id = period1.getId();
    List<Workgroup> workgroups1 = runDao.getWorkgroupsForRunAndPeriod(runId, period1Id);
    assertEquals(0, workgroups1.size());
    Set<User> members1 = new HashSet<User>();
    members1.add(student1);
    createWorkgroup(members1, run, period1);
    workgroups1 = runDao.getWorkgroupsForRunAndPeriod(runId, period1.getId());
    assertEquals(1, workgroups1.size());
  }

  @Test
  public void getWorkgroupsForRunAndPeriod_TwoPeriods_Success() throws Exception {
    Long runId = run.getId();
    Long period1Id = period1.getId();
    Long period2Id = period2.getId();
    List<Workgroup> workgroups1 = runDao.getWorkgroupsForRunAndPeriod(runId, period1Id);
    assertEquals(0, workgroups1.size());
    Set<User> members1 = new HashSet<User>();
    members1.add(student1);
    createWorkgroup(members1, run, period1);
    List<Workgroup> workgroups2 = runDao.getWorkgroupsForRunAndPeriod(runId, period2Id);
    assertEquals(0, workgroups2.size());
    Set<User> members2 = new HashSet<User>();
    members2.add(student2);
    createWorkgroup(members2, run, period2);
    workgroups1 = runDao.getWorkgroupsForRunAndPeriod(runId, period1.getId());
    assertEquals(1, workgroups1.size());
    workgroups2 = runDao.getWorkgroupsForRunAndPeriod(runId, period2.getId());
    assertEquals(1, workgroups2.size());
  }

  @Test
  public void retrieveByField_Name_Success() {
    String recyclingRunName = "Recycling";
    List<Run> recyclingRuns = runDao.retrieveByField("name", "like", recyclingRunName);
    assertEquals(0, recyclingRuns.size());
    String airbagsRunName = "Airbags";
    List<Run> airbagsRuns = runDao.retrieveByField("name", "like", airbagsRunName);
    assertEquals(1, airbagsRuns.size());
    assertEquals(airbagsRunName, airbagsRuns.get(0).getName());
  }

  @Test
  public void retrieveByField_StartTime_Success() {
    Date yesterday = getDateXDaysFromNow(-1);
    List<Run> runsStartedAfterYesterday = runDao.retrieveByField("starttime", ">", yesterday);
    assertEquals(1, runsStartedAfterYesterday.size());
    Date tomorrow = getDateXDaysFromNow(1);
    List<Run> runsStartedAfterTomorrow = runDao.retrieveByField("starttime", ">", tomorrow);
    assertEquals(0, runsStartedAfterTomorrow.size());
  }

  @Test
  public void getRunListByUser_StudentNotInRun_ShouldReturnNoRuns() throws Exception {
    List<Run> runsByUser = runDao.getRunListByUser(student1);
    assertEquals(0, runsByUser.size());
  }

  @Test
  public void getRunListByUser_StudentInPeriodButNotWorkgroup_ShouldReturnRun() throws Exception {
    List<Run> runsByUser = runDao.getRunListByUser(student1);
    assertEquals(0, runsByUser.size());
    period1.addMember(student1);
    runsByUser = runDao.getRunListByUser(student1);
    assertEquals(1, runsByUser.size());
  }

  @Test
  public void getRunListByUser_StudentInPeriodAndWorkgroup_ShouldReturnRun() throws Exception {
    List<Run> runsByUser = runDao.getRunListByUser(student2);
    assertEquals(0, runsByUser.size());
    period2.addMember(student2);
    Set<User> members = new HashSet<User>();
    members.add(student2);
    createWorkgroup(members, run, period2);
    runsByUser = runDao.getRunListByUser(student2);
    assertEquals(1, runsByUser.size());
  }

  @Test
  public void getRunsOfProject_NoRuns_Success() {
    List<Run> runs = runDao.getRunsOfProject(0L);
    assertEquals(0, runs.size());
  }

  @Test
  public void getRunsOfProject_OneRun_Success() {
    List<Run> runs = runDao.getRunsOfProject(0L);
    assertEquals(0, runs.size());
    runs = runDao.getRunsOfProject((Long) project.getId());
    assertEquals(1, runs.size());
  }

  @Test
  public void getRunListByOwner_NoRuns_Success() throws Exception {
    List<Run> runs = runDao.getRunListByOwner(teacher2);
    assertEquals(0, runs.size());
  }

  @Test
  public void getRunListByOwner_OneRun_Success() throws Exception {
    List<Run> runs = runDao.getRunListByOwner(teacher1);
    assertEquals(1, runs.size());
  }

  @Test
  public void getRunListBySharedOwner_NoRuns_Success() throws Exception {
    List<Run> runs = runDao.getRunListBySharedOwner(teacher2);
    assertEquals(0, runs.size());
  }

  @Test
  public void getRunListBySharedOwner_OneRun_Success() throws Exception {
    List<Run> runs = runDao.getRunListBySharedOwner(teacher2);
    assertEquals(0, runs.size());
    run.getSharedowners().add(teacher2);
    runDao.save(run);
    runs = runDao.getRunListBySharedOwner(teacher2);
    assertEquals(1, runs.size());
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
    run.setTimesRun(1);
    String projectName = "Photosynthesis";
    String runCode = "Panda123";
    Long id = getNextAvailableProjectId();
    Run run2 = createProjectAndRun(id, projectName, teacher1, startTime, runCode);
    run2.setTimesRun(1);
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
}
