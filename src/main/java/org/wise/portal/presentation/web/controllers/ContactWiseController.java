package org.wise.portal.presentation.web.controllers;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.Vector;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.tanesha.recaptcha.ReCaptchaImpl;
import net.tanesha.recaptcha.ReCaptchaResponse;

import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.SimpleFormController;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.general.contactwise.IssueType;
import org.wise.portal.domain.general.contactwise.OperatingSystem;
import org.wise.portal.domain.general.contactwise.WebBrowser;
import org.wise.portal.domain.general.contactwise.impl.ContactWISEGeneral;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.filters.TelsAuthenticationProcessingFilter;
import org.wise.portal.service.mail.IMailFacade;
import org.wise.portal.service.offering.RunService;

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

public class ContactWiseController extends SimpleFormController {

	protected IMailFacade mailService = null;
	
	protected Properties i18nProperties = null;
	
	private RunService runService;
	
	private Properties wiseProperties;
	
	/* change this to true if you are testing and do not want to send mail to
	   the actual groups */
	private static final Boolean DEBUG = false;
	
	//set this to your email
	private static final String DEBUG_EMAIL = "youremail@gmail.com";
	
	public ContactWiseController() {
		setSessionForm(true);
	}
	
	@Override
	public ModelAndView onSubmit(HttpServletRequest request,
			HttpServletResponse response, Object command, BindException errors)
	throws Exception {
		ContactWISEGeneral contactWISEGeneral = (ContactWISEGeneral) command;
		
		//retrieves the contents of the email to be sent
		String[] recipients = contactWISEGeneral.getMailRecipients();
		String subject = contactWISEGeneral.getMailSubject();
		String fromEmail = contactWISEGeneral.getEmail();
		String message = contactWISEGeneral.getMailMessage();
		String[] cc = contactWISEGeneral.getMailCcs();

		//fromEmail will be null if the signed in user is a student
		if(fromEmail == null) {
			/*
			 * set the fromEmail to a non null and non empty string otherwise
			 * an exception will be thrown
			 */
			fromEmail = "null";
		}
		
		//for testing out the email functionality without spamming the groups
		if(DEBUG) {
			cc = new String[1];
			cc[0] = fromEmail;
			recipients[0] = DEBUG_EMAIL;
		}
		
		//sends the email to the recipients
		mailService.postMail(recipients, subject, message, fromEmail, cc);
		//System.out.println(message);
		
		ModelAndView modelAndView = new ModelAndView(getSuccessView());

		return modelAndView;
	}
	
	@Override
	protected Object formBackingObject(HttpServletRequest request) 
			throws Exception {
		ContactWISEGeneral contactWISE = new ContactWISEGeneral();
		
		//tries to retrieve the user from the session
		User user = ControllerUtil.getSignedInUser();

		/* if the user is logged in to the session, auto populate the name and 
		   email address in the form, if not, the fields will just be blank */
		if (user != null) {
			//contactWISE.setUser(user);
			contactWISE.setIsStudent(user);
			
			MutableUserDetails telsUserDetails = 
				(MutableUserDetails) user.getUserDetails();

			contactWISE.setName(telsUserDetails.getFirstname() + " " + 
					telsUserDetails.getLastname());
			
			//if user is a teacher, retrieve their email
			/* NOTE: this check may be removed later if we never allow students
			   to submit feedback */
			if(telsUserDetails instanceof TeacherUserDetails) {
				contactWISE.setEmail(telsUserDetails.getEmailAddress());
			}
		}
		return contactWISE;
	}
	
	@Override
	protected Map<String, Object> referenceData(HttpServletRequest request) 
			throws Exception {
		Map<String, Object> model = new HashMap<String, Object>();
		
		//get the signed in user or null if not signed in
		User user = ControllerUtil.getSignedInUser();

		if(user != null) {
			//get the user details
			MutableUserDetails userDetails = user.getUserDetails();
			
			/*
			 * we only need to retrieve the list of associated teachers if the
			 * user is a student
			 */
			if(userDetails instanceof StudentUserDetails) {
				//user is a student
				
				//the vector to accumulate the teachers associated with the student
				Vector<User> teachers = new Vector<User>();
				
				if(user != null) {
					//get all the runs that this student is in
					List<Run> runList = runService.getRunList(user);
					Iterator<Run> runListIterator = runList.iterator();
					
					//loop through all the runs
					while(runListIterator.hasNext()) {
						//get a run
						Run tempRun = runListIterator.next();
						
						//get the owners of the run
						Set<User> owners = tempRun.getOwners();
						Iterator<User> ownersIterator = owners.iterator();
						
						//loop through all the owners of the run
						while(ownersIterator.hasNext()) {
							//get an owner
							User owner = ownersIterator.next();
							
							//add the teacher to the list if they are not already in it
							if(!teachers.contains(owner)) {
								//the teacher is not in the list so we will add them
								teachers.add(owner);
							}
						}
					}
					
					//add the list of teachers to the model
					model.put("teachers", teachers);
				}
			}			
		}
			
		//places the array of constants into the model so the view can display
		model.put("issuetypes", IssueType.values());
		model.put("operatingsystems", OperatingSystem.values());
		model.put("webbrowsers", WebBrowser.values());
		
		//get the public and private keys from the wise.properties
		String reCaptchaPublicKey = getWiseProperties().getProperty("recaptcha_public_key");
		String reCaptchaPrivateKey = getWiseProperties().getProperty("recaptcha_private_key");
		
		if(reCaptchaPublicKey != null && reCaptchaPrivateKey != null) {
			//put the reCaptcha keys into the model so the jsp page 
			model.put("reCaptchaPublicKey", reCaptchaPublicKey);
			model.put("reCaptchaPrivateKey", reCaptchaPrivateKey);			
		}
		
		//add the user to the model so that the jsp can check if the user is logged in or not
		model.put("user", user);
		
		return model;
	}
	
	/**
	 * If the user is not logged in, we will check that they answered the reCaptcha correctly.
	 * This is called after ContactWISEValidator.validate()
	 * @see org.springframework.web.servlet.mvc.BaseCommandController#onBindAndValidate(javax.servlet.http.HttpServletRequest, java.lang.Object, org.springframework.validation.BindException)
	 */
	@Override
	protected void onBindAndValidate(HttpServletRequest request, Object command, BindException errors) {
		//get the signed in user or null if not signed in
		User user = ControllerUtil.getSignedInUser();
		
		if(user == null) {
			//get the public and private keys from the wise.properties
			String reCaptchaPublicKey = wiseProperties.getProperty("recaptcha_public_key");
			String reCaptchaPrivateKey = wiseProperties.getProperty("recaptcha_private_key");

			//check if the public key is valid in case the admin entered it wrong
			boolean reCaptchaKeyValid = TelsAuthenticationProcessingFilter.isReCaptchaKeyValid(reCaptchaPublicKey, reCaptchaPrivateKey);

			if (reCaptchaPrivateKey != null && reCaptchaPublicKey != null && reCaptchaKeyValid) {
				//get the reCaptcha challenge
				String reCaptchaChallengeField = request.getParameter("recaptcha_challenge_field");
				
				//get what the user typed into the reCaptcha text input
				String reCaptchaResponseField = request.getParameter("recaptcha_response_field");
				
				//get the client's IP address
				String remoteAddr = request.getRemoteAddr();

				if(reCaptchaChallengeField != null && reCaptchaResponseField != null && remoteAddr != null) {
					//the user filled in the captcha

					ReCaptchaImpl reCaptcha = new ReCaptchaImpl();
					reCaptcha.setPrivateKey(reCaptchaPrivateKey);
					
					//check if the user answer the reCaptcha correctly
					ReCaptchaResponse reCaptchaResponse = reCaptcha.checkAnswer(remoteAddr, reCaptchaChallengeField, reCaptchaResponseField);

					if (reCaptchaResponse.isValid()) {
						//the user did not answer the reCaptcha correctly so we will throw an error and display a message
						errors.reject("400", "Invalid ReCaptcha text.");
					}
				}
			}
		}
	}

	/**
	 * @param mailService is the object that contains the functionality to send
	 * an email. This mailService is set by the contactWiseController bean 
	 * in controllers.xml.
	 */
	public void setMailService(IMailFacade mailService) {
		this.mailService = mailService;
	}


	/**
	 * @param i18nProperties contains the regularly formatted (regular 
	 * casing and spaces instead of underscores) for the enums. This properties
	 * file is set by the contactWiseController bean in controllers.xml.
	 */
	public void setI18nProperties(Properties i18nProperties) {
		/* these are necessary so that the enums can retrieve the values from 
		the properties file */
		IssueType.setProperties(i18nProperties);
		OperatingSystem.setProperties(i18nProperties);
		WebBrowser.setProperties(i18nProperties);
	}

	/**
	 * @return the run service
	 */
	public RunService getRunService() {
		return runService;
	}
	
	/**
	 * @param runService the run service to set
	 */
	public void setRunService(RunService runService) {
		this.runService = runService;
	}

	public Properties getWiseProperties() {
		return wiseProperties;
	}

	public void setWiseProperties(Properties wiseProperties) {
		this.wiseProperties = wiseProperties;
	}
}