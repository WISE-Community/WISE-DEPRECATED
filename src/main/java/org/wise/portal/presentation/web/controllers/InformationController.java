/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
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
package org.wise.portal.presentation.web.controllers;

import java.io.IOException;
import java.util.Calendar;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Properties;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.switchuser.SwitchUserFilter;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.filters.WISEAuthenticationProcessingFilter;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.workgroup.WorkgroupService;

/**
 * Handles requests for User information and VLE config
 * @author Patrick Lawler
 * @author Geoffrey Kwan
 * @author Hiroki Terashima
 */
@Controller
public class InformationController {

	@Autowired
	Properties wiseProperties;

	@Autowired
	ProjectService projectService;

	@Autowired
	RunService runService;

	@Autowired
	UserService userService;

	@Autowired
	WorkgroupService workgroupService;

	/**
	 * If the workgroupId is specified in the request, then look up userInfo for that specified workgroup.
	 * Otherwise, lookup userInfo for the currently-logged-in user.
	 * @param request
	 * @param response
	 * @throws IOException
	 * @throws ObjectNotFoundException
	 * @throws NumberFormatException
	 */
    @RequestMapping("/userInfo")
	private void handleGetUserInfo(HttpServletRequest request, HttpServletResponse response)
			throws IOException, NumberFormatException, ObjectNotFoundException{

		String runIdString = request.getParameter("runId");
		Long runId = Long.parseLong(runIdString);
		Run run = this.runService.retrieveById(runId);

		JSONObject userInfo = getUserInfo(request, run);

		if (userInfo == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		}

		response.setHeader("Cache-Control", "no-cache");
		response.setHeader("Pragma", "no-cache");
		response.setDateHeader ("Expires", 0);
		response.setContentType("application/json");
		response.getWriter().write(userInfo.toString());
	}

    /**
     * Usable by anonymous and logged-in users for retrieving public run information,
     * such as run periods given runcode
     * @param runcode
     * @param response
     * @throws Exception
     */
	@RequestMapping("/runInfo")
	protected void handleRequestInternal(
			@RequestParam("runcode") String runcode,
			HttpServletResponse response) throws Exception {

		try {
			Run run = runService.retrieveRunByRuncode(runcode);

			Set<Group> periods = run.getPeriods();
			StringBuffer periodsStr = new StringBuffer();
			for (Group period : periods) {
				periodsStr.append(period.getName());
				periodsStr.append(",");
			}
			response.setContentType("text/plain");
			response.getWriter().print(periodsStr.toString());
		} catch (ObjectNotFoundException e) {
			response.setContentType("text/plain");
			response.getWriter().print("not found");
		}
	}

	/**
     * Get an user info object for the logged in user for the specified run
     * @param request
     * @return UserInfo as JSON object
     * @throws ObjectNotFoundException
     * @throws NumberFormatException
     */
    private JSONObject getUserInfo(HttpServletRequest request, Run run) throws ObjectNotFoundException,
            NumberFormatException {
        JSONObject userInfo = new JSONObject();

		Workgroup workgroup;
		String workgroupIdStr = request.getParameter("workgroupId");
		if (workgroupIdStr != null && workgroupIdStr != "") {
			workgroup = workgroupService.retrieveById(new Long(workgroupIdStr));
			// if a workgroup was specified that was not for this run, return BAD_REQUEST
			if (workgroup.getRun().getId() != run.getId()) {
				return null;
			}
		} else {
            workgroup = getWorkgroup(request, run);
        }

		// the group id of the period, this is the id in the db which is not
		// the same as the period number
		String periodId = "";

		// the period name that you would regularly think of as a period
		String periodName = "";

		User loggedInUser = ControllerUtil.getSignedInUser();

		JSONArray userIds = new JSONArray();
		Long workgroupId = null;

		// get the period
		if (!workgroup.isTeacherWorkgroup()) {
			// the logged in user is a student
			Group periodGroup = workgroup.getPeriod();
			periodName = periodGroup.getName();
			periodId = periodGroup.getId().toString();
			workgroupId = workgroup.getId();
		} else if ((workgroup != null && workgroup.isTeacherWorkgroup())
				|| (workgroup == null && loggedInUser.isAdmin())) {

			// the logged in user is a teacher or is of admin-role
			if (workgroup != null && workgroup.isTeacherWorkgroup()) {
				// if teacher, include workgroupId
				workgroupId = workgroup.getId();
			}

			// string buffers to maintain : delimited values
			StringBuffer periodIds = new StringBuffer();
			StringBuffer periodNames = new StringBuffer();

			// get the periods
			Set<Group> periods = run.getPeriods();
			Iterator<Group> periodIter = periods.iterator();

			// loop through all the periods
			while (periodIter.hasNext()) {
				Group next = periodIter.next();

				//if this is not the first period add a :
				if (periodIds.length() != 0) {
					periodIds.append(":");
				}

				//if this is not the first period add a :
				if (periodNames.length() != 0) {
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

		// obtain the user name in the format like "Geoffrey Kwan (GeoffreyKwan)"
		String userNames = "";
		if (workgroup != null) {
			userNames = getUserNamesFromWorkgroup(workgroup);

			// get the user ids for the students in the workgroup
			userIds = getStudentIdsFromWorkgroup(workgroup);
		} else if (workgroup == null && loggedInUser.isAdmin()) {
			userNames = ((MutableUserDetails) loggedInUser.getUserDetails()).getCoreUsername();

			// get the user id of the admin
			userIds.put(loggedInUser.getId());
		}

		JSONArray periods = new JSONArray();

		// get all the periods in the run
		Set<Group> periodsSet = run.getPeriods();

		if (periodsSet != null) {
			Iterator<Group> periodsIterator = periodsSet.iterator();

			// loop through all the periods in the run
			while (periodsIterator.hasNext()) {
				//get a period
				Group period = periodsIterator.next();

				// get the period id and period name
				Long tempPeriodId = period.getId();
				String tempPeriodName = period.getName();

				try {
					// put the period id and period name in a JSONObject
					JSONObject periodObject = new JSONObject();
					periodObject.put("periodId", tempPeriodId);
					periodObject.put("periodName", tempPeriodName);

					// add the JSONObject into our array of periods
					periods.put(periodObject);
				} catch (JSONException e) {
					e.printStackTrace();
				}
			}
		}

		// add this user's info
		JSONObject myUserInfo = new JSONObject();
		try {
			myUserInfo.put("workgroupId", workgroupId);
			myUserInfo.put("userName", userNames);
            myUserInfo.put("isSwitchedUser", ControllerUtil.isUserPreviousAdministrator());
            //myUserInfo.put("isSwitchedUser", loggedInUser.isPreviousAdmin());

            try {
                myUserInfo.put("periodId", Long.parseLong(periodId));
            } catch (NumberFormatException nfe) {
                myUserInfo.put("periodId", periodId);
            }

			myUserInfo.put("periodName", periodName);
			myUserInfo.put("userIds", userIds);
		} catch (JSONException e) {
			e.printStackTrace();
		}

		// add the class info:
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
						&& !classmateWorkgroup.isTeacherWorkgroup()
						&& classmateWorkgroup.getPeriod() != null) {
					// only include non-teacher, non-detached classmates, excluding yourself.
					for (String requestedWorkgroupId : requestedWorkgroupIds) {
						if (requestedWorkgroupId.equals(classmateWorkgroup.getId().toString())) {
							//get the classmate info and append it
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
						&& !classmateWorkgroup.isTeacherWorkgroup()
						&& classmateWorkgroup.getPeriod() != null) {   // only include classmates, not yourself.
					//get the classmate info and append it
					classmateUserInfos.put(getClassmateUserInfoJSON(classmateWorkgroup));
				}
			}
		}

		JSONObject teacherUserInfo = new JSONObject();

		//get the owners of the run (there should only be one owner)
		User runOwner = run.getOwner();

		try {
			//get the workgroup for the owner in the run
			List<Workgroup> workgroupsForRunOwner = workgroupService.getWorkgroupListByRunAndUser(run, runOwner);

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
		while (sharedOwnersIterator.hasNext()) {
			//get a shared owner
			User sharedOwner = sharedOwnersIterator.next();

			//get the workgroups
			List<Workgroup> sharedTeacherWorkgroups = workgroupService.getWorkgroupListByRunAndUser(run, sharedOwner);

			/*
			 * loop through all the shared teacher workgroups in case a shared
			 * owner has multiple workgroups for this run due to a bug which
			 * created multiple workgroups for a shared teacher
			 */
			for (Workgroup sharedTeacherWorkgroup: sharedTeacherWorkgroups) {
				//make a JSONObject for this shared owner
				JSONObject sharedTeacherUserInfo = new JSONObject();

				try {
					//set the values into the shared owner JSONObject
					sharedTeacherUserInfo.put("workgroupId", sharedTeacherWorkgroup.getId());
					sharedTeacherUserInfo.put("userName", sharedTeacherWorkgroup.generateWorkgroupName());

					//get the shared teacher role
					String sharedTeacherRole = runService.getSharedTeacherRole(run, sharedOwner);

					if (sharedTeacherRole == null) {
						//shared teacher does not have a role
						sharedTeacherUserInfo.put("role", "");
					} else if (sharedTeacherRole.equals(UserDetailsService.RUN_READ_ROLE)) {
						//shared teacher can view the run
						sharedTeacherUserInfo.put("role", "read");
					} else if (sharedTeacherRole.equals(UserDetailsService.RUN_GRADE_ROLE)) {
						//shared teacher can grade the run
						sharedTeacherUserInfo.put("role", "grade");
					}
				} catch (JSONException e) {
					e.printStackTrace();
				}

				//add the shared owner to the array
				sharedTeacherUserInfos.put(sharedTeacherUserInfo);
			}
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
        return userInfo;
    }

	/**
	 * Handles the get config request from three possible modes for WISE4: grading, preview and run.
	 * The run and grading requests are almost identical, the preview request is largely handled
	 * when the projectId is found.
	 *
	 * projectId is found == preview mode
	 * runId is found == run mode
	 *
	 * @param request
	 * @param response
	 * @throws ObjectNotFoundException
	 * @throws IOException
	 */
    @RequestMapping("/vleconfig")
	private void handleGetConfigWISE4(HttpServletRequest request, HttpServletResponse response)
	        throws ObjectNotFoundException, IOException {
		String contextPath = request.getContextPath(); //get the context path e.g. /wise
		User signedInUser = ControllerUtil.getSignedInUser();
		String projectIdString = request.getParameter("projectId");
		Long projectId = null;
		String runId = request.getParameter("runId");
		String mode = request.getParameter("mode");
		String step = request.getParameter("step");
		String workgroupIdString = request.getParameter("workgroupId");
		String userSpecifiedLang = request.getParameter("lang");
		Long parentProjectId = null;
		String runName = "";

		if (mode == null) {
			mode = "preview";
		}

		String curriculumBaseWWW = wiseProperties.getProperty("curriculum_base_www");
		String studentUploadsBaseWWW = wiseProperties.getProperty("studentuploads_base_www");
		String wiseBaseURL = wiseProperties.getProperty("wiseBaseURL");
		String cRaterRequestURL = wiseBaseURL + "/cRater";  // the url to make CRater requests

		String rawProjectUrl = null;
		JSONObject config = new JSONObject();


		if (projectIdString != null) {
			projectId = Long.parseLong(projectIdString);
		}

		// if projectId provided, this is a request for preview
		if (projectId != null) {
			Project project = projectService.getById(projectId);

			parentProjectId = project.getParentProjectId(); // get the parent project id as a string

			rawProjectUrl = project.getModulePath();

			try {
				config.put("runId", "");
			} catch (JSONException e) {
				e.printStackTrace();
			}

		} else if (runId != null) {
			/* if no projectId String provided, try getting project url from run also add gradework
			 * specific config to the config */
			Run run = this.runService.retrieveById(Long.parseLong(runId));
			rawProjectUrl = run.getProject().getModulePath();

			// get the run name
			runName = run.getName();

			// get the project
			Project project = run.getProject();
			if (project != null) {
				// get the project id as a string
				projectId = (Long) project.getId();

				parentProjectId = project.getParentProjectId(); // get the parent project id as a string
			}

			Long periodId = null;
			Workgroup workgroup = getWorkgroup(request, run);
			Long workgroupId = null;

			if (workgroup == null) {
				/*
				 * the user is not in a workgroup for the run so they should not be
				 * allowed to access the config, unless the user is an admin
				 */
				if (signedInUser == null || !signedInUser.isAdmin()) {
					//user is not signed in or is not admin so we will not let them proceed
					return;
				}
			} else if (workgroup.isTeacherWorkgroup()) {
				//workgroup is a teacher
				workgroupId = workgroup.getId();

			} else {
				//workgroup is a student so we will get the period
				Group periodGroup = workgroup.getPeriod(); //geoff
				periodId = periodGroup.getId();
				workgroupId = workgroup.getId();
			}

			//get the grading type (step or team)
			String gradingType = request.getParameter("gradingType");

			//get the boolean whether to get revisions
			String getRevisions = request.getParameter("getRevisions");

			// the url to get/post student data
			String studentDataURL = wiseBaseURL + "/studentData.html";

			// URL to get/post annotations
	    	String annotationsURL = wiseBaseURL + "/annotation?type=annotation&runId=" + runId;

			//get the url to get peer review work
			String peerReviewURL = wiseBaseURL + "/peerReview.html?type=peerreview";

	    	//get the url to get/post idea basket data
	    	String ideaBasketURL = wiseBaseURL + "/ideaBasket?runId=" + runId + "&projectId=" + run.getProject().getId().toString();

            //get the url to get/post portfolio data
            String portfolioURL = wiseBaseURL + "/portfolio?runId=" + runId;

            if (periodId != null) {
	    		//add the period id if it is available
	    		ideaBasketURL += "&periodId=" + periodId;
                portfolioURL += "&periodId=" + periodId;
	    	}

	    	if (workgroupId != null) {
	    		ideaBasketURL += "&workgroupId=" + workgroupId;
                portfolioURL += "&workgroupId=" + workgroupId;
	    	}

	    	//get the url to get student assets
	    	String studentAssetManagerURL = wiseBaseURL + "/assetManager?type=studentAssetManager&runId=" + runId;

			//get the websocket base url e.g. ws://wise4.berkeley.edu:8080
			String webSocketBaseURL = wiseProperties.getProperty("webSocketBaseUrl");

			if (webSocketBaseURL == null) {
				/*
				 * if the websocket base url was not provided in the portal properties
				 * we will use the default websocket base url.
				 * e.g.
				 * ws://localhost:8080/wise
				 */
				if (wiseBaseURL.contains("http")) {
					webSocketBaseURL = wiseBaseURL.replace("http", "ws");
				} else {
					String portalContextPath = ControllerUtil.getPortalUrlString(request);
					webSocketBaseURL = portalContextPath.replace("http", "ws");
				}
			}

			//get the url for websocket connections
			String webSocketURL = webSocketBaseURL + "/websocket";

			//get the url for sending and receiving student statuses
			String studentStatusURL = wiseBaseURL + "/studentStatus";

			//get the url for sending and receiving run statuses
			String runStatusURL = wiseBaseURL + "/runStatus";

            //get the url to get flags
            String flagsURL = wiseBaseURL + "/annotation?type=flag&runId=" + runId;

            // URL to get/post inappropriate flags
            String inappropriateFlagsURL = wiseBaseURL + "/annotation?type=inappropriateFlag&runId=" + runId;

            // put all the config params into the json object
			try {
				config.put("runId", Long.parseLong(runId));
				config.put("isRunActive", !run.isEnded());
				config.put("contextPath", contextPath);
				config.put("flagsURL", flagsURL);
                config.put("inappropriateFlagsURL", inappropriateFlagsURL);
				config.put("annotationsURL", annotationsURL);
				config.put("studentDataURL", studentDataURL);
				config.put("gradingType", gradingType);
				config.put("getRevisions", getRevisions);
				config.put("peerReviewURL", peerReviewURL);
				config.put("ideaBasketURL", ideaBasketURL);
				config.put("portfolioURL", portfolioURL);
                config.put("studentAssetManagerURL", studentAssetManagerURL);
				config.put("runInfo", run.getInfo());
				config.put("isRealTimeEnabled", true);  // TODO: make this run-specific setting
                config.put("webSocketURL", webSocketURL);
				config.put("studentStatusURL", studentStatusURL);
				config.put("runStatusURL", runStatusURL);
				config.put("postLevel", run.getPostLevel());

				// add the config fields specific to the teacher grading
				if ("grading".equals(mode)) {
                    // URL for get/post premade comments
                    String premadeCommentsURL = wiseBaseURL + "/teacher/grading/premadeComments.html";
                    config.put("premadeCommentsURL", premadeCommentsURL);

                    // get the url for xls export
                    String getXLSExportURL = wiseBaseURL + "/export?type=xlsexport&runId=" + runId;
                    config.put("getXLSExportURL", getXLSExportURL);

                    //get the url for special export
                    String getSpecialExportURL = wiseBaseURL + "/specialExport?type=specialExport&runId=" + runId;
                    config.put("getSpecialExportURL", getSpecialExportURL);

                    String getStudentListURL = wiseBaseURL + "/teacher/management/studentListExport?runId=" + runId;
					config.put("getStudentListURL", getStudentListURL);
				}
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}

		// set the content url
		String projectURL = curriculumBaseWWW + rawProjectUrl;

		// get location of last separator in url
		int lastIndexOfSlash = projectURL.lastIndexOf("/");
		if (lastIndexOfSlash == -1) {
			lastIndexOfSlash = projectURL.lastIndexOf("\\");
		}

        // set the projectBaseURL based on the projectURL
        String projectBaseURL = projectURL.substring(0, lastIndexOfSlash) + "/";

        // get the url for the *.project.meta.json file
		String projectMetadataURL = wiseBaseURL + "/metadata.html";

		try {
			config.put("runName", runName);
			config.put("contextPath", contextPath);
			config.put("mode", mode);
			config.put("projectId", projectId);
			config.put("parentProjectId", parentProjectId);
			config.put("projectMetadataURL", projectMetadataURL);
            config.put("projectURL", projectURL);
            config.put("projectBaseURL", projectBaseURL);
            config.put("studentUploadsBaseURL", studentUploadsBaseWWW);
			config.put("theme", "WISE");
            config.put("cRaterRequestURL", cRaterRequestURL);
			config.put("mainHomePageURL", contextPath);
			config.put("renewSessionURL", wiseBaseURL + "/session/renew");
            config.put("sessionLogOutURL", contextPath + "/logout");

            if ("preview".equals(mode)) {
                // add preview project specific settings
                String isConstraintsDisabledStr = request.getParameter("isConstraintsDisabled");
                if (isConstraintsDisabledStr != null && Boolean.parseBoolean(isConstraintsDisabledStr)) {
                    config.put("isConstraintsDisabled", true);
                }

                if (workgroupIdString != null) {
                    /*
                     * This is set if the request is to preview the project and use
                     * a specific workgroup id. This is usually used to test
                     * branching based on workgroup id.
                     */
                    config.put("workgroupId", new Integer(workgroupIdString));
                }
            } else {
                // add non-preview project specific settings
                String userInfoURL = wiseBaseURL + "/userInfo?runId=" + runId;
                config.put("userInfoURL", userInfoURL);
            }

	        // set user's locale
	        Locale locale = request.getLocale();
	        if (signedInUser != null) {
	        	String userLanguage = signedInUser.getUserDetails().getLanguage();
	        	if (userLanguage != null) {
			        if (userLanguage.contains("_")) {
		        		String language = userLanguage.substring(0, userLanguage.indexOf("_"));
		        		String country = userLanguage.substring(userLanguage.indexOf("_") + 1);
		            	locale = new Locale(language, country);
		        	} else {
		        		locale = new Locale(userLanguage);
		        	}
	        	}
	        }
	        // if user specified lang=XX in the url, it will be used instead
            if (userSpecifiedLang != null) {
	            locale = new Locale(userSpecifiedLang);
            }

			config.put("locale", locale);
			config.put("wiseBaseURL", wiseBaseURL);

			if (step != null) {
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

			// max size for all assets combined uploaded by student, in bytes
            Long studentMaxTotalAssetsSize = new Long(wiseProperties.getProperty("student_max_total_assets_size", "5242880"));
            config.put("studentMaxTotalAssetsSize", studentMaxTotalAssetsSize);

			// add userType {teacher, student, null}
			if (signedInUser != null) {
		        UserDetails userDetails = (UserDetails) signedInUser.getUserDetails();
		        if (userDetails instanceof StudentUserDetails) {
		        	config.put("userType", "student");
					config.put("indexURL", ControllerUtil.getPortalUrlString(request) + WISEAuthenticationProcessingFilter.STUDENT_DEFAULT_TARGET_PATH);

		        } else if (userDetails instanceof TeacherUserDetails) {
		        	config.put("userType", "teacher");
					config.put("indexURL", ControllerUtil.getPortalUrlString(request) + WISEAuthenticationProcessingFilter.TEACHER_DEFAULT_TARGET_PATH);
		        }
			} else {
	        	config.put("userType", "none");
			}

			Calendar now = Calendar.getInstance();
			config.put("retrievalTimestamp", now.getTimeInMillis());
		} catch (JSONException e) {
			e.printStackTrace();
		}

		response.setHeader("Cache-Control", "no-cache");
		response.setHeader("Pragma", "no-cache");
		response.setDateHeader ("Expires", 0);
		response.setContentType("application/json");
		response.getWriter().write(config.toString());
	}

	/**
	 * Handles the get config request from these possible modes for WISE5: [preview, studentRun, classroomMonitor]
	 * Requests with mode = [studentRun, classroomMonitor] are handled almost identically. In this case, id is the run id.
	 * For requests with mode = preview, the id is the project id.
	 *
	 * @param request
	 * @param response
	 * @param mode [preview, studentRun, classroomMonitor]
	 * @param id either project id or run id, depending on mode
	 * @throws ObjectNotFoundException
	 * @throws IOException
	 */
	@RequestMapping("/config/{mode}/{id}")
	private void handleGetConfigWISE5(HttpServletRequest request,
									  HttpServletResponse response,
									  @PathVariable String mode,
									  @PathVariable String id)
			throws ObjectNotFoundException, IOException {
		try {
			JSONObject config = new JSONObject();
			String contextPath = request.getContextPath();  //get the context path e.g. /wise
			config.put("contextPath", contextPath);

			User signedInUser = ControllerUtil.getSignedInUser();
			String userSpecifiedLang = request.getParameter("lang");

			String wiseBaseURL = wiseProperties.getProperty("wiseBaseURL");
			config.put("wiseBaseURL", wiseBaseURL);
			config.put("mode", mode);
			config.put("theme", "WISE");

			String rawProjectUrl = null;
			Project project = null;

			if ("preview".equals(mode)) {
				if ("demo".equals(id)) {
					rawProjectUrl = "/demo/project.json";
					addDummyUserInfoToConfig(config);
				} else {
					Long projectId = Long.parseLong(id);
					project = projectService.getById(projectId);
					rawProjectUrl = project.getModulePath();
				}
				addDummyUserInfoToConfig(config);  // add a dummy user info
				String isConstraintsDisabledStr = request.getParameter("isConstraintsDisabled");
				if (isConstraintsDisabledStr != null && Boolean.parseBoolean(isConstraintsDisabledStr)) {
					config.put("isConstraintsDisabled", true);
				}
			} else if ("studentRun".equals(mode) || "classroomMonitor".equals(mode)) {
				Long runId = Long.parseLong(id);
				config.put("runId", runId);

				// add non-preview project specific settings
				String userInfoURL = wiseBaseURL + "/userInfo?runId=" + runId;
				config.put("userInfoURL", userInfoURL);

				Run run = this.runService.retrieveById(runId);
				config.put("runName", run.getName());  // set the run name
				project = run.getProject();  // get the project
				rawProjectUrl = project.getModulePath();

				Workgroup workgroup = getWorkgroup(request, run);
				if (workgroup == null) {
					// the user is not in a workgroup for the run so they should not be
					// allowed to access the config, unless the user is an admin
					if (signedInUser == null || !signedInUser.isAdmin()) {
						// user is not signed in or is not admin so we will not let them proceed
						return;
					}
				}

				// URL to get/post annotations
				String annotationsURL = wiseBaseURL + "/annotation?type=annotation&runId=" + runId;

				// get the websocket base url e.g. ws://wise4.berkeley.edu:8080
				String webSocketBaseURL = wiseProperties.getProperty("webSocketBaseUrl");

				if (webSocketBaseURL == null) {
					/*
					 * if the websocket base url was not provided in the portal properties
					 * we will use the default websocket base url.
					 * e.g.
					 * ws://localhost:8080/wise
					 */
					if (wiseBaseURL.contains("http")) {
						webSocketBaseURL = wiseBaseURL.replace("http", "ws");
					} else {
						String portalContextPath = ControllerUtil.getPortalUrlString(request);
						webSocketBaseURL = portalContextPath.replace("http", "ws");
					}
				}

				// url for websocket connections
				String webSocketURL = webSocketBaseURL + "/websocket";

				// url for sending and receiving student statuses
				String studentStatusURL = wiseBaseURL + "/studentStatus";

				// url for sending and receiving run statuses
				String runStatusURL = wiseBaseURL + "/runStatus";

				config.put("contextPath", contextPath);
				config.put("annotationsURL", annotationsURL);
				config.put("runInfo", run.getInfo());
				config.put("isRealTimeEnabled", run.isRealTimeEnabled());
				config.put("webSocketURL", webSocketURL);
				config.put("studentStatusURL", studentStatusURL);
				config.put("runStatusURL", runStatusURL);

				config.put("userInfo", getUserInfo(request, run));  // add userInfo
				config.put("studentDataURL", wiseBaseURL + "/student/data");  // the url to get/post student data
				config.put("studentAssetsURL", wiseBaseURL + "/student/asset/" + runId);
				config.put("studentNotebookURL", wiseBaseURL + "/student/notebook/" + runId);
				config.put("achievementURL", wiseBaseURL + "/achievement/" + runId);
				config.put("notificationURL", wiseBaseURL + "/notification/" + runId);
				String openCPUURL = wiseProperties.getProperty("openCPUURL");
				if (openCPUURL != null) {
					config.put("openCPUURL", openCPUURL);
				}

				// check that the user has read or write permission on the run
				if (signedInUser.isAdmin() ||
						this.runService.hasRunPermission(run, signedInUser, BasePermission.WRITE) ||
						this.runService.hasRunPermission(run, signedInUser, BasePermission.READ)) {
					config.put("runCode", run.getRuncode());
					config.put("teacherDataURL", wiseBaseURL + "/teacher/data");
					config.put("runDataExportURL", wiseBaseURL + "/teacher/export");
					config.put("studentNotebookURL", wiseBaseURL + "/teacher/notebook/" + runId);
					if ("classroomMonitor".equals(mode)) {
						// set the saveProjectURL so teachers can set max scores via Classroom Monitor tool
						String projectId = project.getId().toString();
						String saveProjectURL = wiseBaseURL + "/project/save/" + projectId;
						config.put("saveProjectURL", saveProjectURL);
					}
				}
			}

			// set the project URL
			String curriculumBaseWWW = wiseProperties.getProperty("curriculum_base_www");
			String projectURL = curriculumBaseWWW + rawProjectUrl;

			// get location of last separator in url
			int lastIndexOfSlash = projectURL.lastIndexOf("/");
			if (lastIndexOfSlash == -1) {
				lastIndexOfSlash = projectURL.lastIndexOf("\\");
			}

			if (project != null) {
				config.put("projectId", project.getId());
				config.put("parentProjectId", project.getParentProjectId());
				String previewProjectURL = wiseBaseURL + "/project/" + project.getId();
				config.put("previewProjectURL", previewProjectURL);
			}

			config.put("projectURL", projectURL);
			// set the projectBaseURL based on the projectURL
			String projectBaseURL = projectURL.substring(0, lastIndexOfSlash) + "/";
			config.put("projectBaseURL", projectBaseURL);
			String studentUploadsBaseWWW = wiseProperties.getProperty("studentuploads_base_www");
			config.put("studentUploadsBaseURL", studentUploadsBaseWWW);
			String cRaterRequestURL = wiseBaseURL + "/cRater";  // the url to make CRater requests
			config.put("cRaterRequestURL", cRaterRequestURL);
			config.put("mainHomePageURL", contextPath);
			config.put("renewSessionURL", wiseBaseURL + "/session/renew");
			config.put("sessionLogOutURL", contextPath + "/logout");

			// set user's locale
			Locale locale = request.getLocale();
			if (userSpecifiedLang != null) {
				// if user specified lang=XX in the url, use it
				locale = new Locale(userSpecifiedLang);
			} else {
				// otherwise, use the locale saved for the user.
				if (signedInUser != null) {
					String userLanguage = signedInUser.getUserDetails().getLanguage();
					if (userLanguage != null) {
						if (userLanguage.contains("_")) {
							String language = userLanguage.substring(0, userLanguage.indexOf("_"));
							String country = userLanguage.substring(userLanguage.indexOf("_") + 1);
							locale = new Locale(language, country);
						} else {
							locale = new Locale(userLanguage);
						}
					}
				}
			}
			config.put("locale", locale);

			int maxInactiveInterval = request.getSession().getMaxInactiveInterval() * 1000;
			config.put("sessionTimeoutInterval", maxInactiveInterval);          // add sessiontimeout interval, in milleseconds
			int sessionTimeoutCheckInterval = maxInactiveInterval / 20;         // check 20 times during the session.
			if (sessionTimeoutCheckInterval > 60000) {
				sessionTimeoutCheckInterval = 60000;  // session should be checked at least every 60 seconds.
			}
			config.put("sessionTimeoutCheckInterval", sessionTimeoutCheckInterval); // how often session should be checked...check every minute (1 min=60sec=60000 milliseconds)

			// max size for all assets combined uploaded by student, in bytes
			Long studentMaxTotalAssetsSize = new Long(wiseProperties.getProperty("student_max_total_assets_size", "5242880"));
			config.put("studentMaxTotalAssetsSize", studentMaxTotalAssetsSize);

			// add userType {teacher, student, null}
			if (signedInUser != null) {
				UserDetails userDetails = (UserDetails) signedInUser.getUserDetails();
				if (userDetails instanceof StudentUserDetails) {

					config.put("userType", "student");
					config.put("indexURL", ControllerUtil.getPortalUrlString(request) + WISEAuthenticationProcessingFilter.STUDENT_DEFAULT_TARGET_PATH);

				} else if (userDetails instanceof TeacherUserDetails) {

					config.put("userType", "teacher");
					config.put("indexURL", ControllerUtil.getPortalUrlString(request) + WISEAuthenticationProcessingFilter.TEACHER_DEFAULT_TARGET_PATH);
				}
			} else {
				config.put("userType", "none");
			}

			Calendar now = Calendar.getInstance();
			config.put("retrievalTimestamp", now.getTimeInMillis());

			response.setHeader("Cache-Control", "no-cache");
			response.setHeader("Pragma", "no-cache");
			response.setDateHeader("Expires", 0);
			response.setContentType("application/json");
			response.getWriter().write(config.toString());
		} catch (JSONException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Adds a dummy user info to the config object, used in previewing WISE5 projects
	 * @param config
     */
	private void addDummyUserInfoToConfig(JSONObject config) {
		try {
            String dummyUserInfoJSONString =
                    "{\"myUserInfo\": {"+
                        "\"periodId\": 1,"+
                        "\"workgroupId\": 1,"+
                        "\"myClassInfo\": {"+
                            "\"classmateUserInfos\": [],"+
                            "\"sharedTeacherUserInfos\": [],"+
                            "\"periods\": [{"+
                                "\"periodId\": 1,"+
                                "\"periodName\": \"1\""+
                            "}],"+
                            "\"teacherUserInfo\": {"+
                                "\"workgroupId\": 1,"+
                                "\"userName\": \"Preview Teacher\""+
                            "}"+
                        "},"+
                        "\"userIds\": [1],"+
                        "\"periodName\": \"1\","+
                        "\"userName\": \"Preview Team\""+
                        "}"+
                    "}";
            JSONObject userInfoJSONObject = new JSONObject(dummyUserInfoJSONString);
            config.put("userInfo", userInfoJSONObject);
        } catch (JSONException e) {
            e.printStackTrace();
        }
	}

	/**
	 * Gets the workgroup for the currently-logged in user so that she may
	 * view the VLE.
	 * @param request
	 * @param run
	 * @return Workgroup for the currently-logged in user
	 * @throws ObjectNotFoundException
	 */
	private Workgroup getWorkgroup(HttpServletRequest request, Run run)
	throws ObjectNotFoundException {
		Workgroup workgroup = null;
		SecurityContext context = SecurityContextHolder.getContext();

		if (context.getAuthentication().getPrincipal() instanceof UserDetails) {
			UserDetails userDetails = (UserDetails) context.getAuthentication().getPrincipal();
			User user = userService.retrieveUser(userDetails);

			List<Workgroup> workgroupListByRunAndUser
				= workgroupService.getWorkgroupListByRunAndUser(run, user);

			if (workgroupListByRunAndUser.size() == 1) {
				// this user is in one workgroup
				workgroup = workgroupListByRunAndUser.get(0);
			} else if (workgroupListByRunAndUser.size() > 1) {
				// this user is in more than one workgroup so we will just get the last one
				workgroup = workgroupListByRunAndUser.get(workgroupListByRunAndUser.size() - 1);
			} else {
				// this user is not in any workgroups
				String previewRequest = request.getParameter("preview");
				if (previewRequest != null && Boolean.valueOf(previewRequest)) {
					// if this is a preview, workgroupId should be specified, so use that
					String workgroupIdStr = request.getParameter("workgroupId");
					if (workgroupIdStr != null) {
						workgroup = workgroupService.retrieveById(Long.parseLong(workgroupIdStr));
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
		while (iterator.hasNext()) {
			//get a user
			User user = iterator.next();

			//get the first name last name and login as a string like Geoffrey Kwan (GeoffreyKwan)
			String firstNameLastNameLogin = getFirstNameLastNameLogin(user);

			//separate the names with a :
			if (userNames.length() != 0) {
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
		MutableUserDetails userDetails = (org.wise.portal.domain.authentication.MutableUserDetails) user.getUserDetails();

		//get the first name, last name, and login
		if (userDetails != null) {
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
		while (iterator.hasNext()) {
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
	 * Get the classmate user info
	 * @param classmateWorkgroup the workgroup of the classmate
	 * @return a json string containing the info for the classmate
	 */
	private JSONObject getClassmateUserInfoJSON(Workgroup classmateWorkgroup) {
		JSONObject classmateUserInfo = new JSONObject();

		try {
			classmateUserInfo.put("workgroupId", classmateWorkgroup.getId());
			String userNames = getUserNamesFromWorkgroup(classmateWorkgroup);

			classmateUserInfo.put("userName", userNames);

			//check that there is a period
			if (classmateWorkgroup.getPeriod() != null) {
				classmateUserInfo.put("periodId", classmateWorkgroup.getPeriod().getId());
				classmateUserInfo.put("periodName", classmateWorkgroup.getPeriod().getName());

				//add the student ids into the classmateUserInfo JSONObject
				JSONArray studentIds = getStudentIdsFromWorkgroup(classmateWorkgroup);
				classmateUserInfo.put("userIds", studentIds);
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}

		return classmateUserInfo;
	}
}
