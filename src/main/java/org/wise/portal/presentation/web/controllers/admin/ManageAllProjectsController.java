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
package org.wise.portal.presentation.web.controllers.admin;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.project.FamilyTag;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.project.ProjectService;

/**
 * @author Sally Ahn
 */
@Controller
@RequestMapping("/admin/project/manageallprojects.html")
public class ManageAllProjectsController {

  @Autowired
  private ProjectService projectService;

  private static final String VIEW_NAME = "admin/project/manageallprojects";

  private static final String INTERNAL_PROJECT_LIST_PARAM_NAME = "internal_project_list";

  @RequestMapping(method = RequestMethod.GET)
  protected ModelAndView handleGET(
    HttpServletRequest request) throws Exception {
    List<Project> internalProjectList = new ArrayList<Project>();
    String projectLookupType = request.getParameter("projectLookupType");
    if (projectLookupType != null) {
      String projectLookupValue = request.getParameter("projectLookupValue");
      if ("id".equals(projectLookupType)) {
        internalProjectList.add(projectService.getById(Long.valueOf(projectLookupValue.trim())));
      } else if ("author".equals(projectLookupType)) {
        internalProjectList.addAll(projectService.getProjectListByAuthorName(projectLookupValue));
      } else if ("title".equals(projectLookupType)) {
        internalProjectList.addAll(projectService.getProjectListByTitle(projectLookupValue));
      }
    } else {
      internalProjectList.addAll(projectService.getAdminProjectList());
    }
    ModelAndView modelAndView = new ModelAndView(VIEW_NAME);
    modelAndView.addObject(INTERNAL_PROJECT_LIST_PARAM_NAME, internalProjectList);
    return modelAndView;
  }

  @RequestMapping(method = RequestMethod.POST)
  protected ModelAndView handleRequestInternal(HttpServletRequest request) {
    ModelAndView mav = new ModelAndView();
    try {
      String projectIdStr = request.getParameter("projectId");
      Long projectId = new Long(projectIdStr);
      Project project = projectService.getById(projectId);
      String attr = request.getParameter("attr");
      if (attr.equals("isCurrent")) {
        project.setCurrent(Boolean.valueOf(request.getParameter("val")));
      } else if (attr.equals("familyTag")) {
        project.setFamilytag(FamilyTag.valueOf(request.getParameter("val")));
      } else if (attr.equals("maxTotalAssetsSize")) {
        String maxTotalAssetsSizeStr = request.getParameter("val");
        Long maxTotalAssetsSize = Long.parseLong(maxTotalAssetsSizeStr);
        project.setMaxTotalAssetsSize(maxTotalAssetsSize);
      }
      User user = ControllerUtil.getSignedInUser();
      if (user.isAdmin()) {
        projectService.updateProject(project, user);
        mav.addObject("msg", "success");
      } else {
        mav.addObject("msg", "error: permission denied");
      }
      return mav;
    } catch (Exception e) {
      mav.addObject("msg", "error");
      return mav;
    }
  }
}
