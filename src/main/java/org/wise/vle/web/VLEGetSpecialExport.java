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

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.attendance.StudentAttendance;
import org.wise.portal.domain.module.impl.CurnitGetCurnitUrlVisitor;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.ProjectMetadata;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.presentation.web.controllers.run.RunUtil;
import org.wise.portal.service.attendance.StudentAttendanceService;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.vle.VLEService;
import org.wise.portal.service.workgroup.WorkgroupService;
import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.work.StepWork;
import org.wise.vle.utils.FileManager;
import org.wise.vle.utils.SecurityUtils;

public class VLEGetSpecialExport extends AbstractController {

	private static final long serialVersionUID = 1L;
	
	private Properties wiseProperties;
	
	private VLEService vleService;
	
	private RunService runService;
	
	private WorkgroupService workgroupService;
	
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
	
	//holds all the teacher workgroup ids
	private List<String> teacherWorkgroupIds = null;
	
	//the custom steps to export
	List<String> customSteps = null;
	
	//the number of columns to width auto size
	int numColumnsToAutoSize = 0;
	
	//the project meta data
	private JSONObject projectMetaData = null;
	
	private static long debugStartTime = 0;
	
	//the type of export "latestStudentWork" or "allStudentWork"
	private String exportType = "";
	
	private static Properties vleProperties = null;
	
	{
		try {
			//get the wise.properties file
			vleProperties = new Properties();
			vleProperties.load(getClass().getClassLoader().getResourceAsStream("wise.properties"));
		} catch (Exception e) {
			System.err.println("VLEGetSpecialExport could not read in vleProperties file");
			e.printStackTrace();
		}
	}
	
	/**
	 * Clear the instance variables because only one instance of a servlet
	 * is ever created
	 */
	private void clearVariables() {
		//the max number of step work columns we need, only used for "allStudentWork"
		maxNumberOfStepWorkParts = 1;
		
		//mappings for the project and user
		nodeIdToNodeContent = new HashMap<String, JSONObject>();
		nodeIdToNode = new HashMap<String, JSONObject>();
		nodeIdToNodeTitles = new HashMap<String, String>();
		nodeIdToNodeTitlesWithPosition = new HashMap<String, String>();
		workgroupIdToPeriodName = new HashMap<Integer, String>();
		workgroupIdToUserIds = new HashMap<Integer, String>();
		workgroupIdToStudentAttendance = new HashMap<Long, JSONArray>();
		workgroupIdToWiseIds = new HashMap<Integer, JSONArray>();
		
		//the list of node ids in the project
		nodeIdList = new Vector<String>();
		
		//the start time of the run (when the run was created)
		startTime = "N/A";
		
		//the end time of the run (when the run was archived)
		endTime = "N/A";
		
		//holds the teacher's username and workgroupid
		teacherUserInfoJSONObject = null;
		
		//run and project attributes
		runId = "";
		runName = "";
		projectId = "";
		parentProjectId = "";
		projectName = "";
		nodeId = "";
		
		//holds all the teacher workgroup ids
		teacherWorkgroupIds = null;
		
		//holds the custom steps to export data for
		customSteps = new Vector<String>();
		
		//reset the number of columns to width auto size
		numColumnsToAutoSize = 0;
		
		//reset the project meta data
		projectMetaData = null;
		
		//holds the export type
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
	
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		return doGet(request, response);
	}
	
	/**
	 * Generates and returns an excel xls of exported student data.
	 */
	public ModelAndView doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		//get the signed in user
		User signedInUser = ControllerUtil.getSignedInUser();

		/*
		 * clear the instance variables because only one instance of a servlet
		 * is ever created
		 */
		clearVariables();
		
		//obtain the start time for debugging purposes
		debugStartTime = new Date().getTime();
		
		//get the run and project attributes
		runId = request.getParameter("runId");
		runName = request.getParameter("runName");
		projectId = request.getParameter("projectId");
		projectName = request.getParameter("projectName");
		parentProjectId = request.getParameter("parentProjectId");
		nodeId = request.getParameter("nodeId");
		
		//the export type "latestStudentWork" or "allStudentWork"
		exportType = request.getParameter("exportType");
		
		Long runIdLong = null;
		try {
			runIdLong = new Long(runId);
		} catch(NumberFormatException e) {
			e.printStackTrace();
		}
		
		Run run = null;
		try {
			if(runId != null) {
				//get the run object
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
		if(SecurityUtils.isAdmin(signedInUser)) {
			//the user is an admin so we will allow this request
			allowedAccess = true;
		} else if(SecurityUtils.isTeacher(signedInUser) && SecurityUtils.isUserOwnerOfRun(signedInUser, runIdLong)) {
			//the user is a teacher that is an owner or shared owner of the run so we will allow this request
			allowedAccess = true;
		}
		
		if(!allowedAccess) {
			//user is not allowed to make this request
			response.sendError(HttpServletResponse.SC_FORBIDDEN);
			return null;
		}
		
		Project projectObj = run.getProject();
		ProjectMetadata metadata = projectObj.getMetadata();
		String projectMetaDataJSONString = metadata.toJSONString();
		
		String curriculumBaseDir = getWiseProperties().getProperty("curriculum_base_dir");
		String rawProjectUrl = (String) run.getProject().getCurnit().accept(new CurnitGetCurnitUrlVisitor());		
		String projectPath = curriculumBaseDir + rawProjectUrl;
		
		//get the classmate user infos
		JSONArray classmateUserInfosJSONArray = RunUtil.getClassmateUserInfos(run, workgroupService, runService);
		
		//get the teacher info
		teacherUserInfoJSONObject = RunUtil.getTeacherUserInfo(run, workgroupService);
		
		//get the shared teacher infos
		JSONArray sharedTeacherUserInfosJSONArray = RunUtil.getSharedTeacherUserInfos(run, workgroupService);
		
		//get the run info
		JSONObject runInfoJSONObject = RunUtil.getRunInfo(run);
		
		//get all the student attendance entries for this run
		List<StudentAttendance> studentAttendanceList = getStudentAttendanceService().getStudentAttendanceByRunId(run.getId());
		JSONArray studentAttendanceJSONArray = new JSONArray();

		/*
		 * loop through all the student attendance entries so we can
		 * create JSONObjects out of them to put in our studentAttendanceJSONArray
		 */
		for(int x=0; x<studentAttendanceList.size(); x++) {
			//get a StudenAttendance object
			StudentAttendance studentAttendance = studentAttendanceList.get(x);

			//get the JSONObject representation
			JSONObject studentAttendanceJSONObj = studentAttendance.toJSONObject();

			//add it to our array
			studentAttendanceJSONArray.put(studentAttendanceJSONObj);
		}
		
		//get the path of the wise base dir
		String wiseBaseDir = vleProperties.getProperty("wiseBaseDir");
		
		
		try {
			//get the project meta data JSON object
			projectMetaData = new JSONObject(projectMetaDataJSONString);
		} catch (JSONException e2) {
			e2.printStackTrace();
		}
		
		try {
			if(runInfoJSONObject.has("startTime")) {
				//get the start time as a string
				String startTimeString = runInfoJSONObject.getString("startTime");
				
				if(startTimeString != null && !startTimeString.equals("null") && !startTimeString.equals("")) {
					long startTimeLong = Long.parseLong(startTimeString);
					
					Timestamp startTimeTimestamp = new Timestamp(startTimeLong);
					
					//get the date the run was created
					startTime = timestampToFormattedString(startTimeTimestamp);					
				}
			}
			
			if(runInfoJSONObject.has("endTime")) {
				//get the end time as a string
				String endTimeString = runInfoJSONObject.getString("endTime");
				
				if(endTimeString != null && !endTimeString.equals("null") && !endTimeString.equals("")) {
					long endTimeLong = Long.parseLong(endTimeString);
					
					Timestamp endTimeTimestamp = new Timestamp(endTimeLong);
					
					//get the date the run was archived
					endTime = timestampToFormattedString(endTimeTimestamp);
				}
			}
		} catch (JSONException e1) {
			e1.printStackTrace();
		}
		
		//parse the student attendance data so we can query it later
		parseStudentAttendance(studentAttendanceJSONArray);
		
		//the List that will hold all the workgroup ids
		Vector<String> workgroupIds = new Vector<String>();
		
		JSONArray customStepsArray = new JSONArray();
		
		//gather the custom steps if the teacher is requesting a custom export
		if(exportType.equals("customLatestStudentWork") || exportType.equals("customAllStudentWork")) {
			String customStepsArrayJSONString = request.getParameter("customStepsArray");
			
			try {
				customStepsArray = new JSONArray(customStepsArrayJSONString);
				
				//loop through all the node ids
				for(int x=0; x<customStepsArray.length(); x++) {
					//add the node id to our list of custom steps
					String nodeId = customStepsArray.getString(x);
					customSteps.add(nodeId);
				}
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		
		//create a file handle to the project file
		File projectFile = new File(projectPath);
		
		//the hash map to store workgroup id to period id
		HashMap<Integer, Integer> workgroupIdToPeriodId = new HashMap<Integer, Integer>();
		
		String teacherWorkgroupId = "";
		
		//create an array to hold all the teacher workgroup ids
		teacherWorkgroupIds = new ArrayList<String>();
		
		JSONObject project = null;
		
		try {
			//get the project JSON object
			project = new JSONObject(FileManager.getFileText(projectFile));
			
			//create the map of node ids to node titles
			makeNodeIdToNodeTitleAndNodeMap(project);
			
			/*
			 * create the list of node ids in the order they appear in the project.
			 * this also creates the map of node ides to node titles with positions
			 */
			makeNodeIdList(project);
			
			//get the nodes
			JSONArray nodes = project.getJSONArray("nodes");
			
			//loop through all the nodes
			for(int x = 0; x < nodes.length(); x++){
				//get a node
				JSONObject node = nodes.getJSONObject(x);
				
				try {
					//get the text from the file
					String fileText = FileManager.getFileText(new File(projectFile.getParentFile(), node.getString("ref")));
					
					//get the content for the node
					JSONObject nodeContent = new JSONObject(fileText);
					
					//put an entry into the hashmap with key as node id and value as JSON node content
					nodeIdToNodeContent.put(node.getString("identifier"), nodeContent);
				} catch(IOException e) {
					e.printStackTrace();
				} catch(JSONException e) {
					e.printStackTrace();
				}
			}
			
			//get the array of classmates
			//JSONArray classmateUserInfosJSONArray = new JSONArray(classmateUserInfos);
			
			//get the teacher user info
			//teacherUserInfoJSONObject = new JSONObject(teacherUserInfo);
			
			//get the owner teacher workgroup id
			teacherWorkgroupId = teacherUserInfoJSONObject.getString("workgroupId");
			
			//add the owner teacher
			teacherWorkgroupIds.add(teacherWorkgroupId);
			
			//get the shared teacher user infos
			//JSONArray sharedTeacherUserInfosJSONArray = new JSONArray(sharedTeacherUserInfos);
			
			//loop through all the shared teacher user infos
			for(int z=0; z<sharedTeacherUserInfosJSONArray.length(); z++) {
				//get a shared teacher
				JSONObject sharedTeacherJSONObject = (JSONObject) sharedTeacherUserInfosJSONArray.get(z);
				
				if(sharedTeacherJSONObject != null) {
					if(sharedTeacherJSONObject.has("workgroupId")) {
						//get the shared teacher workgroup id
						String sharedTeacherWorkgroupId = sharedTeacherJSONObject.getString("workgroupId");
						
						//add the shared teacher workgroup id to the array
						teacherWorkgroupIds.add(sharedTeacherWorkgroupId);
					}
				}
			}
			
			
			//loop through all the classmates
			for(int y=0; y<classmateUserInfosJSONArray.length(); y++) {
				//get a classmate
				JSONObject classmate = classmateUserInfosJSONArray.getJSONObject(y);
				
				//make sure workgroupId and periodId exist and are not null
				if(classmate.has("workgroupId") && !classmate.isNull("workgroupId")) {
					//get the workgroup id for the classmate
					int workgroupId = classmate.getInt("workgroupId");
					
					if(classmate.has("periodId") && !classmate.isNull("periodId")) {
						//get the period id for the classmate
						int periodId = classmate.getInt("periodId");
						
						//put an entry into the hashmap with key as workgroup id and value as period id
						workgroupIdToPeriodId.put(workgroupId, periodId);
					}
					
					if(classmate.has("periodName") && !classmate.isNull("periodName")) {
						//get the period name such as 1, 2, 3, or 4, etc.
						String periodName = classmate.getString("periodName");
						workgroupIdToPeriodName.put(workgroupId, periodName);
					}
					
					if(classmate.has("userIds") && !classmate.isNull("userIds")) {
						/*
						 * get the student logins, this is a single string with the logins
						 * separated by ':'
						 */
						String userIds = classmate.getString("userIds");
						workgroupIdToUserIds.put(workgroupId, userIds);
					}
					
					if(classmate.has("periodId") && !classmate.isNull("periodId") &&
							classmate.has("periodName") && !classmate.isNull("periodName") &&
							classmate.has("userIds") && !classmate.isNull("userIds")) {

						//add the workgroup id string to the List of workgroup ids
						workgroupIds.add(workgroupId + "");
					}
					
					if(classmate.has("wiseIds") && !classmate.isNull("wiseIds")) {
						//get the wise ids for this workgroup
						JSONArray wiseIds = classmate.getJSONArray("wiseIds");
						workgroupIdToWiseIds.put(workgroupId, wiseIds);
					}
				}
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
	    
	    if(exportType.equals("specialExport")) {

	    	String nodeTitleWithPosition = "Step " + nodeIdToNodeTitlesWithPosition.get(nodeId);
	    	String fileName = projectName + "-" + runId + "-" + nodeTitleWithPosition;
	    	fileName = fileName.replaceAll(" ", "_");
	    	
	    	/*
	    	 * we will return a zipped folder that contains all the necessary
	    	 * files to view the student work
	    	 */
	    	response.setContentType("application/zip");
			response.addHeader("Content-Disposition", "attachment;filename=\"" + fileName + ".zip" + "\"");
			
			//create a folder that will contain all the files and will then be zipped
			File zipFolder = new File(fileName);
			zipFolder.mkdir();
			
			//create the file that will contain all the data in a JSON object
			File dataFile = new File(zipFolder, "data.js");
			
			JSONObject data = new JSONObject();
			JSONArray students = new JSONArray();
			
			try {
				//add the project, run, and step information
				data.put("projectName", projectName);
				data.put("projectId", projectId);
				data.put("runId", runId);
				data.put("stepName", nodeTitleWithPosition);
				data.put("nodeId", nodeId);
			} catch (JSONException e1) {
				e1.printStackTrace();
			}
			
			String nodeType = "";
			
			//get the step content
			JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
			
			if(nodeContent != null) {
				try {
					//get the node type e.g. SVGDraw or mysystem2
					nodeType = nodeContent.getString("type");
					
					if(nodeType != null) {
						//make the node type lower case for easy comparison later
						nodeType = nodeType.toLowerCase();
					}
				} catch (JSONException e) {
					e.printStackTrace();
				}
			}
			
			if(nodeType == null) {
				
			} else if(nodeType.equals("svgdraw")) {
				if(wiseBaseDir != null && wiseBaseDir != "") {
					//get the lz77.js file from the server
					File sourcelz77File = new File(wiseBaseDir + "/vle/node/draw/svg-edit/lz77.js");
					
					//create a lz77.js file in the folder we are creating
					File newlz77File = new File(zipFolder, "lz77.js");
					
					//copy the contents of the lz77.js file into our new file
					FileUtils.copyFile(sourcelz77File, newlz77File);
					
					//get the viewStudentWork.html file for svgdraw
					File sourceViewStudentWorkFile = new File(wiseBaseDir + "/vle/node/draw/viewStudentWork.html");
					
					//create a viewStudentWork.html file in the folder we are creating
					File newViewStudentWorkFile = new File(zipFolder, "viewStudentWork.html");
					
					//copy the contents of the viewStudentWork.html file into our new file
					FileUtils.copyFile(sourceViewStudentWorkFile, newViewStudentWorkFile);
				}
			} else if(nodeType.equals("mysystem2")) {
				if(wiseBaseDir != null && wiseBaseDir != "") { 
					MySystemExporter myExporter  = new MySystemExporter(wiseBaseDir,zipFolder);
					myExporter.copyFiles();
				}
			} else if(nodeType.equals("sensor")) {
				if(wiseBaseDir != null && wiseBaseDir != "") {
					//get the paths of all the files we need to copy
					Vector<String> filesToCopy = new Vector<String>();
					filesToCopy.add(wiseBaseDir + "/vle/content/content.js");
					filesToCopy.add(wiseBaseDir + "/vle/common/helperfunctions.js");
					filesToCopy.add(wiseBaseDir + "/vle/jquery/js/flot/jquery.flot.js");
					filesToCopy.add(wiseBaseDir + "/vle/jquery/js/flot/jquery.js");
					filesToCopy.add(wiseBaseDir + "/vle/node/Node.js");
					filesToCopy.add(wiseBaseDir + "/vle/data/nodevisit.js");
					filesToCopy.add(wiseBaseDir + "/vle/node/sensor/sensor.js");
					filesToCopy.add(wiseBaseDir + "/vle/node/sensor/SensorNode.js");
					filesToCopy.add(wiseBaseDir + "/vle/node/sensor/sensorstate.js");
					filesToCopy.add(wiseBaseDir + "/vle/node/sensor/viewStudentWork.html");
					
					//loop through all the file paths
					for(int x=0; x<filesToCopy.size(); x++) {
						//get a file path
						String filePath = filesToCopy.get(x);
						
						//copy the file to our zip folder
						copyFileToFolder(filePath, zipFolder);
					}
					
					//get the path to the step content file
					String projectFolderPath = projectPath.substring(0, projectPath.lastIndexOf("/"));
					
					//get the original step content file
					File originalStepContentFile = new File(projectFolderPath + "/" + nodeId);
					
					//get the content as a string
					String stepContentString = FileUtils.readFileToString(originalStepContentFile);
					
					//make a variable definition for the step content object so we can access it as a variable
					stepContentString = "var stepContent = " + stepContentString + ";";
					
					//create the new file
					File newStepContentFile = new File(zipFolder, "stepContent.js");
					
					//write the step content to the stepContent.js file
					FileUtils.writeStringToFile(newStepContentFile, stepContentString);
				}
			}
			
			//loop through the workgroup ids
			for(int x=0; x<workgroupIds.size(); x++) {
				//get a workgroup id
				String userId = workgroupIds.get(x);
				Long userIdLong = Long.parseLong(userId);
				
				//get the UserInfo object for the workgroup id
				UserInfo userInfo = vleService.getUserInfoByWorkgroupId(userIdLong);
				
				//get the wise ids
				JSONArray wiseIds = workgroupIdToWiseIds.get(Integer.parseInt(userId));

				//get all the work for a workgroup id
				List<StepWork> stepWorksForWorkgroupId = vleService.getStepWorksByUserInfo(userInfo);
				
				//get all the step works for this node id
				List<StepWork> stepWorksForNodeId = getStepWorksForNodeId(stepWorksForWorkgroupId, nodeId);
				
				JSONArray studentDataArray = new JSONArray();
				
				//loop through all the step works
				for(int y=0; y<stepWorksForNodeId.size(); y++) {
					//get a stepwork
					StepWork stepWork = stepWorksForNodeId.get(y);
					
					//get the student data from the step work
					JSONObject studentData = getStudentData(stepWork);
					
					//put the student data into the student data array
					studentDataArray.put(studentData);
				}
				
				JSONObject studentObject = new JSONObject();
				try {
					//put the workgroup id into the student object
					studentObject.put("workgroupId", userIdLong);
					
					//put the wise ids into the student object
					studentObject.put("wiseIds", wiseIds);
					
					//put the array of student work into the student object
					studentObject.put("studentDataArray", studentDataArray);
				} catch (JSONException e) {
					e.printStackTrace();
				}
				
				//add the student object into the array
				students.put(studentObject);
			}
			
			try {
				//put the student array into the data object
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
			
			//write the data to the data.js file
			FileUtils.writeStringToFile(dataFile, javascriptDataString);
			
			//get the response output stream
			ServletOutputStream outputStream = response.getOutputStream();
			
			//create ZipOutputStream object
			ZipOutputStream out = new ZipOutputStream(
					new BufferedOutputStream(outputStream));
			
			//get path prefix so that the zip file does not contain the whole path
			// eg. if folder to be zipped is /home/lalit/test
			// the zip file when opened will have test folder and not home/lalit/test folder
			int len = zipFolder.getAbsolutePath().lastIndexOf(File.separator);
			String baseName = zipFolder.getAbsolutePath().substring(0,len+1);
			
			//add the folder to the zip file
			addFolderToZip(zipFolder, out, baseName);
			
			//close the zip output stream
			out.close();
			
			//delete the folder that has been created on the server
			FileUtils.deleteDirectory(zipFolder);
	    }
		
	    //perform cleanup
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
		
		if(jsonObject != null) {
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
			
			if(jsonArrayString != null && !jsonArrayString.equals("")) {
				//make the object declaration string
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
		
		//get the step work id
		Long stepWorkId = stepWork.getId();
		
		try {
			//set the step work id
			studentData.put("stepWorkId", stepWorkId);
			
			//set the default value in case there is no data
			studentData.put("data", JSONObject.NULL);
			
			//get the step work data
			String data = stepWork.getData();
			
			if(data != null && !data.equals("")) {
				//get the JSONObject of the data
				JSONObject jsonData = new JSONObject(data);
				
				//put the data into the object we will return
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
		//the list of StepWorks that will contain the StepWorks we want
		List<StepWork> filteredStepWorks = new Vector<StepWork>();
		
		//iterator for the list of StepWorks we will filter
		Iterator<StepWork> stepWorksIterator = stepWorks.iterator();
		
		//loop through all the StepWorks
		while(stepWorksIterator.hasNext()) {
			//get a StepWork
			StepWork stepWork = stepWorksIterator.next();
			
			//get the node id for the StepWork
			String stepWorkNodeId = stepWork.getNode().getNodeId();
			
			//see if the node id matches the node id we are looking for
			if(stepWorkNodeId != null && stepWorkNodeId.equals(nodeId)) {
				/*
				 * add the StepWork to our list of StepWorks that have the
				 * node id we want
				 */
				filteredStepWorks.add(stepWork);
			}
		}
		
		//return the list of StepWorks that are for the node id we want
		return filteredStepWorks;
	}
	
	private static void addFolderToZip(File folder, ZipOutputStream zip, String baseName) throws IOException {
		File[] files = folder.listFiles();
		for (File file : files) {
			if (file.isDirectory()) {
				// add folder to zip
				String name = file.getAbsolutePath().substring(baseName.length());
				ZipEntry zipEntry = new ZipEntry(name+"/");
				zip.putNextEntry(zipEntry);
				zip.closeEntry();
				addFolderToZip(file, zip, baseName);
			} else {
				// it's a file.				
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
		
		if(timestamp != null) {
			//get the object to format timestamps
			DateFormat dateTimeInstance = DateFormat.getDateTimeInstance();
			
			//get the timestamp for the annotation
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
		//loop through all the stuent attendance rows
		for(int x=0; x<studentAttendanceArray.length(); x++) {
			try {
				//get a student attendence row
				JSONObject studentAttendanceEntry = studentAttendanceArray.getJSONObject(x);
				
				//get the workgroup id
				long workgroupId = studentAttendanceEntry.getLong("workgroupId");
				
				//get the JSONArray that holds all the student attendence entries for this workgroup id
				JSONArray workgroupIdStudentAttendance = workgroupIdToStudentAttendance.get(workgroupId);
				
				if(workgroupIdStudentAttendance == null) {
					//the JSONArray does not exist so we will create it
					workgroupIdStudentAttendance = new JSONArray();
					workgroupIdToStudentAttendance.put(workgroupId, workgroupIdStudentAttendance);
				}
				
				//add the student attendence entry to the JSONArray
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
			//get the array of nodes defined in the project
			JSONArray nodesJSONArray = project.getJSONArray("nodes");
			
			//loop through all the nodes
			for(int x=0; x<nodesJSONArray.length(); x++) {
				//get a node
				JSONObject node = nodesJSONArray.getJSONObject(x);
				
				if(node != null) {
					//obtain the id and title
					String nodeId = node.getString("identifier");
					String title = node.getString("title");
					
					if(nodeId != null && title != null) {
						//put the id and title into the map
						nodeIdToNodeTitles.put(nodeId, title);
					}
					
					if(nodeId != null) {
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
		//make a new Vector and set it to the global list object
		nodeIdList = new Vector<String>();
		
		try {
			//get the sequences
			JSONArray sequences = project.getJSONArray("sequences");
			
			//get the start point of the project
			String startPoint = project.getString("startPoint");
			
			//pass startsequence to recursive function that traverses activities and steps
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
	private void traverseNodeIdsToMakeNodeIdList(JSONArray sequences, String identifier, String positionSoFar, int nodePosition, String startPoint) {
		try {
			//try to get the project sequence with the given identifier
			JSONObject projectSequence = getProjectSequence(sequences, identifier);
			
			if(projectSequence == null) {
				//the identifier actually points to a node, this is our base case
				
				//whether to include the data for this step in the export
				boolean exportStep = true;
				
				if(customSteps.size() != 0) {
					//the teacher has provided a list of custom steps
					
					if(!customSteps.contains(identifier)) {
						//the current node id is not listed in the custom steps so we will not export the data for it
						exportStep = false;
					}
				}
				
				if(exportStep) {
					//we will export the data for this step
					
					//add the identifier to our list of nodes
					nodeIdList.add(identifier);
					
					//obtain the title of the node
					String nodeTitle = nodeIdToNodeTitles.get(identifier);
					
					//add the pre-pend the position to the title
					String nodeTitleWithPosition = positionSoFar + nodePosition + " " + nodeTitle;
					
					//add the title with position to the map
					nodeIdToNodeTitlesWithPosition.put(identifier, nodeTitleWithPosition);					
				}
			} else {
				//the identifier points to a sequence so we need to loop through its refs
				JSONArray refs = projectSequence.getJSONArray("refs");
				
				if(!identifier.equals(startPoint)) {
					/*
					 * only do this for sequences that are not the startsequence otherwise
					 * all the positions would start with "1."
					 * so instead of Activity 2, Step 5 being 1.2.5 we really just want 2.5
					 */
					positionSoFar = positionSoFar + nodePosition + ".";
				}
				
				//loop through all the refs
				for(int x=0; x<refs.length(); x++) {
					//get the identifier for a ref
					String refIdentifier = refs.getString(x);
					
					//recursively call the traverse function on the refs
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
		//loop through all the sequences
		for(int x=0; x<sequences.length(); x++) {
			try {
				//get a sequence
				JSONObject sequence = sequences.getJSONObject(x);
				
				if(sequence != null) {
					//check if the identifier of the sequence is the one we want
					if(sequence.getString("identifier").equals(sequenceId)) {
						//return the sequence since we have found it
						return sequence;
					}
				}
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		
		//we did not find the sequence we wanted
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
		 * if the path is /Users/geoffreykwan/dev/apache-tomcat-7.0.28/webapps/wise/vle/jquery/js/flot/jquery.js
		 * the file name will be
		 * jquery.js
		 */
		String fileName = sourcePath.substring(sourcePath.lastIndexOf("/"));
		
		//get the source file
		File sourceFile = new File(sourcePath);
		
		//create the destination file
		File destinationFile = new File(folder, fileName);
		
		try {
			//copy the file
			FileUtils.copyFile(sourceFile, destinationFile);
		} catch (IOException e) {
			e.printStackTrace();
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

	public WorkgroupService getWorkgroupService() {
		return workgroupService;
	}

	public void setWorkgroupService(WorkgroupService workgroupService) {
		this.workgroupService = workgroupService;
	}

	public StudentAttendanceService getStudentAttendanceService() {
		return studentAttendanceService;
	}

	public void setStudentAttendanceService(StudentAttendanceService studentAttendanceService) {
		this.studentAttendanceService = studentAttendanceService;
	}

	public Properties getWiseProperties() {
		return wiseProperties;
	}

	public void setWiseProperties(Properties wiseProperties) {
		this.wiseProperties = wiseProperties;
	}
}
