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
package org.telscenter.sail.webapp.domain.impl;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

import net.sf.sail.webapp.domain.User;

import org.telscenter.sail.webapp.domain.project.ProjectMetadata;
import org.telscenter.sail.webapp.domain.project.impl.ProjectType;

/**
 * Represents the parameters required to create a WISE Project.
 *
 * @author Hiroki Terashima
 * @version $Id$
 */
public class ProjectParameters implements Serializable {
	
	private static final long serialVersionUID = 1L;
	
	public static String FIELD_CURNITID = "curnitId";
	
	public static String FIELD_JNLPID = "jnlpId";

	private String projectname;
	
	private Long curnitId;
	
	private Long jnlpId;
	
	private Long parentProjectId;

	private ProjectType projectType;
	
	private Set<User> owners = new HashSet<User>();
	
	private ProjectMetadata metadata;
	
	private Long rootProjectId;
	
	
	/**
	 * @return the curnitId
	 */
	public Long getCurnitId() {
		return curnitId;
	}

	/**
	 * @param curnitId the curnitId to set
	 */
	public void setCurnitId(Long curnitId) {
		this.curnitId = curnitId;
	}

	/**
	 * @return the jnlpId
	 */
	public Long getJnlpId() {
		return jnlpId;
	}

	/**
	 * @param jnlpId the jnlpId to set
	 */
	public void setJnlpId(Long jnlpId) {
		this.jnlpId = jnlpId;
	}

	/**
	 * @return the projectType
	 */
	public ProjectType getProjectType() {
		return projectType;
	}

	/**
	 * @param projectType the projectType to set
	 */
	public void setProjectType(ProjectType projectType) {
		this.projectType = projectType;
	}

	/**
	 * @return the projectname
	 */
	public String getProjectname() {
		return projectname;
	}

	/**
	 * @param projectname the projectname to set
	 */
	public void setProjectname(String projectname) {
		this.projectname = projectname;
	}

	/**
	 * @return the owners
	 */
	public Set<User> getOwners() {
		return owners;
	}

	/**
	 * @param owners the owners to set
	 */
	public void setOwners(Set<User> owners) {
		this.owners = owners;
	}

	/**
	 * @return <code>ProjectMetadata</code> the metadata to get
	 */
	public ProjectMetadata getMetadata() {
		return metadata;
	}

	/**
	 * @param <code>ProjectMetadata</code> the metadata to set
	 */
	public void setMetadata(ProjectMetadata metadata) {
		this.metadata = metadata;
	}

	/**
	 * @param parentProjectId
	 */
	public void setParentProjectId(Long parentProjectId) {
		this.parentProjectId = parentProjectId;
	}

	public Long getParentProjectId() {
		return this.parentProjectId;
	}

	public void setRootProjectId(Long rootProjectId) {
		this.rootProjectId = rootProjectId;
	}

	public Long getRootProjectId() {
		return rootProjectId;
	}
}
