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

package org.telscenter.sail.webapp.domain.impl;

import java.util.HashMap;

public class ReminderParameters extends HashMap<String, String> {
	
	public static final String SUBMITTEDACCOUNTANSWER = "submittedaccountanswer";

	public static final String ACCOUNT_ANSWER = "accountAnswer";

	public static final String ACCOUNT_QUESTION = "accountQuestion";

	private static final long serialVersionUID = 1L;
	
	public static final String USERNAME = "username";
	
	public static final String NEW_PASSWORD = "newPassword";
	
	public static final String VERIFY_PASSWORD = "verifyPassword";

	
	public static final String PROJECT_CODE = "projectCode";
	
	public static final String FIRST_NAME = "firstName";
	
	public static final String LAST_NAME = "lastName";
	
	public static final String BIRTH_MONTH = "birthMonth";
	
	public static final String BIRTH_DAY = "birthDay";
	
	public void setUsername(String username) {
		this.put(USERNAME, username);
	}
	
	public String getUsername() {
		return this.get(USERNAME);
	}
	
	public void setAccountQuestion(String accountQuestion) {
		this.put(ACCOUNT_QUESTION, accountQuestion);
	}
	
	public String getAccountQuestion() {
		return this.get(ACCOUNT_QUESTION);
	}
	
	public void setAccountAnswer(String accountAnswer) {
		this.put(ACCOUNT_ANSWER, accountAnswer);
	}
	
	public String getAccountAnswer() {
		return this.get(ACCOUNT_ANSWER);
	}
	
	public void setSubmittedAccountAnswer(String submittedAccountAnswer) {
		this.put(SUBMITTEDACCOUNTANSWER, submittedAccountAnswer);
	}
	
	public String getSubmittedAccountAnswer() {
		return this.get(SUBMITTEDACCOUNTANSWER);
	}
	
	public void setNewPassword(String password) {
		this.put(NEW_PASSWORD, password);
	}
	
	public String getNewPassword(){
		return this.get(NEW_PASSWORD);
	}
	
	public void setVerifyPassword(String password) {
		this.put(VERIFY_PASSWORD, password);
	}
	
	public String getVerifyPassword(){
		return this.get(VERIFY_PASSWORD);
	}
	
	public void setProjectCode(String projectCode) {
		this.put(PROJECT_CODE, projectCode);
	}
	public String getProjectCode() {
		return this.get(PROJECT_CODE);
	}
	
	public void setFirstName(String firstName) {
		this.put(FIRST_NAME, firstName);
	}

	public String getFirstName() {
		return this.get(FIRST_NAME);
	}
	
	public void setLastName(String lastName) {
		this.put(LAST_NAME, lastName);
	}

	public String getLastName() {
		return this.get(LAST_NAME);
	}
	
	public void setBirthMonth(String birthMonth) {
		this.put(BIRTH_MONTH, birthMonth);
	}

	public String getBirthMonth() {
		return this.get(BIRTH_MONTH);
	}
	
	public void setBirthDay(String birthDay) {
		this.put(BIRTH_DAY, birthDay);
	}

	public String getBirthDay() {
		return this.get(BIRTH_DAY);
	}
}
