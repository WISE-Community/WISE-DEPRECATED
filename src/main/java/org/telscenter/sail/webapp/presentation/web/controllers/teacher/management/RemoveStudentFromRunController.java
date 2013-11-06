/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
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

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;
import net.sf.sail.webapp.service.UserService;
import net.sf.sail.webapp.service.authentication.UserDetailsService;
import net.sf.sail.webapp.service.workgroup.WorkgroupService;

import org.springframework.security.acls.domain.BasePermission;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.SimpleFormController;
import org.springframework.web.servlet.view.RedirectView;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.teacher.management.RemoveStudentFromRunParameters;
import org.telscenter.sail.webapp.service.offering.RunService;
import org.telscenter.sail.webapp.service.student.StudentService;

/**
 * Controller for removing students from <code>Run</code>, thereby
 * removing any association the student has with the run and its teacher, 
 * as well as their work.
 * 
 * @author Hiroki Terashima
 * @version $Id$
 */
public class RemoveStudentFromRunController extends SimpleFormController {

	private static final String RUNID_PARAM_NAME = "runId";

	private static final String USERID_PARAM_NAME = "userId";

	private RunService runService;
	
	private StudentService studentService;
	
	private UserService userService;
	
	private WorkgroupService workgroupService;

	@Override
	protected Object formBackingObject(HttpServletRequest request) throws Exception {
		RemoveStudentFromRunParameters params = new RemoveStudentFromRunParameters();
		params.setRunId(Long.parseLong(request.getParameter(RUNID_PARAM_NAME)));
		params.setUserId(Long.parseLong(request.getParameter(USERID_PARAM_NAME)));
		return params;
	}
	
	/**
     * On submission of the RemoveStudentFromRun form, the selected user is removed
     * from the specified run. She is also removed from the workgroup that she was in
     * for the run.
     * 
     * @see org.springframework.web.servlet.mvc.SimpleFormController#onSubmit(javax.servlet.http.HttpServletRequest,
     *      javax.servlet.http.HttpServletResponse, java.lang.Object,
     *      org.springframework.validation.BindException)
     */
    @Override
    protected ModelAndView onSubmit(HttpServletRequest request,
            HttpServletResponse response, Object command, BindException errors) {
    	RemoveStudentFromRunParameters params = (RemoveStudentFromRunParameters) command;
    	Long runId = params.getRunId();
    	Long userId = params.getUserId();
    	ModelAndView modelAndView = null;
    	Run run = null;
    	User studentUser = null;
    	try  {
    		run = runService.retrieveById(runId);
    		studentUser = userService.retrieveById(userId);
    		User callingUser = ControllerUtil.getSignedInUser();
    		
    		if(callingUser.getUserDetails().hasGrantedAuthority(UserDetailsService.ADMIN_ROLE) ||
    				this.runService.hasRunPermission(run, callingUser, BasePermission.WRITE)){
	    		studentService.removeStudentFromRun(studentUser, run);
	
	    		modelAndView = new ModelAndView(getSuccessView());
    		} else {
    			modelAndView = new ModelAndView(new RedirectView("/webapp/accessdenied.html"));
    		}
    	} catch (ObjectNotFoundException e) {
			errors.rejectValue("runId", "error.illegal-runId");
			modelAndView = new ModelAndView(getFormView());
    	}
    	return modelAndView;
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

	/**
	 * @param workgroupService the workgroupService to set
	 */
	public void setWorkgroupService(WorkgroupService workgroupService) {
		this.workgroupService = workgroupService;
	}
}
