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
package org.wise.portal.domain.general.contactwise.impl;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import org.springframework.beans.factory.annotation.Autowired;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.general.contactwise.IssueType;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.user.UserService;

/**
 * @author Hiroki Terashima
 */
public class ContactWISEForm implements Serializable {
	
	private static final long serialVersionUID = 1L;
	
	protected IssueType issuetype;
	
	protected String name;
	
	protected String email;
	
	private Long teacherId;
	
	private String teacherName;

	protected String summary;
	
	protected String description;
	
	private Boolean isStudent = false;
	
	protected String usersystem;
	
	private String projectName;
	
	private Long projectId;
	
	private Long runId;
	
	private String operatingSystemName;
	
	private String operatingSystemVersion;
	
	private String browserName;
	
	private String browserVersion;
	
    /**
	 * @see org.wise.portal.domain.general.contactwise.ContactWISE#getDescription()
	 */
	public String getDescription() {
		return description;
	}

	/**
	 * @see org.wise.portal.domain.general.contactwise.ContactWISE#getEmail()
	 */
	public String getEmail() {
		return email;
	}

	/**
	 * @return the teacherId
	 */
	public Long getTeacherId() {
		return teacherId;
	}

	/**
	 * @param teacherId the teacherId to set
	 */
	public void setTeacherId(Long teacherId) {
		this.teacherId = teacherId;
	}

	/**
	 * @see org.wise.portal.domain.general.contactwise.ContactWISE#getIssueType()
	 */
	public IssueType getIssuetype() {
		return issuetype;
	}

	/**
	 * @see org.wise.portal.domain.general.contactwise.ContactWISE#getName()
	 */
	public String getName() {
		return name;
	}

	/**
	 * @see org.wise.portal.domain.general.contactwise.ContactWISE#getSummary()
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
	 * @return the teacherName
	 */
	public String getTeacherName() {
		return teacherName;
	}

	/**
	 * @param teacherName the teacherName to set
	 */
	public void setTeacherName(String teacherName) {
		this.teacherName = teacherName;
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
	
	public String getMailSubject() {
		String subject = "[Contact WISE] " + issuetype + ": " + summary;
		
		return subject;
	}
	
	public String getMailMessage() {
		StringBuffer message = new StringBuffer();
		
		if(getIsStudent()) {
			//a student is submitting this contact form and we are cc'ing their teacher
			message.append("Dear " + getTeacherName() + ",");
			message.append("\n\n");
			message.append("One of your students has submitted a WISE trouble ticket.\n\n");
		}
		
		message.append("Contact WISE Project Request\n");
		message.append("=================\n");
		message.append("Name: " + name + "\n");
		
		/*
		 * do not display the Email line if email is null or blank.
		 * this variable will be null if the user is a student.
		 */
		if(email != null && !email.equals("")) {
			message.append("Email: " + email + "\n");			
		}
		
		message.append("Project Name: " + projectName + "\n");
		message.append("Project ID: " + projectId + "\n");
		
		//display the run id if it is not null
		if(runId != null) {
			message.append("Run ID: " + runId + "\n");
		}
		
		message.append("Issue Type: " + issuetype + "\n");
		message.append("Summary: " + summary + "\n");
		message.append("Description: " + description + "\n");
		
		// get the operating system name and version
		
		String operatingSystem = "";
		
		if (this.operatingSystemName != null) {
		    operatingSystem = this.operatingSystemName;
		}
		
		if (this.operatingSystemVersion != null) {
		    operatingSystem += " " + this.operatingSystemVersion;
		}
		
		if (operatingSystem != null && !operatingSystem.equals("")) {
		    message.append("Operating System: " + operatingSystem + "\n");
		}
		
		// get the browser name and version
		
		String browser = "";
		
		if (this.browserName != null) {
		    browser = this.browserName;
		}
		
		if (this.browserVersion != null) {
		    browser += " " + this.browserVersion;
		}

		if (browser != null && !browser.equals("")) {
		    message.append("Browser: " + browser + "\n");
		}
		
		message.append("User System: " + usersystem + "\n");
		
		if(getIsStudent()) {
			//a student is submitting this contact form and we are cc'ing their teacher
			message.append("\nWe recommend that you follow up with your student if necessary. If you need further assistance, you can 'Reply to all' on this email to contact us.");
		}
		
		return message.toString();
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

	/**
	 * @return the projectName
	 */
	public String getProjectName() {
		return projectName;
	}

	/**
	 * @param projectName the projectName to set
	 */
	public void setProjectName(String projectName) {
		this.projectName = projectName;
	}

	/**
	 * @return the projectId
	 */
	public Long getProjectId() {
		return projectId;
	}

	/**
	 * @param projectId the projectId to set
	 */
	public void setProjectId(Long projectId) {
		this.projectId = projectId;
	}
	
	/**
	 * @return the run id
	 */
	public Long getRunId() {
		return runId;
	}

	/**
	 * @param runId the run id
	 */
	public void setRunId(Long runId) {
		this.runId = runId;
	}

	public String getOperatingSystemName() {
	    return operatingSystemName;
	}

	public void setOperatingSystemName(String operatingSystemName) {
	    this.operatingSystemName = operatingSystemName;
	}

	public String getOperatingSystemVersion() {
	    return operatingSystemVersion;
	}

	public void setOperatingSystemVersion(String operatingSystemVersion) {
	    this.operatingSystemVersion = operatingSystemVersion;
	}

	public String getBrowserName() {
	    return browserName;
	}

	public void setBrowserName(String browserName) {
	    this.browserName = browserName;
	}

	public String getBrowserVersion() {
	    return browserVersion;
	}

	public void setBrowserVersion(String browserVersion) {
	    this.browserVersion = browserVersion;
	}
}
