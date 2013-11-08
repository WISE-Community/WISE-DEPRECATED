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
package net.sf.sail.webapp.domain.group.impl;

import java.util.HashSet;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.Version;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.domain.impl.UserImpl;

import org.hibernate.annotations.Cascade;

/**
 * This implementation of group
 * 
 * @author Cynick Young
 * 
 * @version $Id$
 */
@Entity
@Table(name = PersistentGroup.DATA_STORE_NAME)
public class PersistentGroup implements Group {

    @Transient
    public static final String DATA_STORE_NAME = "groups";

    @Transient
    public static final String USERS_JOIN_TABLE_NAME = "groups_related_to_users";

    @Transient
    public static final String COLUMN_NAME_NAME = "name";

    @Transient
    public static final String COLUMN_NAME_PARENT_FK = "parent_fk";

    @Transient
    public static final String USERS_JOIN_COLUMN_NAME = "user_fk";

    @Transient
    public static final String GROUPS_JOIN_COLUMN_NAME = "group_fk";

    @Transient
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id = null;

    @Version
    @Column(name = "OPTLOCK")
    private Integer version = null;

    @ManyToMany(targetEntity = UserImpl.class, fetch = FetchType.EAGER)
    @JoinTable(name = USERS_JOIN_TABLE_NAME, joinColumns = { @JoinColumn(name = GROUPS_JOIN_COLUMN_NAME, nullable = false) }, inverseJoinColumns = @JoinColumn(name = USERS_JOIN_COLUMN_NAME, nullable = false))
    private Set<User> members = new HashSet<User>();

    @Column(name = PersistentGroup.COLUMN_NAME_NAME, nullable = false)
    private String name;

    @ManyToOne(targetEntity = PersistentGroup.class, fetch = FetchType.EAGER, cascade = CascadeType.PERSIST)
    @Cascade( { org.hibernate.annotations.CascadeType.SAVE_UPDATE })
    @JoinColumn(name = COLUMN_NAME_PARENT_FK)
    private Group parent;

    /**
     * @see net.sf.sail.webapp.domain.group.Group#addMember(net.sf.sail.webapp.domain.User)
     */
    public void addMember(User member) {
        // TODO: LW & HT DISCUSS: WHY IS THIS IF CASE NEEDED? IT'S USING A SET
        if (this.members.contains(member)) {
            return;
        }
        this.members.add(member);
    }

    /**
     * @see net.sf.sail.webapp.domain.group.Group#removeMember(net.sf.sail.webapp.domain.User)
     */
	public void removeMember(User member) {
		this.members.remove(member);
	}

    /**
     * @see net.sf.sail.webapp.domain.group.Group#getMembers()
     */
    public Set<User> getMembers() {
        return this.members;
    }

    /**
     * @see net.sf.sail.webapp.domain.group.Group#setMembers(java.util.List)
     */
    public void setMembers(Set<User> members) {
        this.members = members;
    }

    /**
     * @see net.sf.sail.webapp.domain.group.Group#getId()
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
     * @see net.sf.sail.webapp.domain.group.Group#getName()
     */
    public String getName() {
        return name;
    }

    /**
     * @see net.sf.sail.webapp.domain.group.Group#setName(java.lang.String)
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * @see net.sf.sail.webapp.domain.group.Group#getParent()
     */
    public Group getParent() {
        return parent;
    }

    /**
     * @see net.sf.sail.webapp.domain.group.Group#setParent(net.sf.sail.webapp.domain.group.Group)
     */
    public void setParent(Group parent) {
        this.parent = parent;
    }

    /**
     * @see java.lang.Object#hashCode()
     */
    @Override
    public int hashCode() {
        final int PRIME = 31;
        int result = 1;
        result = PRIME * result + ((name == null) ? 0 : name.hashCode());
        result = PRIME * result + ((parent == null) ? 0 : parent.hashCode());
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
        final PersistentGroup other = (PersistentGroup) obj;
        if (name == null) {
            if (other.name != null)
                return false;
        } else if (!name.equals(other.name))
            return false;
        if (parent == null) {
            if (other.parent != null)
                return false;
        } else if (!parent.equals(other.parent))
            return false;
        return true;
    }

	public int compareTo(Group o) {
		try {
  		   return Integer.valueOf(this.getName()).compareTo(Integer.valueOf(o.getName()));
		} catch (NumberFormatException e) {
			return this.getName().compareTo(o.getName());
		}
	}
}