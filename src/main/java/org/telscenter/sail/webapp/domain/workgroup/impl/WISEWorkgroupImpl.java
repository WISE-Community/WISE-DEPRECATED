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
package org.telscenter.sail.webapp.domain.workgroup.impl;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import org.telscenter.sail.webapp.domain.workgroup.WISEWorkgroup;

import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.domain.group.impl.PersistentGroup;

/**
 * A WISE Workgroup object implementation
 *
 * @author Hiroki Terashima
 * @version $Id$
 */
@Entity
@Table(name = WISEWorkgroupImpl.DATA_STORE_NAME)
public class WISEWorkgroupImpl extends net.sf.sail.webapp.domain.impl.WorkgroupImpl
		implements WISEWorkgroup, Comparable<WISEWorkgroupImpl> {

	@Transient
	private static final long serialVersionUID = 1L;

    @Transient
    public static final String DATA_STORE_NAME = "wiseworkgroups";

	@Transient
	private static final String COLUMN_NAME_PERIOD_FK = "period";

	@Transient
	private static final String COLUMN_NAME_EXTERNAL_ID = "externalId";

	@Transient
	private static final String COLUMN_NAME_IS_TEACHERWORKGROUP = "is_teacher_workgroup";
	
	@Column(name = COLUMN_NAME_EXTERNAL_ID)
	private Long externalId;
	
    @OneToOne(targetEntity = PersistentGroup.class, fetch = FetchType.LAZY)
    @JoinColumn(name = COLUMN_NAME_PERIOD_FK)
	private Group period;
    
    @Column(name = COLUMN_NAME_IS_TEACHERWORKGROUP)
    private boolean teacherWorkgroup;
    
    @Transient
    private String workPDFUrl;
	
	/**
	 * @see org.telscenter.sail.webapp.domain.workgroup.impl.Workgroup#getPeriod()
	 */
	public Group getPeriod() {
		return period;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.workgroup.impl.Workgroup#setPeriod(net.sf.sail.webapp.domain.group.Group)
	 */
	public void setPeriod(Group period) {
		this.period = period;
	}

	public int compareTo(WISEWorkgroupImpl o) {
		return this.id.compareTo(o.id);
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.workgroup.WISEWorkgroup#getStudentWorkPDFUrl()
	 */
	public String getWorkPDFUrl() {
		return this.workPDFUrl;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.workgroup.WISEWorkgroup#setStudentWorkPDFUrl(java.lang.String)
	 */
	public void setWorkPDFUrl(String url) {
		this.workPDFUrl = url;
	}

	/**
	 * @return the externalId
	 */
	public Long getExternalId() {
		return externalId;
	}

	/**
	 * @param externalId the externalId to set
	 */
	public void setExternalId(Long externalId) {
		this.externalId = externalId;
	}

	/**
	 * @return the teacherWorkgroup
	 */
	public boolean isTeacherWorkgroup() {
		return teacherWorkgroup;
	}

	/**
	 * @param teacherWorkgroup the teacherWorkgroup to set
	 */
	public void setTeacherWorkgroup(boolean teacherWorkgroup) {
		this.teacherWorkgroup = teacherWorkgroup;
	}
}
