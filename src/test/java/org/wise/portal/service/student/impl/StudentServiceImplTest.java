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
package org.wise.portal.service.student.impl;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.reset;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.fail;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

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
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.project.impl.Projectcode;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.domain.workgroup.impl.WorkgroupImpl;
import org.wise.portal.service.group.GroupService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.student.StudentService;
import org.wise.portal.service.workgroup.WorkgroupService;

/**
 * @author Hiroki Terashima
 */
@RunWith(EasyMockRunner.class)
public class StudentServiceImplTest {

  @TestSubject
  private StudentService studentService = new StudentServiceImpl();

  @Mock
  private RunService runService;

  @Mock
  private GroupService groupService;

  @Mock
  private WorkgroupService workgroupService;

  private User studentUser;

  private Projectcode projectcode;

  private final String RUNCODE = "falcon4432";

  private final String PERIODNAME = "3";

  private final String NON_EXISTING_PERIODNAME = "4";

  private Run run;

  private final Long runId = new Long(3);

  @Before
  public void setUp() throws Exception {
    studentUser = new UserImpl();
    StudentUserDetails userDetails = new StudentUserDetails();
    userDetails.setUsername("spongebobs0101");
    studentUser.setUserDetails(userDetails);
    projectcode = new Projectcode(RUNCODE, PERIODNAME);
    run = new RunImpl();
    Set<Group> periods = new TreeSet<Group>();
    Group period3 = new PersistentGroup();
    period3.setName(PERIODNAME);
    periods.add(period3);
    run.setPeriods(periods);
    run.setMaxWorkgroupSize(1);
  }

  @After
  public void tearDown() throws Exception {
    runService = null;
    groupService = null;
    studentUser = null;
    projectcode = null;
    studentService = null;
  }

  @Test
  public void addStudentToRun_ExistingUserAndRun_ShouldAddStudentToRun()
      throws ObjectNotFoundException, PeriodNotFoundException,
      StudentUserAlreadyAssociatedWithRunException, RunHasEndedException {
    expect(runService.retrieveRunByRuncode(RUNCODE)).andReturn(run);
    replay(runService);
    Group period = run.getPeriodByName(PERIODNAME);
    groupService.addMember(period.getId(), studentUser);
    expectLastCall();
    replay(groupService);

    studentService.addStudentToRun(studentUser, projectcode);
    verify(runService);
    verify(groupService);
  }

  @Test
  public void addStudentToRun_NonExistingRun_ShouldThrowRunNotFoundException()
      throws PeriodNotFoundException, ObjectNotFoundException {
    expect(runService.retrieveRunByRuncode(RUNCODE))
        .andThrow(new ObjectNotFoundException(runId, Run.class));
    replay(runService);
    replay(groupService); // not expecting groupService to be called because of the exception
    try {
      studentService.addStudentToRun(studentUser, projectcode);
      fail("ObjectNotFoundException was expected to be thrown but was not");
    } catch (ObjectNotFoundException oe) {
    } catch (Exception e) {
      fail("Another exception was not expected to be thrown");
    }
    verify(runService);
    verify(groupService);
  }

  @Test
  public void addStudentsToRun_NonExistingPeriod_ShouldThrowPeriodNotFoundException()
      throws ObjectNotFoundException {
    expect(runService.retrieveRunByRuncode(RUNCODE)).andReturn(run);
    replay(runService);
    try {
      run.getPeriodByName(NON_EXISTING_PERIODNAME);
      fail("PeriodNotFoundException was expected to be thrown but was not");
    } catch (PeriodNotFoundException e) {
    }
    replay(groupService); // not expecting groupService to be called because of the exception
    try {
      studentService.addStudentToRun(studentUser,
          new Projectcode(RUNCODE, NON_EXISTING_PERIODNAME));
      fail("PeriodNotFoundException was expected to be thrown but was not");
    } catch (PeriodNotFoundException pe) {
    } catch (Exception e) {
      fail("Another exception was not expected to be thrown.");
    }
    verify(runService);
    verify(groupService);
  }

  @Test
  public void addStudentsToRun_StudentIsAlreadyInTheRun_ShouldThrowStudentAlreadyAssociatedWithRunException()
      throws ObjectNotFoundException, PeriodNotFoundException {
    expect(runService.retrieveRunByRuncode(RUNCODE)).andReturn(run);
    replay(runService);
    Group period = run.getPeriodByName(PERIODNAME);
    groupService.addMember(period.getId(), studentUser);
    expectLastCall();
    replay(groupService);
    try {
      studentService.addStudentToRun(studentUser, projectcode);
    } catch (Exception e) {
      fail("An exception was not expected to be thrown");
    }
    verify(runService);
    verify(groupService);
    reset(runService);
    period.addMember(studentUser);
    expect(runService.retrieveRunByRuncode(RUNCODE)).andReturn(run);
    replay(runService);

    // now, if we try to add the studentUser again, we expect
    // StudentUserAlreadyAssociatedWithRunException to be thrown
    try {
      studentService.addStudentToRun(studentUser, projectcode);
      fail("StudentUserAlreadyAssociatedWithRunException was expected to be thrown but was not");
    } catch (StudentUserAlreadyAssociatedWithRunException se) {
    } catch (Exception e) {
      fail("Another exception was not expected to be thrown.");
    }
    verify(runService);
  }

  @Test
  public void removeStudentFromRun_studentIsInRun_ShouldRemoveStudentFromRunAndWorkgroup()
      throws PeriodNotFoundException {
    Group period = run.getPeriodByName(PERIODNAME);
    period.addMember(studentUser);
    Set<User> membersToRemove = new HashSet<User>();
    membersToRemove.add(studentUser);
    groupService.removeMembers(period, membersToRemove);
    expectLastCall();
    replay(groupService);
    List<Workgroup> workgroupsForRun = new ArrayList<Workgroup>();
    Workgroup workgroup = new WorkgroupImpl();
    workgroupsForRun.add(workgroup);
    expect(workgroupService.getWorkgroupListByRunAndUser(run, studentUser))
        .andReturn(workgroupsForRun);
    Set<User> membersToRemoveFromWorkgroup = new HashSet<User>();
    membersToRemoveFromWorkgroup.add(studentUser);
    workgroupService.removeMembers(workgroup, membersToRemoveFromWorkgroup);
    expectLastCall();
    replay(workgroupService);

    studentService.removeStudentFromRun(studentUser, run);
    verify(groupService);
    verify(workgroupService);
  }

  @Test
  public void removeStudentFromRun_studentIsNotInRun_ShouldDoNothing() {
    replay(runService);
    replay(groupService);
    replay(workgroupService);
    studentService.removeStudentFromRun(studentUser, run);
    verify(runService);
    verify(groupService);
    verify(workgroupService);
  }

  @Test
  public void addStudentsToRun_RunHasEndTimeInThePast_ShouldThrowRunHasEndedException()
      throws ObjectNotFoundException {
    run.setEndtime(new Date(System.currentTimeMillis() - 3600 * 1000));
    expect(runService.retrieveRunByRuncode(RUNCODE)).andReturn(run);
    replay(runService);
    try {
      studentService.addStudentToRun(studentUser, projectcode);
      fail("RunHasEndedException was expected to be thrown but was not");
    } catch (RunHasEndedException se) {
    } catch (Exception e) {
      fail("Another exception was not expected to be thrown.");
    }
    verify(runService);
  }
}
