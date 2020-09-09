/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
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
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.domain.authentication.impl;

import java.util.Date;
import java.util.HashMap;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Transient;

import lombok.Getter;
import lombok.Setter;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.Schoollevel;

/**
 * Implementation class of <code>MutableUserDetails</code> that uses an EJB3 compliant object
 * persistence mechanism.
 *
 * UserDetails for a teacher in WISE
 *
 * @author Hiroki Terashima
 */
@Entity
@Table(name = TeacherUserDetails.DATA_STORE_NAME)
public class TeacherUserDetails extends PersistentUserDetails implements MutableUserDetails {

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
  @Getter
  @Setter
  private String firstname;

  @Column(name = TeacherUserDetails.COLUMN_NAME_LASTNAME, nullable = false)
  @Getter
  @Setter
  private String lastname;

  @Column(name = TeacherUserDetails.COLUMN_NAME_SIGNUPDATE, nullable = false)
  @Getter
  @Setter
  private Date signupdate;

  @Column(name = TeacherUserDetails.COLUMN_NAME_CITY)
  @Getter
  @Setter
  private String city;

  @Column(name = TeacherUserDetails.COLUMN_NAME_STATE)
  @Getter
  @Setter
  private String state;

  @Column(name = TeacherUserDetails.COLUMN_NAME_COUNTRY, nullable = false)
  @Getter
  @Setter
  private String country;

  @Column(name = TeacherUserDetails.COLUMN_NAME_SCHOOLNAME, nullable = false)
  @Getter
  @Setter
  private String schoolname;

  @Column(name = TeacherUserDetails.COLUMN_NAME_CURRICULUMSUBJECTS)
  @Getter
  @Setter
  private String[] curriculumsubjects;

  @Column(name = TeacherUserDetails.COLUMN_NAME_SCHOOLLEVEL, nullable = false)
  @Getter
  @Setter
  private Schoollevel schoollevel;

  @Column(name = TeacherUserDetails.COLUMN_NAME_NUMBEROFLOGINS, nullable = false)
  @Getter
  @Setter
  private Integer numberOfLogins;

  @Column(name = TeacherUserDetails.COLUMN_NAME_LASTLOGINTIME)
  @Getter
  @Setter
  private Date lastLoginTime;

  @Column(name = TeacherUserDetails.COMUN_NAME_DISPLAYNAME)
  @Getter
  @Setter
  private String displayname;

  @Column(name = TeacherUserDetails.COMUN_NAME_EMAILVALID, nullable = false)
  private boolean emailValid = true;

  @Column(name = TeacherUserDetails.COLUMN_NAME_HOW_HEAR)
  @Getter
  @Setter
  private String howDidYouHearAboutUs;

  public String getCoreUsername() {
    return firstname + lastname;
  }

  public String[] getUsernameSuffixes() {
    return new String[] { "", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13",
        "14", "15", "16" };
  }

  /**
   * Get the next username suffix. For teachers the suffix is just an integer that we will increment
   * 
   * @param currentUsernameSuffix
   *                                the current suffix
   * @see org.wise.portal.domain.authentication.MutableUserDetails#getNextUsernameSuffix(java.lang.String)
   * @return the next username suffix which is just the next integer
   */
  public String getNextUsernameSuffix(String currentUsernameSuffix) {
    String nextUsernameSuffix = "";
    if (currentUsernameSuffix == null) {
      nextUsernameSuffix = "";
    } else if ("".equals(currentUsernameSuffix)) {
      nextUsernameSuffix = "1";
    } else {
      try {
        nextUsernameSuffix = (Integer.parseInt(currentUsernameSuffix) + 1) + "";
      } catch (NumberFormatException e) {
        e.printStackTrace();
      }
    }
    return nextUsernameSuffix;
  }

  @Override
  public void incrementNumberOfLogins() {
    this.numberOfLogins++;
  }

  @Override
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
    if (curriculumsubjects != null) {
      for (String s : curriculumsubjects) {
        subjects = subjects + s + " ";
      }
    }
    infoMap.put("Curriculum Subjects", subjects);
    infoMap.put("Number of Logins", this.getNumberOfLogins().toString());
    infoMap.put("Last Login", this.getLastLoginTime());
    infoMap.put("Display Name", this.getDisplayname());
    infoMap.put("Username", this.getUsername());
    infoMap.put("How did you hear about us", this.getHowDidYouHearAboutUs());
    infoMap.put("Email", this.getEmailAddress());
    infoMap.put("Language", this.getLanguage());
    return infoMap;
  }

  public boolean isEmailValid() {
    return emailValid;
  }

  public void setEmailValid(boolean emailValid) {
    this.emailValid = emailValid;
  }
}
