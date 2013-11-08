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
package org.telscenter.sail.webapp.domain.run;


import javax.servlet.http.HttpServletRequest;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.domain.webservice.http.HttpRestTransport;

import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.project.ExternalProject;
import org.telscenter.sail.webapp.domain.project.impl.ProjectType;
import org.telscenter.sail.webapp.domain.project.impl.ProjectTypeVisitor;
import org.telscenter.sail.webapp.domain.workgroup.WISEWorkgroup;
import org.telscenter.sail.webapp.service.workgroup.WISEWorkgroupService;
import org.telscenter.sail.webapp.domain.authentication.impl.TeacherUserDetails;

/**
 * Stores information about a WISE student on a particular
 * <code>Run</code>:
 * * <code>User</code> student user. Must not be null
 * * <code>Run</code> which Run the student is in. Must not be null
 * * <code>Workgroup</code> which workgroup the student is in for
 *     this run. Can be null, if student is not in a workgroup yet
 *     for this run
 * * <code>Group</code> which period the student is in for this
 *     run. Must not be null
 *
 * @author Hiroki Terashima
 * @version $Id$
 */
public class StudentRunInfo implements Comparable<StudentRunInfo>{

	private User studentUser;
	
	private Run run;
	
	private Workgroup workgroup;
	
	private Group group;
	
	private String startProjectUrl;

	/**
	 * @return the studentUser
	 */
	public User getStudentUser() {
		return studentUser;
	}

	/**
	 * @param studentUser the studentUser to set
	 */
	public void setStudentUser(User studentUser) {
		this.studentUser = studentUser;
	}
	
	/**
	 * @return the run
	 */
	public Run getRun() {
		return run;
	}

	/**
	 * @param run the run to set
	 */
	public void setRun(Run run) {
		this.run = run;
	}

	/**
	 * @return the workgroup
	 */
	public Workgroup getWorkgroup() {
		return workgroup;
	}

	/**
	 * @param workgroup the workgroup to set
	 */
	public void setWorkgroup(Workgroup workgroup) {
		this.workgroup = workgroup;
	}

	/**
	 * @return the group
	 */
	public Group getGroup() {
		return group;
	}

	/**
	 * @param group the group to set
	 */
	public void setGroup(Group group) {
		this.group = group;
	}

	/**
	 * @return the startProjectUrl
	 */
	public String getStartProjectUrl() {
		return startProjectUrl;
	}

	/**
	 * @param startProjectUrl the startProjectUrl to set
	 */
	public void setStartProjectUrl(String startProjectUrl) {
		this.startProjectUrl = startProjectUrl;
	}
	
	public int compareTo(StudentRunInfo o){
		TeacherUserDetails bestDetails = (TeacherUserDetails) this.run.getOwners().iterator().next().getUserDetails();
		TeacherUserDetails incomingDetails = (TeacherUserDetails) o.run.getOwners().iterator().next().getUserDetails();
		
		if(!bestDetails.getLastname().equals(incomingDetails.getLastname())){
			return bestDetails.getLastname().compareTo(incomingDetails.getLastname());
		} else if(!bestDetails.getFirstname().equals(incomingDetails.getFirstname())){
			return bestDetails.getFirstname().compareTo(incomingDetails.getFirstname());
		} else {
			if (this.run.getName() == null || o.run.getName() == null) {
				return 0;
			} else {
				return this.run.getName().compareTo(o.run.getName());				
			}
		}
	}

	/* 
	 * if student is in a workgroup for this run, get the url
	 * that will be used to start the project and set the url where
	 * the workgroup's work can be retrieved as PDF
	 */
	public void setWorkPDFUrl(WISEWorkgroupService workgroupService, 
			HttpRestTransport httpRestTransport, HttpServletRequest request) {
		ProjectTypeVisitor typeVisitor = new ProjectTypeVisitor();
		String result = (String) run.getProject().accept(typeVisitor);
		if (this.getWorkgroup() != null && !(result.equals("ExternalProject")) && run.getProject().getProjectType()!=ProjectType.ROLOO && run.getProject().getProjectType()!=ProjectType.LD) {
			String workPdfUrl = workgroupService
		        .generateWorkgroupWorkPdfUrlString(httpRestTransport, request, (WISEWorkgroup) workgroup);
			
		    ((WISEWorkgroup) workgroup).setWorkPDFUrl(workPdfUrl);
		}
	}

}
