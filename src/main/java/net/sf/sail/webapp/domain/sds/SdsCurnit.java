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

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.Version;

/**
 * Represents a curnit from the Sail Data Service (SDS).
 * 
 * @author Laurel Williams
 * 
 * @version $Id$
 */
@Entity
@Table(name = SdsCurnit.DATA_STORE_NAME)
public class SdsCurnit implements SdsObject {

    @Transient
    public static final String DATA_STORE_NAME = "sds_curnits";

    @Transient
    public static final String COLUMN_NAME_CURNIT_ID = "curnit_id";

    @Transient
    public static final String COLUMN_NAME_CURNIT_NAME = "name";

    @Transient
    public static final String COLUMN_NAME_CURNIT_URL = "url";

    @Transient
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id = null;

    @Version
    @Column(name = "OPTLOCK")
    private Integer version = null;

    @Column(name = SdsCurnit.COLUMN_NAME_CURNIT_ID, unique = true, nullable = false)
    private Long sdsObjectId = null;

    @Column(name = SdsCurnit.COLUMN_NAME_CURNIT_NAME, nullable = false)
    private String name;

    @Column(name = SdsCurnit.COLUMN_NAME_CURNIT_URL, nullable = false)
    private String url;

    /**
     * @return the name
     */
    public String getName() {
        return name;
    }

    /**
     * @param name
     *            the name to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * @return the url
     */
    public String getUrl() {
        return url;
    }

    /**
     * @param url
     *            the url to set
     */
    public void setUrl(String url) {
        this.url = url;
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
    public void setSdsObjectId(Long id) {
        this.sdsObjectId = id;
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
        final int PRIME = 31;
        int result = 1;
        result = PRIME * result + ((name == null) ? 0 : name.hashCode());
        result = PRIME * result
                + ((sdsObjectId == null) ? 0 : sdsObjectId.hashCode());
        result = PRIME * result + ((url == null) ? 0 : url.hashCode());
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
        final SdsCurnit other = (SdsCurnit) obj;
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
        if (url == null) {
            if (other.url != null)
                return false;
        } else if (!url.equals(other.url))
            return false;
        return true;
    }

}
