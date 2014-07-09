/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU Lesser General Public License, v2.
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
package org.wise.portal.presentation.web.controllers.teacher.run.announcement;

import java.util.Calendar;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
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
 * @author patrick lawler
 * @version $Id:$
 */
public class ManageAnnouncementController extends AbstractController{

	private RunService runService;

	private AclService<Run> aclService;

	@Autowired
	private AnnouncementService announcementService;

	protected final static String ANNOUNCEMENTID = "announcementId";

	protected final static String ANNOUNCEMENT = "announcement";

	protected final static String RUN = "run";

	protected final static String RUNID = "runId";

	protected final static String MANAGEANNOUNCEMENT_VIEW = "teacher/run/announcement/manageannouncement";


	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest,
	 *      javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		User user = ControllerUtil.getSignedInUser();
		Run run = runService.retrieveById(Long.parseLong(request.getParameter(RUNID)));
		String announcementIdStr = request.getParameter(ANNOUNCEMENTID);
		
		if (request.getMethod() == METHOD_GET) {
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
		} else {
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

	/**
	 * @param runService the runService to set
	 */
	public void setRunService(RunService runService) {
		this.runService = runService;
	}

	/**
	 * @param aclService the aclService to set
	 */
	public void setAclService(AclService<Run> aclService) {
		this.aclService = aclService;
	}	
}
