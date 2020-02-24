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
package org.wise.portal.dao.status.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.List;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.wise.portal.junit.AbstractTransactionalDbTests;
import org.wise.vle.domain.status.StudentStatus;

/**
 * @author Geoffrey Kwan
 */
@SpringBootTest
@RunWith(SpringRunner.class)
public class HibernateStudentStatusDaoTest extends AbstractTransactionalDbTests {
  
  @Autowired
  private HibernateStudentStatusDao studentStatusDao;

  StudentStatus studentStatus1, studentStatus2, studentStatus3;

  @Before
  public void setUp() throws Exception {
    super.setUp();
    Long runId = 1L;
    Long periodId1 = 1L;
    Long periodId2 = 2L;
    Long workgroupId1 = 100L;
    Long workgroupId2 = 200L;
    Long workgroupId3 = 300L;
    studentStatus1 = createStudentStatus(runId, periodId1, workgroupId1, "status1");
    studentStatusDao.save(studentStatus1);
    studentStatus2 = createStudentStatus(runId, periodId1, workgroupId2, "status2");
    studentStatusDao.save(studentStatus2);
    studentStatus3 = createStudentStatus(runId, periodId2, workgroupId3, "status3");
    studentStatusDao.save(studentStatus3);
    toilet.flush();
  }

  private StudentStatus createStudentStatus(Long runId, Long periodId, Long workgroupId,
      String status) {
    return new StudentStatus(runId, periodId, workgroupId, status);
  }

  @Test
  public void getStudentStatusByWorkgroupId_WithNonExistingWorkroupId_ShouldReturnNull() {
    StudentStatus studentStatus = studentStatusDao.getStudentStatusByWorkgroupId(400L);
    assertNull(studentStatus);
  }

  @Test
  public void getStudentStatusByWorkgroupId_WithExistingWorkroupId_ShouldReturnStudentStatus() {
    StudentStatus studentStatus = studentStatusDao.getStudentStatusByWorkgroupId(100L);
    assertNotNull(studentStatus);
    assertEquals(studentStatus1.getId(), studentStatus.getId());
    assertEquals("status1", studentStatus.getStatus());
  }

  @Test
  public void getStudentStatusesByPeriodId_WithNonExistingPeriodId_ShouldReturnNone() {
    List<StudentStatus> studentStatuses = studentStatusDao.getStudentStatusesByPeriodId(0L);
    assertEquals(0, studentStatuses.size());
  }

  @Test
  public void getStudentStatusesByPeriodId_WithExistingPeriodId_ShouldReturnStudentStatuses() {
    List<StudentStatus> studentStatuses = studentStatusDao.getStudentStatusesByPeriodId(1L);
    assertEquals(2, studentStatuses.size());
    assertEquals(studentStatus1.getId(), studentStatuses.get(0).getId());
    assertEquals("status1", studentStatuses.get(0).getStatus());
    assertEquals(studentStatus2.getId(), studentStatuses.get(1).getId());
    assertEquals("status2", studentStatuses.get(1).getStatus());
  }

  @Test
  public void getStudentStatusesByRunId_WithNonExistingRunId_ShouldReturnNone() {
    List<StudentStatus> studentStatuses = studentStatusDao.getStudentStatusesByRunId(0L);
    assertEquals(0, studentStatuses.size());
  }

  @Test
  public void getStudentStatusesByRunId_WithExistingRunId_ShouldReturnStudentStatuses() {
    List<StudentStatus> studentStatuses = studentStatusDao.getStudentStatusesByRunId(1L);
    assertEquals(3, studentStatuses.size());
    assertEquals(studentStatus1.getId(), studentStatuses.get(0).getId());
    assertEquals("status1", studentStatuses.get(0).getStatus());
    assertEquals(studentStatus2.getId(), studentStatuses.get(1).getId());
    assertEquals("status2", studentStatuses.get(1).getStatus());
    assertEquals(studentStatus3.getId(), studentStatuses.get(2).getId());
    assertEquals("status3", studentStatuses.get(2).getStatus());
  }
}