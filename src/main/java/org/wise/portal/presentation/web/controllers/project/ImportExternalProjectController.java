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
package org.wise.portal.presentation.web.controllers.project;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.wiseup.WiseUpService;

/**
 * Imports an external project to the portal.
 * @author Hiroki Terashima
 * TODO: do we need this class anymore?
 */
@Controller
@RequestMapping("/project/importExternalProject")
public class ImportExternalProjectController {

	private static final String PROJECT_COMMUNICATOR_ID_PARAM = "projectCommunicatorId";

	private static final String EXTERNAL_ID_PARAM = "externalId";
	
	@Autowired
	private WiseUpService wiseUpService;


	protected ModelAndView handleRequestInternal(HttpServletRequest request) throws Exception {

		String projectCommunicatorId = request.getParameter(PROJECT_COMMUNICATOR_ID_PARAM);
		String externalId = request.getParameter(EXTERNAL_ID_PARAM);

		String externalWiseInstanceId = "hiroki";
		String externalWiseProjectId = "1";
		
		User signedInUser = ControllerUtil.getSignedInUser();

		wiseUpService.importExternalProject(signedInUser, externalWiseInstanceId, externalWiseProjectId);

		// we want a service method to import the project, given those params
		//projectService.importProject(Long.valueOf(externalId), projectCommunicatorId);
		return null;
	}
}
