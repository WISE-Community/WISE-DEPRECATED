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
package org.telscenter.sail.webapp.presentation.web.controllers.teacher;

import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.reset;
import static org.easymock.EasyMock.verify;

import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.UserImpl;
import net.sf.sail.webapp.service.UserService;
import net.sf.sail.webapp.service.authentication.DuplicateUsernameException;

import org.springframework.context.ApplicationContext;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.AbstractModelAndViewTests;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.telscenter.sail.webapp.domain.authentication.impl.TeacherUserDetails;
import org.telscenter.sail.webapp.presentation.web.TeacherAccountForm;
import org.telscenter.sail.webapp.presentation.web.controllers.teacher.RegisterTeacherController;

/**
 * Test class for controller for registering TELS teachers
 *
 * @author Hiroki Terashima
 * @version $Id: $
 */
public class RegisterTeacherControllerTest extends AbstractModelAndViewTests {

	private static final String SUCCESS = "WooHoo";

	private static final String FORM = "Form";

	private static final String PASSWORD = "Pass";
	
	private static final String FIRSTNAME = "Hiroki";

	private static final String LASTNAME = "Terashima";

	private static final String USERNAME = FIRSTNAME + LASTNAME;

	private static final String DISPLAYNAME = FIRSTNAME + " " + LASTNAME;
	
	ApplicationContext mockApplicationContext;

	MockHttpServletRequest request;

	HttpServletResponse response;

	BindException errors;
	
	TeacherUserDetails teacherUserDetails;
	
	TeacherAccountForm teacherAccountForm;

	UserService mockUserService;
	
	@Override
	protected void setUp() throws Exception {
		super.setUp();
		request = new MockHttpServletRequest();
		response = new MockHttpServletResponse();
		mockApplicationContext = createMock(ApplicationContext.class);
		teacherUserDetails = new TeacherUserDetails();
		teacherAccountForm = new TeacherAccountForm();
		errors = new BindException(teacherUserDetails, "");
		mockUserService = createMock(UserService.class);
	}
	
	public void testOnSubmit() throws Exception {
		// test submission of form with correct username and password info.
		// should get ModelAndView back containing view which is instance of
		// RedirectView, with name of success view as URL.

		User user = new UserImpl();
		expect(mockUserService.createUser(teacherUserDetails)).andReturn(user);
		replay(mockUserService);

		teacherUserDetails.setFirstname(FIRSTNAME);
		teacherUserDetails.setLastname(LASTNAME);
		teacherUserDetails.setUsername(USERNAME);
		teacherUserDetails.setDisplayname(DISPLAYNAME);
		request.addParameter("firstname", FIRSTNAME);
		request.addParameter("lastname", LASTNAME);
		request.addParameter("password", PASSWORD);		

		teacherAccountForm.setUserDetails(teacherUserDetails);
		RegisterTeacherController signupController = new RegisterTeacherController();
		signupController.setApplicationContext(mockApplicationContext);
		signupController.setUserService(mockUserService);
		signupController.setSuccessView(SUCCESS);
		ModelAndView modelAndView = signupController.onSubmit(request,
				response, teacherAccountForm, errors);

		assertEquals(SUCCESS, modelAndView.getViewName());
		assertModelAttributeValue(modelAndView, RegisterTeacherController.USERNAME_KEY, USERNAME);
		assertModelAttributeValue(modelAndView, RegisterTeacherController.DISPLAYNAME_KEY, DISPLAYNAME);
		verify(mockUserService);

		// test submission of form with same firstname, lastname and birthday info which
		// would result in a duplicate username
		reset(mockUserService);
		expect(mockUserService.createUser(teacherUserDetails)).andThrow(
				new DuplicateUsernameException(teacherUserDetails.getUsername()));
		replay(mockUserService);

		signupController.setFormView(FORM);
		modelAndView = signupController.onSubmit(request, response,
				teacherAccountForm, errors);

		assertViewName(modelAndView, FORM);
		assertEquals(1, errors.getErrorCount());
		assertEquals(1, errors.getFieldErrorCount("username"));
		verify(mockUserService);

		// test submission of form where RuntimeException is thrown.
		// should catch a RuntimeException
		reset(mockUserService);
		expect(mockUserService.createUser(teacherUserDetails)).andThrow(
				new RuntimeException());
		replay(mockUserService);
		signupController.setFormView(FORM);
		try {
			signupController.onSubmit(request, response, teacherAccountForm, errors);
			fail("Expected RuntimeException but it never happened.");
		} catch (RuntimeException expected) {
		}
		verify(mockUserService);
	}
	
	@Override
	protected void tearDown() throws Exception {
		super.tearDown();
		request = null;
		response = null;
	}
	
}
