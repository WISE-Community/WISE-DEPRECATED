/**
 * 
 */
package org.telscenter.sail.webapp.presentation.web.controllers;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.Vector;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.mail.IMailFacade;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;

import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.SimpleFormController;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.authentication.MutableUserDetails;
import org.telscenter.sail.webapp.domain.authentication.impl.TeacherUserDetails;
import org.telscenter.sail.webapp.domain.general.contactwise.IssueType;
import org.telscenter.sail.webapp.domain.general.contactwise.OperatingSystem;
import org.telscenter.sail.webapp.domain.general.contactwise.WebBrowser;
import org.telscenter.sail.webapp.domain.general.contactwise.impl.ContactWISEProject;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.service.offering.RunService;
import org.telscenter.sail.webapp.service.project.ProjectService;

/**
 * @author gloriasass
 *
 */
public class ContactWiseProjectController extends SimpleFormController {

	protected IMailFacade javaMail = null;
	
	protected Properties uiHTMLProperties = null;
	
	private ProjectService projectService;
	
	private RunService runService;

	/* change this to true if you are testing and do not want to send mail to
	   the actual groups */
	private static final Boolean DEBUG = false;
	
	//set this to your email
	private static final String DEBUG_EMAIL = "youremail@gmail.com";
	
	public ContactWiseProjectController() {
		setSessionForm(true);
	}
	
	@Override
	public ModelAndView onSubmit(HttpServletRequest request,
			HttpServletResponse response, Object command, BindException errors)
	throws Exception {
		
		ContactWISEProject contactWISEProject = (ContactWISEProject) command;

		//retrieves the contents of the email to be sent
		String[] recipients = contactWISEProject.getMailRecipients();
		String subject = contactWISEProject.getMailSubject();
		String message = contactWISEProject.getMailMessage();
		String fromEmail = contactWISEProject.getEmail();
		String[] cc = contactWISEProject.getMailCcs();

		//fromEmail will be null if the signed in user is a student
		if(fromEmail == null) {
			/*
			 * set the fromEmail to a non null and non empty string otherwise
			 * an exception will be thrown
			 */
			fromEmail = "null";
		}
		
		//get the run id
		Long runId = contactWISEProject.getRunId();
		
		/*
		 * if a student is submitting the contactwiseproject form, the runId will
		 * be set. if a teacher is submitting the contactwiseproject form, the
		 * runId will not be set. this is ok because the teacher is the run
		 * owner and their email is already in the cc array
		 */
		if(runId != null) {
			Run run = runService.retrieveById(runId);
			Set<User> runOwners = run.getOwners();
			
			Iterator<User> runOwnersIterator = runOwners.iterator();
			Vector<String> runOwnerEmailAddresses = new Vector<String>();

			//loop through the run owners
			while(runOwnersIterator.hasNext()) {
				User runOwner = runOwnersIterator.next();
				net.sf.sail.webapp.domain.authentication.MutableUserDetails userDetails = runOwner.getUserDetails();
				
				//get the run owner email address
				String emailAddress = userDetails.getEmailAddress();
				
				if(emailAddress != null) {
					runOwnerEmailAddresses.add(emailAddress);				
				}
			}
			
			if(!runOwnerEmailAddresses.isEmpty()) {
				//we have run owner email addresses
				
				for(int x=0; x<cc.length; x++) {
					if(!runOwnerEmailAddresses.contains(cc[x])) {
						//add the cc emails to the run owner emails to merge them
						runOwnerEmailAddresses.add(cc[x]);						
					}
				}
				
				//create a new String array the same size as the runOwnerEmailAddresses
				cc = new String[runOwnerEmailAddresses.size()];
				
				//put all the email addresses back into the cc array
				for(int x=0; x<runOwnerEmailAddresses.size(); x++) {
					cc[x] = runOwnerEmailAddresses.get(x);			
				}			
			}			
		}
		
		if(DEBUG) {
			cc = new String[1];
			cc[0] = fromEmail;
			recipients[0] = DEBUG_EMAIL;
		}
		
		//sends the email to the recipients
		javaMail.postMail(recipients, subject, message, fromEmail, cc);
		
		//System.out.println(message);
		
		ModelAndView modelAndView = new ModelAndView(getSuccessView());

		return modelAndView;
	}
	
	@Override
	protected Object formBackingObject(HttpServletRequest request) 
			throws Exception {
		ContactWISEProject contactWISEProject = new ContactWISEProject();
		
		//tries to retrieve the user from the session
		User user = ControllerUtil.getSignedInUser();

		/* if the user is logged in to the session, auto populate the name and 
		email address in the form, if not, the fields will just be blank */
		if (user != null) {
			//contactWISEProject.setUser(user);
			contactWISEProject.setIsStudent(user);
			
			MutableUserDetails telsUserDetails = 
				(MutableUserDetails) user.getUserDetails();

			contactWISEProject.setName(telsUserDetails.getFirstname() + " " + 
					telsUserDetails.getLastname());
			
			//if user is a teacher, retrieve their email
			/* NOTE: this check may be removed later if we never allow students
			   to submit feedback */
			if(telsUserDetails instanceof TeacherUserDetails) {
				contactWISEProject.setEmail(telsUserDetails.getEmailAddress());
			}
		}
		
		//tries to retrieve the project ID number from the request
		if(request.getParameter("projectId") != null) {
			Project project = projectService.getById(Long.parseLong(
					request.getParameter("projectId")));
			
			if(project != null) {
				//sets the project and project name
				contactWISEProject.setProjectName(
						project.getName());
				contactWISEProject.setProjectId(Long.parseLong(
						request.getParameter("projectId")));
			}
		}
		
		String runId = request.getParameter("runId");
		
		if(runId != null) {
			//set the run id into the object so we can access it later
			contactWISEProject.setRunId(new Long(runId));
			
			//get the run
			Run run = getRunService().retrieveById(new Long(runId));
			
			//get the owners of the run
			Set<User> owners = run.getOwners();
			Iterator<User> ownersIterator = owners.iterator();

			if(ownersIterator.hasNext()) {
				//get the first owner of the run
				User owner = ownersIterator.next();
				
				//get the teacher id
				Long teacherId = owner.getId();
				
				//set the teacher id
				contactWISEProject.setTeacherId(teacherId);				
			}
		}
		
		contactWISEProject.setIssuetype(IssueType.PROJECT_PROBLEMS);
		
		return contactWISEProject;
	}
	
	@Override
	protected Map<String, Object> referenceData(HttpServletRequest request) 
			throws Exception {
		Map<String, Object> model = new HashMap<String, Object>();
		
		//places the array of constants into the model so the view can display
		model.put("issuetypes", IssueType.values());
		model.put("operatingsystems", OperatingSystem.values());
		model.put("webbrowsers", WebBrowser.values());
		return model;
	}

	/**
	 * @return the javaMail
	 */
	public IMailFacade getJavaMail() {
		return javaMail;
	}

	/**
	 * @param javaMail is the object that contains the functionality to send
	 * an email. This javaMail is set by the contactWiseController bean 
	 * in controllers.xml.
	 */
	public void setJavaMail(IMailFacade javaMail) {
		this.javaMail = javaMail;
	}


	/**
	 * @param uiHTMLProperties contains the regularly formatted (regular 
	 * casing and spaces instead of underscores) for the enums. This properties
	 * file is set by the contactWiseController bean in controllers.xml.
	 */
	public void setUiHTMLProperties(Properties uiHTMLProperties) {
		/* these are necessary so that the enums can retrieve the values from 
		the properties file */
		IssueType.setProperties(uiHTMLProperties);
		OperatingSystem.setProperties(uiHTMLProperties);
		WebBrowser.setProperties(uiHTMLProperties);
	}

	/**
	 * @return the projectService
	 */
	public ProjectService getProjectService() {
		return projectService;
	}

	/**
	 * @param projectService the projectService to set
	 */
	public void setProjectService(ProjectService projectService) {
		this.projectService = projectService;
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
}
