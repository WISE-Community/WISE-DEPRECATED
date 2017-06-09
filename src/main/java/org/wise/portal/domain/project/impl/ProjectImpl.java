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
package org.wise.portal.domain.project.impl;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

import javax.persistence.*;

import org.hibernate.annotations.Cascade;
import org.json.JSONException;
import org.json.JSONObject;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.project.FamilyTag;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.ProjectInfo;
import org.wise.portal.domain.project.ProjectMetadata;
import org.wise.portal.domain.project.ProjectVisitor;
import org.wise.portal.domain.project.Tag;
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
	protected String name;

	@OneToOne(targetEntity = ProjectMetadataImpl.class, fetch = FetchType.LAZY)
	@Cascade( { org.hibernate.annotations.CascadeType.SAVE_UPDATE })
    @JoinColumn(name = "metadata_fk", nullable = true, unique = true)
    protected ProjectMetadata metadataObj = null;

	@Column(name = "metadata", nullable = true)
	protected String metadata;

	@Column(name = "modulePath", nullable = false)
	protected String modulePath;

	@ManyToOne(targetEntity = UserImpl.class, fetch = FetchType.LAZY)
	@JoinColumn(name = "owner_fk", nullable = false, unique = false)
	private User owner;

	@ManyToMany(targetEntity = UserImpl.class, fetch = FetchType.LAZY)
    @JoinTable(name = SHARED_OWNERS_JOIN_TABLE_NAME, joinColumns = { @JoinColumn(name =  PROJECTS_JOIN_COLUMN_NAME, nullable = false) }, inverseJoinColumns = @JoinColumn(name = SHARED_OWNERS_JOIN_COLUMN_NAME, nullable = false))
    private Set<User> sharedowners = new TreeSet<User>();
    
    @ManyToMany(targetEntity = UserImpl.class, fetch = FetchType.LAZY)
    @JoinTable(name = BOOKMARKERS_JOIN_TABLE_NAME, joinColumns = { @JoinColumn(name= PROJECTS_JOIN_COLUMN_NAME, nullable = false) }, inverseJoinColumns = @JoinColumn(name = BOOKMARKERS_JOIN_COLUMN_NAME, nullable = false))
    private Set<User> bookmarkers = new TreeSet<User>();
    
    @Column(name = ProjectImpl.COLUMN_NAME_FAMILYTAG, nullable = true)
	protected FamilyTag familytag;
    
    @Column(name = ProjectImpl.COLUMN_NAME_ISCURRENT, nullable = true)
    protected boolean isCurrent;
    
    @Column(name = ProjectImpl.COLUMN_NAME_PROJECTTYPE, nullable = true)
    protected ProjectType projectType;
	
    @Column(name = ProjectImpl.COLUMN_NAME_PARENT_PROJECT_ID, nullable = true)
    private Long parentProjectId;
    
    @Transient
    private Project parentProject;
    
    @Transient
    private Long rootProjectId = null;
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
	public Long id = null;

    @Version
    @Column(name = "OPTLOCK")
    protected Integer version = null;
	
    @Column(name = ProjectImpl.ISPUBLIC_COLUMN_NAME)
    protected boolean isPublic;
    
    @Column(name = ProjectImpl.COLUMN_NAME_DATE_CREATED, nullable=false)
    protected Date dateCreated;
    
    @ManyToMany(targetEntity = TagImpl.class, fetch = FetchType.LAZY)
    @JoinTable(name = TAGS_JOIN_TABLE_NAME, joinColumns = { @JoinColumn(name = PROJECT_JOIN_COLUMN_NAME, nullable = false) }, inverseJoinColumns = @JoinColumn(name = TAGS_JOIN_COLUMN_NAME, nullable = false))
    protected Set<Tag> tags = new TreeSet<Tag>();
    
    @Column(name = ProjectImpl.COLUMN_NAME_IS_DELETED, nullable=true)
    protected boolean isDeleted;
    
    @Column(name = ProjectImpl.COLUMN_NAME_DATE_DELETED, nullable=true)
    protected Date dateDeleted;

    @Column(name = ProjectImpl.COLUMN_NAME_MAX_TOTAL_ASSETS_SIZE, nullable = true)
    protected Long maxTotalAssetsSize;

    @Column(name = ProjectImpl.COLUMN_NAME_WISE_VERSION, nullable = true)
    protected Integer wiseVersion;

    public Long getId() {
        return this.id;
    }

    @SuppressWarnings("unused")
    private void setId(Long id) {
        this.id = id;
    }

    @SuppressWarnings("unused")
    private Integer getVersion() {
        return this.version;
    }

    @SuppressWarnings("unused")
    private void setVersion(Integer version) {
        this.version = version;
    }

	/**
	 * @see java.lang.Object#hashCode()
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((modulePath == null) ? 0 : modulePath.hashCode());
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
		final ProjectImpl other = (ProjectImpl) obj;
		if (modulePath == null) {
			if (other.modulePath != null)
				return false;
		} else if (!modulePath.equals(other.modulePath))
			return false;
		return true;
	}

	/**
	 * @return the familyTag
	 */
	public FamilyTag getFamilytag() {
		return familytag;
	}

	/**
	 * @param familytag the familyTag to set
	 */
	public void setFamilytag(FamilyTag familytag) {
		this.familytag = familytag;
		this.projectinfo.setFamilyTag(familytag);
	}

	/**
	 * @return the isCurrent
	 */
	public boolean isCurrent() {
		return isCurrent;
	}

	/**
	 * @param isCurrent the isCurrent to set
	 */
	public void setCurrent(boolean isCurrent) {
		this.isCurrent = isCurrent;
		this.projectinfo.setCurrent(isCurrent);
	}

	/**
	 * @return the projectInfo
	 */
	public ProjectInfo getProjectInfo() {
		return projectinfo;
	}

	/**
	 * @param projectInfo the projectInfo to set
	 */
	public void setProjectInfo(ProjectInfo projectInfo) {
		this.projectinfo = projectInfo;
		this.isCurrent = projectInfo.isCurrent();
		this.familytag = projectInfo.getFamilyTag();
	}
	
	public Set<User> getSharedowners() {
		return sharedowners;
	}
	
	/**
	 * Get the shared owners in alphabetical order
	 * @return the shared owners list in alphabetical order
	 */
	public List<User> getSharedOwnersOrderedAlphabetically() {

		List<User> sharedOwnersList = new ArrayList<User>();

		// add the shared owners for this project
		sharedOwnersList.addAll(sharedowners);
		
		// get the comparator that will order the list alphabetically
		UserAlphabeticalComparator userAlphabeticalComparator = new UserAlphabeticalComparator();

		// sort the list alphabetically
		Collections.sort(sharedOwnersList, userAlphabeticalComparator);
		
		return sharedOwnersList;
	}

	public void setSharedowners(Set<User> sharedowners) {
		this.sharedowners = sharedowners;
	}

	public User getOwner() {
		return owner;
	}

	public void setOwner(User owner) {
		this.owner = owner;
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
	 * @return the name
	 */
	public String getName() {
		if (name == null) {
			return "";
		}		
		return name;
	}

	/**
	 * @param name the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}

	@Override
	public String getModulePath() {
		return this.modulePath;
	}

	@Override
	public void setModulePath(String modulePath) {
		this.modulePath = modulePath;
	}

	/**
	 * @return the bookmarkers
	 */
	public Set<User> getBookmarkers() {
		return bookmarkers;
	}

	/**
	 * @param bookmarkers the bookmarkers to set
	 */
	public void setBookmarkers(Set<User> bookmarkers) {
		this.bookmarkers = bookmarkers;
	}
	
	/**
	 * @see org.wise.portal.domain.project.Project#populateProjectInfo()
	 */
	public void populateProjectInfo(){
		this.projectinfo = new ProjectInfoImpl();
		this.projectinfo.setName(this.getName());
	}

	public ProjectMetadata getMetadataObj() {
		return metadataObj;
	}

	/**
	 * @see org.wise.portal.domain.project.Project#getMetadata()
	 */
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

	/**
	 * @see org.wise.portal.domain.project.Project#setMetadata(ProjectMetadata)
	 */
	public void setMetadata(ProjectMetadata metadata) {
		if (metadata != null) {
			this.metadata = metadata.toJSONString();
		}
	}

	/**
	 * @see org.wise.portal.domain.project.Project#setMetadata(String)
	 */
	public void setMetadata(String metadataJSONString) {
		if (metadataJSONString != null) {
			this.metadata = metadataJSONString;
		}
	}
	
	/**
	 * Visitor Pattern
	 * @param visitor
	 */
	public Object accept(ProjectVisitor visitor) {
		return visitor.visit(this);
	}

	/**
	 * @return the isPublic
	 */
	public boolean isPublic() {
		return isPublic;
	}

	/**
	 * @param isPublic the isPublic to set
	 */
	public void setPublic(boolean isPublic) {
		this.isPublic = isPublic;
	}

	/**
	 * @return the dateCreated
	 */
	public Date getDateCreated() {
		return dateCreated;
	}

	/**
	 * @param dateCreated the dateCreated to set
	 */
	public void setDateCreated(Date dateCreated) {
		this.dateCreated = dateCreated;
	}

	/**
	 * @return the tags
	 */
	public Set<Tag> getTags() {
		return tags;
	}

	/**
	 * @see org.wise.portal.domain.project.Project#setTags(Set)
	 */
	public void setTags(Set<Tag> tags) {
		this.tags = tags;
	}

	/**
	 * @see org.wise.portal.domain.project.Project#hasTags(java.util.Set)
	 */
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

	/**
	 * @return the parentProjectId
	 */
	public Long getParentProjectId() {
		return parentProjectId;
	}

	/**
	 * @param parentProjectId the parentProjectId to set
	 */
	public void setParentProjectId(Long parentProjectId) {
		this.parentProjectId = parentProjectId;
	}

	/**
	 * 
	 * @see org.wise.portal.domain.project.Project#getRootProjectId()
	 */
	public Long getRootProjectId() {
		return rootProjectId;
	}

	/**
	 * 
	 * @see org.wise.portal.domain.project.Project#setRootProjectId(java.lang.Long)
	 */
	public void setRootProjectId(Long rootProjectId) {
		this.rootProjectId = rootProjectId;
	}
	
	/**
	 * Whether this project is deleted
	 * @return
	 */
	public boolean isDeleted() {
		return isDeleted;
	}

	/**
	 * Set whether this project is deleted
	 * @param isDeleted
	 */
	public void setDeleted(boolean isDeleted) {
		this.isDeleted = isDeleted;
	}

	/**
	 * Get the date the project was deleted
	 * @return
	 */
	public Date getDateDeleted() {
		return dateDeleted;
	}

	/**
	 * Set the date the project was deleted
	 * @param dateDeleted
	 */
	public void setDateDeleted(Date dateDeleted) {
		this.dateDeleted = dateDeleted;
	}

	public Long getMaxTotalAssetsSize() {
		return maxTotalAssetsSize;
	}

	public void setMaxTotalAssetsSize(Long maxTotalAssetsSize) {
		this.maxTotalAssetsSize = maxTotalAssetsSize;
	}

	public Integer getWiseVersion() {
		return this.wiseVersion;
	}

	public void setWISEVersion(Integer wiseVersion) {
		this.wiseVersion = wiseVersion;
	}

	/**
	 * Comparator used to order user names alphabetically
	 */
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
				// get the user details
				MutableUserDetails userDetails1 = user1.getUserDetails();
				MutableUserDetails userDetails2 = user2.getUserDetails();
				
				if (userDetails1 != null && userDetails2 != null) {
					// get the user names
					String userName1 = userDetails1.getUsername();
					String userName2 = userDetails2.getUsername();
					
					if (userName1 != null && userName2 != null) {
						// get the user names in lower case
						String userName1LowerCase = userName1.toLowerCase();
						String userName2LowerCase = userName2.toLowerCase();
						
						// compare the user names
						result = userName1LowerCase.compareTo(userName2LowerCase);
					}
				}
			}
			
			return result;
		}
	}
}
