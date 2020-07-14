/**
 * Copyright (c) 2008-2015 Regents of the University of California (Regents).
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
package org.wise.portal.presentation.web.controllers.project;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.project.Project;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.domain.Tag;
import org.wise.portal.service.project.ProjectService;

/**
 * Controller to add/remove tags
 *
 * @author Patrick Lawler
 */
@Controller
public class ProjectTagController {

  @Autowired
  private ProjectService projectService;

  @RequestMapping("/admin/project/tagger.html")
  public ModelAndView handleRequestInternal(HttpServletRequest request,
      HttpServletResponse response) throws Exception {
    String command = request.getParameter("command");
    if (command.equals("createTag")) {
      String projectId = request.getParameter("projectId");
      Project project = projectService.getById(Long.parseLong(projectId));
      String tag = request.getParameter("tag");

      if (projectId == null || tag == null || projectId.equals("") || tag.equals("")) {
        response.sendError(HttpServletResponse.SC_BAD_REQUEST,
            "Invalid parameters provided, cannot complete the request.");
      } else if (projectService.projectContainsTag(project, tag)) {
        response.getWriter().write("duplicate");
      } else if (!projectService.isAuthorizedToCreateTag(ControllerUtil.getSignedInUser(), tag)) {
        response.getWriter().write("not-authorized");
      } else {
        Integer tagId = projectService.addTagToProject(tag, Long.parseLong(projectId));
        response.getWriter().write(String.valueOf(tagId));
      }
    } else if (command.equals("removeTag")) {
      String projectId = request.getParameter("projectId");
      String tagId = request.getParameter("tagId");

      if (projectId == null || tagId == null || projectId.equals("") || tagId.equals("")) {
        response.sendError(HttpServletResponse.SC_BAD_REQUEST,
            "Invalid parameters provided, cannot complete the request.");
      } else {
        projectService.removeTagFromProject(Integer.parseInt(tagId), Long.parseLong(projectId));
        response.getWriter().write("success");
      }
    } else if (command.equals("updateTag")) {
      String projectId = request.getParameter("projectId");
      Project project = projectService.getById(Long.parseLong(projectId));
      String tagId = request.getParameter("tagId");
      String name = request.getParameter("name");

      if (projectId == null || tagId == null || name == null || projectId.equals("")
          || tagId.equals("") || name.equals("")) {
        response.sendError(HttpServletResponse.SC_BAD_REQUEST,
            "Invalid parameters provided, cannot complete the request.");
      } else if (projectService.projectContainsTag(project, name)) {
        response.getWriter().write("duplicate");
      } else if (!projectService.isAuthorizedToCreateTag(ControllerUtil.getSignedInUser(), name)) {
        response.getWriter().write("not-authorized");
      } else {
        Integer id =
            projectService.updateTag(Integer.parseInt(tagId), Long.parseLong(projectId), name);
        response.getWriter().write(String.valueOf(id));
      }
    } else if (command.equals("retrieveProjectTags")) {
      String projectId = request.getParameter("projectId");

      if (projectId != null) {
        Project p = projectService.getById(Long.parseLong(projectId));
        if (p != null) {
          String tagString = "";
          for (Tag t : p.getTags()) {
            tagString += t.getId() + "~" + t.getName() + ",";
          }
          tagString = tagString.substring(0,tagString.length() - 1);
          response.getWriter().write(tagString);
          return null;
        }
      }
      response.getWriter().write("Invalid project parameter, cannot retrieve tags.");
    } else {
      response.sendError(HttpServletResponse.SC_BAD_REQUEST,
          "I do not understand the command: " + command);
    }
    return null;
  }
}
