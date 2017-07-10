/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
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
package org.wise.portal.presentation.web.controllers.teacher.run;

import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.bind.support.SessionStatus;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.impl.AddSharedTeacherParameters;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.presentation.web.exception.NotAuthorizedException;
import org.wise.portal.service.acl.AclService;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.mail.IMailFacade;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.workgroup.WorkgroupService;

/**
 * Controller for handling requests to grant/modify permissions on
 * Project runs.
 * 
 * @author Hiroki Terashima
 * @author Patrick Lawler
 * @author Matt Fishbach
 */
@Controller
@SessionAttributes("addSharedTeacherParameters")
@RequestMapping("/teacher/run/shareprojectrun.html")
public class ShareProjectRunController {

	@Autowired
	private RunService runService;
	
	@Autowired
	private WorkgroupService workgroupService;

	@Autowired
	private UserService userService;

	@Autowired
	private UserDetailsService userDetailsService;
	
	@Autowired
	private AclService<Run> aclService;

	@Autowired
	private IMailFacade mailService;

	@Autowired
	protected Properties wiseProperties;	

	@Autowired
	private MessageSource messageSource;

	protected static final String RUNID_PARAM_NAME = "runId";

	protected static final String RUN_PARAM_NAME = "run";

	private static final String ALL_TEACHER_USERNAMES = "teacher_usernames";
	
	//the path to this form view
	private String formView = "teacher/run/shareprojectrun";
	
	//the path to the success view
	private String successView = "teacher/run/shareprojectrun";
	
	/* change this to true if you are testing and do not want to send mail to
	   the actual groups */
	private static final Boolean DEBUG = false;
	
	//set this to your email
	private static final String DEBUG_EMAIL = "youremail@email.com";

	
    /**
     * Called before the page is loaded to initialize values.
	 * Adds the AddSharedTeacherParameters object as a form-backing
	 * object. This object will be filled out and submitted for adding
	 * new teachers to the shared teachers list.
     * @param modelMap the model object that contains values for the page to use when rendering the view
     * @param request the http request object
     * @return the path of the view to display
     */
    @RequestMapping(method = RequestMethod.GET)
    public String initializeForm(ModelMap modelMap, HttpServletRequest request) throws Exception {
    	//get the signed in user
		User user = ControllerUtil.getSignedInUser();
		
		//get the run
		boolean doEagerFetch = true;
		Run run = runService.retrieveById(Long.parseLong(request.getParameter(RUNID_PARAM_NAME)), doEagerFetch);
		
		//get the message if any
		String message = request.getParameter("message");
		
		//set the necessary objects into the model
		populateModel(modelMap, user, run, message);
		
		return formView;
    }
   
    /**
     * Set the run, teacher names, and shared owners into the model
     * @param modelMap the model to add the objects to
     * @param user the signed in user
     * @param run the run
     * @param message the message to display
     * @return the populated model map
     * @throws Exception
     */
    private Map<String, Object> populateModel(Map<String, Object> modelMap, User user, Run run, String message) throws Exception {
    	//check if the user is an admin or is the owner of the run
		if(user.isAdmin() || this.aclService.hasPermission(run, BasePermission.ADMINISTRATION, user)){
			//add the message if it is provided
			if (message != null) {
				modelMap.put("message", message);
			}
			//get all the teacher user names in WISE in alphabetical order
			List<String> allTeacherUsernames = userDetailsService.retrieveAllUsernames("TeacherUserDetails");

			//remove the owner from the user names
			allTeacherUsernames.remove(user.getUserDetails().getUsername());

			//get the shared owners of the run
			Set<User> sharedowners = run.getSharedowners();
			
			//loop through all the shared owners
			for (User sharedowner : sharedowners) {
				//get the permissions of the shared owner for the run
				String sharedTeacherRole = runService.getSharedTeacherRole(run, sharedowner);
				
				//get the user name of the shared owner
				String userName = sharedowner.getUserDetails().getUsername();

				//remove the shared owner from the user names
				allTeacherUsernames.remove(userName);

				//create the object that will contain the information for the shared owner
				AddSharedTeacherParameters addSharedTeacherParameters = new AddSharedTeacherParameters();
				addSharedTeacherParameters.setPermission(sharedTeacherRole);
				addSharedTeacherParameters.setRun(run);
				addSharedTeacherParameters.setSharedOwnerUsername(userName);
				
				//add the shared owner to the model
				modelMap.put(userName, addSharedTeacherParameters);
			}
			
			//add the run and run id to the model
			modelMap.put(RUN_PARAM_NAME, run);
			modelMap.put(RUNID_PARAM_NAME, run.getId());
			
			AlphabeticalStringComparator alphabeticalStringComparator = new AlphabeticalStringComparator();
			Collections.sort(allTeacherUsernames, alphabeticalStringComparator);
			String allTeacherUsernameString = StringUtils.join(allTeacherUsernames.iterator(), ":");
			
			//add all the teacher user names to the model
			modelMap.put(ALL_TEACHER_USERNAMES, allTeacherUsernameString);
			
			//create the params object and add it to the model
			AddSharedTeacherParameters params = new AddSharedTeacherParameters();
			params.setRun(run);
			params.setPermission(UserDetailsService.RUN_READ_ROLE);
			modelMap.put("addSharedTeacherParameters", params);
		} else {
			throw new NotAuthorizedException("You do not have permission to share this run.");
		}
		
		return modelMap;
    }

    /**
     * On submission of the AddSharedTeacherParameters, the specified
     * teacher is granted the specified permission to the specified run.
     * Only teachers can be added as a shared teacher to a run.
     * @param params the model object that contains values for the page to use when rendering the view
     * @param bindingResult the object used for validation in which errors will be stored
     * @param request the http request object
     * @param model the object that contains values to be displayed on the page
     * @param sessionStatus the session status object
     * @return the path of the view to display
     */
	@RequestMapping(method = RequestMethod.POST)
	protected String onSubmit(
			@ModelAttribute("addSharedTeacherParameters") AddSharedTeacherParameters params, 
			BindingResult bindingResult, 
			HttpServletRequest request, 
			Model model, 
			SessionStatus sessionStatus) {
		String view = formView;
		
		//get the signed in user
		User signedInUser = ControllerUtil.getSignedInUser();
		
		//get the run
		Run run = params.getRun();
		
		//get run id
		Long runId = run.getId();
		
		try {
			//get the run
			boolean doEagerFetch = true;
			run = runService.retrieveById(runId, doEagerFetch);
			params.setRun(run);
		} catch (ObjectNotFoundException e1) {
			e1.printStackTrace();
		}
		
		//the error message to display to the user if any
		String message = null;
		
		//get the user that we will share the run with
		User retrievedUser = userService.retrieveUserByUsername(params.getSharedOwnerUsername());

		if (retrievedUser == null) {
			//we could not find the user name
			message = "Username not recognized. Make sure to use the exact spelling of the username.";
			view = formView;
		} else if (!retrievedUser.getUserDetails().hasGrantedAuthority(UserDetailsService.TEACHER_ROLE)) {
			//the user name entered is not a teacher
			message = "The user is not a teacher and thus cannot be added as a shared teacher.";
			view = formView;
		} else {
			try {
				// first check if we're removing a shared teacher
				String removeUserFromRun = request.getParameter("removeUserFromRun");
				if (removeUserFromRun != null && Boolean.valueOf(removeUserFromRun)) {
					//remove the shared teacher
					runService.removeSharedTeacherFromRun(params.getSharedOwnerUsername(), run.getId());
				} else { 
					// we're adding a new shared teacher or changing her permissions
					
					if(run.getSharedowners().contains(retrievedUser)) {
						//the user is already a shared owner so we will update their permissions
						runService.updateSharedTeacherForRun(params);
					} else {
						//the user is not a shared owner yet so we will add them as a shared teacher
						
						//add the shared teacher to the run
						runService.addSharedTeacherToRun(params);

						// make a workgroup for this shared teacher for this run
						String sharedOwnerUsername = params.getSharedOwnerUsername();
						User sharedOwner = userService.retrieveUserByUsername(sharedOwnerUsername);
						Set<User> sharedOwners = new HashSet<User>();
						sharedOwners.add(sharedOwner);
						workgroupService.createWorkgroup("teacher", sharedOwners, run, null);
						
						//send an email to the new shared owner
						Locale locale = request.getLocale();
						ProjectRunEmailService emailService = new ProjectRunEmailService(signedInUser, retrievedUser,  run, locale);
						Thread thread = new Thread(emailService);
						thread.start();
					}
				}
			} catch (ObjectNotFoundException e) {
				view = formView;
			}
			
			//sessionStatus.setComplete();
			view = successView;
		}
		
    	//get the model as a map so we can add objects to it
    	Map<String, Object> asMap = model.asMap();
    	try {
    		//add the project, teacher names, and shared owners into the model 
			populateModel(asMap, signedInUser, run, message);
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		return view;
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
			
			String[] recipients = (String[]) ArrayUtils.addAll(shareeEmailAddress, wiseProperties.getProperty("uber_admin").split(","));

			String defaultSubject = messageSource.getMessage("presentation.web.controllers.teacher.run.ShareProjectRunController.shareProjectRunConfirmationEmailSubject", 
					new Object[] {sharerName}, Locale.US);
			String subject = messageSource.getMessage("presentation.web.controllers.teacher.run.ShareProjectRunController.shareProjectRunConfirmationEmailSubject", 
					new Object[] {sharerName}, defaultSubject, this.locale);
			
			String defaultMessage = messageSource.getMessage("presentation.web.controllers.teacher.run.ShareProjectRunController.shareProjectRunConfirmationEmailBody", 
					new Object[] {sharerName}, Locale.US);
			String message = messageSource.getMessage("presentation.web.controllers.teacher.run.ShareProjectRunController.shareProjectRunConfirmationEmailBody", 
					new Object[] {sharerName, run.getName(), run.getId(), run.getProject().getName(), run.getProject().getId(), shareeDetails.getUsername(), sdf.format(date) },
					defaultMessage, this.locale);
			
			if (wiseProperties.containsKey("discourse_url")) {
				String discourseURL = wiseProperties.getProperty("discourse_url");
				if (discourseURL != null && !discourseURL.isEmpty()) {
					// if this WISE instance uses discourse for teacher community, append link to it in the P.S. section of the email
					String defaultPS = messageSource.getMessage("teacherEmailPSCommunity", new Object[] {discourseURL}, Locale.US);
					String pS = messageSource.getMessage("teacherEmailPSCommunity", new Object[] {discourseURL}, defaultPS, this.locale);
					message += "\n\n"+pS;
				}
			}
			
			String fromEmail = sharerEmailAddress;
			
			//for testing out the email functionality without spamming the groups
			if(DEBUG) {
				recipients[0] = DEBUG_EMAIL;
			}
			
			//sends the email to the recipients
			try {
				mailService.postMail(recipients, subject, message, fromEmail);
			} catch (MessagingException e) {
				// do nothing, no notification to uber_admin required.
				e.printStackTrace();
			}
		}
    }
    
    /**
     * Comparator used to order strings alphabetically
     */
	public static class AlphabeticalStringComparator implements Comparator<String> {

		/**
		 * Compares two strings
		 * @param string1 a string
		 * @param string2 a string
		 * @return
		 * -1 if string1 comes before string2
		 * 0 if string1 is the same as string2
		 * 1 if string1 comes after string2
		 */
		@Override
		public int compare(String string1, String string2) {
			int result = 0;
			
			if(string1 != null && string2 != null) {
				String string1LowerCase = string1.toLowerCase();
				String string2LowerCase = string2.toLowerCase();
				result = string1LowerCase.compareTo(string2LowerCase);
			}
			
			return result;
		}
	}
}

