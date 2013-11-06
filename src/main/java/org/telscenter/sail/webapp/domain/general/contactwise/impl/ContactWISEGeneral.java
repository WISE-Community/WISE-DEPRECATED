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
package org.telscenter.sail.webapp.domain.general.contactwise.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.authentication.MutableUserDetails;
import net.sf.sail.webapp.service.UserService;

import org.telscenter.sail.webapp.domain.authentication.impl.StudentUserDetails;
import org.telscenter.sail.webapp.domain.authentication.impl.TeacherUserDetails;
import org.telscenter.sail.webapp.domain.general.contactwise.ContactWISE;
import org.telscenter.sail.webapp.domain.general.contactwise.IssueType;

/**
 * @author Hiroki Terashima
 *
 * @version $Id$
 */
public class ContactWISEGeneral implements ContactWISE {

	private static final long serialVersionUID = 1L;

	protected IssueType issuetype;
	
	protected String name;
	
	protected String email;
	
	private Long teacherId;

	protected String summary;
	
	protected String description;
	
	private static Properties emaillisteners;
	
	private User user;
	
	private Boolean isStudent = false;
	
	protected String usersystem;
	
	private static UserService userService;

	/**
	 * @param properties the properties to set
	 */
	public void setEmaillisteners(Properties emaillisteners) {
		this.emaillisteners = emaillisteners;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.general.contactwise.ContactWISE#getDescription()
	 */
	public String getDescription() {
		return description;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.general.contactwise.ContactWISE#getEmail()
	 */
	public String getEmail() {
		return email;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.general.contactwise.ContactWISE#getIssueType()
	 */
	public IssueType getIssuetype() {
		return issuetype;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.general.contactwise.ContactWISE#getName()
	 */
	public String getName() {
		return name;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.general.contactwise.ContactWISE#getSummary()
	 */
	public String getSummary() {
		return summary;
	}

	/**
	 * @param issueType the issueType to set
	 */
	public void setIssuetype(IssueType issuetype) {
		this.issuetype = issuetype;
	}

	/**
	 * @param name the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 * @param email the email to set
	 */
	public void setEmail(String email) {
		this.email = email;
	}

	/**
	 * @param summary the summary to set
	 */
	public void setSummary(String summary) {
		this.summary = summary;
	}

	/**
	 * @param description the description to set
	 */
	public void setDescription(String description) {
		this.description = description;
	}

	public String[] getMailRecipients() {
		String[] recipients = new String[0];
		
		//get the email address that we will send this user request to
		String contactEmail = emaillisteners.getProperty("contact_email");
		recipients = contactEmail.split(",");
		
		if(recipients.length == 0) {
			/*
			 * we did not have an email address for the issue type so we will try
			 * to use the uber_admin email address
			 */
			
			//get the uber_admin email address
			String uberAdminEmailAddress = emaillisteners.getProperty("uber_admin");
			
			if(uberAdminEmailAddress != null && !uberAdminEmailAddress.equals("")) {
				//set the uber_admin email address into the recipients
				recipients = uberAdminEmailAddress.split(",");
			}
		}
				
		return recipients;
	}
	
	/*
	 * Returns a string array of emails to be cc'd
	 */
	public String[] getMailCcs() {
		//get the email to cc
		String emailToCC = getEmail();
		
		String[] cc = {};
		List<String> list = new ArrayList<String>();
		
		if(emailToCC != null) {
			//add the email to cc to the list
			list.add(emailToCC);
		}
		
		/*
		 * get the teacher id. this is only used when a student is making
		 * a contact request. when a teacher is making a contact request,
		 * getTeacherId() will return null and the teacher's email will 
		 * already have been added just above this.
		 */
		Long tempTeacherId = getTeacherId();
		
		//get the teacher email
		String teacherEmail = getTeacherEmail(tempTeacherId);
		
		if(teacherEmail != null) {
			//add the teacher email to the list of emails to cc
			list.add(teacherEmail);
		}
		
		//get the list as a String[]
		return list.toArray(cc);
	}
	
	public String getMailSubject() {
		String subject = "[Contact WISE General] " + issuetype + ": " + summary;
		
		return subject;
	}
	
	public String getMailMessage() {
		StringBuffer message = new StringBuffer();
		
		if(getIsStudent()) {
			//a student is submitting this contact form and we are cc'ing their teacher
			message.append("Dear " + getTeacherName(getTeacherId()) + ",");
			message.append("\n\n");
			message.append("One of your students has submitted a WISE trouble ticket.\n\n");
		}
		
		message.append("Contact WISE General Request\n");
		message.append("=================\n");
		message.append("Name: " + name + "\n");
		
		/*
		 * do not display the Email line if email is null or blank.
		 * this variable will be null if the user is a student.
		 */
		if(email != null && !email.equals("")) {
			message.append("Email: " + email + "\n");
		}
		
		message.append("Issue Type: " + issuetype + "\n");
		message.append("Summary: " + summary + "\n");
		message.append("Description: " + description + "\n");
		message.append("User System: " + usersystem + "\n");
		
		if(getIsStudent()) {
			//a student is submitting this contact form and we are cc'ing their teacher
			message.append("\nWe recommend that you follow up with your student if necessary. If you need further assistance, you can 'Reply to all' on this email to contact us.");
		}
		
		return message.toString();
	}
	
	/**
	 * Get the teacher email address
	 * @param userId the teacher user id
	 * @return the teacher email address or null if no user id
	 * is provided or a user is not found
	 */
	protected String getTeacherEmail(Long userId) {
		String email = null;
		
		if(userId != null) {
			try {
				//get the user
				User user = getUserService().retrieveById(userId);
				
				if(user != null) {
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
	 * @param userId the teacher user id
	 * @return the teacher name or null
	 */
	protected String getTeacherName(Long userId) {
		String name = null;
		
		if(userId != null) {
			try {
				//get the user
				User user = getUserService().retrieveById(userId);
				
				if(user != null) {
					//get the user details
					MutableUserDetails userDetails = user.getUserDetails();
					
					if(userDetails instanceof TeacherUserDetails) {
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
		
		return name;
	}
	
	public void setIsStudent(Boolean isStudent) {
		this.isStudent = isStudent;
	}

	public void setIsStudent(User user) {
		if(user != null && user.getUserDetails() instanceof StudentUserDetails) {
			isStudent = true;
		}
	}
	
	public Boolean getIsStudent() {
		return isStudent;
	}
	

	/**
	 * @return the usersystem
	 */
	public String getUsersystem() {
		return usersystem;
	}

	/**
	 * @param usersystem the usersystem to set
	 */
	public void setUsersystem(String usersystem) {
		this.usersystem = usersystem;
	}

	public Long getTeacherId() {
		return teacherId;
	}

	public void setTeacherId(Long teacherId) {
		this.teacherId = teacherId;
	}
	
	public UserService getUserService() {
		return userService;
	}

	public void setUserService(UserService userService) {
		this.userService = userService;
	}
}
