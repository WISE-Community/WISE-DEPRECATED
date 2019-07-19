/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
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
package org.wise.portal.presentation.web.controllers.admin;

import org.apache.commons.io.IOUtils;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClientBuilder;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.admin.DailyAdminJob;
import org.wise.portal.domain.portal.Portal;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.portal.PortalService;
import org.wise.portal.service.session.SessionService;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Properties;

/**
 * Controller for Admin index page
 * @author Hiroki Terashima
 */
@Controller
public class AdminIndexController {

  private static final String GET_WISE_INFO_URL = "http://wise5.org/getWISEInfo.php";
  private static final String WISE_UPDATE_URL = "http://wise5.org";
  private static final String WISE_COMMIT_HISTORY_URL =
      "https://api.github.com/repos/WISE-Community/WISE/commits?page=1&per_page=20";

  @Autowired
  private PortalService portalService;

  @Autowired
  private Properties appProperties;

  @Autowired
  private DailyAdminJob adminJob;

  @Autowired
  protected SessionService sessionService;

  @GetMapping("/admin")
  protected ModelAndView showAdminHome(HttpServletRequest request) throws Exception {
    ModelAndView modelAndView = new ModelAndView("admin/index");

    String thisWISEVersion;
    try {
      thisWISEVersion = portalService.getWISEVersion();
      modelAndView.addObject("thisWISEVersion", thisWISEVersion);
    } catch (Exception e) {
      modelAndView.addObject("thisWISEVersion", "error retrieving current WISE version");
      e.printStackTrace();
    }

    Integer portalId = 1;
    Portal portal = portalService.getById(portalId);
    modelAndView.addObject("portal", portal);
    modelAndView.addObject("updateWISEURL", WISE_UPDATE_URL);
    modelAndView.addObject("isBatchCreateUserAccountsEnabled",
        Boolean.valueOf(appProperties.getProperty("isBatchCreateUserAccountsEnabled", "false")));
    modelAndView.addObject("numCurrentlyLoggedInUsers", sessionService.getNumberSignedInUsers());

    Calendar todayZeroHour = Calendar.getInstance();
    todayZeroHour.set(Calendar.HOUR_OF_DAY, 0);
    todayZeroHour.set(Calendar.MINUTE, 0);
    todayZeroHour.set(Calendar.SECOND, 0);
    todayZeroHour.set(Calendar.MILLISECOND, 0);
    Date dateMin = todayZeroHour.getTime();

    Date dateMax = new Date(Calendar.getInstance().getTimeInMillis());
    adminJob.setYesterday(dateMin);
    adminJob.setToday(dateMax);

    List<User> studentsWhoLoggedInToday =
        adminJob.findUsersWhoLoggedInSinceYesterday("studentUserDetails");
    List<User> teachersWhoLoggedInToday =
        adminJob.findUsersWhoLoggedInSinceYesterday("teacherUserDetails");
    if (studentsWhoLoggedInToday != null && teachersWhoLoggedInToday != null) {
      modelAndView.addObject("numUsersWhoLoggedInToday",
          studentsWhoLoggedInToday.size()+teachersWhoLoggedInToday.size());
    } else {
      modelAndView.addObject("numUsersWhoLoggedInToday", 0);
    }
    return modelAndView;
  }

  /**
   * Gets the latest global WISE version from master location and writes it in the response.
   * If there was an error retrieving the latest version, write the error message in the response.
   */
  @GetMapping("/admin/latestWISEVersion")
  public void getLatestGlobalWISEVersion(HttpServletResponse response) throws IOException {
    String latestWISEVersion = null;
    String wiseInstanceName = "";
    try {
      Integer portalId = 1;
      Portal portal = portalService.getById(portalId);
      if (portal != null) {
        wiseInstanceName = portal.getPortalName();
      }
    } catch (Exception e) {
    }

    if (wiseInstanceName == null || wiseInstanceName.isEmpty()) {
      wiseInstanceName = appProperties.getProperty("wise.name", "noName");
    }

    String wiseInstanceVersion = ControllerUtil.getWISEVersion();
    String wiseInfoUrl = GET_WISE_INFO_URL + "?wiseInstanceName=" +
        URLEncoder.encode(wiseInstanceName, "UTF-8") + "&wiseInstanceVersion=" +
        URLEncoder.encode(wiseInstanceVersion, "UTF-8");
    String globalWISEVersionJSONString = retrieveString(wiseInfoUrl);
    try {
      JSONObject globalWISEVersionJSON = new JSONObject(globalWISEVersionJSONString);
      String globalWISEMajorVersion = globalWISEVersionJSON.getString("major");
      String globalWISEMinorVersion = globalWISEVersionJSON.getString("minor");
      latestWISEVersion = globalWISEMajorVersion + "." + globalWISEMinorVersion;
    } catch (Exception e) {
      e.printStackTrace();
    }
    response.getWriter().print(latestWISEVersion);
  }

  /**
   * Gets the recent commits to WISE project from GitHub and prints the result in the response.
   * If there was an error during the GET, print a "error"
   * @param response
   * @throws IOException
   */
  @GetMapping("/admin/recentCommitHistory")
  public void getRecentCommitHistory(HttpServletResponse response) throws IOException {
    String recentCommitHistoryJSONString = retrieveString(WISE_COMMIT_HISTORY_URL);
    try {
      JSONArray recentCommitHistoryJSONArray = new JSONArray(recentCommitHistoryJSONString);
      response.getWriter().print(recentCommitHistoryJSONArray.toString());
    } catch (Exception e) {
      response.getWriter().print("error");
      e.printStackTrace();
    }
  }

  /**
   * GETs the specified url and returns the string
   * @param url
   * @return
   */
  private String retrieveString(String url) {
    HttpClient client = HttpClientBuilder.create().build();
    HttpGet request = new HttpGet(url);
    byte[] responseBody = null;
    String responseString = null;
    try {
      HttpResponse response = client.execute(request);
      InputStream responseBodyAsStream = response.getEntity().getContent();
      responseBody = IOUtils.toByteArray(responseBodyAsStream);
    } catch (IOException e) {
      System.err.println("Fatal transport error: " + e.getMessage());
      e.printStackTrace();
    } finally {
      request.releaseConnection();
    }
    if (responseBody != null) {
      responseString = new String(responseBody);
    }
    return responseString;
  }
}
