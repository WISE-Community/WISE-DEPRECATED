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

import net.sf.sail.webapp.domain.Jnlp;
import net.sf.sail.webapp.domain.sds.SdsJnlp;

/**
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
@Entity
@Table(name = JnlpImpl.DATA_STORE_NAME)
public class JnlpImpl implements Jnlp {

    @Transient
    private static final long serialVersionUID = 1L;

    @Transient
    public static final String DATA_STORE_NAME = "jnlps";

    @Transient
    public static final String COLUMN_NAME_SDS_JNLP_FK = "sds_jnlp_fk";

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id = null;

    @Version
    @Column(name = "OPTLOCK")
    private Integer version = null;

    @OneToOne(cascade = CascadeType.ALL, targetEntity = SdsJnlp.class)
    @JoinColumn(name = COLUMN_NAME_SDS_JNLP_FK, nullable = true, unique = true)
    private SdsJnlp sdsJnlp;

    /**
     * @see net.sf.sail.webapp.domain.Jnlp#getSdsJnlp()
     */
    public SdsJnlp getSdsJnlp() {
        return this.sdsJnlp;
    }

    /**
     * @see net.sf.sail.webapp.domain.Jnlp#setSdsJnlp(net.sf.sail.webapp.domain.sds.SdsJnlp)
     */
    public void setSdsJnlp(SdsJnlp sdsJnlp) {
        this.sdsJnlp = sdsJnlp;
    }

    public Long getId() {
        return this.id;
    }

    @SuppressWarnings("unused")
    private void setId(Long id) {
        this.id = id;
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
                + ((this.sdsJnlp == null) ? 0 : this.sdsJnlp.hashCode());
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
        final JnlpImpl other = (JnlpImpl) obj;
        if (this.sdsJnlp == null) {
            if (other.sdsJnlp != null)
                return false;
        } else if (!this.sdsJnlp.equals(other.sdsJnlp))
            return false;
        return true;
    }
    
}