/**
 * Copyright (c) 2007-2017 Regents of the University of California (Regents).
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
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.Date;
import java.util.HashMap;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.net.ssl.HttpsURLConnection;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.listeners.WISESessionListener;
import org.wise.portal.service.user.UserService;

import net.tanesha.recaptcha.ReCaptcha;
import net.tanesha.recaptcha.ReCaptchaFactory;

/**
 * Custom AuthenticationProcessingFilter that subclasses Acegi Security. This
 * filter upon successful authentication will retrieve a <code>User</code> and
 * put it into the http session.
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
public class WISEAuthenticationProcessingFilter extends UsernamePasswordAuthenticationFilter {

  @Autowired
  protected UserService userService;

  @Autowired
  private Properties wiseProperties;

  public static final String STUDENT_DEFAULT_TARGET_PATH = "/student";
  public static final String TEACHER_DEFAULT_TARGET_PATH = "/teacher";
  public static final String ADMIN_DEFAULT_TARGET_PATH = "/admin";
  public static final String RESEARCHER_DEFAULT_TARGET_PATH = "/teacher";  // TODO eventually researcher will have their own page...
  public static final String LOGIN_DISABLED_MESSGE_PAGE = "/pages/maintenance.html";

  public static final Integer recentFailedLoginTimeLimit = 15;
  public static final Integer recentFailedLoginAttemptsLimit = 5;

  private static final Log LOGGER = LogFactory
    .getLog(WISEAuthenticationProcessingFilter.class);

  /**
   * Check if the user is required to enter ReCaptcha text. If the
   * user is required to enter ReCaptcha text we will check if the
   * user has entered the correct ReCaptcha text. If ReCaptcha is
   * not required or if the ReCaptcha has been entered correctly,
   * continue on with the authentication process.
   *
   * @param request
   * @param response
   */
  @Override
  public Authentication attemptAuthentication(HttpServletRequest request,
      HttpServletResponse response) throws AuthenticationException {
    // check if the user is required to enter ReCaptcha text
    if (isReCaptchaRequired(request, response)) {
      // the user is required to enter ReCaptcha text

      String errorMessage = null;

      if (!isReCaptchaResponseValid(request, response)) {
        //the user has not answered the ReCaptcha correctly
        errorMessage = "Please verify that you are not a robot.";
      }

      if (errorMessage != null) {
        try {
                    /*
                     * the user has not been authenticated because they did not
                     * pass the ReCaptcha
                     */
          unsuccessfulAuthentication(request, response, new AuthenticationException(errorMessage) {});

          return null;
        } catch (IOException e) {
          e.printStackTrace();
        } catch (ServletException e) {
          e.printStackTrace();
        }
      }
    }

    return super.attemptAuthentication(request, response);
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

    if (reCaptchaKeyValid) {
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
      if (user != null) {
        //get the user details
        MutableUserDetails mutableUserDetails = (MutableUserDetails) user.getUserDetails();

        if (mutableUserDetails != null) {
          //get the current time
          Date currentTime = new Date();

          //get the recent time they failed to log in
          Date recentFailedLoginTime = mutableUserDetails.getRecentFailedLoginTime();

          if (recentFailedLoginTime != null) {
            //get the time difference
            long timeDifference = currentTime.getTime() - recentFailedLoginTime.getTime();

            //check if the time difference is less than 15 minutes
            if (timeDifference < (WISEAuthenticationProcessingFilter.recentFailedLoginTimeLimit * 60 * 1000)) {
              //get the number of failed login attempts since recentFailedLoginTime
              Integer numberOfRecentFailedLoginAttempts = mutableUserDetails.getNumberOfRecentFailedLoginAttempts();

              //check if the user failed to log in 5 or more times
              if (numberOfRecentFailedLoginAttempts != null &&
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
   * Check if the user has entered the correct text for ReCaptcha
   * @param request
   * @param response
   * @return whether the user has entered the correct text for ReCaptcha
   */
  protected boolean isReCaptchaResponseValid(HttpServletRequest request, HttpServletResponse response) {
    Boolean result = false;

    //get the public and private keys from the wise.properties
    String reCaptchaPublicKey = wiseProperties.getProperty("recaptcha_public_key");
    String reCaptchaPrivateKey = wiseProperties.getProperty("recaptcha_private_key");

    // get the google reCaptcha response
    String gRecaptchaResponse = request.getParameter("g-recaptcha-response");

    if (checkReCaptchaResponse(reCaptchaPrivateKey, reCaptchaPublicKey, gRecaptchaResponse)) {
      result = true;
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

    if (reCaptchaPublicKey != null && !"".equals(reCaptchaPublicKey) && recaptchaPrivateKey != null && !"".equals(recaptchaPrivateKey)) {

      //make a new instace of the captcha so we can make sure the key is valid
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
        if (!responseText.contains("Input error")) {
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

  @Override
  protected void successfulAuthentication(
    HttpServletRequest request,
    HttpServletResponse response,
    FilterChain chain,
    Authentication authentication)
    throws IOException, ServletException {
    HttpSession session = request.getSession();

    //get the user
    UserDetails userDetails = (UserDetails) authentication.getPrincipal();
    User user = userService.retrieveUser(userDetails);
    session.setAttribute(User.CURRENT_USER_SESSION_KEY, user);

    if (LOGGER.isDebugEnabled()) {
      LOGGER.debug("UserDetails logging in: " + userDetails.getUsername());
    }

    // add new session in a allLoggedInUsers servletcontext HashMap variable
    String sessionId = session.getId();
    HashMap<String, User> allLoggedInUsers = (HashMap<String, User>) session.getServletContext().getAttribute("allLoggedInUsers");
    if (allLoggedInUsers == null) {
      allLoggedInUsers = new HashMap<String, User>();
      session.getServletContext().setAttribute(WISESessionListener.ALL_LOGGED_IN_USERS, allLoggedInUsers);
    }
    allLoggedInUsers.put(sessionId, user);

    super.successfulAuthentication(request, response, chain, authentication);
  }

  @Override
  protected void unsuccessfulAuthentication(HttpServletRequest request,
                                            HttpServletResponse response, AuthenticationException failed)
    throws IOException, ServletException {
    super.unsuccessfulAuthentication(request, response, failed);
  }

  /**
   * Check if the response is valid
   * @param reCaptchaPrivateKey the ReCaptcha private key
   * @param reCaptchaPublicKey the ReCaptcha public key
   * @param gRecaptchaResponse the response
   * @return whether the user answered the ReCaptcha successfully
   */
  public static boolean checkReCaptchaResponse(String reCaptchaPrivateKey, String reCaptchaPublicKey, String gRecaptchaResponse) {

    boolean isValid = false;

    //check if the public key is valid in case the admin entered it wrong
    boolean reCaptchaKeyValid = isReCaptchaKeyValid(reCaptchaPublicKey, reCaptchaPrivateKey);

    if (reCaptchaKeyValid &&
      reCaptchaPrivateKey != null &&
      reCaptchaPublicKey != null &&
      gRecaptchaResponse != null &&
      !gRecaptchaResponse.equals("")) {

      try {

        // the url to verify the response
        URL verifyURL = new URL("https://www.google.com/recaptcha/api/siteverify");
        HttpsURLConnection connection = (HttpsURLConnection) verifyURL.openConnection();
        connection.setRequestMethod("POST");

        // set the params
        String postParams = "secret=" + reCaptchaPrivateKey + "&response=" + gRecaptchaResponse;

        // make the request to verify if the user answered the ReCaptcha successfully
        connection.setDoOutput(true);
        DataOutputStream outputStream = new DataOutputStream(connection.getOutputStream());
        outputStream.writeBytes(postParams);
        outputStream.flush();
        outputStream.close();

        BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
        String inputLine = null;
        StringBuffer responseString = new StringBuffer();

        // read the response from the verify request
        while((inputLine = bufferedReader.readLine()) != null) {
          responseString.append(inputLine);
        }

        bufferedReader.close();

        try {
          // create a JSON object from the response
          JSONObject responseObject = new JSONObject(responseString.toString());

          // get the value of the success field
          isValid = responseObject.getBoolean("success");
        } catch (JSONException e) {
          e.printStackTrace();
        }
      } catch (MalformedURLException e) {
        e.printStackTrace();
      } catch (IOException e) {
        e.printStackTrace();
      }
    }

    return isValid;
  }
}
