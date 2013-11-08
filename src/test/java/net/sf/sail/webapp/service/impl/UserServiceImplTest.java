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
package net.sf.sail.webapp.service.impl;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import net.sf.sail.webapp.dao.authentication.GrantedAuthorityDao;
import net.sf.sail.webapp.dao.user.UserDao;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.authentication.MutableGrantedAuthority;
import net.sf.sail.webapp.domain.authentication.MutableUserDetails;
import net.sf.sail.webapp.domain.impl.UserImpl;
import net.sf.sail.webapp.domain.sds.SdsUser;
import net.sf.sail.webapp.junit.AbstractTransactionalDbTests;
import net.sf.sail.webapp.service.UserService;
import net.sf.sail.webapp.service.authentication.DuplicateUsernameException;
import net.sf.sail.webapp.service.authentication.UserDetailsService;

import org.easymock.EasyMock;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.authentication.dao.SaltSource;
import org.springframework.security.authentication.encoding.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public class UserServiceImplTest extends AbstractTransactionalDbTests {

	private static final String USERNAME = "another name";

	private static final String EMAIL = "billy@bob.com";

	private static final String PASSWORD = "password";

	private GrantedAuthorityDao<MutableGrantedAuthority> authorityDao;

	private UserService userService;

	MutableGrantedAuthority authority1;

	MutableGrantedAuthority authority2;

	MutableUserDetails userDetails;

	/**
	 * @param authorityDao
	 *            the authorityDao to set
	 */
	public void setAuthorityDao(
			GrantedAuthorityDao<MutableGrantedAuthority> authorityDao) {
		this.authorityDao = authorityDao;
	}

	/**
	 * @param userService
	 *            the userService to set
	 */
	public void setUserService(UserService userService) {
		this.userService = userService;
	}

	/**
	 * @see org.springframework.test.AbstractTransactionalSpringContextTests#onSetUp()
	 */
	@Override
	protected void onSetUp() throws Exception {
		super.onSetUp();
		userDetails = (MutableUserDetails) this.applicationContext
				.getBean("mutableUserDetails");
		userDetails.setUsername(USERNAME);
		userDetails.setPassword(PASSWORD);
		// authority are set in createUser
		// email address is optional
	}

	/**
	 * @see org.springframework.test.AbstractTransactionalSpringContextTests#onSetUpInTransaction()
	 */
	@Override
	protected void onSetUpInTransaction() throws Exception {
		super.onSetUpInTransaction();
		authority1 = (MutableGrantedAuthority) this.applicationContext
				.getBean("mutableGrantedAuthority");
		authority1.setAuthority(UserDetailsService.USER_ROLE);
		this.authorityDao.save(authority1);

		authority2 = (MutableGrantedAuthority) this.applicationContext
				.getBean("mutableGrantedAuthority");
		authority2.setAuthority(UserDetailsService.ADMIN_ROLE);
		this.authorityDao.save(authority2);
	}

	/**
	 * @see org.springframework.test.AbstractTransactionalSpringContextTests#onTearDown()
	 */
	@Override
	protected void onTearDown() throws Exception {
		super.onTearDown();
		authority1 = null;
		authority2 = null;
		userDetails = null;
	}

	@SuppressWarnings("unchecked")
	public void testRetrieveUser() {
		// this test simply confirms that the userDao is called appropriately,
		// since the DAO is being tested and does all the work
		MutableUserDetails userDetails = (MutableUserDetails) this.applicationContext
				.getBean("mutableUserDetails");
		UserDao<User> mockUserDao = EasyMock.createMock(UserDao.class);
		EasyMock.expect(mockUserDao.retrieveByUserDetails(userDetails))
				.andReturn(new UserImpl());
		EasyMock.replay(mockUserDao);

		UserServiceImpl userServiceImpl = new UserServiceImpl();
		userServiceImpl.setUserDao(mockUserDao);
		userServiceImpl.retrieveUser(userDetails);
		EasyMock.verify(mockUserDao);
	}

	@SuppressWarnings("unchecked")
	public void testRetrieveUserByUsername() {
		// this test simply confirms that the userDao is called appropriately,
		// since the DAO is being tested and does all the work
		UserDao<User> mockUserDao = EasyMock.createMock(UserDao.class);
		EasyMock.expect(mockUserDao.retrieveByUsername(USERNAME)).andReturn(
				new UserImpl());
		EasyMock.replay(mockUserDao);

		UserServiceImpl userService = new UserServiceImpl();
		userService.setUserDao(mockUserDao);
		userService.retrieveUserByUsername(USERNAME);
		EasyMock.verify(mockUserDao);
	}

	@SuppressWarnings("unchecked")
	public void testRetrieveUserByEmail() {
		// this test simply confirms that the userDao is called appropriately,
		// since the DAO is being tested and does all the work
		List<User> userList = new ArrayList<User>();
		User user = new UserImpl();
		userList.add(user);
		UserDao<User> mockUserDao = EasyMock.createMock(UserDao.class);
		EasyMock.expect(mockUserDao.retrieveByEmailAddress(EMAIL)).andReturn(
				userList);
		EasyMock.replay(mockUserDao);

		UserServiceImpl userService = new UserServiceImpl();
		userService.setUserDao(mockUserDao);
		userService.retrieveUserByEmailAddress(EMAIL);
		EasyMock.verify(mockUserDao);
	}

	public void testDuplicateUserErrors() throws Exception {
		MutableUserDetails user = (MutableUserDetails) this.applicationContext
				.getBean("mutableUserDetails");
		user.setUsername(USERNAME);
		user.setPassword(PASSWORD);
		user.setEmailAddress(EMAIL);

		// create 2 users and attempt to save to DB
		// second user should cause exception to be thrown
		this.userService.createUser(user);
		try {
			this.userService.createUser(user);
			fail("DuplicateUsernameException expected and not caught.");
		} catch (DuplicateUsernameException e) {
		}
	}

	/*
	 * This test checks creation of a user within the portal, but ignores the
	 * creation of a user on the remote SDS. Tests for system integration are
	 * beyond the scope of this testing mechanism. We are assuming the SdsUserId
	 * cannot be null, enforced by the data store constraint.
	 */
	public void testCreateUserWithNoEmail() throws Exception {
		User expectedUser = this.userService.createUser(userDetails);
		UserDetails expectedUserDetails = expectedUser.getUserDetails();

		User actualUser = this.userService.retrieveUserByUsername(USERNAME);
		UserDetails actualUserDetails = actualUser.getUserDetails();
		assertEquals(expectedUserDetails, actualUserDetails);

		this.checkPasswordEncoding(actualUserDetails, PASSWORD);
		this.checkRole(actualUserDetails);
	}

	/*
	 * This test checks creation of a user within the portal, but ignores the
	 * creation of a user on the remote SDS. Tests for system integration are
	 * beyond the scope of this testing mechanism. We are assuming the SdsUserId
	 * cannot be null, enforced by the data store constraint.
	 */
	public void testCreateUserWithEmail() throws Exception {
		userDetails.setEmailAddress(EMAIL);

		User expectedUser = this.userService.createUser(userDetails);
		UserDetails expectedUserDetails = expectedUser.getUserDetails();

		User actualUser = this.userService.retrieveUserByUsername(USERNAME);
		UserDetails actualUserDetails = actualUser.getUserDetails();
		assertEquals(expectedUserDetails, actualUserDetails);

		this.checkPasswordEncoding(actualUserDetails, PASSWORD);
		this.checkRole(actualUserDetails);
	}

	private void checkPasswordEncoding(UserDetails actual, String password) {
		// check password encoding
		assertFalse(password.equals(actual.getPassword()));
		PasswordEncoder passwordEncoder = (PasswordEncoder) this.applicationContext
				.getBean("passwordEncoder");
		SaltSource saltSource = (SaltSource) this.applicationContext
				.getBean("systemSaltSource");
		String encodedPassword = passwordEncoder.encodePassword(password,
				saltSource.getSalt(userDetails));
		assertEquals(encodedPassword, actual.getPassword());
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

	public void testUpdateUserPassword() throws Exception {
		User createdUser = this.userService.createUser(userDetails);

		MutableUserDetails expectedUserDetails = createdUser.getUserDetails();
		String NEWW = "NEW";

		this.userService.updateUserPassword(createdUser, NEWW);

		// retrieve updated user and compare
		User updatedUser = this.userService.retrieveUserByUsername(USERNAME);
		MutableUserDetails updatedUserDetails = updatedUser.getUserDetails();

		assertEquals(createdUser.getId(), updatedUser.getId());
		assertEquals(createdUser.getSdsUser(), updatedUser.getSdsUser());

		assertEquals(USERNAME, updatedUserDetails.getUsername());
		assertNull(updatedUserDetails.getEmailAddress());
		assertEquals(expectedUserDetails.getId(), updatedUserDetails.getId());
		Collection<? extends GrantedAuthority> grantedAuthority = updatedUserDetails
				.getAuthorities();
		assertEquals(UserDetailsService.USER_ROLE, grantedAuthority.iterator().next()
				.getAuthority());
		this.checkPasswordEncoding(updatedUserDetails, NEWW);
	}
	
	/* This test simply confirms that UserService.createSdsUser(MutableUserDetails)
	 * method returns a SdsUser object with its firstname and lastname attributes
	 * correctly set for PAS's requirements (firstname = lastname = username)
	 */
	public void testCreateSdsUser() {
		SdsUser createdSdsUser = this.userService.createSdsUser(userDetails);
		assertEquals(createdSdsUser.getFirstName(), userDetails.getUsername());
		assertEquals(createdSdsUser.getLastName(), userDetails.getUsername());
		assertNull(createdSdsUser.getSdsObjectId());
	}
	
	@SuppressWarnings("unchecked")
	public void testUpdateUser() {
		// this test simply confirms that the userDao is called appropriately,
		// since the DAO is being tested and does all the work
		UserDao<User> mockUserDao = EasyMock.createMock(UserDao.class);
		User expectedUser = new UserImpl();
		mockUserDao.save(expectedUser);
		EasyMock.expectLastCall();
		EasyMock.replay(mockUserDao);

		UserServiceImpl userService = new UserServiceImpl();
		userService.setUserDao(mockUserDao);
		userService.updateUser(new UserImpl());
		EasyMock.verify(mockUserDao);
	}
	
	@SuppressWarnings("unchecked")
	public void testRetrieveAllUsers() {
		List<User> users = new ArrayList<User>();
		UserDao<User> mockUserDao = EasyMock.createMock(UserDao.class);
		EasyMock.expect(mockUserDao.getList()).andReturn(users);
		EasyMock.replay(mockUserDao);

		UserServiceImpl userService = new UserServiceImpl();
		userService.setUserDao(mockUserDao);
		userService.retrieveAllUsers();
		EasyMock.verify(mockUserDao);
	}
	
	@SuppressWarnings("unchecked")
	public void testRetrieveByField(){
		List<User> users = new ArrayList<User>();
		UserDao<User> mockUserDao = EasyMock.createMock(UserDao.class);
		EasyMock.expect(mockUserDao.retrieveByField("firstname", "=", 
				"Sarah", "studentUserDetails")).andReturn(users);
		EasyMock.replay(mockUserDao);
		UserServiceImpl userService = new UserServiceImpl();
		userService.setUserDao(mockUserDao);
		userService.retrieveByField("firstname", "=", "Sarah", "studentUserDetails");
		EasyMock.verify(mockUserDao);
	}
}