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
package org.wise.portal.presentation.web.controllers;

import java.util.ArrayList;
import java.util.Calendar;
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
import org.wise.portal.domain.newsitem.NewsItem;
import org.wise.portal.domain.newsitem.impl.NewsItemImpl;
import org.wise.portal.domain.project.Project;
import org.wise.portal.service.newsitem.NewsItemService;
import org.wise.portal.service.project.ProjectService;

/**
 * Controller for index pages in TELS
 *
 * @author Hiroki Terashima
 * @version $Id$
 */
@Controller
@RequestMapping("/index.html")
public class IndexController {

	@Autowired
	private NewsItemService newsItemService;
	
	@Autowired
	private ProjectService projectService;
	
	@Autowired
	private Properties wiseProperties;

	// path to project thumb image relative to project folder
	private static final String PROJECT_THUMB_PATH = "/assets/project_thumb.png";

	/** 
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@RequestMapping(method=RequestMethod.GET)
	protected String handleGET(
			HttpServletRequest request,
			HttpServletResponse response,
			ModelMap modelMap) throws Exception {
		
		List<NewsItem> newsItems = newsItemService.retrieveAllNewsItem();
		
		if (newsItems.size() == 0) {
			NewsItem newsItem = new NewsItemImpl();
			newsItem.setDate(Calendar.getInstance().getTime());
			newsItem.setTitle("No News found - default News Title");
			newsItem.setNews("This will be filled with the latest news " +
					"once News Items are created. This can be done by your " +
					"administrator or other helpful WISE personnel.");
			newsItems.add(newsItem);
		}
		
		Map<Long,String> projectThumbMap = new TreeMap<Long,String>();  // maps projectId to url where its thumbnail can be found
		
		// get library projects
		List<Project> libraryProjectsList = this.projectService.getPublicLibraryProjectList();
		
		// divide library projects by subject area
		List<Project> esProjects = new ArrayList<Project>();
		List<Project> lsProjects = new ArrayList<Project>();
		List<Project> psProjects = new ArrayList<Project>();
		List<Project> bioProjects = new ArrayList<Project>();
		List<Project> chemProjects = new ArrayList<Project>();
		List<Project> physProjects = new ArrayList<Project>();
		
		for (Project p: libraryProjectsList) {
			String subject = p.getMetadata().getSubject();
			if (subject != null) {
			    if (subject.equals("Earth Science")){
				esProjects.add(p);
			    } else if (subject.equals("Life Science")){
				lsProjects.add(p);
			    } else if (subject.equals("Physical Science")){
				psProjects.add(p);
			    } else if (subject.equals("Biology")){
				bioProjects.add(p);
			    } else if (subject.equals("Chemistry")){
				chemProjects.add(p);
			    } else if (subject.equals("Physics")){
				physProjects.add(p);
			    }
			}
		}
		
		
		// TODO: remove hard-coded subjects in future - automate
		//List<String> subjects = new ArrayList<String>();
		//List<ArrayList> libProjects = new ArrayList<ArrayList>();
		
		/*for (Project p: libraryProjectsList) {
			String subject = p.getMetadata().getSubject();
			if(!subjects.contains(subject)){
				subjects.add(subject);
			}
		}
		
		for (int i = 0; i < subjects.size(); i++){
			libProjects.add(new ArrayList<Project>());
		}
		
		for (Project p: libraryProjectsList) {
			String subject = p.getMetadata().getSubject();
			for (String s: subjects){
				if (subject.equals(s)){
					int index = subjects.indexOf(s);
					libProjects.get(index).add(p);
				}
			}
			
		}*/
		
		String curriculumBaseWWW = this.wiseProperties.getProperty("curriculum_base_www");
		for (Project p: libraryProjectsList) {
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

        modelMap.put("newsItems", newsItems);
        modelMap.put("esProjects", esProjects);
        modelMap.put("lsProjects", lsProjects);
        modelMap.put("psProjects", psProjects);
        modelMap.put("bioProjects", bioProjects);
        modelMap.put("chemProjects", chemProjects);
        modelMap.put("physProjects", physProjects);
        //modelMap.put("subjects", subjects);
        //modelMap.put("libProjects", libProjects);
        modelMap.put("projectThumbMap", projectThumbMap);
        return "index";
	}
}
