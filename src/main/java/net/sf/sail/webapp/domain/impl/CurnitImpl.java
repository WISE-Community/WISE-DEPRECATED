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
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.Version;

import org.telscenter.sail.webapp.domain.impl.ModuleImpl;

import net.sf.sail.webapp.domain.Curnit;
import net.sf.sail.webapp.domain.CurnitVisitor;
import net.sf.sail.webapp.domain.sds.SdsCurnit;

/**
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
@Entity
@Table(name = CurnitImpl.DATA_STORE_NAME)
@Inheritance(strategy = InheritanceType.JOINED)
public class CurnitImpl implements Curnit {

    @Transient
    private static final long serialVersionUID = 1L;

    @Transient
    public static final String DATA_STORE_NAME = "curnits";

    @Transient
    public static final String COLUMN_NAME_SDS_CURNIT_FK = "sds_curnit_fk";

    @Transient
	private static final String COLUMN_NAME_NAME = "name";
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
	private Long id = null;

    @Version
    @Column(name = "OPTLOCK")
    private Integer version = null;

    @Column(name = COLUMN_NAME_NAME)
	private String name;

    @OneToOne(cascade = CascadeType.ALL, targetEntity = SdsCurnit.class)
    @JoinColumn(name = COLUMN_NAME_SDS_CURNIT_FK, nullable = true, unique = true)
    private SdsCurnit sdsCurnit;

    /**
     * @see net.sf.sail.webapp.domain.Curnit#getSdsCurnit()
     */
    public SdsCurnit getSdsCurnit() {
        return this.sdsCurnit;
    }

    /**
     * @see net.sf.sail.webapp.domain.Curnit#setSdsCurnit(net.sf.sail.webapp.domain.sds.SdsCurnit)
     */
    public void setSdsCurnit(SdsCurnit sdsCurnit) {
        this.sdsCurnit = sdsCurnit;
    }

    /**
     * @see net.sf.sail.webapp.domain.Curnit#getId()
     */
    public Long getId() {
        return this.id;
    }

    @SuppressWarnings("unused")
    private void setId(Long id) {
        this.id = id;
    }

    public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@SuppressWarnings("unused")
    private Integer getVersion() {
        return this.version;
    }

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
                + ((this.sdsCurnit == null) ? 0 : this.sdsCurnit.hashCode());
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
        final CurnitImpl other = (CurnitImpl) obj;
        if (this.sdsCurnit == null) {
            if (other.sdsCurnit != null)
                return false;
        } else if (!this.sdsCurnit.equals(other.sdsCurnit))
            return false;
        return true;
    }

    /**
     * @see net.sf.sail.webapp.domain.Curnit#accept(net.sf.sail.webapp.domain.CurnitVisitor)
     */
	public Object accept(CurnitVisitor visitor) {
		return visitor.visit(this);
	}
}