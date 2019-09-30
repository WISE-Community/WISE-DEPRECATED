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

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Properties;
import java.util.Vector;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
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
import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.work.StepWork;
import org.wise.vle.utils.FileManager;

@Controller
public class VLEGetSpecialExport {

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

  //the max number of step work columns we need, only used for "allStudentWork"
  private int maxNumberOfStepWorkParts = 1;

  private HashMap<String, JSONObject> nodeIdToNodeContent = new HashMap<String, JSONObject>();

  private HashMap<String, JSONObject> nodeIdToNode = new HashMap<String, JSONObject>();

  private HashMap<String, String> nodeIdToNodeTitles = new HashMap<String, String>();

  private HashMap<String, String> nodeIdToNodeTitlesWithPosition = new HashMap<String, String>();

  private HashMap<Integer, String> workgroupIdToPeriodName = new HashMap<Integer, String>();

  private HashMap<Integer, String> workgroupIdToUserIds = new HashMap<Integer, String>();

  private HashMap<Long, JSONArray> workgroupIdToStudentAttendance = new HashMap<Long, JSONArray>();

  private HashMap<Integer, JSONArray> workgroupIdToWiseIds = new HashMap<Integer, JSONArray>();

  private List<String> nodeIdList = new Vector<String>();

  //the start time of the run (when the run was created)
  private String startTime = "N/A";

  //the end time of the run (when the run was archived)
  private String endTime = "N/A";

  //holds the teacher's username and workgroupid
  private JSONObject teacherUserInfoJSONObject;

  //run and project attributes
  private String runId = "";
  private String runName = "";
  private String projectId = "";
  private String parentProjectId = "";
  private String projectName = "";
  private String nodeId = "";

  private List<String> teacherWorkgroupIds = null;
  List<String> customSteps = null;

  //the number of columns to width auto size
  int numColumnsToAutoSize = 0;

  private JSONObject projectMetaData = null;

  private static long debugStartTime = 0;

  //the type of export "latestStudentWork" or "allStudentWork"
  private String exportType = "";

  private static Properties vleProperties = null;

  {
    try {
      vleProperties = new Properties();
      vleProperties.load(getClass().getClassLoader().getResourceAsStream("application.properties"));
    } catch (Exception e) {
      System.err.println("VLEGetSpecialExport could not read in vleProperties file");
      e.printStackTrace();
    }
  }

  /**
   * Clear the instance variables because only one instance of a servlet is ever created
   */
  private void clearVariables() {
    //the max number of step work columns we need, only used for "allStudentWork"
    maxNumberOfStepWorkParts = 1;

    nodeIdToNodeContent = new HashMap<String, JSONObject>();
    nodeIdToNode = new HashMap<String, JSONObject>();
    nodeIdToNodeTitles = new HashMap<String, String>();
    nodeIdToNodeTitlesWithPosition = new HashMap<String, String>();
    workgroupIdToPeriodName = new HashMap<Integer, String>();
    workgroupIdToUserIds = new HashMap<Integer, String>();
    workgroupIdToStudentAttendance = new HashMap<Long, JSONArray>();
    workgroupIdToWiseIds = new HashMap<Integer, JSONArray>();

    nodeIdList = new Vector<String>();
    startTime = "N/A";
    endTime = "N/A";
    teacherUserInfoJSONObject = null;

    runId = "";
    runName = "";
    projectId = "";
    parentProjectId = "";
    projectName = "";
    nodeId = "";
    teacherWorkgroupIds = null;
    customSteps = new Vector<String>();
    numColumnsToAutoSize = 0;
    projectMetaData = null;
    exportType = "";
  }

  /**
   * Compare two different millisecond times
   * @param time1 the earlier time (smaller)
   * @param time2 the later time (larger)
   * @return the difference between the times in seconds
   */
  private long getDifferenceInSeconds(long time1, long time2) {
    return (time2 - time1) / 1000;
  }

  /**
   * Display the difference between the current time and the
   * start time
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
  @RequestMapping("/specialExport")
  public ModelAndView doGet(
    HttpServletRequest request,
    HttpServletResponse response) throws IOException {
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
    nodeId = request.getParameter("nodeId");
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
     * admins can make a request
     * teachers that are owners of the run can make a request
     */
    if (SecurityUtils.isAdmin(signedInUser)) {
      allowedAccess = true;
    } else if (SecurityUtils.isTeacher(signedInUser) && SecurityUtils.isUserOwnerOfRun(signedInUser, runIdLong)) {
      allowedAccess = true;
    }

    if (!allowedAccess) {
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return null;
    }

    Project projectObj = run.getProject();
    ProjectMetadata metadata = projectObj.getMetadata();
    String projectMetaDataJSONString = metadata.toJSONString();

    String curriculumBaseDir = appProperties.getProperty("curriculum_base_dir");
    String rawProjectUrl = run.getProject().getModulePath();
    String projectPath = curriculumBaseDir + rawProjectUrl;
    String projectFolderName = "";
    String projectFolderPath = "";

    if (rawProjectUrl != null) {
      projectFolderName = rawProjectUrl.substring(1, rawProjectUrl.indexOf("/", 1));
    }

    if (projectPath != null) {
      projectFolderPath = projectPath.substring(0, projectPath.lastIndexOf("/"));
    }

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

    String wiseBaseDir = vleProperties.getProperty("wiseBaseDir");
    try {
      projectMetaData = new JSONObject(projectMetaDataJSONString);
    } catch (JSONException e2) {
      e2.printStackTrace();
    }

    try {
      if (runInfoJSONObject.has("startTime")) {
        String startTimeString = runInfoJSONObject.getString("startTime");
        if (startTimeString != null && !startTimeString.equals("null") && !startTimeString.equals("")) {
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
          String fileText = FileManager.getFileText(new File(projectFile.getParentFile(), node.getString("ref")));
          JSONObject nodeContent = new JSONObject(fileText);
          nodeIdToNodeContent.put(node.getString("identifier"), nodeContent);
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
          int workgroupId = classmate.getInt("workgroupId");
          if (classmate.has("periodId") && !classmate.isNull("periodId")) {
            int periodId = classmate.getInt("periodId");
            workgroupIdToPeriodId.put(workgroupId, periodId);
          }

          if (classmate.has("periodName") && !classmate.isNull("periodName")) {
            String periodName = classmate.getString("periodName");
            workgroupIdToPeriodName.put(workgroupId, periodName);
          }

          if (classmate.has("userIds") && !classmate.isNull("userIds")) {
            /*
             * get the student logins, this is a single string with the logins
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

          if (classmate.has("wiseIds") && !classmate.isNull("wiseIds")) {
            JSONArray wiseIds = classmate.getJSONArray("wiseIds");
            workgroupIdToWiseIds.put(workgroupId, wiseIds);
          }
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }

    if (exportType.equals("specialExport")) {
      String nodeTitleWithPosition = "Step " + nodeIdToNodeTitlesWithPosition.get(nodeId);
      String fileName = runName + "-" + runId + "-" + nodeTitleWithPosition;
      fileName = fileName.replaceAll(" ", "_");

      /*
       * we will return a zipped folder that contains all the necessary
       * files to view the student work
       */
      response.setContentType("application/zip");
      response.addHeader("Content-Disposition", "attachment;filename=\"" + fileName + ".zip" + "\"");

      File zipFolder = new File(fileName);
      zipFolder.mkdir();
      File dataFile = new File(zipFolder, "data.js");

      JSONObject data = new JSONObject();
      JSONArray students = new JSONArray();

      try {
        data.put("projectName", projectName);
        data.put("projectId", projectId);
        data.put("runName", runName);
        data.put("runId", runId);
        data.put("stepName", nodeTitleWithPosition);
        data.put("nodeId", nodeId);
        data.put("projectFolderName", projectFolderName);
      } catch (JSONException e1) {
        e1.printStackTrace();
      }

      String nodeType = "";
      JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
      if (nodeContent != null) {
        try {
          nodeType = nodeContent.getString("type");
          if (nodeType != null) {
            nodeType = nodeType.toLowerCase();
          }
        } catch (JSONException e) {
          e.printStackTrace();
        }
      }

      if (nodeType == null) {

      } else if (nodeType.equals("svgdraw")) {
        if (wiseBaseDir != null && wiseBaseDir != "") {
          File sourcelz77File = new File(wiseBaseDir + "/vle/node/draw/svg-edit/lz77.js");
          File newlz77File = new File(zipFolder, "lz77.js");
          FileUtils.copyFile(sourcelz77File, newlz77File);
          File sourceViewStudentWorkFile = new File(wiseBaseDir + "/vle/node/draw/viewStudentWork.html");
          File newViewStudentWorkFile = new File(zipFolder, "viewStudentWork.html");
          FileUtils.copyFile(sourceViewStudentWorkFile, newViewStudentWorkFile);
          File assetsFolder = new File(projectFolderPath, "assets");
          FileUtils.copyDirectoryToDirectory(assetsFolder, zipFolder);
        }
      } else if (nodeType.equals("mysystem2")) {
        if (wiseBaseDir != null && wiseBaseDir != "") {
          MySystemExporter myExporter  = new MySystemExporter(wiseBaseDir,zipFolder);
          myExporter.copyFiles();
        }
      } else if (nodeType.equals("sensor")) {
        if (wiseBaseDir != null && wiseBaseDir != "") {
          Vector<String> filesToCopy = new Vector<String>();
          filesToCopy.add(wiseBaseDir + "/vle/model/content.js");
          filesToCopy.add(wiseBaseDir + "/vle/util/helperfunctions.js");
          filesToCopy.add(wiseBaseDir + "/vle/lib/jquery/js/flot/jquery.flot.js");
          filesToCopy.add(wiseBaseDir + "/vle/lib/jquery/js/flot/jquery.js");
          filesToCopy.add(wiseBaseDir + "/vle/node/Node.js");
          filesToCopy.add(wiseBaseDir + "/vle/model/nodevisit.js");
          filesToCopy.add(wiseBaseDir + "/vle/node/sensor/sensor.js");
          filesToCopy.add(wiseBaseDir + "/vle/node/sensor/SensorNode.js");
          filesToCopy.add(wiseBaseDir + "/vle/node/sensor/sensorstate.js");
          filesToCopy.add(wiseBaseDir + "/vle/node/sensor/viewStudentWork.html");

          for (int x = 0; x < filesToCopy.size(); x++) {
            String filePath = filesToCopy.get(x);
            copyFileToFolder(filePath, zipFolder);
          }
          File originalStepContentFile = new File(projectFolderPath + "/" + nodeId);
          String stepContentString = FileUtils.readFileToString(originalStepContentFile);
          stepContentString = "var stepContent = " + stepContentString + ";";
          File newStepContentFile = new File(zipFolder, "stepContent.js");
          FileUtils.writeStringToFile(newStepContentFile, stepContentString, "UTF-8");
        }
      }

      for (int x = 0; x < workgroupIds.size(); x++) {
        String userId = workgroupIds.get(x);
        Long userIdLong = Long.parseLong(userId);
        UserInfo userInfo = vleService.getUserInfoByWorkgroupId(userIdLong);
        JSONArray wiseIds = workgroupIdToWiseIds.get(Integer.parseInt(userId));
        List<StepWork> stepWorksForWorkgroupId = vleService.getStepWorksByUserInfo(userInfo);
        List<StepWork> stepWorksForNodeId = getStepWorksForNodeId(stepWorksForWorkgroupId, nodeId);
        JSONArray studentDataArray = new JSONArray();

        for (int y = 0; y < stepWorksForNodeId.size(); y++) {
          StepWork stepWork = stepWorksForNodeId.get(y);
          JSONObject studentData = getStudentData(stepWork);
          studentDataArray.put(studentData);
        }

        JSONObject studentObject = new JSONObject();
        try {
          studentObject.put("workgroupId", userIdLong);
          studentObject.put("wiseIds", wiseIds);
          studentObject.put("studentDataArray", studentDataArray);
        } catch (JSONException e) {
          e.printStackTrace();
        }
        students.put(studentObject);
      }

      try {
        data.put("students", students);
      } catch (JSONException e) {
        e.printStackTrace();
      }

      /*
       * turn the student data object into a javascript declaration
       * e.g.
       * from
       * {}
       * to
       * var data = {};
       */
      String javascriptDataString = getJavascriptText("data", data);

      FileUtils.writeStringToFile(dataFile, javascriptDataString, "UTF-8");
      ServletOutputStream outputStream = response.getOutputStream();
      ZipOutputStream out = new ZipOutputStream(new BufferedOutputStream(outputStream));

      //get path prefix so that the zip file does not contain the whole path
      // eg. if folder to be zipped is /home/lalit/test
      // the zip file when opened will have test folder and not home/lalit/test folder
      int len = zipFolder.getAbsolutePath().lastIndexOf(File.separator);
      String baseName = zipFolder.getAbsolutePath().substring(0,len+1);
      addFolderToZip(zipFolder, out, baseName);
      out.close();
      FileUtils.deleteDirectory(zipFolder);
    }
    clearVariables();
    return null;
  }

  /**
   * Turn the JSONObject into a javascript object declaration in
   * the form of a string.
   * e.g.
   * before
   * {}
   * after
   * var data = {};
   * @param jsVariableName the javascript variable name that we will use
   * @param jsonObject a JSONObject
   * @return a string containing the javascript object declaration
   */
  private String getJavascriptText(String jsVariableName, JSONObject jsonObject) {
    StringBuffer result = new StringBuffer();

    if (jsonObject != null) {
      String jsonArrayString = "";
      try {
        /*
         * get the string representation of the JSONObject with
         * proper indentation (using 3 spaces per tab) so it
         * will be easy for a human to read
         */
        jsonArrayString = jsonObject.toString(3);
      } catch (JSONException e) {
        e.printStackTrace();
      }

      if (jsonArrayString != null && !jsonArrayString.equals("")) {
        result.append("var " + jsVariableName + " = ");
        result.append(jsonArrayString);
        result.append(";");
      }
    }
    return result.toString();
  }

  /**
   * Get the student data from the step work
   * @param stepWork the step work object
   * @return a string containing the student data. the
   * contents of the string depend on the step type
   * that the work was for.
   */
  private JSONObject getStudentData(StepWork stepWork) {
    JSONObject studentData = new JSONObject();
    Long stepWorkId = stepWork.getId();
    Timestamp postTime = stepWork.getPostTime();
    try {
      studentData.put("stepWorkId", stepWorkId);
      studentData.put("data", JSONObject.NULL);
      String data = stepWork.getData();
      if (data != null && !data.equals("")) {
        JSONObject jsonData = new JSONObject(data);
        if (postTime != null) {
          jsonData.put("postTime", postTime.getTime());
        }
        studentData.put("data", jsonData);
      }
    } catch (JSONException e1) {
      e1.printStackTrace();
    }
    return studentData;
  }

  /**
   * Get the step works only for a specific node id
   * @param stepWorks a list of StepWork objects
   * @param nodeId the node id we want student work for
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

  private static void addFolderToZip(File folder, ZipOutputStream zip, String baseName)
      throws IOException {
    File[] files = folder.listFiles();
    for (File file : files) {
      if (file.isDirectory()) {
        String name = file.getAbsolutePath().substring(baseName.length());
        ZipEntry zipEntry = new ZipEntry(name+"/");
        zip.putNextEntry(zipEntry);
        zip.closeEntry();
        addFolderToZip(file, zip, baseName);
      } else {
        String name = file.getAbsolutePath().substring(baseName.length());
        ZipEntry zipEntry = new ZipEntry(name);
        zip.putNextEntry(zipEntry);
        IOUtils.copy(new FileInputStream(file), zip);
        zip.closeEntry();
      }
    }
  }

  /**
   * Get the timestamp as a string
   * @param timestamp the timestamp object
   * @return the timstamp as a string
   * e.g.
   * Mar 9, 2011 8:50:47 PM
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
   * Create a map of node id to node titles by looping through the array
   * of nodes in the project file and creating an entry in the map
   * for each node
   * @param project the project JSON object
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
   * Make the list of node ids
   *
   * Note: makeNodeIdToNodeTitlesMap() must be called before this function
   *
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
  private void traverseNodeIdsToMakeNodeIdList(JSONArray sequences, String identifier,
      String positionSoFar, int nodePosition, String startPoint) {
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
   * Retrieves the JSONObject for a sequence with the given sequenceId
   * @param sequences a JSONArray of sequence JSONObjects
   * @param sequenceId the identifier of the sequence we want
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
   * Copy a file to a folder
   * @param sourcePath the absolute path to the file on the system
   * @param folder the folder object to copy to
   */
  private void copyFileToFolder(String sourcePath, File folder) {
    /*
     * get the file name
     * if the path is /Users/geoffreykwan/dev/apache-tomcat-7.0.28/webapps/wise/vle/lib/jquery/js/flot/jquery.js
     * the file name will be
     * jquery.js
     */
    String fileName = sourcePath.substring(sourcePath.lastIndexOf("/"));

    File sourceFile = new File(sourcePath);
    File destinationFile = new File(folder, fileName);

    try {
      FileUtils.copyFile(sourceFile, destinationFile);
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
}
