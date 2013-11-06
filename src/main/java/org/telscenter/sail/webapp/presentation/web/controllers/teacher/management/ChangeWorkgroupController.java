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

import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.SimpleFormController;
import org.telscenter.sail.webapp.domain.impl.ChangeWorkgroupParameters;
import org.telscenter.sail.webapp.service.offering.RunService;
import net.sf.sail.webapp.service.*;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.service.workgroup.WorkgroupService;

/**
 * @author Sally Ahn
 * @version $Id: $
 */
public class ChangeWorkgroupController extends SimpleFormController {

	private WorkgroupService workgroupService;
	
	private RunService runService;
	
	private UserService userService;
	
	private static final String STUDENT_PARAM_NAME = "student";
	
	private static final String WORKGROUPFROM_PARAM_NAME = "workgroupFrom";
	
	private static final String WORKGROUPS_TO = "workgroupsTo";

	private static final String RUN_ID = "offeringId";

	private static final String PERIOD_ID = "periodId";
	
	@Override
	protected Object formBackingObject(HttpServletRequest request) throws Exception {
		ChangeWorkgroupParameters params = new ChangeWorkgroupParameters();
		params.setStudent(userService.retrieveUserByUsername(request.getParameter(STUDENT_PARAM_NAME)));
		params.setOfferingId(Long.parseLong(request.getParameter(RUN_ID)));
		params.setPeriodId(Long.parseLong(request.getParameter(PERIOD_ID)));
		String workgroupFromId = request.getParameter(WORKGROUPFROM_PARAM_NAME);
		if (workgroupFromId == null) {
			params.setWorkgroupFrom(null);
		} else {
		  params.setWorkgroupFrom(workgroupService.retrieveById(Long.parseLong(workgroupFromId)));
		}
		return params;
	}
	
	@Override
	protected ModelAndView showForm(HttpServletRequest request,
			HttpServletResponse response,
			BindException errors) throws Exception {
		
		// get the period of workgroupFrom
		// list all the workgroups in that period
		Set<Workgroup> workgroups = runService.getWorkgroups(Long.parseLong(request.getParameter(RUN_ID)), Long.parseLong(request.getParameter(PERIOD_ID)));

		ModelAndView modelAndView = super.showForm(request, response, errors);
		
		modelAndView.addObject(WORKGROUPS_TO, workgroups);
		return modelAndView;
	}

	
	/**
	 * @see org.springframework.web.servlet.mvc.SimpleFormController#onSubmit(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse, java.lang.Object, org.springframework.validation.BindException)
	 */
	@Override
    protected ModelAndView onSubmit(HttpServletRequest request, 
    		HttpServletResponse response, Object command, BindException errors){
    	ChangeWorkgroupParameters params = (ChangeWorkgroupParameters) command;

    	Long workgroupToId = params.getWorkgroupToId();
    	
    	try {
			params.setWorkgroupTo(workgroupService.retrieveById(workgroupToId));
		} catch (ObjectNotFoundException e1) {
			params.setWorkgroupTo(null);
		}
    	try{
    		workgroupService.updateWorkgroupMembership(params);
    	} catch (Exception e){
    		e.printStackTrace();
    	}
    	
    	ModelAndView modelAndView = new ModelAndView(getSuccessView());

    	return modelAndView;
    }

	/**
	 * @param workgroupService the workgroupService to set
	 */
	public void setWorkgroupService(WorkgroupService workgroupService) {
		this.workgroupService = workgroupService;
	}
	
	public void setRunService(RunService runService){
		this.runService = runService;
	}

	/**
	 * @param userService the userService to set
	 */
	public void setUserService(UserService userService) {
		this.userService = userService;
	}
	
}
