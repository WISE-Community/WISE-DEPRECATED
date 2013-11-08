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

import javax.servlet.http.HttpSession;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.UserImpl;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;
import net.sf.sail.webapp.service.UserService;

import org.easymock.EasyMock;
import org.junit.After;
import org.junit.Before;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.AbstractModelAndViewTests;
import org.springframework.web.servlet.ModelAndView;


/**
 * @author Sally Ahn
 * @version $Id: $
 */
public class ViewAllUsersControllerTest extends AbstractModelAndViewTests{
	
	private ViewAllUsersController viewAllUsersController;

	private MockHttpServletRequest request;

	private MockHttpServletResponse response;
	
	private UserService mockUserService;
	
	private List<User> allUsers;
	
	private List<User> teachers;
	
	private List<User> students;
	
	private List<User> admins;
	
	private List<User> other;
	
	private User user;

	/**
	 * @see junit.framework.TestCase#setUp()
	 */
	@Before
	public void setUp() throws Exception {
		super.setUp();
		this.request = new MockHttpServletRequest();
		this.response = new MockHttpServletResponse();
		HttpSession mockSession = new MockHttpSession();
		this.user = new UserImpl();
		
		mockSession.setAttribute(User.CURRENT_USER_SESSION_KEY, this.user);
		this.request.setSession(mockSession);

		this.mockUserService = EasyMock.createMock(UserService.class);
		
		this.viewAllUsersController = new ViewAllUsersController();
		this.viewAllUsersController.setUserService(mockUserService);
		this.allUsers = new ArrayList<User>();
		this.teachers = new ArrayList<User>();
		this.students = new ArrayList<User>();
		this.admins = new ArrayList<User>();
		this.other = new ArrayList<User>();
	}

	
	public void testHandleRequestInternal() throws Exception{
		
		EasyMock.expect(mockUserService.retrieveAllUsers()).andReturn(allUsers);
    	EasyMock.replay(mockUserService);
    	
    	ModelAndView modelAndView = 
    		viewAllUsersController.handleRequestInternal(request, response);

    	assertModelAttributeValue(modelAndView, viewAllUsersController.ADMINS,
    			this.admins);
    	assertModelAttributeValue(modelAndView, viewAllUsersController.TEACHERS,
    			this.teachers);
    	assertModelAttributeValue(modelAndView, viewAllUsersController.STUDENTS,
    			this.students);
    	assertModelAttributeValue(modelAndView, viewAllUsersController.OTHER,
    			this.other);
    	assertModelAttributeValue(modelAndView, 
    			ControllerUtil.USER_KEY, user);
    	assertEquals(modelAndView.getViewName(), "admin/manageusers");
    	EasyMock.verify(mockUserService);
	}
	
	/**
	 * @see junit.framework.TestCase#tearDown()
	 */
	@After
	public void tearDown() throws Exception {
		super.tearDown();
		this.request = null;
		this.response = null;
		this.mockUserService = null;
	}
}
