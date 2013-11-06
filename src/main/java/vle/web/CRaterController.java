package vle.web;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import utils.SecurityUtils;
import vle.domain.webservice.crater.CRaterHttpClient;

public class CRaterController extends HttpServlet {

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
	 * Handle requests to the CRater server
	 * @param request
	 * @param response
	 * @throws IOException 
	 */
	private void handleRequest(HttpServletRequest request, HttpServletResponse response) throws IOException {

		/* make sure that this request is authenticated through the portal before proceeding */
		if (SecurityUtils.isPortalMode(request) && !SecurityUtils.isAuthenticated(request)) {
			/* not authenticated send not authorized status */
			response.sendError(HttpServletResponse.SC_FORBIDDEN);
			return;
		}

		//get the CRater request type which will be "scoring" or "verify"
		String cRaterRequestType = request.getParameter("cRaterRequestType");
		
		//get the CRater urls
		String cRaterVerificationUrl = (String) request.getAttribute("cRaterVerificationUrl");
		String cRaterScoringUrl = (String) request.getAttribute("cRaterScoringUrl");
		
		//get our client id e.g. "WISETEST"
		String cRaterClientId = (String) request.getAttribute("cRaterClientId");
		
		//get the item id e.g. "Photo_Sun"
		String itemId = request.getParameter("itemId");
		
		//get the response id
		String responseId = request.getParameter("responseId");
		
		//get the student work
		String studentData = request.getParameter("studentData");
		
		String responseString = null;
		
		if("scoring".equals(cRaterRequestType)) {
			//make the scoring request and retrieve the response string
			responseString = handleScoringRequest(cRaterScoringUrl, cRaterClientId, itemId, responseId, studentData);
		} else if("verify".equals(cRaterRequestType)) {
			//make the verify request and retrieve the response string
			responseString = handleVerifyRequest(cRaterVerificationUrl, cRaterClientId, itemId);
		}
		
		if(responseString != null) {
			try {
				//write the response string to the response object
				response.getWriter().write(responseString);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}
	
	/**
	 * Handle the scoring request to the CRater server
	 * e.g.
	 * http://localhost:8080/webapp/bridge/request.html?type=cRater&cRaterRequestType=scoring&itemId=Photo_Sun&responseId=1&studentData=hello
	 * 
	 * @param cRaterUrl the CRater server url for scoring
	 * @param cRaterClientId the client id e.g. "WISETEST"
	 * @param itemId the item id e.g. "Photo_Sun"
	 * @param responseId the response id
	 * @param studentData the student work
	 * @return the response xml string received from the CRater server
	 */
	private String handleScoringRequest(String cRaterUrl, String cRaterClientId, String itemId, String responseId, String studentData) {
		String cRaterScoringResponse = CRaterHttpClient.getCRaterScoringResponse(cRaterUrl, cRaterClientId, itemId, responseId, studentData);
		
		return cRaterScoringResponse;
	}
	
	/**
	 * Handle the verify request to the CRater server
	 * e.g.
	 * http://localhost:8080/webapp/bridge/request.html?type=cRater&cRaterRequestType=verify&itemId=Photo_Sun
	 * 
	 * @param cRaterUrl the CRater server url for verifying
	 * @param cRaterClientId the client id e.g. "WISETEST"
	 * @param itemId the item id e.g. "Photo_Sun"
	 * @return the response xml string received from the CRater server
	 */
	private String handleVerifyRequest(String cRaterUrl, String cRaterClientId, String itemId) {
		String cRaterVerificationResponse = CRaterHttpClient.getCRaterVerificationResponse(cRaterUrl, cRaterClientId, itemId);
		
		return cRaterVerificationResponse;
	}
}
