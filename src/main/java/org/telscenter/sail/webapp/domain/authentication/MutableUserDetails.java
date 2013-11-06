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
package org.telscenter.sail.webapp.domain.authentication;

import java.util.Date;
import java.util.HashMap;

/**
 * TELS Portal version of MutableUserDetails interface
 * 
 * @author Hiroki Terashima
 * 
 * @version $Id$
 */
public interface MutableUserDetails extends
		net.sf.sail.webapp.domain.authentication.MutableUserDetails {

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
	 * Increments the number of times the user has logined into the system
	 * 
	 * @param numberOfLogins
	 */
	public void incrementNumberOfLogins();
	
}
