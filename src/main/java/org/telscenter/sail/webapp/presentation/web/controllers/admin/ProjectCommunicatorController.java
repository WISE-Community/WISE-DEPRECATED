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

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.domain.portal.Portal;
import org.telscenter.sail.webapp.domain.project.ExternalProject;
import org.telscenter.sail.webapp.domain.project.ProjectCommunicator;
import org.telscenter.sail.webapp.service.portal.PortalService;
import org.telscenter.sail.webapp.service.project.ProjectCommunicatorService;

/**
 * Controller for ProjectCommunicators
 * 
 * @author hirokiterashima
 * @version $Id:$
 */
public class ProjectCommunicatorController extends AbstractController {

	private static final String PROJECT_COMMUNICATORS_PARAM = "projectCommunicatorList";

	private static final String PROJECT_COMMUNICATORS_XML_PARAM = "projectCommunicatorsXML";

	private static final String PROJECT_COMMUNICATOR = "projectCommunicator";

	private static final String PROJECT_LIST = "projectList";

	private static final String PROJECT_COMMUNICATOR_ID_PARAM = "projectCommunicatorId";

	private static final String GOOGLEMAP_KEY = "googleMapKey";

	private ProjectCommunicatorService projectCommunicatorService;
	
	private PortalService portalService;

	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		String projectCommunicatorId = request.getParameter(PROJECT_COMMUNICATOR_ID_PARAM);
		if (projectCommunicatorId != null) {
			ProjectCommunicator projectCommunicator = projectCommunicatorService.getById(projectCommunicatorId);
			List<ExternalProject> projectList = projectCommunicator.getProjectList();
			ModelAndView modelAndView = new ModelAndView();
			modelAndView.addObject(PROJECT_COMMUNICATOR, projectCommunicator);
			modelAndView.addObject(PROJECT_LIST, projectList);
			return modelAndView;
		} else {
			List<ProjectCommunicator> projectCommunicatorList = this.projectCommunicatorService.getAllProjectCommunicatorList();
			String projectCommunicatorXMLDocument = "<projectcommunicators>";
			for (ProjectCommunicator projectCommunicator : projectCommunicatorList) {
				projectCommunicatorXMLDocument += projectCommunicator.getXMLDocument();
			}
			projectCommunicatorXMLDocument += "</projectcommunicators>";

			Portal portal = portalService.getById(1);
			ModelAndView modelAndView = new ModelAndView();
			modelAndView.addObject(GOOGLEMAP_KEY, portal.getGoogleMapKey());
			modelAndView.addObject(PROJECT_COMMUNICATORS_PARAM, projectCommunicatorList);
			modelAndView.addObject(PROJECT_COMMUNICATORS_XML_PARAM, projectCommunicatorXMLDocument);
			return modelAndView;
		}
	}

	/**
	 * @param projectCommunicatorService the projectCommunicatorService to set
	 */
	public void setProjectCommunicatorService(
			ProjectCommunicatorService projectCommunicatorService) {
		this.projectCommunicatorService = projectCommunicatorService;
	}

	/**
	 * @param portalService the portalService to set
	 */
	public void setPortalService(PortalService portalService) {
		this.portalService = portalService;
	}

}
