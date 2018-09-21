/**
 * Copyright (c) 2008-2015 Regents of the University of California (Regents).
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.presentation.web.filters;

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

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.tanesha.recaptcha.ReCaptcha;
import net.tanesha.recaptcha.ReCaptchaFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.user.UserService;

/**
 * @author Hiroki Terashima
 */
public class WISEAuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

  @Autowired
  private Properties wiseProperties;

  @Autowired
  private UserService userService;

  public static final Integer recentFailedLoginTimeLimit = 15;

  public static final Integer recentFailedLoginAttemptsLimit = 5;

  private String authenticationFailureUrl;

  /**
   * The user has failed to log in because they either entered
   * an incorrect password or an incorrect ReCaptcha text. We will
   * increment the counter that keeps track of the number of times
   * they have failed to log in within the last 15 minutes.
   * @param request
   * @param response
   */
  @Override
  @Transactional
  public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
      AuthenticationException exception) throws java.io.IOException, javax.servlet.ServletException {
    String userName = request.getParameter("username");
    if (userName != null) {
      User user = userService.retrieveUserByUsername(userName);
      if (user != null) {
        MutableUserDetails userDetails = (MutableUserDetails) user.getUserDetails();
        Date recentFailedLoginTime = userDetails.getRecentFailedLoginTime();
        Date currentTime = new Date();
        Integer numberOfRecentFailedLoginAttempts = 1;
        if (recentFailedLoginTime != null) {
          long timeDifference = currentTime.getTime() - recentFailedLoginTime.getTime();

          /*
           * check if the time difference is less than 15 minutes. if the time difference
           * is less than 15 minutes we will increment the failed attempts counter.
           * if the difference is greater than 15 minutes we will reset the counter.
           */
          if (timeDifference < (recentFailedLoginTimeLimit * 60 * 1000)) {
            numberOfRecentFailedLoginAttempts = userDetails.getNumberOfRecentFailedLoginAttempts() + 1;
          }
        }
        userDetails.setNumberOfRecentFailedLoginAttempts(numberOfRecentFailedLoginAttempts);
        userDetails.setRecentFailedLoginTime(currentTime);
        userService.updateUser(user);
      }
    } else if (request.getServletPath().contains("google-login")) {
      String contextPath = request.getContextPath();
      response.sendRedirect(contextPath + "/site/login/googleUserNotFound");
      return;
    }
    this.setDefaultFailureUrl(this.determineFailureUrl(request, response, exception));
    super.onAuthenticationFailure(request, response, exception);
  }

  /**
   * Get the failure url. This function checks if the public and private
   * keys for the captcha have been provided and if the user has failed
   * to log in 5 or more times in the last 15 minutes. If so, it will
   * require the failure url page to display a captcha.
   */
  protected String determineFailureUrl(HttpServletRequest request, HttpServletResponse response, AuthenticationException failed) {

    String url = authenticationFailureUrl;

    //get the failed message
    String failedMessage = failed.getMessage();

    //check if the user is required to enter ReCaptcha text
    boolean isReCaptchaRequired = isReCaptchaRequired(request, response);

    if(isReCaptchaRequired) {
      //the user is required to enter ReCaptcha text

      if(failedMessage.equals("Please verify that you are not a robot.")) {
        //the user has left the ReCaptcha field empty
        url = authenticationFailureUrl + "&requireCaptcha=true&reCaptchaFailed=true";
      }  else {
        //the user is required to enter ReCaptcha text
        url = authenticationFailureUrl + "&requireCaptcha=true";
      }
    } else {
      //the user incorrectly entered the username or password
      url = authenticationFailureUrl;
    }

    return url;
  }

  /**
   * Check if the user is required to answer ReCaptcha. The user is required
   * to answer ReCaptcha if the ReCaptcha keys are valid and the user has
   * previously failed to log in 5 or more times in the last 15 minutes.
   * @param request
   * @param response
   * @return whether the user needs to submit text for ReCaptcha
   */
  public boolean isReCaptchaRequired(HttpServletRequest request, HttpServletResponse response) {
    boolean result = false;

    //get the public and private keys from the wise.properties
    String reCaptchaPublicKey = wiseProperties.getProperty("recaptcha_public_key");
    String reCaptchaPrivateKey = wiseProperties.getProperty("recaptcha_private_key");

    //check if the public and private ReCaptcha keys are valid
    boolean reCaptchaKeyValid = isReCaptchaKeyValid(reCaptchaPublicKey, reCaptchaPrivateKey);

    if(reCaptchaKeyValid) {
      //the ReCaptcha keys are valid

      //get the user name that was entered into the user name field
      String userName = request.getParameter("username");

      //get the user object
      User user = userService.retrieveUserByUsername(userName);

      /*
       * get the user so we can check if they have been failing to login
       * multiple times recently and if so, we will display a captcha to
       * make sure they are not a bot. the public and private keys must be set in
       * the wise.properties otherwise we will not use captcha at all. we
       * will also check to make sure the captcha keys are valid otherwise
       * we won't use the captcha at all either.
       */
      if(user != null) {
        //get the user details
        MutableUserDetails mutableUserDetails = (MutableUserDetails) user.getUserDetails();

        if(mutableUserDetails != null) {
          //get the current time
          Date currentTime = new Date();

          //get the recent time they failed to log in
          Date recentFailedLoginTime = mutableUserDetails.getRecentFailedLoginTime();

          if(recentFailedLoginTime != null) {
            //get the time difference
            long timeDifference = currentTime.getTime() - recentFailedLoginTime.getTime();

            //check if the time difference is less than 15 minutes
            if(timeDifference < (WISEAuthenticationProcessingFilter.recentFailedLoginTimeLimit * 60 * 1000)) {
              //get the number of failed login attempts since recentFailedLoginTime
              Integer numberOfRecentFailedLoginAttempts = mutableUserDetails.getNumberOfRecentFailedLoginAttempts();

              //check if the user failed to log in 5 or more times
              if(numberOfRecentFailedLoginAttempts != null &&
                numberOfRecentFailedLoginAttempts >= WISEAuthenticationProcessingFilter.recentFailedLoginAttemptsLimit) {
                result = true;
              }
            }
          }
        }
      }
    }

    return result;
  }

  /**
   * Check to make sure the public key is valid. We can only check if the public
   * key is valid. If the private key is invalid the admin will have to realize that.
   * We also check to make sure the connection to the ReCaptcha server is working.
   * @param reCaptchaPublicKey the public key
   * @param recaptchaPrivateKey the private key
   * @return whether the ReCaptcha is valid and should be used
   */
  public static boolean isReCaptchaKeyValid(String reCaptchaPublicKey, String recaptchaPrivateKey) {
    boolean isValid = false;

    if(reCaptchaPublicKey != null && recaptchaPrivateKey != null) {

      //make a new instace of the captcha so we can make sure th key is valid
      ReCaptcha c = ReCaptchaFactory.newSecureReCaptcha(reCaptchaPublicKey, recaptchaPrivateKey, false);

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
   * @param wiseProperties the wiseProperties to set
   */
  public void setWiseProperties(Properties wiseProperties) {
    this.wiseProperties = wiseProperties;
  }

  /**
   * @param userService the userService to set
   */
  public void setUserService(UserService userService) {
    this.userService = userService;
  }

  /**
   * @param authenticationFailureUrl the authenticationFailureUrl to set
   */
  public void setAuthenticationFailureUrl(String authenticationFailureUrl) {
    this.authenticationFailureUrl = authenticationFailureUrl;
  }
}
