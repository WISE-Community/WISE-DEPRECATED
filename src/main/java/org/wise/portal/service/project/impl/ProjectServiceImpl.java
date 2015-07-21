/**
 * Copyright (c) 2008-2014 Regents of the University of California (Regents). 
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
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 * 
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.service.project.impl;

import java.io.Serializable;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Properties;
import java.util.Set;
import java.util.TreeSet;

import javax.servlet.http.HttpServletRequest;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.security.acls.model.AlreadyExistsException;
import org.springframework.security.acls.model.NotFoundException;
import org.springframework.security.acls.model.Permission;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.project.ProjectDao;
import org.wise.portal.domain.Persistable;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.impl.AddSharedTeacherParameters;
import org.wise.portal.domain.module.Curnit;
import org.wise.portal.domain.module.impl.CurnitGetCurnitUrlVisitor;
import org.wise.portal.domain.project.FamilyTag;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.ProjectMetadata;
import org.wise.portal.domain.project.Tag;
import org.wise.portal.domain.project.impl.LaunchProjectParameters;
import org.wise.portal.domain.project.impl.PreviewProjectParameters;
import org.wise.portal.domain.project.impl.ProjectParameters;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.presentation.web.exception.NotAuthorizedException;
import org.wise.portal.service.acl.AclService;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.module.ModuleService;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.premadecomment.PremadeCommentService;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.tag.TagService;
import org.wise.portal.service.user.UserService;

/**
 * @author patrick lawler
 * @version $Id:$
 */
public class ProjectServiceImpl implements ProjectService {

	protected static final String PREVIEW_RUN_NAME = "preview";

	private static final String PREVIEW_PERIOD_NAME = "preview period";

	protected static Set<String> PREVIEW_PERIOD_NAMES;

	@Autowired
	private Properties wiseProperties;

	@Autowired
	private ModuleService moduleService;

	@Autowired
	private ProjectDao<Project> projectDao;

	private AclService<Persistable> aclService;
	
	@Autowired
	private UserService userService;

	@Autowired
	private TagService tagService;
	
	@Autowired
	private RunService runService;

	@Autowired
	private PremadeCommentService premadeCommentService;

	{
		PREVIEW_PERIOD_NAMES = new HashSet<String>();
		PREVIEW_PERIOD_NAMES.add(PREVIEW_PERIOD_NAME);
	}

	/**
	 * @see org.wise.portal.service.project.ProjectService#addBookmarkerToProject(org.wise.portal.domain.project.Project, net.sf.sail.webapp.domain.User)
	 */
	public void addBookmarkerToProject(Project project, User bookmarker){
		project.getBookmarkers().add(bookmarker);
		this.projectDao.save(project);
	}

	public void addSharedTeacherToProject(
			AddSharedTeacherParameters addSharedTeacherParameters)
					throws ObjectNotFoundException {
		Project project = addSharedTeacherParameters.getProject();
		String sharedOwnerUsername = addSharedTeacherParameters.getSharedOwnerUsername();
		User user = userService.retrieveUserByUsername(sharedOwnerUsername);
		project.getSharedowners().add(user);
		this.projectDao.save(project);

		String permission = addSharedTeacherParameters.getPermission();
		if (permission.equals(UserDetailsService.PROJECT_WRITE_ROLE)) {
			this.aclService.removePermission(project, BasePermission.ADMINISTRATION, user);
			this.aclService.removePermission(project, BasePermission.READ, user);
			this.aclService.addPermission(project, BasePermission.WRITE, user);	
		} else if (permission.equals(UserDetailsService.PROJECT_READ_ROLE)) {
			this.aclService.removePermission(project, BasePermission.ADMINISTRATION, user);
			this.aclService.removePermission(project, BasePermission.WRITE, user);
			this.aclService.addPermission(project, BasePermission.READ, user);
		} else if (permission.equals(UserDetailsService.PROJECT_SHARE_ROLE)) {
			this.aclService.removePermission(project, BasePermission.READ, user);
			this.aclService.removePermission(project, BasePermission.WRITE, user);
			this.aclService.addPermission(project, BasePermission.ADMINISTRATION, user);
		}
	}

	public void removeSharedTeacherFromProject(String username, Project project) throws ObjectNotFoundException {
		User user = userService.retrieveUserByUsername(username);
		if (project == null || user == null) {
			return;
		}

		if (project.getSharedowners().contains(user)) {
			project.getSharedowners().remove(user);
			this.projectDao.save(project);
			try {
				List<Permission> permissions = this.aclService.getPermissions(project, user);
				for (Permission permission : permissions) {
					this.aclService.removePermission(project, permission, user);
				}
			} catch (Exception e) {
				// do nothing. permissions might get be deleted if user requesting the deletion is not the owner of the project.
			}
		}
	}

	/**
	 * @see org.wise.portal.service.project.ProjectService#createProject(org.wise.portal.domain.impl.ProjectParameters)
	 */
	@Transactional(rollbackFor = { AlreadyExistsException.class,
			NotFoundException.class, DataIntegrityViolationException.class
	})
	public Project createProject(ProjectParameters projectParameters)
			throws ObjectNotFoundException {
		Curnit curnit = this.moduleService.getById(projectParameters.getCurnitId());
		Project project = this.projectDao.createEmptyProject();
		project.setCurnit(curnit);
		project.setName(projectParameters.getProjectname());
		project.setOwner(projectParameters.getOwner());
		project.setProjectType(projectParameters.getProjectType());
		ProjectMetadata metadata = projectParameters.getMetadata();

		//get the parent project id if any
		Long parentProjectId = projectParameters.getParentProjectId();
		Project parentProject = null;

		if (parentProjectId != null) {
			//get the parent project
			parentProject = getById(parentProjectId);
			project.setMaxTotalAssetsSize(parentProject.getMaxTotalAssetsSize());
		}

		// set original author (if not sent in as a parameter)
		JSONObject metaJSON = new JSONObject(metadata);
		if (metaJSON.has("author")) {
			try {
				String author = metaJSON.getString("author");
				if (author == null || author.equals("null") || author.equals("")) {
					JSONObject authorJSON = new JSONObject();

					// set root id for project (if not already set)
					Long rootId = project.getRootProjectId();
					if (rootId == null) {
						try {
							rootId = this.identifyRootProjectId(parentProject);
							project.setRootProjectId(rootId);
						} catch (ObjectNotFoundException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
					}
					try {
						if (rootId != null) {
							Project rootP = this.getById(rootId);
							User owner = rootP.getOwner();
							MutableUserDetails ownerDetails = (MutableUserDetails) owner.getUserDetails();
							try {
								authorJSON.put("username", ownerDetails.getUsername());
								authorJSON.put("fullname", ownerDetails.getFirstname() + " " + ownerDetails.getLastname());
							} catch (JSONException e) {
								// TODO Auto-generated catch block
								e.printStackTrace();
							}
							metadata.setAuthor(authorJSON.toString());
						}
					} catch (ObjectNotFoundException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

		}
		project.setMetadata(metadata);
		//TODO -- isCurrent being set here may need to be removed
		project.setFamilytag(FamilyTag.TELS);
		project.setCurrent(true);
		project.setParentProjectId(projectParameters.getParentProjectId());
		project.setDateCreated(new Date());
		this.projectDao.save(project);
		this.aclService.addPermission(project, BasePermission.ADMINISTRATION);	

		if (parentProjectId != null) {
			Long newProjectId = (Long) project.getId();
			User signedInUser = ControllerUtil.getSignedInUser();

			//copy any premade comment lists from the parent project into the new project
			premadeCommentService.copyPremadeCommentsFromProject(parentProjectId, newProjectId, signedInUser);
		}

		return project;
	}

	/**
	 * @see org.wise.portal.service.project.ProjectService#getBookmarkerProjectList(net.sf.sail.webapp.domain.User)
	 */
	public List<Project> getBookmarkerProjectList(User bookmarker)
			throws ObjectNotFoundException {
		return this.projectDao.getProjectListByUAR(bookmarker, "bookmarker");
	}

	/**
	 * @see org.wise.portal.service.project.ProjectService#getById(java.io.Serializable)
	 */
	@Transactional(readOnly = true)
	public Project getById(Serializable projectId)
			throws ObjectNotFoundException {
		Project project = this.projectDao.getById(projectId);
		project.populateProjectInfo();
		return project;
	}

	/**
	 * @see org.wise.portal.service.project.ProjectService#getProjectList(net.sf.sail.webapp.domain.User)
	 */
	@Secured( { "ROLE_USER", "AFTER_ACL_COLLECTION_READ" })
	public List<Project> getProjectList(User user) {
		return this.projectDao.getProjectListByOwner(user);
	}

	/**
	 * @see org.wise.portal.service.project.ProjectService#getSharedProjectList(net.sf.sail.webapp.domain.User)
	 */
	public List<Project> getSharedProjectList(User user) {
		return this.projectDao.getProjectListByUAR(user, "sharedowner");
	}

	/**
	 * @see org.wise.portal.service.project.ProjectService#getSharedTeacherRole(org.wise.portal.domain.project.Project, net.sf.sail.webapp.domain.User)
	 */
	public String getSharedTeacherRole(Project project, User user) {
		List<Permission> permissions = this.aclService.getPermissions(project, user);
		// for projects, a user can have at most one permission per project
		if (!permissions.isEmpty()) {
			if (permissions.contains(BasePermission.ADMINISTRATION)) {
				return UserDetailsService.PROJECT_SHARE_ROLE;
			}
			Permission permission = permissions.get(0);
			if (permission.equals(BasePermission.READ)) {
				return UserDetailsService.PROJECT_READ_ROLE;
			} else if (permission.equals(BasePermission.WRITE)) {
				return UserDetailsService.PROJECT_WRITE_ROLE;
			}
		}
		return null;
	}

	/**
	 * @see org.wise.portal.service.project.ProjectService#getAdminProjectList()
	 */
	public List<Project> getAdminProjectList(){
		return this.projectDao.getList();
	}

	public ModelAndView launchProject(LaunchProjectParameters params)
			throws Exception {
		return new ModelAndView(new RedirectView(generateStudentStartProjectUrlString( params.getHttpServletRequest(), 
				params.getRun(), params.getWorkgroup())));
	}

	/**
	 * @see org.wise.portal.service.project.ProjectService#previewProject(org.wise.portal.domain.project.impl.PreviewProjectParameters)
	 */
	@Transactional()
	public ModelAndView previewProject(PreviewProjectParameters params) throws Exception {

		User user = params.getUser();
		Project project = params.getProject();
		Set<String> tagNames = new TreeSet<String>();
		tagNames.add("library");
		String step = params.getStep();
		String wiseBaseURL = wiseProperties.getProperty("wiseBaseURL");

		if(project != null){
			if(project.hasTags(tagNames) || 
					project.getFamilytag().equals(FamilyTag.TELS) || this.canReadProject(project, user)){
				String vleConfigUrl = wiseBaseURL + "/vleconfig" + "?projectId=" + project.getId() + "&mode=preview";

				if(step != null) {
					//this is set if the request is to preview the project and load a specific step such as 1.2
					vleConfigUrl += "&step=" + step;
				}
				
				String userSpecifiedLang = params.getLang();
				if (userSpecifiedLang != null) {
				    vleConfigUrl += "&lang=" + userSpecifiedLang;
				}

				if (params.isConstraintsDisabled()) {
					vleConfigUrl += "&isConstraintsDisabled=true";
				}

				/* if preview request is coming from the run, we want to pass along the version id when we make a request to get the config */
				String versionId = params.getVersionId();
				if(versionId != null && !versionId.equals("")){
					vleConfigUrl += "&versionId=" + versionId;
				}

				//get the path to the project json file
				String curriculumBaseWWW = wiseProperties.getProperty("curriculum_base_www");
				String rawProjectUrl = (String) project.getCurnit().accept(new CurnitGetCurnitUrlVisitor());
				String contentUrl = curriculumBaseWWW + rawProjectUrl;

                String vleurl = null;
                
                // get the wise version
                Integer wiseVersion = project.getWiseVersion();
                
                if (wiseVersion == null || wiseVersion == 4) {
                    // load WISE4
                    vleurl = wiseBaseURL + "/vle/vle.html";
                } else if (wiseVersion == 5) {
                    // load WISE5
                    String wise5URL = wiseBaseURL + "/student.html?projectId=" + project.getId();
                    return new ModelAndView(new RedirectView(wise5URL));
                }

				ModelAndView modelAndView = new ModelAndView("vle");
				modelAndView.addObject("vleurl",vleurl);
				modelAndView.addObject("vleConfigUrl", vleConfigUrl);
				modelAndView.addObject("contentUrl", contentUrl);
				
				return modelAndView;
			} else {
				return new ModelAndView(new RedirectView("../accessdenied.html"));
			}
		}

		return null;
	}

	/**
	 * @see org.wise.portal.service.project.ProjectService#removeBookmarkerFromProject(org.wise.portal.domain.project.Project, net.sf.sail.webapp.domain.User)
	 */
	@Transactional()
	public void removeBookmarkerFromProject(Project project, User bookmarker){
		project.getBookmarkers().remove(bookmarker);
		this.projectDao.save(project);
	}

	/**
	 * @see org.wise.portal.service.project.ProjectService#updateProject(org.wise.portal.domain.project.Project)
	 */
	@Transactional()
	public void updateProject(Project project, User user) throws NotAuthorizedException{
		// check to see if user can author project or the run that it's in
		List<Run> runList = this.runService.getProjectRuns((Long) project.getId());
		Run run = null;
		if (!runList.isEmpty()){
			// since a project can now only be run once, just use the first run in the list
			run = runList.get(0);
		}

		if(user.isAdmin() || this.aclService.hasPermission(project, BasePermission.ADMINISTRATION, user) ||
				this.aclService.hasPermission(project, BasePermission.WRITE, user) ||
				(run != null && runService.hasRunPermission(run, user, BasePermission.WRITE))) {
			this.projectDao.save(project);
		} else {
			throw new NotAuthorizedException("You are not authorized to update this project");
		}
	}

	/**
	 * Returns url string for actual run
	 * @param request
	 * @param run
	 * @param workgroup
	 * @return
	 */
	public String generateStudentStartProjectUrlString(HttpServletRequest request,
			Run run, Workgroup workgroup) {
	    Project project = run.getProject();
	    Integer wiseVersion = project.getWiseVersion();
	    if (wiseVersion == null || wiseVersion == 4) {
	        String wiseBaseURL = wiseProperties.getProperty("wiseBaseURL");
	        return wiseBaseURL + "/student/vle/vle.html?runId=" + run.getId() + "&workgroupId=" + workgroup.getId();
	    } else if (wiseVersion == 5) {
	        String wiseBaseURL = wiseProperties.getProperty("wiseBaseURL");
	        return wiseBaseURL + "/student.html?runId=" + run.getId() + "&workgroupId=" + workgroup.getId();
	    }
	    return null;
	}

	/**
	 * @param aclService the aclService to set
	 */
	public void setAclService(AclService<Persistable> aclService) {
		this.aclService = aclService;
	}

	/**
	 * @see org.wise.portal.service.project.ProjectService#canCreateRun(org.wise.portal.domain.project.Project, net.sf.sail.webapp.domain.User)
	 * Project cannot have a "review" tag to it.
	 */
	public boolean canCreateRun(Project project, User user) {
		Set<String> unallowed_tagnames = new HashSet<String>();
		unallowed_tagnames.add("review");
		return 
				!project.hasTags(unallowed_tagnames) &&
				(FamilyTag.TELS.equals(project.getFamilytag()) || 
						this.aclService.hasPermission(project, BasePermission.ADMINISTRATION, user) || 
						this.aclService.hasPermission(project, BasePermission.READ, user));
	}

	/**
	 * @see org.wise.portal.service.project.ProjectService#canAuthorProject(org.wise.portal.domain.project.Project, net.sf.sail.webapp.domain.User)
	 */
	public boolean canAuthorProject(Project project, User user) {
		return user.isAdmin() || this.aclService.hasPermission(project, BasePermission.ADMINISTRATION, user) ||
				this.aclService.hasPermission(project, BasePermission.WRITE, user);
	}

	/**
	 * @see org.wise.portal.service.project.ProjectService#canReadProject(org.wise.portal.domain.project.Project, net.sf.sail.webapp.domain.User)
	 */
	public boolean canReadProject(Project project, User user) {
		return user.isAdmin() || this.aclService.hasPermission(project, BasePermission.ADMINISTRATION, user) ||
				this.aclService.hasPermission(project, BasePermission.WRITE, user) ||
				this.aclService.hasPermission(project, BasePermission.READ, user);
	}

	/**
	 * @see org.wise.portal.service.project.ProjectService#addTagToProject(java.lang.String, org.wise.portal.domain.project.Project)
	 */
	@CacheEvict(value="project", allEntries=true)
	public Long addTagToProject(String tagString, Long projectId) {
		
		Tag tag = this.tagService.createOrGetTag(tagString);
		
		Project project = null;

		/* retrieve the project */
		try{
			project = this.projectDao.getById(projectId);
		} catch(ObjectNotFoundException e) {
			e.printStackTrace();
		}

		/* if tag is not from database, we either want to retrieve one that
		 * has the same name or create one */
		if(!this.tagService.isFromDatabase(tag)){
			tag = this.tagService.createOrGetTag(tag.getName());
		}

		/* add the tag and save the project */
		project.getTags().add(tag);
		this.projectDao.save(project);

		return (Long) tag.getId();
	}

	/**
	 * @see org.wise.portal.service.project.ProjectService#removeTagFromProject(java.lang.String, org.wise.portal.domain.project.Project)
	 */
	@CacheEvict(value="project", allEntries=true)
	@Transactional
	public void removeTagFromProject(Long tagId, Long projectId) {
		Tag tag = this.tagService.getTagById(tagId);
		Project project = null;

		try {
			project = this.projectDao.getById(projectId);
		} catch(ObjectNotFoundException e){
			e.printStackTrace();
		}

		if(tag != null && project != null){
			project.getTags().remove(tag);
			this.projectDao.save(project);
			this.tagService.removeIfOrphaned((Long)tag.getId());
		}
	}

	/**
	 * @see org.wise.portal.service.project.ProjectService#updateTag(java.lang.Long, java.lang.Long, java.lang.String)
	 */
	@Transactional
	public Long updateTag(Long tagId, Long projectId, String name) {
		Tag currentTag = this.tagService.getTagById(tagId);

		/* if the current tag's name is equivalent of the given name to change
		 * to, then we do not need to do anything, so just return the currentTag's id */
		if(currentTag.getName().toLowerCase().equals(name.toLowerCase())){
			return (Long) currentTag.getId();
		}

		/* remove the current tag */
		this.removeTagFromProject(tagId, projectId);

		/* add a tag with the given name and return its id */
		return this.addTagToProject(name, projectId);
	}

	/**
	 * @see org.wise.portal.service.project.ProjectService#isAuthorizedToCreateTag(net.sf.sail.webapp.domain.User, java.lang.String)
	 */
	public boolean isAuthorizedToCreateTag(User user, String name) {
		if(name.toLowerCase().equals("library") && !user.getUserDetails().hasGrantedAuthority(UserDetailsService.ADMIN_ROLE)){
			return false;
		}

		return true;
	}

	/**
	 * @see org.wise.portal.service.project.ProjectService#projectContainsTag(java.lang.Long, java.lang.String)
	 */
	public boolean projectContainsTag(Project project, String name) {

		project.getTags().size();  // force-fetch project tags from db
		for(Tag t : project.getTags()){
			if(t.getName().toLowerCase().equals(name.toLowerCase())){
				return true;
			}
		}
		return false;
	}

	
	/**
	 * @see org.wise.portal.service.project.ProjectService#getLibraryProjectList()
	 */
	@Transactional
	public List<Project> getLibraryProjectList() {
		Set<String> tagNames = new TreeSet<String>();
		tagNames.add("library");
		return getProjectListByTagNames(tagNames);
	}

	/**
	 * @see org.wise.portal.service.project.ProjectService#getPublicLibraryProjectList()
	 */
	@Cacheable(value="project")
	@Transactional
	public List<Project> getPublicLibraryProjectList() {
		Set<String> tagNames = new TreeSet<String>();
		tagNames.add("library");
		tagNames.add("public");
		return getProjectListByTagNames(tagNames);
	}
	
	/**
	 * @see org.wise.portal.service.project.ProjectService#getProjectListByTagNames(java.util.Set)
	 */
	public List<Project> getProjectListByTagNames(Set<String> tagNames) {
		return this.projectDao.getProjectListByTagNames(tagNames);
	}
	
	/**
	 * @see org.wise.portal.service.project.ProjectService#getProjectListByAuthor(java.lang.String)
	 */
	public List<Project> getProjectListByAuthorName(String authorName) {
		return this.projectDao.getProjectListByAuthorName(authorName);
	}
	
	@Override
	public List<Project> getProjectListByTitle(String title) {
		return this.projectDao.getProjectListByTitle(title);
	}


	/**
	 * @see org.wise.portal.service.project.ProjectService#getProjectCopies(java.lang.Long)
	 */
	public List<Project> getProjectCopies(Long projectId) {
		return this.projectDao.getProjectCopies(projectId);
	}

	/**
	 * @throws ObjectNotFoundException 
	 * @see org.wise.portal.service.project.ProjectService#identifyRootProjectId(java.lang.Long)
	 */
	public Long identifyRootProjectId(Project project) throws ObjectNotFoundException {
		if(project == null) {
			return null;
		} else {
			Long parentProjectId = project.getParentProjectId();
			if(parentProjectId == null || this.projectContainsTag(project, "library")){
				return (Long)project.getId();
			} else {
				return this.identifyRootProjectId(this.getById(parentProjectId));
			}
		}
	}
}
