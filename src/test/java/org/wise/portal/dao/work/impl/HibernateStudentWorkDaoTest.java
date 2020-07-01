/**
 * Copyright (c) 2008-2019 Regents of the University of California (Regents).
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.dao.work.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.sql.Timestamp;
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
import org.wise.portal.dao.work.StudentWorkDao;
import org.wise.portal.domain.authentication.Gender;
import org.wise.portal.domain.authentication.Schoollevel;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.junit.AbstractTransactionalDbTests;
import org.wise.vle.domain.work.StudentWork;

/**
 * @author Geoffrey Kwan
 */
@SpringBootTest
@RunWith(SpringRunner.class)
public class HibernateStudentWorkDaoTest extends AbstractTransactionalDbTests {

  Run run;
  Group period1;
  Workgroup workgroup1, workgroup2;

  @Autowired
  private StudentWorkDao<StudentWork> studentWorkDao;

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
    Set<Group> periods = new TreeSet<Group>();
    periods.add(period1);
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
  public void getStudentWorkListByParams_WithRunThatHasNoStudentWork_ShouldReturnNoStudentWork() {
    List<StudentWork> studentWorkList = studentWorkDao.getStudentWorkListByParams(null, run, null,
        null, null, null, null, null, null, null);
    assertEquals(0, studentWorkList.size());
  }

  @Test
  public void getStudentWorkListByParams_WithRunThatHasStudentWork_ShouldReturnStudentWork() {
    createStudentWork(workgroup1, "node1", "studentWork1");
    createStudentWork(workgroup1, "node2", "studentWork2");
    createStudentWork(workgroup2, "node1", "studentWork3");
    List<StudentWork> studentWorkList = studentWorkDao.getStudentWorkListByParams(null, run, null,
        null, null, null, null, null, null, null);
    assertEquals(3, studentWorkList.size());
    assertEquals("studentWork1", studentWorkList.get(0).getStudentData());
    assertEquals("studentWork2", studentWorkList.get(1).getStudentData());
    assertEquals("studentWork3", studentWorkList.get(2).getStudentData());
  }

  @Test
  public void getStudentWorkListByParams_ByWorkgroup_ShouldReturnStudentWork() {
    createStudentWork(workgroup1, "node1", "studentWork1");
    createStudentWork(workgroup1, "node2", "studentWork2");
    createStudentWork(workgroup2, "node1", "studentWork3");
    List<StudentWork> studentWorkList = studentWorkDao.getStudentWorkListByParams(null, run, null,
        workgroup1, null, null, null, null, null, null);
    assertEquals(2, studentWorkList.size());
    assertEquals("studentWork1", studentWorkList.get(0).getStudentData());
    assertEquals("studentWork2", studentWorkList.get(1).getStudentData());
  }

  @Test
  public void getStudentWorkListByParams_ByNodeId_ShouldReturnStudentWork() {
    createStudentWork(workgroup1, "node1", "studentWork1");
    createStudentWork(workgroup1, "node2", "studentWork2");
    createStudentWork(workgroup2, "node1", "studentWork3");
    List<StudentWork> studentWorkList = studentWorkDao.getStudentWorkListByParams(null, run, null,
        null, null, null, "node1", null, null, null);
    assertEquals(2, studentWorkList.size());
    assertEquals("studentWork1", studentWorkList.get(0).getStudentData());
    assertEquals("studentWork3", studentWorkList.get(1).getStudentData());
  }

  private StudentWork createStudentWork(Workgroup workgroup, String nodeId, String studentData) {
    StudentWork studentWork = new StudentWork();
    Calendar now = Calendar.getInstance();
    Timestamp timestamp = new Timestamp(now.getTimeInMillis());
    studentWork.setClientSaveTime(timestamp);
    studentWork.setServerSaveTime(timestamp);
    studentWork.setRun(run);
    studentWork.setPeriod(period1);
    studentWork.setNodeId(nodeId);
    studentWork.setWorkgroup(workgroup);
    studentWork.setIsAutoSave(false);
    studentWork.setIsSubmit(false);
    studentWork.setStudentData(studentData);
    studentWorkDao.save(studentWork);
    return studentWork;
  }
}
