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
package org.wise.portal.presentation.web.controllers.teacher.management;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.impl.ChangeWorkgroupParameters;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.WISEWorkgroup;
import org.wise.portal.service.group.GroupService;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.workgroup.WISEWorkgroupService;

/**
 * Controller for making changes to student workgroups
 * @author Hiroki Terashima
 */
@Controller
public class SubmitWorkgroupChangesController {

	@Autowired
	private WISEWorkgroupService wiseWorkgroupService;
	
	@Autowired
	private RunService runService;
	
	@Autowired
	private UserService userService;
	
	@Autowired
	private GroupService groupService;
	
	@RequestMapping("/teacher/management/submitworkgroupchanges.html")
	protected ModelAndView handleRequestInternal(
			HttpServletRequest request,
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
				params.setWorkgroupFrom(wiseWorkgroupService.retrieveById(Long.valueOf(workgroupFromId)));
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
				params.setWorkgroupTo(wiseWorkgroupService.retrieveById(workgroupToIdLong));
				params.setWorkgroupToId(Long.valueOf(workgroupToId));
			}
			try {
				wiseWorkgroupService.updateWorkgroupMembership(params);
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
				wiseWorkgroupService.updateWorkgroupMembership(params);
			for (int j=1; j<newWGList.size();j++) {
				params = newWGList.get(j);
				params.setWorkgroupTo(newWorkgroup);
				params.setWorkgroupToId(newWorkgroup.getId());
				wiseWorkgroupService.updateWorkgroupMembership(params);
			}
		}
		response.getWriter().print(tabIndex);
		return null;
	}
}
