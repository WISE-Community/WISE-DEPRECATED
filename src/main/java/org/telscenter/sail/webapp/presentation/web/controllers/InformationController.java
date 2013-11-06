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
import java.util.Iterator;
import java.util.List;
import java.util.Properties;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.domain.impl.CurnitGetCurnitUrlVisitor;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;
import net.sf.sail.webapp.service.UserService;
import net.sf.sail.webapp.service.workgroup.WorkgroupService;

import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.authentication.MutableUserDetails;
import org.telscenter.sail.webapp.domain.authentication.impl.StudentUserDetails;
import org.telscenter.sail.webapp.domain.authentication.impl.TeacherUserDetails;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.domain.workgroup.WISEWorkgroup;
import org.telscenter.sail.webapp.presentation.util.json.JSONArray;
import org.telscenter.sail.webapp.presentation.util.json.JSONException;
import org.telscenter.sail.webapp.presentation.util.json.JSONObject;
import org.telscenter.sail.webapp.presentation.web.filters.TelsAuthenticationProcessingFilter;
import org.telscenter.sail.webapp.service.authentication.UserDetailsService;
import org.telscenter.sail.webapp.service.offering.RunService;
import org.telscenter.sail.webapp.service.project.ProjectService;

/**
 * @author patrick lawler
 * @version $Id:$
 */
public class InformationController extends AbstractController{

	Properties portalProperties;
	
	ProjectService projectService;
	
	RunService runService;
	
	UserService userService;
	
	WorkgroupService workgroupService;
	
	/* how long the VLE should wait between each getRunInfo request, 
	 * in milliseconds 10000=10 seconds, -1=never */
	private static final String GET_RUNINFO_REQUEST_INTERVAL = "-1";
	
	private static final String WORKGROUP_ID_PARAM = "workgroupId";
	
	private static final String PREVIEW = "preview";
	
	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request, HttpServletResponse response) throws Exception {
		String action = request.getParameter("action");
		
		if(action.equals("getVLEConfig")){
			this.handleGetConfig(request, response);
		} else if(action.equals("getUserInfo")){
			this.handleGetUserInfo(request, response);
		} else {
			throw new Exception("I do not understand the request.");
		}
		
		return null;
	}
	
	/**
	 * If the workgroupId is specified in the request, then look up userInfo for that specified workgroup.
	 * Otherwise, lookup userInfo for the currently-logged-in user.
	 * @param request
	 * @param response
	 * @param user Currently-logged in user
	 * @param workgroup workgroup that the currently-logged in user is in for the run
	 * @return
	 * @throws IOException
	 * @throws ObjectNotFoundException 
	 * @throws NumberFormatException 
	 */
	private void handleGetUserInfo(HttpServletRequest request, HttpServletResponse response) throws IOException, NumberFormatException, ObjectNotFoundException{
		JSONObject userInfo = new JSONObject();
		
		/* check if this is preview an write response now if it is */
		String preview = request.getParameter("preview");
		if(preview != null && preview.equals("true")){
			response.getWriter().write(userInfo.toString());
			return;
		}

		// otherwise, make sure that the user is logged in
		// check if user is logged in
		if (ControllerUtil.getSignedInUser() == null) {
			response.sendRedirect("/webapp/login.html");
			return;
		}
		String runId = request.getParameter("runId");
		Run run = this.runService.retrieveById(Long.parseLong(runId));
		
		Workgroup workgroup = getWorkgroup(request, run);
		String workgroupIdStr = request.getParameter(WORKGROUP_ID_PARAM);
		if (workgroupIdStr != null && workgroupIdStr != "") {
			workgroup = workgroupService.retrieveById(new Long(workgroupIdStr));
			// if a workgroup was specified that was not for this run, return BAD_REQUEST
			if (workgroup.getOffering().getId() != run.getId()) {
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
				return;
			}
		} else { }
		
		/*
		 * the group id of the period, this is the id in the db which is not
		 * the same as the period number
		 */
		String periodId = "";
		
		//the period number that you would regularly think of as a period
		String periodName = "";
		
		User loggedInUser = ControllerUtil.getSignedInUser();

		JSONArray userIds = new JSONArray();
		Long workgroupId = null;

		//get the period
		if(workgroup instanceof WISEWorkgroup && !((WISEWorkgroup) workgroup).isTeacherWorkgroup()) {
			//the logged in user is a student
			Group periodGroup = ((WISEWorkgroup) workgroup).getPeriod();
			periodName = periodGroup.getName();
			periodId = periodGroup.getId().toString();
			workgroupId = workgroup.getId();
		} else if( (workgroup != null && ((WISEWorkgroup) workgroup).isTeacherWorkgroup())
				|| (workgroup == null && loggedInUser.isAdmin())) {
			//the logged in user is a teacher or is of admin-role
			// if teacher, include workgroupId:
			if(workgroup != null && ((WISEWorkgroup) workgroup).isTeacherWorkgroup()) {
				workgroupId = workgroup.getId();
			}
			
			//string buffers to maintain : delimited values
			StringBuffer periodIds = new StringBuffer();
			StringBuffer periodNames = new StringBuffer();
			
			//get the periods
			Set<Group> periods = run.getPeriods();
			Iterator<Group> periodIter = periods.iterator();
			
			//loop through all the periods
			while(periodIter.hasNext()) {
				Group next = periodIter.next();
				
				//if this is not the first period add a :
				if(periodIds.length() != 0) {
					periodIds.append(":");
				}
				
				//if this is not the first period add a :
				if(periodNames.length() != 0) {
					periodNames.append(":");
				}
				
				//append the values
				periodIds.append(next.getId());	
				periodNames.append(next.getName());
			}
			
			//get the string values
			periodId = periodIds.toString();
			periodName = periodNames.toString();
		}
		
		//obtain the user name in the format like "Geoffrey Kwan (GeoffreyKwan)"
		String userNames = "";
		if (workgroup != null) {
			userNames = getUserNamesFromWorkgroup(workgroup);
			
			//get the user ids for the students in the workgroup
			userIds = getStudentIdsFromWorkgroup(workgroup);
		} else if (workgroup == null && loggedInUser.isAdmin()) {
			userNames = ((MutableUserDetails) loggedInUser.getUserDetails()).getCoreUsername();

			//get the user id of the admin
			userIds.put(loggedInUser.getId());
		}
		
		JSONArray periods = new JSONArray();
		
		//get all the periods in the run
		Set<Group> periodsSet = run.getPeriods();
		
		if(periodsSet != null) {
			Iterator<Group> periodsIterator = periodsSet.iterator();
			
			//loop through all the periods in the run
			while(periodsIterator.hasNext()) {
				//get a period
				Group period = periodsIterator.next();
				
				//get the period id and period name
				Long tempPeriodId = period.getId();
				String tempPeriodName = period.getName();
				
				try {
					//put the period id and period name in a JSONObject
					JSONObject periodObject = new JSONObject();
					periodObject.put("periodId", tempPeriodId);
					periodObject.put("periodName", tempPeriodName);
					
					//add the JSONObject into our array of periods
					periods.put(periodObject);
				} catch (JSONException e) {
					e.printStackTrace();
				}
			}
		}
		
		// add this user's info:
		//userInfoString.append("<myUserInfo><workgroupId>" + workgroup.getId() + "</workgroupId><userName>" + userNames + "</userName><periodId>" + periodId + "</periodId><periodName>" + periodName + "</periodName></myUserInfo>");
		//userInfoString.append("<myUserInfo><workgroupId>" + workgroup.getId() + "</workgroupId><userName>" + workgroup.getGroup().getName().trim() + "</userName><periodId>" + periodId + "</periodId><periodName>" + periodName + "</periodName></myUserInfo>");
		JSONObject myUserInfo = new JSONObject();
		try {
			myUserInfo.put("workgroupId", workgroupId);
			myUserInfo.put("userName", userNames);
			myUserInfo.put("periodId", periodId);
			myUserInfo.put("periodName", periodName);
			myUserInfo.put("userIds", userIds);
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		// add the class info:
		//userInfoString.append("<myClassInfo>");
		
		JSONObject myClassInfo = new JSONObject();
		
		JSONArray classmateUserInfos = new JSONArray();
		
		// now add classmates
		Set<Workgroup> workgroups = runService.getWorkgroups(run.getId());
			
		String requestedWorkgroupIdsStr = request.getParameter("workgroupIds");
		if (requestedWorkgroupIdsStr != null) {
			// specific workgroups are requested
			String[] requestedWorkgroupIds = requestedWorkgroupIdsStr.split(",");
			for (Workgroup classmateWorkgroup : workgroups) {
				if (classmateWorkgroup.getMembers().size() > 0 && 
						classmateWorkgroup.getId() != workgroup.getId() 
						&& !((WISEWorkgroup) classmateWorkgroup).isTeacherWorkgroup()
						&& ((WISEWorkgroup) classmateWorkgroup).getPeriod() != null) {
					// only include non-teacher, non-detached classmates, excluding yourself.
					for (String requestedWorkgroupId : requestedWorkgroupIds) {
						if (requestedWorkgroupId.equals(classmateWorkgroup.getId().toString())) {
							//get the xml for the classmate and append it
							//userInfoString.append(getClassmateUserInfoXML(classmateWorkgroup));
							
							classmateUserInfos.put(getClassmateUserInfoJSON(classmateWorkgroup));
						}
					}
				}
			}
		} else {
			// otherwise get all classmates (excluding teacher)
			for (Workgroup classmateWorkgroup : workgroups) {
				if (classmateWorkgroup.getMembers().size() > 0 
						&& (workgroup == null || classmateWorkgroup.getId() != workgroup.getId())  // workgroup==null check is in case the logged in user is an admin, then the admin would not be in a workgroup for this run.
						&& !((WISEWorkgroup) classmateWorkgroup).isTeacherWorkgroup()
						&& ((WISEWorkgroup) classmateWorkgroup).getPeriod() != null) {   // only include classmates, not yourself.
					//get the xml for the classmate and append it
					//userInfoString.append(getClassmateUserInfoXML(classmateWorkgroup));
					
					classmateUserInfos.put(getClassmateUserInfoJSON(classmateWorkgroup));
				}
			}

		}
		
		JSONObject teacherUserInfo = new JSONObject();
		
		//get the owners of the run (there should only be one owner)
		Set<User> owners = run.getOwners();
		
		//get the first element in the set since there should only be one owner
		User runOwner = owners.iterator().next();
		
		try {
			//get the workgroup for the owner in the run
			List<Workgroup> workgroupsForRunOwner = workgroupService.getWorkgroupListByOfferingAndUser(run, runOwner);
			
			//get the workgroup since the owner should only have one workgroup in the run
			Workgroup runOwnerWorkgroup = workgroupsForRunOwner.get(0);
			
			//set the workgroupid and username into the teacher user info
			teacherUserInfo.put("workgroupId", runOwnerWorkgroup.getId());
			teacherUserInfo.put("userName", runOwner.getUserDetails().getUsername());
		} catch (JSONException e1) {
			e1.printStackTrace();
		}
		
		//the JSONArray that will hold the shared teacher user infos
		JSONArray sharedTeacherUserInfos = new JSONArray();
		
		//get the shared owners
		Iterator<User> sharedOwnersIterator = run.getSharedowners().iterator();
		
		//loop through the shared owners
		while(sharedOwnersIterator.hasNext()) {
			//get a shared owner
			User sharedOwner = sharedOwnersIterator.next();
			
			//get the workgroups
			List<Workgroup> sharedTeacherWorkgroups = workgroupService.getWorkgroupListByOfferingAndUser(run, sharedOwner);
			
			//there should only be one workgroup for the shared owner
			Workgroup sharedTeacherWorkgroup = sharedTeacherWorkgroups.get(0);
			
			//make a JSONObject for this shared owner
			JSONObject sharedTeacherUserInfo = new JSONObject();
			
			try {
				//set the values into the shared owner JSONObject
				sharedTeacherUserInfo.put("workgroupId", sharedTeacherWorkgroup.getId());
				sharedTeacherUserInfo.put("userName", sharedTeacherWorkgroup.generateWorkgroupName());
				
				//get the shared teacher role
				String sharedTeacherRole = runService.getSharedTeacherRole(run, sharedOwner);

				if(sharedTeacherRole == null) {
					//shared teacher does not have a role
					sharedTeacherUserInfo.put("role", "");
				} else if(sharedTeacherRole.equals(UserDetailsService.RUN_READ_ROLE)) {
					//shared teacher can view the run
					sharedTeacherUserInfo.put("role", "read");
				} else if(sharedTeacherRole.equals(UserDetailsService.RUN_GRADE_ROLE)) {
					//shared teacher can grade the run
					sharedTeacherUserInfo.put("role", "grade");
				}
			} catch (JSONException e) {
				e.printStackTrace();
			}
			
			//add the shared owner to the array
			sharedTeacherUserInfos.put(sharedTeacherUserInfo);
		}
		
		try {
			userInfo.put("myUserInfo", myUserInfo);
			myUserInfo.put("myClassInfo", myClassInfo);
			myClassInfo.put("classmateUserInfos", classmateUserInfos);
			myClassInfo.put("teacherUserInfo", teacherUserInfo);
			myClassInfo.put("sharedTeacherUserInfos", sharedTeacherUserInfos);
			myClassInfo.put("periods", periods);
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		response.setHeader("Cache-Control", "no-cache");
		response.setHeader("Pragma", "no-cache");
		response.setDateHeader ("Expires", 0);
		
		response.setContentType("text/xml");
		response.getWriter().write(userInfo.toString());
	}
	
	/**
	 * Handles the get config request from three possible requesters: grading, preview and run.
	 * The run and grading requests are almost identical, the preview request is largely handled
	 * when the projectId is found.
	 * 
	 * @param request
	 * @param response
	 * @throws ObjectNotFoundException
	 * @throws IOException
	 */
	private void handleGetConfig(HttpServletRequest request, HttpServletResponse response) throws ObjectNotFoundException, IOException{
		JSONObject config = new JSONObject();
		String projectIdStr = request.getParameter("projectId");
		String runId = request.getParameter("runId");
		String requester = request.getParameter("requester");
		//String versionId = request.getParameter("versionId");
		String step = request.getParameter("step");
		
		String portalurl = ControllerUtil.getBaseUrlString(request);
		String hostName = ControllerUtil.getHostNameFromUrl(portalurl);
		String infourl = portalurl + "/webapp/request/info.html";
		
		String curriculumBaseWWW = portalProperties.getProperty("curriculum_base_www");
		String curriculumBaseDir = portalProperties.getProperty("curriculum_base_dir");
		String studentUploadsBaseWWW = portalProperties.getProperty("studentuploads_base_www");
		
		String excelExportRestriction = portalProperties.getProperty("excelExportRestriction");
		
		String polishedProjectUrl = null;
		String rawProjectUrl = null;
		String portalVLEControllerUrl = null;
		
		// if projectId provided, this is a request for preview
		if(projectIdStr != null){
			Project project = projectService.getById(projectIdStr);
			
			/* get the url for the project content file 
			if(versionId == null || versionId.equals("")){
				versionId = this.projectService.getActiveVersion(project);
			}
			*/
			
			rawProjectUrl = (String) project.getCurnit().accept(new CurnitGetCurnitUrlVisitor());
			
			portalVLEControllerUrl = portalurl + "/webapp/vle/preview.html";
		}
		
		/* if no projectId String provided, try getting project url from run also add gradework
		 * specific config to the config */
		if(runId != null){
			Run run = this.runService.retrieveById(Long.parseLong(runId));
			rawProjectUrl = (String) run.getProject().getCurnit().accept(new CurnitGetCurnitUrlVisitor());

			Long periodId = null;
			Workgroup workgroup = getWorkgroup(request, run);
			
			if(workgroup == null) {
				/*
				 * the user is not in a workgroup for the run so they should not be
				 * allowed to access the config, unless the user is an admin
				 */
				User signedInUser = ControllerUtil.getSignedInUser();
				if (signedInUser == null || !signedInUser.isAdmin()) {
					//user is not signed in or is not admin so we will not let them proceed
					return;
				}
			} else if(((WISEWorkgroup) workgroup).isTeacherWorkgroup()) {
				//workgroup is a teacher
			} else {
				//workgroup is a student so we will get the period
				Group periodGroup = ((WISEWorkgroup) workgroup).getPeriod(); //geoff
				periodId = periodGroup.getId();
			}
			
			portalVLEControllerUrl = portalurl + "/webapp/student/vle/vle.html?runId=" + run.getId();
			
			//get the grading type (step or team)
			String gradingType = request.getParameter("gradingType");
			
			//get the boolean whether to get revisions
			String getRevisions = request.getParameter("getRevisions");
			
			//get the url for the run info
			String getRunInfoUrl = portalVLEControllerUrl + "&action=getRunInfo";
			
			//get the url to get student data
			String getStudentDataUrl = portalurl + "/webapp/bridge/getdata.html";
			
			//get the url to post student data
			String postStudentDataUrl = portalurl + "/webapp/bridge/postdata.html";
			
			//get the url to get flags
			String getFlagsUrl = portalurl + "/webapp/bridge/getdata.html?type=flag&runId=" + run.getId().toString();
			
			//get the url to post flags
			String postFlagsUrl = portalurl + "/webapp/bridge/getdata.html?type=flag&runId=" + run.getId().toString();
			
			//get the url to get inappropriate flags
			String getInappropriateFlagsUrl = portalurl + "/webapp/bridge/getdata.html?type=inappropriateFlag&runId=" + run.getId().toString();
			
			//get the url to post inappropriate flags
			String postInappropriateFlagsUrl = portalurl + "/webapp/bridge/getdata.html?type=inappropriateFlag&runId=" + run.getId().toString();

			//get the url to get annotations
	    	String getAnnotationsUrl = portalurl + "/webapp/bridge/request.html?type=annotation&runId=" + run.getId().toString();
	    	
	    	//get the url to post annotations
	    	String postAnnotationsUrl = portalurl + "/webapp/bridge/request.html?type=annotation&runId=" + run.getId().toString();
	    	
	    	//get the url to post journal data
	    	String postJournalDataUrl = portalurl + "/webapp/bridge/postdata.html?type=journal";
	    	
	    	//get the url to get journal data
			String getJournalDataUrl = portalurl + "/webapp/bridge/getdata.html?type=journal";
			
			//get the url to get peer review work
			String getPeerReviewUrl = portalurl + "/webapp/bridge/getdata.html?type=peerreview";
			
			//get the url for xls export
	    	String getXLSExportUrl = portalurl + "/webapp/bridge/request.html?type=xlsexport&runId=" + run.getId().toString();
	    	
	    	//get the url for special export
	    	String getSpecialExportUrl = portalurl + "/webapp/bridge/request.html?type=specialExport&runId=" + run.getId().toString();
	    	
	    	//get the url for premade comments
	    	String getPremadeCommentsUrl = portalurl + "/webapp/teacher/grading/premadeComments.html?action=getData";
	    	
	    	//get the url for premade comments
	    	String postPremadeCommentsUrl = portalurl + "/webapp/teacher/grading/premadeComments.html?action=postData";
			
	    	//get the url to get idea basket data
	    	String getIdeaBasketUrl = portalurl + "/webapp/bridge/request.html?type=ideaBasket&runId=" + run.getId().toString();
	    	
	    	//get the url to post idea basket data
	    	String postIdeaBasketUrl = portalurl + "/webapp/bridge/request.html?type=ideaBasket&runId=" + run.getId().toString();

	    	if(periodId != null) {
	    		//add the period id if it is available
	    		getIdeaBasketUrl += "&periodId=" + periodId;
	    		postIdeaBasketUrl += "&periodId=" + periodId;
	    	}
	    	
	    	//get the url to get idea basket data
	    	String studentAssetManagerUrl = portalurl + "/webapp/bridge/request.html?type=studentAssetManager&runId=" + run.getId().toString();

	    	String viewStudentAssetsUrl = portalurl + "/webapp/bridge/request.html?type=viewStudentAssets&runId=" + run.getId().toString();
	    	
	    	// url to authenticate with WISE XMPP
	    	String wiseXMPPAuthenticateUrl = portalurl + "/webapp/bridge/request.html?type=xmppAuthenticate&runId=" + run.getId().toString();
	    	
	    	String getStudentListUrl = portalurl + "/webapp/teacher/management/studentlistexcel.html?runId=" + run.getId().toString();
	    	
	    	//get the url to make CRater requests
	    	String cRaterRequestUrl = portalurl + "/webapp/bridge/request.html?type=cRater";
	    	
	    	//get the url to make chat log requests
	    	String chatLogUrl = portalurl + "/webapp/bridge/request.html?type=chatLog";
	    	
			/* Set the post level if specified in the run */
			Integer postLevel = run.getPostLevel();

			//get the websocket base url e.g. ws://wise4.berkeley.edu:8080
			String webSocketBaseUrl = portalProperties.getProperty("webSocketBaseUrl");
			
			if(webSocketBaseUrl == null) {
				/*
				 * if the websocket base url was not provided in the portal properties
				 * we will use the default websocket base url
				 */
				webSocketBaseUrl = "ws://" + hostName + ":8080";
			}
			
			//get the url for websocket connections
			String webSocketUrl = webSocketBaseUrl + "/webapp/websocket/wise";
			
			//get the url for sending and receiving student statuses
			String studentStatusUrl = portalurl + "/webapp/bridge/request.html?type=studentStatus";
			
			//get the url for sending and receiving run statuses
			String runStatusUrl = portalurl + "/webapp/bridge/request.html?type=runStatus";
	    	
	    	//put all the config params into the json object
			try {
				config.put("getFlagsUrl", getFlagsUrl);
				config.put("getInappropriateFlagsUrl", getInappropriateFlagsUrl);
				config.put("getAnnotationsUrl", getAnnotationsUrl);
				config.put("postAnnotationsUrl", postAnnotationsUrl);
				config.put("getStudentDataUrl", getStudentDataUrl);
				config.put("postStudentDataUrl", postStudentDataUrl);
				config.put("getRunInfoUrl", getRunInfoUrl);
				config.put("gradingType", gradingType);
				config.put("getRevisions", getRevisions);
				config.put("getPeerReviewUrl", getPeerReviewUrl);
				config.put("getJournalDataUrl", getJournalDataUrl);
				config.put("postJournalDataUrl", postJournalDataUrl);
				config.put("getIdeaBasketUrl", getIdeaBasketUrl);
				config.put("postIdeaBasketUrl", postIdeaBasketUrl);
				config.put("studentAssetManagerUrl", studentAssetManagerUrl);
				config.put("viewStudentAssetsUrl", viewStudentAssetsUrl);
				config.put("wiseXMPPAuthenticateUrl", wiseXMPPAuthenticateUrl);
				config.put("runInfo", run.getInfo());
				config.put("isXMPPEnabled", true);  // make this run-specific setting
				config.put("hostName", hostName);
				config.put("cRaterRequestUrl", cRaterRequestUrl);
				config.put("chatLogUrl", chatLogUrl);
				config.put("webSocketUrl", webSocketUrl);
				config.put("studentStatusUrl", studentStatusUrl);
				config.put("runStatusUrl", runStatusUrl);
				
				if(postLevel!=null){
					config.put("postLevel", postLevel);
				};
				
				//add the config fields specific to the teacher grading
				if(requester != null && requester.equals("grading")) {
					config.put("getPremadeCommentsUrl", getPremadeCommentsUrl);
					config.put("postPremadeCommentsUrl", postPremadeCommentsUrl);
					config.put("postFlagsUrl", postFlagsUrl);
					config.put("postInappropriateFlagsUrl", postInappropriateFlagsUrl);
					config.put("getXLSExportUrl", getXLSExportUrl);
					config.put("getSpecialExportUrl", getSpecialExportUrl);
					config.put("getStudentListUrl", getStudentListUrl);
					config.put("excelExportRestriction", excelExportRestriction);
				}
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		
		/* The polishedProjectUrl is the project url with the version id inserted into the project filename
		 * If null or empty string is returned, we want to use the rawUrl 
		if(versionId==null || versionId.equals("")){
			polishedProjectUrl = rawProjectUrl;
		} else {
			polishedProjectUrl = rawProjectUrl.replace(".project.json", ".project." + versionId + ".json");
		}
		*/
		
		polishedProjectUrl = rawProjectUrl;
		
		/* set the content url */
		String getContentUrl = curriculumBaseWWW + polishedProjectUrl;

		/* get location of last separator in url */
		int lastIndexOfSlash = getContentUrl.lastIndexOf("/");
		if(lastIndexOfSlash==-1){ 
			lastIndexOfSlash = getContentUrl.lastIndexOf("\\");
		}
		
		/* get the url for the *.project.meta.json file */
		String projectMetaDataUrl = portalurl + "/webapp/metadata.html";
		
		/* set the contentbase based on the contenturl */
		String getContentBaseUrl = getContentUrl.substring(0, lastIndexOfSlash) + "/";
		
		String getUserInfoUrl = infourl + "?action=getUserInfo";
		if(requester != null && requester.equals("portalpreview")){
			getUserInfoUrl += "&preview=true";
		} else {
			getUserInfoUrl += "&runId=" + runId;
		}
		
		try {
			String parentProjectId = "";
			String runName = "";
			
			if(projectIdStr == null) {
				/*
				 * look for the project id in the run if project id was not
				 * provided in the request
				 */
				Run run = runService.retrieveById(new Long(runId));
				
				if(run != null) {
					//get the run name
					runName = run.getName();
					
					//get the project
					Project project = run.getProject();
					if(project != null) {
						//get the project id as a string
						projectIdStr = project.getId() + "";
						
						//get the parent project id as a string
						parentProjectId = project.getParentProjectId() + "";
					}
					
					// check if run is active 
					if (!run.isEnded()) {
						config.put("isRunActive", true);
					} else {
						config.put("isRunActive", false);						
					}

				}
			}
			
			config.put("mode", requester);
			config.put("projectId", projectIdStr);
			config.put("parentProjectId", parentProjectId);
			config.put("projectMetaDataUrl", projectMetaDataUrl);
			config.put("getUserInfoUrl", getUserInfoUrl);
			config.put("getContentUrl", getContentUrl);
			config.put("getContentBaseUrl", getContentBaseUrl);
			config.put("getStudentUploadsBaseUrl", studentUploadsBaseWWW);
			config.put("theme", "WISE");
			config.put("locale", request.getLocale());
			config.put("enableAudio", false);
			config.put("runInfoRequestInterval", GET_RUNINFO_REQUEST_INTERVAL);
			
			if(step != null) {
				//this is set if the request is to preview the project and load a specific step such as 1.2
				config.put("step", step);
			}
			
			int maxInactiveInterval = request.getSession().getMaxInactiveInterval() * 1000;
			config.put("sessionTimeoutInterval", maxInactiveInterval);			// add sessiontimeout interval, in milleseconds
			int sessionTimeoutCheckInterval = maxInactiveInterval / 20;         // check 20 times during the session.
			if (sessionTimeoutCheckInterval > 60000) {
				// session should be checked at least every 60 seconds.
				sessionTimeoutCheckInterval = 60000;
			}
			config.put("sessionTimeoutCheckInterval", sessionTimeoutCheckInterval); // how often session should be checked...check every minute (1 min=60sec=60000 milliseconds)			

			if(runId==null){
				config.put("runId", "");
			} else {
				config.put("runId", runId);
			}
			
			config.put("runName", runName);
			
			// add preview project specific settings
			if(requester != null && requester.equals("portalpreview")){
				String isConstraintsDisabledStr = request.getParameter("isConstraintsDisabled");
				if (isConstraintsDisabledStr != null && Boolean.parseBoolean(isConstraintsDisabledStr)) {
					config.put("isConstraintsDisabled", true);
				}
			}
			
			// add userType {teacher, student, null}
			User signedInUser = ControllerUtil.getSignedInUser();
			if (signedInUser != null) {
		        UserDetails userDetails = (UserDetails) signedInUser.getUserDetails();
		        if (userDetails instanceof StudentUserDetails) {
		        	config.put("userType", "student");
					config.put("indexUrl", ControllerUtil.getPortalUrlString(request) + TelsAuthenticationProcessingFilter.STUDENT_DEFAULT_TARGET_PATH);
		        	
		        } else if (userDetails instanceof TeacherUserDetails) {
		        	config.put("userType", "teacher");
					config.put("indexUrl", ControllerUtil.getPortalUrlString(request) + TelsAuthenticationProcessingFilter.TEACHER_DEFAULT_TARGET_PATH);
		        }
			} else {
	        	config.put("userType", "none");
			}
		} catch (JSONException e){
			e.printStackTrace();
		}
		
		response.setHeader("Cache-Control", "no-cache");
		response.setHeader("Pragma", "no-cache");
		response.setDateHeader ("Expires", 0);
		
		response.setContentType("application/json");
		response.getWriter().write(config.toString());
	}
	
	/**
	 * Given a <code>String</code> projectFilename, returns the <code>String</code.
	 * associated project metadata filename.
	 * 
	 * @param projectFilename
	 * @return String - project metadata filename
	 */
	private String resolveMetadataFilename(String projectFilename){
		if(projectFilename.contains(".project.json")){
			return projectFilename.replace(".project.json", ".project-meta.json");
		} else {
			return projectFilename.replaceFirst(".project(.v[0-9]+.json)", ".project-meta$1");
		}
	}

	/**
	 * Gets the workgroup for the currently-logged in user so that she may
	 * view the VLE.
	 * @param request
	 * @param run
	 * @param user
	 * @return
	 * @throws ObjectNotFoundException
	 */
	private Workgroup getWorkgroup(HttpServletRequest request, Run run)
	throws ObjectNotFoundException {
		Workgroup workgroup = null;
		//User user = (User) request.getSession().getAttribute(
    	//		User.CURRENT_USER_SESSION_KEY);
		SecurityContext context = SecurityContextHolder.getContext();
		
		if(context.getAuthentication().getPrincipal() instanceof UserDetails) {
			UserDetails userDetails = (UserDetails) context.getAuthentication().getPrincipal();
			User user = userService.retrieveUser(userDetails);
			
			List<Workgroup> workgroupListByOfferingAndUser 
			= workgroupService.getWorkgroupListByOfferingAndUser(run, user);

			if (workgroupListByOfferingAndUser.size() == 1) {
				//this user is in one workgroup
				workgroup = workgroupListByOfferingAndUser.get(0);
			} else if(workgroupListByOfferingAndUser.size() > 1) {
				//this user is in more than one workgroup so we will just get the last one
				workgroup = workgroupListByOfferingAndUser.get(workgroupListByOfferingAndUser.size() - 1);
			} else {
				//this user is not in any workgroups
				
				String previewRequest = request.getParameter(PREVIEW);
				if (previewRequest != null && Boolean.valueOf(previewRequest)) {
					// if this is a preview, workgroupId should be specified, so use
					// that
					String workgroupIdStr = request
							.getParameter(WORKGROUP_ID_PARAM);
					if (workgroupIdStr != null) {
						workgroup = workgroupService.retrieveById(Long
								.parseLong(workgroupIdStr));
					} else {
						workgroup = workgroupService
								.getPreviewWorkgroupForRooloOffering(run, user);
					}
				}
			}
		}

		return workgroup;
	}
	
	/**
	 * Obtain the user names for this workgroup
	 * @param workgroup a Workgroup that we want the names from
	 * @return a string of user names delimited by :
	 * e.g.
	 * "Jennifer Chiu (JenniferC829):helen zhang (helenz1115a)"
	 */
	private String getUserNamesFromWorkgroup(Workgroup workgroup) {
		//the string buffer to maintain the user names for the logged in user
		StringBuffer userNames = new StringBuffer();
		Set<User> members = workgroup.getMembers();
		Iterator<User> iterator = members.iterator();
		while(iterator.hasNext()) {
			//get a user
			User user = iterator.next();

			//get the first name last name and login as a string like Geoffrey Kwan (GeoffreyKwan)
			String firstNameLastNameLogin = getFirstNameLastNameLogin(user);
			
			//separate the names with a :
			if(userNames.length() != 0) {
				userNames.append(":");
			}
			
			//add the first name last name and login for this user
			userNames.append(firstNameLastNameLogin);
		}
		
		//return the : delimited user names that are in this workgroup
		return userNames.toString();
	}
	
	/**
	 * Obtain the first name, last name, and login for the user
	 * @param user the User we want to obtain the first, last, login for
	 * @return the first, last and login in this format below
	 * Jennifer Chiu (JenniferC829)
	 */
	private String getFirstNameLastNameLogin(User user) {
		String firstName = "";
		String lastName = "";
		String userName = "";
		
		//get the user details, we need to cast to our own MutableUserDetails class
		MutableUserDetails userDetails = (org.telscenter.sail.webapp.domain.authentication.MutableUserDetails) user.getUserDetails();

		//get the first name, last name, and login
		if(userDetails != null) {
			userName = userDetails.getUsername();
			firstName = userDetails.getFirstname();
			lastName = userDetails.getLastname();
		}
		
		//append the user's name and login so it looks like Jennifer Chiu (JenniferC829)
		return firstName + " " + lastName + " (" + userName + ")";
	}
	
	/**
	 * Get the student ids from the workgroup
	 * @param workgroup the workgroup to get student ids from
	 * @return a JSONArray containing the student ids
	 */
	private JSONArray getStudentIdsFromWorkgroup(Workgroup workgroup) {
		JSONArray studentIds = new JSONArray();
		
		//get all the members of the workgroup
		Set<User> members = workgroup.getMembers();
		Iterator<User> iterator = members.iterator();
		
		//loop through all the members in the workgroup
		while(iterator.hasNext()) {
			//get a student in the workgroup
			User user = iterator.next();

			//get the student id
			Long studentId = user.getId();
			
			//add the student id to the accumulation of student ids for this workgroup
			studentIds.put(studentId);
		}
		
		return studentIds;
	}
	
	/**
	 * Get the xml for the classmate user info
	 * @param classmateWorkgroup the workgroup of the classmate
	 * @return an xml string containing the info for the classmate
	 */
	private JSONObject getClassmateUserInfoJSON(Workgroup classmateWorkgroup) {
		//StringBuffer userInfoString = new StringBuffer();
		JSONObject classmateUserInfo = new JSONObject();
		
		try {			
			classmateUserInfo.put("workgroupId", classmateWorkgroup.getId());
			String userNames = getUserNamesFromWorkgroup(classmateWorkgroup);
			
			classmateUserInfo.put("userName", userNames);
			
			//get user name
			if(classmateWorkgroup instanceof WISEWorkgroup) {
				//check that there is a period
				if(((WISEWorkgroup) classmateWorkgroup).getPeriod() != null) {
					classmateUserInfo.put("periodId", ((WISEWorkgroup) classmateWorkgroup).getPeriod().getId());
					classmateUserInfo.put("periodName", ((WISEWorkgroup) classmateWorkgroup).getPeriod().getName());

					//add the student ids into the classmateUserInfo JSONObject
					JSONArray studentIds = getStudentIdsFromWorkgroup(classmateWorkgroup);
					classmateUserInfo.put("userIds", studentIds);
				}
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		return classmateUserInfo;
	}
	
	/**
	 * @param portalProperties the portalProperties to set
	 */
	public void setPortalProperties(Properties portalProperties) {
		this.portalProperties = portalProperties;
	}

	/**
	 * @param projectService the projectService to set
	 */
	public void setProjectService(ProjectService projectService) {
		this.projectService = projectService;
	}

	/**
	 * @param runService the runService to set
	 */
	public void setRunService(RunService runService) {
		this.runService = runService;
	}

	/**
	 * @param userService the userService to set
	 */
	public void setUserService(UserService userService) {
		this.userService = userService;
	}

	/**
	 * @param workgroupService the workgroupService to set
	 */
	public void setWorkgroupService(WorkgroupService workgroupService) {
		this.workgroupService = workgroupService;
	}

}
