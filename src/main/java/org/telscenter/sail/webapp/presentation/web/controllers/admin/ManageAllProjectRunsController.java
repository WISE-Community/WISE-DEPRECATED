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

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.springframework.web.servlet.mvc.SimpleFormController;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.service.offering.RunService;

/**
 * Controller for admin user's Manage All Project Runs page.  List all
 * the project <code>Runs</code> on the page with links to manage them
 * 
 * @author Hiroki Terashima
 * @version $Id$
 */
public class ManageAllProjectRunsController extends SimpleFormController {

	private RunService runService;

	protected static final String RUNLIST_PARAM_NAME = "runList";
	
	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		String queryString = request.getParameter("q");

		List<Run> runList;
		List<Run> run_list = runService.getAllRunList();
		String projectID = request.getParameter("projectId");
		if(projectID == null){
			runList = run_list;
		} else {
			Long project_ID = Long.parseLong(projectID);
			runList = new ArrayList<Run>();
			for(Run run: run_list){
				if(run.getProject().getId().equals(project_ID)){
					runList.add(run);
				}
			}
		}
		
		List<Run> runListFiltered = new ArrayList<Run>();
		if (queryString != null && queryString.equals("current")) {
			for (Run run : runList) {
				if (!run.isEnded()) {
					runListFiltered.add(run);
				}
			}
		} else if (queryString != null && queryString.equals("archived")) {
			for (Run run : runList) {
				if (run.isEnded()) {
					runListFiltered.add(run);
				}
			}
		}
		
		ModelAndView modelAndView = new ModelAndView();
		modelAndView.addObject(RUNLIST_PARAM_NAME, runListFiltered);
		return modelAndView;
	}
	

	/**
	 * @param runService the runService to set
	 */
	public void setRunService(RunService runService) {
		this.runService = runService;
	}

}
