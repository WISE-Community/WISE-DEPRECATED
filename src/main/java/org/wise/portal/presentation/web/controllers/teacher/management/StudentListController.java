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
package org.wise.portal.presentation.web.controllers.teacher.management;

import java.util.Set;
import java.util.TreeSet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.offering.RunService;

/**
 * Controller for printing a list of students in a project run.
 * At least the runId must be specified.
 * Other fields that can be specified to narrow the search are:
 * * periodIds
 * 
 * @author Hiroki Terashima
 * @version $Id$
 */
@Controller
public class StudentListController {

	@Autowired
	private RunService runService;

	protected static final String RUNID_PARAM_KEY = "runId";

	protected static final String RUN = "run";

	protected static final String PERIODS = "periods";

	@RequestMapping("/teacher/management/studentlist.html")
	protected ModelAndView handleRequestInternal(
			@RequestParam("runId") String runId,
			HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		User user = ControllerUtil.getSignedInUser();
		
		Run run = runService.retrieveById(Long.valueOf(runId));

		if(this.runService.hasRunPermission(run, user, BasePermission.READ)){
			Set<Group> periods = run.getPeriods();
			Set<Group> requestedPeriods = new TreeSet<Group>();
			
			for (Group period : periods) {
				// TODO in future: filter by period...for now, include all periods
				requestedPeriods.add(period);
			}
			
			ModelAndView modelAndView = new ModelAndView();
			modelAndView.addObject(RUN, run);
			modelAndView.addObject(PERIODS, requestedPeriods);
			return modelAndView;
		} else {
			//get the context path e.g. /wise
			String contextPath = request.getContextPath();
			
			return new ModelAndView(new RedirectView(contextPath + "/accessdenied.html"));
		}
	}
}
