/**
 * Copyright (c) 2007 Encore Research Group, University of Toronto
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
package net.sf.sail.webapp.service;

import java.util.List;

import org.springframework.security.core.userdetails.UserDetails;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.dao.sds.HttpStatusCodeException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.authentication.MutableUserDetails;
import net.sf.sail.webapp.domain.sds.SdsUser;
import net.sf.sail.webapp.service.authentication.DuplicateUsernameException;

/**
 * Represents the set of operations on a user.
 * 
 * @author Cynick Young
 * @author Laurel Williams
 * 
 * @version $Id$
 */
public interface UserService {

	/**
	 * Given a MutableUserDetails object with a unique name, creates a remote
	 * SDS user and also inserts the object into the local db. If username is
	 * not unique throws a DuplicateUsernameException.
	 * 
	 * @param userDetails
	 *            A user object.
	 * @return A reference to a <code>User</code> object
	 * @throws DuplicateUsernameException
	 *             If username is not unique.
	 * @throws HttpStatusCodeException
	 *             If any unexpected status code is returned from the SDS while
	 *             creating the user.
	 */
	public User createUser(MutableUserDetails userDetails)
			throws DuplicateUsernameException, HttpStatusCodeException;
	
	/**
	 * Retrieve user with the given user details.
	 * 
	 * @param userDetails
	 *            that has valid authentication credentials
	 * @return <code>User</code> associated with the given user details
	 */
	public User retrieveUser(UserDetails userDetails);

	/**
	 * Retrieve user with the give username
	 * 
	 * @param username
	 * @return <code>User</code> associated with the given username
	 */
	public User retrieveUserByUsername(String username);

	/**
	 * Retrieve users with a similar username as the one provided
	 * Does a LIKE comparison
	 * 
	 * @param username
	 * @return <code>User</code> associated with the given username
	 */
	public List<User> retrieveUsersByUsername(String username);

	/**
	 * Retrieve users with the given emailAddress
	 * 
	 * @param emailAddress
	 * @return <code>Users</code> associated with the given emailaddress
	 */
	public List<User> retrieveUserByEmailAddress(String emailAddress);

	/**
	 * Retrieve a list of users whose accounts have been disabled
	 * 
	 * @param emailAddress
	 * @return <code>Users</code> whose accounts have been disabled
	 */
	public List<User> retrieveDisabledUsers();
	
	/**
	 * Encodes a new password and updates a user in the persistent data store.
	 * 
	 * @param user
	 *            The user that you want to update
	 * @param newPassword
	 *            The UN-ENCODED new password that you want to put in place for
	 *            this user
	 * @return The user with the newly encoded password.
	 */
	public User updateUserPassword(final User user, String newPassword);

	/**
	 * Gets all users from persistent data store.
	 * 
	 * Note: this is server-intensive. Consider using
	 * retrieveAllUsernames() instead
	 * 
	 * @return a Set of all users.
	 */
	public List<User> retrieveAllUsers();
	
	/**
	 * Returns all usernames from persistent data store.
	 * 
	 * @return
	 */
	public List<String> retrieveAllUsernames();
	
	/**
	 * Retrieves User domain object using unique userId
	 * 
	 * @param userId
	 *      <code>Long</code> userId to use for lookup
	 * @return <code>User</code>
	 *      the User object with the given userId
	 * @throws ObjectNotFoundException when userId
	 *      cannot be used to find the existing user
	 */
	public User retrieveById(Long userId) throws ObjectNotFoundException;
	
	/**
	 * Instantiates a SdsUser object and populates its firstname
	 * and lastname using the provided <code>MutableUserDetails</code>
	 * and returns it
	 * 
	 * @param userDetails used to retrieve firstnamd and lastname
	 * @return new <code>SdsUser</code> object with firstname and lastname set
	 */
	public SdsUser createSdsUser(final MutableUserDetails userDetails);

	/**
	 * Updates the existing <code>MutableUserDetails</code> object
	 * @param userDetails
	 */
	public void updateUser(User user);
	
	/**
	 * Creates and adds a <code>SdsUser</code> to existing <code>User</code>
	 * 
	 * @param <code>User</code> user
	 */
	public User addSdsUserToUser(Long id);
	
	/**
	 * Retrieves Users by a given field (eg username, gender), search type (eg =, like)
	 * search term (user provided) and classVar (eg teacher or studentUserDetails)
	 */
	public List<User> retrieveByField(String field, String type, Object term, String classVar);
	
    /**
     * Given an array of fields and an array of values and classVar, retrieves a list
     * of Users
     * @param fields an array of field names
     * @param values an array of values, the index of a value must line up with
     * the index in the field array
     * 
     * e.g.
     * fields[0] = "firstname"
     * fields[1] = "lastname"
     * 
     * values[0] = "Spongebob"
     * values[1] = "Squarepants"
     * 
     * @param classVar 'studentUserDetails' or 'teacherUserDetails'
     * @return a list of Users that have matching values for the given fields
     */
	public List<User> retrieveByFields(String[] fields, String[] values, String classVar);
	
	/**
	 * Get the User object given the reset password key
	 * @param resetPasswordKey an alphanumeric string
	 * @return a User object or null if there is no user with the given reset password key
	 */
	public User retrieveByResetPasswordKey(String resetPasswordKey);
}