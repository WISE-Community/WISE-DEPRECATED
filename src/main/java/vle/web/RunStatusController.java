package vle.web;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.Calendar;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;

import utils.SecurityUtils;
import vle.VLEServlet;
import vle.domain.status.RunStatus;

public class RunStatusController extends VLEServlet {
	private static final long serialVersionUID = 1L;
	
	/**
	 * Handle the GET requests
	 * @param request
	 * @param response
	 */
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
		/* make sure that this request is authenticated through the portal before proceeding */
		if (SecurityUtils.isPortalMode(request) && !SecurityUtils.isAuthenticated(request)) {
			/* not authenticated send not authorized status */
			response.sendError(HttpServletResponse.SC_FORBIDDEN);
			return;
		}

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
		
		if(runId != null) {
			//try to retrieve the run status for the run id
			RunStatus runStatus = RunStatus.getByRunId(runId);
			
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
					runStatus.saveOrUpdate();
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
	}
	
	/**
	 * Handle the POST requests
	 * @param request
	 * @param response
	 */
	public void doPost(HttpServletRequest request, HttpServletResponse response) {
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
		
		if(runId != null && status != null) {
			//try to get the run status for the run id
			RunStatus runStatus = RunStatus.getByRunId(runId);
			
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
			runStatus.saveOrUpdate();
		}
	}
}
