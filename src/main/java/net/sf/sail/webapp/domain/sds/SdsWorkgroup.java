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
package net.sf.sail.webapp.domain.sds;

import java.util.HashSet;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.Lob;
import javax.persistence.ManyToMany;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.Version;

/**
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
@Entity
@Table(name = SdsWorkgroup.DATA_STORE_NAME)
public class SdsWorkgroup implements SdsObject {

    @Transient
    public static final String DATA_STORE_NAME = "sds_workgroups";

    @Transient
    public static final String COLUMN_NAME_WORKGROUP_ID = "workgroup_id";

    @Transient
    public static final String COLUMN_NAME_WORKGROUP_NAME = "name";

    @Transient
    public static final String COLUMN_NAME_SDS_OFFERING_FK = "sds_offering_fk";
    
    @Transient
    public static final String COLUMN_NAME_SDS_SESSIONBUNDLE = "sds_sessionbundle";

    @Transient
    public static final String SDS_USERS_JOIN_TABLE_NAME = "sds_workgroups_related_to_sds_users";

    @Transient
    public static final String SDS_WORKGROUP_JOIN_COLUMN_NAME = "sds_workgroup_fk";

    @Transient
    public static final String SDS_USER_JOIN_COLUMN_NAME = "sds_user_fk";

    @Transient
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id = null;

    @Version
    @Column(name = "OPTLOCK")
    private Integer version = null;

    @Column(name = SdsWorkgroup.COLUMN_NAME_WORKGROUP_ID, unique = true, nullable = false)
    private Long sdsObjectId;

    @Column(name = SdsWorkgroup.COLUMN_NAME_WORKGROUP_NAME, nullable = false)
    private String name;

    @OneToOne(targetEntity = SdsOffering.class)
    @JoinColumn(name = SdsWorkgroup.COLUMN_NAME_SDS_OFFERING_FK, nullable = false)
    private SdsOffering sdsOffering;

    @ManyToMany(targetEntity = SdsUser.class, fetch = FetchType.EAGER)
    @JoinTable(name = SdsWorkgroup.SDS_USERS_JOIN_TABLE_NAME, joinColumns = { @JoinColumn(name = SDS_WORKGROUP_JOIN_COLUMN_NAME, nullable = false) }, inverseJoinColumns = @JoinColumn(name = SDS_USER_JOIN_COLUMN_NAME, nullable = false))
    private Set<SdsUser> members = new HashSet<SdsUser>();

    @Lob
    @Column(name=SdsWorkgroup.COLUMN_NAME_SDS_SESSIONBUNDLE, length = 2147483647) // Keep length to force it to use large field type
    private String sdsSessionBundle;

    /**
     * @return the name
     */
    public String getName() {
        return this.name;
    }

    /**
     * @param name
     *            the name to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * @see net.sf.sail.webapp.domain.sds.SdsObject#getSdsObjectId()
     */
    public Long getSdsObjectId() {
        return this.sdsObjectId;
    }

    /**
     * @see net.sf.sail.webapp.domain.sds.SdsObject#setSdsObjectId(java.lang.Long)
     */
    public void setSdsObjectId(Long sdsObjectId) {
        this.sdsObjectId = sdsObjectId;
    }

    /**
     * @return the sdsOffering
     */
    public SdsOffering getSdsOffering() {
        return this.sdsOffering;
    }

    /**
     * @param sdsOffering
     *            the sdsOffering to set
     */
    public void setSdsOffering(SdsOffering sdsOffering) {
        this.sdsOffering = sdsOffering;
    }

    /**
     * @return the members
     */
    public Set<SdsUser> getMembers() {
        return this.members;
    }

    /**
     * @param members
     *            the members to set
     */
    public void setMembers(Set<SdsUser> members) {
        this.members = members;
    }

    /**
     * Adds a single <code>SdsUser</code> to a set of workgroup members.
     * 
     * @param member
     *            to be added to the workgroup
     */
    public void addMember(SdsUser member) {
        this.members.add(member);
    }
    
    /**
     * Removes a single <code>SdsUser</code> from a set of workgroup members.
     * 
     * @param member
     *            to be removed from the workgroup
     */
    public void removeMember(SdsUser member) {
    	this.members.remove(member);
    }

    /**
     * @return the id
     */
    @SuppressWarnings("unused")
    private Long getId() {
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
		final int prime = 31;
		int result = 1;
		result = prime * result + ((members == null) ? 0 : members.hashCode());
		result = prime * result + ((name == null) ? 0 : name.hashCode());
		result = prime * result
				+ ((sdsObjectId == null) ? 0 : sdsObjectId.hashCode());
		result = prime * result
				+ ((sdsOffering == null) ? 0 : sdsOffering.hashCode());
		result = prime
				* result
				+ ((sdsSessionBundle == null) ? 0 : sdsSessionBundle.hashCode());
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
		final SdsWorkgroup other = (SdsWorkgroup) obj;
		if (members == null) {
			if (other.members != null)
				return false;
		} else if (!members.equals(other.members))
			return false;
		if (name == null) {
			if (other.name != null)
				return false;
		} else if (!name.equals(other.name))
			return false;
		if (sdsObjectId == null) {
			if (other.sdsObjectId != null)
				return false;
		} else if (!sdsObjectId.equals(other.sdsObjectId))
			return false;
		if (sdsOffering == null) {
			if (other.sdsOffering != null)
				return false;
		} else if (!sdsOffering.equals(other.sdsOffering))
			return false;
		if (sdsSessionBundle == null) {
			if (other.sdsSessionBundle != null)
				return false;
		} else if (!sdsSessionBundle.equals(other.sdsSessionBundle))
			return false;
		return true;
	}

	/**
	 * @return the sdsSessionBundle
	 */
	public String getSdsSessionBundle() {
		return sdsSessionBundle;
	}

	/**
	 * @param sdsSessionBundle the sdsSessionBundle to set
	 */
	public void setSdsSessionBundle(String sdsSessionBundle) {
		this.sdsSessionBundle = sdsSessionBundle;
	}
}