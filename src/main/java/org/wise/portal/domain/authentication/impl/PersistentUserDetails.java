/**
 * Copyright (c) 2007-2019 Encore Research Group, University of Toronto
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Public License for more details.
 *
 * You should have received a copy of the GNU Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package org.wise.portal.domain.authentication.impl;

import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.Version;

import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.service.authentication.UserDetailsService;

/**
 * Implementation class of <code>MutableUserDetails</code> that uses an EJB3
 * compliant object persistence mechanism.
 *
 * @author Cynick Young
 * @author Laurel Williams
 */
@Entity
@Table(name = PersistentUserDetails.DATA_STORE_NAME)
@Inheritance(strategy = InheritanceType.JOINED)
public class PersistentUserDetails implements MutableUserDetails {

  @Transient
  public static final String DATA_STORE_NAME = "user_details";

  @Transient
  public static final String GRANTED_AUTHORITY_JOIN_TABLE_NAME = "user_details_related_to_roles";

  @Transient
  public static final String USER_DETAILS_JOIN_COLUMN_NAME = "user_details_fk";

  @Transient
  public static final String GRANTED_AUTHORITY_JOIN_COLUMN_NAME = "granted_authorities_fk";

  @Transient
  public static final String COLUMN_NAME_USERNAME = "username";

  @Transient
  public static final String COLUMN_NAME_PASSWORD = "password";

  @Transient
  public static final String COLUMN_NAME_EMAIL_ADDRESS = "email_address";

  @Transient
  public static final String COLUMN_NAME_RECENT_FAILED_LOGIN = "recent_failed_login_time";

  @Transient
  public static final String COLUMN_NAME_RECENT_NUMBER_FAILED_LOGINS = "recent_number_of_failed_login_attempts";

  @Transient
  public static final String COLUMN_NAME_REST_PASSWORD_KEY = "reset_password_key";

  @Transient
  public static final String COLUMN_NAME_RESET_PASSWORD_REQUEST_TIME = "reset_password_request_time";

  @Transient
  public static final String COLUMN_NAME_LANGUAGE = "language";

  @Transient
  public static final String COLUMN_NAME_RESET_PASSWORD_VERIFICATION_CODE_REQUEST_TIME = "reset_password_verification_code_request_time";

  @Transient
  public static final String COLUMN_NAME_RESET_PASSWORD_VERIFICATION_CODE = "reset_password_verification_code";

  @Transient
  public static final String COLUMN_NAME_RECENT_FAILED_VERIFICATION_ATTEMPT_TIME = "recent_failed_verification_code_attempt_time";

  @Transient
  public static final String COLUMN_NAME_RECENT_NUMBER_FAILED_VERIFICATION_ATTEMPTS = "recent_number_of_failed_verification_code_attempts";

  @Transient
  private static final long serialVersionUID = 1L;

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Getter
  private Long id = null;

  @Version
  @Column(name = "OPTLOCK")
  private Integer version = null;

  // EJB3 spec annotations require the use of a java <code>Collection</code>.
  // However, Acegi Security deals with an array. There are internal methods
  // to convert to and from the different data structures.
  @ManyToMany(targetEntity = PersistentGrantedAuthority.class, fetch = FetchType.EAGER)
  @JoinTable(name = PersistentUserDetails.GRANTED_AUTHORITY_JOIN_TABLE_NAME, joinColumns = { @JoinColumn(name = USER_DETAILS_JOIN_COLUMN_NAME, nullable = false) }, inverseJoinColumns = @JoinColumn(name = GRANTED_AUTHORITY_JOIN_COLUMN_NAME, nullable = false))
  private Set<GrantedAuthority> grantedAuthorities = null;

  @Column(name = PersistentUserDetails.COLUMN_NAME_PASSWORD, nullable = false)
  @Getter
  @Setter
  private String password = null;

  @Column(name = PersistentUserDetails.COLUMN_NAME_USERNAME, unique = true, nullable = false)
  @Getter
  @Setter
  private String username = null;

  @Column(name = PersistentUserDetails.COLUMN_NAME_EMAIL_ADDRESS, nullable = true)
  @Setter
  private String emailAddress = null;

  @Column(name = "account_not_expired", nullable = false)
  private Boolean accountNonExpired = Boolean.TRUE;

  @Column(name = "account_not_locked", nullable = false)
  private Boolean accountNonLocked = Boolean.TRUE;

  @Column(name = "credentials_not_expired", nullable = false)
  private Boolean credentialsNonExpired = Boolean.TRUE;

  @Column(name = "enabled", nullable = false)
  private Boolean enabled = Boolean.TRUE;

  @Column(name = PersistentUserDetails.COLUMN_NAME_RECENT_FAILED_LOGIN, nullable = true)
  @Getter
  @Setter
  private Date recentFailedLoginTime = null;

  @Column(name = PersistentUserDetails.COLUMN_NAME_RECENT_NUMBER_FAILED_LOGINS, nullable = true)
  @Getter
  @Setter
  private Integer numberOfRecentFailedLoginAttempts = 0;

  @Column(name = PersistentUserDetails.COLUMN_NAME_REST_PASSWORD_KEY, nullable = true)
  @Getter
  @Setter
  private String resetPasswordKey = null;

  @Column(name = PersistentUserDetails.COLUMN_NAME_RESET_PASSWORD_REQUEST_TIME, nullable = true)
  @Getter
  @Setter
  private Date resetPasswordRequestTime = null;

  @Column(name = PersistentUserDetails.COLUMN_NAME_LANGUAGE, nullable = true)
  private String language = "en";

  @Column(name = "googleUserId")
  @Getter
  @Setter
  private String googleUserId;

  @Column(name = PersistentUserDetails.COLUMN_NAME_RESET_PASSWORD_VERIFICATION_CODE_REQUEST_TIME, nullable = true)
  @Getter
  @Setter
  private Date resetPasswordVerificationCodeRequestTime = null;

  @Column(name = PersistentUserDetails.COLUMN_NAME_RESET_PASSWORD_VERIFICATION_CODE, nullable = true)
  @Getter
  @Setter
  private String resetPasswordVerificationCode = null;

  @Column(name = PersistentUserDetails.COLUMN_NAME_RECENT_FAILED_VERIFICATION_ATTEMPT_TIME, nullable = true)
  @Getter
  @Setter
  private Date recentFailedVerificationCodeAttemptTime = null;

  @Column(name = PersistentUserDetails.COLUMN_NAME_RECENT_NUMBER_FAILED_VERIFICATION_ATTEMPTS, nullable = true)
  @Getter
  @Setter
  private Integer numberOfRecentFailedVerificationCodeAttempts = 0;

  @Transient
  public Collection<? extends GrantedAuthority> getAuthorities() {
    // Used by Acegi Security. This implements the required method from
    // Acegi Security. This implementation does not obtain the values
    // directly from the data store.
    return this.getGrantedAuthorities();
  }

  @SuppressWarnings("unchecked")
  public synchronized void setAuthorities(GrantedAuthority[] authorities) {
    this.setGrantedAuthorities(new HashSet(Arrays.asList(authorities)));
  }

  private Set<GrantedAuthority> getGrantedAuthorities() {
    /* Used only for persistence */
    return this.grantedAuthorities;
  }

  @SuppressWarnings("unused")
  private synchronized void setGrantedAuthorities(
    Set<GrantedAuthority> grantedAuthorities) {
        /* Used only for persistence */
    this.grantedAuthorities = grantedAuthorities;
  }

  public boolean isAccountNonExpired() {
    return this.accountNonExpired;
  }

  public boolean isAccountNonLocked() {
    return this.accountNonLocked;
  }

  public boolean isCredentialsNonExpired() {
    return this.credentialsNonExpired;
  }

  public boolean isEnabled() {
    return this.enabled;
  }

  @SuppressWarnings("unused")
  private void setAccountNonExpired(Boolean accountNonExpired) {
    this.accountNonExpired = accountNonExpired;
  }

  @SuppressWarnings("unused")
  private void setAccountNonLocked(Boolean accountNonLocked) {
    this.accountNonLocked = accountNonLocked;
  }

  @SuppressWarnings("unused")
  private void setCredentialsNonExpired(Boolean credentialsNonExpired) {
    this.credentialsNonExpired = credentialsNonExpired;
  }

  @SuppressWarnings("unused")
  private void setEnabled(Boolean enabled) {
    this.enabled = enabled;
  }

  @Override
  public int hashCode() {
    final int PRIME = 31;
    int result = 1;
    result = PRIME * result
      + ((this.username == null) ? 0 : this.username.hashCode());
    return result;
  }

  @Override
  public boolean equals(Object obj) {
    if (this == obj)
      return true;
    if (obj == null)
      return false;
    if (getClass() != obj.getClass())
      return false;
    final PersistentUserDetails other = (PersistentUserDetails) obj;
    if (this.username == null) {
      if (other.username != null)
        return false;
    } else if (!this.username.equals(other.username))
      return false;
    return true;
  }

  public String getEmailAddress() {
    if (emailAddress != null) {
      return emailAddress;
    } else {
      return "";
    }
  }

  public synchronized void addAuthority(GrantedAuthority authority) {
    if (this.grantedAuthorities == null)
      this.grantedAuthorities = new HashSet<GrantedAuthority>();
    this.grantedAuthorities.add(authority);
  }

  public synchronized void removeAuthority(GrantedAuthority authority) {
    if (this.grantedAuthorities != null && this.grantedAuthorities.contains(authority)) {
      this.grantedAuthorities.remove(authority);
    }
  }

  public boolean hasGrantedAuthority(String authority) {
    for (GrantedAuthority grantedAuthority : this.grantedAuthorities) {
      if (grantedAuthority.getAuthority().equals(authority)) {
        return true;
      }
    }
    return false;
  }

  public void setEnabled(boolean enabled) {
    this.enabled = enabled;
  }

  public void incrementNumberOfRecentFailedLoginAttempts() {
    this.numberOfRecentFailedLoginAttempts++;
  }

  @Override
  public String getFirstname() {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public void setFirstname(String firstname) {
    // TODO Auto-generated method stub
  }

  @Override
  public String getLastname() {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public void setLastname(String lastname) {
    // TODO Auto-generated method stub
  }

  @Override
  public Date getSignupdate() {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public void setSignupdate(Date signupdate) {
    // TODO Auto-generated method stub
  }

  @Override
  public HashMap<String, Object> getInfo() {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public String getCoreUsername() {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public String[] getUsernameSuffixes() {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public String getNextUsernameSuffix(String currentUsernameSuffix) {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public Integer getNumberOfLogins() {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public void setNumberOfLogins(Integer numberOfLogins) {
    // TODO Auto-generated method stub
  }

  @Override
  public void setLastLoginTime(Date lastLoginTime) {
    // TODO Auto-generated method stub
  }

  public String getLanguage() {
    return language != null ? language : "en";
  }

  public void setLanguage(String language) {
    this.language = language;
  }

  @Override
  public void incrementNumberOfLogins() {
    // TODO Auto-generated method stub
  }

  public void setResetPasswordVerificationCodeRequestTime(Date date) {
    this.resetPasswordVerificationCodeRequestTime = date;
  }

  public void clearResetPasswordVerificationCodeRequestTime() {
    this.resetPasswordVerificationCodeRequestTime = null;
  }

  public void setResetPasswordVerificationCode(String verificationCode) {
    this.resetPasswordVerificationCode = verificationCode;
  }

  public void clearResetPasswordVerificationCode() {
    this.resetPasswordVerificationCode = null;
  }

  public void setRecentFailedVerificationCodeAttemptTime(Date date) {
    this.recentFailedVerificationCodeAttemptTime = date;
  }

  public void clearRecentFailedVerificationCodeAttemptTime() {
    this.recentFailedVerificationCodeAttemptTime = null;
  }

  public void incrementNumberOfRecentFailedVerificationCodeAttempts() {
    if (this.numberOfRecentFailedVerificationCodeAttempts == null) {
      this.numberOfRecentFailedVerificationCodeAttempts = 0;
    }
    this.numberOfRecentFailedVerificationCodeAttempts++;
  }

  public void clearNumberOfRecentFailedVerificationCodeAttempts() {
    this.numberOfRecentFailedVerificationCodeAttempts = null;
  }

  public boolean isAdminUser() {
    return hasGrantedAuthority(UserDetailsService.ADMIN_ROLE);
  }

  public boolean isGoogleUser() {
    return this.googleUserId != null && !this.googleUserId.isEmpty();
  }
}
