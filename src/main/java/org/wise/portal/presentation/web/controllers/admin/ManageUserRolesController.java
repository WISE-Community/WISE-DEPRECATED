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
package org.wise.portal.presentation.web.controllers.admin;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.wise.portal.domain.authentication.MutableGrantedAuthority;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.user.UserService;

/**
 * Allows administrators to lookup users and grant/revoke roles
 *
 * @author Hiroki Terashima
 */
@Controller
@RequestMapping("/admin/account/manageuserroles.html")
public class ManageUserRolesController {

  @Autowired
  private UserService userService;

  @Autowired
  private UserDetailsService userDetailsService;

  @RequestMapping(method = RequestMethod.GET)
  protected String handleGET(HttpServletRequest request, ModelMap modelMap) {
    List<MutableGrantedAuthority> allAuthorities = userDetailsService.retrieveAllAuthorities();
    modelMap.put("allAuthorities", allAuthorities);
    String username = request.getParameter("username");
    User user = userService.retrieveUserByUsername(username);
    modelMap.put("user", user);
    return "admin/account/manageuserroles";
  }

  @RequestMapping(method = RequestMethod.POST)
  protected String handlePOST(HttpServletRequest request, ModelMap modelMap) throws Exception {
    List<MutableGrantedAuthority> allAuthorities = userDetailsService.retrieveAllAuthorities();
    modelMap.put("allAuthorities", allAuthorities);
    String username = request.getParameter("username");
    User user = userService.retrieveUserByUsername(username);
    modelMap.put("user", user);
    if (request.getParameter("action") != null) {
      String action = request.getParameter("action");
      String authorityName = request.getParameter("authorityName");
      GrantedAuthority authority = userDetailsService.loadAuthorityByName(authorityName);
      if ("grant".equals(action)) {
        user.getUserDetails().addAuthority(authority);
      } else if ("revoke".equals(action)) {
        user.getUserDetails().removeAuthority(authority);
      }
      userService.updateUser(user);
    }
    return null;
  }
}
