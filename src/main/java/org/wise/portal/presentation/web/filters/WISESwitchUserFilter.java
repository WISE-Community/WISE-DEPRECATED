package org.wise.portal.presentation.web.filters;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.switchuser.SwitchUserFilter;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;

import javax.servlet.http.HttpServletRequest;

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
          return null;
        }
      }
    }
    return super.attemptSwitchUser(request);
  }
}
