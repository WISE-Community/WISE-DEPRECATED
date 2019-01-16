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
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;
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
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.presentation.web.controllers.run.RunUtil;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.vle.VLEService;
import org.wise.portal.service.workgroup.WorkgroupService;
import org.wise.vle.domain.annotation.Annotation;
import org.wise.vle.domain.cRater.CRaterRequest;
import org.wise.vle.domain.node.Node;
import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.webservice.crater.CRaterHttpClient;
import org.wise.vle.domain.work.StepWork;

/**
 * Controllers for handling Annotation GET and POST
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
@Controller
@RequestMapping("/annotation")
public class VLEAnnotationController {

  @Autowired
  private VLEService vleService;

  @Autowired
  private Properties wiseProperties;

  @Autowired
  private RunService runService;

  @Autowired
  private WorkgroupService workgroupService;

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
  @RequestMapping(method = RequestMethod.GET)
  public void doGetJSON(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    User signedInUser = ControllerUtil.getSignedInUser();
    String requestedType = request.getParameter("type");
    String fromWorkgroupIdStr = request.getParameter("fromWorkgroup");
    String fromWorkgroupIdsStr = request.getParameter("fromWorkgroups");
    String toWorkgroupIdStr = request.getParameter("toWorkgroup");
    String runId = request.getParameter("runId");
    String stepWorkIdStr = request.getParameter("stepWorkId");
    String isStudentStr = request.getParameter("isStudent");
    String annotationType = request.getParameter("annotationType");
    String nodeStateIdStr = request.getParameter("nodeStateId");
    String periodIdStr = request.getParameter("periodId");
    String nodeId = request.getParameter("nodeId");
    String cRaterScoringUrl = wiseProperties.getProperty("cRater_scoring_url");
    String cRaterClientId = wiseProperties.getProperty("cRater_client_id");
    String cRaterPassword = wiseProperties.getProperty("cRater_password");
    Vector<JSONObject> flaggedAnnotationsList = new Vector<JSONObject>();
    HashMap<Long, Long> classmateWorkgroupIdToPeriodIdMap = new HashMap<Long, Long>();

    Long periodId = null;
    if (periodIdStr != null) {
      try {
        periodId = new Long(periodIdStr);
      } catch(NumberFormatException e) {
        e.printStackTrace();
      }
    }

    Long longRunId = null;
    if (runId != null) {
      longRunId = Long.parseLong(runId);
    }

    Long stepWorkId = null;
    if (stepWorkIdStr != null) {
      stepWorkId = Long.parseLong(stepWorkIdStr);
    }

    boolean isStudent = false;
    if (isStudentStr != null) {
      isStudent = Boolean.parseBoolean(isStudentStr);
    }

    Long nodeStateId = null;
    if (nodeStateIdStr != null) {
      nodeStateId = Long.parseLong(nodeStateIdStr);
    }

    Long runIdLong = null;
    if (runId != null) {
      try {
        runIdLong = new Long(runId);
      } catch(NumberFormatException e) {
        e.printStackTrace();
      }
    }

    Long fromWorkgroupId = null;
    if (fromWorkgroupIdStr != null) {
      try {
        fromWorkgroupId = new Long(fromWorkgroupIdStr);
      } catch(NumberFormatException e) {
        e.printStackTrace();
      }
    }

    Long toWorkgroupId = null;
    if (toWorkgroupIdStr != null) {
      try {
        toWorkgroupId = new Long(toWorkgroupIdStr);
      } catch(NumberFormatException e) {
        e.printStackTrace();
      }
    }

    boolean allowedAccess = false;

    /*
     * teachers can get all annotations if they own the run
     * students can get annotations that are from them and to them, or are for
     * CRater or flags
     */

    if (SecurityUtils.isAdmin(signedInUser)) {
      allowedAccess = true;
    } else if (SecurityUtils.isTeacher(signedInUser) && SecurityUtils.isUserOwnerOfRun(signedInUser, runIdLong)) {
      allowedAccess = true;
    } else if (SecurityUtils.isStudent(signedInUser) && SecurityUtils.isUserInRun(signedInUser, runIdLong)) {
      if (SecurityUtils.isUserInWorkgroup(signedInUser, fromWorkgroupId) || SecurityUtils.isUserInWorkgroup(signedInUser, toWorkgroupId)) {
        allowedAccess = true;
      } else if ("cRater".equals(annotationType)) {
        StepWork stepWork = vleService.getStepWorkById(stepWorkId);
        UserInfo stepWorkUserInfo = stepWork.getUserInfo();
        Long stepWorkWorkgroupId = stepWorkUserInfo.getWorkgroupId();
        if (SecurityUtils.isUserInWorkgroup(signedInUser, stepWorkWorkgroupId)) {
          allowedAccess = true;
        }
      } else if ("flag".equals(requestedType) || "inappropriateFlag".equals(requestedType)) {
        if (SecurityUtils.isUserInPeriod(signedInUser, runIdLong, periodId)) {
          allowedAccess = true;
        }
      }
    }

    if (!allowedAccess) {
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }

    /*
     * retrieval of periods is only required when students request flagged work
     * because we only want students to see flagged work from their own period
     */
    if ((requestedType.equals("flag") || requestedType.equals("inappropriateFlag")) && isStudent) {
      try {
        Run run = null;
        try {
          run = runService.retrieveById(longRunId);
        } catch (ObjectNotFoundException e) {
          e.printStackTrace();
        }
        JSONArray classmateUserInfos = RunUtil.getClassmateUserInfos(run, workgroupService, runService);
        for (int x = 0; x < classmateUserInfos.length(); x++) {
          JSONObject classmateUserInfo = classmateUserInfos.getJSONObject(x);
          long classmateWorkgroupId = classmateUserInfo.getLong("workgroupId");
          long classmatePeriodId = classmateUserInfo.getLong("periodId");
          classmateWorkgroupIdToPeriodIdMap.put(classmateWorkgroupId, classmatePeriodId);
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    List<Annotation> annotationList = null;
    Annotation annotation = null;
    if (requestedType == null ||
        (requestedType.equals("annotation") && !"cRater".equals(annotationType) && !"run".equals(annotationType)) ) {
      if (fromWorkgroupIdStr != null && stepWorkId != null) {
        UserInfo fromWorkgroup = vleService.getUserInfoByWorkgroupId(new Long(fromWorkgroupIdStr));
        StepWork stepWork = (StepWork) vleService.getStepWorkById(stepWorkId);
        annotation = vleService.getAnnotationByUserInfoAndStepWork(fromWorkgroup, stepWork, null);
      } else if (fromWorkgroupIdsStr != null && toWorkgroupIdStr != null) {
        /*
         * user is requesting all annotations to toWorkgroup and from any fromWorkgroup
         * in the list of fromWorkgroups
         */
        UserInfo toWorkgroup = vleService.getUserInfoOrCreateByWorkgroupId(new Long(toWorkgroupIdStr));
        String[] split = fromWorkgroupIdsStr.split(",");
        List<String> fromWorkgroupIds = Arrays.asList(split);
        List<UserInfo> fromWorkgroups = vleService.getUserInfoByWorkgroupIds(fromWorkgroupIds);
        List<StepWork> workByToWorkgroup = vleService.getStepWorksByUserInfo(toWorkgroup);
        annotationList = vleService.getAnnotationByFromWorkgroupsAndWorkByToWorkgroup(fromWorkgroups, workByToWorkgroup, Annotation.class);
        annotationList.addAll(vleService.getAnnotationByToUserType(toWorkgroup, "cRater"));
        List<String> annotationTypes = new ArrayList<String>();
        annotationTypes.add("score");
        annotationTypes.add("comment");
        List<Annotation> annotationByFromWorkgroupsToWorkgroupWithoutWork =
            vleService.getAnnotationByFromWorkgroupsToWorkgroupWithoutWork(fromWorkgroups, toWorkgroup, annotationTypes);
        annotationList.addAll(annotationByFromWorkgroupsToWorkgroupWithoutWork);
        List<Annotation> autoGradedAnnotations = vleService.getAnnotationByToUserType(toWorkgroup, "autoGraded");
        annotationList.addAll(autoGradedAnnotations);
        List<Annotation> notificationAnnotations = vleService.getAnnotationByToUserType(toWorkgroup, "notification");
        annotationList.addAll(notificationAnnotations);
      } else if (fromWorkgroupIdStr != null || toWorkgroupIdStr != null) {
        UserInfo fromWorkgroup = null;
        UserInfo toWorkgroup = null;
        if (fromWorkgroupIdStr != null) {
          fromWorkgroup = vleService.getUserInfoByWorkgroupId(new Long(fromWorkgroupIdStr));
        }
        if (toWorkgroupIdStr != null) {
          toWorkgroup = vleService.getUserInfoByWorkgroupId(new Long(toWorkgroupIdStr));
        }

        List<StepWork> workByToWorkgroup = vleService.getStepWorksByUserInfo(toWorkgroup);
        annotationList = vleService.getAnnotationByFromWorkgroupAndWorkByToWorkgroup(fromWorkgroup, workByToWorkgroup, Annotation.class);
      } else if (runId != null && nodeId != null) {
        annotationList = (List<Annotation>) vleService.getAnnotationsByRunIdAndNodeId(longRunId, nodeId);
      } else if (runId != null) {
        annotationList = (List<Annotation>) vleService.getAnnotationByRunId(longRunId, Annotation.class);
      } else {
        annotationList = (List<Annotation>) vleService.getAnnotationList();
      }
    } else if (requestedType.equals("flag") || requestedType.equals("inappropriateFlag")) {
      Map<String, String[]> map = request.getParameterMap();
      String mapNodeId = null;
      String type = null;
      if (map.containsKey("nodeId")) {
        mapNodeId = map.get("nodeId")[0];
      }

      if (map.containsKey("type")) {
        type = map.get("type")[0];
      }

      /*
       * get the flags based on the parameters that were passed in the request.
       * this will return the flag annotations ordered from oldest to newest
       */
      if (runId != null && mapNodeId != null) {
        Node node = vleService.getNodeByNodeIdAndRunId(mapNodeId, runId, true);
        List<StepWork> stepWorkList = vleService.getStepWorksByNode(node);
        annotationList = vleService.getAnnotationByStepWorkList(stepWorkList);
      } else if (runId != null && type != null) {
        annotationList = (List<Annotation>) vleService.getAnnotationByRunIdAndType(Long.parseLong(runId), type, Annotation.class);
      } else if (runId != null) {
        annotationList = (List<Annotation>) vleService.getAnnotationByRunId(Long.parseLong(runId), Annotation.class);
      }
    } else if ("run".equals(annotationType)) {
      String[] split = fromWorkgroupIdsStr.split(",");
      List<String> fromWorkgroupIds = Arrays.asList(split);
      List<UserInfo> fromWorkgroups = vleService.getUserInfoByWorkgroupIds(fromWorkgroupIds);
      UserInfo toWorkgroup = null;
      if (toWorkgroupIdStr != null) {
        toWorkgroup = vleService.getUserInfoByWorkgroupId(new Long(toWorkgroupIdStr));
      }
      annotationList = vleService.getAnnotationByFromUserToUserType(fromWorkgroups, toWorkgroup, annotationType);
    }

    if ("annotation".equals(requestedType) && "cRater".equals(annotationType)) {
      annotation = getCRaterAnnotation(vleService, nodeStateId, runId, stepWorkId, annotationType,
          cRaterScoringUrl, cRaterPassword, cRaterClientId);
    }

    JSONObject annotationsJSONObj = null;
    if (annotationList != null) {
      annotationsJSONObj = new JSONObject();

      for (Annotation annotationObj : annotationList) {
        try {
          JSONObject dataJSONObj = new JSONObject(annotationObj.getData());
          String tempAnnotationType = annotationObj.getType();
          dataJSONObj.put("postTime", annotationObj.getPostTime().getTime());

          /*
           * if this is a student making the request we will add the stepWork data
           * to each of the flags so they can see the work that was flagged
           */
          if ("flag".equals(requestedType) && isStudent) {
            if ("flag".equals(tempAnnotationType)) {
              String flagStepWorkId = dataJSONObj.getString("stepWorkId");
              StepWork flagStepWork = vleService.getStepWorkByStepWorkId(new Long(flagStepWorkId));
              UserInfo flaggedWorkUserInfo = flagStepWork.getUserInfo();
              Long flaggedWorkgroupId = flaggedWorkUserInfo.getWorkgroupId();
              Long flaggedPeriodId = classmateWorkgroupIdToPeriodIdMap.get(flaggedWorkgroupId);
              if (periodId != null && flaggedPeriodId != null && periodId.equals(flaggedPeriodId)) {
                JSONObject flagStepWorkData = new JSONObject(flagStepWork.getData());
                if (dataJSONObj.has("value") && dataJSONObj.getString("value").equals("flagged")) {
                  dataJSONObj.put("data", flagStepWorkData);
                  flaggedAnnotationsList.add(dataJSONObj);
                } else {
                  /*
                   * loop through all the flagged annotations we have already obtained
                   * to remove the annotation that was unflagged
                   */
                  Iterator<JSONObject> flaggedAnnotationsIterator = flaggedAnnotationsList.iterator();
                  while(flaggedAnnotationsIterator.hasNext()) {
                    JSONObject nextFlaggedAnnotation = flaggedAnnotationsIterator.next();
                    if (nextFlaggedAnnotation.has("toWorkgroup") && dataJSONObj.has("toWorkgroup") && nextFlaggedAnnotation.getString("toWorkgroup").equals(dataJSONObj.getString("toWorkgroup")) &&
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
      if ((requestedType.equals("flag") || requestedType.equals("inappropriateFlag")) && isStudent) {
        for (JSONObject flagAnnotationDataJSONObj : flaggedAnnotationsList) {
          try {
            String flaggedRunId = flagAnnotationDataJSONObj.getString("runId");
            String flaggedNodeId = flagAnnotationDataJSONObj.getString("nodeId");
            String flaggedToWorkgroup = flagAnnotationDataJSONObj.getString("toWorkgroup");
            Node node = vleService.getNodeByNodeIdAndRunId(flaggedNodeId, flaggedRunId);
            UserInfo studentWorkgroup = vleService.getUserInfoByWorkgroupId(new Long(flaggedToWorkgroup));

            /*
             * get the step works the student did for the node. the list will be
             * ordered from newest to oldest
             */
            List<StepWork> stepWorks = vleService.getStepWorksByUserInfoAndNode(studentWorkgroup, node);
            JSONObject latestStepWorkDataJSONObj = null;
            for(int x = 0; x < stepWorks.size(); x++) {
              StepWork stepWork = stepWorks.get(x);
              String stepWorkData = stepWork.getData();
              latestStepWorkDataJSONObj = new JSONObject(stepWorkData);
              JSONArray nodeStates = latestStepWorkDataJSONObj.getJSONArray("nodeStates");
              if (nodeStates.length() > 0) {
                /*
                 * node states is not empty so we have found the newest
                 * step work that contains actual work
                 */
                break;
              }
            }

            if (latestStepWorkDataJSONObj != null) {
              flagAnnotationDataJSONObj.put("data", latestStepWorkDataJSONObj);
              annotationsJSONObj.append("annotationsArray", flagAnnotationDataJSONObj);
            }
          } catch (JSONException e) {
            e.printStackTrace();
          }
        }
      }
    } else if (annotation != null) {
      try {
        annotationsJSONObj = new JSONObject(annotation.getData());
        annotationsJSONObj.put("postTime", annotation.getPostTime().getTime());
      } catch (JSONException e) {
        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "error retrieving annotations");
        e.printStackTrace();
      }
    }

    if (annotationsJSONObj != null) {
      response.getWriter().write(annotationsJSONObj.toString());
    } else {
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
   * @return CRater annotation for the specified stepwork, or null if there was an error
   * getting the CRater response
   */
  public static Annotation getCRaterAnnotation(VLEService vleService, Long nodeStateId,
      String runId, Long stepWorkId, String annotationType, String cRaterScoringUrl, String cRaterPassword,
      String cRaterClientId) {
    String cRaterResponseId = stepWorkId.toString();
    Annotation annotation = null;
    StepWork stepWork = vleService.getStepWorkByStepWorkId(stepWorkId);
    annotation = vleService.getCRaterAnnotationByStepWork(stepWork);

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
          JSONObject nodeStateByTimestamp = stepWork.getNodeStateByTimestamp(nodeStateId);
          String studentResponse = "";
          Object object = nodeStateByTimestamp.get("response");
          if (object instanceof JSONArray) {
            studentResponse = ((JSONArray) object).getString(0);
          } else if (object instanceof String) {
            studentResponse = (String) object;
          }

          String cRaterItemId = stepWork.getCRaterItemId();
          String cRaterResponseXML = CRaterHttpClient.getCRaterScoringResponse(cRaterScoringUrl, cRaterPassword, cRaterClientId, cRaterItemId, cRaterResponseId, studentResponse);
          if (cRaterResponseXML != null) {
            JSONObject cRaterResponseJSONObj = new JSONObject();
            JSONObject studentNodeStateResponse = stepWork.getNodeStateByTimestamp(nodeStateId);
            cRaterResponseJSONObj = Annotation.createCRaterNodeStateAnnotation(
                nodeStateId,
                CRaterHttpClient.getScore(cRaterResponseXML),
                CRaterHttpClient.getConcepts(cRaterResponseXML),
                studentNodeStateResponse,
                cRaterResponseXML);

            annotation.appendNodeStateAnnotation(cRaterResponseJSONObj);
            vleService.saveAnnotation(annotation);
            CRaterRequest cRaterRequest = vleService.getCRaterRequestByStepWorkIdNodeStateId(stepWork,nodeStateId);
            if (cRaterRequest != null) {
              Calendar cRaterRequestCompletedTime = Calendar.getInstance();
              cRaterRequest.setTimeCompleted(new Timestamp(cRaterRequestCompletedTime.getTimeInMillis()));
              cRaterRequest.setCRaterResponse(cRaterResponseXML);
              vleService.saveCRaterRequest(cRaterRequest);
            }
          }
        } catch (JSONException e) {
          e.printStackTrace();
        }

      }
    } else {
      try {
        JSONObject nodeStateByTimestamp = stepWork.getNodeStateByTimestamp(nodeStateId);
        String studentResponse = "";
        Object object = nodeStateByTimestamp.get("response");
        if (object instanceof JSONArray) {
          studentResponse = ((JSONArray) object).getString(0);
        } else if (object instanceof String) {
          studentResponse = (String) object;
        }

        String cRaterItemId = stepWork.getCRaterItemId();
        String cRaterResponseXML = CRaterHttpClient.getCRaterScoringResponse(cRaterScoringUrl, cRaterPassword, cRaterClientId, cRaterItemId, cRaterResponseId, studentResponse);
        if (cRaterResponseXML != null) {
          if (cRaterResponseXML.contains("<error code=")) {
          } else {
            Calendar now = Calendar.getInstance();
            Timestamp postTime = new Timestamp(now.getTimeInMillis());
            Node node = stepWork.getNode();
            String nodeId = node.getNodeId();
            String type = annotationType;

            Long workgroupId = stepWork.getUserInfo().getWorkgroupId();
            String toWorkgroup = workgroupId.toString();
            UserInfo toUser = vleService.getUserInfoByWorkgroupId(workgroupId);
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

            annotation = new Annotation(stepWork, fromUser, toUser, new Long(runId), postTime, type, dataJSONObj.toString(), nodeId);
            vleService.saveAnnotation(annotation);
            CRaterRequest cRaterRequest = vleService.getCRaterRequestByStepWorkIdNodeStateId(stepWork,nodeStateId);
            if (cRaterRequest != null) {
              Calendar cRaterRequestCompletedTime = Calendar.getInstance();
              cRaterRequest.setTimeCompleted(new Timestamp(cRaterRequestCompletedTime.getTimeInMillis()));
              cRaterRequest.setCRaterResponse(cRaterResponse);
              vleService.saveCRaterRequest(cRaterRequest);
            }
          }
        } else {
          // there was an error connecting to the CRater servlet
          // do nothing so this method will return null
          // increment fail count
          CRaterRequest cRaterRequest = vleService.getCRaterRequestByStepWorkIdNodeStateId(stepWork, nodeStateId);
          if (cRaterRequest != null) {
            cRaterRequest.setFailCount(cRaterRequest.getFailCount()+1);
            vleService.saveCRaterRequest(cRaterRequest);
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
  @RequestMapping(method=RequestMethod.POST)
  private void doPostJSON(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    User signedInUser = ControllerUtil.getSignedInUser();
    String runId = request.getParameter("runId");
    String nodeId = request.getParameter("nodeId");
    String toWorkgroupIdStr = request.getParameter("toWorkgroup");
    String fromWorkgroupIdStr = request.getParameter("fromWorkgroup");
    String type = request.getParameter("annotationType");
    String value = request.getParameter("value");
    String stepWorkId = request.getParameter("stepWorkId");
    String action = request.getParameter("action");
    String periodId = request.getParameter("periodId");

    Long runIdLong = null;
    if (runId != null) {
      try {
        runIdLong = new Long(runId);
      } catch(NumberFormatException e) {
        e.printStackTrace();
      }
    }

    Long fromWorkgroupId = null;
    if (fromWorkgroupIdStr != null) {
      try {
        fromWorkgroupId = new Long(fromWorkgroupIdStr);
      } catch(NumberFormatException e) {
        e.printStackTrace();
      }
    }

    Long toWorkgroupId = null;
    if (toWorkgroupIdStr != null) {
      try {
        toWorkgroupId = new Long(toWorkgroupIdStr);
      } catch(NumberFormatException e) {
        e.printStackTrace();
      }
    }

    Long stepWorkIdLong = null;
    if (stepWorkId != null) {
      stepWorkIdLong = new Long(stepWorkId);
    }

    boolean allowedAccess = false;

    /*
     * teachers can post an annotation if they own the run
     * students can post an annotation if it is from them
     */
    if (SecurityUtils.isTeacher(signedInUser) && SecurityUtils.isUserOwnerOfRun(signedInUser, runIdLong)) {
      allowedAccess = true;
    } else if (SecurityUtils.isStudent(signedInUser) && SecurityUtils.isUserInRun(signedInUser, runIdLong)) {
      if (SecurityUtils.isUserInWorkgroup(signedInUser, fromWorkgroupId) ||
        SecurityUtils.isUserInWorkgroup(signedInUser, toWorkgroupId)) {
        allowedAccess = true;
      }
    }

    if (!allowedAccess) {
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }

    Calendar now = Calendar.getInstance();
    Timestamp postTime = new Timestamp(now.getTimeInMillis());
    StepWork stepWork = null;

    if (stepWorkIdLong != null) {
      stepWork = (StepWork) vleService.getStepWorkById(stepWorkIdLong);
    }

    UserInfo fromUserInfo = null;

    if (fromWorkgroupId != -1) {
      fromUserInfo = vleService.getUserInfoOrCreateByWorkgroupId(fromWorkgroupId);
    }

    UserInfo toUserInfo = vleService.getUserInfoOrCreateByWorkgroupId(toWorkgroupId);
    JSONObject annotationEntryJSONObj = new JSONObject();
    try {
      annotationEntryJSONObj.put("runId", runIdLong);
      annotationEntryJSONObj.put("nodeId", nodeId);
      annotationEntryJSONObj.put("toWorkgroup", toWorkgroupId);
      annotationEntryJSONObj.put("fromWorkgroup", fromWorkgroupId);
      annotationEntryJSONObj.put("stepWorkId", stepWorkIdLong);
      annotationEntryJSONObj.put("type", type);

      try {
        JSONObject valueJSONObject = new JSONObject(value);
        annotationEntryJSONObj.put("value", valueJSONObject);
      } catch (JSONException e1) {
        try {
          JSONArray valueJSONObject = new JSONArray(value);
          annotationEntryJSONObj.put("value", valueJSONObject);
        } catch (JSONException e2) {
          /*
           * we were unable to convert the value into a JSONObject
           * or JSONArray so we will just use the unconverted value
           */
          annotationEntryJSONObj.put("value", value);
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }

    Annotation annotation = null;
    if (stepWork != null) {
      annotation = vleService.getAnnotationByFromUserInfoToUserInfoStepWorkType(fromUserInfo, toUserInfo, stepWork, type);
    } else if (nodeId != null) {
      annotation = vleService.getAnnotationByFromUserInfoToUserInfoNodeIdType(fromUserInfo, toUserInfo, nodeId, type);
    } else {
      annotation = vleService.getAnnotationByFromUserInfoToUserInfoType(fromUserInfo, toUserInfo, type);
    }

    if (annotation == null) {
      annotation = new Annotation(type);
      annotation.setFromUser(fromUserInfo);
      if (stepWork != null) {
        annotation.setToUser(stepWork.getUserInfo());
      } else {
        annotation.setToUser(toUserInfo);
      }
      annotation.setStepWork(stepWork);
    }

    annotation.setPostTime(postTime);
    annotation.setData(annotationEntryJSONObj.toString());

    if (runId != null) {
      annotation.setRunId(Long.parseLong(runId));
    }

    if (nodeId != null) {
      annotation.setNodeId(nodeId);
    }

    vleService.saveAnnotation(annotation);
    if (action != null && action.equals("peerReviewAnnotate")) {
      vleService.setPeerReviewAnnotation(new Long(runId), new Long(periodId), stepWork.getNode(), stepWork, fromUserInfo, annotation);
    }
    response.getWriter().print(postTime.getTime());
  }
}
