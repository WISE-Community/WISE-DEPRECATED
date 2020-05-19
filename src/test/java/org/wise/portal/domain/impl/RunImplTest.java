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

package org.wise.portal.domain.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.Date;
import java.util.Set;
import java.util.TreeSet;

import org.easymock.EasyMockRunner;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;

/**
 * @author Hiroki Terashima
 * @version $Id: $
 */
@RunWith(EasyMockRunner.class)
public class RunImplTest {

  private RunImpl run = new RunImpl();

  private User studentUser = new UserImpl();

  private User studentUser_not_associated_with_run;

  private static final String[] periodnames = { "1", "2", "3", "6", "9", "10", "sunflower" };

  @Before
  public void setUp() {
    run = new RunImpl();
    Set<Group> periods = new TreeSet<Group>();
    for (String periodname : periodnames) {
      Group period = new PersistentGroup();
      period.setName(periodname);
      if (periodname.equals("1")) {
        period.addMember(studentUser);
      }
      periods.add(period);
    }
    run.setPeriods(periods);
  }

  @After
  public void tearDown() {
    run = null;
  }

  @Test
  public void testGetPeriods() {
    // test that the periods appear in alphabetical order by period's name
    TreeSet<Group> periods = (TreeSet<Group>) run.getPeriods();
    int i = 0;
    for (Group period : periods) {
      assertEquals(period.getName(), periodnames[i]);
      i++;
    }
  }

  @Test
  public void testIsStudentAssociatedToThisRun() {
    assertTrue(run.isStudentAssociatedToThisRun(studentUser));
    assertFalse(run.isStudentAssociatedToThisRun(studentUser_not_associated_with_run));
  }

  @Test
  public void isActive_CurrentTimeBeforeStart_ShouldReturnFalse() throws Exception {
    run.setStarttime(getTomorrow());
    assertFalse(run.isActive());
  }

  @Test
  public void isActive_CurrentTimeBetweenStartAndEnd_ShouldReturnTrue() throws Exception {
    run.setStarttime(getYesterday());
    run.setEndtime(getTomorrow());
    assertTrue(run.isActive());
  }

  @Test
  public void isActive_CurrentTimeAfterEndAndNotLocked_ShouldReturnTrue() throws Exception {
    run.setStarttime(getToday());
    run.setEndtime(getTomorrow());
    run.setLockedAfterEndDate(false);
    assertTrue(run.isActive());
  }

  @Test
  public void isActive_CurrentTimeAfterEndAndLocked_ShouldReturnFalse() throws Exception {
    run.setStarttime(getTwoDaysAgo());
    run.setEndtime(getYesterday());
    run.setLockedAfterEndDate(true);
    assertFalse(run.isActive());
  }

  Date getToday() {
    return new Date();
  }

  Date getTomorrow() {
    return new Date(new Date().getTime() + getDaysInMilliseconds(1));
  }

  Date getYesterday() {
    return new Date(new Date().getTime() - getDaysInMilliseconds(1));
  }

  Date getTwoDaysAgo() {
    return new Date(new Date().getTime() - getDaysInMilliseconds(2));
  }

  private int getDaysInMilliseconds(int days) {
    return days * 24 * 60 * 60 * 1000;
  }

}
