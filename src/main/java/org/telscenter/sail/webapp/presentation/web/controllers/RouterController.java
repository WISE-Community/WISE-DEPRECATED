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
package org.telscenter.sail.webapp.presentation.web.controllers;

import java.util.Date;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.domain.project.ProjectMetadata;
import org.telscenter.sail.webapp.service.authentication.UserDetailsService;
import org.telscenter.sail.webapp.service.project.ProjectService;

/**
 * @author patrick lawler
 * @version $Id:$
 */
public class RouterController extends AbstractController{

	private final static String FORWARD = "forward";
	
	private static ProjectService projectService;
	
	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request, HttpServletResponse response) throws Exception {
		User user = ControllerUtil.getSignedInUser();
		
		/* ensure that logged in user has administrator permissions if coming from the util page */
		String referrer = request.getHeader("referer");
		/* if there is no referrer we also want to deny access */
		if(referrer == null || (referrer.endsWith("util/util.html") && !user.getUserDetails().hasGrantedAuthority(UserDetailsService.ADMIN_ROLE))){
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
			return null;
		} else {
			/* if no forward parameter specified, we don't know what to do with the request */
			String forward = request.getParameter(FORWARD);
			if(forward==null || forward.equals("")){
				response.sendError(HttpServletResponse.SC_BAD_REQUEST);
				return null;
			} else {
				ServletContext servletContext = this.getServletContext().getContext("/vlewrapper");
				CredentialManager.setRequestCredentials(request, user);
				if(forward.equals("convert") || forward.equals("minifier")){
					
					//if this is a minify request we need to set some attributes into the request
					if(forward.equals("minifier")) {
						//get the project id
						String projectId = request.getParameter("projectId");
						
						if(projectId != null) {
							//get the project
							Project project = projectService.getById(new Long(projectId));
							
							if(project != null) {
								//get the project metadata
								ProjectMetadata metadata = project.getMetadata();
								
								if(metadata != null) {
									//get the last edited and last modified timestamps
									Date lastEdited = metadata.getLastEdited();
									Date lastMinified = metadata.getLastMinified();
									
									/*
									 * set the timestamps into the request so that we
									 * have access to them in the vlewrapper controller 
									 */
									request.setAttribute("lastEdited", lastEdited);
									request.setAttribute("lastMinified", lastMinified);						
								}
							}
						}
					}
					servletContext.getRequestDispatcher("/util/" + forward + ".html").forward(request, response);
					return null;
				} else if(forward.equals("filemanager")){
					servletContext.getRequestDispatcher("/vle/" + forward + ".html").forward(request, response);
					return null;
				} else {
					response.sendError(HttpServletResponse.SC_BAD_REQUEST);
					return null;
				}
			}
		}
	}

	/**
	 * @param projectService the projectService to set
	 */
	public void setProjectService(ProjectService projectService) {
		this.projectService = projectService;
	}

}
