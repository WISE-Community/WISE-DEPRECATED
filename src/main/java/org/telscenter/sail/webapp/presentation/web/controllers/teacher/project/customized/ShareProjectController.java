/**
 * 
 */
package org.telscenter.sail.webapp.presentation.web.controllers.teacher.project.customized;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
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
import org.telscenter.sail.webapp.domain.authentication.impl.TeacherUserDetails;
import org.telscenter.sail.webapp.domain.impl.AddSharedTeacherParameters;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.service.authentication.UserDetailsService;
import org.telscenter.sail.webapp.service.project.ProjectService;

/**
 * @author Hiroki Terashima
 * @author MattFish
 * @version $Id:$
 */
public class ShareProjectController extends SimpleFormController {

	private ProjectService projectService;
	
	private UserService userService;

	private UserDetailsService userDetailsService;
	
	private AclService<Project> aclService;
	
	private IMailFacade javaMail = null;

	private Properties emaillisteners = null;

	protected Properties portalProperties;

	private MessageSource messageSource;

	protected static final String PROJECTID_PARAM_NAME = "projectId";

	protected static final String PROJECT_PARAM_NAME = "project";

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
		params.setProject(projectService.getById(Long.parseLong(request.getParameter(PROJECTID_PARAM_NAME))));
		params.setPermission(UserDetailsService.PROJECT_READ_ROLE);
		return params;
	}
	
    /**
     * Adds the existing shared teachers and their permissions for
     * the project requested to the page.
     * 
     * @see org.springframework.web.servlet.mvc.SimpleFormController#referenceData(javax.servlet.http.HttpServletRequest)
     */
	@Override
	protected Map<String, Object> referenceData(HttpServletRequest request) 
	    throws Exception {
		User user = ControllerUtil.getSignedInUser();
		Project project = projectService.getById(Long.parseLong(request.getParameter(PROJECTID_PARAM_NAME)));
		
		if(user.isAdmin() || 
				this.aclService.hasPermission(project, BasePermission.ADMINISTRATION, user)){
			Map<String, Object> model = new HashMap<String, Object>();
			String message = request.getParameter("message");
			if (message != null) {
				model.put("message", message);
			}
			Set<User> sharedowners = project.getSharedowners();
	
			for (User sharedowner : sharedowners) {
				String sharedTeacherRole = projectService.getSharedTeacherRole(project, sharedowner);
				AddSharedTeacherParameters addSharedTeacherParameters = 
					new AddSharedTeacherParameters();
				addSharedTeacherParameters.setPermission(sharedTeacherRole);
				addSharedTeacherParameters.setProject(project);
				addSharedTeacherParameters.setSharedOwnerUsername(
						sharedowner.getUserDetails().getUsername());
				model.put(sharedowner.getUserDetails().getUsername(), 
						addSharedTeacherParameters);
			}
			model.put(PROJECT_PARAM_NAME, project);
			List<String> allTeacherUsernames = userDetailsService.retrieveAllUsernames("TeacherUserDetails");
			String allTeacherUsernameString = StringUtils.join(allTeacherUsernames.iterator(), ":");
			model.put(ALL_TEACHER_USERNAMES, allTeacherUsernameString);
			return model;
		} else {
			throw new NotAuthorizedException("You do not have permission to do that.");
		}
	}

	/**
     * On submission of the AddSharedTeacherParameters, the specified
     * teacher is granted the specified permission to the specified project.
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
    		modelAndView = new ModelAndView(new RedirectView("shareproject.html"));
	    	modelAndView.addObject(PROJECTID_PARAM_NAME, params.getProject().getId());
	    	modelAndView.addObject("message", "Username not recognized. Make sure to use the exact spelling of the username.");
	    	return modelAndView;
    	}  else if (!retrievedUser.getUserDetails().hasGrantedAuthority(UserDetailsService.TEACHER_ROLE)) {
    		modelAndView = new ModelAndView(new RedirectView("shareproject.html"));
	    	modelAndView.addObject(PROJECTID_PARAM_NAME, params.getProject().getId());
	    	modelAndView.addObject("message", "The user is not a teacher and thus cannot be added as a shared teacher.");
	    	return modelAndView;
    	}  else {
    		User signedInUser = ControllerUtil.getSignedInUser();
    		if (params.getPermission().equals(UserDetailsService.PROJECT_SHARE_ROLE)) {
    			if (!params.getProject().getOwners().contains(signedInUser) && !signedInUser.isAdmin()) {
    	    		modelAndView = new ModelAndView(new RedirectView(request.getRequestURI()));
    		    	modelAndView.addObject(PROJECTID_PARAM_NAME, params.getProject().getId());
    		    	modelAndView.addObject("message", "You cannot give sharing permissions because you are not the actual owner of this project.");
    		    	return modelAndView;    				
    			}
    		}
    		try {
        		// first check if we're removing a shared teacher
    			String removeUserFromProject = request.getParameter("removeUserFromProject");
    			if (removeUserFromProject != null && Boolean.valueOf(removeUserFromProject)) {
    				projectService.removeSharedTeacherFromProject(params.getSharedOwnerUsername(), params.getProject());
    			} else {  // we're adding a new shared teacher or changing her permissions
    				boolean newSharedOwner = false;
    				if (!params.getProject().getSharedowners().contains(retrievedUser)) {
    					newSharedOwner = true;
    				}
    				projectService.addSharedTeacherToProject(params);
    				Project project = projectService.getById(params.getProject().getId());
    				// only send email if this is a new shared owner
    				if (newSharedOwner) {
    					Locale locale = request.getLocale();
    					ShareProjectEmailService emailService = 
    						new ShareProjectEmailService(signedInUser, retrievedUser, project, ControllerUtil.getBaseUrlString(request),locale);
    					Thread thread = new Thread(emailService);
    					thread.start();
    				}
    			}
    		} catch (ObjectNotFoundException e) {
    			modelAndView = new ModelAndView(new RedirectView(getFormView()));
    			modelAndView.addObject(PROJECTID_PARAM_NAME, params.getProject().getId());
    			return modelAndView;
    		} catch (Exception ex) {
    			// exception sending email, ignore
    		}
    		modelAndView = new ModelAndView(new RedirectView(getSuccessView()));
    		modelAndView.addObject(PROJECTID_PARAM_NAME, params.getProject().getId());
    		return modelAndView;
    	}
    }
	
    class ShareProjectEmailService implements Runnable {

    	private User sharer;
    	private User sharee;
    	private Project project;
    	private String portalBaseUrlString;
		private Locale locale;

		public ShareProjectEmailService(User sharer, User sharee,
				Project project, String portalBaseUrlString, Locale locale) {
			this.sharer = sharer;
			this.sharee = sharee;
			this.project = project;
			this.portalBaseUrlString = portalBaseUrlString;
			this.locale = locale;
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

    		String previewProjectUrl = this.portalBaseUrlString + "/webapp/previewproject.html?projectId="+project.getId();

    		String[] recipients = (String[]) ArrayUtils.addAll(shareeEmailAddress, emaillisteners.getProperty("uber_admin").split(","));
    		
			String defaultSubject = messageSource.getMessage("presentation.web.controllers.teacher.project.customized.ShareProjectController.shareProjectConfirmationEmailSubject", 
					new Object[] {sharerName}, Locale.US);
			String subject = messageSource.getMessage("presentation.web.controllers.teacher.project.customized.ShareProjectController.shareProjectConfirmationEmailSubject", 
					new Object[] {sharerName}, defaultSubject, this.locale);
			String defaultMessage = messageSource.getMessage("presentation.web.controllers.teacher.project.customized.ShareProjectController.shareProjectConfirmationEmailBody", 
					new Object[] {sharerName,project.getName(),project.getId(),shareeDetails.getUsername(),sdf.format(date), previewProjectUrl}, Locale.US);
			String message = messageSource.getMessage("presentation.web.controllers.teacher.project.customized.ShareProjectController.shareProjectConfirmationEmailBody", 
					new Object[] {sharerName,project.getName(),project.getId(),shareeDetails.getUsername(),sdf.format(date), previewProjectUrl}, defaultMessage, this.locale);

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
	/**
	 * @param projectService the projectService to set
	 */
	public void setProjectService(ProjectService projectService) {
		this.projectService = projectService;
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
	 * @param aclService the aclService to set
	 */
	public void setAclService(AclService<Project> aclService) {
		this.aclService = aclService;
	}

	public void setMessageSource(MessageSource messageSource) {
		this.messageSource = messageSource;
	}
}
