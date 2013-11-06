/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU Lesser General Public License, v2.
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
package org.telscenter.sail.webapp.presentation.web.controllers;

import java.io.IOException;
import java.io.Serializable;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Properties;
import java.util.Set;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.dao.sds.HttpStatusCodeException;
import net.sf.sail.webapp.dao.sds.impl.AbstractHttpRestCommand;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.authentication.MutableUserDetails;
import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.domain.impl.CurnitGetCurnitUrlVisitor;
import net.sf.sail.webapp.domain.webservice.http.HttpPostRequest;
import net.sf.sail.webapp.domain.webservice.http.impl.HttpRestTransportImpl;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;

import org.apache.commons.httpclient.HttpStatus;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.attendance.StudentAttendance;
import org.telscenter.sail.webapp.domain.authentication.impl.StudentUserDetails;
import org.telscenter.sail.webapp.domain.authentication.impl.TeacherUserDetails;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.domain.project.ProjectMetadata;
import org.telscenter.sail.webapp.presentation.util.json.JSONArray;
import org.telscenter.sail.webapp.presentation.util.json.JSONException;
import org.telscenter.sail.webapp.presentation.util.json.JSONObject;
import org.telscenter.sail.webapp.presentation.web.controllers.run.RunUtil;
import org.telscenter.sail.webapp.presentation.web.filters.TelsAuthenticationProcessingFilter;
import org.telscenter.sail.webapp.service.attendance.StudentAttendanceService;
import org.telscenter.sail.webapp.service.authentication.UserDetailsService;
import org.telscenter.sail.webapp.service.offering.RunService;
import org.telscenter.sail.webapp.service.workgroup.WISEWorkgroupService;

import edu.emory.mathcs.backport.java.util.Arrays;

/**
 * Controller to bridge GET/POST access to the vlewrapper webapp. Validates
 * logged in user, makes sure they're logged in and has the right
 * permissions, etc, before forwarding the request to the appropriate
 * servlet in the vlewrapper webapp.
 * @author hirokiterashima
 * @version $Id:$
 */
public class BridgeController extends AbstractController {

	private WISEWorkgroupService workgroupService;
	private RunService runService;
	private Properties portalProperties;
	private StudentAttendanceService studentAttendanceService;

	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		// check if user is logged in
		if (ControllerUtil.getSignedInUser() == null) {
			response.sendRedirect("/webapp/login.html");
			return null;
		}
		boolean authorized = authorize(request);
		if (!authorized) {
			// if request is for posting unsaved data and the user is not the same user as the one that should be posting it,
			// forward them to the homepage
			if (request.getRequestURI().equals("/webapp/bridge/postdata.html")) {
				User signedInUser = ControllerUtil.getSignedInUser();
				if (signedInUser.getUserDetails() instanceof TeacherUserDetails) {
					response.sendRedirect("/webapp" + TelsAuthenticationProcessingFilter.TEACHER_DEFAULT_TARGET_PATH);
					return null;
				} else if (signedInUser.getUserDetails() instanceof StudentUserDetails) {
					response.sendRedirect("/webapp" + TelsAuthenticationProcessingFilter.STUDENT_DEFAULT_TARGET_PATH);
					return null;
				} else {
					response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "You are not authorized to access this page");
					return null;
				}
			} else {
				response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "You are not authorized to access this page");
				return null;
			}
		}
		String method = request.getMethod();
		if (method.equals("GET")) {
			return handleGet(request, response);
		} else if (method.equals("POST")) {
			return handlePost(request, response);
		}
		
		// we only handle GET and POST requests at this point.
		return null;
	}

	private boolean authorize(HttpServletRequest request) {
		String method = request.getMethod();
		User signedInUser = ControllerUtil.getSignedInUser();
		Collection<? extends GrantedAuthority> authorities = signedInUser.getUserDetails().getAuthorities();
		Long signedInUserId = null;
		for (GrantedAuthority authority : authorities) {
			if (authority.getAuthority().equals(UserDetailsService.ADMIN_ROLE)) {
				return true;
			} else if(authority.getAuthority().equals(UserDetailsService.TEACHER_ROLE)) {
				//the signed in user is a teacher
				
				String type = request.getParameter("type");
				if ("cRater".equals(type)) {
					//any teacher can make a cRater request
					return true;
				}
				
				Run run = null;
				try {
					//get the run object
					run = runService.retrieveById(new Long(request.getParameter("runId")));
				} catch (NumberFormatException e) {
					e.printStackTrace();
				} catch (ObjectNotFoundException e) {
					e.printStackTrace();
				}
				
				if(run == null) {
					//we could not find the run
					return false;
				} else if(this.runService.hasRunPermission(run, signedInUser, BasePermission.WRITE)) {
					//the teacher has write permission for the run so we will allow authorization
					return true;
				} else if(this.runService.hasRunPermission(run, signedInUser, BasePermission.READ)) {
					//the teacher only has read permission for the run
					
					if(method.equals("GET")) {
						//we will allow authorization for GET requests
						return true;
					} else if(method.equals("POST")) {
						//we will deny authorization for POST requests since the teacher only has READ permissions
						return false;
					}
				}
			}
		}
		if (method.equals("GET")) {
			String workgroupIdStr = "";
			
			//only used for annotations
			String fromWorkgroupIdStr = "";
			
			String type = request.getParameter("type");
			
			String runIdString = request.getParameter("runId");
			Long runId = null;
			
			if(runIdString != null) {
				runId = Long.parseLong(runIdString);
			}
			
			String periodString = request.getParameter("periodId");
			Long period = null;
			if(periodString != null) {
				period = Long.parseLong(periodString);	
			}
			
			
			if(runId != null) {
				try {
					//get the run
					Run offering = runService.retrieveById(runId);
					
					//get the workgroup for the signed in user
					List<Workgroup> workgroupListByOfferingAndUser = workgroupService.getWorkgroupListByOfferingAndUser(offering, signedInUser);
					
					//get the workgroup
					Workgroup workgroup = workgroupListByOfferingAndUser.get(0);
					
					//get the workgroup id
					signedInUserId = workgroup.getId();
				} catch (ObjectNotFoundException e1) {
					e1.printStackTrace();
				}
			}
			
			//whether this GET request can access other workgroup's data
			boolean canAccessOtherWorkgroups = false;
			
			if (type == null) {
				workgroupIdStr = request.getParameter("userId");
			} else if(type.equals("flag") || type.equals("inappropriateFlag")) {
				workgroupIdStr = request.getParameter("userId");
				canAccessOtherWorkgroups = true;
			} else if (type.equals("annotation")) {
				String annotationType = request.getParameter("annotationType");
				if ("cRater".equals(annotationType)) {
					// anyone can make a cRater annotation
					return true;
				}
				workgroupIdStr = request.getParameter("toWorkgroup");
				
				//get the fromWorkgroup id
				fromWorkgroupIdStr = request.getParameter("fromWorkgroup");
				canAccessOtherWorkgroups = true;
			} else if(type.equals("brainstorm")) {
				workgroupIdStr = request.getParameter("userId");
				canAccessOtherWorkgroups = true;
			} else if (type.equals("aggregate")) {
				// student/teacher is trying to get other students' work so that it can be used to show 
				// the aggregate view. nodeIds should be passed in.
				// Check that the nodeIds exist and that we can get the student data from them
				// in the VLE.
				if (request.getParameter("nodeIds") == null) {
					canAccessOtherWorkgroups = false;
				} else {
					if (request.getParameter("allStudents") != null && Boolean.valueOf(request.getParameter("allStudents"))) {
						return true;
					} else {
						workgroupIdStr = request.getParameter("userId");
						canAccessOtherWorkgroups = true;
					}
				}
			} else if (type.equals("journal")) {
				workgroupIdStr = request.getParameter("workgroupId");
			} else if(type.equals("peerreview")) {
				//return true for now until logic is implemented
				return true;
			} else if(type.equals("xlsexport") || type.equals("specialExport")) {
				//TODO: need to check user permissions
				return true;
			} else if(type.equals("ideaBasket")) {
				return true;
			} else if(type.equals("studentAssetManager")) {
				return true;
			} else if(type.equals("xmppAuthenticate")) {
				return true;
			} else if(type.equals("cRater")) {
				//allow students to make cRater scoring requests
				String cRaterRequestType = request.getParameter("cRaterRequestType");
				if("scoring".equals(cRaterRequestType)) {
					return true;
				}
			} else if(type.equals("runStatus")) {
				//check if the user is the owner of the run or in the run
				if(isUserOwnerOfRun(signedInUser, runId) || isUserInRun(signedInUser, runId)) {
					return true;					
				}
			} else {
				// this should never happen
			}

			if (workgroupIdStr == null || workgroupIdStr.equals("")) {
				return false;
			}
			//split up all the workgroup ids
			String[] workgroupIds = workgroupIdStr.split(":");
			
			//check if this GET request can access other workgroups
			if(canAccessOtherWorkgroups) {
				//this GET request is allowed to access other workgroup work
				try {
					if(fromWorkgroupIdStr != null && !fromWorkgroupIdStr.equals("") &&
							fromWorkgroupIdStr.equals(signedInUserId)) {
						/*
						 * the signed in user id is the same as the from workgroup id so 
						 * we will allow it. this basically means the current user is
						 * requesting the annotations that he/she wrote.
						 */
						return true;
					} else {
						//obtain all the workgroups of the classmates of the current user
						Set<Workgroup> classmateWorkgroups = runService.getWorkgroups(runId, period);

						/*
						 * see if the workgroupIds the user is trying to access is
						 * in the above set of classmate workgroups, if all the 
						 * workgroupIds beingaccessed are allowed, it will return 
						 * true and allow it, otherwise it will return false and 
						 * deny access
						 */
						return elementsInCollection(workgroupIds, classmateWorkgroups);
					}
				} catch (ObjectNotFoundException e) {
					e.printStackTrace();
				}
			} else {
				/*
				 * this GET request is not allowed to access other workgroup work
				 * it can only access the workgroup the current user is in
				 */
				
				//obtain all the workgroups that the current user is in
				List<Workgroup> workgroupsForUser = workgroupService.getWorkgroupsForUser(signedInUser);
				
				/*
				 * see if the workgroupIds the user is trying to access is in
				 * the above list of workgroups, if all the workgroupIds being
				 * accessed are allowed, it will return true and allow it,
				 * otherwise it will return false and deny access
				 */
				return elementsInCollection(workgroupIds, workgroupsForUser);
			}
			
			return false;
		} else if (method.equals("POST")) {
			return true;
		}
		// other request methods are not authorized at this point
		return false;
	}
	
	/**
	 * Checks whether all the elements in the idsAccessing array are
	 * found in the idsAllowed Collection
	 * @param idsAccessing the ids the user is trying to access
	 * @param idsAllowed the ids the user is allowed to access
	 * @return whether all the elements are in the Collection
	 */
	private boolean elementsInCollection(String[] idsAccessing, Collection<Workgroup> idsAllowed) {
		//convert the accessing array to a list
		List<String> idsAccessingList = Arrays.asList(idsAccessing);
		
		//convert the allowed Collection to a list
		List<String> idsAllowedList = new ArrayList<String>();

		//obtain an iterator for the Collection
		Iterator<Workgroup> idsAllowedIter = idsAllowed.iterator();
		
		//loop through all the Workgroups in the Collection
		while(idsAllowedIter.hasNext()) {
			//obtain the workgroup id from the Workgroup
			String idAllowed = idsAllowedIter.next().getId().toString();
			
			//add the workgroup id string to the list of allowed ids
			idsAllowedList.add(idAllowed);
		}
		
		//see if all the elements in the accessing list are in the allowed list
		return idsAllowedList.containsAll(idsAccessingList);
	}
	

	private ModelAndView handleGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		String type = request.getParameter("type");
		ServletContext servletContext2 = this.getServletContext();
		ServletContext vlewrappercontext = servletContext2.getContext("/vlewrapper");
		
		User user = ControllerUtil.getSignedInUser();
		CredentialManager.setRequestCredentials(request, user);
		
		//get the run id
		String runIdString = request.getParameter("runId");
		Long runId = null;
		
		if(runIdString != null) {
			runId = Long.parseLong(runIdString);
		}
		
		Run run = null;
		try {
			if(runId != null) {
				//get the run object
				run = runService.retrieveById(runId);				
			}
		} catch (ObjectNotFoundException e1) {
			e1.printStackTrace();
		}
		
		if (type == null) {
			// get student data
			RequestDispatcher requestDispatcher = vlewrappercontext.getRequestDispatcher("/getdata.html");
			requestDispatcher.forward(request, response);
		} else if (type.equals("brainstorm")){
			RequestDispatcher requestDispatcher = vlewrappercontext.getRequestDispatcher("/getdata.html");
			requestDispatcher.forward(request, response);
		} else if (type.equals("aggregate")){
			setProjectPath(run, request);  //set the project path into the request object
			if (Boolean.parseBoolean(request.getParameter("allStudents"))) {
				// request for all students work in run. lookup workgroups in run and construct workgroupIdString
				String workgroupIdStr = "";
				try {
					Set<Workgroup> workgroups = runService.getWorkgroups(runId);
					for (Workgroup workgroup : workgroups) {
						workgroupIdStr += workgroup.getId() + ":";
					}
					request.setAttribute("userId", workgroupIdStr);
				} catch (ObjectNotFoundException e) {
				}				
			}

			RequestDispatcher requestDispatcher = vlewrappercontext.getRequestDispatcher("/getdata.html");
			requestDispatcher.forward(request, response);
		} else if (type.equals("flag") || type.equals("inappropriateFlag") || type.equals("annotation")){			// get flags
			/*
			 * set the user info JSONObjects into the request so the vlewrapper servlet
			 * has access to the teacher and classmate info
			 */
			setUserInfos(run, request);
			
			setCRaterAttributes(request);
			
			RequestDispatcher requestDispatcher = vlewrappercontext.getRequestDispatcher("/annotations.html");
			requestDispatcher.forward(request, response);
		} else if (type.equals("journal")) {
			RequestDispatcher requestDispatcher = vlewrappercontext.getRequestDispatcher("/journaldata.html");
			requestDispatcher.forward(request, response);
		} else if (type.equals("peerreview")) {
			//get the period id
			String periodString = request.getParameter("periodId");
			Long period = null;
			if(periodString != null) {
				period = Long.parseLong(periodString);	
			}
			
			try {
				/*
				 * set the number of students in the class period for when we need
				 * to calculate peer review opening
				 */
				Set<Workgroup> classmateWorkgroups = runService.getWorkgroups(runId, period);
				request.setAttribute("numWorkgroups", classmateWorkgroups.size());
			} catch (ObjectNotFoundException e) {
				e.printStackTrace();
			}
			RequestDispatcher requestDispatcher = vlewrappercontext.getRequestDispatcher("/peerreview.html");
			requestDispatcher.forward(request, response);
		} else if (type.equals("xlsexport") || type.equals("specialExport")) {
			//set the user info into the request object
			setUserInfos(run, request);
			
			//set the project path into the request object
			setProjectPath(run, request);
			
			//set the project meta data into the request object
			setProjectMetaData(run, request);
			
			String requestPath = "";
			
			if(type.equals("xlsexport")) {
				//get the path for regular exports
				requestPath = "/getxls.html";
			} else if(type.equals("specialExport")) {
				//get the path for special exports
				requestPath = "/getSpecialExport.html";
			}
			
			RequestDispatcher requestDispatcher = vlewrappercontext.getRequestDispatcher(requestPath);
			requestDispatcher.forward(request, response);
		} else if(type.equals("ideaBasket")) {
			handleIdeaBasket(request, response);
		} else if(type.equals("studentAssetManager")) {
			handleStudentAssetManager(request, response);
		} else if(type.equals("viewStudentAssets")) {
			handleViewStudentAssets(request, response);
		} else if (type.equals("xmppAuthenticate")) {
			// check if this portal is xmpp enabled first
			String isXMPPEnabled = portalProperties.getProperty("isXMPPEnabled");
			if (isXMPPEnabled != null && Boolean.valueOf(isXMPPEnabled)) {
				handleWISEXMPPAuthenticate(request,response);
			}
		} else if(type.equals("cRater")) {
			setCRaterAttributes(request);
			
			RequestDispatcher requestDispatcher = vlewrappercontext.getRequestDispatcher("/cRater.html");
			requestDispatcher.forward(request, response);
		} else if(type.equals("chatLog")) {
			RequestDispatcher requestDispatcher = vlewrappercontext.getRequestDispatcher("/chatLog.html");
			requestDispatcher.forward(request, response);
		} else if(type.equals("studentStatus")) {
			RequestDispatcher requestDispatcher = vlewrappercontext.getRequestDispatcher("/studentStatus.html");
			requestDispatcher.forward(request, response);
		} else if(type.equals("runStatus")) {
			RequestDispatcher requestDispatcher = vlewrappercontext.getRequestDispatcher("/runStatus.html");
			requestDispatcher.forward(request, response);
		}
		
		return null;
	}

	private ModelAndView handlePost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		String type = request.getParameter("type");
		ServletContext servletContext2 = this.getServletContext();
		ServletContext vlewrappercontext = servletContext2.getContext("/vlewrapper");
		User user = ControllerUtil.getSignedInUser();
		CredentialManager.setRequestCredentials(request, user);
		
		if (type == null) {
			// post student data
			RequestDispatcher requestDispatcher = vlewrappercontext.getRequestDispatcher("/postdata.html");
			requestDispatcher.forward(request, response);
		} else if (type.equals("flag") || type.equals("inappropriateFlag") || type.equals("annotation")){
			RequestDispatcher requestDispatcher = vlewrappercontext.getRequestDispatcher("/annotations.html");
			requestDispatcher.forward(request, response);
		} else if (type.equals("journal")) {
			RequestDispatcher requestDispatcher = vlewrappercontext.getRequestDispatcher("/journaldata.html");
			requestDispatcher.forward(request, response);
		} else if (type.equals("peerreview")) {
			RequestDispatcher requestDispatcher = vlewrappercontext.getRequestDispatcher("/peerreview.html");
			requestDispatcher.forward(request, response);
		} else if(type.equals("ideaBasket")) {
			handleIdeaBasket(request, response);
		} else if(type.equals("studentAssetManager")) {
			handleStudentAssetManager(request, response);
		} else if(type.equals("viewStudentAssets")) {
			handleViewStudentAssets(request, response);
		} else if(type.equals("chatLog")) {
			RequestDispatcher requestDispatcher = vlewrappercontext.getRequestDispatcher("/chatLog.html");
			requestDispatcher.forward(request, response);
		} else if(type.equals("studentStatus")) {
			handleStudentStatus(request, response);
		} else if(type.equals("runStatus")) {
			handleRunStatus(request, response);
		}
		return null;
	}
	
	/**
	 * Handle student status requests
	 * @param request
	 * @param response
	 */
	private void handleStudentStatus(HttpServletRequest request, HttpServletResponse response) {
		ServletContext servletContext = this.getServletContext();
		ServletContext vlewrappercontext = servletContext.getContext("/vlewrapper");
		
		try {
			RequestDispatcher requestDispatcher = vlewrappercontext.getRequestDispatcher("/studentStatus.html");
			
			//make sure the user is allowed to make this POST
			if(authenticateStudentStatusPOST(request, response)) {
				//forward the request to the vlewrapper
				requestDispatcher.forward(request, response);				
			}
		} catch (ServletException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}		
	}
	
	/**
	 * Make sure the signed in user is allowed to POST the data they are
	 * trying to POST. The user should only be trying to update their
	 * own student status.
	 * @param request
	 * @param response
	 * @return
	 */
	private boolean authenticateStudentStatusPOST(HttpServletRequest request, HttpServletResponse response) {
		boolean result = false;
		
		//get the signed in user
		User user = ControllerUtil.getSignedInUser();
		
		//get the parameters from the request
		String runIdString = request.getParameter("runId");
		String periodIdString = request.getParameter("periodId");
		String workgroupIdString = request.getParameter("workgroupId");
		String status = request.getParameter("status");
		
		try {
			Long runId = Long.parseLong(runIdString);
			Long periodId = Long.parseLong(periodIdString);
			Long workgroupId = Long.parseLong(workgroupIdString);
			
			//make sure the user is in the run, in the period, and is in the workgroup
			if(isUserInRun(user, runId) && 
					isUserInPeriod(user, runId, periodId) &&
					isUserInWorkgroupId(user, workgroupId) &&
					status != null) {
				result = true;
			}
			
		} catch(NumberFormatException e) {
			e.printStackTrace();
		}
		
		return result;
	}
	
	/**
	 * Handle student status requests
	 * @param request
	 * @param response
	 */
	private void handleRunStatus(HttpServletRequest request, HttpServletResponse response) {
		ServletContext servletContext = this.getServletContext();
		ServletContext vlewrappercontext = servletContext.getContext("/vlewrapper");
		
		try {
			RequestDispatcher requestDispatcher = vlewrappercontext.getRequestDispatcher("/runStatus.html");
			
			//make sure the user is allowed to make this POST
			if(authenticateRunStatusPOST(request, response)) {
				//forward the request to the vlewrapper
				requestDispatcher.forward(request, response);				
			}
		} catch (ServletException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}		
	}
	
	/**
	 * Make sure the signed in user is allowed to POST the data they are
	 * trying to POST. The user should only be trying to update their
	 * own student status.
	 * @param request
	 * @param response
	 * @return
	 */
	private boolean authenticateRunStatusPOST(HttpServletRequest request, HttpServletResponse response) {
		boolean result = false;
		
		//get the signed in user
		User user = ControllerUtil.getSignedInUser();
		
		//get the parameters from the request
		String runIdString = request.getParameter("runId");
		String status = request.getParameter("status");
		
		try {
			//get the run id
			Long runId = Long.parseLong(runIdString);
			
			//check if the user is the owner of the run and the status is not null
			if(isUserOwnerOfRun(user, runId) && status != null) {
				result = true;
			}
		} catch(NumberFormatException e) {
			e.printStackTrace();
		}
		
		return result;
	}
	
	/**
	 * Check if a user is the owner or shared owner of a run
	 * @param user the signed in user
	 * @param runId the run id
	 * @return whether the user is an owner of the run
	 */
	private boolean isUserOwnerOfRun(User user, Long runId) {
		boolean result = false;
		
		if(user != null && runId != null) {
			try {
				//get the run
				Run run = runService.retrieveById(runId);
				
				if(run != null) {
					//get the owners and shared owners
					Set<User> owners = run.getOwners();
					Set<User> sharedowners = run.getSharedowners();
					
					if(owners.contains(user) || sharedowners.contains(user)) {
						//the user is the owner or a shared owner
						result = true;
					}
				}
			} catch (ObjectNotFoundException e) {
				e.printStackTrace();
			}			
		}
		
		return result;
	}
	
	/**
	 * Check if the user is in the run
	 * @param user the user
	 * @param runId the run id
	 * @return whether the user is in the run
	 */
	private boolean isUserInRun(User user, Long runId) {
		boolean result = false;
		
		if(user != null && runId != null) {
			//get the list of runs this user is in
			List<Run> runList = runService.getRunList(user);
			
			Iterator<Run> runListIterator = runList.iterator();
			
			//loop through all the runs this user is in
			while(runListIterator.hasNext()) {
				//get a run
				Run tempRun = runListIterator.next();
				
				if(tempRun != null) {
					//get the run id
					Long tempRunId = tempRun.getId();
					
					//check if the run id matches the one we are searching for
					if(runId.equals(tempRunId)) {
						//the run id matches so the user is in the run
						result = true;
						break;
					}
				}
			}
		}
		
		return result;
	}
	
	/**
	 * Check if the user is in the period
	 * @param user the user
	 * @param runId the run id
	 * @param periodId the period id
	 * @return whether the user is in the period
	 */
	private boolean isUserInPeriod(User user, Long runId, Long periodId) {
		boolean result = false;
		
		if(user != null && runId != null && periodId != null) {
			try {
				//get the run
				Run run = runService.retrieveById(runId);
				
				//get the period the student is in for the run
				Group periodOfStudent = run.getPeriodOfStudent(user);
				
				if(periodOfStudent != null) {
					//get the period id
					Long tempPeriodId = periodOfStudent.getId();
					
					//check if the period id matches the one we are searching for
					if(periodId.equals(tempPeriodId)) {
						//the period id matches so the user is in the period
						result = true;
					}
				}
			} catch (ObjectNotFoundException e) {
			}
		}
		
		return result;
	}
	
	/**
	 * Check if the user is in the workgroup id
	 * @param user the user
	 * @param workgroupId the workgroup id
	 * @return whether the user is in the workgroup
	 */
	private boolean isUserInWorkgroupId(User user, Long workgroupId) {
		boolean result = false;
		
		if(user != null && workgroupId != null) {
			//get all the workgroups this user is in
			List<Workgroup> workgroupsForUser = workgroupService.getWorkgroupsForUser(user);
			
			Iterator<Workgroup> workgroupsForUserIterator = workgroupsForUser.iterator();
			
			//loop through all the workgroups this user is in
			while(workgroupsForUserIterator.hasNext()) {
				//get a workgroup
				Workgroup tempWorkgroup = workgroupsForUserIterator.next();
				
				if(tempWorkgroup != null) {
					//get the workgroup id
					Long tempWorkgroupId = tempWorkgroup.getId();
					
					//check if the workgroup id matches the one we are searching for
					if(workgroupId.equals(tempWorkgroupId)) {
						//the workgroup id matches so the user is in the workgroup
						result = true;
						break;
					}
				}
			}
		}
		
		return result;
	}
	
	private void handleIdeaBasket(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		ServletContext servletContext2 = this.getServletContext();
		ServletContext vlewrappercontext = servletContext2.getContext("/vlewrapper");
		User signedInUser = ControllerUtil.getSignedInUser();
		String action = request.getParameter("action");
		
		try {
			//get the run
			String runId = request.getParameter("runId");
			Run run = runService.retrieveById(new Long(runId));
			
			//get the project id
			Project project = run.getProject();
			Serializable projectId = project.getId();
			
			//set the project id into the request so the vlewrapper controller has access to it
			request.setAttribute("projectId", projectId + "");

			//get the authorities for the signed in user
			MutableUserDetails signedInUserDetails = signedInUser.getUserDetails();
			Collection<? extends GrantedAuthority> authorities = signedInUserDetails.getAuthorities();

			boolean isAdmin = false;
			boolean isTeacher = false;
			boolean isStudent = false;
			
			//this value will determine whether the user can modify anything they want in the public idea basket
			boolean isPrivileged = false;
			
			for (GrantedAuthority authority : authorities) {
				if (authority.getAuthority().equals(UserDetailsService.ADMIN_ROLE)) {
					//user is an admin or teacher
					isAdmin = true;					
					isPrivileged = true;
				} else if(authority.getAuthority().equals(UserDetailsService.TEACHER_ROLE)) {
					//user is an admin or teacher
					isTeacher = true;
					isPrivileged = true;
				}
			}
			
			if(!isTeacher) {
				isStudent = true;
			}
			
			request.setAttribute("isPrivileged", isPrivileged);
			
			if(isAdmin) {
				//user is an admin so we do not need to retrieve the workgroup id
			} else if(isTeacher) {
				//user is a teacher so we will retrieve their workgroup id for the run
				
				//get the workgroup id
				List<Workgroup> workgroupListByOfferingAndUser = workgroupService.getWorkgroupListByOfferingAndUser(run, signedInUser);
				//add nullpointer check
				Workgroup workgroup = workgroupListByOfferingAndUser.get(0);
				Long signedInWorkgroupId = workgroup.getId();
				
				//set the workgroup id into the request so the vlewrapper controller has access to it
				request.setAttribute("signedInWorkgroupId", signedInWorkgroupId + "");
			} else if(isStudent) {
				/*
				 * the user is a student so we will make sure the run id 
				 * matches the run they are currently working on and then
				 * retrieve their workgroup id for the run
				 */
				
				HashMap<String, Run> studentsToRuns = 
						(HashMap<String, Run>) request.getSession()
							.getServletContext().getAttribute("studentsToRuns");
				
				String sessionId = request.getSession().getId();
				
				if (studentsToRuns != null && studentsToRuns.containsKey(sessionId)) {
					Run sessionRun = studentsToRuns.get(sessionId);
					Long sessionRunId = sessionRun.getId();
					
					if(sessionRunId.equals(new Long(runId))) {
						//get the workgroup id
						List<Workgroup> workgroupListByOfferingAndUser = workgroupService.getWorkgroupListByOfferingAndUser(run, signedInUser);
						//add nullpointer check
						Workgroup workgroup = workgroupListByOfferingAndUser.get(0);
						Long signedInWorkgroupId = workgroup.getId();
						
						//set the workgroup id into the request so the vlewrapper controller has access to it
						request.setAttribute("signedInWorkgroupId", signedInWorkgroupId + "");
					} else {
						//run id does not match the run that the student is logged in to
						response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Run id does not match run that student is logged in to");
						return;
					}
				} else {
					//session id was not found which means the session probably timed out
					response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Session no longer valid");
					return;
				}
			}
			
			//forward the request to the vlewrapper controller
			RequestDispatcher requestDispatcher = vlewrappercontext.getRequestDispatcher("/ideaBasket.html");
			requestDispatcher.forward(request, response);
		} catch (NumberFormatException e) {
			e.printStackTrace();
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		}
	}
	
	private void handleViewStudentAssets(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		ServletContext servletContext2 = this.getServletContext();
		ServletContext vlewrappercontext = servletContext2.getContext("/vlewrapper");
		User user = ControllerUtil.getSignedInUser();
		String studentuploads_base_dir = portalProperties.getProperty("studentuploads_base_dir");
		
		try {
			//get the run
			String runId = request.getParameter("runId");
			Run run = runService.retrieveById(new Long(runId));
			
			//get the project id
			Project project = run.getProject();
			Serializable projectId = project.getId();
			
			//set the project id into the request so the vlewrapper controller has access to it
			request.setAttribute("projectId", projectId + "");

			//set the workgroup id into the request so the vlewrapper controller has access to it
			if (studentuploads_base_dir != null) {
				request.setAttribute("studentuploads_base_dir", studentuploads_base_dir);
			}
			
			// workgroups is a ":" separated string of workgroups
			String workgroups = request.getParameter("workgroups");
			
			request.setAttribute("dirName", workgroups);
			
			//forward the request to the vlewrapper controller
			RequestDispatcher requestDispatcher = vlewrappercontext.getRequestDispatcher("/vle/studentassetmanager.html");
			requestDispatcher.forward(request, response);
		} catch (NumberFormatException e) {
			e.printStackTrace();
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		}
	}
	
	
	private void handleStudentAssetManager(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		ServletContext servletContext2 = this.getServletContext();
		ServletContext vlewrappercontext = servletContext2.getContext("/vlewrapper");
		User user = ControllerUtil.getSignedInUser();
		String studentuploads_base_dir = portalProperties.getProperty("studentuploads_base_dir");
		
		try {
			//get the run
			String runId = request.getParameter("runId");
			Run run = runService.retrieveById(new Long(runId));
			
			//get the project id
			Project project = run.getProject();
			Serializable projectId = project.getId();
			
			//set the project id into the request so the vlewrapper controller has access to it
			request.setAttribute("projectId", projectId + "");

			//get the workgroup id
			List<Workgroup> workgroupListByOfferingAndUser = workgroupService.getWorkgroupListByOfferingAndUser(run, user);
			Workgroup workgroup = workgroupListByOfferingAndUser.get(0);
			Long workgroupId = workgroup.getId();

			//set the workgroup id into the request so the vlewrapper controller has access to it
			request.setAttribute("dirName", run.getId()+"/"+workgroupId+"/unreferenced");  // looks like /studentuploads/[runId]/[workgroupId]/unreferenced
			String commandParamter = request.getParameter("command");
			if (commandParamter != null && "studentAssetCopyForReference".equals(commandParamter)) {
				request.setAttribute("referencedDirName", run.getId()+"/"+workgroupId+"/referenced");  // if we're copying student asset for reference, also pass along the referenced dir. looks like /studentuploads/[runId]/[workgroupId]/referenced				
			}
			if (studentuploads_base_dir != null) {
				request.setAttribute("studentuploads_base_dir", studentuploads_base_dir);
			}
			//forward the request to the vlewrapper controller
			RequestDispatcher requestDispatcher = vlewrappercontext.getRequestDispatcher("/vle/studentassetmanager.html");
			requestDispatcher.forward(request, response);
		} catch (NumberFormatException e) {
			e.printStackTrace();
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		}
		
		
	}
	

	class XMPPCreateUserRestCommand extends AbstractHttpRestCommand {
		String runId;
		String workgroupId;
		
		/**
		 * Create the MD5 hashed password for the xmpp ejabberd user
		 * @param workgroupIdString
		 * @param runIdString
		 * @return
		 */
		private String generateUniqueIdMD5(String workgroupIdString, String runIdString) {
			String passwordUnhashed = workgroupIdString + "-" + runIdString;
			MessageDigest m = null;
			try {
				m = MessageDigest.getInstance("MD5");
			} catch (NoSuchAlgorithmException e) {
				e.printStackTrace();
			}
		    m.update(passwordUnhashed.getBytes(),0,passwordUnhashed.length());
		    String uniqueIdMD5 = new BigInteger(1,m.digest()).toString(16);
			return uniqueIdMD5;
		}
		
		
		public JSONObject run() {
			//get the username and password for the ejabberd account
			String username = workgroupId;
			String password = generateUniqueIdMD5(workgroupId,runId);
			
			//get the xmmp server base url e.g. http://wise4.berkeley.edu:5285
			String xmppServerBaseUrl = portalProperties.getProperty("xmppServerBaseUrl");

			//get the xmpp server host name e.g. wise4.berkeley.edu
			String xmppServerHostName = ControllerUtil.getHostNameFromUrl(xmppServerBaseUrl);
			
			//make the request to register the user in the ejabberd database
			String bodyData = "register \"" + username + "\" \"" + xmppServerHostName + "\" \"" + password + "\"";
			HttpPostRequest httpPostRequestData = new HttpPostRequest(REQUEST_HEADERS_CONTENT, EMPTY_STRING_MAP,
					bodyData, "/rest", HttpStatus.SC_OK);

			try {
				// try to create a user.  if user already exists, xmpp server will throw 500 internal error
				// otherwise, it will return 200 OK. in either case, we've successfully created a user on xmpp.
				this.transport.post(httpPostRequestData);
			} catch (HttpStatusCodeException e) {
				// this might mean that the user already exists on the xmpp server
				//e.printStackTrace();
			}

			JSONObject xmppUserObject = new JSONObject();
			
			try {
				//populate the xmppUserObject fields
				xmppUserObject.put("xmppUsername", username);
				xmppUserObject.put("xmppPassword", password);
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

			return xmppUserObject;
		}
		/**
		 * @param runId the runId to set
		 */
		public void setRunId(String runId) {
			this.runId = runId;
		}
		/**
		 * @param workgroupId the workgroupId to set
		 */
		public void setWorkgroupId(String workgroupId) {
			this.workgroupId = workgroupId;
		}
	}
	
	private void handleWISEXMPPAuthenticate(HttpServletRequest request, HttpServletResponse response) {
		// connect to ejabberd via Connector.java, 
		// find username/password for logged in user's workgroupId from ejabberd
		// if not found, create a new user
		// then return a json obj in the response that looks like this: {"xmppUsername":"abc","xmppPassword":"bla"}
		String xmppServerBaseUrl = portalProperties.getProperty("xmppServerBaseUrl");
		if (xmppServerBaseUrl == null) {
			return;
		}
		
		XMPPCreateUserRestCommand restCommand = new XMPPCreateUserRestCommand();
		
		//set fields for rest command
		String runId = request.getParameter("runId");
		String workgroupId = request.getParameter("workgroupId");
		restCommand.setRunId(runId);
		restCommand.setWorkgroupId(workgroupId);

		//make the rest request
		HttpRestTransportImpl restTransport = new HttpRestTransportImpl();
		restTransport.setBaseUrl(xmppServerBaseUrl);		
		restCommand.setTransport(restTransport);
		
		// xmppUserObject looks like this: {"xmppUsername":"abc","xmppPassword":"bla"}
		JSONObject xmppUserObject = restCommand.run();
		try {
			//print the xmppUserObject to the response
			response.getWriter().print(xmppUserObject.toString());
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	
	/**
	 * Sets the classmate, teacher and shared teacher user infos
	 * into the request object so they can be retrieved by the
	 * vlewrapper servlets
	 * @param run
	 * @param request
	 */
	private void setUserInfos(Run run, HttpServletRequest request) {
		//get the signed in user info
		JSONObject myUserInfoJSONObject = RunUtil.getMyUserInfo(run, workgroupService); 
			
		//get the classmate user infos
		JSONArray classmateUserInfosJSONArray = RunUtil.getClassmateUserInfos(run, workgroupService, runService);
		
		//get the teacher info
		JSONObject teacherUserInfoJSONObject = RunUtil.getTeacherUserInfo(run, workgroupService);
		
		//get the shared teacher infos
		JSONArray sharedTeacherUserInfosJSONArray = RunUtil.getSharedTeacherUserInfos(run, workgroupService);
		
		//get the run info
		JSONObject runInfoJSONObject = RunUtil.getRunInfo(run);
		
		//set the JSON objects to request attributes so the vlewrapper servlet can access them
		request.setAttribute("myUserInfo", myUserInfoJSONObject.toString());		
		request.setAttribute("classmateUserInfos", classmateUserInfosJSONArray.toString());
		request.setAttribute("teacherUserInfo", teacherUserInfoJSONObject.toString());
		request.setAttribute("sharedTeacherUserInfos", sharedTeacherUserInfosJSONArray.toString());
		request.setAttribute("runInfo", runInfoJSONObject.toString());
		
		//get all the student attendance entries for this run
		List<StudentAttendance> studentAttendanceList = studentAttendanceService.getStudentAttendanceByRunId(run.getId());
		JSONArray studentAttendanceJSONArray = new JSONArray();
		
		/*
		 * loop through all the student attendance entries so we can
		 * create JSONObjects out of them to put in our studentAttendanceJSONArray
		 */
		for(int x=0; x<studentAttendanceList.size(); x++) {
			//get a StudenAttendance object
			StudentAttendance studentAttendance = studentAttendanceList.get(x);
			
			//get the JSONObject representation
			JSONObject studentAttendanceJSONObj = studentAttendance.toJSONObject();
			
			//add it to our array
			studentAttendanceJSONArray.put(studentAttendanceJSONObj);
		}
		
		/*
		 * set the student attendance array as an attribute so the vlewrapper
		 * context can access this data
		 */
		request.setAttribute("studentAttendance", studentAttendanceJSONArray.toString());
	}
	
	/**
	 * Sets the CRater urls and client id so the VLEAnnotationController can make
	 * requests to the CRater server.
	 * @param request
	 */
	private void setCRaterAttributes(HttpServletRequest request) {
		String cRaterItemType = request.getParameter("cRaterItemType");
		if (cRaterItemType == null || cRaterItemType.equals("CRATER")) {
			request.setAttribute("cRaterVerificationUrl", portalProperties.getProperty("cRater_verification_url"));
			request.setAttribute("cRaterScoringUrl", portalProperties.getProperty("cRater_scoring_url"));
			request.setAttribute("cRaterClientId", portalProperties.getProperty("cRater_client_id"));
		} else if (cRaterItemType.equals("HENRY")) {
			request.setAttribute("cRaterVerificationUrl", portalProperties.getProperty("henry_verification_url"));
			request.setAttribute("cRaterScoringUrl", portalProperties.getProperty("henry_scoring_url"));
			request.setAttribute("cRaterClientId", portalProperties.getProperty("henry_client_id"));			
		}
	}
	
	/**
	 * Set the project path into the request as an attribute so that we can access
	 * it in other controllers
	 * @param run
	 * @param request
	 */
	private void setProjectPath(Run run, HttpServletRequest request) {
		String curriculumBaseDir = portalProperties.getProperty("curriculum_base_dir");
		String rawProjectUrl = (String) run.getProject().getCurnit().accept(new CurnitGetCurnitUrlVisitor());		
		String projectPath = curriculumBaseDir + rawProjectUrl;
		
		request.setAttribute("projectPath", projectPath);
	}
	
	/**
	 * Set the project meta data into the request as an attribute so that we can access
	 * it in other controllers
	 * @param run
	 * @param request
	 */
	private void setProjectMetaData(Run run, HttpServletRequest request) {
		Project project = run.getProject();
		ProjectMetadata metadata = project.getMetadata();
		String projectMetaDataJSONString = metadata.toJSONString();
		
		request.setAttribute("projectMetaData", projectMetaDataJSONString);
	}
	
	/**
	 * @return the workgroupService
	 */
	public WISEWorkgroupService getWorkgroupService() {
		return workgroupService;
	}

	/**
	 * @param workgroupService the workgroupService to set
	 */
	public void setWorkgroupService(WISEWorkgroupService workgroupService) {
		this.workgroupService = workgroupService;
	}
	
	public RunService getRunService() {
		return runService;
	}

	public void setRunService(RunService runService) {
		this.runService = runService;
	}
	
	/**
	 * @param portalProperties the portalProperties to set
	 */
	public void setPortalProperties(Properties portalProperties) {
		this.portalProperties = portalProperties;
	}

	/**
	 * 
	 * @return
	 */
	public StudentAttendanceService getStudentAttendanceService() {
		return studentAttendanceService;
	}

	/**
	 * 
	 * @param studentAttendanceService
	 */
	public void setStudentAttendanceService(
			StudentAttendanceService studentAttendanceService) {
		this.studentAttendanceService = studentAttendanceService;
	}
}
