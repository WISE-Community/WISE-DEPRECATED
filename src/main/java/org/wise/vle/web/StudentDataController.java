package org.wise.vle.web;

import java.io.File;
import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.List;
import java.util.Properties;
import java.util.Set;
import java.util.Vector;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.module.impl.CurnitGetCurnitUrlVisitor;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.vle.VLEService;
import org.wise.portal.service.workgroup.WISEWorkgroupService;
import org.wise.vle.domain.cRater.CRaterRequest;
import org.wise.vle.domain.node.Node;
import org.wise.vle.domain.peerreview.PeerReviewWork;
import org.wise.vle.domain.project.Project;
import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.work.StepWork;
import org.wise.vle.domain.work.StepWorkCache;
import org.wise.vle.utils.SecurityUtils;
import org.wise.vle.utils.VLEDataUtils;

public class StudentDataController extends AbstractController {

	private static final long serialVersionUID = 1L;

	private static boolean DEBUG = false;

	private boolean standAlone = true;

	private VLEService vleService;
	
	private RunService runService;
	
	private static WISEWorkgroupService workgroupService;
	
	private Properties wiseProperties;
	
	// max size for all nodes allowed to have default student work size, in bytes. Default:  50K=51200 bytes 
	private int studentMaxWorkSizeDefault = 51200;

	// max size for all nodes allowed to have large student work size, in bytes. Default: 250K=256000 bytes
	private int studentMaxWorkSizeLarge = 256000;

	private ArrayList<String> nodesWithLargeStudentWork = null;
	
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request, HttpServletResponse response) throws Exception {
		if (request.getMethod() == AbstractController.METHOD_GET) {
			return doGet(request, response);
		} else if (request.getMethod() == AbstractController.METHOD_POST) {
			return doPost(request, response);
		}
		return null;
	}

	public ModelAndView doGet(HttpServletRequest request,
			HttpServletResponse response)
					throws ServletException, IOException {
		//get the signed in user
		User signedInUser = ControllerUtil.getSignedInUser();
		
		/*
		 * obtain the get parameters. there are two use cases at the moment.
		 * 1. only userId is provided (multiple userIds can be delimited by :)
		 * 		e.g. 139:143:155
		 * 2. only runId and nodeId are provided
		 */
		String userIdStr = request.getParameter("userId");  // these are actually workgroupId's in the portal, 
		// NOT the userId in the vle_database.
		// to convert to userId, see the mapping in userInfo table.
		String nodeId = request.getParameter("nodeId");
		String runIdStr = request.getParameter("runId");
		String type = request.getParameter("type");
		String nodeTypes = request.getParameter("nodeTypes");
		String nodeIds = request.getParameter("nodeIds");
		String getAllWorkStr = request.getParameter("getAllWork");
		String getRevisionsStr = request.getParameter("getRevisions");
		
		String periodString = request.getParameter("periodId");
		
		Long period = null;
		
		if(periodString != null) {
			period = Long.parseLong(periodString);	
		}
		
		if (userIdStr == null) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "get data: userId missing.");
			return null;
		}
		
		//the get request can be for multiple ids that are delimited by ':'
		String[] userIdArray = userIdStr.split(":");
		
		Long runId = null;
		if(runIdStr != null) {
			try {
				//get the run id as a Long
				runId = new Long(runIdStr);
			} catch(NumberFormatException e) {
				e.printStackTrace();
			}
		}
		
		Run run = null;
		if(runId != null) {
			try {
				//get the run object
				run = runService.retrieveById(runId);				
			} catch (ObjectNotFoundException e1) {
				e1.printStackTrace();
			}
		}
		
		boolean allowedAccess = false;
		
		/*
		 * teachers that are owners of the run can make a request
		 * students that are accessing their own work can make a request
		 * students that are accessing aggregate data for a step can make a request
		 */
		if(SecurityUtils.isTeacher(signedInUser) && SecurityUtils.isUserOwnerOfRun(signedInUser, runId)) {
			//the teacher is an owner or shared owner of the run so we will allow this request
			allowedAccess = true;
		} else if(SecurityUtils.isStudent(signedInUser) && SecurityUtils.isUserInRun(signedInUser, runId)) {
			//the user is a student
			
			if(type == null) {
				//the student is trying to access their own work
				
				Long workgroupId = null;
				
				try {
					//get the workgroup id
					workgroupId = new Long(userIdStr);
				} catch(NumberFormatException e) {
					
				}
				
				//check if the signed in user is really in the workgroup
				if(SecurityUtils.isUserInWorkgroup(signedInUser, workgroupId)) {
					//the signed in user is really in the workgroup so we will allow this request
					allowedAccess = true;
				}
			} else if(type.equals("brainstorm") || type.equals("aggregate")) {
				//the student is trying to access work from their classmates
				
				/*
				 * boolean value to keep track of whether all the workgroup ids
				 * that the user is trying to access work for is in the run.
				 * this will be set to false if we find a single workgroup id that
				 * is not in the run.
				 */
				boolean allWorkgroupIdsInRun = true;
				
				//loop through all the classmate workgroup ids
				for(int x=0; x<userIdArray.length; x++) {
					//get a workgroup id
					String classmateWorkgroupIdString = userIdArray[x];

					Long classmateWorkgroupId = null;
					try {
						classmateWorkgroupId = new Long(classmateWorkgroupIdString);					
					} catch(NumberFormatException e) {
						
					}
					
					//check if the workgroup id is in the run
					if(!SecurityUtils.isWorkgroupInRun(classmateWorkgroupId, runId)) {
						//the workgroup id is not in the run
						allWorkgroupIdsInRun = false;
						break;
					}
				}
				
				//only allow access if all the workgroup ids are in the run
				if(allWorkgroupIdsInRun) {
					allowedAccess = true;
				}
			}
		}
		
		if(!allowedAccess) {
			//the user is not allowed to make this request
			response.sendError(HttpServletResponse.SC_FORBIDDEN);
			return null;
		}
		
		boolean useCachedWork = true;
		if (request.getParameter("useCachedWork") != null) {
			useCachedWork = Boolean.valueOf(request.getParameter("useCachedWork"));
		}

		/* set headers so that browsers don't cache the data (due to ie problem */
		response.setHeader("Pragma", "no-cache");
		response.setHeader("Cache-Control", "no-cache");
		response.setDateHeader("Expires", 0);

		// override userIdStr if user is requesting for aggregate and showAllStudents is requested
		if ("aggregate".equals(type) && Boolean.parseBoolean(request.getParameter("allStudents"))) {
			// request for all students work in run. lookup workgroups in run and construct workgroupIdString
			String workgroupIdStr = "";
			try {
				Set<Workgroup> workgroups = getRunService().getWorkgroups(runId);
				for (Workgroup workgroup : workgroups) {
					workgroupIdStr += workgroup.getId() + ":";
				}
				request.setAttribute("userId", workgroupIdStr);
				
				userIdStr = workgroupIdStr;
			} catch (ObjectNotFoundException e) {
				
			}	
		}

		//whether to get the work that has empty states
		boolean getAllWork = false;

		//whether to get the latest revision or all revisions with nodestates
		boolean getRevisions = true;

		if(DEBUG) {
			System.out.println("userIdStr: " + userIdStr);
			System.out.println("nodeId: " + nodeId);
			System.out.println("runId: " + runId);
			System.out.println("type: " + type);
			System.out.println("nodeTypes: " + nodeTypes);
			System.out.println("nodeIds: " + nodeIds);
		}

		if(getAllWorkStr != null) {
			getAllWork = Boolean.parseBoolean(getAllWorkStr);
		}

		if(getRevisionsStr != null) {
			getRevisions = Boolean.parseBoolean(getRevisionsStr);
		}

		//the list that contains the types of nodes we want to return
		List<String> nodeTypesList = null;

		if(nodeTypes != null) {
			//break the nodeTypes parameter into an array
			String[] nodeTypesArray = nodeTypes.split(":");

			//create a list that will contain all the node types we want
			nodeTypesList = Arrays.asList(nodeTypesArray);
		}

		//the list that will contain the Node objects we want
		List<Node> nodeList = new ArrayList<Node>();
		if(nodeIds != null) {
			//split up the nodeIds which are delimited by :
			String[] nodeIdsArray = nodeIds.split(":");

			//loop through the node ids
			for(int x=0; x<nodeIdsArray.length; x++) {
				//obtain a handle on the Node with the node id
				Node tempNode = vleService.getNodeByNodeIdAndRunId(nodeIdsArray[x], runIdStr);

				if(tempNode != null) {
					//add the Node to our list
					nodeList.add(tempNode);					
				}
			}
		}

		// If we're retrieving data to be displayed for aggregate view, ensure that nodeIds are passed in
		// and that we can access students' work for those nodes.
		if ("aggregate".equals(type)) {
			if (nodeList.isEmpty()) {
				// node to aggregate from does not exist. exit.
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, "get data node list is empty for aggregrate type");
				return null;
			}
			// now make sure that we can access students' work for all the nodes in the nodeList.

			//get the path to the project on the server
			String curriculumBaseDir = getWiseProperties().getProperty("curriculum_base_dir");
			String rawProjectUrl = (String) run.getProject().getCurnit().accept(new CurnitGetCurnitUrlVisitor());
			String projectPath = curriculumBaseDir + rawProjectUrl;

			File projectFile = new File(projectPath); // create a file handle to the project file
			Project project = new Project(projectFile); // create a Project object so we can easily get info about the project.

			boolean nodeWorkAccessibleForAggregate = true;
			for (Node nodeToCheck : nodeList) {
				// make sure that we can get the student work for all of the nodes that were requested to be aggregated
				nodeWorkAccessibleForAggregate &= project.isNodeAggregatable(nodeToCheck);
			}
			if (!nodeWorkAccessibleForAggregate) {
				// we cannot get data from at least one node in the nodeList. throw an error and exit.
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, "specified node is allowed for aggregation");
				return null;
			}
		}

		try {
			//this case is when userId is passed in as a GET argument
			// this is currently only being used for brainstorm steps and aggregate steps

			if(nodeId != null && !nodeId.equals("")) {
				/*
				 * return an array of node visits for a specific node id.
				 * this case uses userIdStr and nodeId.
				 */

				Node node = vleService.getNodeByNodeIdAndRunId(nodeId, runIdStr);

				List<UserInfo> userInfos = new ArrayList<UserInfo>();

				for(int x=0; x<userIdArray.length; x++) {
					UserInfo userInfo = vleService.getUserInfoByWorkgroupId(new Long(userIdArray[x]));

					if(userInfo != null) {
						userInfos.add(userInfo);
					}
				}

				List<StepWork> stepWorkList = vleService.getStepWorksByUserInfosAndNode(userInfos, node);

				JSONArray stepWorks = new JSONArray();

				for(StepWork stepWork : stepWorkList) {
					Long userId = stepWork.getUserInfo().getWorkgroupId();
					String dataString = stepWork.getData();
					JSONObject data = new JSONObject(dataString);
					data.put("visitPostTime", stepWork.getPostTime());
					String stepWorkId = stepWork.getId().toString();

					/* add the duplicateId if one is found for this stepWork */
					if(stepWork.getDuplicateId() != null && !stepWork.getDuplicateId().equals("")){
						data.put("duplicateId", stepWork.getDuplicateId());
					}

					JSONObject userIdAndData = new JSONObject();
					userIdAndData.put("userId", userId);
					userIdAndData.put("data", data);
					userIdAndData.put("stepWorkId", stepWorkId);

					stepWorks.put(userIdAndData);
				}

				response.getWriter().write(stepWorks.toString());
			} else {
				/*
				 * return an array of vle states
				 * this case uses userIdStr, runId, nodeTypes
				 */

				//multiple user ids were passed in
				if(userIdArray != null && userIdArray.length > 0){
					//the parent json object that will contain all the vle states
					JSONObject workgroupNodeVisitsJSON = new JSONObject();

					//retrieve data for each of the ids
					for(int x = 0; x < userIdArray.length; x++) {
						String userId = userIdArray[x];

						// obtain all the data for this student
						//UserInfo userInfo = UserInfo.getByWorkgroupId(new Long(userId));
						UserInfo userInfo = vleService.getUserInfoByWorkgroupId(new Long(userId));
						JSONObject nodeVisitsJSON = new JSONObject();  // to store nodeVisits for this student.

						// here we check if we have retrieved and cached this workgroup's data before.

						//Get student's last stepwork.
						StepWork latestWork = vleService.getLatestStepWorkByUserInfo(userInfo);
						if (latestWork != null && latestWork.getPostTime() != null) {
							// Get student's cachedWork, if exists.
							StepWorkCache cachedWork = vleService.getStepWorkCacheByUserInfoGetRevisions(userInfo, getRevisions);

							if (useCachedWork && cachedWork != null 
									&& cachedWork.getCacheTime() != null
									&& latestWork.getPostTime().before(cachedWork.getCacheTime())) {
								// lastPostTime happened before lastCachedTime, so cache is still valid.
								nodeVisitsJSON = new JSONObject(cachedWork.getData()); 
							} else {
								// lastPostTime happened before lastCachedTime or we never cached, so we need to retrieve student data
								if (nodeList.size() == 0) {
									nodeList = vleService.getNodesByRunId(runIdStr);
								}
								nodeVisitsJSON = getNodeVisitsForStudent(nodeList,nodeTypesList,userInfo, getAllWork, getRevisions);

								//save this data to cache for quicker access next time
								if (cachedWork == null) {
									cachedWork = new StepWorkCache();
									cachedWork.setUserInfo(userInfo);
								}
								Calendar now = Calendar.getInstance();
								Timestamp cacheTime = new Timestamp(now.getTimeInMillis());
								cachedWork.setCacheTime(cacheTime);
								cachedWork.setData(nodeVisitsJSON.toString());
								cachedWork.setGetRevisions(getRevisions);

								try {
									if (useCachedWork) {												
										vleService.saveStepWorkCache(cachedWork); // save cachedWork if we're in useCacheMode
									}
								} catch(Exception e) {
									/*
									 * when the student's cached work is too large, an exception will be thrown.
									 * if this exception is not caught, the student will not receive any of
									 * their student data.
									 */
								}

							}
						} else {
							/*
							 * the user does not have any work so we will just set the userName and
							 * userId and an empty visitedNodes array in the JSON for the user
							 */
							nodeVisitsJSON.put("userName", new Long(userId));
							nodeVisitsJSON.put("userId", new Long(userId));
							nodeVisitsJSON.put("visitedNodes", new JSONArray());
						}
						workgroupNodeVisitsJSON.append("vle_states", nodeVisitsJSON);
					}
					response.getWriter().write(workgroupNodeVisitsJSON.toString());
				}
			}

		} catch (IOException e) {
			e.printStackTrace();
		} catch (JSONException e) {
			e.printStackTrace();
		} catch (OutOfMemoryError e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
		}
		return null;
	}

	/**
	 * Returns nodeVisits for the specified student user as a JSON object.
	 * @param nodeList
	 * @param nodeTypesList
	 * @param userInfo
	 * @param getAllWork whether to get all the work for the steps even if the step
	 * has empty states
	 * 
	 * if there is a nodeTypesList and getAllWork is true, we will get all the work
	 * (including work with empty states) only for the node types in the nodeTypesList
	 * 
	 * @return
	 * @throws JSONException
	 */
	private JSONObject getNodeVisitsForStudent(List<Node> nodeList,
			List<String> nodeTypesList, UserInfo userInfo, boolean getAllWork, boolean getRevisions) throws JSONException {
		JSONObject nodeVisitsJSON = new JSONObject();
		nodeVisitsJSON.put("userName", userInfo.getWorkgroupId());
		nodeVisitsJSON.put("userId", userInfo.getWorkgroupId());

		//the list to hold the StepWork objects for this workgroup
		List<StepWork> stepWorkList = null;

		//check if a list of nodes were passed in
		if(nodeList != null && nodeList.size() > 0) {
			//get all the work for the user and that are for the nodes in the node list
			stepWorkList = vleService.getStepWorksByUserInfoAndNodeList(userInfo, nodeList);
		} else {
			//get all the work for the user
			stepWorkList = vleService.getStepWorksByUserInfo(userInfo);	
		}

		if(getRevisions) {
			//get all revisions

			//loop through all the rows that were returned, each row is a node_visit
			for(int x=0; x<stepWorkList.size(); x++) {
				StepWork stepWork = stepWorkList.get(x);

				String data = stepWork.getData();
				String stepWorkId = stepWork.getId().toString();

				//obtain the node type for the step work
				String nodeType = stepWork.getNode().getNodeType();

				/*
				 * check that the node type is one that we want if a list of
				 * desired node types was provided. if there is no list of
				 * node types, we will accept all node types
				 */
				if(nodeTypesList == null || (nodeTypesList != null && nodeTypesList.contains(nodeType))) {
					//the node type is accepted
					try {
						JSONObject nodeVisitJSON = new JSONObject(data);
						JSONArray nodeStates = (JSONArray) nodeVisitJSON.get("nodeStates");

						/*
						 * if there are no states for the visit, we will ignore it or if it
						 * is the last/latest visit we will add it so that the vle can
						 * load the last step the student was on.
						 * 
						 * if the node visit is for HtmlNode or OutsideUrlNode,
						 * we will add the node visit since those step types never have
						 * node states. 
						 */
						if (getAllWork || (nodeStates != null && nodeStates.length() > 0 || x == (stepWorkList.size() - 1)) ||
								("HtmlNode".equals(nodeType) || "OutsideUrlNode".equals(nodeType) || "IdeaBasketNode".equals(nodeType))) {
							/* add the duplicateId if one is found for this stepWork */
							if(stepWork.getDuplicateId() != null && !stepWork.getDuplicateId().equals("")){
								nodeVisitJSON.put("duplicateId", stepWork.getDuplicateId());
							}

							//add stepWorkId and visitPostTime attributes to the json obj
							nodeVisitJSON.put("stepWorkId", stepWorkId);
							nodeVisitJSON.put("visitPostTime", stepWork.getPostTime().getTime());
							nodeVisitsJSON.append("visitedNodes", nodeVisitJSON);
						}
					} catch (JSONException e) {
						e.printStackTrace();
					}								
				}
			}
		} else {
			//only get the latest revision

			Vector<String> stepsRetrieved = new Vector<String>(); 

			/*
			 * loop through the step work objects from latest to earliest
			 * because we are only looking for the latest revision for each
			 * step
			 */
			for(int x=stepWorkList.size() - 1; x>=0; x--) {
				StepWork stepWork = stepWorkList.get(x);

				String data = stepWork.getData();
				if (data == null || "".equals(data)) {
					// if for some reason data is empty (e.g. bug post), ignore this stepwork
					continue;
				}
				String stepWorkId = stepWork.getId().toString();

				//obtain the node type for the step work
				String nodeType = stepWork.getNode().getNodeType();

				//the id of the node
				String nodeId = stepWork.getNode().getNodeId();

				//check if we have retrieved work for this step already
				if(!stepsRetrieved.contains(nodeId)) {
					//we have not retrieved work for this step yet

					/*
					 * check that the node type is one that we want if a list of
					 * desired node types was provided. if there is no list of
					 * node types, we will accept all node types
					 */
					if(nodeTypesList == null || (nodeTypesList != null && nodeTypesList.contains(nodeType))) {
						//the node type is accepted

						JSONObject nodeVisitJSON = new JSONObject(data);
						JSONArray nodeStates = (JSONArray) nodeVisitJSON.get("nodeStates");

						/*
						 * check if there were any node states and only add the nodevisit if
						 * there were node states. if the node visit is for HtmlNode or OutsideUrlNode,
						 * we will add the node visit since those step types never have
						 * node states. 
						 */
						if(nodeStates != null && nodeStates.length() > 0 ||
								("HtmlNode".equals(nodeType) || "OutsideUrlNode".equals(nodeType) || "IdeaBasketNode".equals(nodeType))) {
							/* add the duplicateId if one is found for this stepWork */
							if(stepWork.getDuplicateId() != null && !stepWork.getDuplicateId().equals("")){
								nodeVisitJSON.put("duplicateId", stepWork.getDuplicateId());
							}

							//add stepWorkId and visitPostTime attributes to the json obj
							nodeVisitJSON.put("stepWorkId", stepWorkId);
							nodeVisitJSON.put("visitPostTime", stepWork.getPostTime().getTime());
							nodeVisitsJSON.append("visitedNodes", nodeVisitJSON);
							stepsRetrieved.add(nodeId);
						}
					}					
				}
			}
		}

		return nodeVisitsJSON;
	}

	
	
	public ModelAndView doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		studentMaxWorkSizeDefault = Integer.valueOf(wiseProperties.getProperty("student_max_work_size_default", "51200"));
		studentMaxWorkSizeLarge = Integer.valueOf(wiseProperties.getProperty("student_max_work_size_large", "256000"));	
		String nodes_with_large_student_work = wiseProperties.getProperty("nodes_with_large_student_work", "SVGDrawNode,Mysystem2Node");
		String[] nodes_with_large_student_work_array = nodes_with_large_student_work.split(",");
		nodesWithLargeStudentWork = new ArrayList<String>();
		for (int i=0; i < nodes_with_large_student_work_array.length; i++) {
			nodesWithLargeStudentWork.add(nodes_with_large_student_work_array[i]);
		}
		
		//get the signed in user
		User signedInUser = ControllerUtil.getSignedInUser();
		
		String runId = request.getParameter("runId");
		String userId = request.getParameter("userId");
		String periodId = request.getParameter("periodId");
		String data = request.getParameter("data");
		
		//obtain the id the represents the id in the step work table
		String stepWorkId = request.getParameter("id");
		
		
		if (runId == null || userId == null || data == null) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "post data: parameter(s) missing.");
			return null;
		}
		
		Long runIdLong = null;
		if(runId != null) {
			runIdLong = new Long(runId);
		}
		
		Long periodIdLong = null;
		if(periodId != null) {
			periodIdLong = new Long(periodId);
		}
		
		Long workgroupId = null;
		if(userId != null) {
			try {
				workgroupId = new Long(userId);
			} catch(NumberFormatException e) {
				
			}
		}
		
		boolean allowedAccess = false;
		
		/*
		 * teachers can not make a request
		 * students can make a request if they are in the run and in the workgroup
		 */
		if(SecurityUtils.isStudent(signedInUser) && SecurityUtils.isUserInRun(signedInUser, runIdLong) &&
				SecurityUtils.isUserInWorkgroup(signedInUser, workgroupId)) {
			//the student is in the run and the workgroup so we will allow the request
			allowedAccess = true;
		}
		
		if(!allowedAccess) {
			//the user is not allowed to make this request
			response.sendError(HttpServletResponse.SC_FORBIDDEN);
			return null;
		}
		
		UserInfo userInfo = (UserInfo) vleService.getUserInfoOrCreateByWorkgroupId(workgroupId);

		JSONObject nodeVisitJSON = null;
		try {
			nodeVisitJSON = new JSONObject(data);

			Calendar now = Calendar.getInstance();
			Timestamp postTime = new Timestamp(now.getTimeInMillis());

			String nodeId = VLEDataUtils.getNodeId(nodeVisitJSON);
			Timestamp startTime = new Timestamp(new Long(VLEDataUtils.getVisitStartTime(nodeVisitJSON)));
			
			String duplicateId = VLEDataUtils.getDuplicateId(nodeVisitJSON);
			
			//get the end time
			String visitEndTime = VLEDataUtils.getVisitEndTime(nodeVisitJSON);
			Timestamp endTime = null;
			
			//check that a non null end time was given to us
			if(visitEndTime != null && !visitEndTime.equals("null") && !visitEndTime.equals("")) {
				//create the timestamp
				endTime = new Timestamp(new Long(visitEndTime));
			}

			//obtain the node type from the json node visit
			String nodeType = VLEDataUtils.getNodeType(nodeVisitJSON);
			
			//get the node states array
			JSONArray nodeStates = VLEDataUtils.getNodeStates(nodeVisitJSON);
			
			//loop through all the node states
			for(int x=0; x<nodeStates.length(); x++) {
				//get an element in the node states array
				Object nodeStateObject = nodeStates.get(x);
				
				//check that the element in the array is a JSONObject
				if(!(nodeStateObject instanceof JSONObject)) {
					//the element in the array is not a JSONObject so we will respond with an error
					response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Element in nodeStates array is not an object");
					return null;
				}
			}
			
			// check if student's posted data size is under the limit of the specific node type.
			if (nodesWithLargeStudentWork.contains(nodeType)) {
				if (request.getContentLength() > studentMaxWorkSizeLarge) {  // posted data must not exceed STUDENT_MAX_WORK_SIZE_LARGE
					System.err.println("post data: too large (>"+studentMaxWorkSizeLarge+" bytes)");
					response.sendError(HttpServletResponse.SC_BAD_REQUEST, "post data: too large (>"+studentMaxWorkSizeLarge+" bytes)");
					return null;
				}
			} else {
				if (request.getContentLength() > studentMaxWorkSizeDefault) {  // posted data must not exceed STUDENT_MAX_WORK_SIZE_DEFAULT
					System.err.println("post data: too large (>"+studentMaxWorkSizeDefault+" bytes)");
					response.sendError(HttpServletResponse.SC_BAD_REQUEST, "post data: too large (>"+studentMaxWorkSizeDefault+" bytes)");
					return null;
				}
			}

			StepWork stepWork = null;
			
			// check to see if student has already saved this nodevisit.
			stepWork = vleService.getStepWorkByUserIdAndData(userInfo,nodeVisitJSON.toString());
			if (stepWork != null) {
				// this node visit has already been saved. return id and postTime and exit.
				//create a JSONObject to contain the step work id and post time
				JSONObject jsonResponse = new JSONObject();
				jsonResponse.put("id", stepWork.getId());
				if(endTime != null) {
					//end time is set so we can send back a post time
					if (stepWork.getPostTime() != null) {
						jsonResponse.put("visitPostTime", stepWork.getPostTime().getTime());
					}
				}
				//send back the json string with step work id and post time
				response.getWriter().print(jsonResponse.toString());
				return null;
			}
				
			//check if the step work id was passed in. if it was, then it's an update to a nodevisit.
			if(stepWorkId != null && !stepWorkId.equals("") && !stepWorkId.equals("undefined")) {
				//step work id was passed in so we will obtain the id in long format
				long stepWorkIdLong = Long.parseLong(stepWorkId);
				
				//obtain the StepWork with the given id
				stepWork = (StepWork) vleService.getStepWorkById(stepWorkIdLong);
			} else if(nodeType != null && nodeType !=""){
				//step work id was not passed in so we will create a new StepWork object
				stepWork = new StepWork();
			}

			Node node = getOrCreateNode(runId, nodeId, nodeType);
			
			if (stepWork != null && userInfo != null && node != null) {
				// set the fields of StepWork
				stepWork.setUserInfo(userInfo);
				stepWork.populateData(nodeVisitJSON);
				stepWork.setNode(node);
				stepWork.setPostTime(postTime);
				stepWork.setStartTime(startTime);
				stepWork.setEndTime(endTime);
				stepWork.setDuplicateId(duplicateId);
				vleService.saveStepWork(stepWork);
				
				//get the step work id so we can send it back to the client
				long newStepWorkId = stepWork.getId();
				
				//get the post time so we can send it back to the client
				long newPostTime = postTime.getTime();
				
				//create a JSONObject to contain the step work id and post time
				JSONObject jsonResponse = new JSONObject();
				jsonResponse.put("id", newStepWorkId);
				
				/*
				 * if the endtime is null it means this post was an intermediate
				 * post such as the ones brainstorm performs so we do not want
				 * to send back a post time in that case. when we send back a
				 * post time, it means the node visit is completed but if this
				 * is just an intermediate post we do not want to complete
				 * the visit because the user has not exited the step.
				 */
				if(endTime != null) {
					//end time is set so we can send back a post time
					jsonResponse.put("visitPostTime", newPostTime);
				}
				
				//get the first cRaterItemId if it exists in the POSTed NodeState
				// also check if isSubmit is true
				String cRaterItemId = null;
				String cRaterItemType = "CRATER";
				boolean isCRaterSubmit = false;
				try {
					if (nodeVisitJSON != null) {
						JSONArray nodeStateArray = nodeVisitJSON.getJSONArray("nodeStates");
						if (nodeStateArray != null) {
							if (nodeStateArray.length() > 0) {
								JSONObject nodeStateObj = nodeStateArray.getJSONObject(nodeStateArray.length()-1);
								
								if(nodeStateObj.has("cRaterItemId")) {
									cRaterItemId = nodeStateObj.getString("cRaterItemId");
									if (nodeStateObj.has("isCRaterSubmit")) {
										isCRaterSubmit = nodeStateObj.getBoolean("isCRaterSubmit");
									}
									if(nodeStateObj.has("cRaterItemType")) {
										cRaterItemType = nodeStateObj.getString("cRaterItemType");
									}																	
								}
							}
						}
					}
				} catch (JSONException e) {
					e.printStackTrace();
				}
				
				if(cRaterItemId != null) {
					// Send back the cRater item id to the student in the response
					// student VLE would get this cRaterItemId and make a GET to
					// VLEAnnotationController to get the CRater Annotation
					// Only send back cRaterItemId and isCRaterSubmit back if we haven't invoked CRater before for this nodeState
					long lastNodeStateTimestamp = stepWork.getLastNodeStateTimestamp();

					CRaterRequest cRaterRequestForLastNodeState = vleService.getCRaterRequestByStepWorkIdNodeStateId(stepWork, lastNodeStateTimestamp);
					if (cRaterRequestForLastNodeState == null) {
						jsonResponse.put("cRaterItemId", cRaterItemId);
						jsonResponse.put("cRaterItemType", cRaterItemType);
						jsonResponse.put("isCRaterSubmit", isCRaterSubmit);
						// also save a CRaterRequest in db for tracking if isCRaterSubmit is true
						if (isCRaterSubmit) {
							try {
								CRaterRequest cRR = new CRaterRequest(cRaterItemId, cRaterItemType, stepWork, new Long(lastNodeStateTimestamp), runIdLong);
								vleService.saveCRaterRequest(cRR);
							} catch (Exception cre) {
								// do nothing if there was an error, let continue
								cre.printStackTrace();
							}
						}
					}
				}
				
				try {
					//if this post is a peerReviewSubmit, add an entry into the peerreviewwork table
					if(VLEDataUtils.isSubmitForPeerReview(nodeVisitJSON)) {
						PeerReviewWork peerReviewWork = null;

						//see if the user has already submitted peer review work for this step
						peerReviewWork = vleService.getPeerReviewWorkByRunPeriodNodeWorkerUserInfo(runIdLong, periodIdLong, node, userInfo);
						
						if(peerReviewWork == null) {
							/*
							 * the user has not submitted peer review work for this step yet
							 * so we will create it
							 */
							peerReviewWork = new PeerReviewWork();
							peerReviewWork.setNode(node);
							peerReviewWork.setRunId(new Long(runId));
							peerReviewWork.setUserInfo(userInfo);
							peerReviewWork.setStepWork(stepWork);
							peerReviewWork.setPeriodId(periodIdLong);
							vleService.savePeerReviewWork(peerReviewWork);
						}
						
						//create an entry for the peerreviewgate table if one does not exist already
						vleService.getOrCreatePeerReviewGateByRunIdPeriodIdNodeId(runIdLong, periodIdLong, node);
					}
				} catch(JSONException e) {
					e.printStackTrace();
				}
				//send back the json string with step work id and post time
				response.getWriter().print(jsonResponse.toString());
			} else {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Error saving: " + nodeVisitJSON.toString());
			}
		} catch (JSONException e) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "malformed data");
			e.printStackTrace();
			return null;
		}
		return null;
	}

	/**
	 * Synchronized node creation/retrieval
	 * @param runId
	 * @param nodeId
	 * @param nodeType
	 * @return created/retrieved Node, or null
	 */
	private synchronized Node getOrCreateNode(String runId, String nodeId, String nodeType) {
		Node node = vleService.getNodeByNodeIdAndRunId(nodeId, runId);
		if (node == null && nodeId != null && runId != null && nodeType != null) {
			node = new Node();
			node.setNodeId(nodeId);
			node.setRunId(runId);
			node.setNodeType(nodeType);
			vleService.saveNode(node);
		}
		return node;
	}

	public VLEService getVleService() {
		return vleService;
	}

	public void setVleService(VLEService vleService) {
		this.vleService = vleService;
	}

	public RunService getRunService() {
		return runService;
	}

	public void setRunService(RunService runService) {
		this.runService = runService;
	}

	public Properties getWiseProperties() {
		return wiseProperties;
	}

	public void setWiseProperties(Properties wiseProperties) {
		this.wiseProperties = wiseProperties;
	}

	public static WISEWorkgroupService getWorkgroupService() {
		return workgroupService;
	}

	public static void setWorkgroupService(WISEWorkgroupService workgroupService) {
		StudentDataController.workgroupService = workgroupService;
	}

}
