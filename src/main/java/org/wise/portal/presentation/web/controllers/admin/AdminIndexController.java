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
package org.wise.portal.presentation.web.controllers.admin;

import java.io.IOException;
import java.io.InputStream;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpException;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.io.IOUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.admin.DailyAdminJob;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.listeners.WISESessionListener;
import org.wise.portal.service.portal.PortalService;

/**
 * Controller for Admin Index page
 * @author Hiroki Terashima
 */
@Controller
@RequestMapping("/admin")
public class AdminIndexController {

	private static final String MASTER_GET_WISE_INFO_URL = "http://wise5.org/getWISEInfo.php";
	
	private static final String WISE_UPDATE_URL = "http://wise5.org";
	
	// where to get commit history information
	private static final String WISE_COMMIT_HISTORY_URL = "https://api.github.com/repos/WISE-Community/WISE/commits?page=1&per_page=20";
	
	@Autowired
	private PortalService portalService;
	
	@Autowired
	private Properties wiseProperties;
	
	@Autowired
	private DailyAdminJob adminJob;

	@RequestMapping(method = RequestMethod.GET)
	protected ModelAndView handleRequestInternal(HttpServletRequest request) throws Exception {
		ModelAndView modelAndView = new ModelAndView("admin/index");
		
		String thisWISEVersion = null;  // local WISE version  e.g. "4.8", "4.9.1", etc
		String globalWISEVersion = null;  // master WISE version    e.g. "4.8", "4.9.1", etc

		// get WISE version from src/main/resources/version.json
		try {
			thisWISEVersion = portalService.getWISEVersion();
			modelAndView.addObject("thisWISEVersion", thisWISEVersion);
		} catch (Exception e) {
			modelAndView.addObject("thisWISEVersion", "error retrieving current WISE version");
			e.printStackTrace();
		}

		// add if this WISE instance allows batch creation of user accounts
		modelAndView.addObject("isBatchCreateUserAccountsEnabled", Boolean.valueOf(wiseProperties.getProperty("isBatchCreateUserAccountsEnabled", "false")));

		// get latest WISE info from master location
		String globalWISEVersionJSONString = retrieveGlobalWISEVersionJSONString();
		try {
			// now parse global WISE version JSON and add to ModelAndView.
			JSONObject globalWISEVersionJSON = new JSONObject(globalWISEVersionJSONString);
			String globalWISEMajorVersion = globalWISEVersionJSON.getString("major");
			String globalWISEMinorVersion = globalWISEVersionJSON.getString("minor");
			globalWISEVersion = globalWISEMajorVersion + "." + globalWISEMinorVersion;
			modelAndView.addObject("globalWISEVersion", globalWISEVersion);
		} catch (Exception e) {
			modelAndView.addObject("globalWISEVersion", "error retrieving latest WISE version");
			e.printStackTrace();
		}
		
		try {
			// now compare the two versions and add version notes to ModelAndView obj
			String versionNotes = "WISE is up to date!";
			if (Integer.parseInt(thisWISEVersion.replace(".", "")) < Integer.parseInt(globalWISEVersion.replace(".", ""))) {
				versionNotes = "A new version of WISE is available. Please update!";
				modelAndView.addObject("wiseUpdateUrl", WISE_UPDATE_URL);
			}
			modelAndView.addObject("versionNotes", versionNotes);
			
		} catch (Exception e) {
			// do nothing
			e.printStackTrace();
		}
		
		// now fetch recent commits
		String recentCommitHistoryJSONString = retrieveRecentCommitHistoryJSONString();
		try {
			// now parse commit history json and add to ModelAndView.
			JSONArray recentCommitHistoryJSONArray = new JSONArray(recentCommitHistoryJSONString);
			modelAndView.addObject("recentCommitHistoryJSON", recentCommitHistoryJSONArray);
		} catch (Exception e) {
			modelAndView.addObject("recentCommitHistoryJSON", "error retrieving WISE commit history");
			e.printStackTrace();
		}
		
		// add number of curently-logged in users to model
		HashMap<String, User> allLoggedInUsers = 
			(HashMap<String, User>) request.getSession()
				.getServletContext().getAttribute(WISESessionListener.ALL_LOGGED_IN_USERS);
		
		if (allLoggedInUsers != null) {
			modelAndView.addObject("numCurrentlyLoggedInUsers", allLoggedInUsers.size());
		} else {
			modelAndView.addObject("numCurrentlyLoggedInUsers", 0);
		}

		// add number of users logged in today to model
		Calendar todayZeroHour = Calendar.getInstance();
		todayZeroHour.set(Calendar.HOUR_OF_DAY, 0);            // set hour to midnight
		todayZeroHour.set(Calendar.MINUTE, 0);                 // set minute in hour
		todayZeroHour.set(Calendar.SECOND, 0);                 // set second in minute
		todayZeroHour.set(Calendar.MILLISECOND, 0);            // set millis in second
		Date dateMin = todayZeroHour.getTime();  

		Date dateMax = new java.util.Date(Calendar.getInstance().getTimeInMillis());
		adminJob.setYesterday(dateMin);
		adminJob.setToday(dateMax);

		List<User> studentsWhoLoggedInToday = adminJob.findUsersWhoLoggedInSinceYesterday("studentUserDetails");
		List<User> teachersWhoLoggedInToday = adminJob.findUsersWhoLoggedInSinceYesterday("teacherUserDetails");
		if (studentsWhoLoggedInToday != null && teachersWhoLoggedInToday != null) {
			modelAndView.addObject("numUsersWhoLoggedInToday", studentsWhoLoggedInToday.size()+teachersWhoLoggedInToday.size());
		} else {
			modelAndView.addObject("numUsersWhoLoggedInToday", 0);
		}

		return modelAndView;
	}

	private String retrieveGlobalWISEVersionJSONString() {
		HttpClient client = new HttpClient();
		GetMethod method = new GetMethod(MASTER_GET_WISE_INFO_URL);
		
		byte[] responseBody = null;
		String responseString = null;

		try {
			client.executeMethod(method);
			
			// Read the response body.
			InputStream responseBodyAsStream = method.getResponseBodyAsStream();
			responseBody = IOUtils.toByteArray(responseBodyAsStream);
		} catch (HttpException e) {
			System.err.println("Fatal protocol violation: " + e.getMessage());
			e.printStackTrace();
		} catch (IOException e) {
			System.err.println("Fatal transport error: " + e.getMessage());
			e.printStackTrace();
		} finally {
			// Release the connection.
			method.releaseConnection();
		}
		if (responseBody != null) {
			responseString = new String(responseBody);
		}
		return responseString;
	}
	
	private String retrieveRecentCommitHistoryJSONString() {
		HttpClient client = new HttpClient();
		GetMethod method = new GetMethod(WISE_COMMIT_HISTORY_URL);
		
		byte[] responseBody = null;
		String responseString = null;

		try {
			client.executeMethod(method);
			
			// Read the response body.
			InputStream responseBodyAsStream = method.getResponseBodyAsStream();
			responseBody = IOUtils.toByteArray(responseBodyAsStream);
		} catch (HttpException e) {
			System.err.println("Fatal protocol violation: " + e.getMessage());
			e.printStackTrace();
		} catch (IOException e) {
			System.err.println("Fatal transport error: " + e.getMessage());
			e.printStackTrace();
		} finally {
			// Release the connection.
			method.releaseConnection();
		}
		if (responseBody != null) {
			responseString = new String(responseBody);
		}
		return responseString;
	}
}