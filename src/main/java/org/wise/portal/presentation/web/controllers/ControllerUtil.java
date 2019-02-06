/**
 * Copyright (c) 2007-2017 Encore Research Group, University of Toronto
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

import net.tanesha.recaptcha.ReCaptcha;
import net.tanesha.recaptcha.ReCaptchaFactory;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.acls.model.Permission;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.switchuser.SwitchUserFilter;
import org.springframework.stereotype.Component;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.portal.PortalService;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.user.UserService;

import javax.net.ssl.HttpsURLConnection;
import javax.servlet.http.HttpServletRequest;
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * A utility class for use by all controllers
 *
 * @author Laurel Williams
 */
@Component
public class ControllerUtil {

  public static final Integer recentFailedLoginTimeLimitInMinutes = 10;
  public static final Integer recentFailedLoginAttemptsLimit = 10;

  private static UserService userService;

  private static PortalService portalService;

  @Autowired
  private static Properties wiseProperties;

  @Autowired
  private static ProjectService projectService;

  @Autowired
  private static RunService runService;


  @Autowired
  public void setWiseProperties(Properties wiseProperties){
    ControllerUtil.wiseProperties = wiseProperties;
  }

  @Autowired
  public void setProjectService(ProjectService projectService){
    ControllerUtil.projectService = projectService;
  }

  @Autowired
  public void setRunService(RunService runService){
    ControllerUtil.runService = runService;
  }

  @Autowired
  public void setUserService(UserService userService){
    ControllerUtil.userService = userService;
  }

  @Autowired
  public void setPortalService(PortalService portalService){
    ControllerUtil.portalService = portalService;
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

  /**
   * Returns the base url of the specified request
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

  /**
   * Determines whether the logged-in user is an adminstrator currently logged in as somebody else
   * @return true iff this user is currently logged in as somebody else
   */
  public static boolean isUserPreviousAdministrator() {
    Collection<? extends GrantedAuthority> authorities = SecurityContextHolder.getContext()
        .getAuthentication().getAuthorities();
    for (GrantedAuthority grantedAuthority : authorities) {
      if (SwitchUserFilter.ROLE_PREVIOUS_ADMINISTRATOR.equals(grantedAuthority.getAuthority())) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns the portal url
   * ex: http://128.32.xxx.11:8080/webapp
   */
  public static String getPortalUrlString(HttpServletRequest request) {
    return getBaseUrlString(request) + request.getContextPath();
  }

  /**
   * Returns the version of this WISE instance
   * @return wise instance version, or empty string if it cannot be found
   */
  public static String getWISEVersion() {
    String wiseVersion = "";
    try {
      wiseVersion = portalService.getWISEVersion();
    } catch (Exception e) {
      // do nothing
    }
    return wiseVersion;
  }

  /**
   * Get the websocket base url e.g. ws://localhost:8080/wise/websocket
   */
  public static String getWebSocketURL(HttpServletRequest request, String contextPath) {
    if (contextPath.contains("http")) {
      return contextPath.replace("http", "ws") + "/websocket";
    } else {
      String portalContextPath = ControllerUtil.getPortalUrlString(request);
      return portalContextPath.replace("http", "ws") + "/websocket";
    }
  }

  public static JSONObject getRunJSON(Run run) throws JSONException {
    JSONObject runJSON = new JSONObject();
    runJSON.put("id", run.getId());
    runJSON.put("name", run.getName());
    runJSON.put("runCode", run.getRuncode());
    runJSON.put("startTime", run.getStarttime());
    runJSON.put("endTime", run.getEndtime());
    Set<Group> periods = run.getPeriods();
    JSONArray periodsArray = new JSONArray();
    for (Group period : periods) {
      periodsArray.put(period.getName());
    }
    runJSON.put("periods", periodsArray);
    runJSON.put("numStudents", getNumStudentsInRun(run));
    runJSON.put("owner", getOwnerJSON(run.getOwner()));
    runJSON.put("sharedOwners", getRunSharedOwners(run));
    runJSON.put("project", getProjectJSON(run.getProject()));
    return runJSON;
  }

  public static int getNumStudentsInRun(Run projectRun) {
    Set<Group> periods = projectRun.getPeriods();
    int numStudents = 0;
    for (Group period : periods) {
      Set<User> members = period.getMembers();
      numStudents += members.size();
    }
    return numStudents;
  }

  public static JSONObject getProjectJSON(Project project) throws JSONException {
    JSONObject projectJSON = new JSONObject();
    projectJSON.put("id", project.getId());
    projectJSON.put("name", project.getName());
    projectJSON.put("metadata", project.getMetadata().toJSONObject());
    projectJSON.put("dateCreated", project.getDateCreated());
    projectJSON.put("dateArchived", project.getDateDeleted());
    projectJSON.put("projectThumb", getProjectThumbIconPath(project));
    projectJSON.put("owner", getOwnerJSON(project.getOwner()));
    projectJSON.put("sharedOwners", getProjectSharedOwnersJSON(project));
    projectJSON.put("parentId", project.getParentProjectId());
    projectJSON.put("wiseVersion", project.getWiseVersion());
    return projectJSON;
  }

  public static JSONArray getRunSharedOwners(Run run) throws JSONException {
    JSONArray sharedOwners = new JSONArray();
    for (User sharedOwner : run.getSharedowners()) {
      JSONObject sharedOwnerJSON = getSharedOwnerJSON(sharedOwner, run);
      sharedOwners.put(sharedOwnerJSON);
    }
    return sharedOwners;
  }

  public static JSONObject getOwnerJSON(User owner) throws JSONException {
    JSONObject ownerJSON = new JSONObject();
    try {
      ownerJSON.put("id", owner.getId());
      TeacherUserDetails ownerUserDetails = (TeacherUserDetails) owner.getUserDetails();
      ownerJSON.put("displayName", ownerUserDetails.getDisplayname());
      ownerJSON.put("userName", ownerUserDetails.getUsername());
      ownerJSON.put("firstName", ownerUserDetails.getFirstname());
      ownerJSON.put("lastName", ownerUserDetails.getLastname());
    } catch(org.hibernate.ObjectNotFoundException e) {
      System.out.println(e);
    }
    return ownerJSON;
  }

  public static JSONArray getProjectSharedOwnersJSON(Project project) throws JSONException {
    JSONArray sharedOwners = new JSONArray();
    for (User sharedOwner : project.getSharedowners()) {
      sharedOwners.put(getSharedOwnerJSON(sharedOwner, project));
    }
    return sharedOwners;
  }

  public static JSONObject getSharedOwnerJSON(User sharedOwner, Project project) throws JSONException {
    JSONObject sharedOwnerJSON = new JSONObject();
    sharedOwnerJSON.put("id", sharedOwner.getId());
    sharedOwnerJSON.put("username", sharedOwner.getUserDetails().getUsername());
    sharedOwnerJSON.put("firstName", sharedOwner.getUserDetails().getFirstname());
    sharedOwnerJSON.put("lastName", sharedOwner.getUserDetails().getLastname());
    sharedOwnerJSON.put("permissions", getSharedOwnerPermissions(project, sharedOwner));
    return sharedOwnerJSON;
  }

  private static JSONObject getSharedOwnerJSON(User sharedOwner, Run run) throws JSONException {
    JSONObject sharedOwnerJSON = new JSONObject();
    sharedOwnerJSON.put("id", sharedOwner.getId());
    sharedOwnerJSON.put("username", sharedOwner.getUserDetails().getUsername());
    sharedOwnerJSON.put("firstName", sharedOwner.getUserDetails().getFirstname());
    sharedOwnerJSON.put("lastName", sharedOwner.getUserDetails().getLastname());
    sharedOwnerJSON.put("permissions", getSharedOwnerPermissions(run, sharedOwner));
    return sharedOwnerJSON;
  }

  private static JSONArray getSharedOwnerPermissions(Run projectRun, User sharedOwner) {
    JSONArray sharedOwnerPermissions = new JSONArray();
    List<Permission> sharedTeacherPermissions = ControllerUtil.runService.getSharedTeacherPermissions(projectRun, sharedOwner);
    for (Permission permission : sharedTeacherPermissions) {
      sharedOwnerPermissions.put(permission.getMask());
    }
    return sharedOwnerPermissions;
  }

  public static JSONArray getSharedOwnerPermissions(Project project, User sharedOwner) {
    JSONArray sharedOwnerPermissions = new JSONArray();
    List<Permission> sharedTeacherPermissions = ControllerUtil.projectService.getSharedTeacherPermissions(project, sharedOwner);
    for (Permission permission : sharedTeacherPermissions) {
      sharedOwnerPermissions.put(permission.getMask());
    }
    return sharedOwnerPermissions;
  }

  public static String getProjectThumbIconPath(Project project) {
    String modulePath = project.getModulePath();
    int lastIndexOfSlash = modulePath.lastIndexOf("/");
    if (lastIndexOfSlash != -1) {
      String curriculumBaseWWW = ControllerUtil.wiseProperties.getProperty("curriculum_base_www");
      return curriculumBaseWWW + modulePath.substring(0, lastIndexOfSlash) + "/assets/project_thumb.png";
    }
    return "";
  }

  /**
   * Check if the user is required to answer ReCaptcha. The user is required
   * to answer ReCaptcha if the ReCaptcha keys are valid and the user has
   * previously failed to log in 10 or more times in the last 10 minutes.
   * @param request
   * @return whether the user needs to submit text for ReCaptcha
   */
  public static boolean isReCaptchaRequired(HttpServletRequest request) {
    String reCaptchaPublicKey = wiseProperties.getProperty("recaptcha_public_key");
    String reCaptchaPrivateKey = wiseProperties.getProperty("recaptcha_private_key");
    boolean reCaptchaKeyValid = isReCaptchaKeyValid(reCaptchaPublicKey, reCaptchaPrivateKey);
    if (reCaptchaKeyValid) {
      String userName = request.getParameter("username");
      User user = userService.retrieveUserByUsername(userName);
      if(user != null && isRecentFailedLoginWithinTimeLimit(user) &&
          isRecentNumberOfFailedLoginAttemptsOverLimit(user)) {
        return true;
      }
    }
    return false;
  }

  public static boolean isRecentFailedLoginWithinTimeLimit(User user) {
    MutableUserDetails mutableUserDetails = user.getUserDetails();
    if (mutableUserDetails != null) {
      Date currentTime = new Date();
      Date recentFailedLoginTime = mutableUserDetails.getRecentFailedLoginTime();
      if (recentFailedLoginTime != null) {
        long timeDifference = currentTime.getTime() - recentFailedLoginTime.getTime();
        if (timeDifference < (convertMinutesToMilliseconds(recentFailedLoginTimeLimitInMinutes))) {
          return true;
        }
      }
    }
    return false;
  }

  public static long convertMinutesToMilliseconds(Integer minutes) {
    return Long.valueOf(minutes) * 60 * 1000;
  }

  public static boolean isRecentNumberOfFailedLoginAttemptsOverLimit(User user) {
    MutableUserDetails mutableUserDetails = user.getUserDetails();
    if (mutableUserDetails != null) {
      Integer numberOfRecentFailedLoginAttempts = mutableUserDetails.getNumberOfRecentFailedLoginAttempts();
      if (numberOfRecentFailedLoginAttempts != null &&
        numberOfRecentFailedLoginAttempts >= recentFailedLoginAttemptsLimit) {
        return true;
      }
    }
    return false;
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

    if (reCaptchaPublicKey != null && recaptchaPrivateKey != null) {
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
        URL url = new URL(match);
        URLConnection urlConnection = url.openConnection();
        BufferedReader in = new BufferedReader(new InputStreamReader(urlConnection.getInputStream()));

        StringBuffer text = new StringBuffer();
        String inputLine;

        while ((inputLine = in.readLine()) != null) {
          text.append(inputLine);
        }
        in.close();

        String responseText = text.toString();

        /*
         * if the public key was invalid the text returned from the url will
         * look like
         *
         * document.write('Input error: k: Format of site key was invalid\n');
         */
        if(!responseText.contains("Input error")) {
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
   * Check if the response is valid
   * @param reCaptchaPrivateKey the ReCaptcha private key
   * @param reCaptchaPublicKey the ReCaptcha public key
   * @param gRecaptchaResponse the response
   * @return whether the user answered the ReCaptcha successfully
   */
  public static boolean checkReCaptchaResponse(String reCaptchaPrivateKey,
                                               String reCaptchaPublicKey, String gRecaptchaResponse) {
    boolean isValid = false;
    boolean reCaptchaKeyValid = ControllerUtil.isReCaptchaKeyValid(reCaptchaPublicKey, reCaptchaPrivateKey);
    if (reCaptchaKeyValid &&
      reCaptchaPrivateKey != null &&
      reCaptchaPublicKey != null &&
      gRecaptchaResponse != null &&
      !gRecaptchaResponse.equals("")) {
      try {
        URL verifyURL = new URL("https://www.google.com/recaptcha/api/siteverify");
        HttpsURLConnection connection = (HttpsURLConnection) verifyURL.openConnection();
        connection.setRequestMethod("POST");
        String postParams = "secret=" + reCaptchaPrivateKey + "&response=" + gRecaptchaResponse;
        connection.setDoOutput(true);
        DataOutputStream outputStream = new DataOutputStream(connection.getOutputStream());
        outputStream.writeBytes(postParams);
        outputStream.flush();
        outputStream.close();

        BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
        String inputLine = null;
        StringBuffer responseString = new StringBuffer();

        while((inputLine = bufferedReader.readLine()) != null) {
          responseString.append(inputLine);
        }

        bufferedReader.close();

        try {
          JSONObject responseObject = new JSONObject(responseString.toString());
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
