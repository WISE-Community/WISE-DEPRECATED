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

import java.io.IOException;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.ProjectMetadata;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.project.ProjectService;

@Controller
public class ProjectMetadataController {

  @Autowired
  private ProjectService projectService;

  @Autowired
  private RunService runService;

  @RequestMapping("/metadata.html")
  protected ModelAndView handleRequestInternal(HttpServletRequest request,
      HttpServletResponse response) throws Exception {
    String command = request.getParameter("command");
    String projectId = request.getParameter("projectId");

    if (projectId != null) {
      Project project = projectService.getById(Long.parseLong(projectId));
      if (project != null) {
        ProjectMetadata metadata = project.getMetadata();
        User user = ControllerUtil.getSignedInUser();
        if (command.equals("getProjectMetaData")) {
          if (metadata != null) {
            String metadataJSON = metadata.toJSONString();
            JSONObject metadataJSONObj = new JSONObject(metadataJSON);
            Long parentProjectId = project.getParentProjectId();
            metadataJSONObj.put("projectId", Long.parseLong(projectId));
            if (parentProjectId == null) {
              metadataJSONObj.put("parentProjectId", JSONObject.NULL);
            } else {
              metadataJSONObj.put("parentProjectId", parentProjectId);
            }

            String projectUrl = project.getModulePath();
            if (projectUrl != null) {
              String projectFolder = projectUrl.substring(0, projectUrl.lastIndexOf("/"));
              metadataJSONObj.put("projectFolder", projectFolder);
            }
            response.getWriter().write(metadataJSONObj.toString());
          } else {
            response.getWriter().write("{}");
          }
        } else {
          if (user == null) {
            response.getWriter().print("ERROR:LoginRequired");
          } else {
            List<Run> runList = runService.getProjectRuns((Long) project.getId());
            Run run = null;
            if (!runList.isEmpty()){
              // since a project can now only be run once, just use the first run in the list
              run = runList.get(0);
            }
            if (projectService.canAuthorProject(project, user) ||
                (run != null && runService.hasRunPermission(run, user, BasePermission.WRITE))) {
              if (command.equals("postMaxScore")) {
                handlePostMaxScore(request, response);
              }
            } else {
              response.getWriter().print("ERROR:NotAuthorized");
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * Handles the saving of max score POSTs. Only a user with author permission on the
   * project or the run that it's used for can change max scores.
   * Assumes that necessary permisison check has been invoked before calling this method
   * @param request
   * @param response
   * @return
   */
  private ModelAndView handlePostMaxScore(HttpServletRequest request,
      HttpServletResponse response) {
    try {
      String projectIdStr = request.getParameter("projectId");
      Project project;
      if (projectIdStr != null) {
        project = projectService.getById(new Long(projectIdStr));
        if (project != null) {
          User user = ControllerUtil.getSignedInUser();
          if (user != null) {
            String nodeId = request.getParameter("nodeId");
            String maxScoreValue = request.getParameter("maxScoreValue");
            int maxScore = 0;
            if (maxScoreValue != null && !maxScoreValue.equals("")) {
              maxScore = Integer.parseInt(maxScoreValue);   // parse the new max score value
            }

            /*
             * the string that we will use to return the new max score JSON object
             * once we have successfully updated it on the server. this is so
             * that the client can retrieve confirmation that the new max
             * score has been saved and that it can then update its local copy.
             */
            String maxScoreReturnJSON = "";

            if (project != null) {
              ProjectMetadata projectMetadata = project.getMetadata();
              if (projectMetadata != null) {
                String maxScoresString = projectMetadata.getMaxScores();
                JSONArray maxScoresJSONArray;
                if (maxScoresString == null || maxScoresString.equals("")) {
                  maxScoresJSONArray = new JSONArray();
                } else {
                  maxScoresJSONArray = new JSONArray(maxScoresString);
                }

                boolean maxScoreUpdated = false;
                for (int x = 0; x < maxScoresJSONArray.length(); x++) {
                  JSONObject maxScoreObj = (JSONObject) maxScoresJSONArray.get(x);
                  String maxScoreObjNodeId = (String) maxScoreObj.get("nodeId");
                  if (nodeId.equals(maxScoreObjNodeId)) {
                    maxScoreObj.put("maxScoreValue", maxScore);
                    maxScoreReturnJSON = maxScoreObj.toString();
                    maxScoreUpdated = true;
                  }
                }

                if (!maxScoreUpdated) {
                  /*
                   * we did not find an existing entry to update so we will
                   * create a new entry
                   */
                  JSONObject newMaxScore = new JSONObject();

                  newMaxScore.put("nodeId", nodeId);
                  newMaxScore.put("maxScoreValue", maxScore);

                  /*
                   * generate the json string for the updated max score entry
                   * so we can send it back in the response
                   */
                  maxScoreReturnJSON = newMaxScore.toString();
                  maxScoresJSONArray.put(newMaxScore);
                }

                projectMetadata.setMaxScores(maxScoresJSONArray.toString());
                project.setMetadata(projectMetadata);
                projectService.updateProject(project, user);
                response.getWriter().print(maxScoreReturnJSON);
              }
            }
          }
        }
      }
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
