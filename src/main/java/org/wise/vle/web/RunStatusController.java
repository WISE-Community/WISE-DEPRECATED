package org.wise.vle.web;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.Calendar;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.vle.VLEService;
import org.wise.vle.domain.status.RunStatus;
import org.wise.vle.utils.SecurityUtils;

public class RunStatusController extends AbstractController {
	private static final long serialVersionUID = 1L;
	
	private VLEService vleService;
	
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		if (request.getMethod() == AbstractController.METHOD_GET) {
			return doGet(request, response);
		} else if (request.getMethod() == AbstractController.METHOD_POST) {
			return doPost(request, response);
		}
		return null;
	}
	
	/**
	 * Handle the GET requests
	 * @param request
	 * @param response
	 */
	public ModelAndView doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
		//get the signed in user
		User signedInUser = ControllerUtil.getSignedInUser();
		
		//get the run id
		String runIdString = request.getParameter("runId");
		
		Long runId = null;
		String statusString = null;
		
		try {
			//get the run id as a Long
			runId = new Long(runIdString);
		} catch(NumberFormatException e) {
			e.printStackTrace();
		}
		
		boolean allowedAccess = false;
		
		/*
		 * teachers that are owners of the run can make a request
		 * students that are in the run can make a request
		 */
		if(SecurityUtils.isTeacher(signedInUser) && SecurityUtils.isUserOwnerOfRun(signedInUser, runId)) {
			//the user is a teacher that is an owner or shared owner of the run so we will allow this request
			allowedAccess = true;
		} else if(SecurityUtils.isStudent(signedInUser) && SecurityUtils.isUserInRun(signedInUser, runId)) {
			//the student is in the run so we will allow this request
			allowedAccess = true;
		}
		
		if(!allowedAccess) {
			//user is not allowed to make this request
			response.sendError(HttpServletResponse.SC_FORBIDDEN);
			return null;
		}

		if(runId != null) {
			//try to retrieve the run status for the run id
			RunStatus runStatus = vleService.getRunStatusByRunId(runId);
			
			if(runStatus == null) {
				//the run status for the run id has not been created yet so we will create it
				try {
					//create a JSONObject for the status
					JSONObject status = new JSONObject();
					
					//put the run id into the status
					status.put("runId", runId);
					
					//get the status as a string
					statusString = status.toString();
					
					//create the new run status
					runStatus = new RunStatus(runId, statusString);
					vleService.saveRunStatus(runStatus);
				} catch (JSONException e) {
					e.printStackTrace();
				}
			} else {
				//we have a run status so we will ge the status string
				statusString = runStatus.getStatus();
			}
		} else {
			//run id is null so we will send an error
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "");
		}
		
		try {
			//write the status string to the response
			response.getWriter().print(statusString);
		} catch (IOException e) {
			e.printStackTrace();
		}
		return null;
	}
	
	/**
	 * Handle the POST requests
	 * @param request
	 * @param response
	 */
	public ModelAndView doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
		//get the signed in user
		User signedInUser = ControllerUtil.getSignedInUser();

		//get the run id
		String runIdString = request.getParameter("runId");
		
		//get the status
		String status = request.getParameter("status");
		
		Long runId = null;
		
		try {
			//get the run id as a Long
			runId = new Long(runIdString);
		} catch(NumberFormatException e) {
			e.printStackTrace();
		}
		
		boolean allowedAccess = false;
		
		/*
		 * teachers that are owners of the run can make a request
		 * students can not make a request
		 */
		if(SecurityUtils.isTeacher(signedInUser) && SecurityUtils.isUserOwnerOfRun(signedInUser, runId)) {
			//the user is a teacher that is an owner or shared owner of the run
			allowedAccess = true;
		}
		
		if(!allowedAccess) {
			//user is not allowed to make this request
			response.sendError(HttpServletResponse.SC_FORBIDDEN);
			return null;
		}
		
		if(runId != null && status != null) {
			//try to get the run status for the run id
			RunStatus runStatus = vleService.getRunStatusByRunId(runId);
			
			if(runStatus == null) {
				//the run status does not exist for the run id so we will create it
				runStatus = new RunStatus(runId, status);
			} else {
				//we have retrieved the run status so we will update the timestamp and status
				Calendar now = Calendar.getInstance();
				runStatus.setTimestamp(new Timestamp(now.getTimeInMillis()));
				runStatus.setStatus(status);
			}
			
			//save the run status to the db
			vleService.saveRunStatus(runStatus);
		}
		
		return null;
	}

	public VLEService getVleService() {
		return vleService;
	}

	public void setVleService(VLEService vleService) {
		this.vleService = vleService;
	}

}
