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
package org.wise.portal.presentation.web.controllers.forgotaccount.teacher;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;
import java.util.Random;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.RandomStringUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.context.MessageSource;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.SimpleFormController;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.mail.MailService;
import org.wise.portal.service.user.UserService;

/**
 * Controller for lost password teacher username and email lookup
 * 
 * @author Anthony Perritano
 * @version
 */
public class ForgotAccountTeacherIndexController extends SimpleFormController {

	private static final String EMAIL = "email";
	private static final String USERNAME = "username";
	protected UserService userService = null;
	protected MailService mailService = null;
	private Properties wiseProperties;
	private MessageSource messageSource;
	
	private String errorView = "/forgotaccount/teacher/error";


	/**
	 * helper for sending emails
	 * 
	 * @param mailService
	 */
	public void setMailService(MailService mailService) {
		this.mailService = mailService;
	}

	/**
	 * gets the information by username or email and sends an email to the user with the new password.
	 * 
	 * @see org.springframework.web.servlet.mvc.SimpleFormController#onSubmit(javax.servlet.http.HttpServletRequest,
	 *      javax.servlet.http.HttpServletResponse, java.lang.Object,
	 *      org.springframework.validation.BindException)
	 */
	@Override
	protected ModelAndView onSubmit(HttpServletRequest request,
			HttpServletResponse response, Object command, BindException errors)
			throws Exception {
		MutableUserDetails userDetails = (MutableUserDetails) command;

		String username = null;
		String emailAddress = null;
		boolean userNameProvided = false;
		boolean emailProvided = false;
		
		try {

			username = StringUtils.trimToNull(userDetails.getUsername());
			emailAddress = StringUtils
					.trimToNull(userDetails.getEmailAddress());
			User user = null;
			if (username != null) {
				userNameProvided = true;
				
				user = userService.retrieveUserByUsername(userDetails
						.getUsername());
				
				if( user == null ) {
					ModelAndView modelAndView = new ModelAndView(
					getErrorView());
					modelAndView.addObject(USERNAME, username);
					return modelAndView;
				}
				
			} else if (emailAddress != null) {
				emailProvided = true;
				
				List<User> users = userService
						.retrieveUserByEmailAddress(emailAddress);

				
				if (users.isEmpty()) {
					ModelAndView modelAndView = new ModelAndView(
							getErrorView());
					modelAndView.addObject(EMAIL, emailAddress);
					return modelAndView;
				} else {
					user = users.get(0);
					username = user.getUserDetails().getUsername();
				}
			}
			
			//get a 64 character alphanumeric string
			String randomAlphanumeric = RandomStringUtils.randomAlphanumeric(64);

			//get the current time
			Date now = new Date();
		    
			//set the values for the user
			user.getUserDetails().setResetPasswordKey(randomAlphanumeric);
			user.getUserDetails().setResetPasswordRequestTime(now);
			userService.updateUser(user);
			
			/*
			 * generate the link that we will send in the email that will allow
			 * the user to reset their password.
			 * e.g.
			 * http://wise4.berkeley.edu/wise/forgotaccount/resetpassword.html?k=1234567890abc
			 */
			String passwordResetLink = wiseProperties.getProperty("wiseBaseURL") + "/forgotaccount/resetpassword.html?k=" + randomAlphanumeric;
			
			String portalName = wiseProperties.getProperty("wise.name");
			
			String userEmail = user.getUserDetails().getEmailAddress();
			
			String[] recipients = new String[]{userEmail};
			
			// get user Locale
			Locale userLocale = request.getLocale();
			
			String defaultSubject = "";
			String subject = "";
			String defaultBody = "";
			String body = "";
			
			if (userNameProvided) {
				//the user entered their user name so we will send them a password reset link by email
				// subject looks like this: "Notification from WISE4@Berkeley: Password Changed"
				defaultSubject = messageSource.getMessage("forgotaccount.teacher.index.passwordChangeRequestEmailSubject", new Object[]{portalName}, Locale.US); 
				subject = messageSource.getMessage("forgotaccount.teacher.index.passwordChangeRequestEmailSubject", new Object[]{portalName}, defaultSubject, userLocale); 
				defaultBody = messageSource.getMessage("forgotaccount.teacher.index.passwordChangeRequestEmailBody", new Object[]{username,passwordResetLink,portalName}, Locale.US);
				body = messageSource.getMessage("forgotaccount.teacher.index.passwordChangeRequestEmailBody", new Object[] {username,passwordResetLink,portalName}, defaultBody, userLocale);				
			} else if (emailProvided) {
				//the user entered their email so we will send them their username by email
				defaultSubject = messageSource.getMessage("forgotaccount.teacher.index.usernameRequestEmailSubject", new Object[]{portalName}, Locale.US); 
				subject = messageSource.getMessage("forgotaccount.teacher.index.usernameRequestEmailSubject", new Object[]{portalName}, defaultSubject, userLocale); 
				defaultBody = messageSource.getMessage("forgotaccount.teacher.index.usernameRequestEmailBody", new Object[]{username,portalName}, Locale.US);
				body = messageSource.getMessage("forgotaccount.teacher.index.usernameRequestEmailBody", new Object[] {username,portalName}, defaultBody, userLocale);				
			}
			
			// send password in the email here
			mailService.postMail(recipients, subject, body, userEmail);
			
			Map<String, String> model = new HashMap<String, String>();
			model.put(EMAIL, userEmail);
			model.put(USERNAME, username);

			return new ModelAndView(getSuccessView(), model);

		} catch (Exception e) {
			e.printStackTrace();
			return showForm(request, response, errors);
		}
	}

	/**
	 * Sets the userDetailsService object.
	 * 
	 * @param userDetailsService
	 */
	public void setUserService(UserService userService) {
		this.userService = userService;
	}

	/**
	 * generate random password
	 * 
	 * @return
	 */
	public static String generateRandomPassword() {
		// return RandomStringUtils.random(8);
		Random rnd = new Random();
		return Integer.toString(rnd.nextInt(), 27);
	}

	/**
	 * Tests the password generation
	 * 
	 * @param args
	 */
	public static void main(String[] args) {
		System.out.println("New Password: " + generateRandomPassword());
	}

	/**
	 * @return the errorView
	 */
	public String getErrorView() {
		return errorView;
	}

	/**
	 * @param errorView the errorView to set
	 */
	public void setErrorView(String errorView) {
		this.errorView = errorView;
	}

	/**
	 * @param wiseProperties the wiseProperties to set
	 */
	public void setWiseProperties(Properties wiseProperties) {
		this.wiseProperties = wiseProperties;
	}

	/**
	 * @param messageSource the messageSource to set
	 */
	public void setMessageSource(MessageSource messageSource) {
		this.messageSource = messageSource;
	}

}
