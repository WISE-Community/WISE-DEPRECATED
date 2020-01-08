/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
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
package org.wise.portal.dao.statistics.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.sql.Timestamp;
import java.util.Calendar;
import java.util.List;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.wise.portal.dao.portal.impl.HibernatePortalStatisticsDao;
import org.wise.portal.domain.portal.PortalStatistics;
import org.wise.portal.domain.portal.impl.PortalStatisticsImpl;
import org.wise.portal.junit.AbstractTransactionalDbTests;

/**
 * @author Geoffrey Kwan
 */
@SpringBootTest
@RunWith(SpringRunner.class)
public class HibernatePortalStatisticsDaoTest extends AbstractTransactionalDbTests {

  @Autowired
  HibernatePortalStatisticsDao portalStatisticsDao;

  @Test
  public void getAllPortalStatistics_WhenThereAreNone_ShouldReturnNone() {
    List<PortalStatistics> portalStatistics = portalStatisticsDao.getAllPortalStatistics();
    assertEquals(0, portalStatistics.size());
  }

  @Test
  public void getAllPortalStatistics_WhenThereAreSome_ShouldReturnPortalStatistics() {
    createPortalStatistics(101L, 102L, 103L, 104L, 105L, 106L, 107L);
    createPortalStatistics(201L, 202L, 203L, 204L, 205L, 206L, 207L);
    List<PortalStatistics> portalStatistics = portalStatisticsDao.getAllPortalStatistics();
    assertEquals(2, portalStatistics.size());
    assertEquals(101L, portalStatistics.get(0).getTotalNumberStudents());
    assertEquals(201L, portalStatistics.get(1).getTotalNumberStudents());
  }

  @Test
  public void getLatestVLEStatistics_WhenThereAreNone_ShouldReturnNone() {
    PortalStatistics portalStatistics = portalStatisticsDao.getLatestPortalStatistics();
    assertNull(portalStatistics);
  }

  @Test
  public void getLatestVLEStatistics_WhenThereAreSome_ShouldReturnNewsItem() {
    createPortalStatistics(101L, 102L, 103L, 104L, 105L, 106L, 107L);
    createPortalStatistics(201L, 202L, 203L, 204L, 205L, 206L, 207L);
    PortalStatistics portalStatistics = portalStatisticsDao.getLatestPortalStatistics();
    assertNotNull(portalStatistics);
    assertEquals(201L, portalStatistics.getTotalNumberStudents());
  }

  private PortalStatistics createPortalStatistics(Long totalNumberStudents, 
      Long totalNumberStudentLogins, Long totalNumberTeachers, Long totalNumberTeacherLogins,
      Long totalNumberProjects, Long totalNumberRuns, Long totalNumberProjectsRun) {
    PortalStatistics portalStatistics = new PortalStatisticsImpl();
    portalStatistics.setTimestamp(new Timestamp(Calendar.getInstance().getTimeInMillis()));
    portalStatistics.setTotalNumberStudents(totalNumberStudents);
    portalStatistics.setTotalNumberStudentLogins(totalNumberStudentLogins);
    portalStatistics.setTotalNumberTeachers(totalNumberTeachers);
    portalStatistics.setTotalNumberTeacherLogins(totalNumberTeacherLogins);
    portalStatistics.setTotalNumberProjects(totalNumberProjects);
    portalStatistics.setTotalNumberRuns(totalNumberRuns);
    portalStatistics.setTotalNumberProjectsRun(totalNumberProjectsRun);
    portalStatisticsDao.save(portalStatistics);
    return portalStatistics;
  }
}
