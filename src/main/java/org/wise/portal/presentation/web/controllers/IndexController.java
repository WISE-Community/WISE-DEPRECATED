/**
 * Copyright (c) 2007-2017 Regents of the University of California (Regents).
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
package org.wise.portal.presentation.web.controllers;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.wise.portal.domain.newsitem.NewsItem;
import org.wise.portal.domain.newsitem.impl.NewsItemImpl;
import org.wise.portal.domain.project.Project;
import org.wise.portal.service.newsitem.NewsItemService;
import org.wise.portal.service.project.ProjectService;

import javax.servlet.http.HttpServletRequest;

/**
 * Controller for WISE main home page
 * @author Hiroki Terashima
 */
@Controller
@RequestMapping("/")
public class IndexController {

  @Autowired
  private NewsItemService newsItemService;

  @Autowired
  private ProjectService projectService;

  @Autowired
  private Properties wiseProperties;

  @Autowired
  private MessageSource messageSource;

  // path to project thumbnail image relative to project folder
  private static final String PROJECT_THUMB_PATH = "/assets/project_thumb.png";

  /**
   * Displays the home page with news items and public library projects
   */
  @RequestMapping(method = RequestMethod.GET)
  protected String showHomePage(
      HttpServletRequest request,
      ModelMap modelMap) throws Exception {
    // TODO: allow each WISE instance to specify these
    List<Project> esProjects = new ArrayList<Project>();
    List<Project> lsProjects = new ArrayList<Project>();
    List<Project> psProjects = new ArrayList<Project>();
    List<Project> bioProjects = new ArrayList<Project>();
    List<Project> chemProjects = new ArrayList<Project>();
    List<Project> physProjects = new ArrayList<Project>();

    List<Project> libraryProjectsList = projectService.getPublicLibraryProjectList();
    for (Project p: libraryProjectsList) {
      String subject = p.getMetadata().getSubject();
      if (subject != null) {
        // TODO: compare the translated subjects
        if (subject.equals("Earth Science")) {
          esProjects.add(p);
        } else if (subject.equals("Life Science")) {
          lsProjects.add(p);
        } else if (subject.equals("Physical Science")) {
          psProjects.add(p);
        } else if (subject.equals("Biology")) {
          bioProjects.add(p);
        } else if (subject.equals("Chemistry")) {
          chemProjects.add(p);
        } else if (subject.equals("Physics")) {
          physProjects.add(p);
        }
      }
    }

    Map<Long,String> projectThumbMap = new TreeMap<Long,String>();
    String curriculumBaseWWW = wiseProperties.getProperty("curriculum_base_www");
    for (Project p : libraryProjectsList) {
      if (p.isCurrent()) {
        String modulePath = p.getModulePath();
        int lastIndexOfSlash = modulePath.lastIndexOf("/");
        if (lastIndexOfSlash != -1) {
          /*
           * The project thumb url by default is the same (/assets/project_thumb.png)
           * for all projects, but this could be overwritten in the future
           * e.g. /253/assets/projectThumb.png
           */
          projectThumbMap.put((Long) p.getId(),
              curriculumBaseWWW + modulePath.substring(0, lastIndexOfSlash) + PROJECT_THUMB_PATH);
        }
      }
    }

    modelMap.put("newsItems", getNewsItems(request));
    modelMap.put("esProjects", esProjects);
    modelMap.put("lsProjects", lsProjects);
    modelMap.put("psProjects", psProjects);
    modelMap.put("bioProjects", bioProjects);
    modelMap.put("chemProjects", chemProjects);
    modelMap.put("physProjects", physProjects);
    modelMap.put("projectThumbMap", projectThumbMap);
    return "index";
  }

  private List<NewsItem> getNewsItems(HttpServletRequest request) {
    List<NewsItem> newsItems = newsItemService.retrieveByType("public");
    if (newsItems.size() == 0) {
      NewsItem newsItem = new NewsItemImpl();
      newsItem.setDate(Calendar.getInstance().getTime());
      newsItem.setTitle(messageSource.getMessage("index.news.defaultTitle", null,
          "Welcome to WISE news section!", request.getLocale()));
      newsItem.setNews(messageSource.getMessage("index.news.defaultText", null,
          "This section will show news items related to WISE!", request.getLocale()));
      newsItems.add(newsItem);
    }
    return newsItems;
  }
}
