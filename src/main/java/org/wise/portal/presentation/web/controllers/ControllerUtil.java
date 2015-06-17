/**
 * Copyright (c) 2007-2015 Encore Research Group, University of Toronto
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

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.user.UserService;

/**
 * @author Laurel Williams
 *
 * A utility class for use by all controllers.
 */
@Component
public class ControllerUtil {

	public final static String USER_KEY = "user";

	private static UserService userService;

	@Autowired
	public void setUserService(UserService userService){
		ControllerUtil.userService = userService;
	}

	public static void addUserToModelAndView(ModelAndView modelAndView) {
		User user = getSignedInUser();
		modelAndView.addObject(USER_KEY, user);
	}
	
	/**
	 * Returns signed in user. If not signed in, return null
	 * @return User signed in user. If not logged in, returns null.
	 */
	public static User getSignedInUser() {
		SecurityContext context = SecurityContextHolder.getContext();
		try {
			UserDetails userDetails = (UserDetails) context.getAuthentication().getPrincipal();
			return userService.retrieveUser(userDetails);
		} catch (ClassCastException cce) {
			// the try-block throws class cast exception if user is not logged in.
			return null;
		} catch (NullPointerException npe) {
			return null;
		}
	}
	
	/*
	 * ex: http://128.32.xxx.11:8080
	 * or, http://wise3.telscenter.org if request.header is wise.telscenter.org
	 */
	public static String getBaseUrlString(HttpServletRequest request) {
		String host = request.getHeader("Host");
		String portalUrl = request.getScheme() + "://" + request.getServerName() + ":" +
		request.getServerPort();
		
		if (host != null) {
			portalUrl = request.getScheme() + "://" + host;
		}
		
		return portalUrl;
	}

	/*
	 * ex: http://128.32.xxx.11:8080/webapp
	 */
	public static String getPortalUrlString(HttpServletRequest request) {
		String portalUrl = ControllerUtil.getBaseUrlString(request) + request.getContextPath();
		
		return portalUrl;
	}
}