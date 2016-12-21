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
package org.wise.portal.presentation.web.controllers.teacher.project.customized;

import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
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
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.presentation.web.exception.NotAuthorizedException;
import org.wise.portal.service.acl.AclService;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.mail.IMailFacade;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.user.UserService;

/**
 * @author Hiroki Terashima
 * @author MattFish
 */
@Controller
@SessionAttributes("addSharedTeacherParameters")
@RequestMapping("/teacher/projects/customized/shareproject.html")
public class ShareProjectController {

	@Autowired
	private ProjectService projectService;
	
	@Autowired
	private UserService userService;
	
	@Autowired
	private UserDetailsService userDetailsService;
	
	@Autowired
	private AclService<Project> aclService;
	
	@Autowired
	private IMailFacade mailService;

	@Autowired
	protected Properties wiseProperties;

	@Autowired
	private MessageSource messageSource;

	protected static final String PROJECTID_PARAM_NAME = "projectId";

	protected static final String PROJECT_PARAM_NAME = "project";

	private static final String ALL_TEACHER_USERNAMES = "teacher_usernames";
	
	//the path to this form view
	protected String formView = "teacher/projects/customized/shareproject";
	
	//the path to the success view
	protected String successView = "teacher/projects/customized/shareproject";
	
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
     * @param model the model object that contains values for the page to use when rendering the view
     * @param request the http request object
     * @return the path of the view to display
     */
    @RequestMapping(method=RequestMethod.GET)
    public String initializeForm(ModelMap modelMap, HttpServletRequest request) throws Exception {
    	//get the signed in user
		User user = ControllerUtil.getSignedInUser();
		
		//get the project
		Project project = projectService.getById(Long.parseLong(request.getParameter(PROJECTID_PARAM_NAME)));
		
		//get the message if any
		String message = request.getParameter("message");
		
		//set the necessary objects into the model
		populateModel(modelMap, user, project, message);
		
    	return formView;
    }
    
    /**
     * Set the project, teacher names, and shared owners into the model
     * @param modelMap the model to add the objects to
     * @param user the signed in user
     * @param project the project
     * @param message the message to display
     * @return the populated model map
     * @throws Exception
     */
    private Map<String, Object> populateModel(Map<String, Object> modelMap, User user, Project project, String message) throws Exception {
    	if(user.isAdmin() || this.aclService.hasPermission(project, BasePermission.ADMINISTRATION, user)){
			//add the message if it is provided
			if (message != null) {
				modelMap.put("message", message);
			}

			//get all the teacher user names in WISE in alphabetical order
			List<String> allTeacherUsernames = userDetailsService.retrieveAllUsernames("TeacherUserDetails");

			//remove the owner from the user names
			allTeacherUsernames.remove(user.getUserDetails().getUsername());

			//get the shared owners of the project
			Set<User> sharedowners = project.getSharedowners();
			
			//loop through all the shared owners
			for (User sharedowner : sharedowners) {
				//get the permissions of the shared owner for the project
				String sharedTeacherRole = projectService.getSharedTeacherRole(project, sharedowner);
				
				//get the user name of the shared owner
				String userName = sharedowner.getUserDetails().getUsername();

				//remove the shared owner from the user names
				allTeacherUsernames.remove(userName);

				//create the object that will contain the information for the shared owner
				AddSharedTeacherParameters addSharedTeacherParameters = new AddSharedTeacherParameters();
				addSharedTeacherParameters.setPermission(sharedTeacherRole);
				addSharedTeacherParameters.setProject(project);
				addSharedTeacherParameters.setSharedOwnerUsername(userName);
				
				//add the shared owner to the model
				modelMap.put(userName, addSharedTeacherParameters);
			}
			
			//add the project to the model
			modelMap.put(PROJECT_PARAM_NAME, project);
			
			AlphabeticalStringComparator alphabeticalStringComparator = new AlphabeticalStringComparator();
			Collections.sort(allTeacherUsernames, alphabeticalStringComparator);
			String allTeacherUsernameString = StringUtils.join(allTeacherUsernames.iterator(), ":");
			
			//add all the teacher user names to the model
			modelMap.put(ALL_TEACHER_USERNAMES, allTeacherUsernameString);
			
			//create the params object and add it to the model
			AddSharedTeacherParameters params = new AddSharedTeacherParameters();
			params.setProject(project);
			params.setPermission(UserDetailsService.PROJECT_READ_ROLE);
			modelMap.put("addSharedTeacherParameters", params);
		} else {
			throw new NotAuthorizedException("You do not have permission to do that.");
		}
		
		return modelMap;
    }

	/**
     * On submission of the AddSharedTeacherParameters, the specified
     * teacher is granted the specified permission to the specified project.
     * @param params the object that contains values from the form
     * @param bindingResult the object used for validation in which errors will be stored
     * @param request the http request
     * @param model the model object that contains values for the page to use when rendering the view
     * @param sessionStatus the session status
     * @return the path of the view to display
     */
	@RequestMapping(method=RequestMethod.POST)
    protected String onSubmit(@ModelAttribute("addSharedTeacherParameters") AddSharedTeacherParameters params, BindingResult bindingResult, HttpServletRequest request, Model model, SessionStatus sessionStatus) {
    	String view = formView;
    	
		//get the signed in user
		User signedInUser = ControllerUtil.getSignedInUser();
		
		//get the project
    	Project project = params.getProject();
    	
    	//get the project id
		Serializable projectId = project.getId();
		
		try {
			//get the project
			project = projectService.getById(projectId);
			params.setProject(project);
		} catch (ObjectNotFoundException e1) {
			e1.printStackTrace();
		}
    	
		//get the username that we are going to share the project with
    	String sharedOwnerUsername = params.getSharedOwnerUsername();

    	//get the user object associated with the user name
    	User retrievedUser = userService.retrieveUserByUsername(sharedOwnerUsername);

    	//get the context path e.g. /wise
    	String contextPath = request.getContextPath();
    	
    	if (retrievedUser == null) {
    		//we could not find the user so we will display an error message
	    	model.addAttribute("message", "Username not recognized. Make sure to use the exact spelling of the username.");
	    	view = formView;
    	}  else if (!retrievedUser.getUserDetails().hasGrantedAuthority(UserDetailsService.TEACHER_ROLE)) {
    		//the user entered is not a teacher so we will display an error message
	    	model.addAttribute("message", "The user is not a teacher and thus cannot be added as a shared teacher.");
	    	view = formView;
    	}  else {
    		//check if the signed in user is giving sharing permissions to the other user
    		if (params.getPermission().equals(UserDetailsService.PROJECT_SHARE_ROLE)) {
    			
    			if (!project.getOwner().equals(signedInUser) && !signedInUser.isAdmin()) {
    				/*
    				 * the signed in user is not the owner of the project and is not an admin
    				 * so we will not let them give sharing permissions to the other user 
    				 * and display an error message
    				 */
    				model.addAttribute("message", "You cannot give sharing permissions because you are not the actual owner of this project.");
    		    	view = formView;
    			}
    		}
    		try {
        		// first check if we're removing a shared teacher
    			String removeUserFromProject = request.getParameter("removeUserFromProject");
    			if (removeUserFromProject != null && Boolean.valueOf(removeUserFromProject)) {
    				//remove the shared owner
    				projectService.removeSharedTeacherFromProject(sharedOwnerUsername, project);
    			} else {
    				// we're adding a new shared teacher or changing her permissions
    				boolean newSharedOwner = false;
    				if (!project.getSharedowners().contains(retrievedUser)) {
    					//the other teacher is a new shared owner
    					newSharedOwner = true;
    				}
    				
    				//add the shared teacher to the project
    				projectService.addSharedTeacherToProject(params);

    				// only send email if this is a new shared owner
    				if (newSharedOwner) {
    					Locale locale = request.getLocale();
    					ShareProjectEmailService emailService = 
    						new ShareProjectEmailService(signedInUser, retrievedUser, project, ControllerUtil.getBaseUrlString(request),locale, contextPath);
    					Thread thread = new Thread(emailService);
    					thread.start();
    				}
    			}
        		
        		view = successView;
        		//sessionStatus.setComplete();
    		} catch (ObjectNotFoundException e) {
    			//there was an error adding or removing the new shared teacher
    			view = formView;
    		} catch (Exception ex) {
    			// exception sending email, ignore
    			ex.printStackTrace();
    		}
    	}
    	
    	String message = null;
    	//get the model as a map so we can add objects to it
    	Map<String, Object> asMap = model.asMap();
    	try {
    		//add the project, teacher names, and shared owners into the model 
			populateModel(asMap, signedInUser, project, message);
		} catch (Exception e) {
			e.printStackTrace();
		}
    	
    	//add the project id to the model
    	model.addAttribute(PROJECTID_PARAM_NAME, project.getId());
    	return view;
    }
	
    class ShareProjectEmailService implements Runnable {

    	private User sharer;
    	private User sharee;
    	private Project project;
    	private String portalBaseUrlString;
		private Locale locale;
		private String contextPath;

		public ShareProjectEmailService(User sharer, User sharee,
				Project project, String portalBaseUrlString, Locale locale, String contextPath) {
			this.sharer = sharer;
			this.sharee = sharee;
			this.project = project;
			this.portalBaseUrlString = portalBaseUrlString;
			this.locale = locale;
			this.contextPath = contextPath;
		}

		public void run() {
			this.sendEmail();
		}

    	/*
    	 * sends an email to individuals to notify them that the project has been shared
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

    		String previewProjectUrl = this.portalBaseUrlString + this.contextPath + "/previewproject.html?projectId="+project.getId();

    		String[] recipients = (String[]) ArrayUtils.addAll(shareeEmailAddress, wiseProperties.getProperty("uber_admin").split(","));
    		
			String defaultSubject = messageSource.getMessage("presentation.web.controllers.teacher.project.customized.ShareProjectController.shareProjectConfirmationEmailSubject", 
					new Object[] {sharerName}, Locale.US);
			String subject = messageSource.getMessage("presentation.web.controllers.teacher.project.customized.ShareProjectController.shareProjectConfirmationEmailSubject", 
					new Object[] {sharerName}, defaultSubject, this.locale);
			String defaultMessage = messageSource.getMessage("presentation.web.controllers.teacher.project.customized.ShareProjectController.shareProjectConfirmationEmailBody", 
					new Object[] {sharerName,project.getName(),project.getId(),shareeDetails.getUsername(),sdf.format(date), previewProjectUrl}, Locale.US);
			String message = messageSource.getMessage("presentation.web.controllers.teacher.project.customized.ShareProjectController.shareProjectConfirmationEmailBody", 
					new Object[] {sharerName,project.getName(),project.getId(),shareeDetails.getUsername(),sdf.format(date), previewProjectUrl}, defaultMessage, this.locale);

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
