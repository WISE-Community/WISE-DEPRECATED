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
package org.telscenter.sail.webapp.presentation.web.controllers.project;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.Calendar;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.Properties;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.Curnit;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;
import net.sf.sail.webapp.service.curnit.CurnitService;

import org.apache.commons.io.FileUtils;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.domain.impl.CreateUrlModuleParameters;
import org.telscenter.sail.webapp.domain.impl.ProjectParameters;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.domain.project.ProjectMetadata;
import org.telscenter.sail.webapp.domain.project.impl.ProjectMetadataImpl;
import org.telscenter.sail.webapp.domain.project.impl.ProjectType;
import org.telscenter.sail.webapp.presentation.util.json.JSONObject;
import org.telscenter.sail.webapp.service.project.ProjectService;
import org.telscenter.sail.webapp.service.wiseup.WiseUpService;

/**
 * Imports an external project to the portal.
 * @author hirokiterashima
 * @author scott cytacki
 * @version $Id$
 */
public class ImportExternalProjectController extends AbstractController {

	private static final String PROJECT_COMMUNICATOR_ID_PARAM = "projectCommunicatorId";

	private static final String EXTERNAL_ID_PARAM = "externalId";
	
	private WiseUpService wiseUpService;


	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {

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

	public void setWiseUpService(WiseUpService wiseUpService) {
		this.wiseUpService = wiseUpService;
	}

}
