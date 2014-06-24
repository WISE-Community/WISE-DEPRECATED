/**
 * Copyright (c) 2008-2014 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU General Public License, v3.
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
package org.wise.portal.presentation.web.controllers.admin;


import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpException;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.io.IOUtils;
import org.json.JSONObject;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;

/**
 * @author Hiroki Terashima
 * @version $Id:$
 */
public class AdminIndexController extends AbstractController {


	private static final String VIEW_NAME = "admin/index";
	
	private static final String MASTER_GET_WISE_INFO_URL = "http://wise4.org/getWISEInfo.php";

	private static final String WISE_UPDATE_URL = "http://wise4.org";

	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		ModelAndView modelAndView = new ModelAndView(VIEW_NAME);
		// get WISE version from src/main/resources/version.json
		InputStream in = getClass().getResourceAsStream("/version.json");
		BufferedReader streamReader = new BufferedReader(new InputStreamReader(in, "UTF-8")); 
		StringBuilder responseStrBuilder = new StringBuilder();

		String inputStr;
		while ((inputStr = streamReader.readLine()) != null)
			responseStrBuilder.append(inputStr);
		
		// get latest WISE info from master
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
		String thisWISEVersion = null;
		String globalWISEVersion = null;
		try {
			// now parse global WISE version JSON and add to ModelAndView obj
			JSONObject globalWISEVersionJSON = new JSONObject(responseString);
			String globalWISEMajorVersion = globalWISEVersionJSON.getString("major");
			String globalWISEMinorVersion = globalWISEVersionJSON.getString("minor");
			globalWISEVersion = globalWISEMajorVersion + "." + globalWISEMinorVersion;
			modelAndView.addObject("globalWISEVersion", globalWISEVersion);
		} catch (Exception e) {
			modelAndView.addObject("globalWISEVersion", "error retrieving latest WISE version");
			e.printStackTrace();
		}
		
		try {
			// now add local (this) WISE Version to ModelAndView obj
			JSONObject thisWISEVersionJSON = new JSONObject(responseStrBuilder.toString());
			String thisWISEMajorVersion = thisWISEVersionJSON.getString("major");
			String thisWISEMinorVersion = thisWISEVersionJSON.getString("minor");
		    thisWISEVersion = thisWISEMajorVersion + "." + thisWISEMinorVersion;
			modelAndView.addObject("thisWISEVersion", thisWISEVersion);
		} catch (Exception e) {
			modelAndView.addObject("thisWISEVersion", "error retrieving current WISE version");
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
		return modelAndView;
	}

}
