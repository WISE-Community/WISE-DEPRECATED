/**
 * 
 */
package org.telscenter.sail.webapp.presentation.web.controllers.teacher.management;

//import java.util.ArrayList;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.CurnitGetCurnitUrlVisitor;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;
import net.sf.sail.webapp.service.UserService;

import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.message.Message;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.service.message.MessageService;
import org.telscenter.sail.webapp.service.offering.RunService;
import org.telscenter.sail.webapp.service.project.ProjectService;

/**
 * Controller for WISE library page
 * @author Hiroki Terashima
 * @author Jonathan Lim-Breitbart
 */
public class LibraryController extends AbstractController {
	
	private static final String UNREAD_MESSAGES = "unreadMessages";

	// path to project thumb image relative to project folder
	private static final String PROJECT_THUMB_PATH = "/assets/project_thumb.png";
	
	private ProjectService projectService;

	private UserService userService;

	private RunService runService;
	
	private Properties portalProperties;

	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		ModelAndView modelAndView = new ModelAndView();
		User user = ControllerUtil.getSignedInUser();
		
		int totalActiveProjects = 0;
		int totalArchivedProjects = 0;
		
		// get library projects
		Set<String> tagNames = new TreeSet<String>();
		tagNames.add("library");
		List<Project> libraryProjectsList = this.projectService.getProjectListByTagNames(tagNames);
		
		// get user's owned projects
		List<Project> ownedProjectsList = this.projectService.getProjectList(user);
		// for now, don't separate archived projects; TODO: re-implement if archiving is re-enabled
		//List<Project> currentOwnedProjectsList = new ArrayList<Project>();
		//List<Project> archivedOwnedProjectsList = new ArrayList<Project>();
		
		// get user's shared projects
		List<Project> sharedProjectsList = this.projectService.getSharedProjectList(user);
		sharedProjectsList.removeAll(ownedProjectsList);
		// for now, don't separate archived projects; TODO: re-implement if archiving is re-enabled
		//List<Project> currentSharedProjectsList = new ArrayList<Project>();
		//List<Project> archivedSharedProjectsList = new ArrayList<Project>();
		
		// a set to hold the list of project ids in user's library
		Set<Long> projectIds = new TreeSet<Long>();
		
		// set root project ids, remove duplicates
		List<Project> ownedRemove = new ArrayList<Project>();
		for (int i = 0; i < ownedProjectsList.size(); i++) {
			if(ownedProjectsList.get(i).getRootProjectId() == null){
				Long rootId = this.projectService.identifyRootProjectId(ownedProjectsList.get(i));
				ownedProjectsList.get(i).setRootProjectId(rootId);
			}
			Long id = (Long)ownedProjectsList.get(i).getId();
			projectIds.add(id);
			
			// check if project is in WISE library
			for (Project libProject : libraryProjectsList){
				if (ownedProjectsList.get(i).getId() == libProject.getId()){
					ownedRemove.add(ownedProjectsList.get(i));
				}
			}
			//if (project.isCurrent()) {
				//currentOwnedProjectsList.add(project);
			//} else {
				//archivedOwnedProjectsList.add(project);
			//}
		}
		// if project is in WISE library, remove from owned projects list (avoid duplicates)
		for (int i=0; i<ownedRemove.size(); i++){
			ownedProjectsList.remove(ownedRemove.get(i));
		}
		
		List<Project> sharedRemove = new ArrayList<Project>();
		for (int a = 0; a < sharedProjectsList.size(); a++) {
			Long rootId = this.projectService.identifyRootProjectId(sharedProjectsList.get(a));
			sharedProjectsList.get(a).setRootProjectId(rootId);
			Long id = (Long)sharedProjectsList.get(a).getId();
			projectIds.add(id);
			
			// check if project is in WISE library
			for (Project libProject : libraryProjectsList){
				if (sharedProjectsList.get(a).getId() == libProject.getId()){
					sharedRemove.add(sharedProjectsList.get(a));
				}
			}
			//if (project.isCurrent()) {
				//currentSharedProjectsList.add(project);
			//} else {
				//archivedSharedProjectsList.add(project);
			//}
		}
		
		// if project is in WISE library, remove from shared projects list (avoid duplicates)
		for (int a=0; a<sharedRemove.size(); a++){
			sharedProjectsList.remove(sharedRemove.get(a));
		}
		
		for (int x = 0; x < libraryProjectsList.size(); x++) {
			Long rootId = this.projectService.identifyRootProjectId(libraryProjectsList.get(x));
			libraryProjectsList.get(x).setRootProjectId(rootId);
			Long id = (Long)libraryProjectsList.get(x).getId();
			projectIds.add(id);
		}
		
		/* sort the project lists */
		//this.projectService.sortProjectsByDateCreated(currentOwnedProjectsList);
		//this.projectService.sortProjectsByDateCreated(archivedOwnedProjectsList);

		//modelAndView.addObject("currentOwnedProjectsList", currentOwnedProjectsList);
		//modelAndView.addObject("archivedOwnedProjectsList", archivedOwnedProjectsList);
		
		//this.projectService.sortProjectsByDateCreated(currentSharedProjectsList);
		//this.projectService.sortProjectsByDateCreated(archivedSharedProjectsList);

		//modelAndView.addObject("currentSharedProjectsList", currentSharedProjectsList);
		//modelAndView.addObject("archivedSharedProjectsList", archivedSharedProjectsList);
		
		this.projectService.sortProjectsByDateCreated(ownedProjectsList);
		this.projectService.sortProjectsByDateCreated(sharedProjectsList);
		//this.projectService.sortProjectsByDateCreated(libraryProjectsList);

		//Map<Long, Integer> usageMap = new TreeMap<Long, Integer>();
		Map<Long,String> urlMap = new TreeMap<Long,String>();
		Map<Long,String> projectThumbMap = new TreeMap<Long,String>();  // maps projectId to url where its thumbnail can be found
		Map<Long,String> filenameMap = new TreeMap<Long,String>();

		//a map to contain projectId to project name
		Map<Long,String> projectNameMap = new TreeMap<Long,String>();

		//a map to contain projectId to escaped project name
		Map<Long,String> projectNameEscapedMap = new TreeMap<Long,String>();
		
		//a map to contain projectId to run date
		Map<Long,Date> projectRunDateMap = new TreeMap<Long,Date>();
		
		//a map to contain projectId to run date
		Map<Long,Long> projectRunIdMap = new TreeMap<Long,Long>();
		
		String curriculumBaseDir = this.portalProperties.getProperty("curriculum_base_dir");
		String curriculumBaseWWW = this.portalProperties.getProperty("curriculum_base_www");
		for (Project p: ownedProjectsList) {
			if (p.isCurrent()){
				if(p.isDeleted()){
					// project has been marked as deleted, so increment archived count
					totalArchivedProjects++;
				} else {
					// project has not been marked as deleted, so increment active count
					totalActiveProjects++;
				}
				
				List<Run> runList = this.runService.getProjectRuns((Long) p.getId());
				if (!runList.isEmpty()){
					// add project and date to the maps of project runs
					// since a project can now only be run once, just use the first run in the list
					projectRunDateMap.put((Long) p.getId(), runList.get(0).getStarttime());
					projectRunIdMap.put((Long) p.getId(), (Long) runList.get(0).getId());
				}
				
				String url = (String) p.getCurnit().accept(new CurnitGetCurnitUrlVisitor());

				//get the project name and put it into the map
				String projectName = p.getName();
				projectNameMap.put((Long) p.getId(), projectName);

				//replace ' with \' in the project name and put it into the map
				projectName = projectName.replaceAll("\\'", "\\\\'");
				projectNameEscapedMap.put((Long) p.getId(), projectName);

				if(url != null && url != ""){
					/*
					 * add the project url to the map
					 * e.g.
					 * /253/wise4.project.json
					 */
					urlMap.put((Long) p.getId(), url);
					
					int ndx = url.lastIndexOf("/");
					if(ndx != -1){
						/*
						 * add project thumb url to projectThumbMap. for now this is the same (/assets/project_thumb.png)
						 * for all projects but this could be overwritten in the future
						 * e.g.
						 * /253/assets/projectThumb.png
						 */
						projectThumbMap.put((Long) p.getId(), curriculumBaseWWW + url.substring(0, ndx) + PROJECT_THUMB_PATH);

						/*
						 * add the project file name to the map
						 * e.g.
						 * /wise4.project.json
						 */
						filenameMap.put((Long) p.getId(), url.substring(ndx, url.length()));
					}
				}
				//usageMap.put((Long) p.getId(), this.runService.getProjectUsage((Long) p.getId()));
			}
		}

		for (Project p: sharedProjectsList) {
			if (p.isCurrent()){
				if(p.isDeleted()){
					// project has been marked as deleted, so increment archived count
					totalArchivedProjects++;
				} else {
					// project has not been marked as deleted, so increment active count
					totalActiveProjects++;
				}
				
				List<Run> runList = this.runService.getProjectRuns((Long) p.getId());
				if (!runList.isEmpty()){
					// add project and date to the maps of project runs
					// since a project can now only be run once, just use the first run in the list
					projectRunDateMap.put((Long) p.getId(), runList.get(0).getStarttime());
					projectRunIdMap.put((Long) p.getId(), (Long) runList.get(0).getId());
				}
				
				String url = (String) p.getCurnit().accept(new CurnitGetCurnitUrlVisitor());

				//get the project name and put it into the map
				String projectName = p.getName();
				projectNameMap.put((Long) p.getId(), projectName);

				//replace ' with \' in the project name and put it into the map
				projectName = projectName.replaceAll("\\'", "\\\\'");
				projectNameEscapedMap.put((Long) p.getId(), projectName);

				if(url != null && url != ""){
					/*
					 * add the project url to the map
					 * e.g.
					 * /253/wise4.project.json
					 */
					urlMap.put((Long) p.getId(), url);
					
					int ndx = url.lastIndexOf("/");
					if(ndx != -1){
						/*
						 * add project thumb url to projectThumbMap. for now this is the same (/assets/project_thumb.png)
						 * for all projects but this could be overwritten in the future
						 * e.g.
						 * /253/assets/projectThumb.png
						 */
						projectThumbMap.put((Long) p.getId(), curriculumBaseWWW + url.substring(0, ndx) + PROJECT_THUMB_PATH);

						/*
						 * add the project file name to the map
						 * e.g.
						 * /wise4.project.json
						 */
						filenameMap.put((Long) p.getId(), url.substring(ndx, url.length()));
					}
				}
				//usageMap.put((Long) p.getId(), this.runService.getProjectUsage((Long) p.getId()));
			}
		}
		
		for (Project p: libraryProjectsList) {
			if (p.isCurrent()){
				if(p.isDeleted()){
					// project has been marked as deleted, so increment archived count
					totalArchivedProjects++;
				} else {
					// project has not been marked as deleted, so increment active count
					totalActiveProjects++;
				}
				
				List<Run> runList = this.runService.getProjectRuns((Long) p.getId());
				if (!runList.isEmpty()){
					// add project and date to the maps of project runs
					// since a project can now only be run once, just use the first run in the list
					projectRunDateMap.put((Long) p.getId(), runList.get(0).getStarttime());
					projectRunIdMap.put((Long) p.getId(), (Long) runList.get(0).getId());
				}
				
				String url = (String) p.getCurnit().accept(new CurnitGetCurnitUrlVisitor());

				//get the project name and put it into the map
				String projectName = p.getName();
				projectNameMap.put((Long) p.getId(), projectName);

				//replace ' with \' in the project name and put it into the map
				projectName = projectName.replaceAll("\\'", "\\\\'");
				projectNameEscapedMap.put((Long) p.getId(), projectName);

				if(url != null && url != ""){
					/*
					 * add the project url to the map
					 * e.g.
					 * /253/wise4.project.json
					 */
					urlMap.put((Long) p.getId(), url);
									
					
					int ndx = url.lastIndexOf("/");
															
					if(ndx != -1){
						/*
						 * add project thumb url to projectThumbMap. for now this is the same (/assets/project_thumb.png)
						 * for all projects but this could be overwritten in the future
						 * e.g.
						 * /253/assets/projectThumb.png
						 */
						String projectThumbPath = curriculumBaseWWW + url.substring(0, ndx) + PROJECT_THUMB_PATH;
						projectThumbMap.put((Long) p.getId(), projectThumbPath);
						
						/*
						 * add the project file name to the map
						 * e.g.
						 * /wise4.project.json
						 */
						filenameMap.put((Long) p.getId(), url.substring(ndx, url.length()));
					}
				}
				//usageMap.put((Long) p.getId(), this.runService.getProjectUsage((Long) p.getId()));
			}
		}
		
		// send in owned, shared, library, bookmarked projects, and list of project ids
		List<Project> bookmarkedProjectsList = this.projectService.getBookmarkerProjectList(user);
		modelAndView.addObject("bookmarkedProjectsList", bookmarkedProjectsList);
		modelAndView.addObject("ownedProjectsList", ownedProjectsList);
		modelAndView.addObject("sharedProjectsList", sharedProjectsList);
		modelAndView.addObject("libraryProjectsList", libraryProjectsList);
		modelAndView.addObject("projectIds", projectIds);
		modelAndView.addObject("sharedRemove", sharedRemove);
		modelAndView.addObject("ownedRemove", ownedRemove);
		modelAndView.addObject("totalActiveProjects", totalActiveProjects);
		modelAndView.addObject("totalArchivedProjects", totalArchivedProjects);
    	
		//modelAndView.addObject("usageMap", usageMap);
		modelAndView.addObject("urlMap", urlMap);
		modelAndView.addObject("projectThumbMap", projectThumbMap);
		modelAndView.addObject("filenameMap", filenameMap);
		modelAndView.addObject("curriculumBaseDir", curriculumBaseDir);
		modelAndView.addObject("curriculumBaseWWW", curriculumBaseWWW);
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
	 * @param userService the userService to set
	 */
	public void setUserService(UserService userService) {
		this.userService = userService;
	}

	/**
	 * @param portalProperties the portalProperties to set
	 */
	public void setPortalProperties(Properties portalProperties) {
		this.portalProperties = portalProperties;
	}

	/**
	 * @param runService the runService to set
	 */
	public void setRunService(RunService runService) {
		this.runService = runService;
	}
	
}
