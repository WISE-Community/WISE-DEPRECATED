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
import org.wise.portal.junit.AbstractTransactionalDbTests;
import org.wise.vle.domain.statistics.VLEStatistics;

/**
 * @author Geoffrey Kwan
 */
@SpringBootTest
@RunWith(SpringRunner.class)
public class HibernateVLEStatisticsDaoTest
    extends AbstractTransactionalDbTests {

  @Autowired
  HibernateVLEStatisticsDao vleStatisticsDao;

  @Test
  public void getVLEStatistics_WhenThereAreNone_ShouldReturnNone() {
    List<VLEStatistics> vleStatistics = vleStatisticsDao.getVLEStatistics();
    assertEquals(0, vleStatistics.size());
  }

  @Test
  public void getVLEStatistics_WhenThereAreSome_ShouldReturnNewsItems() {
    createVLEStatistics("vleStatistics1");
    createVLEStatistics("vleStatistics2");
    List<VLEStatistics> vleStatistics = vleStatisticsDao.getVLEStatistics();
    assertEquals(2, vleStatistics.size());
    assertEquals("vleStatistics1", vleStatistics.get(0).getData());
    assertEquals("vleStatistics2", vleStatistics.get(1).getData());
  }

  @Test
  public void getLatestVLEStatistics_WhenThereAreNone_ShouldReturnNone() {
    VLEStatistics vleStatistics = vleStatisticsDao.getLatestVLEStatistics();
    assertNull(vleStatistics);
  }

  @Test
  public void getLatestVLEStatistics_WhenThereAreSome_ShouldReturnNewsItem() {
    createVLEStatistics("vleStatistics1");
    createVLEStatistics("vleStatistics2");
    VLEStatistics vleStatistics = vleStatisticsDao.getLatestVLEStatistics();
    assertNotNull(vleStatistics);
    assertEquals("vleStatistics2", vleStatistics.getData());
  }

  private VLEStatistics createVLEStatistics(String data) {
    VLEStatistics vleStatistics = new VLEStatistics();
    vleStatistics.setData(data);
    vleStatistics
        .setTimestamp(new Timestamp(Calendar.getInstance().getTimeInMillis()));
    vleStatisticsDao.save(vleStatistics);
    return vleStatistics;
  }
}
