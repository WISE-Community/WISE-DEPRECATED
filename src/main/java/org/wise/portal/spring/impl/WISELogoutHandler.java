package org.wise.portal.spring.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.session.SessionDestroyedEvent;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.session.Session;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.service.session.SessionService;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;

public class WISELogoutHandler<S extends Session> implements LogoutHandler, ApplicationListener<SessionDestroyedEvent> {

  @Autowired
  protected SessionService sessionService;

  @Override
  public void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
    sessionService.removeUser((UserDetails) authentication.getPrincipal());
  }

  @Override
  public void onApplicationEvent(SessionDestroyedEvent sessionDestroyedEvent) {
    List<SecurityContext> securityContexts = sessionDestroyedEvent.getSecurityContexts();
    for (SecurityContext securityContext : securityContexts) {
      sessionService.removeUser((UserDetails) securityContext.getAuthentication().getPrincipal());
    }
  }
}
