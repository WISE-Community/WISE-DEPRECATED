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

import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.Version;

import net.sf.sail.webapp.domain.Offering;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.domain.group.impl.PersistentGroup;
import net.sf.sail.webapp.domain.sds.SdsWorkgroup;

/**
 * @author Hiroki Terashima
 * @version $Id: User.java 231 2007-03-26 07:03:00Z hiroki $
 */
@Entity
@Table(name = WorkgroupImpl.DATA_STORE_NAME)
@Inheritance(strategy = InheritanceType.JOINED)
public class WorkgroupImpl implements Workgroup {

    @Transient
    public static final String DATA_STORE_NAME = "workgroups";

    @Transient
    public static final String COLUMN_NAME_SDS_WORKGROUP_FK = "sds_workgroup_fk";

    @Transient
    public static final String COLUMN_NAME_OFFERING_FK = "offering_fk";

    @Transient
    public static final String COLUMN_NAME_GROUP_FK = "group_fk";
    
    @Transient
    public static final String USERS_JOIN_COLUMN_NAME = "user_fk";

    @Transient
    public static final String WORKGROUPS_JOIN_COLUMN_NAME = "workgroup_fk";

    @Transient
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
	public Long id = null;

    @Version
    @Column(name = "OPTLOCK")
    private Integer version = null;

    @OneToOne(cascade = CascadeType.ALL, targetEntity = SdsWorkgroup.class, fetch = FetchType.LAZY)
    @JoinColumn(name = COLUMN_NAME_SDS_WORKGROUP_FK, unique = true)
    private SdsWorkgroup sdsWorkgroup;

    @OneToOne(targetEntity = OfferingImpl.class, fetch = FetchType.LAZY)
    @JoinColumn(name = COLUMN_NAME_OFFERING_FK, nullable = false)
    private Offering offering;

    @OneToOne(targetEntity = PersistentGroup.class, fetch = FetchType.LAZY)
    @JoinColumn(name = COLUMN_NAME_GROUP_FK, nullable = false)
    private Group group = new PersistentGroup();

    /**
     * @see net.sf.sail.webapp.domain.Workgroup#setSdsWorkgroup(net.sf.sail.webapp.domain.sds.SdsWorkgroup)
     */
    public void setSdsWorkgroup(SdsWorkgroup sdsWorkgroup) {
        this.sdsWorkgroup = sdsWorkgroup;
    }

    /**
     * @see net.sf.sail.webapp.domain.Workgroup#getSdsWorkgroup()
     */
    public SdsWorkgroup getSdsWorkgroup() {
        return sdsWorkgroup;
    }

    /**
     * @see net.sf.sail.webapp.domain.Workgroup#getMembers()
     */
    public Set<User> getMembers() {
        return this.group.getMembers();
    }

    /**
     * @see net.sf.sail.webapp.domain.Workgroup#addMember(net.sf.sail.webapp.domain.User)
     */
    public void addMember(User member) {
        this.group.addMember(member);
        this.group.setName(this.generateWorkgroupName());
    }
    
    /**
     * @see net.sf.sail.webapp.domain.Workgroup#removeMember(net.sf.sail.webapp.domain.User)
     */
    public void removeMember(User member) {
    	this.group.getMembers().remove(member);
    }

    /**
     * @see net.sf.sail.webapp.domain.Workgroup#setMembers(java.util.Set)
     */
    public void setMembers(Set<User> members) {
        this.group.setMembers(members);
    }
    
	/**
	 * @return the group
	 */
	public Group getGroup() {
		return group;
	}

	/**
	 * @param group the group to set
	 */
	public void setGroup(Group group) {
		this.group = group;
	}

    /**
     * @see net.sf.sail.webapp.domain.Workgroup#getOffering()
     */
    public Offering getOffering() {
        return offering;
    }

    /**
     * @see net.sf.sail.webapp.domain.Workgroup#setOffering(net.sf.sail.webapp.domain.Offering)
     */
    public void setOffering(Offering offering) {
        this.offering = offering;
    }

    /**
     * @return the id
     */
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
     * @see net.sf.sail.webapp.domain.Workgroup#generateWorkgroupName()
     */
	public String generateWorkgroupName() {
		String workgroupName = "";
		for (User member : group.getMembers()) {
			workgroupName += " " + member.getUserDetails().getUsername();
		}
		return workgroupName;
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
		result = prime * result + ((group == null) ? 0 : group.hashCode());
		result = prime * result
				+ ((offering == null) ? 0 : offering.hashCode());
		result = prime * result
				+ ((sdsWorkgroup == null) ? 0 : sdsWorkgroup.hashCode());
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
		final WorkgroupImpl other = (WorkgroupImpl) obj;
		if (group == null) {
			if (other.group != null)
				return false;
		} else if (!group.equals(other.group))
			return false;
		if (offering == null) {
			if (other.offering != null)
				return false;
		} else if (!offering.equals(other.offering))
			return false;
		if (sdsWorkgroup == null) {
			if (other.sdsWorkgroup != null)
				return false;
		} else if (!sdsWorkgroup.equals(other.sdsWorkgroup))
			return false;
		return true;
	}

}