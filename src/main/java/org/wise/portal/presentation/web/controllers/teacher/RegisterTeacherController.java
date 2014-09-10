/**
 * Copyright (c) 2007-2014 Regents of the University of California (Regents). 
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
import java.util.Locale;
import java.util.Map;
import java.util.Properties;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.ArrayUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.i18n.SessionLocaleResolver;
import org.wise.portal.domain.authentication.Curriculumsubjects;
import org.wise.portal.domain.authentication.Schoollevel;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.validators.TeacherAccountFormValidator;
import org.wise.portal.presentation.web.TeacherAccountForm;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.authentication.DuplicateUsernameException;
import org.wise.portal.service.mail.IMailFacade;
import org.wise.portal.service.user.UserService;

/**
 * Signup controller for TELS teacher user
 *
 * @author Hiroki Terashima
 * @version $Id: RegisterTeacherController.java 1033 2007-09-08 00:05:01Z archana $
 */
@Controller
@RequestMapping("/teacher/registerteacher.html")
public class RegisterTeacherController {

	@Autowired
	protected IMailFacade mailService;

	@Autowired
	protected Properties wiseProperties;

	@Autowired
	protected MessageSource messageSource;

	@Autowired
	protected UserService userService;
	
	@Autowired
	protected TeacherAccountFormValidator teacherAccountFormValidator;
	
	//the path to this form view
	private String formView = "teacher/registerteacher";
	
	//the path to the success view
	private String successView = "teacher/registerTeacherConfirm";
	
	protected static final String USERNAME_KEY = "username";
	
	protected static final String DISPLAYNAME_KEY = "displayname";

    /**
     * Called before the page is loaded to initialize values.
	 * Adds the TeacherAccountForm object to the model. 
	 * This object will be filled out and submitted for creating
	 * the new teacher
     * @param modelMap the model object that contains values for the page to use when rendering the view
     * @return the path of the view to display
     */
    @RequestMapping(method=RequestMethod.GET)
    public String initializeForm(ModelMap modelMap) throws Exception {
    	//create the teacher account form object
    	TeacherAccountForm teacherAccountForm = new TeacherAccountForm();
    	
    	//put the teacher account form object into the model
    	modelMap.put("teacherAccountForm", teacherAccountForm);

    	//populate the model with other objects the form requires
    	populateModel(modelMap);
    	
    	//get the form view
    	String view = getFormView();
    	
    	return view;
    }
    
    /**
     * Populate the model with objects the form requires
     * @param modelMap the model to populate
     * @return the model
     */
    protected Map<String, Object> populateModel(Map<String, Object> modelMap) {
    	//add objects into the model that will be used by the form
    	modelMap.put("schoollevels", Schoollevel.values());
    	modelMap.put("curriculumsubjects",Curriculumsubjects.values());
    	modelMap.put("languages", new String[]{"en_US", "zh_TW", "zh_CN", "nl", "he", "ja", "ko", "es"});
    	
    	return modelMap;
    }
    
    /**
     * Populate the model with objects the form requires
     * @param modelMap the model to populate
     * @return the model
     */
    protected Model populateModel(Model model) {
    	//get the model as a map so we can add objects to it
    	Map<String, Object> asMap = model.asMap();
    	try {
    		//populate the model with objects the form requires 
    		populateModel(asMap);
    	} catch (Exception e) {
    		e.printStackTrace();
    	}

    	return model;
    }
	
    /**
	 * On submission of the signup form, a user is created and saved to the data
	 * store.
     * @param accountForm the model object that contains values for the page to use when rendering the view
     * @param bindingResult the object used for validation in which errors will be stored
     * @param request the http request object
     * @param model the object that contains values to be displayed on the page
     * @return the path of the view to display
     */
	@RequestMapping(method=RequestMethod.POST)
    protected String onSubmit(
    		@ModelAttribute("teacherAccountForm") TeacherAccountForm accountForm, 
    		BindingResult bindingResult, 
    		HttpServletRequest request, 
    		Model model) {
		String view = getFormView();
		
		String domain = ControllerUtil.getBaseUrlString(request);
		String domainWithPort = domain + ":" + request.getLocalPort();
		String referrer = request.getHeader("referer");
		
		//get the context path e.g. /wise
		String contextPath = request.getContextPath();
				
		String registerUrl = contextPath + "/teacher/registerteacher.html";
		String updateAccountInfoUrl = contextPath + "/teacher/management/updatemyaccountinfo.html";
		
		if(referrer.contains(domain + registerUrl) || 
				referrer.contains(domainWithPort + registerUrl) ||
				referrer.contains(domain + updateAccountInfoUrl) ||
				referrer.contains(domainWithPort + updateAccountInfoUrl)){
			TeacherUserDetails userDetails = (TeacherUserDetails) accountForm.getUserDetails();
			
			//set the sign up date
			userDetails.setSignupdate(Calendar.getInstance().getTime());
	
			//validate the form
			teacherAccountFormValidator.validate(accountForm, bindingResult);
			
			if(bindingResult.hasErrors()) {
				//there were errors
				populateModel(model);
				view = getFormView();
			} else {
				//there were no errors
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
						bindingResult.rejectValue("username", "error.duplicate-username", new Object[] { userDetails.getUsername() }, "Duplicate Username.");
						populateModel(model);
						view = getFormView();
					}
				} else {
					// we're updating an existing teacher's account
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
					teacherUserDetails.setLanguage(userDetails.getLanguage());
			        String userLanguage = userDetails.getLanguage();
			        Locale locale = null;
			        if (userLanguage.contains("_")) {
		        		String language = userLanguage.substring(0, userLanguage.indexOf("_"));
		        		String country = userLanguage.substring(userLanguage.indexOf("_")+1);
		            	locale = new Locale(language, country); 	
		        	} else {
		        		locale = new Locale(userLanguage);
		        	}
			        request.getSession().setAttribute(SessionLocaleResolver.LOCALE_SESSION_ATTRIBUTE_NAME, locale);

		
					userService.updateUser(user);
					// update user in session
					request.getSession().setAttribute(User.CURRENT_USER_SESSION_KEY, user);
				}
				
				model.addAttribute(USERNAME_KEY, userDetails.getUsername());
				model.addAttribute(DISPLAYNAME_KEY, userDetails.getDisplayname());
				view = getSuccessView();
			}
		} else {
			//the request is not coming from a valid domain address so we will not allow it
			bindingResult.reject("Forbidden");
			populateModel(model);
			view = getFormView();
		}
		
		return view;
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

			if (wiseProperties.containsKey("discourse_url")) {
				String discourseURL = wiseProperties.getProperty("discourse_url");
				if (discourseURL != null && !discourseURL.isEmpty()) {
					// if this WISE instance uses discourse for teacher community, append link to it in the P.S. section of the email
					String defaultPS = messageSource.getMessage("teacherEmailPSCommunity", new Object[] {discourseURL}, Locale.US);
					String pS = messageSource.getMessage("teacherEmailPSCommunity", new Object[] {discourseURL}, defaultPS, this.locale);
					message += "\n\n"+pS;
				}
			}
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
     * Get the form view
     * @return the form view
     */
    protected String getFormView() {
    	return formView;
    }
    
    /**
     * Get the success view
     * @return the success view
     */
    protected String getSuccessView() {
    	return successView;
    }
}
