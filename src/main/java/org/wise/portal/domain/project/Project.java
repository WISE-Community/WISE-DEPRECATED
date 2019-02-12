/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
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

import org.wise.portal.domain.Persistable;
import org.wise.portal.domain.project.impl.ProjectType;
import org.wise.portal.domain.user.User;

import java.io.Serializable;
import java.util.Date;
import java.util.Set;

/**
 * A WISE Project domain object
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
   * @return The id of the project in the persistent data store
   */
  Serializable getId();

  /**
   * @return the familyTag
   */
  FamilyTag getFamilytag();

  /**
   * @param familytag the familyTag to set
   */
  void setFamilytag(FamilyTag familytag);

  /**
   * @return the projectInfo
   */
  ProjectInfo getProjectInfo();

  /**
   * @param projectInfo the projectInfo to set
   */
  void setProjectInfo(ProjectInfo projectInfo);

  /**
   * Indicates if the project is available to use in classrooms
   */
  boolean isCurrent();

  /**
   * @param isCurrent
   */
  void setCurrent(boolean isCurrent);

  Set<User> getSharedowners();

  void setSharedowners(Set<User> sharedowners);

  User getOwner();

  void setOwner(User owner);

  Set<User> getBookmarkers();

  void setBookmarkers(Set<User> bookmarkers);

  /**
   * @return the projectType
   */
  ProjectType getProjectType();

  /**
   * @param projectType the projectType to set
   */
  void setProjectType(ProjectType projectType);

  /**
   * @return the name of the project
   */
  String getName();

  /**
   * @param name the name to set
   */
  void setName(String name);

  /**
   * @return the modulePath of this project
   */
  String getModulePath();

  /**
   * @param modulePath the modulePath to set
   */
  void setModulePath(String modulePath);

  /**
   * Populates the projectInfo for this project.
   */
  void populateProjectInfo();

  /**
   * Visitor pattern, accepts ProjectVisitors
   * @param visitor
   */
  Object accept(ProjectVisitor visitor);

  ProjectMetadata getMetadataObj();

  /**
   * @return <code>ProjectMetadata</code>
   */
  ProjectMetadata getMetadata();

  /**
   * @param metadata
   */
  void setMetadata(ProjectMetadata metadata);

  /**
   * @param metadataJSONString
   */
  void setMetadata(String metadataJSONString);

  /**
   * @return <code>boolean</code> is public
   */
  boolean isPublic();

  /**
   * @param isPublic
   */
  void setPublic(boolean isPublic);

  /**
   * @return <code>Date</code> date created
   */
  Date getDateCreated();

  /**
   * @param datecreated
   */
  void setDateCreated(Date datecreated);

  /**
   * @return the tags
   */
  Set<Tag> getTags();

  /**
   * @param tags the tags to set
   */
  void setTags(Set<Tag> tags);

  /**
   * Returns true iff this project has at least all of the tags
   * specified.
   *
   * @param tagnames
   * @return
   */
  boolean hasTags(Set<String> tagnames);

  /**
   * Sets this project's parent project id where the project was copied from
   * if this is the original project, this value is null.
   *
   * @param parentProjectId
   */
  void setParentProjectId(Long parentProjectId);

  /**
   *
   * @return
   */
  Long getParentProjectId();

  /**
   * @param rootProjectId
   */
  void setRootProjectId(Long rootProjectId);

  /**
   * @return
   */
  Long getRootProjectId();

  /**
   * Whether this project is deleted
   * @return
   */
  boolean isDeleted();

  /**
   * Set whether this project is deleted
   * @param isDeleted
   */
  void setDeleted(boolean isDeleted);

  /**
   * Get the date the project was deleted
   * @return
   */
  Date getDateDeleted();

  /**
   * Set the date the project was deleted
   * @param dateDeleted
   */
  void setDateDeleted(Date dateDeleted);

  /**
   * Gets the maximum total asset size
   * @return
   */
  Long getMaxTotalAssetsSize();

  /**
   * Sets the maximum total asset size
   * @return
   */
  void setMaxTotalAssetsSize(Long maxTotalAssetsSize);

  /**
   * Returns the WISE version of this project [4, 5, etc]
   * @return integer representing WISE version
   */
  Integer getWiseVersion();

  /**
   * Sets the WISE version of this project [4, 5, etc]
   * @param wiseVersion integer representing WISE version
   */
  void setWISEVersion(Integer wiseVersion);

  boolean isOfficialProject();

  boolean isCommunityProject();

  boolean hasTag(String tag);
}
