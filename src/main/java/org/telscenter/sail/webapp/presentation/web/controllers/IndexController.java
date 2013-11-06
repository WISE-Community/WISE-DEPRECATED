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
package org.telscenter.sail.webapp.presentation.web.controllers;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.impl.CurnitGetCurnitUrlVisitor;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.domain.newsitem.NewsItem;
import org.telscenter.sail.webapp.domain.newsitem.impl.NewsItemImpl;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.service.newsitem.NewsItemService;
import org.telscenter.sail.webapp.service.project.ProjectService;

/**
 * Controller for index pages in TELS
 *
 * @author Hiroki Terashima
 * @version $Id$
 */
public class IndexController extends AbstractController {
	
	private NewsItemService newsItemService;
	
	// path to project thumb image relative to project folder
	private static final String PROJECT_THUMB_PATH = "/assets/project_thumb.png";
	
	private ProjectService projectService;
	
	private Properties portalProperties;
	
	/** 
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@SuppressWarnings("unchecked")
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest arg0,
			HttpServletResponse arg1) throws Exception {
		
		Set<NewsItem> newsItems = null;
		NewsItem newsItem;
		try{
			newsItem = newsItemService.retrieveLatest();
			newsItems = newsItemService.retrieveAllNewsItem();
		} catch (ObjectNotFoundException e){
			if(newsItems != null) {
				newsItem = new NewsItemImpl();
				newsItem.setDate(Calendar.getInstance().getTime());
				newsItem.setTitle("No News found - default News Title");
				newsItem.setNews("This will be filled with the latest news " +
						"once News Items are created. This can be done by your " +
						"administrator or other helpful WISE personnel.");
				newsItems.add(newsItem);
			}
		}
		
		Map<Long,String> projectThumbMap = new TreeMap<Long,String>();  // maps projectId to url where its thumbnail can be found
		
		// get library projects
		Set<String> tagNames = new TreeSet<String>();
		tagNames.add("library");
		tagNames.add("public");
		List<Project> libraryProjectsList = this.projectService.getProjectListByTagNames(tagNames);
		
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
		
		String curriculumBaseWWW = this.portalProperties.getProperty("curriculum_base_www");
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

        ModelAndView modelAndView = new ModelAndView();
        modelAndView.addObject("newsItems", newsItems);
        modelAndView.addObject("esProjects", esProjects);
        modelAndView.addObject("lsProjects", lsProjects);
        modelAndView.addObject("psProjects", psProjects);
        modelAndView.addObject("bioProjects", bioProjects);
        modelAndView.addObject("chemProjects", chemProjects);
        modelAndView.addObject("physProjects", physProjects);
        //modelAndView.addObject("subjects", subjects);
        //modelAndView.addObject("libProjects", libProjects);
        modelAndView.addObject("projectThumbMap", projectThumbMap);
        return modelAndView;
	}

	/**
	 * @param newsItemService the newsItemService to set
	 */
	public void setNewsItemService(NewsItemService newsItemService) {
		this.newsItemService = newsItemService;
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
