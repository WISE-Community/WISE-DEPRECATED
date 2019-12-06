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
package org.wise.portal.presentation.web.controllers.run;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.workgroup.WorkgroupService;

public class RunUtil {

  /**
   * Get the signed in user info in a JSONObject
   * @param run
   * @param workgroupService
   * @return a JSONObject containing the user info for the signed in user
   */
  public static JSONObject getMyUserInfo(Run run, WorkgroupService workgroupService) {
    JSONObject myUserInfoJSONObject = new JSONObject();
    User signedInUser = ControllerUtil.getSignedInUser();
    List<Workgroup> workgroupListByRunAndUser =
        workgroupService.getWorkgroupListByRunAndUser(run, signedInUser);
    if (workgroupListByRunAndUser.size()==0 && signedInUser.isAdmin()) {
    } else {
      Workgroup workgroup = workgroupListByRunAndUser.get(0);
      Long workgroupId = workgroup.getId();
      String usernamesFromWorkgroup = getUsernamesFromWorkgroup(workgroup);
      try {
        myUserInfoJSONObject.put("username", usernamesFromWorkgroup);
        myUserInfoJSONObject.put("workgroupId", workgroupId);
      } catch (JSONException e) {
        e.printStackTrace();
      }
      Group periodGroup = workgroup.getPeriod();
      if (periodGroup != null) {
        String periodName = periodGroup.getName();
        String periodId = periodGroup.getId().toString();

        try {
          myUserInfoJSONObject.put("periodName", periodName);
          myUserInfoJSONObject.put("periodId", periodId);
        } catch (JSONException e) {
          e.printStackTrace();
        }
      }
    }
    return myUserInfoJSONObject;
  }


  /**
   * Get the classmate user info in a JSONArray
   * @param run
   * @param workgroupService
   * @return a JSONArray containing classmate info
   */
  public static JSONArray getClassmateUserInfos(Run run, WorkgroupService workgroupService,
      RunService runService) {
    JSONArray classmateUserInfosJSONArray = new JSONArray();
    List<Workgroup> workgroups = null;
    try {
      workgroups = runService.getWorkgroups(run.getId());
    } catch (ObjectNotFoundException e1) {
      e1.printStackTrace();
    }

    if (workgroups != null) {
      for (Workgroup workgroup : workgroups) {
        try {
          JSONObject classmateJSONObject = new JSONObject();

          if (!workgroup.isTeacherWorkgroup()) {
            classmateJSONObject.put("workgroupId", workgroup.getId());
            Set<User> members = workgroup.getMembers();
            ArrayList<Long> wiseIdsArrayList = new ArrayList<Long>();

            Iterator<User> membersIter = members.iterator();
            while (membersIter.hasNext()) {
              User user = membersIter.next();
              Long wiseId = user.getId();
              wiseIdsArrayList.add(wiseId);
            }

            Collections.sort(wiseIdsArrayList);
            JSONArray wiseIdsJSONArray = new JSONArray();
            for (int x = 0; x < wiseIdsArrayList.size(); x++) {
              Long wiseId = wiseIdsArrayList.get(x);
              wiseIdsJSONArray.put(wiseId);
            }

            classmateJSONObject.put("wiseIds", wiseIdsJSONArray);
            if (workgroup.getPeriod() != null) {
              classmateJSONObject.put("periodId", workgroup.getPeriod().getId());
              classmateJSONObject.put("periodName", workgroup.getPeriod().getName());
            } else {
              classmateJSONObject.put("periodId", JSONObject.NULL);
            }

            String userIdsFromWorkgroup = getUserIdsFromWorkgroup(workgroup);
            classmateJSONObject.put("userIds", userIdsFromWorkgroup);
            classmateUserInfosJSONArray.put(classmateJSONObject);
          }
        } catch (JSONException e) {
          e.printStackTrace();
        }
      }
    }
    return classmateUserInfosJSONArray;
  }

  /**
   * Get the teacher user info in a JSONObject
   * @param run the run object
   * @param workgroupService
   * @return a JSONObject containing the teacher user info such as workgroup id
   * and name
   */
  public static JSONObject getTeacherUserInfo(Run run, WorkgroupService workgroupService) {
    JSONObject teacherUserInfo = new JSONObject();
    if (run != null) {
      User owner = run.getOwner();
      List<Workgroup> teacherWorkgroups = workgroupService.getWorkgroupListByRunAndUser(run, owner);
      Workgroup teacherWorkgroup = teacherWorkgroups.get(0);

      try {
        teacherUserInfo.put("workgroupId", teacherWorkgroup.getId());
        teacherUserInfo.put("username", teacherWorkgroup.generateWorkgroupName());
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return teacherUserInfo;
  }

  /**
   * Get an array of shared teacher user infos in a JSONArray
   * @param run the run object
   * @param workgroupService
   * @return a JSONArray containing shared teacher user infos
   */
  public static JSONArray getSharedTeacherUserInfos(Run run, WorkgroupService workgroupService) {
    JSONArray sharedTeacherUserInfos = new JSONArray();
    if (run != null) {
      Iterator<User> sharedOwnersIterator = run.getSharedowners().iterator();
      while (sharedOwnersIterator.hasNext()) {
        User sharedOwner = sharedOwnersIterator.next();
        List<Workgroup> sharedTeacherWorkgroups =
            workgroupService.getWorkgroupListByRunAndUser(run, sharedOwner);

        if (sharedTeacherWorkgroups.size() > 0) {
          Workgroup sharedTeacherWorkgroup = sharedTeacherWorkgroups.get(0);
          JSONObject sharedTeacherUserInfo = new JSONObject();

          try {
            sharedTeacherUserInfo.put("workgroupId", sharedTeacherWorkgroup.getId());
            sharedTeacherUserInfo.put("username", sharedTeacherWorkgroup.generateWorkgroupName());
          } catch (JSONException e) {
            e.printStackTrace();
          }
          sharedTeacherUserInfos.put(sharedTeacherUserInfo);
        }
      }
    }
    return sharedTeacherUserInfos;
  }

  /**
   * Get the run info for the run and put it into a JSON object
   * @param run the run to obtain info for
   * @return a JSONObject that contains the run info
   */
  public static JSONObject getRunInfo(Run run) {
    JSONObject runInfo = new JSONObject();

    try {
      Long runId = run.getId();
      runInfo.put("runId", runId);
    } catch (JSONException e) {
      e.printStackTrace();
    }

    try {
      runInfo.put("startTime", run.getStartTimeMilliseconds());
    } catch (JSONException e) {
      e.printStackTrace();
    }

    try {
      runInfo.put("endTime", run.getEndTimeMilliseconds());
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return runInfo;
  }

  /**
   * Obtain the first name, last name, and login for the user
   * @param user the User we want to obtain the first, last, login for
   * @return the first, last and login in this format below
   * Jennifer Chiu (JenniferC829)
   */
  public static String getFirstNameLastNameLogin(User user) {
    String firstName = "";
    String lastName = "";
    String username = "";
    MutableUserDetails userDetails = user.getUserDetails();
    if (userDetails != null) {
      username = userDetails.getUsername();
      firstName = userDetails.getFirstname();
      lastName = userDetails.getLastname();
    }
    return firstName + " " + lastName + " (" + username + ")";
  }

  /**
   * Obtain the user names for this workgroup
   * @param workgroup a Workgroup that we want the names from
   * @return a string of user names delimited by :
   * e.g.
   * "Jennifer Chiu (JenniferC829):helen zhang (helenz1115a)"
   */
  public static String getUsernamesFromWorkgroup(Workgroup workgroup) {
    StringBuffer usernames = new StringBuffer();
    Set<User> members = workgroup.getMembers();
    Iterator<User> iterator = members.iterator();
    while (iterator.hasNext()) {
      User user = iterator.next();
      String firstNameLastNameLogin = getFirstNameLastNameLogin(user);
      if (usernames.length() != 0) {
        usernames.append(":");
      }
      usernames.append(firstNameLastNameLogin);
    }
    return usernames.toString();
  }

  /**
   * Get the wise ids as a string delimited by ':'
   * @param workgroup the workgroup id to obtain wise ids for
   * @return a string containing the wise ids delimited by ':'
   */
  public static String getUserIdsFromWorkgroup(Workgroup workgroup) {
    StringBuffer userIds = new StringBuffer();
    Set<User> members = workgroup.getMembers();
    Iterator<User> iterator = members.iterator();
    while (iterator.hasNext()) {
      User user = iterator.next();
      Long userId = user.getId();
      if (userIds.length() != 0) {
        userIds.append(":");
      }
      userIds.append(userId);
    }
    return userIds.toString();
  }
}
