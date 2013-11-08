package org.telscenter.sail.webapp.presentation.web.controllers.teacher.project;

import java.util.Date;
import java.util.Iterator;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;
import net.sf.sail.webapp.service.NotAuthorizedException;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.service.project.ProjectService;

public class DeleteProjectController extends AbstractController {

	private ProjectService projectService;
	
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		//get the project id
		String projectIdStr = request.getParameter("projectId");
		
		/*
		 * get whether to revive the project
		 * if deleting the project, the value should be null or anything besides the string "true"
		 * if reviving the project, the value should be the string "true"
		 */
		String revive = request.getParameter("revive");
		
		//set the default response string
		String responseString = "failure";
		
		if(projectIdStr != null && !projectIdStr.equals("")) {
			Long projectId = Long.parseLong(projectIdStr);
			
			if(projectId != null) {
				
				try {
					//get the project
					Project project = projectService.getById(projectId);
					
					if(project != null) {
						//get the currently signed in user
						User signedInUser = ControllerUtil.getSignedInUser();
						
						//get the owner of the project
						Set<User> owners = project.getOwners();
						Iterator<User> ownersIterator = owners.iterator();
						User owner = ownersIterator.next();
						
						//get the id of the signed in user and the id of the owner of the project
						Long signedInUserId = signedInUser.getId();
						Long ownerId = owner.getId();
						
						if(signedInUserId == ownerId) {
							//the owner is trying to delete the project so we will allow it
							
							if(revive != null && revive.equals("true")) {
								//we are reviving the project
								project.setDeleted(false);
								project.setDateDeleted(null);
								
								try {
									//update the project in teh database
									projectService.updateProject(project, signedInUser);
									responseString = "success";
								} catch (NotAuthorizedException e) {
									e.printStackTrace();
								}
							} else {
								//we are deleting the project
								project.setDeleted(true);
								project.setDateDeleted(new Date());
								
								try {
									//update the project in the database
									projectService.updateProject(project, signedInUser);
									responseString = "success";
								} catch (NotAuthorizedException e) {
									e.printStackTrace();
								}
							}
						} else {
							/*
							 * someone besides the owner is trying to delete the project
							 * so we will not allow it
							 */
							responseString = "failure: not owner";
						}
					} else {
						responseString = "failure: project does not exist";
					}
				} catch (ObjectNotFoundException e) {
					e.printStackTrace();
				}
			} else {
				responseString = "failure: invalid project id";
			}
		} else {
			responseString = "failure: invalid project id";
		}
		
		//write the response string
		response.getWriter().write(responseString);
		
		return null;
	}

	/**
	 * @param projectService the projectService to set
	 */
	public void setProjectService(ProjectService projectService) {
		this.projectService = projectService;
	}
}
