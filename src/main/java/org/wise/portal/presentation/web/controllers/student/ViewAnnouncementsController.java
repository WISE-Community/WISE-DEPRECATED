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
package org.wise.portal.presentation.web.controllers.student;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.offering.RunService;

import com.ibm.icu.util.Calendar;

/**
 * @author Patrick Lawler
 */
@Controller
@RequestMapping("/student/viewannouncements.html")
public class ViewAnnouncementsController {

	@Autowired
	private RunService runService;

	protected final static String RUNID = "runId";
	
	protected final static String RUNS = "runs";
	
	private static final String PREVIOUS_LOGIN = "previousLoginTime";
	
	@RequestMapping(method = RequestMethod.GET)
	protected ModelAndView handleRequestInternal(
			HttpServletRequest request) throws Exception {
		String runIdsStr = request.getParameter(RUNID);
		String [] runIds = runIdsStr.split(",");
		
		ModelAndView modelAndView = new ModelAndView();
		List<Run> runs = new ArrayList<Run>();
		for (String runId : runIds) {
			Run run = runService.retrieveById(new Long(runId));			
			runs.add(run);
		}
		
		Date previousLoginTime;
		Calendar cal = Calendar.getInstance();
		try {
			Long pLT = new Long(request.getParameter("pLT"));
			cal.setTimeInMillis(pLT);
			previousLoginTime = cal.getTime();
		} catch (NumberFormatException nfe) {
			// if there was an exception parsing previous last login time, such as user appending pLT=1302049863000\, assume this is the lasttimelogging in
			previousLoginTime = cal.getTime();
		}

		User user = ControllerUtil.getSignedInUser();
		modelAndView.addObject("user", user);
		modelAndView.addObject(PREVIOUS_LOGIN, previousLoginTime);
		modelAndView.addObject(RUNS, runs);
		return modelAndView;
	}
}