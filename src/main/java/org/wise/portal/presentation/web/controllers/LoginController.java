/**
 * Copyright (c) 2006-2015 Encore Research Group, University of Toronto
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

import java.io.IOException;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.wise.portal.domain.user.User;

/**
 * Controller that backs the Log-In form, for when user fails to log in.
 * 
 * @author Cynick Young
 * @author Geoffrey Kwan
 */
@Controller
public class LoginController {

	@Autowired
	private Properties wiseProperties;
	
	@RequestMapping(value = "/login", method = RequestMethod.GET)
	public String handleLogIn(
			HttpServletRequest request,
			ModelMap modelMap) throws Exception {
		String failed = request.getParameter("failed");
		String redirectUrl = request.getParameter("redirect");
		String requireCaptcha = request.getParameter("requireCaptcha");
		String reCaptchaEmpty = request.getParameter("reCaptchaEmpty");
		String reCaptchaFailed = request.getParameter("reCaptchaFailed");

		// get the user name that we will use to pre-populate the Username field
		String userName = request.getParameter("userName");
		
		// get the public and private keys from the wise.properties
		String reCaptchaPublicKey = wiseProperties.getProperty("recaptcha_public_key");
		String reCaptchaPrivateKey = wiseProperties.getProperty("recaptcha_private_key");

		if (StringUtils.hasText(failed)) {
			modelMap.put("failed", Boolean.TRUE);
		}

		if (StringUtils.hasText(redirectUrl)) {
			modelMap.put("redirect",redirectUrl);
		}

		if (userName != null) {
			// make the userName available to the jsp page
			modelMap.put("userName", userName);
		}
		
		/*
		 * all three variables must be available in order for captcha to work
		 */
		if (requireCaptcha != null && reCaptchaPublicKey != null && reCaptchaPrivateKey != null) {
			if (StringUtils.hasText(requireCaptcha)) {
				// make the page require captcha
				modelMap.put("requireCaptcha", Boolean.TRUE);
				modelMap.put("reCaptchaPublicKey", reCaptchaPublicKey);
				modelMap.put("reCaptchaPrivateKey", reCaptchaPrivateKey);
				
		        if (StringUtils.hasText(reCaptchaFailed)) {
		          // the user has entered the ReCaptcha text incorrectly
		            modelMap.put("reCaptchaFailed", Boolean.TRUE);
		        }
		        
		        if (StringUtils.hasText(reCaptchaEmpty)) {
		            /*
		             * the user is required to enter the ReCaptcha text
		             * but they have left the field empty
		             */
                    modelMap.put("reCaptchaEmpty", Boolean.TRUE);
                }
			}
		}

		return "login";
	}

    /**
     * Handles renew session requests. By virtue of making this request,
     * a logged-in user has already renewed the session.
     *
     * @param response
     * @throws IOException
     */
	@RequestMapping(value = "/session/renew", method = RequestMethod.GET)
	public void handleLogIn(HttpServletResponse response) throws IOException {
        User loggedInUser = ControllerUtil.getSignedInUser();
        if (loggedInUser != null) {
            response.getWriter().print("true");
        } else {
            response.getWriter().print("false");
        }
    }
}