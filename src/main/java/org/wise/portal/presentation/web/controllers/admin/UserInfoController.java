/**
 * Copyright (c) 2007-2014 Regents of the University of California (Regents). 
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

import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.student.StudentService;
import org.wise.portal.service.user.UserService;

/**
 * Controller for displaying user information
 * @author Sally Ahn
 * @version $Id: $
 */
@Controller
public class UserInfoController {
	
	@Autowired
	private UserService userService;
	
	@Autowired
	private StudentService studentService;
	
	@Autowired
	private RunService runService;

	protected final static String USER_INFO_MAP = "userInfoMap";
	
	@RequestMapping(value={"/studentinfo.html", "/teacherinfo.html"})
	protected ModelAndView handleRequestInternal(
			HttpServletRequest servletRequest,
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
				
				//get all the runs that this teacher owns
				List<Run> runListByOwner = runService.getRunListByOwner(infoUser);

				//set the run list into the model
				modelAndView.addObject("runList", runListByOwner);

				modelAndView.setViewName("teacher/teacherinfo");
			}
			
	        return modelAndView;
		} else {
			//get the context path e.g. /wise
			String contextPath = servletRequest.getContextPath();
			return new ModelAndView(new RedirectView(contextPath + "/accessdenied.html"));
		}
    }
}
