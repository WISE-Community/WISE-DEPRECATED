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

import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;

import java.util.HashSet;
import java.util.Set;

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
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.springframework.context.ApplicationContext;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.validation.BindException;
import org.springframework.validation.BindingResult;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.PeriodNotFoundException;
import org.wise.portal.domain.StudentUserAlreadyAssociatedWithRunException;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.project.impl.AddProjectParameters;
import org.wise.portal.domain.project.impl.Projectcode;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.presentation.validators.student.AddProjectParametersValidator;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.student.StudentService;

/**
 * @author Hiroki Terashima
 */
@RunWith(PowerMockRunner.class)
@PowerMockIgnore("javax.management.*")
@PrepareForTest(ControllerUtil.class)
public class AddProjectControllerTest extends TestCase {

  private static final String RUNCODE = "fly8978";

  private static final String PERIODNAME = "3";

  private static final String LEGAL_PROJECTCODE = RUNCODE + "-" + PERIODNAME;

  private final String RUNCODE_NOT_IN_DB = "abc1234";

  private final String PERIODNAME_NOT_IN_DB = "thisperioddoesnotexist";

  @TestSubject
  private AddProjectController addProjectController = new AddProjectController();

  private AddProjectParameters addProjectParameters;

  @Mock
  private AddProjectParametersValidator addprojectparametersValidator;

  @Mock
  private StudentService studentService;

  private ApplicationContext mockApplicationContext;

  private MockHttpServletRequest request;

  private MockHttpServletResponse response;

  private HttpSession mockSession;

  private BindException errors;

  private BindingResult result;

  private Run run;

  private Group group;

  private User user;

  @Before
  public void setUp() throws Exception {
    mockApplicationContext = createMock(ApplicationContext.class);
    request = new MockHttpServletRequest();
    response = new MockHttpServletResponse();
    addProjectParameters = new AddProjectParameters();
    addProjectParameters.setProjectcode(LEGAL_PROJECTCODE);
    errors = new BindException(addProjectParameters, "");

    mockSession = new MockHttpSession();
    user = new UserImpl();
    mockSession.setAttribute(User.CURRENT_USER_SESSION_KEY, this.user);
    request.setSession(mockSession);

    PowerMock.mockStatic(ControllerUtil.class);
    EasyMock.expect(ControllerUtil.getSignedInUser()).andReturn(user);
    PowerMock.replay(ControllerUtil.class);

    run = new RunImpl();
    group = new PersistentGroup();
    group.setName(PERIODNAME);
    Set<Group> periods = new HashSet<Group>();
    periods.add(group);
    run.setPeriods(periods);
  }

  @After
  public void tearDown() throws Exception {
    PowerMock.verify(ControllerUtil.class);
    studentService = null;
    addprojectparametersValidator = null;
    addProjectController = null;
  }

  @Test
  public void onSubmit_correctProjectCode_OK() throws Exception {
    addprojectparametersValidator.validate(addProjectParameters, errors);
    expectLastCall();
    replay(addprojectparametersValidator);
    studentService.addStudentToRun(user, new Projectcode(LEGAL_PROJECTCODE));
    expectLastCall();
    replay(studentService);

    ModelAndView modelAndView = addProjectController.onSubmit(addProjectParameters, errors);
    assertEquals("student/addprojectsuccess", modelAndView.getViewName());
    assertTrue(!errors.hasErrors());
    verify(addprojectparametersValidator);
    verify(studentService);
  }

  @Test
  public void onSubmit_badRuncode_Error() throws Exception {
    addprojectparametersValidator.validate(addProjectParameters, errors);
    expectLastCall();
    replay(addprojectparametersValidator);

    addProjectParameters.setProjectcode(RUNCODE_NOT_IN_DB + "-" + PERIODNAME);
    studentService.addStudentToRun(user, new Projectcode(RUNCODE_NOT_IN_DB, PERIODNAME));
    expectLastCall().andThrow(new ObjectNotFoundException(RUNCODE_NOT_IN_DB, Run.class));
    replay(studentService);

    ModelAndView modelAndView = addProjectController.onSubmit(addProjectParameters, errors);
    assertEquals(null, modelAndView.getViewName());
    assertTrue(errors.hasErrors());
    assertEquals(1, errors.getFieldErrorCount());

    assertNotNull(errors.getFieldError("projectcode"));
    verify(addprojectparametersValidator);
    verify(studentService);
  }

  @Test
  public void onSubmit_badPeriodname_Error() throws Exception {
    addprojectparametersValidator.validate(addProjectParameters, errors);
    expectLastCall();
    replay(addprojectparametersValidator);

    addProjectParameters.setProjectcode(RUNCODE + "-" + PERIODNAME_NOT_IN_DB);
    studentService.addStudentToRun(user, new Projectcode(RUNCODE, PERIODNAME_NOT_IN_DB));
    expectLastCall().andThrow(new PeriodNotFoundException(PERIODNAME_NOT_IN_DB + " was not found"));
    replay(studentService);

    ModelAndView modelAndView = addProjectController.onSubmit(addProjectParameters, errors);
    assertEquals(null, modelAndView.getViewName());
    assertTrue(errors.hasErrors());
    assertEquals(1, errors.getFieldErrorCount());
    assertNotNull(errors.getFieldError("projectcode"));
    verify(addprojectparametersValidator);
    verify(studentService);
  }

  @Test
  public void onSubmit_studentAlreadyAssociatedWithRun_Error() throws Exception {
    addprojectparametersValidator.validate(addProjectParameters, errors);
    expectLastCall();
    replay(addprojectparametersValidator);

    studentService.addStudentToRun(user, new Projectcode(LEGAL_PROJECTCODE));
    expectLastCall().andThrow(new StudentUserAlreadyAssociatedWithRunException(
        "student user is already associated with this run."));
    replay(studentService);

    ModelAndView modelAndView = addProjectController.onSubmit(addProjectParameters, errors);
    assertEquals(null, modelAndView.getViewName());
    assertTrue(errors.hasErrors());
    assertEquals(1, errors.getFieldErrorCount());
    assertNotNull(errors.getFieldError("projectcode"));
    verify(addprojectparametersValidator);
    verify(studentService);
  }
}
