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
import java.io.PrintWriter;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Properties;
import java.util.Vector;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.opencsv.CSVWriter;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFClientAnchor;
import org.apache.poi.xssf.usermodel.XSSFComment;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.attendance.StudentAttendance;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.ProjectMetadata;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.presentation.web.controllers.run.RunUtil;
import org.wise.portal.service.attendance.StudentAttendanceService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.vle.VLEService;
import org.wise.portal.service.workgroup.WorkgroupService;
import org.wise.vle.domain.annotation.Annotation;
import org.wise.vle.domain.ideabasket.IdeaBasket;
import org.wise.vle.domain.node.Node;
import org.wise.vle.domain.peerreview.PeerReviewWork;
import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.work.StepWork;
import org.wise.vle.utils.FileManager;

/**
 * Handles student work export in XLS format
 * @author Geoffrey Kwan
 */
@Controller
public class VLEGetXLS {

  @Autowired
  private Properties appProperties;

  @Autowired
  private VLEService vleService;

  @Autowired
  private RunService runService;

  @Autowired
  private WorkgroupService workgroupService;

  @Autowired
  private StudentAttendanceService studentAttendanceService;

  private HashMap<String, JSONObject> nodeIdToNodeContent = new HashMap<String, JSONObject>();

  private HashMap<String, JSONObject> nodeIdToNode = new HashMap<String, JSONObject>();

  private HashMap<String, String> nodeIdToNodeTitles = new HashMap<String, String>();

  private HashMap<String, String> nodeIdToNodeTitlesWithPosition = new HashMap<String, String>();

  private HashMap<Integer, String> workgroupIdToPeriodName = new HashMap<Integer, String>();

  private HashMap<Integer, String> workgroupIdToUserIds = new HashMap<Integer, String>();

  private HashMap<Long, JSONArray> workgroupIdToStudentAttendance = new HashMap<Long, JSONArray>();

  private HashMap<Integer, String> periodIdToPeriodName = new HashMap<Integer, String>();

  private HashMap<String, Integer> nodeIdToStepVisitCount = new HashMap<String, Integer>();

  private HashMap<String, Integer> nodeIdToStepRevisionCount = new HashMap<String, Integer>();

  private List<String> nodeIdList = new Vector<String>();

  //the start time of the run (when the run was created)
  private String startTime = "N/A";

  //the end time of the run (when the run was archived)
  private String endTime = "N/A";

  private JSONObject teacherUserInfoJSONObject;
  private String runId = "";
  private String runName = "";
  private String projectId = "";
  private String parentProjectId = "";
  private String projectName = "";

  private List<String> teacherWorkgroupIds = null;
  List<String> customSteps = null;
  int numColumnsToAutoSize = 0;
  private JSONObject projectMetaData = null;
  private static long debugStartTime = 0;
  private String exportType = "";

  //used to keep track of the number of oversized (larger than 32767 char) responses
  private long oversizedResponses = 0;

  //the file type to generate e.g. "xls" or "csv"
  private String fileType = null;

  private CSVWriter csvWriter = null;

  /**
   * Clear the instance variables because only one instance of a servlet
   * is ever created
   */
  private void clearVariables() {
    nodeIdToNodeContent = new HashMap<String, JSONObject>();
    nodeIdToNode = new HashMap<String, JSONObject>();
    nodeIdToNodeTitles = new HashMap<String, String>();
    nodeIdToNodeTitlesWithPosition = new HashMap<String, String>();
    workgroupIdToPeriodName = new HashMap<Integer, String>();
    workgroupIdToUserIds = new HashMap<Integer, String>();
    workgroupIdToStudentAttendance = new HashMap<Long, JSONArray>();
    periodIdToPeriodName = new HashMap<Integer, String>();
    nodeIdToStepVisitCount = new HashMap<String, Integer>();
    nodeIdToStepRevisionCount = new HashMap<String, Integer>();
    nodeIdList = new Vector<String>();
    startTime = "N/A";
    endTime = "N/A";
    teacherUserInfoJSONObject = null;
    runId = "";
    runName = "";
    projectId = "";
    parentProjectId = "";
    projectName = "";
    teacherWorkgroupIds = null;
    customSteps = new Vector<String>();
    numColumnsToAutoSize = 0;
    projectMetaData = null;
    exportType = "";
    oversizedResponses = 0;
    fileType = null;
    csvWriter = null;
  }

  /**
   * Compare two different millisecond times
   *
   * @param time1 the earlier time (smaller)
   * @param time2 the later time (larger)
   *
   * @return the difference between the times in seconds
   */
  private long getDifferenceInSeconds(long time1, long time2) {
    return (time2 - time1) / 1000;
  }

  /**
   * Display the difference between the current time and the
   * start time
   *
   * @param label the label to display with the time difference
   */
  @SuppressWarnings("unused")
  private void displayCurrentTimeDifference(String label) {
    long currentTime = new Date().getTime();
    System.out.println(label + ": " + getDifferenceInSeconds(debugStartTime, currentTime));
  }

  /**
   * Generates and returns an excel xls of exported student data.
   */
  @RequestMapping("/export")
  public ModelAndView doGet(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    User signedInUser = ControllerUtil.getSignedInUser();

    /*
     * clear the instance variables because only one instance of a servlet
     * is ever created
     */
    clearVariables();

    debugStartTime = new Date().getTime();

    runId = request.getParameter("runId");
    runName = request.getParameter("runName");
    projectId = request.getParameter("projectId");
    projectName = request.getParameter("projectName");
    parentProjectId = request.getParameter("parentProjectId");
    exportType = request.getParameter("exportType");

    Long runIdLong = null;
    try {
      runIdLong = new Long(runId);
    } catch(NumberFormatException e) {
      e.printStackTrace();
    }

    Run run = null;
    try {
      if (runId != null) {
        run = runService.retrieveById(runIdLong);
      }
    } catch (ObjectNotFoundException e1) {
      e1.printStackTrace();
    }

    boolean allowedAccess = false;

    /*
     * admins can make a request teachers that are owners of the run can make a request
     */
    if (SecurityUtils.isAdmin(signedInUser)) {
      allowedAccess = true;
    } else if (SecurityUtils.isTeacher(signedInUser) &&
        SecurityUtils.isUserOwnerOfRun(signedInUser, runIdLong)) {
      allowedAccess = true;
    }

    if (!allowedAccess) {
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return null;
    }

    Project projectObj = run.getProject();
    ProjectMetadata metadata = projectObj.getMetadata();
    String projectMetaDataJSONString = null;

    if (metadata != null) {
      projectMetaDataJSONString = metadata.toJSONString();
    }

    String curriculumBaseDir = appProperties.getProperty("curriculum_base_dir");
    String rawProjectUrl = run.getProject().getModulePath();
    String projectPath = curriculumBaseDir + rawProjectUrl;

    JSONArray classmateUserInfosJSONArray = RunUtil.getClassmateUserInfos(run, workgroupService, runService);
    teacherUserInfoJSONObject = RunUtil.getTeacherUserInfo(run, workgroupService);
    JSONArray sharedTeacherUserInfosJSONArray = RunUtil.getSharedTeacherUserInfos(run, workgroupService);
    JSONObject runInfoJSONObject = RunUtil.getRunInfo(run);
    List<StudentAttendance> studentAttendanceList = studentAttendanceService.getStudentAttendanceByRunId(run.getId());
    JSONArray studentAttendanceJSONArray = new JSONArray();

    for (int x = 0; x < studentAttendanceList.size(); x++) {
      StudentAttendance studentAttendance = studentAttendanceList.get(x);
      JSONObject studentAttendanceJSONObj = studentAttendance.toJSONObject();
      studentAttendanceJSONArray.put(studentAttendanceJSONObj);
    }

    if (projectMetaDataJSONString != null) {
      try {
        projectMetaData = new JSONObject(projectMetaDataJSONString);
      } catch (JSONException e2) {
        e2.printStackTrace();
      }
    }

    try {
      if (runInfoJSONObject.has("startTime")) {
        String startTimeString = runInfoJSONObject.getString("startTime");
        if (startTimeString != null && !startTimeString.equals("null") &&
            !startTimeString.equals("")) {
          long startTimeLong = Long.parseLong(startTimeString);
          Timestamp startTimeTimestamp = new Timestamp(startTimeLong);
          startTime = timestampToFormattedString(startTimeTimestamp);
        }
      }

      if (runInfoJSONObject.has("endTime")) {
        String endTimeString = runInfoJSONObject.getString("endTime");
        if (endTimeString != null && !endTimeString.equals("null") && !endTimeString.equals("")) {
          long endTimeLong = Long.parseLong(endTimeString);
          Timestamp endTimeTimestamp = new Timestamp(endTimeLong);
          endTime = timestampToFormattedString(endTimeTimestamp);
        }
      }
    } catch (JSONException e1) {
      e1.printStackTrace();
    }

    parseStudentAttendance(studentAttendanceJSONArray);
    Vector<String> workgroupIds = new Vector<String>();
    fileType = request.getParameter("fileType");
    JSONArray customStepsArray = new JSONArray();

    if (exportType.equals("customLatestStudentWork") || exportType.equals("customAllStudentWork")) {
      String customStepsArrayJSONString = request.getParameter("customStepsArray");
      try {
        customStepsArray = new JSONArray(customStepsArrayJSONString);
        for (int x = 0; x < customStepsArray.length(); x++) {
          String nodeId = customStepsArray.getString(x);
          customSteps.add(nodeId);
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    File projectFile = new File(projectPath);
    HashMap<Integer, Integer> workgroupIdToPeriodId = new HashMap<Integer, Integer>();
    String teacherWorkgroupId = "";
    teacherWorkgroupIds = new ArrayList<String>();
    JSONObject project = null;
    try {
      project = new JSONObject(FileManager.getFileText(projectFile));
      makeNodeIdToNodeTitleAndNodeMap(project);
      makeNodeIdList(project);
      JSONArray nodes = project.getJSONArray("nodes");

      for (int x = 0; x < nodes.length(); x++) {
        JSONObject node = nodes.getJSONObject(x);
        try {
          File nodeFile = new File(projectFile.getParentFile(), node.getString("ref"));
          if (nodeFile.exists()) {
            String fileText = FileManager.getFileText(nodeFile);
            if (fileText != null && !fileText.equals("")) {
              JSONObject nodeContent = new JSONObject(fileText);
              nodeIdToNodeContent.put(node.getString("identifier"), nodeContent);
            }
          }
        } catch(IOException e) {
          e.printStackTrace();
        } catch(JSONException e) {
          e.printStackTrace();
        }
      }

      teacherWorkgroupId = teacherUserInfoJSONObject.getString("workgroupId");
      teacherWorkgroupIds.add(teacherWorkgroupId);

      for (int z = 0; z < sharedTeacherUserInfosJSONArray.length(); z++) {
        JSONObject sharedTeacherJSONObject = (JSONObject) sharedTeacherUserInfosJSONArray.get(z);
        if (sharedTeacherJSONObject != null) {
          if (sharedTeacherJSONObject.has("workgroupId")) {
            String sharedTeacherWorkgroupId = sharedTeacherJSONObject.getString("workgroupId");
            teacherWorkgroupIds.add(sharedTeacherWorkgroupId);
          }
        }
      }

      for (int y = 0; y < classmateUserInfosJSONArray.length(); y++) {
        JSONObject classmate = classmateUserInfosJSONArray.getJSONObject(y);

        if (classmate.has("workgroupId") && !classmate.isNull("workgroupId")) {
          Integer workgroupId = null;
          try {
            workgroupId = classmate.getInt("workgroupId");
          } catch(JSONException e) {
            workgroupId = null;
          }

          if (classmate.has("periodId") && !classmate.isNull("periodId")) {
            int periodId = classmate.getInt("periodId");
            workgroupIdToPeriodId.put(workgroupId, periodId);
          }

          if (classmate.has("periodName") && !classmate.isNull("periodName")) {
            String periodName = classmate.getString("periodName");
            workgroupIdToPeriodName.put(workgroupId, periodName);
          }

          if (classmate.has("periodId") && !classmate.isNull("periodId") &&
              classmate.has("periodName") && !classmate.isNull("periodName")) {
            int periodId = classmate.getInt("periodId");
            String periodName = classmate.getString("periodName");
            if (!periodIdToPeriodName.containsKey(new Integer(periodId))) {
              periodIdToPeriodName.put(new Integer(periodId), periodName);
            }
          }

          if (classmate.has("userIds") && !classmate.isNull("userIds")) {
            /*
             * get the student user ids, this is a single string with the user ids
             * separated by ':'
             */
            String userIds = classmate.getString("userIds");
            workgroupIdToUserIds.put(workgroupId, userIds);
          }

          if (classmate.has("periodId") && !classmate.isNull("periodId") &&
              classmate.has("periodName") && !classmate.isNull("periodName") &&
              classmate.has("userIds") && !classmate.isNull("userIds")) {
            workgroupIds.add(workgroupId + "");
          }
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }

    Workbook wb = null;
    if (isFileTypeXLS(fileType)) {
      response.setContentType("application/vnd.ms-excel");
    } else if (isFileTypeCSV(fileType)) {
      response.setContentType("text/csv");
      PrintWriter writer = response.getWriter();
      csvWriter = new CSVWriter(writer);
    } else {
      //error
    }

    if (exportType == null) {
      //error
    } else if (exportType.equals("latestStudentWork")) {
      response.setHeader("Content-Disposition", "attachment; filename=\"" + runName + "-" + runId + "-latest-student-work." + fileType + "\"");
      wb = getLatestStudentWorkXLSExport(nodeIdToNodeTitlesWithPosition, workgroupIds, nodeIdList, runId, nodeIdToNode, nodeIdToNodeContent, workgroupIdToPeriodId, teacherWorkgroupIds);
    } else if (exportType.equals("allStudentWork")) {
      response.setHeader("Content-Disposition", "attachment; filename=\"" + runName + "-" + runId + "-all-student-work." + fileType + "\"");
      wb = getAllStudentWorkXLSExport(nodeIdToNodeTitlesWithPosition, workgroupIds, runId, nodeIdToNode, nodeIdToNodeContent, workgroupIdToPeriodId, teacherWorkgroupIds);
    } else if (exportType.equals("ideaBaskets")) {
      response.setHeader("Content-Disposition", "attachment; filename=\"" + runName + "-" + runId + "-idea-baskets." + fileType + "\"");
      wb = getIdeaBasketsExcelExport(nodeIdToNodeTitlesWithPosition, workgroupIds, runId, nodeIdToNode, nodeIdToNodeContent, workgroupIdToPeriodId, teacherWorkgroupIds);
    } else if (exportType.equals("explanationBuilderWork")) {
      response.setHeader("Content-Disposition", "attachment; filename=\"" + runName + "-" + runId + "-explanation-builder-work." + fileType + "\"");
      wb = getExplanationBuilderWorkExcelExport(nodeIdToNodeTitlesWithPosition, workgroupIds, runId, nodeIdToNode, nodeIdToNodeContent, workgroupIdToPeriodId, teacherWorkgroupIds);
    } else if (exportType.equals("annotatorWork")) {
      response.setHeader("Content-Disposition", "attachment; filename=\"" + runName + "-" + runId + "-annotator-work." + fileType + "\"");
      wb = getAnnotatorWorkExcelExport(nodeIdToNodeTitlesWithPosition, workgroupIds, runId, nodeIdToNode, nodeIdToNodeContent, workgroupIdToPeriodId, teacherWorkgroupIds);
    } else if (exportType.equals("customLatestStudentWork")) {
      response.setHeader("Content-Disposition", "attachment; filename=\"" + runName + "-" + runId + "-custom-latest-student-work." + fileType + "\"");
      wb = getLatestStudentWorkXLSExport(nodeIdToNodeTitlesWithPosition, workgroupIds, nodeIdList, runId, nodeIdToNode, nodeIdToNodeContent, workgroupIdToPeriodId, teacherWorkgroupIds);
    } else if (exportType.equals("customAllStudentWork")) {
      response.setHeader("Content-Disposition", "attachment; filename=\"" + runName + "-" + runId + "-custom-all-student-work." + fileType + "\"");
      wb = getAllStudentWorkXLSExport(nodeIdToNodeTitlesWithPosition, workgroupIds, runId, nodeIdToNode, nodeIdToNodeContent, workgroupIdToPeriodId, teacherWorkgroupIds);
    } else if (exportType.equals("flashStudentWork")) {
      response.setHeader("Content-Disposition", "attachment; filename=\"" + runName + "-" + runId + "-custom-flash-student-work." + fileType + "\"");
      wb = getFlashWorkExcelExport(nodeIdToNodeTitlesWithPosition, workgroupIds, runId, nodeIdToNode, nodeIdToNodeContent, workgroupIdToPeriodId, workgroupIds);
    } else {
      //error
    }

    if (isFileTypeXLS(fileType)) {
      ServletOutputStream outputStream = response.getOutputStream();
      if (wb != null) {
        wb.write(outputStream);
      }
    }

    if (oversizedResponses > 0) {
      System.out.println("Oversized Responses: " + oversizedResponses);
    }
    clearVariables();
    return null;
  }

  /**
   * Make the list of node ids
   * Note: makeNodeIdToNodeTitlesMap() must be called before this function
   * @param project the project JSON object
   */
  private void makeNodeIdList(JSONObject project) {
    nodeIdList = new Vector<String>();

    try {
      JSONArray sequences = project.getJSONArray("sequences");
      String startPoint = project.getString("startPoint");
      traverseNodeIdsToMakeNodeIdList(sequences, startPoint, "", 1, startPoint);
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  /**
   * Retrieves the JSONObject for a sequence with the given sequenceId
   *
   * @param sequences a JSONArray of sequence JSONObjects
   * @param sequenceId the identifier of the sequence we want
   *
   * @return the sequence JSONObject or null if we did not find it
   */
  private JSONObject getProjectSequence(JSONArray sequences, String sequenceId) {
    for (int x = 0; x < sequences.length(); x++) {
      try {
        JSONObject sequence = sequences.getJSONObject(x);
        if (sequence != null) {
          if (sequence.getString("identifier").equals(sequenceId)) {
            return sequence;
          }
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return null;
  }

  /**
   * Traverses the sequences in the project file to create a list of nodes in
   * the order that they appear in the project and at the same time determining
   * the position of each node (e.g. 1.1, 1.2, 2.1, 2.2, etc.)
   *
   * @param sequences the JSONArray of sequences
   * @param identifier the id of the sequence or node we are currently on
   * @param positionSoFar the position we have traversed down to so far
   * e.g. if we are on Activity 2
   * positionSoFar will be "2."
   * @param nodePosition the position within the current sequence
   * e.g. if we are on Activity 2, Step 3
   * @param startPoint the id of the start point sequence of the project
   * nodePosition will be 3
   */
  private void traverseNodeIdsToMakeNodeIdList(JSONArray sequences, String identifier, String positionSoFar, int nodePosition, String startPoint) {
    try {
      JSONObject projectSequence = getProjectSequence(sequences, identifier);
      if (projectSequence == null) {
        boolean exportStep = true;
        if (customSteps.size() != 0) {
          if (!customSteps.contains(identifier)) {
            exportStep = false;
          }
        }

        if (exportStep) {
          nodeIdList.add(identifier);
          String nodeTitle = nodeIdToNodeTitles.get(identifier);
          String nodeTitleWithPosition = positionSoFar + nodePosition + " " + nodeTitle;
          nodeIdToNodeTitlesWithPosition.put(identifier, nodeTitleWithPosition);
        }
      } else {
        JSONArray refs = projectSequence.getJSONArray("refs");
        if (!identifier.equals(startPoint)) {
          /*
           * only do this for sequences that are not the startsequence otherwise
           * all the positions would start with "1."
           * so instead of Activity 2, Step 5 being 1.2.5 we really just want 2.5
           */
          positionSoFar = positionSoFar + nodePosition + ".";
        }

        for (int x = 0; x < refs.length(); x++) {
          String refIdentifier = refs.getString(x);
          traverseNodeIdsToMakeNodeIdList(sequences, refIdentifier, positionSoFar, x + 1, startPoint);
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  /**
   * Create a map of node id to node titles by looping through the array
   * of nodes in the project file and creating an entry in the map
   * for each node
   *
   * @param project the project JSON object
   *
   * @return a map of node id to node titles
   */
  private void makeNodeIdToNodeTitleAndNodeMap(JSONObject project) {
    nodeIdToNodeTitles = new HashMap<String, String>();
    nodeIdToNode = new HashMap<String, JSONObject>();

    try {
      JSONArray nodesJSONArray = project.getJSONArray("nodes");
      for (int x = 0; x < nodesJSONArray.length(); x++) {
        JSONObject node = nodesJSONArray.getJSONObject(x);
        if (node != null) {
          String nodeId = node.getString("identifier");
          String title = node.getString("title");
          if (nodeId != null && title != null) {
            nodeIdToNodeTitles.put(nodeId, title);
          }

          if (nodeId != null) {
            nodeIdToNode.put(nodeId, node);
          }
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }


  /**
   * Obtain the node type for the step work
   *
   * @param stepWork a StepWork object
   *
   * @return the node type for the StepWork without the "Node"
   * part of the string
   * e.g. if a step work is for an "OpenResponseNode" the value
   * that is returned would be "OpenResponse"
   */
  private String getNodeTypeFromStepWork(StepWork stepWork) {
    String nodeType = stepWork.getNode().getNodeType();
    if (nodeType == null) {
      String data = stepWork.getData();
      nodeType = getNodeTypeFromStepWorkJSONString(data);
    }
    nodeType = nodeType.replace("Node", "");
    return nodeType;
  }

  /**
   * Get the node type from the StepWork data JSON string
   *
   * @param stepWorkJSONString the step work data JSON string
   *
   * @return the node type for the StepWork without the "Node"
   * part of the string
   * e.g. if a step work is for an "OpenResponseNode" the value
   * that is returned would be "OpenResponse"
   */
  public String getNodeTypeFromStepWorkJSONString(String stepWorkJSONString) {
    String nodeTypeFromStepWorkJSONObject = "";
    if (stepWorkJSONString != null) {
      try {
        JSONObject stepWorkJSONObject = new JSONObject(stepWorkJSONString);
        nodeTypeFromStepWorkJSONObject = getNodeTypeFromStepWorkJSONObject(stepWorkJSONObject);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return nodeTypeFromStepWorkJSONObject;
  }

  /**
   * Get the node type from the JSON Object
   *
   * @param stepWorkJSONObject the step work data JSON object
   *
   * @return the node type for the StepWork without the "Node"
   * part of the string
   * e.g. if a step work is for an "OpenResponseNode" the value
   * that is returned would be "OpenResponse"
   */
  public String getNodeTypeFromStepWorkJSONObject(JSONObject stepWorkJSONObject) {
    String nodeType = "";
    if (stepWorkJSONObject != null) {
      if (stepWorkJSONObject.has("nodeType")) {
        try {
          nodeType = stepWorkJSONObject.getString("nodeType");
        } catch (JSONException e) {
          e.printStackTrace();
        }
      }
    }
    return nodeType;
  }

  /**
   * Get the step works only for a specific node id
   *
   * @param stepWorks a list of StepWork objects
   * @param nodeId the node id we want student work for
   *
   * @return a list of StepWork objects that are filtered
   * for a node id
   */
  private List<StepWork> getStepWorksForNodeId(List<StepWork> stepWorks, String nodeId) {
    List<StepWork> filteredStepWorks = new Vector<StepWork>();
    Iterator<StepWork> stepWorksIterator = stepWorks.iterator();
    while (stepWorksIterator.hasNext()) {
      StepWork stepWork = stepWorksIterator.next();
      String stepWorkNodeId = stepWork.getNode().getNodeId();
      if (stepWorkNodeId != null && stepWorkNodeId.equals(nodeId)) {
        filteredStepWorks.add(stepWork);
      }
    }
    return filteredStepWorks;
  }

  /**
   * Creates an excel workbook that contains student navigation data
   * Each sheet represents one student's work. The rows in each
   * sheet are sequential so the earliest navigation data is at
   * the top and the latest navigation data is at the bottom
   *
   * @param nodeIdToNodeTitlesMap a HashMap that contains nodeId to
   * nodeTitle mappings
   * @param workgroupIds a vector of workgroup ids
   * @param runId the run id
   * @param nodeIdToNode a mapping of node id to node object
   * @param nodeIdToNodeContent a mapping of node id to node content
   * @param workgroupIdToPeriodId a mapping of workgroup id to period id
   * @param teacherWorkgroupIds a list of teacher workgroup ids
   *
   * @return an excel workbook that contains the student navigation if we
   * are generating an xls file
   */
  private XSSFWorkbook getAllStudentWorkXLSExport(
    HashMap<String, String> nodeIdToNodeTitlesMap,
    Vector<String> workgroupIds,
    String runId,
    HashMap<String, JSONObject> nodeIdToNode,
    HashMap<String, JSONObject> nodeIdToNodeContent,
    HashMap<Integer, Integer> workgroupIdToPeriodId,
    List<String> teacherWorkgroupIds) {

    XSSFWorkbook wb = null;

    if (isFileTypeXLS(fileType)) {
      wb = new XSSFWorkbook();
    }

    List<Node> customNodes = null;

    if (customSteps.size() != 0) {
      customNodes = vleService.getNodesByNodeIdsAndRunId(customSteps, runId);
    }

    boolean isCSVHeaderRowWritten = false;

    for (int x = 0; x < workgroupIds.size(); x++) {
      String workgroupIdString = workgroupIds.get(x);
      UserInfo userInfo = vleService.getUserInfoByWorkgroupId(Long.parseLong(workgroupIdString));

      if (userInfo != null) {
        Long workgroupId = userInfo.getWorkgroupId();
        int workgroupIdInt = workgroupId.intValue();
        int periodId = workgroupIdToPeriodId.get(workgroupIdInt);
        List<StepWork> stepWorks = new ArrayList<StepWork>();

        if (customNodes == null) {
          //the teacher has not provided a list of custom steps so we will gather work for all the steps
          //get all the work for that workgroup id
          stepWorks = vleService.getStepWorksByUserInfo(userInfo);
        } else {
          if (customNodes.size() > 0) {
            //the teacher has provided a list of custom steps so we will gather the work for those specific steps
            stepWorks = vleService.getStepWorksByUserInfoAndNodeList(userInfo, customNodes);
          }
        }

        XSSFSheet userIdSheet = null;
        if (wb != null) {
          userIdSheet = wb.createSheet(workgroupIdString);
        }

        clearStepVisitCount();
        clearStepRevisionCount();

        int rowCounter = 0;
        int headerColumn = 0;

        Row headerRow = createRow(userIdSheet, rowCounter++);
        Vector<String> headerRowVector = createRowVector();

        //the header column to just keep track of each row (which represents a step visit)
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "#");

        //the header columns for the workgroup information and run information
        headerColumn = createUserDataHeaderRow(headerColumn, headerRow, headerRowVector, true, true);

        //the header column for the step work id
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Step Work Id");

        //header step title column which already includes numbering
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Step Title");

        //the header column for the step visit count
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Step Visit Count");

        //the header column for the step revision count
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Step Revision Count");

        //header step type column
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Step Type");

        //header step prompt column
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Step Prompt");

        //header node id column
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Node Id");

        //header post time column
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Post Time (Server Clock)");

        //header start time column
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Start Time (Student Clock)");

        //header end time column
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "End Time (Student Clock)");

        //header time the student spent on the step in seconds column
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Visit Time Spent (Seconds)");

        //header time the student spent on the revision in seconds column
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Revision Time Spent (Seconds)");

        //header time the student spent on the step in seconds column
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Teacher Score Timestamp");

        //header time the student spent on the step in seconds column
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Teacher Score");

        //header time the student spent on the step in seconds column
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Teacher Max Score");

        //header time the student spent on the step in seconds column
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Teacher Comment Timestamp");

        //header time the student spent on the step in seconds column
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Teacher Comment");

        //header cell for the auto score
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Auto Score");

        //header cell for the max auto score
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Max Auto Score");

        //header cell for the auto feedback
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Auto Feedback");

        //header classmate id for review type steps
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Classmate Id");

        //header receiving text for review type steps
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Receiving Text");

        //header student work column
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Student Work");

        if (!isCSVHeaderRowWritten) {
          writeCSV(headerRowVector);

          /*
           * set this flag to true so we don't write the header row into the csv again.
           * this means we will only output the header row once at the very top of the csv file.
           */
          isCSVHeaderRowWritten = true;
        }

        List<StepWork> stepWorksForWorkgroupId = vleService.getStepWorksByUserInfo(userInfo);

        /*
         * loop through all the work for the current student, this will
         * already be ordered chronologically
         */
        for (int y = 0; y < stepWorks.size(); y++) {
          StepWork stepWork = stepWorks.get(y);
          Long stepWorkId = stepWork.getId();
          Timestamp startTime = stepWork.getStartTime();
          Timestamp endTime = stepWork.getEndTime();
          Timestamp postTime = stepWork.getPostTime();
          String nodeId = stepWork.getNode().getNodeId();
          String nodeTitle = nodeIdToNodeTitlesMap.get(nodeId);
          String nodeType = getNodeTypeFromStepWork(stepWork);
          String stepWorkData = stepWork.getData();
          int stepVisitCount = increaseStepVisitCount(nodeId);
          JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
          if (nodeContent == null) {
            continue;
          }
          String nodePrompt = getPromptFromNodeContent(nodeContent);
          JSONObject nodeJSONObject = nodeIdToNode.get(nodeId);

          String wiseId1 = "";
          String wiseId2 = "";
          String wiseId3 = "";

          long timestamp = postTime.getTime();

          /*
           * get the student attendance that is relevant to the step work. we will
           * look for the first student attendance entry for this workgroup id
           * that has a login timestamp before the start time of this step work
           */
          JSONObject studentAttendanceForWorkgroupIdTimestamp = getStudentAttendanceForWorkgroupIdTimestamp(workgroupId, timestamp);

          if (studentAttendanceForWorkgroupIdTimestamp == null) {
            /*
             * we could not find a student attendance entry so this probably
             * means this step work was created before we started logging
             * student absences. we will just display all the student ids for
             * the workgroup in this case.
             */
            String userIds = workgroupIdToUserIds.get(Integer.parseInt(workgroupId + ""));
            String[] userIdsArray = userIds.split(":");
            ArrayList<Long> userIdsList = sortUserIdsArray(userIdsArray);
            for (int z = 0; z < userIdsList.size(); z++) {
              Long wiseId = userIdsList.get(z);
              if (z == 0) {
                wiseId1 = wiseId + "";
              } else if (z == 1) {
                wiseId2 = wiseId + "";
              } else if (z == 2) {
                wiseId3 = wiseId + "";
              }
            }
          } else {
            try {
              JSONArray presentUserIds = studentAttendanceForWorkgroupIdTimestamp.getJSONArray("presentUserIds");
              JSONArray absentUserIds = studentAttendanceForWorkgroupIdTimestamp.getJSONArray("absentUserIds");
              HashMap<Long, String> studentAttendanceMap = new HashMap<Long, String>();
              ArrayList<Long> userIds = new ArrayList<Long>();
              for (int a = 0; a < presentUserIds.length(); a++) {
                long presentUserId = presentUserIds.getLong(a);
                studentAttendanceMap.put(presentUserId, "Present");
                userIds.add(presentUserId);
              }

              for (int b = 0; b < absentUserIds.length(); b++) {
                long absentUserId = absentUserIds.getLong(b);
                studentAttendanceMap.put(absentUserId, "Absent");
                userIds.add(absentUserId);
              }

              Collections.sort(userIds);
              for (int c = 0; c < userIds.size(); c++) {
                Long tempUserId = userIds.get(c);
                String studentAttendanceStatus = studentAttendanceMap.get(tempUserId);
                String studentAttendanceStatusSuffix = "";
                if (studentAttendanceStatus != null && studentAttendanceStatus.equals("Absent")) {
                  studentAttendanceStatusSuffix = " Absent";
                }

                if (c == 0) {
                  wiseId1 = tempUserId + studentAttendanceStatusSuffix;
                } else if (c == 1) {
                  wiseId2 = tempUserId + studentAttendanceStatusSuffix;
                } else if (c == 2) {
                  wiseId3 = tempUserId + studentAttendanceStatusSuffix;
                }
              }
            } catch (JSONException e) {
              e.printStackTrace();
            }
          }

          try {
            JSONObject stepWorkDataJSON = new JSONObject(stepWorkData);
            if (stepWorkDataJSON.has("nodeStates")) {
              JSONArray nodeStates = stepWorkDataJSON.getJSONArray("nodeStates");
              rowCounter = writeAllStudentWorkRows(userIdSheet, rowCounter, nodeId, workgroupId, wiseId1, wiseId2, wiseId3, stepWorkId, stepVisitCount, nodeTitle, nodeType, nodePrompt, nodeContent, startTime, endTime, postTime, stepWork, periodId, userInfo, stepWorksForWorkgroupId, nodeJSONObject, nodeStates);
            }
          } catch (JSONException e) {
            e.printStackTrace();
          }
        }
      }
    }
    return wb;
  }

  /**
   * Write the student work row for a node state
   * @param tempColumn
   * @param tempRow
   * @param tempRowVector
   * @param nodeId
   * @param workgroupId
   * @param wiseId1
   * @param wiseId2
   * @param wiseId3
   * @param stepWorkId
   * @param stepVisitCount
   * @param nodeTitle
   * @param nodeType
   * @param prompt
   * @param nodeContent
   * @param startTime
   * @param endTime
   * @param postTime
   * @param stepWork
   * @param periodId
   * @param userInfo
   * @param stepWorksForWorkgroupId
   * @param nodeJSONObject
   * @param nodeState
   * @return the row counter for the next empty row
   */
  private int writeAllStudentWorkRows(XSSFSheet userIdSheet,
                                      int rowCounter,
                                      String nodeId,
                                      Long workgroupId,
                                      String wiseId1,
                                      String wiseId2,
                                      String wiseId3,
                                      Long stepWorkId,
                                      int stepVisitCount,
                                      String nodeTitle,
                                      String nodeType,
                                      String nodePrompt,
                                      JSONObject nodeContent,
                                      Timestamp startTime,
                                      Timestamp endTime,
                                      Timestamp postTime,
                                      StepWork stepWork,
                                      int periodId,
                                      UserInfo userInfo,
                                      List<StepWork> stepWorksForWorkgroupId,
                                      JSONObject nodeJSONObject,
                                      JSONArray nodeStates) {

    if (nodeStates.length() == 0) {
      //the node states is empty so we will fill out the row but without student work

      JSONObject nodeState = null;
      Long nodeStateTimeSpent = null;
      JSONObject autoGradedAnnotationForNodeState = null;

      if (endTime != null && startTime != null) {
        /*
         * since this visit doesn't have any node states, the revision time
         * will be equal to the visit time.
         * find the difference between start and end and divide by
         * 1000 to obtain the value in seconds
         */
        nodeStateTimeSpent = (endTime.getTime() - startTime.getTime()) / 1000;
      }
      rowCounter = writeAllStudentWorkNodeState(userIdSheet, rowCounter, nodeId, workgroupId, wiseId1, wiseId2, wiseId3, stepWorkId, stepVisitCount, nodeTitle, nodeType, nodePrompt, nodeContent, startTime, endTime, postTime, stepWork, periodId, userInfo, stepWorksForWorkgroupId, nodeJSONObject, nodeState, nodeStateTimeSpent, autoGradedAnnotationForNodeState);
    } else {
      Long nodeStateStartTime = null;
      if (startTime != null) {
        /*
         * get the start time for the first node state which will be the same
         * as the start time for the node visit
         */
        nodeStateStartTime = startTime.getTime();
      }

      for (int i = 0; i < nodeStates.length(); i++) {
        try {
          JSONObject nodeState = nodeStates.getJSONObject(i);
          Long nodeStateTimeSpent = null;
          Long nodeStateEndTime = nodeState.optLong("timestamp");

          if (nodeStateStartTime != null && nodeStateStartTime != 0
              && nodeStateEndTime != null && nodeStateEndTime != 0) {
            /*
             * we have valid start and end times so we will calculate the time
             * spent on the node state
             */
            nodeStateTimeSpent = (nodeStateEndTime - nodeStateStartTime) / 1000;
          }

          JSONObject autoGradedAnnotationForNodeState = getAutoGradedAnnotationForNodeState(stepWork, nodeStateEndTime);
          rowCounter = writeAllStudentWorkNodeState(userIdSheet, rowCounter, nodeId, workgroupId, wiseId1, wiseId2, wiseId3, stepWorkId, stepVisitCount, nodeTitle, nodeType, nodePrompt, nodeContent, startTime, endTime, postTime, stepWork, periodId, userInfo, stepWorksForWorkgroupId, nodeJSONObject, nodeState, nodeStateTimeSpent, autoGradedAnnotationForNodeState);
          nodeStateStartTime = nodeStateEndTime;
        } catch (JSONException e) {
          e.printStackTrace();
        }
      }
    }
    return rowCounter;
  }

  /**
   * Get the autoGraded annotation for the given node state
   * @param stepWork the step work
   * @param nodeStateTimestamp the timestamp for the node state
   * @return the autoGraded annotation
   */
  private JSONObject getAutoGradedAnnotationForNodeState(StepWork stepWork, Long nodeStateTimestamp) {
    JSONObject autoGradedAnnotationForNodeState = null;
    String annotationType = "autoGraded";
    Annotation autoGradedAnnotation = vleService.getAnnotationByStepWorkAndAnnotationType(stepWork, annotationType);
    if (autoGradedAnnotation != null && nodeStateTimestamp != null) {
      String autoGradedAnnotationData = autoGradedAnnotation.getData();
      if (autoGradedAnnotationData != null && !autoGradedAnnotationData.equals("")) {
        try {
          JSONObject autoGradedAnnotationDataJSONObject = new JSONObject(autoGradedAnnotationData);
          if (autoGradedAnnotationDataJSONObject != null) {
            JSONArray annotationsForNodeStates = autoGradedAnnotationDataJSONObject.getJSONArray("value");
            if (annotationsForNodeStates != null) {
              for (int x = 0; x < annotationsForNodeStates.length(); x++) {
                JSONObject nodeStateAnnotation = annotationsForNodeStates.getJSONObject(x);
                if (nodeStateAnnotation != null) {
                  /*
                   * get the node state id of the annotation which is the timestamp of the node state
                   * for which is refers to
                   */
                  Long nodeStateId = nodeStateAnnotation.optLong("nodeStateId");
                  if (nodeStateId != null && nodeStateTimestamp.equals(nodeStateId)) {
                    autoGradedAnnotationForNodeState = nodeStateAnnotation;
                    break;
                  }
                }
              }
            }
          }
        } catch (JSONException e) {
          e.printStackTrace();
        }
      }
    }
    return autoGradedAnnotationForNodeState;
  }

  /**
   * Write the student work node state to the excel
   * @param userIdSheet
   * @param rowCounter
   * @param nodeId
   * @param workgroupId
   * @param wiseId1
   * @param wiseId2
   * @param wiseId3
   * @param stepWorkId
   * @param stepVisitCount
   * @param nodeTitle
   * @param nodeType
   * @param nodePrompt
   * @param nodeContent
   * @param startTime
   * @param endTime
   * @param postTime
   * @param stepWork
   * @param periodId
   * @param userInfo
   * @param stepWorksForWorkgroupId
   * @param nodeJSONObject
   * @param nodeState
   * @param nodeStateTimeSpent
   * @param autoGradedAnnotationForNodeState
   * @return the row counter for the next empty row
   */
  private int writeAllStudentWorkNodeState(XSSFSheet userIdSheet,
                                           int rowCounter,
                                           String nodeId,
                                           Long workgroupId,
                                           String wiseId1,
                                           String wiseId2,
                                           String wiseId3,
                                           Long stepWorkId,
                                           int stepVisitCount,
                                           String nodeTitle,
                                           String nodeType,
                                           String nodePrompt,
                                           JSONObject nodeContent,
                                           Timestamp startTime,
                                           Timestamp endTime,
                                           Timestamp postTime,
                                           StepWork stepWork,
                                           int periodId,
                                           UserInfo userInfo,
                                           List<StepWork> stepWorksForWorkgroupId,
                                           JSONObject nodeJSONObject,
                                           JSONObject nodeState,
                                           Long nodeStateTimeSpent,
                                           JSONObject autoGradedAnnotationForNodeState) {

    ArrayList<ArrayList<Object>> columns = getExportColumnDataValues(stepWorkId, nodeState, nodeId);
    ArrayList<Object> columnNames = getExportColumnNames(nodeId);
    ArrayList<ArrayList<Object>> rows = getRowsFromColumns(columns);
    increaseStepRevisionCount(nodeId);

    if (rows.size() > 0) {
      boolean columnNamesOriginallyContainsMaxScore = false;
      Long maxScoreFromContent = null;

      if (columnNames.contains("Max Score")) {
        columnNamesOriginallyContainsMaxScore = true;
      }

      if (!columnNamesOriginallyContainsMaxScore) {
        maxScoreFromContent = getMaxScoreFromContent(nodeId);
        if (maxScoreFromContent != null) {
          columnNames.add("Max Score");
        }
      }

      for (int x = 0; x < rows.size(); x++) {
        ArrayList<Object> row = rows.get(x);
        if (!columnNamesOriginallyContainsMaxScore) {
          if (maxScoreFromContent != null) {
            row.add(maxScoreFromContent);
          }
        }
        writeAllStudentWorkRow(userIdSheet, rowCounter, nodeId, workgroupId, wiseId1, wiseId2, wiseId3, stepWorkId, stepVisitCount, nodeTitle, nodeType, nodePrompt, nodeContent, startTime, endTime, postTime, stepWork, periodId, userInfo, stepWorksForWorkgroupId, nodeJSONObject, columnNames, row, nodeStateTimeSpent, autoGradedAnnotationForNodeState);
        rowCounter++;
      }
    } else {
      ArrayList<Object> row = new ArrayList<Object>();
      row = getNodeStateWorkForShowAllWork(nodeState, nodeId, nodeType);
      columnNames = getDefaultColumnNames(nodeId, nodeType, nodeState);
      writeAllStudentWorkRow(userIdSheet, rowCounter, nodeId, workgroupId, wiseId1, wiseId2, wiseId3, stepWorkId, stepVisitCount, nodeTitle, nodeType, nodePrompt, nodeContent, startTime, endTime, postTime, stepWork, periodId, userInfo, stepWorksForWorkgroupId, nodeJSONObject, columnNames, row, nodeStateTimeSpent, autoGradedAnnotationForNodeState);
      rowCounter++;
    }
    return rowCounter;
  }

  /**
   * Get the student work cells for the node state
   * @param nodeState the node state
   * @param nodeId the id for the node
   * @param nodeType the node type
   * @return an array containing the student work. each element in the
   * array will show up in its own column
   */
  private ArrayList<Object> getNodeStateWorkForShowAllWork(JSONObject nodeState,
      String nodeId, String nodeType) {
    ArrayList<Object> row = new ArrayList<Object>();
    if (nodeState != null) {
      if (nodeType == null) {
      } else if (nodeType.equals("AssessmentList")) {
        try {
          JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
          JSONArray nodeStateAssessments = nodeState.getJSONArray("assessments");
          for (int x = 0; x < nodeStateAssessments.length(); x++) {
            JSONObject nodeStateAssessmentPart = nodeStateAssessments.getJSONObject(x);
            String nodeStateAssessmentPartId = nodeStateAssessmentPart.optString("id");
            String response = null;
            Boolean isAutoScoreEnabled = false;
            Boolean isCorrect = null;
            Long choiceScore = null;
            Long maxScore = null;

            JSONObject nodeContentAssessmentPart = getStepContentAssessmentByAssessmentId(nodeId, nodeStateAssessmentPartId);
            if (nodeContentAssessmentPart != null && nodeContentAssessmentPart.optBoolean("isAutoScoreEnabled")) {
              isAutoScoreEnabled = true;
            }

            boolean responseAdded = false;
            if (nodeContentAssessmentPart != null) {
              String type = nodeContentAssessmentPart.optString("type");
              if (type != null && type.equals("checkbox")) {
                JSONArray responseJSONArray = null;
                JSONArray choices = nodeContentAssessmentPart.optJSONArray("choices");
                if (nodeStateAssessmentPart != null) {
                  responseJSONArray = nodeStateAssessmentPart.optJSONArray("response");
                }

                if (choices != null) {
                  for (int y = 0; y < choices.length(); y++) {
                    JSONObject choice = choices.getJSONObject(y);
                    if (isChoiceInResponse(choice, responseJSONArray)) {
                      String choiceText = choice.optString("text");
                      row.add(choiceText);
                    } else {
                      row.add("");
                    }
                    responseAdded = true;
                  }
                }
              } else {
                if (nodeStateAssessmentPart != null) {
                  if (!nodeStateAssessmentPart.isNull("response")) {
                    JSONObject responseObject = nodeStateAssessmentPart.optJSONObject("response");
                    if (responseObject != null) {
                      String responseText = responseObject.optString("text");
                      if (responseText != null) {
                        response = responseText;
                      }

                      JSONObject autoScoreResult = responseObject.optJSONObject("autoScoreResult");
                      if (autoScoreResult != null) {
                        isCorrect = autoScoreResult.optBoolean("isCorrect");
                        choiceScore = autoScoreResult.optLong("choiceScore");
                        maxScore = autoScoreResult.optLong("maxScore");
                      }
                    }
                  }
                }
              }
            }

            if (!responseAdded) {
              if (response == null) {
                row.add("");
              } else {
                row.add(response);
              }
            }

            if (isAutoScoreEnabled) {
              if (isCorrect == null) {
                row.add("");
              } else {
                row.add(isCorrect);
              }

              if (choiceScore == null) {
                row.add("");
              } else {
                row.add(choiceScore);
              }

              if (maxScore == null) {
                row.add("");
              } else {
                row.add(maxScore);
              }
            }
          }

          boolean isLockAfterSubmit = false;
          if (nodeContent != null && nodeContent.has("isLockAfterSubmit")) {
            try {
              isLockAfterSubmit = nodeContent.getBoolean("isLockAfterSubmit");
            } catch (JSONException e) {
            }
          }

          if (isLockAfterSubmit) {
            boolean isSubmit = nodeState.getBoolean("isSubmit");
            row.add(isSubmit);
          }
        } catch (JSONException e) {
        }
      } else {
        String response = getNodeStateResponse(nodeState, nodeId);
        if (response != null) {
          row.add(response);
        }
      }
    }
    return row;
  }

  /**
   * Check if the choice is in the array of responses from the student.
   * This is used for Questionnaire/Assessmentlist steps in determining
   * which choices the student chose in a checkbox part.
   * @param choice the choice object containing id and text
   * @param responseJSONArray an array of responses from a student
   * @return whether the choice is in the array of responses
   */
  private boolean isChoiceInResponse(JSONObject choice, JSONArray responseJSONArray) {
    boolean result = false;
    if (responseJSONArray != null && choice != null) {
      String answerId = choice.optString("id");
      String answerText = choice.optString("text");

      for (int x = 0; x < responseJSONArray.length(); x++) {
        JSONObject responseJSONObject = responseJSONArray.optJSONObject(x);
        if (responseJSONObject != null) {
          String id = responseJSONObject.optString("id");
          String text = responseJSONObject.optString("text");
          if (id != null && text != null && answerId != null && answerText != null) {
            if (id.equals(answerId) && text.equals(answerText)) {
              result = true;
            }
          }
        }
      }
    }
    return result;
  }

  /**
   * Get the default column names for the step
   * @param nodeId the id for the node
   * @param nodeType the node type
   * @param nodeState the student work node state
   * @return the column names that we will display as comments in the student work cell
   */
  private ArrayList<Object> getDefaultColumnNames(String nodeId, String nodeType,
      JSONObject nodeState) {
    ArrayList<Object> columnNames = new ArrayList<Object>();
    if (nodeType == null) {
    } else if (nodeType.equals("AssessmentList")) {
      JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
      if (nodeContent != null) {
        JSONArray nodeContentAssessments = nodeContent.optJSONArray("assessments");
        int partCounter = 1;
        for (int x = 0; x < nodeContentAssessments.length(); x++) {
          String prompt = null;
          boolean isAutoScoreEnabled = false;
          String partLabel = "Part " + partCounter;
          JSONObject nodeContentAssessment = nodeContentAssessments.optJSONObject(x);
          String type = "";
          if (nodeContentAssessment != null) {
            prompt = nodeContentAssessment.optString("prompt");
            type = nodeContentAssessment.optString("type");
            isAutoScoreEnabled = nodeContentAssessment.optBoolean("isAutoScoreEnabled");
          }

          if (type.equals("checkbox")) {
            /*
             * the assessment part is a checkbox type. we will display the choice text
             * instead of the part prompt for these checkbox type cells.
             * e.g.
             *
             * 2. Where do plants use to grow?
             * [] Sunlight
             * [] Animals
             * [] Water
             */
            try {
              JSONArray choices = nodeContentAssessment.optJSONArray("choices");
              if (choices != null) {
                for (int y = 0; y < choices.length(); y++) {
                  JSONObject choice = choices.getJSONObject(y);
                  if (choice != null) {
                    String text = choice.optString("text");
                    columnNames.add(partLabel + ": " + text);
                  }
                }
              }
            } catch (JSONException e) {
              e.printStackTrace();
            }
          } else {
            if (prompt == null) {
              columnNames.add(partLabel + ": ");
            } else {
              columnNames.add(partLabel + ": " + prompt);
            }
          }

          if (isAutoScoreEnabled) {
            columnNames.add(partLabel + ": " + "Is Correct");
            columnNames.add(partLabel + ": " + "Score");
            columnNames.add(partLabel + ": " + "Max Score");
          }
          partCounter++;
        }

        boolean isLockAfterSubmit = false;
        if (nodeContent.has("isLockAfterSubmit")) {
          try {
            isLockAfterSubmit = nodeContent.getBoolean("isLockAfterSubmit");
          } catch (JSONException e) {
          }
        }

        if (isLockAfterSubmit) {
          columnNames.add("Submit");
        }
      }
    } else {
    }
    return columnNames;
  }

  /**
   * Get the assessment part prompt given the assessment id
   * @param nodeId the node id
   * @param assessmentId the assessment id
   * @return the assessment part prompt
   */
  private String getAssessmentPromptByAssessmentId(String nodeId, String assessmentId) {
    String prompt = null;
    if (nodeId != null && assessmentId != null) {
      JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
      if (nodeContent != null) {
        JSONArray assessments = nodeContent.optJSONArray("assessments");
        if (assessments != null) {
          for (int x = 0; x < assessments.length(); x++) {
            JSONObject tempAssessment = assessments.optJSONObject(x);
            if (tempAssessment != null) {
              String tempAssessmentId = tempAssessment.optString("id");
              if (assessmentId.equals(tempAssessmentId)) {
                prompt = tempAssessment.optString("prompt");
                break;
              }
            }
          }
        }
      }
    }
    return prompt;
  }

  /**
   * Get the assessment part from the step content given the assessment id
   * @param nodeId the node id
   * @param assessmentId the assessment id
   * @return the assessment part from the step content
   */
  private JSONObject getStepContentAssessmentByAssessmentId(String nodeId, String assessmentId) {
    JSONObject assessment = null;
    if (nodeId != null && assessmentId != null) {
      JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
      if (nodeContent != null) {
        JSONArray assessments = nodeContent.optJSONArray("assessments");
        if (assessments != null) {
          for (int x = 0; x < assessments.length(); x++) {
            JSONObject tempAssessment = assessments.optJSONObject(x);
            if (tempAssessment != null) {
              String tempAssessmentId = tempAssessment.optString("id");
              if (assessmentId.equals(tempAssessmentId)) {
                assessment = tempAssessment;
                break;
              }
            }
          }
        }
      }
    }
    return assessment;
  }

  /**
   * Get the assessment part from the student work given the assessment id
   * @param studentWorkAssessments the assessment parts from the student work
   * @param assessmentId the assessment id
   * @return the assessment part from the student work with the given assessment id
   */
  private JSONObject getStudentWorkAssessmentByAssessmentId(JSONArray studentWorkAssessments,
      String assessmentId) {
    JSONObject assessment = null;
    if (studentWorkAssessments != null && assessmentId != null) {
      for (int x = 0; x < studentWorkAssessments.length(); x++) {
        JSONObject studentWorkAssessment = studentWorkAssessments.optJSONObject(x);
        if (studentWorkAssessment != null) {
          String studentWorkAssessmentId = studentWorkAssessment.optString("id");
          if (studentWorkAssessmentId != null) {
            if (assessmentId.equals(studentWorkAssessmentId)) {
              assessment = studentWorkAssessment;
              break;
            }
          }
        }
      }
    }
    return assessment;
  }

  /**
   * Write the student work row to the excel
   * @param userIdSheet
   * @param rowCounter
   * @param nodeId
   * @param workgroupId
   * @param wiseId1
   * @param wiseId2
   * @param wiseId3
   * @param stepWorkId
   * @param stepVisitCount
   * @param nodeTitle
   * @param nodeType
   * @param nodePrompt
   * @param nodeContent
   * @param startTime
   * @param endTime
   * @param postTime
   * @param stepWork
   * @param periodId
   * @param userInfo
   * @param stepWorksForWorkgroupId
   * @param nodeJSONObject
   * @param columnNames
   * @param row
   * @param nodeStateTimeSpent
   * @param autoGradedAnnotationForNodeState
   * @return the column number for the next empty cell to use
   */
  private int writeAllStudentWorkRow(XSSFSheet userIdSheet,
                                     int rowCounter,
                                     String nodeId,
                                     Long workgroupId,
                                     String wiseId1,
                                     String wiseId2,
                                     String wiseId3,
                                     Long stepWorkId,
                                     int stepVisitCount,
                                     String nodeTitle,
                                     String nodeType,
                                     String nodePrompt,
                                     JSONObject nodeContent,
                                     Timestamp startTime,
                                     Timestamp endTime,
                                     Timestamp postTime,
                                     StepWork stepWork,
                                     int periodId,
                                     UserInfo userInfo,
                                     List<StepWork> stepWorksForWorkgroupId,
                                     JSONObject nodeJSONObject,
                                     ArrayList<Object> columnNames,
                                     ArrayList<Object> row,
                                     Long nodeStateTimeSpent,
                                     JSONObject autoGradedAnnotationForNodeState) {

    //counter for the cell columns
    int tempColumn = 0;

    //increment the student row count
    int studentWorkRowCount = rowCounter;

    //create a new row for this step work
    Row tempRow = createRow(userIdSheet, rowCounter++);
    Vector<String> tempRowVector = createRowVector();

    //set the step work/visit number
    tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, studentWorkRowCount);

    //get the step revision count
    int stepRevisionCount = getStepRevisionCount(nodeId);

    //set the workgroup information and run information columns
    tempColumn = createUserDataRow(tempColumn, tempRow, tempRowVector, workgroupId.toString(), true, true, null);

    tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, stepWorkId);
    tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, nodeTitle);
    tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, stepVisitCount);
    tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, stepRevisionCount);
    tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, nodeType);
    tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, nodePrompt);
    tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, nodeId);
    tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, timestampToFormattedString(postTime));
    tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, timestampToFormattedString(startTime));

    /*
     * check if the end time is null which may occur if the student is
     * currently working on that step, or if there was some kind of
     * bug/error
     */
    if (endTime != null) {
      tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, timestampToFormattedString(endTime));
    } else {
      tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, "");
    }

    long timeSpentOnStep = 0;

    if (endTime == null || startTime == null) {
      //set to -1 if either start or end was null so we can set the cell to N/A later
      timeSpentOnStep = -1;
    } else {
      /*
       * find the difference between start and end and divide by
       * 1000 to obtain the value in seconds
       */
      timeSpentOnStep = (endTime.getTime() - startTime.getTime()) / 1000;
    }

    if (timeSpentOnStep == -1) {
      tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, "N/A");
    } else {
      tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, timeSpentOnStep);
    }

    if (nodeStateTimeSpent == null) {
      tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, "N/A");
    } else {
      //this node state has a time spent value so we will set it
      tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, nodeStateTimeSpent);
    }

    List<StepWork> stepWorkList = new ArrayList<StepWork>();
    stepWorkList.add(stepWork);
    tempColumn = setLatestAnnotationScoreAndTimestamp(stepWorkList, tempRow, tempRowVector, tempColumn, nodeId);
    tempColumn = setLatestAnnotationCommentAndTimestamp(stepWorkList, tempRow, tempRowVector, tempColumn);
    tempColumn = setLatestAutoGradedAnnotation(autoGradedAnnotationForNodeState, tempRow, tempRowVector, tempColumn);

    /*
     * set the review cells, if the current step does not utilize any review
     * functionality, it will simply fill the cells with "N/A"
     */
    tempColumn = setGetLatestStudentWorkReviewCells(teacherWorkgroupIds, stepWorksForWorkgroupId, runId, periodId, userInfo, nodeJSONObject, nodeContent, tempRow, tempRowVector, tempColumn, "allStudentWork");

    if (row != null) {
      for (int x = 0; x < row.size(); x++) {
        Object object = row.get(x);
        if (object != null) {
          int cellColumn = tempColumn;
          String comment = null;
          if (columnNames != null) {
            /*
             * there are column names so we will make sure there is a column name
             * available for this column index
             */
            if (columnNames.size() > x) {
              comment = (String) columnNames.get(x);
            }
          }

          if (object instanceof String) {
            tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, (String) object, comment);
          } else if (object instanceof Long) {
            tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, (Long) object, comment);
          } else if (object instanceof Integer) {
            tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, (Integer) object, comment);
          } else if (object instanceof Double) {
            tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, (Double) object, comment);
          } else if (object instanceof Float) {
            tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, (Float) object, comment);
          } else {
            tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, object.toString(), comment);
          }

          if (comment != null) {
            /*
             * set the column name as a comment for the cell which will display when
             * the user mouseovers the cell
             */
            setCellComment(userIdSheet, tempRow, cellColumn, comment);
          }
        } else {
          //this column does not have student data so we will move the column counter to skip this cell
          tempColumn++;

          addEmptyElementsToVector(tempRowVector, 1);
        }
      }
    }

    writeCSV(tempRowVector);
    return tempColumn;
  }

  /**
   * Set the comment for a cell
   * @param sheet the excel sheet
   * @param row the excel row
   * @param column the column index
   * @param comment the comment string
   */
  private void setCellComment(XSSFSheet sheet, Row row, int column, String comment) {
    if (row != null) {
      Cell cell = row.getCell(column);
      if (cell != null) {
        if (sheet != null) {
          XSSFComment cellComment = sheet.createDrawingPatriarch().createCellComment(new XSSFClientAnchor());
          cellComment.setString(comment);
          cell.setCellComment(cellComment);
        }
      }
    }
  }

  /**
   * Get the rows from the columns
   * @param columns an array of columns
   * @return an array of rows
   */
  private ArrayList<ArrayList<Object>> getRowsFromColumns(ArrayList<ArrayList<Object>> columns) {
    ArrayList<ArrayList<Object>> rows = new ArrayList<ArrayList<Object>>();
    if (columns != null) {
      for (int x = 0; x < columns.size(); x++) {
        ArrayList<Object> column = columns.get(x);
        if (column != null) {
          for (int y = 0; y < column.size(); y++) {
            Object dataValue = null;
            try {
              dataValue = column.get(y);
            } catch(IndexOutOfBoundsException e) {

            }

            ArrayList<Object> row = null;
            try {
              row = rows.get(y);
            } catch(IndexOutOfBoundsException e) {
            }

            if (row == null) {
              row = new ArrayList<Object>();
              rows.add(y, row);
            }
            setValueInRow(row, x, dataValue);
          }
        }
      }
    }
    return rows;
  }

  /**
   * Set the value into the row in the given index
   * @param row the array
   * @param index the index
   * @param value the value to put into the row
   * @return the updated row
   */
  private ArrayList<Object> setValueInRow(ArrayList<Object> row, int index, Object value) {
    if (row != null) {
      if (row.size() <= index) {
        /*
         * it is not large enough so we will insert empty values into the array
         * until it is large enough
         */
        while(row.size() <= index) {
          row.add("");
        }
      }
      row.set(index, value);
    }
    return row;
  }

  /**
   * Print the export column names and data value columns to System.out
   * @param columnNames the column names
   * @param columns the columns
   */
  private void printExportColumns(ArrayList<Object> columnNames, ArrayList<ArrayList<Object>> columns) {
    ArrayList<ArrayList<Object>> rows = new ArrayList<ArrayList<Object>>();
    if (columnNames != null && columnNames.size() > 0) {
      System.out.println("columnNames");
      System.out.println(columnNames);
    }

    rows = getRowsFromColumns(columns);
    if (rows != null && rows.size() > 0) {
      System.out.println("columnValues");

      for (int rowsCounter = 0; rowsCounter < rows.size(); rowsCounter++) {
        ArrayList<Object> row = rows.get(rowsCounter);
        System.out.println(row);
      }
    }
  }

  /**
   * Get the export column names for the step
   * @param nodeId the node id of the step
   * @return an array containing the export column names
   */
  private ArrayList<Object> getExportColumnNames(String nodeId) {
    ArrayList<Object> columnNames = new ArrayList<Object>();
    JSONArray exportColumns = getExportColumns(nodeId);
    if (exportColumns != null) {
      for (int x = 0; x < exportColumns.length(); x++) {
        try {
          JSONObject exportColumn = exportColumns.getJSONObject(x);
          String columnName = exportColumn.getString("columnName");
          columnNames.add(columnName);
        } catch (JSONException e) {
          e.printStackTrace();
        }
      }
    }
    return columnNames;
  }

  /**
   * Check if an export column is referencing the same object as another export column
   * @param exportColumn1 the first export column
   * @param exportColumn2 the second export column
   * @param depth the current depth we are currently referencing in terms of child fields
   * @return whether the export columns are referencing the same object
   */
  private boolean isExportColumnReferencingSameObject(JSONObject exportColumn1,
      JSONObject exportColumn2, int depth) {
    boolean result = false;

    String field1 = null;
    String field2 = null;

    if (exportColumn1 != null && exportColumn1.has("field")) {
      try {
        field1 = exportColumn1.getString("field");
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    if (exportColumn2 != null && exportColumn2.has("field")) {
      try {
        field2 = exportColumn2.getString("field");
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    JSONObject childField1 = null;
    JSONObject childField2 = null;

    if (exportColumn1 != null && exportColumn1.has("childField")) {
      try {
        childField1 = exportColumn1.getJSONObject("childField");
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    if (exportColumn2 != null && exportColumn2.has("childField")) {
      try {
        childField2 = exportColumn2.getJSONObject("childField");
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    if (depth == 0) {
      if (exportColumn1 == null && exportColumn2 == null) {
        result = false;
      } else if (exportColumn1 != null && exportColumn2 == null) {
        result = false;
      } else if (exportColumn1 == null && exportColumn2 != null) {
        result = false;
      } else if (exportColumn1 != null && exportColumn2 != null) {
        if (field1 == null && field2 == null) {
          result = false;
        } else if (field1 != null && field2 == null) {
          result = false;
        } else if (field1 == null && field2 != null) {
          result = false;
        } else if (field1.equals(field2)) {
          /*
           * the field values are the same so we will iterate to the child field objects
           * to see if they are the same as well
           */
          result = isExportColumnReferencingSameObject(childField1, childField2, depth + 1);
        } else if (!field1.equals(field2)) {
          result = false;
        }
      }
    } else {
      if (exportColumn1 == null && exportColumn2 == null) {
        /*
         * both export columns are null and we are on a level deeper than the first
         * which means the export columns are referencing the same object
         *
         * example
         *
         * exportColumn1 = {
         *     "field":"ideas",
         * }
         *
         * exportColumn2 = {
         *     "field":"ideas",
         * }
         *
         * the first time this function is called the field values are the same so
         * we iterate onto the childFields. when the function is called again, the
         * childField object will be passed in as the export column parameters and
         * will both be null. in this case the original export columns are both
         * referencing the same field "ideas" and both of their childField objects
         * are null. this means they are referencing the same object so we will
         * return true
         */
        result = true;
      } else if (exportColumn1 != null && exportColumn2 == null) {
        result = false;
      } else if (exportColumn1 == null && exportColumn2 != null) {
        result = false;
      } else if (exportColumn1 != null && exportColumn2 != null) {
        if (field1 == null && field2 == null) {
          //both field values are null so we will compare the child field objects
          result = isExportColumnReferencingSameObject(childField1, childField2, depth + 1);
        } else if (field1 != null && field2 == null) {
          //one of the fields is null but the other is not so they are not referencing the same object
          result = false;
        } else if (field1 == null && field2 != null) {
          //one of the fields is null but the other is not so they are not referencing the same object
          result = false;
        } else if (field1.equals(field2)) {
          /*
           * the field values are the same so we will iterate to the child field objects
           * to see if they are the same as well
           */
          result = isExportColumnReferencingSameObject(childField1, childField2, depth + 1);
        } else if (!field1.equals(field2)) {
          //the fields are not the same

          if (childField1 == null && childField2 == null) {
            /*
             * there are no child fields so we have reached the leaf nodes which means they
             * are referencing the same object
             */
            result = true;
          } else if (childField1 != null && childField2 == null) {
            //one of the columns has a child field but the other does not so they are not referencing the same object
            result = false;
          } else if (childField1 == null && childField2 != null) {
            //one of the columns has a child field but the other does not so they are not referencing the same object
            result = false;
          } else if (childField1 != null && childField2 != null) {
            //both of the columns have child fields which means they both go deeper and are not referencing the same object
            result = false;
          }
        }
      }
    }
    return result;
  }

  /**
   * Get the student data values for the export column
   * @param stepWorkId the step work id
   * @param nodeState the node state
   * @param nodeId the node if of the step
   * @return the student data values columns. this is a two dimensional array
   * with the first dimension being the columns and the second dimension being
   * the rows.
   */
  private ArrayList<ArrayList<Object>> getExportColumnDataValues(Long stepWorkId,
      JSONObject nodeState, String nodeId) {
    ArrayList<ArrayList<Object>> columns = new ArrayList<ArrayList<Object>>();
    ArrayList<ArrayList<Integer>> expandAndMultiplyAmountsList = new ArrayList<ArrayList<Integer>>();
    if (nodeState != null) {
      JSONArray exportColumns = getExportColumns(nodeId);
      if (exportColumns != null) {
        JSONArray visitedExportColumns = new JSONArray();
        for (int columnIndex = 0; columnIndex < exportColumns.length(); columnIndex++) {
          try {
            JSONObject exportColumn = exportColumns.getJSONObject(columnIndex);
            ArrayList<Integer> relatedColumnExpandAndMultiplyAmounts = null;

            /*
             * loop through all the visited export columns to check if there are
             * any that reference the same object. if there is a column that references
             * the same object, we need to apply the same expansion and muliplying
             * for our new column.
             */
            for (int visitedColumnIndex = 0; visitedColumnIndex < visitedExportColumns.length(); visitedColumnIndex++) {
              JSONObject visitedExportColumn = visitedExportColumns.getJSONObject(visitedColumnIndex);
              boolean isExportColumnReferencingSameObject = isExportColumnReferencingSameObject(visitedExportColumn, exportColumn, 0);
              if (isExportColumnReferencingSameObject) {
                /*
                 * our current column references the same object so we will get the
                 * expand and multiply amounts for the visited export column so we
                 * can apply it to our new column.
                 */
                relatedColumnExpandAndMultiplyAmounts = expandAndMultiplyAmountsList.get(visitedColumnIndex);
                break;
              }
            }

            ArrayList<Object> newColumn = getColumnValuesForField(exportColumn, stepWorkId, nodeState, nodeId);
            if (relatedColumnExpandAndMultiplyAmounts == null) {
              int newColumnSize = newColumn.size();
              int previousColumnLength = getColumnLength(columns);
              if (previousColumnLength == 0) {
                previousColumnLength = 1;
              }

              if (newColumnSize > 1) {
                if (columnIndex == 0) {
                  /*
                   * we are adding the first column so we will just add the column without
                   * having to perform any expanding or multiplying
                   */
                  columns.add(newColumn);
                } else {
                  /*
                   * we are not on the first column so we may need to perform some
                   * expanding and multiplying to the values
                   */

                  /*
                   * multiply all the previous columns by the number of values in this column
                   *
                   * example
                   *
                   * the first column for the "answer" field contains values hello and world
                   *
                   * answer
                   * ------
                   * hello
                   * world
                   *
                   * the new "x" column we are adding contains two values 1 and 2. this is how
                   * the columns will look after we perform the expanding and multiplying and add
                   * our new column
                   *
                   * answer| x
                   * ----------
                   * hello | 1
                   * world | 1
                   * hello | 2
                   * world | 2
                   *
                   * each column ("answer" and "x") have two values which means we need to multiply
                   * the existing column (the one that contains "hello" and "world"), and expand
                   * the new column (the one that contains 1 and 2).
                   */
                  columns = multiplyColumns(columns, newColumnSize);

                  updateExpandAndMultiplyAmounts(expandAndMultiplyAmountsList, newColumnSize);

                  /*
                   * expand each value in the current column by the length of the previous column
                   *
                   * answer
                   * ------
                   * hello
                   * world
                   *
                   * the new "x" column we are adding contains two values 1 and 2.
                   * the previous column has two values so we will need to expand
                   * each of the "x" values by two. we will end up with the x column
                   * containing the values 1, 1, 2, 2.
                   *
                   * answer| x
                   * ----------
                   * hello | 1
                   * world | 1
                   * hello | 2
                   * world | 2
                   */
                  ArrayList<Object> expandedColumn = expandColumn(newColumn, previousColumnLength);

                  columns.add(expandedColumn);
                }

                //create the expand and multiply amounts for this new column
                ArrayList<Integer> expandAndMultiplyAmounts = new ArrayList<Integer>();
                expandAndMultiplyAmounts.add(previousColumnLength);

                /*
                 * add the expand and multiply amounts for this new column
                 * to the expand and multiply amounts list
                 */
                expandAndMultiplyAmountsList.add(columnIndex, expandAndMultiplyAmounts);
              } else {
                updateExpandAndMultiplyAmounts(expandAndMultiplyAmountsList, newColumnSize);
                columns.add(newColumn);
                ArrayList<Integer> timesMultipliedList = new ArrayList<Integer>();
                timesMultipliedList.add(previousColumnLength);

                /*
                 * add the expand and multiply amounts for this new column
                 * to the expand and multiply amounts list
                 */
                expandAndMultiplyAmountsList.add(columnIndex, timesMultipliedList);
              }
            } else {
              for (int expandAndMultiplyIndex = 0; expandAndMultiplyIndex < relatedColumnExpandAndMultiplyAmounts.size(); expandAndMultiplyIndex++) {
                int tempTimesMultiplied = relatedColumnExpandAndMultiplyAmounts.get(expandAndMultiplyIndex);
                if (expandAndMultiplyIndex == 0) {
                  newColumn = expandColumn(newColumn, tempTimesMultiplied);
                } else {
                  newColumn = multiplyColumn(newColumn, tempTimesMultiplied);
                }
              }

              updateExpandAndMultiplyAmounts(expandAndMultiplyAmountsList, 1);
              columns = multiplyColumns(columns, 1);
              columns.add(newColumn);
              ArrayList<Integer> timesMultipliedList = new ArrayList<Integer>();
              timesMultipliedList.add(1);

              /*
               * add the expand and multiply amounts for this new column
               * to the expand and multiply amounts list
               */
              expandAndMultiplyAmountsList.add(columnIndex, timesMultipliedList);
            }

            visitedExportColumns.put(exportColumn);
          } catch (JSONException e) {
            e.printStackTrace();
          }
        }
      }
    }
    return columns;
  }

  /**
   * Get the length of the columns. All the columns should be the same length.
   * @param columns the columns
   * @return the length of the columns
   */
  private int getColumnLength(ArrayList<ArrayList<Object>> columns) {
    int length = 0;
    if (columns != null && columns.size() > 0) {
      ArrayList<Object> column = columns.get(0);
      length = column.size();
    }
    return length;
  }

  /**
   * Update the expand and multiply amounts for all the columns
   * @param timesMultiplied the array of column amounts
   * @param times the multiply amount to add to the array
   * @return the updated array of expand and multiply amounts
   */
  private ArrayList<ArrayList<Integer>> updateExpandAndMultiplyAmounts(ArrayList<ArrayList<Integer>> timesMultiplied, int times) {
    if (timesMultiplied != null) {
      for (int x = 0; x < timesMultiplied.size(); x++) {
        ArrayList<Integer> timesMultipliedArray = timesMultiplied.get(x);
        timesMultipliedArray.add(times);
      }
    }
    return timesMultiplied;
  }

  /**
   * Multiply the columns
   * @param columns the columns
   * @param times the number of times to multiply the columns
   * @return the updated columns
   */
  private ArrayList<ArrayList<Object>> multiplyColumns(ArrayList<ArrayList<Object>> columns, int times) {
    ArrayList<ArrayList<Object>> newColumns = new ArrayList<ArrayList<Object>>();
    for (int x = 0; x < columns.size(); x++) {
      ArrayList<Object> column = columns.get(x);
      ArrayList<Object> newColumn = new ArrayList<Object>();
      newColumns.add(x, newColumn);

      /*
       * multiply the column by adding all the values into the new column
       * multiple times
       */
      for (int y = 0; y < times; y++) {
        newColumn.addAll(column);
      }
    }
    return newColumns;
  }

  /**
   * Multiply a single column
   * @param column the column
   * @param times the number of times to multiply the column
   * @return the updated column
   */
  private ArrayList<Object> multiplyColumn(ArrayList<Object> column, int times) {
    ArrayList<Object> newColumn = new ArrayList<Object>();
    for (int y = 0; y < times; y++) {
      newColumn.addAll(column);
    }
    return newColumn;
  }

  /**
   * Expand the column. This means for each element in the column we will
   * multiply that element a certain number of times.
   *
   * example
   *
   * before
   * [1, 2, 3]
   *
   * if we expand the column elements times 3 we will end up with
   *
   * after
   * [1, 1, 1, 2, 2, 2, 3, 3, 3]
   *
   * @param column the column to expand
   * @param times the number of times to expand the elements in the column
   * @return the updated column
   */
  private ArrayList<Object> expandColumn(ArrayList<Object> column, int times) {
    ArrayList<Object> newColumn = new ArrayList<Object>();
    for (int x = 0; x < column.size(); x++) {
      Object columnValue = column.get(x);
      for (int y = 0; y < times; y++) {
        newColumn.add(columnValue);
      }
    }
    return newColumn;
  }

  /**
   * Set the node state response into the cell
   * @param tempRow
   * @param tempRowVector
   * @param tempColumn
   * @param nodeState
   * @param nodeId
   * @return the next empty column
   */
  private int setNodeStateResponse(Row tempRow,
                                   Vector<String> tempRowVector,
                                   int tempColumn,
                                   JSONObject nodeState,
                                   String nodeId) {
    String response = getNodeStateResponse(nodeState, nodeId);

    if (response != null) {
      tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, response);
    } else {
      tempColumn++;
      addEmptyElementsToVector(tempRowVector, 1);
    }
    return tempColumn;
  }

  /**
   * Clear the step visit counts for all steps
   */
  private void clearStepVisitCount() {
    nodeIdToStepVisitCount = new HashMap<String, Integer>();
  }

  /**
   * Increase the step visit count for a step
   * @param nodeId the node id
   * @return the new step visit count
   */
  private int increaseStepVisitCount(String nodeId) {
    Integer count = nodeIdToStepVisitCount.get(nodeId);
    if (count == null) {
      count = 0;
    }
    count++;
    nodeIdToStepVisitCount.put(nodeId, count);
    return count;
  }

  /**
   * Get the step visit count for a step
   * @param nodeId the node id
   * @return the step visit count for a step
   */
  private int getStepVisitCount(String nodeId) {
    Integer count = nodeIdToStepVisitCount.get(nodeId);
    if (count == null) {
      count = 0;
    }
    return count;
  }

  private void clearStepRevisionCount() {
    nodeIdToStepRevisionCount = new HashMap<String, Integer>();
  }

  /**
   * Increase the step revision count for a step
   * @param nodeId the node id
   * @return the new step revision count
   */
  private int increaseStepRevisionCount(String nodeId) {
    Integer count = nodeIdToStepRevisionCount.get(nodeId);
    if (count == null) {
      count = 0;
    }
    count++;
    nodeIdToStepRevisionCount.put(nodeId, count);
    return count;
  }

  /**
   * Get the step revision count for a step
   * @param nodeId the node id
   * @return the step revision count for a step
   */
  private int getStepRevisionCount(String nodeId) {
    Integer count = nodeIdToStepRevisionCount.get(nodeId);
    if (count == null) {
      count = 0;
    }
    return count;
  }

  /**
   * Creates an excel workbook that contains student work data
   * All student work will be displayed on a single sheet.
   * The top row contains the node titles and the left column
   * contains the workgroup ids. Each x, y cell contains the latest
   * student work for that node, workgroup.
   *
   * @param nodeIdToNodeTitlesMap a mapping of node id to node titles
   * @param workgroupIds a vector of workgroup ids
   * @param nodeIdList a list of ordered node ids
   * @param runId the id of the run
   * @param nodeIdToNode a mapping of node id to node object
   * @param nodeIdToNodeContent a mapping of node id to node content
   * @param workgroupIdToPeriodId a mapping of workgroup id to period id
   * @param teacherWorkgroupIds a list of teacher workgroup ids
   *
   * @return an excel workbook that contains student work data
   */
  private XSSFWorkbook getLatestStudentWorkXLSExport(HashMap<String, String> nodeIdToNodeTitlesMap,
                                                     Vector<String> workgroupIds,
                                                     List<String> nodeIdList,
                                                     String runId,
                                                     HashMap<String, JSONObject> nodeIdToNode,
                                                     HashMap<String, JSONObject> nodeIdToNodeContent,
                                                     HashMap<Integer, Integer> workgroupIdToPeriodId,
                                                     List<String> teacherWorkgroupIds) {

    XSSFWorkbook wb = null;

    if (isFileTypeXLS(fileType)) {
      wb = new XSSFWorkbook();
      XSSFSheet mainSheet = wb.createSheet("Latest Work For All Students");
    } else if (isFileTypeCSV(fileType)) {
      wb = null;
    }

    /*
     * set the header rows in the sheet
     * Step Title
     * Step Type
     * Step Prompt
     * Node Id
     * Step Extra
     */
    setGetLatestStudentWorkHeaderRows(wb, nodeIdList, nodeIdToNodeTitlesMap, nodeIdToNodeContent);
    setGetLatestStudentWorkStudentRows(wb, nodeIdToNodeTitlesMap, workgroupIds, nodeIdList, runId, nodeIdToNode, nodeIdToNodeContent, workgroupIdToPeriodId, teacherWorkgroupIds);
    return wb;
  }

  /**
   * Set all the student data, each row represents one workgroup
   *
   * @param workbook the excel workbook
   * @param nodeIdToNodeTitlesMap a mapping of node id to node titles
   * @param workgroupIds a vector of workgroup ids
   * @param nodeIdList a list of node ids
   * @param runId the run id
   * @param nodeIdToNodeContent a mapping of node id to node content
   * @param workgroupIdToPeriodId a mapping of workgroup id to period id
   * @param teacherWorkgroupIds a list of teacher workgroup ids
   */
  private void setGetLatestStudentWorkStudentRows(XSSFWorkbook workbook,
                                                  HashMap<String, String> nodeIdToNodeTitlesMap,
                                                  Vector<String> workgroupIds,
                                                  List<String> nodeIdList,
                                                  String runId,
                                                  HashMap<String, JSONObject> nodeIdToNode,
                                                  HashMap<String, JSONObject> nodeIdToNodeContent,
                                                  HashMap<Integer, Integer> workgroupIdToPeriodId,
                                                  List<String> teacherWorkgroupIds) {

    XSSFSheet mainSheet = null;
    int rowCounter = 0;

    if (workbook != null) {
      mainSheet = workbook.getSheetAt(0);
      rowCounter = mainSheet.getLastRowNum() + 1;
    }

    for (int x = 0; x < workgroupIds.size(); x++) {
      Row rowForWorkgroupId = createRow(mainSheet, x + rowCounter);
      Vector<String> rowForWorkgroupIdVector = createRowVector();
      int workgroupColumnCounter = 0;
      String userId = workgroupIds.get(x);
      int periodId = workgroupIdToPeriodId.get(Integer.parseInt(userId));

      /*
       * create the row that will display the user data such as the actual values
       * for workgroup id, student login, teacher login, period name, etc.
       */
      workgroupColumnCounter = createUserDataRow(workgroupColumnCounter, rowForWorkgroupId, rowForWorkgroupIdVector, userId, true, true, null);

      /*
       * increment the column counter to create an empty column under the header column
       * that contains Step Title, Step Type, Step Prompt, Node Id, Step Extra
       */
      workgroupColumnCounter++;
      addEmptyElementsToVector(rowForWorkgroupIdVector, 1);
      UserInfo userInfo = vleService.getUserInfoByWorkgroupId(Long.parseLong(userId));
      List<StepWork> stepWorksForWorkgroupId = vleService.getStepWorksByUserInfo(userInfo);
      for (int y = 0; y < nodeIdList.size(); y++) {
        String nodeId = nodeIdList.get(y);
        JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
        JSONObject nodeJSONObject = nodeIdToNode.get(nodeId);

        /*
         * set the review cells if applicable to this step, this means filling in the
         * cells that specify the associated workgroup id and associated work and only
         * applies for review type steps. if the current step/node is not a review cell
         * this function call will not need to do much besides fill in N/A values
         * or nothing at all depending on whether we are getting "latestStudentWork"
         * or "allStudentWork"
         */
        workgroupColumnCounter = setGetLatestStudentWorkReviewCells(teacherWorkgroupIds, stepWorksForWorkgroupId, runId, periodId, userInfo, nodeJSONObject, nodeContent, rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, "latestStudentWork");

        List<StepWork> stepWorksForNodeId = getStepWorksForNodeId(stepWorksForWorkgroupId, nodeId);
        StepWork latestStepWorkWithResponse = getLatestStepWorkWithResponse(stepWorksForNodeId);
        workgroupColumnCounter = setStepWorkResponse(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, latestStepWorkWithResponse, nodeId);

        if (isAutoGraded(nodeContent)) {
          workgroupColumnCounter = setLatestAutoScoreValues(stepWorksForNodeId, rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter);
        }

        workgroupColumnCounter = setLatestAnnotationScore(stepWorksForNodeId, rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, nodeId);
        workgroupColumnCounter = setLatestAnnotationComment(stepWorksForNodeId, rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter);
      }
      writeCSV(rowForWorkgroupIdVector);
    }
  }

  /**
   * Set the extra cells for the review step
   *
   * @param teacherWorkgroupIds a list of teacher workgroup ids
   * @param stepWorksForWorkgroupId a list of stepwork objects for a workgroup
   * @param runId the run id
   * @param periodId the period id
   * @param userInfo the userinfo object
   * @param nodeContent the node content
   * @param rowForWorkgroupId the excel row
   * @param rowForWorkgroupIdVector the csv row
   * @param workgroupColumnCounter the counter for the column
   * @param exportType the export type "allStudentWork" or "latestStudentWork"
   *
   * @return the updated column position
   */
  private int setGetLatestStudentWorkReviewCells(List<String> teacherWorkgroupIds,
                                                 List<StepWork> stepWorksForWorkgroupId,
                                                 String runId, int periodId,
                                                 UserInfo userInfo,
                                                 JSONObject nodeJSONObject,
                                                 JSONObject nodeContent,
                                                 Row rowForWorkgroupId,
                                                 Vector<String> rowForWorkgroupIdVector,
                                                 int workgroupColumnCounter,
                                                 String exportType) {

    String reviewType = "";

    try {
      if (nodeJSONObject == null) {
      } else if (nodeJSONObject.has("peerReview")) {
        reviewType = nodeJSONObject.getString("peerReview");
      } else if (nodeJSONObject.has("teacherReview")) {
        reviewType = nodeJSONObject.getString("teacherReview");
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }

    boolean addedReviewColumns = false;

    if (reviewType.equals("annotate")) {
      /*
       * this is a step where the student reads work from their classmate and
       * writes feedback/annotates it
       */

      try {
        if (nodeJSONObject.has("peerReview")) {
          /*
           * this is when the student receives classmate work to view and
           * write a peer review
           */

          String associatedStartNodeId = nodeJSONObject.getString("associatedStartNode");
          Node node = vleService.getNodeByNodeIdAndRunId(associatedStartNodeId, runId);

          PeerReviewWork peerReviewWork = vleService.getPeerReviewWorkByRunPeriodNodeReviewerUserInfo(new Long(runId), new Long(periodId), node, userInfo);

          if (peerReviewWork != null) {
            UserInfo userInfoReviewed = peerReviewWork.getUserInfo();
            Long workgroupIdReviewed = userInfoReviewed.getWorkgroupId();
            StepWork peerReviewStepWork = peerReviewWork.getStepWork();
            String reviewedWork = getStepWorkResponse(peerReviewStepWork);

            if (workgroupIdReviewed == -2) {
              workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, "Canned Response");
              String authoredWork = nodeContent.getString("authoredWork");
              workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, authoredWork);
            } else {
              workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, workgroupIdReviewed);
              workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, reviewedWork);
            }
            addedReviewColumns = true;
          }
        } else if (nodeJSONObject.has("teacherReview")) {
          /*
           * this is when the student receives the pre-written/canned work
           * to view and write a peer review
           */

          String authoredWork = nodeContent.getString("authoredWork");
          workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, "Teacher Response");
          workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, authoredWork);
          addedReviewColumns = true;
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }

      if (!addedReviewColumns) {
        workgroupColumnCounter += 2;
        addEmptyElementsToVector(rowForWorkgroupIdVector, 2);
      }
    } else if (reviewType.equals("revise")) {
      /*
       * this is a step where the student reads an annotation from their classmate
       * and revises their work based on it
       */

      try {
        if (nodeJSONObject.has("peerReview")) {
          String associatedStartNodeId = nodeJSONObject.getString("associatedStartNode");
          Node node = vleService.getNodeByNodeIdAndRunId(associatedStartNodeId, runId);
          PeerReviewWork peerReviewWork = vleService.getPeerReviewWorkByRunPeriodNodeWorkerUserInfo(new Long(runId), new Long(periodId), node, userInfo);

          if (peerReviewWork != null) {
            UserInfo reviewerUserInfo = peerReviewWork.getReviewerUserInfo();

            if (reviewerUserInfo != null) {
              Long reviewerWorkgroupId = reviewerUserInfo.getWorkgroupId();
              Annotation annotation = peerReviewWork.getAnnotation();
              if (annotation != null) {
                String annotationData = annotation.getData();
                JSONObject annotationDataJSONObject = new JSONObject(annotationData);
                String annotationValue = annotationDataJSONObject.getString("value");
                workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, reviewerWorkgroupId);
                workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, annotationValue);
                addedReviewColumns = true;
              } else {
                if (reviewerWorkgroupId == -2) {
                  String authoredReview = nodeContent.getString("authoredReview");
                  workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, "Canned Response");
                  workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, authoredReview);
                  addedReviewColumns = true;
                }
              }
            }
          }
        } else if (nodeJSONObject.has("teacherReview")) {
          String associatedStartNodeId = nodeJSONObject.getString("associatedStartNode");
          List<StepWork> stepWorksForNodeId = getStepWorksForNodeId(stepWorksForWorkgroupId, associatedStartNodeId);
          StepWork latestStepWorkForNodeId = getLatestStepWorkWithResponse(stepWorksForNodeId);
          List<UserInfo> fromWorkgroups = vleService.getUserInfoByWorkgroupIds(teacherWorkgroupIds);
          List<Annotation> annotations = vleService.getAnnotationByFromWorkgroupsAndStepWork(fromWorkgroups, latestStepWorkForNodeId, "comment");

          Annotation latestAnnotation = null;

          for (int x = 0; x < annotations.size(); x++) {
            Annotation tempAnnotation = annotations.get(x);

            if (latestAnnotation == null) {
              latestAnnotation = tempAnnotation;
            } else {
              if (tempAnnotation.getPostTime().getTime() > latestAnnotation.getPostTime().getTime()) {
                latestAnnotation = tempAnnotation;
              }
            }
          }

          if (latestAnnotation != null) {
            String annotationData = latestAnnotation.getData();
            JSONObject annotationJSONObject = new JSONObject(annotationData);
            workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, "Teacher Response");
            workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, annotationJSONObject.getString("value"));
            addedReviewColumns = true;
          }
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }

      if (!addedReviewColumns) {
        workgroupColumnCounter += 2;
        addEmptyElementsToVector(rowForWorkgroupIdVector, 2);
      }
    } else {
      if (exportType.equals("allStudentWork")) {
        /*
         * if this is for the all student work excel export, we will always need
         * to fill the review cells
         */
        workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, "N/A");
        workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, "N/A");
        addedReviewColumns = true;
      } else if (exportType.equals("latestStudentWork")) {
        /*
         * if this is for the latest student work excel export, we will not
         * need to fill the review cells
         */
      }
    }
    return workgroupColumnCounter;
  }

  /**
   * Create the header rows in the sheet
   * Step Title
   * Step Type
   * Step Prompt
   * Node Id
   * Step Extra
   *
   * @param workbook the excel work book
   * @param nodeIdList a list of nodeIds in the order they appear in the project
   * @param nodeIdToNodeTitlesMap a map of node id to node titles
   * @param nodeIdToNodeContent a map of node id to node content
   */
  private void setGetLatestStudentWorkHeaderRows(
      XSSFWorkbook workbook,
      List<String> nodeIdList,
      HashMap<String, String> nodeIdToNodeTitlesMap,
      HashMap<String, JSONObject> nodeIdToNodeContent) {
    XSSFSheet mainSheet = null;

    if (workbook != null) {
      mainSheet = workbook.getSheetAt(0);
    }

    int rowCounter = 0;
    int headerColumn = 0;

    Row stepTitleRow = createRow(mainSheet, rowCounter++);
    Vector<String> stepTitleRowVector = createRowVector();
    Row stepTypeRow = createRow(mainSheet, rowCounter++);
    Vector<String> stepTypeRowVector = createRowVector();
    Row stepPromptRow = createRow(mainSheet, rowCounter++);
    Vector<String> stepPromptRowVector = createRowVector();
    Row nodeIdRow = createRow(mainSheet, rowCounter++);
    Vector<String> nodeIdRowVector = createRowVector();
    Row stepExtraRow = createRow(mainSheet, rowCounter++);
    Vector<String> stepExtraRowVector = createRowVector();
    for (int x = 0; x < 13; x++) {
      setCellValue(stepTitleRow, stepTitleRowVector, x, "");
      setCellValue(stepTypeRow, stepTypeRowVector, x, "");
      setCellValue(stepPromptRow, stepPromptRowVector, x, "");
      setCellValue(nodeIdRow, nodeIdRowVector, x, "");
      setCellValue(stepExtraRow, stepExtraRowVector, x, "");
    }

    //start on column 13 because the first 13 columns are for the user data columns
    int columnCounter = 13;

    //set the cells that describe each of the rows
    setCellValue(stepTitleRow, stepTitleRowVector, columnCounter, "Step Title");
    setCellValue(stepTypeRow, stepTypeRowVector, columnCounter, "Step Type");
    setCellValue(stepPromptRow, stepPromptRowVector, columnCounter, "Step Prompt");
    setCellValue(nodeIdRow, nodeIdRowVector, columnCounter, "Node Id");
    setCellValue(stepExtraRow, stepExtraRowVector, columnCounter, "Step Extra");

    /*
     * create and populate the row that contains the user data headers such as
     * WorkgroupId, Student Login 1, Student Login 2, etc.
     */
    Row userDataHeaderRow = createRow(mainSheet, rowCounter++);
    Vector<String> userDataHeaderRowVector = createRowVector();
    columnCounter = createUserDataHeaderRow(headerColumn, userDataHeaderRow, userDataHeaderRowVector, true, true);

    /*
     * increment the column counter so the student work begins on the next column
     * and not underneath the column that contains the cells above that contain
     * "Step Title", "Step Type", etc.
     */
    columnCounter++;

    /*
     * loop through the node ids to set the step titles, step types,
     * step prompts, node ids, and step extras
     */
    for (int nodeIndex=0; nodeIndex<nodeIdList.size(); nodeIndex++) {
      //get the node id
      String nodeId = nodeIdList.get(nodeIndex);

      //set the header columns for getLatestWork
      columnCounter = setGetLatestStudentWorkHeaderColumn(
        stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow,
        stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
        columnCounter, workbook, nodeIdToNodeTitlesMap, nodeIdToNodeContent, nodeId);
    }

    //write all of the rows to the csv if we are generating a csv file
    writeCSV(stepTitleRowVector);
    writeCSV(stepTypeRowVector);
    writeCSV(stepPromptRowVector);
    writeCSV(nodeIdRowVector);
    writeCSV(stepExtraRowVector);
    writeCSV(userDataHeaderRowVector);
  }

  /**
   * Get the header columns for getLatestStudentWork
   *
   * @param stepTitleRow the step title excel row
   * @param stepTypeRow the step type excel row
   * @param stepPromptRow the step prompt excel row
   * @param nodeIdRow the node id excel row
   * @param stepExtraRow the step extra excel row
   * @param stepTitleRowVector the step title csv row
   * @param stepTypeRowVector the step type csv row
   * @param stepPromptRowVector the step prompt csv row
   * @param nodeIdRowVector the node id csv row
   * @param stepExtraRowVector the step extra csv row
   * @param columnCounter the column counter
   * @param workbook the excel workbook
   * @param nodeIdToNodeTitlesMap the mapping of node id to node title
   * @param nodeIdToNodeContent the mapping of node id to node content
   * @param nodeId the node id
   *
   * @return the updated column position
   */
  private int setGetLatestStudentWorkHeaderColumn(
      Row stepTitleRow,
      Row stepTypeRow,
      Row stepPromptRow,
      Row nodeIdRow,
      Row stepExtraRow,
      Vector<String> stepTitleRowVector,
      Vector<String> stepTypeRowVector,
      Vector<String> stepPromptRowVector,
      Vector<String> nodeIdRowVector,
      Vector<String> stepExtraRowVector,
      int columnCounter,
      XSSFWorkbook workbook,
      HashMap<String, String> nodeIdToNodeTitlesMap,
      HashMap<String, JSONObject> nodeIdToNodeContent,
      String nodeId) {
    String nodeTitle = nodeIdToNodeTitlesMap.get(nodeId);
    JSONObject nodeJSONObject = nodeIdToNode.get(nodeId);
    JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);

    if (isReviewType(nodeJSONObject)) {
      //the column is for a review type so we may need to allocate multiple columns
      columnCounter = setGetLatestStudentWorkReviewHeaderCells(
        stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow,
        stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
        columnCounter, nodeId, nodeTitle, nodeJSONObject, nodeContent);
    } else if (isAssessmentListType(nodeContent)) {
      //the step is AssessmentList so we may need to allocate multiple columns
      columnCounter = setGetLatestStudentWorkAssessmentListHeaderCells(
        stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow,
        stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
        columnCounter, nodeId, nodeTitle, nodeContent);
    } else if (isAutoGraded(nodeContent)) {
      //the step is auto graded
      columnCounter = setGetLatestStudentWorkAutoGradedHeaderCells(
        stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow,
        stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
        columnCounter, nodeId, nodeTitle, nodeContent);
    } else {
      //the column is for all other step types
      columnCounter = setGetLatestStudentWorkRegularHeaderCells(
        stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow,
        stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
        columnCounter, nodeId, nodeTitle, nodeContent);
    }

    String nodeType = "";
    try {
      if (nodeContent != null) {
        nodeType = nodeContent.getString("type");
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }

    String nodePrompt = getPromptFromNodeContent(nodeContent);
    String stepExtra = "";
    stepExtra = "Teacher Score";

    columnCounter = setGetLatestStepWorkHeaderCells(
      columnCounter,
      stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow,
      stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
      nodeTitle, nodeType, nodePrompt, nodeId, stepExtra);

    stepExtra = "Teacher Max Score";

    //set the step extra cell so the researcher knows this column is for the teacher max score
    columnCounter = setGetLatestStepWorkHeaderCells(
      columnCounter,
      stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow,
      stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
      nodeTitle, nodeType, nodePrompt, nodeId, stepExtra);

    //set the step extra so the researcher knows this column is for the teacher comment
    stepExtra = "Teacher Comment";

    //set the step extra cell
    columnCounter = setGetLatestStepWorkHeaderCells(
      columnCounter,
      stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow,
      stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
      nodeTitle, nodeType, nodePrompt, nodeId, stepExtra);

    return columnCounter;
  }

  /**
   * Get the review type from the content
   * @param nodeJSONObject
   * @return the review type "start", "annotate", or "revise"
   */
  private String getReviewType(JSONObject nodeJSONObject) {
    String reviewType = "";
    try {
      if (nodeJSONObject == null) {
      } else if (nodeJSONObject.has("peerReview")) {
        reviewType = nodeJSONObject.getString("peerReview");
      } else if (nodeJSONObject.has("teacherReview")) {
        reviewType = nodeJSONObject.getString("teacherReview");
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return reviewType;
  }

  /**
   * Check if the node is an AssessmentList
   * @param nodeContent
   * @return whether the node is an assessment list type
   */
  private boolean isAssessmentListType(JSONObject nodeContent) {
    if (nodeContent == null) {
      return false;
    }

    String type = null;
    try {
      type = nodeContent.getString("type");
    } catch (JSONException e) {
      e.printStackTrace();
    }

    if (type == null) {
      return false;
    } else if (type.equals("AssessmentList")) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Check if the node is a review type
   * @param nodeJSONObject
   * @return whether the node is a review type
   */
  private boolean isReviewType(JSONObject nodeJSONObject) {
    if (nodeJSONObject == null) {
      return false;
    } else if (nodeJSONObject.has("peerReview") || nodeJSONObject.has("teacherReview")) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Check if the node is a peer review
   * @param nodeJSONObject
   * @return whether the node is a peer review
   */
  @SuppressWarnings("unused")
  private boolean isPeerReview(JSONObject nodeJSONObject) {
    if (nodeJSONObject == null) {
      return false;
    } else if (nodeJSONObject.has("peerReview")) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Check if the node is a teacher review
   * @param nodeJSONObject
   * @return whether the node is a teacher review
   */
  @SuppressWarnings("unused")
  private boolean isTeacherReview(JSONObject nodeJSONObject) {
    if (nodeJSONObject == null) {
      return false;
    } else if (nodeJSONObject.has("teacherReview")) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Check if the review type is "annotate"
   * @param nodeJSONObject
   * @return whether the node is an annotate review type
   */
  private boolean isAnnotateReviewType(JSONObject nodeJSONObject) {
    if (nodeJSONObject == null) {
      return false;
    } else {
      String reviewType = getReviewType(nodeJSONObject);
      return reviewType.equals("annotate");
    }
  }

  /**
   * Check if the review type is "revise"
   * @param nodeJSONObject
   * @return whether the node is a revise review type
   */
  private boolean isReviseReviewType(JSONObject nodeJSONObject) {
    if (nodeJSONObject == null) {
      return false;
    } else {
      String reviewType = getReviewType(nodeJSONObject);
      return reviewType.equals("revise");
    }
  }

  /**
   * Check if the node is "annotate" or "revise" type
   * @param nodeJSONObject
   * @return whether the node is an annotate or revise review type
   */
  private boolean isAnnotateOrReviseReviewType(JSONObject nodeJSONObject) {
    if (nodeJSONObject == null) {
      return false;
    }

    String reviewType = "";
    try {
      if (nodeJSONObject.has("peerReview")) {
        reviewType = nodeJSONObject.getString("peerReview");
      } else if (nodeJSONObject.has("teacherReview")) {
        reviewType = nodeJSONObject.getString("teacherReview");
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    if (reviewType.equals("annotate") || reviewType.equals("revise")) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Check if the node utilizes CRater
   * @param nodeJSONObject the step content
   * @return whether the step uses CRater
   */
  private boolean isCRaterType(JSONObject nodeJSONObject) {
    boolean result = false;

    if (nodeJSONObject == null) {
      result = false;
    } else {
      if (nodeJSONObject.has("cRater") && !nodeJSONObject.isNull("cRater")) {
        try {
          JSONObject cRaterJSONObject = nodeJSONObject.getJSONObject("cRater");
          if (cRaterJSONObject.has("cRaterItemId")) {
            String cRaterItemId = cRaterJSONObject.getString("cRaterItemId");
            if (cRaterItemId != null && !cRaterItemId.equals("")) {
              result = true;
            }
          }
        } catch (JSONException e) {
          e.printStackTrace();
        }
      }
    }
    return result;
  }

  /**
   * Check if the step is auto graded
   * @param nodeJSONObject the step content
   * @return whether the step is auto graded
   */
  private boolean isAutoGraded(JSONObject nodeJSONObject) {
    boolean result = false;
    if (nodeJSONObject == null) {
      result = false;
    } else {
      result = nodeJSONObject.optBoolean("isAutoGraded");
    }
    return result;
  }

  /**
   * Set the header cells for getLatestStudentWork for a review type node
   * which may require multiple columns
   *
   * @param stepTitleRow the step title excel row
   * @param stepTypeRow the step type excel row
   * @param stepPromptRow the step prompt excel row
   * @param nodeIdRow the node id excel row
   * @param stepExtraRow the step extra excel row
   * @param stepTitleRowVector the step title csv row
   * @param stepTypeRowVector the step type csv row
   * @param stepPromptRowVector the step prompt csv row
   * @param nodeIdRowVector the node id csv row
   * @param stepExtraRowVector the step extra csv row
   * @param columnCounter the column counter
   * @param nodeId the node id
   * @param nodeTitle the node title
   * @param nodeContent the node content
   *
   * @return the updated column position
   */
  private int setGetLatestStudentWorkReviewHeaderCells(
      Row stepTitleRow,
      Row stepTypeRow,
      Row stepPromptRow,
      Row nodeIdRow,
      Row stepExtraRow,
      Vector<String> stepTitleRowVector,
      Vector<String> stepTypeRowVector,
      Vector<String> stepPromptRowVector,
      Vector<String> nodeIdRowVector,
      Vector<String> stepExtraRowVector,
      int columnCounter,
      String nodeId,
      String nodeTitle,
      JSONObject nodeJSONObject,
      JSONObject nodeContent) {
    int columns = 1;

    if (isAnnotateOrReviseReviewType(nodeJSONObject)) {
      columns = 3;
    }

    for (int columnCount = 0; columnCount < columns; columnCount++) {
      /*
       * whether to set the cell value, usually this will stay true
       * except when the cell value becomes set when we call another
       * function that sets it for us
       */
      boolean setCells = true;

      String nodeType = "";
      try {
        nodeType = nodeContent.getString("type");
      } catch (JSONException e) {
        e.printStackTrace();
      }

      String nodePrompt = getPromptFromNodeContent(nodeContent);
      String stepExtra = "";

      if (columns == 3) {
        if (columnCount == 0) {
          //cell 1/3

          //set the step extra to help researchers identify what this column represents
          if (isAnnotateReviewType(nodeJSONObject)) {
            stepExtra = "Workgroup I am writing feedback to";
          } else if (isReviseReviewType(nodeJSONObject)) {
            stepExtra = "Workgroup that is writing feedback to me";
          }
        } else if (columnCount == 1) {
          //cell 2/3

          //set the step extra to help researchers identify what this column represents
          if (isAnnotateReviewType(nodeJSONObject)) {
            stepExtra = "Work from other workgroup";
          } else if (isReviseReviewType(nodeJSONObject)) {
            stepExtra = "Feedback from workgroup";
          }
        } else if (columnCount == 2) {
          //cell 3/3

          if (isAssessmentListType(nodeContent)) {
            /*
             * this is an assessment list step so we need to create a column for each assessment part.
             * this function sets the cells so we don't have to
             */
            columnCounter = setGetLatestStudentWorkAssessmentListHeaderCells(
              stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow,
              stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
              columnCounter, nodeId, nodeTitle, nodeContent);

            //make sure we don't create the cells again below
            setCells = false;
          } else {
            //set the step extra to help researchers identify what this column represents
            if (isAnnotateReviewType(nodeJSONObject)) {
              stepExtra = "Feedback written to other workgroup";
            } else if (isReviseReviewType(nodeJSONObject)) {
              stepExtra = "Work that I have revised based on feedback";
            }
          }
        }
      }

      if (setCells) {
        columnCounter = setGetLatestStepWorkHeaderCells(columnCounter,
            stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow,
            stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
            nodeTitle, nodeType, nodePrompt, nodeId, stepExtra);
      }
    }
    return columnCounter;
  }

  /**
   * Set the header cells for getLatestStudentWork for an assessment list type node
   * which may require multiple columns
   *
   * @param stepTitleRow the step title excel row
   * @param stepTypeRow the step type excel row
   * @param stepPromptRow the step prompt excel row
   * @param nodeIdRow the node id excel row
   * @param stepExtraRow the step extra excel row
   * @param stepTitleRowVector the step title csv row
   * @param stepTypeRowVector the step type csv row
   * @param stepPromptRowVector the step prompt csv row
   * @param nodeIdRowVector the node id csv row
   * @param stepExtraRowVector the step extra csv row
   * @param columnCounter the column counter
   * @param nodeId the node id
   * @param nodeTitle the node title
   * @param nodeContent the node content
   *
   * @return the updated column position
   */
  private int setGetLatestStudentWorkAssessmentListHeaderCells(
      Row stepTitleRow,
      Row stepTypeRow,
      Row stepPromptRow,
      Row nodeIdRow,
      Row stepExtraRow,
      Vector<String> stepTitleRowVector,
      Vector<String> stepTypeRowVector,
      Vector<String> stepPromptRowVector,
      Vector<String> nodeIdRowVector,
      Vector<String> stepExtraRowVector,
      int columnCounter,
      String nodeId,
      String nodeTitle,
      JSONObject nodeContent) {
    JSONArray assessmentParts = null;
    try {
      assessmentParts = nodeContent.getJSONArray("assessments");
    } catch (JSONException e1) {
      e1.printStackTrace();
    }

    String nodeType = "";
    try {
      nodeType = nodeContent.getString("type");
    } catch (JSONException e) {
      e.printStackTrace();
    }

    String nodePrompt = getPromptFromNodeContent(nodeContent);
    String stepExtra = "";

    int partCounter = 1;
    for (int x = 0; x < assessmentParts.length(); x++) {
      try {
        stepExtra = "";
        JSONObject assessmentPart = assessmentParts.optJSONObject(x);

        if (assessmentPart != null) {
          String partLabel = "Part " + partCounter;
          String type = assessmentPart.optString("type");
          if (type != null && type.equals("checkbox")) {
            JSONArray choices = assessmentPart.optJSONArray("choices");
            if (choices != null) {
              for (int y = 0; y < choices.length(); y++) {
                JSONObject choice = choices.optJSONObject(y);
                if (choice != null) {
                  String text = choice.getString("text");

                  /*
                   * set the choice text as the step extra
                   * e.g.
                   * Part 2: Sunlight
                   */
                  stepExtra = partLabel + ": " + text;

                  columnCounter = setGetLatestStepWorkHeaderCells(columnCounter,
                      stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow,
                      stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
                      nodeTitle, nodeType, nodePrompt, nodeId, stepExtra);
                }
              }
            }
          } else {
            String partPrompt = assessmentPart.getString("prompt");
            stepExtra = partLabel + ": " + partPrompt;
            columnCounter = setGetLatestStepWorkHeaderCells(columnCounter,
                stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow,
                stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
                nodeTitle, nodeType, nodePrompt, nodeId, stepExtra);
          }
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
      partCounter++;
    }

    if (nodeContent != null && nodeContent.has("isLockAfterSubmit")) {
      try {
        boolean isLockAfterSubmit = nodeContent.getBoolean("isLockAfterSubmit");

        if (isLockAfterSubmit) {
          /*
           * this step locks after submit so we will create a header column
           * for whether the student work "Is Submit"
           */
          stepExtra = "Is Submit";

          columnCounter = setGetLatestStepWorkHeaderCells(columnCounter,
              stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow,
              stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
              nodeTitle, nodeType, nodePrompt, nodeId, stepExtra);
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return columnCounter;
  }

  /**
   * Set the header cells for a regular node that only requires one column
   *
   * @param stepTitleRow the step title excel row
   * @param stepTypeRow the step type excel row
   * @param stepPromptRow the step prompt excel row
   * @param nodeIdRow the node id excel row
   * @param stepExtraRow the step extra excel row
   * @param stepTitleRowVector the step title csv row
   * @param stepTypeRowVector the step type csv row
   * @param stepPromptRowVector the step prompt csv row
   * @param nodeIdRowVector the node id csv row
   * @param stepExtraRowVector the step extra csv row
   * @param columnCounter the column counter
   * @param nodeId the node id
   * @param nodeTitle the node title
   * @param nodeContent the node content
   *
   * @return the updated column position
   */
  private int setGetLatestStudentWorkCRaterHeaderCells(
      Row stepTitleRow,
      Row stepTypeRow,
      Row stepPromptRow,
      Row nodeIdRow,
      Row stepExtraRow,
      Vector<String> stepTitleRowVector,
      Vector<String> stepTypeRowVector,
      Vector<String> stepPromptRowVector,
      Vector<String> nodeIdRowVector,
      Vector<String> stepExtraRowVector,
      int columnCounter,
      String nodeId,
      String nodeTitle,
      JSONObject nodeContent) {
    String nodeType = "";
    try {
      if (nodeContent != null) {
        nodeType = nodeContent.getString("type");
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }

    String nodePrompt = getPromptFromNodeContent(nodeContent);
    String stepExtra = "";

    columnCounter = setGetLatestStepWorkHeaderCells(columnCounter,
        stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow,
        stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
        nodeTitle, nodeType, nodePrompt, nodeId, stepExtra);

    stepExtra = "CRater score timestamp";

    columnCounter = setGetLatestStepWorkHeaderCells(columnCounter,
        stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow,
        stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
        nodeTitle, nodeType, nodePrompt, nodeId, stepExtra);

    stepExtra = "CRater score";

    columnCounter = setGetLatestStepWorkHeaderCells(columnCounter,
        stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow,
        stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
        nodeTitle, nodeType, nodePrompt, nodeId, stepExtra);
    return columnCounter;
  }

  /**
   * Set the auto graded header cells
   *
   * @param stepTitleRow the step title excel row
   * @param stepTypeRow the step type excel row
   * @param stepPromptRow the step prompt excel row
   * @param nodeIdRow the node id excel row
   * @param stepExtraRow the step extra excel row
   * @param stepTitleRowVector the step title csv row
   * @param stepTypeRowVector the step type csv row
   * @param stepPromptRowVector the step prompt csv row
   * @param nodeIdRowVector the node id csv row
   * @param stepExtraRowVector the step extra csv row
   * @param columnCounter the column counter
   * @param nodeId the node id
   * @param nodeTitle the node title
   * @param nodeContent the node content
   *
   * @return the updated column position
   */
  private int setGetLatestStudentWorkAutoGradedHeaderCells(
      Row stepTitleRow,
      Row stepTypeRow,
      Row stepPromptRow,
      Row nodeIdRow,
      Row stepExtraRow,
      Vector<String> stepTitleRowVector,
      Vector<String> stepTypeRowVector,
      Vector<String> stepPromptRowVector,
      Vector<String> nodeIdRowVector,
      Vector<String> stepExtraRowVector,
      int columnCounter,
      String nodeId,
      String nodeTitle,
      JSONObject nodeContent) {
    String nodeType = "";
    try {
      if (nodeContent != null) {
        nodeType = nodeContent.getString("type");
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }

    String nodePrompt = getPromptFromNodeContent(nodeContent);
    String stepExtra = "";

    columnCounter = setGetLatestStepWorkHeaderCells(columnCounter,
        stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow,
        stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
        nodeTitle, nodeType, nodePrompt, nodeId, stepExtra);
    stepExtra = "Auto Score";

    columnCounter = setGetLatestStepWorkHeaderCells(columnCounter,
        stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow,
        stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
        nodeTitle, nodeType, nodePrompt, nodeId, stepExtra);
    stepExtra = "Max Auto Score";
    columnCounter = setGetLatestStepWorkHeaderCells(columnCounter,
        stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow,
        stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
        nodeTitle, nodeType, nodePrompt, nodeId, stepExtra);

    stepExtra = "Auto Feedback";
    columnCounter = setGetLatestStepWorkHeaderCells(columnCounter,
        stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow,
        stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
        nodeTitle, nodeType, nodePrompt, nodeId, stepExtra);
    return columnCounter;
  }

  /**
   * Set the header cells for a regular node that only requires one column
   *
   * @param stepTitleRow the step title excel row
   * @param stepTypeRow the step type excel row
   * @param stepPromptRow the step prompt excel row
   * @param nodeIdRow the node id excel row
   * @param stepExtraRow the step extra excel row
   * @param stepTitleRowVector the step title csv row
   * @param stepTypeRowVector the step type csv row
   * @param stepPromptRowVector the step prompt csv row
   * @param nodeIdRowVector the node id csv row
   * @param stepExtraRowVector the step extra csv row
   * @param columnCounter the column counter
   * @param nodeId the node id
   * @param nodeTitle the node title
   * @param nodeContent the node content
   *
   * @return the updated column position
   */
  private int setGetLatestStudentWorkRegularHeaderCells(
      Row stepTitleRow,
      Row stepTypeRow,
      Row stepPromptRow,
      Row nodeIdRow,
      Row stepExtraRow,
      Vector<String> stepTitleRowVector,
      Vector<String> stepTypeRowVector,
      Vector<String> stepPromptRowVector,
      Vector<String> nodeIdRowVector,
      Vector<String> stepExtraRowVector,
      int columnCounter,
      String nodeId,
      String nodeTitle,
      JSONObject nodeContent) {
    String nodeType = "";
    try {
      if (nodeContent != null) {
        nodeType = nodeContent.getString("type");
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }

    String nodePrompt = getPromptFromNodeContent(nodeContent);
    String stepExtra = "";
    columnCounter = setGetLatestStepWorkHeaderCells(columnCounter,
        stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow,
        stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
        nodeTitle, nodeType, nodePrompt, nodeId, stepExtra);
    return columnCounter;
  }

  /**
   * Set the header values for a single header column
   *
   * @param columnCounter the column counter
   * @param stepTitleRow the step title excel row
   * @param stepTypeRow the step type excel row
   * @param stepPromptRow the step prompt excel row
   * @param nodeIdRow the node id excel row
   * @param stepExtraRow the step extra excel row
   * @param stepTitleRowVector the step title csv row
   * @param stepTypeRowVector the step type csv row
   * @param stepPromptRowVector the step prompt csv row
   * @param nodeIdRowVector the node id csv row
   * @param stepExtraRowVector the step extra csv row
   * @param stepTitle the step title
   * @param stepType the step type
   * @param stepPrompt the step prompt
   * @param nodeId the node id
   * @param stepExtra the step extra
   *
   * @return the updated column position
   */
  private int setGetLatestStepWorkHeaderCells(
      int columnCounter,
      Row stepTitleRow,
      Row stepTypeRow,
      Row stepPromptRow,
      Row nodeIdRow,
      Row stepExtraRow,
      Vector<String> stepTitleRowVector,
      Vector<String> stepTypeRowVector,
      Vector<String> stepPromptRowVector,
      Vector<String> nodeIdRowVector,
      Vector<String> stepExtraRowVector,
      String stepTitle,
      String stepType,
      String stepPrompt,
      String nodeId,
      String stepExtra) {
    setCellValue(stepTitleRow, stepTitleRowVector, columnCounter, stepTitle);
    setCellValue(stepTypeRow, stepTypeRowVector, columnCounter, stepType);
    setCellValue(stepPromptRow, stepPromptRowVector, columnCounter, stepPrompt);
    setCellValue(nodeIdRow, nodeIdRowVector, columnCounter, nodeId);
    setCellValue(stepExtraRow, stepExtraRowVector, columnCounter, stepExtra);
    return columnCounter + 1;
  }

  /**
   * Get the latest StepWork that has a non-empty response
   *
   * @param stepWorks a list of StepWork objects
   *
   * @return a String containing the latest response
   */
  private StepWork getLatestStepWorkWithResponse(List<StepWork> stepWorks) {
    String stepWorkResponse = "";
    StepWork stepWork = null;

    for (int z = stepWorks.size() - 1; z >= 0; z--) {
      StepWork tempStepWork = stepWorks.get(z);
      stepWorkResponse = getStepWorkResponse(tempStepWork);

      if (!stepWorkResponse.equals("")) {
        stepWork = tempStepWork;
        break;
      }
    }
    return stepWork;
  }

  /**
   * Get the latest step work that has a non-empty response and return that response
   * @param stepWorks a list of StepWork objects
   * @return a String containing the latest response
   */
  @SuppressWarnings("unused")
  private String getLatestStepWorkResponseWithResponse(List<StepWork> stepWorks) {
    StepWork latestStepWorkWithResponse = getLatestStepWorkWithResponse(stepWorks);

    if (latestStepWorkWithResponse != null) {
      return getStepWorkResponse(latestStepWorkWithResponse);
    } else {
      return "";
    }
  }

  /**
   * Get the prompt from the node content
   * @param nodeContent the node content JSON
   * @return a string containing the prompt for the node, if nodeContent
   * is null, we will just return ""
   */
  private String getPromptFromNodeContent(JSONObject nodeContent) {
    String prompt = "";
    try {
      if (nodeContent != null) {
        String nodeType = nodeContent.getString("type");

        if (nodeType == null) {

        } else if (nodeType.equals("AssessmentList")) {
          prompt = nodeContent.getString("prompt");
        } else if (nodeType.equals("DataGraph")) {

        } else if (nodeType.equals("Draw")) {

        } else if (nodeType.equals("Fillin")) {

        } else if (nodeType.equals("Flash")) {

        } else if (nodeType.equals("Html")) {
          prompt = "N/A";
        } else if (nodeType.equals("MySystem")) {

        } else if (nodeType.equals("Brainstorm") ||
          nodeType.equals("MatchSequence") ||
          nodeType.equals("MultipleChoice") ||
          nodeType.equals("Note") ||
          nodeType.equals("OpenResponse")) {
          JSONObject assessmentItem = (JSONObject) nodeContent.get("assessmentItem");
          JSONObject interaction = (JSONObject) assessmentItem.get("interaction");
          prompt = interaction.getString("prompt");
        } else if (nodeType.equals("OutsideUrl")) {
          prompt = "N/A";
        } else if (nodeType.equals("SVGDraw")) {

        } else {

        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return prompt;
  }

  /**
   * Set the step work responses into the row. Depending on the step, this may
   * require setting multiple cells such as review type steps or assessment list
   * type steps which require multiple cells for a single step.
   *
   * @param rowForWorkgroupId
   * @param columnCounter
   * @param nodeId the id of the node
   *
   * @return the updated column position
   */
  private int setStepWorkResponse(Row rowForWorkgroupId, Vector<String> rowForWorkgroupIdVector, int columnCounter, StepWork stepWork, String nodeId) {
    int numberOfAnswerFields = getNumberOfAnswerFields(nodeId);
    if (stepWork == null) {
      /*
       * the student did not provide any answers but we still need to shift
       * the column counter the appropriate number of cells
       */

      columnCounter += numberOfAnswerFields;
      addEmptyElementsToVector(rowForWorkgroupIdVector, numberOfAnswerFields);
    } else if (stepTypeContainsMultipleAnswerFields(stepWork)) {
      //the step type contains multiple answer fields

      String stepWorkData = stepWork.getData();
      try {
        JSONObject stepWorkDataJSON = new JSONObject(stepWorkData);
        JSONArray nodeStatesJSON = stepWorkDataJSON.getJSONArray("nodeStates");
        JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
        boolean isLockAfterSubmit = false;

        if (nodeContent != null && nodeContent.has("isLockAfterSubmit")) {
          isLockAfterSubmit = nodeContent.getBoolean("isLockAfterSubmit");
        }

        if (nodeStatesJSON.length() != 0) {
          JSONObject lastState = nodeStatesJSON.getJSONObject(nodeStatesJSON.length() - 1);
          if (lastState != null) {
            String nodeType = stepWorkDataJSON.getString("nodeType");
            if (nodeType == null) {
              //error, this should never happen
            } else if (nodeType.equals("AssessmentListNode")) {
              if (nodeContent != null) {
                JSONArray assessments = nodeContent.optJSONArray("assessments");
                if (assessments != null) {
                  for (int x = 0; x < assessments.length(); x++) {
                    JSONObject assessmentPart = assessments.optJSONObject(x);
                    if (assessmentPart != null) {
                      columnCounter = insertWorkForAssessmentPart(rowForWorkgroupId, rowForWorkgroupIdVector, assessmentPart, lastState, columnCounter);
                    }
                  }
                }
              }

              if (isLockAfterSubmit) {
                if (lastState.has("isSubmit")) {
                  boolean isSubmit = lastState.getBoolean("isSubmit");
                  columnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, columnCounter, Boolean.toString(isSubmit));
                } else {
                  columnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, columnCounter, "false");
                }
              }
            }
          }
        } else {
          /*
           * the student did not provide any answers but we still need to shift
           * the column counter the appropriate number of cells
           */

          columnCounter += numberOfAnswerFields;
          addEmptyElementsToVector(rowForWorkgroupIdVector, numberOfAnswerFields);

          if (isLockAfterSubmit) {
            columnCounter++;
            addEmptyElementsToVector(rowForWorkgroupIdVector, 1);
          }
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    } else {
      String stepWorkResponse = getStepWorkResponse(stepWork);
      if (stepWorkResponse != null) {
        columnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, columnCounter, stepWorkResponse);
      } else {
        columnCounter++;
        addEmptyElementsToVector(rowForWorkgroupIdVector, 1);
      }
    }
    return columnCounter;
  }

  /**
   * Insert the work for an assessmentlist part
   * @param rowForWorkgroupId the row for the workgroup id
   * @param rowForWorkgroupIdVector the csv row for the workgroup id
   * @param stepContentAssessmentPart the step content assessment part
   * @param nodeState the student work node state
   * @param columnCounter the updated column counter value
   */
  private int insertWorkForAssessmentPart(Row rowForWorkgroupId, Vector<String> rowForWorkgroupIdVector, JSONObject stepContentAssessmentPart, JSONObject nodeState, int columnCounter) {
    String partId = "";
    int numberOfColumnsInPart = 0;
    int initialColumnCounter = columnCounter;

    if (stepContentAssessmentPart != null) {
      partId = stepContentAssessmentPart.optString("id");
      String type = stepContentAssessmentPart.optString("type");
      if (type != null && type.equals("checkbox")) {
        JSONArray choices = stepContentAssessmentPart.optJSONArray("choices");
        if (choices != null) {
          numberOfColumnsInPart = choices.length();
        }
      } else {
        numberOfColumnsInPart = 1;
      }
    }

    if (nodeState != null) {
      try {
        JSONArray studentAssessments = nodeState.getJSONArray("assessments");
        for (int x = 0; x < studentAssessments.length(); x++) {
          JSONObject studentAssessment = studentAssessments.optJSONObject(x);
          if (studentAssessment != null) {
            String studentPartId = studentAssessment.optString("id");
            String studentPartType = studentAssessment.optString("type");
            if (studentPartId != null && studentPartId.equals(partId)) {
              if (studentPartType != null && studentPartType.equals("checkbox")) {
                JSONArray choices = stepContentAssessmentPart.optJSONArray("choices");
                JSONArray responseJSONArray = studentAssessment.optJSONArray("response");
                for (int y = 0; y < choices.length(); y++) {
                  JSONObject choice = choices.optJSONObject(y);
                  String choiceText = "";
                  if (isChoiceInResponse(choice, responseJSONArray)) {
                    choiceText = choice.optString("text");
                  } else {
                    choiceText = "";
                  }
                  columnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, columnCounter, choiceText);
                }
              } else {
                JSONObject response = studentAssessment.optJSONObject("response");
                String responseText = "";
                if (response != null) {
                  responseText = response.optString("text");
                }
                columnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, columnCounter, responseText);
              }
            }
          }
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return initialColumnCounter + numberOfColumnsInPart;
  }

  /**
   * Determines whether the step type contains multiple answer fields
   * e.g.
   * AssessmentListNode
   *
   * @param stepWork the step work to check
   *
   * @return whether the step type contains multiple answer fields
   */
  private boolean stepTypeContainsMultipleAnswerFields(StepWork stepWork) {
    String stepWorkData = stepWork.getData();
    if (stepWorkData == null) {
      return false;
    } else {
      try {
        JSONObject stepWorkDataJSON = new JSONObject(stepWorkData);
        String nodeType = stepWorkDataJSON.getString("nodeType");
        String nodeId = stepWorkDataJSON.getString("nodeId");
        JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
        if (nodeContent == null) {
          /*
           * the node content is null so even if the step work data
           * contains multiple parts, we can't allow the step
           * to use up multiple cells because the header cells
           * will not match up since there was no node content
           * to figure out the appropriate number of cells for
           * the header to use up when we were setting the
           * header cells.
           */
          return false;
        } else if (nodeType == null) {
          return false;
        } else if (nodeType.equals("AssessmentListNode")) {
          return true;
        } else {
          return false;
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return false;
  }

  /**
   * Get the number of answer fields for the given step/node
   * @param nodeId the id of the node
   * @return the number of answer fields for the given step/node
   */
  private int getNumberOfAnswerFields(String nodeId) {
    int numAnswerFields = 1;
    JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
    String nodeType = null;
    try {
      if (nodeContent != null) {
        nodeType = nodeContent.getString("type");

        if (nodeType == null) {

        } else if (nodeType.equals("AssessmentList")) {
          JSONArray assessmentParts = nodeContent.optJSONArray("assessments");
          int partCounter = 0;
          if (assessmentParts != null) {
            for (int x = 0; x < assessmentParts.length(); x++) {
              JSONObject assessmentPart = assessmentParts.optJSONObject(x);
              if (assessmentPart != null) {
                String type = assessmentPart.optString("type");
                if (type != null && type.equals("checkbox")) {
                  JSONArray choices = assessmentPart.optJSONArray("choices");
                  if (choices != null) {
                    partCounter += choices.length();
                  }
                } else {
                  partCounter++;
                }
              }
            }
          }

          if (partCounter > 0) {
            numAnswerFields = partCounter;
          }

          boolean isLockAfterSubmit = false;

          if (nodeContent.has("isLockAfterSubmit")) {
            isLockAfterSubmit = nodeContent.getBoolean("isLockAfterSubmit");
          }

          if (isLockAfterSubmit) {
            /*
             * this step locks after submit so there will be a column
             * for "Is Submit" so we will need to increment the numAnswerFields
             * by 1.
             */
            numAnswerFields++;
          }
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return numAnswerFields;
  }

  /**
   * Obtains the student work/response for the StepWork
   * @param stepWork a StepWork object
   * @return a String containing the student work/response
   * note: HtmlNodes will return "N/A"
   */
  private String getStepWorkResponse(StepWork stepWork) {
    String stepWorkResponse = "";
    String nodeType = "";
    Node node = null;
    Long stepWorkId = null;

    if (stepWork != null) {
      node = stepWork.getNode();
      stepWorkId = stepWork.getId();

      if (node != null && node.getNodeType() != null) {
        nodeType = node.getNodeType();

        /*
         * remove the "Node" portion of the node type
         * e.g. NoteNode just becomes Note
         */
        nodeType = nodeType.replace("Node", "");
      } else {
        /*
         * if the step work does not have a Node set into the object
         * we will retrieve the node type from the step work data.
         * the nodeType will not contain the word "Node"
         * e.g. if the type is "OpenResponseNode" we will receive
         * "OpenResponse"
         */
        nodeType = getNodeTypeFromStepWork(stepWork);
      }
    }

    String excelExportStringTemplate = null;

    if (node != null) {
      String nodeId = node.getNodeId();
      if (nodeId != null) {
        JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
        if (nodeContent != null) {
          if (nodeContent.has("excelExportStringTemplate") && !nodeContent.isNull("excelExportStringTemplate")) {
            try {
              excelExportStringTemplate = nodeContent.getString("excelExportStringTemplate");
            } catch(JSONException e) {
              e.printStackTrace();
            }
          }
        }
      }
    }

    if (excelExportStringTemplate != null) {
      /*
       * this case will handle all the other step types. the data that will
       * be displayed in the cell will be determined by excelExportString field
       * in the step content. The excelExportString is a template
       * for how the text should be displayed. For example if we wanted to
       * display the top score the excelExportString would look something
       * like this
       * "Top Score: {response.topScore}"
       * the value of {response.topScore} will be replaced with that value
       * from the node state so it would end up looking something like
       * this in the excel cell
       * "Top Score: 10"
       */
      try {
        if (stepWork != null) {
          String data = stepWork.getData();
          if (data != null) {
            JSONObject jsonData = new JSONObject(data);
            if (jsonData.has("nodeStates")) {
              JSONArray jsonNodeStatesArray = jsonData.getJSONArray("nodeStates");
              if (jsonNodeStatesArray != null && jsonNodeStatesArray.length() > 0) {
                if ("latestStudentWork".equals(exportType) || "customLatestStudentWork".equals(exportType)) {
                  if (!jsonNodeStatesArray.isNull(jsonNodeStatesArray.length() - 1)) {
                    Object nodeStateObject = jsonNodeStatesArray.get(jsonNodeStatesArray.length() - 1);
                    if (nodeStateObject instanceof JSONObject) {
                      JSONObject lastState = (JSONObject) nodeStateObject;
                      if (excelExportStringTemplate != null) {
                        stepWorkResponse = generateExcelExportString(excelExportStringTemplate, lastState, stepWorkId);
                      }
                    }
                  }
                } else if ("allStudentWork".equals(exportType) || "customAllStudentWork".equals(exportType)) {
                  //show data from all the states in the node state array
                  StringBuffer stepWorkResponseStrBuf = new StringBuffer();
                  for (int x = 0; x < jsonNodeStatesArray.length(); x++) {
                    if (!jsonNodeStatesArray.isNull(x)) {
                      Object nodeStateObject = jsonNodeStatesArray.get(x);
                      if (nodeStateObject instanceof JSONObject) {
                        JSONObject lastState = (JSONObject) nodeStateObject;
                        if (excelExportStringTemplate != null) {
                          String nodeStateResponse = generateExcelExportString(excelExportStringTemplate, lastState, stepWorkId);
                          if (stepWorkResponseStrBuf.length() != 0) {
                            stepWorkResponseStrBuf.append("\n");
                          }
                          stepWorkResponseStrBuf.append("Response #" + (x + 1) + ": ");
                          stepWorkResponseStrBuf.append(nodeStateResponse);
                        }
                      }
                    }
                  }
                  stepWorkResponse = stepWorkResponseStrBuf.toString();
                }
              }
            }
          }
        }
      } catch(JSONException e) {
        e.printStackTrace();
      }
    } else if (nodeType.equals("OpenResponse") || nodeType.equals("Note") ||
      nodeType.equals("Brainstorm") || nodeType.equals("Fillin") ||
      nodeType.equals("MultipleChoice") || nodeType.equals("MatchSequence") ||
      nodeType.equals("AssessmentList") || nodeType.equals("Sensor") ||
      nodeType.equals("ExplanationBuilder") || nodeType.equals("SVGDraw")  ||
      nodeType.equals("Netlogo")) {
      try {
        String data = stepWork.getData();
        JSONObject jsonData = new JSONObject(data);
        JSONArray jsonNodeStatesArray = jsonData.getJSONArray("nodeStates");
        if (nodeType.equals("MultipleChoice") || nodeType.equals("Fillin") ||
            nodeType.equals("MatchSequence") || nodeType.equals("AssessmentList")) {
          /*
           * if the stepwork is for multiple choice or fillin, we will display
           * all node states so that researchers can see how many times
           * the student submitted an answer within this step work visit
           */

          StringBuffer responses = new StringBuffer();
          for (int z = 0; z < jsonNodeStatesArray.length(); z++) {
            Object nodeStateObject = jsonNodeStatesArray.get(z);
            if (nodeStateObject == null || nodeStateObject.toString().equals("null")) {
            } else {
              JSONObject nodeState = (JSONObject) nodeStateObject;
              if (nodeType.equals("MultipleChoice") || nodeType.equals("Fillin")) {
                if (nodeState.has("response")) {
                  Object jsonResponse = nodeState.get("response");
                  StringBuffer currentResponse = new StringBuffer();
                  if (jsonResponse instanceof JSONArray) {
                    JSONArray lastResponseArray = (JSONArray) jsonResponse;
                    for (int x = 0; x < lastResponseArray.length(); x++) {
                      if (currentResponse.length() != 0) {
                        currentResponse.append(", ");
                      }
                      currentResponse.append((String) lastResponseArray.get(x));
                    }
                  } else if (jsonResponse instanceof String) {
                    currentResponse.append((String) jsonResponse);
                  }
                  if (responses.length() != 0) {
                    responses.append(", ");
                  }

                  if (nodeType.equals("Fillin")) {
                    //for fillin we will obtain the text entry index
                    Object blankNumber = nodeState.get("textEntryInteractionIndex");

                    if (blankNumber instanceof Integer) {
                      //display the response as Blank{blank number} [submit attempt]: {student response}
                      responses.append("{Blank" + (((Integer) blankNumber) + 1) + "[" + (z+1) + "]: " + currentResponse + "}");
                    }
                  } else if (nodeType.equals("MultipleChoice")) {
                    //display the response as Answer[{attempt number}]: {student response}
                    responses.append("{Answer[" + (z+1) + "]: " + currentResponse + "}");
                  }
                }
              } else if (nodeType.equals("MatchSequence")) {
                JSONArray buckets = (JSONArray) nodeState.get("buckets");

                //each state will be wrapped in {}
                responses.append("{");

                for (int bucketCounter = 0; bucketCounter < buckets.length(); bucketCounter++) {
                  JSONObject bucket = (JSONObject) buckets.get(bucketCounter);
                  String bucketText = bucket.getString("text");
                  responses.append("(");
                  responses.append("[" + bucketText + "]: ");
                  JSONArray choices = (JSONArray) bucket.get("choices");
                  StringBuffer choiceResponses = new StringBuffer();
                  for (int choiceCounter = 0; choiceCounter < choices.length(); choiceCounter++) {
                    JSONObject choice = (JSONObject) choices.get(choiceCounter);
                    String choiceText = choice.getString("text");

                    /*
                     * if this is not the first choice we will need to separate
                     * the choice with a comma ,
                     */
                    if (choiceResponses.length() != 0) {
                      choiceResponses.append(", ");
                    }

                    choiceResponses.append(choiceText);
                  }
                  responses.append(choiceResponses);
                  responses.append(")");
                }

                /*
                 * close the state and add some new lines in case researcher
                 * wants to view the response in their browser
                 */
                responses.append("}<br><br>");
              } else if (nodeType.equals("AssessmentList")) {
                //wrap each node state with braces {}
                responses.append("{");

                if (nodeState.has("assessments")) {
                  JSONArray assessments = nodeState.getJSONArray("assessments");
                  StringBuffer tempResponses = new StringBuffer();
                  for (int assessmentCounter = 0; assessmentCounter < assessments.length(); assessmentCounter++) {
                    JSONObject assessment = assessments.getJSONObject(assessmentCounter);
                    if (!assessment.isNull("response")) {
                      JSONObject assessmentResponseJSONObject = assessment.optJSONObject("response");
                      JSONArray assessmentResponseJSONArray = assessment.optJSONArray("response");
                      String responseText = "";
                      if (assessmentResponseJSONObject != null) {
                        responseText = assessmentResponseJSONObject.getString("text");
                      } else if (assessmentResponseJSONArray != null) {
                        for (int assessmentResponsesCounter = 0; assessmentResponsesCounter < assessmentResponseJSONArray.length(); assessmentResponsesCounter++) {
                          JSONObject tempAssessmentResponseJSONObject = assessmentResponseJSONArray.optJSONObject(assessmentResponsesCounter);
                          if (tempAssessmentResponseJSONObject != null) {
                            String tempResponseText = tempAssessmentResponseJSONObject.optString("text");
                            if (tempResponseText != null) {
                              if (responseText.length() != 0) {
                                responseText += ", ";
                              }
                              responseText += tempResponseText;
                            }
                          }
                        }
                      }

                      if (tempResponses.length() != 0) {
                        tempResponses.append(", ");
                      }
                      tempResponses.append(responseText);
                    }
                  }
                  responses.append(tempResponses);
                }
                responses.append("}");
              }
            }
          }
          stepWorkResponse = responses.toString();
        } else {
          if (jsonNodeStatesArray != null && jsonNodeStatesArray.length() > 0) {
            Object nodeStateObject = jsonNodeStatesArray.get(jsonNodeStatesArray.length() - 1);
            if (nodeStateObject == null || nodeStateObject.toString().equals("null")) {
            } else {
              JSONObject lastState = (JSONObject) nodeStateObject;
              if (nodeType.equals("ExplanationBuilder")) {
                if (lastState != null) {
                  if (lastState.has("answer")) {
                    stepWorkResponse = lastState.getString("answer");
                  } else {
                    stepWorkResponse = lastState.toString();
                  }
                }
              } else if (nodeType.equals("SVGDrawNode")) {
                if (lastState != null) {
                  stepWorkResponse = (String) lastState.get("data");
                }
              } else if (nodeType.equals("AnnotatorNode")) {
                if (lastState != null) {
                  stepWorkResponse = (String) lastState.get("data");
                }
              } else if (nodeType.equals("Netlogo")) {
                if (lastState != null) {
                  if (lastState.has("data")) {
                    try {
                      JSONObject netLogoData = (JSONObject) lastState.getJSONObject("data");
                      if (netLogoData != null) {
                        stepWorkResponse = netLogoData.toString();
                      }
                    } catch (JSONException e) {
                    }
                  }
                }
              } else if (lastState.has("response")) {
                Object object = lastState.get("response");
                String lastResponse = "";
                if (object instanceof JSONArray) {
                  JSONArray lastResponseArray = (JSONArray) lastState.get("response");
                  lastResponse = (String) lastResponseArray.get(0);
                } else if (object instanceof String) {
                  lastResponse = (String) lastState.get("response");
                }
                stepWorkResponse = lastResponse.toString();
              }
            }
          }
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    } else if (nodeType.equals("Html")) {
      stepWorkResponse = "N/A";
    } else {
      //do nothing
    }
    return stepWorkResponse;
  }

  /**
   * Get the node state response
   * @param nodeState the node state
   * @return the response
   */
  private String getNodeStateResponse(JSONObject nodeState, String nodeId) {
    String response = null;
    if (nodeState != null) {
      if (nodeState.has("response")) {
        try {
          boolean displayResponse = true;
          if (nodeId != null) {
            JSONObject node = nodeIdToNode.get(nodeId);
            if (node != null) {
              String nodeType = node.optString("type");
              /*
               * check if the node type is Mysystem2Node or Box2dModelNode because
               * we do not want to display the response for those step types
               */
              if (nodeType != null && (nodeType.equals("Mysystem2Node") || nodeType.equals("Box2dModelNode"))) {
                displayResponse = false;
              }
            }
          }

          if (displayResponse) {
            response = nodeState.getString("response");
          }
        } catch (JSONException e) {
          e.printStackTrace();
        }
      }
    }
    return response;
  }

  /**
   * Get the export columns from the step content
   * @param nodeId the node id
   * @return a JSONArray of export column objects that specify what
   * columns to display in the export
   */
  private JSONArray getExportColumns(String nodeId) {
    JSONArray exportColumns = null;
    if (nodeId != null) {
      JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
      if (nodeContent != null) {
        if (nodeContent.has("exportColumns") && !nodeContent.isNull("exportColumns")) {
          try {
            exportColumns = nodeContent.getJSONArray("exportColumns");
          } catch(JSONException e) {
            e.printStackTrace();
          }
        }
      }
    }
    return exportColumns;
  }

  /**
   * Get the column values for a field in the student data
   * @param fieldObject the object that specifies what field to get
   * @param stepWorkId the step work id
   * @param studentWork the student data
   * @return an array of objects that are found in the specified field
   * in the student data. if the field only contains one value, there
   * will only be one element in the array.
   */
  private ArrayList<Object> getColumnValuesForField(JSONObject fieldObject, Long stepWorkId, JSONObject studentWork, String nodeId) {
    ArrayList<Object> values = new ArrayList<Object>();
    if (studentWork != null) {
      try {
        if (fieldObject != null) {
          String field = null;
          JSONObject childFieldObject = null;
          if (fieldObject.has("field")) {
            field = fieldObject.getString("field");
          }
          if (fieldObject.has("childField")) {
            childFieldObject = fieldObject.getJSONObject("childField");
          }

          if (field != null) {
            Object value = null;

            if (studentWork.has(field)) {
              value = studentWork.opt(field);
            } else {
              value = getValueFromAnnotation(fieldObject, stepWorkId, studentWork);
            }

            if (value != null) {
              if (value instanceof JSONObject) {
                JSONObject jsonObjectValue = (JSONObject) value;
                if (childFieldObject != null) {
                  values.addAll(getColumnValuesForField(childFieldObject, stepWorkId, jsonObjectValue, nodeId));
                } else {
                  values.add(jsonObjectValue.toString());
                }
              } else if (value instanceof JSONArray) {
                JSONArray jsonArrayValue = (JSONArray) value;

                if (childFieldObject != null) {
                  values.addAll(getValueForField(childFieldObject, stepWorkId, jsonArrayValue, nodeId));
                } else {
                  /*
                   * there is no childField so we have traversed as far as we need to and will get this value.
                   * since this value is an array we will need to get all the values in the array.
                   */
                  values.add(getArrayValues(jsonArrayValue));
                }
              } else if (value instanceof String) {
                values.add(value);
              } else if (value instanceof Boolean) {
                values.add(value);
              } else if (value instanceof Long) {
                values.add(value);
              } else if (value instanceof Integer) {
                values.add(value);
              } else if (value instanceof Double) {
                values.add(value);
              } else if (value instanceof Float) {
                values.add(value);
              }
            } else {
              /*
               * student work does not have the field so we will try to get the
               * field from the step content. currently we only do this for
               * max score fields.
               */
              boolean valueAdded = false;

              /*
              if (nodeId != null) {
                //get the step content
                JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);

                if (nodeContent != null) {
                  //get the step type
                  String type = nodeContent.optString("type");

                  if (type != null) {
                    /*
                     * we will look for the max score in the content if
                     * the step type is OpenResponse and the field is cRaterMaxScore
                     * or
                     * the step type is Challenge and the field is maxScore
                     * or
                     * the step type is SVGDraw and the field is maxAutoScore
                     *
                    if ((type.equals("OpenResponse") && field.equals("cRaterMaxScore")) ||
                        (type.equals("Challenge") && field.equals("maxScore")) ||
                        (type.equals("SVGDraw") && field.equals("maxAutoScore"))) {
                      //try to get the max score from the content
                      Long maxScoreFromContent = getMaxScoreFromContent(nodeId);

                      if (maxScoreFromContent != null) {
                        //we obtained a max score from the content so we will add it to the values
                        values.add(maxScoreFromContent);
                        valueAdded = true;
                      }
                    }
                  }
                }
              }
              */

              if (!valueAdded) {
                values.add("");
              }
            }
          } else {
            /*
             * this is the special case when the field value has a hardcoded value
             *
             * e.g.
             * {
             *    "columnName":"Max Score",
             *    "value":10
             * }
             *
             * usage of the "value" allows the author to specify a value for the column
             * that will be the same for every row for this specific step.
             */
            if (fieldObject.has("value")) {
              Object value = fieldObject.get("value");

              if (value != null) {
                if (value instanceof String) {
                  values.add(value);
                } else if (value instanceof Boolean) {
                  values.add(value);
                } else if (value instanceof Long) {
                  values.add(value);
                } else if (value instanceof Integer) {
                  values.add(value);
                } else if (value instanceof Double) {
                  values.add(value);
                } else if (value instanceof Float) {
                  values.add(value);
                }
              } else {
                values.add("");
              }
            }
          }
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return values;
  }

  /**
   * Get the value from a specific field in the annotation
   * @param fieldObject the field object that specifies what to look for in
   * the annotation
   * @param stepWorkId the step work id
   * @param studentWork the student work
   * @return the value from the field in the annotation or null if the field
   * is not found
   */
  private Object getValueFromAnnotation(JSONObject fieldObject, Long stepWorkId, JSONObject studentWork) {
    Object result = null;
    Long timestamp = studentWork.optLong("timestamp");
    if (fieldObject != null && timestamp != null) {
      String field = fieldObject.optString("field");
      String annotationType = fieldObject.optString("annotationType");
      boolean isTimestamp = fieldObject.optBoolean("isTimestamp");
      StepWork stepWork = vleService.getStepWorkById(stepWorkId);
      if (stepWork != null) {
        if (annotationType == null || annotationType.equals("")) {
          List<Annotation> annotations = vleService.getAnnotationByStepWork(stepWork, Annotation.class);
          /*
           * loop through all the annotations and get the first
           * result that we find
           */
          for (int a = 0; a < annotations.size(); a++) {
            Annotation annotation = annotations.get(a);
            result = getValueFromAnnotationHelper(annotation, timestamp, field);
            if (result != null) {
              break;
            }
          }
        } else {
          Annotation annotation = vleService.getAnnotationByStepWorkAndAnnotationType(stepWork, annotationType);
          result = getValueFromAnnotationHelper(annotation, timestamp, field);
        }
      }

      if (result != null && result instanceof Long && isTimestamp) {
        /*
         * we want the result as a timestamp so we will convert the
         * result to a human readable timestamp
         */
        Long longResult = (Long) result;
        Timestamp fieldTimestamp = new Timestamp(longResult);
        result = timestampToFormattedString(fieldTimestamp);
      }
    }
    return result;
  }

  /**
   * Get the value from the field in the annotation
   * @param annotation the annotation
   * @param timestamp the timestamp
   * @param field the field name
   * @return the value from the field in the annotation
   */
  private Object getValueFromAnnotationHelper(Annotation annotation, Long timestamp, String field) {
    Object result = null;
    if (annotation != null && timestamp != null && field != null) {
      String data = annotation.getData();
      if (data != null) {
        try {
          JSONObject annotationData = new JSONObject(data);
          if (annotationData != null) {
            JSONArray value = annotationData.optJSONArray("value");
            if (value != null) {
              for (int v = 0; v < value.length(); v++) {
                JSONObject valueElement = value.optJSONObject(v);
                if (valueElement != null) {
                  Long nodeStateId = valueElement.optLong("nodeStateId");
                  if (timestamp.equals(nodeStateId)) {
                    /*
                     * the timestamp matches so we have found the value
                     * element to retrieve the field value from
                     */
                    result = valueElement.opt(field);
                  }
                }
              }
            }
          }
        } catch (JSONException e) {
          e.printStackTrace();
        }
      }
    }
    return result;
  }

  /**
   * Get the max score from the content
   * @param nodeId the node id
   * @return the max score value obtained from the step content or null if not found
   */
  private Long getMaxScoreFromContent(String nodeId) {
    Long maxScore = null;
    if (nodeId != null) {
      JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
      if (nodeContent != null) {
        String type = nodeContent.optString("type");
        if (type != null) {
          if (type.equals("Challenge")) {
            maxScore = getMaxScoreFromChallengeQuestionStep(nodeContent);
          } else if (type.equals("OpenResponse")) {
            maxScore = getMaxScoreFromOpenResponse(nodeContent);
          } else if (type.equals("SVGDraw")) {
            maxScore = getMaxScoreFromDraw(nodeContent);
          }
        }
      }
    }
    return maxScore;
  }

  /**
   * Get the max score value from the challenge question step
   * @param nodeContent the step content
   * @return the max score for the challenge question step or null if not found
   */
  private Long getMaxScoreFromChallengeQuestionStep(JSONObject nodeContent) {
    Long maxScore = null;
    if (nodeContent != null) {
      JSONObject assessmentItem = nodeContent.optJSONObject("assessmentItem");
      if (assessmentItem != null) {
        JSONObject interaction = assessmentItem.optJSONObject("interaction");
        if (interaction != null) {
          JSONObject attempts = interaction.optJSONObject("attempts");
          if (attempts != null) {
            JSONObject scores = attempts.optJSONObject("scores");
            if (scores != null) {
              Long firstScore = scores.optLong("1");
              if (firstScore != null) {
                maxScore = firstScore;
              }
            }
          }
        }
      }
    }
    return maxScore;
  }

  /**
   * Get the max score value from the open response step
   * @param nodeContent the step content
   * @return the max score from the open response step or null if not found
   */
  private Long getMaxScoreFromOpenResponse(JSONObject nodeContent) {
    Long maxScore = null;
    if (nodeContent != null) {
      JSONObject cRaterObj = nodeContent.optJSONObject("cRater");
      if (cRaterObj != null) {
        Long cRaterMaxScore = cRaterObj.optLong("cRaterMaxScore");
        if (cRaterMaxScore != null) {
          maxScore = cRaterMaxScore;
        }
      }
    }
    return maxScore;
  }

  /**
   * Get the max score value from the draw step
   * @param nodeContent the step content
   * @return the max score from the draw step or null if not found
   */
  private Long getMaxScoreFromDraw(JSONObject nodeContent) {
    Long maxScore = null;
    if (nodeContent != null) {
      JSONObject autoScoringObj = nodeContent.optJSONObject("autoScoring");
      if (autoScoringObj != null) {
        JSONArray autoScoringFeedbackArray = autoScoringObj.optJSONArray("autoScoringFeedback");
        if (autoScoringFeedbackArray != null) {
          for (int x = 0; x < autoScoringFeedbackArray.length(); x++) {
            JSONObject feedbackObj = autoScoringFeedbackArray.optJSONObject(x);
            if (feedbackObj != null) {
              Long tempScore = feedbackObj.optLong("score");
              if (tempScore != null) {
                if (maxScore == null) {
                  maxScore = tempScore;
                } else if (tempScore > maxScore) {
                  maxScore = tempScore;
                }
              }
            }
          }
        }
      }
    }
    return maxScore;
  }

  /**
   * Get the values for the given field from an array
   * @param fieldObject the field object that specifies what work to get
   * @param stepWorkId step work id
   * @param studentWork an array that we will obtain student work values from
   *
   * here's an example of the studentWork array that would be passed in
   *
   * [
   *   {"text":"hello", "x":1, "y":2},
   *   {"text":"world", "x":3, "y":4}
   * ]
   *
   * here's an example of a fieldObject to retrieve all the text values
   *
   * {
   *   "field":"text"
   * }
   *
   * given these two arguments we would end up returning an array like this
   *
   * [
   *   "hello",
   *  "world"
   * ]
   *
   * @param autoGradedAnnotationForNodeState the auto graded annotation for the node state if it exists
   * @return an array that contains the field value from each element in the array
   */
  private ArrayList<Object> getValueForField(JSONObject fieldObject, Long stepWorkId, JSONArray studentWork, String nodeId) {
    ArrayList<Object> values = new ArrayList<Object>();
    if (studentWork != null) {
      try {
        if (fieldObject != null) {
          String field = null;
          JSONObject childFieldObject = null;
          if (fieldObject.has("field")) {
            field = fieldObject.getString("field");
          }
          if (fieldObject.has("childField")) {
            childFieldObject = fieldObject.getJSONObject("childField");
          }
          if (field != null) {
            for (int x = 0; x < studentWork.length(); x++) {
              try {
                Object arrayElement = studentWork.get(x);
                Object value = null;
                if (arrayElement instanceof JSONObject) {
                  JSONObject arrayElementJSONObject = (JSONObject) arrayElement;

                  if (arrayElementJSONObject != null && arrayElementJSONObject.has(field)) {
                    value = ((JSONObject) arrayElement).get(field);
                  }

                  if (value == null) {
                    /*
                     * the student work does not have the field we are looking for so we
                     * will try to find it in the annotation
                     */
                    value = getValueFromAnnotation(fieldObject, stepWorkId, arrayElementJSONObject);
                  }
                }

                if (value != null) {
                  if (value instanceof JSONObject) {
                    if (childFieldObject != null) {
                      //there is a child field so we will traverse deeper into the student work
                      values.add(getColumnValuesForField(childFieldObject, stepWorkId, (JSONObject) value, nodeId));
                    } else {
                      //there is no child field so we will just get the string value of the object
                      values.add(value.toString());
                    }
                  } else if (value instanceof JSONArray) {
                    if (childFieldObject != null) {
                      //there is a child field so we will traverse deeper into the student work
                      values.add(getValueForField(childFieldObject, stepWorkId, (JSONArray) value, nodeId));
                    } else {
                      //there is no child field so we will just get the string value of the array
                      values.add(value.toString());
                    }
                  } else if (value instanceof String) {
                    values.add(value);
                  } else if (value instanceof Boolean) {
                    values.add(value);
                  } else if (value instanceof Long) {
                    values.add(value);
                  } else if (value instanceof Integer) {
                    values.add(value);
                  } else if (value instanceof Double) {
                    values.add(value);
                  }
                } else {
                  /*
                   * we were unable to retrieve the field for this element so we will just
                   * add an empty value
                   */
                  values.add("");
                }
              } catch(JSONException e) {
                e.printStackTrace();
              }
            }
          } else {
            // a field has not been provided so we will just add each element of the array
            for (int x = 0; x < studentWork.length(); x++) {
              Object arrayElement = studentWork.get(x);
              values.add(arrayElement);
            }
          }
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return values;
  }

  /**
   * Get the values of the array
   * @param studentWork a JSONArray of student work
   * @return an array of objects
   */
  private ArrayList<Object> getArrayValues(JSONArray studentWork) {
    ArrayList<Object> values = new ArrayList<Object>();
    if (studentWork != null) {
      for (int x = 0; x < studentWork.length(); x++) {
        try {
          Object arrayElement = studentWork.get(x);
          if (arrayElement instanceof JSONArray) {
            /*
             * the element is an array so we will add all the individual elements
             * of the array
             */
            values.addAll(getArrayValues((JSONArray) arrayElement));
          } else {
            values.add(arrayElement);
          }
        } catch (JSONException e) {
          e.printStackTrace();
        }
      }
    }
    return values;
  }

  /**
   * Parse the excel export string template and insert the appropriate
   * data from the student work into it
   *
   * @param excelExportStringTemplate the template for how the text should
   * be displayed in the cell
   * e.g.
   * "Top Score: {response.topScore}, Phase 1 Score: {response.phases[0].score}"
   * @param nodeState the node state
   * @param stepWorkId the step work id
   *
   * @return a string containing the student work that will be displayed
   * in the cell
   * e.g.
   * "Top Score: 30, Phase 1 Score: 10"
   */
  private String generateExcelExportString(String excelExportStringTemplate, JSONObject nodeState, Long stepWorkId) {
    String resultString = excelExportStringTemplate;

    /*
     * a regular expression pattern to match the patterns that
     * will be used to specify where we need to insert student work.
     * here are some examples
     * {response}
     * {response.topScore}
     * {response.phases[0].score}
     */
    Pattern p = Pattern.compile("\\{[\\w\\.\\d\\[\\]]*\\}");

    //run the pattern matcher on our template string
    Matcher m = p.matcher(excelExportStringTemplate);

    boolean foundMatch = m.find();
    while (foundMatch) {
      /*
       * get the string that has matched our regular expression pattern
       * e.g. {response}
       */
      String field = m.group();

      /*
       * get the the student data that we will use to
       * insert into the excel export string template
       */
      String replacement = getNodeStateField(field, nodeState, stepWorkId);

      resultString = resultString.replace(field, replacement);
      foundMatch = m.find();
    }
    return resultString;
  }

  /**
   * Get the student data for the given field path
   *
   * @param fieldPath
   * here are some examples
   * {response}
   * {response.topScore}
   * {response.phases[0].score}
   * @param nodeState the student work
   * @param stepWorkId the step work id
   *
   * @return the value of the given field from the student work
   */
  private String getNodeStateField(String fieldPath, JSONObject nodeState, Long stepWorkId) {
    String fieldValue = "";

    //remove the {
    fieldPath = fieldPath.replaceAll("\\{", "");

    //remove the }
    fieldPath = fieldPath.replaceAll("\\}", "");

    //get the value of the given field from the student work
    fieldValue = getFieldValue(fieldPath, nodeState, stepWorkId);

    return fieldValue;
  }

  /**
   * Get the student data for the given field path
   *
   * @param fieldPath
   * here are some examples
   * response
   * response.topScore
   * response.phases[0].score
   * @param nodeState the student work
   * @param stepWorkId the step work id
   *
   * @return the value of the given field from the student work
   */
  private String getFieldValue(String fieldPath, JSONObject nodeState, Long stepWorkId) {
    String fieldValue = "";

    //split the field path by .
    String[] split = fieldPath.split("\\.");

    //get the current node state
    JSONObject currentJSONObject = nodeState;

    try {
      /*
       * variable that determines whether we are on the last field
       * or not. if we are on the last field we will try to retrieve
       * the string value for the current field. if we are not on
       * the last field we will try to retrieve the object value
       * for the current field.
       */
      boolean lastField = false;

      /*
       * this variable will be used in cases where the field name
       * contains a period such as
       *
       * e.g.
       * response.MySystem.RuleFeedback.LAST_FEEDBACK.feedback
       *
       * {
       *    response:{
       *       MySystem.RuleFeedback:{
       *          LAST_FEEDBACK:{
       *             feedback:""
       *          }
       *       }
       *    }
       * }
       *
       * where 'MySystem.RuleFeedback' is the name of the field
       * even though JSON field names usually should not contain periods.
       *
       * so in that example, the objects that are referenced would be
       * response
       * MySystem.RuleFeedback
       * LAST_FEEDBACK
       * feedback
       *
       * fieldNameSoFar will remember 'MySystem' when we don't find
       * the 'MySystem' field in the 'response' object, so that when
       * we look for the next field 'RuleFeedback', we will prepend
       * the 'MySystem' to 'RuleFeedback' separated by a period so
       * that we look for the field 'MySystem.RuleFeedback' in the
       * 'response' object and successfully retrieve the
       * 'MySystem.RuleFeedback' object.
       */
      String fieldNameSoFar = "";

      for (int x = 0; x < split.length; x++) {
        if (x == split.length - 1) {
          lastField = true;
        }
        String fieldName = split[x];
        int arrayIndex = 0;

        /*
         * a pattern matcher that will match field names and array references
         * here are some examples
         * topScore
         * phases[0]
         *
         * we will use groups to capture parts of the field
         * (1)*(2[(3)])?
         */
        Pattern p = Pattern.compile("(\\w*)(\\[(\\d)*\\])?");

        //run the pattern matcher on our field name
        Matcher m = p.matcher(fieldName);

        if (m.matches()) {
          for (int y = 0; y <= m.groupCount(); y++) {
            if (y == 1) {
              fieldName = m.group(y);
            } else if (y == 3) {
              if (m.group(y) != null) {
                try {
                  arrayIndex = Integer.parseInt(m.group(y));
                } catch(NumberFormatException e) {
                  e.printStackTrace();
                }
              }
            }
          }

          if (!fieldNameSoFar.equals("")) {
            fieldNameSoFar = fieldNameSoFar + "." + fieldName;
          } else {
            fieldNameSoFar = fieldName;
          }
        }

        if (fieldNameSoFar != null && fieldNameSoFar.equals("cRaterAnnotationScore")) {
          long cRaterScore = getCRaterScoreByStepWorkIdAndNodeState(stepWorkId, nodeState);
          if (cRaterScore == -1) {
            fieldValue = "";
          } else {
            fieldValue = cRaterScore + "";
          }
          return fieldValue;
        }

        if (currentJSONObject != null) {
          if (currentJSONObject.has(fieldNameSoFar)) {
            Object fieldObject = currentJSONObject.get(fieldNameSoFar);
            if (fieldObject instanceof JSONObject) {
              if (lastField) {
                fieldValue = ((JSONObject) fieldObject).toString();
              } else {
                currentJSONObject = (JSONObject) fieldObject;
              }
            } else if (fieldObject instanceof JSONArray) {
              if (lastField) {
                fieldValue = ((JSONArray) fieldObject).toString();
              } else {
                /*
                 * get the element at the given array index.
                 * this assumes the element at the given index is a JSONObject
                 */
                currentJSONObject = ((JSONArray) fieldObject).getJSONObject(arrayIndex);
              }
            } else if (fieldObject instanceof String) {
              if (lastField) {
                fieldValue = (String) fieldObject;
              } else {
                String fieldObjectString = (String) fieldObject;
                currentJSONObject = new JSONObject(fieldObjectString);
              }
            } else if (fieldObject instanceof Integer) {
              fieldValue = ((Integer) fieldObject).toString();

              /*
               * set the currentJSONObject to null because we can't go
               * any deeper since we have hit an integer
               */
              currentJSONObject = null;
            } else if (fieldObject instanceof Boolean) {
              fieldValue = ((Boolean) fieldObject).toString();

              /*
               * set the currentJSONObject to null because we can't go
               * any deeper since we have hit a boolean
               */
              currentJSONObject = null;
            }

            fieldNameSoFar = "";
          } else {
            //do nothing
          }
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return fieldValue;
  }

  /**
   * Create the row that contains the user data headers, we will assume there
   * will be at most 3 students in a single workgroup
   *
   * @param userDataHeaderRowColumnCounter the column to start on
   * @param userDataHeaderRow the excel Row object to populate
   * @param userDataHeaderRowVector the csv row to populate
   * @param includeUserDataCells whether to output the user data cells such
   * as workgroup id, wise id 1, wise id 2, wise id 3, class period
   * @param includeMetaDataCells whether to output the metadata cells such
   * as teacher login, project id, project name, etc.
   */
  private int createUserDataHeaderRow(int userDataHeaderRowColumnCounter, Row userDataHeaderRow, Vector<String> userDataHeaderRowVector, boolean includeUserDataCells, boolean includeMetaDataCells) {
    if (includeUserDataCells) {
      userDataHeaderRowColumnCounter = setCellValue(userDataHeaderRow, userDataHeaderRowVector, userDataHeaderRowColumnCounter, "Workgroup Id");
      userDataHeaderRowColumnCounter = setCellValue(userDataHeaderRow, userDataHeaderRowVector, userDataHeaderRowColumnCounter, "Wise Id 1");
      userDataHeaderRowColumnCounter = setCellValue(userDataHeaderRow, userDataHeaderRowVector, userDataHeaderRowColumnCounter, "Wise Id 2");
      userDataHeaderRowColumnCounter = setCellValue(userDataHeaderRow, userDataHeaderRowVector, userDataHeaderRowColumnCounter, "Wise Id 3");
      userDataHeaderRowColumnCounter = setCellValue(userDataHeaderRow, userDataHeaderRowVector, userDataHeaderRowColumnCounter, "Class Period");
    }

    if (includeMetaDataCells) {
      userDataHeaderRowColumnCounter = setCellValue(userDataHeaderRow, userDataHeaderRowVector, userDataHeaderRowColumnCounter, "Teacher Login");
      userDataHeaderRowColumnCounter = setCellValue(userDataHeaderRow, userDataHeaderRowVector, userDataHeaderRowColumnCounter, "Project Id");
      userDataHeaderRowColumnCounter = setCellValue(userDataHeaderRow, userDataHeaderRowVector, userDataHeaderRowColumnCounter, "Parent Project Id");
      userDataHeaderRowColumnCounter = setCellValue(userDataHeaderRow, userDataHeaderRowVector, userDataHeaderRowColumnCounter, "Project Name");
      userDataHeaderRowColumnCounter = setCellValue(userDataHeaderRow, userDataHeaderRowVector, userDataHeaderRowColumnCounter, "Run Id");
      userDataHeaderRowColumnCounter = setCellValue(userDataHeaderRow, userDataHeaderRowVector, userDataHeaderRowColumnCounter, "Run Name");
      userDataHeaderRowColumnCounter = setCellValue(userDataHeaderRow, userDataHeaderRowVector, userDataHeaderRowColumnCounter, "Start Date");
      userDataHeaderRowColumnCounter = setCellValue(userDataHeaderRow, userDataHeaderRowVector, userDataHeaderRowColumnCounter, "End Date");
    }
    return userDataHeaderRowColumnCounter;
  }

  /**
   * Create the row that contains the user data such as the student
   * logins, teacher login, period name, etc.
   * we will assume there will be at most 3 students in a single workgroup
   *
   * @param workgroupColumnCounter the column to start on
   * @param userDataRow the excel Row object to populate
   * @param userDataRowVector the csv row to populate
   * @param workgroupId the workgroupId to obtain user data for
   * @param includeUserDataCells whether to output the user data cells such
   * as workgroup id, wise id 1, wise id 2, wise id 3, class period
   * @param includeMetaDataCells whether to output the metadata cells such
   * as teacher login, project id, project name, etc.
   * @param periodName (optional) the period name
   */
  private int createUserDataRow(int workgroupColumnCounter, Row userDataRow, Vector<String> userDataRowVector, String workgroupId, boolean includeUserDataCells, boolean includeMetaDataCells, String periodName) {
    if (includeUserDataCells) {
      workgroupColumnCounter = setCellValueConvertStringToLong(userDataRow, userDataRowVector, workgroupColumnCounter, workgroupId);
      String userIds = workgroupIdToUserIds.get(Integer.parseInt(workgroupId));
      if (userIds != null) {
        String[] userIdsArray = userIds.split(":");
        ArrayList<Long> userIdsList = sortUserIdsArray(userIdsArray);
        for (int z = 0; z < userIdsList.size(); z++) {
          Long userIdLong = userIdsList.get(z);
          workgroupColumnCounter = setCellValue(userDataRow, userDataRowVector, workgroupColumnCounter, userIdLong);
        }

        /*
         * we will assume there will be at most 3 students in a workgroup so we need
         * to increment the column counter if necessary
         */
        int numColumnsToAdd = 3 - userIdsList.size();
        workgroupColumnCounter += numColumnsToAdd;
        addEmptyElementsToVector(userDataRowVector, numColumnsToAdd);

        if (periodName == null) {
          periodName = workgroupIdToPeriodName.get(Integer.parseInt(workgroupId));
        }

        if (periodName != null) {
          workgroupColumnCounter = setCellValueConvertStringToLong(userDataRow, userDataRowVector, workgroupColumnCounter, periodName);
        } else {
          workgroupColumnCounter++;
          addEmptyElementsToVector(userDataRowVector, 1);
        }
      } else {
        if (periodName != null) {
          /*
           * we did not find any student logins so we will just increment the column
           * counter by 3 since we provide 3 columns for the student logins and then
           * we'll add the period name since it was provided. this is only used
           * in the public idea basket row excel export.
           */
          workgroupColumnCounter += 3;
          addEmptyElementsToVector(userDataRowVector, 3);
          workgroupColumnCounter = setCellValueConvertStringToLong(userDataRow, userDataRowVector, workgroupColumnCounter, periodName);
        } else {
          /*
           * we did not find any student logins so we will just increment the column
           * counter by 4 since we provide 3 columns for the student logins and 1
           * for the period
           */
          workgroupColumnCounter += 4;
          addEmptyElementsToVector(userDataRowVector, 4);
        }
      }
    }

    if (includeMetaDataCells) {
      String teacherLogin = "";
      try {
        teacherLogin = teacherUserInfoJSONObject.getString("username");
      } catch (JSONException e) {
        e.printStackTrace();
      }

      workgroupColumnCounter = setCellValue(userDataRow, userDataRowVector, workgroupColumnCounter, teacherLogin);
      workgroupColumnCounter = setCellValueConvertStringToLong(userDataRow, userDataRowVector, workgroupColumnCounter, projectId);
      workgroupColumnCounter = setCellValueConvertStringToLong(userDataRow, userDataRowVector, workgroupColumnCounter, parentProjectId);
      workgroupColumnCounter = setCellValue(userDataRow, userDataRowVector, workgroupColumnCounter, projectName);
      workgroupColumnCounter = setCellValueConvertStringToLong(userDataRow, userDataRowVector, workgroupColumnCounter, runId);
      workgroupColumnCounter = setCellValue(userDataRow, userDataRowVector, workgroupColumnCounter, runName);
      workgroupColumnCounter = setCellValue(userDataRow, userDataRowVector, workgroupColumnCounter, startTime);
      workgroupColumnCounter = setCellValue(userDataRow, userDataRowVector, workgroupColumnCounter, endTime);
    }
    return workgroupColumnCounter;
  }

  /**
   * Get the explanation builder work excel export. We will generate a row
   * for each idea used in an explanation builder step. The order of
   * the explanation builder steps will be chronological from oldest to newest.
   *
   * @param nodeIdToNodeTitlesMap a mapping of node id to node title
   * @param workgroupIds a vector of workgroup ids
   * @param runId the run id
   * @param nodeIdToNode a mapping of node id to node
   * @param nodeIdToNodeContent a mapping of node id to node content
   * @param workgroupIdToPeriodId a mapping of workgroup id to period id
   * @param teacherWorkgroupIds a list of teacher workgroup ids
   *
   * @return the excel workbook if we are generating an xls file
   */
  private XSSFWorkbook getExplanationBuilderWorkExcelExport(HashMap<String, String> nodeIdToNodeTitlesMap,
                                                            Vector<String> workgroupIds,
                                                            String runId,
                                                            HashMap<String, JSONObject> nodeIdToNode,
                                                            HashMap<String, JSONObject> nodeIdToNodeContent,
                                                            HashMap<Integer, Integer> workgroupIdToPeriodId,
                                                            List<String> teacherWorkgroupIds) {

    XSSFWorkbook wb = null;
    if (isFileTypeXLS(fileType)) {
      wb = new XSSFWorkbook();
    }

    boolean isCSVHeaderRowWritten = false;
    for (int x = 0; x < workgroupIds.size(); x++) {
      String workgroupId = workgroupIds.get(x);
      UserInfo userInfo = vleService.getUserInfoByWorkgroupId(Long.parseLong(workgroupId));
      XSSFSheet userIdSheet = null;

      if (wb != null) {
        userIdSheet = wb.createSheet(workgroupId);
      }

      int rowCounter = 0;

      int headerColumn = 0;
      Row headerRow = createRow(userIdSheet, rowCounter++);
      Vector<String> headerRowVector = createRowVector();

      /*
       * create the cells that will display the user data headers such as workgroup id,
       * student login, teacher login, period name, etc.
       */
      headerColumn = createUserDataHeaderRow(headerColumn, headerRow, headerRowVector, true, true);

      Vector<String> headerColumnNames = new Vector<String>();
      headerColumnNames.add("Step Work Id");
      headerColumnNames.add("Step Title");
      headerColumnNames.add("Step Prompt");
      headerColumnNames.add("Node Id");
      headerColumnNames.add("Post Time (Server Clock)");
      headerColumnNames.add("Start Time (Student Clock)");
      headerColumnNames.add("End Time (Student Clock)");
      headerColumnNames.add("Time Spent (in seconds)");
      headerColumnNames.add("Answer");
      headerColumnNames.add("Idea Id");
      headerColumnNames.add("Idea Text");
      headerColumnNames.add("Idea X Position");
      headerColumnNames.add("Idea Y Position");
      headerColumnNames.add("Idea Color");
      headerColumnNames.add("Idea Width");
      headerColumnNames.add("Idea Height");

      for (int y = 0; y < headerColumnNames.size(); y++) {
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, headerColumnNames.get(y));
      }

      if (!isCSVHeaderRowWritten) {
        writeCSV(headerRowVector);

          /*
           * set this flag to true so we don't write the header row into the csv again.
           * this means we will only output the header row once at the very top of the csv file.
           */
        isCSVHeaderRowWritten = true;
      }

      List<StepWork> stepWorks = vleService.getStepWorksByUserInfo(userInfo);
      for (int z = 0; z < stepWorks.size(); z++) {
        StepWork stepWork = stepWorks.get(z);
        Node node = stepWork.getNode();
        String nodeType = node.getNodeType();

        if (nodeType != null && nodeType.equals("ExplanationBuilderNode")) {
          String data = stepWork.getData();

          try {
            JSONObject dataJSONObject = new JSONObject(data);
            JSONArray nodeStates = dataJSONObject.getJSONArray("nodeStates");

            if (nodeStates != null && nodeStates.length() > 0) {
              JSONObject nodeState = nodeStates.getJSONObject(nodeStates.length() - 1);
              String answer = nodeState.getString("answer");
              JSONArray explanationIdeas = nodeState.getJSONArray("explanationIdeas");

              if (explanationIdeas != null && explanationIdeas.length() > 0) {
                for (int i = 0; i < explanationIdeas.length(); i++) {
                  JSONObject explanationIdea = explanationIdeas.getJSONObject(i);
                  Row ideaRow = createRow(userIdSheet, rowCounter++);
                  Vector<String> ideaRowVector = createRowVector();

                  int columnCounter = 0;

                  Long stepWorkId = stepWork.getId();
                  String nodeId = node.getNodeId();
                  String title = nodeIdToNodeTitlesMap.get(nodeId);
                  JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
                  String prompt = "";

                  if (nodeContent != null) {
                    if (nodeContent.has("prompt")) {
                      prompt = nodeContent.getString("prompt");
                    }
                  }

                  Timestamp startTime = stepWork.getStartTime();
                  Timestamp endTime = stepWork.getEndTime();
                  Timestamp postTime = stepWork.getPostTime();

                  long timeSpentOnStep = 0;

                  if (endTime == null || startTime == null) {
                    //set to -1 if either start or end was null so we can set the cell to N/A later
                    timeSpentOnStep = -1;
                  } else {
                    /*
                     * find the difference between start and end and divide by
                     * 1000 to obtain the value in seconds
                     */
                    timeSpentOnStep = (endTime.getTime() - startTime.getTime()) / 1000;
                  }

                  /*
                   * create the cells that will display the user data such as the actual values
                   * for workgroup id, student login, teacher login, period name, etc.
                   */
                  columnCounter = createUserDataRow(columnCounter, ideaRow, ideaRowVector, workgroupId, true, true, null);

                  columnCounter = setCellValue(ideaRow, ideaRowVector, columnCounter, stepWorkId);
                  columnCounter = setCellValue(ideaRow, ideaRowVector, columnCounter, title);
                  columnCounter = setCellValue(ideaRow, ideaRowVector, columnCounter, prompt);
                  columnCounter = setCellValue(ideaRow, ideaRowVector, columnCounter, nodeId);

                  if (postTime != null) {
                    columnCounter = setCellValue(ideaRow, ideaRowVector, columnCounter, timestampToFormattedString(postTime));
                  } else {
                    columnCounter = setCellValue(ideaRow, ideaRowVector, columnCounter, "");
                  }

                  columnCounter = setCellValue(ideaRow, ideaRowVector, columnCounter, timestampToFormattedString(startTime));
                  if (endTime != null) {
                    columnCounter = setCellValue(ideaRow, ideaRowVector, columnCounter, timestampToFormattedString(endTime));
                  } else {
                    columnCounter = setCellValue(ideaRow, ideaRowVector, columnCounter, "");
                  }

                  if (timeSpentOnStep == -1) {
                    columnCounter = setCellValue(ideaRow, ideaRowVector, columnCounter, "N/A");
                  } else {
                    columnCounter = setCellValue(ideaRow, ideaRowVector, columnCounter, timeSpentOnStep);
                  }

                  columnCounter = setCellValue(ideaRow, ideaRowVector, columnCounter, answer);
                  columnCounter = setCellValue(ideaRow, ideaRowVector, columnCounter, explanationIdea.getLong("id"));
                  columnCounter = setCellValue(ideaRow, ideaRowVector, columnCounter, explanationIdea.getString("lastAcceptedText"));
                  columnCounter = setCellValue(ideaRow, ideaRowVector, columnCounter, explanationIdea.getLong("xpos"));
                  columnCounter = setCellValue(ideaRow, ideaRowVector, columnCounter, explanationIdea.getLong("ypos"));
                  columnCounter = setCellValue(ideaRow, ideaRowVector, columnCounter, getColorNameFromRBGString(explanationIdea.getString("color")));

                  if (explanationIdea.has("width")) {
                    columnCounter = setCellValue(ideaRow, ideaRowVector, columnCounter, explanationIdea.getLong("width"));
                  } else {
                    columnCounter++;
                  }

                  if (explanationIdea.has("height")) {
                    columnCounter = setCellValue(ideaRow, ideaRowVector, columnCounter, explanationIdea.getLong("height"));
                  } else {
                    columnCounter++;
                  }
                  writeCSV(ideaRowVector);
                }
              }
            }
          } catch (JSONException e) {
            e.printStackTrace();
          }
        }
      }
    }
    return wb;
  }

  /**
   * Get the annotator work excel export. We will generate a row
   * for each label in an annotator step. The order of
   * the annotator steps will be chronological from oldest to newest.
   *
   * @param nodeIdToNodeTitlesMap a mapping of node id to node title
   * @param workgroupIds a vector of workgroup ids
   * @param runId the run id
   * @param nodeIdToNode a mapping of node id to node
   * @param nodeIdToNodeContent a mapping of node id to node content
   * @param workgroupIdToPeriodId a mapping of workgroup id to period id
   * @param teacherWorkgroupIds a list of teacher workgroup ids
   *
   * @return the excel workbook if we are generating an xls file
   */
  private XSSFWorkbook getAnnotatorWorkExcelExport(HashMap<String, String> nodeIdToNodeTitlesMap,
                                                   Vector<String> workgroupIds,
                                                   String runId,
                                                   HashMap<String, JSONObject> nodeIdToNode,
                                                   HashMap<String, JSONObject> nodeIdToNodeContent,
                                                   HashMap<Integer, Integer> workgroupIdToPeriodId,
                                                   List<String> teacherWorkgroupIds) {
    XSSFWorkbook wb = null;

    if (isFileTypeXLS(fileType)) {
      wb = new XSSFWorkbook();
    }

    for (int x = 0; x < workgroupIds.size(); x++) {
      String workgroupId = workgroupIds.get(x);
      UserInfo userInfo = vleService.getUserInfoByWorkgroupId(Long.parseLong(workgroupId));

      XSSFSheet userIdSheet = null;
      if (wb != null) {
        userIdSheet = wb.createSheet(workgroupId);
      }

      int rowCounter = 0;
      int headerColumn = 0;

      HashMap<String, Integer> nodeIdToStepRevisionCount = new HashMap<String, Integer>();
      HashMap<String, Integer> nodeIdToCheckScoreAttemptCount = new HashMap<String, Integer>();
      Integer maxScoringCriteriaCount = 0;
      Row headerRow = createRow(userIdSheet, rowCounter++);
      Vector<String> headerRowVector = createRowVector();

      /*
       * create the cells that will display the user data headers such as workgroup id,
       * student login, teacher login, period name, etc.
       */
      headerColumn = createUserDataHeaderRow(headerColumn, headerRow, headerRowVector, true, true);

      writeCSV(headerRowVector);

      Vector<String> headerColumnNames = new Vector<String>();
      headerColumnNames.add("Step Work Id");
      headerColumnNames.add("Step Title");
      headerColumnNames.add("Step Prompt");
      headerColumnNames.add("Node Id");
      headerColumnNames.add("Post Time (Server Clock)");
      headerColumnNames.add("Start Time (Student Clock)");
      headerColumnNames.add("End Time (Student Clock)");
      headerColumnNames.add("Time Spent (in seconds)");
      headerColumnNames.add("Step Revision Count");
      headerColumnNames.add("Explanation");
      headerColumnNames.add("Number of Labels");
      headerColumnNames.add("Label Id");
      headerColumnNames.add("Label Text");
      headerColumnNames.add("Label Color");
      headerColumnNames.add("Label Location X");
      headerColumnNames.add("Label Location Y");
      headerColumnNames.add("Text Color");
      headerColumnNames.add("Text Location X");
      headerColumnNames.add("Text Location Y");
      headerColumnNames.add("Check Work");
      headerColumnNames.add("Check Score Attempt Number");
      headerColumnNames.add("Auto Score");
      headerColumnNames.add("Max Auto Score");

      for (int y = 0; y < headerColumnNames.size(); y++) {
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, headerColumnNames.get(y));
      }

      writeCSV(headerRowVector);
      List<StepWork> stepWorks = vleService.getStepWorksByUserInfo(userInfo);

      for (int z = 0; z < stepWorks.size(); z++) {
        StepWork stepWork = stepWorks.get(z);
        Node node = stepWork.getNode();
        String nodeType = node.getNodeType();
        if (nodeType != null && nodeType.equals("AnnotatorNode")) {
          String nodeId = node.getNodeId();
          String data = stepWork.getData();

          try {
            JSONObject dataJSONObject = new JSONObject(data);
            JSONArray nodeStates = dataJSONObject.optJSONArray("nodeStates");

            if (nodeStates != null && nodeStates.length() > 0) {
              for (int n = 0; n < nodeStates.length(); n++) {
                JSONObject nodeState = nodeStates.getJSONObject(n);
                JSONObject nodeStateData = nodeState.optJSONObject("data");
                if (nodeStateData != null) {
                  Integer stepRevisionCount = nodeIdToStepRevisionCount.get(nodeId);
                  if (stepRevisionCount == null) {
                    stepRevisionCount = 1;
                  }

                  nodeIdToStepRevisionCount.put(nodeId, stepRevisionCount + 1);
                  String explanation = nodeStateData.optString("explanation");
                  JSONArray labels = nodeStateData.optJSONArray("labels");
                  Long totalNumberOfLabelsCreated = nodeStateData.optLong("total");
                  Long autoScore = nodeState.optLong("autoScore");
                  Long maxAutoScore = nodeState.optLong("maxAutoScore");
                  Boolean checkWork = nodeState.optBoolean("checkWork");
                  JSONArray scoringCriteriaResults = nodeState.optJSONArray("scoringCriteriaResults");
                  Integer checkScoreAttemptCount = null;

                  if (scoringCriteriaResults != null) {
                    checkScoreAttemptCount = nodeIdToCheckScoreAttemptCount.get(nodeId);
                    if (checkScoreAttemptCount == null) {
                      checkScoreAttemptCount = 1;
                    }
                    nodeIdToCheckScoreAttemptCount.put(nodeId, checkScoreAttemptCount + 1);
                  }

                  if (labels == null || labels.length() == 0) {
                    /*
                     * there are no labels so we will display a row with the step visit data and
                     * the student explanation if there is one
                     */

                    Row row = createRow(userIdSheet, rowCounter++);
                    Vector<String> rowVector = createRowVector();
                    int columnCounter = 0;
                    int labelCount = labels.length();
                    columnCounter = fillCommonCellsOfAnnotatorRow(columnCounter, row, rowVector, stepWork, nodeIdToNodeTitlesMap, nodeId, workgroupId, stepRevisionCount, explanation, labelCount);
                  } else {
                    int labelCount = labels.length();
                    for (int labelCounter = 0; labelCounter < labels.length(); labelCounter++) {
                      JSONObject label = labels.optJSONObject(labelCounter);

                      if (label != null) {
                        String labelId = label.optString("id");
                        String labelTextColor = label.optString("textColor");
                        String labelText = label.optString("text");
                        String labelColor = label.optString("color");
                        Double labelLocationX = null;
                        Double labelLocationY = null;
                        Double labelTextLocationX = null;
                        Double labelTextLocationY = null;

                        JSONObject location = label.optJSONObject("location");
                        if (location != null) {
                          labelLocationX = location.optDouble("x");
                          labelLocationY = location.optDouble("y");
                        }

                        JSONObject textLocation = label.optJSONObject("textLocation");
                        if (textLocation != null) {
                          labelTextLocationX = textLocation.optDouble("x");
                          labelTextLocationY = textLocation.optDouble("y");
                        }

                        Row row = createRow(userIdSheet, rowCounter++);
                        Vector<String> rowVector = createRowVector();
                        int columnCounter = 0;
                        columnCounter = fillCommonCellsOfAnnotatorRow(columnCounter, row, rowVector, stepWork, nodeIdToNodeTitlesMap, nodeId, workgroupId, stepRevisionCount, explanation, labelCount);
                        columnCounter = setCellValue(row, rowVector, columnCounter, labelId);
                        columnCounter = setCellValue(row, rowVector, columnCounter, labelText);
                        columnCounter = setCellValue(row, rowVector, columnCounter, getColorNameFromColorHex(labelColor));
                        columnCounter = setCellValue(row, rowVector, columnCounter, labelLocationX);
                        columnCounter = setCellValue(row, rowVector, columnCounter, labelLocationY);
                        columnCounter = setCellValue(row, rowVector, columnCounter, getColorNameFromColorHex(labelTextColor));
                        columnCounter = setCellValue(row, rowVector, columnCounter, labelTextLocationX);
                        columnCounter = setCellValue(row, rowVector, columnCounter, labelTextLocationY);
                        columnCounter = setCellValue(row, rowVector, columnCounter, Boolean.toString(checkWork));
                        if (scoringCriteriaResults != null) {
                          columnCounter = setCellValue(row, rowVector, columnCounter, checkScoreAttemptCount);
                          columnCounter = setCellValue(row, rowVector, columnCounter, autoScore);
                          columnCounter = setCellValue(row, rowVector, columnCounter, maxAutoScore);

                          for (int scr = 0; scr < scoringCriteriaResults.length(); scr++) {
                            JSONObject scoringCriteriaResult = scoringCriteriaResults.optJSONObject(scr);
                            Long scoringCriteriaId = scoringCriteriaResult.optLong("id");
                            Long scoringCriteriaScore = scoringCriteriaResult.optLong("score");
                            Long scoringCriteriaMaxScore = scoringCriteriaResult.optLong("maxScore");
                            Boolean isSatisfied = scoringCriteriaResult.optBoolean("isSatisfied");
                            String feedback = scoringCriteriaResult.optString("feedback");
                            columnCounter = setCellValue(row, rowVector, columnCounter, scoringCriteriaId);
                            columnCounter = setCellValue(row, rowVector, columnCounter, scoringCriteriaScore);
                            columnCounter = setCellValue(row, rowVector, columnCounter, scoringCriteriaMaxScore);
                            columnCounter = setCellValue(row, rowVector, columnCounter, Boolean.toString(isSatisfied));
                            columnCounter = setCellValue(row, rowVector, columnCounter, feedback);
                          }

                          /*
                           * remember the max number of scoring criteria results for all steps so we can
                           * display the appropriate number of header cells
                           */
                          if (scoringCriteriaResults.length() > maxScoringCriteriaCount) {
                            maxScoringCriteriaCount = scoringCriteriaResults.length();
                          }
                        }
                        writeCSV(rowVector);
                      }
                    }
                  }
                }
              }
            }
          } catch (JSONException e) {
            e.printStackTrace();
          }
        }
      }

      for (int m = 0; m < maxScoringCriteriaCount; m++) {
        int scoringCriteriaCount = m + 1;
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Scoring Criteria Id " + scoringCriteriaCount);
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Scoring Criteria Score " + scoringCriteriaCount);
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Scoring Criteria Max Score " + scoringCriteriaCount);
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Is Satisfied " + scoringCriteriaCount);
        headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Feedback " + scoringCriteriaCount);
      }
      Vector<String> emptyVector2 = createRowVector();
      writeCSV(emptyVector2);
    }
    return wb;
  }

  /**
   * Fill the common cells of the annotator row such as workgroup id,
   * run information, step work id, prompt, step title, timestamps, etc.
   * @param columnCounter
   * @param row
   * @param rowVector
   * @param stepWork
   * @param nodeIdToNodeTitlesMap
   * @param nodeId
   * @param workgroupId
   * @param stepRevisionCount
   * @param explanation
   * @param labelCount
   * @return
   */
  public int fillCommonCellsOfAnnotatorRow(int columnCounter,
                                           Row row,
                                           Vector<String> rowVector,
                                           StepWork stepWork,
                                           HashMap<String,
                                             String> nodeIdToNodeTitlesMap,
                                           String nodeId,
                                           String workgroupId,
                                           Integer stepRevisionCount,
                                           String explanation,
                                           int labelCount) {
    Long stepWorkId = stepWork.getId();
    String title = nodeIdToNodeTitlesMap.get(nodeId);
    JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
    String prompt = "";
    try {
      if (nodeContent != null) {
        if (nodeContent.has("prompt")) {
          prompt = nodeContent.getString("prompt");
        }
      }
    } catch(JSONException e) {
      e.printStackTrace();
    }

    Timestamp startTime = stepWork.getStartTime();
    Timestamp endTime = stepWork.getEndTime();
    Timestamp postTime = stepWork.getPostTime();
    long timeSpentOnStep = 0;

    if (endTime == null || startTime == null) {
      //set to -1 if either start or end was null so we can set the cell to N/A later
      timeSpentOnStep = -1;
    } else {
      /*
       * find the difference between start and end and divide by
       * 1000 to obtain the value in seconds
       */
      timeSpentOnStep = (endTime.getTime() - startTime.getTime()) / 1000;
    }

    /*
     * create the cells that will display the user data such as the actual values
     * for workgroup id, student login, teacher login, period name, etc.
     */
    columnCounter = createUserDataRow(columnCounter, row, rowVector, workgroupId, true, true, null);
    columnCounter = setCellValue(row, rowVector, columnCounter, stepWorkId);
    columnCounter = setCellValue(row, rowVector, columnCounter, title);
    columnCounter = setCellValue(row, rowVector, columnCounter, prompt);
    columnCounter = setCellValue(row, rowVector, columnCounter, nodeId);

    if (postTime != null) {
      columnCounter = setCellValue(row, rowVector, columnCounter, timestampToFormattedString(postTime));
    } else {
      columnCounter = setCellValue(row, rowVector, columnCounter, "");
    }

    columnCounter = setCellValue(row, rowVector, columnCounter, timestampToFormattedString(startTime));

    if (endTime != null) {
      columnCounter = setCellValue(row, rowVector, columnCounter, timestampToFormattedString(endTime));
    } else {
      columnCounter = setCellValue(row, rowVector, columnCounter, "");
    }

    if (timeSpentOnStep == -1) {
      columnCounter = setCellValue(row, rowVector, columnCounter, "N/A");
    } else {
      columnCounter = setCellValue(row, rowVector, columnCounter, timeSpentOnStep);
    }

    columnCounter = setCellValue(row, rowVector, columnCounter, stepRevisionCount);
    columnCounter = setCellValue(row, rowVector, columnCounter, explanation);
    columnCounter = setCellValue(row, rowVector, columnCounter, labelCount);
    return columnCounter;
  }

  /**
   * Get the flash work excel export. We will generate a row
   * for each item used in a flash step. The order of
   * the flash steps will be chronological from oldest to newest.
   *
   * @param nodeIdToNodeTitlesMap a mapping of node id to node titles
   * @param workgroupIds a vector of workgroup ids
   * @param runId the run id
   * @param nodeIdToNode a mapping of node id to node
   * @param nodeIdToNodeContent a mapping of node id to node content
   * @param workgroupIdToPeriodId a mapping of workgroup id to period id
   * @param teacherWorkgroupIds a list of teacher workgroup ids
   *
   * @return an excel workbook if we are generating an xls file
   */
  private XSSFWorkbook getFlashWorkExcelExport(HashMap<String, String> nodeIdToNodeTitlesMap,
                                               Vector<String> workgroupIds,
                                               String runId,
                                               HashMap<String, JSONObject> nodeIdToNode,
                                               HashMap<String, JSONObject> nodeIdToNodeContent,
                                               HashMap<Integer, Integer> workgroupIdToPeriodId,
                                               List<String> teacherWorkgroupIds) {
    XSSFWorkbook wb = null;

    if (isFileTypeXLS(fileType)) {
      wb = new XSSFWorkbook();
    }

    boolean exportAllWork = true;
    int rowCounter = 0;

    XSSFSheet allWorkgroupsSheet = null;

    if (wb != null) {
      allWorkgroupsSheet = wb.createSheet("All Workgroups");
    }

    String teacherLogin = "";

    try {
      teacherLogin = teacherUserInfoJSONObject.getString("username");
    } catch (JSONException e1) {
      e1.printStackTrace();
    }

    int headerColumn = 0;
    Row headerRow = createRow(allWorkgroupsSheet, rowCounter++);
    Vector<String> headerColumnNames = new Vector<String>();
    headerColumnNames.add("Workgroup Id");
    headerColumnNames.add("Wise Id 1");
    headerColumnNames.add("Wise Id 2");
    headerColumnNames.add("Wise Id 3");
    headerColumnNames.add("Teacher Login");
    headerColumnNames.add("Project Id");
    headerColumnNames.add("Parent Project Id");
    headerColumnNames.add("Project Name");
    headerColumnNames.add("Run Id");
    headerColumnNames.add("Run Name");
    headerColumnNames.add("Start Date");
    headerColumnNames.add("End Date");
    headerColumnNames.add("Period");
    headerColumnNames.add("Step Work Id");
    headerColumnNames.add("Step Title");
    headerColumnNames.add("Step Type");
    headerColumnNames.add("Step Prompt");
    headerColumnNames.add("Node Id");
    headerColumnNames.add("Start Time");
    headerColumnNames.add("End Time");
    headerColumnNames.add("Time Spent (in seconds)");
    headerColumnNames.add("Revision Number");
    headerColumnNames.add("Item Number");
    headerColumnNames.add("Custom Grading");
    headerColumnNames.add("Label Text");
    headerColumnNames.add("X Pos");
    headerColumnNames.add("Y Pos");
    headerColumnNames.add("Is Deleted");
    headerColumnNames.add("X HandleBar");
    headerColumnNames.add("Y HandleBar");
    headerColumnNames.add("New");
    headerColumnNames.add("Revised");
    headerColumnNames.add("Repositioned");
    headerColumnNames.add("Deleted False to True");
    headerColumnNames.add("Deleted True to False");

    for (int y = 0; y < headerColumnNames.size(); y++) {
      headerRow.createCell(headerColumn).setCellValue(headerColumnNames.get(y));
      headerColumn++;
    }

    for (int x = 0; x < workgroupIds.size(); x++) {
      String workgroupId = workgroupIds.get(x);
      UserInfo userInfo = vleService.getUserInfoByWorkgroupId(Long.parseLong(workgroupId));
      String periodName = workgroupIdToPeriodName.get(Integer.parseInt(workgroupId));
      String userIds = workgroupIdToUserIds.get(Integer.parseInt(workgroupId + ""));
      String[] userIdsArray = userIds.split(":");
      ArrayList<Long> userIdsList = sortUserIdsArray(userIdsArray);

      String wiseId1 = "";
      String wiseId2 = "";
      String wiseId3 = "";

      for (int z = 0; z < userIdsList.size(); z++) {
        Long wiseId = userIdsList.get(z);
        if (z == 0) {
          wiseId1 = wiseId + "";
        } else if (z == 1) {
          wiseId2 = wiseId + "";
        } else if (z == 2) {
          wiseId3 = wiseId + "";
        }
      }

      /*
       * vector to keep track of all the start time timestamps to eliminate
       * duplicate step work entries. we previously had a bug where a student
       * client would send hundreds or even thousands of post requests with
       * the same stepwork. we have resolved this bug by checking for duplicates
       * whenever a post request comes into the server but some of the previous
       * runs that experienced this bug still have the duplicate step work entries.
       */
      Vector<Timestamp> previousTimestamps = new Vector<Timestamp>();

      List<StepWork> stepWorks = vleService.getStepWorksByUserInfo(userInfo);
      JSONObject previousResponse = null;
      HashMap<String, Long> nodeIdToRevisionNumber = new HashMap<String, Long>();
      HashMap<String, JSONObject> nodeIdToPreviousResponse = new HashMap<String, JSONObject>();
      for (int z = 0; z < stepWorks.size(); z++) {
        StepWork stepWork = stepWorks.get(z);
        Timestamp visitStartTime = stepWork.getStartTime();
        Timestamp visitEndTime = stepWork.getEndTime();

        if (!previousTimestamps.contains(visitStartTime)) {
          Node node = stepWork.getNode();
          String nodeType = node.getNodeType();
          String nodeId = node.getNodeId();

          if (nodeType != null && nodeType.equals("FlashNode") && nodeId != null) {
            String stepType = nodeType.replace("Node", "");
            String data = stepWork.getData();

            try {
              JSONObject dataJSONObject = new JSONObject(data);
              JSONArray nodeStates = dataJSONObject.getJSONArray("nodeStates");

              if (nodeStates != null && nodeStates.length() > 0) {
                JSONObject nodeState = nodeStates.getJSONObject(nodeStates.length() - 1);
                JSONObject response = nodeState.getJSONObject("response");

                if (response != null) {
                  JSONArray dataArray = response.getJSONArray("data");
                  String customGrading = response.getString("customGrading");
                  Long revisionNumber = nodeIdToRevisionNumber.get(nodeId);
                  if (revisionNumber == null) {
                    revisionNumber = 1L;
                  }

                  previousResponse = nodeIdToPreviousResponse.get(nodeId);
                  for (int i = 0; i < dataArray.length(); i++) {
                    JSONObject itemLabel = dataArray.getJSONObject(i);
                    String labelText = itemLabel.getString("labelText");
                    long xPos = itemLabel.getLong("xPos");
                    long yPos = itemLabel.getLong("yPos");
                    boolean isDeleted = itemLabel.getBoolean("isDeleted");
                    long handleBarX = itemLabel.getLong("handleBarX");
                    long handleBarY = itemLabel.getLong("handleBarY");
                    Row itemRow = createRow(allWorkgroupsSheet, rowCounter++);
                    Vector<String> itemRowVector = createRowVector();

                    int columnCounter = 0;

                    Long stepWorkId = stepWork.getId();
                    String title = nodeIdToNodeTitlesMap.get(nodeId);
                    JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
                    String prompt = "";

                    if (nodeContent != null) {
                      if (nodeContent.has("prompt")) {
                        prompt = nodeContent.getString("prompt");
                      }
                    }

                    long timeSpentOnStep = 0;

                    if (visitEndTime == null || visitStartTime == null) {
                      timeSpentOnStep = -1;
                    } else {
                      /*
                       * find the difference between start and end and divide by
                       * 1000 to obtain the value in seconds
                       */
                      timeSpentOnStep = (visitEndTime.getTime() - visitStartTime.getTime()) / 1000;
                    }

                    columnCounter = setCellValueConvertStringToLong(itemRow, itemRowVector, columnCounter, workgroupId);
                    columnCounter = setCellValueConvertStringToLong(itemRow, itemRowVector, columnCounter, wiseId1);
                    columnCounter = setCellValueConvertStringToLong(itemRow, itemRowVector, columnCounter, wiseId2);
                    columnCounter = setCellValueConvertStringToLong(itemRow, itemRowVector, columnCounter, wiseId3);
                    columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, teacherLogin);
                    columnCounter = setCellValueConvertStringToLong(itemRow, itemRowVector, columnCounter, projectId);
                    columnCounter = setCellValueConvertStringToLong(itemRow, itemRowVector, columnCounter, parentProjectId);
                    columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, projectName);
                    columnCounter = setCellValueConvertStringToLong(itemRow, itemRowVector, columnCounter, runId);
                    columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, runName);
                    columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, startTime);
                    columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, endTime);
                    columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, periodName);
                    columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, stepWorkId);
                    columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, title);
                    columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, stepType);
                    columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, prompt);
                    columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, nodeId);
                    columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, timestampToFormattedString(visitStartTime));

                    if (visitEndTime != null) {
                      columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, timestampToFormattedString(visitEndTime));
                    } else {
                      columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, "");
                    }

                    if (timeSpentOnStep == -1) {
                      columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, "N/A");
                    } else {
                      columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, timeSpentOnStep);
                    }

                    columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, revisionNumber);
                    columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, i + 1);
                    columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, customGrading);
                    columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, labelText);
                    columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, xPos);
                    columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, yPos);
                    columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, Boolean.toString(isDeleted));
                    columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, handleBarX);
                    columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, handleBarY);

                    boolean isItemNew = isItemNew(itemLabel, i, previousResponse);
                    boolean isItemLabelTextRevised = isItemLabelTextRevised(itemLabel, i, previousResponse);
                    boolean isItemRepositioned = isItemRepositioned(itemLabel, i, previousResponse);
                    boolean isItemDeletedFalseToTrue = isItemDeletedFalseToTrue(itemLabel, i, previousResponse);
                    boolean isItemDeletedTrueToFalse = isItemDeletedTrueToFalse(itemLabel, i, previousResponse);

                    columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, getIntFromBoolean(isItemNew));
                    columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, getIntFromBoolean(isItemLabelTextRevised));
                    columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, getIntFromBoolean(isItemRepositioned));
                    columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, getIntFromBoolean(isItemDeletedFalseToTrue));
                    columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, getIntFromBoolean(isItemDeletedTrueToFalse));

                    writeCSV(itemRowVector);
                  }

                  if (dataArray.length() > 0) {
                    previousResponse = response;
                    nodeIdToPreviousResponse.put(nodeId, previousResponse);
                    revisionNumber++;
                    nodeIdToRevisionNumber.put(nodeId, revisionNumber);
                  }
                }
              }
            } catch (JSONException e) {
              e.printStackTrace();
            }
          } else if (exportAllWork) {
            String data = stepWork.getData();
            String stepWorkResponse = getStepWorkResponse(stepWork);

              /*
               * we will display the step work if it exists and is not for
               * SVGDrawNode because SVGDrawNode student data can sometimes
               * cause problems when Excel tries to parse the SVG student
               * data
               */
            if (stepWorkResponse.equals("") && !nodeType.equals("SVGDrawNode")) {
              try {
                JSONObject dataJSONObject = new JSONObject(data);
                JSONArray nodeStates = dataJSONObject.getJSONArray("nodeStates");

                if (nodeStates != null && nodeStates.length() > 0) {
                  JSONObject nodeState = nodeStates.getJSONObject(nodeStates.length() - 1);
                  stepWorkResponse = nodeState.toString();
                }
              } catch (JSONException e1) {
                e1.printStackTrace();
              }
            }

            /*
             * there is a bug that saves SVGDraw step data in IdeaBasket steps so we will
             * not display any student data for IdeaBasket steps
             */
            if (nodeType.equals("IdeaBasketNode")) {
              stepWorkResponse = "";
            }

            Row workRow = createRow(allWorkgroupsSheet, rowCounter++);
            Vector<String> workRowVector = createRowVector();

            int columnCounter = 0;

            Long stepWorkId = stepWork.getId();
            String title = nodeIdToNodeTitlesMap.get(nodeId);
            String stepType = nodeType.replace("Node", "");
            JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
            String prompt = getPromptFromNodeContent(nodeContent);

            long timeSpentOnStep = 0;
            if (visitEndTime == null || visitStartTime == null) {
              //set to -1 if either start or end was null so we can set the cell to N/A later
              timeSpentOnStep = -1;
            } else {
              /*
               * find the difference between start and end and divide by
               * 1000 to obtain the value in seconds
               */
              timeSpentOnStep = (visitEndTime.getTime() - visitStartTime.getTime()) / 1000;
            }

            columnCounter = setCellValueConvertStringToLong(workRow, workRowVector, columnCounter, workgroupId);
            columnCounter = setCellValueConvertStringToLong(workRow, workRowVector, columnCounter, wiseId1);
            columnCounter = setCellValueConvertStringToLong(workRow, workRowVector, columnCounter, wiseId2);
            columnCounter = setCellValueConvertStringToLong(workRow, workRowVector, columnCounter, wiseId3);

            columnCounter = setCellValue(workRow, workRowVector, columnCounter, teacherLogin);
            columnCounter = setCellValueConvertStringToLong(workRow, workRowVector, columnCounter, projectId);
            columnCounter = setCellValueConvertStringToLong(workRow, workRowVector, columnCounter, parentProjectId);
            columnCounter = setCellValue(workRow, workRowVector, columnCounter, projectName);
            columnCounter = setCellValueConvertStringToLong(workRow, workRowVector, columnCounter, runId);
            columnCounter = setCellValue(workRow, workRowVector, columnCounter, runName);
            columnCounter = setCellValue(workRow, workRowVector, columnCounter, startTime);
            columnCounter = setCellValue(workRow, workRowVector, columnCounter, endTime);

            columnCounter = setCellValue(workRow, workRowVector, columnCounter, periodName);
            columnCounter = setCellValue(workRow, workRowVector, columnCounter, stepWorkId);
            columnCounter = setCellValue(workRow, workRowVector, columnCounter, title);
            columnCounter = setCellValue(workRow, workRowVector, columnCounter, stepType);
            columnCounter = setCellValue(workRow, workRowVector, columnCounter, prompt);
            columnCounter = setCellValue(workRow, workRowVector, columnCounter, nodeId);
            columnCounter = setCellValue(workRow, workRowVector, columnCounter, timestampToFormattedString(visitStartTime));

            if (visitEndTime != null) {
              columnCounter = setCellValue(workRow, workRowVector, columnCounter, timestampToFormattedString(visitEndTime));
            } else {
              columnCounter = setCellValue(workRow, workRowVector, columnCounter, "");
            }

            if (timeSpentOnStep == -1) {
              columnCounter = setCellValue(workRow, workRowVector, columnCounter, "N/A");
            } else {
              columnCounter = setCellValue(workRow, workRowVector, columnCounter, timeSpentOnStep);
            }

            columnCounter++;
            columnCounter++;
            addEmptyElementsToVector(workRowVector, 2);

            columnCounter = setCellValue(workRow, workRowVector, columnCounter, stepWorkResponse);

            writeCSV(workRowVector);
          }

          previousTimestamps.add(visitStartTime);
        }
      }
    }
    return wb;
  }

  /**
   * Determine if the item is new
   * @param itemLabel the item label object
   * @param itemIndex the item index
   * @param previousResponse the previous student work
   * @return whether the item is new
   */
  private boolean isItemNew(JSONObject itemLabel, int itemIndex, JSONObject previousResponse) {
    boolean result = false;
    if (previousResponse == null) {
      result = true;
    } else {
      try {
        JSONArray dataArray = previousResponse.getJSONArray("data");

        /*
         * if the item index is greater than or equals to the length
         * of the previous student work data, it means this item is
         * new.
         * e.g.
         * if the previous student work data had 3 items and the item
         * index of this item we are checking is 3, it means
         * this item we are checking is new because it will be the
         * 4th element in the current student work data array
         */
        if (itemIndex >= dataArray.length()) {
          result = true;
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return result;
  }

  /**
   * Determine if the item label text was revised
   * @param itemLabel the item label object
   * @param itemIndex the item index
   * @param previousResponse the previous student work
   * @return whether the item was revised
   */
  private boolean isItemLabelTextRevised(JSONObject itemLabel, int itemIndex,
      JSONObject previousResponse) {
    boolean result = false;
    if (previousResponse != null) {
      try {
        JSONArray dataArray = previousResponse.getJSONArray("data");
        if (dataArray != null && dataArray.length() > itemIndex) {
          JSONObject previousItemLabel = dataArray.getJSONObject(itemIndex);
          if (previousItemLabel != null) {
            String previousItemLabelText = previousItemLabel.getString("labelText");
            String itemLabelText = itemLabel.getString("labelText");
            if (!itemLabelText.equals(previousItemLabelText)) {
              result = true;
            }
          }
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return result;
  }

  /**
   * Determine if the item was repositioned on the canvas
   * @param itemLabel the item label object
   * @param itemIndex the item index
   * @param previousResponse the previous student work
   * @return whether the item was repositioned on the canvas
   */
  private boolean isItemRepositioned(JSONObject itemLabel, int itemIndex,
      JSONObject previousResponse) {
    boolean result = false;
    if (previousResponse != null) {
      try {
        JSONArray dataArray = previousResponse.getJSONArray("data");
        if (dataArray != null && dataArray.length() > itemIndex) {
          JSONObject previousItemLabel = dataArray.getJSONObject(itemIndex);
          if (previousItemLabel != null) {
            long previousXPos = previousItemLabel.getLong("xPos");
            long previousYPos = previousItemLabel.getLong("yPos");
            long xPos = itemLabel.getLong("xPos");
            long yPos = itemLabel.getLong("yPos");

            if (previousXPos != xPos || previousYPos != yPos) {
              result = true;
            }
          }
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return result;
  }

  /**
   * Determine if the item isDeleted field has changed from false to true
   * @param itemLabel the item label object
   * @param itemIndex the item index
   * @param previousResponse the previous student work
   * @return whether the item was set from deleted false to true
   */
  private boolean isItemDeletedFalseToTrue(JSONObject itemLabel, int itemIndex,
      JSONObject previousResponse) {
    boolean result = false;
    if (previousResponse == null) {
      try {
        boolean isDeleted = itemLabel.getBoolean("isDeleted");
        result = isDeleted;
      } catch (JSONException e) {
        e.printStackTrace();
      }
    } else {
      try {
        JSONArray dataArray = previousResponse.getJSONArray("data");
        if (dataArray != null && dataArray.length() > itemIndex) {
          JSONObject previousItemLabel = dataArray.getJSONObject(itemIndex);
          if (previousItemLabel != null) {
            boolean previousIsDeleted = previousItemLabel.getBoolean("isDeleted");
            boolean isDeleted = itemLabel.getBoolean("isDeleted");
            if (previousIsDeleted == false && isDeleted == true) {
              result = true;
            }
          }
        } else {
          try {
            boolean isDeleted = itemLabel.getBoolean("isDeleted");
            result = isDeleted;
          } catch (JSONException e) {
            e.printStackTrace();
          }
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return result;
  }

  /**
   * Determine if the item isDeleted field has changed from true to false
   * @param itemLabel the item label object
   * @param itemIndex the item index
   * @param previousResponse the previous student work
   * @return whether the item was set from deleted true to false
   */
  private boolean isItemDeletedTrueToFalse(JSONObject itemLabel, int itemIndex,
      JSONObject previousResponse) {
    boolean result = false;
    if (previousResponse != null) {
      try {
        JSONArray dataArray = previousResponse.getJSONArray("data");
        if (dataArray != null && dataArray.length() > itemIndex) {
          JSONObject previousItemLabel = dataArray.getJSONObject(itemIndex);
          if (previousItemLabel != null) {
            boolean previousIsDeleted = previousItemLabel.getBoolean("isDeleted");
            boolean isDeleted = itemLabel.getBoolean("isDeleted");
            if (previousIsDeleted == true && isDeleted == false) {
              result = true;
            }
          }
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return result;
  }

  /**
   * Get the color name given the rgb string
   * @param rbgString e.g. "rgb(38, 84, 207)"
   * @return a string with the color name
   */
  private String getColorNameFromRBGString(String rbgString) {
    String color = "";

    if (rbgString == null) {
      //do nothing
    } else if (rbgString.equals("rgb(38, 84, 207)")) {
      color = "blue";
    } else if (rbgString.equals("rgb(0, 153, 51)")) {
      color = "green";
    } else if (rbgString.equals("rgb(204, 51, 51)")) {
      color = "red";
    } else if (rbgString.equals("rgb(204, 102, 0)")) {
      color = "orange";
    } else if (rbgString.equals("rgb(153, 102, 255)")) {
      color = "purple";
    } else if (rbgString.equals("rgb(153, 51, 51)")) {
      color = "brown";
    }
    return color;
  }

  /**
   * Get the color name from the hex string
   * @param rbgString e.g. "000000"
   * @return a string with the color name
   */
  private String getColorNameFromColorHex(String hex) {
    String color = "";
    if (hex != null) {
      hex = hex.toUpperCase();

      if (hex.equals("000000")) {
        color = "black";
      } else if (hex.equals("FFFFFF")) {
        color = "white";
      } else if (hex.equals("0000FF")) {
        color = "blue";
      } else if (hex.equals("008000")) {
        color = "green";
      } else if (hex.equals("800000")) {
        color = "maroon";
      } else if (hex.equals("000080")) {
        color = "navy";
      } else if (hex.equals("FF8C00")) {
        color = "orange";
      } else if (hex.equals("800080")) {
        color = "purple";
      } else if (hex.equals("FF0000")) {
        color = "red";
      } else if (hex.equals("008080")) {
        color = "teal";
      } else if (hex.equals("FFFF00")) {
        color = "yellow";
      }
    }
    return color;
  }

  /**
   * Get the idea basket version
   * @param projectMetaData the project meta data
   * @return the version number of the idea basket. the version
   * will be 1 if the project is using the original version of
   * the idea basket that contains static sources and icons.
   * the new version will be 2 or higher.
   */
  private int getIdeaBasketVersion(JSONObject projectMetaData) {
    //the version will be 1 if we don't find the version in the project meta data
    int version = 1;

    try {
      if (projectMetaData != null) {
        if (projectMetaData.has("tools")) {
          JSONObject tools = projectMetaData.getJSONObject("tools");
          if (tools != null) {
            if (tools.has("ideaManagerSettings")) {
              JSONObject ideaManagerSettings = tools.getJSONObject("ideaManagerSettings");
              if (ideaManagerSettings != null) {
                if (ideaManagerSettings.has("version")) {
                  String versionString = ideaManagerSettings.getString("version");
                  version = Integer.parseInt(versionString);
                }
              }
            }
          }
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return version;
  }

  /**
   * Creates an excel workbook that contains student navigation data
   * Each sheet represents one student's work. The rows in each
   * sheet are sequential so the earliest navigation data is at
   * the top and the latest navigation data is at the bottom
   *
   * @param nodeIdToNodeTitlesMap a HashMap that contains nodeId to
   * nodeTitle mappings
   * @param workgroupIds a vector of workgroup ids
   * @param runId the run id
   * @param nodeIdToNode a mapping of node id to node
   * @param nodeIdToNodeContent a mapping of node id to node content
   * @param workgroupIdToPeriodId a mapping of workgroup id to period id
   * @param teacherWorkgroupIds a list of teacher workgroup ids
   *
   * @return an excel workbook that contains the student navigation
   */
  private XSSFWorkbook getIdeaBasketsExcelExport(
    HashMap<String, String> nodeIdToNodeTitlesMap,
    Vector<String> workgroupIds,
    String runId,
    HashMap<String, JSONObject> nodeIdToNode,
    HashMap<String, JSONObject> nodeIdToNodeContent,
    HashMap<Integer, Integer> workgroupIdToPeriodId,
    List<String> teacherWorkgroupIds) {

    int ideaBasketVersion = getIdeaBasketVersion(projectMetaData);

    /**
     * The idea manager settings from the project meta data will look something
     * like this
     *
     *   "ideaManagerSettings": {
     *    "ideaTermPlural": "ideas",
     *    "ideaAttributes": [
     *        {
     *           "id": "eCE74fj87q",
     *           "allowCustom": false,
     *           "isRequired": true,
     *           "name": "Source",
     *           "type": "source",
     *           "options": [
     *               "Evidence Step",
     *               "Visualization or Model",
     *               "Movie/Video",
     *               "Everyday Observation",
     *               "School or Teacher"
     *             ]
     *        },
     *      {
     *            "id": "KuHD6rZVBm",
     *            "allowCustom": false,
     *            "isRequired": true,
     *            "name": "Water Bottle",
     *            "type": "label",
     *            "options": [
     *              "Water",
     *              "Orange Juice"
     *            ]
     *          }
     *    ],
     *    "basketTerm": "Idea Basket",
     *    "addIdeaTerm": "Add Idea",
     *    "ideaTerm": "idea",
     *    "ebTerm": "Explanation Builder",
     *    "version": "2"
     *   }
     */
    JSONObject ideaManagerSettings = null;

    JSONArray ideaAttributes = null;
    JSONArray ideaAttributeIds = new JSONArray();

    if (ideaBasketVersion > 1) {
      if (projectMetaData != null) {
        if (projectMetaData.has("tools")) {
          try {
            JSONObject tools = projectMetaData.getJSONObject("tools");
            if (tools != null) {
              if (tools.has("ideaManagerSettings")) {
                ideaManagerSettings = tools.getJSONObject("ideaManagerSettings");
                if (ideaManagerSettings != null) {
                  if (ideaManagerSettings.has("ideaAttributes")) {
                    ideaAttributes = ideaManagerSettings.getJSONArray("ideaAttributes");
                  }
                }
              }
            }
          } catch (JSONException e) {
            e.printStackTrace();
          }
        }
      }
    }

    XSSFWorkbook wb = null;
    XSSFSheet mainSheet = null;

    if (isFileTypeXLS(fileType)) {
      wb = new XSSFWorkbook();
      mainSheet = wb.createSheet();
    }

    int rowCounter = 0;
    int columnCounter = 0;

    Vector<String> headerFields = new Vector<String>();
    headerFields.add("Is Basket Public");
    headerFields.add("Basket Revision");
    headerFields.add("Action");
    headerFields.add("Action Performer");
    headerFields.add("Changed Idea Id");
    headerFields.add("Changed Idea Workgroup Id");
    headerFields.add("Idea Id");
    headerFields.add("Idea Workgroup Id");
    headerFields.add("Idea Text");

    if (ideaBasketVersion == 1) {
      headerFields.add("Flag");
      headerFields.add("Tags");
      headerFields.add("Source");
    } else {
      if (ideaAttributes != null) {
        for (int x = 0; x < ideaAttributes.length(); x++) {
          try {
            JSONObject ideaAttribute = ideaAttributes.getJSONObject(x);

            if (ideaAttribute.has("name")) {
              String ideaAttributeName = ideaAttribute.getString("name");
              headerFields.add(ideaAttributeName);
              String ideaAttributeId = ideaAttribute.getString("id");
              ideaAttributeIds.put(ideaAttributeId);
            }
          } catch (JSONException e) {
            e.printStackTrace();
          }
        }
      }
    }

    headerFields.add("Node Type");
    headerFields.add("Node Id Created On");
    headerFields.add("Node Name Created On");
    headerFields.add("Steps Used In Count");
    headerFields.add("Steps Used In");
    headerFields.add("Was Copied From Public");
    headerFields.add("Is Published To Public");
    headerFields.add("Times Copied");
    headerFields.add("Workgroup Ids That Have Copied");
    headerFields.add("Trash");
    headerFields.add("Timestamp Basket Saved (Server Clock)");
    headerFields.add("Timestamp Idea Created (Student Clock)");
    headerFields.add("Timestamp Idea Last Edited (Student Clock)");
    headerFields.add("New");
    headerFields.add("Copied From Public In This Revision");
    headerFields.add("Revised");
    headerFields.add("Repositioned");
    headerFields.add("Steps Used In Changed");
    headerFields.add("Deleted In This Revision");
    headerFields.add("Restored In This Revision");
    headerFields.add("Made Public");
    headerFields.add("Made Private");
    headerFields.add("Copied In This Revision");
    headerFields.add("Uncopied In This Revision");

    int headerColumn = 0;

    //output the user header rows such as workgroup id, wise id 1, etc.
    Row headerRow = createRow(mainSheet, rowCounter++);
    Vector<String> headerRowVector = createRowVector();
    columnCounter = createUserDataHeaderRow(headerColumn, headerRow, headerRowVector, true, true);

    for (int x = 0; x < headerFields.size(); x++) {
      columnCounter = setCellValue(headerRow, headerRowVector, columnCounter, headerFields.get(x));
    }
    writeCSV(headerRowVector);

    /*
     * get all the idea basket revisions for this run. all the revisions
     * for a workgroup are ordered chronologically and all the basket
     * revisions for a workgroup are grouped together
     * e.g.
     *
     * list[0] = workgroup1, basket revision 1
     * list[1] = workgroup1, basket revision 2
     * list[2] = workgroup1, basket revision 3
     * list[3] = workgroup2, basket revision 1
     * list[4] = workgroup2, basket revision 2
     * etc.
     */
    List<IdeaBasket> ideaBasketRevisions = vleService.getIdeaBasketsForRunId(new Long(runId));

    /*
     * used for comparing basket revisions. we need to make sure we are
     * comparing a basket revision for the same workgroup since these
     * idea basket revisions are all in the list one after the other
     */
    long previousWorkgroupId = -2;

    int basketRevision = 1;

    JSONObject previousIdeaBasketJSON = null;

    DateFormat dateTimeInstance = DateFormat.getDateTimeInstance();

    for (int x = 0; x < ideaBasketRevisions.size(); x++) {
      IdeaBasket ideaBasket = ideaBasketRevisions.get(x);
      long workgroupId = ideaBasket.getWorkgroupId();

      if (workgroupId == previousWorkgroupId) {
        /*
         * previous basket revision was for the same workgroup so
         * we will increment the basket revision counter
         */
        basketRevision++;
      } else {
        /*
         * previous basket revision was for a different workgroup
         * so we will reset these values
         */
        previousWorkgroupId = -2L;
        basketRevision = 1;
        previousIdeaBasketJSON = null;
      }

      String data = ideaBasket.getData();

      if (data != null) {
        JSONObject ideaBasketJSON = new JSONObject();
        try {
          ideaBasketJSON = new JSONObject(data);

          JSONArray ideas = ideaBasketJSON.getJSONArray("ideas");
          for (int ideasCounter = 0; ideasCounter < ideas.length(); ideasCounter++) {
            JSONObject idea = ideas.getJSONObject(ideasCounter);
            rowCounter = createIdeaBasketRow(mainSheet, dateTimeInstance, nodeIdToNodeTitlesMap, ideaBasket, ideaAttributeIds, rowCounter, workgroupId, basketRevision, ideaBasketVersion, ideaBasketJSON, idea, previousIdeaBasketJSON);
          }

          JSONArray deleted = ideaBasketJSON.getJSONArray("deleted");
          for (int deletedCounter = 0; deletedCounter < deleted.length(); deletedCounter++) {
            JSONObject deletedIdea = deleted.getJSONObject(deletedCounter);
            rowCounter = createIdeaBasketRow(mainSheet, dateTimeInstance, nodeIdToNodeTitlesMap, ideaBasket, ideaAttributeIds, rowCounter, workgroupId, basketRevision, ideaBasketVersion, ideaBasketJSON, deletedIdea, previousIdeaBasketJSON);
          }

          /*
           * remember the workgroupid and basket so we can
           * compare them to the next revision
           */
          previousWorkgroupId = workgroupId;
          previousIdeaBasketJSON = ideaBasketJSON;

          if (ideaBasket.isPublic() != null && ideaBasket.isPublic() && ideas.length() == 0 && deleted.length() == 0) {
            /*
             * the first public idea basket revision will be empty so we have
             * skipped it and now need to decrement the counter to set it back to 1
             */
            basketRevision--;
          }
        } catch (JSONException e1) {
          e1.printStackTrace();
        }
      }
    }
    return wb;
  }

  /**
   * Create the row for an idea basket
   *
   * @param mainSheet the excel sheet
   * @param dateTimeInstance the object used to pretty print dates
   * @param nodeIdToNodeTitlesMap contains mappings between node id and node titles
   * @param ideaBasket the idea basket
   * @param ideaAttributeIds  the idea attribute ids
   * @param rowCounter the row counter
   * @param workgroupId the workgroup id
   * @param basketRevision the revision number for this basket
   * @param ideaBasketVersion the version of the basket (1 or 2)
   * @param ideaBasketJSON the basket contents
   * @param idea the idea we are displaying on this row
   * @param previousIdeaBasketJSON the contents of the previous revision of the basket
   * used for comparison purposes
   *
   * @return the row counter
   */
  private int createIdeaBasketRow(XSSFSheet mainSheet, DateFormat dateTimeInstance, HashMap<String, String> nodeIdToNodeTitlesMap,
                                  IdeaBasket ideaBasket, JSONArray ideaAttributeIds, int rowCounter, long workgroupId, int basketRevision,
                                  int ideaBasketVersion, JSONObject ideaBasketJSON, JSONObject idea, JSONObject previousIdeaBasketJSON) {
    //each idea gets its own row so we will start at column 0
    int columnCounter = 0;

    try {
      if (idea != null) {
        Integer ideaId = idea.getInt("id");

        Integer ideaWorkgroupId = null;
        if (idea.has("workgroupId")) {
          try {
            ideaWorkgroupId = idea.getInt("workgroupId");
          } catch(JSONException e) {
            ideaWorkgroupId = null;
          }
        }

        Row ideaBasketRow = createRow(mainSheet, rowCounter++);
        Vector<String> ideaBasketRowVector = createRowVector();

        String periodName = null;
        Long periodId = ideaBasket.getPeriodId();

        if (periodId != null) {
          periodName = periodIdToPeriodName.get(periodId.intValue());
        }

        //WorkgrupId, Wise Id 1, Wise Id 2, Wise Id 3, Class Period
        columnCounter = createUserDataRow(columnCounter, ideaBasketRow, ideaBasketRowVector, workgroupId + "", true, true, periodName);

        Boolean isPublic = ideaBasket.isPublic();
        if (isPublic == null) {
          columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(false));
        } else {
          columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(isPublic));
        }

        columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, basketRevision);

        String action = ideaBasket.getAction();
        if (action == null) {
          columnCounter++;
          addEmptyElementsToVector(ideaBasketRowVector, 1);
        } else {
          columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, action);
        }

        Long actionPerformer = ideaBasket.getActionPerformer();
        if (actionPerformer == null) {
          columnCounter++;
          addEmptyElementsToVector(ideaBasketRowVector, 1);
        } else {
          columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, actionPerformer);
        }

        Long changedIdeaId = ideaBasket.getIdeaId();
        if (changedIdeaId == null) {
          columnCounter++;
          addEmptyElementsToVector(ideaBasketRowVector, 1);
        } else {
          columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, changedIdeaId);
        }

        Long changedIdeaWorkgroupId = ideaBasket.getIdeaWorkgroupId();
        if (changedIdeaWorkgroupId == null) {
          columnCounter++;
          addEmptyElementsToVector(ideaBasketRowVector, 1);
        } else {
          columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, changedIdeaWorkgroupId);
        }

        if (ideaId == null) {
          columnCounter++;
          addEmptyElementsToVector(ideaBasketRowVector, 1);
        } else {
          columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, ideaId);
        }

        if (ideaWorkgroupId == null) {
          columnCounter++;
          addEmptyElementsToVector(ideaBasketRowVector, 1);
        } else {
          columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, ideaWorkgroupId);
        }

        columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, idea.getString("text"));
        if (ideaBasketVersion == 1) {
          //this run uses the first version of the idea basket which always has flag, tags, and source

          columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, idea.getString("flag"));
          columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, idea.getString("tags"));
          columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, idea.getString("source"));
        } else {
          //this run uses the newer version of the idea basket which can have variable and authorable fields

          /*
           * loop through the attribute ids in the order that they appear in the metadata
           *
           * we want to obtain what the student entered for each of the attributes in the
           * order that they appear in the metadata. this is just in case the attributes
           * somehow get disordered in the student data (even though this is unlikely to
           * happen).
           */
          for (int idIndex = 0; idIndex < ideaAttributeIds.length(); idIndex++) {
            String attributeId = ideaAttributeIds.getString(idIndex);
            String value = getAttributeValueByAttributeId(idea, attributeId);
            columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, value);
          }
        }

        columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getNodeTypeFromIdea(idea, nodeIdToNodeContent));
        columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, idea.getString("nodeId"));
        columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, idea.getString("nodeName"));
        columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getStepsUsedInCount(idea));
        columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getStepsUsedIn(idea, nodeIdToNodeTitlesMap));

        if (idea.has("wasCopiedFromPublic")) {
          boolean wasCopiedFromPublic = idea.getBoolean("wasCopiedFromPublic");
          columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(wasCopiedFromPublic));
        } else {
          columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(false));
        }

        if (idea.has("isPublishedToPublic")) {
          boolean isPublishedToPublic = idea.getBoolean("isPublishedToPublic");
          columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(isPublishedToPublic));
        } else {
          columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(false));
        }

        if (idea.has("workgroupIdsThatHaveCopied")) {
          JSONArray workgroupIdsThatHaveCopied = idea.getJSONArray("workgroupIdsThatHaveCopied");

          int timesCopied = workgroupIdsThatHaveCopied.length();
          columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, timesCopied);

          StringBuffer workgroupIdsThatHaveCopiedStringBuffer = new StringBuffer();

          for (int workgroupIdsCopiedCounter = 0; workgroupIdsCopiedCounter < workgroupIdsThatHaveCopied.length(); workgroupIdsCopiedCounter++) {
            long workgroupIdThatHasCopied = workgroupIdsThatHaveCopied.getLong(workgroupIdsCopiedCounter);
            if (workgroupIdsThatHaveCopiedStringBuffer.length() != 0) {
              workgroupIdsThatHaveCopiedStringBuffer.append(",");
            }
            workgroupIdsThatHaveCopiedStringBuffer.append(workgroupIdThatHasCopied);
          }

          //set the workgroup ids that have copied as a comma separated string
          columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, workgroupIdsThatHaveCopiedStringBuffer.toString());
        } else {
          columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, 0);
          columnCounter++;
          addEmptyElementsToVector(ideaBasketRowVector, 1);
        }

        boolean ideaInTrash = isIdeaInTrash(ideaBasketJSON, idea);
        columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(ideaInTrash));

        Timestamp postTime = ideaBasket.getPostTime();
        long time = postTime.getTime();
        Date dateBasketSaved = new Date(time);
        String timestampBasketSaved = dateTimeInstance.format(dateBasketSaved);
        columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, timestampBasketSaved);

        long timeCreated = idea.getLong("timeCreated");
        Date dateCreated = new Date(timeCreated);
        String timestampIdeaCreated = dateTimeInstance.format(dateCreated);
        columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, timestampIdeaCreated);

        long timeLastEdited = idea.getLong("timeLastEdited");
        Date dateLastEdited = new Date(timeLastEdited);
        String timestampIdeaLastEdited = dateTimeInstance.format(dateLastEdited);
        columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, timestampIdeaLastEdited);

        boolean ideaNew = isIdeaNew(idea, previousIdeaBasketJSON);
        columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(ideaNew));

        boolean isCopiedFromPublicInThisRevision = false;
        /*
         * ideas can't be copied from the public basket directly to the public basket.
         * you can only copy an idea from the public basket to a private basket.
         */
        if (isPublic == null || isPublic == false) {
          isCopiedFromPublicInThisRevision = isCopiedFromPublicInThisRevision(idea, ideaBasketJSON, previousIdeaBasketJSON);
        }

        columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(isCopiedFromPublicInThisRevision));

        boolean ideaRevised = isIdeaRevised(idea, previousIdeaBasketJSON, ideaBasketVersion, ideaAttributeIds);
        columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(ideaRevised));

        boolean ideaPositionChanged = isIdeaPositionChanged(ideaId, ideaBasketJSON, previousIdeaBasketJSON);
        columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(ideaPositionChanged));

        boolean stepsUsedInChanged = isStepsUsedInChanged(idea, previousIdeaBasketJSON, nodeIdToNodeTitlesMap);
        columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(stepsUsedInChanged));

        boolean ideaDeletedInThisRevision = isIdeaDeletedInThisRevision(idea, ideaBasketJSON, previousIdeaBasketJSON);
        columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(ideaDeletedInThisRevision));

        boolean ideaRestoredInThisRevision = isIdeaRestoredInThisRevision(idea, ideaBasketJSON, previousIdeaBasketJSON);
        columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(ideaRestoredInThisRevision));

        boolean isIdeaMadePublic = isIdeaMadePublic(idea, ideaBasketJSON, previousIdeaBasketJSON);
        columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(isIdeaMadePublic));

        boolean isIdeaMadePrivate = isIdeaMadePrivate(idea, ideaBasketJSON, previousIdeaBasketJSON);
        columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(isIdeaMadePrivate));

        boolean isCopiedInThisRevision = false;
        if (isCopiedFromPublicInThisRevision) {
          /*
           * the idea was copied from the public basket which
           * may have entries in the workgroupIdsThatHaveCopied
           * array which would cause isCopiedInThisRevision to
           * be true when it should be false
           */
          isCopiedInThisRevision = false;
        } else {
          isCopiedInThisRevision = isCopiedInThisRevision(idea, ideaBasketJSON, previousIdeaBasketJSON);
        }

        columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(isCopiedInThisRevision));

        boolean isUncopiedInThisRevision = false;
        if (isIdeaMadePublic) {
          /*
           * the idea was made public and when we make an idea public
           * we clear out the workgroupIdsThatHaveCopied array which
           * can cause isUncopiedInThisRevision to be true when
           * it should really be false
           */
          isUncopiedInThisRevision = false;
        } else {
          isUncopiedInThisRevision = isUncopiedInThisRevision(idea, ideaBasketJSON, previousIdeaBasketJSON);
        }

        columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(isUncopiedInThisRevision));

        writeCSV(ideaBasketRowVector);
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return rowCounter;
  }

  /**
   * Get the attribute from the idea given the attribute id
   *
   * @param idea the student idea
   * @param attributeId the attribute id
   *
   * @return the value of the attribute that the student entered
   */
  private String getAttributeValueByAttributeId(JSONObject idea, String attributeId) {
    String attributeValue = "";
    try {
      if (idea.has("attributes")) {
        JSONArray attributes = idea.getJSONArray("attributes");
        if (attributes != null) {
          for (int a = 0; a < attributes.length(); a++) {
            JSONObject attribute = attributes.getJSONObject(a);
            String id = attribute.getString("id");

            if (attributeId != null && id != null && attributeId.equals(id)) {
              if (attribute.has("value")) {
                attributeValue = attribute.getString("value");
              }

              /*
               * we have found the attribute with the id we were searching
               * for so we will break out of the for loop
               */
              break;
            }
          }
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return attributeValue;
  }

  /**
   * Get the idea from a basket revision by idea id
   *
   * @param ideaBasketJSON the basket revision
   * @param ideaId the id of the idea we want
   * @param workgroupId the id of the workgroup that owns the idea
   *
   * @return the idea in JSONObject form
   */
  private JSONObject getIdeaById(JSONObject ideaBasketJSON, Integer ideaId, Integer workgroupId) {
    JSONObject idea = null;
    boolean ideaFound = false;
    try {
      JSONArray ideas = ideaBasketJSON.getJSONArray("ideas");
      JSONArray deleted = ideaBasketJSON.getJSONArray("deleted");

      for (int x = ideas.length() - 1; x >= 0; x--) {
        JSONObject activeIdea = ideas.getJSONObject(x);
        Integer activeIdeaWorkgroupId = null;

        try {
          activeIdeaWorkgroupId = activeIdea.getInt("workgroupId");
        } catch(JSONException e) {
          activeIdeaWorkgroupId = null;
        }

        /*
         * check if the idea id matches the one we want. if a workgroup id
         * is passed in as a parameter we will make sure that matches too.
         */
        if (activeIdea != null && activeIdea.getInt("id") == ideaId &&
            (workgroupId == null || activeIdeaWorkgroupId == workgroupId.intValue())) {
          idea = activeIdea;
          ideaFound = true;
          break;
        }
      }

      if (!ideaFound) {
        for (int y = deleted.length() - 1; y >= 0; y--) {
          JSONObject deletedIdea = deleted.getJSONObject(y);
          Integer deletedIdeaWorkgroupId = null;

          try {
            deletedIdeaWorkgroupId = deletedIdea.getInt("workgroupId");
          } catch(JSONException e) {
            deletedIdeaWorkgroupId = null;
          }

          /*
           * check if the idea id matches the one we want. if a workgroup id
           * is passed in as a parameter we will make sure that matches too.
           */
          if (deletedIdea != null && deletedIdea.getInt("id") == ideaId &&
              (workgroupId == null || deletedIdeaWorkgroupId == workgroupId.intValue())) {
            idea = deletedIdea;
            ideaFound = true;
            break;
          }
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return idea;
  }

  /**
   * Get the number of ideas in this basket revision
   * @param ideaBasketJSON the basket revision
   * @return the number of ideas in the basket revision
   */
  private int getNumberOfIdeas(JSONObject ideaBasketJSON) {
    int numberOfIdeas = 0;
    try {
      JSONArray ideas = ideaBasketJSON.getJSONArray("ideas");
      JSONArray deleted = ideaBasketJSON.getJSONArray("deleted");

      if (ideas != null) {
        numberOfIdeas += ideas.length();
      }

      if (deleted != null) {
        numberOfIdeas += deleted.length();
      }

    } catch (JSONException e) {
      e.printStackTrace();
    }
    return numberOfIdeas;
  }

  /**
   * Determine if an idea is in the trash
   *
   * @param ideaBasketJSON the basket revision
   * @param ideaId the id of the idea
   *
   * @return whether the idea is in the trash or not
   */
  private boolean isIdeaInTrash(JSONObject ideaBasketJSON, JSONObject idea) {
    boolean ideaInTrash = false;
    boolean ideaFound = false;

    try {
      if (ideaBasketJSON != null) {
        int ideaId = idea.getInt("id");
        Integer workgroupId = null;

        if (idea.has("workgroupId")) {
          try {
            workgroupId = idea.getInt("workgroupId");
          } catch(JSONException e) {
            workgroupId = null;
          }
        }

        JSONArray ideas = ideaBasketJSON.getJSONArray("ideas");
        JSONArray deleted = ideaBasketJSON.getJSONArray("deleted");

        for (int x = ideas.length() - 1; x >= 0; x--) {
          JSONObject activeIdea = ideas.getJSONObject(x);
          Integer activeIdeaWorkgroupId = null;
          try {
            activeIdeaWorkgroupId = activeIdea.getInt("workgroupId");
          } catch(JSONException e) {
            activeIdeaWorkgroupId = null;
          }

          /*
           * check if the idea id matches the one we want. if a workgroup id
           * is passed in as a parameter we will make sure that matches too.
           */
          if (activeIdea != null && activeIdea.getInt("id") == ideaId &&
              (workgroupId == null || activeIdeaWorkgroupId == workgroupId.intValue())) {
            idea = activeIdea;
            ideaFound = true;
            break;
          }
        }

        if (!ideaFound) {
          for (int y = deleted.length() - 1; y >= 0; y--) {
            JSONObject deletedIdea = deleted.getJSONObject(y);
            Integer deletedIdeaWorkgroupId = null;
            try {
              deletedIdeaWorkgroupId = deletedIdea.getInt("workgroupId");
            } catch(JSONException e) {
              deletedIdeaWorkgroupId = null;
            }

            /*
             * check if the idea id matches the one we want. if a workgroup id
             * is passed in as a parameter we will make sure that matches too.
             */
            if (deletedIdea != null && deletedIdea.getInt("id") == ideaId &&
              (workgroupId == null || deletedIdeaWorkgroupId == workgroupId)) {
              idea = deletedIdea;
              ideaInTrash = true;
              ideaFound = true;
              break;
            }
          }
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return ideaInTrash;
  }

  /**
   * Determine if the idea is new and added in the current revision
   * @param idea the idea
   * @param previousIdeaBasket the previous basket revision
   * @return whether the idea is new
   */
  private boolean isIdeaNew(JSONObject idea, JSONObject previousIdeaBasket) {
    boolean ideaNew = false;
    try {
      if (previousIdeaBasket == null) {
        ideaNew = true;
      } else {
        int ideaId = idea.getInt("id");
        Integer workgroupId = null;
        if (idea.has("workgroupId")) {
          try {
            workgroupId = idea.getInt("workgroupId");
          } catch(JSONException e) {
            workgroupId = null;
          }
        }

        JSONObject previousIdeaRevision = getIdeaById(previousIdeaBasket, ideaId, workgroupId);
        if (previousIdeaRevision == null) {
          /*
           * we did not find the idea in the previous basket revision
           * so the idea is new
           */
          ideaNew = true;
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return ideaNew;
  }

  /**
   * Determine if the idea was revised
   * @param idea the idea
   * @param previousIdeaBasket the previous basket revision
   * @return whether the ideas was revised or not
   */
  private boolean isIdeaRevised(JSONObject idea, JSONObject previousIdeaBasket, int ideaBasketVersion, JSONArray ideaAttributeIds) {
    boolean ideaRevised = false;
    try {
      if (previousIdeaBasket != null) {
        int ideaId = idea.getInt("id");
        Integer workgroupId = null;
        if (idea.has("workgroupId")) {
          try {
            workgroupId = idea.getInt("workgroupId");
          } catch(JSONException e) {
            workgroupId = null;
          }
        }

        JSONObject previousIdeaRevision = getIdeaById(previousIdeaBasket, ideaId, workgroupId);
        if (previousIdeaRevision != null) {
          long timeLastEdited = idea.getLong("timeLastEdited");
          long previousTimeLastEdited = previousIdeaRevision.getLong("timeLastEdited");
          if (timeLastEdited != previousTimeLastEdited) {
            ideaRevised = true;
          }

          if (ideaBasketVersion == 1) {
            String text = idea.getString("text");
            String previousText = previousIdeaRevision.getString("text");

            if (text != null && !text.equals(previousText)) {
              ideaRevised = true;
            }

            String flag = idea.getString("flag");
            String previousFlag = previousIdeaRevision.getString("flag");

            if (flag != null && !flag.equals(previousFlag)) {
              ideaRevised = true;
            }

            String tags = idea.getString("tags");
            String previousTags = previousIdeaRevision.getString("tags");

            if (tags != null && !tags.equals(previousTags)) {
              ideaRevised = true;
            }

            String source = idea.getString("source");
            String previousSource = previousIdeaRevision.getString("source");

            if (source != null && !source.equals(previousSource)) {
              ideaRevised = true;
            }
          } else {
            String text = idea.getString("text");
            String previousText = previousIdeaRevision.getString("text");

            if (text != null && !text.equals(previousText)) {
              ideaRevised = true;
            }

            if (ideaAttributeIds != null) {
              for (int x = 0; x < ideaAttributeIds.length(); x++) {
                String attributeId = ideaAttributeIds.getString(x);
                String currentValue = getAttributeValueByAttributeId(idea, attributeId);
                String previousValue = getAttributeValueByAttributeId(previousIdeaRevision, attributeId);
                if (currentValue != null && !currentValue.equals(previousValue)) {
                  ideaRevised = true;
                }
              }
            }
          }
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return ideaRevised;
  }

  /**
   * Determine whether the position of an idea has changed
   * @param ideaId the id of the idea
   * @param currentIdeaBasket the current basket revision
   * @param previousIdeaBasket the previous basket revision
   * @return whether the position of the idea has changed
   */
  private boolean isIdeaPositionChanged(int ideaId, JSONObject currentIdeaBasket, JSONObject previousIdeaBasket) {
    boolean ideaPositionChanged = false;

    int currentPositionInIdeas = -1;
    int currentPositionInDeleted = -1;

    int previousPositionInIdeas = -1;
    int previousPositionInDeleted = -1;

    //try to find the idea in the ideas array or deleted array of the previous basket revision
    previousPositionInIdeas = getPositionInIdeas(ideaId, previousIdeaBasket);
    previousPositionInDeleted = getPositionInDeleted(ideaId, previousIdeaBasket);


    if (previousPositionInIdeas == -1 && previousPositionInDeleted == -1) {
      /*
       * idea was not in previous revision of idea basket which means
       * it is new in the current revision. in this case we will return
       * position changed as false
       */
    } else {
      //try to find the position of the idea in the ideas array of the current basket revision
      currentPositionInIdeas = getPositionInIdeas(ideaId, currentIdeaBasket);

      if (currentPositionInIdeas == -1) {
        //we did not find it in the ideas array so we will look in the deleted array
        currentPositionInDeleted = getPositionInDeleted(ideaId, currentIdeaBasket);
      }

      if (currentPositionInIdeas != -1 && previousPositionInIdeas != -1) {
        //the idea is in the ideas array of current and previous basket revisions
        if (currentPositionInIdeas != previousPositionInIdeas) {
          ideaPositionChanged = true;
        }
      } else if (currentPositionInDeleted != -1 && previousPositionInDeleted != -1) {
        //the idea is in the deleted array of current and previous basket revisions
        if (currentPositionInDeleted != previousPositionInDeleted) {
          ideaPositionChanged = true;
        }
      } else if (currentPositionInIdeas != -1 && previousPositionInDeleted != -1) {
        /*
         * the idea is in the ideas array of the current basket revision
         * and in the deleted array of the previous basket revision
         */
        ideaPositionChanged = true;
      } else if (currentPositionInDeleted != -1 && previousPositionInIdeas != -1) {
        /*
         * the idea is in the deleted array of the current basket revision
         * and in the ideas array of the previous basket revision
         */
        ideaPositionChanged = true;
      }
    }
    return ideaPositionChanged;
  }

  /**
   * Determine whether the idea was put into the trash in this revision
   * @param idea the idea JSONObject
   * @param currentIdeaBasket the current basket revision
   * @param previousIdeaBasket the previous basket revision
   * @return whether the idea was put into the trash in this revision
   */
  private boolean isIdeaDeletedInThisRevision(JSONObject idea, JSONObject currentIdeaBasket, JSONObject previousIdeaBasket) {
    boolean ideaDeleted = false;
    boolean ideaInCurrentTrash = isIdeaInTrash(currentIdeaBasket, idea);
    boolean ideaInPreviousTrash = isIdeaInTrash(previousIdeaBasket, idea);
    if (!ideaInPreviousTrash && ideaInCurrentTrash) {
      ideaDeleted = true;
    }
    return ideaDeleted;
  }

  /**
   * Determine whether the idea was taken out of the trash in this revision
   * @param idea the idea JSONObject
   * @param currentIdeaBasket the current basket revision
   * @param previousIdeaBasket the previous basket revision
   * @return whether the idea was taken out of the trash in this revision
   */
  private boolean isIdeaRestoredInThisRevision(JSONObject idea, JSONObject currentIdeaBasket, JSONObject previousIdeaBasket) {
    boolean ideaRestored = false;

    boolean ideaInCurrentTrash = isIdeaInTrash(currentIdeaBasket, idea);
    boolean ideaInPreviousTrash = isIdeaInTrash(previousIdeaBasket, idea);
    if (ideaInPreviousTrash && !ideaInCurrentTrash) {
      ideaRestored = true;
    }
    return ideaRestored;
  }

  /**
   * Determine if the idea was made public in this basket revision
   * @param idea the idea JSONObject
   * @param currentIdeaBasket the current idea basket
   * @param previousIdeaBasket the previous idea basket revision
   * @return whether the idea was made public in this basket revision
   */
  private boolean isIdeaMadePublic(JSONObject idea, JSONObject currentIdeaBasket, JSONObject previousIdeaBasket) {
    boolean isIdeaMadePublic = false;
    if (idea != null) {
      try {
        /*
         * make sure the idea has an id, workgroup id, and is published to public fields.
         * if it does not have all these fields it can't have been published to public.
         */
        if (idea.has("id") && idea.has("workgroupId") && idea.has("isPublishedToPublic")) {
          Integer ideaId = idea.getInt("id");
          Integer workgroupId = null;

          try {
            workgroupId = idea.getInt("workgroupId");
          } catch(JSONException e) {
            workgroupId = null;
          }

          boolean isPublishedToPublic = idea.getBoolean("isPublishedToPublic");
          if (previousIdeaBasket != null) {
            JSONObject previousIdeaRevision = getIdeaById(previousIdeaBasket, ideaId, workgroupId);
            if (previousIdeaRevision == null) {
              /*
               * the idea was not in the previous basket revision so
               * we will just use the isPublishedToPublic value
               */
              isIdeaMadePublic = isPublishedToPublic;
            } else {
              if (previousIdeaRevision.has("isPublishedToPublic")) {
                boolean isPreviousPublishedToPublic = previousIdeaRevision.getBoolean("isPublishedToPublic");
                if (isPublishedToPublic && !isPreviousPublishedToPublic) {
                  /*
                   * the value of isPublishedToPublic was false but is
                   * now true so it was made public in this revision
                   */
                  isIdeaMadePublic = true;
                }
              } else {
                isIdeaMadePublic = isPublishedToPublic;
              }
            }
          } else {
            /*
             * there was no previous basket revision so we will just use
             * the isPublishedToPublic value
             */
            isIdeaMadePublic = isPublishedToPublic;
          }
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return isIdeaMadePublic;
  }

  /**
   * Determine if the idea was made private in this basket revision
   * @param idea the idea JSONObject
   * @param currentIdeaBasket the current idea basket
   * @param previousIdeaBasket the previous idea basket revision
   * @return whether the idea was made private in this basket revision
   */
  private boolean isIdeaMadePrivate(JSONObject idea, JSONObject currentIdeaBasket, JSONObject previousIdeaBasket) {
    boolean isIdeaMadePrivate = false;

    if (idea != null) {
      try {
        /*
         * make sure the idea has an id, workgroup id, and is published to public fields.
         * if it does not have all these fields it can't have been published to public.
         */
        if (idea.has("id") && idea.has("workgroupId") && idea.has("isPublishedToPublic")) {
          Integer ideaId = idea.getInt("id");
          Integer workgroupId = null;

          try {
            workgroupId = idea.getInt("workgroupId");
          } catch(JSONException e) {
            workgroupId = null;
          }

          boolean isPublishedToPublic = idea.getBoolean("isPublishedToPublic");
          boolean isPrivate = !isPublishedToPublic;

          if (previousIdeaBasket != null) {
            JSONObject previousIdeaRevision = getIdeaById(previousIdeaBasket, ideaId, workgroupId);
            if (previousIdeaRevision == null) {
              isIdeaMadePrivate = false;
            } else {
              if (previousIdeaRevision.has("isPublishedToPublic")) {
                boolean isPreviousPublishedToPublic = previousIdeaRevision.getBoolean("isPublishedToPublic");
                boolean isPreviousPrivate = !isPreviousPublishedToPublic;

                if (isPrivate && !isPreviousPrivate) {
                  /*
                   * the idea was previously public but is now private
                   */
                  isIdeaMadePrivate = true;
                }
              } else {
                /*
                 * the previous idea revision does not have the isPublishedToPublic
                 * field so it is impossible for the idea to have been public
                 * and made private for this revision
                 */
                isIdeaMadePrivate = false;
              }
            }
          } else {
            /*
             * there was no previous basket revision and all ideas are
             * initially private so it is impossible for the idea
             * to have been public and made private in this revision
             */
            isIdeaMadePrivate = false;
          }
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return isIdeaMadePrivate;
  }

  /**
   * Determine if the idea was was copied from the public basket in this basket revision
   * @param idea the idea JSONObject
   * @param currentIdeaBasket the current idea basket
   * @param previousIdeaBasket the previous idea basket revision
   * @return whether the idea was copied from the public basket in this basket revision
   */
  private boolean isCopiedFromPublicInThisRevision(JSONObject idea, JSONObject currentIdeaBasket, JSONObject previousIdeaBasket) {
    boolean isCopiedFromPublicInThisRevision = false;

    if (idea != null) {
      try {
        /*
         * make sure the idea has an id, workgroup id, and was copied from public fields.
         * if it does not have all these fields it can't have been copied from public.
         */
        if (idea.has("id") && idea.has("workgroupId") && idea.has("wasCopiedFromPublic")) {
          Integer ideaId = idea.getInt("id");
          Integer workgroupId = null;

          try {
            workgroupId = idea.getInt("workgroupId");
          } catch(JSONException e) {
            workgroupId = null;
          }

          boolean wasCopiedFromPublic = idea.getBoolean("wasCopiedFromPublic");

          if (previousIdeaBasket != null) {
            JSONObject previousIdeaRevision = getIdeaById(previousIdeaBasket, ideaId, workgroupId);
            if (previousIdeaRevision == null) {
              /*
               * the idea was not in the previous basket revision so
               * we will just use the wasCopiedFromPublic value
               */
              isCopiedFromPublicInThisRevision = wasCopiedFromPublic;
            } else {
              if (previousIdeaRevision.has("wasCopiedFromPublic")) {
                boolean isPreviousPublishedToPublic = previousIdeaRevision.getBoolean("wasCopiedFromPublic");

                if (wasCopiedFromPublic && !isPreviousPublishedToPublic) {
                  /*
                   * the value of wasCopiedFromPublic was false but is
                   * now true so it was copied from public in this revision
                   */
                  isCopiedFromPublicInThisRevision = true;
                }
              } else {
                /*
                 * the previous revision did not have a wasCopiedFromPublic
                 * field so we will just use the wasCopiedFromPublic field
                 * from the current revision
                 */
                isCopiedFromPublicInThisRevision = wasCopiedFromPublic;
              }
            }
          } else {
            /*
             * there was no previous basket revision so we will just use
             * the wasCopiedFromPublic value
             */
            isCopiedFromPublicInThisRevision = wasCopiedFromPublic;
          }
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return isCopiedFromPublicInThisRevision;
  }

  /**
   * Determine if the idea was copied by someone in this basket revision
   * @param idea the idea JSONObject
   * @param currentIdeaBasket the current idea basket
   * @param previousIdeaBasket the previous idea basket revision
   * @return whether the idea was copied by someone in this basket revision
   */
  private boolean isCopiedInThisRevision(JSONObject idea, JSONObject currentIdeaBasket, JSONObject previousIdeaBasket) {
    boolean isCopiedInThisRevision = false;

    if (idea != null) {
      try {
        /*
         * make sure the idea has an id, workgroup id, and workgroupIdsThatHaveCopied fields.
         * if it does not have all these fields it can't have been copied.
         */
        if (idea.has("id") && idea.has("workgroupId") && idea.has("workgroupIdsThatHaveCopied")) {
          Integer ideaId = idea.getInt("id");
          Integer workgroupId = null;

          try {
            workgroupId = idea.getInt("workgroupId");
          } catch(JSONException e) {
            workgroupId = null;
          }

          JSONArray workgroupIdsThatHaveCopied = idea.getJSONArray("workgroupIdsThatHaveCopied");
          int workgroupIdsThatHaveCopiedCount = workgroupIdsThatHaveCopied.length();

          if (previousIdeaBasket != null) {
            JSONObject previousIdeaRevision = getIdeaById(previousIdeaBasket, ideaId, workgroupId);
            if (previousIdeaRevision == null) {
              /*
               * the idea was not in the previous basket revision so
               * we will just check if the current copied count is greater
               * than 0
               */
              if (workgroupIdsThatHaveCopiedCount > 0) {
                isCopiedInThisRevision = true;
              }
            } else {
              if (previousIdeaRevision.has("workgroupIdsThatHaveCopied")) {
                JSONArray previousWorkgroupIdsThatHaveCopied = previousIdeaRevision.getJSONArray("workgroupIdsThatHaveCopied");
                int previousWorkgroupIdsThatHaveCopiedCount = previousWorkgroupIdsThatHaveCopied.length();

                if (workgroupIdsThatHaveCopiedCount == previousWorkgroupIdsThatHaveCopiedCount + 1) {
                  /*
                   * the current copied count is one more than the previous copied
                   * count which means the idea was copied by someone in this
                   * revision
                   */
                  isCopiedInThisRevision = true;
                }
              } else {
                /*
                 * the previous revision did not have a workgroupIdsThatHaveCopied
                 * field so we will just check if the current copied count is
                 * greater than 0
                 */
                if (workgroupIdsThatHaveCopiedCount > 0) {
                  isCopiedInThisRevision = true;
                }
              }
            }
          } else {
            /*
             * there was no previous basket revision so we will
             * just check if the current copied count is greater
             * than 0
             */
            if (workgroupIdsThatHaveCopiedCount > 0) {
              isCopiedInThisRevision = true;
            }
          }
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return isCopiedInThisRevision;
  }

  /**
   * Determine if the idea was uncopied by someone in this basket revision
   * @param idea the idea JSONObject
   * @param currentIdeaBasket the current idea basket
   * @param previousIdeaBasket the previous idea basket revision
   * @return whether the idea was uncopied by someone in this basket revision
   */
  private boolean isUncopiedInThisRevision(JSONObject idea, JSONObject currentIdeaBasket, JSONObject previousIdeaBasket) {
    boolean isUncopiedInThisRevision = false;

    if (idea != null) {
      try {
        /*
         * make sure the idea has an id, workgroup id, and workgroupIdsThatHaveCopied fields.
         * if it does not have all these fields it can't have been uncopied.
         */
        if (idea.has("id") && idea.has("workgroupId") && idea.has("workgroupIdsThatHaveCopied")) {
          Integer ideaId = idea.getInt("id");
          Integer workgroupId = null;

          try {
            workgroupId = idea.getInt("workgroupId");
          } catch(JSONException e) {
            workgroupId = null;
          }

          JSONArray workgroupIdsThatHaveCopied = idea.getJSONArray("workgroupIdsThatHaveCopied");
          int workgroupIdsThatHaveCopiedCount = workgroupIdsThatHaveCopied.length();

          if (previousIdeaBasket != null) {
            JSONObject previousIdeaRevision = getIdeaById(previousIdeaBasket, ideaId, workgroupId);

            if (previousIdeaRevision != null && previousIdeaRevision.has("workgroupIdsThatHaveCopied")) {
              JSONArray previousWorkgroupIdsThatHaveCopied = previousIdeaRevision.getJSONArray("workgroupIdsThatHaveCopied");
              int previousWorkgroupIdsThatHaveCopiedCount = previousWorkgroupIdsThatHaveCopied.length();

              if (workgroupIdsThatHaveCopiedCount == previousWorkgroupIdsThatHaveCopiedCount - 1) {
                /*
                 * the current copied count is one less than the previous copied
                 * count which means the idea was uncopied by someone in this
                 * revision
                 */
                isUncopiedInThisRevision = true;
              }
            }
          }
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return isUncopiedInThisRevision;
  }

  /**
   * Get the position in the ideas array
   * @param ideaId the id of the idea
   * @param ideaBasket the basket revision
   * @return the position of the idea in the ideas array, first position is 1,
   * if the idea is not found it will return -1
   */
  private int getPositionInIdeas(int ideaId, JSONObject ideaBasket) {
    return getPosition(ideaId, ideaBasket, "ideas");
  }

  /**
   * Get the position in the deleted array
   * @param ideaId the id of the idea
   * @param ideaBasket the basket revision
   * @return the position of the idea in the deleted array, first position is 1,
   * if the idea is not found it will return -1
   */
  private int getPositionInDeleted(int ideaId, JSONObject ideaBasket) {
    return getPosition(ideaId, ideaBasket, "deleted");
  }

  /**
   * Get the position in the given array
   * @param ideaId the id of the idea
   * @param ideaBasket the basket revision
   * @param arrayName the name of the array to look in ("ideas" or "deleted")
   * @return the position of the idea in the given array, first position is 1,
   * if the idea is not found it will return -1
   */
  private int getPosition(int ideaId, JSONObject ideaBasket, String arrayName) {
    int position = -1;

    try {
      if (ideaBasket != null) {
        JSONArray ideaArray = ideaBasket.getJSONArray(arrayName);
        if (ideaArray != null) {
          for (int x = 0; x < ideaArray.length(); x++) {
            JSONObject idea = ideaArray.getJSONObject(x);
            int id = idea.getInt("id");
            if (ideaId == id) {
              position = x + 1;
              break;
            }
          }
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return position;
  }

  /**
   * Get the steps that this idea is used in
   * @param idea the idea
   * @param nodeIdToNodeTitlesMap a map of nodeId to nodeTitle
   * @return a String containing the steps that the idea is used in
   * e.g. node_1.ht:Introduction,node_3.or:Explain your ideas
   */
  private String getStepsUsedIn(JSONObject idea, HashMap<String, String> nodeIdToNodeTitlesMap) {
    StringBuffer stepsUsedIn = new StringBuffer();
    try {
      JSONArray stepsUsedInJSONArray = idea.getJSONArray("stepsUsedIn");
      if (stepsUsedInJSONArray != null) {
        for (int x = 0; x < stepsUsedInJSONArray.length(); x++) {
          String nodeId = stepsUsedInJSONArray.getString(x);
          String nodeName = nodeIdToNodeTitlesMap.get(nodeId);
          if (stepsUsedIn.length() != 0) {
            stepsUsedIn.append(",");
          }
          stepsUsedIn.append(nodeId + ":" + nodeName);
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return stepsUsedIn.toString();
  }

  /**
   * Get the number of steps the idea is used in
   * @param idea the idea JSONObject
   * @return a count of the number of steps this idea is used in
   */
  private int getStepsUsedInCount(JSONObject idea) {
    int count = 0;
    try {
      JSONArray stepsUsedInJSONArray = idea.getJSONArray("stepsUsedIn");
      if (stepsUsedInJSONArray != null) {
        count = stepsUsedInJSONArray.length();
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return count;
  }

  /**
   * Determine whether the steps used in changed
   * @param idea the idea JSONObject
   * @param previousIdeaBasket the previous basket revision
   * @param nodeIdToNodeTitlesMap the map of node id to node title
   * @return whether the steps used in changed for the idea
   */
  private boolean isStepsUsedInChanged(JSONObject idea, JSONObject previousIdeaBasket, HashMap<String, String> nodeIdToNodeTitlesMap) {
    boolean stepsUsedInChanged = false;
    try {
      if (previousIdeaBasket != null) {
        int ideaId = idea.getInt("id");
        Integer workgroupId = null;
        if (idea.has("workgroupId")) {
          try {
            workgroupId = idea.getInt("workgroupId");
          } catch(JSONException e) {
            workgroupId = null;
          }
        }
        JSONObject previousIdeaRevision = getIdeaById(previousIdeaBasket, ideaId, workgroupId);
        if (previousIdeaRevision != null) {
          String currentStepsUsedIn = getStepsUsedIn(idea, nodeIdToNodeTitlesMap);
          String previousStepsUsedIn = getStepsUsedIn(previousIdeaRevision, nodeIdToNodeTitlesMap);
          if (currentStepsUsedIn != null && previousStepsUsedIn != null && !currentStepsUsedIn.equals(previousStepsUsedIn)) {
            stepsUsedInChanged = true;
          }
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return stepsUsedInChanged;
  }

  /**
   * Convert a boolean into an int value
   * @param boolValue true of false
   * @return 0 or 1
   */
  private int getIntFromBoolean(boolean boolValue) {
    int intValue = 0;
    if (boolValue) {
      intValue = 1;
    }
    return intValue;
  }

  /**
   * Get the node type of the step that the idea was created on
   * @param idea the idea JSONObject
   * @param nodeIdToNodeContent map of node id to node content
   * @return the node type the idea was created on
   */
  private String getNodeTypeFromIdea(JSONObject idea, HashMap<String, JSONObject> nodeIdToNodeContent) {
    String nodeType = "";
    try {
      String nodeId = idea.getString("nodeId");
      JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
      nodeType = nodeContent.getString("type");
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return nodeType;
  }

  /**
   * Get the latest annotation score value
   *
   * @param stepWorksForNodeId the StepWork objects to look at annotations for
   * @param teacherWorkgroupIds the teacher workgroup ids we want an annotation from
   *
   * @return the latest annotation score object associated with any of the StepWork
   * objects in the list and has a fromWorkgroup from any of the workgroup ids in the
   * teacherWorkgroupIds list
   */
  @SuppressWarnings("unused")
  private String getLatestAnnotationScoreByStepWork(List<StepWork> stepWorksForNodeId, List<String> teacherWorkgroupIds) {
    Annotation latestAnnotationScoreByStepWork = vleService.getLatestAnnotationScoreByStepWork(stepWorksForNodeId, teacherWorkgroupIds);
    String score = "";
    if (latestAnnotationScoreByStepWork != null) {
      try {
        String data = latestAnnotationScoreByStepWork.getData();
        JSONObject annotation = new JSONObject(data);
        score = annotation.getString("value");
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return score;
  }

  /**
   * Get the latest annotation comment value
   *
   * @param stepWorksForNodeId the StepWork objects to look at annotations for
   * @param teacherWorkgroupIds the teacher workgroup ids we want an annotation from
   *
   * @return the latest annotation comment object associated with any of the StepWork
   * objects in the list and has a fromWorkgroup from any of the workgroup ids in the
   * teacherWorkgroupIds list
   */
  @SuppressWarnings("unused")
  private String getLatestAnnotationCommentByStepWork(List<StepWork> stepWorksForNodeId, List<String> teacherWorkgroupIds) {
    Annotation latestAnnotationCommentByStepWork = vleService.getLatestAnnotationCommentByStepWork(stepWorksForNodeId, teacherWorkgroupIds);
    String comment = "";
    if (latestAnnotationCommentByStepWork != null) {
      try {
        String data = latestAnnotationCommentByStepWork.getData();
        JSONObject annotation = new JSONObject(data);
        comment = annotation.getString("value");
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return comment;
  }

  /**
   * Get the latest CRater score and timestamp and set it into the row
   *
   * @param stepWorksForNodeId the StepWork objects we want to look at
   * for the associated annotation
   * @param rowForWorkgroupId the row
   * @param workgroupColumnCounter the column index
   *
   * @return the updated column counter pointing to the next empty column
   */
  private int setLatestCRaterScoreAndTimestamp(List<StepWork> stepWorksForNodeId, Row rowForWorkgroupId, Vector<String> rowForWorkgroupIdVector, int workgroupColumnCounter) {
    /*
     * get the latest annotation associated with any of the StepWork objects
     * and have fromWorkgroup as any of the workgroup ids in teacherWorkgroupIds
     */
    Annotation latestAnnotationScoreByStepWork = vleService.getLatestCRaterScoreByStepWork(stepWorksForNodeId);

    if (latestAnnotationScoreByStepWork != null) {
      try {
        String data = latestAnnotationScoreByStepWork.getData();
        JSONObject annotationData = new JSONObject(data);

        /*
         * get the value e.g.
         * "value": [
         *     {
         *         "studentResponse": {
         *             "response": [
         *                 "animals carbon chemical dioxide energy food giving glucose heat off oxygen plants sun them to transformed vitamin warmth water"
         *             ],
         *             "timestamp": 1328317997000,
         *             "cRaterItemId": "Photo_Sun",
         *             "type": "or"
         *         },
         *         "nodeStateId": 1328317997000,
         *         "score": 3,
         *         "cRaterResponse": "<crater-results>\n  <tracking id=\"1016300\"/>\n  <client id=\"WISETEST\"/>\n  <items>\n     <item id=\"Photo_Sun\">\n        <responses>\n      <response id=\"1566085\" score=\"3\" concepts=\"1,2,3,5\"/>\n       </responses>\n     </item>\n  </items>\n</crater-results>\r"
         *     }
         * ]
         */
        JSONArray value = annotationData.getJSONArray("value");

        if (value.length() > 0) {
          JSONObject valueElement = value.getJSONObject(value.length() - 1);
          long score = valueElement.getLong("score");
          Timestamp postTime = latestAnnotationScoreByStepWork.getPostTime();
          String timestampAnnotationPostTime = timestampToFormattedString(postTime);
          workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, timestampAnnotationPostTime);
          workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, score);
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    } else {
      workgroupColumnCounter += 2;
      addEmptyElementsToVector(rowForWorkgroupIdVector, 2);
    }
    return workgroupColumnCounter;
  }

  /**
   * Set the latest auto score value into the row
   * @param stepWorksForNodeId the StepWork objects we want to look at
   * for the associated annotation
   * @param rowForWorkgroupId the row
   * @param workgroupColumnCounter the column index
   * @return the updated column counter pointing to the next empty column
   */
  private int setLatestAutoScoreValues(List<StepWork> stepWorksForNodeId, Row rowForWorkgroupId, Vector<String> rowForWorkgroupIdVector, int workgroupColumnCounter) {
    String annotationType = "autoGraded";
    Annotation latestAutoScoreAnnotationByStepWork = vleService.getLatestAnnotationByStepWork(stepWorksForNodeId, annotationType);
    if (latestAutoScoreAnnotationByStepWork != null) {
      try {
        String data = latestAutoScoreAnnotationByStepWork.getData();
        JSONObject annotationData = new JSONObject(data);

        /*
         * get the value e.g.
         * "value": [
         *     {
         *         "autoScore":3,
         *         "maxAutoScore":5,
         *         "autoFeedback":"Good start, now try to add more evidence.",
         *         "nodeStateId": 1328317997000
         *     },
         *     {
         *         "autoScore":5,
         *         "maxAutoScore":5,
         *         "autoFeedback":"Good job, you provided an accurate explanation.",
         *         "nodeStateId": 1328318997000
         *     }
         * ]
         */
        JSONArray value = annotationData.getJSONArray("value");

        if (value.length() > 0) {
          JSONObject valueElement = value.getJSONObject(value.length() - 1);

          Long autoScore = null;
          Long maxAutoScore = null;
          String autoFeedback = null;

          if (valueElement.has("autoScore")) {
            autoScore = valueElement.optLong("autoScore");
          }

          if (valueElement.has("maxAutoScore")) {
            maxAutoScore = valueElement.optLong("maxAutoScore");
          }

          if (valueElement.has("autoFeedback")) {
            autoFeedback = valueElement.optString("autoFeedback");
          }

          workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, autoScore);
          workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, maxAutoScore);
          workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, autoFeedback);
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    } else {
      workgroupColumnCounter += 3;
      addEmptyElementsToVector(rowForWorkgroupIdVector, 3);
    }
    return workgroupColumnCounter;
  }

  /**
   * Set the latest annotation score and timestamp into the row
   *
   * @param stepWorksForNodeId the StepWork objects we want to look at
   * for the associated annotation
   * @param rowForWorkgroupId the row
   * @param workgroupColumnCounter the column index
   * @param nodeId the node id for the step
   *
   * @return the updated column counter pointing to the next empty column
   */
  private int setLatestAnnotationScoreAndTimestamp(List<StepWork> stepWorksForNodeId, Row rowForWorkgroupId, Vector<String> rowForWorkgroupIdVector, int workgroupColumnCounter, String nodeId) {
    /*
     * get the latest annotation associated with any of the StepWork objects
     * and have fromWorkgroup as any of the workgroup ids in teacherWorkgroupIds
     */
    Annotation latestAnnotationScoreByStepWork = vleService.getLatestAnnotationScoreByStepWork(stepWorksForNodeId, teacherWorkgroupIds);

    if (latestAnnotationScoreByStepWork != null) {
      try {
        String data = latestAnnotationScoreByStepWork.getData();
        JSONObject annotation = new JSONObject(data);
        String score = annotation.getString("value");
        Timestamp postTime = latestAnnotationScoreByStepWork.getPostTime();
        String timestampAnnotationPostTime = timestampToFormattedString(postTime);
        workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, timestampAnnotationPostTime);
        workgroupColumnCounter = setCellValueConvertStringToLong(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, score);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    } else {
      workgroupColumnCounter += 2;
      addEmptyElementsToVector(rowForWorkgroupIdVector, 2);
    }

    Long maxScore = getMaxScoreByNodeId(nodeId);
    workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, maxScore);
    return workgroupColumnCounter;
  }

  /**
   * Set the latest annotation score into the row
   *
   * @param stepWorksForNodeId the StepWork objects we want to look at
   * for the associated annotation
   * @param rowForWorkgroupId the row
   * @param workgroupColumnCounter the column index
   * @param nodeId the node id for the step
   *
   * @return the updated column counter pointing to the next empty column
   */
  private int setLatestAnnotationScore(List<StepWork> stepWorksForNodeId, Row rowForWorkgroupId, Vector<String> rowForWorkgroupIdVector, int workgroupColumnCounter, String nodeId) {
    /*
     * get the latest annotation associated with any of the StepWork objects
     * and have fromWorkgroup as any of the workgroup ids in teacherWorkgroupIds
     */
    Annotation latestAnnotationScoreByStepWork = vleService.getLatestAnnotationScoreByStepWork(stepWorksForNodeId, teacherWorkgroupIds);

    if (latestAnnotationScoreByStepWork != null) {
      try {
        String data = latestAnnotationScoreByStepWork.getData();
        JSONObject annotation = new JSONObject(data);
        String score = annotation.getString("value");
        workgroupColumnCounter = setCellValueConvertStringToLong(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, score);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    } else {
      workgroupColumnCounter += 1;
      addEmptyElementsToVector(rowForWorkgroupIdVector, 1);
    }
    Long maxScore = getMaxScoreByNodeId(nodeId);
    workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, maxScore);
    return workgroupColumnCounter;
  }

  /**
   * Set the latest annotation comment and timestamp into the row
   *
   * @param stepWorksForNodeId the StepWork objects we want to look at
   * for the associated annotation
   * @param rowForWorkgroupId the row
   * @param workgroupColumnCounter the column index
   *
   * @return the updated column counter pointing to the next empty column
   */
  private int setLatestAnnotationCommentAndTimestamp(List<StepWork> stepWorksForNodeId, Row rowForWorkgroupId, Vector<String> rowForWorkgroupIdVector, int workgroupColumnCounter) {
    /*
     * get the latest annotation associated with any of the StepWork objects
     * and have fromWorkgroup as any of the workgroup ids in teacherWorkgroupIds
     */
    Annotation latestAnnotationCommentByStepWork = vleService.getLatestAnnotationCommentByStepWork(stepWorksForNodeId, teacherWorkgroupIds);

    if (latestAnnotationCommentByStepWork != null) {
      try {
        String data = latestAnnotationCommentByStepWork.getData();
        JSONObject annotation = new JSONObject(data);
        String comment = annotation.getString("value");
        Timestamp postTime = latestAnnotationCommentByStepWork.getPostTime();
        String timestampAnnotationPostTime = timestampToFormattedString(postTime);
        workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, timestampAnnotationPostTime);
        workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, comment);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    } else {
      workgroupColumnCounter += 2;
      addEmptyElementsToVector(rowForWorkgroupIdVector, 2);
    }
    return workgroupColumnCounter;
  }

  /**
   * Set the latest annotation comment into the row
   *
   * @param stepWorksForNodeId the StepWork objects we want to look at
   * for the associated annotation
   * @param rowForWorkgroupId the row
   * @param workgroupColumnCounter the column index
   *
   * @return the updated column counter pointing to the next empty column
   */
  private int setLatestAnnotationComment(List<StepWork> stepWorksForNodeId, Row rowForWorkgroupId, Vector<String> rowForWorkgroupIdVector, int workgroupColumnCounter) {
    /*
     * get the latest annotation associated with any of the StepWork objects
     * and have fromWorkgroup as any of the workgroup ids in teacherWorkgroupIds
     */
    Annotation latestAnnotationCommentByStepWork = vleService.getLatestAnnotationCommentByStepWork(stepWorksForNodeId, teacherWorkgroupIds);

    if (latestAnnotationCommentByStepWork != null) {
      try {
        String data = latestAnnotationCommentByStepWork.getData();
        JSONObject annotation = new JSONObject(data);
        String comment = annotation.getString("value");
        workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, comment);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    } else {
      workgroupColumnCounter += 1;
      addEmptyElementsToVector(rowForWorkgroupIdVector, 1);
    }
    return workgroupColumnCounter;
  }

  /**
   * Set the autoGraded values into the cells
   * @param autoGradedAnnotationForNodeState the autoGraded annotation
   * @param rowForWorkgroupId the row
   * @param rowForWorkgroupIdVector the vector
   * @param workgroupColumnCounter the column index
   * @return the updated column counter pointing to the next empty column
   */
  private int setLatestAutoGradedAnnotation(JSONObject autoGradedAnnotationForNodeState, Row rowForWorkgroupId, Vector<String> rowForWorkgroupIdVector, int workgroupColumnCounter) {

    if (autoGradedAnnotationForNodeState != null) {
      Long autoScore = null;
      Long maxAutoScore = null;
      String autoFeedback = null;

      if (autoGradedAnnotationForNodeState.has("autoScore")) {
        autoScore = autoGradedAnnotationForNodeState.optLong("autoScore");
      }

      if (autoGradedAnnotationForNodeState.has("maxAutoScore")) {
        maxAutoScore = autoGradedAnnotationForNodeState.optLong("maxAutoScore");
      }

      if (autoGradedAnnotationForNodeState.has("autoFeedback")) {
        autoFeedback = autoGradedAnnotationForNodeState.optString("autoFeedback");
      }

      workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, autoScore);
      workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, maxAutoScore);
      workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, autoFeedback);
    } else {
      workgroupColumnCounter += 3;
      addEmptyElementsToVector(rowForWorkgroupIdVector, 3);
    }
    return workgroupColumnCounter;
  }

  /**
   * Set the integer value into the cell
   *
   * @param row the excel row
   * @param rowVector the vector that holds the string for the csv output
   * @param columnCounter the column index
   * @param value the value to set in the cell
   *
   * @return the new column index for the next empty cell
   */
  private int setCellValue(Row row, Vector<String> rowVector, int columnCounter, Integer value) {
    int returnValue;

    if (value == null) {
      if (rowVector != null) {
        rowVector.add("");
      }
      returnValue = columnCounter++;
    } else {
      try {
        returnValue = setCellValue(row, rowVector, columnCounter, new Long(value));
      } catch (NumberFormatException e) {
        returnValue = setCellValue(row, rowVector, columnCounter, value + "");
      }
    }
    return returnValue;
  }

  /**
   * Set the integer value into the cell
   *
   * @param row the excel row
   * @param rowVector the vector that holds the string for the csv output
   * @param columnCounter the column index
   * @param value the value to set in the cell
   *
   * @return the new column index for the next empty cell
   */
  private int setCellValue(Row row, Vector<String> rowVector, int columnCounter, Integer value, String comment) {
    int returnValue;

    if (value == null) {
      if (rowVector != null) {
        rowVector.add("");
      }

      returnValue = columnCounter++;
    } else {
      try {
        returnValue = setCellValue(row, rowVector, columnCounter, new Long(value), comment);
      } catch (NumberFormatException e) {
        returnValue = setCellValue(row, rowVector, columnCounter, value + "", comment);
      }
    }
    return returnValue;
  }

  /**
   * Set the long value into the cell
   *
   * @param row the excel row
   * @param rowVector the vector that holds the string for the csv output
   * @param columnCounter the column index
   * @param value the value to set in the cell
   *
   * @return the new column index for the next empty cell
   */
  private int setCellValue(Row row, Vector<String> rowVector, int columnCounter, Long value) {
    if (value == null) {
      if (rowVector != null) {
        rowVector.add("");
      }
    } else {
      if (row != null) {
        row.createCell(columnCounter).setCellValue(value);
      }

      if (rowVector != null) {
        rowVector.add(value + "");
      }
    }

    columnCounter++;
    return columnCounter;
  }

  /**
   * Set the long value into the cell
   * @param row the excel row
   * @param rowVector the vector that holds the string for the csv output
   * @param columnCounter the column index
   * @param value the value to set in the cell
   * @return the new column index for the next empty cell
   */
  private int setCellValue(Row row, Vector<String> rowVector, int columnCounter, Long value, String comment) {
    if (value == null) {
      if (rowVector != null) {
        rowVector.add("");
      }
    } else {
      if (row != null) {
        row.createCell(columnCounter).setCellValue(value);
      }

      if (rowVector != null) {
        if (comment == null) {
          rowVector.add(value + "");
        } else {
          rowVector.add("[" + comment + "]=" + value);
        }
      }
    }
    columnCounter++;
    return columnCounter;
  }

  /**
   * Set the double value into the cell
   * @param row the excel row
   * @param rowVector the vector that holds the string for the csv output
   * @param columnCounter the column index
   * @param value the value to set in the cell
   * @return the new column index for the next empty cell
   */
  private int setCellValue(Row row, Vector<String> rowVector, int columnCounter, Double value) {
    if (value == null) {
      if (rowVector != null) {
        rowVector.add("");
      }
    } else {
      if (row != null) {
        row.createCell(columnCounter).setCellValue(value);
      }

      if (rowVector != null) {
        rowVector.add(value + "");
      }
    }
    columnCounter++;
    return columnCounter;
  }

  /**
   * Set the double value into the cell
   * @param row the excel row
   * @param rowVector the vector that holds the string for the csv output
   * @param columnCounter the column index
   * @param value the value to set in the cell
   * @return the new column index for the next empty cell
   */
  private int setCellValue(Row row, Vector<String> rowVector, int columnCounter, Double value, String comment) {
    if (value == null) {
      if (rowVector != null) {
        rowVector.add("");
      }
    } else {
      if (row != null) {
        row.createCell(columnCounter).setCellValue(value);
      }

      if (rowVector != null) {
        if (comment == null) {
          rowVector.add(value + "");
        } else {
          rowVector.add("[" + comment + "]=" + value);
        }
      }
    }

    columnCounter++;
    return columnCounter;
  }

  /**
   * Set the float value into the cell
   * @param row the excel row
   * @param rowVector the vector that holds the string for the csv output
   * @param columnCounter the column index
   * @param value the value to set in the cell
   * @return the new column index for the next empty cell
   */
  private int setCellValue(Row row, Vector<String> rowVector, int columnCounter, Float value) {
    if (value == null) {
      if (rowVector != null) {
        rowVector.add("");
      }
    } else {
      if (row != null) {
        row.createCell(columnCounter).setCellValue(value);
      }

      if (rowVector != null) {
        rowVector.add(value + "");
      }
    }

    columnCounter++;
    return columnCounter;
  }

  /**
   * Set the float value into the cell
   * @param row the excel row
   * @param rowVector the vector that holds the string for the csv output
   * @param columnCounter the column index
   * @param value the value to set in the cell
   * @return the new column index for the next empty cell
   */
  private int setCellValue(Row row, Vector<String> rowVector, int columnCounter, Float value, String comment) {
    if (value == null) {
      if (rowVector != null) {
        rowVector.add("");
      }
    } else {
      if (row != null) {
        row.createCell(columnCounter).setCellValue(value);
      }

      if (rowVector != null) {
        if (comment == null) {
          rowVector.add(value + "");
        } else {
          rowVector.add("[" + comment + "]=" + value);
        }
      }
    }

    columnCounter++;
    return columnCounter;
  }

  /**
   * Set the value in the row at the given column. if the string can be
   * converted to a number we will do so. this makes a difference in the
   * excel because strings are left aligned and numbers are right aligned.
   * @param row the row
   * @param columnCounter the column index
   * @param value the value to set in the cell
   * @return the next empty column
   */
  private int setCellValueConvertStringToLong(Row row, Vector<String> rowVector, int columnCounter, String value) {
    if (value == null) {
      value = "";
    }

    try {
      if (rowVector != null) {
        rowVector.add(value);
      }

      if (row != null) {
        row.createCell(columnCounter).setCellValue(Long.parseLong(value));
      }
    } catch(NumberFormatException e) {
      if (rowVector != null) {
        rowVector.add(value);
      }

      //check if the value has more characters than the max allowable for an excel cell
      if (value.length() > 32767) {
        value = value.substring(0, 32767);
        oversizedResponses++;
      }

      if (row != null) {
        row.createCell(columnCounter).setCellValue(value);
      }
    }

    columnCounter++;
    return columnCounter;
  }

  /**
   * Set the value in the row at the given column.
   * @param row the row
   * @param columnCounter the column index
   * @param value the value to set in the cell
   * @return the next empty column
   */
  private int setCellValue(Row row, Vector<String> rowVector, int columnCounter, String value) {
    if (value == null) {
      value = "";
    }

    if (rowVector != null) {
      rowVector.add(value);
    }

    if (value.length() > 32767) {
      value = value.substring(0, 32767);
      oversizedResponses++;
    }

    if (row != null) {
      row.createCell(columnCounter).setCellValue(value);
    }

    columnCounter++;
    return columnCounter;
  }

  /**
   * Set the value in the row at the given column.
   * @param row the row
   * @param columnCounter the column index
   * @param value the value to set in the cell
   * @return the next empty column
   */
  private int setCellValue(Row row, Vector<String> rowVector, int columnCounter, String value, String comment) {
    if (value == null) {
      value = "";
    }

    if (rowVector != null) {
      if (comment == null) {
        rowVector.add(value);
      } else {
        rowVector.add("[" + comment + "]=" + value);
      }
    }

    if (value.length() > 32767) {
      value = value.substring(0, 32767);
      oversizedResponses++;
    }

    if (row != null) {
      row.createCell(columnCounter).setCellValue(value);
    }

    columnCounter++;
    return columnCounter;
  }

  /**
   * Get the timestamp as a string
   * @param timestamp the timestamp object
   * @return the timstamp as a string
   * e.g. Mar 9, 2011 8:50:47 PM
   */
  private String timestampToFormattedString(Timestamp timestamp) {
    String timestampString = "";
    if (timestamp != null) {
      DateFormat dateTimeInstance = DateFormat.getDateTimeInstance();
      long time = timestamp.getTime();
      Date timestampDate = new Date(time);
      timestampString = dateTimeInstance.format(timestampDate);
    }
    return timestampString;
  }

  /**
   * Parse the student attendance data and put it into the workgroupIdToStudentAttendance HashMap
   * @param studentAttendanceArray a JSONArray containing all the student attendance rows
   */
  private void parseStudentAttendance(JSONArray studentAttendanceArray) {
    for (int x = 0; x < studentAttendanceArray.length(); x++) {
      try {
        JSONObject studentAttendanceEntry = studentAttendanceArray.getJSONObject(x);
        long workgroupId = studentAttendanceEntry.getLong("workgroupId");
        JSONArray workgroupIdStudentAttendance = workgroupIdToStudentAttendance.get(workgroupId);
        if (workgroupIdStudentAttendance == null) {
          workgroupIdStudentAttendance = new JSONArray();
          workgroupIdToStudentAttendance.put(workgroupId, workgroupIdStudentAttendance);
        }
        workgroupIdStudentAttendance.put(studentAttendanceEntry);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
  }

  /**
   * Get the first student attendence object before the given timestamp for a given workgroup id.
   * We basically want the student attendance at the time of the given timestamp.
   *
   * @param workgroupId the id of the workgroup we are looking for
   * @param timestamp the time we want the student attendence to be before
   *
   * @return the student attendance JSONObject
   */
  private JSONObject getStudentAttendanceForWorkgroupIdTimestamp(long workgroupId, long timestamp) {
    JSONObject studentAttendanceEntry = null;
    JSONArray workgroupIdStudentAttendance = workgroupIdToStudentAttendance.get(workgroupId);
    if (workgroupIdStudentAttendance != null) {

      /*
       * loop through all the student attendance objects in the array.
       * the array is ordered from newer to older. so the first
       * student attendance object with a loginTimestamp before
       * the function argument timestamp is the student attendance
       * object we want.
       */
      for (int x = 0; x < workgroupIdStudentAttendance.length(); x++) {
        try {
          JSONObject tempStudentAttendanceEntry = workgroupIdStudentAttendance.getJSONObject(x);
          if (tempStudentAttendanceEntry != null) {
            long loginTimestamp = tempStudentAttendanceEntry.getLong("loginTimestamp");
            if (loginTimestamp < timestamp) {
              /*
               * the login timestamp is before the timestamp we are looking for
               * so we have found the student attendance object we want
               */
              studentAttendanceEntry = tempStudentAttendanceEntry;
              break;
            }
          }
        } catch (JSONException e) {
          e.printStackTrace();
        }
      }
    }
    return studentAttendanceEntry;
  }

  /**
   * Sort the student user ids array
   * @param userIdsArray a String array containing student user ids
   * @return an ArrayList of Long objects sorted numerically
   */
  private ArrayList<Long> sortUserIdsArray(String[] userIdsArray) {
    ArrayList<Long> userIdsList = new ArrayList<Long>();
    for (int x = 0; x < userIdsArray.length; x++) {
      String userId = userIdsArray[x];
      try {
        if (userId != null && !userId.equals("")) {
          userIdsList.add(Long.parseLong(userId));
        }
      } catch(NumberFormatException e) {
        e.printStackTrace();
      }
    }
    Collections.sort(userIdsList);
    return userIdsList;
  }

  /**
   * Auto sizes the columns specified so that the text in those columns
   * are completely shown and do not need to be resized to be able to
   * be read. This will only auto size the first n number of columns.
   *
   * @param sheet the sheet to auto size columns in
   * @param numColumns the number of columns to auto size
   */
  @SuppressWarnings("unused")
  private void autoSizeColumns(XSSFSheet sheet, int numColumns) {
    System.setProperty("java.awt.headless", "true");
    for (int x = 0; x < numColumns; x++) {
      sheet.autoSizeColumn(x);
    }
    System.setProperty("java.awt.headless", "false");
  }

  /**
   * Get the CRater annotation score for the given step work id if the score exists
   * @param stepWorkId the step work id
   * @param nodeState the node state
   * @return the CRater score or -1 if there is no CRater score
   */
  private long getCRaterScoreByStepWorkIdAndNodeState(Long stepWorkId, JSONObject nodeState) {
    long score = -1;
    long nodeStateId = -1;

    if (nodeState != null) {
      try {
        nodeStateId = nodeState.getLong("timestamp");
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    StepWork stepWork = vleService.getStepWorkByStepWorkId(stepWorkId);
    Annotation cRaterAnnotationByStepWork = vleService.getCRaterAnnotationByStepWork(stepWork);

    if (cRaterAnnotationByStepWork != null) {
      String data = cRaterAnnotationByStepWork.getData();

      if (data != null) {
        try {
          /*
           * get the data as a JSONObject
           *
           * here's an example of what the annotation looks like
           *
           * {
           *     "stepWorkId": 3388281,
           *     "nodeId": "node_136.or",
           *     "fromWorkgroup": "-1",
           *     "value": [
           *       {
           *         "studentResponse": {
           *           "response": [
           *             "The sun gives plants sunlight which lets them grow and release oxygen. So the sun helps animals survive by giving them plants to eat and oxygen to breath."
           *           ],
           *           "timestamp": 1334610850000,
           *           "isCRaterSubmit": true,
           *           "cRaterItemId": "Photo_Sun",
           *           "type": "or"
           *         },
           *         "nodeStateId": 1334610850000,
           *         "score": 2,
           *         "cRaterResponse": "<crater-results>\n  <tracking id=\"1025926\"/>\n  <client id=\"WISETEST\"/>\n  <items>\n     <item id=\"Photo_Sun\">\n        <responses>\n      <response id=\"3388281\" score=\"2\" concepts=\"2\"/>\n       </responses>\n     </item>\n  </items>\n</crater-results>\r",
           *         "concepts": "2"
           *       }
           *     ],
           *     "runId": "2103",
           *     "type": "cRater",
           *     "toWorkgroup": "60562"
           * }
           */
          JSONObject dataJSONObject = new JSONObject(data);

          if (dataJSONObject.has("value")) {
            JSONArray value = dataJSONObject.getJSONArray("value");
            for (int x = 0; x < value.length(); x++) {
              JSONObject nodeStateAnnotation = value.getJSONObject(x);
              if (nodeStateAnnotation != null) {
                if (nodeStateAnnotation.has("nodeStateId")) {
                  long tempNodeStateId = nodeStateAnnotation.getLong("nodeStateId");
                  if (tempNodeStateId == nodeStateId) {
                    if (nodeStateAnnotation.has("score")) {
                      score = nodeStateAnnotation.getLong("score");
                    }
                    break;
                  }
                }
              }
            }
          }
        } catch (JSONException e) {
          e.printStackTrace();
        }
      }
    }
    return score;
  }

  /**
   * Write the csv row to the csvWriter
   * @param vectorRow the csv row to write
   */
  private void writeCSV(Vector<String> vectorRow) {
    if (vectorRow != null) {
      String[] stringArrayRow = new String[vectorRow.size()];
      vectorRow.toArray(stringArrayRow);
      if (csvWriter != null) {
        csvWriter.writeNext(stringArrayRow);
      }
    }
  }

  /**
   * Add an empty cell into the vector
   * @param vector the vector to add to
   * @param count the number of empty cells to add
   */
  private void addEmptyElementsToVector(Vector<String> vector, int count) {
    if (vector != null) {
      for (int x = 0; x < count; x++) {
        vector.add("");
      }
    }
  }

  /**
   * Create the row in the sheet
   * @param sheet the sheet to create the row in
   * @param rowCounter the row index
   * @return the new row or null if the sheet does not exist
   */
  private Row createRow(XSSFSheet sheet, int rowCounter) {
    Row newRow = null;
    if (sheet != null) {
      newRow = sheet.createRow(rowCounter);
    }
    return newRow;
  }

  /**
   * Create a Vector if we are creating a csv file
   * @return an empty Vector if we are generating a csv file. we will return
   * null if we are not generating a csv file.
   */
  private Vector<String> createRowVector() {
    Vector<String> rowVector = null;
    if (isFileTypeCSV(fileType)) {
      rowVector = new Vector<String>();
    }
    return rowVector;
  }

  /**
   * Whether we are creating an xls file
   * @param fileType a file extension
   * @return whether we are creating an xls file
   */
  private boolean isFileTypeXLS(String fileType) {
    boolean result = false;
    if (fileType != null && fileType.equals("xls")) {
      result = true;
    }
    return result;
  }

  /**
   * Whether we are creating a csv file
   * @param fileType a file extension
   * @return whether we are creating a csv file
   */
  private boolean isFileTypeCSV(String fileType) {
    boolean result = false;
    if (fileType != null && fileType.equals("csv")) {
      result = true;
    }
    return result;
  }

  /**
   * Get the max score for a step
   * @param nodeId the node id for the step
   * @return the max score for the step or null if there is no max score for the step
   */
  private Long getMaxScoreByNodeId(String nodeId) {
    Long maxScore = null;
    if (nodeId != null) {
      if (projectMetaData != null) {
        String maxScoresStr = projectMetaData.optString("maxScores");
        if (maxScoresStr != null) {
          try {
            JSONArray maxScoresJSON = new JSONArray(maxScoresStr);
            for (int x = 0; x < maxScoresJSON.length(); x++) {
              JSONObject tempMaxScoreObj = maxScoresJSON.optJSONObject(x);
              if (tempMaxScoreObj != null) {
                String tempNodeId = tempMaxScoreObj.optString("nodeId");
                if (tempNodeId != null) {
                  if (nodeId.equals(tempNodeId)) {
                    maxScore = tempMaxScoreObj.optLong("maxScoreValue");
                    break;
                  }
                }
              }
            }
          } catch (JSONException e) {
            e.printStackTrace();
          }
        }
      }
    }
    return maxScore;
  }

  /**
   * Get the CRater max score from the step content
   * @param nodeContent the step content
   * @return the max score for the CRater step
   */
  private Long getCRaterMaxScore(JSONObject nodeContent) {
    Long cRaterMaxScore = null;
    if (nodeContent != null) {
      JSONObject cRaterObj = nodeContent.optJSONObject("cRater");
      if (cRaterObj != null) {
        try {
          if (cRaterObj.has("cRaterMaxScore")) {
            cRaterMaxScore = cRaterObj.getLong("cRaterMaxScore");
          }
        } catch (JSONException e) {
          e.printStackTrace();
        }
      }
    }
    return cRaterMaxScore;
  }
}
