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
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.Version;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

/**
 * Represents an offering from the Sail Data Service (SDS).
 * 
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
@Entity
@Table(name = SdsOffering.DATA_STORE_NAME)
@OnDelete(action=OnDeleteAction.CASCADE)
public class SdsOffering implements SdsObject {

    @Transient
    public static final String DATA_STORE_NAME = "sds_offerings";

    @Transient
    public static final String COLUMN_NAME_OFFERING_ID = "offering_id";

    @Transient
    public static final String COLUMN_NAME_OFFERING_NAME = "name";

    @Transient
    public static final String COLUMN_NAME_SDS_CURNIT_FK = "sds_curnit_fk";

    @Transient
    public static final String COLUMN_NAME_SDS_JNLP_FK = "sds_jnlp_fk";
    
    @Transient
    public static final String COLUMN_NAME_SDS_CURNITMAP = "sds_curnitmap";

    @Transient
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id = null;

    @Version
    @Column(name = "OPTLOCK")
    private Integer version = null;

    @Column(name = SdsOffering.COLUMN_NAME_OFFERING_NAME, nullable = false)
    private String name;

    @OneToOne(targetEntity = SdsCurnit.class)
    @JoinColumn(name = SdsOffering.COLUMN_NAME_SDS_CURNIT_FK, nullable = false)
    private SdsCurnit sdsCurnit;

    @OneToOne(targetEntity = SdsJnlp.class)
    @JoinColumn(name = SdsOffering.COLUMN_NAME_SDS_JNLP_FK, nullable = false)
    private SdsJnlp sdsJnlp;

    @Column(name = SdsOffering.COLUMN_NAME_OFFERING_ID, unique = true, nullable = false)
    private Long sdsObjectId;

    @Lob
    @Column(name=SdsOffering.COLUMN_NAME_SDS_CURNITMAP, length = 2147483647) // Keep length to force it to use large field type 
    private String sdsCurnitMap;
    
    @Transient
    private String retrieveContentUrl;   // url where the otml is stored. set for OTrunk and POTrunk projects.
    
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
     * @return the name
     */
    public String getName() {
        return name;
    }

    /**
     * @return the sdsCurnit
     */
    public SdsCurnit getSdsCurnit() {
        return sdsCurnit;
    }

    /**
     * @param sdsCurnit
     *            the sdsCurnit to set
     */
    public void setSdsCurnit(SdsCurnit curnit) {
        this.sdsCurnit = curnit;
    }

    /**
     * @return the sdsJnlp
     */
    public SdsJnlp getSdsJnlp() {
        return sdsJnlp;
    }

    /**
     * @param sdsJnlp
     *            the sdsJnlp to set
     */
    public void setSdsJnlp(SdsJnlp jnlp) {
        this.sdsJnlp = jnlp;
    }

    /**
	 * @see java.lang.Object#hashCode()
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((name == null) ? 0 : name.hashCode());
		result = prime * result
				+ ((sdsCurnit == null) ? 0 : sdsCurnit.hashCode());
		result = prime * result
				+ ((sdsCurnitMap == null) ? 0 : sdsCurnitMap.hashCode());
		result = prime * result + ((sdsJnlp == null) ? 0 : sdsJnlp.hashCode());
		result = prime * result
				+ ((sdsObjectId == null) ? 0 : sdsObjectId.hashCode());
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
		final SdsOffering other = (SdsOffering) obj;
		if (name == null) {
			if (other.name != null)
				return false;
		} else if (!name.equals(other.name))
			return false;
		if (sdsCurnit == null) {
			if (other.sdsCurnit != null)
				return false;
		} else if (!sdsCurnit.equals(other.sdsCurnit))
			return false;
		if (sdsCurnitMap == null) {
			if (other.sdsCurnitMap != null)
				return false;
		} else if (!sdsCurnitMap.equals(other.sdsCurnitMap))
			return false;
		if (sdsJnlp == null) {
			if (other.sdsJnlp != null)
				return false;
		} else if (!sdsJnlp.equals(other.sdsJnlp))
			return false;
		if (sdsObjectId == null) {
			if (other.sdsObjectId != null)
				return false;
		} else if (!sdsObjectId.equals(other.sdsObjectId))
			return false;
		return true;
	}

	/**
	 * @return the sdsCurnitMap
	 */
	public String getSdsCurnitMap() {
		return sdsCurnitMap;
	}

	/**
	 * @param sdsCurnitMap the sdsCurnitMap to set
	 */
	public void setSdsCurnitMap(String sdsCurnitMap) {
		this.sdsCurnitMap = sdsCurnitMap;
	}

	/**
	 * @return the retrieveOtmlUrl
	 */
	public String getRetrieveContentUrl() {
		return retrieveContentUrl;
	}

	/**
	 * @param retrieveOtmlUrl the retrieveOtmlUrl to set
	 */
	public void setRetrieveContentUrl(String retrieveContentUrl) {
		this.retrieveContentUrl = retrieveContentUrl;
	}
}