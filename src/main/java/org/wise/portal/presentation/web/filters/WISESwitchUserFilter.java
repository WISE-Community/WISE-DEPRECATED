/**
 * Copyright (c) 2008-2019 Regents of the University of California (Regents).
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
package org.wise.portal.presentation.web.filters;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.switchuser.SwitchUserFilter;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;

/**
 * WISE implementation of SwitchUserFilter
 * @author Hiroki Terashima
 */
public class WISESwitchUserFilter extends SwitchUserFilter {

  @Autowired
  private UserDetailsService userDetailsService;

  /**
   * Overrides default switch user behavior.
   * Don't allow non-admins to log in as another admin.
   * @param request
   * @return
   * @throws AuthenticationException
   */
  protected Authentication attemptSwitchUser(HttpServletRequest request)
      throws AuthenticationException {
    User signedInUser = ControllerUtil.getSignedInUser();
    if (!signedInUser.isAdmin()) {
      UserDetails userDetails =
          userDetailsService.loadUserByUsername(request.getParameter("username"));
      for (GrantedAuthority authority : userDetails.getAuthorities()) {
        if (authority.getAuthority().equals("ROLE_ADMINISTRATOR")) {
          throw new InsufficientAuthenticationException("Insufficient permissions");
        }
      }
    }
    return super.attemptSwitchUser(request);
  }
}
