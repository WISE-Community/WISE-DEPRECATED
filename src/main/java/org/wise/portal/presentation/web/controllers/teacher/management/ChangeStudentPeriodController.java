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


import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.bind.support.SessionStatus;
import org.wise.portal.domain.impl.ChangePeriodParameters;
import org.wise.portal.domain.project.impl.Projectcode;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.validators.teacher.ChangePeriodParametersValidator;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.student.StudentService;
import org.wise.portal.service.user.UserService;
/**
 * @author patrick lawler
 *
 */
@Controller
@SessionAttributes("changePeriodParameters")
@RequestMapping("/teacher/management/changestudentperiod.html")
public class ChangeStudentPeriodController {

	@Autowired
	private RunService runService;
	
	@Autowired
	private StudentService studentService;
	
	@Autowired
	private UserService userService;
	
	@Autowired
	protected ChangePeriodParametersValidator changePeriodParametersValidator;
	
	protected final static String RUN_ID = "runId";
	
	protected final static String PROJECT_CODE = "projectCode";
	
	protected final static String USER_ID = "userId";
	
	//the path to this form view
	protected String formView = "/teacher/management/changestudentperiod";
	
	//the path to the success view
	protected String successView = "teacher/management/changestudentperiodsuccess";
	
    /**
     * Called before the page is loaded to initialize values
     * @param model the model object that contains values for the page to use when rendering the view
     * @param request the http request
     * @return the path of the view to display
     */
    @RequestMapping(method=RequestMethod.GET)
    public String initializeForm(ModelMap model, HttpServletRequest request) throws Exception {
		ChangePeriodParameters params = new ChangePeriodParameters();
		params.setStudent(userService.retrieveById(Long.parseLong(request.getParameter(USER_ID))));
		params.setRun(runService.retrieveById(Long.parseLong(request.getParameter(RUN_ID))));
		params.setProjectcode(request.getParameter(PROJECT_CODE));
		model.addAttribute("changePeriodParameters", params);
		
    	return formView;
    }
	
    /**
     * Called when the user submits the form
     * @param params the object that contains values from the form
     * @param bindingResult the object used for validation in which errors will be stored
     * @param sessionStatus the session status object
     * @return the path of the view to display
     */
    @RequestMapping(method=RequestMethod.POST)
    protected String onSubmit(
    		@ModelAttribute("changePeriodParameters") ChangePeriodParameters params,
    		BindingResult bindingResult,
    		SessionStatus sessionStatus) {
    	String view = "";
    	
    	//validate the parameters
    	changePeriodParametersValidator.validate(params, bindingResult);
    	
    	if(bindingResult.hasErrors()) {
    		//there were errors
    		view = "redirect:/accessdenied.html";
    	} else {
    		//there were no errors
        	User callingUser = ControllerUtil.getSignedInUser();
    		
    		if(this.runService.hasRunPermission(params.getRun(), callingUser, BasePermission.WRITE) ||
    				this.runService.hasRunPermission(params.getRun(), callingUser, BasePermission.ADMINISTRATION)) {
    			try {
    				if(!params.getProjectcodeTo().equals(params.getProjectcode())){
    					studentService.removeStudentFromRun(params.getStudent(), params.getRun());
    					studentService.addStudentToRun(params.getStudent(), new Projectcode(params.getRun().getRuncode(), params.getProjectcodeTo()));
    				}
    			} catch (Exception e){
    				
    			}

    			view = successView;
    		} else {
    			view = "redirect:/accessdenied.html";
    		}
    	}
		
    	sessionStatus.setComplete();
		return view;
	}
}
