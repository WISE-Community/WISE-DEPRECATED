/**
 * Copyright (c) 2006-2019 Encore Research Group, University of Toronto
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package org.wise.portal.junit;

import java.util.Calendar;
import java.util.Date;
import java.util.Set;

import org.hibernate.SessionFactory;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit4.AbstractTransactionalJUnit4SpringContextTests;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.wise.portal.dao.group.impl.HibernateGroupDao;
import org.wise.portal.dao.project.impl.HibernateProjectDao;
import org.wise.portal.dao.run.impl.HibernateRunDao;
import org.wise.portal.dao.user.impl.HibernateUserDao;
import org.wise.portal.dao.workgroup.impl.HibernateWorkgroupDao;
import org.wise.portal.domain.authentication.Gender;
import org.wise.portal.domain.authentication.Schoollevel;
import org.wise.portal.domain.authentication.impl.PersistentUserDetails;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.ProjectImpl;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.domain.workgroup.impl.WorkgroupImpl;
import org.wise.portal.service.authentication.DuplicateUsernameException;
import org.wise.portal.service.user.UserService;

/**
 * Allows testers to perform data store integration tests. Provides transactions and access
 * to the Spring Beans.
 *
 * @author Cynick Young
 * @author Hiroki Terashima
 */
@RunWith(SpringRunner.class)
@WebAppConfiguration
public abstract class AbstractTransactionalDbTests extends
    AbstractTransactionalJUnit4SpringContextTests {

  @Autowired
  protected SessionFactory sessionFactory;

  protected HibernateFlusher toilet;

  @Autowired
  private HibernateProjectDao projectDao;

  @Autowired
  private HibernateRunDao runDao;
  
  @Autowired
  private HibernateUserDao userDao;

  @Autowired
  private HibernateGroupDao groupDao;

  @Autowired
  private HibernateWorkgroupDao workgroupDao;
  
  @Autowired
  private UserService userService;
  
  private Long nextAvailableProjectId = 1L;

  public void setUp() throws Exception {
    toilet = new HibernateFlusher();
    toilet.setSessionFactory(sessionFactory);
  }

  public User createUser() {
    PersistentUserDetails userDetails = new PersistentUserDetails();
    userDetails.setUsername("username");
    userDetails.setPassword("password");
    User user = new UserImpl();
    user.setUserDetails(userDetails);
    return user;
  }

  public User createTeacherUser(String firstName, String lastName, String username,
        String displayName, String password, String city, String state, String country,
        String email, String schoolName, Schoollevel schoolLevel, String googleUserId)
        throws DuplicateUsernameException {
    TeacherUserDetails userDetails = new TeacherUserDetails();
    userDetails.setFirstname(firstName);
    userDetails.setLastname(lastName);
    userDetails.setUsername(username);
    userDetails.setDisplayname(displayName);
    userDetails.setPassword(password);
    userDetails.setCity(city);
    userDetails.setState(state);
    userDetails.setCountry(country);
    userDetails.setEmailAddress(email);
    userDetails.setSchoolname(schoolName);
    userDetails.setSchoollevel(schoolLevel);
    userDetails.setGoogleUserId(googleUserId);
    User user = userService.createUser(userDetails);
    userDao.save(user);
    return user;
  }

  public User createStudentUser(String firstName, String lastName, String  username, 
        String password, int birthMonth, int birthDay, Gender gender)
        throws DuplicateUsernameException {
    StudentUserDetails userDetails = new StudentUserDetails();
    userDetails.setFirstname(firstName);
    userDetails.setLastname(lastName);
    userDetails.setUsername(username);
    userDetails.setPassword(password);
    Calendar calendar = Calendar.getInstance();
    calendar.set(Calendar.MONTH, birthMonth - 1);
    calendar.set(Calendar.DAY_OF_MONTH, birthDay);
    userDetails.setBirthday(new Date(calendar.getTimeInMillis()));
    userDetails.setGender(gender);
    User user = userService.createUser(userDetails);
    userDao.save(user);
    return user;
  }

  public Project createProject(Long id, String name, User owner) {
    Project project = new ProjectImpl();
    project.setId(id);
    project.setName(name);
    project.setDateCreated(new Date());
    project.setOwner(owner);
    return project;
  }

  public Run createRun(Long id, String name, Date startTime, String runCode, User owner,
      Project project) {
    Run run = new RunImpl();
    run.setId(id);
    run.setName(name);
    run.setStarttime(startTime);
    run.setRuncode(runCode);
    run.setArchiveReminderTime(new Date());
    run.setPostLevel(5);
    run.setOwner(owner);
    run.setProject(project);
    return run;
  }

  public Run createProjectAndRun(Long id, String name, User owner, Date startTime,
      String runCode) {
    Project project = createProject(id, name, owner);
    projectDao.save(project);
    Run run = createRun(id, name, startTime, runCode, owner, project);
    runDao.save(run);
    return run;
  }

  public Long getNextAvailableProjectId() {
    return nextAvailableProjectId++;
  }

  public Group createPeriod(String name) {
    Group period = new PersistentGroup();
    period.setName(name);
    groupDao.save(period);
    return period;
  }

  public Workgroup createWorkgroup(Set<User> members, Run run, Group period) {
    Workgroup workgroup = new WorkgroupImpl();
    for (User member : members) {
      workgroup.addMember(member);
    }
    workgroup.setRun(run);
    workgroup.setPeriod(period);
    groupDao.save(workgroup.getGroup());
    workgroupDao.save(workgroup);
    return workgroup;
  }

  public Date getDateXDaysFromNow(int x) {
    Calendar calendar = Calendar.getInstance();
    calendar.add(Calendar.DATE, x); 
    return new Date(calendar.getTimeInMillis());
  }
}
