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
package org.telscenter.sail.webapp.presentation.web.controllers.teacher.project;

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

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.springframework.web.servlet.view.RedirectView;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.domain.project.Tag;
import org.telscenter.sail.webapp.domain.project.impl.TagImpl;
import org.telscenter.sail.webapp.service.offering.RunService;
import org.telscenter.sail.webapp.service.project.ProjectService;

/**
 * Controller to display information for a specific project
 * 
 * @author Hiroki Terashima
 * @version $Id$
 */
public class ProjectInfoController extends AbstractController {

	protected static final String PROJECTID_PARAM_NAME = "projectId";

	protected static final String PROJECT_PARAM_NAME = "project";
	
	protected static final String USAGE = "usage";
	
	// path to project thumb image relative to project folder
	private static final String PROJECT_THUMB_PATH = "/assets/project_thumb.png";

	private ProjectService projectService;
	
	private RunService runService;
	
	private Properties portalProperties;
	
	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		String projectIdStr = request.getParameter(PROJECTID_PARAM_NAME);
		Project project = projectService.getById(projectIdStr);
		//User user = ControllerUtil.getSignedInUser();
		Set<String> telslibrary = new TreeSet<String>();
		telslibrary.add("library");

		if(project != null){
			//if(this.projectService.canReadProject(project, user)
				//|| this.projectService.canAuthorProject(project, user)
				//||	project.hasTags(telslibrary)){
				ModelAndView modelAndView = new ModelAndView();
				modelAndView.addObject(PROJECT_PARAM_NAME, project);
				Integer usage = this.runService.getProjectUsage((Long)project.getId());
				modelAndView.addObject(USAGE, usage);
				
				//get the command
				String command = request.getParameter("command");
				//if command is 'getTimesRun', return the usage count
				if(command != null && command.equals("getNumberOfRuns")){
					response.getWriter().write(usage.toString());
					return null;
				}
				
				String curriculumBaseWWW = this.portalProperties.getProperty("curriculum_base_www");
				String url = (String) project.getCurnit().accept(new CurnitGetCurnitUrlVisitor());
				if(url != null && url != ""){
					int ndx = url.lastIndexOf("/");
					if(ndx != -1){
						/*
						 * add project thumb url to projectThumbMap. for now this is the same (/assets/project_thumb.png)
						 * for all projects but this could be overwritten in the future
						 * e.g.
						 * /253/assets/projectThumb.png
						 */
						String projectThumbPath = curriculumBaseWWW + url.substring(0, ndx) + PROJECT_THUMB_PATH;
						modelAndView.addObject("projectThumbPath", projectThumbPath);
					}
				}
				
				return modelAndView;
			//} else {
				//return new ModelAndView(new RedirectView("../../accessdenied.html"));
			//}
		} else {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Cannot determine project to retrieve info for.");
			return null;
		}
	}

	/**
	 * @param projectService the projectService to set
	 */
	public void setProjectService(ProjectService projectService) {
		this.projectService = projectService;
	}

	/**
	 * @param runService the runService to set
	 */
	public void setRunService(RunService runService) {
		this.runService = runService;
	}

	/**
	 * @param portalProperties the portalProperties to set
	 */
	public void setPortalProperties(Properties portalProperties) {
		this.portalProperties = portalProperties;
	}
}
