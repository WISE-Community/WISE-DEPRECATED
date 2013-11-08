/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
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
package org.telscenter.sail.webapp.domain.project.impl;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;
import org.telscenter.sail.webapp.domain.project.ExternalProject;
import org.telscenter.sail.webapp.domain.project.ProjectCommunicator;
import org.telscenter.sail.webapp.domain.project.ProjectVisitor;

/**
 * Project stored in external locations. 
 * Each ExternalProject has a <code>ProjectCommunicator</code> that handles
 * communication for the project, such as retrieving/importing project.
 * 
 * @author Hiroki Terashima
 * @author Scott Cytacki
 * @version $Id$
 */
@Entity
@Table(name = ExternalProjectImpl.DATA_STORE_NAME)
public class ExternalProjectImpl extends ProjectImpl implements ExternalProject {

	@Transient
	public static final String DATA_STORE_NAME = "externalprojects";
	
	@Transient
	private static final long serialVersionUID = 1L;

	@Transient
	private static final String PROJECTCOMMUNICATOR_JOIN_COLUMN_NAME = "projectcommunicator_fk";

	@Transient
	private static final String EXTERNAL_ID_COLUMN_NAME = "external_id";
	
	@Column(name = EXTERNAL_ID_COLUMN_NAME)
	private Long externalId;
	
	@ManyToOne(targetEntity = ProjectCommunicatorImpl.class, fetch = FetchType.EAGER)
    @JoinColumn(name = PROJECTCOMMUNICATOR_JOIN_COLUMN_NAME, unique = false)
	private ProjectCommunicator projectCommunicator;

	/**
	 * @return the externalDIYId
	 */
	public Long getExternalId() {
		return externalId;
	}

	/**
	 * @return the projectCommunicator
	 */
	public ProjectCommunicator getProjectCommunicator() {
		return projectCommunicator;
	}

	/**
	 * @param projectCommunicator the projectCommunicator to set
	 */
	public void setProjectCommunicator(ProjectCommunicator projectCommunicator) {
		this.projectCommunicator = projectCommunicator;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.project.ExternalProject#launchPreview()
	 */
	public Object launchPreview() {
		return new ModelAndView(new RedirectView(projectCommunicator.getPreviewProjectUrl(this)));	
	}

	/**
	 * @param externalId the externalId to set
	 */
	public void setExternalId(Long externalId) {
		this.externalId = externalId;
	}
	
	/**
	 * @see org.telscenter.sail.webapp.domain.project.impl.ProjectImpl#populateProjectInfo()
	 */
	@Override
	public void populateProjectInfo() {
		this.projectinfo = new ProjectInfoImpl();
		this.projectinfo.setName(this.getName());
		this.projectinfo.setSubject("NOT SPECIFIED");
		this.projectinfo.setComment("NOT SPECIFIED");
		this.projectinfo.setAuthor("NOT SPECIFIED");
		this.projectinfo.setSource(this.projectCommunicator.getAddress());
	}

	/**
	 * Visitor Pattern
	 * @param visitor
	 */
	public Object accept(ProjectVisitor visitor) {
		return visitor.visit(this);
	}
}
