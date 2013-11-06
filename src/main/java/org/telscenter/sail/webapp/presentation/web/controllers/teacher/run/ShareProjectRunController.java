/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
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
package org.telscenter.sail.webapp.presentation.web.controllers.teacher.run;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.mail.IMailFacade;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;
import net.sf.sail.webapp.service.AclService;
import net.sf.sail.webapp.service.NotAuthorizedException;
import net.sf.sail.webapp.service.UserService;

import org.apache.commons.lang.ArrayUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.context.MessageSource;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.SimpleFormController;
import org.springframework.web.servlet.view.RedirectView;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.authentication.impl.TeacherUserDetails;
import org.telscenter.sail.webapp.domain.impl.AddSharedTeacherParameters;
import org.telscenter.sail.webapp.service.authentication.UserDetailsService;
import org.telscenter.sail.webapp.service.offering.RunService;
import org.telscenter.sail.webapp.service.workgroup.WISEWorkgroupService;

/**
 * Controller for handling requests to grant/modify permissions on
 * Project runs.
 * 
 * @author Hiroki Terashima
 * @author Patrick Lawler
 * @author Matt Fishbach
 * @version $Id:$
 */
public class ShareProjectRunController extends SimpleFormController {
	
	private RunService runService;
	
	private WISEWorkgroupService workgroupService = null;

	private UserService userService;

	private UserDetailsService userDetailsService;
	
	private AclService<Run> aclService;

	private IMailFacade javaMail = null;

	private Properties emaillisteners = null;

	protected Properties portalProperties;	

	private MessageSource messageSource;

	protected static final String RUNID_PARAM_NAME = "runId";

	protected static final String RUN_PARAM_NAME = "run";

	private static final String ALL_TEACHER_USERNAMES = "teacher_usernames";
	
	/* change this to true if you are testing and do not want to send mail to
	   the actual groups */
	private static final Boolean DEBUG = false;
	
	//set this to your email
	private static final String DEBUG_EMAIL = "youremail@email.com";

	/**
	 * Adds the AddSharedTeacherParameters object as a form-backing
	 * object. This object will be filled out and submitted for adding
	 * new teachers to the shared teachers list.
	 * 
	 * @see org.springframework.web.servlet.mvc.AbstractFormController#formBackingObject(javax.servlet.http.HttpServletRequest)
	 */
	@Override
	protected Object formBackingObject(HttpServletRequest request) throws Exception {
		AddSharedTeacherParameters params = new AddSharedTeacherParameters();
		params.setRun(runService.retrieveById(Long.parseLong(request.getParameter(RUNID_PARAM_NAME))));
		params.setPermission(UserDetailsService.RUN_READ_ROLE);
		return params;
	}
	
    /**
     * Adds the existing shared teachers and their permissions for
     * the run requested to the page.
     * 
     * @see org.springframework.web.servlet.mvc.SimpleFormController#referenceData(javax.servlet.http.HttpServletRequest)
     */
	@Override
	protected Map<String, Object> referenceData(HttpServletRequest request) 
	    throws Exception {
		Map<String, Object> model = new HashMap<String, Object>();
		User user = ControllerUtil.getSignedInUser();
		Run run = runService.retrieveById(Long.parseLong(request.getParameter(RUNID_PARAM_NAME)));
		Set<User> sharedowners = run.getSharedowners();

		if(user.isAdmin() || 
				this.aclService.hasPermission(run, BasePermission.ADMINISTRATION, user)){
			for (User sharedowner : sharedowners) {
				String sharedTeacherRole = runService.getSharedTeacherRole(run, sharedowner);
				AddSharedTeacherParameters addSharedTeacherParameters = 
					new AddSharedTeacherParameters();
				addSharedTeacherParameters.setPermission(sharedTeacherRole);
				addSharedTeacherParameters.setRun(run);
				addSharedTeacherParameters.setSharedOwnerUsername(
						sharedowner.getUserDetails().getUsername());
				model.put(sharedowner.getUserDetails().getUsername(), 
						addSharedTeacherParameters);
			}
			model.put(RUN_PARAM_NAME, run);
			List<String> allTeacherUsernames = userDetailsService.retrieveAllUsernames("TeacherUserDetails");
			String allTeacherUsernameString = StringUtils.join(allTeacherUsernames.iterator(), ":");
			model.put(ALL_TEACHER_USERNAMES, allTeacherUsernameString);
			
			return model;
		} else {
			throw new NotAuthorizedException("You do not have permission to share this run.");
		}
	}

	/**
     * On submission of the AddSharedTeacherParameters, the specified
     * teacher is granted the specified permission to the specified run.
     * Only teachers can be added as a shared teacher to a run.
     * 
     * @see org.springframework.web.servlet.mvc.SimpleFormController#onSubmit(javax.servlet.http.HttpServletRequest,
     *      javax.servlet.http.HttpServletResponse, java.lang.Object,
     *      org.springframework.validation.BindException)
     */
    @Override
    protected ModelAndView onSubmit(HttpServletRequest request,
            HttpServletResponse response, Object command, BindException errors) {
    	AddSharedTeacherParameters params = (AddSharedTeacherParameters) command;
    	User retrievedUser = userService.retrieveUserByUsername(params.getSharedOwnerUsername());
    	ModelAndView modelAndView;
    	
    	if (retrievedUser == null) {
    		modelAndView = new ModelAndView(new RedirectView("shareprojectrun.html"));
	    	modelAndView.addObject(RUNID_PARAM_NAME, params.getRun().getId());
	    	modelAndView.addObject("message", "Username not recognized. Make sure to use the exact spelling of the username.");
	    	return modelAndView;
    	} else if (!retrievedUser.getUserDetails().hasGrantedAuthority(UserDetailsService.TEACHER_ROLE)) {
    		modelAndView = new ModelAndView(new RedirectView("shareprojectrun.html"));
	    	modelAndView.addObject(RUNID_PARAM_NAME, params.getRun().getId());
	    	modelAndView.addObject("message", "The user is not a teacher and thus cannot be added as a shared teacher.");
	    	return modelAndView;
    	} else {
    	try {
    		// first check if we're removing a shared teacher
    		String removeUserFromRun = request.getParameter("removeUserFromRun");
    		if (removeUserFromRun != null && Boolean.valueOf(removeUserFromRun)) {
    			runService.removeSharedTeacherFromRun(params.getSharedOwnerUsername(), params.getRun().getId());
    		} else {  // we're adding a new shared teacher or changing her permissions
    			boolean newSharedOwner = false;
    			if (!params.getRun().getSharedowners().contains(retrievedUser)) {
    				newSharedOwner = true;
    			}
    			runService.addSharedTeacherToRun(params);

    			// make a workgroup for this shared teacher for this run
    			String sharedOwnerUsername = params.getSharedOwnerUsername();
    			User sharedOwner = userService.retrieveUserByUsername(sharedOwnerUsername);
    			Set<User> sharedOwners = new HashSet<User>();
    			sharedOwners.add(sharedOwner);
    			workgroupService.createWISEWorkgroup("teacher", sharedOwners, params.getRun(), null);			
    			// only send email if this is a new shared owner
    			if (newSharedOwner) {
    				User sharer = ControllerUtil.getSignedInUser();

    				Locale locale = request.getLocale();
    				ProjectRunEmailService emailService = new ProjectRunEmailService(sharer, retrievedUser,  params.getRun(), locale);
    				Thread thread = new Thread(emailService);
    				thread.start();
    			}
    		}
		} catch (ObjectNotFoundException e) {
			modelAndView = new ModelAndView(new RedirectView(getFormView()));
	    	modelAndView.addObject(RUNID_PARAM_NAME, params.getRun().getId());
	    	return modelAndView;
		}
    	modelAndView = new ModelAndView(new RedirectView(getSuccessView()));
    	modelAndView.addObject(RUNID_PARAM_NAME, params.getRun().getId());
    	return modelAndView;
    	}
    }

    class ProjectRunEmailService implements Runnable {

    	private User sharer;
    	private User sharee;
    	private Run run;
    	private Locale locale;
    	
		public ProjectRunEmailService(User sharer, User sharee, Run run, Locale locale) {
			this.sharer = sharer;
			this.sharee = sharee;
			this.run = run;
			this.locale = locale;
		}

		public void run() {
			this.sendEmail();
		}

		/**
	     * Sends an email to individuals to notify them that the run has been shared
	     * On exception sending the email, ignore.
	     * @param sharee user that the run was shared with
	     * @param run the run that was shared
	     */
		private void sendEmail() {
			
			Date date = new Date();
			SimpleDateFormat sdf = new SimpleDateFormat("EEE, MMMMM d, yyyy");
			
			TeacherUserDetails sharerUserDetails = 
				(TeacherUserDetails) sharer.getUserDetails();
			String sharerName = sharerUserDetails.getFirstname() + " " + 
				sharerUserDetails.getLastname();
			String sharerEmailAddress = sharerUserDetails.getEmailAddress();
			
			TeacherUserDetails shareeDetails = (TeacherUserDetails) sharee.getUserDetails();
			
			String[] shareeEmailAddress = {shareeDetails.getEmailAddress()};
			
			String[] recipients = (String[]) ArrayUtils.addAll(shareeEmailAddress, emaillisteners.getProperty("uber_admin").split(","));

			String defaultSubject = messageSource.getMessage("presentation.web.controllers.teacher.run.ShareProjectRunController.shareProjectRunConfirmationEmailSubject", 
					new Object[] {sharerName}, Locale.US);
			String subject = messageSource.getMessage("presentation.web.controllers.teacher.run.ShareProjectRunController.shareProjectRunConfirmationEmailSubject", 
					new Object[] {sharerName}, defaultSubject, this.locale);
			
			String defaultMessage = messageSource.getMessage("presentation.web.controllers.teacher.run.ShareProjectRunController.shareProjectRunConfirmationEmailBody", 
					new Object[] {sharerName}, Locale.US);
			String message = messageSource.getMessage("presentation.web.controllers.teacher.run.ShareProjectRunController.shareProjectRunConfirmationEmailBody", 
					new Object[] {sharerName, run.getName(), run.getId(), run.getProject().getName(), run.getProject().getId(), shareeDetails.getUsername(), sdf.format(date) },
					defaultMessage, this.locale);
			
			/*
			String subject = sharerName + " shared a project run with you on WISE4";	
			String message = sharerName + " shared a project run with you on WISE4:\n\n" +
				"Run Name: " + run.getName() + "\n" +
				"Run ID: " + run.getId() + "\n" +
				"Project Name: " + run.getProject().getName() + "\n" +
				"Project ID: " + run.getProject().getId() + "\n" +
				"Shared with username: " + shareeDetails.getUsername() + "\n" +
				"Date this project was shared: " + sdf.format(date) + "\n\n\n" +
				"Thanks,\n" +
				"WISE4 Team";
			*/
			
			String fromEmail = sharerEmailAddress;
			
			//for testing out the email functionality without spamming the groups
			if(DEBUG) {
				recipients[0] = DEBUG_EMAIL;
			}
			
			//sends the email to the recipients
			try {
				javaMail.postMail(recipients, subject, message, fromEmail);
			} catch (MessagingException e) {
				// do nothing, no notification to uber_admin required.
				e.printStackTrace();
			}
		}
    }

	/**
	 * @param emaillisteners the emaillisteners to set
	 */
	public void setEmaillisteners(Properties emaillisteners) {
		this.emaillisteners = emaillisteners;
	}
	
	/**
	 * @param javaMail the javaMail to set
	 */
	public void setJavaMail(IMailFacade javaMail) {
		this.javaMail = javaMail;
	}
	
	/**
	 * @param portalProperties the portalProperties to set
	 */
	public void setPortalProperties(Properties portalProperties) {
		this.portalProperties = portalProperties;
	}
	
	public void setMessageSource(MessageSource messageSource) {
		this.messageSource = messageSource;
	}

	/**
	 * @param runService the runService to set
	 */
	public void setRunService(RunService runService) {
		this.runService = runService;
	}

	/**
	 * @return the userService
	 */
	public UserService getUserService() {
		return userService;
	}

	/**
	 * @param userService the userService to set
	 */
	public void setUserService(UserService userService) {
		this.userService = userService;
	}

	/**
	 * @return the userDetailsService
	 */
	public void setUserDetailsService(UserDetailsService userDetailsService) {
		this.userDetailsService = userDetailsService;
	}
	
	/**
	 * @param workgroupService the workgroupService to set
	 */
	public void setWorkgroupService(WISEWorkgroupService workgroupService) {
		this.workgroupService = workgroupService;
	}

	/**
	 * @param aclService the aclService to set
	 */
	public void setAclService(AclService<Run> aclService) {
		this.aclService = aclService;
	}
}

