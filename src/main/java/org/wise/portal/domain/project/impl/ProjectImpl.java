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
package org.wise.portal.domain.project.impl;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

import javax.persistence.*;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Cascade;
import org.json.JSONException;
import org.json.JSONObject;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.impl.TagImpl;
import org.wise.portal.domain.project.FamilyTag;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.ProjectInfo;
import org.wise.portal.domain.project.ProjectMetadata;
import org.wise.portal.domain.project.ProjectVisitor;
import org.wise.portal.domain.Tag;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;

/**
 * @author Hiroki Terashima
 */
@Entity
@Table(name = ProjectImpl.DATA_STORE_NAME)
@Inheritance(strategy = InheritanceType.JOINED)
public class ProjectImpl implements Project {

  @Transient
  private static final long serialVersionUID = 1L;

  @Transient
  public static final String SHARED_OWNERS_JOIN_COLUMN_NAME = "shared_owners_fk";

  @Transient
  public static final String SHARED_OWNERS_JOIN_TABLE_NAME = "projects_related_to_shared_owners";

  @Transient
  public static final String COLUMN_NAME_FAMILYTAG = "familytag";

  @Transient
  public static final String COLUMN_NAME_ISCURRENT = "iscurrent";

  @Transient
  public static final String DATA_STORE_NAME = "projects";

  @Transient
  public static final String COLUMN_NAME_PARENT_PROJECT_ID = "parentprojectid";

  @Transient
  private static final String COLUMN_NAME_PROJECTTYPE = "projecttype";

  @Transient
  private static final String COLUMN_NAME_PROJECT_NAME = "name";

  @Transient
  private static final String PROJECTS_JOIN_COLUMN_NAME = "projects_fk";

  @Transient
  private static final String BOOKMARKERS_JOIN_TABLE_NAME = "projects_related_to_bookmarkers";

  @Transient
  private static final String BOOKMARKERS_JOIN_COLUMN_NAME = "bookmarkers";

  @Transient
  private static final String ISPUBLIC_COLUMN_NAME = "ispublic";

  @Transient
  private static final String COLUMN_NAME_DATE_CREATED = "datecreated";

  @Transient
  private static final String TAGS_JOIN_TABLE_NAME = "projects_related_to_tags";

  @Transient
  private static final String TAGS_JOIN_COLUMN_NAME = "tag_fk";

  @Transient
  private static final String PROJECT_JOIN_COLUMN_NAME = "project_fk";

  @Transient
  private static final String COLUMN_NAME_IS_DELETED = "isDeleted";

  @Transient
  private static final String COLUMN_NAME_DATE_DELETED = "dateDeleted";

  @Transient
  private static final String COLUMN_NAME_MAX_TOTAL_ASSETS_SIZE = "maxTotalAssetsSize";

  @Transient
  private static final String COLUMN_NAME_WISE_VERSION = "wiseVersion";

  @Transient
  public ProjectInfo projectinfo = new ProjectInfoImpl();

  @Column(name = COLUMN_NAME_PROJECT_NAME, nullable = false)
  @Setter
  protected String name;

  @OneToOne(targetEntity = ProjectMetadataImpl.class, fetch = FetchType.LAZY)
  @Cascade( { org.hibernate.annotations.CascadeType.SAVE_UPDATE })
  @JoinColumn(name = "metadata_fk", nullable = true, unique = true)
  protected ProjectMetadata metadataObj = null;

  @Column(name = "metadata", length = 5120000, columnDefinition = "mediumtext")
  protected String metadata;

  @Column(name = "modulePath", nullable = false)
  @Getter
  @Setter
  protected String modulePath = "";

  @ManyToOne(targetEntity = UserImpl.class, fetch = FetchType.LAZY)
  @JoinColumn(name = "owner_fk", nullable = false, unique = false)
  @Getter
  @Setter
  private User owner;

  @ManyToMany(targetEntity = UserImpl.class, fetch = FetchType.LAZY)
  @JoinTable(name = SHARED_OWNERS_JOIN_TABLE_NAME, joinColumns = { @JoinColumn(name =  PROJECTS_JOIN_COLUMN_NAME, nullable = false) }, inverseJoinColumns = @JoinColumn(name = SHARED_OWNERS_JOIN_COLUMN_NAME, nullable = false))
  @Getter
  @Setter
  private Set<User> sharedowners = new TreeSet<User>();

  @ManyToMany(targetEntity = UserImpl.class, fetch = FetchType.LAZY)
  @JoinTable(name = BOOKMARKERS_JOIN_TABLE_NAME, joinColumns = { @JoinColumn(name= PROJECTS_JOIN_COLUMN_NAME, nullable = false) }, inverseJoinColumns = @JoinColumn(name = BOOKMARKERS_JOIN_COLUMN_NAME, nullable = false))
  @Getter
  @Setter
  private Set<User> bookmarkers = new TreeSet<User>();

  @Column(name = ProjectImpl.COLUMN_NAME_FAMILYTAG, nullable = true)
  protected FamilyTag familytag;

  @Column(name = ProjectImpl.COLUMN_NAME_ISCURRENT, nullable = true)
  @Getter
  protected boolean isCurrent;

  @Column(name = ProjectImpl.COLUMN_NAME_PROJECTTYPE, nullable = true)
  @Getter
  @Setter
  protected ProjectType projectType;

  @Column(name = ProjectImpl.COLUMN_NAME_PARENT_PROJECT_ID, nullable = true)
  @Getter
  @Setter
  private Long parentProjectId;

  @Transient
  private Project parentProject;

  @Transient
  @Getter
  @Setter
  private Long rootProjectId = null;

  @Id
  @Getter
  @Setter
  public Long id = null;

  @Version
  @Column(name = "OPTLOCK")
  @Getter
  @Setter
  protected Integer version = null;

  @Column(name = ProjectImpl.ISPUBLIC_COLUMN_NAME)
  @Getter
  protected boolean isPublic;

  @Column(name = ProjectImpl.COLUMN_NAME_DATE_CREATED, nullable = false)
  @Getter
  @Setter
  protected Date dateCreated;

  @ManyToMany(targetEntity = TagImpl.class, fetch = FetchType.LAZY)
  @JoinTable(name = TAGS_JOIN_TABLE_NAME, joinColumns = { @JoinColumn(name = PROJECT_JOIN_COLUMN_NAME, nullable = false) }, inverseJoinColumns = @JoinColumn(name = TAGS_JOIN_COLUMN_NAME, nullable = false))
  @Getter
  @Setter
  protected Set<Tag> tags = new TreeSet<Tag>();

  @Column(name = ProjectImpl.COLUMN_NAME_IS_DELETED, nullable = true)
  protected boolean isDeleted;

  @Column(name = ProjectImpl.COLUMN_NAME_DATE_DELETED, nullable = true)
  @Getter
  @Setter
  protected Date dateDeleted;

  @Column(name = ProjectImpl.COLUMN_NAME_MAX_TOTAL_ASSETS_SIZE, nullable = true)
  @Getter
  @Setter
  protected Long maxTotalAssetsSize;

  @Column(name = ProjectImpl.COLUMN_NAME_WISE_VERSION, nullable = true)
  protected Integer wiseVersion;

  @Override
  public int hashCode() {
    final int prime = 31;
    int result = 1;
    result = prime * result + ((modulePath == null) ? 0 : modulePath.hashCode());
    return result;
  }

  @Override
  public boolean equals(Object obj) {
    if (this == obj)
      return true;
    if (obj == null)
      return false;
    if (getClass() != obj.getClass())
      return false;
    final ProjectImpl other = (ProjectImpl) obj;
    if (modulePath == null) {
      if (other.modulePath != null)
        return false;
    } else if (!modulePath.equals(other.modulePath))
      return false;
    return true;
  }

  public FamilyTag getFamilytag() {
    return familytag;
  }

  public void setFamilytag(FamilyTag familytag) {
    this.familytag = familytag;
    this.projectinfo.setFamilyTag(familytag);
  }

  public void setCurrent(boolean isCurrent) {
    this.isCurrent = isCurrent;
    this.projectinfo.setCurrent(isCurrent);
  }

  public ProjectInfo getProjectInfo() {
    return projectinfo;
  }

  public void setProjectInfo(ProjectInfo projectInfo) {
    this.projectinfo = projectInfo;
    this.isCurrent = projectInfo.isCurrent();
    this.familytag = projectInfo.getFamilyTag();
  }

  public List<User> getSharedOwnersOrderedAlphabetically() {
    List<User> sharedOwnersList = new ArrayList<User>();
    sharedOwnersList.addAll(sharedowners);
    UserAlphabeticalComparator userAlphabeticalComparator = new UserAlphabeticalComparator();
    Collections.sort(sharedOwnersList, userAlphabeticalComparator);
    return sharedOwnersList;
  }

  public String getName() {
    if (name == null) {
      return "";
    }
    return name;
  }

  public void populateProjectInfo(){
    this.projectinfo = new ProjectInfoImpl();
    this.projectinfo.setName(this.getName());
  }

  public ProjectMetadata getMetadataObj() {
    return metadataObj;
  }

  public ProjectMetadata getMetadata() {
    ProjectMetadata metadata = new ProjectMetadataImpl();
    if (this.metadata != null) {
      try {
        JSONObject metadataJSONObject = new JSONObject(this.metadata);
        metadata.populateFromJSON(metadataJSONObject);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return metadata;
  }

  public void setMetadata(ProjectMetadata metadata) {
    if (metadata != null) {
      this.metadata = metadata.toJSONString();
    }
  }

  public void setMetadata(String metadataJSONString) {
    if (metadataJSONString != null) {
      this.metadata = metadataJSONString;
    }
  }

  public Object accept(ProjectVisitor visitor) {
    return visitor.visit(this);
  }

  public void setPublic(boolean isPublic) {
    this.isPublic = isPublic;
  }

  public boolean hasTags(Set<String> tagnames) {
    for (String tagname : tagnames) {
      boolean tagfound = false;
      for (Tag tag : this.getTags()) {
        if (tag.getName().equals(tagname)) {
          tagfound = true;
        }
      }
      if (!tagfound) {
        return false;
      }
    }
    return true;
  }

  public boolean isDeleted() {
    return isDeleted;
  }

  public void setDeleted(boolean isDeleted) {
    this.isDeleted = isDeleted;
  }

  public Integer getWiseVersion() {
    if (this.wiseVersion != null) {
      return this.wiseVersion;
    } else {
      return new Integer(4);
    }
  }

  public void setWISEVersion(Integer wiseVersion) {
    this.wiseVersion = wiseVersion;
  }

  public static class UserAlphabeticalComparator implements Comparator<User> {

    /**
     * Compares the user names of two User objects
     * @param user1 a user object
     * @param user2 a user object
     * @return
     * -1 if the user1 user names comes before the user2 user name
     * 0 if the user1 user name is the same as the user2 user name
     * 1 if the user1 user name comes after the user2 user name
     */
    @Override
    public int compare(User user1, User user2) {
      int result = 0;

      if (user1 != null && user2 != null) {
        MutableUserDetails userDetails1 = user1.getUserDetails();
        MutableUserDetails userDetails2 = user2.getUserDetails();

        if (userDetails1 != null && userDetails2 != null) {
          String username1 = userDetails1.getUsername();
          String username2 = userDetails2.getUsername();

          if (username1 != null && username2 != null) {
            String username1LowerCase = username1.toLowerCase();
            String username2LowerCase = username2.toLowerCase();
            result = username1LowerCase.compareTo(username2LowerCase);
          }
        }
      }
      return result;
    }
  }

  public boolean isOfficialProject() {
    return hasTag("official");
  }

  public boolean isCommunityProject() {
    return hasTag("community");
  }

  public boolean hasTag(String tag) {
    Set<Tag> projectTags = this.getTags();
    for (Tag projectTag: projectTags) {
      if (projectTag.getName().equals(tag)) {
        return true;
      }
    }
    return false;
  }

  public boolean isSharedTeacher(User user) {
    return this.getSharedowners().contains(user);
  }
}
