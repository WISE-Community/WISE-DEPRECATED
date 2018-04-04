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

import org.hibernate.StaleObjectStateException;
import org.json.JSONException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.HibernateOptimisticLockingFailureException;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.PeriodNotFoundException;
import org.wise.portal.domain.StudentUserAlreadyAssociatedWithRunException;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.Projectcode;
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

  /**
   * Get the run information to display to the student when they want to register for a run.
   * @param runCode The run code string.
   * @return A JSON object string containing information about the run such as the id, run code, title,
   * teacher name, and periods.
   */
  @RequestMapping(value = "/run/info", method = RequestMethod.GET)
  protected String getRunRegisterInfo(@RequestParam("runCode") String runCode) {
    JSONObject runRegisterInfo = new JSONObject();
    boolean foundRun = false;
    try {
      Run run = runService.retrieveRunByRuncode(runCode);
      setRunInformationForStudent(runRegisterInfo, run);
      runRegisterInfo.put("periods", this.getPeriods(run));
      foundRun = true;
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    } catch (JSONException e) {
      e.printStackTrace();
    }
    if (!foundRun) {
      try {
        runRegisterInfo.put("error", "runNotFound");
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return runRegisterInfo.toString();
  }

  /**
   * Add a student to a run.
   * @param runCode The run code string.
   * @param period The period string.
   * @return If the student is successfully added to the run, we will return a JSON object string
   * that contains the information about the run. If the student is not successfully added to the
   * run, we will return a JSON object string containing an error field with an error string.
   */
  @RequestMapping(value = "/run/register", method = RequestMethod.POST)
  protected String addStudentToRun(@RequestParam("runCode") String runCode,
      @RequestParam("period") String period) {
    JSONObject responseJSONObject = new JSONObject();
    String error = "";
    User user = ControllerUtil.getSignedInUser();
    Projectcode projectCode = new Projectcode(runCode, period);
    boolean addedStudent = false;
    try {
      int maxLoop = 100; // To ensure that the following while loop gets run at most this many times.
      int currentLoopIndex = 0;
      while (currentLoopIndex < maxLoop) {
        try {
          studentService.addStudentToRun(user, projectCode);
          Run run = runService.retrieveRunByRuncode(runCode);
          setRunInformationForStudent(responseJSONObject, run);
          responseJSONObject.put("period", period);
          addedStudent = true;
        } catch (HibernateOptimisticLockingFailureException holfe) {
          /*
           * Multiple students tried to create an account at the same time, resulting in this exception.
           * We will try saving again.
           */
          currentLoopIndex++;
          continue;
        } catch (StaleObjectStateException sose) {
          /*
           * Multiple students tried to create an account at the same time, resulting in this exception.
           * We will try saving again.
           */
          currentLoopIndex++;
          continue;
        } catch (JSONException je) {
          je.printStackTrace();
        }
        /*
         * If it reaches here, it means the hibernate optimistic locking exception was not thrown so we
         * can exit the loop.
         */
        break;
      }
    } catch (ObjectNotFoundException e) {
      error = "runCodeNotFound";
    } catch (PeriodNotFoundException e) {
      error = "periodNotFound";
    } catch (StudentUserAlreadyAssociatedWithRunException se) {
      error = "studentAlreadyAssociatedWithRun";
    }

    if (!error.equals("")) {
      // there was an error and we were unable to add the student to the run
      try {
        responseJSONObject.put("error", error);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    } else if (!addedStudent) {
      /*
       * there were no errors but we were unable to add the student to the
       * run for some reason so we will just return a generic error message
       */
      try {
        responseJSONObject.put("error", "failedToAddStudentToRun");
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return responseJSONObject.toString();
  }

  /**
   * Get the run information as a JSON object. We will only get the information that the student
   * needs.
   * @param responseJSONObject A JSON object to populate the values into.
   * @param run The run object.
   * @return The passed in JSON object populated with the information about the run.
   */
  private JSONObject setRunInformationForStudent(JSONObject responseJSONObject, Run run) {
    try {
      responseJSONObject.put("runTitle", run.getName());
      responseJSONObject.put("runId", run.getId());
      responseJSONObject.put("runCode", run.getRuncode());
      responseJSONObject.put("teacherName", getTeacherNameFromRun(run));
      responseJSONObject.put("startTime", run.getStarttime());
      responseJSONObject.put("endTime", run.getEndtime());
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return responseJSONObject;
  }

  /**
   * Get the periods in a run.
   * @param run The run object.
   * @return A JSON array containing strings.
   */
  private JSONArray getPeriods(Run run) {
    JSONArray periodsJSONArray = new JSONArray();
    Set<Group> periods = run.getPeriods();
    for (Group period : periods) {
      periodsJSONArray.put(period.getName());
    }
    return periodsJSONArray;
  }

  /**
   * Get the name of the teacher that owns the run.
   * @param run The run object.
   * @return A string containing the first name and last name of the teacher that owns the run.
   */
  private String getTeacherNameFromRun(Run run) {
    User owner = run.getOwner();
    MutableUserDetails userDetails = owner.getUserDetails();
    String firstName = userDetails.getFirstname();
    String lastName = userDetails.getLastname();
    return firstName + " " + lastName;
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
