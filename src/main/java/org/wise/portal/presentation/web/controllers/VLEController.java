/**
 * Copyright (c) 2008-2014 Regents of the University of California (Regents). 
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
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 * 
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.presentation.web.controllers;

import java.io.IOException;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.module.impl.CurnitGetCurnitUrlVisitor;
import org.wise.portal.domain.run.Run;
import org.wise.portal.service.offering.RunService;

/**
 * Controller for handling student VLE-portal interactions.
 * - launch vle, pass in contentbaseurl, load student data url, etc.
 * 
 * @author hirokiterashima
 * @version $Id$
 */
@Controller
public class VLEController {

	@Autowired
	private RunService runService;
	
	@Autowired
	Properties wiseProperties;
	
	protected final static String CURRENT_STUDENTRUNINFO_LIST_KEY = "current_run_list";

	protected final static String ENDED_STUDENTRUNINFO_LIST_KEY = "ended_run_list";

	protected final static String HTTP_TRANSPORT_KEY = "http_transport";

	protected final static String WORKGROUP_MAP_KEY = "workgroup_map";
	
	static final String DEFAULT_PREVIEW_WORKGROUP_NAME = "Your test workgroup";

	private static final String RUNID = "runId";

	@RequestMapping(value={"/student/vle/vle.html","/teacher/vle/vle.html"})
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
		
		//get the context path e.g. /wise
		String contextPath = request.getContextPath();
		
		ModelAndView modelAndView = new ModelAndView("forward:" + baseurl + contextPath + "/postdata.html");
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
		
		//get the context path e.g. /wise
		String contextPath = request.getContextPath();
		
		ModelAndView modelAndView = new ModelAndView("forward:" + baseurl + contextPath + "/getdata.html");
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
		String wiseBaseURL = wiseProperties.getProperty("wiseBaseURL");
		String vleurl = wiseBaseURL + "/vle/vle.html";
		String vleConfigUrl = wiseBaseURL + "/request/info.html?runId=" + run.getId() + "&action=getVLEConfig";

		String previewRequest = request.getParameter("preview");
		if (previewRequest != null && Boolean.valueOf(previewRequest)) {
			vleConfigUrl += "&requester=portalpreview";
		} else {
			vleConfigUrl += "&requester=run";
		}
		
		//get the path to the project file
		String curriculumBaseWWW = wiseProperties.getProperty("curriculum_base_www");
		String rawProjectUrl = (String) run.getProject().getCurnit().accept(new CurnitGetCurnitUrlVisitor());
		String contentUrl = curriculumBaseWWW + rawProjectUrl;

		ModelAndView modelAndView = new ModelAndView("vle");
    	modelAndView.addObject("run", run);
    	modelAndView.addObject("vleurl",vleurl);
    	modelAndView.addObject("vleConfigUrl", vleConfigUrl);
    	modelAndView.addObject("contentUrl", contentUrl);
		return modelAndView;
	}
}
