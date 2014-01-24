package org.wise.vle.web;

import java.io.IOException;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.vle.domain.webservice.crater.CRaterHttpClient;
import org.wise.vle.utils.SecurityUtils;

public class CRaterController extends AbstractController {

	private static final long serialVersionUID = 1L;
	
	private Properties wiseProperties;
	
	/**
	 * Handle requests to the CRater server
	 * @param request
	 * @param response
	 * @throws IOException 
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request, HttpServletResponse response) throws Exception {
		//get the signed in user
		User signedInUser = ControllerUtil.getSignedInUser();
		
		//get the CRater request type which will be "scoring" or "verify"
		String cRaterRequestType = request.getParameter("cRaterRequestType");
		
		boolean allowedAccess = false;
		
		/*
		 * teachers can make all CRater requests
		 * students can only make CRater scoring requests
		 */
		if(SecurityUtils.isTeacher(signedInUser)) {
			//the user is a teacher so we will allow this request
			allowedAccess = true;
		} else if(SecurityUtils.isStudent(signedInUser) && (cRaterRequestType != null && cRaterRequestType.equals("scoring"))) {
			//the user is a student making a scoring request so we will allow this request
			allowedAccess = true;
		}
		
		if(!allowedAccess) {
			//user is not allowed to make this request
			response.sendError(HttpServletResponse.SC_FORBIDDEN);
			return null;
		}
		
		//get the item type which will be "CRATER" or "HENRY"
		String cRaterItemType = request.getParameter("cRaterItemType");
		
		//get the CRater urls
		String cRaterVerificationUrl = "";
		String cRaterScoringUrl = "";
		
		//get our client id e.g. "WISETEST"
		String cRaterClientId = "";
		
		if (cRaterItemType == null || cRaterItemType.equals("CRATER")) {
			//get the CRater urls
			cRaterVerificationUrl = wiseProperties.getProperty("cRater_verification_url");
			cRaterScoringUrl = wiseProperties.getProperty("cRater_scoring_url");
			
			//get our client id e.g. "WISETEST"
			cRaterClientId = wiseProperties.getProperty("cRater_client_id");
		} else if (cRaterItemType.equals("HENRY")) {
			//get the CRater urls
			cRaterVerificationUrl = wiseProperties.getProperty("henry_verification_url");
			cRaterScoringUrl = wiseProperties.getProperty("henry_scoring_url");
			
			//get our client id e.g. "WISETEST"
			cRaterClientId = wiseProperties.getProperty("henry_client_id");
		}
		
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
		
		return null;
	}
	
	/**
	 * Handle the scoring request to the CRater server
	 * e.g.
	 * http://localhost:8080/wise/cRater.html?type=cRater&cRaterRequestType=scoring&itemId=Photo_Sun&responseId=1&studentData=hello
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
	 * http://localhost:8080/wise/cRater.html?type=cRater&cRaterRequestType=verify&itemId=Photo_Sun
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

	public Properties getWiseProperties() {
		return wiseProperties;
	}

	public void setWiseProperties(Properties wiseProperties) {
		this.wiseProperties = wiseProperties;
	}
}
