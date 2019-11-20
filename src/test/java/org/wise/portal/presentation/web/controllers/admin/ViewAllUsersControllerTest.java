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
import java.util.List;

import javax.servlet.http.HttpSession;

import junit.framework.TestCase;
import org.easymock.EasyMock;
import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.ui.ModelMap;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.service.authentication.impl.UserDetailsServiceImpl;
import org.wise.portal.service.user.UserService;

/**
 * @author Sally Ahn
 */
@RunWith(EasyMockRunner.class)
public class ViewAllUsersControllerTest extends TestCase {

  @TestSubject
  private ViewAllUsersController controller = new ViewAllUsersController();

  private MockHttpServletRequest request;

  private ModelMap modelMap = new ModelMap();

  @Mock
  private UserService userService;

  @Mock
  private UserDetailsServiceImpl userDetailsService;

  private List<User> allUsers;

  private List<User> teachers;

  private List<User> students;

  private List<User> admins;

  private List<User> other;

  private User user;

  @Before
  public void setUp() throws Exception {
    super.setUp();
    this.request = new MockHttpServletRequest();
    HttpSession mockSession = new MockHttpSession();
    this.user = new UserImpl();
    mockSession.setAttribute(User.CURRENT_USER_SESSION_KEY, this.user);
    this.request.setSession(mockSession);
  }

  @After
  public void tearDown() throws Exception {
    super.tearDown();
    this.request = null;
    this.userService = null;
  }

  @Test
  public void showUsers_onlyTeachers_OK() throws Exception {
    List<String> allTeacherUsernames = new ArrayList<>();
    allTeacherUsernames.add("hirokiterashima");
    allTeacherUsernames.add("geoffreykwan");
    allTeacherUsernames.add("jonathanlimbreitbart");
    EasyMock.expect(userDetailsService.retrieveAllTeacherUsernames())
        .andReturn(allTeacherUsernames);
    EasyMock.replay(userDetailsService);
    this.request.setParameter("userType", "teacher");
    String view = controller.showUsers(request, modelMap);
    assertEquals(view, "admin/account/manageusers");
    List<String>  teacherUsernamesResult = (List<String>) modelMap.get("teachers");
    assertEquals(3, teacherUsernamesResult.size());
    EasyMock.verify(userDetailsService);
  }

  @Test
  public void showUsers_onlyStudents_OK() throws Exception {
    List<String> allStudentUsernames = new ArrayList<>();
    allStudentUsernames.add("hirokit0101");
    allStudentUsernames.add("geoffreyk0102");
    allStudentUsernames.add("jonathanb0103");
    EasyMock.expect(userDetailsService.retrieveAllStudentUsernames())
      .andReturn(allStudentUsernames);
    EasyMock.replay(userDetailsService);
    this.request.setParameter("userType", "student");
    String view = controller.showUsers(request, modelMap);
    assertEquals(view, "admin/account/manageusers");
    List<String>  studentUsernamesResult = (List<String>) modelMap.get("students");
    assertEquals(3, studentUsernamesResult.size());
    EasyMock.verify(userDetailsService);
  }

  @Test
  public void showUsers_allUsers_OK() throws Exception {
    List<String> allUserUsernames = new ArrayList<>();
    allUserUsernames.add("hirokiterashima");
    allUserUsernames.add("geoffreykwan");
    allUserUsernames.add("jonathanlimbreitbart");
    allUserUsernames.add("hirokit0101");
    allUserUsernames.add("geoffreyk0102");
    allUserUsernames.add("jonathanb0103");
    EasyMock.expect(userService.retrieveAllUsernames()).andReturn(allUserUsernames);
    EasyMock.replay(userService);
    String view = controller.showUsers(request, modelMap);
    assertEquals(view, "admin/account/manageusers");
    List<String>  allUserUsernamesResult = (List<String>) modelMap.get("usernames");
    assertEquals(6, allUserUsernamesResult.size());
    EasyMock.verify(userService);
  }

  // TODO: test showUsers_onlyShowUsersWhoLoggedIn_OK
  // TODO: test showUsers_onlyShowLoggedInUser_OK
}
