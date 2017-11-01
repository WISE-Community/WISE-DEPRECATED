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
        ProjectMetadata metadata = project.getMetadata();  // get the metadata
        User user = ControllerUtil.getSignedInUser();  // get the signed in user

        if (command.equals("getProjectMetaData")) {
          if (metadata != null) {
            // metadata exists so we will get the metadata as a JSON string
            String metadataJSON = metadata.toJSONString();

            // get the JSONObject for the metadata so we can add to it
            JSONObject metadataJSONObj = new JSONObject(metadataJSON);

            // get the parent project id
            Long parentProjectId = project.getParentProjectId();

            // add the project id and parent project id
            metadataJSONObj.put("projectId", Long.parseLong(projectId));

            if (parentProjectId == null) {
              // there is no parent project id so we will set it to null
              metadataJSONObj.put("parentProjectId", JSONObject.NULL);
            } else {
              metadataJSONObj.put("parentProjectId", parentProjectId);
            }

            /*
             * get the relative project url
             * e.g.
             * /135/wise4.project.json
             */
            String projectUrl = project.getModulePath();

            if (projectUrl != null) {
              /*
               * get the project folder
               * e.g.
               * /135
               */
              String projectFolder = projectUrl.substring(0, projectUrl.lastIndexOf("/"));

              // put the project folder into the meta data JSON
              metadataJSONObj.put("projectFolder", projectFolder);
            }

            response.getWriter().write(metadataJSONObj.toString());
          } else {
            // metadata does not exist so we will just return an empty JSON object string
            response.getWriter().write("{}");
          }
        } else {
          if (user == null) {
            // the user is not logged in
            response.getWriter().print("ERROR:LoginRequired");
          } else {
            // check to see if user can author project or the run that it's in
            List<Run> runList = this.runService.getProjectRuns((Long) project.getId());
            Run run = null;
            if (!runList.isEmpty()){
              // since a project can now only be run once, just use the first run in the list
              run = runList.get(0);
            }
            if (this.projectService.canAuthorProject(project, user) ||
              (run != null && runService.hasRunPermission(run, user, BasePermission.WRITE))) {
              if (command.equals("postMaxScore")) {
                // request is to post a max score
                handlePostMaxScore(request, response);
              }
            } else {
              // the user does not have write access to the proejct
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

      String projectIdStr = request.getParameter("projectId");  // get the project id

      Project project = null;

      if (projectIdStr != null) {

        project = projectService.getById(new Long(projectIdStr));  // get the project

        if (project != null) {

          User user = ControllerUtil.getSignedInUser();  // get the signed in user

          if (user != null) {

            String nodeId = request.getParameter("nodeId");  // get the nodeId

            // get the new max score value
            String maxScoreValue = request.getParameter("maxScoreValue");

            int maxScore = 0;

            // check if a max score value was provided
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
                JSONArray maxScoresJSONArray = null;

                if (maxScoresString == null || maxScoresString.equals("")) {
                  maxScoresJSONArray = new JSONArray();
                } else {
                  maxScoresJSONArray = new JSONArray(maxScoresString);
                }

                boolean maxScoreUpdated = false;

                for (int x = 0; x < maxScoresJSONArray.length(); x++) {
                  // get a max score entry
                  JSONObject maxScoreObj = (JSONObject) maxScoresJSONArray.get(x);

                  // get the node id
                  String maxScoreObjNodeId = (String) maxScoreObj.get("nodeId");

                  // check if the node id matches the one new one we need to save
                  if (nodeId.equals(maxScoreObjNodeId)) {
                    // it matches so we will update the score
                    maxScoreObj.put("maxScoreValue", maxScore);

                    /*
                     * generate the json string for the updated max score entry
                     * so we can send it back in the response
                     */
                    maxScoreReturnJSON = maxScoreObj.toString();
                    maxScoreUpdated = true;
                  }
                }

                // check if we were able to find an existing entry to update it
                if (!maxScoreUpdated) {
                  /*
                   * we did not find an existing entry to update so we will
                   * create a new entry
                   */
                  JSONObject newMaxScore = new JSONObject();

                  newMaxScore.put("nodeId", nodeId); // set the nodeId
                  newMaxScore.put("maxScoreValue", maxScore);   // set the max score

                  /*
                   * generate the json string for the updated max score entry
                   * so we can send it back in the response
                   */
                  maxScoreReturnJSON = newMaxScore.toString();

                  // put the new entry back into the maxScores JSON object
                  maxScoresJSONArray.put(newMaxScore);
                }

                projectMetadata.setMaxScores(maxScoresJSONArray.toString());
                projectService.updateProject(project, user);

                //send the new max score entry back to the client
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
