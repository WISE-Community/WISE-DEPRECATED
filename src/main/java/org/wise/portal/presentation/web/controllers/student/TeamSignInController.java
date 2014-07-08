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
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Properties;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.hibernate.StaleObjectStateException;
import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate4.HibernateOptimisticLockingFailureException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.bind.support.SessionStatus;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;
import org.wise.portal.domain.StudentUserAlreadyAssociatedWithRunException;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.project.impl.LaunchProjectParameters;
import org.wise.portal.domain.project.impl.Projectcode;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.StudentRunInfo;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.WISEWorkgroup;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.validators.student.TeamSignInFormValidator;
import org.wise.portal.presentation.web.TeamSignInForm;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.attendance.StudentAttendanceService;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.student.StudentService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.workgroup.WISEWorkgroupService;

/**
 * Controller for handling team sign-ins before students start the project. The first user
 * entered in the form must be already signed-in and associated with a specific
 * <code>Run</code> and specific period. The second and third users entered will be
 * associated with the same <code>Run</code> and same period as the first user if
 * they are not already associated.
 *
 * @author Hiroki Terashima
 * @version $Id$
 */
@Controller
@SessionAttributes("teamSignInForm")
@RequestMapping("/student/teamsignin.html")
public class TeamSignInController {

	@Autowired
	private UserService userService;
	
	@Autowired
	private WISEWorkgroupService wiseWorkgroupService;
	
	@Autowired
	private RunService runService;
	
	@Autowired
	private StudentService studentService;

	@Autowired
	private ProjectService projectService;

	@Autowired
	private StudentAttendanceService studentAttendanceService;
	
	@Autowired
	private Properties wiseProperties;
	
	@Autowired
	private TeamSignInFormValidator teamSignInFormValidator;

	/**
	 * On submission of the Team Sign In form, the workgroup is updated
	 * Assume that the usernames are valid usernames that exist in the data store
	 */
	@RequestMapping(method=RequestMethod.POST)
	protected synchronized String onSubmit(@ModelAttribute("teamSignInForm") TeamSignInForm teamSignInForm, 
			BindingResult result, 
			HttpServletRequest request,
			HttpServletResponse response,
			SessionStatus status,
			ModelMap modelMap)
	throws Exception {
		
		teamSignInFormValidator.validate(teamSignInForm, result);
		if (result.hasErrors()) {
			return "student/teamsignin";
		}
		
		//the arrays to store the user ids of the students that are present or absent
		JSONArray presentUserIds = new JSONArray();
		JSONArray absentUserIds = new JSONArray();
		
		User user1 = userService.retrieveUserByUsername(teamSignInForm.getUsername1());
		User user2 = userService.retrieveUserByUsername(teamSignInForm.getUsername2());
		User user3 = userService.retrieveUserByUsername(teamSignInForm.getUsername3());
		User user4 = userService.retrieveUserByUsername(teamSignInForm.getUsername4());
		User user5 = userService.retrieveUserByUsername(teamSignInForm.getUsername5());
		User user6 = userService.retrieveUserByUsername(teamSignInForm.getUsername6());
		User user7 = userService.retrieveUserByUsername(teamSignInForm.getUsername7());
		User user8 = userService.retrieveUserByUsername(teamSignInForm.getUsername8());
		User user9 = userService.retrieveUserByUsername(teamSignInForm.getUsername9());
		User user10 = userService.retrieveUserByUsername(teamSignInForm.getUsername10());
		
		Run run = runService.retrieveById(teamSignInForm.getRunId());
		
		// get projectcode to use to add user2 ... userX to run
		StudentRunInfo studentRunInfoUser1 = studentService.getStudentRunInfo(user1, run);
		Projectcode projectcode = new Projectcode(run.getRuncode(), studentRunInfoUser1.getGroup().getName());

		//stores the members that are logged in
		Set<User> membersLoggedIn = new HashSet<User>();
		String workgroupname = "Workgroup for " + user1.getUserDetails().getUsername();
		
		//add the user that is already logged in
		membersLoggedIn.add(user1);
		
		//add user1 to the users that are present
		presentUserIds.put(user1.getId());
		
		/*
		 * get the workgroups for this run for user1, they should
		 * usually only be in 1 workgroup
		 */
		List<Workgroup> workgroups = wiseWorkgroupService.getWorkgroupListByOfferingAndUser(run, user1);

		//get the members in the workgroup
		Set<User> membersInWorkgroup = new HashSet<User>();
		
		if(workgroups != null && workgroups.size() > 0) {
			//get the members in the workgroup
			membersInWorkgroup = workgroups.get(0).getMembers();
		}
		
		User[] otherUsers = new User[]{user2, user3, user4, user5, user6, user7, user8, user9, user10};
		for (User user : otherUsers) {
			if (user != null) {
				try {
					userService.updateUser(user);
					studentService.addStudentToRun(user, projectcode);
				} catch (StudentUserAlreadyAssociatedWithRunException e) {
					// do nothing. it's okay if the student is already associated with this run.
				}
				
				//add user3 to the members logged in
				membersLoggedIn.add(user);
				
				workgroupname += user.getUserDetails().getUsername();
				workgroups.addAll(wiseWorkgroupService.getWorkgroupListByOfferingAndUser(run, user));
				
				//add user3 to the users that are present
				presentUserIds.put(user.getId());
			}
		}
		
		Workgroup workgroup = null;
		Group period = run.getPeriodOfStudent(user1);
		if (workgroups.size() == 0) {
			workgroup = wiseWorkgroupService.createWISEWorkgroup(workgroupname, membersLoggedIn, run, period);
		} else if (workgroups.size() == 1) {
			workgroup = workgroups.get(0);
			wiseWorkgroupService.addMembers(workgroup, membersLoggedIn);
		} else {
			// more than one user has created a workgroup for this run.
			// TODO HT gather requirements and find out what should be done in this case
			// for now, just choose one
			workgroup = workgroups.get(0);
			wiseWorkgroupService.addMembers(workgroup, membersLoggedIn);
		}
		
		/*
		 * loop through all the members that are in the workgroup to
		 * see who is absent
		 */
		Iterator<User> membersInWorkgroupIter = membersInWorkgroup.iterator();
		while(membersInWorkgroupIter.hasNext()) {
			boolean memberLoggedIn = false;
			
			//get a user that is in the workgroup
			User memberInWorkgroup = membersInWorkgroupIter.next();
			
			/*
			 * check if the user has logged in and is present
			 * by looping through all the user ids in presentUserIds
			 * and seeing if the user id is in the presentUserIds
			 * array
			 */
			for(int x=0; x<presentUserIds.length(); x++) {
				//get a present user id
				long presentUserId = presentUserIds.getLong(x);
				
				if(presentUserId == memberInWorkgroup.getId()) {
					//the user id matches so this memberInWorkgroup is present
					memberLoggedIn = true;
					break;
				}
			}
			
			if(!memberLoggedIn) {
				//the memberInWorkgroup is absent
				absentUserIds.put(memberInWorkgroup.getId());
			}
		}
		
		//get the values to create the student attendance entry
		Long workgroupId = workgroup.getId();
		Long runId = run.getId();
		Date loginTimestamp = new Date();
		
		//create a student attendance entry
		this.studentAttendanceService.addStudentAttendanceEntry(workgroupId, runId, loginTimestamp, presentUserIds.toString(), absentUserIds.toString());
		
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
		launchProjectParameters.setWorkgroup((WISEWorkgroup) workgroup);
		launchProjectParameters.setHttpServletRequest(request);
		StartProjectController.notifyServletSession(request, run);
		ModelAndView modelAndView = (ModelAndView) projectService.launchProject(launchProjectParameters);
		modelMap.put("closeokay", true);
		
		//clear the command object from the session
		status.setComplete(); 

		return "redirect:"+((RedirectView) modelAndView.getView()).getUrl();
	}
	
    @RequestMapping(method=RequestMethod.GET) 
    public String initializeForm(ModelMap modelMap,HttpServletRequest request) throws Exception { 

    	//get the signed in username
		User user = ControllerUtil.getSignedInUser();
		String signedInUsername = user.getUserDetails().getUsername();
		
		//get the form
		TeamSignInForm form = new TeamSignInForm();
		Long runId = null;
		
		String maxWorkgroupSizeStr = wiseProperties.getProperty("maxWorkgroupSize", "3");
		int maxWorkgroupSize = Integer.parseInt(maxWorkgroupSizeStr);
		form.setMaxWorkgroupSize(maxWorkgroupSize);
		
		//set the signed in username
		form.setUsername1(signedInUsername);
		
		try {
			//get the run id
			String runIdString = request.getParameter("runId");
			runId = Long.valueOf(runIdString);
		} catch (NumberFormatException e) {
			// do nothing.
		}
		
		if(runId != null) {
			// check to see if the logged-in user is associated with the runId or not before showing the sign in form.
			try {
				Run run = runService.retrieveById(runId);
				User signedInUser = ControllerUtil.getSignedInUser();
				if (!run.isStudentAssociatedToThisRun(signedInUser)) {
					return "student/index";	
				}
			} catch (NumberFormatException nfe) {
				// if there was an error (e.g. runId=abc or no runId specified, redirect to student homepage.
				return "student/index";			
			}	
			
			//set the run id
			form.setRunId(runId);
			
			//get the run
			Run run = (Run) runService.getOffering(runId);
			
			//get the members in the workgroup
			StudentRunInfo studentRunInfo = studentService.getStudentRunInfo(user, run);
			
			/*
			 * try to get the workgroup if it exists. if the student is running
			 * the project for the first time, the workgroup will not exist
			 */
			Workgroup workgroup = studentRunInfo.getWorkgroup();
			
			if(workgroup != null) {
				//get the members in the workgroup and pre-populate the username fields
				Set<User> members = workgroup.getMembers();

				//counter for how many members we have so far
				int currentNumMembers = 2;
				
				//loop through all the members
				Iterator<User> membersIterator = members.iterator();
				while(membersIterator.hasNext()) {
					//get a member and their username
					User member = membersIterator.next();
					String username = member.getUserDetails().getUsername();
					
					//check that the username is not the one that is already signed in
					if(username != null && !username.equals(signedInUsername)) {
						if(currentNumMembers == 2) {
							//set the username2
							form.setUsername2(username);
						} else if(currentNumMembers == 3) {
							//set the username3
							form.setUsername3(username);
						} else if (currentNumMembers == 4) {
							//set the username4
							form.setUsername4(username);
						} else if (currentNumMembers == 5) {
							//set the username5
							form.setUsername5(username);
						} else if (currentNumMembers == 6) {
							//set the username6
							form.setUsername6(username);
						} else if (currentNumMembers == 7) {
							//set the username7
							form.setUsername7(username);
						} else if (currentNumMembers == 8) {
							//set the username8
							form.setUsername8(username);
						} else if (currentNumMembers == 9) {
							//set the username9
							form.setUsername9(username);
						} else if (currentNumMembers == 10) {
							//set the username10
							form.setUsername10(username);
						}
						currentNumMembers++;
					}
				}					
			}
		}
		modelMap.put("teamSignInForm", form);
		return "student/teamsignin";
	}
}
