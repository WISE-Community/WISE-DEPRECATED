package org.wise.portal.dao.notification.impl;

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
import org.wise.portal.domain.authentication.Gender;
import org.wise.portal.domain.authentication.Schoollevel;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.junit.AbstractTransactionalDbTests;
import org.wise.vle.domain.notification.Notification;

/**
 * @author Geoffrey Kwan
 */
@SpringBootTest
@RunWith(SpringRunner.class)
public class HibernateNotificationDaoTest extends AbstractTransactionalDbTests {

  Run run;
  Group period1, period2;
  Workgroup workgroup1, workgroup2;

  @Autowired
  HibernateNotificationDao notificationDao;

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
  public void getNotificationListByParams_RunWithNoNotifications_ShouldReturnNone() {
    List<Notification> notifications =
        notificationDao.getNotificationListByParams(null, run, null, null, null, null, null);
    assertEquals(0, notifications.size());
  }

  @Test
  public void getNotificationListByParams_RunWithNotifications_ShouldReturnNotifications() {
    createNotification(run, period1, workgroup1, workgroup2, "notification1");
    List<Notification> notifications =
        notificationDao.getNotificationListByParams(null, run, null, null, null, null, null);
    assertEquals(1, notifications.size());
    assertEquals("notification1", notifications.get(0).getMessage());
  }

  @Test
  public void getNotificationListByParams_ByWorkgroup_ShouldReturnNotifications() {
    createNotification(run, period1, workgroup1, workgroup2, "notification1");
    createNotification(run, period1, workgroup1, workgroup2, "notification2");
    createNotification(run, period1, workgroup2, workgroup1, "notification3");
    List<Notification> notifications =
        notificationDao.getNotificationListByParams(null, run, null, workgroup1, null, null, null);
    assertEquals(2, notifications.size());
    assertEquals("notification1", notifications.get(0).getMessage());
    assertEquals("notification2", notifications.get(1).getMessage());
  }

  @Test
  public void getNotificationListByParams_ByPeriod_ShouldReturnNotifications() {
    createNotification(run, period1, workgroup1, workgroup2, "notification1");
    createNotification(run, period1, workgroup1, workgroup2, "notification2");
    createNotification(run, period2, workgroup2, workgroup1, "notification3");
    createNotification(run, period2, workgroup2, workgroup1, "notification4");
    createNotification(run, period2, workgroup2, workgroup1, "notification5");
    List<Notification> notifications =
        notificationDao.getNotificationListByParams(null, run, period1, null, null, null, null);
    assertEquals(2, notifications.size());
    assertEquals("notification1", notifications.get(0).getMessage());
    assertEquals("notification2", notifications.get(1).getMessage());
  }

  @Test
  public void getExport_WithNotifications_ShouldReturnNotifications() {
    createNotification(run, period1, workgroup1, workgroup2, "notification1");
    createNotification(run, period1, workgroup2, workgroup1, "notification2");
    createNotification(run, period1, workgroup1, workgroup2, "notification3");
    createNotification(run, period1, workgroup2, workgroup1, "notification4");
    createNotification(run, period1, workgroup1, workgroup2, "notification5");
    List<Notification> notifications = notificationDao.getExport(run);
    assertEquals(5, notifications.size());
    assertEquals("notification1", notifications.get(0).getMessage());
    assertEquals("notification3", notifications.get(1).getMessage());
    assertEquals("notification5", notifications.get(2).getMessage());
    assertEquals("notification2", notifications.get(3).getMessage());
    assertEquals("notification4", notifications.get(4).getMessage());
  }

  private Notification createNotification(Run run, Group period, Workgroup toWorkgroup,
      Workgroup fromWorkgroup, String message) {
    Notification notification = new Notification();
    Calendar now = Calendar.getInstance();
    Timestamp timestamp = new Timestamp(now.getTimeInMillis());
    notification.setTimeGenerated(timestamp);
    notification.setServerSaveTime(timestamp);
    notification.setRun(run);
    notification.setType("DiscussionReply");
    notification.setPeriod(period);
    notification.setToWorkgroup(toWorkgroup);
    notification.setFromWorkgroup(fromWorkgroup);
    notification.setMessage(message);
    notificationDao.save(notification);
    return notification;
  }
}
