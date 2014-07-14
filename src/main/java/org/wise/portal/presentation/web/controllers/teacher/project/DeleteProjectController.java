package org.wise.portal.presentation.web.controllers.teacher.project;

import java.util.Date;
import java.util.Iterator;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.presentation.web.exception.NotAuthorizedException;
import org.wise.portal.service.project.ProjectService;

@Controller
public class DeleteProjectController {

	@Autowired
	private ProjectService projectService;
	
	/**
	 * @param projectIdStr
	 * @param revive if deleting the project, the value should be null or anything besides the string "true"
	 *               if reviving the project, the value should be the string "true"
	 * @param request
	 * @param response
	 * @return
	 * @throws Exception
	 */
	@RequestMapping("/teacher/projects/deleteproject.html")
	protected ModelAndView handleRequestInternal(
			@RequestParam("projectId") String projectIdStr,
			@RequestParam("revive") String revive,
			HttpServletRequest request,
			HttpServletResponse response) throws Exception {

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
}
