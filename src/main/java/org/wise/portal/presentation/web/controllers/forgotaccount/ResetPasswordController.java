/**
 * Copyright (c) 2008-2015 Regents of the University of California (Regents).
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
package org.wise.portal.presentation.web.controllers.forgotaccount;

import java.util.Date;
import java.util.Locale;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.impl.PasswordReminderParameters;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.mail.MailService;
import org.wise.portal.service.user.UserService;

@Controller
@RequestMapping("/forgotaccount/resetpassword.html")
public class ResetPasswordController {

	@Autowired
	protected UserService userService;
	
	@Autowired
	private Properties wiseProperties;
	
	@Autowired
	protected MailService mailService;
	
	@Autowired
	private MessageSource messageSource;
	
	//the path to this form view
	protected String formView = "/forgotaccount/resetpassword";
	
	/**
	 * Performs processing whenever the resetpassword.html form is shown.
	 * This handles displaying the form when the user is requested to
	 * enter a new password and also handles displaying the form when
	 * the user successfully changes their password.
	 * @param passwordReminderParameters the object that contains values from the form
	 * @param bindingResult the object used for validation in which errors will be stored
	 * @param modelMap the model object that contains values for the page to use when rendering the view
	 * @param request the http request
	 * @return the path of the view to display
	 */
    @RequestMapping(method=RequestMethod.GET)
    public String initializeForm(@ModelAttribute("passwordReminderParameters") PasswordReminderParameters passwordReminderParameters, BindingResult bindingResult, ModelMap modelMap, HttpServletRequest request) throws Exception {
		//get the reset password key
		String resetPasswordKey = request.getParameter("k");
		
		//boolean values that will be used in the jsp to determine what to display
		boolean displayForgotPasswordSelectAccountTypeLink = false;
		boolean displayLoginLink = false;
		boolean passwordResetSuccess = false;
		
		/*
		 * determine if we have successfully reset the password.
		 * this will only be true after they have submitted the
		 * password change form successfully and we call showForm()
		 * again.
		 */
		if(request.getAttribute("passwordResetSuccess") != null) {
			passwordResetSuccess = (Boolean) request.getAttribute("passwordResetSuccess");
		}
		
		if(passwordResetSuccess) {
			//we want to display the success page and display a link to login
			displayLoginLink = true;
		} else {
			//make sure we have a reset password key
			if(resetPasswordKey != null) {
				//get the user associated with this reset password key
				User user = userService.retrieveByResetPasswordKey(resetPasswordKey);
				
				if(user != null) {
					//get the time the reset password email was sent
					MutableUserDetails userDetails = user.getUserDetails();
					Date resetPasswordRequestTime = userDetails.getResetPasswordRequestTime();
					long resetPasswordRequestTimeMs = resetPasswordRequestTime.getTime();
					
					//get the current time
					Date now = new Date();
					long nowMs = now.getTime();
					
					/*
					 * check if the reset password request has expired because it was made 
					 * more than 30 minutes ago
					 * 1000 * 60 * 30 = 1800000
					 */
					if(nowMs - resetPasswordRequestTimeMs > 1800000) {
						//reset password link has expired 
						bindingResult.reject("error.password-reset-timeout");
						
						//variable to tell the jsp page to display the link to the forgot password page
						displayForgotPasswordSelectAccountTypeLink = true;
					}
				} else {
					/*
					 * we could not find a user with the given reset password 
					 * key so this password reset url is invalid
					 */
					bindingResult.reject("error.invalid-password-reset-url");
					
					//variable to tell the jsp page to display the link to the forgot password page
					displayForgotPasswordSelectAccountTypeLink = true;
				}
			} else {
				//there is no reset password key provided as a GET param so this password reset url is invalid
				bindingResult.reject("error.invalid-password-reset-url");
				
				//variable to tell the jsp page to display the link to the forgot password page
				displayForgotPasswordSelectAccountTypeLink = true;
			}
		}
		
		modelMap.addAttribute("displayForgotPasswordSelectAccountTypeLink", displayForgotPasswordSelectAccountTypeLink);
		modelMap.addAttribute("displayLoginLink", displayLoginLink);

		return formView;
	}
	
	/**
	 * Called when the user chooses a new password and submits the form.
	 * @param passwordReminderParameters the object that contains values from the form
	 * @param bindingResult the object used for validation in which errors will be stored
	 * @param modelMap the model object that contains values for the page to use when rendering the view
	 * @param request the http request
	 * @return the path of the view to display
	 */
	@RequestMapping(method=RequestMethod.POST)
	protected String onSubmit(@ModelAttribute("passwordReminderParameters") PasswordReminderParameters passwordReminderParameters, BindingResult bindingResult, Model model, HttpServletRequest request) throws Exception {
		String view = formView;
		
		//get the password values the user entered
		String newPassword = passwordReminderParameters.getNewPassword();
		String verifyPassword = passwordReminderParameters.getVerifyPassword();

		//make the passwords lower case
		verifyPassword = StringUtils.lowerCase(verifyPassword);
		newPassword = StringUtils.lowerCase(newPassword);
		
		if (!verifyPassword.equals(newPassword)) {
			//passwords are not the same
			bindingResult.reject("error.verify-newpassword");
			
			//do not display the "Forgot Username or Password?" link
			model.addAttribute("displayForgotPasswordSelectAccountTypeLink", false);
			
			//do not display the sign in button
			model.addAttribute("displayLoginLink", false);
		} else if(verifyPassword.equals("")) {
			//password is empty string
			bindingResult.reject("error.verify-password-empty");
			
			//do not display the "Forgot Username or Password?" link
			model.addAttribute("displayForgotPasswordSelectAccountTypeLink", false);
			
			//do not display the sign in button
			model.addAttribute("displayLoginLink", false);
		} else {
			//get the reset password key
			String resetPasswordKey = request.getParameter("k");
			
			//get the user associated with the reset password key
			User user = userService.retrieveByResetPasswordKey(resetPasswordKey);
			
			//update the user's password
			userService.updateUserPassword(user, verifyPassword);
			
			//set the reset password key and time so the key can no longer be used
			user.getUserDetails().setResetPasswordKey(null);
			user.getUserDetails().setResetPasswordRequestTime(null);
			userService.updateUser(user);

			//get the user name
			String username = user.getUserDetails().getUsername();
			
			//get the portal name
			String portalName = wiseProperties.getProperty("wise.name");
			
			//get the user's email
			String userEmail = user.getUserDetails().getEmailAddress();
			String[] recipients = new String[]{userEmail};
			
			// get user Locale
			Locale userLocale = request.getLocale();
			
			// subject looks like this: "Notification from WISE4@Berkeley: Password Changed"
			String defaultSubject = messageSource.getMessage("forgotaccount.teacher.index.passwordChangedEmailSubject", new Object[]{portalName}, Locale.US); 
			String subject = messageSource.getMessage("forgotaccount.teacher.index.passwordChangedEmailSubject", new Object[]{portalName}, defaultSubject, userLocale); 
			String defaultBody = messageSource.getMessage("forgotaccount.teacher.index.passwordChangedEmailBody", new Object[]{username,portalName}, Locale.US);
			String body = messageSource.getMessage("forgotaccount.teacher.index.passwordChangedEmailBody", new Object[] {username,portalName}, defaultBody, userLocale);				
			
			// send password in the email here
			mailService.postMail(recipients, subject, body, userEmail);
			
			//passwords are the same so we will change their password
			bindingResult.reject("changePassword_success");

			//tell the jsp to display the success message
			request.setAttribute("passwordResetSuccess", true);
			
			//do not display the "Forgot Username or Password?" link
			model.addAttribute("displayForgotPasswordSelectAccountTypeLink", false);
			
			//display the sign in button
			model.addAttribute("displayLoginLink", true);
		}
		
		return view;
	}
}
