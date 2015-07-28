/**
 * Copyright (c) 2008-2015 Regents of the University of California (Regents).
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
package org.wise.portal.presentation.web.controllers.teacher.run.announcement;

import java.util.Calendar;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;
import org.wise.portal.domain.announcement.Announcement;
import org.wise.portal.domain.impl.AnnouncementParameters;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.acl.AclService;
import org.wise.portal.service.announcement.AnnouncementService;
import org.wise.portal.service.offering.RunService;

/**
 * Controller for handling Classroom announcements
 * 
 * @author Patrick Lawler
 */
@Controller
@RequestMapping("/teacher/run/announcement/*.html")
public class ManageAnnouncementController {

	@Autowired
	private RunService runService;

	@Autowired
	private AclService<Run> aclService;

	@Autowired
	private AnnouncementService announcementService;

	protected final static String ANNOUNCEMENTID = "announcementId";

	protected final static String ANNOUNCEMENT = "announcement";

	protected final static String RUN = "run";

	protected final static String RUNID = "runId";

	protected final static String MANAGEANNOUNCEMENT_VIEW = "teacher/run/announcement/manageannouncement";

	@RequestMapping(method=RequestMethod.GET)
	protected ModelAndView handleGET(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		User user = ControllerUtil.getSignedInUser();
		Run run = runService.retrieveById(Long.parseLong(request.getParameter(RUNID)));
		String announcementIdStr = request.getParameter(ANNOUNCEMENTID);
		if(this.aclService.hasPermission(run, BasePermission.ADMINISTRATION, user) ||
				this.aclService.hasPermission(run, BasePermission.WRITE, user)){
			ModelAndView modelAndView = new ModelAndView();
			modelAndView.addObject(RUN, run);
			if (announcementIdStr != null) {
				modelAndView.addObject(ANNOUNCEMENT, announcementService.retrieveById(Long.parseLong(announcementIdStr)));
			}
			return modelAndView;
		} else {
			//get the context path e.g. /wise
			String contextPath = request.getContextPath();

			return new ModelAndView(new RedirectView(contextPath + "/accessdenied.html"));
		}
	}

	@RequestMapping(method=RequestMethod.POST)
	protected ModelAndView handlePOST(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		Run run = runService.retrieveById(Long.parseLong(request.getParameter(RUNID)));
		String announcementIdStr = request.getParameter(ANNOUNCEMENTID);

		// it's a POST, either add/edit/remove announcement
		String command = request.getParameter("command");
		if ("remove".equals(command)) {
			Announcement announcement = announcementService.retrieveById(Long.parseLong(announcementIdStr));
			runService.removeAnnouncementFromRun(run.getId(), announcement);
			announcementService.deleteAnnouncement(announcement.getId());

			ModelAndView modelAndView = new ModelAndView(MANAGEANNOUNCEMENT_VIEW);
			modelAndView.addObject(RUN, run);
			return modelAndView;
		} else if ("edit".equals(command)) {
			Announcement announcement = announcementService.retrieveById(Long.parseLong(announcementIdStr));
			AnnouncementParameters params = new AnnouncementParameters();
			params.setId(announcement.getId());
			params.setRunId(Long.parseLong(request.getParameter(RUNID)));
			params.setTimestamp(announcement.getTimestamp());
			params.setTitle(request.getParameter("title"));
			params.setAnnouncement(request.getParameter("announcement"));

			announcementService.updateAnnouncement(params.getId(), params);

			ModelAndView modelAndView = new ModelAndView(MANAGEANNOUNCEMENT_VIEW);
			modelAndView.addObject(RUN, run);
			return modelAndView;
		} else if ("create".equals(command)) {
			AnnouncementParameters params = new AnnouncementParameters();
			params.setRunId(Long.parseLong(request.getParameter(RUNID)));
			params.setTimestamp(Calendar.getInstance().getTime());
			params.setTitle(request.getParameter("title"));
			params.setAnnouncement(request.getParameter("announcement"));

			Announcement announcement = announcementService.createAnnouncement(params);
			runService.addAnnouncementToRun(params.getRunId(), announcement);

			ModelAndView modelAndView = new ModelAndView(MANAGEANNOUNCEMENT_VIEW);
			modelAndView.addObject(RUN, run);
			return modelAndView;
		} else { 
			return null;
		}
	}
}
