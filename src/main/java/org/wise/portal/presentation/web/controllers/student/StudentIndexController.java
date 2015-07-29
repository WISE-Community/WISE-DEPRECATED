/**
 * Copyright (c) 2007-2015 Regents of the University of California (Regents).
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

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

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
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.student.StudentService;

import com.ibm.icu.util.Calendar;

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
    protected String handleGET(
            ModelMap modelMap,
            @RequestParam(value = "pLT", required = false) String previousLoginTime
    ) throws Exception {

        User user = ControllerUtil.getSignedInUser();

        List<Run> runlist = runService.getRunList(user);
        List<StudentRunInfo> current_run_list = new ArrayList<StudentRunInfo>();
        List<StudentRunInfo> ended_run_list = new ArrayList<StudentRunInfo>();
        boolean hasNewAnnouncements = false;

        List<Long> announcementRuns = new ArrayList<Long>();

        Date lastLoginTime = null;
        if (user.getUserDetails() != null && user.getUserDetails() instanceof StudentUserDetails) {
            lastLoginTime = ((StudentUserDetails) user.getUserDetails()).getLastLoginTime();

            for (Run run : runlist) {
                StudentRunInfo studentRunInfo = studentService.getStudentRunInfo(user, run);

                if (run.isEnded()) {
                    ended_run_list.add(studentRunInfo);
                } else {
                    current_run_list.add(studentRunInfo);
                }

                // check if there are new announcements for this run
                if (previousLoginTime != null) {
                    Calendar cal = Calendar.getInstance();
                    try {
                        Long previousLogin = new Long(previousLoginTime);
                        cal.setTimeInMillis(previousLogin);
                        lastLoginTime = cal.getTime();
                    } catch (NumberFormatException nfe) {
                        // if there was an exception parsing previous last login time, such as user appending pLT=1302049863000\, assume this is the lasttimelogging in
                        //lastLoginTime = cal.getTime();
                    }
                }
                for (Announcement announcement : run.getAnnouncements()) {
                    if (lastLoginTime == null ||
                            lastLoginTime.before(announcement.getTimestamp())) {
                        hasNewAnnouncements = true;
                        if (!announcementRuns.contains(run.getId())) {
                            announcementRuns.add(run.getId());
                        }
                    }
                }

            }
        }

        List<StudentRunInfo> joinedRunInfo = new ArrayList<StudentRunInfo>();
        joinedRunInfo.addAll(current_run_list);
        joinedRunInfo.addAll(ended_run_list);

        String announcementRunIds = "none";
        if (hasNewAnnouncements) {
            announcementRunIds = "";
            for (int i = 0; i < announcementRuns.size(); i++) {
                if (i == announcementRuns.size() - 1) {
                    announcementRunIds = announcementRunIds + (announcementRuns.get(i).toString());
                } else {
                    announcementRunIds = announcementRunIds + (announcementRuns.get(i).toString()) + ",";
                }
            }
        }

        Integer newAnnouncements = announcementRuns.size();

        modelMap.put("user", user);
        modelMap.put("pLT", previousLoginTime);
        modelMap.put("lastLoginTime", lastLoginTime);
        modelMap.put("newAnnouncements", newAnnouncements);
        modelMap.put("announcementRunIds", announcementRunIds);
        modelMap.put("current_run_list", current_run_list);
        modelMap.put("ended_run_list", ended_run_list);

        return "student/index";
    }
}