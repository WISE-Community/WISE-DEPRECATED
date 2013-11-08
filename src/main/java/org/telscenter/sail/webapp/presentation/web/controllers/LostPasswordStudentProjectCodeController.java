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
package org.telscenter.sail.webapp.presentation.web.controllers;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.group.Group;

import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.SimpleFormController;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.authentication.impl.StudentUserDetails;
import org.telscenter.sail.webapp.domain.impl.Projectcode;
import org.telscenter.sail.webapp.domain.impl.ReminderParameters;
import org.telscenter.sail.webapp.service.offering.RunService;

/**
 * looks up the project code in student lost password
 * 
 * @author Anthony Perritano
 * @version
 */
public class LostPasswordStudentProjectCodeController extends
        SimpleFormController {

    
    protected RunService runService = null;
    private String PROJECT_CODE = "projectcode";
    private String RUN_TITLE = "runtitle";
    private String USERS = "users";
    /**
     * @see org.springframework.web.servlet.mvc.SimpleFormController#onSubmit(javax.servlet.http.HttpServletRequest,
     *      javax.servlet.http.HttpServletResponse, java.lang.Object,
     *      org.springframework.validation.BindException)
     */
    @Override
    protected ModelAndView onSubmit(HttpServletRequest request,
            HttpServletResponse response, Object command, BindException errors)
            throws Exception {
        ReminderParameters params = (ReminderParameters) command;

        Projectcode projectcode = new Projectcode(params.getProjectCode());
        
        String runCode = projectcode.getRuncode();
        String runPeriod = projectcode.getRunPeriod();
        
        try {
        	Run run = runService.retrieveRunByRuncode(runCode);
        	
        	Group group = run.getPeriodByName(runPeriod);
        	
        	Set<User> members = group.getMembers();
        	
        	Map<String, String> usersMap = new HashMap<String, String>();
        	for (User user : members) {
				usersMap.put(user.getUserDetails().getUsername(), ((StudentUserDetails)(user.getUserDetails())).getFirstname() + ((StudentUserDetails)(user.getUserDetails())).getLastname());
			}// for
        	
        	System.out.println("Memebers: " + members.toString());
        	
        	
        	Map<String, Object> model = new HashMap<String, Object>();
			model.put(PROJECT_CODE, projectcode.getProjectcode());
			model.put(RUN_TITLE, run.getSdsOffering().getName());
			model.put(USERS, usersMap);
			return new ModelAndView(getSuccessView(), model);
        }
        catch (ObjectNotFoundException e) {
        	//no run with this run code found
        	errors.reject("error.no-projectcode");
			return showForm(request, response, errors);
        }
        
    }

    
	public RunService getRunService() {
		return runService;
	}

	public void setRunService(RunService runService) {
		this.runService = runService;
	}

}
