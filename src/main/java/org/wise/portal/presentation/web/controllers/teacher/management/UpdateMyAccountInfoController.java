/**
 * Copyright (c) 2008-2014 Regents of the University of California (Regents). 
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
package org.wise.portal.presentation.web.controllers.teacher.management;

import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.TeacherAccountForm;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.presentation.web.controllers.teacher.RegisterTeacherController;

/**
 * Controller for updating teacher account information, such as 
 * - school name
 * - school level
 * - curriculum subjects
 * - etc
 * 
 * @author Sally Ahn
 * @author Hiroki Terashima
 * @version $Id$
 */
@Controller
@SessionAttributes("teacherAccountForm")
@RequestMapping("/teacher/management/updatemyaccountinfo.html")
public class UpdateMyAccountInfoController extends RegisterTeacherController {
	
	//the path to this form view
	private String formView = "teacher/management/updatemyaccountinfo";
	
	//the path to the success view
	private String successView = "teacher/management/updatemyaccount";
	
    /**
     * Called before the page is loaded to initialize values.
	 * Adds the TeacherAccountForm object to the model so that the form
	 * can be populated.
     * @param model the model object that contains values for the page to use when rendering the view
     * @return the path of the view to display
     */
    @RequestMapping(method=RequestMethod.GET)
    public String initializeForm(ModelMap modelMap) throws Exception {
    	//get the signed in user
    	User signedInUser = ControllerUtil.getSignedInUser();
    	
    	//get the teacher user details for the signed in user
    	TeacherUserDetails teacherUserDetails = (TeacherUserDetails) signedInUser.getUserDetails();
    	
    	//create the teacher account form object used to populate the form
    	TeacherAccountForm teacherAccountForm = new TeacherAccountForm(teacherUserDetails);
    	
    	//put the teacher account form object into the model
    	modelMap.put("teacherAccountForm", teacherAccountForm);
    	
    	//add more objects into the model that will be used by the form
    	populateModel(modelMap);
    	
    	//get the form view
    	String view = getFormView();
    	
    	return view;
    }
    
    /**
     * Get the form view
     * @return the form view
     */
    protected String getFormView() {
    	return formView;
    }
    
    /**
     * Get the success view
     * @return the success view
     */
    protected String getSuccessView() {
    	return successView;
    }
}
