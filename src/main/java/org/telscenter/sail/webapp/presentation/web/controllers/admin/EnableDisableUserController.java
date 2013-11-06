/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU Lesser General Public License, v2.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.telscenter.sail.webapp.presentation.web.controllers.admin;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;
import net.sf.sail.webapp.service.UserService;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;

/**
 * Controller for retrieving disabled WISE accounts and for enabling and disabling WISE user accounts. 
 * Only accessed by a WISE admin user.
 * @author hirokiterashima
 * @version $Id:$
 */
public class EnableDisableUserController extends AbstractController {

	private UserService userService;

	/**
	 * Check to see if the user to enable/disable has already been enabled/disabled. If yes, return such message.
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request, HttpServletResponse response) throws Exception {
		// Check to see that user making the request is an admin user.
		User signedInUser = ControllerUtil.getSignedInUser();
		if (signedInUser.isAdmin()) {
			if (request.getMethod().equals(METHOD_GET)) {
				// retrieve a list of already-disabled user accounts.
				ModelAndView mav = new ModelAndView();
				List<User> disabledUsers = userService.retrieveDisabledUsers();
				mav.addObject("disabledUsers", disabledUsers);
				return mav;
			} else if (request.getMethod().equals(METHOD_POST)) {
				// enable/disable user accounts
				String doEnable = request.getParameter("doEnable");
				String username = request.getParameter("username");
				User user = userService.retrieveUserByUsername(username);
				// check to see if user exists in the system.
				if (user != null) {  
					if (Boolean.parseBoolean(doEnable)) {
						// enable the account
						if (!user.getUserDetails().isEnabled()) {
							user.getUserDetails().setEnabled(true);
							userService.updateUser(user);
							response.getWriter().write("success");
						} else {
							response.getWriter().write("User '"+username+"' is already enabled.");
						}
					} else {
						// disable the account
						if (user.getUserDetails().isEnabled()) {
							user.getUserDetails().setEnabled(false);
							userService.updateUser(user);
							response.getWriter().write("success");
						} else {
							response.getWriter().write("User '"+username+"' is already disabled.");
						}
					}
				} else {
					// user does not exist in the system.
					response.getWriter().write("User '" + username + "' was not found in the system. Please check the spelling and try again.");
				}
			}
		}
		return null;
	}

	/**
	 * @param userService the userService to set
	 */
	public void setUserService(UserService userService) {
		this.userService = userService;
	}

}
