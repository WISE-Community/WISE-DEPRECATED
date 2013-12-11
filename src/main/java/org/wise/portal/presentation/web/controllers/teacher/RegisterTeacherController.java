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
package org.wise.portal.presentation.web.controllers.teacher;

import java.util.Calendar;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.ArrayUtils;
import org.springframework.context.MessageSource;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.SimpleFormController;
import org.wise.portal.domain.authentication.Curriculumsubjects;
import org.wise.portal.domain.authentication.Schoollevel;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.TeacherAccountForm;
import org.wise.portal.service.authentication.DuplicateUsernameException;
import org.wise.portal.service.mail.IMailFacade;
import org.wise.portal.service.user.UserService;

/**
 * Signup controller for TELS teacher user
 *
 * @author Hiroki Terashima
 * @version $Id: RegisterTeacherController.java 1033 2007-09-08 00:05:01Z archana $
 */
public class RegisterTeacherController extends SimpleFormController {

	protected static final String USERNAME_KEY = "username";
	
	protected static final String DISPLAYNAME_KEY = "displayname";

	private IMailFacade mailService = null;

	private Properties wiseProperties;

	private MessageSource messageSource;

	private UserService userService;

	public RegisterTeacherController() {
		setValidateOnBinding(false);
	}
	
	/**
	 * @see org.springframework.web.servlet.mvc.AbstractFormController#formBackingObject(javax.servlet.http.HttpServletRequest)
	 */
	@Override
	protected Object formBackingObject(HttpServletRequest request) throws Exception {
		return new TeacherAccountForm();
	}
	
	/**
	 * @see org.springframework.web.servlet.mvc.SimpleFormController#referenceData(javax.servlet.http.HttpServletRequest)
	 */
	@Override
	protected Map<String, Object> referenceData(HttpServletRequest request) throws Exception {
		Map<String, Object> model = new HashMap<String, Object>();
		model.put("schoollevels", Schoollevel.values());
		model.put("curriculumsubjects",Curriculumsubjects.values());
		return model;
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
	protected synchronized ModelAndView onSubmit(HttpServletRequest request,
			HttpServletResponse response, Object command, BindException errors)
	throws Exception {
		String domain =  "http://" + request.getServerName();
		String domainWithPort = domain + ":" + request.getLocalPort();
		String referrer = request.getHeader("referer");
		String registerUrl = "/wise/teacher/registerteacher.html";
		String updateAccountInfoUrl = "/wise/teacher/management/updatemyaccountinfo.html";
		
		if(referrer.contains(domain + registerUrl) || 
				referrer.contains(domainWithPort + registerUrl) ||
				referrer.contains(domain + updateAccountInfoUrl) ||
				referrer.contains(domainWithPort + updateAccountInfoUrl)){
			TeacherAccountForm accountForm = (TeacherAccountForm) command;
			TeacherUserDetails userDetails = (TeacherUserDetails) accountForm.getUserDetails();
	
			if (accountForm.isNewAccount()) {
				try {
					userDetails.setDisplayname(userDetails.getFirstname() + " " + userDetails.getLastname());
					userDetails.setEmailValid(true);
					User createdUser = this.userService.createUser(userDetails);
					// send email to new teacher if email server is configured properly
					
					NewAccountEmailService newAccountEmailService = new NewAccountEmailService(createdUser,request.getLocale());
					Thread thread = new Thread(newAccountEmailService);
					thread.start();
				}
				catch (DuplicateUsernameException e) {
					errors.rejectValue("username", "error.duplicate-username",
							new Object[] { userDetails.getUsername() }, "Duplicate Username.");
					return showForm(request, response, errors);
				}
			} else {
				User user = userService.retrieveUserByUsername(userDetails.getUsername());
				
				TeacherUserDetails teacherUserDetails = (TeacherUserDetails) user.getUserDetails();
				teacherUserDetails.setCity(userDetails.getCity());
				teacherUserDetails.setCountry(userDetails.getCountry());
				teacherUserDetails.setCurriculumsubjects(userDetails.getCurriculumsubjects());
				teacherUserDetails.setEmailAddress(userDetails.getEmailAddress());
				teacherUserDetails.setSchoollevel(userDetails.getSchoollevel());
				teacherUserDetails.setSchoolname(userDetails.getSchoolname());
				teacherUserDetails.setState(userDetails.getState());
				teacherUserDetails.setDisplayname(userDetails.getDisplayname());
				teacherUserDetails.setEmailValid(true);
	
				userService.updateUser(user);
				// update user in session
				request.getSession().setAttribute(
						User.CURRENT_USER_SESSION_KEY, user);
			}
			
			ModelAndView modelAndView = new ModelAndView(getSuccessView());
	
			modelAndView.addObject(USERNAME_KEY, userDetails.getUsername());
			modelAndView.addObject(DISPLAYNAME_KEY, userDetails.getDisplayname());
			return modelAndView;
		} else {
			response.sendError(HttpServletResponse.SC_FORBIDDEN);
			return null;
		}
	}
	
	/**
	 * @see org.springframework.web.servlet.mvc.BaseCommandController#onBindAndValidate(javax.servlet.http.HttpServletRequest, java.lang.Object, org.springframework.validation.BindException)
	 */
	@Override
	protected void onBindAndValidate(HttpServletRequest request, Object command, BindException errors)
	throws Exception {

		TeacherAccountForm accountForm = (TeacherAccountForm) command;
		
		TeacherUserDetails userDetails = (TeacherUserDetails) accountForm.getUserDetails();
		if (accountForm.isNewAccount()) {
			userDetails.setSignupdate(Calendar.getInstance().getTime());
		}

		getValidator().validate(accountForm, errors);

	}
	
	// new thread that sends email to new teacher
	class NewAccountEmailService implements Runnable {

		private User newUser;
		private Locale locale;

		public NewAccountEmailService(User newUser, Locale locale) {
			this.newUser = newUser;
			this.locale = locale;
		}

		public void run() {
			this.sendEmail();
		}

		/**
		 * Sends a welcome email to the new user with WISE4 resources
		 * On exception sending the email, ignore.
		 */
		private void sendEmail() {

			String sendEmailEnabledStr = wiseProperties.getProperty("send_email_enabled");
			Boolean sendEmailEnabled = Boolean.valueOf(sendEmailEnabledStr);
			if (!sendEmailEnabled) {
				return;
			}
			TeacherUserDetails newUserDetails = 
				(TeacherUserDetails) newUser.getUserDetails();
			String userUsername = newUserDetails.getUsername();
			String userEmailAddress[] = {newUserDetails.getEmailAddress()};

			String[] recipients = (String[]) ArrayUtils.addAll(userEmailAddress, wiseProperties.getProperty("uber_admin").split(","));

			String defaultSubject = messageSource.getMessage("presentation.web.controllers.teacher.registerTeacherController.welcomeTeacherEmailSubject", null, Locale.US);
			String subject = messageSource.getMessage("presentation.web.controllers.teacher.registerTeacherController.welcomeTeacherEmailSubject", null, defaultSubject, this.locale);
			String wiseBaseURL = wiseProperties.getProperty("wiseBaseURL");
			String gettingStartedUrl = wiseBaseURL + "/pages/gettingstarted.html";
			String defaultBody = messageSource.getMessage("presentation.web.controllers.teacher.registerTeacherController.welcomeTeacherEmailBody", new Object[] {userUsername,gettingStartedUrl}, Locale.US);
			String message = messageSource.getMessage("presentation.web.controllers.teacher.registerTeacherController.welcomeTeacherEmailBody", new Object[] {userUsername,gettingStartedUrl}, defaultBody, this.locale);
			String fromEmail = wiseProperties.getProperty("portalemailaddress");

			try {
				//sends the email to the recipients
				mailService.postMail(recipients, subject, message, fromEmail);
			} catch (MessagingException e) {
				// do nothing, no notification to uber_admin required.
				e.printStackTrace();
			}
		}
	}
	
	/**
	 * @param mailService the mailService to set
	 */
	public void setMailService(IMailFacade mailService) {
		this.mailService = mailService;
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

	public void setUserService(UserService userService) {
		this.userService = userService;
	}

}
