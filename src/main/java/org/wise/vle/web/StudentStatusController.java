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
package org.wise.vle.web;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.vle.VLEService;
import org.wise.portal.spring.data.redis.MessagePublisher;
import org.wise.vle.domain.status.StudentStatus;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Timestamp;
import java.util.Calendar;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

@Controller
@RequestMapping("/studentStatus")
public class StudentStatusController {

  @Autowired
  private VLEService vleService;

  @Autowired
  private RunService runService;

  @Autowired
  private MessagePublisher redisPublisher;

  /**
   * Handles GET requests from the teacher when a teacher requests for all the student
   * statuses for a given run id
   * @param response
   * @throws IOException
   */
  @RequestMapping(method = RequestMethod.GET)
  public ModelAndView getStudentStatus(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    User signedInUser = ControllerUtil.getSignedInUser();
    String runIdString = request.getParameter("runId");
    Long runId = null;

    try {
      runId = new Long(runIdString);
    } catch(NumberFormatException e) {
      e.printStackTrace();
    }

    boolean allowedAccess = false;

    /*
     * teachers that are owners of the run can make a request
     * students can not make a request
     */
    if (SecurityUtils.isAdmin(signedInUser)) {
      allowedAccess = true;
    } else if (SecurityUtils.isTeacher(signedInUser) && SecurityUtils.isUserOwnerOfRun(signedInUser, runId)) {
      allowedAccess = true;
    }

    if (!allowedAccess) {
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return null;
    }

    if (SecurityUtils.isPortalMode(request) && !SecurityUtils.isAuthenticated(request)) {
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return null;
    }

    List<StudentStatus> studentStatuses = vleService.getStudentStatusesByRunId(runId);
    JSONArray studentStatusesJSONArray = new JSONArray();
    Iterator<StudentStatus> studentStatusesIterator = studentStatuses.iterator();
    while (studentStatusesIterator.hasNext()) {
      StudentStatus studentStatus = studentStatusesIterator.next();
      String status = studentStatus.getStatus();
      try {
        JSONObject statusJSON = new JSONObject(status);
        Timestamp postTimestamp = studentStatus.getTimestamp();
        long postTimestampMilliseconds = postTimestamp.getTime();
        statusJSON.put("postTimestamp", postTimestampMilliseconds);
        Date currentTime = new Date();
        long retrievalTimestampMilliseconds = currentTime.getTime();
        statusJSON.put("retrievalTimestamp", retrievalTimestampMilliseconds);
        studentStatusesJSONArray.put(statusJSON);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    String studentStatusesString = studentStatusesJSONArray.toString();
    try {
      response.getWriter().print(studentStatusesString);
    } catch (IOException e) {
      e.printStackTrace();
    }
    return null;
  }

  /**
   * Handles POST requests from students when they send their status to the server
   * so we can keep track of their latest status
   *
   * If the student status is for a WISE5 run, also notify the teachers over websocket.
   *
   * @param request
   * @param response
   * @throws IOException
   */
  @RequestMapping(method = RequestMethod.POST)
  public ModelAndView saveStudentStatus(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    User signedInUser = ControllerUtil.getSignedInUser();
    String runIdString = request.getParameter("runId");
    String periodIdString = request.getParameter("periodId");
    String workgroupIdString = request.getParameter("workgroupId");
    String status = request.getParameter("status");

    Long runId = null;
    Long periodId = null;
    Long workgroupId = null;

    try {
      runId = new Long(runIdString);
    } catch(NumberFormatException e) {
      e.printStackTrace();
    }

    try {
      periodId = new Long(periodIdString);
    } catch(NumberFormatException e) {
      e.printStackTrace();
    }

    try {
      workgroupId = new Long(workgroupIdString);
    } catch(NumberFormatException e) {
      e.printStackTrace();
    }

    boolean allowedAccess = false;

    /*
     * teachers can not make a request
     * students can make a request if they are in the run and in the workgroup
     */
    if (SecurityUtils.isStudent(signedInUser) && SecurityUtils.isUserInRun(signedInUser, runId) &&
      SecurityUtils.isUserInWorkgroup(signedInUser, workgroupId)) {
      allowedAccess = true;
    }

    if (!allowedAccess) {
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return null;
    }

    StudentStatus studentStatus = vleService.getStudentStatusByWorkgroupId(workgroupId);
    if (studentStatus == null) {
      studentStatus = new StudentStatus(runId, periodId, workgroupId, status);
    } else {
      Calendar now = Calendar.getInstance();
      studentStatus.setTimestamp(new Timestamp(now.getTimeInMillis()));
      studentStatus.setStatus(status);
    }

    vleService.saveStudentStatus(studentStatus);

    try {
      Run run = runService.retrieveById(runId);
      Integer wiseVersion = run.getProject().getWiseVersion();
      if (wiseVersion.equals(5)) {
        this.broadcastStudentStatusToTeacher(studentStatus);
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    return null;
  }

  public void broadcastStudentStatusToTeacher(StudentStatus studentStatus) throws Exception {
    JSONObject message = new JSONObject();
    message.put("type", "studentStatusToTeacher");
    message.put("topic", String.format("/topic/teacher/%s", studentStatus.getRunId()));
    message.put("studentStatus", studentStatus.getStatus());
    redisPublisher.publish(message.toString());
  }

}
