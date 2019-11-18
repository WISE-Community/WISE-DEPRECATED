/**
 * Copyright (c) 2019 Regents of the University of California (Regents). Created
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
package org.wise.portal.dao.attendance;

import static org.junit.jupiter.api.Assertions.assertEquals;

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
import org.wise.portal.dao.attendance.impl.HibernateStudentAttendanceDao;
import org.wise.portal.domain.attendance.StudentAttendance;
import org.wise.portal.domain.attendance.impl.StudentAttendanceImpl;
import org.wise.portal.domain.authentication.Gender;
import org.wise.portal.domain.authentication.Schoollevel;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.junit.AbstractTransactionalDbTests;

/**
 * @author Geoffrey Kwan
 */
@SpringBootTest
@RunWith(SpringRunner.class)
public class HibernateStudentAttendanceDaoTest extends AbstractTransactionalDbTests {

  Run run;
  Group period1, period2;
  Workgroup workgroup1, workgroup2;

  @Autowired
  HibernateStudentAttendanceDao studentAttendanceDao;

  @Before
  public void setUp() throws Exception {
    super.setUp();
    Long id = getNextAvailableProjectId();
    String projectName = "How to be a Fry Cook";
    Date startTime = Calendar.getInstance().getTime();
    String runCode = "Panda123";
    User teacher = createTeacherUser("Mrs", "Puff", "MrsPuff", "Mrs. Puff", "boat", "Bikini Bottom",
        "Water State", "Pacific Ocean", "mrspuff@bikinibottom.com", "Boating School",
        Schoollevel.COLLEGE, "1234567890");
    run = createProjectAndRun(id, projectName, teacher, startTime, runCode);
    period1 = createPeriod("Period 1");
    period2 = createPeriod("Period 2");
    Set<Group> periods = new TreeSet<Group>();
    periods.add(period1);
    periods.add(period2);
    run.setPeriods(periods);
    User student1 = createStudentUser("Spongebob", "Squarepants", "SpongebobS0101", "burger", 1, 1,
        Gender.MALE);
    Set<User> members1 = new HashSet<User>();
    members1.add(student1);
    workgroup1 = createWorkgroup(members1, run, period1);
    User student2 = createStudentUser("Patrick", "Star", "PatrickS0101", "rock", 1, 1, Gender.MALE);
    Set<User> members2 = new HashSet<User>();
    members2.add(student2);
    workgroup2 = createWorkgroup(members2, run, period1);
  }

  @Test
  public void getStudentAttendanceByRunId_RunWithNoStudentAttendance_ShouldReturnNone() {
    List<StudentAttendance> studentAttendance = 
        studentAttendanceDao.getStudentAttendanceByRunId(run.getId());
    assertEquals(0, studentAttendance.size());
  }

  @Test
  public void getAchievementsByParams_RunWithAchievements_ShouldReturnAchievements() {
    createStudentAttendance(run.getId(), workgroup1.getId(), getDateXDaysFromNow(1), "[1]", "[]");
    createStudentAttendance(run.getId(), workgroup2.getId(), getDateXDaysFromNow(1), "[2]", "[]");
    List<StudentAttendance> studentAttendance = 
        studentAttendanceDao.getStudentAttendanceByRunId(run.getId());
    assertEquals(2, studentAttendance.size());
    assertEquals("[2]", studentAttendance.get(0).getPresentUserIds());
    assertEquals("[1]", studentAttendance.get(1).getPresentUserIds());
  }

  @Test
  public void getStudentAttendanceByRunIdAndPeriod_RunWithAchievements_ShouldReturnAchievements() {
    createStudentAttendance(run.getId(), workgroup1.getId(), getDateXDaysFromNow(-1), "[1]", "[]");
    createStudentAttendance(run.getId(), workgroup2.getId(), getDateXDaysFromNow(-10), "[2]", "[]");
    List<StudentAttendance> studentAttendance = 
        studentAttendanceDao.getStudentAttendanceByRunIdAndPeriod(run.getId(), 7);
    assertEquals(1, studentAttendance.size());
    assertEquals("[1]", studentAttendance.get(0).getPresentUserIds());
  }

  public StudentAttendance createStudentAttendance(Long runId, Long workgroupId,
      Date loginTimestamp, String presentUserIds, String absentUserIds) {
    StudentAttendanceImpl studentAttendance = new StudentAttendanceImpl();
    studentAttendance.setRunId(runId);
    studentAttendance.setWorkgroupId(workgroupId);
    studentAttendance.setLoginTimestamp(loginTimestamp);
    studentAttendance.setPresentUserIds(presentUserIds);
    studentAttendance.setAbsentUserIds(absentUserIds);
    studentAttendanceDao.save(studentAttendance);
    return studentAttendance;
  }
}