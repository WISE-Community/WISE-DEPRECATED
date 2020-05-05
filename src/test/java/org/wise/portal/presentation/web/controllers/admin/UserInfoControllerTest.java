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

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertEquals;

import java.util.ArrayList;
import java.util.List;

import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.ui.ModelMap;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.presentation.web.controllers.APIControllerTest;
import org.wise.portal.service.student.StudentService;

/**
 * @author patrick lawler
 */
@RunWith(EasyMockRunner.class)
public class UserInfoControllerTest extends APIControllerTest {

  @TestSubject
  private UserInfoController controller = new UserInfoController();

  @Mock
  private StudentService studentService;

  private ModelMap modelMap = new ModelMap();

  @SuppressWarnings("unchecked")
  @Test
  public void getUserAccountInfo_TeacherOfStudent_ReturnStudentAccountInfoPage() throws Exception {
    expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
    expect(userService.retrieveUserByUsername(STUDENT_USERNAME)).andReturn(student1);
    replay(userService);
    expect(studentService.isStudentAssociatedWithTeacher(student1, teacher1)).andReturn(true);
    replay(studentService);
    List<Run> studentRuns = new ArrayList<>();
    studentRuns.add(new RunImpl());
    expect(runService.getRunList(student1)).andReturn(studentRuns);
    replay(runService);
    String view = controller.getUserAccountInfo(teacherAuth, STUDENT_USERNAME, modelMap);
    assertEquals("student/account/info", view);
    assertEquals(true, modelMap.get("isStudent"));
    List<Run> resultRunList = (List<Run>) modelMap.get("runList");
    assertEquals(1, resultRunList.size());
    verify(userService);
    verify(studentService);
    verify(runService);
  }

  @SuppressWarnings("unchecked")
  @Test
  public void getUserAccountInfo_AdminLooksUpTeacher_ReturnTeacherAccountInfoPage() throws Exception {
    expect(userService.retrieveUserByUsername(ADMIN_USERNAME)).andReturn(admin1);
    expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
    replay(userService);
    List<Run> studentRuns = new ArrayList<>();
    studentRuns.add(new RunImpl());
    expect(runService.getRunListByOwner(teacher1)).andReturn(studentRuns);
    replay(runService);
    String view = controller.getUserAccountInfo(adminAuth, TEACHER_USERNAME, modelMap);
    assertEquals("teacher/account/info", view);
    assertEquals(false, modelMap.get("isStudent"));
    List<Run> resultRunList = (List<Run>) modelMap.get("runList");
    assertEquals(1, resultRunList.size());
    verify(userService);
    verify(runService);
  }

  @Test
  public void getUserAccountInfo_UserWithoutPermissions_ReturnAccessDeniedPage() throws Exception {
    expect(userService.retrieveUserByUsername(STUDENT_USERNAME)).andReturn(student1);
    expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
    replay(userService);
    String view = controller.getUserAccountInfo(studentAuth, TEACHER_USERNAME, modelMap);
    assertEquals("errors/accessdenied", view);
    verify(userService);
  }
}
