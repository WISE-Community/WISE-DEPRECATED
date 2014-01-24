package org.wise.vle.web;

import java.io.IOException;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Random;
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
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.vle.VLEService;
import org.wise.vle.domain.annotation.Annotation;
import org.wise.vle.domain.node.Node;
import org.wise.vle.domain.peerreview.PeerReviewWork;
import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.work.StepWork;
import org.wise.vle.utils.SecurityUtils;


/**
 * Controller for handling the peer review step
 * @author Geoffrey Kwan
 */
public class VLEPeerReviewController extends AbstractController {

	private static final long serialVersionUID = 1L;
	
	private VLEService vleService;
	
	private RunService runService;

	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		ModelAndView modelAndView = null;
		String requestMethod = request.getMethod();
		
		if(requestMethod == null) {
			
		} else if(requestMethod.equals(AbstractController.METHOD_GET)) {
			modelAndView = doGet(request, response);
		} else if(requestMethod.equals(AbstractController.METHOD_POST)) {
			modelAndView = doPost(request, response);
		}
		
		return modelAndView;
	}
	
	public ModelAndView doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		return doPostJSON(request, response);
	}

	public ModelAndView doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		return doGetJSON(request, response);
	}

	/**
	 * Handles the requesting of other student's work for phase 2
	 * of the peer review. Checks that the peer response is open
	 * before matching up students with another student's work. If
	 * the peer response is open, it will need to calculate which
	 * other student to match up with.
	 * This function also handles requesting of initial work
	 * for phase 3 of the peer review.
	 * @param request
	 * @param response
	 * @throws ServletException
	 * @throws IOException
	 */
	public ModelAndView doGetJSON(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		String action = request.getParameter("action");
		
		if(action.equals("studentRequest")) {
			handleStudentRequest(request, response);
		} else if(action.equals("teacherRequest")) {
			handleTeacherRequest(request, response);
		}
		
		return null;
	}

	/**
	 * Handles when the teacher is using the grading tool. This provides
	 * the data for the teacher when they visit the grading view of a
	 * peer review step so they can see the original work, review work,
	 * and revised work.
	 * @param request
	 * @param response
	 * @throws ServletException
	 * @throws IOException
	 */
	private void handleTeacherRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		//get the signed in user
		User signedInUser = ControllerUtil.getSignedInUser();
		//get the run id
		String runId = request.getParameter("runId");
		
		Long runIdLong = null;
		if(runId != null) {
			runIdLong = Long.parseLong(runId);
		}
		
		boolean allowedAccess = false;
		
		/*
		 * a teacher can make a request if they are the owner of the run
		 */
		if(SecurityUtils.isTeacher(signedInUser) && SecurityUtils.isUserOwnerOfRun(signedInUser, runIdLong)) {
			//the teacher is an owner or shared owner of the run so we will allow the request
			allowedAccess = true;
		}
		
		if(!allowedAccess) {
			//the user is not allowed to make this request
			response.sendError(HttpServletResponse.SC_FORBIDDEN);
			return;
		}
		
		//get all the peer review work for the run
		List<PeerReviewWork> peerReviewWorkList = vleService.getPeerReviewWorkByRun(runIdLong);
		
		//the JSON array that holds all the peer review work entries
		JSONArray peerReviewWorkJSONArray = new JSONArray();
		
		Iterator<PeerReviewWork> peerReviewWorkListIterator = peerReviewWorkList.iterator();
		
		//loop through each peer review work entry
		while(peerReviewWorkListIterator.hasNext()) {
			try {
				//get a peer review work entry
				PeerReviewWork peerReviewWork = peerReviewWorkListIterator.next();
				
				//create a JSON object to hold the data for this entry
				JSONObject peerReviewWorkJSONObject = new JSONObject();
				
				//set the values
				peerReviewWorkJSONObject.put("runId", peerReviewWork.getRunId());
				peerReviewWorkJSONObject.put("periodId", peerReviewWork.getPeriodId());
				peerReviewWorkJSONObject.put("nodeId", peerReviewWork.getNode().getNodeId());
				
				//get the user who wrote the work
				UserInfo userInfo = peerReviewWork.getUserInfo();
				
				//get the user who reviewed the work
				UserInfo reviewerUserInfo = peerReviewWork.getReviewerUserInfo();
				
				//get the work from the worker student
				StepWork stepWork = peerReviewWork.getStepWork();
				
				//get the review from the reviewer student
				Annotation annotation = peerReviewWork.getAnnotation();
				
				Long workgroupId = null;
				if(userInfo != null) {
					//get the workgroup id of the worker
					workgroupId = userInfo.getWorkgroupId();
				}
				peerReviewWorkJSONObject.put("workgroupId", workgroupId);
				
				Long reviewerWorkgroupId = null;
				if(reviewerUserInfo != null) {
					//get the workgroup id of the reviewer
					reviewerWorkgroupId = reviewerUserInfo.getWorkgroupId();
				}
				peerReviewWorkJSONObject.put("reviewerWorkgroupId", reviewerWorkgroupId);
				
				Object stepWorkData = JSONObject.NULL;
				if(stepWork != null) {
					//get the work the worker wrote
					stepWorkData = new JSONObject(stepWork.getData());
				}
				peerReviewWorkJSONObject.put("stepWork", stepWorkData);
				
				Object annotationData = JSONObject.NULL;
				if(annotation != null) {
					//get the annotation the reviewer wrote
					annotationData = new JSONObject(annotation.getData());
				}
				peerReviewWorkJSONObject.put("annotation", annotationData);
				
				//put the entry into the JSON array
				peerReviewWorkJSONArray.put(peerReviewWorkJSONObject);
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		
		//return the string version of the JSON array
		response.getWriter().print(peerReviewWorkJSONArray.toString());
	}
	
	/**
	 * Handles when the student goes to a peer review annotate or
	 * peer review revise step to retrieve classmate work to review
	 * or to retrieve classmate feedback/review so they can
	 * revise their work
	 * @param request
	 * @param response
	 * @throws ServletException
	 * @throws IOException
	 */
	private void handleStudentRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		//get the signed in user
		User signedInUser = ControllerUtil.getSignedInUser();
				
		//parameters to specify which node instance we are working with for peer review
		String runId = request.getParameter("runId");
		String workgroupId = request.getParameter("workgroupId");
		String periodId = request.getParameter("periodId");
		String nodeId = request.getParameter("nodeId");
		String type = request.getParameter("type");

		/*
		 * obtain Long and Integer values
		 */
		Long runIdLong = null;
		if(runId != null) {
			runIdLong = Long.parseLong(runId);
		}

		Long workgroupIdLong = null;
		if(runId != null) {
			workgroupIdLong = Long.parseLong(workgroupId);
		}
		
		Long periodIdLong = null;
		if(periodId != null) {
			periodIdLong = Long.parseLong(periodId);
		}
		
		boolean allowedAccess = false;
		
		/*
		 * the student can make a request if they are in the run
		 */
		if(SecurityUtils.isStudent(signedInUser) && SecurityUtils.isUserInRun(signedInUser, runIdLong)) {
			//the student is in the run so we will allow the request
			allowedAccess = true;
		}
		
		if(!allowedAccess) {
			//user is not allowed to make this request
			response.sendError(HttpServletResponse.SC_FORBIDDEN);
			return;
		}
		
		//number of workgroups registered in the period, this is passed in from BridgeController
		Integer numWorkgroups = null;
		
		if(type.equals("peerreview")) {
			try {
				/*
				 * set the number of students in the class period for when we need
				 * to calculate peer review opening
				 */
				Set<Workgroup> classmateWorkgroups = runService.getWorkgroups(runIdLong, periodIdLong);
				numWorkgroups = classmateWorkgroups.size();
			} catch (ObjectNotFoundException e) {
				e.printStackTrace();
			}
		}

		//the percentage of workgroups that need to submit work before the peer review is open
		String openPercentageTrigger = request.getParameter("openPercentageTrigger");

		//the number of workgroups that need to submit work before the peer review is open
		String openNumberTrigger = request.getParameter("openNumberTrigger");

		//whether this request is for "annotate" or "revise"
		String peerReviewAction = request.getParameter("peerReviewAction");

		//the workgroups in the class in a string delimited by ','
		String classmateWorkgroupIds = request.getParameter("classmateWorkgroupIds");

		//the array of classmate workgroup ids
		String[] classmateWorkgroupIdsArray = classmateWorkgroupIds.split(",");

		Integer openPercentageTriggerInt = null;
		if(openPercentageTrigger != null) {
			try {
				openPercentageTriggerInt = Integer.parseInt(openPercentageTrigger);
			} catch(NumberFormatException e) {
				e.printStackTrace();
				openPercentageTriggerInt = 0;
			}
		}

		Integer openNumberTriggerInt = null;
		if(openNumberTrigger != null) {
			try {
				openNumberTriggerInt = Integer.parseInt(openNumberTrigger);
			} catch(NumberFormatException e) {
				e.printStackTrace();
				openNumberTriggerInt = 0;
			}
		}

		//get the node that is being used for peer review
		Node node = vleService.getNodeByNodeIdAndRunId(nodeId, runId);

		//we will store the response that we will return in this variable
		String responseString = "";

		if(peerReviewAction != null && peerReviewAction.equals("annotate")) {
			//the student is on the step where they view a classmate's work and annotate/review it

			//get the user making the request to review
			UserInfo reviewerUserInfo = vleService.getUserInfoByWorkgroupId(workgroupIdLong);

			/*
			 * make sure the student has submitted their own for work peer review
			 * before allowing them to peer review a classmate's work
			 */
			PeerReviewWork reviewerWork = vleService.getPeerReviewWorkByRunPeriodNodeWorkerUserInfo(runIdLong, periodIdLong, node, reviewerUserInfo);

			if(reviewerWork == null) {
				//the user has not submitted their own work for peer review
				responseString = "{\"error\":\"peerReviewUserHasNotSubmittedOwnWork\"}";
			} else {
				//see if the peer review is open
				boolean peerReviewGateOpen = vleService.calculatePeerReviewOpen(runIdLong, periodIdLong, node, numWorkgroups, openPercentageTriggerInt, openNumberTriggerInt);

				if(!peerReviewGateOpen) {
					/*
					 * the peer review is not open yet so we will return an error message to the client.
					 * more students need to submit in order to open the peer review
					 */
					responseString = "{\"error\":\"peerReviewNotOpen\"}";
				} else {
					//the peer review is open
					
					//obtain the work that we have matched with this workgroup
					String workToReview = getWorkToReviewByReviewer(runIdLong, periodIdLong, node, reviewerUserInfo);

					if(workToReview == null) {
						//check if the author has been assigned to review the user's work
						if(vleService.isUserReviewingAuthor(runIdLong, periodIdLong, node, reviewerUserInfo)) {
							/*
							 * the author is set to review the user's work which means the user
							 * will see the author's review in return. this basically means the
							 * user is taken out of the pool of student's to send/receive
							 * peer review from a classmate and only interacts with the
							 * pre-written author responses.
							 */
							responseString = "{\"error\":\"peerReviewShowAuthoredWork\"}";
						} else {
							//if we have not performed the match yet, we will create a match
							responseString = assignReviewerToWork(runIdLong, periodIdLong, node, reviewerUserInfo);							
						}

						if(responseString == null) {
							//we were unable to assign work to the user

							//check if we should just show authored work for student to review
							if(showAuthoredContentToStudent("work", runIdLong, periodIdLong, node, classmateWorkgroupIdsArray)) {
								/*
								 * for this student's work we will set the author as the reviewer
								 * so that when this student gets to the step where they revise
								 * their work, they will see the authored review
								 */
								vleService.matchUserToAuthor(runIdLong, periodIdLong, node, reviewerUserInfo, reviewerWork);

								//we will just show the authored work for the student to review
								responseString = "{\"error\":\"peerReviewShowAuthoredWork\"}";
							} else {
								/*
								 * we were unable to assign work to the user, maybe because there is no
								 * more available work to be assigned to at the moment. there are
								 * students working today that might still submit their peer review 1st draft
								 * so we will wait.
								 */
								responseString = "{\"error\":\"peerReviewNotAbleToAssignWork\"}";
							}
						}
					} else {
						//return the work that we have matched the user to
						responseString = workToReview;
					}
				}
			}
		} else if(peerReviewAction != null && peerReviewAction.equals("revise")) {
			/*
			 * the student is on the step where they see their original work and their classmate's review
			 * of their work. they will then revise their original work.
			 */

			//get the user
			UserInfo workerUserInfo = vleService.getUserInfoByWorkgroupId(workgroupIdLong);

			//check if the user has submitted work to be peer reviewed
			PeerReviewWork myWork = vleService.getPeerReviewWorkByRunPeriodNodeWorkerUserInfo(runIdLong, periodIdLong, node, workerUserInfo);

			if(myWork == null) {
				//the user has not submitted their own work for peer review
				responseString = "{\"error\":\"peerReviewUserHasNotSubmittedOwnWork\"}";
			} else {
				//check if the user has been assigned to work to perform a review
				PeerReviewWork workAssignedTo = vleService.getPeerReviewWorkByRunPeriodNodeReviewerUserInfo(runIdLong, periodIdLong, node, workerUserInfo);

				if(workAssignedTo == null) {
					/*
					 * user has not been assigned to a classmate work so they must go back to the review step
					 * to try to get assigned to classmate work or just get assigned to the author work
					 */
					responseString = "{\"error\":\"peerReviewUserHasNotBeenAssignedToClassmateWork\"}";
				} else {
					//check if this user has submitted an annotation for their classmate
					Annotation annotationForWorkAssignedTo = workAssignedTo.getAnnotation();

					if(annotationForWorkAssignedTo == null) {
						//check if the user has been assigned to the author
						if(vleService.isUserReviewingAuthor(runIdLong, periodIdLong, node, workerUserInfo)) {
							/*
							 * user was assigned to review the author which means they will
							 * also receive the author review for their own work. the local
							 * client still needs to check whether the student has submitted
							 * the peer review to the author before allowing them to move
							 * on to the next step where they see the author review and
							 * revise their work
							 */
							responseString = createWorkAndAnnotationJSONResponse(myWork, null, "peerReviewShowAuthoredReview");
						} else {
							//user has not submitted an annotation for their classmate
							responseString = "{\"error\":\"peerReviewUserHasNotAnnotatedClassmateWork\"}";							
						}
					} else {
						//check if the user's work has been assigned to anyone
						UserInfo reviewerUserInfo = myWork.getReviewerUserInfo();

						if(reviewerUserInfo == null) {
							//no one has been assigned to review my work

							//check if there are any classmates that haven't been matched and are working today
							if(showAuthoredContentToStudent("review", runIdLong, periodIdLong, node, classmateWorkgroupIdsArray)) {
								//show the authored review since there is no one left to review my work
								responseString = createWorkAndAnnotationJSONResponse(myWork, null, "peerReviewShowAuthoredReview");
							} else {
								//wait for classmate to get assigned to my work
								responseString = "{\"error\":\"peerReviewUserWorkHasNotBeenAssignedToClassmate\"}";
							}
						} else {
							//there is a reviewer

							if(vleService.isAuthorSetAsReviewer(myWork)) {
								//reviewer is set to author

								//we will show the author's review to the student
								responseString = createWorkAndAnnotationJSONResponse(myWork, null, "peerReviewShowAuthoredReview");
							} else {
								//check if this user's work has been reviewed/annotated
								Annotation annotation = myWork.getAnnotation();

								if(annotation == null) {
									//this student's work has not been reviewed

									//check if our reviewer has done any work today
									if(hasReviewerDoneWorkToday(reviewerUserInfo)) {
										//reviewer has done work today, we will wait
										responseString = "{\"error\":\"peerReviewUserWorkHasNotBeenAnnotatedByClassmate\"}";
									} else {
										//reviewer has not done any work today, we will show the authored review
										responseString = createWorkAndAnnotationJSONResponse(myWork, null, "peerReviewShowAuthoredReview");
									}
								} else {
									//this student's work has been reviewed

									//get the JSON object that contains the annotation and work
									responseString = createWorkAndAnnotationJSONResponse(myWork, annotation, null);
								}
							}
						}
					}
				}
			}
		}

		response.getWriter().print(responseString);
	}
	
	/**
	 * Create a JSON string that contains the student work, annotation, and error if applicable
	 * @param myWork the student work
	 * @param annotation the annotation that a classmate gave the work
	 * @param error an error string used to send back to the client so it can handle
	 * it properly
	 * @return a JSON string containing a nodevisit, annotation, and/or error
	 */
	private String createWorkAndAnnotationJSONResponse(PeerReviewWork myWork, Annotation annotation, String error) {
		//we will wrap the annotation and original work in a JSON object
		JSONObject workAndAnnotation = new JSONObject();
		try {
			String annotationData = null;
			if(annotation != null) {
				annotationData = annotation.getData();

				//set the annotation
				workAndAnnotation.put("annotation", new JSONObject(annotationData));
			}

			String myNodeVisitData = null;
			if(myWork != null) {
				myNodeVisitData = myWork.getStepWork().getData();

				//set the node visit
				workAndAnnotation.put("nodeVisit", new JSONObject(myNodeVisitData));
			}

			if(error != null && !error.equals("")) {
				//set the error string
				workAndAnnotation.put("error", error);
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}

		return workAndAnnotation.toString();
	}

	/**
	 * Handles the posting of the initial work for the phase 1
	 * of the peer review. This also calculates whether the peer review
	 * is ready to be open.
	 * @param request
	 * @param response
	 * @throws IOException
	 */
	private ModelAndView doPostJSON(HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		//not used, VLEPostData handles the submit of the original work
		return null;
	}

	/**
	 * Check if the user has submitted work today
	 * @param userInfo the user we are checking for
	 * @return whether the user has submitted work today
	 */
	private boolean hasReviewerDoneWorkToday(UserInfo userInfo) {
		/*
		 * make a list to contain the user since the function we are passing
		 * it to can handle multiple UserInfos even though we just need to 
		 * check one
		 */
		List<UserInfo> userInfos = new Vector<UserInfo>();
		userInfos.add(userInfo);

		/*
		 * check if the users in the list (in this case just one user), has
		 * done any work today
		 */
		List<UserInfo> userInfosThatHaveWorkedToday = vleService.getUserInfosThatHaveWorkedToday(userInfos);

		if(userInfosThatHaveWorkedToday.size() == 1) {
			//the user has done work today
			return true;
		} else {
			//the user has not done work today
			return false;
		}
	}

	/**
	 * Check if we should show authored content to student
	 * @param authorContentType this can be either "work" or "review"
	 * @param runId
	 * @param periodId
	 * @param node
	 * @param workgroupsToSearch these are the classmate workgroup ids
	 * @return true if we should show the authored content, false if not
	 */
	private boolean showAuthoredContentToStudent(String authorContentType, Long runId, Long periodId, Node node, String[] workgroupsToSearch) {
		if(authorContentType == null || authorContentType.equals("")) {
			return false;
		} else {
			List<String> workgroupsThatHaveNotSatisfiedCondition = null;
			if(authorContentType.equals("work")) {
				//get all the users in the class who have not submitted peer review work
				workgroupsThatHaveNotSatisfiedCondition = getWorkgroupsThatHaveNot("SubmittedPeerReviewWork", runId, periodId, node, workgroupsToSearch);

			} else if(authorContentType.equals("review")) {
				//get all the users in the class who have not been assigned to review yet
				workgroupsThatHaveNotSatisfiedCondition = getWorkgroupsThatHaveNot("BeenAssignedToReview", runId, periodId, node, workgroupsToSearch);
			}

			if(workgroupsThatHaveNotSatisfiedCondition != null) {
				/*
				 * get all the users who have not satisifed the specified
				 * condition and have also not done any work today
				 */
				List<UserInfo> workgroupsThatHaveDoneWorkToday = getWorkgroupsThatHaveDoneWorkToday(workgroupsThatHaveNotSatisfiedCondition);

				if(workgroupsThatHaveDoneWorkToday.size() == 0) {
					//there is no one left so we will just show the authored content
					return true;
				}
			}
		}

		/*
		 * do not show the authored content because there may still be classmates
		 * who will submit work or get assigned to review
		 */
		return false;
	}

	/**
	 * Get a list of workgroups that have not satisifed the condition
	 * @param condition is either "SubmittedPeerReviewWork" or "BeenAssignedToReview"
	 * @param runId
	 * @param periodId
	 * @param node
	 * @param workgroupsToSearch these are the classmate workgroup ids
	 * @return a list of workgroups that have not satisified the given condition
	 */
	private List<String> getWorkgroupsThatHaveNot(String condition, Long runId, Long periodId, Node node, String[] workgroupsToSearch) {
		if(condition == null || condition.equals("")) {
			return null;
		} else {
			//get a List object of the workgroups to search through
			List<String> workgroupList = new Vector<String>(Arrays.asList(workgroupsToSearch));

			//get all the peer review work for this run, period, node
			List<PeerReviewWork> peerReviewWorkList = vleService.getPeerReviewWorkByRunPeriodNode(runId, periodId, node);

			/*
			 * the List that will store which workgroups have satisfied the condition
			 * for the run, period, node we are looking at
			 */
			List<String> workgroupsThatHaveSatisfiedCondition = new Vector<String>();

			//loop through all the peer review work for the specified run, period, node
			for(int x=0; x<peerReviewWorkList.size(); x++) {
				//get the PeerReviewWork
				PeerReviewWork peerReviewWork = peerReviewWorkList.get(x);

				if(condition.equals("SubmittedPeerReviewWork")) {
					//get the UserInfo who did the work
					UserInfo userInfo = peerReviewWork.getUserInfo();

					//get the workgroupId
					Long workgroupId = userInfo.getWorkgroupId();

					//add the workgroupId to the List of people who have satisfied the condition
					workgroupsThatHaveSatisfiedCondition.add(workgroupId.toString());
				} else if(condition.equals("BeenAssignedToReview")) {
					//get the UserInfo who is assigned to review
					UserInfo reviewerUserInfo = peerReviewWork.getReviewerUserInfo();

					//check if there has been a user assigned to review
					if(reviewerUserInfo != null) {
						//get the workgroupId
						Long workgroupId = reviewerUserInfo.getWorkgroupId();

						//add the workgroupId to the List of people who have satisfied the condition
						workgroupsThatHaveSatisfiedCondition.add(workgroupId.toString());				
					}
				}
			}

			/*
			 * remove the workgroups that have satisfied the condition so that we are left with 
			 * the workgroups that have not
			 */
			workgroupList.removeAll(workgroupsThatHaveSatisfiedCondition);

			/*
			 * return the list of workgroups that have not satisfied the condition
			 */
			return workgroupList;
		}
	}

	/**
	 * Get all the workgroups that have not done any work today that are
	 * in the String array of workgroups that are passed in
	 * @param workgroupsToSearch the String array of workgroup ids to filter
	 * @return a UserInfo array of the users that have done any work today
	 * (this will be a subset of the users that are passed in)
	 */
	private List<UserInfo> getWorkgroupsThatHaveDoneWorkToday(List<String> workgroupList) {
		//get a List of UserInfos
		List<UserInfo> userInfos = vleService.getUserInfoByWorkgroupIds(workgroupList);

		//get all the users who have submitted any today
		List<UserInfo> userInfosThatHaveWorkedToday = vleService.getUserInfosThatHaveWorkedToday(userInfos);

		//return the List of users who have done any work today
		return userInfosThatHaveWorkedToday;
	}

	/**
	 * Obtain the work to review for the given reviewerUserInfo.
	 * @param runId
	 * @param periodId
	 * @param node
	 * @param reviewerUserInfo 
	 * @return a JSON object that contains the workgroupId of the user who submitted
	 * the work, the stepWorkId, and the nodeVisit. null will be returned if the
	 * reviewer is not assigned to any work.
	 */
	private String getWorkToReviewByReviewer(Long runId, Long periodId, Node node, UserInfo reviewerUserInfo) {
		String dataString = null;
		JSONObject workToReview = null;
		String workToReviewString = null;

		//obtain the work assigned to the reviewer
		PeerReviewWork peerReviewWork = vleService.getPeerReviewWorkByRunPeriodNodeReviewerUserInfo(runId, periodId, node, reviewerUserInfo);

		//check if there was any work assigned
		if(peerReviewWork != null && peerReviewWork.getStepWork() != null) {
			//there was work assigned

			//get the node visit data
			dataString =  peerReviewWork.getStepWork().getData();

			//create the JSON object that will wrap all the values we need to return
			workToReview = new JSONObject();
			try {
				workToReview.put("workgroupId", peerReviewWork.getUserInfo().getWorkgroupId());
				workToReview.put("stepWorkId", peerReviewWork.getStepWork().getId());
				workToReview.put("nodeVisit", new JSONObject(dataString));
				workToReviewString = workToReview.toString();
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}

		//return the JSON in string form
		return workToReviewString;
	}

	/**
	 * Assign the reviewer to work if there is any available.
	 * @param runId
	 * @param periodId
	 * @param node
	 * @param reviewerUserInfo
	 * @return the work assigned to the reviewer or null if we were unable to
	 * assign any work
	 */
	private String assignReviewerToWork(Long runId, Long periodId, Node node, UserInfo reviewerUserInfo) {
		String workAssignedTo = null;

		//get all the unassigned work
		List<PeerReviewWork> unassignedPeerReviewWorkList = vleService.getUnassignedPeerReviewWorkList(runId, periodId, node);

		//check that there was unassigned work
		if(unassignedPeerReviewWorkList != null && unassignedPeerReviewWorkList.size() != 0) {

			//remove my work from the list so I don't get assigned to myself
			removePeerReviewWorkByWorkgroupId(unassignedPeerReviewWorkList, reviewerUserInfo.getWorkgroupId());

			//get my peer review work
			PeerReviewWork myPeerReviewWork = vleService.getPeerReviewWorkByRunPeriodNodeWorkerUserInfo(runId, periodId, node, reviewerUserInfo);

			//check that I submitted work
			if(myPeerReviewWork != null) {
				//get the user that has been assigned to review my work, if any
				UserInfo userReviewingMyWork = myPeerReviewWork.getReviewerUserInfo();

				/*
				 * this next case will try to make sure everyone's work gets reviewed.
				 * here's the scenario. there are 3 students who have submitted work.
				 * if student 1 gets assigned to student 2, and student 2 is assigned
				 * to student 1, then student 3 will not have anyone to get assigned to.
				 * therefore if student 1 gets assigned to student 2, we must prevent
				 * student 2 from getting assigned to student 1. 
				 */
				//check if anyone is reviewing my work and if there is more than 1 work in the list
				if(userReviewingMyWork != null && unassignedPeerReviewWorkList.size() > 1) {
					/*
					 * remove my reviewer from the list as well as reviewer's reviewer,
					 * reviewer's reviewer's reviewer, etc.
					 */
					removePeerReviewsChain(unassignedPeerReviewWorkList, runId, periodId, node, userReviewingMyWork);
				}
			}

			//choose a PeerReviewWork from the list randomly
			PeerReviewWork randomPeerReviewWork = chooseRandomPeerReviewWork(unassignedPeerReviewWorkList);

			if(randomPeerReviewWork == null) {
				/*
				 * no work to review at this point in time, must check back later
				 * after more students have submitted work
				 */
			} else {
				//assign me to review this work
				randomPeerReviewWork.setReviewerUserInfo(reviewerUserInfo);
				vleService.savePeerReviewWork(randomPeerReviewWork);

				//obtain a JSON object with the values of the work that we need to send back
				workAssignedTo = getWorkToReviewByReviewer(runId, periodId, node, reviewerUserInfo);
			}
		}

		return workAssignedTo;
	}

	/**
	 * Recursively remove the chain of reviewer's from the list. For example if
	 * 1->2 (workgroup 1 is assigned to review workgroup 2)
	 * 2->3 (workgroup 2 is assigned to review workgroup 3)
	 * 3 (currently not assigned to review work)
	 * 4 (currently not assigned to review work)
	 * We need to make sure 3 does not get assigned to 1 because that would close
	 * the chain of reviewers and 4 would be left with no one to review but itself.
	 * 
	 * @param peerReviewWorkList
	 * @param runId
	 * @param periodId
	 * @param node
	 * @param reviewerUserInfo
	 */
	private void removePeerReviewsChain(List<PeerReviewWork> peerReviewWorkList, Long runId, Long periodId, Node node, UserInfo reviewerUserInfo) {
		if(reviewerUserInfo != null) {
			//remove my reviewer from the list
			removePeerReviewWorkByWorkgroupId(peerReviewWorkList, reviewerUserInfo.getWorkgroupId());

			//get the PeerReviewWork of my reviewer
			PeerReviewWork reviewerPeerReviewWork = vleService.getPeerReviewWorkByRunPeriodNodeWorkerUserInfo(runId, periodId, node, reviewerUserInfo);

			//check if my reviewer has submitted any work
			if(reviewerPeerReviewWork != null) {
				//get the reviewer of my reviewer
				UserInfo reviewerOfReviewer = reviewerPeerReviewWork.getReviewerUserInfo();

				//remove the reviewer's reviewer from the list
				removePeerReviewsChain(peerReviewWorkList, runId, periodId, node, reviewerOfReviewer);
			}
		}
	}

	/**
	 * Remove the PeerReviewWork from the list
	 * @param peerReviewWorkList
	 * @param workgroupId
	 */
	private void removePeerReviewWorkByWorkgroupId(List<PeerReviewWork> peerReviewWorkList, Long workgroupId) {
		//loop through the list of PeerReviewWork
		for(int x=0; x<peerReviewWorkList.size(); x++) {
			//get a PeerReviewWork
			PeerReviewWork peerReviewWork = peerReviewWorkList.get(x);

			//check if the workgroupId matches
			if(peerReviewWork.getUserInfo().getWorkgroupId().equals(workgroupId)) {
				//remove the PeerReviewWork from the list
				peerReviewWorkList.remove(peerReviewWork);
			}
		}
	}

	/**
	 * Choose a random PeerReviewWork from the list
	 * @param peerReviewWorkList
	 * @return
	 */
	private PeerReviewWork chooseRandomPeerReviewWork(List<PeerReviewWork> peerReviewWorkList) {
		//if there are no elements in the list return null
		if(peerReviewWorkList.size() == 0) {
			return null;
		} else {
			Random random = new Random();

			//choose a random number from 0 to (length of list - 1)
			int nextInt = random.nextInt(peerReviewWorkList.size());

			//return the PeerReviewWork at the randomly chosen index
			return peerReviewWorkList.get(nextInt);
		}
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
}
