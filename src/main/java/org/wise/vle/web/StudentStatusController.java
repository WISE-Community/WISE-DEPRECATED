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
import java.sql.Timestamp;
import java.util.Calendar;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.vle.VLEService;
import org.wise.vle.domain.status.StudentStatus;

@Controller
@RequestMapping("/studentStatus.html")
public class StudentStatusController {

	@Autowired
	private VLEService vleService;
	
	/**
	 * Handles GET requests from the teacher when a teacher requests for all the student
	 * statuses for a given run id
	 * @param rquest
	 * @param response
	 * @throws IOException 
	 */
	@RequestMapping(method=RequestMethod.GET)
	public ModelAndView doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
		//get the signed in user
		User signedInUser = ControllerUtil.getSignedInUser();
		
		//get the run id
		String runIdString = request.getParameter("runId");
		
		Long runId = null;
		
		try {
			runId = new Long(runIdString);
		} catch(NumberFormatException e) {
			e.printStackTrace();
		}
		
		boolean allowedAccess = false;
		
		/*
		 * teachers that are owners of the run can make a request
		 * students can not make a request
		 */
		if(SecurityUtils.isAdmin(signedInUser)) {
			//the user is an admin so we will allow this request
			allowedAccess = true;
		} else if(SecurityUtils.isTeacher(signedInUser) && SecurityUtils.isUserOwnerOfRun(signedInUser, runId)) {
			//the user is a teacher that is an owner or shared owner of the run so we will allow the request
			allowedAccess = true;
		}
		
		if(!allowedAccess) {
			//the user is not allowed to make this request
			response.sendError(HttpServletResponse.SC_FORBIDDEN);
			return null;
		}
		
		/* make sure that this request is authenticated through the portal before proceeding */
		if (SecurityUtils.isPortalMode(request) && !SecurityUtils.isAuthenticated(request)) {
			/* not authenticated send not authorized status */
			response.sendError(HttpServletResponse.SC_FORBIDDEN);
			return null;
		}

		//get all the student statuses for the run id
		List<StudentStatus> studentStatuses = vleService.getStudentStatusesByRunId(runId);
		
		//the JSONArray that we will put all the student statuses into
		JSONArray studentStatusesJSONArray = new JSONArray();
		
		Iterator<StudentStatus> studentStatusesIterator = studentStatuses.iterator();

		//loop through all the student statuses
		while(studentStatusesIterator.hasNext()) {
			//get a student status
			StudentStatus studentStatus = studentStatusesIterator.next();
			
			//get the status
			String status = studentStatus.getStatus();
			
			try {
				//convert the status to a JSONObject
				JSONObject statusJSON = new JSONObject(status);

				//get the post timestamp
				Timestamp postTimestamp = studentStatus.getTimestamp();
				long postTimestampMilliseconds = postTimestamp.getTime();
				
				//add the post timestamp for when the student sent this student status to the server
				statusJSON.put("postTimestamp", postTimestampMilliseconds);
				
				//get the current timestamp
				Date currentTime = new Date();
				long retrievalTimestampMilliseconds = currentTime.getTime();
				
				//add the retrieval timestamp for when this student status was requested
				statusJSON.put("retrievalTimestamp", retrievalTimestampMilliseconds);
				
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
		return null;
	}
	
	/**
	 * Handles POST requests from students when they send their status to the server
	 * so we can keep track of their latest status
	 * @param request
	 * @param response
	 * @throws IOException 
	 */
	@RequestMapping(method=RequestMethod.POST)
	public ModelAndView doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
		//get the signed in user
		User signedInUser = ControllerUtil.getSignedInUser();
		
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
		
		boolean allowedAccess = false;
		
		/*
		 * teachers can not make a request
		 * students can make a request if they are in the run and in the workgroup
		 */
		if(SecurityUtils.isStudent(signedInUser) && SecurityUtils.isUserInRun(signedInUser, runId) &&
				SecurityUtils.isUserInWorkgroup(signedInUser, workgroupId)) {
			//the student is in the run and the workgroup so we will allow this request
			allowedAccess = true;
		}
		
		if(!allowedAccess) {
			//the user is not allowed to make this request
			response.sendError(HttpServletResponse.SC_FORBIDDEN);
			return null;
		}

		//get the student status object for the workgroup id if it already exists
		StudentStatus studentStatus = vleService.getStudentStatusByWorkgroupId(workgroupId);
		
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
		vleService.saveStudentStatus(studentStatus);
		
		return null;
	}
}
