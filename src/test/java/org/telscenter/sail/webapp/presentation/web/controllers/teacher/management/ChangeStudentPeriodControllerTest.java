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
package org.telscenter.sail.webapp.presentation.web.controllers.teacher.management;

import static org.easymock.EasyMock.*;

import javax.servlet.http.HttpSession;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.UserImpl;
import net.sf.sail.webapp.service.UserService;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.context.ApplicationContext;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.AbstractModelAndViewTests;
import org.telscenter.sail.webapp.presentation.web.controllers.teacher.management.ChangeStudentPeriodController;
import org.telscenter.sail.webapp.service.offering.RunService;
import org.telscenter.sail.webapp.service.student.StudentService;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.impl.ChangePeriodParameters;
import org.telscenter.sail.webapp.domain.impl.RunImpl;


/**
 * @author patrick lawler
 *
 */
public class ChangeStudentPeriodControllerTest extends AbstractModelAndViewTests{
	
	private ChangePeriodParameters params;
	
	private ChangeStudentPeriodController controller;
	
	private UserService userService;
	
	private StudentService studentService;
	
	private RunService runService;
	
	private ApplicationContext mockApplicationContext;
	
	private MockHttpServletRequest request;
	
	private MockHttpServletResponse response;
	
	private HttpSession mockSession;
	
	private BindException errors;
	
	private final static User STUDENT = new UserImpl();
	
	private final static User TEACHER = new UserImpl();
	
	private final static Run RUN = new RunImpl();
	
	private final static String PROJECTCODE = "ZEBRA111-2";
	
	private final static String PROJECTCODETO = "ZEBRA111-3";

	private final static String SUCCESS = "SUCCESS VIEW";
	
	private final static String USERID = "5";
	
	private final static String RUNID = "2";
	
	@Override
	public void setUp(){
		mockApplicationContext = createMock(ApplicationContext.class);
		request = new MockHttpServletRequest();
		response = new MockHttpServletResponse();
		params = new ChangePeriodParameters();
		params.setProjectcode(PROJECTCODE);
		params.setProjectcodeTo(PROJECTCODETO);
		params.setRun(RUN);
		params.setStudent(STUDENT);
		errors = new BindException (params, "");
		mockSession = new MockHttpSession();
		mockSession.setAttribute(User.CURRENT_USER_SESSION_KEY, TEACHER);
		request.setSession(mockSession);
		userService = createMock(UserService.class);
		studentService = createMock(StudentService.class);
		runService = createMock(RunService.class);
		controller = new ChangeStudentPeriodController();
		controller.setApplicationContext(mockApplicationContext);
		controller.setUserService(userService);
		controller.setStudentService(studentService);
		controller.setRunService(runService);
		controller.setSuccessView(SUCCESS);
	}
	
	@Override
	public void tearDown(){
		mockApplicationContext = null;
		request = null;
		response = null;
		params = null;
		errors = null;
		mockSession = null;
		userService = null;
		runService = null;
		controller = null;
	}
	
	public void testFormBackingObject() throws Exception{
		request.setParameter("runId", RUNID);
		request.setParameter("userId", USERID);
		request.setParameter("projectCode", PROJECTCODE);
				
		expect(userService.retrieveById(Long.parseLong(USERID))).andReturn(STUDENT);
		replay(userService);
		expect(runService.retrieveById(Long.parseLong(RUNID))).andReturn(RUN);
		replay(runService);
		
		Object returnParams = controller.formBackingObject(request);
		assertTrue(returnParams instanceof ChangePeriodParameters);
		ChangePeriodParameters fParam = (ChangePeriodParameters) returnParams;
		assertEquals(fParam.getStudent(), STUDENT);
		assertEquals(fParam.getRun(), RUN);

		verify(userService);
		verify(runService);
	}
	
	public void testOnSubmit() throws Exception{
		
		ModelAndView mav = controller.onSubmit(request, response, params, errors);
		assertEquals(mav.getViewName(), SUCCESS);
		assertTrue(!errors.hasErrors());
	}
}
