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

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;

import javax.servlet.http.HttpServletRequest;

/**
 * Controller for single-page site app built with Angular
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
@Controller
@RequestMapping("/site")
public class SiteController {

  @RequestMapping(value = {"", "/student", "/student/**", "/teacher", "/teacher/**", "/login", "/join", "/join/**", "/news", "/about", "/features"},
      method = RequestMethod.GET)
  protected String showSite() {
    return "forward:/site/index.html";
  }

  @ResponseBody
  @RequestMapping(value = "/user", method = RequestMethod.GET)
  protected String user(HttpServletRequest request) {
    User signedInUser = ControllerUtil.getSignedInUser();
    if (signedInUser != null) {
      String username = signedInUser.getUserDetails().getUsername();
      JSONObject user = new JSONObject();
      try {
        user.put("username", username);
        return user.toString();
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return null;
  }
}
