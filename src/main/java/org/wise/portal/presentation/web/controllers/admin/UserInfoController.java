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
package org.wise.portal.presentation.web.controllers.admin;

import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.student.StudentService;
import org.wise.portal.service.user.UserService;

/**
 * Controller for displaying user information
 * @author Sally Ahn
 */
@Controller
public class UserInfoController {

  @Autowired
  private UserService userService;

  @Autowired
  private StudentService studentService;

  @Autowired
  private RunService runService;

  protected final static String USER_INFO_MAP = "userInfoMap";

  @RequestMapping(value = {"/student/account/info", "/teacher/account/info"})
  protected ModelAndView handleGetUserAccountInfo(
      @RequestParam("userName") String userName) throws Exception {
    User signedInUser = ControllerUtil.getSignedInUser();
    User infoUser = this.userService.retrieveUserByUsername(userName);

    if (signedInUser.isAdmin() ||
      this.studentService.isStudentAssociatedWithTeacher(infoUser, signedInUser)) {
      MutableUserDetails userDetails = (MutableUserDetails) infoUser.getUserDetails();
      ModelAndView modelAndView = new ModelAndView();

      HashMap<String, Object> userInfoMap = userDetails.getInfo();
      userInfoMap.put("ID", infoUser.getId());
      modelAndView.addObject(USER_INFO_MAP, userInfoMap);

      if (infoUser.getUserDetails().hasGrantedAuthority(UserDetailsService.STUDENT_ROLE)) {
        modelAndView.addObject("isStudent", true);
        List<Run> runList = runService.getRunList(infoUser);
        modelAndView.addObject("runList", runList);
        modelAndView.setViewName("student/account/info");
      } else {
        modelAndView.addObject("isStudent", false);
        List<Run> runListByOwner = runService.getRunListByOwner(infoUser);
        modelAndView.addObject("runList", runListByOwner);
        modelAndView.setViewName("teacher/account/info");
      }
      return modelAndView;
    } else {
      return new ModelAndView("errors/accessdenied");
    }
  }
}
