/**
 * 
 */
package org.telscenter.sail.webapp.service.impl;

import net.sf.sail.webapp.dao.sds.HttpStatusCodeException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.authentication.MutableUserDetails;
import net.sf.sail.webapp.domain.sds.SdsUser;
import net.sf.sail.webapp.service.authentication.DuplicateUsernameException;
import net.sf.sail.webapp.service.authentication.UserNotFoundException;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.transaction.annotation.Transactional;
import org.telscenter.sail.webapp.domain.authentication.impl.StudentUserDetails;
import org.telscenter.sail.webapp.domain.authentication.impl.TeacherUserDetails;
import org.telscenter.sail.webapp.service.authentication.UserDetailsService;

/**
 * @author Hiroki Terashima
 * @version $Id$
 */
public class UserServiceImpl extends
net.sf.sail.webapp.service.impl.UserServiceImpl {


	/**
	 * @throws DuplicateUsernameException 
	 * @see net.sf.sail.webapp.service.UserService#createUser(net.sf.sail.webapp.domain.authentication.MutableUserDetails)
	 */
	@Override
	@Transactional(rollbackFor = { DuplicateUsernameException.class, HttpStatusCodeException.class})
	public User createUser(final MutableUserDetails userDetails) throws DuplicateUsernameException, HttpStatusCodeException {

		org.telscenter.sail.webapp.domain.authentication.MutableUserDetails details = 
			(org.telscenter.sail.webapp.domain.authentication.MutableUserDetails) userDetails;

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
				createdUser = super.createUser(details);
				
				//we were able to successfully create a user with the username 
				done = true;
			} catch (DuplicateUsernameException e) {
				//the username is already used so we will try the next possible username
				continue;
			} catch (HttpStatusCodeException e) {
				throw e;
			}
		}
		
		return createdUser;
	}

	/**
	 * @see net.sf.sail.webapp.service.impl.UserServiceImpl#createSdsUser(net.sf.sail.webapp.domain.authentication.MutableUserDetails)
	 */
	@Override
	public SdsUser createSdsUser(final MutableUserDetails userDetails) {
		org.telscenter.sail.webapp.domain.authentication.MutableUserDetails telsUserDetails 
		= (org.telscenter.sail.webapp.domain.authentication.MutableUserDetails) userDetails;
		SdsUser sdsUser = new SdsUser();
		sdsUser.setFirstName(telsUserDetails.getFirstname());
		sdsUser.setLastName(telsUserDetails.getLastname());
		return sdsUser;	
	}

	/**
	 * Comment me.
	 * 
	 * @param userDetails
	 * @throws UserNotFoundException
	 */
	public void checkUserUpdateErrors(MutableUserDetails userDetails) throws UserNotFoundException {
		//check if the use does exist
		User user = this.retrieveUser(userDetails);
		if(user == null) {
			throw new UserNotFoundException(userDetails.getUsername());
		}// if
	}

	/**
	 * @see net.sf.sail.webapp.service.UserService#retrieveUserByUsername(java.lang.String)
	 */
	@Override
	@Transactional(readOnly = true)
	public User retrieveUserByUsername(String username) {
		User user = null;
		try {
			user = super.retrieveUserByUsername(username);
		} catch (EmptyResultDataAccessException e) {
			return null;
		}
		return user;
	}	
}


