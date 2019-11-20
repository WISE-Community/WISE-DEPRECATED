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
package org.wise.portal.presentation.web.controllers.teacher.grading;

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
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.servlet.ModelAndView;
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

import junit.framework.TestCase;

/**
 * @author Arthur Yin
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest(ControllerUtil.class)
public class GradeWorkControllerTest extends TestCase {

  @TestSubject
  private GradeWorkController controller = new GradeWorkController();

  @Mock
  private UserService userService;

  @Mock
  private StudentService studentService;

  @Mock
  private RunService runService;

  private User adminUser;

  private TeacherUserDetails adminUserDetails;

  @Before
  public void setUp() throws Exception {
    initializeAdminUser();
    PowerMock.mockStatic(ControllerUtil.class);
    EasyMock.expect(ControllerUtil.getSignedInUser()).andReturn(adminUser);
    PowerMock.replay(ControllerUtil.class);
  }

  protected void initializeAdminUser() {
    adminUser = new UserImpl();
    adminUserDetails = new TeacherUserDetails();
    PersistentGrantedAuthority adminAuthority = new PersistentGrantedAuthority();
    adminAuthority.setAuthority(UserDetailsService.ADMIN_ROLE);
    GrantedAuthority[] adminAuthorities = {adminAuthority};
    adminUserDetails.setAuthorities(adminAuthorities);
    adminUser.setUserDetails(adminUserDetails);
  }

  @After
  public void tearDown(){
    runService = null;
    controller = null;
    PowerMock.verify(ControllerUtil.class);
  }

  @Test
  public void launchClassroomMonitorWISE5_AdminUser_ShouldReturnCMView() throws Exception {
    Run run = new RunImpl();
    Long runId = 1l;
    run.setId(runId);
    MockHttpServletRequest request = new MockHttpServletRequest();
    EasyMock.expect(runService.retrieveById(runId)).andReturn(run);
    EasyMock.expect(runService.hasReadPermission(run, adminUser)).andReturn(true);
    EasyMock.replay(runService);
    PowerMock.replay(ControllerUtil.class);
    ModelAndView modelAndView = controller.launchClassroomMonitorWISE5(request, runId);
    assertEquals("forward:/wise5/classroomMonitor/dist/index.html#/run/" + runId + "/project/", modelAndView.getViewName());
    PowerMock.verify(runService);
  }
}
