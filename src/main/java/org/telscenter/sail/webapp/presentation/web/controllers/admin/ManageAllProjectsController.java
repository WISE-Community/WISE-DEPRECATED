/**
 * Copyright (c) 2007 Regents of the University of California (Regents). Created
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
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.domain.project.FamilyTag;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.service.project.ExternalProjectService;
import org.telscenter.sail.webapp.service.project.ProjectService;

/**
 * @author Sally Ahn
 * @version $Id: $
 */
public class ManageAllProjectsController extends AbstractController {
	
	private static final String VIEW_NAME = "admin/project/manageallprojects";

	private static final String INTERNAL_PROJECT_LIST_PARAM_NAME = "internal_project_list";

	private static final String EXTERNAL_PROJECT_LIST_PARAM_NAME = "external_project_list";

	private ProjectService projectService;

	private ExternalProjectService externalProjectService;
		
	/**
	 * @override @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		if (request.getMethod().equals("GET")) {
			// separate calls to project services to get internal and external projects
			List<Project> externalProjectList = new ArrayList<Project>();
			List<Project> internalProjectList = new ArrayList<Project>();
			// check if projectId was passed in
			String projectIdStr = request.getParameter("projectId");
			if (projectIdStr != null) {
				internalProjectList.add(projectService.getById(Long.valueOf(projectIdStr)));
			} else {
				internalProjectList.addAll(projectService.getAdminProjectList());
				externalProjectList.addAll(externalProjectService.getProjectList());
			}

			ModelAndView modelAndView = new ModelAndView(VIEW_NAME);
			modelAndView.addObject(INTERNAL_PROJECT_LIST_PARAM_NAME, internalProjectList);
			modelAndView.addObject(EXTERNAL_PROJECT_LIST_PARAM_NAME, externalProjectList);
			return modelAndView;
		} else {
			// posting changes to project
			ModelAndView mav = new ModelAndView();
			try {
				String projectIdStr = request.getParameter("projectId");
				Long projectId = new Long(projectIdStr);
				Project project = projectService.getById(projectId);
				String attr = request.getParameter("attr");
				if (attr.equals("isCurrent")) {
					project.setCurrent(Boolean.valueOf(request.getParameter("val")));
				} else if (attr.equals("familyTag")) {
					project.setFamilytag(FamilyTag.valueOf(request.getParameter("val")));
				} else if (attr.equals("maxTotalAssetsSize")) {
					String maxTotalAssetsSizeStr = request.getParameter("val");
					Long maxTotalAssetsSize = Long.parseLong(maxTotalAssetsSizeStr);
					project.setMaxTotalAssetsSize(maxTotalAssetsSize);
				}
				User user = ControllerUtil.getSignedInUser();
				if (user.isAdmin()) {
					projectService.updateProject(project, user);
					mav.addObject("msg", "success");
				} else {
					mav.addObject("msg", "error: permission denied");
				}
				return mav;
			} catch (Exception e) {
				mav.addObject("msg", "error");
				return mav;
			}
		}
	}
	
	/**
	 * @param projectService the projectService to set
	 */
	public void setProjectService(ProjectService projectService) {
		this.projectService = projectService;
	}

	public void setExternalProjectService(
			ExternalProjectService externalProjectService) {
		this.externalProjectService = externalProjectService;
	}

    
}
