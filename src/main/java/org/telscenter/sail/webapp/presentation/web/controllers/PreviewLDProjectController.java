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
package org.telscenter.sail.webapp.presentation.web.controllers;

import java.util.Properties;
import java.util.Set;
import java.util.TreeSet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.CurnitGetCurnitUrlVisitor;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.springframework.web.servlet.view.RedirectView;
import org.telscenter.sail.webapp.domain.project.FamilyTag;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.service.project.ProjectService;

/**
 * Controller for handling student VLE-portal interactions for Preview Mode
 * 
 * @author hirokiterashima
 * @version $Id: StudentVLEController.java 2414 2009-07-24 18:34:41Z geoffreykwan $
 */
public class PreviewLDProjectController extends AbstractController {

	ProjectService projectService;
	
	Properties portalProperties;
	
	/** 
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		User user = ControllerUtil.getSignedInUser();
		String projectId = request.getParameter("projectId");
		Project project = this.projectService.getById(Long.parseLong(projectId));
		Set<String> tagNames = new TreeSet<String>();
		tagNames.add("library");
		String step = request.getParameter("step");

		if(projectId != null && project != null){
			if(project.hasTags(tagNames) || 
					project.getFamilytag().equals(FamilyTag.TELS) || this.projectService.canReadProject(project, user)){
				String portalurl = ControllerUtil.getBaseUrlString(request);
				String vleConfigUrl = portalurl + "/webapp/request/info.html" + "?projectId=" + request.getParameter("projectId") + "&action=getVLEConfig&requester=portalpreview";

				if(step != null) {
					//this is set if the request is to preview the project and load a specific step such as 1.2
					vleConfigUrl += "&step=" + step;
				}
				
				String isConstraintsDisabledStr = request.getParameter("isConstraintsDisabled");
				if (isConstraintsDisabledStr != null && Boolean.parseBoolean(isConstraintsDisabledStr)) {
					vleConfigUrl += "&isConstraintsDisabled=true";
				}

				/* if preview request is coming from the run, we want to pass along the version id when we make a request to get the config */
				String versionId = request.getParameter("versionId");
				if(versionId != null && !versionId.equals("")){
					vleConfigUrl += "&versionId=" + versionId;
				}
				
				//get the path to the project json file
				String curriculumBaseWWW = portalProperties.getProperty("curriculum_base_www");
				String rawProjectUrl = (String) project.getCurnit().accept(new CurnitGetCurnitUrlVisitor());
				String contentUrl = curriculumBaseWWW + rawProjectUrl;
				
				String vleurl = portalurl + "/vlewrapper/vle/vle.html";
		
				ModelAndView modelAndView = new ModelAndView("preview/preview");
		    	modelAndView.addObject("vleurl",vleurl);
		    	modelAndView.addObject("vleConfigUrl", vleConfigUrl);
		    	modelAndView.addObject("contentUrl", contentUrl);
		    	
				return modelAndView;
			} else {
				return new ModelAndView(new RedirectView("../accessdenied.html"));
			}
		} else {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Could not determine project to preview.");
			return null;
		}
	}

	/**
	 * @param projectService the projectService to set
	 */
	public void setProjectService(ProjectService projectService) {
		this.projectService = projectService;
	}
	
	/**
	 * @param portalProperties the portalProperties to set
	 */
	public void setPortalProperties(Properties portalProperties) {
		this.portalProperties = portalProperties;
	}
}
