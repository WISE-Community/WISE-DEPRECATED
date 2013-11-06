/**
 * Copyright (c) 2007 Encore Research Group, University of Toronto
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
package net.sf.sail.webapp.domain.impl;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.Version;

import org.telscenter.sail.webapp.service.authentication.UserDetailsService;

import net.sf.sail.core.service.impl.UserServiceImpl;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.authentication.MutableUserDetails;
import net.sf.sail.webapp.domain.authentication.impl.PersistentUserDetails;
import net.sf.sail.webapp.domain.sds.SdsUser;

/**
 * @author Laurel Williams
 * 
 * @version $Id$
 */
@Entity
@Table(name = UserImpl.DATA_STORE_NAME)
public class UserImpl implements User {

    @Transient
    public static final String DATA_STORE_NAME = "users";

    @Transient
    public static final String COLUMN_NAME_SDS_USER_FK = "sds_user_fk";

    @Transient
    public static final String COLUMN_NAME_USER_DETAILS_FK = "user_details_fk";

    @Transient
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id = null;

    @Version
    @Column(name = "OPTLOCK")
    private Integer version = null;

    @OneToOne(cascade = CascadeType.ALL, targetEntity = SdsUser.class)
    @JoinColumn(name = COLUMN_NAME_SDS_USER_FK, nullable = true, unique = true)
    private SdsUser sdsUser;

    @OneToOne(cascade = CascadeType.ALL, targetEntity = PersistentUserDetails.class)
    @JoinColumn(name = COLUMN_NAME_USER_DETAILS_FK, nullable = false, unique = true)
    private MutableUserDetails userDetails;

    /**
     * @see net.sf.sail.webapp.domain.User#getUserDetails()
     */
    public MutableUserDetails getUserDetails() {
        return userDetails;
    }

    /**
     * @see net.sf.sail.webapp.domain.User#setUserDetails(net.sf.sail.webapp.domain.authentication.MutableUserDetails)
     */
    public void setUserDetails(MutableUserDetails userDetails) {
        this.userDetails = userDetails;
    }

    /**
     * @see net.sf.sail.webapp.domain.User#getSdsUser()
     */
    public SdsUser getSdsUser() {
        return sdsUser;
    }

    /**
     * @see net.sf.sail.webapp.domain.User#setSdsUser(net.sf.sail.webapp.domain.sds.SdsUser)
     */
    public void setSdsUser(SdsUser sdsUser) {
        this.sdsUser = sdsUser;
    }

    /**
     * @see net.sf.sail.webapp.domain.User#isAdmin()
     */
    public boolean isAdmin(){
    	return this.userDetails.hasGrantedAuthority(UserDetailsService.ADMIN_ROLE);
    }
    
    /**
     * @return the id
     */
    @SuppressWarnings("unused")
    public Long getId() {
        return id;
    }

    /**
     * @param id
     *            the id to set
     */
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
     * @see java.lang.Object#hashCode()
     */
    @Override
    public int hashCode() {
        final int PRIME = 31;
        int result = 1;
        result = PRIME * result
                + ((this.sdsUser == null) ? 0 : this.sdsUser.hashCode());
        result = PRIME
                * result
                + ((this.userDetails == null) ? 0 : this.userDetails.hashCode());
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
        final UserImpl other = (UserImpl) obj;
        if (this.sdsUser == null) {
            if (other.sdsUser != null)
                return false;
        } else if (!this.sdsUser.equals(other.sdsUser))
            return false;
        if (this.userDetails == null) {
            if (other.userDetails != null)
                return false;
        } else if (!this.userDetails.equals(other.userDetails))
            return false;
        return true;
    }
}