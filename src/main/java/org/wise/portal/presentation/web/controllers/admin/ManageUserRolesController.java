/**
 * Copyright (c) 2008-2014 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU General Public License, v3.
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
package org.wise.portal.presentation.web.controllers.admin;


import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.wise.portal.domain.authentication.MutableGrantedAuthority;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.user.UserService;

/**
 * Allows administrators to lookup users and grant/revoke roles
 * 
 * @author Hiroki Terashima
 * @version $Id:$
 */
public class ManageUserRolesController extends AbstractController {

	private UserService userService;

	private UserDetailsService userDetailsService;

	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		ModelAndView mav = new ModelAndView();
		List<MutableGrantedAuthority> allAuthorities = userDetailsService.retrieveAllAuthorities();
		mav.addObject("allAuthorities", allAuthorities);
		String username = request.getParameter("userName");
		User user = userService.retrieveUserByUsername(username);
		mav.addObject("user", user);
		if (request.getMethod().equals(METHOD_GET)) {
			if (request.getParameter("userName") != null) {
			}
		} else if (request.getMethod().equals(METHOD_POST)) {
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
		}
		return mav;
	}

	public void setUserService(UserService userService) {
		this.userService = userService;
	}
	
	public void setUserDetailsService(UserDetailsService userDetailsService) {
		this.userDetailsService = userDetailsService;
	}
}
