/**
 * 
 */
package vle.web;

import java.io.File;
import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.List;
import java.util.Vector;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import utils.SecurityUtils;
import vle.VLEServlet;
import vle.domain.node.Node;
import vle.domain.project.Project;
import vle.domain.user.UserInfo;
import vle.domain.work.StepWork;
import vle.domain.work.StepWorkCache;

/**
 * Servlet for handling GETting of vle data
 * @author hirokiterashima
 * @author geoffreykwan
 * @author patricklawler
 */
public class VLEGetData extends VLEServlet {

	private static final long serialVersionUID = 1L;

	private static boolean DEBUG = false;

	private boolean standAlone = true;

	public void doGet(HttpServletRequest request,
			HttpServletResponse response)
					throws ServletException, IOException {

		boolean useCachedWork = true;
		if (request.getParameter("useCachedWork") != null) {
			useCachedWork = Boolean.valueOf(request.getParameter("useCachedWork"));
		}

		/* make sure that this request is authenticated through the portal before proceeding */
		if (SecurityUtils.isPortalMode(request) && !SecurityUtils.isAuthenticated(request)) {
			/* not authenticated send not authorized status */
			response.sendError(HttpServletResponse.SC_FORBIDDEN);
			return;
		}

		/* set headers so that browsers don't cache the data (due to ie problem */
		response.setHeader("Pragma", "no-cache");
		response.setHeader("Cache-Control", "no-cache");
		response.setDateHeader("Expires", 0);

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
		String runId = request.getParameter("runId");
		String type = request.getParameter("type");
		String nodeTypes = request.getParameter("nodeTypes");
		String nodeIds = request.getParameter("nodeIds");
		String getAllWorkStr = request.getParameter("getAllWork");
		String getRevisionsStr = request.getParameter("getRevisions");

		// override userIdStr if user is requesting for aggregate and showAllStudents is requested
		if ("aggregate".equals(type) && Boolean.parseBoolean(request.getParameter("allStudents"))) {
			userIdStr = (String) request.getAttribute("userId");  // user id for the entire run is passed in the attribute
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

		if (userIdStr == null) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "get data: userId missing.");
			return;
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
				Node tempNode = Node.getByNodeIdAndRunId(nodeIdsArray[x], runId);

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
				return;
			}
			// now make sure that we can access students' work for all the nodes in the nodeList.
			String projectPath = (String) request.getAttribute("projectPath"); 	// get the path of the project file on the server


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
				return;
			}
		}

		try {
			//this case is when userId is passed in as a GET argument
			// this is currently only being used for brainstorm steps and aggregate steps

			//the get request can be for multiple ids that are delimited by ':'
			String[] userIdArray = userIdStr.split(":");

			if(nodeId != null && !nodeId.equals("")) {
				/*
				 * return an array of node visits for a specific node id.
				 * this case uses userIdStr and nodeId.
				 */

				Node node = Node.getByNodeIdAndRunId(nodeId, runId);

				List<UserInfo> userInfos = new ArrayList<UserInfo>();

				for(int x=0; x<userIdArray.length; x++) {
					UserInfo userInfo = UserInfo.getByWorkgroupId(new Long(userIdArray[x]));

					if(userInfo != null) {
						userInfos.add(userInfo);
					}
				}

				List<StepWork> stepWorkList = StepWork.getByUserInfosAndNode(userInfos, node);

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
						UserInfo userInfo = UserInfo.getByWorkgroupId(new Long(userId));
						JSONObject nodeVisitsJSON = new JSONObject();  // to store nodeVisits for this student.

						// here we check if we have retrieved and cached this workgroup's data before.

						//Get student's last stepwork.
						StepWork latestWork = StepWork.getLatestByUserInfo(userInfo);
						if (latestWork != null && latestWork.getPostTime() != null) {
							// Get student's cachedWork, if exists.
							StepWorkCache cachedWork = StepWorkCache.getByUserInfoGetRevisions(userInfo, getRevisions);

							if (useCachedWork && cachedWork != null 
									&& cachedWork.getCacheTime() != null
									&& latestWork.getPostTime().before(cachedWork.getCacheTime())) {
								// lastPostTime happened before lastCachedTime, so cache is still valid.
								nodeVisitsJSON = new JSONObject(cachedWork.getData()); 
							} else {
								// lastPostTime happened before lastCachedTime or we never cached, so we need to retrieve student data
								if (nodeList.size() == 0) {
									nodeList = Node.getByRunId(runId);
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
										cachedWork.saveOrUpdate();  // save cachedWork if we're in useCacheMode
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
			stepWorkList = StepWork.getByUserInfoAndNodeList(userInfo, nodeList);
		} else {
			//get all the work for the user
			stepWorkList = StepWork.getByUserInfo(userInfo);	
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
}
