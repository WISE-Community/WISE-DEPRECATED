/**
 * 
 */
package org.wise.portal.presentation.web.controllers.teacher.management;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.wise.portal.domain.module.impl.CurnitGetCurnitUrlVisitor;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.project.ProjectService;

/**
 * Controller for WISE library page
 * @author Hiroki Terashima
 * @author Jonathan Lim-Breitbart
 */
public class LibraryController extends AbstractController {
	
	// path to project thumb image relative to project folder
	private static final String PROJECT_THUMB_PATH = "/assets/project_thumb.png";
	
	private ProjectService projectService;

	private RunService runService;
	
	private Properties wiseProperties;

	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		User user = ControllerUtil.getSignedInUser();
		
		// get library projects
		Set<String> tagNames = new HashSet<String>();
		tagNames.add("library");
		List<Project> libraryProjectsList = this.projectService.getProjectListByTagNames(tagNames);
		
		// get user's owned projects
		List<Project> ownedProjectsList = this.projectService.getProjectList(user);
		
		// get user's shared projects
		List<Project> sharedProjectsList = this.projectService.getSharedProjectList(user);
		sharedProjectsList.removeAll(ownedProjectsList);
		
		// a set to hold the list of project ids in user's library
		Set<Long> projectIds = new HashSet<Long>();
		
		// set root project ids, remove duplicates
		List<Project> ownedRemove = new ArrayList<Project>();
		for (int i = 0; i < ownedProjectsList.size(); i++) {
			Project ownedProject = ownedProjectsList.get(i);
			ownedProject.setRootProjectId(this.projectService.identifyRootProjectId(ownedProject));
			
			// check if project is in WISE library. if yes, we want to remove it from owned project list
			if (ownedProject.hasTags(tagNames)) {
				ownedRemove.add(ownedProject);
			} else {
				projectIds.add((Long) ownedProject.getId());				
			}
		}
		// if project is in WISE library, remove from owned projects list (avoid duplicates)
		ownedProjectsList.removeAll(ownedRemove);
		
		List<Project> sharedRemove = new ArrayList<Project>();
		for (int a = 0; a < sharedProjectsList.size(); a++) {
			Project sharedProject = sharedProjectsList.get(a);
			sharedProject.setRootProjectId(this.projectService.identifyRootProjectId(sharedProject));
			
			
			// check if project is in WISE library. if yes, we want to remove it from shared project list
			if (sharedProject.hasTags(tagNames)) {
				sharedRemove.add(sharedProject);
			} else {
				projectIds.add((Long)sharedProject.getId());				
			}
		}
		// if project is in WISE library, remove from shared projects list (avoid duplicates)
		sharedProjectsList.removeAll(sharedRemove);
		
		for (int x = 0; x < libraryProjectsList.size(); x++) {
			Project libraryProject = libraryProjectsList.get(x);
			Long libraryProjectId = (Long)libraryProject.getId();
			projectIds.add(libraryProjectId);
			libraryProject.setRootProjectId(libraryProjectId);  // library project is a ROOT Project.
		}
		
		Map<Long,String> urlMap = new HashMap<Long,String>();
		Map<Long,String> projectThumbMap = new HashMap<Long,String>();  // maps projectId to url where its thumbnail can be found
		Map<Long,String> filenameMap = new HashMap<Long,String>();
		Map<Long,String> projectNameMap = new HashMap<Long,String>(); //a map to contain projectId to project name
		Map<Long,String> projectNameEscapedMap = new HashMap<Long,String>(); //a map to contain projectId to escaped project name
		Map<Long,Date> projectRunDateMap = new HashMap<Long,Date>(); //a map to contain projectId to run date
		Map<Long,Long> projectRunIdMap = new HashMap<Long,Long>(); //a map to contain projectId to run id
		
		String curriculumBaseWWW = this.wiseProperties.getProperty("curriculum_base_www");

		int totalActiveProjects = 0;
		int totalArchivedProjects = 0;

		ArrayList<Project> allProjects = new ArrayList<Project>(ownedProjectsList.size()+sharedProjectsList.size()+libraryProjectsList.size());
		allProjects.addAll(ownedProjectsList);
		allProjects.addAll(sharedProjectsList);
		allProjects.addAll(libraryProjectsList);
		for (Project p: allProjects) {
			if (p.isCurrent()){
				if(p.isDeleted()){
					// project has been marked as deleted, so increment archived count
					totalArchivedProjects++;
				} else {
					// project has not been marked as deleted, so increment active count
					totalActiveProjects++;
				}
				Long projectId = (Long) p.getId();
				
				//get the project name and put it into the map
				String projectName = p.getName();
				projectNameMap.put(projectId, projectName);
				
				List<Run> runList = this.runService.getProjectRuns(projectId);
				if (!runList.isEmpty()){
					// add project and date to the maps of project runs
					// since a project can now only be run once, just use the first run in the list
					projectRunDateMap.put(projectId, runList.get(0).getStarttime());
					projectRunIdMap.put(projectId, (Long) runList.get(0).getId());
				}

				//replace ' with \' in the project name and put it into the map
				projectNameEscapedMap.put(projectId, projectName.replaceAll("\\'", "\\\\'"));

				String url = (String) p.getCurnit().accept(new CurnitGetCurnitUrlVisitor());
				//String url=null;
				if(url != null && url != ""){
					/*
					 * add the project url to the map
					 * e.g.
					 * /253/wise4.project.json
					 */
					urlMap.put(projectId, url);
					
					int ndx = url.lastIndexOf("/");
					if(ndx != -1){
						/*
						 * add project thumb url to projectThumbMap. for now this is the same (/assets/project_thumb.png)
						 * for all projects but this could be overwritten in the future
						 * e.g.
						 * /253/assets/projectThumb.png
						 */
						projectThumbMap.put(projectId, curriculumBaseWWW + url.substring(0, ndx) + PROJECT_THUMB_PATH);

						/*
						 * add the project file name to the map
						 * e.g.
						 * /wise4.project.json
						 */
						filenameMap.put(projectId, url.substring(ndx, url.length()));
					}
				}
			}			
		}
		
		// send in owned, shared, library, bookmarked projects, and list of project ids
		ModelAndView modelAndView = new ModelAndView();
		modelAndView.addObject("bookmarkedProjectsList", this.projectService.getBookmarkerProjectList(user));
		modelAndView.addObject("ownedProjectsList", ownedProjectsList);
		modelAndView.addObject("sharedProjectsList", sharedProjectsList);
		modelAndView.addObject("libraryProjectsList", libraryProjectsList);
		modelAndView.addObject("projectIds", projectIds);
		modelAndView.addObject("sharedRemove", sharedRemove);
		modelAndView.addObject("ownedRemove", ownedRemove);
		modelAndView.addObject("totalActiveProjects", totalActiveProjects);
		modelAndView.addObject("totalArchivedProjects", totalArchivedProjects);
    	
		modelAndView.addObject("urlMap", urlMap);
		modelAndView.addObject("projectThumbMap", projectThumbMap);
		modelAndView.addObject("filenameMap", filenameMap);
		modelAndView.addObject("projectNameMap", projectNameMap);
		modelAndView.addObject("projectNameEscapedMap", projectNameEscapedMap);
		modelAndView.addObject("projectRunDateMap", projectRunDateMap);
		modelAndView.addObject("projectRunIdMap", projectRunIdMap);
		modelAndView.addObject("user", user);
		return modelAndView;
	}

	/**
	 * @param projectService the projectService to set
	 */
	public void setProjectService(ProjectService projectService) {
		this.projectService = projectService;
	}
	
	/**
	 * @param wiseProperties the wiseProperties to set
	 */
	public void setWiseProperties(Properties wiseProperties) {
		this.wiseProperties = wiseProperties;
	}

	/**
	 * @param runService the runService to set
	 */
	public void setRunService(RunService runService) {
		this.runService = runService;
	}
	
}
