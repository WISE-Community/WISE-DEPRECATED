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
package org.telscenter.sail.webapp.presentation.web.controllers.teacher.run;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.service.offering.RunService;

/**
 * Controller for updating run settings, like add period, 
 * enable/disable idea manager and student file uploader.
 * @author patrick lawler
 * @version $Id:$
 */
public class UpdateRunController extends AbstractController {
	
	private RunService runService;

	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request, HttpServletResponse response) throws Exception {
		String runId = request.getParameter("runId");
		String command = request.getParameter("command");
		
		if(command.equals("updateTitle")){
			String title = request.getParameter("title");
			this.runService.updateRunName(Long.parseLong(runId), title);
			response.getWriter().write("success");
		} else if(command.equals("addPeriod")){
			String name = request.getParameter("name");
			this.runService.addPeriodToRun(Long.parseLong(runId), name);
			response.getWriter().write("success");
		} else if (command.equals("enableIdeaManager")) {
			boolean isEnabled = Boolean.parseBoolean(request.getParameter("isEnabled"));
			this.runService.setIdeaManagerEnabled(Long.parseLong(runId), isEnabled);
			response.getWriter().write("success");
		} else if (command.equals("enableStudentAssetUploader")) {
			boolean isEnabled = Boolean.parseBoolean(request.getParameter("isEnabled"));
			this.runService.setStudentAssetUploaderEnabled(Long.parseLong(runId), isEnabled);
			response.getWriter().write("success");
		} else if (command.equals("enableXMPP")) {
			boolean isEnabled = Boolean.parseBoolean(request.getParameter("isEnabled"));
			this.runService.setXMPPEnabled(Long.parseLong(runId), isEnabled);
			response.getWriter().write("success");
		}
		
		return null;
	}

	/**
	 * @param runService the runService to set
	 */
	public void setRunService(RunService runService) {
		this.runService = runService;
	}
}
