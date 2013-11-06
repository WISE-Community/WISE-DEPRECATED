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

import java.util.Date;
import java.util.Set;
import java.util.TreeSet;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.Version;

import net.sf.sail.webapp.domain.Curnit;
import net.sf.sail.webapp.domain.Jnlp;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.CurnitImpl;
import net.sf.sail.webapp.domain.impl.JnlpImpl;
import net.sf.sail.webapp.domain.impl.UserImpl;

import org.hibernate.annotations.Cascade;
import org.telscenter.sail.webapp.domain.Module;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.impl.RunImpl;
import org.telscenter.sail.webapp.domain.project.FamilyTag;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.domain.project.ProjectInfo;
import org.telscenter.sail.webapp.domain.project.ProjectMetadata;
import org.telscenter.sail.webapp.domain.project.ProjectVisitor;
import org.telscenter.sail.webapp.domain.project.Tag;
import org.telscenter.sail.webapp.service.module.ModuleService;
import org.telscenter.sail.webapp.service.module.impl.ModuleServiceImpl;

/**
 * @author Hiroki Terashima
 * @version $Id$
 */
@Entity
@Table(name = ProjectImpl.DATA_STORE_NAME)
@Inheritance(strategy = InheritanceType.JOINED)
public class ProjectImpl implements Project {
	
    @Transient
    public static final String SHARED_OWNERS_JOIN_COLUMN_NAME = "shared_owners_fk";
    
	@Transient
    public static final String SHARED_OWNERS = "shared_owners";
    
    @Transient
    public static final String SHARED_OWNERS_JOIN_TABLE_NAME = "projects_related_to_shared_owners";

	@Transient
	private static final long serialVersionUID = 1L;

	@Transient
	public static final String COLUMN_NAME_FAMILYTAG = "familytag";
	
	@Transient
	public static final String COLUMN_NAME_PROJECTINFOTAG = "projectinfotag";
	
	@Transient
	public static final String COLUMN_NAME_ISCURRENT = "iscurrent";
	
	@Transient
	public static final String DATA_STORE_NAME = "projects";
	
	@Transient
	public static final String COLUMN_NAME_CURNIT_FK = "curnit_fk";

	@Transient
	public static final String COLUMN_NAME_JNLP_FK = "jnlp_fk";

	@Transient
	public static final String COLUMN_NAME_PARENT_PROJECT_ID = "parentprojectid";

	@Transient
	public static final String COLUMN_NAME_PREVIEWOFFERING_FK = "run_fk";

	@Transient
	private static final String COLUMN_NAME_PROJECTTYPE = "projecttype";

	@Transient
	private static final String COLUMN_NAME_PROJECT_NAME = "name";

	@Transient
	private static final String OWNERS_JOIN_TABLE_NAME = "projects_related_to_owners";
	
    @Transient
    public static final String OWNERS_JOIN_COLUMN_NAME = "owners_fk";

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
    private static final String COLUMN_NAME_METADATA_FK = "metadata_fk";
    
    @Transient
    private static final String COLUMN_NAME_IS_DELETED = "isDeleted";
    
    @Transient
    private static final String COLUMN_NAME_DATE_DELETED = "dateDeleted";

    @Transient
	private static final String COLUMN_NAME_MAX_TOTAL_ASSETS_SIZE = "maxTotalAssetsSize";

	@Transient
	public ProjectInfo projectinfo = new ProjectInfoImpl();
	
	@Column(name = COLUMN_NAME_PROJECT_NAME)
	protected String name;
	
	@OneToOne(targetEntity = ProjectMetadataImpl.class, fetch = FetchType.EAGER)
	@Cascade( { org.hibernate.annotations.CascadeType.SAVE_UPDATE })
    @JoinColumn(name = COLUMN_NAME_METADATA_FK, nullable = true, unique = true)
    protected ProjectMetadata metadata = null;

	@ManyToOne(cascade = CascadeType.ALL, targetEntity = CurnitImpl.class, fetch = FetchType.LAZY)
    @Cascade( { org.hibernate.annotations.CascadeType.SAVE_UPDATE })
	@JoinColumn(name = COLUMN_NAME_CURNIT_FK, nullable = true, unique = false)
	protected Curnit curnit;
	
	@ManyToOne(cascade = CascadeType.ALL, targetEntity = JnlpImpl.class, fetch = FetchType.EAGER)
    @Cascade( { org.hibernate.annotations.CascadeType.SAVE_UPDATE })
	@JoinColumn(name = COLUMN_NAME_JNLP_FK, nullable = true, unique = false)
	protected Jnlp jnlp;
	
	@OneToOne(targetEntity = RunImpl.class, fetch = FetchType.LAZY)
	@JoinColumn(name = COLUMN_NAME_PREVIEWOFFERING_FK, unique = true)
	protected Run previewRun;
	
	@ManyToMany(targetEntity = UserImpl.class, fetch = FetchType.LAZY)
    @JoinTable(name = OWNERS_JOIN_TABLE_NAME, joinColumns = { @JoinColumn(name =  PROJECTS_JOIN_COLUMN_NAME, nullable = false) }, inverseJoinColumns = @JoinColumn(name = OWNERS_JOIN_COLUMN_NAME, nullable = false))
    private Set<User> owners = new TreeSet<User>();
	
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
    
    @ManyToMany(targetEntity = TagImpl.class, fetch = FetchType.EAGER)
    @JoinTable(name = TAGS_JOIN_TABLE_NAME, joinColumns = { @JoinColumn(name = PROJECT_JOIN_COLUMN_NAME, nullable = false) }, inverseJoinColumns = @JoinColumn(name = TAGS_JOIN_COLUMN_NAME, nullable = false))
    protected Set<Tag> tags = new TreeSet<Tag>();
    
    @Column(name = ProjectImpl.COLUMN_NAME_IS_DELETED, nullable=true)
    protected boolean isDeleted;
    
    @Column(name = ProjectImpl.COLUMN_NAME_DATE_DELETED, nullable=true)
    protected Date dateDeleted;

    @Column(name = ProjectImpl.COLUMN_NAME_MAX_TOTAL_ASSETS_SIZE, nullable = true)
    protected Long maxTotalAssetsSize;
    
	/**
	 * @see org.telscenter.sail.webapp.domain.project.Project#getCurnit()
	 */
	public Curnit getCurnit() {
		return curnit;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.project.Project#getJnlp()
	 */
	public Jnlp getJnlp() {
		return jnlp;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.project.Project#setCurnit(net.sf.sail.webapp.domain.Curnit)
	 */
	public void setCurnit(Curnit curnit) {
		this.curnit = curnit;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.project.Project#setJnlp(net.sf.sail.webapp.domain.Jnlp)
	 */
	public void setJnlp(Jnlp jnlp) {
		this.jnlp = jnlp;
	}

    /**
     * @see net.sf.sail.webapp.domain.Curnit#getId()
     */
    public Long getId() {
        return this.id;
    }

    @SuppressWarnings("unused")
    private void setId(Long id) {
        this.id = id;
    }

	/**
	 * @return the previewOffering
	 */
	public Run getPreviewRun() {
		return previewRun;
	}

	/**
	 * @param previewOffering the previewOffering to set
	 */
	public void setPreviewRun(Run previewRun) {
		this.previewRun = previewRun;
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
		result = prime * result + ((curnit == null) ? 0 : curnit.hashCode());
		result = prime * result + ((jnlp == null) ? 0 : jnlp.hashCode());
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
		if (curnit == null) {
			if (other.curnit != null)
				return false;
		} else if (!curnit.equals(other.curnit))
			return false;
		if (jnlp == null) {
			if (other.jnlp != null)
				return false;
		} else if (!jnlp.equals(other.jnlp))
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
	 * @param familyTag the familyTag to set
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
	 * @param projectInfoTag the projectInfoTag to set
	 */
	public void setProjectInfo(ProjectInfo projectInfo) {
		this.projectinfo = projectInfo;
		this.isCurrent = projectInfo.isCurrent();
		this.familytag = projectInfo.getFamilyTag();
	}
	
	public Set<User> getSharedowners() {
		return sharedowners;
	}

	public void setSharedowners(Set<User> sharedowners) {
		this.sharedowners = sharedowners;
	}

	public Set<User> getOwners() {
		return owners;
	}

	public void setOwners(Set<User> owners) {
		this.owners = owners;
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
		return name;
	}

	/**
	 * @param name the name to set
	 */
	public void setName(String name) {
		this.name = name;
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
	 * @see org.telscenter.sail.webapp.domain.project.Project#populateProjectInfo()
	 */
	public void populateProjectInfo(){
		ModuleService moduleService = new ModuleServiceImpl();
		this.projectinfo = new ProjectInfoImpl();
		this.projectinfo.setName(this.getName());
		
		try{
			Module mod = (Module) moduleService.getById(this.getCurnit().getId());
			this.projectinfo.setSubject(mod.getTopicKeywords());
			this.projectinfo.setGradeLevel(mod.getGrades());
			this.projectinfo.setComment("NONE");
			this.projectinfo.setAuthor(mod.getAuthors());
		} catch(Exception e){
			
		}
	}
	
	/**
	 * @see org.telscenter.sail.webapp.domain.project.Project#getMetadata()
	 */
	public ProjectMetadata getMetadata() {
		return metadata;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.project.Project#setMetadata(java.lang.String)
	 */
	public void setMetadata(ProjectMetadata data) {
		this.metadata = data;
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
	 * @see org.telscenter.sail.webapp.domain.project.Project#setTags(java.lang.String)
	 */
	public void setTags(Set<Tag> tags) {
		this.tags = tags;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.project.Project#hasTags(java.util.Set)
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
	 * @see org.telscenter.sail.webapp.domain.project.Project#getRootProjectId()
	 */
	public Long getRootProjectId() {
		return rootProjectId;
	}

	/**
	 * 
	 * @see org.telscenter.sail.webapp.domain.project.Project#setRootProjectId(java.lang.Long)
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
}
