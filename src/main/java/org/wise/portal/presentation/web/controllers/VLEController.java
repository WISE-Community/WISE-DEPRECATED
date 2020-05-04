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

import java.util.Properties;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.run.Run;
import org.wise.portal.service.run.RunService;

/**
 * Controller for handling student VLE-portal interactions.
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
@Controller
public class VLEController {

  @Autowired
  private RunService runService;

  @Autowired
  Properties appProperties;

  @GetMapping(value = "/student/vle/vle.html")
  protected ModelAndView launchVLEWISE4Run(HttpServletRequest request)
      throws NumberFormatException, ObjectNotFoundException {
    String runIdString = request.getParameter("runId");
    Run run = runService.retrieveById(Long.parseLong(runIdString));
    String contextPath = request.getContextPath();

    ModelAndView modelAndView = new ModelAndView("vle");
    modelAndView.addObject("run", run);
    modelAndView.addObject("vleurl", contextPath + "/vle/vle.html");
    modelAndView.addObject("vleConfigUrl",
        contextPath + "/vleconfig?runId=" + run.getId() + "&mode=run");
    String curriculumBaseWWW = appProperties.getProperty("curriculum_base_www");
    String rawProjectUrl = run.getProject().getModulePath();
    String contentUrl = curriculumBaseWWW + rawProjectUrl;
    modelAndView.addObject("contentUrl", contentUrl);
    return modelAndView;
  }
}
