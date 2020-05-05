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
package org.wise.portal.presentation.web.controllers.teacher.grading;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.run.Run;
import org.wise.portal.service.run.RunService;

/**
 * A Controller for Grading Student Work
 *
 * @author Geoffrey Kwan
 * @author Patrick Lawler
 * @author Anthony Perritano
 */
@Controller
public class GradeWorkController {

  @Autowired
  private RunService runService;

  /**
   * Invokes WISE4 or WISE5 Classroom Monitor based on the specified run
   *
   * @param runId
   *                ID of the run
   */
  @GetMapping(value = "/teacher/run/manage/{runId}")
  protected ModelAndView launchClassroomMonitor(@PathVariable Long runId,
      HttpServletRequest request, HttpServletResponse response, Authentication authentication)
      throws Exception {
    Run run = runService.retrieveById(runId);
    if (5 == run.getProject().getWiseVersion()) {
      return this.launchClassroomMonitorWISE5(runId, authentication);
    }
    return null;
  }

  /**
   * Handles launching classroom monitor for WISE5 runs
   *
   * @param runId
   *                ID of the run
   * @throws Exception
   */
  @GetMapping(value = "/classroomMonitor/{runId}")
  protected ModelAndView launchClassroomMonitorWISE5(@PathVariable Long runId,
      Authentication authentication) throws Exception {
    Run run = runService.retrieveById(runId);
    if (runService.hasReadPermission(authentication, run)) {
      return new ModelAndView("redirect:/teacher/manage/unit/" + runId);
    } else {
      return new ModelAndView("errors/accessdenied");
    }
  }

}
