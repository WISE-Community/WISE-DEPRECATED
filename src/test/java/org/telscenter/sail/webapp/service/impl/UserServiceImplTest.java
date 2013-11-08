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
package org.telscenter.sail.webapp.service.impl;

import java.util.Calendar;
import java.util.Collection;
import java.util.Date;

import net.sf.sail.webapp.dao.authentication.GrantedAuthorityDao;
import net.sf.sail.webapp.dao.user.UserDao;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.authentication.MutableGrantedAuthority;
import net.sf.sail.webapp.domain.impl.UserImpl;
import net.sf.sail.webapp.service.UserService;

import org.easymock.EasyMock;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.authentication.dao.SaltSource;
import org.springframework.security.authentication.encoding.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetails;
import org.telscenter.sail.webapp.domain.authentication.Gender;
import org.telscenter.sail.webapp.domain.authentication.MutableUserDetails;
import org.telscenter.sail.webapp.domain.authentication.impl.StudentUserDetails;
import org.telscenter.sail.webapp.junit.AbstractTransactionalDbTests;
import org.telscenter.sail.webapp.service.authentication.UserDetailsService;

/**
 * Tests services available to TELS Portal User
 * 
 * @author Hiroki Terashima
 * 
 * @version $Id$
 * 
 */
public class UserServiceImplTest extends AbstractTransactionalDbTests {

	private static final String EMAIL = "billy@bob.com";

	private static final String PASSWORD = "password";

	private static final String FIRSTNAME = "Billy";

	private static final String LASTNAME = "Bob";
	
	private static final String USERNAME = "BillyB619";

	private static final Date SIGNUPDATE = Calendar.getInstance().getTime();

	private static final Gender GENDER = Gender.FEMALE;

	private static final Date BIRTHDAY = Calendar.getInstance().getTime();

	private GrantedAuthorityDao<MutableGrantedAuthority> authorityDao;

	private UserDao<User> userDao;

	private UserDetailsService userDetailsService;

	private UserService userService;

	private StudentUserDetails userDetailsCreate;

	private MutableGrantedAuthority expectedAuthorityCreate;
	
	private MutableGrantedAuthority studentAuthority;

	private Integer DEFAULT_NUMBEROFLOGINS = new Integer(9);
	
	private static final String DEFAULT_ACCOUNT_QUESTION = "what is the name of your middle name?";
	
	private static final String DEFAULT_ACCOUNT_ANSWER = "John";

	public void testDuplicateUserErrors() throws Exception {
		StudentUserDetails userDetails = (StudentUserDetails) this.applicationContext
				.getBean("studentUserDetails");
		userDetails.setPassword(PASSWORD);
		userDetails.setEmailAddress(EMAIL);
		userDetails.setFirstname(FIRSTNAME);
		userDetails.setLastname(LASTNAME);
		userDetails.setSignupdate(SIGNUPDATE);
		userDetails.setGender(GENDER);
		userDetails.setBirthday(BIRTHDAY);
		userDetails.setNumberOfLogins(DEFAULT_NUMBEROFLOGINS);
		userDetails.setAccountQuestion(DEFAULT_ACCOUNT_QUESTION);
		userDetails.setAccountAnswer(DEFAULT_ACCOUNT_ANSWER);

		// create 2 users and attempt to save to DB
		// second user should create a new user with similar username but with
		// an added "a"
		this.userService.createUser(userDetails);

		StudentUserDetails userDetails2 = (StudentUserDetails) this.applicationContext
				.getBean("studentUserDetails");
		userDetails2.setPassword(PASSWORD);
		userDetails2.setEmailAddress(EMAIL);
		userDetails2.setFirstname(FIRSTNAME);
		userDetails2.setLastname(LASTNAME);
		userDetails2.setSignupdate(SIGNUPDATE);
		userDetails2.setGender(GENDER);
		userDetails2.setBirthday(BIRTHDAY);
		userDetails2.setNumberOfLogins(DEFAULT_NUMBEROFLOGINS);
		userDetails2.setAccountQuestion(DEFAULT_ACCOUNT_QUESTION);
		userDetails2.setAccountAnswer(DEFAULT_ACCOUNT_ANSWER);
		
		this.userService.createUser(userDetails2);

		assertEquals(userDetails.getUsername()
				+ userDetails.getUsernameSuffixes()[1], userDetails2
				.getUsername());
	}

	
	/*
	 * This test checks creation of a user within the portal, but ignores the
	 * creation of a user on the remote SDS. Tests for system integration are
	 * beyond the scope of this testing mechanism. We are assuming the SdsUserId
	 * cannot be null, enforced by the data store constraint.
	 */
	public void testCreateUserWithFirstNameLastName() throws Exception {
			setupCreateTest();
			
			// create user (saves automatically)
			User expectedUser = this.userService.createUser(userDetailsCreate);
			MutableUserDetails expectedUserDetails = (MutableUserDetails) expectedUser.getUserDetails();
			
			// retrieve user and compare
			MutableUserDetails actual =  (MutableUserDetails) this.userDetailsService
					.loadUserByUsername(userDetailsCreate.getUsername());
			
			assertEquals(expectedUserDetails.getFirstname(), actual
					.getFirstname());
			
			assertEquals(expectedUserDetails.getLastname(), actual
					.getLastname());
			
	}
	
	/*
	 * This test checks creation of a user within the portal, but ignores the
	 * creation of a user on the remote SDS. Tests for system integration are
	 * beyond the scope of this testing mechanism. We are assuming the SdsUserId
	 * cannot be null, enforced by the data store constraint.
	 * 
	 * Verifies that the leading and trailing whitespaces on firstname and lastname
	 * get trimmed correctly
	 */
	public void testCreateUserWithFirstNameLastNameSpaces() throws Exception {
			setupCreateTest();
			
			// create user (saves automatically)
			userDetailsCreate.setFirstname(" " + FIRSTNAME + " ");
			userDetailsCreate.setLastname(" " + LASTNAME + " ");
			User expectedUser = this.userService.createUser(userDetailsCreate);
			MutableUserDetails expectedUserDetails = (MutableUserDetails) expectedUser.getUserDetails();
			
			// retrieve user and compare
			MutableUserDetails actual =  (MutableUserDetails) this.userDetailsService
					.loadUserByUsername(userDetailsCreate.getUsername());
			
			assertEquals(expectedUserDetails.getFirstname(), actual
					.getFirstname());
			
			assertEquals(expectedUserDetails.getLastname(), actual
					.getLastname());
			
	}
	
	/*
	 * This test checks creation of a user within the portal, but ignores the
	 * creation of a user on the remote SDS. Tests for system integration are
	 * beyond the scope of this testing mechanism. We are assuming the SdsUserId
	 * cannot be null, enforced by the data store constraint.
	 */
	public void testCreateUserWithEmail() throws Exception {
		setupCreateTest();
		userDetailsCreate.setEmailAddress(EMAIL);

		// create user (saves automatically)
		User expectedUser = this.userService.createUser(userDetailsCreate);
		UserDetails expectedUserDetails = expectedUser.getUserDetails();

		// retrieve user and compare
		UserDetails actual = this.userDetailsService
				.loadUserByUsername(userDetailsCreate.getUsername());
		assertEquals(expectedUserDetails, actual);

		checkPasswordEncoding(actual);
		checkRole(actual);

		// added this end transaction to catch a transaction commit within a
		// transaction rollback problem
		this.userDao.delete(expectedUser);
		this.authorityDao.delete(expectedAuthorityCreate);
		this.authorityDao.delete(studentAuthority);
		this.setComplete();
		this.endTransaction();
	}

	/*
	 * This test checks creation of a user within the portal, but ignores the
	 * creation of a user on the remote SDS. Tests for system integration are
	 * beyond the scope of this testing mechanism. We are assuming the SdsUserId
	 * cannot be null, enforced by the data store constraint. Email is null
	 */
	public void testCreateUserBlankEmail() throws Exception {
		setupCreateTest();

		User expectedUser = this.userService.createUser(userDetailsCreate);

		MutableUserDetails expectedUserDetails = (MutableUserDetails) expectedUser
				.getUserDetails();
		UserDetails actual = this.userDetailsService
				.loadUserByUsername(userDetailsCreate.getUsername());
		assertEquals(expectedUserDetails, actual);

		checkPasswordEncoding(actual);
		checkRole(actual);

		// added this end transaction to catch a transaction commit within a
		// transaction rollback problem
		this.userDao.delete(expectedUser);
		this.authorityDao.delete(expectedAuthorityCreate);
		this.authorityDao.delete(studentAuthority);
		this.setComplete();
		this.endTransaction();
	}
	
	@SuppressWarnings("unchecked")
	public void testRetrieveUserByUsername() {
		// this test simply confirms that the userDao is called appropriately,
		// since the DAO is being tested and does all the work
		UserDao<User> mockUserDao = EasyMock.createMock(UserDao.class);
		User expectedUser = new UserImpl();
		EasyMock.expect(mockUserDao.retrieveByUsername(USERNAME)).andReturn(
				new UserImpl());
		EasyMock.replay(mockUserDao);

		UserServiceImpl userService = new UserServiceImpl();
		userService.setUserDao(mockUserDao);
		User returnedUser = userService.retrieveUserByUsername(USERNAME);
		assertNotNull(returnedUser);
		assertEquals(returnedUser, expectedUser);
		EasyMock.verify(mockUserDao);
		
		// Now check when USERNAME does not exist in data store
		EasyMock.reset(mockUserDao);
		EasyMock.expect(mockUserDao.retrieveByUsername(USERNAME)).andThrow(
				new EmptyResultDataAccessException(1));
		EasyMock.replay(mockUserDao);

		userService.setUserDao(mockUserDao);
		returnedUser = userService.retrieveUserByUsername(USERNAME);
		assertNull(returnedUser);
		EasyMock.verify(mockUserDao);
	}

	/**
	 * @param authorityDao
	 *            the authorityDao to set
	 */
	public void setAuthorityDao(
			GrantedAuthorityDao<MutableGrantedAuthority> authorityDao) {
		this.authorityDao = authorityDao;
	}

	/**
	 * @param userDetailsService
	 *            the userDetailsService to set
	 */
	public void setUserDetailsService(UserDetailsService userDetailsService) {
		this.userDetailsService = userDetailsService;
	}

	/**
	 * @param userService
	 *            the userService to set
	 */
	public void setUserService(UserService userService) {
		this.userService = userService;
	}

	/**
	 * @param userDao
	 *            the userDao to set
	 */
	public void setUserDao(UserDao<User> userDao) {
		this.userDao = userDao;
	}

	private void setupCreateTest() {
		expectedAuthorityCreate = (MutableGrantedAuthority) this.applicationContext
				.getBean("mutableGrantedAuthority");
		expectedAuthorityCreate.setAuthority(UserDetailsService.USER_ROLE);
		this.authorityDao.save(expectedAuthorityCreate);
		studentAuthority = (MutableGrantedAuthority) this.applicationContext
		         .getBean("mutableGrantedAuthority");
		studentAuthority.setAuthority(UserDetailsService.STUDENT_ROLE);
		this.authorityDao.save(studentAuthority);

		
		userDetailsCreate = (StudentUserDetails) this.applicationContext
				.getBean("studentUserDetails");
		userDetailsCreate.setPassword(PASSWORD);
		userDetailsCreate.setFirstname(FIRSTNAME);
		userDetailsCreate.setLastname(LASTNAME);
		userDetailsCreate.setSignupdate(SIGNUPDATE);
		userDetailsCreate.setGender(GENDER);
		userDetailsCreate.setBirthday(BIRTHDAY);
		userDetailsCreate.setNumberOfLogins(DEFAULT_NUMBEROFLOGINS);
		userDetailsCreate.setAccountQuestion(DEFAULT_ACCOUNT_QUESTION);
		userDetailsCreate.setAccountAnswer(DEFAULT_ACCOUNT_ANSWER);

	}

	private void checkRole(UserDetails actual) {
		// check role
		Collection<? extends GrantedAuthority> authorities = actual.getAuthorities();
		if (authorities == null)
			fail("authorities is null");
		boolean foundUserRole = false;
		for (GrantedAuthority authority : authorities) {
			if (authority.getAuthority() == UserDetailsService.USER_ROLE) {
				foundUserRole = true;
				break;
			}
		}
		assertTrue(foundUserRole);
	}

	private void checkPasswordEncoding(UserDetails actual) {
		// check password encoding
		assertFalse(PASSWORD.equals(actual.getPassword()));
		PasswordEncoder passwordEncoder = (PasswordEncoder) this.applicationContext
				.getBean("passwordEncoder");
		SaltSource saltSource = (SaltSource) this.applicationContext
				.getBean("systemSaltSource");
		String encodedPassword = passwordEncoder.encodePassword(PASSWORD,
				saltSource.getSalt(userDetailsCreate));
		assertEquals(encodedPassword, actual.getPassword());
	}

}
