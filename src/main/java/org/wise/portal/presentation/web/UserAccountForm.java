/**
 * Copyright (c) 2007-2014 Regents of the University of California (Regents). 
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 * 
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
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
package org.wise.portal.presentation.web;

import java.io.Serializable;

import org.wise.portal.domain.authentication.MutableUserDetails;

/**
 * The class encapsulates all of the data necessary to register/update 
 * a TELS user account
 *
 * @author Hiroki Terashima
 * @version $Id: $
 */
public class UserAccountForm implements Serializable {

	static final long serialVersionUID = 1L;
	
	MutableUserDetails userDetails;
	
	boolean newAccount;

	private String repeatedPassword;
	
	/**
	 * @return the newAccount
	 */
	public boolean isNewAccount() {
		return newAccount;
	}

	/**
	 * @param newAccount the newAccount to set
	 */
	public void setNewAccount(boolean newAccount) {
		this.newAccount = newAccount;
	}

	/**
	 * @return the repeatedPassword
	 */
	public String getRepeatedPassword() {
		return repeatedPassword;
	}

	/**
	 * @param repeatedPassword the repeatedPassword to set
	 */
	public void setRepeatedPassword(String repeatedPassword) {
		this.repeatedPassword = repeatedPassword;
	}

	/**
	 * @return the userDetails
	 */
	public MutableUserDetails getUserDetails() {
		return userDetails;
	}

	/**
	 * @param userDetails the userDetails to set
	 */
	public void setUserDetails(MutableUserDetails userDetails) {
		this.userDetails = userDetails;
	}


}
