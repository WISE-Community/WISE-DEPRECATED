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
package org.telscenter.sail.webapp.presentation.web.controllers.teacher.management;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.service.UserService;
import net.sf.sail.webapp.service.group.GroupService;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.View;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.impl.ChangeWorkgroupParameters;
import org.telscenter.sail.webapp.domain.workgroup.WISEWorkgroup;
import org.telscenter.sail.webapp.service.offering.RunService;
import org.telscenter.sail.webapp.service.workgroup.WISEWorkgroupService;

/**
 * @author Hiroki Terashima
 */
public class SubmitWorkgroupChangesController extends AbstractController {

	private static final String TAB_INDEX = "tabIndex";

	private WISEWorkgroupService workgroupService;
	
	private RunService runService;
	
	private UserService userService;
	
	private GroupService groupService;
	
	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		// scenarios
		// 0) workgroupFrom and workgroupTo are equal. -> do nothing
		// 1) workgroupFrom and workgroupTo are both positive and exist
		// 2) workgroupFrom is groupless and workgroupTo is positive
		// 3) workgroupFrom is groupless and workgroupTo is negative
		// 4) workgroupFrom is positive and workgroupTo is groupless
		// 5) workgroupFrom is positive and workgroupTo is negative
		String periodId = request.getParameter("periodId");
		String runId = request.getParameter("runId");
		String tabIndex = request.getParameter("tabIndex");

		int numChanges = Integer.parseInt(request.getParameter("numChanges"));
		Map<Long, ArrayList<ChangeWorkgroupParameters>> newWorkgroupMap =
			new HashMap<Long, ArrayList<ChangeWorkgroupParameters>>();
		
		for (int i=0; i<numChanges; i++) {
			String userId = request.getParameter("userId_"+i);
			String workgroupFromId = request.getParameter("workgroupFrom_"+i);
			String workgroupToId = request.getParameter("workgroupTo_"+i);
			if (workgroupFromId.equals(workgroupToId)) {
				continue;
			}
			ChangeWorkgroupParameters params = new ChangeWorkgroupParameters();
			params.setOfferingId(Long.valueOf(runId));
			params.setPeriodId(Long.valueOf(periodId));
			params.setStudent(userService.retrieveById(Long.valueOf(userId)));
			if (!workgroupFromId.equals("groupless")) {
				params.setWorkgroupFrom(workgroupService.retrieveById(Long.valueOf(workgroupFromId)));
			}
			if (!workgroupToId.equals("groupless")) {
				Long workgroupToIdLong = Long.valueOf(workgroupToId);
				// handle cases when workgroupTo is negative separately (see below)
				if (workgroupToIdLong < 0) {
					ArrayList<ChangeWorkgroupParameters> newWGParams = 
						newWorkgroupMap.get(workgroupToIdLong);
					if (newWGParams == null) {
						newWGParams = new ArrayList<ChangeWorkgroupParameters>();
					}
					newWGParams.add(params);
					newWorkgroupMap.put(workgroupToIdLong, newWGParams);
					continue;
				}
				params.setWorkgroupTo(workgroupService.retrieveById(workgroupToIdLong));
				params.setWorkgroupToId(Long.valueOf(workgroupToId));
			}
			try {
				workgroupService.updateWorkgroupMembership(params);
			} catch (Exception e) {
				throw e;
			}
		}
		
		// go through all of the new workgroups, create them, and populate them
		for (Long key : newWorkgroupMap.keySet()) {
			ArrayList<ChangeWorkgroupParameters> newWGList = 
				newWorkgroupMap.get(key);
			ChangeWorkgroupParameters params = newWGList.get(0);
			Set<User> members = new HashSet<User>();
			members.add(params.getStudent());
			String name = "newWorkgroup";
			Run run = runService.retrieveById(params.getOfferingId());
			Group period = groupService.retrieveById(params.getPeriodId());
			params.setWorkgroupToId(new Long(-1));  // to indicate that we want to create a new workgroup
			WISEWorkgroup newWorkgroup = (WISEWorkgroup) 
				workgroupService.updateWorkgroupMembership(params);
			for (int j=1; j<newWGList.size();j++) {
				params = newWGList.get(j);
				params.setWorkgroupTo(newWorkgroup);
				params.setWorkgroupToId(newWorkgroup.getId());
				workgroupService.updateWorkgroupMembership(params);
			}
		}
		//ModelAndView modelAndView = new ModelAndView("/teacher/management/viewmystudents.html?runId="+runId);
		//modelAndView.addObject(TAB_INDEX, tabIndex);
		response.getWriter().print(tabIndex);
		return null;
	}
	
	/**
	 * @param workgroupService the workgroupService to set
	 */
	public void setWorkgroupService(WISEWorkgroupService workgroupService) {
		this.workgroupService = workgroupService;
	}
	
	public void setRunService(RunService runService){
		this.runService = runService;
	}

	/**
	 * @param userService the userService to set
	 */
	public void setUserService(UserService userService) {
		this.userService = userService;
	}

	/**
	 * @param groupService the groupService to set
	 */
	public void setGroupService(GroupService groupService) {
		this.groupService = groupService;
	}

}
