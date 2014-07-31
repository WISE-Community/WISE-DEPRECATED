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
package org.wise.portal.presentation.web.controllers;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.wise.portal.domain.module.impl.CurnitGetCurnitUrlVisitor;
import org.wise.portal.domain.project.Project;
import org.wise.portal.service.project.ProjectService;

/**
 * Controller for listing the Preview-able projects in the preview projects
 * page.
 * 
 * @author Hiroki Terashima
 * @version $Id$
 */
@Controller
@RequestMapping("/previewprojectlist.html")
public class PreviewProjectListController {

	@Autowired
	private ProjectService projectService;
	
	@Autowired
	private Properties wiseProperties;

	// path to project thumb image relative to project folder
	private static final String PROJECT_THUMB_PATH = "/assets/project_thumb.png";

	@RequestMapping(method=RequestMethod.GET)
	protected String handleGET(
			HttpServletRequest request,
			HttpServletResponse response,
			ModelMap modelMap) throws Exception {
		 List<Project> projectList = this.projectService.getPublicLibraryProjectList();

		 List<Project> currentProjectList = new ArrayList<Project>();
		 for (Project p: projectList) {
			 if (p.isCurrent())
				 currentProjectList.add(p);
		 }
		 
		 Map<Long,String> projectThumbMap = new TreeMap<Long,String>();  // maps projectId to url where its thumbnail can be found
		 String curriculumBaseWWW = this.wiseProperties.getProperty("curriculum_base_www");
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
			
		 modelMap.put("projectList", currentProjectList);
	     modelMap.put("projectThumbMap", projectThumbMap);
		 return "preview/previewprojectlist";
	}
}
