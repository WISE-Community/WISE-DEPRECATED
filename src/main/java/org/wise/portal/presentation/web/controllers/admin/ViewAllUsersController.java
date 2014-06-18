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
package org.wise.portal.presentation.web.controllers.admin;

import java.text.DateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.wise.portal.dao.user.UserDao;
import org.wise.portal.domain.admin.DailyAdminJob;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.presentation.web.listeners.WISESessionListener;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.user.UserService;

/**
 * @author Sally Ahn
 * @version $Id: $
 */
public class ViewAllUsersController extends AbstractController{

	private UserService userService;
	
	private UserDetailsService userDetailsService;

	protected static final String VIEW_NAME = "admin/account/manageusers";

	protected static final String TEACHERS = "teachers";

	protected static final String STUDENTS = "students";

	protected static final String STUDENT = "student";

	protected static final String TEACHER = "teacher";

	protected static final String ADMINS = "admins";

	protected static final String OTHER = "other";

	protected static final String USER_TYPE = "userType";

	private static final String USERNAMES = "usernames";
	
	private static final String LOGGED_IN_STUDENT_USERNAMES = "loggedInStudentUsernames";

	private static final String LOGGED_IN_TEACHER_USERNAMES = "loggedInTeacherUsernames";

	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest,
	 *      javax.servlet.http.HttpServletResponse)
	 */
	@SuppressWarnings("unchecked")
	@Override
	protected ModelAndView handleRequestInternal(
			HttpServletRequest servletRequest,
			HttpServletResponse servletResponse) throws Exception {

		ModelAndView modelAndView = new ModelAndView(VIEW_NAME);
		ControllerUtil.addUserToModelAndView(servletRequest, modelAndView);

		String onlyShowLoggedInUser = servletRequest.getParameter("onlyShowLoggedInUser");
		String onlyShowUsersWhoLoggedIn = servletRequest.getParameter("onlyShowUsersWhoLoggedIn");
		if (onlyShowLoggedInUser != null && onlyShowLoggedInUser.equals("true")) {
			// get logged in users from servlet context
			HashMap<String, User> allLoggedInUsers = 
				(HashMap<String, User>) servletRequest.getSession()
					.getServletContext().getAttribute(WISESessionListener.ALL_LOGGED_IN_USERS);

			HashMap<String, Run> studentsToRuns = 
				(HashMap<String, Run>) servletRequest.getSession()
					.getServletContext().getAttribute("studentsToRuns");

			ArrayList<Object> loggedInStudent = new ArrayList<Object>();
			ArrayList<Object> loggedInTeacher = new ArrayList<Object>();
			if (allLoggedInUsers != null) {
				for (String sessionId : allLoggedInUsers.keySet()) {
					User loggedInUser = allLoggedInUsers.get(sessionId);
					if (loggedInUser.getUserDetails() instanceof StudentUserDetails) {
						Object[] loggedInStudentArray=new Object[2];
						loggedInStudentArray[0] = loggedInUser;
						// since this is a student, look in the studentToRuns session variable and see if this student is running
						// any projects
						if (studentsToRuns != null && studentsToRuns.containsKey(sessionId)) {
							Run run = studentsToRuns.get(sessionId);
							loggedInStudentArray[1] = run;		
						}
						loggedInStudent.add(loggedInStudentArray);
					} else {
						loggedInTeacher.add(loggedInUser);					
					}
				}
			}
			modelAndView.addObject(LOGGED_IN_STUDENT_USERNAMES, loggedInStudent);
			modelAndView.addObject(LOGGED_IN_TEACHER_USERNAMES, loggedInTeacher);
		} else if (onlyShowUsersWhoLoggedIn != null) {
			DailyAdminJob adminJob = (DailyAdminJob) this.getApplicationContext().getBean("dailyAdminJob");
			adminJob.setUserDao((UserDao<User>) this.getApplicationContext().getBean("userDao"));
			Date dateMin = null, dateMax = null;
			Calendar now = Calendar.getInstance();
			
			
			if ("today".equals(onlyShowUsersWhoLoggedIn)) {
				Calendar todayZeroHour = Calendar.getInstance();
				todayZeroHour.set(Calendar.HOUR_OF_DAY, 0);            // set hour to midnight
				todayZeroHour.set(Calendar.MINUTE, 0);                 // set minute in hour
				todayZeroHour.set(Calendar.SECOND, 0);                 // set second in minute
				todayZeroHour.set(Calendar.MILLISECOND, 0);            // set millis in second
				dateMin = todayZeroHour.getTime();  

				dateMax = new java.util.Date(now.getTimeInMillis());
			} else if ("thisWeek".equals(onlyShowUsersWhoLoggedIn)) {
				dateMax = new java.util.Date(now.getTimeInMillis());
				
				now.set(Calendar.DAY_OF_WEEK, 1);
				dateMin = now.getTime();    
			} else if ("thisMonth".equals(onlyShowUsersWhoLoggedIn)) {
				dateMax = new java.util.Date(now.getTimeInMillis());
				
				now.set(Calendar.DAY_OF_MONTH, 1);
				dateMin = now.getTime();    
			} else if ("thisYear".equals(onlyShowUsersWhoLoggedIn)) {
				dateMax = new java.util.Date(now.getTimeInMillis());
				
				now.set(Calendar.DAY_OF_YEAR, 1);
				dateMin = now.getTime();    
			}
			
			
			adminJob.setYesterday(dateMin);
			adminJob.setToday(dateMax);
			
			List<User> studentsWhoLoggedInSince = adminJob.findUsersWhoLoggedInSinceYesterday("studentUserDetails");
			modelAndView.addObject("studentsWhoLoggedInSince", studentsWhoLoggedInSince);

			List<User> teachersWhoLoggedInSince = adminJob.findUsersWhoLoggedInSinceYesterday("teacherUserDetails");
			modelAndView.addObject("teachersWhoLoggedInSince", teachersWhoLoggedInSince);
		} else {
			// result depends on passed-in userType parameter
			String userType = servletRequest.getParameter(USER_TYPE);
			if (userType == null) {
				List<String> allUsernames = this.userService.retrieveAllUsernames();
				modelAndView.addObject(USERNAMES, allUsernames);
			} else if (userType.equals(STUDENT)) {

				List<String> usernames = this.userDetailsService.retrieveAllUsernames(StudentUserDetails.class.getName());
				modelAndView.addObject(STUDENTS, usernames);
			} else if (userType.equals(TEACHER)) {
				List<String> usernames = this.userDetailsService.retrieveAllUsernames(TeacherUserDetails.class.getName());

				modelAndView.addObject(TEACHERS, usernames);				
			}
		}
		return modelAndView;
	}

	/**
	 * @param userService the userService to set
	 */
	public void setUserService(UserService userService) {
		this.userService = userService;
	}

	/**
	 * @param userDetailsService the userDetailsService to set
	 */
	public void setUserDetailsService(UserDetailsService userDetailsService) {
		this.userDetailsService = userDetailsService;
	}
}
