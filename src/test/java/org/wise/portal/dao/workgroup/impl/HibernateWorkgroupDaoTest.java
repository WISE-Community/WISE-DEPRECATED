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
package org.wise.portal.dao.workgroup.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

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
public class HibernateWorkgroupDaoTest extends AbstractTransactionalDbTests {

  Run run;
  User student1, student2;

  @Autowired
  HibernateWorkgroupDao workgroupDao;

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
    Group period1 = createPeriod("Period 1");
    Set<Group> periods = new TreeSet<Group>();
    periods.add(period1);
    run.setPeriods(periods);
    student1 = createStudentUser("Spongebob", "Squarepants", "SpongebobS0101", "burger", 1, 1,
      Gender.MALE);
    Set<User> members1 = new HashSet<User>();
    members1.add(student1);
    createWorkgroup(members1, run, period1);
    student2 = createStudentUser("Patrick", "Star", "PatrickS0101", "rock", 1, 1, Gender.MALE);
  }

  @Test
  public void getListByRunAndUser_WithNoWorkgroup_ShouldReturnNone() {
    List<Workgroup> workgroups = workgroupDao.getListByRunAndUser(run, student2);
    assertEquals(0, workgroups.size());
  }

  @Test
  public void getListByRunAndUser_WithWorkgroup_ShouldReturnWorkgroup() {
    List<Workgroup> workgroups = workgroupDao.getListByRunAndUser(run, student1);
    assertEquals(1, workgroups.size());
    assertTrue(workgroups.get(0).getMembers().contains(student1));
  }

  @Test
  public void getListByUser_WithNoWorkgroup_ShouldReturnNoWorkgroup() {
    List<Workgroup> workgroups = workgroupDao.getListByUser(student2);
    assertEquals(0, workgroups.size());
  }

  @Test
  public void getListByUser_WithWorkgroup_ShouldReturnWorkgroup() {
    List<Workgroup> workgroups = workgroupDao.getListByUser(student1);
    assertEquals(1, workgroups.size());
    assertTrue(workgroups.get(0).getMembers().contains(student1));
  }
}