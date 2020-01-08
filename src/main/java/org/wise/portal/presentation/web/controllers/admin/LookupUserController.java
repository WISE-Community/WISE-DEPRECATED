/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
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

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.admin.StudentFields;
import org.wise.portal.domain.admin.TeacherFields;
import org.wise.portal.domain.impl.LookupUserParameters;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.validators.LookupUserParametersValidator;
import org.wise.portal.service.user.UserService;

/**
 * Admin controller for looking up user accounts
 * @author Patrick Lawler
 * @author Hiroki Terashima
 */
@Controller
@RequestMapping("/admin/account/lookupuser")
public class LookupUserController {

  @Autowired
  private UserService userService;

  @Autowired
  private LookupUserParametersValidator lookupUserParametersValidator;

  @PostMapping
  protected ModelAndView lookupUser(
      @ModelAttribute("lookupUserParameters") LookupUserParameters param,
      BindingResult result, HttpServletRequest request) {
    lookupUserParametersValidator.validate(param, result);
    if (result.hasErrors()) {
      return null;
    }
    String lookupField = param.getLookupField();
    String lookupData = param.getLookupData();
    String userType = request.getParameter("userType");
    List<User> users = new ArrayList<User>();
    if ("teacher".equals(userType)) {
      if ("id".equals(lookupField)) {
        User user = userService.retrieveTeacherById(Long.parseLong(lookupData));
        if (user != null) {
          users.add(user);
        }
      } else if ("firstname".equals(lookupField)) {
        users = userService.retrieveTeachersByFirstName(lookupData);
      } else if ("lastname".equals(lookupField)) {
        users = userService.retrieveTeachersByLastName(lookupData);
      } else if ("username".equals(lookupField)) {
        User user = userService.retrieveTeacherByUsername(lookupData);
        if (user != null) {
          users.add(user);
        }
      } else if ("displayname".equals(lookupField)) {
        users = userService.retrieveTeachersByDisplayName(lookupData);
      } else if ("city".equals(lookupField)) {
        users = userService.retrieveTeachersByCity(lookupData);
      } else if ("state".equals(lookupField)) {
        users = userService.retrieveTeachersByState(lookupData);
      } else if ("country".equals(lookupField)) {
        users = userService.retrieveTeachersByCountry(lookupData);
      } else if ("schoolname".equals(lookupField)) {
        users = userService.retrieveTeachersBySchoolName(lookupData);
      } else if ("schoollevel".equals(lookupField)) {
        users = userService.retrieveTeachersBySchoolLevel(lookupData);
      } else if ("emailAddress".equals(lookupField)) {
        users = userService.retrieveTeachersByEmail(lookupData);
      }
    } else if ("student".equals(userType)) {
      if ("id".equals(lookupField)) {
        User user = userService.retrieveStudentById(Long.parseLong(lookupData));
        if (user != null) {
          users.add(user);
        }
      } else if ("firstname".equals(lookupField)) {
        users = userService.retrieveStudentsByFirstName(lookupData);
      } else if ("lastname".equals(lookupField)) {
        users = userService.retrieveStudentsByLastName(lookupData);
      } else if ("username".equals(lookupField)) {
        User user = userService.retrieveStudentByUsername(lookupData);
        if (user != null) {
          users.add(user);
        }
      } else if ("gender".equals(lookupField)) {
        users = userService.retrieveStudentsByGender(lookupData);
      }
    }
    ModelAndView modelAndView = new ModelAndView("admin/account/manageusers");
    List<String> usernames = new ArrayList<String>();
    for (User user : users) {
      usernames.add(user.getUserDetails().getUsername());
    }
    if (users.size() < 1) {
      modelAndView.addObject("message", "No users given search criteria found.");
    } else {
      if ("student".equals(request.getParameter("userType"))) {
        modelAndView.addObject("students", usernames);
      } else {
        modelAndView.addObject("teachers", usernames);
      }
    }
    return modelAndView;
  }

  @GetMapping
  public ModelAndView showSearchForm(ModelMap model, @RequestParam String userType) {
    ModelAndView mav = new ModelAndView();
    mav.addObject("lookupUserParameters", new LookupUserParameters());
    model.put("userType", userType);
    if ("teacher".equals(userType)) {
      model.put("fields", TeacherFields.values());
    } else {
      model.put("fields", StudentFields.values());
    }
    return mav;
  }
}
