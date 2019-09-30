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
@RequestMapping("checkForExistingAccount")
public class CheckForExistingAccountController {

  @Autowired
  protected UserService userService;

  @RequestMapping(method = RequestMethod.GET)
  protected String handleRequestInternal(HttpServletRequest request, HttpServletResponse response)
      throws Exception {
    String accountType = request.getParameter("accountType");

    if (accountType != null) {
      String[] fields = null;
      String[] values = null;
      String classVar = "";

      if (accountType.equals("student")) {
        /*
         * we are looking for a student so we will look for a student account with
         * a matching first name, last name, birth month, and birth day
         */

        String firstName = request.getParameter("firstName");
        String lastName = request.getParameter("lastName");
        String birthMonth = request.getParameter("birthMonth");
        String birthDay = request.getParameter("birthDay");

        fields = new String[4];
        fields[0] = "firstname";
        fields[1] = "lastname";
        fields[2] = "birthmonth";
        fields[3] = "birthday";

        values = new String[4];
        values[0] = firstName;
        values[1] = lastName;
        values[2] = birthMonth;
        values[3] = birthDay;

        classVar = "studentUserDetails";
      } else if (accountType.equals("teacher")) {
        /*
         * we are looking for a teacher so we will look for a teacher account with
         * a matching first name, last name
         */

        String firstName = request.getParameter("firstName");
        String lastName = request.getParameter("lastName");

        fields = new String[2];
        fields[0] = "firstname";
        fields[1] = "lastname";

        values = new String[2];
        values[0] = firstName;
        values[1] = lastName;

        classVar = "teacherUserDetails";
      }

      List<User> accountsThatMatch = userService.retrieveByFields(fields, values, classVar);
      JSONArray existingUsernames = new JSONArray();
      for (int x = 0; x < accountsThatMatch.size(); x++) {
        User user = accountsThatMatch.get(x);
        String username = user.getUserDetails().getUsername();
        existingUsernames.put(username);
      }
      response.getWriter().write(existingUsernames.toString());
    }
    return null;
  }
}
