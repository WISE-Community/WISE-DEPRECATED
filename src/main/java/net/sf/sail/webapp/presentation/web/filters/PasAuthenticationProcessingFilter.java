/**
 * Copyright (c) 2007 Encore Research Group, University of Toronto
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
package net.sf.sail.webapp.presentation.web.filters;

import java.io.IOException;
import java.util.HashMap;

import javax.servlet.ServletException;
import javax.servlet.http.HttpSession;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.presentation.web.listeners.PasSessionListener;
import net.sf.sail.webapp.service.UserService;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.context.support.WebApplicationContextUtils;

/**
 * Custom AuthenticationProcessingFilter that subclasses Acegi Security. This
 * filter upon successful authentication will retrieve a <code>User</code> and
 * put it into the http session.
 * 
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public class PasAuthenticationProcessingFilter extends
	UsernamePasswordAuthenticationFilter {

	private static final Log LOGGER = LogFactory
            .getLog(PasAuthenticationProcessingFilter.class);

    public PasAuthenticationProcessingFilter() {
		// TODO Auto-generated constructor stub
	}

	/**
     * @see org.acegisecurity.ui.AbstractProcessingFilter#successfulAuthentication(javax.servlet.http.HttpServletRequest,
     *      javax.servlet.http.HttpServletResponse,
     *      org.acegisecurity.Authentication)
     */
    @Override
    protected void successfulAuthentication(
            javax.servlet.http.HttpServletRequest request,
            javax.servlet.http.HttpServletResponse response,
            Authentication authResult) throws IOException, ServletException {

    	UserDetails userDetails = (UserDetails) authResult.getPrincipal();
        if (LOGGER.isDebugEnabled()) {
            logDebug(userDetails);
        }
        
        HttpSession session = request.getSession();
        ApplicationContext springContext = WebApplicationContextUtils
                .getWebApplicationContext(session.getServletContext());
        UserService userService = (UserService) springContext
                .getBean("userService");
        User user = userService.retrieveUser(userDetails);
        session.setAttribute(User.CURRENT_USER_SESSION_KEY, user);

        // add new session in a allLoggedInUsers servletcontext HashMap variable
		String sessionId = session.getId();
		HashMap<String, User> allLoggedInUsers = (HashMap<String, User>) session.getServletContext().getAttribute("allLoggedInUsers");
		if (allLoggedInUsers == null) {
			allLoggedInUsers = new HashMap<String, User>();
			session.getServletContext().setAttribute(PasSessionListener.ALL_LOGGED_IN_USERS, allLoggedInUsers);
		}
		allLoggedInUsers.put(sessionId, user);
        
        super.successfulAuthentication(request, response, authResult);
    }

    private void logDebug(UserDetails userDetails) {
        LOGGER.debug("UserDetails logging in: " + userDetails.getUsername());
    }
}