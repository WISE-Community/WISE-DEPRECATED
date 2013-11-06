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
package org.telscenter.sail.webapp.presentation.web.controllers.student;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.service.offering.RunService;

import com.ibm.icu.util.Calendar;

/**
 * @author patrick lawler
 * @version $Id:$
 */
public class ViewAnnouncementsController extends AbstractController{

	protected final static String RUNID = "runId";
	
	protected final static String RUNS = "runs";
	
	private static final String PREVIOUS_LOGIN = "previousLoginTime";
	
	private RunService runService;
	
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		String runIdsStr = request.getParameter(RUNID);
		String [] runIds = runIdsStr.split(",");
		
		ModelAndView modelAndView = new ModelAndView();
    	ControllerUtil.addUserToModelAndView(request, modelAndView);		
		List<Run> runs = new ArrayList<Run>();
		for (String runId : runIds) {
			Run run = runService.retrieveById(new Long(runId));			
			runs.add(run);
		}
		
		Date previousLoginTime = new Date();
		Calendar cal = Calendar.getInstance();
		try {
			Long pLT = new Long(request.getParameter("pLT"));
			cal.setTimeInMillis(pLT);
			previousLoginTime = cal.getTime();
		} catch (NumberFormatException nfe) {
			// if there was an exception parsing previous last login time, such as user appending pLT=1302049863000\, assume this is the lasttimelogging in
			previousLoginTime = cal.getTime();
		}
		
		modelAndView.addObject(PREVIOUS_LOGIN, previousLoginTime);
		modelAndView.addObject(RUNS, runs);
		return modelAndView;
	}

	/**
	 * @param runService the runService to set
	 */
	public void setRunService(RunService runService) {
		this.runService = runService;
	}
}
