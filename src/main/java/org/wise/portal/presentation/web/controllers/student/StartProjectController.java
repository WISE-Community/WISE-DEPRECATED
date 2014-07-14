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
package org.wise.portal.presentation.web.controllers.student;

import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Properties;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.hibernate.StaleObjectStateException;
import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate4.HibernateOptimisticLockingFailureException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.project.impl.LaunchProjectParameters;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.WISEWorkgroup;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.attendance.StudentAttendanceService;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.workgroup.WISEWorkgroupService;

/**
 * Controller to allow students to launch the VLE using the project.
 * This link is *always* used to start the project for students, whether
 * - they're not in a workgroup
 * - they're in a workgroup by themself
 * - they're in a workgroup with other people
 *
 * @author Hiroki Terashima
 * @version $Id$
 */
@Controller
public class StartProjectController {

	@Autowired
	private RunService runService;

	@Autowired
	private WISEWorkgroupService wiseWorkgroupService;

	@Autowired
	private ProjectService projectService;
	
	@Autowired
	private StudentAttendanceService studentAttendanceService;
	
	@Autowired
	protected Properties wiseProperties;

	private static final String SELECT_TEAM_URL = "student/selectteam";

	private static final String TEAM_SIGN_IN_URL = "student/teamsignin";

	@RequestMapping("/student/startproject.html")
	protected synchronized ModelAndView handleRequestInternal(
			HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		 User user = ControllerUtil.getSignedInUser();

		String projectIdStr = request.getParameter("projectId");
		String runIdStr = request.getParameter("runId");
		Long runId = null;
		if (runIdStr != null) {
			runId = Long.valueOf(runIdStr);
		} else if (projectIdStr != null) {
			// we need to look up the run that the logged-in user is 
			// associated with that has been set up with the specified projectId.
			// currently, this assumes that student can be associated with one
			// run of that project.
			Long projectId = Long.valueOf(projectIdStr);
			List<Run> runList = runService.getRunList(user);
			for (Run run : runList) {
				if (run.getProject().getId().equals(projectId)) {
					runId = run.getId();
				}
			}
			if (runId == null) {
				// this means that the run has not been set up, or the student has not
				// associated with the project run yet.
				response.getWriter().print("You cannot see this yet. Either your teacher has not " +
						"set up the run, or you have not added the run. Please talk to your teacher.");
				return null;
			}
		}
		
		String bymyselfStr = request.getParameter("bymyself");
		boolean bymyself = false;
		if (bymyselfStr != null) {
			bymyself = Boolean.valueOf(bymyselfStr);
		}
		
		Run run = runService.retrieveById(runId);

		Group period = run.getPeriodOfStudent(user);
		
		List<Workgroup> workgroups = wiseWorkgroupService.getWorkgroupListByOfferingAndUser(run, user);
		assert(workgroups.size() <= 1);
		
		WISEWorkgroup workgroup = null;
		if (workgroups.size() == 0) { 	// student is not yet in a workgroup
			if (bymyself) { 
				// if bymyself=true was passed in as request
				// create new workgroup with this student in it
				String name = "Workgroup for user: " + user.getUserDetails().getUsername();
				Set<User> members = new HashSet<User>();
				members.add(user);
				workgroup = wiseWorkgroupService.createWISEWorkgroup(name, members, run, period);
				
				/* update run statistics */
				int maxLoop = 30;  // to ensure that the following while loop gets run at most this many times.
				int currentLoopIndex = 0;
				while(currentLoopIndex < maxLoop) {
					try {
						this.runService.updateRunStatistics(run.getId());
					} catch (HibernateOptimisticLockingFailureException holfe) {
						// multiple students tried to update run statistics at the same time, resulting in the exception. try again.
						currentLoopIndex++;
						continue;
					} catch (StaleObjectStateException sose) {
						// multiple students tried to create an account at the same time, resulting in this exception. try saving again.
						currentLoopIndex++;
						continue;
					}
					// if it reaches here, it means that HibernateOptimisticLockingFailureException was not thrown, so we can exit the loop.
					break;
				}
				
				LaunchProjectParameters launchProjectParameters = new LaunchProjectParameters();
				launchProjectParameters.setRun(run);
				launchProjectParameters.setWorkgroup(workgroup);
				launchProjectParameters.setHttpServletRequest(request);

				// update servlet session
				notifyServletSession(request, run);

				//get the values for the student attendance
				Long workgroupId = workgroup.getId();
				JSONArray presentUserIds = new JSONArray();
				JSONArray absentUserIds = new JSONArray();
				presentUserIds.put(user.getId());
				
				//create a student attendance entry
				addStudentAttendanceEntry(workgroupId, runId, presentUserIds, absentUserIds);
				
				return (ModelAndView) projectService.launchProject(launchProjectParameters);
			} else {
				// need to create a workgroup for this user, take them to create workgroup wizard
				ModelAndView modelAndView = new ModelAndView(SELECT_TEAM_URL);
				modelAndView.addObject("runId", runId);
				
				Integer maxWorkgroupSize = run.getMaxWorkgroupSize();
				if (maxWorkgroupSize == null) {
					String maxWorkgroupSizeStr = wiseProperties.getProperty("maxWorkgroupSize", "3");
					maxWorkgroupSize = Integer.parseInt(maxWorkgroupSizeStr);
				}
				modelAndView.addObject("maxWorkgroupSize",maxWorkgroupSize);
				return modelAndView;
			}
		} else if (workgroups.size() == 1) {
			workgroup = (WISEWorkgroup) workgroups.get(0);
			if (workgroup.getMembers().size() == 1) {
				/* update run statistics */
				int maxLoop = 30;  // to ensure that the following while loop gets run at most this many times.
				int currentLoopIndex = 0;
				while(currentLoopIndex < maxLoop) {
					try {
						this.runService.updateRunStatistics(run.getId());
					} catch (HibernateOptimisticLockingFailureException holfe) {
						// multiple students tried to update run statistics at the same time, resulting in the exception. try again.
						currentLoopIndex++;
						continue;
					} catch (StaleObjectStateException sose) {
						// multiple students tried to create an account at the same time, resulting in this exception. try saving again.
						currentLoopIndex++;
						continue;
					}
					// if it reaches here, it means that HibernateOptimisticLockingFailureException was not thrown, so we can exit the loop.
					break;
				}
				
				// if the student is already in a workgroup and she is the only member,
				// launch the project
				LaunchProjectParameters launchProjectParameters = new LaunchProjectParameters();
				launchProjectParameters.setRun(run);
				launchProjectParameters.setWorkgroup(workgroup);
				launchProjectParameters.setHttpServletRequest(request);
				
				//get the value for the student attendance
				Long workgroupId = workgroup.getId();
				JSONArray presentUserIds = new JSONArray();
				JSONArray absentUserIds = new JSONArray();
				presentUserIds.put(user.getId());
				
				//create a student attendance entry
				addStudentAttendanceEntry(workgroupId, runId, presentUserIds, absentUserIds);
				
				// update servlet session
				notifyServletSession(request, run);
				return (ModelAndView) projectService.launchProject(launchProjectParameters);				
			} else {
				ModelAndView modelAndView = new ModelAndView(TEAM_SIGN_IN_URL);
				modelAndView.addObject("runId", runId);
				return modelAndView;
			}
		} else {
			// TODO HT: this case should never happen. But since WISE requirements are not clear yet regarding
			// the workgroup issues, leave this for now.
			
			//the user is in multiple workgroups for the run so we will just get the last one
			workgroup = (WISEWorkgroup) workgroups.get(workgroups.size() - 1);
			if (workgroup.getMembers().size() == 1) {
				/* update run statistics */
				int maxLoop = 30;  // to ensure that the following while loop gets run at most this many times.
				int currentLoopIndex = 0;
				while(currentLoopIndex < maxLoop) {
					try {
						this.runService.updateRunStatistics(run.getId());
					} catch (HibernateOptimisticLockingFailureException holfe) {
						// multiple students tried to update run statistics at the same time, resulting in the exception. try again.
						currentLoopIndex++;
						continue;
					} catch (StaleObjectStateException sose) {
						// multiple students tried to create an account at the same time, resulting in this exception. try saving again.
						currentLoopIndex++;
						continue;
					}
					// if it reaches here, it means that HibernateOptimisticLockingFailureException was not thrown, so we can exit the loop.
					break;
				}
				
				// if the student is already in a workgroup and she is the only member,
				// launch the project
				LaunchProjectParameters launchProjectParameters = new LaunchProjectParameters();
				launchProjectParameters.setRun(run);
				launchProjectParameters.setWorkgroup(workgroup);
				launchProjectParameters.setHttpServletRequest(request);
				
				//get the value for the student attendance
				Long workgroupId = workgroup.getId();
				JSONArray presentUserIds = new JSONArray();
				JSONArray absentUserIds = new JSONArray();
				presentUserIds.put(user.getId());
				
				//create a student attendance entry
				addStudentAttendanceEntry(workgroupId, runId, presentUserIds, absentUserIds);
				
				// update servlet session
				notifyServletSession(request, run);
				return (ModelAndView) projectService.launchProject(launchProjectParameters);				
			} else {
				ModelAndView modelAndView = new ModelAndView(TEAM_SIGN_IN_URL);
				modelAndView.addObject("runId", runId);
				return modelAndView;
			}
		}

	}
	
	/**
	 * Inserts [user's sessionId,run] info into servletContext session variable.
	 * @param request current request
	 * @param run run that the logged in user is running
	 */
	public static void notifyServletSession(HttpServletRequest request, Run run) {
		HttpSession session = request.getSession();

		// add new session in a allLoggedInUsers servletcontext HashMap variable
		String sessionId = session.getId();
		HashMap<String, Long> studentToRunIds = (HashMap<String, Long>) session.getServletContext().getAttribute("studentsToRunIds");
		if (studentToRunIds == null) {
			studentToRunIds = new HashMap<String, Long>();
			session.getServletContext().setAttribute("studentsToRunIds", studentToRunIds);
		}
		
		studentToRunIds.put(sessionId, run.getId());
	}
	
	/**
	 * Adds a student attendance entry to the db
	 * @param workgroupId the id of the workgroup
	 * @param runId the id of the run
	 * @param presentUserIds the 
	 * @param absentUserIds
	 */
	private void addStudentAttendanceEntry(Long workgroupId, Long runId, JSONArray presentUserIds, JSONArray absentUserIds) {
		//get the current time
		Date loginTimestamp = new Date();
	    
		//add a student attendance entry
		this.studentAttendanceService.addStudentAttendanceEntry(workgroupId, runId, loginTimestamp, presentUserIds.toString(), absentUserIds.toString());
	}
}
