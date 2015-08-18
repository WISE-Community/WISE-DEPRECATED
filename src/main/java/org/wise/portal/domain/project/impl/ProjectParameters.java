/**
 * Copyright (c) 2007-2015 Regents of the University of California (Regents).
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 * 
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 * 
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 * 
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 * 
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.domain.project.impl;

import java.io.Serializable;

import org.wise.portal.domain.project.ProjectMetadata;
import org.wise.portal.domain.user.User;

/**
 * Represents the parameters required to create a WISE Project.
 *
 * @author Hiroki Terashima
 */
public class ProjectParameters implements Serializable {
	
	private static final long serialVersionUID = 1L;
	
	private String projectname;
	
	private Long curnitId;
	
	private Long parentProjectId;

	private ProjectType projectType;
	
	private User owner;
	
	private ProjectMetadata metadata;
	
	private Long rootProjectId;

	private Integer wiseVersion;

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
	 * @return the owner
	 */
	public User getOwner() {
		return owner;
	}

	/**
	 * @param owners the owner to set
	 */
	public void setOwner(User owner) {
		this.owner = owner;
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

	public void setWiseVersion(Integer wiseVersion) {
		this.wiseVersion = wiseVersion;
	}

	public Integer getWiseVersion() {
		return wiseVersion;
	}
}
