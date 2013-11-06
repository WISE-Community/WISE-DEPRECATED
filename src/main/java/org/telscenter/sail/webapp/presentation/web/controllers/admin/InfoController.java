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

import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;
import net.sf.sail.webapp.service.UserService;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.springframework.web.servlet.view.RedirectView;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.authentication.MutableUserDetails;
import org.telscenter.sail.webapp.service.authentication.UserDetailsService;
import org.telscenter.sail.webapp.service.offering.RunService;
import org.telscenter.sail.webapp.service.student.StudentService;

/**
 * @author Sally Ahn
 * @version $Id: $
 */
public class InfoController extends AbstractController{
	
	private UserService userService;
	
	private StudentService studentService;
	
	private RunService runService;

	protected final static String USER_INFO_MAP = "userInfoMap";
	
	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest servletRequest,
			HttpServletResponse servletResponse) throws Exception {
		User signedInUser = ControllerUtil.getSignedInUser();
		String userName = (String) servletRequest.getParameter("userName");
		User infoUser = this.userService.retrieveUserByUsername(userName);
		
		if(signedInUser.getUserDetails().hasGrantedAuthority(UserDetailsService.ADMIN_ROLE) ||
				this.studentService.isStudentAssociatedWithTeacher(infoUser, signedInUser)){
			MutableUserDetails userDetails = (MutableUserDetails) infoUser.getUserDetails();
			ModelAndView modelAndView = new ModelAndView();
			
			//get the user info map that maps fields to values such as 'First Name' to 'Spongebob'
			HashMap<String, Object> userInfo = userDetails.getInfo();
			
			//we want the id to be the user id instead of the user details id so we will override it
			userInfo.put("ID", infoUser.getId());
			
			modelAndView.addObject(USER_INFO_MAP, userInfo);
			
			if(infoUser.getUserDetails().hasGrantedAuthority(UserDetailsService.STUDENT_ROLE)) {
				//the user we are looking up is a student
				modelAndView.addObject("isStudent", true);
				
				//get all the runs this student is in
				List<Run> runList = runService.getRunList(infoUser);
				
				//set the run list into the model
				modelAndView.addObject("runList", runList);
				
				modelAndView.setViewName("student/studentinfo");
			} else {
				//the user we are looking up is a teacher
				modelAndView.addObject("isStudent", false);
				
				modelAndView.setViewName("teacher/teacherinfo");
			}
			
	        return modelAndView;
		} else {
			return new ModelAndView(new RedirectView("/webapp/accessdenied.html"));
		}
    }

	/**
	 * @param userService the userService to set
	 */
	public void setUserService(UserService userService) {
		this.userService = userService;
	}

	/**
	 * @param studentService the studentService to set
	 */
	public void setStudentService(StudentService studentService) {
		this.studentService = studentService;
	}

	/**
	 * @param runService the runService to set
	 */
	public void setRunService(RunService runService) {
		this.runService = runService;
	}

}
