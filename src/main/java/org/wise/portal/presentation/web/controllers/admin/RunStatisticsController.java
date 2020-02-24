/**
 * Copyright (c) 2008-2019 Regents of the University of California (Regents).
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
package org.wise.portal.presentation.web.controllers.admin;

import java.util.Calendar;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.attendance.StudentAttendance;
import org.wise.portal.domain.run.Run;
import org.wise.portal.service.attendance.StudentAttendanceService;
import org.wise.portal.service.run.RunService;

/**
 * @author Patrick Lawler
 */
@Controller
public class RunStatisticsController {

  @Autowired
  private RunService runService;

  @Autowired
  private StudentAttendanceService studentAttendanceService;

  @RequestMapping(value = "/admin/run/stats", method = RequestMethod.GET)
  protected String showRunStatistics(
      @RequestParam(value = "period", required = false) String period,
      ModelMap modelMap) throws Exception {
    List<Run> runs = runService.getRunsRunWithinTimePeriod(period);
    int lookBackPeriod = 0;
    if (period.equals("today")) {
      lookBackPeriod = 0;
    } else if (period.equals("week")) {
      lookBackPeriod = 7;
    } else if (period.equals("month")) {
      lookBackPeriod = Calendar.getInstance().getActualMaximum(Calendar.DAY_OF_MONTH);
    }
    for (Run run: runs) {
      List<StudentAttendance> studentAttendanceByRunIdAndPeriod =
          studentAttendanceService.getStudentAttendanceByRunIdAndPeriod(
          run.getId(), lookBackPeriod);
      run.setStudentAttendance(studentAttendanceByRunIdAndPeriod);
    }

    if (period.equals("today")) {
      period = period;
    } else {
      period = "this " + period;
    }
    modelMap.put("runs", runs);
    modelMap.put("period", period);
    return "admin/run/stats";
  }

  @RequestMapping(value = "/admin/run/stats-by-activity", method = RequestMethod.GET)
  protected String showRunStatisticsByActivity(HttpServletRequest request, ModelMap modelMap)
      throws Exception {
    modelMap.put("runs", runService.getRunsByActivity());
    return "admin/run/stats";
  }
}
