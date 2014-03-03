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
package org.wise.portal.domain.authentication;

import java.util.Date;
import java.util.HashMap;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.wise.portal.domain.Persistable;

/**
 * TELS Portal version of MutableUserDetails interface
 * 
 * @author Hiroki Terashima
 * 
 * @version $Id$
 */
public interface MutableUserDetails extends UserDetails, Persistable {

	/**
	 * Sets an array of <code>GrantedAuthority</code> for this user. A
	 * <code>GrantedAuthority</code> represents a role that can be given
	 * specific access permissions. An example could be Admin, User, Manager,
	 * and BankTeller roles.
	 * 
	 * @param authorities
	 * @see org.acegisecurity.GrantedAuthority
	 */
	public void setAuthorities(GrantedAuthority[] authorities);

	/**
	 * Sets the user's password. This may or may not be plaintext. It will be up
	 * to the implementor to decide if encryption is required. If encryption is
	 * used, it must be representable as a <code>String</code>.
	 * 
	 * @param password
	 */
	public void setPassword(String password);

	/**
	 * Sets the user's name.
	 * 
	 * @param username
	 */
	public void setUsername(String username);

	/**
	 * Sets the user's email address.
	 * 
	 * @param emailAddress
	 */
	public void setEmailAddress(String emailAddress);

	/**
	 * Gets the user's email address.
	 * 
	 * @return emailAddress
	 */
	public String getEmailAddress();

	/**
	 * Adds a GrantedAuthority to a user.
	 * 
	 * @param authority
	 */
	public void addAuthority(GrantedAuthority authority);

	/**
	 * Returns true iff this user has the specified GrantedAuthority
	 * @return
	 */
	public boolean hasGrantedAuthority(String role);


	/**
	 * Gets the id for this user details object in the persistent store
	 * 
	 * @return The id of this user details object
	 */
	public Long getId();
	
	
	/**
	 * Enables/Disables account.
	 * This does not update the row in the database; only this object.
	 */
	public void setEnabled(boolean enabled);

	/**
	 * Get the recent failed login timestamp
	 * @return
	 */
	public Date getRecentFailedLoginTime();
	
	/**
	 * Set the recent failed login timestamp
	 * @param recentFailedLoginTime
	 */
	public void setRecentFailedLoginTime(Date recentFailedLoginTime);
	
	/**
	 * Get the number of recent failed login attempts
	 * @return
	 */
	public Integer getNumberOfRecentFailedLoginAttempts();
	
	/**
	 * Set the number of recent failed login attempts
	 * @param numberOfFailedLoginAttempts
	 */
	public void setNumberOfRecentFailedLoginAttempts(Integer numberOfFailedLoginAttempts);
	
	/**
	 * Increase the number of recent failed login attempts by 1
	 */
	public void incrementNumberOfRecentFailedLoginAttempts();
	
	/**
	 * Set the password key
	 * @param passwordKey an alphanumeric string
	 */
	public void setResetPasswordKey(String passwordKey);
	
	/**
	 * Get the password key
	 * @return an alphanumeric string
	 */
	public String getResetPasswordKey();
	
	/**
	 * Set the time the user requested a password reset
	 * @param resetPasswordRequestTime the time the user requested the password reset
	 */
	public void setResetPasswordRequestTime(Date resetPasswordRequestTime);
	
	/**
	 * Get the time the user requested a password reset
	 * @return the time the user requested the password reset
	 */
	public Date getResetPasswordRequestTime();
	
	public String getFirstname();
	
	public void setFirstname(String firstname);
	
	public String getLastname();
	
	public void setLastname(String lastname);
	
	public Date getSignupdate();
	
	public void setSignupdate(Date signupdate);
	
	/**
	 * @return this user's attributes in form of a HashMap
	 */
	public HashMap<String, Object> getInfo();
	
	/**
	 * @return this user's 'root' username.
	 * This does not mean it will be the username, (eg if it's not unique)
	 */
	public String getCoreUsername();
	
	/**
	 * In case username is not unique, append an item from the list of 
	 * suffices.
	 * 
	 * @return array of suffices to add to end of username to make it unique
	 */
	public String[] getUsernameSuffixes();
	
	/**
	 * Get the next username suffix
	 * @param currentUsernameSuffix
	 * @return a String containing the next username suffix
	 */
	public String getNextUsernameSuffix(String currentUsernameSuffix);
	
	/**
	 * Returns the number of times the user has logined into the system
	 * 
	 * @return Integer of times
	 */
	public Integer getNumberOfLogins();
	
	/**
	 * Sets the number of times the user has logined into the system
	 * 
	 * @param numberOfLogins 1 more time
	 */
	public void setNumberOfLogins(Integer numberOfLogins);
	
	/**
	 * Sets the date of the most recent login as lastLoginTime
	 * 
	 * @param lastLoginTime 1 more time
	 */
	public void setLastLoginTime(Date lastLoginTime);
	
	/**
	 * Get the user's language.
	 * 
	 * @return user's language, "en", "es", "ja", null if not set explicitly.
	 */
	public String getLanguage();

	/**
	 * Sets the user's language
	 * 
	 * @param user's language, "en", "es", "ja", etc
	 */
	public void setLanguage(String language);
	
	/**
	 * Increments the number of times the user has logined into the system
	 * 
	 * @param numberOfLogins
	 */
	public void incrementNumberOfLogins();
	
}
