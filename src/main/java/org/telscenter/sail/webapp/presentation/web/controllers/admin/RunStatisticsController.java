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
package org.telscenter.sail.webapp.presentation.web.controllers.admin;

import java.util.Calendar;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.attendance.StudentAttendance;
import org.telscenter.sail.webapp.service.attendance.StudentAttendanceService;
import org.telscenter.sail.webapp.service.offering.RunService;

/**
 * @author patrick lawler
 * @version $Id:$
 */
public class RunStatisticsController extends AbstractController {

	private RunService runService;
	
	private StudentAttendanceService studentAttendanceService;
	
	private final static String RUNS_WITHIN_VIEW = "/admin/run/runswithinperiod";
	
	private final static String RUNS_BY_ACTIVITY_VIEW = "/admin/run/runsactivity";
	
	private final static String RUNS = "runs";
	
	private final static String PERIOD = "period";
	
	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request, HttpServletResponse response) throws Exception {
		String command = request.getParameter("command");
		
		if(command.equals("today") || command.equals("week") || command.equals("month")){
			List<Run> runs = this.runService.getRunsRunWithinPeriod(command);
			int lookBackPeriod = 0;
			if(command.equals("today")){
				lookBackPeriod = 0;
			} else if(command.equals("week")){
				lookBackPeriod = 7;
			} else if(command.equals("month")){
				lookBackPeriod = Calendar.getInstance().getActualMaximum(Calendar.DAY_OF_MONTH);
			}
			for (Run run: runs) {
				List<StudentAttendance> studentAttendanceByRunIdAndPeriod = this.studentAttendanceService.getStudentAttendanceByRunIdAndPeriod(run.getId(), lookBackPeriod);
				run.setStudentAttendance(studentAttendanceByRunIdAndPeriod);
			}
			
			String period = null;
			if(command.equals("today")){
				period = command;
			} else {
				period = "this " + command;
			}
			
			ModelAndView mav = new ModelAndView(RUNS_WITHIN_VIEW);
			mav.addObject(RUNS, runs);
			mav.addObject(PERIOD, period);
			return mav;
		} else if(command.equals("activity")) {
			List<Run> runs = this.runService.getRunsByActivity();
			
			ModelAndView mav = new ModelAndView(RUNS_BY_ACTIVITY_VIEW);
			mav.addObject(RUNS, runs);
			return mav;
		} else {
			throw new Exception("I do not understand the command: " + command);
		}
	}

	public void setRunService(RunService runService) {
		this.runService = runService;
	}

	/**
	 * @param studentAttendanceService the studentAttendanceService to set
	 */
	public void setStudentAttendanceService(
			StudentAttendanceService studentAttendanceService) {
		this.studentAttendanceService = studentAttendanceService;
	}
}
