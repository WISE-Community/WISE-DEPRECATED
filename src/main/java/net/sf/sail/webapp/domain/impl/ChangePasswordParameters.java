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
package net.sf.sail.webapp.domain.impl;

import java.io.Serializable;

import net.sf.sail.webapp.domain.User;

/**
 * A form-backing object for WISE students when changing a 
 * their existing passwords
 * 
 * @author Patrick Lawler
 *         Sally Ahn
 * @version $Id: $
 */
public class ChangePasswordParameters implements Serializable {

	private static final long serialVersionUID = 1L;

	private String passwd0, passwd1, passwd2;
	
	private User user;
	private User teacherUser;
	
	/**
	 * Get what the user has entered as their current password
	 * @return what the user has entered as their current password
	 */
	public String getPasswd0() {
		return passwd0;
	}

	/**
	 * Set what the user has entered as their current password
	 * @param passwd0 what the user has entered as their current password
	 */
	public void setPasswd0(String passwd0) {
		this.passwd0 = passwd0;
	}

	/**
	 * @return the passwd1
	 */
	public String getPasswd1() {
		return passwd1;
	}

	/**
	 * @param passwd1 the passwd1 to set
	 */
	public void setPasswd1(String passwd1) {
		this.passwd1 = passwd1;
	}

	/**
	 * @return the passwd2
	 */
	public String getPasswd2() {
		return passwd2;
	}

	/**
	 * @param passwd2 the passwd2 to set
	 */
	public void setPasswd2(String passwd2) {
		this.passwd2 = passwd2;
	}

	/**
	 * @return the user
	 */
	public User getUser(){
		return user;
	}
	
	/**
	 * @param sets the user
	 */
	public void setUser(User user){
		this.user = user;
	}

	/**
	 * Get the teacher User object
	 * If the teacher is changing the password for a student we will need
	 * the teacher account to make sure the teacher typed in their own
	 * password correctly
	 * @return
	 */
	public User getTeacherUser() {
		return teacherUser;
	}

	/**
	 * Set the teacher User object
	 * @param teacherUser the teacher User object
	 */
	public void setTeacherUser(User teacherUser) {
		this.teacherUser = teacherUser;
	}
}
