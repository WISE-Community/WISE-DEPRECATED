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

import java.io.File;
import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Iterator;
import java.util.List;
import java.util.Properties;
import java.util.Set;
import java.util.Vector;

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
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.vle.VLEService;
import org.wise.vle.domain.annotation.Annotation;
import org.wise.vle.domain.node.Node;
import org.wise.vle.domain.peerreview.PeerReviewWork;
import org.wise.vle.domain.project.Project;
import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.work.StepWork;
import org.wise.vle.utils.VLEDataUtils;

/**
 * Controller for handling WISE4 student data
 * @author Geoffrey Kwan
 * @author Hiroki Terashima
 */
@Controller
@RequestMapping("/studentData.html")
public class StudentDataController {

  @Autowired
  private VLEService vleService;

  @Autowired
  private RunService runService;

  @Autowired
  private Properties appProperties;

  private static boolean DEBUG = false;

  // max size for all student work size, in bytes. Default:  500K = 512000 bytes
  private int studentMaxWorkSize = 512000;

  @RequestMapping(method = RequestMethod.GET)
  public ModelAndView doGet(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    User signedInUser = ControllerUtil.getSignedInUser();

    /*
     * obtain the get parameters. there are two use cases at the moment.
     * 1. only userId is provided (multiple userIds can be delimited by :)
     *     e.g. 139:143:155
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
    String getAllStepWorks = request.getParameter("getAllStepWorks");

    if (userIdStr == null) {
      /*
       * this request was most likely caused by a session timeout and the user logging
       * back in which makes a request to studentData.html without any parameters.
       * in this case we will just redirect the user back to the WISE home page.
       */
      return new ModelAndView("redirect:/");
    }

    //the get request can be for multiple ids that are delimited by ':'
    String[] userIdArray = userIdStr.split(":");

    Long runId = null;
    if (runIdStr != null) {
      try {
        runId = new Long(runIdStr);
      } catch (NumberFormatException e) {
        e.printStackTrace();
      }
    }

    if ("true".equals(getAllStepWorks)) {
      JSONArray allStepWorkJSONObjects = new JSONArray();
      List<StepWork> allStepWorks = getAllStepWorks(userIdArray);
      Iterator<StepWork> allWorkIterator = allStepWorks.iterator();
      while (allWorkIterator.hasNext()) {
        StepWork stepWork = allWorkIterator.next();
        JSONObject stepWorkJSONObject = stepWork.toJSON();
        allStepWorkJSONObjects.put(stepWorkJSONObject);
      }
      response.setContentType("application/json");
      response.getWriter().write(allStepWorkJSONObjects.toString());
      return null;
    }

    Run run = null;
    if (runId != null) {
      try {
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
    if (SecurityUtils.isAdmin(signedInUser)) {
      allowedAccess = true;
    } else if (SecurityUtils.isTeacher(signedInUser) && SecurityUtils.isUserOwnerOfRun(signedInUser, runId)) {
      allowedAccess = true;
    } else if (SecurityUtils.isStudent(signedInUser) && SecurityUtils.isUserInRun(signedInUser, runId)) {
      if (type == null) {
        Long workgroupId = null;
        try {
          workgroupId = new Long(userIdStr);
        } catch (NumberFormatException e) {

        }

        if (SecurityUtils.isUserInWorkgroup(signedInUser, workgroupId)) {
          allowedAccess = true;
        }
      } else if (type.equals("brainstorm") || type.equals("aggregate")) {
        /*
         * boolean value to keep track of whether all the workgroup ids
         * that the user is trying to access work for is in the run.
         * this will be set to false if we find a single workgroup id that
         * is not in the run.
         */
        boolean allWorkgroupIdsInRun = true;

        for (int x = 0; x < userIdArray.length; x++) {
          String classmateWorkgroupIdString = userIdArray[x];
          Long classmateWorkgroupId = null;
          try {
            classmateWorkgroupId = new Long(classmateWorkgroupIdString);
          } catch (NumberFormatException e) {

          }

          if (!SecurityUtils.isWorkgroupInRun(classmateWorkgroupId, runId)) {
            allWorkgroupIdsInRun = false;
            break;
          }
        }

        if (allWorkgroupIdsInRun) {
          allowedAccess = true;
        }
      }
    }

    if (!allowedAccess) {
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return null;
    }

    /* set headers so that browsers don't cache the data (due to ie problem) */
    response.setHeader("Pragma", "no-cache");
    response.setHeader("Cache-Control", "no-cache");
    response.setDateHeader("Expires", 0);
    response.setContentType("application/json");

    if ("aggregate".equals(type) && Boolean.parseBoolean(request.getParameter("allStudents"))) {
      String workgroupIdStr = "";
      try {
        List<Workgroup> workgroups = runService.getWorkgroups(runId);
        for (Workgroup workgroup : workgroups) {
          workgroupIdStr += workgroup.getId() + ":";
        }
        request.setAttribute("userId", workgroupIdStr);
        userIdStr = workgroupIdStr;
        userIdArray = userIdStr.split(":");
      } catch (ObjectNotFoundException e) {

      }
    }

    boolean getAllWork = false;
    boolean getRevisions = true;

    if (DEBUG) {
      System.out.println("userIdStr: " + userIdStr);
      System.out.println("nodeId: " + nodeId);
      System.out.println("runId: " + runId);
      System.out.println("type: " + type);
      System.out.println("nodeTypes: " + nodeTypes);
      System.out.println("nodeIds: " + nodeIds);
    }

    if (getAllWorkStr != null) {
      getAllWork = Boolean.parseBoolean(getAllWorkStr);
    }

    if (getRevisionsStr != null) {
      getRevisions = Boolean.parseBoolean(getRevisionsStr);
    }

    List<String> nodeTypesList = null;
    if (nodeTypes != null) {
      String[] nodeTypesArray = nodeTypes.split(":");
      nodeTypesList = Arrays.asList(nodeTypesArray);
    }

    List<Node> nodeList = new ArrayList<Node>();
    if (nodeIds != null) {
      String[] nodeIdsArray = nodeIds.split(":");

      for (int x = 0; x < nodeIdsArray.length; x++) {
        Node tempNode = vleService.getNodeByNodeIdAndRunId(nodeIdsArray[x], runIdStr);
        if (tempNode != null) {
          nodeList.add(tempNode);
        }
      }
    }

    if ("aggregate".equals(type)) {
      if (nodeList.isEmpty()) {
        response.sendError(HttpServletResponse.SC_BAD_REQUEST, "get data node list is empty for aggregrate type");
        return null;
      }
      String curriculumBaseDir = appProperties.getProperty("curriculum_base_dir");
      String rawProjectUrl = run.getProject().getModulePath();
      String projectPath = curriculumBaseDir + rawProjectUrl;
      File projectFile = new File(projectPath);
      Project project = new Project(projectFile);
      boolean nodeWorkAccessibleForAggregate = true;
      for (Node nodeToCheck : nodeList) {
        nodeWorkAccessibleForAggregate &= project.isNodeAggregatable(nodeToCheck);
      }
      if (!nodeWorkAccessibleForAggregate) {
        response.sendError(HttpServletResponse.SC_BAD_REQUEST, "specified node is allowed for aggregation");
        return null;
      }
    }

    try {
      //this case is when userId is passed in as a GET argument
      // this is currently only being used for brainstorm steps and aggregate steps
      if (nodeId != null && !nodeId.equals("")) {
        Node node = vleService.getNodeByNodeIdAndRunId(nodeId, runIdStr);
        List<UserInfo> userInfos = new ArrayList<UserInfo>();
        for (int x = 0; x < userIdArray.length; x++) {
          UserInfo userInfo = vleService.getUserInfoByWorkgroupId(new Long(userIdArray[x]));
          if (userInfo != null) {
            userInfos.add(userInfo);
          }
        }

        List<StepWork> stepWorkList = vleService.getStepWorksByUserInfosAndNode(userInfos, node);
        JSONArray stepWorks = new JSONArray();

        for (StepWork stepWork : stepWorkList) {
          Long userId = stepWork.getUserInfo().getWorkgroupId();
          String dataString = stepWork.getData();
          JSONObject data = new JSONObject(dataString);
          data.put("visitPostTime", stepWork.getPostTime());
          String stepWorkId = stepWork.getId().toString();
          JSONObject userIdAndData = new JSONObject();
          userIdAndData.put("userId", userId);
          userIdAndData.put("data", data);
          userIdAndData.put("stepWorkId", stepWorkId);
          userIdAndData.put("id", stepWork.getId());
          stepWorks.put(userIdAndData);
        }
        response.getWriter().write(stepWorks.toString());
      } else {
        if (userIdArray != null && userIdArray.length > 0) {
          JSONObject workgroupNodeVisitsJSON = new JSONObject();
          for (int x = 0; x < userIdArray.length; x++) {
            String userId = userIdArray[x];
            UserInfo userInfo = vleService.getUserInfoByWorkgroupId(new Long(userId));
            JSONObject nodeVisitsJSON = new JSONObject();

            StepWork latestWork = vleService.getLatestStepWorkByUserInfo(userInfo);
            if (latestWork != null && latestWork.getPostTime() != null) {
              if (nodeList.size() == 0) {
                nodeList = vleService.getNodesByRunId(runIdStr);
              }
              nodeVisitsJSON = getNodeVisitsForStudent(nodeList, nodeTypesList, userInfo, run, getAllWork, getRevisions);
            } else {
              /*
               * the user does not have any work so we will just set the username and
               * userId and an empty visitedNodes array in the JSON for the user
               */
              nodeVisitsJSON.put("username", new Long(userId));
              nodeVisitsJSON.put("userId", new Long(userId));
              String nodeVisitKeyName = "visitedNodes";  // used in WISE4
              if (run != null) {
                org.wise.portal.domain.project.Project project = run.getProject();
                if (project != null) {
                  if (project.getWiseVersion().equals(5)) {
                    nodeVisitKeyName = "nodeVisits";  // used in WISE5
                  }
                }
              }
              nodeVisitsJSON.put(nodeVisitKeyName, new JSONArray());
            }
            workgroupNodeVisitsJSON.append("vleStates", nodeVisitsJSON);
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
   * @return node visits json object containing node visits for student
   * @throws JSONException
   */
  private JSONObject getNodeVisitsForStudent(List<Node> nodeList, List<String> nodeTypesList,
      UserInfo userInfo, Run run, boolean getAllWork, boolean getRevisions) throws JSONException {
    JSONObject nodeVisitsJSON = new JSONObject();
    nodeVisitsJSON.put("username", userInfo.getWorkgroupId());
    nodeVisitsJSON.put("userId", userInfo.getWorkgroupId());
    List<StepWork> stepWorkList = null;
    if (nodeList != null && nodeList.size() > 0) {
      stepWorkList = vleService.getStepWorksByUserInfoAndNodeList(userInfo, nodeList);
    } else {
      stepWorkList = vleService.getStepWorksByUserInfo(userInfo);
    }

    if (getRevisions) {
      for (int x = 0; x < stepWorkList.size(); x++) {
        StepWork stepWork = stepWorkList.get(x);
        String data = stepWork.getData();
        String stepWorkId = stepWork.getId().toString();
        String nodeType = stepWork.getNode().getNodeType();

        /*
         * check that the node type is one that we want if a list of
         * desired node types was provided. if there is no list of
         * node types, we will accept all node types
         */
        if (nodeTypesList == null || (nodeTypesList != null && nodeTypesList.contains(nodeType))) {
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
                ("HtmlNode".equals(nodeType) || "OutsideUrlNode".equals(nodeType) || "IdeaBasketNode".equals(nodeType))
                || "FlashNode".equals(nodeType)) {
              nodeVisitJSON.put("stepWorkId", stepWorkId);
              nodeVisitJSON.put("id", Long.valueOf(stepWorkId));
              nodeVisitJSON.put("visitPostTime", stepWork.getPostTime().getTime());
              String nodeVisitKeyName = "visitedNodes";  // used in WISE4
              if (run != null) {
                org.wise.portal.domain.project.Project project = run.getProject();
                if (project != null) {
                  if (project.getWiseVersion().equals(5)) {
                    nodeVisitKeyName = "nodeVisits";  // used in WISE5
                  }
                }
              }
              nodeVisitsJSON.append(nodeVisitKeyName, nodeVisitJSON);
            }
          } catch (JSONException e) {
            e.printStackTrace();
          }
        }
      }
    } else {
      Vector<String> stepsRetrieved = new Vector<String>();

      /*
       * loop through the step work objects from latest to earliest
       * because we are only looking for the latest revision for each
       * step
       */
      for (int x = stepWorkList.size() - 1; x >= 0; x--) {
        StepWork stepWork = stepWorkList.get(x);

        String data = stepWork.getData();
        if (data == null || "".equals(data)) {
          // if for some reason data is empty (e.g. bug post), ignore this stepwork
          continue;
        }
        String stepWorkId = stepWork.getId().toString();
        String nodeType = stepWork.getNode().getNodeType();
        String nodeId = stepWork.getNode().getNodeId();
        if (!stepsRetrieved.contains(nodeId)) {

          /*
           * check that the node type is one that we want if a list of
           * desired node types was provided. if there is no list of
           * node types, we will accept all node types
           */
          if (nodeTypesList == null || (nodeTypesList != null && nodeTypesList.contains(nodeType))) {
            JSONObject nodeVisitJSON = new JSONObject(data);
            JSONArray nodeStates = (JSONArray) nodeVisitJSON.get("nodeStates");

            /*
             * check if there were any node states and only add the nodevisit if
             * there were node states. if the node visit is for HtmlNode or OutsideUrlNode,
             * we will add the node visit since those step types never have
             * node states.
             */
            if (nodeStates != null && nodeStates.length() > 0 ||
                ("HtmlNode".equals(nodeType) || "OutsideUrlNode".equals(nodeType) || "IdeaBasketNode".equals(nodeType))) {
              nodeVisitJSON.put("stepWorkId", stepWorkId);
              nodeVisitJSON.put("id", Long.valueOf(stepWorkId));
              nodeVisitJSON.put("visitPostTime", stepWork.getPostTime().getTime());
              String nodeVisitKeyName = "visitedNodes";  // used in WISE4
              if (run != null) {
                org.wise.portal.domain.project.Project project = run.getProject();
                if (project != null) {
                  if (project.getWiseVersion().equals(5)) {
                    nodeVisitKeyName = "nodeVisits";  // used in WISE5
                  }
                }
              }
              nodeVisitsJSON.append(nodeVisitKeyName, nodeVisitJSON);
              stepsRetrieved.add(nodeId);
            }
          }
        }
      }
    }
    return nodeVisitsJSON;
  }

  @RequestMapping(method = RequestMethod.POST)
  public ModelAndView doPost(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    studentMaxWorkSize = Integer.valueOf(appProperties.getProperty("student_max_work_size", "512000"));
    User signedInUser = ControllerUtil.getSignedInUser();
    String runId = request.getParameter("runId");
    String userId = request.getParameter("userId");
    String periodId = request.getParameter("periodId");
    String data = request.getParameter("data");
    String annotationJSONString = request.getParameter("annotation");
    String annotationsJSONString = request.getParameter("annotations");
    String stepWorkId = request.getParameter("id");

    if (runId == null || userId == null || data == null) {
      response.sendError(HttpServletResponse.SC_BAD_REQUEST, "post data: parameter(s) missing.");
      return null;
    }

    Long runIdLong = null;
    if (runId != null) {
      runIdLong = new Long(runId);
    }

    Long periodIdLong = null;
    if (periodId != null) {
      periodIdLong = new Long(periodId);
    }

    Long workgroupId = null;
    if (userId != null) {
      try {
        workgroupId = new Long(userId);
      } catch (NumberFormatException e) {

      }
    }

    boolean allowedAccess = false;

    /*
     * teachers can not make a request
     * students can make a request if they are in the run and in the workgroup
     */
    if (SecurityUtils.isStudent(signedInUser) && SecurityUtils.isUserInRun(signedInUser, runIdLong) &&
        SecurityUtils.isUserInWorkgroup(signedInUser, workgroupId)) {
      allowedAccess = true;
    }

    if (!allowedAccess) {
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return null;
    }

    UserInfo userInfo = (UserInfo) vleService.getUserInfoOrCreateByWorkgroupId(workgroupId);
    JSONObject nodeVisitJSON = null;
    response.setContentType("application/json");

    try {
      nodeVisitJSON = new JSONObject(data);
      Calendar now = Calendar.getInstance();
      Timestamp postTime = new Timestamp(now.getTimeInMillis());
      String nodeId = VLEDataUtils.getNodeId(nodeVisitJSON);
      Timestamp startTime = new Timestamp(new Long(VLEDataUtils.getVisitStartTime(nodeVisitJSON)));
      String visitEndTime = VLEDataUtils.getVisitEndTime(nodeVisitJSON);
      Timestamp endTime = null;
      if (visitEndTime != null && !visitEndTime.equals("null") && !visitEndTime.equals("")) {
        endTime = new Timestamp(new Long(visitEndTime));
      }

      String nodeType = VLEDataUtils.getNodeType(nodeVisitJSON);
      JSONArray nodeStates = VLEDataUtils.getNodeStates(nodeVisitJSON);
      for (int x = 0; x < nodeStates.length(); x++) {
        Object nodeStateObject = nodeStates.get(x);
        if (!(nodeStateObject instanceof JSONObject)) {
          response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Element in nodeStates array is not an object");
          return null;
        }
      }

      if (request.getContentLength() > studentMaxWorkSize) {  // posted data must not exceed STUDENT_MAX_WORK_SIZE
        System.err.println("Post data too large (>"+studentMaxWorkSize+" bytes). NodeType: "+nodeType+" RunId: "+ runId+ " userId:"+ userId + " nodeId: "+nodeId + " contentLength: "+request.getContentLength());
        response.sendError(HttpServletResponse.SC_BAD_REQUEST, "post data: too large (>"+studentMaxWorkSize+" bytes)");
        return null;
      }

      StepWork stepWork = null;

      stepWork = vleService.getStepWorkByUserIdAndData(userInfo,nodeVisitJSON.toString());
      if (stepWork != null) {
        // this node visit has already been saved. return id and postTime and exit.
        //create a JSONObject to contain the step work id and post time
        JSONObject jsonResponse = new JSONObject();
        jsonResponse.put("id", stepWork.getId());
        if (endTime != null) {
          if (stepWork.getPostTime() != null) {
            jsonResponse.put("visitPostTime", stepWork.getPostTime().getTime());
          }
        }
        response.getWriter().print(jsonResponse.toString());
        return null;
      }

      if (stepWorkId != null && !stepWorkId.equals("") && !stepWorkId.equals("undefined")) {
        long stepWorkIdLong = Long.parseLong(stepWorkId);
        stepWork = (StepWork) vleService.getStepWorkById(stepWorkIdLong);
      } else if (nodeType != null && nodeType != "") {
        stepWork = new StepWork();
      }

      Node node = getOrCreateNode(runId, nodeId, nodeType);
      if (stepWork != null && userInfo != null && node != null) {
        stepWork.setUserInfo(userInfo);
        stepWork.populateData(nodeVisitJSON);
        stepWork.setNode(node);
        stepWork.setPostTime(postTime);
        stepWork.setStartTime(startTime);
        stepWork.setEndTime(endTime);
        vleService.saveStepWork(stepWork);

        long newStepWorkId = stepWork.getId();
        long newPostTime = postTime.getTime();
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
        if (endTime != null) {
          jsonResponse.put("visitPostTime", newPostTime);
        }

        String cRaterItemId = null;
        String cRaterItemType = "CRATER";
        boolean isCRaterSubmit = false;
        try {
          if (nodeVisitJSON != null) {
            JSONArray nodeStateArray = nodeVisitJSON.getJSONArray("nodeStates");
            if (nodeStateArray != null) {
              if (nodeStateArray.length() > 0) {
                JSONObject nodeStateObj = nodeStateArray.getJSONObject(nodeStateArray.length()-1);

                if (nodeStateObj.has("cRaterItemId")) {
                  cRaterItemId = nodeStateObj.getString("cRaterItemId");
                  if (nodeStateObj.has("isCRaterSubmit")) {
                    isCRaterSubmit = nodeStateObj.getBoolean("isCRaterSubmit");
                  }
                  if (nodeStateObj.has("cRaterItemType")) {
                    cRaterItemType = nodeStateObj.getString("cRaterItemType");
                  }
                }
              }
            }
          }
        } catch (JSONException e) {
          e.printStackTrace();
        }

        try {
          if (VLEDataUtils.isSubmitForPeerReview(nodeVisitJSON)) {
            PeerReviewWork peerReviewWork = null;
            peerReviewWork = vleService.getPeerReviewWorkByRunPeriodNodeWorkerUserInfo(runIdLong, periodIdLong, node, userInfo);
            if (peerReviewWork == null) {
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
            vleService.getOrCreatePeerReviewGateByRunIdPeriodIdNodeId(runIdLong, periodIdLong, node);
          }
        } catch (JSONException e) {
          e.printStackTrace();
        }

        if (annotationJSONString != null && !annotationJSONString.equals("null")) {
          try {
            JSONObject annotationJSONObject = new JSONObject(annotationJSONString);
            Long annotationRunId = annotationJSONObject.optLong("runId");
            Long toWorkgroup = annotationJSONObject.optLong("toWorkgroup");
            Long fromWorkgroup = annotationJSONObject.optLong("fromWorkgroup");
            String type = annotationJSONObject.optString("type");
            annotationJSONObject.put("stepWorkId", stepWork.getId());
            annotationJSONObject.put("postTime", postTime.getTime());
            saveAnnotationObject(annotationRunId, toWorkgroup, fromWorkgroup, type, annotationJSONObject, stepWork, postTime);
            jsonResponse.put("annotationPostTime", postTime.getTime());
          } catch (JSONException e) {
            e.printStackTrace();
          }
        }

        if (annotationsJSONString != null && !annotationsJSONString.equals("null")) {
          try {
            JSONArray annotationsJSONArray = new JSONArray(annotationsJSONString);
            for (int a = 0; a < annotationsJSONArray.length(); a++) {
              JSONObject annotationJSONObject = annotationsJSONArray.optJSONObject(a);
              Long annotationRunId = annotationJSONObject.optLong("runId");
              Long toWorkgroup = annotationJSONObject.optLong("toWorkgroup");
              Long fromWorkgroup = annotationJSONObject.optLong("fromWorkgroup");
              String type = annotationJSONObject.optString("type");
              annotationJSONObject.put("stepWorkId", stepWork.getId());
              annotationJSONObject.put("postTime", postTime.getTime());
              saveAnnotationObject(annotationRunId, toWorkgroup, fromWorkgroup, type, annotationJSONObject, stepWork, postTime);
              jsonResponse.put("annotationPostTime", postTime.getTime());
            }
          } catch (JSONException e) {
            e.printStackTrace();
          }
        }

        response.getWriter().print(jsonResponse.toString());
        if (isSendToWebSockets(nodeVisitJSON)) {
          nodeVisitJSON.put("id", newStepWorkId);
        }
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
   * Check if the node visit should be sent to websockets
   * @param nodeVisit the node visit JSON object
   * @return whether we should send the node visit to websockets
   */
  private boolean isSendToWebSockets(JSONObject nodeVisit) {
    boolean result = false;
    if (nodeVisit != null) {
      String messageType = nodeVisit.optString("messageType");
      String messageParticipants = nodeVisit.optString("messageParticipants");
      if (messageType != null && !messageType.equals("") && messageParticipants != null && !messageParticipants.equals("")) {
        result = true;
      }
    }
    return result;
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

  /**
   * Save the annotation. If the annotation does not exist we will create a new annotation.
   * If the annotation already exists we will overwrite the data field in the existing
   * annotation.
   * @param runId the run id
   * @param toWorkgroup the to workgroup id
   * @param fromWorkgroup the from workgroup id
   * @param type the annotation type
   * @param annotationValue the JSONObject we will save into the data field
   * @param stepWork the step work object this annotation is related to
   * @param postTime the time this annotation was posted
   * @return the annotation
   */
  private Annotation saveAnnotationObject(Long runId, Long toWorkgroup, Long fromWorkgroup,
      String type, JSONObject annotationValue, StepWork stepWork, Timestamp postTime) {
    Annotation annotation = null;
    UserInfo toUserInfo = vleService.getUserInfoOrCreateByWorkgroupId(toWorkgroup);
    UserInfo fromUserInfo = null;
    if (fromWorkgroup != null && fromWorkgroup != -1) {
      fromUserInfo = vleService.getUserInfoOrCreateByWorkgroupId(toWorkgroup);
    }
    annotation = vleService.getAnnotationByFromUserInfoToUserInfoStepWorkType(fromUserInfo, toUserInfo, stepWork, type);
    if (annotation == null) {
      annotation = new Annotation(type);
      annotation.setRunId(runId);
      annotation.setToUser(toUserInfo);
      annotation.setFromUser(fromUserInfo);
      annotation.setStepWork(stepWork);
      annotation.setData(annotationValue.toString());
      annotation.setPostTime(postTime);
      vleService.saveAnnotation(annotation);
    } else {
      annotation.setData(annotationValue.toString());
      annotation.setPostTime(postTime);
      vleService.saveAnnotation(annotation);
    }
    return annotation;
  }

  /*
   * Get all the StepWorks for the workgroup ids
   * @param userIdArray a list of workgroup ids
   * @return a list of StepWork objects
   */
  private List<StepWork> getAllStepWorks(String[] userIdArray) {
    ArrayList<Long> workgroupIds = new ArrayList<Long>(userIdArray.length);
    for (int x = 0; x < userIdArray.length; x++) {
      String userId = userIdArray[x];
      Long workgroupId = new Long(userId);
      workgroupIds.add(workgroupId);
    }
    List<UserInfo> userInfos = vleService.getUserInfosByWorkgroupIds(workgroupIds);
    return vleService.getStepWorksByUserInfos(userInfos);
  }
}
