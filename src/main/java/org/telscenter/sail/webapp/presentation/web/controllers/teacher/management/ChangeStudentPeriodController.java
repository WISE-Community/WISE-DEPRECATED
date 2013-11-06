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


import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;
import net.sf.sail.webapp.service.UserService;

import org.springframework.security.acls.domain.BasePermission;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.SimpleFormController;
import org.springframework.web.servlet.view.RedirectView;
import org.telscenter.sail.webapp.domain.impl.ChangePeriodParameters;
import org.telscenter.sail.webapp.domain.impl.Projectcode;
import org.telscenter.sail.webapp.service.offering.RunService;
import org.telscenter.sail.webapp.service.student.StudentService;
/**
 * @author patrick lawler
 *
 */
public class ChangeStudentPeriodController extends SimpleFormController{

	private RunService runService;
	
	private StudentService studentService;
	
	private UserService userService;
	
	protected final static String RUN_ID = "runId";
	
	protected final static String PROJECT_CODE = "projectCode";
	
	protected final static String USER_ID = "userId";
	
	@Override
	protected Object formBackingObject(HttpServletRequest request) throws Exception {
		ChangePeriodParameters params = new ChangePeriodParameters();
		params.setStudent(userService.retrieveById(Long.parseLong(request.getParameter(USER_ID))));
		params.setRun(runService.retrieveById(Long.parseLong(request.getParameter(RUN_ID))));
		params.setProjectcode(request.getParameter(PROJECT_CODE));
		
		return params;
	}
	
	@Override
    protected ModelAndView onSubmit(HttpServletRequest request, 
    		HttpServletResponse response, Object command, BindException errors){
		User callingUser = ControllerUtil.getSignedInUser();
		ChangePeriodParameters params = (ChangePeriodParameters) command;
		
		if(this.runService.hasRunPermission(params.getRun(), callingUser, BasePermission.WRITE) ||
				this.runService.hasRunPermission(params.getRun(), callingUser, BasePermission.ADMINISTRATION)){
			try{
				if(!params.getProjectcodeTo().equals(params.getProjectcode())){
					studentService.removeStudentFromRun(params.getStudent(), params.getRun());
					studentService.addStudentToRun(params.getStudent(), new Projectcode(params.getRun().getRuncode(), params.getProjectcodeTo()));
				}
			} catch (Exception e){}
	
			
			ModelAndView modelAndView = new ModelAndView(getSuccessView());
			
			return modelAndView;
		} else {
			return new ModelAndView(new RedirectView("/webapp/accessdenied.html"));
		}
	}
	
	/**
	 * @param runService the runService to set
	 */
	public void setRunService(RunService runService) {
		this.runService = runService;
	}

	/**
	 * @param studentService the studentService to set
	 */
	public void setStudentService(StudentService studentService) {
		this.studentService = studentService;
	}

	/**
	 * @param userService the userService to set
	 */
	public void setUserService(UserService userService) {
		this.userService = userService;
	}
	
}
