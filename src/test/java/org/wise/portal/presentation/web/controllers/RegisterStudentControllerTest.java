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
package org.wise.portal.presentation.web.controllers;

import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.reset;
import static org.easymock.EasyMock.verify;

import java.util.Calendar;
import java.util.Date;

import javax.servlet.http.HttpServletResponse;

import org.springframework.context.ApplicationContext;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.AbstractModelAndViewTests;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindException;
import org.springframework.web.bind.support.SessionStatus;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.Gender;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.project.impl.Projectcode;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.presentation.web.StudentAccountForm;
import org.wise.portal.presentation.web.controllers.student.StudentAccountController;
import org.wise.portal.service.acl.AclService;
import org.wise.portal.service.authentication.DuplicateUsernameException;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.student.StudentService;
import org.wise.portal.service.user.UserService;


/**
 * @author Hiroki Terashima
 *
 * @version $Id$
 */
public class RegisterStudentControllerTest extends AbstractModelAndViewTests {

	private static final String SUCCESS = "WooHoo";

	private static final String FORM = "Form";

	private static final String PASSWORD = "Pass";
	
	private static final String FIRSTNAME = "Hiroki";

	private static final String LASTNAME = "Terashima";
	
	private static final String RUNCODE = "fly8978";
	
	private static final String PERIODNAME = "3";
	
	private static final String LEGAL_PROJECTCODE = RUNCODE + "-" + PERIODNAME;

	private final String RUNCODE_NOT_IN_DB = "abc1234";
	
	private final String PERIODNAME_NOT_IN_DB = "thisperioddoesnotexist";

	private static final Gender GENDER = Gender.MALE;

	private Date birthday = null;
	
	private ApplicationContext mockApplicationContext;

	private MockHttpServletRequest request;

	private HttpServletResponse response;

	private BindException errors;
	
	private SessionStatus status;
	
	private ModelMap modelMap;
	
	private StudentUserDetails studentUserDetails;
	
	private StudentAccountForm studentAccountForm;

	private UserService mockUserService;
	
	private StudentService mockStudentService;
	
	private RunService mockRunService;
	
	private AclService<Run> mockAclService;
	
	private StudentAccountController signupController;
	
	@SuppressWarnings("unchecked")
	@Override
	protected void setUp() throws Exception {
		super.setUp();
		request = new MockHttpServletRequest();
		response = new MockHttpServletResponse();
		
		mockApplicationContext = createMock(ApplicationContext.class);
		studentUserDetails = new StudentUserDetails();
		studentAccountForm = new StudentAccountForm();
		errors = new BindException(studentAccountForm, "");
		mockUserService = createMock(UserService.class);
		mockRunService = createMock(RunService.class);
		mockAclService = createMock(AclService.class);
		mockStudentService = createMock(StudentService.class);
		
		Calendar cal = Calendar.getInstance();
		cal.set(1983, 6, 19);
		birthday = cal.getTime();
		
		studentUserDetails.setFirstname(FIRSTNAME);
		studentUserDetails.setLastname(LASTNAME);
		studentUserDetails.setGender(GENDER);
		studentUserDetails.setBirthday(this.birthday);
		request.addParameter("firstname", FIRSTNAME);
		request.addParameter("lastname", LASTNAME);
		request.addParameter("password", PASSWORD);		
		
		studentAccountForm.setUserDetails(studentUserDetails);
		studentAccountForm.setProjectCode(LEGAL_PROJECTCODE);
		signupController = new StudentAccountController();
	}
	
	public void testOnSubmit_success() throws Exception {
		// test submission of form with correct username and password info.
		// should get ModelAndView back containing view which is instance of
		// RedirectView, with name of success view as URL.

		User user = new UserImpl();
		expect(mockUserService.createUser(studentUserDetails)).andReturn(user);
		replay(mockUserService);
		
		mockStudentService.addStudentToRun(user, new Projectcode(LEGAL_PROJECTCODE));
		expectLastCall();
		replay(mockStudentService);
				
		String view = signupController.onSubmit(studentAccountForm, errors, request,
				response, status, modelMap);

		assertEquals(SUCCESS, view);
		verify(mockUserService);
		verify(mockStudentService);

		// test submission of form with same firstname, lastname and birthday info which
		// would result in a duplicate username
		reset(mockUserService);
		expect(mockUserService.createUser(studentUserDetails)).andThrow(
				new DuplicateUsernameException(studentUserDetails.getUsername()));
		replay(mockUserService);

		view = signupController.onSubmit(studentAccountForm, errors, request,
				response, status, modelMap);

		assertEquals(view, FORM);
		assertEquals(1, errors.getErrorCount());
		assertEquals(1, errors.getFieldErrorCount("userDetails.username"));
		verify(mockUserService);

		// test submission of form where RuntimeException is thrown.
		// should catch a RuntimeException
		reset(mockUserService);
		expect(mockUserService.createUser(studentUserDetails)).andThrow(
				new RuntimeException());
		replay(mockUserService);
		try {
			signupController.onSubmit(studentAccountForm, errors, request,
					response, status, modelMap);
			fail("Expected RuntimeException but it never happened.");
		} catch (RuntimeException expected) {
		}
		verify(mockUserService);
	}
	
	public void testOnSubmit_failure_bad_runcode() throws Exception {
		// test submission of form with correct username and password info,
		// but with bad projectcode (specifically, the runcode)
		// Should get ModelAndView back containing form view
		User user = new UserImpl();
		expect(mockUserService.createUser(studentUserDetails)).andReturn(user);
		replay(mockUserService);
		
		studentAccountForm.setProjectCode(RUNCODE_NOT_IN_DB + "-" + PERIODNAME);
		mockStudentService.addStudentToRun(user, new Projectcode(RUNCODE_NOT_IN_DB, PERIODNAME));
		expectLastCall().andThrow(new ObjectNotFoundException(RUNCODE_NOT_IN_DB, Run.class));
		replay(mockStudentService);
		
		String view = signupController.onSubmit(studentAccountForm, errors, request,
				response, status, modelMap);

		assertEquals(FORM, view);
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getFieldErrorCount());
		
		assertNotNull(errors.getFieldError("projectCode"));
		verify(mockUserService);
		verify(mockStudentService);
	}
	
	public void testOnSubmit_failure_bad_periodname() throws Exception {
		// test submission of form with correct username and password info,
		// but with bad projectcode (specifically, the periodname)
		// Should get ModelAndView back containing form view
		User user = new UserImpl();
		expect(mockUserService.createUser(studentUserDetails)).andReturn(user);
		replay(mockUserService);
		
		studentAccountForm.setProjectCode(RUNCODE + "-" + PERIODNAME_NOT_IN_DB);
		mockStudentService.addStudentToRun(user, new Projectcode(RUNCODE, PERIODNAME_NOT_IN_DB));
		expectLastCall().andThrow(new ObjectNotFoundException(PERIODNAME_NOT_IN_DB, Run.class));
		replay(mockStudentService);
		
		String view = signupController.onSubmit(studentAccountForm, errors, request,
				response, status, modelMap);

		assertEquals(FORM, view);
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getFieldErrorCount());
		
		assertNotNull(errors.getFieldError("projectCode"));
		verify(mockUserService);
		verify(mockStudentService);
	}
	
	@Override
	protected void tearDown() throws Exception {
		super.tearDown();
		request = null;
		response = null;
	}
}
