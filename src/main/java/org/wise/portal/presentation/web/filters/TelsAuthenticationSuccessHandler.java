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
package org.wise.portal.presentation.web.filters;


import java.io.IOException;
import java.util.Calendar;
import java.util.Collection;
import java.util.Date;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
import org.springframework.security.web.savedrequest.SavedRequest;
import org.springframework.util.StringUtils;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.portal.Portal;
import org.wise.portal.service.authentication.AuthorityNotFoundException;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.portal.PortalService;

/**
 * @author hirokiterashima
 * @version $Id:$
 */
public class TelsAuthenticationSuccessHandler extends
		SavedRequestAwareAuthenticationSuccessHandler {
	
	private UserDetailsService userDetailsService;
	
	private PortalService portalService;
	
	@Override
	public void onAuthenticationSuccess(javax.servlet.http.HttpServletRequest request,
            javax.servlet.http.HttpServletResponse response,
            Authentication authentication)
     throws javax.servlet.ServletException,
            java.io.IOException {
		UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        boolean userIsAdmin = false;
        if (userDetails instanceof StudentUserDetails) {        	
        	// pLT= previous login time (not this time, but last time)
        	Date lastLoginTime = ((StudentUserDetails) userDetails).getLastLoginTime();
        	long pLT = 0L; // previous last log in time
        	if (lastLoginTime != null) {
        		pLT = lastLoginTime.getTime();
        	}        
        	this.setDefaultTargetUrl(TelsAuthenticationProcessingFilter.STUDENT_DEFAULT_TARGET_PATH + "?pLT=" + pLT); 			        			
        }
        else if (userDetails instanceof TeacherUserDetails) {
	   		this.setDefaultTargetUrl(TelsAuthenticationProcessingFilter.TEACHER_DEFAULT_TARGET_PATH);

        	GrantedAuthority researcherAuth = null;
        	try {
        		researcherAuth = userDetailsService.loadAuthorityByName(UserDetailsService.RESEARCHER_ROLE);
			} catch (AuthorityNotFoundException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			Collection<? extends GrantedAuthority> authorities = userDetails.getAuthorities();
			for (GrantedAuthority authority : authorities) {
        		if (researcherAuth.equals(authority)) {
        			this.setDefaultTargetUrl(TelsAuthenticationProcessingFilter.RESEARCHER_DEFAULT_TARGET_PATH);
        		}
			}
	   		
        	GrantedAuthority adminAuth = null;
        	try {
				adminAuth = userDetailsService.loadAuthorityByName(UserDetailsService.ADMIN_ROLE);
			} catch (AuthorityNotFoundException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			for (GrantedAuthority authority : authorities) {
        		if (adminAuth.equals(authority)) {
        			this.setDefaultTargetUrl(TelsAuthenticationProcessingFilter.ADMIN_DEFAULT_TARGET_PATH);
        			userIsAdmin = true;
        		}
			}
        }
        
        // if user is not admin and login is disallowed, redirect user to logout page
        try {
			Portal portal = portalService.getById(1);
			if (!userIsAdmin && !portal.isLoginAllowed()) {
				//get the context path e.g. /wise
				String contextPath = request.getContextPath();
				
		        	response.sendRedirect(contextPath + TelsAuthenticationProcessingFilter.LOGOUT_PATH);
		        	return;
		    }
        } catch (ObjectNotFoundException e) {
			// do nothing
		} catch (IOException ioe) {
			// do nothing
		}
      
        /* redirect if specified in the login request */
        SavedRequest savedRequest = 
        	    new HttpSessionRequestCache().getRequest(request, response);
        if (savedRequest != null) {
        	String redirectUrl = savedRequest.getRedirectUrl();
        	if(StringUtils.hasText(redirectUrl)){
        		this.setDefaultTargetUrl(redirectUrl);
        	}
        }
   		
		((MutableUserDetails) userDetails).incrementNumberOfLogins();
		((MutableUserDetails) userDetails).setLastLoginTime(Calendar.getInstance().getTime());
		((MutableUserDetails) userDetails).setNumberOfRecentFailedLoginAttempts(0);
		userDetailsService.updateUserDetails((MutableUserDetails) userDetails);
		super.handle(request, response, authentication);
	}
	
	/**
	 * @return the userDetailsService
	 */
	public UserDetailsService getUserDetailsService() {
		return userDetailsService;
	}

	/**
	 * @param userDetailsService the userDetailsService to set
	 */
	public void setUserDetailsService(UserDetailsService userDetailsService) {
		this.userDetailsService = userDetailsService;
	}

	/**
	 * @param portalService the portalService to set
	 */
	public void setPortalService(PortalService portalService) {
		this.portalService = portalService;
	}		
}
