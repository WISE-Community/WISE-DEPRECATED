/**
 * Copyright (c) 2006 Encore Research Group, University of Toronto
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package net.sf.sail.webapp.presentation.web.controllers;

import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;

import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.authentication.MutableUserDetails;
import net.sf.sail.webapp.domain.authentication.impl.PersistentUserDetails;
import net.sf.sail.webapp.domain.impl.UserImpl;
import net.sf.sail.webapp.service.UserService;
import net.sf.sail.webapp.service.authentication.DuplicateUsernameException;

import org.springframework.context.ApplicationContext;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.AbstractModelAndViewTests;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;

/**
 * @author Laurel Williams
 * @author Cynick Young
 * 
 * @version $Id$
 */
public class SignupControllerTest extends AbstractModelAndViewTests {

	private static final String USERNAME = "User";

	private static final String SUCCESS = "WooHoo";

	private static final String FORM = "Form";

	ApplicationContext mockApplicationContext;

	MockHttpServletRequest request;

	HttpServletResponse response;

	MutableUserDetails userDetails;

	BindException errors;

	UserService mockUserService;

	@Override
	protected void setUp() throws Exception {
		super.setUp();
		request = new MockHttpServletRequest();
		response = new MockHttpServletResponse();
		userDetails = new PersistentUserDetails();
		errors = new BindException(userDetails, "");
		mockUserService = createMock(UserService.class);
		mockApplicationContext = createMock(ApplicationContext.class);
	}

	public void testOnSubmit() throws Exception {
		// test submission of form with correct username and password info.
		// should get ModelAndView back containing view which is instance of
		// RedirectView, with name of success view as URL.

		User user = new UserImpl();
		expect(mockUserService.createUser(userDetails)).andReturn(user);
		replay(mockUserService);

		userDetails.setUsername(USERNAME);
		SignupController signupController = new SignupController();
		signupController.setUserService(mockUserService);
		signupController.setSuccessView(SUCCESS);
		ModelAndView modelAndView = signupController.onSubmit(request,
				response, userDetails, errors);

		assertTrue(modelAndView.getView() instanceof RedirectView);
		assertEquals(SUCCESS, ((RedirectView) modelAndView.getView()).getUrl());
		verify(mockUserService);
	}
	
	public void testOnSubmitDuplicateUsernameException() throws Exception {

		// test submission of form with same username and password info which
		// would result in DuplicateUsernameException being thrown. Should get
		// back ModelAndView with original form returned with name of Form View
		// as set.
		expect(mockUserService.createUser(this.userDetails)).andThrow(
				new DuplicateUsernameException(userDetails.getUsername()));
		replay(mockUserService);

		SignupController signupController = new SignupController();
		signupController.setUserService(mockUserService);
		signupController.setFormView(FORM);
		ModelAndView modelAndView = signupController.onSubmit(request, response,
				userDetails, errors);

		assertViewName(modelAndView, FORM);
		assertEquals(1, errors.getErrorCount());
		assertEquals(1, errors.getFieldErrorCount("username"));
		verify(mockUserService);
		
	}

	public void testOnSubmitRuntimeException() throws Exception {
		// test submission of form where RuntimeException is thrown.
		// should catch a RuntimeException
		expect(mockUserService.createUser(userDetails)).andThrow(
				new RuntimeException());
		replay(mockUserService);
		SignupController signupController = new SignupController();
		signupController.setUserService(mockUserService);

		try {
			signupController.onSubmit(request, response, userDetails, errors);
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
		userDetails = null;
		errors = null;
		mockUserService = null;
	}
}