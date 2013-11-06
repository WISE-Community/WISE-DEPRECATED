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

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.domain.project.Tag;
import org.telscenter.sail.webapp.service.project.ProjectService;

/**
 * @author patrick lawler
 * @version $Id:$
 */
public class TaggerController extends AbstractController {

	private ProjectService projectService;

	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request, HttpServletResponse response) throws Exception {
		String command = request.getParameter("command");
		
		if(command.equals("createTag")){
			String projectId = request.getParameter("projectId");
			String tag = request.getParameter("tag");
			
			if(projectId == null || tag == null || projectId.equals("") || tag.equals("")){
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid parameters provided, cannot complete the request.");
			} else if(this.projectService.projectContainsTag(Long.parseLong(projectId), tag)){
				response.getWriter().write("duplicate");
			} else if(!this.projectService.isAuthorizedToCreateTag(ControllerUtil.getSignedInUser(), tag)){
				response.getWriter().write("not-authorized");
			} else {
				Long tagId = this.projectService.addTagToProject(tag, Long.parseLong(projectId));
				response.getWriter().write(String.valueOf(tagId));
			}
		} else if(command.equals("removeTag")){
			String projectId = request.getParameter("projectId");
			String tagId = request.getParameter("tagId");
			
			if(projectId == null || tagId == null || projectId.equals("") || tagId.equals("")){
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid parameters provided, cannot complete the request.");
			} else {
				this.projectService.removeTagFromProject(Long.parseLong(tagId), Long.parseLong(projectId));
				response.getWriter().write("success");
			}
		} else if(command.equals("updateTag")){
			String projectId = request.getParameter("projectId");
			String tagId = request.getParameter("tagId");
			String name = request.getParameter("name");
			
			if(projectId == null || tagId == null || name == null || projectId.equals("") || tagId.equals("") || name.equals("")){
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid parameters provided, cannot complete the request.");
			} else if(this.projectService.projectContainsTag(Long.parseLong(projectId), name)){
				response.getWriter().write("duplicate");
			} else if(!this.projectService.isAuthorizedToCreateTag(ControllerUtil.getSignedInUser(), name)){
				response.getWriter().write("not-authorized");
			} else {
				Long id = this.projectService.updateTag(Long.parseLong(tagId), Long.parseLong(projectId), name);
				response.getWriter().write(String.valueOf(id));
			}
		} else if(command.equals("retrieveProjectTags")){
			String projectId = request.getParameter("projectId");
			
			if(projectId != null){
				Project p = this.projectService.getById(Long.parseLong(projectId));
				if(p != null){
					String tagString = "";
					for(Tag t : p.getTags()){
						tagString += t.getId() + "~" + t.getName() + ",";
					}
					
					/* remove trailing comma */
					tagString = tagString.substring(0,tagString.length() - 1);
					
					response.getWriter().write(tagString);
					return null;
				}
			}
			
			response.getWriter().write("Invalid project parameter, cannot retrieve tags.");
		} else {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "I do not understand the command: " + command);
		}
		
		return null;
	}

	/**
	 * @param projectService the projectService to set
	 */
	public void setProjectService(ProjectService projectService) {
		this.projectService = projectService;
	}
}
