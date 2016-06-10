/**
 * Copyright (c) 2008-2016 Regents of the University of California (Regents).
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
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 * 
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.presentation.web.controllers.admin;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.listeners.WISESessionListener;
import org.wise.portal.service.project.ProjectService;

/**
 * Controller for showing currently-authored project in the admin page.
 * Retrieves relevant objects and passes the along to the view (jsp), which does the rendering
 * @author Hiroki Terashima
 */
@Controller
@RequestMapping("/admin/project/currentlyAuthoredProjects.html")
public class CurrentlyAuthoredProjectsController {

	@Autowired
	private ProjectService projectService;
	
	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@RequestMapping(method = RequestMethod.GET)
	protected ModelAndView handleRequestInternal(HttpServletRequest request) throws Exception {
		ModelAndView mav = new ModelAndView();
		
		HttpSession currentUserSession = request.getSession();
		HashMap<String, ArrayList<String>> openedProjectsToSessions = 
			(HashMap<String, ArrayList<String>>) currentUserSession.getServletContext().getAttribute("openedProjectsToSessions");

		// use a copy to remove unused project ids. this will avoid concurrentmodificationexception. https://github.com/WISE-Community/WISE-Portal/issues/96
		HashMap<String, ArrayList<String>> openedProjectsToSessionsCopy = new HashMap<String, ArrayList<String>>();
		if (openedProjectsToSessions != null) {
			openedProjectsToSessionsCopy.putAll(openedProjectsToSessions);
		}
		
		HashMap<String, User> allLoggedInUsers = (HashMap<String, User>) currentUserSession.getServletContext()
				.getAttribute(WISESessionListener.ALL_LOGGED_IN_USERS);
		
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
}