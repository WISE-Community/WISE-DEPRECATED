/**
 * Copyright (c) 2007-2017 Regents of the University of California (Regents).
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 * <p>
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 * <p>
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 * <p>
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 * <p>
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.presentation.web.controllers.student;

import java.util.*;

import org.json.JSONException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.StudentRunInfo;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.student.StudentService;

import org.json.JSONObject;
import org.json.JSONArray;

/**
 * Controller for Student REST API
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author Jonathan Lim-Breitbart
 */
@RestController
@RequestMapping("/site/api/student")
public class StudentAPIController {

  @Autowired
  private RunService runService;

  @Autowired
  private StudentService studentService;

  @Autowired
  private Properties wiseProperties;

  // path to project thumbnail image relative to project folder
  // TODO: make this dynamic, part of project metadata?
  private static final String PROJECT_THUMB_PATH = "/assets/project_thumb.png";

  @RequestMapping(value = "/runs", method = RequestMethod.GET)
  protected String handleGET(ModelMap modelMap,
      @RequestParam(value = "pLT", required = false) String previousLoginTime) throws Exception {
    User user = ControllerUtil.getSignedInUser();
    List<Run> runlist = runService.getRunList(user);
    JSONArray runListJSONArray = new JSONArray();
    for (Run run : runlist) {
      JSONObject runJSON = new JSONObject();
      Project project = run.getProject();
      String curriculumBaseWWW = wiseProperties.getProperty("curriculum_base_www");
      String projectThumb = "";
      String modulePath = project.getModulePath();
      int lastIndexOfSlash = modulePath.lastIndexOf("/");
      if (lastIndexOfSlash != -1) {
        /*
         * The project thumb url by default is the same (/assets/project_thumb.png)
         * for all projects, but this could be overwritten in the future
         * e.g. /253/assets/projectThumb.png
         */
        projectThumb = curriculumBaseWWW + modulePath.substring(0, lastIndexOfSlash) + PROJECT_THUMB_PATH;
      }
      StudentRunInfo studentRunInfo = studentService.getStudentRunInfo(user, run);
      Workgroup workgroup = studentRunInfo.getWorkgroup();
      JSONArray workgroupMembers = new JSONArray();
      StringBuilder workgroupNames = new StringBuilder();

      runJSON.put("accessCode", run.getRuncode());
      runJSON.put("id", run.getId());
      runJSON.put("periodName", run.getPeriodOfStudent(user).getName());
      runJSON.put("projectId", project.getId());
      runJSON.put("projectThumb", projectThumb);
      runJSON.put("name", run.getName());
      runJSON.put("startTime", run.getStarttime());
      runJSON.put("endTime", run.getEndtime());
      runJSON.put("teacherFirstname", run.getOwner().getUserDetails().getFirstname());
      runJSON.put("teacherLastname", run.getOwner().getUserDetails().getLastname());

      /*
       * The workgroup can be null if the student registered for a run but
       * hasn't launched the project yet.
       */
      if (workgroup != null) {
        for (User member : workgroup.getMembers()) {
          MutableUserDetails userDetails = (MutableUserDetails) member.getUserDetails();
          JSONObject memberJSON = new JSONObject();
          memberJSON.put("id", userDetails.getId());
          String firstname = userDetails.getFirstname();
          memberJSON.put("firstname", firstname);
          String lastname = userDetails.getLastname();
          memberJSON.put("lastname", lastname);
          memberJSON.put("username", userDetails.getUsername());
          workgroupMembers.put(memberJSON);
          if (workgroupNames.length() > 0) {
            workgroupNames.append(", ");
          }
          workgroupNames.append(firstname + " " + lastname);
        }
        runJSON.put("workgroupId", studentRunInfo.getWorkgroup().getId());
        runJSON.put("workgroupNames", workgroupNames.toString());
        runJSON.put("workgroupMembers", workgroupMembers);
      }

      runListJSONArray.put(runJSON);
    }
    return runListJSONArray.toString();
  }

  @RequestMapping(value = "/config", method = RequestMethod.GET)
  protected String getConfig(ModelMap modelMap) throws JSONException {
    JSONObject configJSON = new JSONObject();
    configJSON.put("logOutURL", wiseProperties.get("wiseBaseURL") + "/logout");
    return configJSON.toString();
  }

  private Date getLastLoginTime(String previousLoginTime, User user) {
    Date lastLoginTime = ((StudentUserDetails) user.getUserDetails()).getLastLoginTime();
    if (previousLoginTime != null) {
      Calendar cal = Calendar.getInstance();
      try {
        Long previousLogin = new Long(previousLoginTime);
        cal.setTimeInMillis(previousLogin);
        return cal.getTime();
      } catch (NumberFormatException nfe) {
      }
    }
    return lastLoginTime;
  }
}
