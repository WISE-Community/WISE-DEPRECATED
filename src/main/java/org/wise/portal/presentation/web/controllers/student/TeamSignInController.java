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
package org.wise.portal.presentation.web.controllers.student;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Properties;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.hibernate.StaleObjectStateException;
import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.HibernateOptimisticLockingFailureException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.HttpSessionRequiredException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.support.SessionStatus;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.project.impl.Projectcode;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.StudentRunInfo;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.validators.student.TeamSignInFormValidator;
import org.wise.portal.presentation.web.TeamSignInForm;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.attendance.StudentAttendanceService;
import org.wise.portal.service.group.GroupService;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.student.StudentService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.workgroup.WorkgroupService;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.*;

/**
 * Controller for handling team sign-ins before students start the project. The first user
 * entered in the form must be already signed-in and associated with a specific
 * <code>Run</code> and specific period. The second and third users entered will be
 * associated with the same <code>Run</code> and same period as the first user if
 * they are not already associated.
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
@Controller
@SessionAttributes("teamSignInForm")
@RequestMapping("/student/teamsignin.html")
public class TeamSignInController {

  @Autowired
  private UserService userService;

  @Autowired
  private WorkgroupService workgroupService;

  @Autowired
  private RunService runService;

  @Autowired
  private StudentService studentService;

  @Autowired
  private ProjectService projectService;

  @Autowired
  private StudentAttendanceService studentAttendanceService;

  @Autowired
  private GroupService groupService;

  @Autowired
  private Properties wiseProperties;

  @Autowired
  private TeamSignInFormValidator teamSignInFormValidator;

  /**
   * On submission of the Team Sign In form, the workgroup is updated and the project is launched.
   *
   * Assume that the usernames are valid usernames that exist in the data store
   *
   * TODO refactor. function is too long
   */
  @RequestMapping(method = RequestMethod.POST)
  protected synchronized String onSubmit(
      @ModelAttribute("teamSignInForm") TeamSignInForm teamSignInForm,
      BindingResult result,
      HttpServletRequest request,
      HttpServletResponse response,
      SessionStatus status) throws Exception {
    teamSignInFormValidator.validate(teamSignInForm, result);
    if (result.hasErrors()) {
      return "student/teamsignin";
    }

    JSONArray presentUserIds = new JSONArray();
    JSONArray absentUserIds = new JSONArray();
    List<User> users = new ArrayList<User>(10);

    for (int u = 0; u < 10; u++) {
      int userIndex = u + 1;
      String username = teamSignInForm.getUsernameByString("username" + userIndex);
      users.add(userService.retrieveUserByUsername(username));
    }

    List<Boolean> absent = new ArrayList<Boolean>(10);
    for (int a = 0; a < 10; a++) {
      int absentIndex = a + 1;
      Boolean isAbsent = teamSignInForm.getIsAbsentByString("absent" + absentIndex);
      absent.add(isAbsent);
    }

    Run run = runService.retrieveById(teamSignInForm.getRunId());
    User signedInUser = users.get(0);
    Group period = run.getPeriodOfStudent(signedInUser);
    StudentRunInfo studentRunInfo = studentService.getStudentRunInfo(signedInUser, run);
    Projectcode projectcode = new Projectcode(run.getRuncode(), studentRunInfo.getGroup().getName());

    Set<User> membersLoggedIn = new HashSet<User>();
    String workgroupname = "Workgroup for " + signedInUser.getUserDetails().getUsername();
    membersLoggedIn.add(signedInUser);
    presentUserIds.put(signedInUser.getId());

    List<Workgroup> workgroups = workgroupService.getWorkgroupListByRunAndUser(run, signedInUser);
    Workgroup workgroup = null;
    Set<User> membersInWorkgroup = new HashSet<User>();
    if (workgroups != null && workgroups.size() > 0) {
      workgroup = workgroups.get(0);
      membersInWorkgroup = workgroups.get(0).getMembers();
    }

    for (int uIndex = 1; uIndex < users.size(); uIndex++) {
      User user = users.get(uIndex);
      Boolean isAbsent = absent.get(uIndex);
      if (user != null && !isAbsent) {
        List<Workgroup> workgroupListByRunAndUser = workgroupService.getWorkgroupListByRunAndUser(run, user);
        boolean userIsInThisWorkgroup = false;
        boolean userIsInAnotherWorkgroup = false;
        for (Workgroup tempWorkgroup : workgroupListByRunAndUser) {
          if (workgroup.equals(tempWorkgroup)) {
            userIsInThisWorkgroup = true;
          } else if (!workgroup.equals(tempWorkgroup)) {
            userIsInAnotherWorkgroup = true;
          }
        }

        if (userIsInThisWorkgroup) {
        } else if (userIsInAnotherWorkgroup) {
          // the user is in another workgroup for this run and not in this workgroup so we will not add them
        } else {
          // the user is not in a workgroup for this run so we will add them to the run

          /*
           * get the period the student is in. this will only occur if the
           * student has registered to the run but hasn't created a workgroup
           * yet
           */
          Group periodOfStudent = run.getPeriodOfStudent(user);

          if (periodOfStudent != null) {
            /*
             * The student is already in a period for the run,
             * which will only occur if the student has registered
             * to the run but hasn't created or joined a workgroup yet
             */

            String userPeriodName = periodOfStudent.getName();
            String user1PeriodName = projectcode.getRunPeriod();

            if (!user1PeriodName.equals(userPeriodName)) {
              /*
               * the periods are different so we will remove the student
               * from the period they are in so that we can add them to
               * the same period as the signed in user
               */
              groupService.removeMember(periodOfStudent, user);
            }
          }

          userService.updateUser(user);
          if (!run.isStudentAssociatedToThisRun(user)) {
            studentService.addStudentToRun(user, projectcode);
          }
        }

        if (!userIsInAnotherWorkgroup) {
          membersLoggedIn.add(user);
          workgroupname += user.getUserDetails().getUsername();
          workgroups.addAll(workgroupService.getWorkgroupListByRunAndUser(run, user));
          presentUserIds.put(user.getId());
        }
      }
    }

    if (workgroups.size() == 0) {
      workgroup = workgroupService.createWorkgroup(workgroupname, membersLoggedIn, run, period);
    } else if (workgroups.size() == 1) {
      workgroup = workgroups.get(0);
      workgroupService.addMembers(workgroup, membersLoggedIn);
    } else {
      // more than one user has created a workgroup for this run.
      // TODO HT gather requirements and find out what should be done in this case
      // for now, just choose one
      workgroup = workgroups.get(0);
      workgroupService.addMembers(workgroup, membersLoggedIn);
    }

    Iterator<User> membersInWorkgroupIter = membersInWorkgroup.iterator();
    while (membersInWorkgroupIter.hasNext()) {
      boolean memberLoggedIn = false;
      User memberInWorkgroup = membersInWorkgroupIter.next();

      /*
       * check if the user has logged in and is present
       * by looping through all the user ids in presentUserIds
       * and seeing if the user id is in the presentUserIds
       * array
       */
      for (int x = 0; x < presentUserIds.length(); x++) {
        long presentUserId = presentUserIds.getLong(x);
        if (presentUserId == memberInWorkgroup.getId()) {
          memberLoggedIn = true;
          break;
        }
      }

      if (!memberLoggedIn) {
        absentUserIds.put(memberInWorkgroup.getId());
      }
    }

    Long workgroupId = workgroup.getId();
    Long runId = run.getId();
    Date loginTimestamp = new Date();

    studentAttendanceService.addStudentAttendanceEntry(workgroupId, runId, loginTimestamp,
        presentUserIds.toString(), absentUserIds.toString());

    int maxLoop = 30;  // to ensure that the following while loop gets run at most this many times.
    int currentLoopIndex = 0;
    while (currentLoopIndex < maxLoop) {
      try {
        runService.updateRunStatistics(run.getId());
      } catch (HibernateOptimisticLockingFailureException holfe) {
        // multiple students tried to update run statistics at the same time, resulting in the exception. try again.
        currentLoopIndex++;
        continue;
      } catch (StaleObjectStateException sose) {
        // multiple students tried to create an account at the same time, resulting in this exception. try saving again.
        currentLoopIndex++;
        continue;
      }
      // if it reaches here, it means that HibernateOptimisticLockingFailureException was not thrown, so we can exit the loop.
      break;
    }

    StartProjectController.notifyServletSession(request, run);
    ModelAndView modelAndView = projectService.launchProject(workgroup, request.getContextPath());
    status.setComplete();
    response.sendRedirect(((RedirectView) modelAndView.getView()).getUrl());
    return null;
  }

  @RequestMapping(method = RequestMethod.GET)
  public String initializeSignInForm(ModelMap modelMap, @RequestParam(value = "runId") Long runId)
      throws Exception {
    User user = ControllerUtil.getSignedInUser();
    String signedInUsername = user.getUserDetails().getUsername();

    TeamSignInForm form = new TeamSignInForm();
    form.setUsername1(signedInUsername);
    String maxWorkgroupSizeStr = wiseProperties.getProperty("maxWorkgroupSize", "3");
    int maxWorkgroupSize = Integer.parseInt(maxWorkgroupSizeStr);
    String googleClientId = wiseProperties.getProperty("google.clientId");
    if (googleClientId != null) {
      form.enableGoogleSignIn();
    }

    try {
      Run run = runService.retrieveById(runId);
      if (run.getStarttime().after(new Timestamp(System.currentTimeMillis()))) {
        return "errors/friendlyerror";
      }
      User signedInUser = ControllerUtil.getSignedInUser();
      if (!run.isStudentAssociatedToThisRun(signedInUser)) {
        return "student/index";
      }
      Integer runMaxWorkgroupSize = run.getMaxWorkgroupSize();
      if (runMaxWorkgroupSize != null) {
        maxWorkgroupSize = runMaxWorkgroupSize;
      }

      form.setMaxWorkgroupSize(maxWorkgroupSize);
      form.setRunId(runId);
      StudentRunInfo studentRunInfo = studentService.getStudentRunInfo(user, run);

      /*
       * try to get the workgroup if it exists. if the student is running
       * the project for the first time, the workgroup will not exist
       */
      Workgroup workgroup = studentRunInfo.getWorkgroup();
      if (workgroup != null) {
        Set<User> members = workgroup.getMembers();
        int numMembersCounter = 2;

        Iterator<User> membersIterator = members.iterator();
        while (membersIterator.hasNext()) {
          User member = membersIterator.next();
          String username = member.getUserDetails().getUsername();

          if (username != null && !username.equals(signedInUsername)) {
            if (numMembersCounter == 2) {
              form.setUsername2(username);
              form.setExistingMember2(true);
            } else if (numMembersCounter == 3) {
              form.setUsername3(username);
              form.setExistingMember3(true);
            } else if (numMembersCounter == 4) {
              form.setUsername4(username);
              form.setExistingMember4(true);
            } else if (numMembersCounter == 5) {
              form.setUsername5(username);
              form.setExistingMember5(true);
            } else if (numMembersCounter == 6) {
              form.setUsername6(username);
              form.setExistingMember6(true);
            } else if (numMembersCounter == 7) {
              form.setUsername7(username);
              form.setExistingMember7(true);
            } else if (numMembersCounter == 8) {
              form.setUsername8(username);
              form.setExistingMember8(true);
            } else if (numMembersCounter == 9) {
              form.setUsername9(username);
              form.setExistingMember9(true);
            } else if (numMembersCounter == 10) {
              form.setUsername10(username);
              form.setExistingMember10(true);
            }
            numMembersCounter++;
          }
        }
      }
      modelMap.put("teamSignInForm", form);
      return "student/teamsignin";
    } catch (NumberFormatException nfe) {
      return "student/index";
    }
  }

  /**
   * When the session is expired, send student back to form page
   */
  @ExceptionHandler(HttpSessionRequiredException.class)
  public ModelAndView handleSessionExpired(HttpServletRequest request) {
    ModelAndView mav = new ModelAndView();
    String contextPath = request.getContextPath();
    String teamSignInFormPath = contextPath + "/student/teamsignin.html";
    String runIdString = request.getParameter("runId");
    if (runIdString != null) {
      teamSignInFormPath += "?runId="+runIdString;
    }
    mav.setView(new RedirectView(teamSignInFormPath));
    return mav;
  }
}
