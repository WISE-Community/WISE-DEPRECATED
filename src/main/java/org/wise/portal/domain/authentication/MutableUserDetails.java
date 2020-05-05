/**
 * Copyright (c) 2008-2015 Regents of the University of California (Regents).
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
package org.wise.portal.domain.authentication;

import java.util.Date;
import java.util.HashMap;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.wise.portal.domain.Persistable;

/**
 * WISE version of MutableUserDetails interface
 *
 * @author Hiroki Terashima
 */
public interface MutableUserDetails extends UserDetails, Persistable {

  /**
   * Sets an array of <code>GrantedAuthority</code> for this user. A
   * <code>GrantedAuthority</code> represents a role that can be given
   * specific access permissions. An example could be Admin, User, Manager,
   * and BankTeller roles.
   *
   * @param authorities
   * @see GrantedAuthority
   */
  void setAuthorities(GrantedAuthority[] authorities);

  /**
   * Sets the user's password. This may or may not be plaintext. It will be up
   * to the implementor to decide if encryption is required. If encryption is
   * used, it must be representable as a <code>String</code>.
   *
   * @param password
   */
  void setPassword(String password);

  /**
   * Sets the user's name.
   *
   * @param username
   */
  void setUsername(String username);

  /**
   * Sets the user's email address.
   *
   * @param emailAddress
   */
  void setEmailAddress(String emailAddress);

  /**
   * Gets the user's email address.
   *
   * @return emailAddress
   */
  String getEmailAddress();

  /**
   * Adds a GrantedAuthority to a user.
   *
   * @param authority
   */
  void addAuthority(GrantedAuthority authority);

  /**
   * Removes a GrantedAuthority from a user.
   *
   * @param authority
   */
  void removeAuthority(GrantedAuthority authority);

  /**
   * Returns true iff this user has the specified GrantedAuthority
   * @return
   */
  boolean hasGrantedAuthority(String role);

  /**
   * Gets the id for this user details object in the persistent store
   * @return The id of this user details object
   */
  Long getId();

  /**
   * Enables/Disables account.
   * This does not update the row in the database; only this object.
   */
  void setEnabled(boolean enabled);

  /**
   * Get the recent failed login timestamp
   * @return
   */
  Date getRecentFailedLoginTime();

  /**
   * Set the recent failed login timestamp
   * @param recentFailedLoginTime
   */
  void setRecentFailedLoginTime(Date recentFailedLoginTime);

  /**
   * Get the number of recent failed login attempts
   * @return
   */
  Integer getNumberOfRecentFailedLoginAttempts();

  /**
   * Set the number of recent failed login attempts
   * @param numberOfFailedLoginAttempts
   */
  void setNumberOfRecentFailedLoginAttempts(Integer numberOfFailedLoginAttempts);

  /**
   * Increase the number of recent failed login attempts by 1
   */
  void incrementNumberOfRecentFailedLoginAttempts();

  /**
   * Set the password key
   * @param passwordKey an alphanumeric string
   */
  void setResetPasswordKey(String passwordKey);

  /**
   * Get the password key
   * @return an alphanumeric string
   */
  String getResetPasswordKey();

  /**
   * Set the time the user requested a password reset
   * @param resetPasswordRequestTime the time the user requested the password reset
   */
  void setResetPasswordRequestTime(Date resetPasswordRequestTime);

  /**
   * Get the time the user requested a password reset
   * @return the time the user requested the password reset
   */
  Date getResetPasswordRequestTime();

  String getFirstname();

  void setFirstname(String firstname);

  String getLastname();

  void setLastname(String lastname);

  Date getSignupdate();

  void setSignupdate(Date signupdate);

  /**
   * @return this user's attributes in form of a HashMap
   */
  HashMap<String, Object> getInfo();

  /**
   * @return this user's 'root' username.
   * This does not mean it will be the username, (eg if it's not unique)
   */
  String getCoreUsername();

  /**
   * In case username is not unique, append an item from the list of suffices.
   * @return array of suffices to add to end of username to make it unique
   */
  String[] getUsernameSuffixes();

  /**
   * Get the next username suffix
   * @param currentUsernameSuffix
   * @return a String containing the next username suffix
   */
  String getNextUsernameSuffix(String currentUsernameSuffix);

  /**
   * Returns the number of times the user has logined into the system
   * @return Integer of times
   */
  Integer getNumberOfLogins();

  /**
   * Sets the number of times the user has logined into the system
   * @param numberOfLogins 1 more time
   */
  void setNumberOfLogins(Integer numberOfLogins);

  /**
   * Sets the date of the most recent login as lastLoginTime
   * @param lastLoginTime 1 more time
   */
  void setLastLoginTime(Date lastLoginTime);

  /**
   * Get the user's language.
   * @return user's language, "en", "es", "ja", null if not set explicitly.
   */
  String getLanguage();

  /**
   * Sets the user's language
   *
   * @param language of the user "en", "es", "ja", etc
   */
  void setLanguage(String language);

  /**
   * Increments the number of times the user has logined into the system
   */
  void incrementNumberOfLogins();

  Date getResetPasswordVerificationCodeRequestTime();

  void setResetPasswordVerificationCodeRequestTime(Date date);

  void clearResetPasswordVerificationCodeRequestTime();

  String getResetPasswordVerificationCode();

  void setResetPasswordVerificationCode(String verificationCode);

  void clearResetPasswordVerificationCode();

  Date getRecentFailedVerificationCodeAttemptTime();

  void setRecentFailedVerificationCodeAttemptTime(Date date);

  void clearRecentFailedVerificationCodeAttemptTime();

  Integer getNumberOfRecentFailedVerificationCodeAttempts();

  void incrementNumberOfRecentFailedVerificationCodeAttempts();

  void clearNumberOfRecentFailedVerificationCodeAttempts();

  boolean isAdminUser();

  boolean isGoogleUser();

  String getGoogleUserId();
}
