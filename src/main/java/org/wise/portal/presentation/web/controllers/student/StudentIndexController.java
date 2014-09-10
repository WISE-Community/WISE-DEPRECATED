/**
 * Copyright (c) 2007-2014 Regents of the University of California (Regents). 
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
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 * 
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.presentation.web.controllers.student;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
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
 * @version $Id$
 */
@Controller
@RequestMapping("/student/index.html")
public class StudentIndexController {

	@Autowired
	private RunService runService;
	
	@Autowired
	private StudentService studentService;
	
	protected final static String CURRENT_STUDENTRUNINFO_LIST_KEY = "current_run_list";

	protected final static String ENDED_STUDENTRUNINFO_LIST_KEY = "ended_run_list";

	private static final String VIEW_NAME = "student/index";
	
	private final static String CURRENT_DATE = "current_date";

	static final String DEFAULT_PREVIEW_WORKGROUP_NAME = "Your test workgroup";

	private static final String VIEW_ANNOUNCEMENTS_RUNID = "announcementRunIds";

	private static final String SHOW_NEW_ANNOUNCEMENTS = "showNewAnnouncements";
	
	private static final String NEW_ANNOUNCEMENTS = "newAnnouncements";
	
	private static final String PREVIOUS_LOGIN_STRING = "pLT";
	
	private static final String LAST_LOGIN = "lastLoginTime";

	@RequestMapping(method=RequestMethod.GET)
	protected ModelAndView handleGET(
			HttpServletRequest request,
			HttpServletResponse response) throws Exception {

    	ModelAndView modelAndView = new ModelAndView(VIEW_NAME);
    	ControllerUtil.addUserToModelAndView(request, modelAndView);
		User user = ControllerUtil.getSignedInUser();
    	
		List<Run> runlist = runService.getRunList(user);
		List<StudentRunInfo> current_run_list = new ArrayList<StudentRunInfo>();
		List<StudentRunInfo> ended_run_list = new ArrayList<StudentRunInfo>();
		boolean hasNewAnnouncements = false;
		
		List<Long> announcementRuns = new ArrayList<Long>();
		Date lastLoginTime = new Date();
		String pLT = request.getParameter("pLT");
		
		if (user.getUserDetails() != null && user.getUserDetails() instanceof StudentUserDetails) {
			lastLoginTime = ((StudentUserDetails) user.getUserDetails()).getLastLoginTime();
		}
		
		for (Run run : runlist) {
			StudentRunInfo studentRunInfo = studentService.getStudentRunInfo(user, run);

			if (run.isEnded()) {
				ended_run_list.add(studentRunInfo);
			} else {
				current_run_list.add(studentRunInfo);
			}
			
			// check if there are new announcements for this run
			if (user.getUserDetails() != null && user.getUserDetails() instanceof StudentUserDetails) {
				if (pLT != null) {
					Calendar cal = Calendar.getInstance();
					try {
						Long previousLogin = new Long(pLT);
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
						if(!announcementRuns.contains(run.getId())){
							announcementRuns.add(run.getId());
						}
					}
				}
			}
		}
		
		String showNewAnnouncements = request.getParameter(SHOW_NEW_ANNOUNCEMENTS);
		boolean isShowNewAnnouncements = false;
		if (showNewAnnouncements == null) {
			isShowNewAnnouncements = true;
		} else {
			isShowNewAnnouncements = new Boolean(showNewAnnouncements);
		}

		List<StudentRunInfo> joinedRunInfo = new ArrayList<StudentRunInfo>();
		joinedRunInfo.addAll(current_run_list);
		joinedRunInfo.addAll(ended_run_list);
		
		String announcementRunIds = "none";
		if (isShowNewAnnouncements && hasNewAnnouncements) {
			announcementRunIds = "";
			for (int i=0; i < announcementRuns.size(); i ++) {
				if (i == announcementRuns.size() - 1) {
					announcementRunIds = announcementRunIds + (announcementRuns.get(i).toString());
				} else {
					announcementRunIds = announcementRunIds + (announcementRuns.get(i).toString()) + ",";
				}
			}	
		}
		
		Integer newAnnouncements = announcementRuns.size();
		
		modelAndView.addObject(PREVIOUS_LOGIN_STRING, pLT);
		modelAndView.addObject(LAST_LOGIN, lastLoginTime);
		modelAndView.addObject(NEW_ANNOUNCEMENTS, newAnnouncements);
		modelAndView.addObject(VIEW_ANNOUNCEMENTS_RUNID, announcementRunIds);
		modelAndView.addObject(CURRENT_STUDENTRUNINFO_LIST_KEY, current_run_list);
		modelAndView.addObject(ENDED_STUDENTRUNINFO_LIST_KEY, ended_run_list);
		modelAndView.addObject(CURRENT_DATE, null);

        return modelAndView;
	}
}
