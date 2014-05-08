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
package net.sf.sail.webapp.dao.user.impl;

import java.util.List;
import java.util.Map;

import net.sf.sail.webapp.dao.AbstractTransactionalDaoTests;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.wise.portal.dao.user.impl.HibernateUserDao;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.PersistentUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;

/**
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public class HibernateUserDaoTest extends AbstractTransactionalDaoTests<HibernateUserDao, User> {

	private static final String USERNAME = "user name";

	private static final String PASSWORD = "password";

	private static final String ALTERNATE_USERNAME = "myname";

	private static final String EMAILADDRESS = "bart.simpson@gmail.com";

	private MutableUserDetails userDetails;

	/**
	 * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onSetUpBeforeTransaction()
	 */
	@Override
	protected void onSetUpBeforeTransaction() throws Exception {
		super.onSetUpBeforeTransaction();
		
        this.dao = ((HibernateUserDao) this.applicationContext
                .getBean("userDao"));
        this.dataObject = ((UserImpl) this.applicationContext
                .getBean("user"));

		this.userDetails = (MutableUserDetails) this.applicationContext
				.getBean("mutableUserDetails");

		this.dataObject.setUserDetails(this.userDetails);
		this.userDetails.setUsername(USERNAME);
		this.userDetails.setPassword(PASSWORD);
		this.userDetails.setEmailAddress(EMAILADDRESS);
	}

	/**
	 * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onTearDownAfterTransaction()
	 */
	@Override
	protected void onTearDownAfterTransaction() throws Exception {
		super.onTearDownAfterTransaction();
		this.userDetails = null;
	}

	public void testRetrieveByUserDetails() {
		this.dao.save(this.dataObject);

		User actual = this.dao.retrieveByUserDetails(this.userDetails);
		assertNotNull(actual);
		assertEquals(this.dataObject, actual);
	}

	public void testRetrieveByUsername() {
		// no username in data store
		try {
			@SuppressWarnings("unused")
			User expectedProblem = this.dao
					.retrieveByUsername("Not in data store");
			fail("expected EmptyResultDataAccessException - no users with this username");
		} catch (EmptyResultDataAccessException e) {
		}

		// single user in data store should be retrieved correctly
		this.dao.save(this.dataObject);
		User actual = this.dao.retrieveByUsername(this.userDetails
				.getUsername());
		assertNotNull(actual);
		assertEquals(this.dataObject, actual);
		
		// it should also be retrieved if the username is typed in with difference cases
		actual = this.dao.retrieveByUsername(this.userDetails
				.getUsername().toUpperCase());
		assertNotNull(actual);
		assertEquals(this.dataObject, actual);
	}

	public void testRetrieveByEmailAddress() {
		// what happens when there are no users with a given email address?
		List<User> actual = this.dao.retrieveByEmailAddress(EMAILADDRESS);
		assertEquals(0, actual.size());
		
		// check that single user saved in data store can be retrieved via email
		// address
		this.dao.save(this.dataObject);
		actual = this.dao
				.retrieveByEmailAddress(this.userDetails.getEmailAddress());
		assertNotNull(actual.get(0));
		assertEquals(this.dataObject, actual.get(0));

		// what happens when another user is saved with the same email address
		MutableUserDetails anotherUserDetails = (MutableUserDetails) this.applicationContext
				.getBean("mutableUserDetails");
		User anotherUser = (User) this.applicationContext.getBean("user");

		anotherUser.setUserDetails(anotherUserDetails);
		anotherUserDetails.setUsername(ALTERNATE_USERNAME);
		anotherUserDetails.setPassword(PASSWORD);
		anotherUserDetails.setEmailAddress(EMAILADDRESS);

		this.dao.save(anotherUser);

		actual = this.dao
				.retrieveByEmailAddress(this.userDetails.getEmailAddress());
		assertNotNull(actual.get(0));
		assertNotNull(actual.get(1));
	}

	@SuppressWarnings("unchecked")
	public void testSave() {
		verifyDataStoreIsEmpty();

		// save the default user object using dao
		this.dao.save(this.dataObject);

		// verify data store contains saved data using direct jdbc retrieval
		// (not using dao)
		List actualList = retrieveUserListFromDb();
		assertEquals(1, actualList.size());

		Map<String, String> actualUserMap = (Map) actualList.get(0);
		assertEquals(USERNAME, actualUserMap
				.get(PersistentUserDetails.COLUMN_NAME_USERNAME.toUpperCase()));
		assertEquals(PASSWORD, actualUserMap
				.get(PersistentUserDetails.COLUMN_NAME_PASSWORD.toUpperCase()));

		User emptyUser = (User) this.applicationContext.getBean("user");
		try {
			this.dao.save(emptyUser);
			fail("expected DataIntegrityViolationException");
		} catch (DataIntegrityViolationException expected) {
		}

		User partiallyEmptyUser = (User) this.applicationContext
				.getBean("user");
		partiallyEmptyUser.setUserDetails(this.userDetails);
		try {
			this.dao.save(partiallyEmptyUser);
			fail("expected DataIntegrityViolationException");
		} catch (DataIntegrityViolationException expected) {
		}

		partiallyEmptyUser = (User) this.applicationContext.getBean("user");
		try {
			this.dao.save(partiallyEmptyUser);
			fail("expected DataIntegrityViolationException");
		} catch (DataIntegrityViolationException expected) {
		}
	}

	@SuppressWarnings("unchecked")
	private List retrieveUserListFromDb() {
		return this.jdbcTemplate.queryForList("select * from "
				+ UserImpl.DATA_STORE_NAME + ", "
				+ PersistentUserDetails.DATA_STORE_NAME + " where "
				+ UserImpl.DATA_STORE_NAME + "."
				+ UserImpl.COLUMN_NAME_USER_DETAILS_FK + " = "
				+ PersistentUserDetails.DATA_STORE_NAME + ".id", (Object[]) null);
	}


	@Override
	protected List<?> retrieveDataObjectListFromDb() {
	       return this.jdbcTemplate.queryForList("SELECT * FROM "
	                + UserImpl.DATA_STORE_NAME, (Object[]) null);
	}

}