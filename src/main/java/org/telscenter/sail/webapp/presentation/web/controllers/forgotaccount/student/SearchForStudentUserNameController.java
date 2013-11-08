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
package org.telscenter.sail.webapp.presentation.web.controllers.forgotaccount.student;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.service.UserService;

import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.SimpleFormController;
import org.telscenter.sail.webapp.domain.impl.ReminderParameters;

/**
 * Looks up the project code in student lost password
 * 
 * @version $Id: $
 */


public class SearchForStudentUserNameController extends SimpleFormController {

	protected UserService userService = null;
	
    /**
     * @see org.springframework.web.servlet.mvc.SimpleFormController#onSubmit(javax.servlet.http.HttpServletRequest,
     *      javax.servlet.http.HttpServletResponse, java.lang.Object,
     *      org.springframework.validation.BindException)
     */
    @Override
    
    protected ModelAndView onSubmit(HttpServletRequest request,
            HttpServletResponse response, Object command, BindException errors)
            throws Exception {
    	
    	//get the object that contains the values from the jsp form
        ReminderParameters params = (ReminderParameters) command;

        String[] fields = null;
		String[] values = null;
		String classVar = "";
		
		//get the values from the form
        String firstName = params.getFirstName();
		String lastName = params.getLastName();
		String birthMonth = params.getBirthMonth();
		String birthDay = params.getBirthDay();
		
		//populate the array that will be used to search for the User accounts
		fields = new String[4];
		fields[0] = "firstname";
		fields[1] = "lastname";
		fields[2] = "birthmonth";
		fields[3] = "birthday";
		
		//populate the array that will be used to search for the User accounts
		values = new String[4];
		values[0] = firstName;
		values[1] = lastName;
		values[2] = birthMonth;
		values[3] = birthDay;
		
		//the type of object to search
		classVar = "studentUserDetails";
		
		//find all the accounts with matching values
		List<User> accountsThatMatch = userService.retrieveByFields(fields, values, classVar);
        
        Map<String, Object> model = new HashMap<String, Object>();
        
        //populate the model so the success page has access to these values
        model.put("users", accountsThatMatch);
        model.put("firstName", firstName);
        model.put("lastName", lastName);
        model.put("birthMonth", birthMonth);
        model.put("birthDay", birthDay);
        
		return new ModelAndView(getSuccessView(), model);
    }

	public void setUserService(UserService userService) {
        this.userService = userService;
    }
}

