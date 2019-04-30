package org.wise.portal.spring.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.session.Session;
import org.wise.portal.service.session.SessionService;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class WISELogoutHandler<S extends Session> implements LogoutHandler {

  @Autowired
  protected SessionService sessionService;

  @Override
  public void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
    UserDetails userDetails = (UserDetails) authentication.getPrincipal();
    sessionService.removeSignedInUser(userDetails);
  }
}
