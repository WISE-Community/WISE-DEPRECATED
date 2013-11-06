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
package org.telscenter.sail.webapp.presentation.web.controllers.student;

import java.io.IOException;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.impl.CurnitGetCurnitUrlVisitor;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.service.offering.RunService;

/**
 * Controller for handling student VLE-portal interactions.
 * - launch vle, pass in contentbaseurl, load student data url, etc.
 * 
 * @author hirokiterashima
 * @version $Id$
 */
public class StudentVLEController extends AbstractController {

	private RunService runService;
	
	Properties portalProperties;
	
	protected final static String CURRENT_STUDENTRUNINFO_LIST_KEY = "current_run_list";

	protected final static String ENDED_STUDENTRUNINFO_LIST_KEY = "ended_run_list";

	protected final static String HTTP_TRANSPORT_KEY = "http_transport";

	protected final static String WORKGROUP_MAP_KEY = "workgroup_map";
	
	static final String DEFAULT_PREVIEW_WORKGROUP_NAME = "Your test workgroup";

	private static final String RUNID = "runId";

	/** 
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		
    	Long runId = Long.parseLong(request.getParameter(RUNID));
		Run run = this.runService.retrieveById(runId);
		
		String action = request.getParameter("action");
		if (action != null) {
			if (action.equals("getData")) {
				return handleGetData(request, response, run);
			} else  if (action.equals("postData")) {
				return handlePostData(request, response, run);
			} else if (action.equals("getRunInfo")) {
				return handleGetRunInfo(request, response, run);
			} else if (action.equals("getRunExtras")) {
				return handleGetRunExtras(request, response, run);
			} else {
				// shouldn't get here
				throw new RuntimeException("should not get here");
			}
		} else {
			return handleLaunchVLE(request, run);
		}
	}

	/**
	 * Retrns the RunInfo XML containing information like whether the run
	 * is paused or messages that teacher wants to send to students.
	 * @param request
	 * @param response
	 * @param run
	 * @return
	 * @throws IOException 
	 */
	private ModelAndView handleGetRunInfo(HttpServletRequest request,
			HttpServletResponse response, Run run) throws IOException {
		String runInfoString = "<RunInfo>" + run.getInfo() + "</RunInfo>";
		response.setHeader("Cache-Control", "no-cache");
		response.setHeader("Pragma", "no-cache");
		response.setDateHeader("Expires", 0);

		response.setContentType("text/xml");
		response.getWriter().print(runInfoString);
		return null;
	}
	
	/**
	 * Retrns the RunExtras JSON string containing information like
	 * the maxscores that teacher defines
	 * @param request
	 * @param response
	 * @param run
	 * @return
	 * @throws IOException 
	 */
	private ModelAndView handleGetRunExtras(HttpServletRequest request,
			HttpServletResponse response, Run run) throws IOException {
		response.setHeader("Cache-Control", "no-cache");
		response.setHeader("Pragma", "no-cache");
		response.setDateHeader("Expires", 0);

		String runExtras = run.getExtras();
		if (runExtras == null) {
			runExtras = "";
		}
		
		response.getWriter().print(runExtras);
		return null;
	}

	/**
	 * @param request
	 * @param response
	 * @param run
	 * @param user
	 * @param workgroup
	 * @return
	 */
	private ModelAndView handlePostData(HttpServletRequest request,
			HttpServletResponse response, Run run) {
		String baseurl = ControllerUtil.getBaseUrlString(request);
		ModelAndView modelAndView = new ModelAndView("forward:" + baseurl + "/vlewrapper/postdata.html");
		return modelAndView;
	}

	/**
	 * @param request
	 * @param response
	 * @param run
	 * @param user
	 * @param workgroup
	 * @return
	 */
	private ModelAndView handleGetData(HttpServletRequest request,
			HttpServletResponse response, Run run) {
		String baseurl = ControllerUtil.getBaseUrlString(request);
		ModelAndView modelAndView = new ModelAndView("forward:" + baseurl + "/vlewrapper/getdata.html");
		return modelAndView;
	}

	/**
	 * @param request
	 * @param modelAndView
	 * @param run
	 * @param workgroup
	 * @return
	 * @throws ObjectNotFoundException 
	 */
	private ModelAndView handleLaunchVLE(HttpServletRequest request,
			Run run) throws ObjectNotFoundException {
		String portalurl = ControllerUtil.getBaseUrlString(request);
		
		String vleurl = portalurl + "/vlewrapper/vle/vle.html";
		String vleConfigUrl = portalurl + "/webapp/request/info.html?runId=" + run.getId() + "&action=getVLEConfig";

		String previewRequest = request.getParameter("preview");
		if (previewRequest != null && Boolean.valueOf(previewRequest)) {
			vleConfigUrl += "&requester=portalpreview";
		} else {
			vleConfigUrl += "&requester=run";
		}
		
		//get the path to the project file
		String curriculumBaseWWW = portalProperties.getProperty("curriculum_base_www");
		String rawProjectUrl = (String) run.getProject().getCurnit().accept(new CurnitGetCurnitUrlVisitor());
		String contentUrl = curriculumBaseWWW + rawProjectUrl;

		ModelAndView modelAndView = new ModelAndView();
    	modelAndView.addObject("run", run);
    	modelAndView.addObject("vleurl",vleurl);
    	modelAndView.addObject("vleConfigUrl", vleConfigUrl);
    	modelAndView.addObject("contentUrl", contentUrl);
		return modelAndView;
	}
	
	/**
	 * @param runService the runService to set
	 */
	@Required
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
