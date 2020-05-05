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
import org.wise.portal.dao.work.NotebookItemDao;
import org.wise.portal.domain.authentication.Gender;
import org.wise.portal.domain.authentication.Schoollevel;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.junit.AbstractTransactionalDbTests;
import org.wise.vle.domain.work.NotebookItem;

/**
 * @author Geoffrey Kwan
 */
@SpringBootTest
@RunWith(SpringRunner.class)
public class HibernateNotebookItemDaoTest extends AbstractTransactionalDbTests {

  Run run;
  Workgroup workgroup1, workgroup2;

  @Autowired
  private NotebookItemDao<NotebookItem> notebookItemDao;

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
  public void getNotebookItemListByParams_RunWithoutAnyNotebookItems_ShouldReturnNone() {
    List<NotebookItem> notebookItems = 
        notebookItemDao.getNotebookItemListByParams(null, run, null, null, null, null);
    assertEquals(0, notebookItems.size());
  }

  @Test
  public void getNotebookItemListByParams_RunWitNotebookItems_ShouldReturnNotebookItems() {
    createNotebookItem(run, workgroup1, "localId1", null, "notebookItem1");
    List<NotebookItem> notebookItems = 
        notebookItemDao.getNotebookItemListByParams(null, run, null, null, null, null);
    assertEquals(1, notebookItems.size());
    assertEquals("notebookItem1", notebookItems.get(0).getContent());
  }

  @Test
  public void getNotebookItemListByParams_ByWorkgroup_ShouldReturnNotebookItems() {
    createNotebookItem(run, workgroup1, "localId1", null, "notebookItem1");
    createNotebookItem(run, workgroup1, "localId2", null, "notebookItem2");
    createNotebookItem(run, workgroup2, "localId1", null, "notebookItem3");
    List<NotebookItem> notebookItems = 
        notebookItemDao.getNotebookItemListByParams(null, run, null, workgroup1, null, null);
    assertEquals(2, notebookItems.size());
    assertEquals("notebookItem1", notebookItems.get(0).getContent());
    assertEquals("notebookItem2", notebookItems.get(1).getContent());
  }

  @Test
  public void getNotebookItemByGroup_WithNoNotebookItemsInGroup_ShouldReturnNone() {
    createNotebookItem(run, workgroup1, "localId1", null, "notebookItem1");
    createNotebookItem(run, workgroup1, "localId2", null, "notebookItem2");
    List<NotebookItem> notebookItems =
        notebookItemDao.getNotebookItemByGroup(run.getId().intValue(), "group1");
    assertEquals(0, notebookItems.size());
  }

  @Test
  public void getNotebookItemByGroup_WithNotebookItemsInGroup_ShouldReturnNotebookItems() {
    createNotebookItem(run, workgroup1, "localId1", "[group1]", "notebookItem1");
    createNotebookItem(run, workgroup1, "localId2", "[group2]", "notebookItem2");
    createNotebookItem(run, workgroup2, "localId1", "[group1]", "notebookItem3");
    List<NotebookItem> notebookItems =
        notebookItemDao.getNotebookItemByGroup(run.getId().intValue(), "group1");
    assertEquals(2, notebookItems.size());
    assertEquals("notebookItem1", notebookItems.get(0).getContent());
    assertEquals("notebookItem3", notebookItems.get(1).getContent());
  }

  @Test
  public void getNotebookItemsExport_WithExistingRevisions_ShouldReturnAllNotebookItems() {
    createNotebookItem(run, workgroup1, "localId1", null, "notebookItem1");
    createNotebookItem(run, workgroup2, "localId1", null, "notebookItem2");
    createNotebookItem(run, workgroup1, "localId2", null, "notebookItem3");
    createNotebookItem(run, workgroup2, "localId2", null, "notebookItem4");
    createNotebookItem(run, workgroup1, "localId3", null, "notebookItem5");
    List<NotebookItem> notebookItems = notebookItemDao.getNotebookItemsExport(run);
    assertEquals(5, notebookItems.size());
    assertEquals("notebookItem1", notebookItems.get(0).getContent());
    assertEquals("notebookItem3", notebookItems.get(1).getContent());
    assertEquals("notebookItem5", notebookItems.get(2).getContent());
    assertEquals("notebookItem2", notebookItems.get(3).getContent());
    assertEquals("notebookItem4", notebookItems.get(4).getContent());
  }

  @Test
  public void getLatestNotebookItemsExport_WithExistingRevisions_ShouldReturnSomeNotebookItems() {
    createNotebookItem(run, workgroup1, "localId1", null, "notebookItem1");
    createNotebookItem(run, workgroup2, "localId1", null, "notebookItem2");
    createNotebookItem(run, workgroup1, "localId1", null, "notebookItem3");
    createNotebookItem(run, workgroup2, "localId1", null, "notebookItem4");
    List<NotebookItem> notebookItems = notebookItemDao.getLatestNotebookItemsExport(run);
    assertEquals(2, notebookItems.size());
    assertEquals("notebookItem3", notebookItems.get(0).getContent());
    assertEquals("notebookItem4", notebookItems.get(1).getContent());
  }

  private NotebookItem createNotebookItem(Run run, Workgroup workgroup, String localNotebookItemId,
      String groups, String content) {
    NotebookItem notebookItem = new NotebookItem();
    Calendar now = Calendar.getInstance();
    Timestamp timestamp = new Timestamp(now.getTimeInMillis());
    notebookItem.setClientSaveTime(timestamp);
    notebookItem.setServerSaveTime(timestamp);
    notebookItem.setRun(run);
    notebookItem.setWorkgroup(workgroup);
    notebookItem.setLocalNotebookItemId(localNotebookItemId);
    notebookItem.setGroups(groups);
    notebookItem.setContent(content);
    notebookItemDao.save(notebookItem);
    return notebookItem;
  }
}