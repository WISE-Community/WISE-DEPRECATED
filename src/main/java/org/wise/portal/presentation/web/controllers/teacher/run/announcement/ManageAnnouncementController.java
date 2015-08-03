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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
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
@RequestMapping("/teacher/run/announcement/*")
public class ManageAnnouncementController {

	@Autowired
	private RunService runService;

	@Autowired
	private AclService<Run> aclService;

	@Autowired
	private AnnouncementService announcementService;

	@RequestMapping(method = RequestMethod.GET)
	protected String handleGET(
            ModelMap modelMap,
            @RequestParam(value = "runId", required = false) Long runId,
            @RequestParam(value = "announcementId", required = false) Integer announcementId) throws Exception {
		User user = ControllerUtil.getSignedInUser();
		Run run = runService.retrieveById(runId);
		if (this.aclService.hasPermission(run, BasePermission.ADMINISTRATION, user) ||
				this.aclService.hasPermission(run, BasePermission.WRITE, user)){
            modelMap.put("run", run);
			if (announcementId != null) {
                modelMap.put("announcement", announcementService.retrieveById(announcementId));
			}
			return null;
		} else {
			return "redirect:/accessdenied.html";
		}
	}

	@RequestMapping(method = RequestMethod.POST)
	protected String handlePOST(
            ModelMap modelMap,
            HttpServletRequest request,
            @RequestParam(value = "command") String command,
            @RequestParam(value = "runId", required = false) Long runId,
            @RequestParam(value = "announcementId", required = false) Integer announcementId) throws Exception {
		Run run = runService.retrieveById(runId);

		// it's a POST, either add/edit/remove announcement
		if ("remove".equals(command)) {
			Announcement announcement = announcementService.retrieveById(announcementId);
			runService.removeAnnouncementFromRun(run.getId(), announcement);
			announcementService.deleteAnnouncement(announcement.getId());

		} else if ("edit".equals(command)) {
			Announcement announcement = announcementService.retrieveById(announcementId);
			AnnouncementParameters params = new AnnouncementParameters();
			params.setId(announcement.getId());
			params.setRunId(Long.parseLong(request.getParameter("runId")));
			params.setTimestamp(announcement.getTimestamp());
			params.setTitle(request.getParameter("title"));
			params.setAnnouncement(request.getParameter("announcement"));

			announcementService.updateAnnouncement(params.getId(), params);

		} else if ("create".equals(command)) {
			AnnouncementParameters params = new AnnouncementParameters();
			params.setRunId(Long.parseLong(request.getParameter("runId")));
			params.setTimestamp(Calendar.getInstance().getTime());
			params.setTitle(request.getParameter("title"));
			params.setAnnouncement(request.getParameter("announcement"));

			Announcement announcement = announcementService.createAnnouncement(params);
			runService.addAnnouncementToRun(params.getRunId(), announcement);

		} else {
			return null;
		}

        modelMap.put("run", run);
		return "teacher/run/announcement/manageannouncement";
	}
}
