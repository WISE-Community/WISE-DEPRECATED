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
package org.telscenter.sail.webapp.service.project.impl;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.dao.workgroup.WorkgroupDao;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;
import org.telscenter.sail.webapp.dao.project.ProjectCommunicatorDao;
import org.telscenter.sail.webapp.dao.project.ProjectDao;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.impl.AddSharedTeacherParameters;
import org.telscenter.sail.webapp.domain.impl.ProjectParameters;
import org.telscenter.sail.webapp.domain.project.ExternalProject;
import org.telscenter.sail.webapp.domain.project.FamilyTag;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.domain.project.ProjectCommunicator;
import org.telscenter.sail.webapp.domain.project.ProjectInfo;
import org.telscenter.sail.webapp.domain.project.ProjectMetadata;
import org.telscenter.sail.webapp.domain.project.Tag;
import org.telscenter.sail.webapp.domain.project.impl.AuthorProjectParameters;
import org.telscenter.sail.webapp.domain.project.impl.ExternalProjectImpl;
import org.telscenter.sail.webapp.domain.project.impl.LaunchProjectParameters;
import org.telscenter.sail.webapp.domain.project.impl.LaunchReportParameters;
import org.telscenter.sail.webapp.domain.project.impl.PreviewProjectParameters;
import org.telscenter.sail.webapp.domain.project.impl.ProjectTypeVisitor;
import org.telscenter.sail.webapp.domain.workgroup.WISEWorkgroup;
import org.telscenter.sail.webapp.presentation.util.json.JSONObject;
import org.telscenter.sail.webapp.service.offering.RunService;
import org.telscenter.sail.webapp.service.project.ExternalProjectService;

/**
 * DIY Project Service implementation. Speaks to the DIY portal remotely.
 * 
 * @author Hiroki Terashima
 * @author Scott Cytacki
 * @version $Id$
 */
public class ExternalProjectServiceImpl implements ExternalProjectService {

	private ProjectCommunicatorDao<ProjectCommunicator> projectCommunicatorDao;

	private RunService runService;
	
	/**
	 * @param runService the runService to set
	 */
	public void setRunService(RunService runService) {
		this.runService = runService;
	}

	protected ProjectDao<Project> projectDao;
	
	protected WorkgroupDao<Workgroup> workgroupDao;
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#authorProject(org.telscenter.sail.webapp.domain.project.impl.AuthorProjectParameters)
	 */
	public Object authorProject(AuthorProjectParameters authorProjectParameters)
			throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#createProject(org.telscenter.sail.webapp.domain.impl.ProjectParameters)
	 */
	public Project createProject(ProjectParameters projectParameters)
			throws ObjectNotFoundException {
		// TODO Auto-generated method stub
		return null;
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getById(java.io.Serializable)
	 */
	public Project getById(Serializable projectId)
			throws ObjectNotFoundException {
		// TODO Auto-generated method stub
		return this.projectDao.getById(projectId);
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ExternalProjectService#getExternalProjectList()
	 */
	public List<ExternalProject> getExternalProjectList() {
		List<ExternalProject> allExternalProjectList = new ArrayList<ExternalProject>();
		List<ProjectCommunicator> projectCommunicatorlist = this.projectCommunicatorDao.getList();
		for (ProjectCommunicator projectCommunicator : projectCommunicatorlist) {
			List<ExternalProject> projectList = projectCommunicator.getProjectList();
			allExternalProjectList.addAll(projectList);
		}
		return allExternalProjectList;
	}
	
	/**
	 * @throws ObjectNotFoundException 
	 * @see org.telscenter.sail.webapp.service.project.ExternalProjectService#importProject(org.telscenter.sail.webapp.domain.project.ExternalProject)
	 */
	@Transactional()
	public void importProject(Long externalId, Serializable projectCommunicatorId) 
	    throws ObjectNotFoundException {
		ProjectCommunicator projectCommunicator = this.projectCommunicatorDao.getById(projectCommunicatorId);
		ExternalProject externalProject = new ExternalProjectImpl();
		externalProject.setExternalId(externalId);
		externalProject.setProjectCommunicator(projectCommunicator);
		externalProject.setName(externalId.toString());
		this.projectDao.save(externalProject);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getProjectList()
	 */
	public List<Project> getProjectList() {
		// look in the internal database
		// make sure that projects are external projects
		List<Project> externalProjectList = new ArrayList<Project>();
    	List<Project> projectlist = this.projectDao.getList();
		ProjectTypeVisitor typeVisitor = new ProjectTypeVisitor();
    	for (Project externalproject : projectlist) {
    		externalproject.populateProjectInfo();
    		String result = (String) externalproject.accept(typeVisitor);
    		if (result.equals("ExternalProject")) {
    			externalProjectList.add(externalproject);
    		}
    	
    	}
		return externalProjectList;
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getProjectListByInfo(org.telscenter.sail.webapp.domain.project.ProjectInfo)
	 */
	public List<Project> getProjectListByInfo(ProjectInfo info)
			throws ObjectNotFoundException {
		// TODO Auto-generated method stub
		return null;
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getProjectListByTag(org.telscenter.sail.webapp.domain.project.FamilyTag)
	 */
	public List<Project> getProjectListByTag(FamilyTag tag)
			throws ObjectNotFoundException {
		// TODO Auto-generated method stub
		return null;
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getProjectListByTag(java.lang.String)
	 */
	public List<Project> getProjectListByTag(String tag)
			throws ObjectNotFoundException {
		// TODO Auto-generated method stub
		return null;
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#launchProject(org.telscenter.sail.webapp.domain.project.impl.LaunchProjectParameters)
	 */
	@Transactional(readOnly = false)
	public Object launchProject(LaunchProjectParameters launchProjectParameters)
			throws Exception {
		WISEWorkgroup workgroup = launchProjectParameters.getWorkgroup();
		ExternalProject project = null;
		try {
			project = (ExternalProject) projectDao.getById(launchProjectParameters.getRun().getProject().getId());
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		}
		
		if (workgroup.getExternalId() == null) {
			// maybe it was supposed to figure out the external id if it was null to create the user in the diy. nobody knows.
		}
		ProjectCommunicator projectCommunicator = project.getProjectCommunicator();
		projectCommunicator.setRunService(runService); 		// why? because the projectCommunicator is retrieved from DB, not instantiated via Spring
		projectCommunicator.setProjectService(this);
		return new ModelAndView(new RedirectView(projectCommunicator.getLaunchProjectUrl(this, launchProjectParameters)));
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#launchReport(org.telscenter.sail.webapp.domain.project.impl.LaunchReportParameters)
	 */
	public Object launchReport(LaunchReportParameters launchReportParameters) {
		Run run = launchReportParameters.getRun();
		ProjectTypeVisitor typeVisitor = new ProjectTypeVisitor();
		String result = (String) run.getProject().accept(typeVisitor);
		Project project = null;
		try {
			project = projectDao.getById(run.getProject().getId());
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		}
		if (result == "ExternalProject" && project != null) {
		ProjectCommunicator projectCommunicator = ((ExternalProject) project).getProjectCommunicator();
		projectCommunicator.setRunService(runService); 		// why? because the projectCommunicator is retrieved from DB, not instantiated via Spring
		projectCommunicator.setProjectService(this);
		String launchReportUrlString = projectCommunicator.getLaunchReportUrl(launchReportParameters);
			return new ModelAndView(new RedirectView(launchReportUrlString));
		} else {
			return null;
		}
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#previewProject(org.telscenter.sail.webapp.domain.project.impl.PreviewProjectParameters)
	 */
	public Object previewProject(
			PreviewProjectParameters previewProjectParameters) throws Exception {
		return ((ExternalProject) previewProjectParameters.getProject()).launchPreview();
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#updateProject(org.telscenter.sail.webapp.domain.project.Project)
	 */
	@Transactional()
	public void updateProject(Project project, User user) {
		this.projectCommunicatorDao.save(((ExternalProject) project).getProjectCommunicator());
		this.projectDao.save(project);
	}

	/**
	 * @return the projectDao
	 */
	public ProjectDao<Project> getProjectDao() {
		return projectDao;
	}

	/**
	 * @param projectDao the projectDao to set
	 */
	public void setProjectDao(ProjectDao<Project> projectDao) {
		this.projectDao = projectDao;
	}

	/**
	 * @return the projectCommunicatorDao
	 */
	public ProjectCommunicatorDao<ProjectCommunicator> getProjectCommunicatorDao() {
		return projectCommunicatorDao;
	}

	/**
	 * @param projectCommunicatorDao the projectCommunicatorDao to set
	 */
	public void setProjectCommunicatorDao(
			ProjectCommunicatorDao<ProjectCommunicator> projectCommunicatorDao) {
		this.projectCommunicatorDao = projectCommunicatorDao;
	}

	public ProjectCommunicator getProjectCommunicator() {
		// TODO Auto-generated method stub
		return null;
	}

	public void setProjectCommunicator(ProjectCommunicator projectCommunicator) {
		// TODO Auto-generated method stub
		
	}

	public void addSharedTeacherToProject(
			AddSharedTeacherParameters addSharedTeacherParameters)
			throws ObjectNotFoundException {
		// TODO Auto-generated method stub
		
	}

	public List<Project> getProjectList(User user) {
		// TODO Auto-generated method stub
		return null;
	}

	public String getSharedTeacherRole(Project project, User user) {
		// TODO Auto-generated method stub
		return null;
	}

	public List<Project> getSharedProjectList(User user) {
		// TODO Auto-generated method stub
		return null;
	}

	/**
	 * @return the workgroupDao
	 */
	public WorkgroupDao<Workgroup> getWorkgroupDao() {
		return workgroupDao;
	}

	/**
	 * @param workgroupDao the workgroupDao to set
	 */
	public void setWorkgroupDao(WorkgroupDao<Workgroup> workgroupDao) {
		this.workgroupDao = workgroupDao;
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getBookmarkerProjectList(net.sf.sail.webapp.domain.User)
	 */
	public List<Project> getBookmarkerProjectList(User user){
		//TODO
		return null;
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#addBookmarkerToProject(org.telscenter.sail.webapp.domain.project.Project, net.sf.sail.webapp.domain.User)
	 */
	public void addBookmarkerToProject(Project project, User bookmarker) throws ObjectNotFoundException {
		//TODO
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#removeBookmarkerFromProject(org.telscenter.sail.webapp.domain.project.Project, net.sf.sail.webapp.domain.User)
	 */
	public void removeBookmarkerFromProject(Project project, User bookmarker) throws ObjectNotFoundException {
		//TODO
	}

	public List<Project> getAllProjectsList() {
		// TODO Auto-generated method stub
		return null;
	}

	public List<Project> getProjectList(String query) {
		// TODO Auto-generated method stub
		return null;
	}

	public String minifyProject(Project project) {
		return null;
	}

	public JSONObject getProjectMetadataFile(Project project) {
		// TODO Auto-generated method stub
		return null;
	}

	public boolean canCreateRun(Project project, User user) {
		// TODO Auto-generated method stub
		return false;
	}

	public boolean canAuthorProject(Project project, User user) {
		// TODO Auto-generated method stub
		return false;
	}

	public boolean canReadProject(Project project, User user) {
		// TODO Auto-generated method stub
		return false;
	}

	public List<Project> getAdminProjectList() {
		// TODO Auto-generated method stub
		return null;
	}
	
		public String getActiveVersion(Project project) {
		// TODO Auto-generated method stub
		return null;
	}

	public String takeSnapshot(Project project, String username,
			String snapshotName) {
		// TODO Auto-generated method stub
		return null;
	}

	public ProjectMetadata getMetadata(Long projectId) {
		// TODO Auto-generated method stub
		return null;
	}

	public void sortProjectsByDateCreated(List<Project> projectList) {
		// TODO Auto-generated method stub
		
	}
	
	public Long addTagToProject(Tag tag, Long projectId) {
		// TODO Auto-generated method stub
		return null;
	}

	public Long addTagToProject(String tag, Long projectId) {
		// TODO Auto-generated method stub
		return null;
	}

	public List<Project> getProjectListByTagName(String tagName) {
		// TODO Auto-generated method stub
		return null;
	}

	public List<Project> getProjectListByTagNames(Set<String> tagNames) {
		// TODO Auto-generated method stub
		return null;
	}

	public boolean isAuthorizedToCreateTag(User user, String name) {
		// TODO Auto-generated method stub
		return false;
	}

	public boolean projectContainsTag(Long projectId, String name) {
		// TODO Auto-generated method stub
		return false;
	}

	public void removeTagFromProject(Long tagId, Long projectId) {
		// TODO Auto-generated method stub
		
	}

	public Long updateTag(Long tagId, Long projectId, String name) {
		// TODO Auto-generated method stub
		return null;
	}

	public List<Project> getProjectCopies(Long projectId) {
		// TODO Auto-generated method stub
		return null;
	}

	public void removeSharedTeacherFromProject(String username, Project project)
			throws ObjectNotFoundException {
		// TODO Auto-generated method stub
		
	}

	public Project getProjectFull(Long projectId)
			throws ObjectNotFoundException {
		// TODO Auto-generated method stub
		return null;
	}

	public Long identifyRootProjectId(Project projectId)
			throws ObjectNotFoundException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void sortProjectsByLastEdited(List<Project> projectList) {
		// TODO Auto-generated method stub
		
	}
}
