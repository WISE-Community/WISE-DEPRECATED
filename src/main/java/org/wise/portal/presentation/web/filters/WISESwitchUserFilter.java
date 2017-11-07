package org.wise.portal.presentation.web.filters;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.switchuser.SwitchUserFilter;

/**
 * WISE implementation of SwitchUserFilter
 * @author Hiroki Terashima
 */
public class WISESwitchUserFilter extends SwitchUserFilter {

  @Autowired
  private UserDetailsService userDetailsService;

  /**
   * Overrides default switch user behavior.
   * Don't allow anybody to log in as a user with administrator role.
   * @param request
   * @return
   * @throws AuthenticationException
   */
  protected Authentication attemptSwitchUser(javax.servlet.http.HttpServletRequest request)
      throws AuthenticationException {
    UserDetails userDetails = this.userDetailsService.loadUserByUsername(request.getParameter("username"));
    for (GrantedAuthority authority : userDetails.getAuthorities()) {
      if (authority.getAuthority().equals("ROLE_ADMINISTRATOR")) {
        return null;
      }
    }
    return super.attemptSwitchUser(request);
  }
}
