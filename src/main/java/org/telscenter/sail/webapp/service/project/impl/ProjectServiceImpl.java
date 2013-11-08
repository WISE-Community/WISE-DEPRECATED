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
import java.util.Comparator;
import java.util.List;
import java.util.Set;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.service.NotAuthorizedException;

import org.springframework.transaction.annotation.Transactional;
import org.telscenter.sail.webapp.domain.impl.AddSharedTeacherParameters;
import org.telscenter.sail.webapp.domain.impl.ProjectParameters;
import org.telscenter.sail.webapp.domain.project.FamilyTag;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.domain.project.ProjectInfo;
import org.telscenter.sail.webapp.domain.project.ProjectMetadata;
import org.telscenter.sail.webapp.domain.project.Tag;
import org.telscenter.sail.webapp.domain.project.impl.AuthorProjectParameters;
import org.telscenter.sail.webapp.domain.project.impl.LaunchProjectParameters;
import org.telscenter.sail.webapp.domain.project.impl.LaunchReportParameters;
import org.telscenter.sail.webapp.domain.project.impl.PreviewProjectParameters;
import org.telscenter.sail.webapp.domain.project.impl.ProjectImpl;
import org.telscenter.sail.webapp.domain.project.impl.ProjectType;
import org.telscenter.sail.webapp.presentation.util.json.JSONObject;
import org.telscenter.sail.webapp.service.project.ProjectService;
import org.telscenter.sail.webapp.service.project.ProjectServiceFactory;

import edu.emory.mathcs.backport.java.util.Collections;

/**
 * TELS Portal can offer multiple types of projects, including:
 *  Learning-Design-inspired LD Projects
 *  POD Projects (no longer supported)
 *  POTrunk Projects (no longer supported)
 *  OTrunk Projects (no longer supported)
 *  
 * There is a service for handling each type of project. ProjectServiceImpl
 * uses a factory pattern to determine which projectservice to use at runtime.
 * 
 * @author Hiroki Terashima
 * @version $Id$
 */
public class ProjectServiceImpl implements ProjectService {

	private ProjectServiceFactory projectServiceFactory;
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getAllProjectsList()
	 */
	public List<Project> getAllProjectsList(){
		ProjectService projectService = projectServiceFactory.getProjectService(new ProjectImpl());
		return projectService.getAllProjectsList();
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#authorProject(org.telscenter.sail.webapp.domain.project.impl.AuthorProjectParameters)
	 */
	public Object authorProject(AuthorProjectParameters authorProjectParameters)
			throws Exception {
		ProjectService projectService = projectServiceFactory.getProjectService(authorProjectParameters.getProject());
		return projectService.authorProject(authorProjectParameters);
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#createProject(org.telscenter.sail.webapp.domain.impl.ProjectParameters)
	 */
	public Project createProject(ProjectParameters projectParameters)
			throws ObjectNotFoundException {
		ProjectService projectService = projectServiceFactory.getProjectService(projectParameters.getProjectType());
		return projectService.createProject(projectParameters);
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getById(java.lang.Long)
	 */
    @Transactional(readOnly = true)
	public Project getById(Serializable projectId) throws ObjectNotFoundException {
		ProjectService projectService = projectServiceFactory.getProjectService(new ProjectImpl());
		return projectService.getById(projectId);
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getProjectList()
	 */
	public List<Project> getProjectList() {
		ProjectService projectService = projectServiceFactory.getProjectService(new ProjectImpl());
		return projectService.getProjectList();
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getProjectList(net.sf.sail.webapp.domain.User)
	 */
	public List<Project> getProjectList(User user) {
		ProjectService projectService = projectServiceFactory.getProjectService(new ProjectImpl());
		return projectService.getProjectList(user);
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getSharedProjectList(net.sf.sail.webapp.domain.User)
	 */
	public List<Project> getSharedProjectList(User user) {
		ProjectService projectService = projectServiceFactory.getProjectService(new ProjectImpl());
		return projectService.getSharedProjectList(user);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getBookmarkerProjectList(net.sf.sail.webapp.domain.User)
	 */
	public List<Project> getBookmarkerProjectList(User user) throws ObjectNotFoundException{
		ProjectService projectService = projectServiceFactory.getProjectService(new ProjectImpl());
		return projectService.getBookmarkerProjectList(user);
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getProjectListByInfo(org.telscenter.sail.webapp.domain.project.ProjectInfo)
	 */
	public List<Project> getProjectListByInfo(ProjectInfo info)
			throws ObjectNotFoundException {
		ProjectService projectService = projectServiceFactory.getProjectService(new ProjectImpl());
		return projectService.getProjectListByInfo(info);
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getProjectListByTag(org.telscenter.sail.webapp.domain.project.FamilyTag)
	 */
	public List<Project> getProjectListByTag(FamilyTag tag)
			throws ObjectNotFoundException {
		ProjectService projectService = projectServiceFactory.getProjectService(new ProjectImpl());
		return projectService.getProjectListByTag(tag);
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getProjectListByTag(java.lang.String)
	 */
	public List<Project> getProjectListByTag(String tag)
			throws ObjectNotFoundException {
		ProjectService projectService = projectServiceFactory.getProjectService(new ProjectImpl());
		return projectService.getProjectListByTag(tag);
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#launchProject(org.telscenter.sail.webapp.domain.project.impl.LaunchProjectParameters)
	 */
	public Object launchProject(LaunchProjectParameters launchProjectParameters)
			throws Exception {
		ProjectService projectService = projectServiceFactory.getProjectService(launchProjectParameters.getRun().getProject());
		return projectService.launchProject(launchProjectParameters);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#launchReport(org.telscenter.sail.webapp.domain.project.impl.LaunchReportParameters)
	 */
	public Object launchReport(LaunchReportParameters launchReportParameters) {
		ProjectService projectService = projectServiceFactory.getProjectService(launchReportParameters.getRun().getProject());
		return projectService.launchReport(launchReportParameters);
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#previewProject(org.telscenter.sail.webapp.domain.project.impl.PreviewProjectParameters)
	 */
	public Object previewProject(
			PreviewProjectParameters previewProjectParameters) throws Exception {
		ProjectService projectService = projectServiceFactory.getProjectService(previewProjectParameters.getProject());
		return projectService.previewProject(previewProjectParameters);
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#updateProject(org.telscenter.sail.webapp.domain.project.Project)
	 */
	public void updateProject(Project project, User user) throws NotAuthorizedException{
		ProjectService projectService = projectServiceFactory.getProjectService(project);
		projectService.updateProject(project, user);
	}

	/**
	 * @param projectServiceFactory the projectServiceFactory to set
	 */
	public void setProjectServiceFactory(ProjectServiceFactory projectServiceFactory) {
		this.projectServiceFactory = projectServiceFactory;
	}

	/**
	 * @throws ObjectNotFoundException 
	 * @override @see org.telscenter.sail.webapp.service.offering.RunService#addSharedTeacherToRun(org.telscenter.sail.webapp.domain.impl.AddSharedTeacherParameters)
	 */
	public void addSharedTeacherToProject(
			AddSharedTeacherParameters addSharedTeacherParameters) throws ObjectNotFoundException {
		ProjectService projectService = projectServiceFactory.getProjectService(addSharedTeacherParameters.getProject());
		projectService.addSharedTeacherToProject(addSharedTeacherParameters);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#removeSharedTeacherFromProject(java.lang.String, java.lang.Long)
	 */
	public void removeSharedTeacherFromProject(String username, Project project) throws ObjectNotFoundException {
		ProjectService projectService = projectServiceFactory.getProjectService(project);
		projectService.removeSharedTeacherFromProject(username, project);

	}

	
	public String getSharedTeacherRole(Project project, User user) {
		ProjectService projectService = projectServiceFactory.getProjectService(project);
		return projectService.getSharedTeacherRole(project, user);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#addBookmarkerToProject(net.sf.sail.webapp.domain.User)
	 */
	public void addBookmarkerToProject(Project project, User user) throws ObjectNotFoundException{
		ProjectService projectService = projectServiceFactory.getProjectService(project);
		projectService.addBookmarkerToProject(project, user);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#removeBookmarkerFromProject(net.sf.sail.webapp.domain.User)
	 */
	public void removeBookmarkerFromProject(Project project, User user) throws ObjectNotFoundException{
		ProjectService projectService = projectServiceFactory.getProjectService(project);
		projectService.removeBookmarkerFromProject(project, user);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getProjectList(java.lang.String)
	 */
	public List<Project> getProjectList(String query){
		ProjectService projectService = projectServiceFactory.getProjectService(new ProjectImpl());
		return projectService.getProjectList(query);
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#minifyProject(org.telscenter.sail.webapp.domain.project.Project)
	 */
	public String minifyProject(Project project){
		ProjectService projectService = projectServiceFactory.getProjectService(project);
		return projectService.minifyProject(project);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#canCreateRun(org.telscenter.sail.webapp.domain.project.Project, net.sf.sail.webapp.domain.User)
	 */
	public boolean canCreateRun(Project project, User user){
		ProjectService projectService = projectServiceFactory.getProjectService(project);
		return projectService.canCreateRun(project, user);
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#canAuthorProject(org.telscenter.sail.webapp.domain.project.Project, net.sf.sail.webapp.domain.User)
	 */
	public boolean canAuthorProject(Project project, User user) {
		if(project == null){
			return false;
		} else {
			ProjectService projectService = projectServiceFactory.getProjectService(project);
			return projectService.canAuthorProject(project, user);
		}
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#canReadProject(org.telscenter.sail.webapp.domain.project.Project, net.sf.sail.webapp.domain.User)
	 */
	public boolean canReadProject(Project project, User user){
		if(project == null){
			return false;
		} else {
			ProjectService projectService = projectServiceFactory.getProjectService(project);
			return projectService.canReadProject(project, user);
		}
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getAdminProjectList()
	 */
	public List<Project> getAdminProjectList(){
		return projectServiceFactory.getProjectService(new ProjectImpl()).getAdminProjectList();
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getMetadata(java.lang.Long, java.lang.String)
	 */
	@Transactional
	public ProjectMetadata getMetadata(Long projectId){
		Project project;
		try{
			project = this.getById(projectId);
		} catch (ObjectNotFoundException e){
			e.printStackTrace();
			return null;
		}
		ProjectService projectService = projectServiceFactory.getProjectService(project);
		return projectService.getMetadata(projectId);
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#sortProjectsByDateCreated(java.util.List)
	 */
	public void sortProjectsByDateCreated(List<Project> projectList){
		Collections.sort(projectList, new ProjectComparatorByEarliestDate());
	}
	
	/**
	 * Helper class for sorting projects by date created.
	 * 
	 * @author patrick lawler
	 * @version $Id$
	 */
	private class ProjectComparatorByEarliestDate implements Comparator<Project> {

		public int compare(Project p1, Project p2) {
			return p2.getDateCreated().compareTo(p1.getDateCreated());
		}
		
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#sortProjectsByLastEdited(java.util.List)
	 */
	public void sortProjectsByLastEdited(List<Project> projectList){
		Collections.sort(projectList, new ProjectComparatorByLastEdited());
	}
	
	/**
	 * Helper class for sorting projects by last edited.
	 * 
	 * @author jonathan lim-breitbart
	 * @version $Id$
	 */
	private class ProjectComparatorByLastEdited implements Comparator<Project> {

		public int compare(Project p1, Project p2) {
			if (p1.getMetadata().getLastEdited() == null || p2.getMetadata().getLastEdited() == null)
		        return 0;
			return -p1.getMetadata().getLastEdited().compareTo(p2.getMetadata().getLastEdited());
		}
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#addTagToProject(java.lang.String, org.telscenter.sail.webapp.domain.project.Project)
	 */
	@Transactional
	public Long addTagToProject(String tag, Long projectId) {
		ProjectService projectService = projectServiceFactory.getProjectService(ProjectType.LD);
		return projectService.addTagToProject(tag, projectId);
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#addTagToProject(org.telscenter.sail.webapp.domain.project.Tag, org.telscenter.sail.webapp.domain.project.Project)
	 */
	@Transactional
	public Long addTagToProject(Tag tag, Long projectId) {
		ProjectService projectService = projectServiceFactory.getProjectService(ProjectType.LD);
		return projectService.addTagToProject(tag, projectId);
	}



	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#removeTagFromProject(org.telscenter.sail.webapp.domain.project.Tag, org.telscenter.sail.webapp.domain.project.Project)
	 */
	@Transactional
	public void removeTagFromProject(Long tagId, Long projectId) {
		ProjectService projectService = projectServiceFactory.getProjectService(ProjectType.LD);
		projectService.removeTagFromProject(tagId, projectId);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#updateTag(java.lang.Long, java.lang.Long, java.lang.String)
	 */
	@Transactional
	public Long updateTag(Long tagId, Long projectId, String name) {
		ProjectService projectService = this.projectServiceFactory.getProjectService(ProjectType.LD);
		return projectService.updateTag(tagId, projectId, name);
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#isAuthorizedToCreateTag(net.sf.sail.webapp.domain.User, java.lang.String)
	 */
	public boolean isAuthorizedToCreateTag(User user, String name) {
		ProjectService projectService = this.projectServiceFactory.getProjectService(ProjectType.LD);
		return projectService.isAuthorizedToCreateTag(user, name);
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#projectContainsTag(java.lang.Long, java.lang.String)
	 */
	public boolean projectContainsTag(Long projectId, String name) {
		ProjectService projectService = this.projectServiceFactory.getProjectService(ProjectType.LD);
		return projectService.projectContainsTag(projectId, name);
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getProjectListByTagName(java.lang.String)
	 */
	@Transactional
	public List<Project> getProjectListByTagName(String tagName) {
		ProjectService projectService = this.projectServiceFactory.getProjectService(ProjectType.LD);
		return projectService.getProjectListByTagName(tagName);
	}

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getProjectListByTagNames(java.util.Set)
	 */
	@Transactional
	public List<Project> getProjectListByTagNames(Set<String> tagNames) {
		ProjectService projectService = this.projectServiceFactory.getProjectService(ProjectType.LD);
		return projectService.getProjectListByTagNames(tagNames);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#getProjectCopies(java.util.Set)
	 */
	@Transactional
	public List<Project> getProjectCopies(Long projectId) {
		ProjectService projectService = this.projectServiceFactory.getProjectService(ProjectType.LD);
		return projectService.getProjectCopies(projectId);
	}
	
	/**
	 * @throws ObjectNotFoundException 
	 * @see org.telscenter.sail.webapp.service.project.ProjectService#identifyRootProjectId(java.util.Set)
	 */
	@Transactional
	public Long identifyRootProjectId(Project project) throws ObjectNotFoundException {
		ProjectService projectService = this.projectServiceFactory.getProjectService(ProjectType.LD);
		return projectService.identifyRootProjectId(project);
	}
}
