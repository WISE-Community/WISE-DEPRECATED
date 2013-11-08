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
package org.telscenter.sail.webapp.presentation.validators.student;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.authentication.MutableUserDetails;
import net.sf.sail.webapp.domain.authentication.impl.PersistentUserDetails;
import net.sf.sail.webapp.domain.impl.UserImpl;
import net.sf.sail.webapp.service.UserService;

import org.easymock.EasyMock;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.telscenter.sail.webapp.presentation.web.TeamSignInForm;

import junit.framework.TestCase;

/**
 * @author Hiroki Terashima
 * @version $Id: $
 */
public class TeamSignInFormValidatorTest extends TestCase {
	
	private static final String USERNAME1 = "HirokiT619";

	private static final String USERNAME2 = "FrodoH11";

	private static final String USERNAME3 = "SebastianS619";

	private static final String PASSWORD2 = "pass2";

	private static final String PASSWORD3 = "pass3";

	private static final String EMPTY = "";

	private TeamSignInForm form;
	
	private TeamSignInFormValidator validator;
	
	private Errors errors;
	
	private UserService mockUserService;

	/**
	 * @see junit.framework.TestCase#setUp()
	 */
	protected void setUp() {
		form = new TeamSignInForm();
		form.setUsername1(USERNAME1);
		validator = new TeamSignInFormValidator();
		errors = new BeanPropertyBindingResult(form, "");
		mockUserService = EasyMock.createMock(UserService.class);
		validator.setUserService(mockUserService);
	}
	
	public void testOneMemberNoProblemValidate() {
		// only one user (the user who is logged in) decided to run the project
		User user1 = new UserImpl();
		EasyMock.expect(mockUserService.retrieveUserByUsername(USERNAME1)).andReturn(user1);
		EasyMock.replay(mockUserService);
		
		validator.validate(form, errors);
		
		assertTrue(!errors.hasErrors());
		EasyMock.verify(mockUserService);
	}
	
	public void testOneMemberProblemValidate() {
		// only one user (the user who is logged in) decided to run the project
		// but his username doesn't exist in the datastore or is empty
		EasyMock.expect(mockUserService.retrieveUserByUsername(USERNAME1)).andReturn(null);
		EasyMock.replay(mockUserService);
		
		validator.validate(form, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldValue("username1"));
		EasyMock.verify(mockUserService);
		
		form.setUsername1(EMPTY);
		validator.validate(form, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldValue("username1"));
	}
	
	public void testTwoMembersNoProblemValidate() {
		// two users {user1, user2} decide to run the project
		User user1 = new UserImpl();
		EasyMock.expect(mockUserService.retrieveUserByUsername(USERNAME1)).andReturn(user1);
		User user2 = new UserImpl();
		MutableUserDetails userDetails2 = new PersistentUserDetails();
		userDetails2.setPassword(PASSWORD2);
		user2.setUserDetails(userDetails2);
		EasyMock.expect(mockUserService.retrieveUserByUsername(USERNAME2)).andReturn(user2);		
		EasyMock.replay(mockUserService);

		form.setUsername2(USERNAME2);
		form.setPassword2(PASSWORD2);
		validator.validate(form, errors);
		
		assertTrue(!errors.hasErrors());
		EasyMock.verify(mockUserService);
		EasyMock.reset(mockUserService);

		// two users {user1, user3} decide to run the project
		form = new TeamSignInForm();
		form.setUsername1(USERNAME1);

		user1 = new UserImpl();
		EasyMock.expect(mockUserService.retrieveUserByUsername(USERNAME1)).andReturn(user1);
		User user3 = new UserImpl();
		MutableUserDetails userDetails3 = new PersistentUserDetails();
		userDetails3.setPassword(PASSWORD3);
		user3.setUserDetails(userDetails3);
		EasyMock.expect(mockUserService.retrieveUserByUsername(USERNAME3)).andReturn(user3);		
		EasyMock.replay(mockUserService);

		form.setUsername3(USERNAME3);
		form.setPassword3(PASSWORD3);
		validator.validate(form, errors);
		
		assertTrue(!errors.hasErrors());
		EasyMock.verify(mockUserService);
		EasyMock.reset(mockUserService);
	}
	
	public void testTwoMembersProblemValidate() {
		// user2 entered a username that does not exist in the datastore
		User user1 = new UserImpl();
		EasyMock.expect(mockUserService.retrieveUserByUsername(USERNAME1)).andReturn(user1);
		EasyMock.expect(mockUserService.retrieveUserByUsername(USERNAME2)).andReturn(null);
		EasyMock.replay(mockUserService);

		form.setUsername2(USERNAME2);
		form.setPassword2(PASSWORD2);
		validator.validate(form, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldValue("username2"));
		EasyMock.verify(mockUserService);
		EasyMock.reset(mockUserService);
		
		// user2 entered a password that does not match user2's password
//		form = new TeamSignInForm();
//		form.setUsername1(USERNAME1);
//		errors = new BeanPropertyBindingResult(form, "");
//
//		user1 = new UserImpl();
//		EasyMock.expect(mockUserService.retrieveUserByUsername(USERNAME1)).andReturn(user1);
//		User user2 = new UserImpl();
//		MutableUserDetails userDetails2 = new PersistentUserDetails();
//		userDetails2.setPassword(PASSWORD2);
//		user2.setUserDetails(userDetails2);
//		EasyMock.expect(mockUserService.retrieveUserByUsername(USERNAME2)).andReturn(user2);
//		EasyMock.replay(mockUserService);
//
//		form.setUsername2(USERNAME2);
//		form.setPassword2(BAD_PASSWORD);
//		validator.validate(form, errors);
//		
//		assertTrue(errors.hasErrors());
//		assertEquals(1, errors.getErrorCount());
//		assertNotNull(errors.getFieldValue("password2"));
//		EasyMock.verify(mockUserService);
//		EasyMock.reset(mockUserService);
	}
	
	public void testThreeMembersNoProblemValidate() {
		// three users {user1, user2, user3} decide to run the project
		// they enter correct information
		User user1 = new UserImpl();
		EasyMock.expect(mockUserService.retrieveUserByUsername(USERNAME1)).andReturn(user1);
		User user2 = new UserImpl();
		MutableUserDetails userDetails2 = new PersistentUserDetails();
		userDetails2.setPassword(PASSWORD2);
		user2.setUserDetails(userDetails2);
		EasyMock.expect(mockUserService.retrieveUserByUsername(USERNAME2)).andReturn(user2);		
		User user3 = new UserImpl();
		MutableUserDetails userDetails3 = new PersistentUserDetails();
		userDetails3.setPassword(PASSWORD3);
		user3.setUserDetails(userDetails3);
		EasyMock.expect(mockUserService.retrieveUserByUsername(USERNAME3)).andReturn(user3);	
		EasyMock.replay(mockUserService);

		form.setUsername2(USERNAME2);
		form.setPassword2(PASSWORD2);
		form.setUsername3(USERNAME3);
		form.setPassword3(PASSWORD3);
		validator.validate(form, errors);
		
		assertTrue(!errors.hasErrors());
		EasyMock.verify(mockUserService);
		EasyMock.reset(mockUserService);
	}
	
	public void testThreeMembersProblemValidate() {
		// three users {user1, user2, user3} decide to run the project
		// user2 enters username that doesn't exist in datastore
		User user1 = new UserImpl();
		EasyMock.expect(mockUserService.retrieveUserByUsername(USERNAME1)).andReturn(user1);
		EasyMock.expect(mockUserService.retrieveUserByUsername(USERNAME2)).andReturn(null);
		User user3 = new UserImpl();
		MutableUserDetails userDetails3 = new PersistentUserDetails();
		userDetails3.setPassword(PASSWORD3);
		user3.setUserDetails(userDetails3);
		EasyMock.expect(mockUserService.retrieveUserByUsername(USERNAME3)).andReturn(user3);
		EasyMock.replay(mockUserService);

		form.setUsername2(USERNAME2);
		form.setPassword2(PASSWORD2);
		form.setUsername3(USERNAME3);
		form.setPassword3(PASSWORD3);
		validator.validate(form, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldValue("username2"));
		EasyMock.verify(mockUserService);
		EasyMock.reset(mockUserService);
		
		// user2 entered a password that does not match user2's password
//		form = new TeamSignInForm();
//		form.setUsername1(USERNAME1);
//		errors = new BeanPropertyBindingResult(form, "");
//
//		user1 = new UserImpl();
//		EasyMock.expect(mockUserService.retrieveUserByUsername(USERNAME1)).andReturn(user1);
//		User user2 = new UserImpl();
//		MutableUserDetails userDetails2 = new PersistentUserDetails();
//		userDetails2.setPassword(PASSWORD2);
//		user2.setUserDetails(userDetails2);
//		EasyMock.expect(mockUserService.retrieveUserByUsername(USERNAME2)).andReturn(user2);
//		user3 = new UserImpl();
//		userDetails3 = new PersistentUserDetails();
//		userDetails3.setPassword(PASSWORD3);
//		user3.setUserDetails(userDetails3);
//		EasyMock.expect(mockUserService.retrieveUserByUsername(USERNAME3)).andReturn(user3);
//		EasyMock.replay(mockUserService);
//
//		form.setUsername2(USERNAME2);
//		form.setPassword2(BAD_PASSWORD);
//		form.setUsername3(USERNAME3);
//		form.setPassword3(PASSWORD3);
//		validator.validate(form, errors);
//		
//		assertTrue(errors.hasErrors());
//		assertEquals(1, errors.getErrorCount());
//		assertNotNull(errors.getFieldValue("password2"));
//		EasyMock.verify(mockUserService);
//		EasyMock.reset(mockUserService);
	}
	
	/**
	 * @see junit.framework.TestCase#tearDown()
	 */
	protected void tearDown() {
		form = null;
		validator = null;
		errors = null;
	}

}
