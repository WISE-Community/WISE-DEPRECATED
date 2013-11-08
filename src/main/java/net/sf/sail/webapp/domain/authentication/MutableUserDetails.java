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
package net.sf.sail.webapp.domain.authentication;

import java.util.Date;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import net.sf.sail.webapp.domain.Persistable;


/**
 * This interface extends Acegi Security's <code>UserDetails</code> and
 * provides mutator methods to the properties. <code>UserDetails</code>
 * represents user information.
 * 
 * @author Cynick Young
 * @author Laurel Williams
 * 
 * @version $Id$
 * @see org.acegisecurity.userdetails.UserDetails
 * 
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
}