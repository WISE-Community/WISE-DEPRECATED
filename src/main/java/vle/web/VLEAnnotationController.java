/**
 * 
 */
package vle.web;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.Arrays;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Vector;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import utils.SecurityUtils;
import vle.domain.annotation.Annotation;
import vle.domain.cRater.CRaterRequest;
import vle.domain.node.Node;
import vle.domain.peerreview.PeerReviewWork;
import vle.domain.user.UserInfo;
import vle.domain.webservice.crater.CRaterHttpClient;
import vle.domain.work.StepWork;

/**
 * Controllers for handling Annotation GET and POST 
 * @author hirokiterashima
 * @author geoffreykwan
 */
public class VLEAnnotationController extends HttpServlet {

	private static final long serialVersionUID = 1L;
	
	private boolean standAlone = true;
	
	private boolean modeRetrieved = false;

	public void doPost(HttpServletRequest request,
			HttpServletResponse response)
	throws ServletException, IOException {
		
		/* make sure that this request is authenticated through the portal before proceeding */
		if (SecurityUtils.isPortalMode(request) && !SecurityUtils.isAuthenticated(request)) {
			/* not authenticated send not authorized status */
			response.sendError(HttpServletResponse.SC_FORBIDDEN);
			return;
		}

		doPostJSON(request, response);
    }
	
	public void doGet(HttpServletRequest request,
			HttpServletResponse response)
	throws ServletException, IOException {
		/* make sure that this request is authenticated through the portal before proceeding */
		if (SecurityUtils.isPortalMode(request) && !SecurityUtils.isAuthenticated(request)) {
			/* not authenticated send not authorized status */
			response.sendError(HttpServletResponse.SC_FORBIDDEN);
			return;
		}
		
		doGetJSON(request, response);
    }
	
	/**
	 * Handle GETing of Annotations.
	 * This includes GETing CRater Annotations, which involves POSTing to the
	 * CRater server (if needed).
	 * @param request
	 * @param response
	 * @throws ServletException
	 * @throws IOException
	 */
	@SuppressWarnings("unchecked")
	public void doGetJSON(HttpServletRequest request,
			HttpServletResponse response)
	throws ServletException, IOException {
		String requestedType = request.getParameter("type");
		String fromWorkgroupIdStr = request.getParameter("fromWorkgroup");
		String fromWorkgroupIdsStr = request.getParameter("fromWorkgroups");
		String toWorkgroupIdStr = request.getParameter("toWorkgroup");
		String runId = request.getParameter("runId");
		String stepWorkIdStr = request.getParameter("stepWorkId");
		String isStudentStr = request.getParameter("isStudent");
		String annotationType = request.getParameter("annotationType");
		String nodeStateIdStr = request.getParameter("nodeStateId");
		
		String cRaterScoringUrl = (String) request.getAttribute("cRaterScoringUrl");
		String cRaterClientId = (String) request.getAttribute("cRaterClientId");
		
		//this is only used when students retrieve flags
		Vector<JSONObject> flaggedAnnotationsList = new Vector<JSONObject>();
		
		//used to hold classmate workgroup ids to period ids
		HashMap<Long, Long> classmateWorkgroupIdToPeriodIdMap = new HashMap<Long, Long>();
		
		Long periodId = null;
		
		Long longRunId = null;
		if(runId != null) {
			longRunId = Long.parseLong(runId);			
		}
		
		Long stepWorkId = null;
		if(stepWorkIdStr != null) {
			stepWorkId = Long.parseLong(stepWorkIdStr);
		}
		
		boolean isStudent = false;
		if(isStudentStr != null) {
			isStudent = Boolean.parseBoolean(isStudentStr);
		}
		
		Long nodeStateId = null;
		if(nodeStateIdStr != null) {
			nodeStateId = Long.parseLong(nodeStateIdStr);
		}
		
		/*
		 * retrieval of periods is only required when students request flagged work
		 * because we only want students to see flagged work from their own period
		 */
		if((requestedType.equals("flag") || requestedType.equals("inappropriateFlag")) && isStudent) {
			try {
				//get the signed in student's user info and period id
				String myUserInfoString = (String) request.getAttribute("myUserInfo");
				JSONObject myUserInfo = new JSONObject(myUserInfoString);
				periodId = myUserInfo.getLong("periodId");
				
				//get the classmate user infos
				String classmateUserInfosString = (String) request.getAttribute("classmateUserInfos");
				JSONArray classmateUserInfos = new JSONArray(classmateUserInfosString);
				
				//loop through all the classmate user infos
				for(int x=0; x<classmateUserInfos.length(); x++) {
					//get a classmate user info
					JSONObject classmateUserInfo = classmateUserInfos.getJSONObject(x);
					
					//get the workgroup id and period id of the classmate
					long classmateWorkgroupId = classmateUserInfo.getLong("workgroupId");
					long classmatePeriodId = classmateUserInfo.getLong("periodId");
					
					//add the classmate workgroup id to period id entry into the map
					classmateWorkgroupIdToPeriodIdMap.put(classmateWorkgroupId, classmatePeriodId);
				}
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		
		// if requestedType is null, return all annotations
		List<Annotation> annotationList = null;
		Annotation annotation = null;
		if (requestedType == null || 
				(requestedType.equals("annotation") && !"cRater".equals(annotationType) && !"run".equals(annotationType)) ) {
			if(fromWorkgroupIdStr != null && stepWorkId != null) {
				//user is requesting an annotation they wrote themselves for a specific stepWork
				UserInfo fromWorkgroup = UserInfo.getByWorkgroupId(new Long(fromWorkgroupIdStr));
				StepWork stepWork = (StepWork) StepWork.getById(stepWorkId, StepWork.class);
				annotation = Annotation.getByUserInfoAndStepWork(fromWorkgroup, stepWork, null);
			} else if(fromWorkgroupIdsStr != null && toWorkgroupIdStr != null) {
				/*
				 * user is requesting all annotations to toWorkgroup and from any fromWorkgroup
				 * in the list of fromWorkgroups
				 */
				UserInfo toWorkgroup = UserInfo.getOrCreateByWorkgroupId(new Long(toWorkgroupIdStr));
				
				//split the fromWorkgroups
				String[] split = fromWorkgroupIdsStr.split(",");
				
				//create a String List out of the fromWorkgroups
				List<String> fromWorkgroupIds = Arrays.asList(split);
				
				//get the UserInfo objects for the fromWorkgroups
				List<UserInfo> fromWorkgroups = UserInfo.getByWorkgroupIds(fromWorkgroupIds);
				
				//get all the annotations that match
				annotationList = Annotation.getByFromWorkgroupsAndToWorkgroup(fromWorkgroups, toWorkgroup, Annotation.class);
				
				// also get CRater annotations
				annotationList.addAll(Annotation.getByToUserType(toWorkgroup, "cRater"));
			} else if (fromWorkgroupIdStr != null || toWorkgroupIdStr != null) {
				UserInfo fromWorkgroup = null;
				UserInfo toWorkgroup = null;
				if (fromWorkgroupIdStr != null) {
					fromWorkgroup = UserInfo.getByWorkgroupId(new Long(fromWorkgroupIdStr));
				}
				if (toWorkgroupIdStr != null) {
					toWorkgroup = UserInfo.getByWorkgroupId(new Long(toWorkgroupIdStr));
				}
				annotationList = Annotation.getByFromWorkgroupAndToWorkgroup(fromWorkgroup, toWorkgroup, Annotation.class);
			} else if(runId != null) {
				//get all the annotations for the run id
				annotationList = (List<Annotation>) Annotation.getByRunId(longRunId, Annotation.class);
			} else {
				annotationList = (List<Annotation>) Annotation.getList(Annotation.class);
			}
			
		} else if (requestedType.equals("flag") || requestedType.equals("inappropriateFlag")) {
			/*
			 * get the flags based on the parameters that were passed in the request.
			 * this will return the flag annotations ordered from oldest to newest
			 */
	    	annotationList = Annotation.getByParamMap(request.getParameterMap());
		} else if ("run".equals(annotationType)) {
			//split the fromWorkgroups
			String[] split = fromWorkgroupIdsStr.split(",");
			
			//create a String List out of the fromWorkgroups
			List<String> fromWorkgroupIds = Arrays.asList(split);
			
			//get the UserInfo objects for the fromWorkgroups
			List<UserInfo> fromWorkgroups = UserInfo.getByWorkgroupIds(fromWorkgroupIds);

			UserInfo toWorkgroup = null;			
			if (toWorkgroupIdStr != null) {
				toWorkgroup = UserInfo.getByWorkgroupId(new Long(toWorkgroupIdStr));
			}
			annotationList = Annotation.getByFromUserToUserType(fromWorkgroups, toWorkgroup, annotationType);
		}
		
		// handle request for cRater annotation
		if ("annotation".equals(requestedType) && "cRater".equals(annotationType)) {
			annotation = getCRaterAnnotation(nodeStateId, runId, stepWorkId,
					annotationType, cRaterScoringUrl, cRaterClientId);
		} 
		

		JSONObject annotationsJSONObj = null;
		if(annotationList != null) {
			//a list of annotations will be returned
			
			annotationsJSONObj = new JSONObject();  // all annotations
			
			/*
			 * loop through all the annotations, the annotations are ordered
			 * from oldest to newest
			 */
			for (Annotation annotationObj : annotationList) {
				try {
					//get an annotation
					
					JSONObject dataJSONObj = new JSONObject(annotationObj.getData());
					
					//get the annotation type
					String tempAnnotationType = annotationObj.getType();
					
					//add the postTime
					dataJSONObj.put("postTime", annotationObj.getPostTime().getTime());
					
					/*
					 * if this is a student making the request we will add the stepWork data
					 * to each of the flags so they can see the work that was flagged
					 */
					if("flag".equals(requestedType) && isStudent) {
						//a student is requesting the flagged work
						
						//check if the annotation is a flag annotation
						if("flag".equals(tempAnnotationType)) {
							//the annotation is a flag annotation
							
							//get the stepWorkId of the work that was flagged
							String flagStepWorkId = dataJSONObj.getString("stepWorkId");
							
							//get the StepWork object
							StepWork flagStepWork = StepWork.getByStepWorkId(new Long(flagStepWorkId));
							
							//get the user info of the work that was flagged
							UserInfo flaggedWorkUserInfo = flagStepWork.getUserInfo();
							
							//get the workgroup id of the work that was flagged
							Long flaggedWorkgroupId = flaggedWorkUserInfo.getWorkgroupId();
							
							//get the period id of the work that was flagged
							Long flaggedPeriodId = classmateWorkgroupIdToPeriodIdMap.get(flaggedWorkgroupId);
							
							//check that the period of the flagged work is the same period that the signed in user is in
							if(periodId != null && flaggedPeriodId != null && periodId.equals(flaggedPeriodId)) {

								//get the data
								JSONObject flagStepWorkData = new JSONObject(flagStepWork.getData());
								
								//check if the flag value is set to "flagged" as opposed to "unflagged"
								if(dataJSONObj.has("value") && dataJSONObj.getString("value").equals("flagged")) {
									
									//add the data to the flag JSON object
									dataJSONObj.put("data", flagStepWorkData);
									
									//put the flag object into our list
									flaggedAnnotationsList.add(dataJSONObj);
								} else {
									//remove the flag from the list because it was unflagged

									/*
									 * loop through all the flagged annotations we have already obtained
									 * to remove the annotation that was unflagged
									 */
									Iterator<JSONObject> flaggedAnnotationsIterator = flaggedAnnotationsList.iterator();
									while(flaggedAnnotationsIterator.hasNext()) {
										//get an annotation
										JSONObject nextFlaggedAnnotation = flaggedAnnotationsIterator.next();
										
										//check if the annotation fields match
										if(nextFlaggedAnnotation.has("toWorkgroup") && dataJSONObj.has("toWorkgroup") && nextFlaggedAnnotation.getString("toWorkgroup").equals(dataJSONObj.getString("toWorkgroup")) &&
												nextFlaggedAnnotation.has("fromWorkgroup") && dataJSONObj.has("fromWorkgroup") && nextFlaggedAnnotation.getString("fromWorkgroup").equals(dataJSONObj.getString("fromWorkgroup")) &&
												nextFlaggedAnnotation.has("nodeId") && dataJSONObj.has("nodeId") && nextFlaggedAnnotation.getString("nodeId").equals(dataJSONObj.getString("nodeId")) &&
												nextFlaggedAnnotation.has("stepWorkId") && dataJSONObj.has("stepWorkId") && nextFlaggedAnnotation.getString("stepWorkId").equals(dataJSONObj.getString("stepWorkId")) &&
												nextFlaggedAnnotation.has("runId") && dataJSONObj.has("runId") && nextFlaggedAnnotation.getString("runId").equals(dataJSONObj.getString("runId"))) {
											flaggedAnnotationsIterator.remove();
										}
									}
								}
							}
						}
					} else {
						//add the annotation to the JSON obj we will return
						annotationsJSONObj.append("annotationsArray", dataJSONObj);
					}
				} catch (JSONException e) {
					response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "error retrieving annotations");
					e.printStackTrace();
				}
			}
			
			/*
			 * the student is requesting the flags, we will now insert the json flag annotation
			 * objects into the annotationsJSONObj that will be returned as a response to the
			 * user
			 */
			if((requestedType.equals("flag") || requestedType.equals("inappropriateFlag")) && isStudent) {
				//get all the stepwork ids that were flagged

				//loop through all the flag annotations
				for(JSONObject flagAnnotationDataJSONObj : flaggedAnnotationsList) {
					try {
						//get the run id, node id, and student id
						String flaggedRunId = flagAnnotationDataJSONObj.getString("runId");
						String flaggedNodeId = flagAnnotationDataJSONObj.getString("nodeId");
						String flaggedToWorkgroup = flagAnnotationDataJSONObj.getString("toWorkgroup");
						
						//get the Node and UserInfo objects
						Node node = Node.getByNodeIdAndRunId(flaggedNodeId, flaggedRunId);
						UserInfo studentWorkgroup = UserInfo.getByWorkgroupId(new Long(flaggedToWorkgroup));
						
						/*
						 * get the step works the student did for the node. the list will be
						 * ordered from newest to oldest
						 */
						List<StepWork> stepWorks = StepWork.getByUserInfoAndNode(studentWorkgroup, node);
						
						JSONObject latestStepWorkDataJSONObj = null;
						
						//loop through all the step works the student did
						for(int x=0; x<stepWorks.size(); x++) {
							//get a step work
							StepWork stepWork = stepWorks.get(x);
							
							//get the json data from the step work
							String stepWorkData = stepWork.getData();
							
							//remember the newest step work data
							latestStepWorkDataJSONObj = new JSONObject(stepWorkData);
							
							//get the node states
							JSONArray nodeStates = latestStepWorkDataJSONObj.getJSONArray("nodeStates");
							
							//check if the node states is empty
							if(nodeStates.length() > 0) {
								/*
								 * node states is not empty so we have found the newest
								 * step work that contains actual work  
								 */
								break;
							}
						}
						
						//check if we found any step work data
						if(latestStepWorkDataJSONObj != null) {
							//put the data into the flag annotation object
							flagAnnotationDataJSONObj.put("data", latestStepWorkDataJSONObj);
							
							//put the flag object into the annotations array
							annotationsJSONObj.append("annotationsArray", flagAnnotationDataJSONObj);						
						}
					} catch (JSONException e) {
						e.printStackTrace();
					}
				}
			}
		} else if(annotation != null) { 
			try {
				//only one annotation will be returned
				annotationsJSONObj = new JSONObject(annotation.getData());
				
				//add the postTime
				annotationsJSONObj.put("postTime", annotation.getPostTime().getTime());
			} catch (JSONException e) {
				response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "error retrieving annotations");
				e.printStackTrace();
			}
		}

		if(annotationsJSONObj != null) {
			response.getWriter().write(annotationsJSONObj.toString());	
		} else {
			// there was an error retrieving the annotation
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR,"error retrieving annotations");
		}
    }

	/**
	 * Returns a CRater Annotation based on parameters, if exists. If not, makes a request to the 
	 * CRater server to get automated feedback and saves it as an Annotation.
	 * 
	 * Also updates/appends to an already-existing CRater Annotation if needed.
	 * @param request
	 * @param runId
	 * @param stepWorkIdStr
	 * @param annotationType
	 * @param cRaterScoringUrl
	 * @param cRaterClientId
	 * @param stepWorkId
	 * @return CRater annotation for the specified stepwork, or null if there was an error getting the CRater response
	 */
	public static Annotation getCRaterAnnotation(Long nodeStateId,
			String runId, Long stepWorkId, String annotationType,
			String cRaterScoringUrl, String cRaterClientId) {

		// for identifying this response when sending to the CRater server.
		String cRaterResponseId = stepWorkId.toString();
		
		Annotation annotation = null;
		
		//try to obtain the crater annotation if it exists
		annotation = Annotation.getCRaterAnnotationByStepWorkId(stepWorkId);
		
		if (annotation != null) {
			// cRater annotation already exists, we are either getting it if it also exists for the
			// specified nodestate or appending to the annotation array if it doesn't exist
			JSONObject nodeStateCRaterAnnotation = annotation.getAnnotationForNodeStateId(nodeStateId);
			if (nodeStateCRaterAnnotation != null) {
				// do nothing...this stepwork has already been scored and saved in the annotation
				// this will be returned to user later in this function							
			} else {
				//this node state does not have a crater annotation yet so we will make it and add it to the array of annotations
				try {
					// make a request to CRater
					StepWork stepWork = StepWork.getByStepWorkId(stepWorkId);
					JSONObject nodeStateByTimestamp = stepWork.getNodeStateByTimestamp(nodeStateId);
					
					String studentResponse = "";
					
					//get the response
					Object object = nodeStateByTimestamp.get("response");
					
					if(object instanceof JSONArray) {
						//the response is an array so we will obtain the first element
						studentResponse = ((JSONArray) object).getString(0);
					} else if(object instanceof String) {
						//the response is a string
						studentResponse = (String) object;
					}
					
					// get CRaterItemId from the StepWork and post to CRater server.
					String cRaterItemId = stepWork.getCRaterItemId();
					String cRaterResponseXML = CRaterHttpClient.getCRaterScoringResponse(cRaterScoringUrl, cRaterClientId, cRaterItemId, cRaterResponseId, studentResponse);
					
					if(cRaterResponseXML != null) {
						JSONObject cRaterResponseJSONObj = new JSONObject();

						JSONObject studentNodeStateResponse = stepWork.getNodeStateByTimestamp(nodeStateId);

						cRaterResponseJSONObj = 
								Annotation.createCRaterNodeStateAnnotation(
										nodeStateId, 
										CRaterHttpClient.getScore(cRaterResponseXML), 
										CRaterHttpClient.getConcepts(cRaterResponseXML), 
										studentNodeStateResponse, 
										cRaterResponseXML);

						// append the cRaterResponse to the existing annotation for this stepwork.
						annotation.appendNodeStateAnnotation(cRaterResponseJSONObj);
						annotation.saveOrUpdate();
						
						// update CRaterRequest table and mark this request as completed.
						CRaterRequest cRaterRequest = CRaterRequest.getByStepWorkIdNodeStateId(stepWork,nodeStateId);
						
						if(cRaterRequest != null) {
							Calendar cRaterRequestCompletedTime = Calendar.getInstance();
							cRaterRequest.setTimeCompleted(new Timestamp(cRaterRequestCompletedTime.getTimeInMillis()));
							cRaterRequest.setcRaterResponse(cRaterResponseXML);
							cRaterRequest.saveOrUpdate();						
						}
					}
				} catch (JSONException e) {
					e.printStackTrace();
				}

			}
		} else {
			// CRater annotation for this stepWork is null, so make a request to CRater to score the item.
			try {
				// make a request to CRater and insert new row in annotation.
				StepWork stepWork = StepWork.getByStepWorkId(stepWorkId);
				JSONObject nodeStateByTimestamp = stepWork.getNodeStateByTimestamp(nodeStateId);

				String studentResponse = "";
				
				//get the response
				Object object = nodeStateByTimestamp.get("response");
				
				if(object instanceof JSONArray) {
					//the response is an array so we will obtain the first element
					studentResponse = ((JSONArray) object).getString(0);
				} else if(object instanceof String) {
					//the response is a string
					studentResponse = (String) object;
				}
				
				// get CRaterItemId from the StepWork and post to CRater server.
				String cRaterItemId = stepWork.getCRaterItemId();
				String cRaterResponseXML = CRaterHttpClient.getCRaterScoringResponse(cRaterScoringUrl, cRaterClientId, cRaterItemId, cRaterResponseId, studentResponse);
				if (cRaterResponseXML != null) {
					if(cRaterResponseXML.contains("<error code=")) {
						//there was an error so we will not create Annotation or CRaterRequest objects
					} else {
						// create a new cRater annotation object based on CRater response
						Calendar now = Calendar.getInstance();
						Timestamp postTime = new Timestamp(now.getTimeInMillis());

						Node node = stepWork.getNode();
						String nodeId = node.getNodeId();
						String type = annotationType;

						Long workgroupId = stepWork.getUserInfo().getWorkgroupId();
						String toWorkgroup = workgroupId.toString();
						UserInfo toUser = UserInfo.getByWorkgroupId(workgroupId);
						UserInfo fromUser = null;
						String fromWorkgroup = "-1";  // default for auto-scored items.

						int score = CRaterHttpClient.getScore(cRaterResponseXML);
						String concepts = CRaterHttpClient.getConcepts(cRaterResponseXML);
						JSONObject studentResponseNodeState = stepWork.getNodeStateByTimestamp(nodeStateId);
						String cRaterResponse = cRaterResponseXML;

						JSONObject cRaterNodeStateAnnotation = 
								Annotation.createCRaterNodeStateAnnotation(nodeStateId, score, concepts, studentResponseNodeState, cRaterResponse);

						JSONArray nodeStateAnnotationArray = new JSONArray();
						nodeStateAnnotationArray.put(cRaterNodeStateAnnotation);

						JSONObject dataJSONObj = new JSONObject();
						try {
							dataJSONObj.put("runId", runId);
							dataJSONObj.put("nodeId", nodeId);
							dataJSONObj.put("toWorkgroup", toWorkgroup);
							dataJSONObj.put("fromWorkgroup", fromWorkgroup);
							dataJSONObj.put("stepWorkId", stepWorkId);
							dataJSONObj.put("type", type);
							dataJSONObj.put("value", nodeStateAnnotationArray);
						} catch (JSONException e) {
							e.printStackTrace();
						}

						annotation = new Annotation(stepWork, fromUser, toUser, new Long(runId), postTime, type, dataJSONObj.toString());
						annotation.saveOrUpdate();
						
						// update CRaterRequest table and mark this request as completed.
						CRaterRequest cRaterRequest = CRaterRequest.getByStepWorkIdNodeStateId(stepWork,nodeStateId);
						
						if(cRaterRequest != null) {
							Calendar cRaterRequestCompletedTime = Calendar.getInstance();
							cRaterRequest.setTimeCompleted(new Timestamp(cRaterRequestCompletedTime.getTimeInMillis()));
							cRaterRequest.setcRaterResponse(cRaterResponse);
							cRaterRequest.saveOrUpdate();						
						}
					}
				} else {
					// there was an error connecting to the CRater servlet
					// do nothing so this method will return null
					// increment fail count
					CRaterRequest cRaterRequest = CRaterRequest.getByStepWorkIdNodeStateId(stepWork, nodeStateId);
					
					if(cRaterRequest != null) {
						cRaterRequest.setFailCount(cRaterRequest.getFailCount()+1);
						cRaterRequest.saveOrUpdate();						
					}
				}
			} catch (JSONException e1) {
				e1.printStackTrace();
			}
		}

		return annotation;
	}

	/**
	 * Handles POST requests for annotations using JSON data storage
	 * @param request
	 * @param response
	 * @throws IOException
	 */
	private void doPostJSON(HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		//obtain the parameters
		String runId = request.getParameter("runId");
		String nodeId = request.getParameter("nodeId");
		String toWorkgroup = request.getParameter("toWorkgroup");
		String fromWorkgroup = request.getParameter("fromWorkgroup");
		String type = request.getParameter("annotationType");
		String value = request.getParameter("value");
		String stepWorkId = request.getParameter("stepWorkId");
		String action = request.getParameter("action");
		String periodId = request.getParameter("periodId");

		Calendar now = Calendar.getInstance();
		Timestamp postTime = new Timestamp(now.getTimeInMillis());
		StepWork stepWork = null;
		
		if(stepWorkId != null) {
			stepWork = (StepWork) StepWork.getById(new Long(stepWorkId), StepWork.class);
		}
		
		UserInfo fromUserInfo = UserInfo.getOrCreateByWorkgroupId(new Long(fromWorkgroup));
		UserInfo toUserInfo = UserInfo.getOrCreateByWorkgroupId(new Long(toWorkgroup));

		JSONObject annotationEntryJSONObj = new JSONObject();
		try {
			annotationEntryJSONObj.put("runId", runId);
			annotationEntryJSONObj.put("nodeId", nodeId);
			annotationEntryJSONObj.put("toWorkgroup", toWorkgroup);
			annotationEntryJSONObj.put("fromWorkgroup", fromWorkgroup);
			annotationEntryJSONObj.put("stepWorkId", stepWorkId);
			annotationEntryJSONObj.put("type", type);
			
			try {
				JSONObject valueJSONObject = new JSONObject(value);
				annotationEntryJSONObj.put("value", valueJSONObject);
			} catch (JSONException e1) {
				//e1.printStackTrace();
				annotationEntryJSONObj.put("value", value);
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		Annotation annotation = Annotation.getByFromUserInfoToUserInfoStepWorkType(fromUserInfo, toUserInfo, stepWork, type);

		if(annotation == null) {
			//the annotation was not found so we will create it
			annotation = new Annotation(type);
			annotation.setFromUser(fromUserInfo);
			if (stepWork != null) {
				annotation.setToUser(stepWork.getUserInfo());
			} else {
				annotation.setToUser(toUserInfo);				
			}
			annotation.setStepWork(stepWork);
		}
		
		//update the post time
		annotation.setPostTime(postTime);
		
		//update the data
		annotation.setData(annotationEntryJSONObj.toString());
		
		if(runId != null) {
			//set the run id
			annotation.setRunId(Long.parseLong(runId));
		}
		
		//propagate the row/object to the table
		annotation.saveOrUpdate();
		
		//check if this is a peer review annotation
		if(action != null && action.equals("peerReviewAnnotate")) {
			//set the annotation into the peerreviewwork table
			PeerReviewWork.setPeerReviewAnnotation(new Long(runId), new Long(periodId), stepWork.getNode(), stepWork, fromUserInfo, annotation);
		}
		
		response.getWriter().print(postTime.getTime());
	}

}
