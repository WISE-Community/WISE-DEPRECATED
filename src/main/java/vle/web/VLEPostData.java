package vle.web;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Properties;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import utils.SecurityUtils;
import utils.VLEDataUtils;
import vle.VLEServlet;
import vle.domain.cRater.CRaterRequest;
import vle.domain.node.Node;
import vle.domain.peerreview.PeerReviewGate;
import vle.domain.peerreview.PeerReviewWork;
import vle.domain.user.UserInfo;
import vle.domain.work.StepWork;

/**
 * Servlet for handling POSTed vle data
 * @author hirokiterashima
 * @author geoffreykwan
 * @author patricklawler
 */
public class VLEPostData extends VLEServlet {

	private static final long serialVersionUID = 1L;
	
	private static Properties vleProperties = null;
	
	// max size for all nodes allowed to have default student work size, in bytes. Default:  50K=51200 bytes 
	private int studentMaxWorkSizeDefault = 51200;

	// max size for all nodes allowed to have large student work size, in bytes. Default: 250K=256000 bytes
	private int studentMaxWorkSizeLarge = 256000;

	private ArrayList<String> nodesWithLargeStudentWork = null;
	
	{
		try {
			// Read properties file.
			vleProperties = new Properties();
			vleProperties.load(getClass().getClassLoader().getResourceAsStream("vle.properties"));
			studentMaxWorkSizeDefault = Integer.valueOf(vleProperties.getProperty("student_max_work_size_default", "51200"));
			studentMaxWorkSizeLarge = Integer.valueOf(vleProperties.getProperty("student_max_work_size_large", "256000"));	
			String nodes_with_large_student_work = vleProperties.getProperty("nodes_with_large_student_work", "SVGDrawNode,Mysystem2Node");
			String[] nodes_with_large_student_work_array = nodes_with_large_student_work.split(",");
			nodesWithLargeStudentWork = new ArrayList<String>();
			for (int i=0; i < nodes_with_large_student_work_array.length; i++) {
				nodesWithLargeStudentWork.add(nodes_with_large_student_work_array[i]);
			}
		} catch (Exception e) {
			System.err.println("VLEPostData could not read in vleProperties file");
			e.printStackTrace();
		}
	}
	
	public void doPost(HttpServletRequest request,
			HttpServletResponse response)
	throws ServletException, IOException {
		/* make sure that this request is authenticated through the portal before proceeding */
		if (SecurityUtils.isPortalMode(request) && !SecurityUtils.isAuthenticated(request)) {
			/* not authenticated send not authorized status */
			response.sendError(HttpServletResponse.SC_FORBIDDEN);
			return;
		}

		String runId = request.getParameter("runId");
		String userId = request.getParameter("userId");
		String periodId = request.getParameter("periodId");
		String data = request.getParameter("data");
		
		//obtain the id the represents the id in the step work table
		String stepWorkId = request.getParameter("id");
		
		
		if (runId == null || userId == null || data == null) {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "post data: parameter(s) missing.");
			return;
		}
		
		Long runIdLong = null;
		if(runId != null) {
			runIdLong = new Long(runId);
		}
		
		Long periodIdLong = null;
		if(periodId != null) {
			periodIdLong = new Long(periodId);
		}
		
		UserInfo userInfo = (UserInfo) UserInfo.getOrCreateByWorkgroupId(new Long(userId));

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
					return;
				}
			}
			
			// check if student's posted data size is under the limit of the specific node type.
			if (nodesWithLargeStudentWork.contains(nodeType)) {
				if (request.getContentLength() > studentMaxWorkSizeLarge) {  // posted data must not exceed STUDENT_MAX_WORK_SIZE_LARGE
					System.err.println("post data: too large (>"+studentMaxWorkSizeLarge+" bytes)");
					response.sendError(HttpServletResponse.SC_BAD_REQUEST, "post data: too large (>"+studentMaxWorkSizeLarge+" bytes)");
					return;
				}
			} else {
				if (request.getContentLength() > studentMaxWorkSizeDefault) {  // posted data must not exceed STUDENT_MAX_WORK_SIZE_DEFAULT
					System.err.println("post data: too large (>"+studentMaxWorkSizeDefault+" bytes)");
					response.sendError(HttpServletResponse.SC_BAD_REQUEST, "post data: too large (>"+studentMaxWorkSizeDefault+" bytes)");
					return;
				}
			}

			StepWork stepWork = null;
			
			// check to see if student has already saved this nodevisit.
			stepWork = StepWork.getByUserIdAndData(userInfo,nodeVisitJSON.toString());
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
				return;
			}
				
			//check if the step work id was passed in. if it was, then it's an update to a nodevisit.
			if(stepWorkId != null && !stepWorkId.equals("") && !stepWorkId.equals("undefined")) {
				//step work id was passed in so we will obtain the id in long format
				long stepWorkIdLong = Long.parseLong(stepWorkId);
				
				//obtain the StepWork with the given id
				stepWork = (StepWork) StepWork.getById(stepWorkIdLong, StepWork.class);
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
				stepWork.saveOrUpdate();
				
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

					CRaterRequest cRaterRequestForLastNodeState = CRaterRequest.getByStepWorkIdNodeStateId(stepWork, lastNodeStateTimestamp);
					if (cRaterRequestForLastNodeState == null) {
						jsonResponse.put("cRaterItemId", cRaterItemId);
						jsonResponse.put("cRaterItemType", cRaterItemType);
						jsonResponse.put("isCRaterSubmit", isCRaterSubmit);
						// also save a CRaterRequest in db for tracking if isCRaterSubmit is true
						if (isCRaterSubmit) {
							try {
								CRaterRequest cRR = new CRaterRequest(cRaterItemId, cRaterItemType, stepWork, new Long(lastNodeStateTimestamp), runIdLong);
								cRR.saveOrUpdate();
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
						peerReviewWork = PeerReviewWork.getPeerReviewWorkByRunPeriodNodeWorkerUserInfo(runIdLong, periodIdLong, node, userInfo);
						
						if(peerReviewWork == null) {
							/*
							 * the user has not submitted peer review work for thie step yet
							 * so we will create it
							 */
							peerReviewWork = new PeerReviewWork();
							peerReviewWork.setNode(node);
							peerReviewWork.setRunId(new Long(runId));
							peerReviewWork.setUserInfo(userInfo);
							peerReviewWork.setStepWork(stepWork);
							peerReviewWork.setPeriodId(periodIdLong);
							peerReviewWork.saveOrUpdate();
						}
						
						//create an entry for the peerreviewgate table if one does not exist already
						PeerReviewGate.getOrCreateByRunIdPeriodIdNodeId(runIdLong, periodIdLong, node);
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
			return;
		}
	}

	/**
	 * Synchronized node creation/retrieval
	 * @param runId
	 * @param nodeId
	 * @param nodeType
	 * @return created/retrieved Node, or null
	 */
	private synchronized Node getOrCreateNode(String runId, String nodeId, String nodeType) {
		Node node = Node.getByNodeIdAndRunId(nodeId, runId);
		if (node == null && nodeId != null && runId != null && nodeType != null) {
			node = new Node();
			node.setNodeId(nodeId);
			node.setRunId(runId);
			node.setNodeType(nodeType);
			node.saveOrUpdate();
		}
		return node;
	}
}
