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
package org.wise.vle.web;

import java.io.IOException;
import java.net.URLDecoder;
import java.util.Properties;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.httpclient.DefaultHttpMethodRetryHandler;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpException;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.NameValuePair;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.params.HttpMethodParams;
import org.json.JSONException;

public class RApacheController extends HttpServlet {
	
	private static Properties vleProperties = null;
	
	private static final long serialVersionUID = 1L;

	/**
	 * Handle POST requests
	 * @param request
	 * @param response
	 */
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		handleRequest(request, response);
	}
	
	/**
	 * Handle GET requests
	 * @param request
	 * @param response
	 */
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		handleRequest(request, response);
	}
	
	/**
	 * Handle requests to the RApache server
	 * @param request
	 * @param response
	 * @throws IOException 
	 * @throws ServletException 
	 * @throws JSONException 
	 */
	private void handleRequest(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
		HttpClient client = new HttpClient();
		
		String targetURL = null;
		String rtype = null;
		
		try {
			vleProperties = new Properties();
			vleProperties.load(getClass().getClassLoader().getResourceAsStream("vle.properties"));
			targetURL = vleProperties.getProperty("rApache_url");
			rtype = request.getParameter("type");
		} catch (Exception e) {
			System.err.println("RApacheController could not locate the rApache URL and/or identify the request type");
			e.printStackTrace();
		}
		
		if(targetURL != null && rtype != null) {
			// Create a method instance.
			if(rtype.equals("rstat")) {
				PostMethod method = new PostMethod(targetURL);
				
				String rdata = request.getParameter("rdata");
						
				// Map input = request.getParameterMap();
				
				// Provide custom retry handler is necessary
				method.getParams().setParameter(HttpMethodParams.RETRY_HANDLER, new DefaultHttpMethodRetryHandler(3, false));

				method.addParameter(new NameValuePair("rtype", rtype));
				method.addParameter(new NameValuePair("rdata", rdata));
							
				byte[] responseBody = null;
				try {
					
					// Execute the method.
					int statusCode = client.executeMethod(method);

					if (statusCode != HttpStatus.SC_OK) {
						System.err.println("Method failed: " + method.getStatusLine());
					}

					// Read the response body.
					responseBody = method.getResponseBody();

					// Deal with the response.
					// Use caution: ensure correct character encoding and is not binary data
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
				
				String responseString = "";
				
				if (responseBody != null) {
					responseString = new String(responseBody);
				}
				
				try {
					response.getWriter().print(responseString);
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			} 
			else {
				PostMethod method = new PostMethod(targetURL);
				
				String rdata = request.getParameter("rdata");
				rdata = URLDecoder.decode(rdata, "UTF-8");
				// Map input = request.getParameterMap();
				
				// Provide custom retry handler is necessary
				method.getParams().setParameter(HttpMethodParams.RETRY_HANDLER, new DefaultHttpMethodRetryHandler(3, false));
				
				method.addParameter(new NameValuePair("rtype", rtype));
				method.addParameter(new NameValuePair("rdata", rdata));
						
				byte[] responseBody = null;
				try {
					
					// Execute the method.
					int statusCode = client.executeMethod(method);

					if (statusCode != HttpStatus.SC_OK) {
						System.err.println("Method failed: " + method.getStatusLine());
					}

					// Read the response body.
					responseBody = method.getResponseBody();
					
					// Deal with the response.
					// Use caution: ensure correct character encoding and is not binary data
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
				
				try {
					
					ServletOutputStream out = response.getOutputStream();
					response.setContentType("image/jpeg");
					response.setContentLength(responseBody.length);
					out.write(responseBody,0,responseBody.length);
					
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
		}
	}
}
