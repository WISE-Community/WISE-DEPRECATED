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

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.project.impl.ProjectType;
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
   * @param runId ID of the run
   */
  @GetMapping(value = "/teacher/run/manage/{runId}")
  protected ModelAndView launchClassroomMonitor(@PathVariable Long runId,
      HttpServletRequest request, HttpServletResponse response,
      Authentication authentication) throws Exception {
    Run run = runService.retrieveById(runId);
    if (5 == run.getProject().getWiseVersion()) {
      return this.launchClassroomMonitorWISE5(runId, authentication);
    } else if (4 == run.getProject().getWiseVersion()) {
      String action = null;
      String gradingType = "monitor";
      String getRevisions = null;
      return this.launchClassroomMonitorWISE4(runId, action, gradingType, getRevisions,
          authentication, request, response);
    }
    return null;
  }

  /**
   * Handles launching classroom monitor for WISE5 runs
   * @param runId ID of the run
   * @throws Exception
   */
  @GetMapping(value = "/classroomMonitor/{runId}")
  protected ModelAndView launchClassroomMonitorWISE5(@PathVariable Long runId,
      Authentication authentication) throws Exception {
    Run run = runService.retrieveById(runId);
    if (runService.hasReadPermission(authentication, run)) {
      return new ModelAndView(
          "forward:/wise5/classroomMonitor/dist/index.html#!/run/" + runId + "/project/");
    } else {
      return new ModelAndView("errors/accessdenied");
    }
  }

  /**
   * Handles launching classroom monitor for WISE4 runs
   * @param runId
   * @param action
   * @param gradingType
   * @param getRevisions
   * @param request
   * @param response
   * @return
   * @throws Exception
   */
  @RequestMapping(value = {
    "/teacher/grading/gradework.html",
    "/teacher/classroomMonitor/classroomMonitor"})
  protected ModelAndView launchClassroomMonitorWISE4(
      @RequestParam("runId") Long runId,
      @RequestParam(value = "action", required = false) String action,
      @RequestParam(value = "gradingType", required = false) String gradingType,
      @RequestParam(value = "getRevisions", required = false) String getRevisions,
      Authentication authentication,
      HttpServletRequest request,
      HttpServletResponse response) throws Exception {
    Run run = runService.retrieveById(runId);
    if ("postMaxScore".equals(action)) {
      return handlePostMaxScore(request, response, run);
    } else {
      ProjectType projectType = run.getProject().getProjectType();
      if (projectType.equals(ProjectType.LD)) {
        if (runService.hasReadPermission(authentication, run)) {
          String contextPath = request.getContextPath();
          String getGradeWorkUrl = contextPath + "/vle/gradework.html";
          String getGradingConfigUrl = contextPath + "/vleconfig?runId=" + runId.toString() +
              "&gradingType=" + gradingType + "&mode=grading&getRevisions=" + getRevisions;
          String getClassroomMonitorUrl = contextPath + "/vle/classroomMonitor.html";
          String getClassroomMonitorConfigUrl = contextPath + "/vleconfig?runId=" +
              run.getId().toString() + "&gradingType=" + gradingType +
              "&mode=grading&getRevisions=" + getRevisions;
          if (runService.hasWritePermission(authentication, run)) {
            getGradeWorkUrl += "?loadScriptsIndividually&permission=write";
            getClassroomMonitorUrl += "?loadScriptsIndividually&permission=write";
          } else {
            getGradeWorkUrl += "?loadScriptsIndividually&permission=read";
            getClassroomMonitorUrl += "?loadScriptsIndividually&permission=read";
          }

          ModelAndView modelAndView = new ModelAndView("vle");
          modelAndView.addObject("runId", runId);
          modelAndView.addObject("run", run);
          if ("monitor".equals(gradingType)) {
            modelAndView.addObject("vleurl", getClassroomMonitorUrl);
            modelAndView.addObject("vleConfigUrl", getClassroomMonitorConfigUrl);
          } else {
            modelAndView.addObject("vleurl", getGradeWorkUrl);
            modelAndView.addObject("vleConfigUrl", getGradingConfigUrl);
          }
          return modelAndView;
        } else {
          return new ModelAndView("errors/accessdenied");
        }
      } else if (runId != null) {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.addObject("runId", runId);
        return modelAndView;
      } else {
      }
    }
    return new ModelAndView();
  }

  /**
   * Handles the saving of max score POSTs
   * @param request
   * @param response
   * @param run
   * @return
   */
  private ModelAndView handlePostMaxScore(
      HttpServletRequest request, HttpServletResponse response, Run run) {
    try {
      String nodeId = request.getParameter("nodeId");
      String maxScoreValue = request.getParameter("maxScoreValue");
      int maxScore = 0;

      if (maxScoreValue != null && !maxScoreValue.equals("")) {
        maxScore = Integer.parseInt(maxScoreValue);
      }

      /*
       * the string that we will use to return the new max score JSON object
       * once we have successfully updated it on the server. this is so
       * that the client can retrieve confirmation that the new max
       * score has been saved and that it can then update its local copy.
       */
      String maxScoreReturnJSON = "";

      String extras = run.getExtras();

      JSONObject jsonExtras;
      JSONArray maxScores;

      if (extras == null || extras.equals("")) {
        jsonExtras = new JSONObject("{'summary':'','contact':'','title':'','comptime':'','graderange':'','subject':'','techreqs':'','maxScores':[],'author':'','totaltime':''}");
      } else {
        jsonExtras = new JSONObject(extras);
      }

      maxScores = (JSONArray) jsonExtras.get("maxScores");

      /*
       * value to remember if we have updated an existing entry or
       * need to add a new entry
       */
      boolean maxScoreUpdated = false;

      for (int x = 0; x < maxScores.length(); x++) {
        JSONObject maxScoreObj = (JSONObject) maxScores.get(x);
        String maxScoreObjNodeId = (String) maxScoreObj.get("nodeId");
        if (nodeId.equals(maxScoreObjNodeId)) {
          maxScoreObj.put("maxScoreValue", maxScore);
          maxScoreReturnJSON = maxScoreObj.toString();
          maxScoreUpdated = true;
        }
      }

      if (!maxScoreUpdated) {
        JSONObject newMaxScore = new JSONObject();
        newMaxScore.put("nodeId", nodeId);
        newMaxScore.put("maxScoreValue", maxScore);
        maxScoreReturnJSON = newMaxScore.toString();
        maxScores.put(newMaxScore);
      }

      runService.setExtras(run, jsonExtras.toString());
      response.getWriter().print(maxScoreReturnJSON);
    } catch (JSONException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    } catch (Exception e) {
      e.printStackTrace();
    }
    return null;
  }
}
