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
package net.sf.sail.webapp.domain.annotation.impl;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.Version;

import net.sf.sail.emf.sailuserdata.EAnnotationBundle;
import net.sf.sail.emf.sailuserdata.util.AnnotationBundleLoader;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.annotation.AnnotationBundle;
import net.sf.sail.webapp.domain.impl.WorkgroupImpl;

/**
 * Domain Object that encapsulates the bundle and the workgroup that this
 * AnnotationBundle is for
 *
 * @author Hiroki Terashima
 * @author Laurel Williams
 * @version $ Id: $
 */
@Entity
@Table(name = AnnotationBundleImpl.DATA_STORE_NAME)
public class AnnotationBundleImpl implements AnnotationBundle {

    @Transient
    private static final long serialVersionUID = 1L;

    @Transient
    public static final String DATA_STORE_NAME = "annotationbundles";

    @Transient
    public static final String COLUMN_NAME_BUNDLE = "bundle";

    @Transient
    public static final String COLUMN_NAME_WORKGROUP_FK = "workgroup_fk";

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
	public Long id = null;

    @Version
    @Column(name = "OPTLOCK")
    private Integer version = null;

    @Lob
    @Column(name = AnnotationBundleImpl.COLUMN_NAME_BUNDLE, nullable = false, length = 2147483647)
    private String bundle = null;

    @OneToOne(cascade = CascadeType.ALL, targetEntity = WorkgroupImpl.class, fetch = FetchType.EAGER)
    @JoinColumn(name = COLUMN_NAME_WORKGROUP_FK, nullable = false)
    private Workgroup workgroup;
    
    @Transient
    private EAnnotationBundle eAnnotationBundle;

	/**
	 * @see net.sf.sail.webapp.domain.annotation.AnnotationBundle#getBundle()
	 */
	public String getBundle() {
		return bundle;
	}

	/**
	 * @see net.sf.sail.webapp.domain.annotation.AnnotationBundle#getWorkgroup()
	 */
	public Workgroup getWorkgroup() {
		return workgroup;
	}

	/**
	 * @see net.sf.sail.webapp.domain.annotation.AnnotationBundle#setBundle(java.lang.String)
	 */
	public void setBundle(String bundle) {
		this.bundle = bundle;
	}

	/**
	 * @see net.sf.sail.webapp.domain.annotation.AnnotationBundle#setWorkGroup(net.sf.sail.webapp.domain.Workgroup)
	 */
	public void setWorkgroup(Workgroup workgroup) {
		this.workgroup = workgroup;
	}
	
	/**
	 * @see net.sf.sail.webapp.domain.annotation.AnnotationBundle#getEAnnotationBundle()
	 */
	public EAnnotationBundle getEAnnotationBundle() {
		if (eAnnotationBundle == null) {
			this.eAnnotationBundle = AnnotationBundleLoader.loadAnnotationBundle(bundle);
		}
		return eAnnotationBundle;
	}
	
	/**
	 * @see net.sf.sail.webapp.domain.Persistable#getId()
	 */
	public Long getId() {
		return id;
	}

	/**
	 * @return the version
	 */
	public Integer getVersion() {
		return version;
	}

	/**
	 * @param version the version to set
	 */
	public void setVersion(Integer version) {
		this.version = version;
	}

	/**
	 * @param id the id to set
	 */
	public void setId(Long id) {
		this.id = id;
	}

	/**
	 * @see java.lang.Object#hashCode()
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((bundle == null) ? 0 : bundle.hashCode());
		result = prime * result
				+ ((workgroup == null) ? 0 : workgroup.hashCode());
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
		final AnnotationBundleImpl other = (AnnotationBundleImpl) obj;
		if (bundle == null) {
			if (other.bundle != null)
				return false;
		} else if (!bundle.equals(other.bundle))
			return false;
		if (workgroup == null) {
			if (other.workgroup != null)
				return false;
		} else if (!workgroup.equals(other.workgroup))
			return false;
		return true;
	}
}
