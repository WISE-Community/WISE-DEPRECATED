/**
 * by TELS, Graduate School of Education, University of California at Berkeley.
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
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
package org.telscenter.sail.webapp.service.project.impl;

import java.io.IOException;
import java.io.Serializable;
import java.net.MalformedURLException;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Properties;
import java.util.Set;
import java.util.TreeSet;

import javax.servlet.http.HttpServletRequest;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.Curnit;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.impl.CurnitGetCurnitUrlVisitor;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;
import net.sf.sail.webapp.service.AclService;
import net.sf.sail.webapp.service.NotAuthorizedException;
import net.sf.sail.webapp.service.UserService;
import net.sf.sail.webapp.service.curnit.CurnitService;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.acls.model.AlreadyExistsException;
import org.springframework.security.acls.model.NotFoundException;
import org.springframework.security.acls.model.Permission;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.security.annotation.Secured;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;
import org.telscenter.sail.webapp.dao.project.ProjectDao;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.authentication.MutableUserDetails;
import org.telscenter.sail.webapp.domain.impl.AddSharedTeacherParameters;
import org.telscenter.sail.webapp.domain.impl.ProjectParameters;
import org.telscenter.sail.webapp.domain.impl.RunParameters;
import org.telscenter.sail.webapp.domain.project.FamilyTag;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.domain.project.ProjectInfo;
import org.telscenter.sail.webapp.domain.project.ProjectMetadata;
import org.telscenter.sail.webapp.domain.project.Tag;
import org.telscenter.sail.webapp.domain.project.impl.AuthorProjectParameters;
import org.telscenter.sail.webapp.domain.project.impl.LaunchProjectParameters;
import org.telscenter.sail.webapp.domain.project.impl.LaunchReportParameters;
import org.telscenter.sail.webapp.domain.project.impl.PreviewProjectParameters;
import org.telscenter.sail.webapp.presentation.util.http.Connector;
import org.telscenter.sail.webapp.presentation.util.json.JSONException;
import org.telscenter.sail.webapp.presentation.util.json.JSONObject;
import org.telscenter.sail.webapp.service.authentication.UserDetailsService;
import org.telscenter.sail.webapp.service.offering.RunService;
import org.telscenter.sail.webapp.service.premadecomment.PremadeCommentService;
import org.telscenter.sail.webapp.service.project.ProjectService;
import org.telscenter.sail.webapp.service.tag.TagService;

/**
 * @author patrick lawler
 * @version $Id:$
 */
public class LdProjectServiceImpl implements ProjectService {


	protected static final String PREVIEW_RUN_NAME = "preview";

	private static final String PREVIEW_PERIOD_NAME = "preview period";
	
	protected static Set<String> PREVIEW_PERIOD_NAMES;
	
	private Properties portalProperties;

	private CurnitService curnitService;
	
	private ProjectDao<Project> projectDao;
	
	private AclService<Project> aclService;
	
	private UserService userService;
	
	private RunService runService;
	
	private TagService tagService;
	
	private PremadeCommentService premadeCommentService;
	
	{
		PREVIEW_PERIOD_NAMES = new HashSet<String>();
		PREVIEW_PERIOD_NAMES.add(PREVIEW_PERIOD_NAME);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#addBookmarkerToProject(org.telscenter.sail.webapp.domain.project.Project, net.sf.sail.webapp.domain.User)
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

	public ModelAndView authorProject(AuthorProjectParameters params)
			throws Exception {
		String portalUrl = ControllerUtil.getBaseUrlString(params.getHttpServletRequest());
		String vleAuthorUrl = portalUrl + "/vlewrapper/vle/author.html";
		String portalAuthorUrl = portalUrl + "/webapp/author/authorproject.html";
		String command = params.getHttpServletRequest().getParameter("param1");
		
		ModelAndView mav = new ModelAndView();
		mav.addObject("portalAuthorUrl", portalAuthorUrl);
		mav.addObject("vleAuthorUrl", vleAuthorUrl);
		
		if(command != null && command != ""){
			mav.addObject("command", command);
		}
		
		/*
		 * this value will be set to "true" only if the user is opening the premade comments
		 * from the teacher home page. this value is used to tell the authoring tool
		 * to immediately open the premade comments after the vle is loaded because
		 * we will not actually display the authoring tool to the user. we only need
		 * to load the authoring tool so that the vle is loaded and can then open
		 * the editing view for the premade comments.
		 */
		String editPremadeComments = params.getHttpServletRequest().getParameter("editPremadeComments");
		mav.addObject("editPremadeComments", editPremadeComments);
		
		User author = params.getAuthor();
		Project project = params.getProject();
		if(project != null){
			if(author.isAdmin() || this.aclService.hasPermission(project, BasePermission.WRITE, params.getAuthor()) ||
					this.aclService.hasPermission(project, BasePermission.ADMINISTRATION, params.getAuthor())){
				String title = null;
				if(project.getMetadata() != null && project.getMetadata().getTitle() != null && !project.getMetadata().getTitle().equals("")){
					title = project.getMetadata().getTitle();
				} else {
					title = project.getName();
				}
				
				if(title != null) {
					/*
					 * replace " with \" because if we don't escape it, the " may
					 * short circuit the parent string that we put the title in
					 */
					title = title.replaceAll("\"", "\\\\\"");					
				}
				
				if(command == null){
					mav.addObject("command", "editProject");
				}
				
				/* get the url for the project content file 
				String versionId = null;
				if(params.getVersionId() != null && !params.getVersionId().equals("")){
					versionId = params.getVersionId();
				} else {
					versionId = this.getActiveVersion(project);
				}
				*/
				String rawProjectUrl = (String) project.getCurnit().accept(new CurnitGetCurnitUrlVisitor());
				String polishedProjectUrl = null;
				polishedProjectUrl = rawProjectUrl;
				/* The polishedProjectUrl is the project url with the version id inserted into the project filename
				 * If null or empty string is returned, we want to use the rawUrl 
				if(versionId==null || versionId.equals("")){
					polishedProjectUrl = rawProjectUrl;
				} else {
					polishedProjectUrl = rawProjectUrl.replace(".project.json", ".project." + versionId + ".json");
				}
				*/
				
				//get the project attributes
				String relativeProjectUrl = polishedProjectUrl;
				String projectId = project.getId().toString();
				String projectTitle = title;
				
				//put the project attributes into the model so it can be accessed in the .jsp page
				mav.addObject("relativeProjectUrl", relativeProjectUrl);
				mav.addObject("projectId", projectId);
				mav.addObject("projectTitle", projectTitle);
			} else {
				return new ModelAndView(new RedirectView("/webapp/accessdenied.html"));
			}
		}
		return mav;
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#createProject(org.telscenter.sail.webapp.domain.impl.ProjectParameters)
	 */
	@Transactional(rollbackFor = { AlreadyExistsException.class,
            NotFoundException.class, DataIntegrityViolationException.class
	})
	public Project createProject(ProjectParameters projectParameters)
			throws ObjectNotFoundException {
		Curnit curnit = this.curnitService.getById(projectParameters.getCurnitId());
		Project project = this.projectDao.createEmptyProject();
		project.setCurnit(curnit);
		project.setName(projectParameters.getProjectname());
		project.setOwners(projectParameters.getOwners());
		project.setProjectType(projectParameters.getProjectType());
		ProjectMetadata metadata = projectParameters.getMetadata();
		
		//get the parent project id if any
		Long parentProjectId = projectParameters.getParentProjectId();
		Project parentProject = null;
		
		if(parentProjectId != null) {
			//get the parent project
			parentProject = getById(parentProjectId);
			project.setMaxTotalAssetsSize(parentProject.getMaxTotalAssetsSize());
		}
		
		// set original author (if not sent in as a parameter)
		JSONObject metaJSON = new JSONObject(metadata);
		if(metaJSON.has("author")){
			try {
				String author = metaJSON.getString("author");
				if(author == null || author.equals("null") || author.equals("")){
					JSONObject authorJSON = new JSONObject();
					
					// set root id for project (if not already set)
					Long rootId = project.getRootProjectId();
					if(rootId == null){
						try {
							rootId = this.identifyRootProjectId(parentProject);
							project.setRootProjectId(rootId);
						} catch (ObjectNotFoundException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
					}
					try {
						if(rootId != null) {
							Project rootP = this.getById(rootId);
							Set<User> owners = rootP.getOwners();
							for(User owner : owners){
								MutableUserDetails ownerDetails = (MutableUserDetails)owner.getUserDetails();
								try {
									authorJSON.put("username", ownerDetails.getUsername());
									authorJSON.put("fullname", ownerDetails.getFirstname() + " " + ownerDetails.getLastname());
								} catch (JSONException e) {
									// TODO Auto-generated catch block
									e.printStackTrace();
								}
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
		
		if(parentProjectId != null) {
			Long newProjectId = (Long) project.getId();
			User signedInUser = ControllerUtil.getSignedInUser();
			
			//copy any premade comment lists from the parent project into the new project
			premadeCommentService.copyPremadeCommentsFromProject(parentProjectId, newProjectId, signedInUser);
		}
		
		return project;
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getBookmarkerProjectList(net.sf.sail.webapp.domain.User)
	 */
	public List<Project> getBookmarkerProjectList(User bookmarker)
			throws ObjectNotFoundException {
		return this.projectDao.getProjectListByUAR(bookmarker, "bookmarker");
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getById(java.io.Serializable)
	 */
	@Transactional(readOnly = true)
	public Project getById(Serializable projectId)
			throws ObjectNotFoundException {
		Project project = this.projectDao.getById(projectId);
		project.populateProjectInfo();
		return project;
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getProjectList()
	 */
    @Secured( { "ROLE_USER", "AFTER_ACL_COLLECTION_READ" })    
    @Transactional(readOnly = true)
	public List<Project> getProjectList() {
    	List<Project> projectList = this.projectDao.getList();
    	for (Project project : projectList) {
				project.populateProjectInfo();
    	}	
		return projectList;
	}

    /**
     * @see org.telscenter.sail.webapp.service.project.ProjectService#getProjectList(net.sf.sail.webapp.domain.User)
     */
    @Secured( { "ROLE_USER", "AFTER_ACL_COLLECTION_READ" })
	public List<Project> getProjectList(User user) {
    	return this.projectDao.getProjectListByUAR(user, "owner");
	}

	/**
	 * @override @see org.telscenter.sail.webapp.service.project.ProjectService#getProjectListByInfo(org.telscenter.sail.webapp.domain.project.impl.ProjectInfo)
	 */
	public List<Project> getProjectListByInfo(ProjectInfo info)
			throws ObjectNotFoundException {
    	List<Project> projectList = this.projectDao.retrieveListByInfo(info);
		return projectList;		
	}

	/**
	 * @override @see org.telscenter.sail.webapp.service.project.ProjectService#getProjectListByTag(org.telscenter.sail.webapp.domain.project.impl.FamilyTag)
	 */
	public List<Project> getProjectListByTag(FamilyTag familytag) throws ObjectNotFoundException {
    	List<Project> projectList = this.projectDao.retrieveListByTag(familytag);
    	for (Project project : projectList) {
    		project.populateProjectInfo();
    	}
		return projectList;
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getProjectListByTag(java.lang.String)
	 */
	public List<Project> getProjectListByTag(String projectinfotag) throws ObjectNotFoundException {
    	List<Project> projectList = this.projectDao.retrieveListByTag(projectinfotag);
		return projectList;
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getSharedProjectList(net.sf.sail.webapp.domain.User)
	 */
	public List<Project> getSharedProjectList(User user) {
		return this.projectDao.getProjectListByUAR(user, "sharedowner");
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getSharedTeacherRole(org.telscenter.sail.webapp.domain.project.Project, net.sf.sail.webapp.domain.User)
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
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getAdminProjectList()
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
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#previewProject(org.telscenter.sail.webapp.domain.project.impl.PreviewProjectParameters)
	 */
	@Transactional()
	public ModelAndView previewProject(PreviewProjectParameters params) throws Exception {
		Project project = params.getProject();

		ModelAndView mav = new ModelAndView(new RedirectView(generateStudentPreviewProjectUrlString(params.getHttpServletRequest(), 
				project, params.getVersionId())));
		return mav;
	}

	/**
	 * Returns url string for previewing the run
	 * @param request
	 * @param run
	 * @param workgroup
	 * @return
	 */
	public String generateStudentPreviewProjectUrlString(HttpServletRequest request,
			Project project, String versionId) {
		String portalUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + 
			request.getContextPath();
		
		String launchVLEUrl;
		if(versionId != null && versionId != ""){
			launchVLEUrl = "/preview.html?projectId=" + project.getId() + "&versionId=" + versionId;
		} else {
			launchVLEUrl = "/preview.html?projectId=" + project.getId();
		}
		
		String isConstraintsDisabledStr = request.getParameter("isConstraintsDisabled");
		if (isConstraintsDisabledStr != null) {
			launchVLEUrl += "&isConstraintsDisabled="+isConstraintsDisabledStr;
		}
		
		return portalUrl + launchVLEUrl;
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#removeBookmarkerFromProject(org.telscenter.sail.webapp.domain.project.Project, net.sf.sail.webapp.domain.User)
	 */
	@Transactional()
	public void removeBookmarkerFromProject(Project project, User bookmarker){
		project.getBookmarkers().remove(bookmarker);
		this.projectDao.save(project);
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#updateProject(org.telscenter.sail.webapp.domain.project.Project)
	 */
	@Transactional()
	public void updateProject(Project project, User user) throws NotAuthorizedException{
		if(user.isAdmin() || this.aclService.hasPermission(project, BasePermission.ADMINISTRATION, user) ||
				this.aclService.hasPermission(project, BasePermission.WRITE, user)){
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
		String portalUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + 
			request.getContextPath();
		String launchVLE = "/student/vle/vle.html?runId=" + run.getId() + "&workgroupId=" + workgroup.getId();
		return portalUrl + launchVLE;
	}

	/**
	 * Creates a PreviewRun for this project and
	 * set it in this project
	 * @param project
	 * @throws ObjectNotFoundException 
	 */
	@Transactional
	protected void createPreviewRun(Project project) throws ObjectNotFoundException {
		RunParameters runParameters = new RunParameters();
		runParameters.setCurnitId(project.getCurnit().getId());
		runParameters.setJnlpId(null);
		runParameters.setName(PREVIEW_RUN_NAME);
		runParameters.setOwners(null);
		runParameters.setPeriodNames(PREVIEW_PERIOD_NAMES);
		runParameters.setProject(project);
		Run previewRun = this.runService.createRun(runParameters);
		project.setPreviewRun(previewRun);
		this.projectDao.save(project);
	}

	/**
	 * @param curnitService the curnitService to set
	 */
	public void setCurnitService(CurnitService curnitService) {
		this.curnitService = curnitService;
	}

	/**
	 * @param projectDao the projectDao to set
	 */
	public void setProjectDao(ProjectDao<Project> projectDao) {
		this.projectDao = projectDao;
	}

	/**
	 * @param aclService the aclService to set
	 */
	public void setAclService(AclService<Project> aclService) {
		this.aclService = aclService;
	}

	/**
	 * @param userService the userService to set
	 */
	public void setUserService(UserService userService) {
		this.userService = userService;
	}

	/**
	 * @param runService the runService to set
	 */
	public void setRunService(RunService runService) {
		this.runService = runService;
	}

	public Object launchReport(LaunchReportParameters launchReportParameters) {
		// do nothing for now
		return null;
	}
	
	/**
	 * @param portalProperties the portal properties to set
	 */
	public void setPortalProperties(Properties portalProperties) {
		this.portalProperties = portalProperties;
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getAllProjectsList()
	 */
	@Transactional
	public List<Project> getAllProjectsList() {
		List<Project> projectList = this.projectDao.getList();
    	for (Project project : projectList) {
				project.populateProjectInfo();
    	}	
		return projectList;
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getProjectList(java.lang.String)
	 */
	@Transactional
	public List<Project> getProjectList(String query){
		List<Project> projectList = this.projectDao.getProjectList(query);
		
		for(Project project : projectList){
			project.populateProjectInfo();
		}
		
		return projectList;
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#minifyProject(org.telscenter.sail.webapp.domain.project.Project)
	 */
	public String minifyProject(Project project) {
		String curriculumBaseDir = this.portalProperties.getProperty("curriculum_base_dir");
		String minifyUrl = this.portalProperties.getProperty("vlewrapper_baseurl") + "/util/minifier.html";
		String projectUrl = (String) project.getCurnit().accept(new CurnitGetCurnitUrlVisitor());
		String params = "command=minifyProject&path=" + curriculumBaseDir + "/" + projectUrl;
		
		if(projectUrl != null && projectUrl != ""){
			try{
				String response = Connector.request(minifyUrl, params);
				
				/* process the response text */
				if(response.equals("success")){
					return "Project has been successfully minified!";
				} else if(response.equals("current")){
					return "Project minification is current, no need to minify";
				} else {
					return response + " was returned from the minifier, check error and retry if necessary.";
				}
			} catch (MalformedURLException e){
				e.printStackTrace();
				return "The url to the minifier is invalid, cannot minify the project.";
			} catch (IOException e){
				e.printStackTrace();
				return "Connection to the minifier failed, cannot minify the project.";
			}
		} else {
			return "Unable to retrieve the url of the project, cannot minify the project.";
		}
	}

	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#canCreateRun(org.telscenter.sail.webapp.domain.project.Project, net.sf.sail.webapp.domain.User)
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
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#canAuthorProject(org.telscenter.sail.webapp.domain.project.Project, net.sf.sail.webapp.domain.User)
	 */
	public boolean canAuthorProject(Project project, User user) {
		return user.isAdmin() || this.aclService.hasPermission(project, BasePermission.ADMINISTRATION, user) ||
			this.aclService.hasPermission(project, BasePermission.WRITE, user);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#canReadProject(org.telscenter.sail.webapp.domain.project.Project, net.sf.sail.webapp.domain.User)
	 */
	public boolean canReadProject(Project project, User user) {
		return user.isAdmin() || this.aclService.hasPermission(project, BasePermission.ADMINISTRATION, user) ||
			this.aclService.hasPermission(project, BasePermission.WRITE, user) ||
			this.aclService.hasPermission(project, BasePermission.READ, user);
	}


	public ProjectMetadata getMetadata(Long projectId) {
		Project project = null;
		ProjectMetadata metadata = null;
		
		try {
			project = getById(projectId);
			metadata = project.getMetadata();
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		}

		return metadata;
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#sortProjectsByDateCreated(java.util.List)
	 */
	public void sortProjectsByDateCreated(List<Project> projectList) {
		// TODO Auto-generated method stub
		
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#addTagToProject(org.telscenter.sail.webapp.domain.project.Tag, org.telscenter.sail.webapp.domain.project.Project)
	 */
	@Transactional
	public Long addTagToProject(Tag tag, Long projectId){
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
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#addTagToProject(java.lang.String, org.telscenter.sail.webapp.domain.project.Project)
	 */
	public Long addTagToProject(String tag, Long projectId) {
		return this.addTagToProject(this.tagService.createOrGetTag(tag), projectId);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#removeTagFromProject(java.lang.String, org.telscenter.sail.webapp.domain.project.Project)
	 */
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
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#updateTag(java.lang.Long, java.lang.Long, java.lang.String)
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
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#isAuthorizedToCreateTag(net.sf.sail.webapp.domain.User, java.lang.String)
	 */
	public boolean isAuthorizedToCreateTag(User user, String name) {
		if(name.toLowerCase().equals("library") && !user.getUserDetails().hasGrantedAuthority(UserDetailsService.ADMIN_ROLE)){
			return false;
		}
		
		return true;
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#projectContainsTag(java.lang.Long, java.lang.String)
	 */
	public boolean projectContainsTag(Long projectId, String name) {
		Project project = null;
		
		try {
			project = this.getById(projectId);
			project.getTags().size();  // force-fetch project tags from db
			for(Tag t : project.getTags()){
				if(t.getName().toLowerCase().equals(name.toLowerCase())){
					return true;
				}
			}
		} catch(ObjectNotFoundException e){
			e.printStackTrace();
		}

		return false;
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getProjectListByTagName(java.lang.String)
	 */
	@Transactional
	public List<Project> getProjectListByTagName(String tagName) {
		Set<String> tagNames = new TreeSet<String>();
		tagNames.add(tagName);
		return this.getProjectListByTagNames(tagNames);
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getProjectListByTagNames(java.util.Set)
	 */
	@Transactional
	public List<Project> getProjectListByTagNames(Set<String> tagNames) {
		return this.projectDao.getProjectListByTagNames(tagNames);
	}
	
	/**
	 * @param tagService the tagService to set
	 */
	public void setTagService(TagService tagService) {
		this.tagService = tagService;
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getProjectCopies(java.lang.Long)
	 */
	public List<Project> getProjectCopies(Long projectId) {
		return this.projectDao.getProjectCopies(projectId);
	}
	
	/**
	 * @throws ObjectNotFoundException 
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#identifyRootProjectId(java.lang.Long)
	 */
	public Long identifyRootProjectId(Project project) throws ObjectNotFoundException {
		if(project == null) {
			return null;
		} else {
			Long parentProjectId = project.getParentProjectId();
			if(parentProjectId == null || this.projectContainsTag((Long)project.getId(), "library")){
				return (Long)project.getId();
			} else {
				Project parentProject = this.getById(parentProjectId);
				return this.identifyRootProjectId(parentProject);
			}
		}
	}

	@Override
	public void sortProjectsByLastEdited(List<Project> projectList) {
		// TODO Auto-generated method stub
		
	}
	
	public PremadeCommentService getPremadeCommentService() {
		return premadeCommentService;
	}

	public void setPremadeCommentService(PremadeCommentService premadeCommentService) {
		this.premadeCommentService = premadeCommentService;
	}
}
