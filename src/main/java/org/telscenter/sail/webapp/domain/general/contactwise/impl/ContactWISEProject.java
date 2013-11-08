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


/**
 * @author Hiroki Terashima
 *
 * @version $Id: ContactWISEGeneral.java 1651 2008-01-28 20:13:43Z geoff $
 */
public class ContactWISEProject extends ContactWISEGeneral {
	
	private static final long serialVersionUID = 1L;
	
	private String projectName;
	
	private Long projectId;
	
	private Long runId;
	
	public String getMailSubject() {
		String subject = "[Contact WISE Project] " + issuetype + ": " + summary;
		
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
		message.append("User System: " + usersystem + "\n");
		
		if(getIsStudent()) {
			//a student is submitting this contact form and we are cc'ing their teacher
			message.append("\nWe recommend that you follow up with your student if necessary. If you need further assistance, you can 'Reply to all' on this email to contact us.");
		}
		
		return message.toString();
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
}
