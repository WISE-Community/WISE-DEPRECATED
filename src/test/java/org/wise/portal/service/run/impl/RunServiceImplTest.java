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
package org.wise.portal.service.run.impl;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.isA;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Properties;
import java.util.Set;

import org.easymock.EasyMock;
import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.group.GroupDao;
import org.wise.portal.dao.run.RunDao;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.ProjectImpl;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.run.impl.RunParameters;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.service.acl.AclService;

/**
 * @author Hiroki Terashima
 */
@RunWith(EasyMockRunner.class)
public class RunServiceImplTest {

  private static final String PROJECT_NAME = "Airbags!!!";

  private static Set<String> periodNames = new HashSet<String>();

  private User owner = new UserImpl();

  static {
    periodNames.add("Period 1");
    periodNames.add("Period 2");
  }

  @Mock
  private RunDao<Run> runDao;

  @Mock
  private GroupDao<Group> groupDao;

  @TestSubject
  private RunServiceImpl runService = new RunServiceImpl();

  @Mock
  private AclService<Run> aclService;

  @Mock
  private Properties appProperties;

  private Run run;

  private RunParameters runParameters;

  @SuppressWarnings("unchecked")
  @Before
  public void setUp() {
    aclService = EasyMock.createMock(AclService.class);
    Project project = new ProjectImpl();
    project.setName(PROJECT_NAME);

    run = new RunImpl();
    Calendar cal = Calendar.getInstance();
    cal.set(2000, 6, 19);
    run.setStarttime(cal.getTime());
    run.setProject(project);

    runParameters = new RunParameters();
    runParameters.setLocale(Locale.GERMAN);
    runParameters.setName(PROJECT_NAME);
    runParameters.setOwner(owner);
    runParameters.setProject(project);
  }

  @After
  public void tearDown() {
    runService = null;
    runDao = null;
    aclService = null;
    run = null;
    runParameters = null;
  }

  @Test
  public void getRunList_OneRunInDB_ShouldReturnOneRun() {
    List<Run> expectedList = new LinkedList<Run>();
    expectedList.add(new RunImpl());
    expect(runDao.getList()).andReturn(expectedList);
    replay(runDao);
    assertEquals(expectedList, runService.getRunList());
    verify(runDao);
  }

  @Test
  public void getRunList_User_ShouldReturnRunsAccessibleByUser() {
    User user = new UserImpl();
    List<Group> expectedGroups = new LinkedList<Group>();
    Group group = new PersistentGroup();
    group.addMember(user);
    expectedGroups.add(group);
    List<Run> expectedList = new LinkedList<Run>();
    Run run = new RunImpl();
    Set<Group> groups = new HashSet<Group>();
    groups.add(group);
    run.setPeriods(groups);
    expectedList.add(run);
    expect(runDao.getRunListByUser(user)).andReturn(expectedList);
    replay(runDao);
    assertEquals(expectedList, runService.getRunList(user));
    verify(runDao);
  }

  @Test
  public void createRun_WithoutPeriods_ShouldCreateRun() throws ObjectNotFoundException {
    expectRunCodeGeneration();
    replay(appProperties);
    expectRunSave();
    replay(runDao);
    Run run = runService.createRun(runParameters);
    assertNull(run.getEndtime());
    assertNotNull(run.getRuncode());
    assertTrue(run.getRuncode() instanceof String);
    assertEquals(0, run.getPeriods().size());
    verify(runDao);
    verify(appProperties);
  }

  @Test
  public void createRun_WithPeriods_ShouldCreateRun() throws Exception {
    for (String periodName : periodNames) {
      Group group = new PersistentGroup();
      group.setName(periodName);
      groupDao.save(group);
      expectLastCall();
    }
    replay(groupDao);
    runParameters.setPeriodNames(periodNames);
    expectRunCodeGeneration();
    replay(appProperties);
    expectRunSave();
    replay(runDao);
    Run run = runService.createRun(runParameters);
    assertNull(run.getEndtime());
    assertNotNull(run.getRuncode());
    assertTrue(run.getRuncode() instanceof String);
    assertEquals(2, run.getPeriods().size());
    for (Group period : run.getPeriods()) {
      assertTrue(periodNames.contains(period.getName()));
    }
    verify(groupDao);
    verify(runDao);
    verify(appProperties);
  }

  @Test
  public void retrieveById_RunExists_ShouldReturnRun() throws Exception {
    Run run = new RunImpl();
    Long runId = new Long(5);
    expect(runDao.getById(runId)).andReturn(run);
    replay(runDao);
    Run retrievedRun = runService.retrieveById(runId);
    assertEquals(run, retrievedRun);
    verify(runDao);
  }

  @Test
  public void retrieveById_RunDoesNotExist_ShouldThrowException() throws ObjectNotFoundException {
    Long runIdNotInDB = new Long(-1);
    expect(runDao.getById(runIdNotInDB))
        .andThrow(new ObjectNotFoundException(runIdNotInDB, Run.class));
    replay(runDao);
    try {
      runService.retrieveById(runIdNotInDB);
      fail("ObjectNotFoundException not thrown but should have been thrown");
    } catch (ObjectNotFoundException e) {
    }
    verify(runDao);
  }

  @Test
  public void retrieveRunByRuncode_RunExists_ShouldReturnRun() throws Exception {
    Run run = new RunImpl();
    String runCodeInDB = "falcon8989";
    expect(runDao.retrieveByRunCode(runCodeInDB)).andReturn(run);
    replay(runDao);
    try {
      Run retrievedRun = runService.retrieveRunByRuncode(runCodeInDB);
      assertEquals(run, retrievedRun);
    } catch (ObjectNotFoundException e) {
      fail("ObjectNotFoundException thrown but should not have been thrown");
    }
    verify(runDao);
  }

  @Test
  public void retrieveByRunCode_RunNotInDB_ShouldThrowException() throws ObjectNotFoundException {
    String runcodeNotInDB = "badbadbad3454";
    expect(runDao.retrieveByRunCode(runcodeNotInDB))
        .andThrow(new ObjectNotFoundException(runcodeNotInDB, Run.class));
    replay(runDao);
    try {
      runService.retrieveRunByRuncode(runcodeNotInDB);
      fail("ObjectNotFoundException not thrown but should have been thrown");
    } catch (ObjectNotFoundException e) {
    }
    verify(runDao);
  }

  @Test
  public void endRun_ActiveRun_ShouldEndRun() {
    assertNull(run.getEndtime());
    runDao.save(run);
    expectLastCall();
    replay(runDao);
    runService.endRun(run);
    assertNotNull(run.getEndtime());
    assertTrue(run.getStarttime().before(run.getEndtime()));
    verify(runDao);
  }

  @Test
  public void endRun_EndedRun_ShouldKeepPreviousEndTime() {
    Date endtime = Calendar.getInstance().getTime();
    run.setEndtime(endtime);
    replay(runDao);
    runService.endRun(run);
    assertNotNull(run.getEndtime());
    assertEquals(endtime, run.getEndtime());
    assertTrue(run.getStarttime().before(run.getEndtime()));
    verify(runDao);
  }

  @Test
  public void restartRun_EndedRun_ShouldRestartRun() {
    run.setEndtime(Calendar.getInstance().getTime());
    runDao.save(run);
    expectLastCall();
    replay(runDao);
    runService.restartRun(run);
    assertFalse(run.isEnded());
    assertNull(run.getEndtime());
    verify(runDao);
  }

  @Test
  public void startRun_ActiveRun_ShouldDoNothing() {
    assertNull(run.getEndtime());
    assertFalse(run.isEnded());
    replay(runDao);
    runService.startRun(run);
    assertNull(run.getEndtime());
    assertFalse(run.isEnded());
    verify(runDao);
  }

  @Test
  public void startRun_EndedRun_ShouldStartRun() {
    Date endtime = Calendar.getInstance().getTime();
    run.setEndtime(endtime);
    assertTrue(run.getStarttime().before(run.getEndtime()));
    runDao.save(run);
    expectLastCall();
    replay(runDao);
    runService.startRun(run);
    assertNull(run.getEndtime());
    assertFalse(run.isEnded());
    verify(runDao);
  }

  @Test
  public void setIsLockedAfterEndDate_ShouldSetToTrue() throws Exception {
    assertFalse(run.isLockedAfterEndDate());
    Long runId = new Long(1);
    expect(runDao.getById(runId)).andReturn(run);
    runDao.save(run);
    expectLastCall();
    replay(runDao);
    runService.setIsLockedAfterEndDate(1L, true);
    assertTrue(run.isLockedAfterEndDate());
  }

  @Test
  public void setIsLockedAfterEndDate_ShouldSetToFalse() throws Exception {
    run.setLockedAfterEndDate(true);
    assertTrue(run.isLockedAfterEndDate());
    Long runId = new Long(1);
    expect(runDao.getById(runId)).andReturn(run);
    runDao.save(run);
    expectLastCall();
    replay(runDao);
    runService.setIsLockedAfterEndDate(1L, false);
    assertFalse(run.isLockedAfterEndDate());
  }

  private void expectRunCodeGeneration() throws ObjectNotFoundException {
    expect(appProperties.getProperty(isA(String.class), isA(String.class))).andReturn("lion");
    expect(appProperties.containsKey("runcode_prefixes_de")).andReturn(false);
    expect(runDao.retrieveByRunCode(EasyMock.isA(String.class)))
        .andThrow(new ObjectNotFoundException("runcode", Run.class));
  }

  private void expectRunSave() {
    runDao.save(isA(Run.class));
    expectLastCall();
  }
}
