/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
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
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 * 
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.presentation.web.controllers.admin;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.admin.StudentFields;
import org.wise.portal.domain.admin.TeacherFields;
import org.wise.portal.domain.authentication.Gender;
import org.wise.portal.domain.authentication.Schoollevel;
import org.wise.portal.domain.impl.LookupUserParameters;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.validators.LookupUserParametersValidator;
import org.wise.portal.service.user.UserService;

/**
 * Admin controller for looking up user accounts
 * @author Patrick Lawler
 * @author Hiroki Terashima
 */
@Controller
@RequestMapping("/admin/account/lookupuser")
public class LookupUserController {
	
	@Autowired
	private UserService userService;
	
	@Autowired
	private LookupUserParametersValidator lookupUserParametersValidator;

	@RequestMapping(method = RequestMethod.POST)
	protected ModelAndView onSubmit(@ModelAttribute("lookupUserParameters") LookupUserParameters param,
			BindingResult result, HttpServletRequest request){
		
		lookupUserParametersValidator.validate(param, result);
		if (result.hasErrors()) {
			return null;
		}

		Object term;
		
		String lookupField = param.getLookupField();
		String lookupCriteria = param.getLookupCriteria();
		String lookupData = param.getLookupData();

		// if searching for ID, make the term object in a Long.
		if ("id".equals(lookupField)) {
			term = Long.parseLong(lookupData);
		} else if ("gender".equals(lookupField)) {
			term = Gender.valueOf(lookupData.toUpperCase());
		} else if ("like".equals(lookupCriteria)) {
			term = "%" + lookupData + "%";
		} else if ("schoollevel".equals(lookupField)) {
			term = getLevel(lookupData);
		} else if ("like".equals(lookupCriteria)) {
			term = "%" + lookupData + "%";
		} else {
			term = lookupData;
		}
		
		String userDetailsType = "teacherUserDetails";
		if ("student".equals(request.getParameter("userType"))) {
			userDetailsType = "studentUserDetails";
		}
		
		List<User> users = this.userService.retrieveByField(lookupField, lookupCriteria, term, userDetailsType);
		
		ModelAndView modelAndView = new ModelAndView("admin/account/manageusers");
		// put the usernames in an array
		List<String> usernames = new ArrayList<String>();
		for (User user : users) {
			usernames.add(user.getUserDetails().getUsername());
		}
		
		if (users.size() < 1) {
			modelAndView.addObject("message", "No users given search criteria found.");
		} else {
			if ("student".equals(request.getParameter("userType"))) {
				modelAndView.addObject("students", usernames);
			} else {
				modelAndView.addObject("teachers", usernames);
			}
		}
		
		return modelAndView;
	}
	
    @RequestMapping(method = RequestMethod.GET)
    public ModelAndView initializeForm(ModelMap model, HttpServletRequest request) { 
    	ModelAndView mav = new ModelAndView();
    	mav.addObject("lookupUserParameters", new LookupUserParameters());
    	
		String userType = request.getParameter("userType");
		model.put("userType", userType);
		if ("teacher".equals(userType)) {
			model.put("fields", TeacherFields.values());
		} else {
			model.put("fields", StudentFields.values());
		}
    	
        return mav; 
    } 

	private Schoollevel getLevel(String level) {
		for (Schoollevel schoolLevel : Schoollevel.values()) {
			if (schoolLevel.toString().toUpperCase().contains(level.toUpperCase()))
				return schoolLevel;
		}
		return Schoollevel.OTHER;
	}
}