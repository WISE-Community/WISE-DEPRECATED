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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.impl.CurnitGetCurnitUrlVisitor;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.domain.project.FamilyTag;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.service.project.ProjectService;

/**
 * Controller for listing the Preview-able projects in the preview projects
 * page.
 * 
 * @author Hiroki Terashima
 * @version $Id$
 */
public class PreviewProjectListController extends AbstractController {

	private ProjectService projectService;
	
	// path to project thumb image relative to project folder
	private static final String PROJECT_THUMB_PATH = "/assets/project_thumb.png";
	
	private Properties portalProperties;

	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		 Set<String> tagNames = new TreeSet<String>();
		 tagNames.add("library");
		 tagNames.add("public");
		 List<Project> projectList = this.projectService.getProjectListByTagNames(tagNames);

		 // List<Project> projectList = this.projectService.getProjectListByTag(FamilyTag.TELS);
		 List<Project> currentProjectList = new ArrayList<Project>();
		 for (Project p: projectList) {
			 if (p.isCurrent())
				 currentProjectList.add(p);
		 }
		 
		 Map<Long,String> projectThumbMap = new TreeMap<Long,String>();  // maps projectId to url where its thumbnail can be found
		 String curriculumBaseWWW = this.portalProperties.getProperty("curriculum_base_www");
			for (Project p: currentProjectList) {
				if (p.isCurrent()){
					String url = (String) p.getCurnit().accept(new CurnitGetCurnitUrlVisitor());

					if(url != null && url != ""){
						
						int ndx = url.lastIndexOf("/");
						if(ndx != -1){
							/*
							 * add project thumb url to projectThumbMap. for now this is the same (/assets/project_thumb.png)
							 * for all projects but this could be overwritten in the future
							 * e.g.
							 * /253/assets/projectThumb.png
							 */
							projectThumbMap.put((Long) p.getId(), curriculumBaseWWW + url.substring(0, ndx) + PROJECT_THUMB_PATH);
						}
					}
				}
			}
			
		 ModelAndView modelAndView = new ModelAndView("preview/previewprojectlist");
	     modelAndView.addObject("projectList", currentProjectList);
	     modelAndView.addObject("projectThumbMap", projectThumbMap);
		 return modelAndView;
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
