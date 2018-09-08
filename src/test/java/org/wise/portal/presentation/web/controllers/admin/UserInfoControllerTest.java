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
package org.wise.portal.presentation.web.controllers.admin;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpSession;

import junit.framework.TestCase;
import org.easymock.EasyMock;
import org.easymock.TestSubject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.api.easymock.PowerMock;
import org.powermock.api.easymock.annotation.Mock;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.ui.ModelMap;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.authentication.Schoollevel;
import org.wise.portal.domain.authentication.impl.PersistentGrantedAuthority;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.student.StudentService;
import org.wise.portal.service.user.UserService;

/**
 * @author patrick lawler
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest(ControllerUtil.class)
public class UserInfoControllerTest extends TestCase {

  @TestSubject
  private UserInfoController controller = new UserInfoController();

  @Mock
  private UserService userService;

  @Mock
  private StudentService studentService;

  @Mock
  private RunService runService;

  private User teacherUser;

  private User adminUser;

  private TeacherUserDetails teacherUserDetails;

  private TeacherUserDetails adminUserDetails;

  private ModelMap modelMap = new ModelMap();

  @Before
  public void setUp() throws Exception {
    initializeTeacherUser();
    initializeAdminUser();

    PowerMock.mockStatic(ControllerUtil.class);
    EasyMock.expect(ControllerUtil.getSignedInUser()).andReturn(adminUser);
    PowerMock.replay(ControllerUtil.class);
  }

  protected void initializeAdminUser() {
    this.adminUser = new UserImpl();
    this.adminUserDetails = new TeacherUserDetails();
    PersistentGrantedAuthority adminAuthority = new PersistentGrantedAuthority();
    adminAuthority.setAuthority(UserDetailsService.ADMIN_ROLE);
    GrantedAuthority[] adminAuthorities = {adminAuthority};
    this.adminUserDetails.setAuthorities(adminAuthorities);
    this.adminUser.setUserDetails(this.adminUserDetails);
  }

  protected void initializeTeacherUser() {
    this.teacherUser = new UserImpl();
    this.teacherUserDetails = new TeacherUserDetails();
    this.teacherUserDetails.setCity("Berkeley");
    PersistentGrantedAuthority teacherAuthority = new PersistentGrantedAuthority();
    teacherAuthority.setAuthority(UserDetailsService.TEACHER_ROLE);
    GrantedAuthority[] authorities = {teacherAuthority};
    this.teacherUserDetails.setAuthorities(authorities);
    this.teacherUserDetails.setCountry("USA");
    String[] subjects = {"physics", "astronomy"};
    this.teacherUserDetails.setCurriculumsubjects(subjects);
    this.teacherUserDetails.setDisplayname("Mr. Mister");
    this.teacherUserDetails.setEmailAddress("mr@here.com");
    this.teacherUserDetails.setFirstname("John");
    this.teacherUserDetails.setLastLoginTime(Calendar.getInstance().getTime());
    this.teacherUserDetails.setLastname("Smith");
    this.teacherUserDetails.setNumberOfLogins(5);
    this.teacherUserDetails.setSchoollevel(Schoollevel.HIGH_SCHOOL);
    this.teacherUserDetails.setSchoolname("Berkeley");
    this.teacherUserDetails.setSignupdate(Calendar.getInstance().getTime());
    this.teacherUserDetails.setState("CA");
    this.teacherUserDetails.setUsername("JohnSmith");
    this.teacherUser.setUserDetails(this.teacherUserDetails);
  }

  @After
  public void tearDown(){
    this.userService = null;
    this.controller = null;
    PowerMock.verify(ControllerUtil.class);
  }

  @Test
  public void getUserAccountInfo_teacher_OK() throws Exception {
    EasyMock.expect(this.userService.retrieveUserByUsername("JohnSmith")).andReturn(this.teacherUser);
    PowerMock.replay(this.userService);
    List<Run> teacherRuns = new ArrayList<>();
    teacherRuns.add(new RunImpl());
    EasyMock.expect(this.runService.getRunListByOwner(this.teacherUser)).andReturn(teacherRuns);
    PowerMock.replay(this.runService);
    String view = this.controller.getUserAccountInfo("JohnSmith", modelMap);
    assertEquals("teacher/account/info", view);
    assertEquals(false, modelMap.get("isStudent"));
    List<Run> resultRunList = (List<Run>) modelMap.get("runList");
    assertEquals(1, resultRunList.size());
    EasyMock.verify(this.userService);
    EasyMock.verify(this.runService);
  }

  // TODO: test getUserAccountInfo_student_OK
  // TODO: test getUserAccountInfo_user_accessDenied
}
