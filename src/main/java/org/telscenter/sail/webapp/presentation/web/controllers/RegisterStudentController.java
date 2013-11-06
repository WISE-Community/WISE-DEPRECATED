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

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.presentation.web.controllers.SignupController;
import net.sf.sail.webapp.service.authentication.DuplicateUsernameException;

import org.springframework.beans.propertyeditors.CustomDateEditor;
import org.springframework.security.annotation.Secured;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.BindException;
import org.springframework.web.bind.ServletRequestDataBinder;
import org.springframework.web.servlet.ModelAndView;
import org.telscenter.sail.webapp.domain.AccountQuestion;
import org.telscenter.sail.webapp.domain.PeriodNotFoundException;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.authentication.Gender;
import org.telscenter.sail.webapp.domain.authentication.impl.StudentUserDetails;
import org.telscenter.sail.webapp.domain.impl.Projectcode;
import org.telscenter.sail.webapp.presentation.web.StudentAccountForm;
import org.telscenter.sail.webapp.service.offering.RunService;
import org.telscenter.sail.webapp.service.student.StudentService;

/**
 * Signup controller for TELS student user
 *
 * @author Hiroki Terashima
 * @version $Id$
 */
public class RegisterStudentController extends SignupController {
	
	private StudentService studentService;
	
	private RunService runService;
	
	protected static final String USERNAME_KEY = "username";
	
	public RegisterStudentController() {
		setValidateOnBinding(false);
	}
	
	/**
	 * On submission of the signup form, a user is created and saved to the data
	 * store.
	 * 
	 * @see org.springframework.web.servlet.mvc.SimpleFormController#onSubmit(javax.servlet.http.HttpServletRequest,
	 *      javax.servlet.http.HttpServletResponse, java.lang.Object,
	 *      org.springframework.validation.BindException)
	 */
	@Override
	@Transactional(rollbackFor = { 
			DuplicateUsernameException.class, ObjectNotFoundException.class, 
			PeriodNotFoundException.class })
	@Secured({"ROLE_STUDENT", "RUN_AS_ALLOWED"})
	protected ModelAndView onSubmit(HttpServletRequest request,
			HttpServletResponse response, Object command, BindException errors)
	throws Exception {

		StudentAccountForm accountForm = (StudentAccountForm) command;
		StudentUserDetails userDetails = (StudentUserDetails) accountForm.getUserDetails();

		if (accountForm.isNewAccount()) {
			try {
				User user = userService.createUser(userDetails);
				Projectcode projectcode = new Projectcode(accountForm.getProjectCode());
				studentService.addStudentToRun(user, projectcode);
			} catch (DuplicateUsernameException e) {
				errors.rejectValue("userDetails.username", "error.duplicate-username",
						new Object[] { userDetails.getUsername() }, "Duplicate Username.");
				return showForm(request, response, errors);
			} catch (ObjectNotFoundException e) {
	    		errors.rejectValue("projectCode", "error.illegal-projectcode");
	    		return showForm(request, response, errors);
	    	} catch (PeriodNotFoundException e) {
	    		errors.rejectValue("projectCode", "error.illegal-projectcode");
	    		return showForm(request, response, errors);
	    	}
		} else {
			//userService.updateUser(userDetails);    // TODO HT: add updateUser() to UserService
		}

		ModelAndView modelAndView = new ModelAndView(getSuccessView());

		modelAndView.addObject(USERNAME_KEY, userDetails.getUsername());
		return modelAndView;
	}
	
	@Override
	protected Object formBackingObject(HttpServletRequest request) throws Exception {
		return new StudentAccountForm();
	}
	
	@Override
	protected Map<String, Object> referenceData(HttpServletRequest request) throws Exception {
		Map<String, Object> model = new HashMap<String, Object>();
		model.put("genders", Gender.values());
		model.put("accountQuestions",AccountQuestion.values());
		return model;
	}
	
	@Override
	protected void onBindAndValidate(HttpServletRequest request, Object command, BindException errors) {

		StudentAccountForm accountForm = (StudentAccountForm) command;
		StudentUserDetails userDetails = (StudentUserDetails) accountForm.getUserDetails();
		if (accountForm.isNewAccount()) {
			userDetails.setSignupdate(Calendar.getInstance().getTime());
			Calendar birthday       = Calendar.getInstance();
			int birthmonth = Integer.parseInt(accountForm.getBirthmonth());
			int birthdate = Integer.parseInt(accountForm.getBirthdate());
			birthday.set(Calendar.MONTH, birthmonth-1);  // month is 0-based
			birthday.set(Calendar.DATE, birthdate);
			userDetails.setBirthday(birthday.getTime());
		}
		errors.setNestedPath("userDetails");
		getValidator().validate(userDetails, errors);
		errors.setNestedPath("");

		if (accountForm.isNewAccount()) {
			if (userDetails.getPassword() == null || userDetails.getPassword().length() < 1 ||
					!userDetails.getPassword().equals(accountForm.getRepeatedPassword())) {
				errors.reject("error.passwords-mismatch",
				"Passwords did not match or were not provided. Matching passwords are required.");
			}
			
			String projectCode = accountForm.getProjectCode();	
			if (projectCode == null || projectCode.length() < 1) {
				errors.reject("error.projectcode-empty",
				"Project Code must be specified. Get this from your teacher.");
				return;
			} else {
				Projectcode projectcode = new Projectcode(projectCode);
				if (!projectcode.isLegalProjectcode()) {
					errors.reject("error.projectcode-invalid",
					"Project Code is invalid. Get this from your teacher.");
					return;
				}
				String runcode = projectcode.getRuncode();
				String periodName = projectcode.getRunPeriod();
				Run run = null;
				try {
					run = runService.retrieveRunByRuncode(runcode);
				} catch (ObjectNotFoundException e) {
					errors.reject("error.projectcode-not-in-db",
					"Project Code is invalid. Get this from your teacher.");					
					return;
				}
				if (run == null) {
					errors.reject("error.projectcode-not-in-db",
					"Project Code is invalid. Get this from your teacher.");					
					return;
				} else {
					boolean periodExists = false;
					Set<Group> periods = run.getPeriods();
					for (Group period : periods) {
						if (periodName.equals(period.getName())) {
							periodExists = true;
						}
					}
					if (!periodExists) {
						errors.reject("error.projectcode-not-in-db",
						"Project Code is invalid. Get this from your teacher.");					
						return;
					}
				}
			}
		}
	}

	@Override
	protected void initBinder(HttpServletRequest request, ServletRequestDataBinder binder) throws Exception
	{
	  //super.initBinder(request, binder);
	  binder.registerCustomEditor(Date.class,
	    new CustomDateEditor(new SimpleDateFormat("MM/dd"), false)
	  );
	}

	/**
	 * @param studentService the studentService to set
	 */
	public void setStudentService(StudentService studentService) {
		this.studentService = studentService;
	}

	/**
	 * @param runService the runService to set
	 */
	public void setRunService(RunService runService) {
		this.runService = runService;
	}
}
