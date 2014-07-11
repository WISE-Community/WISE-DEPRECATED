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
package org.wise.portal.presentation.web.controllers.teacher.project.customized;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.project.Project;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.project.ProjectService;

/**
 * Controller for removing self (teacher user) from a project's shared teacher list.
 * 
 * @author hirokiterashima
 * @version $Id:$
 */
@Controller
@RequestMapping("/teacher/projects/customized/unshareproject.html")
public class UnShareProjectController {

	@Autowired
	private ProjectService projectService;

	@RequestMapping(method=RequestMethod.POST)
	protected ModelAndView handleRequestInternal(
			@RequestParam("projectId") String projectIdStr,
			HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		Long projectId = new Long(projectIdStr);
		Project project = projectService.getById(projectId);
		String usernameToRemove = request.getParameter("username");
		if (usernameToRemove == null) {
			// assume logged in user if user to remove is not specified
			usernameToRemove = ControllerUtil.getSignedInUser().getUserDetails().getUsername();
		}
		projectService.removeSharedTeacherFromProject(usernameToRemove, project);			
		response.getWriter().write("success");
		return null;
	}
}
