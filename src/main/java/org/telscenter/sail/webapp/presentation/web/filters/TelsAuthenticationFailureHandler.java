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
package org.telscenter.sail.webapp.presentation.web.filters;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.Date;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpSession;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.service.UserService;
import net.tanesha.recaptcha.ReCaptcha;
import net.tanesha.recaptcha.ReCaptchaFactory;

import org.springframework.context.ApplicationContext;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.web.context.support.WebApplicationContextUtils;
import org.telscenter.sail.webapp.domain.authentication.MutableUserDetails;

/**
 * @author hirokiterashima
 * @version $Id:$
 */
public class TelsAuthenticationFailureHandler extends
		SimpleUrlAuthenticationFailureHandler {

	private Properties portalProperties;
	
	public static final Integer recentFailedLoginTimeLimit = 15;
	
	public static final Integer recentFailedLoginAttemptsLimit = 5;
	
	private String authenticationFailureUrl;



	@Override
	public void onAuthenticationFailure(javax.servlet.http.HttpServletRequest request,
            javax.servlet.http.HttpServletResponse response,
            AuthenticationException exception)
     throws java.io.IOException,
            javax.servlet.ServletException {
		Authentication authentication = exception.getAuthentication();

		String userName = "";

		if(authentication != null) {
			//get the user name from the authentication
			userName = (String) authentication.getPrincipal();
		} else {
			/*
			 * the authentication is null which means the user failed to answer
			 * the captcha correctly. if this is the case, this function is being
			 * called from successfulAuthentication() 
			 */
			Object extraInformation = exception.getExtraInformation();

			if(extraInformation instanceof MutableUserDetails) {
				//get the user name from the MutableUserDetails
				MutableUserDetails extraInformationUserDetails = (MutableUserDetails) extraInformation;
				userName = extraInformationUserDetails.getUsername();
			}
		}

		HttpSession session = request.getSession();
		ApplicationContext springContext = WebApplicationContextUtils.getWebApplicationContext(session.getServletContext());
		UserService userService = (UserService) springContext.getBean("userService");

		//get the user
		User user = userService.retrieveUserByUsername(userName);
		
		if(user != null) {
			//user name exists

			//get the user details
			MutableUserDetails userDetails = (MutableUserDetails) user.getUserDetails();

			//get the recent time they failed to login
			Date recentFailedLoginTime = userDetails.getRecentFailedLoginTime();

			//get the current time
			Date currentTime = new Date();

			if(recentFailedLoginTime != null) {
				//they have failed to log in before

				long timeDifference = currentTime.getTime() - recentFailedLoginTime.getTime();

				/*
				 * check if the time difference is less than 15 minutes. if the time difference
				 * is less than 15 minutes we will increment the failed attempts counter.
				 * if the difference is greater than 15 minutes we will reset the counter.
				 */
				if(timeDifference < (recentFailedLoginTimeLimit * 60 * 1000)) {
					//time since last failed attempt is less than 15 minutes

					//increase the recent failed number of attempts by 1
					userDetails.incrementNumberOfRecentFailedLoginAttempts();
				} else {
					//time since last failed attempt is greater than 15 minutes

					//set the time they failed to log in
					userDetails.setRecentFailedLoginTime(currentTime);

					//set the failed number of attempts
					userDetails.setNumberOfRecentFailedLoginAttempts(1);
				}
			} else {
				//they have never failed to log in

				//set the time they failed to log in
				userDetails.setRecentFailedLoginTime(currentTime);

				//set the failed number of attempts
				userDetails.setNumberOfRecentFailedLoginAttempts(1);
			}

			//update the user
			userService.updateUser(user);
		}
		
		this.setDefaultFailureUrl(this.determineFailureUrl(request, exception));
		super.onAuthenticationFailure(request, response, exception);
	}
	
	/**
	 * Get the failure url. This function checks if the public and private 
	 * keys for the captcha have been provided and if the user has failed
	 * to log in 5 or more times in the last 15 minutes. If so, it will
	 * require the failure url page to display a captcha.
	 * @see org.springframework.security.ui.AbstractProcessingFilter#determineFailureUrl(javax.servlet.http.HttpServletRequest, org.springframework.security.AuthenticationException)
	 */	
	protected String determineFailureUrl(javax.servlet.http.HttpServletRequest request, AuthenticationException failed) {

		//check if the public and private keys are set in the portal.properties
		String reCaptchaPublicKey = portalProperties.getProperty("recaptcha_public_key");
		String reCaptchaPrivateKey = portalProperties.getProperty("recaptcha_private_key");

		//check if the public key is valid in case the admin entered it wrong
		boolean reCaptchaKeyValid = isReCaptchaKeyValid(reCaptchaPublicKey, reCaptchaPrivateKey);
		
		if(reCaptchaPublicKey != null && reCaptchaPrivateKey != null && reCaptchaKeyValid) {
			/*
			 * the public and private keys for the captcha have been provided and
			 * the public key is valid so now we will check if the user has failed
			 * to log in 5 or more times in the last 15 minutes.
			 */
			
			Authentication authentication = failed.getAuthentication();

			String userName = "";

			if(authentication != null) {
				//get the user name from the authentication
				userName = (String) authentication.getPrincipal();
			} else {
				Object extraInformation = failed.getExtraInformation();
				if(extraInformation instanceof MutableUserDetails) {
					//get the user name from the MutableUserDetails
					MutableUserDetails extraInformationUserDetails = (MutableUserDetails) extraInformation;
					userName = extraInformationUserDetails.getUsername();    			
				}
			}

			HttpSession session = request.getSession();
			ApplicationContext springContext = WebApplicationContextUtils.getWebApplicationContext(session.getServletContext());
			UserService userService = (UserService) springContext.getBean("userService");

			//get the user
			User user = userService.retrieveUserByUsername(userName);

			if(user != null) {
				//user exists

				//get the user details
				MutableUserDetails userDetails = (MutableUserDetails) user.getUserDetails();

				Integer numberOfRecentFailedLoginAttempts = userDetails.getNumberOfRecentFailedLoginAttempts();

				if(numberOfRecentFailedLoginAttempts != null && 
						userDetails.getNumberOfRecentFailedLoginAttempts() >= recentFailedLoginAttemptsLimit) {
					/*
					 * the user has failed to login 5 or more times in the last
					 * 15 minutes so we will require them to fill in a captcha
					 */
					return authenticationFailureUrl + "&requireCaptcha=true";
				}
			}			
		}

		return authenticationFailureUrl;
	}
	
	/**
	 * Check to make sure the public key is valid. We can only check if the public
	 * key is valid. If the private key is invalid the admin will have to realize that.
	 * We also check to make sure the connection to the captcha server is working.
	 * @param reCaptchaPublicKey the public key
	 * @param recaptchaPrivateKey the private key
	 * @return whether the captcha is valid and should be used
	 */
	private boolean isReCaptchaKeyValid(String reCaptchaPublicKey, String recaptchaPrivateKey) {
		boolean isValid = false;
		
		if(reCaptchaPublicKey != null && recaptchaPrivateKey != null) {
			
			//make a new instace of the captcha so we can make sure th key is valid
			ReCaptcha c = ReCaptchaFactory.newReCaptcha(reCaptchaPublicKey, recaptchaPrivateKey, false);
			
			/*
			 * get the html that will display the captcha
			 * e.g.
			 * <script type="text/javascript" src="http://api.recaptcha.net/challenge?k=yourpublickey"></script>
			 */
			String recaptchaHtml = c.createRecaptchaHtml(null, null);
			
			/*
			 * try to retrieve the src url by matching everything between the
			 * quotes of src=""
			 * 
			 * e.g. http://api.recaptcha.net/challenge?k=yourpublickey
			 */
			Pattern pattern = Pattern.compile(".*src=\"(.*)\".*");
			Matcher matcher = pattern.matcher(recaptchaHtml);
			matcher.find();
			String match = matcher.group(1);
			
			try {
				/*
				 * get the response text from the url
				 */
				
				URL url = new URL(match);
		        URLConnection urlConnection = url.openConnection();
		        BufferedReader in = new BufferedReader(new InputStreamReader(urlConnection.getInputStream()));
		        
		        StringBuffer text = new StringBuffer();
		        String inputLine;

		        while ((inputLine = in.readLine()) != null) {
		            text.append(inputLine);
		        }
		        in.close();
		        
		        //the response text from the url
		        String responseText = text.toString();

		        /*
		         * if the public key was invalid the text returned from the url will
		         * look like
		         * 
		         * document.write('Input error: k: Format of site key was invalid\n');
		         */
		        if(!responseText.contains("Input error")) {
		        	//the text from the server does not contain the error so the key is valid
		        	isValid = true;
		        }
			} catch (MalformedURLException e) {
				/*
				 * if there was a problem connecting to the server this function will return
				 * false so that users can still log in and won't be stuck because the
				 * recaptcha server is down.
				 */
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}

        return isValid;
	}


	/**
	 * @param portalProperties the portalProperties to set
	 */
	public void setPortalProperties(Properties portalProperties) {
		this.portalProperties = portalProperties;
	}

	/**
	 * @param authenticationFailureUrl the authenticationFailureUrl to set
	 */
	public void setAuthenticationFailureUrl(String authenticationFailureUrl) {
		this.authenticationFailureUrl = authenticationFailureUrl;
	}
}
