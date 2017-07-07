/**
 * Copyright (c) 2007-2015 Regents of the University of California (Regents).
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
package org.wise.portal.presentation.web.controllers.teacher.management;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
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
import org.wise.portal.domain.teacher.management.ViewMyStudentsPeriod;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.WISEWorkgroup;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.acl.AclService;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.run.RunService;

/**
 * Controller for displaying students in the run
 * 
 * @author Patrick Lawler
 * @author Hiroki Terashima
 */
@Controller
public class ViewMyStudentsController {

	@Autowired
	private RunService runService;

	@Autowired
	private AclService<Run> aclService;

	protected final static String CURRENT_RUN_LIST_KEY = "current_run_list";
	
	protected final static String WORKGROUP_MAP_KEY = "workgroup_map";
	
	private static final String VIEWMYSTUDENTS_KEY = "viewmystudentsallperiods";

	private static final String TAB_INDEX = "tabIndex";

	private static final String RUN_NAME_KEY = "run_name";
	
	private static final String PROJECT_NAME = "project_name";
	
	private static final String PROJECT_ID = "project_id";
	
	protected static final String RUN_KEY = "run";

	@RequestMapping("/teacher/management/viewmystudents.html")
	protected ModelAndView handleRequestInternal(
			@RequestParam("runId") String runIdStr,
			HttpServletRequest servletRequest,
			HttpServletResponse servletResponse) throws Exception {
		
		User user = ControllerUtil.getSignedInUser();

		Map<Group, List<Workgroup>> workgroupMap = new HashMap<Group, List<Workgroup>>();
		
		List<Run> current_run_list = new ArrayList<Run>();
		Long runId = Long.valueOf(runIdStr);
		Run run = runService.retrieveById(runId);

		// Check that the user has permission for this run
		if (user.isAdmin() ||
				user.getUserDetails().hasGrantedAuthority(UserDetailsService.RESEARCHER_ROLE) ||
				this.aclService.hasPermission(run, BasePermission.ADMINISTRATION, user) ||
				this.aclService.hasPermission(run, BasePermission.READ, user)) {
			Set<Workgroup> allworkgroups = this.runService.getWorkgroups(runId);
			String workgroupsWithoutPeriod = "";
			Set<ViewMyStudentsPeriod> viewmystudentsallperiods = new TreeSet<ViewMyStudentsPeriod>();
			String projectName = run.getProject().getName();
			String projectId = run.getProject().getId().toString();
			
			/* retrieves the get parameter periodName to determine which 
			   period the link is requesting */
			String periodName = servletRequest.getParameter("periodName");
			
			int tabIndex = 0;
			int periodCounter = 0;
			
			for (Group period : run.getPeriods()) {
				ViewMyStudentsPeriod viewmystudentsperiod = new ViewMyStudentsPeriod();
				viewmystudentsperiod.setRun(run);
				viewmystudentsperiod.setPeriod(period);
				Set<Workgroup> periodworkgroups = new TreeSet<Workgroup>();
				Set<User> grouplessStudents = new HashSet<User>();
				grouplessStudents.addAll(period.getMembers());
				for (Workgroup workgroup : allworkgroups) {
					grouplessStudents.removeAll(workgroup.getMembers());
					try {
						if (workgroup.getMembers().size() > 0    // don't include workgroups with no members.
								&& !((WISEWorkgroup) workgroup).isTeacherWorkgroup() 
								&& ((WISEWorkgroup) workgroup).getPeriod().getId().equals(period.getId())) {
							// set url where this workgroup's work can be retrieved as PDF
							periodworkgroups.add(workgroup);				
						}
					} catch (NullPointerException npe) {
						// if a workgroup is not in a period, make a list of them and let teacher put them in a period...
						// this should not be the case if the code works correctly and associates workgroups with periods when workgroups are created.
						workgroupsWithoutPeriod += workgroup.getId().toString() + ",";
					}
				}
				viewmystudentsperiod.setGrouplessStudents(grouplessStudents);
				viewmystudentsperiod.setWorkgroups(periodworkgroups);
				viewmystudentsallperiods.add(viewmystudentsperiod);
				
				//determines which period tab to show in the AJAX tab object
				if (periodName != null && periodName.equals(period.getName())) {
					tabIndex = periodCounter;
				}
				periodCounter++;
			}
	
			if (servletRequest.getParameter("tabIndex") != null) {
				tabIndex = Integer.valueOf(servletRequest.getParameter("tabIndex"));
			}

			ModelAndView modelAndView = new ModelAndView();
			modelAndView.addObject("user", user);
			modelAndView.addObject(CURRENT_RUN_LIST_KEY, current_run_list);
			modelAndView.addObject(WORKGROUP_MAP_KEY, workgroupMap);
			modelAndView.addObject(VIEWMYSTUDENTS_KEY, viewmystudentsallperiods);
			modelAndView.addObject(RUN_KEY, run);
			modelAndView.addObject(RUN_NAME_KEY, run.getName());
			modelAndView.addObject(TAB_INDEX, tabIndex);
			modelAndView.addObject(PROJECT_NAME, projectName);
			modelAndView.addObject(PROJECT_ID, projectId);
			modelAndView.addObject("workgroupsWithoutPeriod", workgroupsWithoutPeriod);
			return modelAndView;
		} else {
			//get the context path e.g. /wise
			String contextPath = servletRequest.getContextPath();
			
			return new ModelAndView(new RedirectView(contextPath + "/accessdenied.html"));
		}
	}
}