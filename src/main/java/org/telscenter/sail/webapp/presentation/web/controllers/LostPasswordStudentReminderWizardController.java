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

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.service.UserService;

import org.apache.commons.lang.StringUtils;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.validation.BindException;
import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractWizardFormController;
import org.springframework.web.servlet.view.RedirectView;
import org.telscenter.sail.webapp.domain.authentication.impl.StudentUserDetails;
import org.telscenter.sail.webapp.domain.impl.ReminderParameters;

/**
 * Controller for the wizard to "Remind the student of their password"
 * 
 * The default getTargetPage() method is used to find out which page to navigate
 * to, so the controller looks for a request parameter starting with "_target"
 * and ending with a number (e.g. "_target1"). The jsp pages should provide
 * these parameters.
 * 
 * General method invocation flow (when user clicks on "prev" and "next"): 1)
 * onBind 2) onBindAndValidate 3) validatePage 4) referenceData Note that on
 * user's first visit to the first page of the wizard, only referenceData will
 * be invoked, and steps 1-4 are bypassed.
 * 
 * @author Anthony Perritano
 * @version $Id$
 */

public class LostPasswordStudentReminderWizardController extends
		AbstractWizardFormController {

	private static final String ACCOUNT_QUESTION = "accountQuestion";
	private static final String USERNAME = "username";
	protected UserService userService = null;
	private User user;

	/**
	 * Constructor - Specify the pages in the wizard - Specify the command name
	 */
	public LostPasswordStudentReminderWizardController() {
		setBindOnNewForm(true);
		setPages(new String[] { "lostpasswordstudentpasswordwizardreminder1",
				"lostpasswordstudentpasswordwizardreminder2",
				"lostpasswordstudentpasswordwizardreminder3",
				"lostpasswordstudentpasswordwizardreminderresult" });
		setSessionForm(true);
	}

	/**
	 * @see org.springframework.web.servlet.mvc.BaseCommandController#onBind(javax.servlet.http.HttpServletRequest,
	 *      java.lang.Object, org.springframework.validation.BindException)
	 */
	@Override
	protected void onBind(HttpServletRequest request, Object command,
			BindException errors) throws Exception {
		// TODO AP: implement me
		super.onBind(request, command, errors);
	}

	/**
	 * This method is called after the onBind and onBindAndValidate method. It
	 * acts in the same way as the validator
	 * 
	 * @see org.springframework.web.servlet.mvc.AbstractWizardFormController#validatePage(java.lang.Object,
	 *      org.springframework.validation.Errors, int)
	 */
	@Override
	protected void validatePage(Object command, Errors errors, int page) {
		
		
		ReminderParameters reminderParameters = (ReminderParameters) command;

		switch (page) {
		case 0:
			ValidationUtils.rejectIfEmptyOrWhitespace(errors,
					"username", "error.username-not-found");
			try {
				
				String username = reminderParameters.get(ReminderParameters.USERNAME);
				username = StringUtils.trimToNull(username);
				user = userService.retrieveUserByUsername(username);
			} catch (EmptyResultDataAccessException e) {
				//TODO: archana needs to update these
				errors.reject("username", "error.username-not-found");
			}
			
			break;
		case 1:
			//TODO: archana needs to update these
			ValidationUtils.rejectIfEmptyOrWhitespace(errors,
					"submittedAccountAnswer", "error.submitted-account-question-blank");
			
			String submittedAccountAnswer = reminderParameters
			.getSubmittedAccountAnswer();

			String accountAnswer = reminderParameters.getAccountAnswer();
		
			accountAnswer = StringUtils.lowerCase(accountAnswer);
		
			submittedAccountAnswer = StringUtils
					.lowerCase(submittedAccountAnswer);
			;
		
			if (!accountAnswer.equals(submittedAccountAnswer)) {
				//TODO: archana needs to update these
				errors.reject("error.submitted-account-question");
			}
			
			
			break;
		case 2:
			
			//TODO: archana needs to update these
			ValidationUtils.rejectIfEmptyOrWhitespace(errors,
					"verifyPassword", "error.verify-newpassword");
		
			//TODO: archana needs to update these
			ValidationUtils.rejectIfEmptyOrWhitespace(errors,
					"newPassword", "error.verify-newpassword");
			
			String newPassword = reminderParameters
			.getNewPassword();

			String verifyPassword = reminderParameters.getVerifyPassword();
		
			verifyPassword = StringUtils.lowerCase(verifyPassword);
		
			newPassword = StringUtils
					.lowerCase(newPassword);
		
			verifyPassword = StringUtils.lowerCase(verifyPassword);
			
			if (!verifyPassword.equals(newPassword)) {
				//TODO: archana needs to update these
				errors.reject("error.verify-newpassword");
			}
			break;
		default:
			break;
		}
	}


	/**
	 * This method is called right before the view is rendered to the user
	 * 
	 * @see org.springframework.web.servlet.mvc.AbstractWizardFormController#referenceData(javax.servlet.http.HttpServletRequest,
	 *      int)
	 */
	@Override
	protected Map<String, Object> referenceData(HttpServletRequest request,
			Object command, Errors errors, int page) {

		ReminderParameters reminderParameters = (ReminderParameters) command;

		Map<String, Object> model = new HashMap<String, Object>();
		switch (page) {
		case 0:
			break;
		case 1:
			
					StudentUserDetails userDetails = (StudentUserDetails) user
							.getUserDetails();

					model.put(USERNAME, userDetails.getUsername());
					model.put(ACCOUNT_QUESTION, userDetails
							.getAccountQuestion());

					reminderParameters.setAccountQuestion(userDetails
							.getAccountQuestion());
					reminderParameters.setAccountAnswer(userDetails
							.getAccountAnswer());
			break;
		default:
			break;
		}

		return model;
	}

	/**
	 * changes the password
	 * 
	 * This method is called if there is a submit that validates and contains
	 * the "_finish" request parameter.
	 * 
	 * @see org.springframework.web.servlet.mvc.AbstractWizardFormController#processFinish(javax.servlet.http.HttpServletRequest,
	 *      javax.servlet.http.HttpServletResponse, java.lang.Object,
	 *      org.springframework.validation.BindException)
	 */
	@Override
	protected ModelAndView processFinish(HttpServletRequest request,
			HttpServletResponse response, Object command, BindException errors)
			throws Exception {

		ReminderParameters params = (ReminderParameters) command;

		String newPassword = params.getNewPassword();

		if (newPassword != null) {
			userService.updateUserPassword(user, newPassword);
		}

		ModelAndView modelAndView = new ModelAndView(
				"lostpasswordstudentpasswordwizardreminderresult");
		modelAndView.addObject("username", params
				.get(ReminderParameters.USERNAME));
		return modelAndView;
	}

	/**
	 * This method is called if there is a submit that contains the "_cancel"
	 * request parameter.
	 * 
	 * @see org.springframework.web.servlet.mvc.AbstractWizardFormController#processCancel(javax.servlet.http.HttpServletRequest,
	 *      javax.servlet.http.HttpServletResponse, java.lang.Object,
	 *      org.springframework.validation.BindException)
	 */
	@Override
	protected ModelAndView processCancel(HttpServletRequest request,
			HttpServletResponse response, Object command, BindException errors) {
		return new ModelAndView(new RedirectView("lostpasswordmain.html"));
	}

	/**
	 * Sets the userDetailsService object.
	 * 
	 * @param userDetailsService
	 */
	public void setUserService(UserService userService) {
		this.userService = userService;
	}

}
