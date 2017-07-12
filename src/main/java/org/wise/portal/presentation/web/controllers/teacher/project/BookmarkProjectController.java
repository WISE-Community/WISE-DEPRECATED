/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.project.ProjectService;

import javax.servlet.http.HttpServletResponse;

/**
 * Controller for (un)bookmarking projects.
 * 
 * @author Patrick Lawler
 */
@Controller
public class BookmarkProjectController {

	@Autowired
	private ProjectService projectService;

	/**
	 * Add/Remove bookmark for the specified project
	 *
	 * @param projectId id of Project to bookmark
	 * @param checked true iff the bookmark should be added. Otherwise, remove the bookmark
	 * @throws Exception when specified project is not found
	 */
	@RequestMapping(method = RequestMethod.POST, value = "/teacher/project/bookmark")
	protected void bookmarkProject(
			@RequestParam(value = "projectId") Long projectId,
			@RequestParam(value = "checked") Boolean checked,
			HttpServletResponse response) throws Exception {
		
		Project project = projectService.getById(projectId);
		User user = ControllerUtil.getSignedInUser();

		if (checked){
			projectService.addBookmarkerToProject(project, user);
		} else {
			projectService.removeBookmarkerFromProject(project, user);
		}
		response.getWriter().print("success");
	}
}
