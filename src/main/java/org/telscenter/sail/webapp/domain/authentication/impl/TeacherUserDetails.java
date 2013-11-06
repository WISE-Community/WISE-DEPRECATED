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

import java.util.Date;
import java.util.HashMap;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Transient;

import net.sf.sail.webapp.domain.authentication.impl.PersistentUserDetails;

import org.telscenter.sail.webapp.domain.authentication.MutableUserDetails;
import org.telscenter.sail.webapp.domain.authentication.Schoollevel;

/**
 * Implementation class of <code>MutableUserDetails</code> that uses an EJB3
 * compliant object persistence mechanism.
 * 
 * UserDetails for a teacher in TELS Portal
 * 
 * @author Hiroki Terashima
 * @version $Id$
 */
@Entity
@Table(name = TeacherUserDetails.DATA_STORE_NAME)
public class TeacherUserDetails extends PersistentUserDetails implements
		MutableUserDetails {

	@Transient
	public static final String DATA_STORE_NAME = "teacher_user_details";

	@Transient
	public static final String COLUMN_NAME_FIRSTNAME = "firstname";

	@Transient
	public static final String COLUMN_NAME_LASTNAME = "lastname";

	@Transient
	private static final String COLUMN_NAME_SIGNUPDATE = "signupdate";
	
	@Transient
	public static final String COLUMN_NAME_CITY = "city";
	
	@Transient
	public static final String COLUMN_NAME_STATE = "state";

	@Transient
	public static final String COLUMN_NAME_COUNTRY = "country";

	@Transient
	public static final String COLUMN_NAME_SCHOOLNAME = "schoolname";
	
	@Transient
	public static final String COLUMN_NAME_CURRICULUMSUBJECTS = "curriculumsubjects";

	@Transient
	public static final String COLUMN_NAME_SCHOOLLEVEL = "schoollevel";

	@Transient
	public static final String COLUMN_NAME_NUMBEROFLOGINS = "numberoflogins";
	
	@Transient
	public static final String COLUMN_NAME_LASTLOGINTIME = "lastlogintime";
	
	@Transient
	public static final String COMUN_NAME_DISPLAYNAME = "displayname";

	@Transient
	private static final String COMUN_NAME_EMAILVALID = "isEmailValid";
	
	@Transient
	private static final String COLUMN_NAME_HOW_HEAR = "howDidYouHearAboutUs";

    @Transient
    private static final long serialVersionUID = 1L;
    
    @Column(name = TeacherUserDetails.COLUMN_NAME_FIRSTNAME, nullable = false)
	private String firstname;
    
    @Column(name = TeacherUserDetails.COLUMN_NAME_LASTNAME, nullable = false)
	private String lastname;
    
    @Column(name = TeacherUserDetails.COLUMN_NAME_SIGNUPDATE, nullable = false)
    private Date signupdate;
    
    @Column(name = TeacherUserDetails.COLUMN_NAME_CITY)
	private String city;
    
    @Column(name = TeacherUserDetails.COLUMN_NAME_STATE)
	private String state;
    
    @Column(name = TeacherUserDetails.COLUMN_NAME_COUNTRY, nullable = false)
	private String country;
    
    @Column(name = TeacherUserDetails.COLUMN_NAME_SCHOOLNAME, nullable = false)
	private String schoolname;
    
    @Column(name = TeacherUserDetails.COLUMN_NAME_CURRICULUMSUBJECTS)
	private String[] curriculumsubjects;
    
    @Column(name = TeacherUserDetails.COLUMN_NAME_SCHOOLLEVEL, nullable = false)
	private Schoollevel schoollevel;
    
    @Column(name = TeacherUserDetails.COLUMN_NAME_NUMBEROFLOGINS, nullable = false)
    private Integer numberOfLogins;
    
    @Column(name = TeacherUserDetails.COLUMN_NAME_LASTLOGINTIME)
    private Date lastLoginTime;
    
    @Column(name = TeacherUserDetails.COMUN_NAME_DISPLAYNAME)
    private String displayname;
	
    @Column(name = TeacherUserDetails.COMUN_NAME_EMAILVALID, nullable=false)
    private boolean emailValid = true;
    
    @Column(name = TeacherUserDetails.COLUMN_NAME_HOW_HEAR)
    private String howDidYouHearAboutUs;
    
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
	/**
	 * @return the signupdate
	 */
	public Date getSignupdate() {
		return signupdate;
	}
	/**
	 * @param signupdate the signupdate to set
	 */
	public void setSignupdate(Date signupdate) {
		this.signupdate = signupdate;
	}
	/**
	 * @return the city
	 */
	public String getCity() {
		return city;
	}
	/**
	 * @param city the city to set
	 */
	public void setCity(String city) {
		this.city = city;
	}
	/**
	 * @return the country
	 */
	public String getCountry() {
		return country;
	}
	/**
	 * @param country the country to set
	 */
	public void setCountry(String country) {
		this.country = country;
	}
	/**
	 * @return the curriculumsubjects
	 */
	public String[] getCurriculumsubjects() {
		return curriculumsubjects;
	}
	/**
	 * @param curriculumsubjects the curriculumsubjects to set
	 */
	public void setCurriculumsubjects(String[] curriculumsubjects) {
		this.curriculumsubjects = curriculumsubjects;
	}
	/**
	 * @return the schoollevel
	 */
	public Schoollevel getSchoollevel() {
		return schoollevel;
	}
	/**
	 * @param schoollevel the schoollevel to set
	 */
	public void setSchoollevel(Schoollevel schoollevel) {
		this.schoollevel = schoollevel;
	}
	/**
	 * @return the schoolname
	 */
	public String getSchoolname() {
		return schoolname;
	}
	/**
	 * @param schoolname the schoolname to set
	 */
	public void setSchoolname(String schoolname) {
		this.schoolname = schoolname;
	}
	/**
	 * @return the state
	 */
	public String getState() {
		return state;
	}
	/**
	 * @param state the state to set
	 */
	public void setState(String state) {
		this.state = state;
	}
	/**
	 * @see org.telscenter.sail.webapp.domain.authenticationMutableUserDetails.getCoreUsername()
	 */
	public String getCoreUsername() {
		// firstname + lastname, but make sure it's alphanumeric
		String username = firstname + lastname;
		username = username.replaceAll("[^a-zA-Z0-9]", "");
		return username;
	}
	/**
	 * @see org.telscenter.sail.webapp.domain.authenticationMutableUserDetails.getUsernameSuffixes()
	 */
	public String[] getUsernameSuffixes() {
		return new String[] {"", "1", "2", "3", "4", "5", "6", "7", "8",
	            "9", "10", "11", "12", "13", "14", "15", "16"};
	}
	
	/**
	 * Get the next username suffix. For teachers the suffix is just an integer
	 * that we will increment
	 * @param currentUsernameSuffix the current suffix
	 * @see org.telscenter.sail.webapp.domain.authentication.MutableUserDetails#getNextUsernameSuffix(java.lang.String)
	 * @return the next username suffix which is just the next integer
	 */
	public String getNextUsernameSuffix(String currentUsernameSuffix) {
		String nextUsernameSuffix = "";
		
		if(currentUsernameSuffix == null) {
			//empty suffix string
			nextUsernameSuffix = "";
		} else if("".equals(currentUsernameSuffix)) {
			//if the previous was "" we will now return an integer
			nextUsernameSuffix = "1";
		} else {
			try {
				//increment the integer by 1
				nextUsernameSuffix = (Integer.parseInt(currentUsernameSuffix) + 1) + "";
			} catch(NumberFormatException e) {
				e.printStackTrace();
			}
		}
		
		return nextUsernameSuffix;
	}
	
	public Integer getNumberOfLogins() {
		return this.numberOfLogins;
	}
	
	public void setNumberOfLogins(Integer numberOfLogins) {
		this.numberOfLogins = numberOfLogins;
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
		infoMap.put("Sign Up Date", this.getSignupdate());
		infoMap.put("City", this.getCity());
		infoMap.put("State", this.getState());
		infoMap.put("Country", this.getCountry());
		infoMap.put("School Name", this.getSchoolname());
		infoMap.put("School Level", this.getSchoollevel().toString());
		String subjects = "";
		for(String s:curriculumsubjects) {
			subjects = subjects + s + " ";
		}
		infoMap.put("Curriculum Subjects", subjects);
		infoMap.put("Number of Logins", this.getNumberOfLogins().toString());
		infoMap.put("Last Login", this.getLastLoginTime());
		infoMap.put("Display Name", this.getDisplayname());
		infoMap.put("Username", this.getUsername());
		infoMap.put("How did you hear about us", this.getHowDidYouHearAboutUs());
		infoMap.put("Email", this.getEmailAddress());
		return infoMap;
	}
	
	/**
	 * @return the displayname
	 */
	public String getDisplayname() {
		return displayname;
	}
	
	/**
	 * @param displayname the displayname to set
	 */
	public void setDisplayname(String displayname) {
		this.displayname = displayname;
	}
	/**
	 * @return the emailValid
	 */
	public boolean isEmailValid() {
		return emailValid;
	}
	/**
	 * @param emailValid the emailValid to set
	 */
	public void setEmailValid(boolean emailValid) {
		this.emailValid = emailValid;
	}
	
	/**
	 * Get the how the teacher heard about us
	 * @return
	 */
	public String getHowDidYouHearAboutUs() {
		return howDidYouHearAboutUs;
	}
	
	/**
	 * Set how the teacher heard about us
	 * @param howDidYouHearAboutUs
	 */
	public void setHowDidYouHearAboutUs(String howDidYouHearAboutUs) {
		this.howDidYouHearAboutUs = howDidYouHearAboutUs;
	}
}
