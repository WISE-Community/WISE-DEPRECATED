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
package net.sf.sail.webapp.domain.authentication.impl;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.Version;

import net.sf.sail.webapp.domain.authentication.MutableAclTargetObject;

/**
 * Concrete implementation of <code>MutableAclTargetObject</code> marked with
 * EJB3 annotations for persistence.
 * 
 * @author Cynick Young
 * 
 * @version $Id$
 */
@Entity
@Table(name = PersistentAclTargetObject.DATA_STORE_NAME)
public class PersistentAclTargetObject implements MutableAclTargetObject {

    @Transient
    private static final long serialVersionUID = 1L;

    @Transient
    public static final String DATA_STORE_NAME = "acl_class";

    @Transient
    public static final String COLUMN_NAME_CLASSNAME = "class";

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Version
    @Column(name = "OPTLOCK")
    private Integer version = null;

    @Column(name = COLUMN_NAME_CLASSNAME, unique = true, nullable = false)
    private String classname;

    /**
     * @see net.sf.sail.webapp.domain.authentication.MutableAclTargetObject#getClassname()
     */
    public String getClassname() {
        return classname;
    }

    /**
     * @see net.sf.sail.webapp.domain.authentication.MutableAclTargetObject#setClassname(java.lang.String)
     */
    public void setClassname(String classname) {
        this.classname = classname;
    }

    /**
     * @see net.sf.sail.webapp.domain.Persistable#getId()
     */
    public Long getId() {
        return id;
    }

    /**
     * @param id
     *                the id to set
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
     *                the version to set
     */
    @SuppressWarnings("unused")
    private void setVersion(Integer version) {
        this.version = version;
    }

    /**
     * @see net.sf.sail.webapp.domain.authentication.MutableAclTargetObject#hashCode()
     */
    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result
                + ((classname == null) ? 0 : classname.hashCode());
        return result;
    }

    /**
     * @see net.sf.sail.webapp.domain.authentication.MutableAclTargetObject#equals(java.lang.Object)
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (getClass() != obj.getClass())
            return false;
        final PersistentAclTargetObject other = (PersistentAclTargetObject) obj;
        if (classname == null) {
            if (other.classname != null)
                return false;
        } else if (!classname.equals(other.classname))
            return false;
        return true;
    }
}