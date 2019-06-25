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
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.listeners.WISESessionListener;
import org.wise.portal.service.portal.PortalService;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.user.UserService;
import org.wise.vle.utils.FileManager;

import javax.annotation.PostConstruct;
import javax.net.ssl.HttpsURLConnection;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.io.*;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.*;

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

  private static boolean isReCaptchaEnabled = false;
  private static final String PROJECT_THUMB_PATH = "/assets/project_thumb.png";
  private static final String LICENSE_PATH = "/license.txt";

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
  public static String getBaseUrlString() {
    HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
    return getBaseUrlString(request);
  }

  public static String getPortalUrlString() {
    HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
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
      return contextPath + "/websocket";
    } else {
      String portalContextPath = ControllerUtil.getPortalUrlString(request);
      return portalContextPath + "/websocket";
    }
  }

  public static JSONObject getRunJSON(Run run) throws JSONException {
    JSONObject runJSON = new JSONObject();
    runJSON.put("id", run.getId());
    runJSON.put("name", run.getName());
    runJSON.put("runCode", run.getRuncode());
    runJSON.put("startTime", run.getStartTimeMilliseconds());
    runJSON.put("endTime", run.getEndTimeMilliseconds());
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
    projectJSON.put("projectThumb", getProjectPath(project) + PROJECT_THUMB_PATH);
    projectJSON.put("owner", getOwnerJSON(project.getOwner()));
    projectJSON.put("sharedOwners", getProjectSharedOwnersJSON(project));
    projectJSON.put("parentId", project.getParentProjectId());
    projectJSON.put("wiseVersion", project.getWiseVersion());
    projectJSON.put("uri", projectService.getProjectURI(project));
    projectJSON.put("license", getLicensePath(project));
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
      ownerJSON.put("username", ownerUserDetails.getUsername());
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

  public static String getProjectPath(Project project) {
    String modulePath = project.getModulePath();
    int lastIndexOfSlash = modulePath.lastIndexOf("/");
    if (lastIndexOfSlash != -1) {
      String hostname = ControllerUtil.wiseProperties.getProperty("wise.hostname");
      String curriculumBaseWWW = ControllerUtil.wiseProperties.getProperty("curriculum_base_www");
      return hostname + curriculumBaseWWW + modulePath.substring(0, lastIndexOfSlash);
    }
    return "";
  }

  public static String getProjectLocalPath(Project project) {
    String modulePath = project.getModulePath();
    int lastIndexOfSlash = modulePath.lastIndexOf("/");
    if (lastIndexOfSlash != -1) {
      String curriculumBaseWWW = ControllerUtil.wiseProperties.getProperty("curriculum_base_dir");
      return curriculumBaseWWW + modulePath.substring(0, lastIndexOfSlash);
    }
    return "";
  }

  public static String getLicensePath(Project project) {
    String licensePath = getProjectLocalPath(project) + LICENSE_PATH;
    File licenseFile = new File(licensePath);
    if (licenseFile.isFile()) {
      return getProjectPath(project) + LICENSE_PATH;
    } else {
      return "";
    }
  }

  /**
   * Check if the user is required to answer ReCaptcha.
   * @param request
   * @return whether the user needs to submit text for ReCaptcha
   */
  public static boolean isReCaptchaRequired(HttpServletRequest request) {
    if (isReCaptchaEnabled()) {
      String username = request.getParameter("username");
      User user = userService.retrieveUserByUsername(username);
      if (user != null && isRecentFailedLoginWithinTimeLimit(user) &&
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

  public static void addNewSessionToAllLoggedInUsers(HttpServletRequest request, User user) {
    HttpSession session = request.getSession();
    String sessionId = session.getId();
    HashMap<String, User> allLoggedInUsers = (HashMap<String, User>) session
        .getServletContext().getAttribute(WISESessionListener.ALL_LOGGED_IN_USERS);
    if (allLoggedInUsers == null) {
      allLoggedInUsers = new HashMap<String, User>();
      session.getServletContext()
          .setAttribute(WISESessionListener.ALL_LOGGED_IN_USERS, allLoggedInUsers);
    }
    allLoggedInUsers.put(sessionId, user);
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

  public static boolean isReCaptchaEnabled() {
    return isReCaptchaEnabled;
  }

  @PostConstruct
  public static void checkReCaptchaEnabled() {
    String reCaptchaPublicKey = wiseProperties.getProperty("recaptcha_public_key");
    String reCaptchaPrivateKey = wiseProperties.getProperty("recaptcha_private_key");
    isReCaptchaEnabled = reCaptchaPublicKey != null && reCaptchaPrivateKey != null;
  }

  /**
   * Check if the ReCaptcha response is valid
   * @param gRecaptchaResponse the ReCaptcha response
   * @return whether the user answered the ReCaptcha successfully
   */
  public static boolean isReCaptchaResponseValid(String gRecaptchaResponse) {
    String reCaptchaPrivateKey = wiseProperties.getProperty("recaptcha_private_key");
    boolean isValid = false;
    if (isReCaptchaEnabled &&
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
