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
package org.wise.portal.presentation.web.controllers.teacher.management;

import static org.easymock.EasyMock.verify;

import javax.servlet.http.HttpSession;

import org.easymock.EasyMock;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.AbstractModelAndViewTests;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.PersistentUserDetails;
import org.wise.portal.domain.impl.ChangeWorkgroupParameters;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.domain.workgroup.impl.WorkgroupImpl;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.workgroup.WISEWorkgroupService;


/**
 * @author Sally Ahn
 * @version $Id: $
 */
public class ChangeWorkgroupControllerTest extends AbstractModelAndViewTests {

	private ChangeWorkgroupController changeWorkgroupController;
	
	private ChangeWorkgroupParameters changeWorkgroupParameters;
	
	private WISEWorkgroupService mockWorkgroupService;
	
	private UserService mockUserService;
	
	private MockHttpServletRequest request;

	private MockHttpServletResponse response;
	
	private HttpSession mockSession;
	
	private BindException errors;
	
	private User user;
	
	private User student;
	
	private MutableUserDetails studentDetails;
	
	private Workgroup workgroupFrom;
	
	private Workgroup workgroupTo;
	
	private static final Long WORKGROUP_TO_ID = Long.parseLong("2");
	
	private static final Long WORKGROUP_FROM_ID = Long.parseLong("3");
	
	private static final String STUDENT_NAME = "alice";
	
	private static final String SUCCESS = "SUCCESS VIEW";
	
	private static final String FORM = "FORM VIEW";

	private static final String OFFERING_ID = "5";

	private static final String PERIOD_ID = "2";

	/**
	 * @see junit.framework.TestCase#setUp()
	 */
	protected void setUp() throws Exception {
		super.setUp();
		request = new MockHttpServletRequest();
		response = new MockHttpServletResponse();
		mockSession = new MockHttpSession();
		user = new UserImpl();
		mockSession.setAttribute(User.CURRENT_USER_SESSION_KEY, user);
		request.setSession(mockSession);
		
		mockWorkgroupService = EasyMock.createMock(WISEWorkgroupService.class);
		mockUserService = EasyMock.createMock(UserService.class);
		
		student = new UserImpl();
		studentDetails = new PersistentUserDetails();
		studentDetails.setUsername(STUDENT_NAME);
		student.setUserDetails(studentDetails);
		workgroupTo = new WorkgroupImpl();
		workgroupFrom = new WorkgroupImpl();
		workgroupFrom.addMember(student);

		changeWorkgroupController = new ChangeWorkgroupController();
		changeWorkgroupController.setSuccessView(SUCCESS);
		changeWorkgroupController.setFormView(FORM);
		changeWorkgroupController.setWorkgroupService(mockWorkgroupService);
		changeWorkgroupController.setUserService(mockUserService);
		changeWorkgroupParameters = new ChangeWorkgroupParameters();
		changeWorkgroupParameters.setStudent(student);
		changeWorkgroupParameters.setWorkgroupFrom(workgroupFrom);
		changeWorkgroupParameters.setWorkgroupTo(null);
		changeWorkgroupParameters.setWorkgroupToId(WORKGROUP_TO_ID);
		
		errors = new BindException(changeWorkgroupParameters, "");
	}

	/**
	 * @see junit.framework.TestCase#tearDown()
	 */
	protected void tearDown() throws Exception {
		super.tearDown();
		request = null;
		response = null;
		mockWorkgroupService = null;
	}
	
	public void testOnSubmit_success() throws Exception {
		// tests when one student is moved from one group to another.
		// should return a success view 
		EasyMock.expect(mockWorkgroupService.retrieveById(WORKGROUP_TO_ID)).andReturn(workgroupTo);
		EasyMock.expect(mockWorkgroupService.updateWorkgroupMembership(changeWorkgroupParameters)).andReturn(null);
        EasyMock.replay(this.mockWorkgroupService);
      
		
        ModelAndView modelAndView = changeWorkgroupController.onSubmit(request, response, changeWorkgroupParameters, errors);
		assertEquals(SUCCESS, modelAndView.getViewName());
		assertTrue(!errors.hasErrors());
		verify(mockWorkgroupService);
	}
	
	public void testShowForm() throws Exception {
		assertTrue(true);
	}
	
	public void testFormBackingObject_success() throws ObjectNotFoundException {
		request.setParameter("workgroupFrom", WORKGROUP_FROM_ID.toString());
		request.setParameter("student", STUDENT_NAME);
		request.setParameter("offeringId", OFFERING_ID);
		request.setParameter("periodId", PERIOD_ID);
		
		EasyMock.expect(mockUserService.retrieveUserByUsername(STUDENT_NAME)).andReturn(student);
		EasyMock.replay(this.mockUserService);
		EasyMock.expect(mockWorkgroupService.retrieveById(WORKGROUP_FROM_ID)).andReturn(workgroupFrom);
		EasyMock.replay(this.mockWorkgroupService);
		
		Object returnedParams = null;
		try {
			returnedParams = changeWorkgroupController.formBackingObject(request);
		} catch (Exception e) {
			fail("Exception thrown but should not have been thrown");
		}
		assertTrue(returnedParams instanceof ChangeWorkgroupParameters);
		
		verify(mockUserService);
		verify(mockWorkgroupService);
		ChangeWorkgroupParameters params = (ChangeWorkgroupParameters) returnedParams;
		assertEquals(params.getStudent().getUserDetails().getUsername(), STUDENT_NAME);
		assertTrue(true);
	}
	
	public void testFormBackingObject_failure() {
		// TODO patrick&sally test when formBackingObject throws an exception
		assertTrue(true);
	}
}
