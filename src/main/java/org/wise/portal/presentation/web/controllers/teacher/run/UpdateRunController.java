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
package org.wise.portal.presentation.web.controllers.teacher.run;

import java.util.Date;
import java.util.Properties;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.presentation.web.exception.NotAuthorizedException;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.mail.IMailFacade;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.project.ProjectService;

/**
 * Controller for updating run settings, like add period, 
 * enable/disable idea manager and student file uploader.
 * 
 * @author Patrick Lawler
 * @author Hiroki Terashima
 */
@Controller
@RequestMapping(value = {
		"/teacher/run/manage/*.html",
		"/teacher/run/updaterun.html",
		"/teacher/run/editrun.html",
		"/teacher/run/notes.html",
		"/teacher/run/survey.html"})
public class UpdateRunController {

	@Autowired
	private RunService runService;
	
	@Autowired
	private ProjectService projectService;
	
	@Autowired
	private IMailFacade mailService = null;

	@Autowired
	protected Properties wiseProperties;

	@RequestMapping(method=RequestMethod.GET)
	protected ModelAndView handleGET(HttpServletRequest request) throws Exception {
		User user = ControllerUtil.getSignedInUser();
		String runId = request.getParameter("runId");
		Run run = null;
		if (runId != null) {
			run = this.runService.retrieveById(Long.parseLong(request.getParameter("runId")));
			if (!run.getOwner().equals(user) && !user.isAdmin()) {
				String contextPath = request.getContextPath();
				return new ModelAndView(new RedirectView(contextPath + "/accessdenied.html"));
			}
		}
		ModelAndView mav = new ModelAndView();
		mav.addObject("run", run);
		return mav;
	}

	@RequestMapping(method=RequestMethod.POST)
	protected ModelAndView handlePOST(HttpServletRequest request, HttpServletResponse response) throws Exception {
		User user = ControllerUtil.getSignedInUser();
		String runId = request.getParameter("runId");
		String contextPath = request.getContextPath();
		Run run = null;
		if (runId != null) {
			run = this.runService.retrieveById(Long.parseLong(request.getParameter("runId")));
			if (!run.getOwner().equals(user) && !user.isAdmin()) {
				return new ModelAndView(new RedirectView(contextPath + "/accessdenied.html"));
			}
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
			this.runService.updateNotes(Long.parseLong(runId), privateNotes);
			response.getWriter().write("success");
		} else if ("saveSurvey".equals(command)) {
			if (run.getOwner().equals(user)) {
				String survey = request.getParameter("survey");
				this.runService.updateSurvey(Long.parseLong(runId), survey);

				// send email to WISE staff with Survey
				String linkToSurvey = wiseProperties.getProperty("wiseBaseURL")+"/teacher/run/survey.html?runId="+runId;
				String emailBody = user.getUserDetails().getUsername()+ " completed a survey for "+run.getName()+" (Run ID="+runId+").\n\nLink to view survey on WISE: "+linkToSurvey+"\n\n"+survey;
				EmailService emailService = 
						new EmailService("Survey completed [Run ID="+runId+"]: "+run.getName(), emailBody);
				Thread thread = new Thread(emailService);
				thread.start();

				response.getWriter().write("success");
			}
		} else if ("archiveRun".equals(command)) {
			if (user.getUserDetails().hasGrantedAuthority(UserDetailsService.ADMIN_ROLE) || run.getOwner().equals(user)) {
				runService.endRun(run);
				// also archive project
				try {
					Project project = run.getProject();
					project.setDeleted(true);
					project.setDateDeleted(new Date());
				
					User signedInUser = ControllerUtil.getSignedInUser(); //get the currently signed in user
					projectService.updateProject(project, signedInUser);
				} catch (NotAuthorizedException e) {
					e.printStackTrace();
				}

				ModelAndView endRunSuccessMAV = new ModelAndView("teacher/run/manage/endRunSuccess");
				endRunSuccessMAV.addObject("run",run);
				return endRunSuccessMAV;
			} 			
		} else if ("unArchiveRun".equals(command)) {
			if (user.getUserDetails().hasGrantedAuthority(UserDetailsService.ADMIN_ROLE) || run.getOwner().equals(user)) {
				runService.startRun(run);
				// also un-archive project
				try {
					Project project = run.getProject();
					project.setDeleted(false);
					project.setDateDeleted(null);
				
					User signedInUser = ControllerUtil.getSignedInUser(); //get the currently signed in user
					projectService.updateProject(project, signedInUser);
				} catch (NotAuthorizedException e) {
					e.printStackTrace();
				}

				ModelAndView startRunSuccessMAV = new ModelAndView("teacher/run/manage/startRunSuccess");
				return startRunSuccessMAV;
			}
		} else if ("extendReminderTime".equals(command)) {
			if (user.getUserDetails().hasGrantedAuthority(UserDetailsService.ADMIN_ROLE) || run.getOwner().equals(user)) {
				this.runService.extendArchiveReminderTime(Long.parseLong(request.getParameter("runId")));
			}			
		}
		return null;
	}
	
	class EmailService implements Runnable {

		private String messageSubject;
		private String messageBody;
		
		public EmailService(String messageSubject, String messageBody) {
			this.messageBody = messageBody;
			this.messageSubject = messageSubject;
		}

		@Override
		public void run() {
			try {
				String sendEmailEnabledStr = wiseProperties.getProperty("send_email_enabled");
				Boolean sendEmailEnabled = Boolean.valueOf(sendEmailEnabledStr);
				if (!sendEmailEnabled) {
					return;
				}
				
				String fromEmail = wiseProperties.getProperty("portalemailaddress");
				String[] recipients = wiseProperties.getProperty("project_setup").split(",");

				mailService.postMail(recipients, messageSubject, messageBody, fromEmail);
			} catch (MessagingException e) {
				e.printStackTrace();
			}
		}
	}
}