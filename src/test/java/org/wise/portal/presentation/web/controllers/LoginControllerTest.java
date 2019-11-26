/**
 * Copyright (c) 2006 Encore Research Group, University of Toronto
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package org.wise.portal.presentation.web.controllers;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.junit.Assert.assertEquals;

import java.security.Principal;

import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.wise.portal.service.portal.PortalService;

/**
 * @author Hiroki Terashima
 */
@RunWith(EasyMockRunner.class)

public class LoginControllerTest {

  @TestSubject
  private LoginController controller = new LoginController();

  @Mock
  private PortalService portalService;

  private Authentication authentication;

  @Test
  public void renewSession_AnonymousUser_ShouldReturnFalse() {
    Authentication authentication = null;
    String result = controller.renewSession(authentication);
    assertEquals("false", result);
  }

  @Test
  public void renewSession_LoggedInUserSiteLogInAllowed_ShouldReturnTrue() {
    expect(portalService.isLoginAllowed()).andReturn(true);
    replay(portalService);
    String result = controller.renewSession(authentication);
    assertEquals("true", result);
  }

  @Test
  public void renewSession_LoggedInUserSiteLogInNotAllowed_ShouldReturnRequestLogout() {
    expect(portalService.isLoginAllowed()).andReturn(false);
    replay(portalService);
    String result = controller.renewSession(authentication);
    assertEquals("requestLogout", result);

  }
  @Before
  public void setUp() {
    Principal principal = null;
    Object credentials = null;
    authentication = new TestingAuthenticationToken(principal,
        credentials);
  }

  @After
  public void tearDown() {
    controller = null;
    portalService = null;
    authentication = null;
  }
}
