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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.wise.portal.domain.announcement.Announcement;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.StudentRunInfo;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.student.StudentService;

/**
 * Controller for Student's index page
 *
 * @author Hiroki Terashima
 */
@Controller
@RequestMapping("/student")
public class StudentIndexController {

  @Autowired
  private RunService runService;

  @Autowired
  private StudentService studentService;

  @RequestMapping(method = RequestMethod.GET)
  protected String handleGET(ModelMap modelMap,
      @RequestParam(value = "pLT", required = false) String previousLoginTime) throws Exception {
    User user = ControllerUtil.getSignedInUser();
    List<Run> runlist = runService.getRunList(user);
    List<StudentRunInfo> current_run_list = new ArrayList<StudentRunInfo>();
    List<StudentRunInfo> ended_run_list = new ArrayList<StudentRunInfo>();
    Date lastLoginTime = getLastLoginTime(previousLoginTime, user);

    boolean hasNewAnnouncements = false;
    for (Run run : runlist) {
      StudentRunInfo studentRunInfo = studentService.getStudentRunInfo(user, run);
      if (run.isEnded()) {
        ended_run_list.add(studentRunInfo);
      } else {
        current_run_list.add(studentRunInfo);
      }
      for (Announcement announcement : run.getAnnouncements()) {
        if (lastLoginTime.before(announcement.getTimestamp())) {
          hasNewAnnouncements = true;
        }
      }
    }

    modelMap.put("user", user);
    modelMap.put("pLT", previousLoginTime);
    modelMap.put("lastLoginTime", lastLoginTime);
    modelMap.put("hasNewAnnouncements", hasNewAnnouncements);
    modelMap.put("current_run_list", current_run_list);
    modelMap.put("ended_run_list", ended_run_list);
    return "student/index";
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
