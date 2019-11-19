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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.vle.VLEService;
import org.wise.vle.domain.annotation.Annotation;
import org.wise.vle.domain.node.Node;
import org.wise.vle.domain.peerreview.PeerReviewWork;
import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.work.StepWork;

/**
 * Controller for handling the peer review step
 * @author Geoffrey Kwan
 */
@Controller
@RequestMapping("/peerReview.html")
public class VLEPeerReviewController {

  @Autowired
  private VLEService vleService;

  @Autowired
  private RunService runService;

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
  @RequestMapping(method=RequestMethod.GET)
  public ModelAndView doGetJSON(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    String action = request.getParameter("action");
    if (action.equals("studentRequest")) {
      handleStudentRequest(request, response);
    } else if (action.equals("teacherRequest")) {
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
  private void handleTeacherRequest(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    User signedInUser = ControllerUtil.getSignedInUser();
    String runId = request.getParameter("runId");
    Long runIdLong = null;
    if (runId != null) {
      runIdLong = Long.parseLong(runId);
    }

    boolean allowedAccess = false;

    /*
     * a teacher can make a request if they are the owner of the run
     */
    if (SecurityUtils.isTeacher(signedInUser) && SecurityUtils.isUserOwnerOfRun(signedInUser, runIdLong)) {
      allowedAccess = true;
    }

    if (!allowedAccess) {
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }

    List<PeerReviewWork> peerReviewWorkList = vleService.getPeerReviewWorkByRun(runIdLong);
    JSONArray peerReviewWorkJSONArray = new JSONArray();
    Iterator<PeerReviewWork> peerReviewWorkListIterator = peerReviewWorkList.iterator();

    while (peerReviewWorkListIterator.hasNext()) {
      try {
        PeerReviewWork peerReviewWork = peerReviewWorkListIterator.next();
        JSONObject peerReviewWorkJSONObject = new JSONObject();
        peerReviewWorkJSONObject.put("runId", peerReviewWork.getRunId());
        peerReviewWorkJSONObject.put("periodId", peerReviewWork.getPeriodId());
        peerReviewWorkJSONObject.put("nodeId", peerReviewWork.getNode().getNodeId());
        UserInfo userInfo = peerReviewWork.getUserInfo();
        UserInfo reviewerUserInfo = peerReviewWork.getReviewerUserInfo();
        StepWork stepWork = peerReviewWork.getStepWork();
        Annotation annotation = peerReviewWork.getAnnotation();

        Long workgroupId = null;
        if (userInfo != null) {
          workgroupId = userInfo.getWorkgroupId();
        }
        peerReviewWorkJSONObject.put("workgroupId", workgroupId);

        Long reviewerWorkgroupId = null;
        if (reviewerUserInfo != null) {
          reviewerWorkgroupId = reviewerUserInfo.getWorkgroupId();
        }
        peerReviewWorkJSONObject.put("reviewerWorkgroupId", reviewerWorkgroupId);

        Object stepWorkData = JSONObject.NULL;
        if (stepWork != null) {
          stepWorkData = new JSONObject(stepWork.getData());
        }
        peerReviewWorkJSONObject.put("stepWork", stepWorkData);

        Object annotationData = JSONObject.NULL;
        if (annotation != null) {
          annotationData = new JSONObject(annotation.getData());
        }
        peerReviewWorkJSONObject.put("annotation", annotationData);
        peerReviewWorkJSONArray.put(peerReviewWorkJSONObject);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
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
  private void handleStudentRequest(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    User signedInUser = ControllerUtil.getSignedInUser();
    String runId = request.getParameter("runId");
    String workgroupId = request.getParameter("workgroupId");
    String periodId = request.getParameter("periodId");
    String nodeId = request.getParameter("nodeId");
    String type = request.getParameter("type");

    Long runIdLong = null;
    if (runId != null) {
      runIdLong = Long.parseLong(runId);
    }

    Long workgroupIdLong = null;
    if (runId != null) {
      workgroupIdLong = Long.parseLong(workgroupId);
    }

    Long periodIdLong = null;
    if (periodId != null) {
      periodIdLong = Long.parseLong(periodId);
    }

    boolean allowedAccess = false;

    /*
     * the student can make a request if they are in the run
     */
    if (SecurityUtils.isStudent(signedInUser) && SecurityUtils.isUserInRun(signedInUser, runIdLong)) {
      allowedAccess = true;
    }

    if (!allowedAccess) {
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }

    Integer numWorkgroups = null;

    if (type.equals("peerreview")) {
      try {
        /*
         * set the number of students in the class period for when we need
         * to calculate peer review opening
         */
        List<Workgroup> classmateWorkgroups = runService.getWorkgroups(runIdLong, periodIdLong);
        numWorkgroups = classmateWorkgroups.size();
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }

    String openPercentageTrigger = request.getParameter("openPercentageTrigger");
    String openNumberTrigger = request.getParameter("openNumberTrigger");
    String peerReviewAction = request.getParameter("peerReviewAction");
    String classmateWorkgroupIds = request.getParameter("classmateWorkgroupIds");
    String[] classmateWorkgroupIdsArray = classmateWorkgroupIds.split(",");

    Integer openPercentageTriggerInt = null;
    if (openPercentageTrigger != null) {
      try {
        openPercentageTriggerInt = Integer.parseInt(openPercentageTrigger);
      } catch(NumberFormatException e) {
        e.printStackTrace();
        openPercentageTriggerInt = 0;
      }
    }

    Integer openNumberTriggerInt = null;
    if (openNumberTrigger != null) {
      try {
        openNumberTriggerInt = Integer.parseInt(openNumberTrigger);
      } catch(NumberFormatException e) {
        e.printStackTrace();
        openNumberTriggerInt = 0;
      }
    }

    Node node = vleService.getNodeByNodeIdAndRunId(nodeId, runId);
    String responseString = "";

    if (peerReviewAction != null && peerReviewAction.equals("annotate")) {
      UserInfo reviewerUserInfo = vleService.getUserInfoByWorkgroupId(workgroupIdLong);

      /*
       * make sure the student has submitted their own for work peer review
       * before allowing them to peer review a classmate's work
       */
      PeerReviewWork reviewerWork = vleService.getPeerReviewWorkByRunPeriodNodeWorkerUserInfo(runIdLong, periodIdLong, node, reviewerUserInfo);

      if (reviewerWork == null) {
        responseString = "{\"error\":\"peerReviewUserHasNotSubmittedOwnWork\"}";
      } else {
        boolean peerReviewGateOpen = vleService.calculatePeerReviewOpen(runIdLong, periodIdLong, node, numWorkgroups, openPercentageTriggerInt, openNumberTriggerInt);

        if (!peerReviewGateOpen) {
          /*
           * the peer review is not open yet so we will return an error message to the client.
           * more students need to submit in order to open the peer review
           */
          responseString = "{\"error\":\"peerReviewNotOpen\"}";
        } else {
          String workToReview = getWorkToReviewByReviewer(runIdLong, periodIdLong, node, reviewerUserInfo);

          if (workToReview == null) {
            if (vleService.isUserReviewingAuthor(runIdLong, periodIdLong, node, reviewerUserInfo)) {
              /*
               * the author is set to review the user's work which means the user
               * will see the author's review in return. this basically means the
               * user is taken out of the pool of student's to send/receive
               * peer review from a classmate and only interacts with the
               * pre-written author responses.
               */
              responseString = "{\"error\":\"peerReviewShowAuthoredWork\"}";
            } else {
              responseString = assignReviewerToWork(runIdLong, periodIdLong, node, reviewerUserInfo);
            }

            if (responseString == null) {
              //check if we should just show authored work for student to review
              if (showAuthoredContentToStudent("work", runIdLong, periodIdLong, node, classmateWorkgroupIdsArray)) {
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
            responseString = workToReview;
          }
        }
      }
    } else if (peerReviewAction != null && peerReviewAction.equals("revise")) {
      /*
       * the student is on the step where they see their original work and their classmate's review
       * of their work. they will then revise their original work.
       */

      UserInfo workerUserInfo = vleService.getUserInfoByWorkgroupId(workgroupIdLong);
      PeerReviewWork myWork = vleService.getPeerReviewWorkByRunPeriodNodeWorkerUserInfo(runIdLong, periodIdLong, node, workerUserInfo);

      if (myWork == null) {
        responseString = "{\"error\":\"peerReviewUserHasNotSubmittedOwnWork\"}";
      } else {
        PeerReviewWork workAssignedTo = vleService.getPeerReviewWorkByRunPeriodNodeReviewerUserInfo(runIdLong, periodIdLong, node, workerUserInfo);

        if (workAssignedTo == null) {
          /*
           * user has not been assigned to a classmate work so they must go back to the review step
           * to try to get assigned to classmate work or just get assigned to the author work
           */
          responseString = "{\"error\":\"peerReviewUserHasNotBeenAssignedToClassmateWork\"}";
        } else {
          Annotation annotationForWorkAssignedTo = workAssignedTo.getAnnotation();

          if (annotationForWorkAssignedTo == null) {
            if (vleService.isUserReviewingAuthor(runIdLong, periodIdLong, node, workerUserInfo)) {
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
            UserInfo reviewerUserInfo = myWork.getReviewerUserInfo();

            if (reviewerUserInfo == null) {
              if (showAuthoredContentToStudent("review", runIdLong, periodIdLong, node, classmateWorkgroupIdsArray)) {
                responseString = createWorkAndAnnotationJSONResponse(myWork, null, "peerReviewShowAuthoredReview");
              } else {
                responseString = "{\"error\":\"peerReviewUserWorkHasNotBeenAssignedToClassmate\"}";
              }
            } else {
              if (vleService.isAuthorSetAsReviewer(myWork)) {
                responseString = createWorkAndAnnotationJSONResponse(myWork, null, "peerReviewShowAuthoredReview");
              } else {
                Annotation annotation = myWork.getAnnotation();

                if (annotation == null) {
                  if (hasReviewerDoneWorkToday(reviewerUserInfo)) {
                    responseString = "{\"error\":\"peerReviewUserWorkHasNotBeenAnnotatedByClassmate\"}";
                  } else {
                    responseString = createWorkAndAnnotationJSONResponse(myWork, null, "peerReviewShowAuthoredReview");
                  }
                } else {
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
    JSONObject workAndAnnotation = new JSONObject();
    try {
      String annotationData = null;
      if (annotation != null) {
        annotationData = annotation.getData();
        workAndAnnotation.put("annotation", new JSONObject(annotationData));
      }

      String myNodeVisitData = null;
      if (myWork != null) {
        myNodeVisitData = myWork.getStepWork().getData();
        workAndAnnotation.put("nodeVisit", new JSONObject(myNodeVisitData));
      }

      if (error != null && !error.equals("")) {
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
  @RequestMapping(method = RequestMethod.POST)
  private ModelAndView doPostJSON(HttpServletRequest request, HttpServletResponse response) {
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

    if (userInfosThatHaveWorkedToday.size() == 1) {
      return true;
    } else {
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
    if (authorContentType == null || authorContentType.equals("")) {
      return false;
    } else {
      List<String> workgroupsThatHaveNotSatisfiedCondition = null;
      if (authorContentType.equals("work")) {
        workgroupsThatHaveNotSatisfiedCondition = getWorkgroupsThatHaveNot("SubmittedPeerReviewWork", runId, periodId, node, workgroupsToSearch);

      } else if (authorContentType.equals("review")) {
        workgroupsThatHaveNotSatisfiedCondition = getWorkgroupsThatHaveNot("BeenAssignedToReview", runId, periodId, node, workgroupsToSearch);
      }

      if (workgroupsThatHaveNotSatisfiedCondition != null) {
        /*
         * get all the users who have not satisifed the specified
         * condition and have also not done any work today
         */
        List<UserInfo> workgroupsThatHaveDoneWorkToday = getWorkgroupsThatHaveDoneWorkToday(workgroupsThatHaveNotSatisfiedCondition);

        if (workgroupsThatHaveDoneWorkToday.size() == 0) {
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
    if (condition == null || condition.equals("")) {
      return null;
    } else {
      List<String> workgroupList = new Vector<String>(Arrays.asList(workgroupsToSearch));
      List<PeerReviewWork> peerReviewWorkList = vleService.getPeerReviewWorkByRunPeriodNode(runId, periodId, node);

      /*
       * the List that will store which workgroups have satisfied the condition
       * for the run, period, node we are looking at
       */
      List<String> workgroupsThatHaveSatisfiedCondition = new Vector<String>();

      for (int x = 0; x < peerReviewWorkList.size(); x++) {
        PeerReviewWork peerReviewWork = peerReviewWorkList.get(x);

        if (condition.equals("SubmittedPeerReviewWork")) {
          UserInfo userInfo = peerReviewWork.getUserInfo();
          Long workgroupId = userInfo.getWorkgroupId();
          workgroupsThatHaveSatisfiedCondition.add(workgroupId.toString());
        } else if (condition.equals("BeenAssignedToReview")) {
          UserInfo reviewerUserInfo = peerReviewWork.getReviewerUserInfo();

          if (reviewerUserInfo != null) {
            Long workgroupId = reviewerUserInfo.getWorkgroupId();
            workgroupsThatHaveSatisfiedCondition.add(workgroupId.toString());
          }
        }
      }
      workgroupList.removeAll(workgroupsThatHaveSatisfiedCondition);
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
    List<UserInfo> userInfos = vleService.getUserInfoByWorkgroupIds(workgroupList);
    List<UserInfo> userInfosThatHaveWorkedToday = vleService.getUserInfosThatHaveWorkedToday(userInfos);
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

    PeerReviewWork peerReviewWork = vleService.getPeerReviewWorkByRunPeriodNodeReviewerUserInfo(runId, periodId, node, reviewerUserInfo);
    if (peerReviewWork != null && peerReviewWork.getStepWork() != null) {
      dataString =  peerReviewWork.getStepWork().getData();
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
    List<PeerReviewWork> unassignedPeerReviewWorkList = vleService.getUnassignedPeerReviewWorkList(runId, periodId, node);
    if (unassignedPeerReviewWorkList != null && unassignedPeerReviewWorkList.size() != 0) {
      removePeerReviewWorkByWorkgroupId(unassignedPeerReviewWorkList, reviewerUserInfo.getWorkgroupId());
      PeerReviewWork myPeerReviewWork = vleService.getPeerReviewWorkByRunPeriodNodeWorkerUserInfo(runId, periodId, node, reviewerUserInfo);
      if (myPeerReviewWork != null) {
        UserInfo userReviewingMyWork = myPeerReviewWork.getReviewerUserInfo();

        /*
         * this next case will try to make sure everyone's work gets reviewed.
         * here's the scenario. there are 3 students who have submitted work.
         * if student 1 gets assigned to student 2, and student 2 is assigned
         * to student 1, then student 3 will not have anyone to get assigned to.
         * therefore if student 1 gets assigned to student 2, we must prevent
         * student 2 from getting assigned to student 1.
         */
        if (userReviewingMyWork != null && unassignedPeerReviewWorkList.size() > 1) {
          /*
           * remove my reviewer from the list as well as reviewer's reviewer,
           * reviewer's reviewer's reviewer, etc.
           */
          removePeerReviewsChain(unassignedPeerReviewWorkList, runId, periodId, node, userReviewingMyWork);
        }
      }

      PeerReviewWork randomPeerReviewWork = chooseRandomPeerReviewWork(unassignedPeerReviewWorkList);
      if (randomPeerReviewWork == null) {
        /*
         * no work to review at this point in time, must check back later
         * after more students have submitted work
         */
      } else {
        randomPeerReviewWork.setReviewerUserInfo(reviewerUserInfo);
        vleService.savePeerReviewWork(randomPeerReviewWork);
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
  private void removePeerReviewsChain(List<PeerReviewWork> peerReviewWorkList, Long runId,
      Long periodId, Node node, UserInfo reviewerUserInfo) {
    if (reviewerUserInfo != null) {
      removePeerReviewWorkByWorkgroupId(peerReviewWorkList, reviewerUserInfo.getWorkgroupId());
      PeerReviewWork reviewerPeerReviewWork =
          vleService.getPeerReviewWorkByRunPeriodNodeWorkerUserInfo(runId, periodId, node, reviewerUserInfo);
      if (reviewerPeerReviewWork != null) {
        UserInfo reviewerOfReviewer = reviewerPeerReviewWork.getReviewerUserInfo();
        removePeerReviewsChain(peerReviewWorkList, runId, periodId, node, reviewerOfReviewer);
      }
    }
  }

  /**
   * Remove the PeerReviewWork from the list
   * @param peerReviewWorkList
   * @param workgroupId
   */
  private void removePeerReviewWorkByWorkgroupId(List<PeerReviewWork> peerReviewWorkList,
      Long workgroupId) {
    for (int x = 0; x < peerReviewWorkList.size(); x++) {
      PeerReviewWork peerReviewWork = peerReviewWorkList.get(x);
      if (peerReviewWork.getUserInfo().getWorkgroupId().equals(workgroupId)) {
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
    if (peerReviewWorkList.size() == 0) {
      return null;
    } else {
      Random random = new Random();
      int nextInt = random.nextInt(peerReviewWorkList.size());
      return peerReviewWorkList.get(nextInt);
    }
  }
}
