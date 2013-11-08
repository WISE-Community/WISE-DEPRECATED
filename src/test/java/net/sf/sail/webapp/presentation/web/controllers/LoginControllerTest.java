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
package net.sf.sail.webapp.presentation.web.controllers;

import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.AbstractModelAndViewTests;
import org.springframework.web.servlet.ModelAndView;

/**
 * @author Laurel Williams
 * 
 * @version $Id$
 */
public class LoginControllerTest extends AbstractModelAndViewTests {

  private static final String TRUE = "true";

  MockHttpServletRequest request;

  MockHttpServletResponse response;

  @Override
  protected void setUp() throws Exception {
    super.setUp();
    request = new MockHttpServletRequest();
    response = new MockHttpServletResponse();
  }

  public void testHandleRequestInternal() throws Exception {
    // if the login fails, a parameter "failed" is added to the model.
    // in all other cases, acegi handles the request so the login controller
    // will not be reached
    request.addParameter("failed", TRUE);
    LoginController loginController = new LoginController();
    ModelAndView modelAndView = loginController.handleRequestInternal(request,
        response);
    assertModelAttributeValue(modelAndView, "failed", Boolean.TRUE);
  }

  @Override
  protected void tearDown() throws Exception {
    super.tearDown();
    request = null;
    response = null;
  }
}