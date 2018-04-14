/**
 * Copyright (c) 2007-2018 Regents of the University of California (Regents). Created
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
package org.wise.portal.presentation.web.controllers.student;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

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
import org.springframework.ui.ModelMap;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.StudentRunInfo;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.run.impl.RunServiceImpl;
import org.wise.portal.service.student.StudentService;

/**
 * @author Hiroki Terashima
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest(ControllerUtil.class)
public class StudentIndexControllerTest extends TestCase {

  @TestSubject
  private StudentIndexController studentIndexController = new StudentIndexController();

  @Mock
  private RunServiceImpl runService;

  @Mock
  private StudentService studentService;

  private Long previousLoginTime = 1523479696000L;

  private ModelMap modelMap = new ModelMap();

  private List<Run> expectedRunList;

  private Run mockRun;

  private StudentRunInfo mockStudentRunInfo;

  private List<StudentRunInfo> expected_current_studentruninfo_list, expected_ended_studentruninfo_list;

  private User loggedInUser = new UserImpl();

  @Before
  public void setUp() throws Exception {
    mockRun = new RunImpl();

    expectedRunList = new ArrayList<>();
    expectedRunList.add(mockRun);

    mockStudentRunInfo = new StudentRunInfo();
    mockStudentRunInfo.setRun(mockRun);
    mockStudentRunInfo.setStudentUser(loggedInUser);

    expected_current_studentruninfo_list = new ArrayList<StudentRunInfo>();
    expected_current_studentruninfo_list.add(mockStudentRunInfo);

    expected_ended_studentruninfo_list = new ArrayList<StudentRunInfo>();

    StudentUserDetails details = new StudentUserDetails();
    Calendar cal = Calendar.getInstance();
    Long previousLogin = new Long(previousLoginTime);
    cal.setTimeInMillis(previousLogin);
    details.setLastLoginTime(cal.getTime());
    loggedInUser.setUserDetails(details);
  }

  @After
  public void tearDown() throws Exception {
    runService = null;
  }

  @Test
  public void handleGET_firstTimeLoggingIn_OK() {
    loggedInUser.getUserDetails().setLastLoginTime(null);
    PowerMock.mockStatic(ControllerUtil.class);
    EasyMock.expect(ControllerUtil.getSignedInUser()).andReturn(loggedInUser);
    PowerMock.replay(ControllerUtil.class);

    EasyMock.expect(runService.getRunList(loggedInUser)).andReturn(expectedRunList);
    EasyMock.replay(runService);

    EasyMock.expect(studentService.getStudentRunInfo(loggedInUser, mockRun)).andReturn(mockStudentRunInfo);
    EasyMock.replay(studentService);

    String previousLoginTime = null;
    Calendar cal = Calendar.getInstance();
    Date dateBeforeCall = cal.getTime();
    String view = studentIndexController.handleGET(modelMap, previousLoginTime);
    assertEquals("student/index", view);
    assertEquals(modelMap.get("user"), loggedInUser);
    assertTrue(dateBeforeCall.equals((Date) modelMap.get("lastLoginTime")) || dateBeforeCall.before((Date) modelMap.get("lastLoginTime")));
    assertEquals(expected_current_studentruninfo_list, modelMap.get("current_run_list"));
    assertEquals(expected_ended_studentruninfo_list, modelMap.get("ended_run_list"));
    PowerMock.verify(ControllerUtil.class);
    EasyMock.verify(runService);
  }

  @Test
  public void handleGET_withRun_OK() {
    PowerMock.mockStatic(ControllerUtil.class);
    EasyMock.expect(ControllerUtil.getSignedInUser()).andReturn(loggedInUser);
    PowerMock.replay(ControllerUtil.class);

    EasyMock.expect(runService.getRunList(loggedInUser)).andReturn(expectedRunList);
    EasyMock.replay(runService);

    EasyMock.expect(studentService.getStudentRunInfo(loggedInUser, mockRun)).andReturn(mockStudentRunInfo);
    EasyMock.replay(studentService);

    String view = studentIndexController.handleGET(modelMap, String.valueOf(previousLoginTime));
    assertEquals("student/index", view);
    assertEquals(modelMap.get("user"), loggedInUser);
    Calendar cal = Calendar.getInstance();
    Long previousLogin = new Long(previousLoginTime);
    cal.setTimeInMillis(previousLogin);
    assertEquals(cal.getTime(), modelMap.get("lastLoginTime"));
    assertEquals(expected_current_studentruninfo_list, modelMap.get("current_run_list"));
    assertEquals(expected_ended_studentruninfo_list, modelMap.get("ended_run_list"));
    PowerMock.verify(ControllerUtil.class);
    EasyMock.verify(runService);
  }
}
