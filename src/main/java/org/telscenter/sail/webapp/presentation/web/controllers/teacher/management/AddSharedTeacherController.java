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

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.service.UserService;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.validation.BindException;
import org.springframework.validation.Errors;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractWizardFormController;
import org.telscenter.sail.webapp.domain.Module;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.authentication.MutableUserDetails;
import org.telscenter.sail.webapp.domain.impl.AddSharedTeacherParameters;
import org.telscenter.sail.webapp.domain.impl.DefaultPeriodNames;
import org.telscenter.sail.webapp.domain.impl.RunParameters;
import org.telscenter.sail.webapp.domain.impl.RunPermission;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.service.offering.RunService;
import org.telscenter.sail.webapp.service.workgroup.WISEWorkgroupService;

/**
 * @author Sally Ahn
 * @version $Id: $
 */
public class AddSharedTeacherController extends AbstractWizardFormController{

	private static final String COMPLETE_VIEW_NAME = "teacher/run/myprojectruns";
	
	private static final String CANCEL_VIEW_NAME = "../../teacher/index.html";

	private RunService runService = null;
	
	private UserService userService = null;
	
	private static final String RUN_PARAM = "run";

	private static final String USER_PARAM = "user";
	
	/**
	 * Constructor
	 * 	- Specify the pages in the wizard
	 *  - Specify the command name
	 */
	public AddSharedTeacherController() {
		setBindOnNewForm(true);
		setPages(new String[]{"teacher/run/manage/addsharedteacher1", "teacher/run/manage/addsharedteacher2"});
		setSessionForm(true);
	}
	
	/**
	 * This method is called right before the view is rendered to the user
	 * 
	 * @see org.springframework.web.servlet.mvc.AbstractWizardFormController#referenceData(javax.servlet.http.HttpServletRequest, int)
	 */
	@Override
	protected Map<String, Object> referenceData(HttpServletRequest request, 
			Object command, Errors errors, int page) {
		String runIdStr = request.getParameter("runId");
		Long runId = Long.valueOf(runIdStr);
		String newSharedOwnerName = request.getParameter("username");
		AddSharedTeacherParameters params = (AddSharedTeacherParameters) command;
		Run run = null;
		User user = null;
		Map<String, Object> model = new HashMap<String, Object>();
		switch(page) {
		case 0:
			try {
				user = this.userService.retrieveUserByUsername(newSharedOwnerName);
				run = (Run) this.runService.retrieveById(runId);
			} catch (ObjectNotFoundException e) {
				e.printStackTrace();
			}
			params.setRun(run);
			model.put(RUN_PARAM, run);
			model.put(USER_PARAM, user);
	   		
			break;
		case 1:
			// for page 2 of the wizard, display all possible roles for that user
			User sharedOwner = userService.retrieveUserByUsername(params.getSharedOwnerUsername());
			Collection<? extends GrantedAuthority> allRoles = sharedOwner.getUserDetails().getAuthorities();
			for (GrantedAuthority role : allRoles) {
				for (RunPermission runpermission: RunPermission.values()) {
					if (role.getAuthority().equals(runpermission.toString())) {
						params.setPermission(runpermission.toString());
					}
				}
			}
			model.put("runpermissions", RunPermission.values());
			model.put("sharedOwner", sharedOwner);

			break;
		}

		return model;
	}
	
	/**
	 * Adds a shared teacher to a run.
	 * 
	 * This method is called if there is a submit that validates and contains the "_finish"
	 * request parameter.
	 * 
	 * @see org.springframework.web.servlet.mvc.AbstractWizardFormController#processFinish(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse, java.lang.Object, org.springframework.validation.BindException)
	 */
	@Override
	protected ModelAndView processFinish(HttpServletRequest request,
			HttpServletResponse response, Object command, BindException errors)
			throws Exception {
		AddSharedTeacherParameters params = (AddSharedTeacherParameters) command;
		
		runService.addSharedTeacherToRun(params);

//		Run run = params.getRun();
//		Long runId = run.getId();
//		Long sharedOwnerId = userService.retrieveUserByUsername(params.getSharedOwnerUsername()).getId();
//		this.runService.addSharedTeacherToRun(runId, sharedOwnerId);
//		this.runService.addRolesToSharedTeacher(runId, sharedOwnerId, params.getNewRoles());
		ModelAndView modelAndView = new ModelAndView(COMPLETE_VIEW_NAME);
   		
    	return modelAndView;
	}

	/**
	 * @return the runService
	 */
	public RunService getRunService() {
		return runService;
	}

	/**
	 * @param runService the runService to set
	 */
	public void setRunService(RunService runService) {
		this.runService = runService;
	}

	/**
	 * @return the userService
	 */
	public UserService getUserService() {
		return userService;
	}

	/**
	 * @param userService the userService to set
	 */
	public void setUserService(UserService userService) {
		this.userService = userService;
	}


}
