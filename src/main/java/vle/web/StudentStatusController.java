package vle.web;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.Calendar;
import java.util.Iterator;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import utils.SecurityUtils;
import vle.VLEServlet;
import vle.domain.status.StudentStatus;

public class StudentStatusController extends VLEServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * Handles GET requests from the teacher when a teacher requests for all the student
	 * statuses for a given run id
	 * @param rquest
	 * @param response
	 * @throws IOException 
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
		
		try {
			runId = new Long(runIdString);
		} catch(NumberFormatException e) {
			e.printStackTrace();
		}
		
		//get all the student statuses for the run id
		List<StudentStatus> studentStatuses = StudentStatus.getStudentStatusesByRunId(runId);
		
		//the JSONArray that we will put all the student statuses into
		JSONArray studentStatusesJSONArray = new JSONArray();
		
		Iterator<StudentStatus> studentStatusesIterator = studentStatuses.iterator();

		//loop through all the student statuses
		while(studentStatusesIterator.hasNext()) {
			//get a student status
			StudentStatus studentStatus = studentStatusesIterator.next();
			
			//get a status
			String status = studentStatus.getStatus();
			
			try {
				//convert the status to a JSONObject
				JSONObject statusJSON = new JSONObject(status);
				
				//put the status JSONObject into our JSONArray that we will return to the teacher
				studentStatusesJSONArray.put(statusJSON);
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		
		//convert the JSONArray into a string
		String studentStatusesString = studentStatusesJSONArray.toString();
		
		try {
			//write the JSONArray string to the response
			response.getWriter().print(studentStatusesString);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * Handles POST requests from students when they send their status to the server
	 * so we can keep track of their latest status
	 * @param request
	 * @param response
	 * @throws IOException 
	 */
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
		/* make sure that this request is authenticated through the portal before proceeding */
		if (SecurityUtils.isPortalMode(request) && !SecurityUtils.isAuthenticated(request)) {
			/* not authenticated send not authorized status */
			response.sendError(HttpServletResponse.SC_FORBIDDEN);
			return;
		}

		//get the post parameters
		String runIdString = request.getParameter("runId");
		String periodIdString = request.getParameter("periodId");
		String workgroupIdString = request.getParameter("workgroupId");
		String status = request.getParameter("status");
		
		Long runId = null;
		Long periodId = null;
		Long workgroupId = null;
		
		try {
			runId = new Long(runIdString);
		} catch(NumberFormatException e) {
			e.printStackTrace();
		}
		
		try {
			periodId = new Long(periodIdString);
		} catch(NumberFormatException e) {
			e.printStackTrace();
		}
		
		try {
			workgroupId = new Long(workgroupIdString);
		} catch(NumberFormatException e) {
			e.printStackTrace();
		}
		
		//get the student status object for the workgroup id if it already exists
		StudentStatus studentStatus = StudentStatus.getByWorkgroupId(workgroupId);
		
		if(studentStatus == null) {
			//the student status object does not already exist so we will create it
			studentStatus = new StudentStatus(runId, periodId, workgroupId, status);			
		} else {
			//the student status object already exists so we will update the timestamp and status
			Calendar now = Calendar.getInstance();
			studentStatus.setTimestamp(new Timestamp(now.getTimeInMillis()));
			studentStatus.setStatus(status);
		}
		
		//save the student status to the database
		studentStatus.saveOrUpdate();
	}
}
