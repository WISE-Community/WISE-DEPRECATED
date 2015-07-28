/**
 * Copyright (c) 2008-2015 Regents of the University of California (Regents).
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
package org.wise.portal.presentation.web.controllers.teacher.project;

import java.util.Properties;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.module.impl.CurnitGetCurnitUrlVisitor;
import org.wise.portal.domain.project.Project;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.project.ProjectService;

/**
 * Controller to display information for a specific project
 * 
 * @author Hiroki Terashima
 */
@Controller
public class ProjectInfoController {

	@Autowired
	private ProjectService projectService;
	
	@Autowired
	private RunService runService;
	
	@Autowired
	private Properties wiseProperties;

	// path to project thumb image relative to project folder
	private static final String PROJECT_THUMB_PATH = "/assets/project_thumb.png";

	@RequestMapping("/teacher/projects/projectinfo.html")
	protected ModelAndView handleRequestInternal(
			@RequestParam("projectId") String projectIdStr,
			HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		
		Project project = projectService.getById(projectIdStr);

		if(project != null){
				ModelAndView modelAndView = new ModelAndView();
				modelAndView.addObject("project", project);
				Integer usage = this.runService.getProjectUsage((Long)project.getId());
				modelAndView.addObject("usage", usage);
				
				//get the command
				String command = request.getParameter("command");
				//if command is 'getTimesRun', return the usage count
				if(command != null && command.equals("getNumberOfRuns")){
					response.getWriter().write(usage.toString());
					return null;
				}
				
				String curriculumBaseWWW = this.wiseProperties.getProperty("curriculum_base_www");
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
		} else {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Cannot determine project to retrieve info for.");
			return null;
		}
	}
}
