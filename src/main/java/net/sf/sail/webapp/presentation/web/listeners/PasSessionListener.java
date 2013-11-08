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
package net.sf.sail.webapp.presentation.web.listeners;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;

import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

import net.sf.sail.webapp.domain.User;

/**
 * @author hirokiterashima
 * @version $Id:$
 */
public class PasSessionListener implements HttpSessionListener {

	public static final String ALL_LOGGED_IN_USERS = "allLoggedInUsers";
	
	/**
	 * @see javax.servlet.http.HttpSessionListener#sessionCreated(javax.servlet.http.HttpSessionEvent)
	 */
	@SuppressWarnings("unchecked")
	public void sessionCreated(HttpSessionEvent event) {
	}
	
	/**
	 * @see javax.servlet.http.HttpSessionListener#sessionDestroyed(javax.servlet.http.HttpSessionEvent)
	 */
	@SuppressWarnings("unchecked")
	public void sessionDestroyed(HttpSessionEvent event) {
		HttpSession session = event.getSession();
		String sessionId = session.getId();
		
		HashMap<String, User> allLoggedInUsers = ((HashMap<String, User>) session.getServletContext().getAttribute(ALL_LOGGED_IN_USERS));
		if (allLoggedInUsers != null) {
			allLoggedInUsers.remove(sessionId);
		}
		
		HashMap<String, User> studentsToRuns = ((HashMap<String, User>) session.getServletContext().getAttribute("studentsToRuns"));
		if (studentsToRuns != null) {
			studentsToRuns.remove(sessionId);
		}
				
		// also remove this user from any opened projects, if they opened
		// any project using the authoring tool.
		HashMap<String, ArrayList<String>> openedProjectToSessions = 
			(HashMap<String, ArrayList<String>>) session.getServletContext()
				.getAttribute("openedProjectsToSessions");
		
		if (openedProjectToSessions != null) {
			Collection<ArrayList<String>> sessionsForAllProjects = openedProjectToSessions.values();
			for (ArrayList<String> sessionsForProject : sessionsForAllProjects) {
				sessionsForProject.remove(sessionId);
			}
		}
		
		// also remove this user from any studentToRuns, if it's a student who was doing a run
		

	}

}
