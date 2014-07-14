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
package org.wise.portal.service.user.impl;

import java.util.Calendar;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.security.authentication.dao.SaltSource;
import org.springframework.security.authentication.encoding.PasswordEncoder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.authentication.GrantedAuthorityDao;
import org.wise.portal.dao.authentication.UserDetailsDao;
import org.wise.portal.dao.user.UserDao;
import org.wise.portal.domain.authentication.MutableGrantedAuthority;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.service.authentication.DuplicateUsernameException;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.user.UserService;

/**
 * Implementation class that uses daos to interact with the data store.
 * 
 * @author Laurel Williams
 * 
 * @version $Id$
 */
@Service
public class UserServiceImpl implements UserService {

	@Autowired
	private UserDetailsDao<MutableUserDetails> userDetailsDao;

	@Autowired
	private GrantedAuthorityDao<MutableGrantedAuthority> grantedAuthorityDao;

	@Autowired
	private UserDao<User> userDao;

	@Autowired
	protected PasswordEncoder passwordEncoder;

	@Autowired
	private SaltSource saltSource;

	/**
	 * @see net.sf.sail.webapp.service.UserService#retrieveUser(org.acegisecurity.userdetails.UserDetails)
	 */
	@Transactional(readOnly = true)
	public User retrieveUser(UserDetails userDetails) {
		return this.userDao.retrieveByUserDetails(userDetails);
	}

	/**
	 * @see net.sf.sail.webapp.service.UserService#retrieveUserByUsername(java.lang.String)
	 */
	@Transactional(readOnly = true)
	public List<User> retrieveUsersByUsername(String username) {
		return retrieveByField("username", "like", username, "UserDetails");
	}
	

	@Override
	public List<User> retrieveDisabledUsers() {
		return this.userDao.retrieveDisabledUsers();
	}


	/**
	 * @see net.sf.sail.webapp.service.UserService#retrieveUserByEmailAddress(java.lang.String)
	 */
	@Transactional(readOnly = true)
	public List<User> retrieveUserByEmailAddress(String emailAddress) {
		return this.userDao.retrieveByEmailAddress(emailAddress);
	}

	/**
	 * @throws DuplicateUsernameException 
	 * @see net.sf.sail.webapp.service.UserService#createUser(net.sf.sail.webapp.domain.authentication.MutableUserDetails)
	 */
	@Override
	@Transactional(rollbackFor = { DuplicateUsernameException.class})
	public User createUser(final MutableUserDetails userDetails) throws DuplicateUsernameException {

		org.wise.portal.domain.authentication.MutableUserDetails details = 
			(org.wise.portal.domain.authentication.MutableUserDetails) userDetails;

		// assign roles
		if (userDetails instanceof StudentUserDetails) {
			this.assignRole(userDetails, UserDetailsService.STUDENT_ROLE);
		} else if (userDetails instanceof TeacherUserDetails) {
			this.assignRole(userDetails, UserDetailsService.TEACHER_ROLE);
			this.assignRole(userDetails, UserDetailsService.AUTHOR_ROLE);
		} 

		// trim firstname and lastname so it doesn't contain leading or trailing spaces
		details.setFirstname(details.getFirstname().trim());
		details.setLastname(details.getLastname().trim());
		String coreUsername = details.getCoreUsername();

		details.setNumberOfLogins(0);
		
		//set the sign up date
		details.setSignupdate(Calendar.getInstance().getTime());
		
		//the username suffix
		String currentUsernameSuffix = null;
		User createdUser = null;
		boolean done = false;
		
		//loop until we have successfully found a unique username
		while(!done) {
			try {
				//get the next username suffix
				currentUsernameSuffix = details.getNextUsernameSuffix(currentUsernameSuffix);
				
				//try to create a user with the given username
				details.setUsername(coreUsername + currentUsernameSuffix);
				//createdUser = super.createUser(details);
				this.checkUserErrors(userDetails.getUsername());
				this.assignRole(userDetails, UserDetailsService.USER_ROLE);
				this.encodePassword(userDetails);

				createdUser = new UserImpl();
				createdUser.setUserDetails(userDetails);
				this.userDao.save(createdUser);
				
				//we were able to successfully create a user with the username 
				done = true;
			} catch (DuplicateUsernameException e) {
				//the username is already used so we will try the next possible username
				continue;
			} 
		}
		
		return createdUser;
	}

	void encodePassword(MutableUserDetails userDetails) {
		userDetails.setPassword(this.passwordEncoder.encodePassword(userDetails
				.getPassword(), this.saltSource.getSalt(userDetails)));
	}

	protected void assignRole(MutableUserDetails userDetails, final String role) {
		GrantedAuthority authority = this.grantedAuthorityDao
				.retrieveByName(role);
		userDetails.addAuthority(authority);
	}

	/**
	 * Validates user input checks that the data store does not already contain
	 * a user with the same username
	 * 
	 * @param username
	 *            The username to check for in the data store
	 * @throws DuplicateUsernameException
	 *             if the username is the same as a username already in data
	 *             store.
	 */
	private void checkUserErrors(final String username)
			throws DuplicateUsernameException {
		if (this.userDetailsDao.hasUsername(username)) {
			throw new DuplicateUsernameException(username);
		}
	}

	/**
	 * @see net.sf.sail.webapp.service.UserService#updateUserPassword(net.sf.sail.webapp.domain.User, java.lang.String)
	 */
	@Transactional()
	public User updateUserPassword(User user, String newPassword) {
		MutableUserDetails userDetails = user.getUserDetails();
		userDetails.setPassword(newPassword);
		this.encodePassword(userDetails);
		this.userDao.save(user);

		return user;
	}

	public List<User> retrieveAllUsers() {
		return this.userDao.getList();
	}


	/**
	 * @see net.sf.sail.webapp.service.UserService#retrieveAllUsernames()
	 */
	public List<String> retrieveAllUsernames() {
		return this.userDao.retrieveAll("userDetails.username");
	}
	/**
	 * @see net.sf.sail.webapp.service.UserService#retrieveById(java.lang.Long)
	 */
	@Transactional(readOnly = true)
	public User retrieveById(Long userId) throws ObjectNotFoundException {
		return this.userDao.getById(userId);
	}

	@Transactional
	public void updateUser(User user) {
		this.userDao.save(user);
	}
	
	/**
	 * @see net.sf.sail.webapp.service.UserService#retrieveByField(java.lang.String, java.lang.String, java.lang.String, java.lang.String)
	 */
	@Transactional()
	public List<User> retrieveByField(String field, String type, Object term, String classVar){
		return this.userDao.retrieveByField(field, type, term, classVar);
	}
	
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
	public List<User> retrieveByFields(String[] fields, String[] types, String classVar){
		return this.userDao.retrieveByFields(fields, types, classVar);
	}
	
	/**
	 * @see net.sf.sail.webapp.service.UserService#retrieveUserByUsername(java.lang.String)
	 */
	@Override
	public User retrieveUserByUsername(String username) {
		if (username == null || username.isEmpty()) {
			return null;
		}
		User user = null;
		try {
			user =  this.userDao.retrieveByUsername(username);
		} catch (EmptyResultDataAccessException e) {
			return null;
		}
		return user;
	}	
	
	/**
	 * Get the User object given the reset password key
	 * @param resetPasswordKey an alphanumeric string
	 * @return a User object or null if there is no user with the given reset password key
	 */
	@Transactional()
	public User retrieveByResetPasswordKey(String resetPasswordKey) {
		return this.userDao.retrieveByResetPasswordKey(resetPasswordKey);
	}

}