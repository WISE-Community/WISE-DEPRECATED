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

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertEquals;

import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.authentication.impl.PersistentGrantedAuthority;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.user.UserService;

/**
 * @author Arthur Yin
 */
@RunWith(EasyMockRunner.class)
public class GradeWorkControllerTest {

  @TestSubject
  private GradeWorkController controller = new GradeWorkController();

  @Mock
  private UserService userService;

  @Mock
  private RunService runService;

  private Authentication teacherAuthentication;

  @Before
  public void setUp() {
    initializeTeacherAuthentication();
  }

  protected void initializeTeacherAuthentication() {
    PersistentGrantedAuthority teacherAuthority = new PersistentGrantedAuthority();
    teacherAuthority.setAuthority(UserDetailsService.TEACHER_ROLE);
    TeacherUserDetails teacherUserDetails = new TeacherUserDetails();
    teacherUserDetails.setAuthorities(new GrantedAuthority[] { teacherAuthority });
    Object credentials = null;
    teacherAuthentication = new TestingAuthenticationToken(teacherUserDetails, credentials);
  }

  @After
  public void tearDown() {
    runService = null;
    controller = null;
  }

  @Test
  public void launchClassroomMonitorWISE5_AuthorizedTeacher_ShouldReturnCMView() throws Exception {
    Run run = new RunImpl();
    Long runId = 1l;
    run.setId(runId);
    expect(runService.retrieveById(runId)).andReturn(run);
    expect(runService.hasReadPermission(teacherAuthentication, run)).andReturn(true);
    replay(runService);
    ModelAndView modelAndView = controller.launchClassroomMonitorWISE5(runId,
        teacherAuthentication);
    assertEquals("redirect:/teacher/manage/unit/" + runId, modelAndView.getViewName());
    verify(runService);
  }

  @Test
  public void launchClassroomMonitorWISE5_UnauthorizedTeacher_ShouldReturnAccessDenied()
      throws Exception {
    Run run = new RunImpl();
    Long runId = 1l;
    run.setId(runId);
    expect(runService.retrieveById(runId)).andReturn(run);
    expect(runService.hasReadPermission(teacherAuthentication, run)).andReturn(false);
    replay(runService);
    ModelAndView modelAndView = controller.launchClassroomMonitorWISE5(runId,
        teacherAuthentication);
    assertEquals("errors/accessdenied", modelAndView.getViewName());
    verify(runService);
  }
}
