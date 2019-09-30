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
package org.wise.portal.presentation.web.controllers;

import java.util.Set;
import java.util.TreeSet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.project.FamilyTag;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.PreviewProjectParameters;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.project.ProjectService;

/**
 * Controller for previewing a specific project or run
 * Parameters can be either projectId or runId
 *
 * @author Matt Fishbach
 * @author Hiroki Terashima
 */
@Controller
public class PreviewProjectController {

  private static final String PROJECT_ID_PARAM_NAME = "projectId";

  private static final String PROJECT_ID_PARAM_NAME_LOWERCASE = "projectid";

  private static final String RUN_ID_PARAM_NAME = "runId";

  private static final String VERSION_ID = "versionId";

  private static final String STEP = "step";

  private static final String WORKGROUP_ID_PARAM_NAME = "workgroupId";

  private static final String LANG = "lang";

  private static final String IS_CONSTRAINTS_DISABLED = "isConstraintsDisabled";

  @Autowired
  private ProjectService projectService;

  @Autowired
  private RunService runService;

  @RequestMapping(value = "/previewproject.html", method = RequestMethod.GET)
  protected ModelAndView getPreviewPage(HttpServletRequest request, HttpServletResponse response)
      throws Exception {
    String projectIdStr = request.getParameter(PROJECT_ID_PARAM_NAME);
    if (projectIdStr == null) {
      projectIdStr = request.getParameter(PROJECT_ID_PARAM_NAME_LOWERCASE);
    }
    String runIdStr = request.getParameter(RUN_ID_PARAM_NAME);
    Project project;
    if (projectIdStr != null) {
      // make sure that project id is a valid long
      try {
        Long.valueOf(projectIdStr);
      } catch (NumberFormatException nfe) {
        response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Could not determine project to preview.");
        return null;
      }
      project = projectService.getById(projectIdStr);
    } else if (runIdStr != null) {
      // make sure that run id is a valid long
      try {
        Long.valueOf(runIdStr);
      } catch (NumberFormatException nfe) {
        response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Could not determine project to preview.");
        return null;
      }
      project = runService.retrieveById(Long.valueOf(runIdStr)).getProject();
    } else {
      response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Could not determine project to preview.");
      return null;
    }

    Set<String> tagNames = new TreeSet<String>();
    tagNames.add("library");

    User user = ControllerUtil.getSignedInUser();
    if (project.hasTags(tagNames) ||
      project.getFamilytag().equals(FamilyTag.TELS) ||
      projectService.canReadProject(project, user)) {
      PreviewProjectParameters params = new PreviewProjectParameters();
      params.setUser(user);
      params.setProject(project);
      params.setHttpServletRequest(request);
      params.setVersionId(request.getParameter(VERSION_ID));
      params.setStep(request.getParameter(STEP));
      params.setWorkgroupId(request.getParameter(WORKGROUP_ID_PARAM_NAME));
      String lang = request.getParameter(LANG);
      if (lang != null) {
        params.setLang(lang);
      }
      String isConstraintsDisabledStr = request.getParameter(IS_CONSTRAINTS_DISABLED);
      if (isConstraintsDisabledStr != null) {
        params.setConstraintsDisabled(Boolean.parseBoolean(isConstraintsDisabledStr));
      }
      return (ModelAndView) projectService.previewProject(params);
    } else {
      return new ModelAndView("errors/accessdenied");
    }
  }
}
