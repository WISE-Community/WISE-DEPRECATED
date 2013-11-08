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
package org.telscenter.sail.webapp.presentation.web.controllers.admin;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.presentation.web.listeners.PasSessionListener;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.domain.authentication.impl.TeacherUserDetails;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.service.project.ProjectService;

/**
 * Controller for showing currently-authored project in the admin page.
 * Retrieves relevant objects and passes the along to the view (jsp), which does the rendering
 * @author hirokiterashima
 * @version $Id:$
 */
public class CurrentlyAuthoredProjectsController extends AbstractController {

	private ProjectService projectService;
	
	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@SuppressWarnings("unchecked")
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		ModelAndView mav = new ModelAndView("admin/project/currentlyAuthoredProjects");
		
		HttpSession currentUserSession = request.getSession();
		HashMap<String, ArrayList<String>> openedProjectsToSessions = 
			(HashMap<String, ArrayList<String>>) currentUserSession.getServletContext().getAttribute("openedProjectsToSessions");

		// use a copy to remove unused project ids. this will avoid concurrentmodificationexception. https://github.com/WISE-Community/WISE-Portal/issues/96
		HashMap<String, ArrayList<String>> openedProjectsToSessionsCopy = new HashMap<String, ArrayList<String>>();
		if (openedProjectsToSessions != null) {
			openedProjectsToSessionsCopy.putAll(openedProjectsToSessions);
		}
		
		HashMap<String, User> allLoggedInUsers = (HashMap<String, User>) currentUserSession.getServletContext()
				.getAttribute(PasSessionListener.ALL_LOGGED_IN_USERS);
		
		HashMap<String, Project> openedProjects = new HashMap<String, Project>();  // <projectId, Project> mapping.

		ArrayList<String> openedProjectIds = new ArrayList<String>();  // list of project ids. Keep track of project ids that are being authored right now
		if (openedProjectsToSessions != null) {
			Set<String> openedProjectIdsSet = openedProjectsToSessions.keySet();
			for (String openedProjectId : openedProjectIdsSet) {
				// check if there is a session associated with the opened project
				if (openedProjectsToSessions.get(openedProjectId) != null &&
						openedProjectsToSessions.get(openedProjectId).size() > 0) {
					openedProjectIds.add(openedProjectId);				
					Project project = projectService.getById(openedProjectId);
					openedProjects.put(openedProjectId, project);
				} else {
					// otherwise remove this opened project id information from this set because it's not accurate
					openedProjectsToSessionsCopy.remove(openedProjectId);
				}
			}
		}
		
		// filter allLoggedInUsers by teacher since students can't author projects.
		HashMap<String, User> loggedInTeachers = new HashMap<String, User>();
		if (allLoggedInUsers != null) {
			for (String sessionId : allLoggedInUsers.keySet()) {
				User loggedInUser = allLoggedInUsers.get(sessionId);
				if (loggedInUser.getUserDetails() instanceof TeacherUserDetails) {
					loggedInTeachers.put(sessionId, loggedInUser);					
				}
			}
		}
		
		mav.addObject("loggedInTeachers", loggedInTeachers);
		mav.addObject("openedProjectIds", openedProjectIds);
		mav.addObject("openedProjects", openedProjects);
		mav.addObject("openedProjectsToSessions", openedProjectsToSessionsCopy);
		return mav;
	}

	/**
	 * @param projectService the projectService to set
	 */
	public void setProjectService(ProjectService projectService) {
		this.projectService = projectService;
	}

}
