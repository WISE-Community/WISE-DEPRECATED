/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.wise.portal.domain.project.Project;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.session.SessionService;

import java.util.HashMap;
import java.util.Set;

/**
 * Controller for showing currently-authored project in the admin page
 * @author Hiroki Terashima
 */
@Controller
@RequestMapping("/admin/project/currentlyAuthoredProjects")
public class CurrentlyAuthoredProjectsController {

  @Autowired
  private ProjectService projectService;

  @Autowired
  private SessionService sessionService;

  @RequestMapping(method = RequestMethod.GET)
  protected String showCurrentlyAuthoredProjects(ModelMap modelMap) throws Exception {
    Set<String> currentlyAuthoredProjects = sessionService.getCurrentlyAuthoredProjects();
    HashMap<String, Set<String>> projectsToAuthors = new HashMap<>();
    HashMap<String, String> projectNames = new HashMap<>();
    for (String currentlyAuthoredProject : currentlyAuthoredProjects) {
      Project project = projectService.getById(currentlyAuthoredProject);
      projectNames.put(currentlyAuthoredProject, project.getName());
      projectsToAuthors.put(currentlyAuthoredProject, sessionService.getCurrentAuthors(currentlyAuthoredProject));
    }
    modelMap.put("projectNames", projectNames);
    modelMap.put("projectsToAuthors", projectsToAuthors);
    return "admin/project/currentlyAuthoredProjects";
  }
}
