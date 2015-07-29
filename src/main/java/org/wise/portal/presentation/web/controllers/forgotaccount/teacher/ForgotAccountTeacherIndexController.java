/**
 * Copyright (c) 2007-2015 Regents of the University of California (Regents).
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
package org.wise.portal.presentation.web.controllers.forgotaccount.teacher;

import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.RandomStringUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.mail.MailService;
import org.wise.portal.service.user.UserService;

/**
 * Controller for lost password teacher username and email lookup
 * 
 * @author Anthony Perritano
 * @version
 */
@Controller
@RequestMapping("/forgotaccount/teacher/index.html")
public class ForgotAccountTeacherIndexController {

	@Autowired
	protected UserService userService;
	
	@Autowired
	protected MailService mailService;
	
	@Autowired
	private Properties wiseProperties;
	
	@Autowired
	private MessageSource messageSource;
	
	//the path to this form view
	private String formView = "forgotaccount/teacher/index";
	
	//the path to the success view
	private String successView = "forgotaccount/teacher/success";
	
	//the path to the error view
	private String errorView = "/forgotaccount/teacher/error";
	
	private static final String EMAIL = "email";
	
	private static final String USERNAME = "username";

    /**
     * Called before the page is loaded to initialize values
     * @param model the model object that contains values for the page to use when rendering the view
     * @return the path of the view to display
     */
    @RequestMapping(method=RequestMethod.GET)
    public String initializeForm(ModelMap model) {
    	//create the user details object for the page
    	TeacherUserDetails userDetails = new TeacherUserDetails();
    	model.addAttribute("userDetails", userDetails);
    	
    	return formView;
    }

	/**
	 * Called when the user submits the forgot teacher account page.
	 * Gets the information by username or email and sends an email to the user with the new password.
	 * @param userDetails the object that is populated by the page form
	 * @param model the object that contains values to be displayed on the page
	 * @param request the http request
	 * @return the path of the view to display
	 */
	@RequestMapping(method=RequestMethod.POST)
	protected String onSubmit(@ModelAttribute("userDetails") TeacherUserDetails userDetails, Model model, HttpServletRequest request)
		throws Exception {

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
					model.addAttribute(USERNAME, username);
					return errorView;
				}
				
			} else if (emailAddress != null) {
				emailProvided = true;
				
				List<User> users = userService
						.retrieveUserByEmailAddress(emailAddress);

				
				if (users.isEmpty()) {
					model.addAttribute(EMAIL, emailAddress);
					return errorView;
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

			//add the email and username to the model so we can display them if we can't find the user account
			model.addAttribute(EMAIL, userEmail);
			model.addAttribute(USERNAME, username);

			return successView;
		} catch (Exception e) {
			e.printStackTrace();
			return formView;
		}
	}
}
