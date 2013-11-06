package org.telscenter.sail.webapp.presentation.web.controllers;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.webservice.http.HttpRestTransport;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;
import net.sf.sail.webapp.service.workgroup.WorkgroupService;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.service.offering.RunService;

/**
* main page for assess student work
*
* @author Anthony Perritano
*/
public class AssessStudentWorkMainController extends AbstractController {

	private RunService runService;

	private WorkgroupService workgroupService;

	private HttpRestTransport httpRestTransport;

	protected final static String HTTP_TRANSPORT_KEY = "http_transport";

	protected final static String RUN_LIST_KEY = "run_list";
	
	protected final static String WORKGROUP_MAP_KEY = "workgroup_map";

	static final String DEFAULT_PREVIEW_WORKGROUP_NAME = "Preview";
	
	private static final String VIEW_NAME = "runlist";

	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest,
	 *      javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(
			HttpServletRequest servletRequest,
			HttpServletResponse servletResponse) throws Exception {
		
    	ModelAndView modelAndView = new ModelAndView(VIEW_NAME);
    	ControllerUtil.addUserToModelAndView(servletRequest, modelAndView);
 
		User user = (User) modelAndView.getModel().get(ControllerUtil.USER_KEY);
		List<Run> runList = this.runService.getRunList();
		Map<Run, List<Workgroup>> workgroupMap = new HashMap<Run, List<Workgroup>>();
		for (Run run : runList) {
			List<Workgroup> workgroupList = this.workgroupService
					.getWorkgroupListByOfferingAndUser(run, user);
			workgroupList = this.workgroupService
					.createPreviewWorkgroupForOfferingIfNecessary(run,
							workgroupList, user, DEFAULT_PREVIEW_WORKGROUP_NAME);
			workgroupMap.put(run, workgroupList);
		}

		modelAndView.addObject(RUN_LIST_KEY, runList);
		modelAndView.addObject(WORKGROUP_MAP_KEY, workgroupMap);
		modelAndView.addObject(HTTP_TRANSPORT_KEY, this.httpRestTransport);
		return modelAndView;
	}

	/**
	 * @param workgroupService
	 *            the workgroupService to set
	 */
	@Required
	public void setWorkgroupService(WorkgroupService workgroupService) {
		this.workgroupService = workgroupService;
	}

	/**
	 * @param offeringService
	 *            the offeringService to set
	 */
	@Required
	public void setRunService(RunService runService) {
		this.runService = runService;
	}

	/**
	 * @param httpRestTransport
	 *            the httpRestTransport to set
	 */
	@Required
	public void setHttpRestTransport(HttpRestTransport httpRestTransport) {
		this.httpRestTransport = httpRestTransport;
	}

}
