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
package org.telscenter.sail.webapp.domain.authentication.impl;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Transient;

import net.sf.sail.webapp.domain.authentication.impl.PersistentUserDetails;

import org.telscenter.sail.webapp.domain.authentication.Gender;
import org.telscenter.sail.webapp.domain.authentication.MutableUserDetails;

/**
 * Implementation class of <code>MutableUserDetails</code> that uses an EJB3
 * compliant object persistence mechanism.
 * 
 * UserDetails for a student in TELS Portal
 * 
 * @author Hiroki Terashima
 * @version $Id$
 */
@Entity
@Table(name = StudentUserDetails.DATA_STORE_NAME)
public class StudentUserDetails extends PersistentUserDetails implements
		MutableUserDetails {

	@Transient
	public static final String DATA_STORE_NAME = "student_user_details";
	
	@Transient
	public static final String COLUMN_NAME_FIRSTNAME = "firstname";

	@Transient
	public static final String COLUMN_NAME_LASTNAME = "lastname";

	@Transient
	private static final String COLUMN_NAME_SIGNUPDATE = "signupdate";

	@Transient
	public static final String COLUMN_NAME_GENDER = "gender";
	
	@Transient
	public static final String COLUMN_NAME_BIRTHDAY = "birthday";
	
	@Transient
	public static final String COLUMN_NAME_NUMBEROFLOGINS = "numberoflogins";
	
	@Transient
	public static final String COLUMN_NAME_LASTLOGINTIME = "lastlogintime";
	
	@Transient
	public static final String COLUMN_NAME_ACCOUNTQUESTION = "accountquestion";
	
	@Transient
	public static final String COLUMN_NAME_ACCOUNTANSWER = "accountanswer";
	
    @Transient
    private static final long serialVersionUID = 1L;

    @Column(name = StudentUserDetails.COLUMN_NAME_FIRSTNAME, nullable = false)
	private String firstname;
    
    @Column(name = StudentUserDetails.COLUMN_NAME_LASTNAME, nullable = false)
	private String lastname;
    
    @Column(name = StudentUserDetails.COLUMN_NAME_SIGNUPDATE, nullable = false)
    private Date signupdate;
    
    @Column(name = StudentUserDetails.COLUMN_NAME_GENDER, nullable = false)
	private Gender gender;
    
    @Column(name = StudentUserDetails.COLUMN_NAME_BIRTHDAY, nullable = false)
	private Date birthday;
    
    @Column(name = StudentUserDetails.COLUMN_NAME_NUMBEROFLOGINS, nullable = false)
    private Integer numberOfLogins;
    
    @Column(name = StudentUserDetails.COLUMN_NAME_LASTLOGINTIME)
    private Date lastLoginTime;
    
    @Column(name = StudentUserDetails.COLUMN_NAME_ACCOUNTQUESTION, nullable = false)
    private String accountQuestion;
    
    @Column(name = StudentUserDetails.COLUMN_NAME_ACCOUNTANSWER, nullable = false)
    private String accountAnswer;
	
	/**
	 * @return the firstname
	 */
	public String getFirstname() {
		return firstname;
	}
	/**
	 * @param firstname the firstname to set
	 */
	public void setFirstname(String firstname) {
		this.firstname = firstname;
	}
	/**
	 * @return the gender
	 */
	public Gender getGender() {
		return gender;
	}
	/**
	 * @param gender the gender to set
	 */
	public void setGender(Gender gender) {
		this.gender = gender;
	}
	/**
	 * @return the lastname
	 */
	public String getLastname() {
		return lastname;
	}
	/**
	 * @param lastname the lastname to set
	 */
	public void setLastname(String lastname) {
		this.lastname = lastname;
	}
	public Date getSignupdate() {
		return signupdate;
	}
	public void setSignupdate(Date signupdate) {
		this.signupdate = signupdate;
	}
	/**
	 * @return the birthday
	 */
	public Date getBirthday() {
		return birthday;
	}
	/**
	 * @param birthday the birthday to set
	 */
	public void setBirthday(Date birthday) {
		this.birthday = birthday;
	}
	/**
	 * @see org.telscenter.sail.webapp.domain.authenticationMutableUserDetails.getCoreUsername()
	 */
	public String getCoreUsername() {
		String firstname = getFirstname();
		String lastnameInitial = getLastname().substring(0, 1);

		Calendar birthday = Calendar.getInstance();
		birthday.setTime(this.birthday);
		
		int birthmonth = birthday.get(Calendar.MONTH) + 1;  // month is 0-based
		int birthdate = birthday.get(Calendar.DATE);
		String birthmonthString = String.valueOf(birthmonth);
		if (birthmonth <= 9) {
			birthmonthString = "0" + birthmonthString;
		}
		String birthdateString = String.valueOf(birthdate);
		if (birthdate <= 9) {
			birthdateString = "0" + birthdateString;
		}
		
		String username = firstname + lastnameInitial +
		birthmonthString + birthdateString;
		username = username.replaceAll("[^a-zA-Z0-9]", "");

		return username;
	}
	/**
	 * @see org.telscenter.sail.webapp.domain.authenticationMutableUserDetails.getUsernameSuffixes()
	 */
	public String[] getUsernameSuffixes() {
		return new String[] {"", "a", "b", "c", "d", "e", "f", "g", "h",
            "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"};
	}
	
	/**
	 * Get the next username suffix. For students the suffix is just an alphabet letter.
	 * If we reach "z" we will then move on to "aa", if we reach "az" we will then move
	 * on to "aaa", etc.
	 * e.g.
	 * "x"
	 * "y"
	 * "z"
	 * "aa"
	 * "ab"
	 * @param currentUsernameSuffix the current suffix
	 * @see org.telscenter.sail.webapp.domain.authentication.MutableUserDetails#getNextUsernameSuffix(java.lang.String)
	 * @return the next username suffix which will be the next letter in the alphabet
	 */
	public String getNextUsernameSuffix(String currentUsernameSuffix) {
		String nextUsernameSuffix = "";
		
		if(currentUsernameSuffix == null) {
			//empty suffix string
			nextUsernameSuffix = "";
		} else if("".equals(currentUsernameSuffix)) {
			//if the previous was "" we will now return "a"
			nextUsernameSuffix = "a";
		} else {
			if(currentUsernameSuffix.length() > 0) {
				//get the last char in the suffix
				char lastChar = currentUsernameSuffix.charAt(currentUsernameSuffix.length() - 1);
				
				if(lastChar == 'z') {
					//the last char was 'z' so we need to move on to "aa"
					String beginningCurrentUsernameSuffix = currentUsernameSuffix.substring(0, currentUsernameSuffix.length() - 1);
					nextUsernameSuffix = beginningCurrentUsernameSuffix + "aa";
				} else {
					//try the next letter in the alphabet
					nextUsernameSuffix = currentUsernameSuffix.substring(0, currentUsernameSuffix.length() - 1) + (char) (lastChar + 1);
				}
			}
		}
		
		return nextUsernameSuffix;
	}
	
	/**
	 * the number of user logins
	 */
	public Integer getNumberOfLogins() {
		return this.numberOfLogins;
	}
	
	/**
	 * sets the number of logins
	 */
	public void setNumberOfLogins(Integer numberOfLogins) {
		this.numberOfLogins = numberOfLogins;
	}
	/**
	 * @return the accountQuestion
	 */
	public String getAccountQuestion() {
		return accountQuestion;
	}
	/**
	 * @param accountQuestion the accountQuestion to set
	 */
	public void setAccountQuestion(String accountQuestion) {
		this.accountQuestion = accountQuestion;
	}
	/**
	 * @return the accountAnswer
	 */
	public String getAccountAnswer() {
		return accountAnswer;
	}
	/**
	 * @param accountAnswer the accountAnswer to set
	 */
	public void setAccountAnswer(String accountAnswer) {
		this.accountAnswer = accountAnswer;
	}
	/**
	 * @return the lastLoginTime
	 */
	public Date getLastLoginTime() {
		return lastLoginTime;
	}
	/**
	 * @param lastLoginTime the lastLoginTime to set
	 */
	public void setLastLoginTime(Date lastLoginTime) {
		this.lastLoginTime = lastLoginTime;
	}
	/**
	 * @override @see org.telscenter.sail.webapp.domain.authentication.MutableUserDetails#incrementNumberOfLogins()
	 */
	public void incrementNumberOfLogins() {
		this.numberOfLogins++;
	}
	/**
	 * @override @see org.telscenter.sail.webapp.domain.authentication.MutableUserDetails#getInfo()
	 */
	public HashMap<String, Object> getInfo() {
		HashMap<String, Object> infoMap = new HashMap<String, Object>();
		infoMap.put("ID", this.getId());
		infoMap.put("First Name", this.getFirstname());
		infoMap.put("Last Name", this.getLastname());
		infoMap.put("Username", this.getUsername());
		infoMap.put("Sign Up Date", this.getSignupdate());
		infoMap.put("Gender", this.getGender().toString());
		infoMap.put("Birthday", this.getBirthday());
		infoMap.put("Number of Logins", this.getNumberOfLogins().toString());
		infoMap.put("Last Login", this.getLastLoginTime());
		return infoMap;
	}
}
