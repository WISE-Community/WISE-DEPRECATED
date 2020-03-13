/**
 * Copyright (c) 2006-2019 Encore Research Group, University of Toronto
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Public License for more details.
 *
 * You should have received a copy of the GNU Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package org.wise.portal.presentation.web.controllers;

import java.io.IOException;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.portal.Portal;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.portal.PortalService;

/**
 * Controller that backs the Log-In form, for when user fails to log in.
 *
 * @author Cynick Young
 * @author Geoffrey Kwan
 */
@Controller
public class LoginController {

  @Autowired
  PortalService portalService;

  /**
   * Handles renew session requests. By virtue of making this request, a logged-in user has already
   * renewed the session.
   *
   * @param response
   * @throws IOException
   */
  @GetMapping("/session/renew")
  public void renewSession(HttpServletResponse response) throws IOException {
    User loggedInUser = ControllerUtil.getSignedInUser();
    if (loggedInUser != null) {
      try {
        Portal portal = portalService.getById(new Integer(1));
        if (!portal.isLoginAllowed()) {
          response.getWriter().print("requestLogout");
        } else {
          response.getWriter().print("true");
        }
      } catch (ObjectNotFoundException e) {
      }
    } else {
      response.getWriter().print("false");
    }
  }
}
