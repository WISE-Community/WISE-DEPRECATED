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
package org.wise.portal.presentation.web.controllers;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Properties;
import java.util.Vector;

import javax.servlet.http.HttpServletRequest;

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.general.contactwise.IssueType;
import org.wise.portal.domain.general.contactwise.OperatingSystem;
import org.wise.portal.domain.general.contactwise.WebBrowser;
import org.wise.portal.domain.general.contactwise.impl.ContactWISEForm;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.validators.general.contactwise.ContactWISEValidator;
import org.wise.portal.presentation.web.filters.WISEAuthenticationProcessingFilter;
import org.wise.portal.service.mail.IMailFacade;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.portal.PortalService;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.user.UserService;

@Controller
@SessionAttributes("contactWISEForm")
@RequestMapping("/contact/contactwise.html")
public class ContactWiseController {

	@Autowired
	protected IMailFacade mailService;

	@Autowired
	protected Properties i18nProperties;

	@Autowired
	private ProjectService projectService;

	@Autowired
	private RunService runService;

	@Autowired
	private PortalService portalService;

	@Autowired
	private UserService userService;

	@Autowired
	private Properties wiseProperties;

	@Autowired
	private ContactWISEValidator contactWISEValidator;

	/* change this to true if you are testing and do not want to send mail to
	   the actual groups */
	private static final Boolean DEBUG = false;

	//set this to your email
	private static final String DEBUG_EMAIL = "youremail@gmail.com";
	
	// the url to the user agent parse site
	private static final String userAgentParseURL = "http://api.whatismybrowser.com/api/v1/user_agent_parse";

	@RequestMapping(method=RequestMethod.POST)
	public String onSubmit(
			@ModelAttribute("contactWISEForm")ContactWISEForm contactWISEForm, 
			BindingResult result,
			HttpServletRequest request)
					throws Exception {
		contactWISEValidator.validate(contactWISEForm, result);
		checkRecaptcha(request, result);
		getTeacherNameAndSetInForm(contactWISEForm);

		if (result.hasErrors()) {
			return "contact/contactwise";
		}
		
		// get our user key for the user agent parse site
		String userKey = wiseProperties.getProperty("userAgentParseKey");
		
		if (userKey != null && !userKey.equals("")) {

		    // get the user agent from the request
		    String userAgent = request.getParameter("usersystem");

	        HttpClient client = HttpClientBuilder.create().build();
	        HttpPost post = new HttpPost(userAgentParseURL);
	        
	        // add the user_key and user_agent parameters to the POST request
	        List<NameValuePair> urlParameters = new ArrayList<NameValuePair>();
	        urlParameters.add(new BasicNameValuePair("user_key", userKey));
	        urlParameters.add(new BasicNameValuePair("user_agent", userAgent));
	        
	        post.setEntity(new UrlEncodedFormEntity(urlParameters));
	        
	        try {
	            
	            // execute the POST
	            HttpResponse response = client.execute(post);

	            // read the response
	            BufferedReader rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
	            StringBuffer userAgentParseResult = new StringBuffer();
	            String line = "";
	            while ((line = rd.readLine()) != null) {
	                userAgentParseResult.append(line);
	            }

	            String parseResultString = userAgentParseResult.toString();
	            
	            try {
	                
	                // get the response as a JSON object
	                JSONObject parseResultJSONObject = new JSONObject(parseResultString);
	                
	                // get whether the request succeeded
	                String parseResult = parseResultJSONObject.getString("result");
	                
	                if (parseResult != null && parseResult.equals("success")) {
	                    // the request succeeded so we will get the data
	                    JSONObject parse = parseResultJSONObject.getJSONObject("parse");
	                    
	                    // get the operating system and browser values
	                    String operatingSystemName = parse.getString("operating_system_name");
	                    String operatingSystemVersion = parse.getString("operating_system_version_full");
	                    String browserName = parse.getString("browser_name");
	                    String browserVersion = parse.getString("browser_version_full");
	                    
	                    // set the values into the form so that we can use them later when creating the email message
	                    contactWISEForm.setOperatingSystemName(operatingSystemName);
	                    contactWISEForm.setOperatingSystemVersion(operatingSystemVersion);
	                    contactWISEForm.setBrowserName(browserName);
	                    contactWISEForm.setBrowserVersion(browserVersion);
	                }
	            } catch(JSONException e) {
	                e.printStackTrace();
	            }
	        } catch(IOException e) {
	            e.printStackTrace();
	        } catch(Exception e) {
	            e.printStackTrace();
	        }
		}

		//retrieves the contents of the email to be sent
		String[] recipients = getMailRecipients();
		String[] cc = getMailCcs(contactWISEForm);
		String subject = contactWISEForm.getMailSubject();
		String fromEmail = contactWISEForm.getEmail();
		String message = contactWISEForm.getMailMessage();

		//fromEmail will be null if the signed in user is a student
		if (fromEmail == null) {
			/*
			 * set the fromEmail to a non null and non empty string otherwise
			 * an exception will be thrown
			 */
			fromEmail = "null";
		}

		//get the run id
		Long runId = contactWISEForm.getRunId();

		/*
		 * if a student is submitting the contactwiseproject form, the runId will
		 * be set. if a teacher is submitting the contactwiseproject form, the
		 * runId will not be set. this is ok because the teacher is the run
		 * owner and their email is already in the cc array
		 */
		if (runId != null) {
			Run run = runService.retrieveById(runId);
			Vector<String> runOwnerEmailAddresses = new Vector<String>();
			User runOwner = run.getOwner();
			MutableUserDetails userDetails = runOwner.getUserDetails();
			//get the run owner email address
			String emailAddress = userDetails.getEmailAddress();

			if (emailAddress != null) {
				runOwnerEmailAddresses.add(emailAddress);
			}

			if (!runOwnerEmailAddresses.isEmpty()) {
				//we have run owner email addresses

				for (int x = 0; x < cc.length; x++) {
					if (!runOwnerEmailAddresses.contains(cc[x])) {
						//add the cc emails to the run owner emails to merge them
						runOwnerEmailAddresses.add(cc[x]);						
					}
				}

				//create a new String array the same size as the runOwnerEmailAddresses
				cc = new String[runOwnerEmailAddresses.size()];

				//put all the email addresses back into the cc array
				for (int x = 0; x < runOwnerEmailAddresses.size(); x++) {
					cc[x] = runOwnerEmailAddresses.get(x);			
				}			
			}			
		}		

		//for testing out the email functionality without spamming the groups
		if (DEBUG) {
			cc = new String[1];
			cc[0] = fromEmail;
			recipients[0] = DEBUG_EMAIL;
		}

		//sends the email to the recipients
		mailService.postMail(recipients, subject, message, fromEmail, cc);

		return "contact/contactwiseconfirm";
	}

	@RequestMapping(method=RequestMethod.GET) 
	public String initializeForm(ModelMap modelMap, HttpServletRequest request)
			throws NumberFormatException, ObjectNotFoundException {

		ContactWISEForm contactWISEForm = new ContactWISEForm();

		//tries to retrieve the user from the session
		User user = ControllerUtil.getSignedInUser();

		/* if the user is logged in to the session, auto populate the name and 
		   email address in the form, if not, the fields will just be blank */
		if (user != null) {
		    //set whether the user is a student
			contactWISEForm.setIsStudent(user);

			MutableUserDetails userDetails = 
					(MutableUserDetails) user.getUserDetails();

			contactWISEForm.setName(userDetails.getFirstname() + " " + 
					userDetails.getLastname());

			//if user is a teacher, retrieve their email
			/* NOTE: this check may be removed later if we never allow students
			   to submit feedback */
			if (userDetails instanceof TeacherUserDetails) {
				contactWISEForm.setEmail(userDetails.getEmailAddress());
			}
		}

		//tries to retrieve the project ID number from the request
		if (request.getParameter("projectId") != null) {
			Project project = projectService.getById(Long.parseLong(
					request.getParameter("projectId")));

			if (project != null) {
				//sets the project and project name
				contactWISEForm.setProjectName(
						project.getName());
				contactWISEForm.setProjectId(Long.parseLong(
						request.getParameter("projectId")));
			}
		}

		String runId = request.getParameter("runId");

		if (runId != null) {
			//set the run id into the object so we can access it later
			contactWISEForm.setRunId(new Long(runId));

			//get the run
			Run run = runService.retrieveById(new Long(runId));

			//get the owner of the run
			User owner = run.getOwner();
			//get the teacher name
			String teacherName = owner.getUserDetails().getFirstname() + " "+ owner.getUserDetails().getLastname();

			//set the teacher id
			contactWISEForm.setTeacherName(teacherName);
		}

		// these are necessary so that the enums can retrieve the values from the properties file
		IssueType.setProperties(i18nProperties);
		OperatingSystem.setProperties(i18nProperties);
		WebBrowser.setProperties(i18nProperties);

		modelMap.put("contactWISEForm", contactWISEForm);

		return "contact/contactwise"; 
	}
	
    /**
     * Set the issue types into the model
     * @return an array of IssueType objects that will be used to populate the
     * issue types drop down in the contact WISE form
     */
    @ModelAttribute("issuetypes")
    public IssueType[] populateIssueTypes() {
        return IssueType.values();
    }
    
    /**
     * Set the ReCaptcha public key
     * @return a string containing the ReCaptcha public key that will be used
     * to determine if we should display the ReCaptcha image on the bottom
     * of the form
     */
    @ModelAttribute("reCaptchaPublicKey")
    public String populateReCaptchaPublicKey() {
        return wiseProperties.getProperty("recaptcha_public_key");
    }
    
    /**
     * Set the ReCaptcha private key
     * @return a string containing the ReCaptcha private key that will be used
     * to determine if we should display the ReCaptcha image on the bottom
     * of the form
     */
    @ModelAttribute("reCaptchaPrivateKey")
    public String populateReCaptchaPrivateKey() {
        return wiseProperties.getProperty("recaptcha_private_key");
    }
    
    /**
     * Set the user object
     * @return a user object that will be used by the form
     */
    @ModelAttribute("user")
    public User populateUser() {
        return ControllerUtil.getSignedInUser();
    }
    
    /**
     * Set the WISE version
     * @return a string containing the WISE version
     */
    @ModelAttribute("wiseVersion")
    public Object populateWISEVersion() {
        return ControllerUtil.getWISEVersion();
    }
    
    /**
     * Set the teachers if the user is a student
     * @return a vector of teacher user objects that will be used to populate
     * the teacher drop down in the contact WISE form
     */
    @ModelAttribute("teachers")
    public Vector<User> populateTeachers() {
        //the vector to accumulate the teachers associated with the student
        Vector<User> teachers = new Vector<User>();

        // get the signed in user
        User user = ControllerUtil.getSignedInUser();
        
        if (user != null) {
            // get the user details
            MutableUserDetails userDetails = user.getUserDetails();
            
            //check that the user is a student
            if (userDetails != null && userDetails instanceof StudentUserDetails) {
                //get all the runs that this student is in
                List<Run> runList = runService.getRunList(user);
                Iterator<Run> runListIterator = runList.iterator();

                //loop through all the runs
                while (runListIterator.hasNext()) {
                    //get a run
                    Run tempRun = runListIterator.next();

                    //get the owner of the run
					User owner = tempRun.getOwner();
					//add the teacher to the list if they are not already in it
					if (!teachers.contains(owner)) {
						//the teacher is not in the list so we will add them
						teachers.add(owner);
					}
                }
            }
        }
        
        return teachers;
    }
    
    /**
     * Set the Discourse SSO login url
     * @return a string containing the Discourse SSO login url that will be
     * used to display a link to the Discourse page if the user is a teacher
     */
    @ModelAttribute("discourseSSOLoginURL")
    public String populateDiscourseSSOLoginURL() {
        String discourseSSOLoginURL = null;
        
        // get the signed in user
        User user = ControllerUtil.getSignedInUser();
        
        if (user != null) {
            
            MutableUserDetails userDetails = user.getUserDetails();
            
            // check that the user is a teacher
            if (userDetails != null && userDetails instanceof TeacherUserDetails) {
            // if discourse is enabled for this WISE instance, add the link to the model
            // so the view can display it
                String discourseURL = wiseProperties.getProperty("discourse_url");
                if (discourseURL != null && !discourseURL.isEmpty()) {
                    discourseSSOLoginURL = discourseURL + "/session/sso";
                }
            }
        }

        return discourseSSOLoginURL;
    }

	/**
	 * If the user is not logged in, we will check that they answered the reCaptcha correctly.
	 * This is called after ContactWISEValidator.validate()
	 */
    protected void checkRecaptcha(HttpServletRequest request, BindingResult result) {
        //get the signed in user or null if not signed in
        User user = ControllerUtil.getSignedInUser();

        if (user == null) {
            /*
             * the user is not signed in so we will display a reCaptcha if the server
             * has been set up with reCaptcha
             */

            //get the public and private keys from the wise.properties
            String reCaptchaPublicKey = wiseProperties.getProperty("recaptcha_public_key");
            String reCaptchaPrivateKey = wiseProperties.getProperty("recaptcha_private_key");

            //check if the public key is valid in case the admin entered it wrong
            boolean reCaptchaKeyValid = WISEAuthenticationProcessingFilter.isReCaptchaKeyValid(reCaptchaPublicKey, reCaptchaPrivateKey);
            
            if (reCaptchaKeyValid) {
                
                // get the google reCaptcha response
                String gRecaptchaResponse = request.getParameter("g-recaptcha-response");
                
                //check if the response is valid
                boolean isResponseValid = WISEAuthenticationProcessingFilter.checkReCaptchaResponse(reCaptchaPrivateKey, reCaptchaPublicKey, gRecaptchaResponse);
                
                if (!isResponseValid) {
                    // the reCaptcha failed so we will display an error
                    
                    String reCaptchaError = "";

                    if (i18nProperties != null) {
                        //get the invalid reCaptcha message
                        reCaptchaError = i18nProperties.getProperty("error.contactwise-recaptcha");
                    }

                    //if the error.contactwise-recaptcha key is not in the properties, the value will be null
                    if (reCaptchaError == null) {
                        reCaptchaError = "";
                    }

                    //create the error so that the form is not submitted and the message is displayed
                    result.reject("400", reCaptchaError);
                }
            }
        }
    }

	public String[] getMailRecipients() {
		String[] recipients = new String[0];

		//get the email address that we will send this user request to
		String contactEmail = wiseProperties.getProperty("contact_email");
		recipients = contactEmail.split(",");

		if (recipients.length == 0) {
			/*
			 * we did not have an email address for the issue type so we will try
			 * to use the uber_admin email address
			 */

			//get the uber_admin email address
			String uberAdminEmailAddress = wiseProperties.getProperty("uber_admin");

			if (uberAdminEmailAddress != null && !uberAdminEmailAddress.equals("")) {
				//set the uber_admin email address into the recipients
				recipients = uberAdminEmailAddress.split(",");
			}
		}

		return recipients;
	}

	/*
	 * Returns a string array of emails to be cc'd
	 */
	public String[] getMailCcs(ContactWISEForm contactWISEForm) {
		//get the email to cc
		String emailToCC = contactWISEForm.getEmail();

		String[] cc = {};
		List<String> list = new ArrayList<String>();

		if (emailToCC != null) {
			//add the email to cc to the list
			list.add(emailToCC);
		}

		/*
		 * get the teacher id. this is only used when a student is making
		 * a contact request. when a teacher is making a contact request,
		 * getTeacherId() will return null and the teacher's email will 
		 * already have been added just above this.
		 */
		Long tempTeacherId = contactWISEForm.getTeacherId();

		//get the teacher email
		String teacherEmail = getTeacherEmail(tempTeacherId);

		if (teacherEmail != null) {
			//add the teacher email to the list of emails to cc
			list.add(teacherEmail);
		}

		//get the list as a String[]
		return list.toArray(cc);
	}

	/**
	 * Get the teacher email address
	 * @param userId the teacher user id
	 * @return the teacher email address or null if no user id
	 * is provided or a user is not found
	 */
	protected String getTeacherEmail(Long userId) {
		String email = null;

		if (userId != null) {
			try {
				//get the user
				User user = userService.retrieveById(userId);

				if (user != null) {
					//get the user details
					MutableUserDetails userDetails = user.getUserDetails();

					//get the email address of the user
					email = userDetails.getEmailAddress();
				}
			} catch (ObjectNotFoundException e) {
				e.printStackTrace();
			}
		}

		return email;
	}

	/**
	 * Get the teacher name
	 * @param contactWISEForm the teacher user id
	 * @return the teacher name or null
	 */
	protected void getTeacherNameAndSetInForm(ContactWISEForm contactWISEForm) {
		String name = null;

		if (contactWISEForm.getTeacherId() != null) {
			try {
				//get the user
				User user = userService.retrieveById(contactWISEForm.getTeacherId());

				if (user != null) {
					//get the user details
					MutableUserDetails userDetails = user.getUserDetails();

					if (userDetails instanceof TeacherUserDetails) {
						//get the first and last name of the teacher
						String firstName = ((TeacherUserDetails) userDetails).getFirstname();
						String lastName = ((TeacherUserDetails) userDetails).getLastname();
						name = firstName + " " + lastName;
					}
				}
			} catch (ObjectNotFoundException e) {
				e.printStackTrace();
			}
		}
		contactWISEForm.setTeacherName(name);
	}
}