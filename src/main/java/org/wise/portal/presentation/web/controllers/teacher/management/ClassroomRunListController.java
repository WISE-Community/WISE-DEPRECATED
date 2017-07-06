/**
 * Copyright (c) 2007-2015 Regents of the University of California (Regents).
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
package org.wise.portal.presentation.web.controllers.teacher.management;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.workgroup.WorkgroupService;

/**
 * Puts run details into the model to be retrieved and displayed for logged-in teacher
 *
 * @author Hiroki Terashima
 */
@Controller
public class ClassroomRunListController {

	@Autowired
	private RunService runService;

	@Autowired
	private Properties wiseProperties;

	@Autowired
	private WorkgroupService workgroupService;

	static final Comparator<Run> ORDER_BY_STARTTIME = new Comparator<Run>() {
		public int compare(Run o1, Run o2) {
			return o2.getStarttime().compareTo(o1.getStarttime());
        }
	};

	@RequestMapping("/teacher/management/classroomruns.html")
	protected String handleRequestInternal(
			ModelMap modelMap,
            @RequestParam(value = "gradingParam", defaultValue = "false") boolean gradingParam)
            throws Exception {

		User user = ControllerUtil.getSignedInUser();

		List<Run> runList = this.runService.getRunListByOwner(user);
		runList.addAll(this.runService.getRunListBySharedOwner(user));

		List<Run> current_run_list = new ArrayList<Run>();
		List<Run> ended_run_list = new ArrayList<Run>();
		Map<Run, List<Workgroup>> workgroupMap = new HashMap<Run, List<Workgroup>>();
		for (Run run : runList) {
			List<Workgroup> workgroupList = workgroupService
					.getWorkgroupListByRunAndUser(run, user);

			workgroupMap.put(run, workgroupList);
			if (run.isEnded()) {
				ended_run_list.add(run);
			} else {
				current_run_list.add(run);
			}
		}
		
		Collections.sort(current_run_list, ORDER_BY_STARTTIME);
		Collections.sort(ended_run_list, ORDER_BY_STARTTIME);

		modelMap.put("user", user);
		modelMap.put("gradingParam", gradingParam);

        String isRealTimeEnabledStr = this.wiseProperties.getProperty("isRealTimeEnabled");
        boolean isRealTimeEnabled = isRealTimeEnabledStr != null ? Boolean.valueOf(isRealTimeEnabledStr) : false;
        modelMap.put("isRealTimeEnabled", isRealTimeEnabled);
		modelMap.put("current_run_list", current_run_list);
		modelMap.put("ended_run_list", ended_run_list);
		modelMap.put("workgroup_map", workgroupMap);
		return "teacher/management/classroomruns";
	}
}