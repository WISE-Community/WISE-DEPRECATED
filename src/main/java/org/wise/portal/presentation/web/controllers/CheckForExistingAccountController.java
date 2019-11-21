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
package org.wise.portal.presentation.web.controllers;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.user.UserService;

@Controller
@RequestMapping("legacy/checkForExistingAccount")
public class CheckForExistingAccountController {

  @Autowired
  protected UserService userService;

  @RequestMapping(method = RequestMethod.GET)
  protected String handleRequestInternal(HttpServletRequest request, HttpServletResponse response)
      throws Exception {
    List<User> accountsThatMatch = null;
    String accountType = request.getParameter("accountType");
    if (accountType.equals("student")) {
      String firstName = request.getParameter("firstName");
      String lastName = request.getParameter("lastName");
      Integer birthMonth = Integer.parseInt(request.getParameter("birthMonth"));
      Integer birthDay = Integer.parseInt(request.getParameter("birthDay"));
      accountsThatMatch = userService.retrieveStudentsByNameAndBirthday(firstName, lastName, 
          birthMonth, birthDay);
    } else if (accountType.equals("teacher")) {
      String firstName = request.getParameter("firstName");
      String lastName = request.getParameter("lastName");
      accountsThatMatch = userService.retrieveTeachersByName(firstName, lastName);
    }
    JSONArray existingUsernames = new JSONArray();
    for (int x = 0; x < accountsThatMatch.size(); x++) {
      User user = accountsThatMatch.get(x);
      String username = user.getUserDetails().getUsername();
      existingUsernames.put(username);
    }
    response.getWriter().write(existingUsernames.toString());
    return null;
  }
}
