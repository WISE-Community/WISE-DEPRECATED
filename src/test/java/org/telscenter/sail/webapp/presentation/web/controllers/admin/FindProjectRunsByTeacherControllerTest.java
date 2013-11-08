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
package org.telscenter.sail.webapp.presentation.web.controllers.admin;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.UserImpl;
import net.sf.sail.webapp.service.UserService;

import org.junit.After;
import org.junit.Before;
import org.springframework.context.ApplicationContext;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.AbstractModelAndViewTests;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.impl.FindProjectParameters;
import org.telscenter.sail.webapp.service.offering.RunService;
import static org.easymock.EasyMock.createMock;
import org.easymock.EasyMock;

/**
 * @author patrick lawler
 *
 */
public class FindProjectRunsByTeacherControllerTest extends AbstractModelAndViewTests {

	private ApplicationContext mockApplicationContext;

	private MockHttpServletRequest request;

	private HttpServletResponse response;

	private BindException errors;
	
	private MockHttpSession mockSession;
	
	private UserService userService;
	
	private RunService runService;
	
	private FindProjectRunsController controller;
	
	private FindProjectParameters params;
	
	private User user;
	
	private List<Run> runList;
	
	private final static String USERNAME = "JohnSmith";
	
	
	/**
	 * @see junit.framework.TestCase#setUp()
	 */
	@Before
	public void setUp(){
		request = new MockHttpServletRequest();
		response = new MockHttpServletResponse();
		mockApplicationContext = createMock(ApplicationContext.class);
		userService = createMock(UserService.class);
		runService = createMock(RunService.class);
		mockSession = new MockHttpSession();
		
		params = new FindProjectParameters();
		params.setUserName(USERNAME);
		errors = new BindException(params, "");
		
		controller = new FindProjectRunsController();
		controller.setUserService(userService);
		controller.setRunService(runService);
		controller.setApplicationContext(mockApplicationContext);
		
		request.setSession(mockSession);
		
		user = new UserImpl();
		runList = new ArrayList<Run>();
	}
	
	/**
	 * @see junit.framework.TestCase#tearDown()
	 */
	@After
	public void tearDown(){
		this.mockSession = null;
		this.request = null;
		this.response = null;
		this.controller = null;
		this.userService = null;
		this.runService = null;
		this.params = null;
		this.errors = null;
		this.mockApplicationContext = null;
	}
	
	public void testOnSubmit(){
		
		EasyMock.expect(this.userService.retrieveUserByUsername(USERNAME)).andReturn(user);
		EasyMock.replay(this.userService);
		
		EasyMock.expect(this.runService.getAllRunList()).andReturn(runList);
		EasyMock.replay(this.runService);
		
		ModelAndView modelAndView = this.controller.onSubmit(request, response, params, errors);
		
		assertEquals("admin/manageallprojectruns", modelAndView.getViewName());
		
		EasyMock.verify(this.userService);
		EasyMock.verify(this.runService);
	}
}
