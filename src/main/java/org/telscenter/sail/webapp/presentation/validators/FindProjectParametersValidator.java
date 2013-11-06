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
package org.telscenter.sail.webapp.presentation.validators;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.service.UserService;

import org.apache.commons.lang.StringUtils;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.impl.FindProjectParameters;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.service.offering.RunService;
import org.telscenter.sail.webapp.service.project.ProjectService;

/**
 * @author patrick lawler
 *
 */
public class FindProjectParametersValidator implements Validator{
	
	private ProjectService projectService;
	
	private UserService userService;

	private RunService runService;
	
	/**
	 * @see org.springframework.validation.Validator#supports(java.lang.Class)
	 */
	@SuppressWarnings("unchecked")
	public boolean supports(Class clazz) {
		return FindProjectParameters.class.isAssignableFrom(clazz);
	}
	
	/**
	 * @see org.springframework.validation.Validator#validate(java.lang.Object,
	 *      org.springframework.validation.Errors)
	 */
	public void validate(Object paramsIn, Errors errors) {
		FindProjectParameters param = (FindProjectParameters) paramsIn;
		
		/* there should be exactly on param field with data, reject
		 * if less or more than one has data */
		int numWithData = 0;
		
		/* check and validate the project Id field */
		if(param.getProjectId() != null && !param.getProjectId().equals("")){
			numWithData += 1;
			
			/* make sure project id is numeric */
			if(!StringUtils.isNumeric(param.getProjectId())){
				errors.reject("error.projectId-not-numeric", "Project ID must be numeric.");
				return;
			}
			
			/* make sure that a project with the id exists */
			try{
				Project project = projectService.getById(Long.parseLong(param.getProjectId()));
				if(project==null){
					errors.reject("error.projectId-not-found", "Project ID not found.");
					return;
				}
			} catch (Exception e){
				errors.reject("error.projectId-not-found", "Project ID not found.");
				return;
			}
		}
		
		/* check and validate the userName field */
		if(param.getUserName() != null && !param.getUserName().equals("")){
			numWithData += 1;
			
			/* make sure that a user with that name exists */
			if(userService.retrieveUserByUsername(param.getUserName()) ==  null){
				errors.rejectValue("userName", "error.teacher-not-found");
			}
		}
		
		/* check and validate the runId field */
		if(param.getRunId() != null && !param.getRunId().equals("")){
			numWithData += 1;
			
			/* make sure run id is numeric */
			if(!StringUtils.isNumeric(param.getRunId())){
				errors.reject("error.runId-not-numeric", "Run ID must be numeric.");
				return;
			}
			
			/* make sure that a run with the given id exists */
			try {
				Run run = runService.retrieveById(Long.parseLong(param.getRunId()));
				if(run == null){
					errors.reject("error.runId-not-found", "Run ID not found.");
					return;
				}
			} catch(ObjectNotFoundException e){
				errors.reject("error.runId-not-found", "Run ID not found.");
				return;
			}
		}
		
		/* ensure that exactly one field was specified */
		if(numWithData != 1){
			errors.reject("error.invalid-parameters", "Parameters passed to controller are invalid.");
		}
	}

	/**
	 * @param projectService the projectService to set
	 */
	public void setProjectService(ProjectService projectService) {
		this.projectService = projectService;
	}
	

	/**
	 * @param userService the userService to set
	 */
	public void setUserService(UserService userService) {
		this.userService = userService;
	}

	/**
	 * @param runService the runService to set
	 */
	public void setRunService(RunService runService) {
		this.runService = runService;
	}
}
