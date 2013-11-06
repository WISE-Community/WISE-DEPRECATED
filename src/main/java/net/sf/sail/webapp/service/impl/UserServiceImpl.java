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
package net.sf.sail.webapp.service.impl;

import java.util.List;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.dao.authentication.GrantedAuthorityDao;
import net.sf.sail.webapp.dao.authentication.UserDetailsDao;
import net.sf.sail.webapp.dao.sds.HttpStatusCodeException;
import net.sf.sail.webapp.dao.sds.SdsUserDao;
import net.sf.sail.webapp.dao.user.UserDao;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.authentication.MutableGrantedAuthority;
import net.sf.sail.webapp.domain.authentication.MutableUserDetails;
import net.sf.sail.webapp.domain.impl.UserImpl;
import net.sf.sail.webapp.domain.sds.SdsUser;
import net.sf.sail.webapp.service.UserService;
import net.sf.sail.webapp.service.authentication.DuplicateUsernameException;
import net.sf.sail.webapp.service.authentication.UserDetailsService;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.authentication.dao.SaltSource;
import org.springframework.security.authentication.encoding.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation class that uses daos to interact with the data store.
 * 
 * @author Laurel Williams
 * 
 * @version $Id$
 */
public class UserServiceImpl implements UserService {

	private UserDetailsDao<MutableUserDetails> userDetailsDao;

	private GrantedAuthorityDao<MutableGrantedAuthority> grantedAuthorityDao;

	protected SdsUserDao sdsUserDao;

	private UserDao<User> userDao;

	protected PasswordEncoder passwordEncoder;

	private SaltSource saltSource;

	/**
	 * @param sdsUserDao
	 *            the sdsUserDao to set
	 */
	@Required
	public void setSdsUserDao(SdsUserDao sdsUserDao) {
		this.sdsUserDao = sdsUserDao;
	}

	/**
	 * @param userDao
	 *            the userDao to set
	 */
	@Required
	public void setUserDao(final UserDao<User> userDao) {
		this.userDao = userDao;
	}

	/**
	 * @param grantedAuthorityDao
	 *            the grantedAuthorityDao to set
	 */
	@Required
	public void setGrantedAuthorityDao(
			final GrantedAuthorityDao<MutableGrantedAuthority> grantedAuthorityDao) {
		this.grantedAuthorityDao = grantedAuthorityDao;
	}

	/**
	 * @param userDetailsDao
	 *            the userDetailsDao to set
	 */
	@Required
	public void setUserDetailsDao(
			final UserDetailsDao<MutableUserDetails> userDetailsDao) {
		this.userDetailsDao = userDetailsDao;
	}

	/**
	 * @param passwordEncoder
	 *            the passwordEncoder to set
	 */
	@Required
	public void setPasswordEncoder(PasswordEncoder passwordEncoder) {
		this.passwordEncoder = passwordEncoder;
	}

	/**
	 * @param saltSource
	 *            the saltSource to set
	 */
	@Required
	public void setSaltSource(SaltSource saltSource) {
		this.saltSource = saltSource;
	}

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
	public User retrieveUserByUsername(String username) {
		return this.userDao.retrieveByUsername(username);
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
	 * @see net.sf.sail.webapp.service.UserService#createUser(net.sf.sail.webapp.domain.authentication.MutableUserDetails)
	 */
	@Transactional(rollbackFor = { DuplicateUsernameException.class, HttpStatusCodeException.class })
	public User createUser(final MutableUserDetails userDetails)
			throws DuplicateUsernameException, HttpStatusCodeException {

		this.checkUserErrors(userDetails.getUsername());
		this.assignRole(userDetails, UserDetailsService.USER_ROLE);
		this.encodePassword(userDetails);

		User user = new UserImpl();
		//user.setSdsUser(null);
		user.setUserDetails(userDetails);
		this.userDao.save(user);

		return user;
	}

	/**
	 * @see net.sf.sail.webapp.service.UserService#createSdsUser(net.sf.sail.webapp.domain.authentication.MutableUserDetails)
	 */
	public SdsUser createSdsUser(final MutableUserDetails userDetails) {
		SdsUser sdsUser = new SdsUser();
		sdsUser.setFirstName(userDetails.getUsername());
		sdsUser.setLastName(userDetails.getUsername());
		return sdsUser;
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

	@Transactional()
	public void updateUser(User user) {
		this.userDao.save(user);
	}
	
	/**
	 * @see net.sf.sail.webapp.service.UserService#addSdsUserToUser(net.sf.sail.webapp.domain.User)
	 */
	@Transactional()
	public User addSdsUserToUser(Long id){
		User user = null;
		try{
			user = this.userDao.getById(id);
		}catch(Exception e){
			e.printStackTrace();
		}
		SdsUser sdsUser = this.createSdsUser(user.getUserDetails());
		this.sdsUserDao.save(sdsUser);
		
		user.setSdsUser(sdsUser);
		this.userDao.save(user);
		return user;
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
	@Transactional()
	public List<User> retrieveByFields(String[] fields, String[] types, String classVar){
		return this.userDao.retrieveByFields(fields, types, classVar);
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