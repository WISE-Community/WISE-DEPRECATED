/**
 * Copyright (c) 2007-2017 Regents of the University of California (Regents).
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
package org.wise.portal.presentation.web.controllers.teacher;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.switchuser.SwitchUserFilter;
import org.springframework.security.web.authentication.switchuser.SwitchUserGrantedAuthority;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.newsitem.NewsItemService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.workgroup.WorkgroupService;

import javax.servlet.http.HttpServletRequest;

/**
 * Controller for WISE Teacher index page
 *
 * @author Hiroki Terashima
 */
@Controller
@RequestMapping("/teacher")
public class TeacherIndexController {

  @Autowired
  private Properties wiseProperties;

  @Autowired
  private RunService runService;

  @Autowired
  private WorkgroupService workgroupService;

  @Autowired
  private NewsItemService newsItemService;

  static final Comparator<Run> ORDER_BY_STARTTIME =
      new Comparator<Run>() {
        public int compare(Run o1, Run o2) {
          return o2.getStarttime().compareTo(o1.getStarttime());
        }
      };

  @RequestMapping(method = RequestMethod.GET)
  protected String getTeacherHomepage(ModelMap modelMap) throws Exception {
    User user = ControllerUtil.getSignedInUser();

    // combine owned and shared runs
    List<Run> runList = this.runService.getRunListByOwner(user);
    runList.addAll(this.runService.getRunListBySharedOwner(user));

    List<Run> allCurrentRuns = new ArrayList<Run>();
    Map<Run, List<Workgroup>> workgroupMap = new HashMap<Run, List<Workgroup>>();
    for (Run run : runList) {
      List<Workgroup> workgroupList = this.workgroupService.getWorkgroupListByRunAndUser(run, user);
      workgroupMap.put(run, workgroupList);
      if (!run.isEnded()) {
        allCurrentRuns.add(run);
      }
    }

    List<Run> current_run_list;
    Collections.sort(allCurrentRuns, ORDER_BY_STARTTIME);
    if (allCurrentRuns.size() > 5) {
      current_run_list = allCurrentRuns.subList(0,5);
    } else {
      current_run_list = allCurrentRuns;
    }

    modelMap.put("user", user);
    modelMap.put("current_run_list", current_run_list);  // this is used in run listing page and only contains latest 5 runs
    modelMap.put("allCurrentRuns", allCurrentRuns);  // this is used to go through all the announcements in the homepage
    modelMap.put("workgroup_map", workgroupMap);
    modelMap.put("teacherOnlyNewsItems", newsItemService.retrieveByType("teacherOnly"));

    // if discourse is enabled for this WISE instance, add the link to the model
    // so the view can display it
    String discourseURL = wiseProperties.getProperty("discourse_url");
    if (discourseURL != null && !discourseURL.isEmpty()) {
      String discourseSSOLoginURL = discourseURL + "/session/sso";
      modelMap.put("discourseSSOLoginURL", discourseSSOLoginURL);
    }

    return "teacher/index";
  }
}
