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

import static org.easymock.EasyMock.createMock;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.UserImpl;
import net.sf.sail.webapp.service.UserService;

import org.easymock.EasyMock;
import org.junit.After;
import org.junit.Before;
import org.springframework.context.ApplicationContext;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.AbstractModelAndViewTests;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.telscenter.sail.webapp.domain.impl.LookupParameters;

/**
 * @author patrick lawler
 *
 */
public class LookupStudentControllerTest extends AbstractModelAndViewTests{

	private ApplicationContext applicationContext;

	private MockHttpServletRequest request;

	private HttpServletResponse response;

	private BindException errors;
	
	private LookupStudentController controller;
	
	private UserService userService;
	
	private LookupParameters params;
	
	private List<User> returnedList;
	
	private final static String FIELD = "FIRSTNAME";
	
	private final static String CRITERIA = "=";
	
	private final static String DATA = "Sarah";
	
	private final static String VIEW = "admin/manageusers";
	
	private final static String MESSAGE = "No users given search criteria found.";
	
	/**
	 * @see junit.framework.TestCase#setUp()
	 */
	@Before
	public void setUp(){
		this.request = new MockHttpServletRequest();
		this.response = new MockHttpServletResponse();
		this.applicationContext = createMock(ApplicationContext.class);
		this.userService = createMock(UserService.class);
		this.params = new LookupParameters();
		this.params.setLookupField(FIELD);
		this.params.setLookupCriteria(CRITERIA);
		this.params.setLookupData(DATA);
		this.returnedList = new ArrayList<User>();
		
		this.errors = new BindException(this.params, "");
		
		this.controller = new LookupStudentController();
		this.controller.setApplicationContext(this.applicationContext);
		this.controller.setUserService(userService);
	}
	
	
	/**
	 * @see junit.framework.TestCase#tearDown()
	 */
	@After
	public void tearDown(){
		this.returnedList = null;
		this.userService = null;
		this.applicationContext = null;
		this.controller = null;
		this.errors = null;
		this.params = null;
		this.request = null;
		this.response = null;
	}
	
	public void testOnSubmit_FoundUsers(){
		this.returnedList.add(new UserImpl());
		
		EasyMock.expect(this.userService.retrieveByField(FIELD.toLowerCase(), 
				CRITERIA, DATA, "studentUserDetails")).andReturn(this.returnedList);
		EasyMock.replay(this.userService);
		
		ModelAndView modelAndView = this.controller.onSubmit(request, response, params, errors);
		
		assertTrue(!errors.hasErrors());
		assertEquals(modelAndView.getViewName(), VIEW);
		assertModelAttributeValue(modelAndView, "students", this.returnedList);
		
		EasyMock.verify(this.userService);
	}
	
	public void testOnSubmit_NoUsersFound(){
		EasyMock.expect(this.userService.retrieveByField(FIELD.toLowerCase(), 
				CRITERIA, DATA, "studentUserDetails")).andReturn(this.returnedList);
		EasyMock.replay(this.userService);
		
		ModelAndView modelAndView = this.controller.onSubmit(request, response, params, errors);
		
		assertTrue(!errors.hasErrors());
		assertEquals(modelAndView.getViewName(), VIEW);
		assertModelAttributeValue(modelAndView, "message", MESSAGE);
		
		EasyMock.verify(this.userService);
	}
}
