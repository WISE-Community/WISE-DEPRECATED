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

import java.util.HashMap;

import javax.servlet.http.HttpSession;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.UserImpl;
import net.sf.sail.webapp.service.UserService;
import java.util.Calendar;
import org.easymock.EasyMock;
import org.junit.Before;
import org.junit.After;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.AbstractModelAndViewTests;
import org.springframework.web.servlet.ModelAndView;
import org.telscenter.sail.webapp.domain.authentication.Schoollevel;
import org.telscenter.sail.webapp.domain.authentication.impl.TeacherUserDetails;

/**
 * @author patrick lawler
 *
 */
public class InfoControllerTest extends AbstractModelAndViewTests{

	private MockHttpServletRequest request;

	private MockHttpServletResponse response;
	
	private UserService mockUserService;
	
	private InfoController controller;
	
	private User user;
	
	private TeacherUserDetails userDetails;
	
	private HashMap<String, Object> info;
	
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
		this.userDetails = new TeacherUserDetails();
		this.userDetails.setCity("Berkeley");
		this.userDetails.setCountry("USA");
		String[] subjects = {"physics", "astronomy"};
		this.userDetails.setCurriculumsubjects(subjects);
		this.userDetails.setDisplayname("Mr. Mister");
		this.userDetails.setEmailAddress("mr@here.com");
		this.userDetails.setFirstname("John");
		this.userDetails.setLastLoginTime(Calendar.getInstance().getTime());
		this.userDetails.setLastname("Smith");
		this.userDetails.setNumberOfLogins(5);
		this.userDetails.setSchoollevel(Schoollevel.HIGH_SCHOOL);
		this.userDetails.setSchoolname("Berkeley");
		this.userDetails.setSignupdate(Calendar.getInstance().getTime());
		this.userDetails.setState("CA");
		this.userDetails.setUsername("JohnSmith");

		this.user.setUserDetails(this.userDetails);
		
		request.setParameter("userName", "JohnSmith");
		this.request.setSession(mockSession);
		this.mockUserService = EasyMock.createMock(UserService.class);
		
		this.controller = new InfoController();
		this.controller.setUserService(this.mockUserService);
		this.info = this.userDetails.getInfo();
	}
	
	@After
	public void tearDown(){
		this.info = null;
		this.mockUserService = null;
		this.controller = null;
		this.request = null;
		this.response = null;
	}
	
	public void testHandleRequestInternal()throws Exception{
		
		EasyMock.expect(this.mockUserService.retrieveUserByUsername("JohnSmith")).andReturn(this.user);
		EasyMock.replay(this.mockUserService);
		ModelAndView modelAndView = this.controller.handleRequestInternal(request, response);
		
		assertModelAttributeValue(modelAndView, this.controller.USER_INFO_MAP, this.info);
		
		EasyMock.verify(this.mockUserService);
	}
}
