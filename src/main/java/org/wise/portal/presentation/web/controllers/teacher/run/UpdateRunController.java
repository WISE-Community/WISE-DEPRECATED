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
package org.wise.portal.presentation.web.controllers.teacher.run;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.offering.RunService;

/**
 * Controller for updating run settings, like add period, 
 * enable/disable idea manager and student file uploader.
 * 
 * @author patrick lawler
 * @version $Id:$
 */
@Controller
@RequestMapping(value={"/teacher/run/manage/*.html","/teacher/run/updaterun.html", "/teacher/run/editrun.html", "/teacher/run/notes.html"})
public class UpdateRunController {

	@Autowired
	private RunService runService;

	@RequestMapping(method=RequestMethod.GET)
	protected ModelAndView handleGET(HttpServletRequest request) throws Exception {
		String runId = request.getParameter("runId");
		Run run = null;
		if (runId != null) {
			run = this.runService.retrieveById(Long.parseLong(request.getParameter("runId")));
		}
		ModelAndView mav = new ModelAndView();
		mav.addObject("run", run);
		return mav;
	}

	@RequestMapping(method=RequestMethod.POST)
	protected ModelAndView handlePOST(HttpServletRequest request, HttpServletResponse response) throws Exception {
		User user = ControllerUtil.getSignedInUser();
		String runId = request.getParameter("runId");
		Run run = null;
		if (runId != null) {
			run = this.runService.retrieveById(Long.parseLong(request.getParameter("runId")));
		}

		String command = request.getParameter("command");

		if("updateTitle".equals(command)){
			String title = request.getParameter("title");
			this.runService.updateRunName(Long.parseLong(runId), title);
			response.getWriter().write("success");
		} else if("addPeriod".equals(command)){
			String name = request.getParameter("name");
			this.runService.addPeriodToRun(Long.parseLong(runId), name);
			response.getWriter().write("success");
		} else if ("enableIdeaManager".equals(command)) {
			boolean isEnabled = Boolean.parseBoolean(request.getParameter("isEnabled"));
			this.runService.setIdeaManagerEnabled(Long.parseLong(runId), isEnabled);
			response.getWriter().write("success");
		} else if ("enablePortfolio".equals(command)) {
			boolean isEnabled = Boolean.parseBoolean(request.getParameter("isEnabled"));
			this.runService.setPortfolioEnabled(Long.parseLong(runId), isEnabled);
			response.getWriter().write("success");
		} else if ("enableStudentAssetUploader".equals(command)) {
			boolean isEnabled = Boolean.parseBoolean(request.getParameter("isEnabled"));
			this.runService.setStudentAssetUploaderEnabled(Long.parseLong(runId), isEnabled);
			response.getWriter().write("success");
		} else if ("enableRealTime".equals(command)) {
			boolean isEnabled = Boolean.parseBoolean(request.getParameter("isEnabled"));
			this.runService.setRealTimeEnabled(Long.parseLong(runId), isEnabled);
			response.getWriter().write("success");
		} else if ("saveNotes".equals(command)) {
			String privateNotes = request.getParameter("privateNotes");
			String publicNotes = request.getParameter("publicNotes");
			this.runService.updateNotes(Long.parseLong(runId), privateNotes, publicNotes);
			response.getWriter().write("success");
		} else if ("archiveRun".equals(command)) {
			if (user.getUserDetails().hasGrantedAuthority(UserDetailsService.ADMIN_ROLE) || run.getOwners().contains(user)) {
				runService.endRun(run);
				ModelAndView endRunSuccessMAV = new ModelAndView("teacher/run/manage/endRunSuccess");
				return endRunSuccessMAV;
			} 			
		} else if ("unArchiveRun".equals(command)) {
			if (user.getUserDetails().hasGrantedAuthority(UserDetailsService.ADMIN_ROLE) || run.getOwners().contains(user)) {
				runService.startRun(run);
				ModelAndView startRunSuccessMAV = new ModelAndView("teacher/run/manage/startRunSuccess");
				return startRunSuccessMAV;
			}
		} else if ("extendReminderTime".equals(command)) {
			if (user.getUserDetails().hasGrantedAuthority(UserDetailsService.ADMIN_ROLE) || run.getOwners().contains(user)) {
				this.runService.extendArchiveReminderTime(Long.parseLong(request.getParameter("runId")));
			}			
		}
		return null;
	}
}
