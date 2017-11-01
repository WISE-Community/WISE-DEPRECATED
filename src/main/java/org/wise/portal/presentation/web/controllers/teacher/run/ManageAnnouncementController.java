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
package org.wise.portal.presentation.web.controllers.teacher.run;

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
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.run.RunService;

/**
 * Controller for creating and editing classroom run announcements
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

  /**
   * Handles retrieving announcements to be managed by the teacher
   * @param modelMap contains objects needed for teacher to view announcements
   * @param runId id of the Run
   * @param announcementId id of the Announcement
   * @return
   * @throws Exception
   */
  @RequestMapping(method = RequestMethod.GET)
  protected String viewAnnouncements(
    ModelMap modelMap,
    @RequestParam(value = "runId") Long runId,
    @RequestParam(value = "announcementId", required = false) Integer announcementId) throws Exception {

    User user = ControllerUtil.getSignedInUser();
    Run run = runService.retrieveById(runId);

    // check that the logged-in user has permission for this run
    if (user.isAdmin() ||
      user.getUserDetails().hasGrantedAuthority(UserDetailsService.RESEARCHER_ROLE) ||
      this.aclService.hasPermission(run, BasePermission.ADMINISTRATION, user) ||
      this.aclService.hasPermission(run, BasePermission.WRITE, user)) {

      modelMap.put("run", run);
      if (announcementId != null) {
        modelMap.put("announcement", announcementService.retrieveById(announcementId));
      }
      return null;
    } else {
      return "errors/accessdenied";
    }
  }

  /**
   * Handles creating, editing, and deleting announcements
   * @param modelMap
   * @param request HttpRequest
   * @param command specified what action to take {create,edit,remove}
   * @param runId id of the Run to edit the announcement
   * @param announcementId id of the announcement
   * @return String containing viewname to display after the action
   * @throws Exception
   */
  @RequestMapping(method = RequestMethod.POST)
  protected String manageAnnouncements(
    ModelMap modelMap,
    HttpServletRequest request,
    @RequestParam(value = "command") String command,
    @RequestParam(value = "runId") Long runId,
    @RequestParam(value = "announcementId", required = false) Integer announcementId) throws Exception {

    User user = ControllerUtil.getSignedInUser();
    Run run = runService.retrieveById(runId);

    // check that the logged-in user has permission for this run
    if (user.isAdmin() ||
      user.getUserDetails().hasGrantedAuthority(UserDetailsService.RESEARCHER_ROLE) ||
      this.aclService.hasPermission(run, BasePermission.ADMINISTRATION, user) ||
      this.aclService.hasPermission(run, BasePermission.WRITE, user)) {

      // either add/edit/remove announcement
      if ("remove".equals(command)) {
        Announcement announcement = announcementService.retrieveById(announcementId);
        runService.removeAnnouncementFromRun(run.getId(), announcement);
        announcementService.deleteAnnouncement(announcement.getId());

      } else if ("edit".equals(command)) {
        Announcement announcement = announcementService.retrieveById(announcementId);
        AnnouncementParameters params = new AnnouncementParameters();
        params.setId(announcement.getId());
        params.setRunId(runId);
        params.setTimestamp(announcement.getTimestamp());
        params.setTitle(request.getParameter("title"));
        params.setAnnouncement(request.getParameter("announcement"));

        announcementService.updateAnnouncement(params.getId(), params);

      } else if ("create".equals(command)) {
        AnnouncementParameters params = new AnnouncementParameters();
        params.setRunId(runId);
        params.setTimestamp(Calendar.getInstance().getTime());
        params.setTitle(request.getParameter("title"));
        params.setAnnouncement(request.getParameter("announcement"));

        Announcement announcement = announcementService.createAnnouncement(params);
        runService.addAnnouncementToRun(params.getRunId(), announcement);

      }

      modelMap.put("run", run);
      return "teacher/run/announcement/manageannouncement";
    } else {
      return "errors/accessdenied";
    }
  }
}
