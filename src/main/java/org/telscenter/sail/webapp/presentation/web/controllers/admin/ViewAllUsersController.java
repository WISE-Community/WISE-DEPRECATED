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
package org.telscenter.sail.webapp.presentation.web.controllers.admin;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.dao.user.UserDao;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;
import net.sf.sail.webapp.presentation.web.listeners.PasSessionListener;
import net.sf.sail.webapp.service.UserService;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.admin.AdminJob;
import org.telscenter.sail.webapp.domain.authentication.impl.StudentUserDetails;
import org.telscenter.sail.webapp.domain.authentication.impl.TeacherUserDetails;
import org.telscenter.sail.webapp.service.authentication.UserDetailsService;

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
		String onlyShowUsersWhoLoggedInToday = servletRequest.getParameter("onlyShowUsersWhoLoggedInToday");
		if (onlyShowLoggedInUser != null && onlyShowLoggedInUser.equals("true")) {
			// get logged in users from servlet context
			HashMap<String, User> allLoggedInUsers = 
				(HashMap<String, User>) servletRequest.getSession()
					.getServletContext().getAttribute(PasSessionListener.ALL_LOGGED_IN_USERS);

			HashMap<String, Run> studentsToRuns = 
				(HashMap<String, Run>) servletRequest.getSession()
					.getServletContext().getAttribute("studentsToRuns");

			ArrayList<Object> loggedInStudent = new ArrayList<Object>();
			ArrayList<String> loggedInTeacherUsernames = new ArrayList<String>();
			if (allLoggedInUsers != null) {
				for (String sessionId : allLoggedInUsers.keySet()) {
					User loggedInUser = allLoggedInUsers.get(sessionId);
					if (loggedInUser.getUserDetails() instanceof StudentUserDetails) {
						Object[] loggedInStudentArray=new Object[2];
						loggedInStudentArray[0] = loggedInUser.getUserDetails().getUsername();
						// since this is a student, look in the studentToRuns session variable and see if this student is running
						// any projects
						if (studentsToRuns != null && studentsToRuns.containsKey(sessionId)) {
							Run run = studentsToRuns.get(sessionId);
							loggedInStudentArray[1] = run;		
						}
						loggedInStudent.add(loggedInStudentArray);
					} else {
						loggedInTeacherUsernames.add(loggedInUser.getUserDetails().getUsername());					
					}
				}
			}
			modelAndView.addObject(LOGGED_IN_STUDENT_USERNAMES, loggedInStudent);
			modelAndView.addObject(LOGGED_IN_TEACHER_USERNAMES, loggedInTeacherUsernames);
		} else if (onlyShowUsersWhoLoggedInToday != null && onlyShowUsersWhoLoggedInToday.equals("true")) {
			AdminJob adminJob = (AdminJob) this.getApplicationContext().getBean("adminjob");
			adminJob.setUserDao((UserDao<User>) this.getApplicationContext().getBean("userDao"));
			Calendar todayCal = Calendar.getInstance();
			Date today = new java.sql.Date(todayCal.getTimeInMillis());
			todayCal.add(Calendar.DATE, -1);
			Date yesterday = new java.sql.Date(todayCal.getTimeInMillis());
			adminJob.setToday(today);
			adminJob.setYesterday(yesterday);
			
			List<User> studentsWhoLoggedInSinceYesterday = adminJob.findUsersWhoLoggedInSinceYesterday("studentUserDetails");
			modelAndView.addObject("studentsWhoLoggedInSinceYesterday", studentsWhoLoggedInSinceYesterday);

			List<User> teachersWhoLoggedInSinceYesterday = adminJob.findUsersWhoLoggedInSinceYesterday("teacherUserDetails");
			modelAndView.addObject("teachersWhoLoggedInSinceYesterday", teachersWhoLoggedInSinceYesterday);
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
