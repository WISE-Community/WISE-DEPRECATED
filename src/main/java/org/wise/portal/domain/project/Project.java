/**
 * Copyright (c) 2008-2019 Regents of the University of California (Regents).
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
import org.wise.portal.domain.Tag;
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

  Serializable getId();

  void setId(Long id);

  FamilyTag getFamilytag();

  void setFamilytag(FamilyTag familytag);

  ProjectInfo getProjectInfo();

  void setProjectInfo(ProjectInfo projectInfo);

  boolean isCurrent();

  void setCurrent(boolean isCurrent);

  Set<User> getSharedowners();

  void setSharedowners(Set<User> sharedowners);

  User getOwner();

  void setOwner(User owner);

  Set<User> getBookmarkers();

  void setBookmarkers(Set<User> bookmarkers);

  ProjectType getProjectType();

  void setProjectType(ProjectType projectType);

  String getName();

  void setName(String name);

  String getModulePath();

  void setModulePath(String modulePath);

  void populateProjectInfo();

  Object accept(ProjectVisitor visitor);

  ProjectMetadata getMetadataObj();

  ProjectMetadata getMetadata();

  void setMetadata(ProjectMetadata metadata);

  void setMetadata(String metadataJSONString);

  boolean isPublic();

  void setPublic(boolean isPublic);

  Date getDateCreated();

  void setDateCreated(Date datecreated);

  Set<Tag> getTags();

  void setTags(Set<Tag> tags);

  /**
   * @param tagnames all the tags to check
   * @return true iff this project has at least all of the tags specified
   */
  boolean hasTags(Set<String> tagnames);

  /**
   * Sets this project's parent project id where the project was copied from
   * if this is the original project, this value is null.
   *
   * @param parentProjectId id of this project's parent
   */
  void setParentProjectId(Long parentProjectId);

  Long getParentProjectId();

  void setRootProjectId(Long rootProjectId);

  Long getRootProjectId();

  boolean isDeleted();

  void setDeleted(boolean isDeleted);

  Date getDateDeleted();

  void setDateDeleted(Date dateDeleted);

  Long getMaxTotalAssetsSize();

  void setMaxTotalAssetsSize(Long maxTotalAssetsSize);

  Integer getWiseVersion();

  void setWISEVersion(Integer wiseVersion);

  boolean isOfficialProject();

  boolean isCommunityProject();

  boolean hasTag(String tag);

  boolean isSharedTeacher(User user);
}
