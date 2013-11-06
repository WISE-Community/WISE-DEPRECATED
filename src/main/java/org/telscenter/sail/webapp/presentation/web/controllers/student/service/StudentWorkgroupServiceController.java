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
package org.telscenter.sail.webapp.presentation.web.controllers.student.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.impl.OfferingNameVisitor;
import net.sf.sail.webapp.service.workgroup.WorkgroupService;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.workgroup.WISEWorkgroup;
import org.telscenter.sail.webapp.service.workgroup.WISEWorkgroupService;

/**
 * Provides services for Student Workgroup information.
 * 
 * @author hirokiterashima
 * @version $Id:$
 */
public class StudentWorkgroupServiceController extends AbstractController {

	private static final String WORKGROUP_ID_PARAM = "workgroupId";
	
	private WISEWorkgroupService workgroupService;

	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		
		return printAllWorkgroups(request, response);
	}
	
	/**
	 * Prints xml info of all of the workgroups that the users in the specified workgroup is in.
	 * @param request
	 * @param response
	 * @return
	 * @throws ObjectNotFoundException 
	 * @throws NumberFormatException 
	 * @throws IOException 
	 */
	private ModelAndView printAllWorkgroups(HttpServletRequest request,
			HttpServletResponse response) throws NumberFormatException, ObjectNotFoundException, IOException {
		
		// get the specified workgroup.
		String workgroupId = request.getParameter(WORKGROUP_ID_PARAM);
		Workgroup workgroup = workgroupService.retrieveById(new Long(workgroupId));
		
		// get all of the workgroups that the members of the specified workgroup is in.
		// use Set so that we don't print same workgroup twice.
		Set<User> members = workgroup.getMembers();
		Set<Workgroup> allWorkgroups = new HashSet<Workgroup>();
		for (User member : members) {
			allWorkgroups.addAll(workgroupService.getWorkgroupsForUser(member));
		}
		
		// now print the xml.
		String xmlSoFar = "<workgroups>";
		for (Workgroup thisWorkgroup : allWorkgroups) {
			xmlSoFar += "<workgroup>";
			xmlSoFar += "<id>"+ thisWorkgroup.getId() +"</id>";
			xmlSoFar += "<members>"+ thisWorkgroup.generateWorkgroupName() +"</members>";
			xmlSoFar += "<runName>"+ thisWorkgroup.getOffering().accept(new OfferingNameVisitor()) + "</runName>";
			xmlSoFar += "</workgroup>";
		}
		xmlSoFar += "</workgroups>";
		
		response.setHeader("Cache-Control", "no-cache");
		response.setHeader("Pragma", "no-cache");
		response.setDateHeader ("Expires", 0);
		
		response.setContentType("text/xml");
		response.getWriter().print(xmlSoFar);
		return null;
	}

	/**
	 * @param workgroupService the workgroupService to set
	 */
	@Required
	public void setWorkgroupService(WISEWorkgroupService workgroupService) {
		this.workgroupService = workgroupService;
	}

}
