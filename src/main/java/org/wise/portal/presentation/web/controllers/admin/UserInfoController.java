/**
 * Copyright (c) 2007-2018 Regents of the University of California (Regents).
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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.student.StudentService;
import org.wise.portal.service.user.UserService;

/**
 * Controller for displaying user information to admin users
 * and student information to their teachers
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

  @GetMapping(value = {"/student/account/info", "/teacher/account/info"})
  protected String getUserAccountInfo(Authentication auth, @RequestParam String username,
      ModelMap modelMap) throws Exception {
    User signedInUser = userService.retrieveUserByUsername(auth.getName());
    User user = userService.retrieveUserByUsername(username);
    if (signedInUser.isAdmin() ||
        studentService.isStudentAssociatedWithTeacher(user, signedInUser)) {
      MutableUserDetails userDetails = (MutableUserDetails) user.getUserDetails();
      HashMap<String, Object> userInfoMap = userDetails.getInfo();
      userInfoMap.put("ID", user.getId());
      modelMap.put("userInfoMap", userInfoMap);
      if (user.getUserDetails().hasGrantedAuthority(UserDetailsService.STUDENT_ROLE)) {
        modelMap.put("isStudent", true);
        modelMap.put("runList", runService.getRunList(user));
        return "student/account/info";
      } else {
        modelMap.put("isStudent", false);
        modelMap.put("runList", runService.getRunListByOwner(user));
        return "teacher/account/info";
      }
    } else {
      return "errors/accessdenied";
    }
  }
}
