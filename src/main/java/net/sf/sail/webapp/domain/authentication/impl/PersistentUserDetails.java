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
package net.sf.sail.webapp.domain.authentication.impl;

import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
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

import org.springframework.security.core.GrantedAuthority;

import net.sf.sail.webapp.domain.authentication.MutableUserDetails;

/**
 * Implementation class of <code>MutableUserDetails</code> that uses an EJB3
 * compliant object persistence mechanism.
 * 
 * @author Cynick Young
 * @author Laurel Williams
 * 
 * @version $Id$
 * 
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
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id = null;

    @Version
    @Column(name = "OPTLOCK")
    private Integer version = null;

    // EJB3 spec annotations require the use of a java <code>Collection</code>.
    // However, Acegi Security deals with an array. There are internal methods
    // to convert to and from the different data structures.
    @ManyToMany(targetEntity = net.sf.sail.webapp.domain.authentication.impl.PersistentGrantedAuthority.class, fetch = FetchType.EAGER)
    @JoinTable(name = PersistentUserDetails.GRANTED_AUTHORITY_JOIN_TABLE_NAME, joinColumns = { @JoinColumn(name = USER_DETAILS_JOIN_COLUMN_NAME, nullable = false) }, inverseJoinColumns = @JoinColumn(name = GRANTED_AUTHORITY_JOIN_COLUMN_NAME, nullable = false))
    private Set<GrantedAuthority> grantedAuthorities = null;

    @Column(name = PersistentUserDetails.COLUMN_NAME_PASSWORD, nullable = false)
    private String password = null;

    @Column(name = PersistentUserDetails.COLUMN_NAME_USERNAME, unique = true, nullable = false)
    private String username = null;

    @Column(name = PersistentUserDetails.COLUMN_NAME_EMAIL_ADDRESS, nullable = true)
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
    private Date recentFailedLoginTime = null;
    
    @Column(name = PersistentUserDetails.COLUMN_NAME_RECENT_NUMBER_FAILED_LOGINS, nullable = true)
    private Integer numberOfRecentFailedLoginAttempts = 0;

    @Column(name = PersistentUserDetails.COLUMN_NAME_REST_PASSWORD_KEY, nullable = true)
    private String resetPasswordKey = null;
    
    @Column(name = PersistentUserDetails.COLUMN_NAME_RESET_PASSWORD_REQUEST_TIME, nullable = true)
    private Date resetPasswordRequestTime = null;
    
    public Long getId() {
        return id;
    }

    @SuppressWarnings("unused")
    private void setId(Long id) {
        this.id = id;
    }

    /**
     * @return the version
     */
    @SuppressWarnings("unused")
    private Integer getVersion() {
        return version;
    }

    /**
     * @param version
     *            the version to set
     */
    @SuppressWarnings("unused")
    private void setVersion(Integer version) {
        this.version = version;
    }

    /**
     * @see net.sf.sail.webapp.domain.authentication.MutableUserDetails#setPassword(java.lang.String)
     */
    public void setPassword(String password) {
        this.password = password;
    }

    /**
     * @see net.sf.sail.webapp.domain.authentication.MutableUserDetails#setUsername(java.lang.String)
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * @see org.acegisecurity.userdetails.UserDetails#getAuthorities()
     */
    @Transient
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Used by Acegi Security. This implements the required method from
        // Acegi Security. This implementation does not obtain the values
        // directly from the data store.
        return this.getGrantedAuthorities();
    }

    /**
     * @see net.sf.sail.webapp.domain.authentication.MutableUserDetails#setAuthorities(org.acegisecurity.GrantedAuthority[])
     */
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

    /**
     * @see org.acegisecurity.userdetails.UserDetails#getPassword()
     */
    public String getPassword() {
        return this.password;
    }

    /**
     * @see org.acegisecurity.userdetails.UserDetails#getUsername()
     */
    public String getUsername() {
        return this.username;
    }

    /**
     * @see org.acegisecurity.userdetails.UserDetails#isAccountNonExpired()
     */
    public boolean isAccountNonExpired() {
        return this.accountNonExpired;
    }

    /**
     * @see org.acegisecurity.userdetails.UserDetails#isAccountNonLocked()
     */
    public boolean isAccountNonLocked() {
        return this.accountNonLocked;
    }

    /**
     * @see org.acegisecurity.userdetails.UserDetails#isCredentialsNonExpired()
     */
    public boolean isCredentialsNonExpired() {
        return this.credentialsNonExpired;
    }

    /**
     * @see org.acegisecurity.userdetails.UserDetails#isEnabled()
     */
    public boolean isEnabled() {
        return this.enabled;
    }

    /**
     * @param accountNonExpired
     *            the accountNonExpired to set
     */
    @SuppressWarnings("unused")
    private void setAccountNonExpired(Boolean accountNonExpired) {
        this.accountNonExpired = accountNonExpired;
    }

    /**
     * @param accountNonLocked
     *            the accountNonLocked to set
     */
    @SuppressWarnings("unused")
    private void setAccountNonLocked(Boolean accountNonLocked) {
        this.accountNonLocked = accountNonLocked;
    }

    /**
     * @param credentialsNonExpired
     *            the credentialsNonExpired to set
     */
    @SuppressWarnings("unused")
    private void setCredentialsNonExpired(Boolean credentialsNonExpired) {
        this.credentialsNonExpired = credentialsNonExpired;
    }

    /**
     * @param enabled
     *            the enabled to set
     */
    @SuppressWarnings("unused")
    private void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    /**
     * @see java.lang.Object#hashCode()
     */
    @Override
    public int hashCode() {
        final int PRIME = 31;
        int result = 1;
        result = PRIME * result
                + ((this.username == null) ? 0 : this.username.hashCode());
        return result;
    }

    /**
     * @see java.lang.Object#equals(java.lang.Object)
     */
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

    /**
     * @see net.sf.sail.webapp.domain.authentication.MutableUserDetails#getEmailAddress()
     */
    public String getEmailAddress() {
        return emailAddress;
    }

    /**
     * @see net.sf.sail.webapp.domain.authentication.MutableUserDetails#setEmailAddress(java.lang.String)
     */
    public void setEmailAddress(String emailAddress) {
        this.emailAddress = emailAddress;
    }

    /**
     * @see net.sf.sail.webapp.domain.authentication.MutableUserDetails#addAuthority(org.acegisecurity.GrantedAuthority)
     */
    public synchronized void addAuthority(GrantedAuthority authority) {
        if (this.grantedAuthorities == null)
            this.grantedAuthorities = new HashSet<GrantedAuthority>();
        this.grantedAuthorities.add(authority);
    }

    /**
     * @see net.sf.sail.webapp.domain.authentication.MutableUserDetails#hasGrantedAuthority(java.lang.String)
     */
	public boolean hasGrantedAuthority(String authority) {
		for (GrantedAuthority grantedAuthority : this.grantedAuthorities) {
			if (grantedAuthority.getAuthority().equals(authority)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * @see net.sf.sail.webapp.domain.authentication.MutableUserDetails#setEnabled(boolean)
	 */
	public void setEnabled(boolean enabled) {
		this.enabled = enabled;
	}

	/**
	 * Get the recent failed login timestamp
	 * @return
	 */
	public Date getRecentFailedLoginTime() {
		return this.recentFailedLoginTime;
	}
	
	/**
	 * Set the recent failed login timestamp
	 * @param recentFailedLoginTime
	 */
	public void setRecentFailedLoginTime(Date recentFailedLoginTime) {
		this.recentFailedLoginTime = recentFailedLoginTime;
	}
	
	/**
	 * Get the number of recent failed login attempts
	 * @return
	 */
	public Integer getNumberOfRecentFailedLoginAttempts() {
		return this.numberOfRecentFailedLoginAttempts;
	}

	/**
	 * Set the number of recent failed login attempts
	 * @param numberOfFailedLoginAttempts
	 */
	public void setNumberOfRecentFailedLoginAttempts(Integer numberOfRecentFailedLoginAttempts) {
		this.numberOfRecentFailedLoginAttempts = numberOfRecentFailedLoginAttempts;
	}
	
	/**
	 * Increase the number of recent failed login attempts by 1
	 */
	public void incrementNumberOfRecentFailedLoginAttempts() {
		this.numberOfRecentFailedLoginAttempts++;
	}

	/**
	 * Set the password key
	 * @param passwordKey an alphanumeric string
	 */
	@Override
	public void setResetPasswordKey(String resetPasswordKey) {
		this.resetPasswordKey = resetPasswordKey;
	}

	/**
	 * Get the password key
	 * @return an alphanumeric string
	 */
	@Override
	public String getResetPasswordKey() {
		return this.resetPasswordKey;
	}

	/**
	 * Set the time the user requested a password reset
	 * @param resetPasswordRequestTime the time the user requested the password reset
	 */
	@Override
	public void setResetPasswordRequestTime(Date resetPasswordRequestTime) {
		this.resetPasswordRequestTime = resetPasswordRequestTime;
	}

	/**
	 * Get the time the user requested a password reset
	 * @return the time the user requested the password reset
	 */
	@Override
	public Date getResetPasswordRequestTime() {
		return this.resetPasswordRequestTime;
	}
}