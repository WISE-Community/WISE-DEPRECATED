/**
 * Copyright (c) 2008-2015 Regents of the University of California (Regents). 
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
package org.wise.portal.domain.project;

import java.io.Serializable;
import java.util.Date;
import java.util.Set;

import org.wise.portal.domain.Persistable;
import org.wise.portal.domain.module.Curnit;
import org.wise.portal.domain.project.impl.ProjectType;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;

/**
 * A WISE Project domain object
 * 
 * A Project has all of the data needed to set up an <code>Offering</code>, 
 * or in WISE terms, <code>Run</code>.
 * 
 * A Project can be launched, which means that the <code>Curnit</code>
 * can be rendered to the user using <code>Jnlp</code>.
 * 
 * To launch a project as a student, you need
 * -- to have set up a run (a teacher would do this)
 * -- to have registered to that run (using projectcode)
 * -- to be in a workgroup for the run
 *
 * @author Hiroki Terashima
 */
public interface Project extends Persistable {
	
	/**
	 * Set the <code>Curnit</code> of this project
	 * @param Curnit
	 */
	public void setCurnit(Curnit curnit);

	/**
	 * Get the <code>Curnit</code> of this project
	 * @return Curnit
	 */
	public Curnit getCurnit();
	
	/**
	 * Get the <code>Run</code> that will be used to preview
	 * this project
	 * @return
	 */
	public Run getPreviewRun();
	
	/**
	 * Set the <code>Run</code> that will be used to
	 * preview this project
	 * @param run
	 */
	public void setPreviewRun(Run run);

	/**
	 * @return The id of the project in the persistent data store
	 */
	public Serializable getId();
	
	/**
	 * @return the familyTag
	 */
	public FamilyTag getFamilytag();

	/**
	 * @param familyTag the familyTag to set
	 */
	public void setFamilytag(FamilyTag familytag);

	/**
	 * @return the projectInfo
	 */
	public ProjectInfo getProjectInfo();

	/**
	 * @param projectInfoTag the projectInfoTag to set
	 */
	public void setProjectInfo(ProjectInfo projectInfo);
	
	/**
	 * Indicates if the project is available to use in classrooms
	 */
	public boolean isCurrent();
	
	/**
	 * @param isCurrent
	 */
	public void setCurrent(boolean isCurrent);
	
	public Set<User> getSharedowners();

	public void setSharedowners(Set<User> sharedowners);
	
	public User getOwner();

	public void setOwner(User owner);
	
	public Set<User> getBookmarkers();
	
	public void setBookmarkers(Set<User> bookmarkers);
	
	/**
	 * @return the projectType
	 */
	public ProjectType getProjectType();

	/**
	 * @param projectType the projectType to set
	 */
	public void setProjectType(ProjectType projectType);
	
	/**
	 * @return the name
	 */
	public String getName();

	/**
	 * @param name the name to set
	 */
	public void setName(String name);

	/**
	 * Populates the projectInfo for this project.
	 */
	public void populateProjectInfo();
	
	/**
	 * Visitor pattern, accepts ProjectVisitors
	 * @param visitor
	 */
	Object accept(ProjectVisitor visitor);
	
	/**
	 * @return <code>ProjectMetadata</code>
	 */
	public ProjectMetadata getMetadata();
	
	/**
	 * @param <code>ProjectMetadata</code> data
	 */
	public void setMetadata(ProjectMetadata data);
	
	/**
	 * @return <code>boolean</code> is public
	 */
	public boolean isPublic();
	
	/**
	 * @param <code>boolean</code> isPublic
	 */
	public void setPublic(boolean isPublic);
	
	/**
	 * @return <code>Date</code> date created
	 */
	public Date getDateCreated();
	
	/**
	 * @param <code>Date</code> date created
	 */
	public void setDateCreated(Date datecreated);
	
	/**
	 * @return the tags
	 */
	public Set<Tag> getTags();
	
	/**
	 * @param tags the tags to set
	 */
	public void setTags(Set<Tag> tags);
	
	/**
	 * Returns true iff this project has at least all of the tags
	 * specified.
	 * 
	 * @param tagnames
	 * @return
	 */
	public boolean hasTags(Set<String> tagnames);

	/**
	 * Sets this project's parent project id where the project was copied from
	 * if this is the original project, this value is null.
	 * 
	 * @param parentProjectId
	 */
	public void setParentProjectId(Long parentProjectId);
	
	/**
	 * 
	 * @return
	 */
	public Long getParentProjectId();
	
	/**
	 * 
	 * @param rootProjectId
	 */
	public void setRootProjectId(Long rootProjectId);
	
	/**
	 * 
	 * @return
	 */
	public Long getRootProjectId();
	
	/**
	 * Whether this project is deleted
	 * @return
	 */
	public boolean isDeleted();

	/**
	 * Set whether this project is deleted
	 * @param isDeleted
	 */
	public void setDeleted(boolean isDeleted);

	/**
	 * Get the date the project was deleted
	 * @return
	 */
	public Date getDateDeleted();

	/**
	 * Set the date the project was deleted
	 * @param dateDeleted
	 */
	public void setDateDeleted(Date dateDeleted);
	
	/**
	 * Gets the maximum total asset size
	 * @return
	 */
	public Long getMaxTotalAssetsSize();
	
	/**
	 * Sets the maximum total asset size
	 * @return
	 */
	public void setMaxTotalAssetsSize(Long maxTotalAssetsSize);
	
	/**
	 * Returns the WISE version of this project [4, 5, etc]
	 * @return integer representing WISE version
	 */
	public Integer getWiseVersion();
	
	/**
	 * Sets the WISE version of this project [4, 5, etc]
	 * @param wiseVersion integer representing WISE version
	 */
	public void setWISEVersion(Integer wiseVersion);
}
