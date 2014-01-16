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

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

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
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.attendance.StudentAttendance;
import org.wise.portal.domain.module.impl.CurnitGetCurnitUrlVisitor;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.ProjectMetadata;
import org.wise.portal.domain.run.Run;
import org.wise.portal.presentation.web.controllers.run.RunUtil;
import org.wise.portal.service.attendance.StudentAttendanceService;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.vle.VLEService;
import org.wise.portal.service.workgroup.WorkgroupService;
import org.wise.vle.domain.annotation.Annotation;
import org.wise.vle.domain.ideabasket.IdeaBasket;
import org.wise.vle.domain.node.Node;
import org.wise.vle.domain.peerreview.PeerReviewWork;
import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.work.StepWork;
import org.wise.vle.utils.FileManager;
import org.wise.vle.utils.SecurityUtils;

import au.com.bytecode.opencsv.CSVWriter;

/**
 * Handles student work export in XLS format
 * @author Geoffrey Kwan
 */
public class VLEGetXLS extends AbstractController {

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
	
	private HashMap<Integer, String> periodIdToPeriodName = new HashMap<Integer, String>();
	
	private HashMap<String, Integer> nodeIdToStepVisitCount = new HashMap<String, Integer>();
	
	private HashMap<String, Integer> nodeIdToStepRevisionCount = new HashMap<String, Integer>();
	
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
	
	//used to keep track of the number of oversized (larger than 32767 char) responses
	private long oversizedResponses = 0;
	
	//the file type to generate e.g. "xls" or "csv"
	private String fileType = null;
	
	//the writer to generate the csv file
	private CSVWriter csvWriter = null;
	
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
		periodIdToPeriodName = new HashMap<Integer, String>();
		nodeIdToStepVisitCount = new HashMap<String, Integer>();
		nodeIdToStepRevisionCount = new HashMap<String, Integer>();
		
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
		
		//holds the number of oversized responses
		oversizedResponses = 0;

		//holds the file type e.g. "xls" or "csv"
		fileType = null;
		
		//clear the object that writes csv
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
	
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		return doGet(request, response);
	}
	
	/**
	 * Generates and returns an excel xls of exported student data.
	 */
	public ModelAndView doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		/* make sure that this request is authenticated through the portal before proceeding */
		if (SecurityUtils.isPortalMode(request) && !SecurityUtils.isAuthenticated(request)) {
			/* not authenticated send not authorized status */
			response.sendError(HttpServletResponse.SC_FORBIDDEN);
			return null;
		}

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
		
		//the export type "latestStudentWork" or "allStudentWork"
		exportType = request.getParameter("exportType");

		Run run = null;
		try {
			if(runId != null) {
				//get the run object
				run = runService.retrieveById(new Long(runId));				
			}
		} catch (ObjectNotFoundException e1) {
			e1.printStackTrace();
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
		
		if (projectMetaDataJSONString != null) {
			try {
				//get the project meta data JSON object
				projectMetaData = new JSONObject(projectMetaDataJSONString);
			} catch (JSONException e2) {
				e2.printStackTrace();
			}
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
		
		//get the file type "xls" or "csv"
		fileType = request.getParameter("fileType");
		
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
					//get a handle on the node file
					File nodeFile = new File(projectFile.getParentFile(), node.getString("ref"));

					if(nodeFile.exists()) {
						//get the text from the file
						String fileText = FileManager.getFileText(nodeFile);

						//get the content for the node
						JSONObject nodeContent = new JSONObject(fileText);
						
						//put an entry into the hashmap with key as node id and value as JSON node content
						nodeIdToNodeContent.put(node.getString("identifier"), nodeContent);						
					}
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
					Integer workgroupId = null;
					
					try {
						workgroupId = classmate.getInt("workgroupId");
					} catch(JSONException e) {
						workgroupId = null;
					}
					
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
					
					if(classmate.has("periodId") && !classmate.isNull("periodId") &&
							classmate.has("periodName") && !classmate.isNull("periodName")) {
						//get the period id for the classmate
						int periodId = classmate.getInt("periodId");
						
						//get the period name such as 1, 2, 3, or 4, etc.
						String periodName = classmate.getString("periodName");
						
						//check if we already have a key with this period id
						if(!periodIdToPeriodName.containsKey(new Integer(periodId))) {
							//we do not have this period id yet so we will add it
							periodIdToPeriodName.put(new Integer(periodId), periodName);
						}
					}
					
					if(classmate.has("userIds") && !classmate.isNull("userIds")) {
						/*
						 * get the student user ids, this is a single string with the user ids
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
				}
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		//the variable that will hold the excel document object
		Workbook wb = null;
				
		if(isFileTypeXLS(fileType)) {
			//we are going to return an xls file
			response.setContentType("application/vnd.ms-excel");
		} else if(isFileTypeCSV(fileType)) {
			//we are going to return a csv file
			response.setContentType("text/csv");
			
			//get the writer for the response
			PrintWriter writer = response.getWriter();
			
			//create the csvWriter which we will write to as we create the csv file
			csvWriter = new CSVWriter(writer);
		} else {
			//error
		}
		
		//generate the export
	    if(exportType == null) {
	    	//error
	    } else if(exportType.equals("latestStudentWork")) {
	    	response.setHeader("Content-Disposition", "attachment; filename=\"" + projectName + "-" + runId + "-latest-student-work." + fileType + "\"");
	    	wb = getLatestStudentWorkXLSExport(nodeIdToNodeTitlesWithPosition, workgroupIds, nodeIdList, runId, nodeIdToNode, nodeIdToNodeContent, workgroupIdToPeriodId, teacherWorkgroupIds);
	    } else if(exportType.equals("allStudentWork")) {
	    	response.setHeader("Content-Disposition", "attachment; filename=\"" + projectName + "-" + runId + "-all-student-work." + fileType + "\"");
	    	wb = getAllStudentWorkXLSExport(nodeIdToNodeTitlesWithPosition, workgroupIds, runId, nodeIdToNode, nodeIdToNodeContent, workgroupIdToPeriodId, teacherWorkgroupIds);
	    } else if(exportType.equals("ideaBaskets")) {
	    	response.setHeader("Content-Disposition", "attachment; filename=\"" + projectName + "-" + runId + "-idea-baskets." + fileType + "\"");
	    	wb = getIdeaBasketsExcelExport(nodeIdToNodeTitlesWithPosition, workgroupIds, runId, nodeIdToNode, nodeIdToNodeContent, workgroupIdToPeriodId, teacherWorkgroupIds);
	    } else if(exportType.equals("explanationBuilderWork")) {
	    	response.setHeader("Content-Disposition", "attachment; filename=\"" + projectName + "-" + runId + "-explanation-builder-work." + fileType + "\"");
	    	wb = getExplanationBuilderWorkExcelExport(nodeIdToNodeTitlesWithPosition, workgroupIds, runId, nodeIdToNode, nodeIdToNodeContent, workgroupIdToPeriodId, teacherWorkgroupIds);
	    } else if(exportType.equals("customLatestStudentWork")) {
	    	response.setHeader("Content-Disposition", "attachment; filename=\"" + projectName + "-" + runId + "-custom-latest-student-work." + fileType + "\"");
	    	wb = getLatestStudentWorkXLSExport(nodeIdToNodeTitlesWithPosition, workgroupIds, nodeIdList, runId, nodeIdToNode, nodeIdToNodeContent, workgroupIdToPeriodId, teacherWorkgroupIds);
	    } else if(exportType.equals("customAllStudentWork")) {
	    	response.setHeader("Content-Disposition", "attachment; filename=\"" + projectName + "-" + runId + "-custom-all-student-work." + fileType + "\"");
	    	wb = getAllStudentWorkXLSExport(nodeIdToNodeTitlesWithPosition, workgroupIds, runId, nodeIdToNode, nodeIdToNodeContent, workgroupIdToPeriodId, teacherWorkgroupIds);
	    } else if(exportType.equals("flashStudentWork")) {
	    	response.setHeader("Content-Disposition", "attachment; filename=\"" + projectName + "-" + runId + "-custom-flash-student-work." + fileType + "\"");
	    	wb = getFlashWorkExcelExport(nodeIdToNodeTitlesWithPosition, workgroupIds, runId, nodeIdToNode, nodeIdToNodeContent, workgroupIdToPeriodId, workgroupIds);
	    } else {
	    	//error
	    }

	    if(isFileTypeXLS(fileType)) {
	    	//we need to write the xls file to the response
	    	
		    //get the response output stream
		    ServletOutputStream outputStream = response.getOutputStream();

		    if(wb != null) {
				//write the excel xls to the output stream
				wb.write(outputStream);
			}	    	
	    }
	    
	    if(oversizedResponses > 0) {
			System.out.println("Oversized Responses: " + oversizedResponses);
		}
	    
		clearVariables();
		
		return null;
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
	 * Retrieves the JSONObject for a sequence with the given sequenceId
	 * 
	 * @param sequences a JSONArray of sequence JSONObjects
	 * @param sequenceId the identifier of the sequence we want
	 * 
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
		//try to get the node type from the step work
		String nodeType = stepWork.getNode().getNodeType();
		
		if(nodeType == null) {
			/*
			 * we could not get the node type from the Node object so
			 * we will get it from the stepwork data
			 */
			String data = stepWork.getData();
			nodeType = getNodeTypeFromStepWorkJSONString(data);		
		}
		
		/*
		 * remove the "Node" portion of the node type
		 * e.g. NoteNode just becomes Note
		 */
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
		
		if(stepWorkJSONString != null) {
			try {
				//make the JSON object
				JSONObject stepWorkJSONObject = new JSONObject(stepWorkJSONString);
				
				//get the node type from the JSON object
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
		
		if(stepWorkJSONObject != null) {
			//check if the JSON object has a nodeType field
			if(stepWorkJSONObject.has("nodeType")) {
				try {
					//get the nodeType
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
		
		if(isFileTypeXLS(fileType)) {
			//we are generating an xls file so we will create the workbook
			wb = new XSSFWorkbook();
		}
		
		List<Node> customNodes = null;
		
		if(customSteps.size() != 0) {
			//the teacher has provided a list of custom steps to export
			
			//get all the Node objects for the custom steps
			customNodes = vleService.getNodesByNodeIdsAndRunId(customSteps, runId);
		}
		
		//loop through all the workgroup ids
		for(int x=0; x<workgroupIds.size(); x++) {
			//get a workgroup id
			String workgroupIdString = workgroupIds.get(x);
			
			//get the UserInfo object for the workgroup id
			//UserInfo userInfo = UserInfo.getByWorkgroupId(Long.parseLong(workgroupIdString));
			UserInfo userInfo = vleService.getUserInfoByWorkgroupId(Long.parseLong(workgroupIdString));

			if(userInfo != null) {
				//get the workgroup id
				Long workgroupId = userInfo.getWorkgroupId();
				int workgroupIdInt = workgroupId.intValue();

				//get the period id
				int periodId = workgroupIdToPeriodId.get(workgroupIdInt);
				
				List<StepWork> stepWorks = new ArrayList<StepWork>();
				
				if(customNodes == null) {
					//the teacher has not provided a list of custom steps so we will gather work for all the steps
					//get all the work for that workgroup id
					stepWorks = vleService.getStepWorksByUserInfo(userInfo);
				} else {
					if(customNodes.size() > 0) {
						//the teacher has provided a list of custom steps so we will gather the work for those specific steps
						stepWorks = vleService.getStepWorksByUserInfoAndNodeList(userInfo, customNodes);						
					}
				}
				
				//create a sheet in the excel for this workgroup id
				XSSFSheet userIdSheet = null;
				
				if(wb != null) {
					//create the sheet since we are generating an xls file
					userIdSheet = wb.createSheet(workgroupIdString);
				}
				
				//clear the step visit count
				clearStepVisitCount();
				
				//clear the step revision count
				clearStepRevisionCount();
				
				int rowCounter = 0;
				
				//counter for the header column cells
				int headerColumn = 0;
				
				//create the first row which will contain the headers
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
		    	headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Time Spent (Seconds)");
		    	
		    	//header time the student spent on the step in seconds column
		    	headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Teacher Score Timestamp");
		    	
		    	//header time the student spent on the step in seconds column
		    	headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Teacher Score");
		    	
		    	//header time the student spent on the step in seconds column
		    	headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Teacher Comment Timestamp");
		    	
		    	//header time the student spent on the step in seconds column
		    	headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Teacher Comment");
		    	
		    	//header classmate id for review type steps
		    	headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Classmate Id");
		    	
		    	//header receiving text for review type steps
		    	headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Receiving Text");
		    	
		    	//header student work column
		    	headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, "Student Work");

		    	//write the csv row if we are generating a csv file
		    	writeCSV(headerRowVector);
		    	
				//get all the work for a workgroup id
				List<StepWork> stepWorksForWorkgroupId = vleService.getStepWorksByUserInfo(userInfo);
				
		    	/*
		    	 * loop through all the work for the current student, this will
		    	 * already be ordered chronologically
		    	 */
		    	for(int y=0; y<stepWorks.size(); y++) {
					/*
					 * get a student work row which represents the work they
					 * performed for a single step visit
					 */
			    	StepWork stepWork = stepWorks.get(y);
			    	
			    	//get the step work id
			    	Long stepWorkId = stepWork.getId();
			    	
			    	//get the start and end time
			    	Timestamp startTime = stepWork.getStartTime();
			    	Timestamp endTime = stepWork.getEndTime();
			    	Timestamp postTime = stepWork.getPostTime();
			    	
			    	//get the node id
			    	String nodeId = stepWork.getNode().getNodeId();
			    	
			    	//get the node title
			    	String nodeTitle = nodeIdToNodeTitlesMap.get(nodeId);
			    	
			    	//get the node type
			    	String nodeType = getNodeTypeFromStepWork(stepWork);
			    	
			    	//get the step work data
			    	String stepWorkData = stepWork.getData();
			    	
			    	//increase the step visit count and get the current value
			    	int stepVisitCount = increaseStepVisitCount(nodeId);
			    	
			    	//get the node content
			    	JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
			    	//check to see if node exists. if not, node has been deleted, so ignore it
			    	if (nodeContent == null) {
			    		continue;
			    	}
			    	
			    	//get the step prompt
			    	String nodePrompt = getPromptFromNodeContent(nodeContent);
			    	
			    	//get the node object
			    	JSONObject nodeJSONObject = nodeIdToNode.get(nodeId);
			    	
			    	String wiseId1 = "";
					String wiseId2 = "";
					String wiseId3 = "";
					
					//get the post time in milliseconds
			    	long timestamp = postTime.getTime();
			    	
			    	/*
			    	 * get the student attendance that is relevant to the step work. we will
			    	 * look for the first student attendance entry for this workgroup id
			    	 * that has a login timestamp before the start time of this step work
			    	 */
			    	JSONObject studentAttendanceForWorkgroupIdTimestamp = getStudentAttendanceForWorkgroupIdTimestamp(workgroupId, timestamp);
			    	
			    	if(studentAttendanceForWorkgroupIdTimestamp == null) {
			    		/*
			    		 * we could not find a student attendance entry so this probably
			    		 * means this step work was created before we started logging 
			    		 * student absences. we will just display all the student ids for
			    		 * the workgroup in this case.
			    		 */
			    		
			    		//get all the user ids for this workgroup
			    		String userIds = workgroupIdToUserIds.get(Integer.parseInt(workgroupId + ""));
			    		
						//the user ids string is delimited by ':'
						String[] userIdsArray = userIds.split(":");
						
						//sort the user ids numerically and put them into a list
						ArrayList<Long> userIdsList = sortUserIdsArray(userIdsArray);
						
						//loop through all the user ids in this workgroup
						for(int z=0; z<userIdsList.size(); z++) {
							//get a user id
							Long wiseId = userIdsList.get(z);
							
							//set the appropriate wise id
							if(z == 0) {
								wiseId1 = wiseId + "";
							} else if(z == 1) {
								wiseId2 = wiseId + "";
							} else if(z == 2) {
								wiseId3 = wiseId + "";
							}
						}
			    	} else {
				    	try {
				    		//get the present and absent user ids
							JSONArray presentUserIds = studentAttendanceForWorkgroupIdTimestamp.getJSONArray("presentUserIds");
							JSONArray absentUserIds = studentAttendanceForWorkgroupIdTimestamp.getJSONArray("absentUserIds");
							
							HashMap<Long, String> studentAttendanceMap = new HashMap<Long, String>();
							ArrayList<Long> userIds = new ArrayList<Long>();
							
							//loop through all the present user ids
							for(int a=0; a<presentUserIds.length(); a++) {
								long presentUserId = presentUserIds.getLong(a);
								studentAttendanceMap.put(presentUserId, "Present");
								userIds.add(presentUserId);
							}
							
							//loop through all the absent user ids
							for(int b=0; b<absentUserIds.length(); b++) {
								long absentUserId = absentUserIds.getLong(b);
								studentAttendanceMap.put(absentUserId, "Absent");
								userIds.add(absentUserId);
							}
							
							//sort the user ids numerically
							Collections.sort(userIds);
							
							//loop through all the user ids
							for(int c=0; c<userIds.size(); c++) {
								//get a user id
								Long tempUserId = userIds.get(c);
								
								//get whether the stuent was "Present" or "Absent"
								String studentAttendanceStatus = studentAttendanceMap.get(tempUserId);
								
								String studentAttendanceStatusSuffix = "";
								
								if(studentAttendanceStatus != null && studentAttendanceStatus.equals("Absent")) {
									//the student was absent
									studentAttendanceStatusSuffix = " Absent";
								}
								
								//set the appropriate wise id
								if(c == 0) {
									wiseId1 = tempUserId + studentAttendanceStatusSuffix;
								} else if(c == 1) {
									wiseId2 = tempUserId + studentAttendanceStatusSuffix;
								} else if(c == 2) {
									wiseId3 = tempUserId + studentAttendanceStatusSuffix;
								}
							}
						} catch (JSONException e) {
							e.printStackTrace();
						}		    		
			    	}
			    	
			    	try {
			    		//get the step work data as a JSONObject
						JSONObject stepWorkDataJSON = new JSONObject(stepWorkData);
						
						//check if there are are node states
						if(stepWorkDataJSON.has("nodeStates")) {
							
							//get the node states
							JSONArray nodeStates = stepWorkDataJSON.getJSONArray("nodeStates");
							
							//write the student work rows for the node states
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
		
		if(nodeStates.length() == 0) {
			//the node states is empty so we will fill out the row but without student work
			
	    	//there is no student work
			JSONObject nodeState = null;
			
			//write the row for the node state
			rowCounter = writeAllStudentWorkNodeState(userIdSheet, rowCounter, nodeId, workgroupId, wiseId1, wiseId2, wiseId3, stepWorkId, stepVisitCount, nodeTitle, nodeType, nodePrompt, nodeContent, startTime, endTime, postTime, stepWork, periodId, userInfo, stepWorksForWorkgroupId, nodeJSONObject, nodeState);
		} else {
			//loop through all the node states
			for(int i=0; i<nodeStates.length(); i++) {
				try {
					//get a node state
					JSONObject nodeState = nodeStates.getJSONObject(i);
					
					//write the row for the node state
					rowCounter = writeAllStudentWorkNodeState(userIdSheet, rowCounter, nodeId, workgroupId, wiseId1, wiseId2, wiseId3, stepWorkId, stepVisitCount, nodeTitle, nodeType, nodePrompt, nodeContent, startTime, endTime, postTime, stepWork, periodId, userInfo, stepWorksForWorkgroupId, nodeJSONObject, nodeState);
				} catch (JSONException e) {
					e.printStackTrace();
				}
			}
		}
		
		return rowCounter;
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
			JSONObject nodeState) {
		
    	//get the student work columns for this node state if export columns were authored
    	ArrayList<ArrayList<Object>> columns = getExportColumnDataValues(nodeState, nodeId);
    	
    	//get the column names of the export columns if they were authored
    	ArrayList<Object> columnNames = getExportColumnNames(nodeId);
    	
    	//create rows from the student work columns
    	ArrayList<ArrayList<Object>> rows = getRowsFromColumns(columns);

		//increment the step revision count for this step
		increaseStepRevisionCount(nodeId);
		
    	if(rows.size() > 0) {
    		//there are rows
    		
    		//loop through all the rows
    		for(int x=0; x<rows.size(); x++) {
    			//get a row
    			ArrayList<Object> row = rows.get(x);

    			//write the row to the excel
    			writeAllStudentWorkRow(userIdSheet, rowCounter, nodeId, workgroupId, wiseId1, wiseId2, wiseId3, stepWorkId, stepVisitCount, nodeTitle, nodeType, nodePrompt, nodeContent, startTime, endTime, postTime, stepWork, periodId, userInfo, stepWorksForWorkgroupId, nodeJSONObject, columnNames, row);
    			
    			//update the row counter
    			rowCounter++;
    		}
    	} else {
    		//there are no rows

    		ArrayList<Object> row = new ArrayList<Object>();

    		//get the student work
    		row = getNodeStateWorkForShowAllWork(nodeState, nodeId, nodeType);
    		
    		//get the column names that will be placed as comments over the student work cells
    		columnNames = getDefaultColumnNames(nodeId, nodeType, nodeState);

    		//write the row to the excel
    		writeAllStudentWorkRow(userIdSheet, rowCounter, nodeId, workgroupId, wiseId1, wiseId2, wiseId3, stepWorkId, stepVisitCount, nodeTitle, nodeType, nodePrompt, nodeContent, startTime, endTime, postTime, stepWork, periodId, userInfo, stepWorksForWorkgroupId, nodeJSONObject, columnNames, row);
    		
    		//update the row counter
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
	private ArrayList<Object> getNodeStateWorkForShowAllWork(JSONObject nodeState, String nodeId, String nodeType) {
		ArrayList<Object> row = new ArrayList<Object>();
		
		if(nodeState != null) {
			if(nodeType == null) {

			} else if(nodeType.equals("AssessmentList")) {
				//this is work for an assessment list
				
				try {
					//get the step content
					JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
					
					//get the assessments array that contains the students answers for each part
					JSONArray assessments = nodeState.getJSONArray("assessments");
					
					//loop through all the parts in the assessment
					for(int x=0; x<assessments.length(); x++) {
						//get a part
						JSONObject assessmentPart = assessments.getJSONObject(x);
						
						String response = null;

						//check if the response is null
						if(!assessmentPart.isNull("response")) {
							//get the response object
							JSONObject responseObject = assessmentPart.optJSONObject("response");
							
							if(responseObject != null) {
								//get the response text
								String responseText = responseObject.optString("text");

								if(responseText != null) {
									response = responseText;
								}
							}
						}
						
						if(response == null) {
							row.add("");
						} else {
							row.add(response);
						}
					}
					
					boolean isLockAfterSubmit = false;
					
					if(nodeContent != null && nodeContent.has("isLockAfterSubmit")) {
						try {
							//get whether this step locks after submit
							isLockAfterSubmit = nodeContent.getBoolean("isLockAfterSubmit");
						} catch (JSONException e) {
							//e.printStackTrace();
						}
					}
					
					if(isLockAfterSubmit) {
						//this step locks after submit
						
						//check if the student submitted
						boolean isSubmit = nodeState.getBoolean("isSubmit");
						
						//add the isSubmit value
						row.add(isSubmit);
					}
				} catch (JSONException e) {
					//e.printStackTrace();
				}
			} else {
	    		//get the response
	    		String response = getNodeStateResponse(nodeState, nodeId);
	    		
	    		//put the response in the row
	    		row.add(response);
			}
		}
		
		return row;
	}
	
	/**
	 * Get the default column names for the step
	 * @param nodeId the id for the node
	 * @param nodeType the node type
	 * @param nodeState the student work node state
	 * @return the column names that we will display as comments in the student work cell
	 */
	private ArrayList<Object> getDefaultColumnNames(String nodeId, String nodeType, JSONObject nodeState) {
		ArrayList<Object> columnNames = new ArrayList<Object>();
		
		if(nodeType == null) {
			
		} else if(nodeType.equals("AssessmentList")) {
			//the step is an assessment list step
			
			if(nodeState != null) {
				//get the assessment parts from the student work
				JSONArray assessments = nodeState.optJSONArray("assessments");
				
				if(assessments != null) {
					//loop through all the parts
					for(int x=0; x<assessments.length(); x++) {
						String prompt = null;
						
						//get the assessment object
						JSONObject assessment = assessments.optJSONObject(x);
						
						if(assessment != null) {
							//get the assessment id
							String assessmentId = assessment.optString("id");
							
							if(assessmentId != null) {
								//get the prompt for the assessment id
								prompt = getAssessmentPromptByAssessmentId(nodeId, assessmentId);								
							}
						}
						
						if(prompt == null) {
							columnNames.add("");
						} else {
							columnNames.add(prompt);
						}
					}		
				}

				//get the step content
				JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
				
				boolean isLockAfterSubmit = false;
				
				if(nodeContent != null && nodeContent.has("isLockAfterSubmit")) {
					try {
						//get whether this step locks after submit
						isLockAfterSubmit = nodeContent.getBoolean("isLockAfterSubmit");
					} catch (JSONException e) {
						//e.printStackTrace();
					}
				}
				
				if(isLockAfterSubmit) {
					//this step locks after submit
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
		
		if(nodeId != null && assessmentId != null) {
			//get the node content
			JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
			
			if(nodeContent != null) {
				//get the assessments
				JSONArray assessments = nodeContent.optJSONArray("assessments");
				
				if(assessments != null) {
					
					//loop through all the assessment parts
					for(int x=0; x<assessments.length(); x++) {
						//get an assessment
						JSONObject tempAssessment = assessments.optJSONObject(x);
						
						if(tempAssessment != null) {
							//get the assessment id
							String tempAssessmentId = tempAssessment.optString("id");
						
							//check if this is the assessment id we want
							if(assessmentId.equals(tempAssessmentId)) {
								//this is the assessment id we want so we will get the prompt
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
	 * @return
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
			ArrayList<Object> row) {
    	
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
		
    	//set the step work id
    	tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, stepWorkId);
    	
    	//set the title
    	tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, nodeTitle);
    	
    	//set the step visit count
    	tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, stepVisitCount);
    	
    	//set the step revision count
    	tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, stepRevisionCount);
    	
    	//set the node type
    	tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, nodeType);
    	
    	//set the prompt
    	tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, nodePrompt);
    	
    	//set the node id
    	tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, nodeId);
    	
    	//set the post time
    	tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, timestampToFormattedString(postTime));
    	
    	//set the start time
    	tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, timestampToFormattedString(startTime));

    	/*
    	 * check if the end time is null which may occur if the student is
    	 * currently working on that step, or if there was some kind of
    	 * bug/error
    	 */
    	if(endTime != null) {
    		//set the end time
    		tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, timestampToFormattedString(endTime));
    	} else {
    		//there was no end time so we will leave it blank
    		tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, "");
    	}
    	
    	long timeSpentOnStep = 0;
    	
    	//calculate the time the student spent on the step
    	if(endTime == null || startTime == null) {
    		//set to -1 if either start or end was null so we can set the cell to N/A later
    		timeSpentOnStep = -1;
    	} else {
    		/*
    		 * find the difference between start and end and divide by
    		 * 1000 to obtain the value in seconds
    		 */
    		timeSpentOnStep = (endTime.getTime() - startTime.getTime()) / 1000;	
    	}
    	
    	//set the time spent on the step
    	if(timeSpentOnStep == -1) {
    		tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, "N/A");
    	} else {
    		tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, timeSpentOnStep);
    	}
    	
    	//create a list to add the StepWork to
    	List<StepWork> stepWorkList = new ArrayList<StepWork>();
    	stepWorkList.add(stepWork);
    	
    	//set the latest annotation score and timestamp
    	tempColumn = setLatestAnnotationScoreAndTimestamp(stepWorkList, tempRow, tempRowVector, tempColumn);
    	
    	//set the latest annotation comment and timestamp
    	tempColumn = setLatestAnnotationCommentAndTimestamp(stepWorkList, tempRow, tempRowVector, tempColumn);
    	
		/*
		 * set the review cells, if the current step does not utilize any review
		 * functionality, it will simply fill the cells with "N/A"
		 */
    	tempColumn = setGetLatestStudentWorkReviewCells(teacherWorkgroupIds, stepWorksForWorkgroupId, runId, periodId, userInfo, nodeJSONObject, nodeContent, tempRow, tempRowVector, tempColumn, "allStudentWork");
    	
    	if(row != null) {
    		//loop through all the elements in the array
    		for(int x=0; x<row.size(); x++) {
    			//get an element
        		Object object = row.get(x);

        		if(object != null) {
        			//this column has student data
        			
        			//get the column index
        			int cellColumn = tempColumn;
        			
        			if(object instanceof String) {
        				//set the cell string value
                		tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, (String) object);        				
        			} else if(object instanceof Long) {
        				//set the cell long value
                		tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, (Long) object);        				
        			} else if(object instanceof Integer) {
        				//set the cell integer value
                		tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, (Integer) object);
        			} else if(object instanceof Double) {
        				//set the cell integer value
                		tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, (Double) object);
        			} else if(object instanceof Float) {
        				//set the cell integer value
                		tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, (Float) object);
        			} else {
        				//set the cell value as a string
        				tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, object.toString());
        			}
        			
        			//check if there are column names
            		if(columnNames != null) {
            			/*
            			 * there are column names so we will make sure there is a column name
            			 * available for this column index
            			 */
            			if(columnNames.size() > x) {
            				//there is a column name for the column index so we will get the column name for the column
            				String comment = (String) columnNames.get(x);
                			
                			if(comment != null) {
                				/*
                				 * set the column name as a comment for the cell which will display when
                				 * the user mouseovers the cell
                				 */
                				setCellComment(userIdSheet, tempRow, cellColumn, comment);
                			}            				
            			}
            		}
        		} else {
        			//this column does not have student data so we will move the column counter to skip this cell
        			tempColumn++;
        			
        			//add an empty element to the row vector
        			addEmptyElementsToVector(tempRowVector, 1);
        		}
        	}    		
    	}

    	//write the csv row if we are generating a csv file
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
		if(row != null) {
			//get the cell
			Cell cell = row.getCell(column);
			
			if(cell != null) {
				if(sheet != null) {
					//make the comment
					XSSFComment cellComment = sheet.createDrawingPatriarch().createCellComment(new XSSFClientAnchor());
					cellComment.setString(comment);

					//add the comment to the cell
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
		//an array to hold the rows
		ArrayList<ArrayList<Object>> rows = new ArrayList<ArrayList<Object>>();
		
		if(columns != null) {
			
			//loop through all the columns
			for(int x=0; x<columns.size(); x++) {
				
				//get a column
				ArrayList<Object> column = columns.get(x);

				if(column != null) {
					
					//loop through all the data values in the column
					for(int y=0; y<column.size(); y++) {
						Object dataValue = null;
						
						try {
							//get a data value
							dataValue = column.get(y);	
						} catch(IndexOutOfBoundsException e) {
							
						}
						
						ArrayList<Object> row = null;
						
						try {
							//get the row that we will put the data value in
							row = rows.get(y);
						} catch(IndexOutOfBoundsException e) {
							
						}
						
						if(row == null) {
							//the row does not exist so we will create it
							row = new ArrayList<Object>();
							rows.add(y, row);
						}
						
						//set the data value into the row
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
		if(row != null) {
			
			//check if the array is large enough to insert an element at the given index
			if(row.size() <= index) {
				/*
				 * it is not large enough so we will insert empty values into the array
				 * until it is large enough
				 */
				while(row.size() <= index) {
					row.add("");
				}
			}

			//set the value into the array
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
		//an array to hold the rows
		ArrayList<ArrayList<Object>> rows = new ArrayList<ArrayList<Object>>();
		
		if(columnNames != null && columnNames.size() > 0) {
			//output the column names
			System.out.println("columnNames");
			System.out.println(columnNames);
		}

		//get the column data in row format
		rows = getRowsFromColumns(columns);

		if(rows != null && rows.size() > 0) {
			//output the student data value rows
			System.out.println("columnValues");
			
			//loop through all the rows
			for(int rowsCounter=0; rowsCounter<rows.size(); rowsCounter++) {
				//get a row
				ArrayList<Object> row = rows.get(rowsCounter);
				
				//output the row
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
		//the column names
		ArrayList<Object> columnNames = new ArrayList<Object>();
		
		//get the export column objects
		JSONArray exportColumns = getExportColumns(nodeId);
		
		if(exportColumns != null) {
			
			//loop through all the export column objects
			for(int x=0; x<exportColumns.length(); x++) {
				try {
					//get an export column object
					JSONObject exportColumn = exportColumns.getJSONObject(x);
					
					//get the column name
					String columnName = exportColumn.getString("columnName");
					
					//add the column name to our array
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
	private boolean isExportColumnReferencingSameObject(JSONObject exportColumn1, JSONObject exportColumn2, int depth) {
		boolean result = false;
		
		String field1 = null;
		String field2 = null;
		
		//get the field of the first export column
		if(exportColumn1 != null && exportColumn1.has("field")) {
			try {
				field1 = exportColumn1.getString("field");
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		
		//get the field of the second export column
		if(exportColumn2 != null && exportColumn2.has("field")) {
			try {
				field2 = exportColumn2.getString("field");
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		
		JSONObject childField1 = null;
		JSONObject childField2 = null;
		
		//get the child field of the first export column
		if(exportColumn1 != null && exportColumn1.has("childField")) {
			try {
				childField1 = exportColumn1.getJSONObject("childField");
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		
		//get the child field of the second export column
		if(exportColumn2 != null && exportColumn2.has("childField")) {
			try {
				childField2 = exportColumn2.getJSONObject("childField");
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		
		if(depth == 0) {
			//we are on the first level
			
			if(exportColumn1 == null && exportColumn2 == null) {
				//both the export columns are null so they are not referencing the same object
				result = false;
			} else if(exportColumn1 != null && exportColumn2 == null) {
				//one of the export columns is null but the other is not so they are not referencing the same object
				result = false;
			} else if(exportColumn1 == null && exportColumn2 != null) {
				//one of the export columns is null but the other is not so they are not referencing the same object
				result = false;
			} else if(exportColumn1 != null && exportColumn2 != null) {
				//both export columns are not null so we will look at the fields
				
				if(field1 == null && field2 == null) {
					//both fields are null so they are not referencing the same object
					result = false;
				} else if(field1 != null && field2 == null) {
					//one of the fields is null but the other is not so they are not referencing the same object
					result = false;
				} else if(field1 == null && field2 != null) {
					//one of the fields is null but the other is not so they are not referencing the same object
					result = false;
				} else if(field1.equals(field2)) {
					/*
					 * the field values are the same so we will iterate to the child field objects
					 * to see if they are the same as well
					 */
					result = isExportColumnReferencingSameObject(childField1, childField2, depth + 1);
				} else if(!field1.equals(field2)) {
					//the field values are not null and not the same so they are not referencing the same object
					result = false;
				}
			}
		} else {
			//we are on a level deeper than the first level
			
			if(exportColumn1 == null && exportColumn2 == null) {
				/*
				 * both export columns are null and we are on a level deeper than the first
				 * which means the export columns are referencing the same object
				 * 
				 * example
				 * 
				 * exportColumn1 = {
				 * 		"field":"ideas",
				 * }
				 * 
				 * exportColumn2 = {
				 * 		"field":"ideas",
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
			} else if(exportColumn1 != null && exportColumn2 == null) {
				//one of the export columns is null but the other is not so they are not referencing the same object
				result = false;
			} else if(exportColumn1 == null && exportColumn2 != null) {
				//one of the export columns is null but the other is not so they are not referencing the same object
				result = false;
			} else if(exportColumn1 != null && exportColumn2 != null) {
				//both export columns are not null so we will look at the fields
				
				if(field1 == null && field2 == null) {
					//both field values are null so we will compare the child field objects
					result = isExportColumnReferencingSameObject(childField1, childField2, depth + 1);
				} else if(field1 != null && field2 == null) {
					//one of the fields is null but the other is not so they are not referencing the same object
					result = false;
				} else if(field1 == null && field2 != null) {
					//one of the fields is null but the other is not so they are not referencing the same object
					result = false;
				} else if(field1.equals(field2)) {
					/*
					 * the field values are the same so we will iterate to the child field objects
					 * to see if they are the same as well
					 */
					result = isExportColumnReferencingSameObject(childField1, childField2, depth + 1);
				} else if(!field1.equals(field2)) {
					//the fields are not the same
					
					if(childField1 == null && childField2 == null) {
						/*
						 * there are no child fields so we have reached the leaf nodes which means they
						 * are referencing the same object
						 */
						result = true;
					} else if(childField1 != null && childField2 == null) {
						//one of the columns has a child field but the other does not so they are not referencing the same object
						result = false;
					} else if(childField1 == null && childField2 != null) {
						//one of the columns has a child field but the other does not so they are not referencing the same object
						result = false;
					} else if(childField1 != null && childField2 != null) {
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
	 * @param nodeState the node state
	 * @param nodeId the node if of the step
	 * @return the student data values columns. this is a two dimensional array
	 * with the first dimension being the columns and the second dimension being
	 * the rows.
	 */
	private ArrayList<ArrayList<Object>> getExportColumnDataValues(JSONObject nodeState, String nodeId) {
		//holds the columns and values of the columns
		ArrayList<ArrayList<Object>> columns = new ArrayList<ArrayList<Object>>();
		
		//holds the number of times a column was expanded and multiplied
		ArrayList<ArrayList<Integer>> expandAndMultiplyAmountsList = new ArrayList<ArrayList<Integer>>();
		
		if(nodeState != null) {
			//get the export columns for the step
			JSONArray exportColumns = getExportColumns(nodeId);
			
			if(exportColumns != null) {
				//keep track of the export columns we have visited
				JSONArray visitedExportColumns = new JSONArray();
				
				//loop through all the export columns
				for(int columnIndex=0; columnIndex<exportColumns.length(); columnIndex++) {
					try {
						//get an export column
						JSONObject exportColumn = exportColumns.getJSONObject(columnIndex);
						
						//used to hold the visited column that references the same object
						ArrayList<Integer> relatedColumnExpandAndMultiplyAmounts = null;
						
						/*
						 * loop through all the visited export columns to check if there are
						 * any that reference the same object. if there is a column that references
						 * the same object, we need to apply the same expansion and muliplying
						 * for our new column.
						 */
						for(int visitedColumnIndex=0; visitedColumnIndex<visitedExportColumns.length(); visitedColumnIndex++) {
							//get a visited export column
							JSONObject visitedExportColumn = visitedExportColumns.getJSONObject(visitedColumnIndex);
							
							//check if our current column references the same object as the visited export column
							boolean isExportColumnReferencingSameObject = isExportColumnReferencingSameObject(visitedExportColumn, exportColumn, 0);
							
							if(isExportColumnReferencingSameObject) {
								/*
								 * our current column references the same object so we will get the
								 * expand and multipley amounts for the visited export column so we
								 * can apply it to our new column.
								 */
								relatedColumnExpandAndMultiplyAmounts = expandAndMultiplyAmountsList.get(visitedColumnIndex);
								break;
							}
						}
						
						//get the student data values for the field
						ArrayList<Object> newColumn = getColumnValuesForField(exportColumn, nodeState);
						
						if(relatedColumnExpandAndMultiplyAmounts == null) {
							//we did not find any previous columns that referenced the same object
							
							//get the column size
							int newColumnSize = newColumn.size();

							//get the length of the previous columns. all the columns will be the same length
							int previousColumnLength = getColumnLength(columns);
							
							if(previousColumnLength == 0) {
								previousColumnLength = 1;
							}
							
							if(newColumnSize > 1) {
								//the column size is greater than 1
								
								if(columnIndex == 0) {
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
									
									//we need to update how much we expanded or multiplied the previous columns
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
									
									//add the column
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
								//the column size is 0 or 1
								
								//we need to update how much we expanded or multiplied the previous columns
								updateExpandAndMultiplyAmounts(expandAndMultiplyAmountsList, newColumnSize);
								
								//add the new column to the columns
								columns.add(newColumn);
								
								//create the expand and multiply amounts for this new column
								ArrayList<Integer> timesMultipliedList = new ArrayList<Integer>();
								timesMultipliedList.add(previousColumnLength);
								
								/*
								 * add the expand and multiply amounts for this new column 
								 * to the expand and multiply amounts list
								 */
								expandAndMultiplyAmountsList.add(columnIndex, timesMultipliedList);
							}
						} else {
							//we found a previous column that referenced the same object
							
							//loop through all the expand and mulitply values for the related column
							for(int expandAndMultiplyIndex=0; expandAndMultiplyIndex<relatedColumnExpandAndMultiplyAmounts.size(); expandAndMultiplyIndex++) {
								//get an expand or multiply value
								int tempTimesMultiplied = relatedColumnExpandAndMultiplyAmounts.get(expandAndMultiplyIndex);
								
								if(expandAndMultiplyIndex == 0) {
									//the first index value is always the expand value
									
									//expand the values in the new column
									newColumn = expandColumn(newColumn, tempTimesMultiplied);
								} else {
									//all index values after the first index value are multiply values
									
									//multiply the column
									newColumn = multiplyColumn(newColumn, tempTimesMultiplied);
								}
							}
							
							//update the expand and multiply values for the previous columns
							updateExpandAndMultiplyAmounts(expandAndMultiplyAmountsList, 1);
							
							//multiply all the columns
							columns = multiplyColumns(columns, 1);
							
							//add the new column
							columns.add(newColumn);
							
							//create the expand and multiply amounts for this new column
							ArrayList<Integer> timesMultipliedList = new ArrayList<Integer>();
							timesMultipliedList.add(1);
							
							/*
							 * add the expand and multiply amounts for this new column 
							 * to the expand and multiply amounts list
							 */
							expandAndMultiplyAmountsList.add(columnIndex, timesMultipliedList);
						}
						
						//add the export column definition to our array of visited export columns
						visitedExportColumns.put(exportColumn);
					} catch (JSONException e) {
						e.printStackTrace();
					}
				}
			}
		}
		
		//return all the columns with the student data in them
		return columns;
	}
	
	/**
	 * Get the length of the columns. All the columns should be the same length.
	 * @param columns the columns
	 * @return the length of the columns
	 */
	private int getColumnLength(ArrayList<ArrayList<Object>> columns) {
		int length = 0;
		
		if(columns != null && columns.size() > 0) {
			//get the first column
			ArrayList<Object> column = columns.get(0);
			
			//get the size of the column. all other columns should be the same length.
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
		
		if(timesMultiplied != null) {
			//loop through all the columns
			for(int x=0; x<timesMultiplied.size(); x++) {
				//get a column's expand and multiply values
				ArrayList<Integer> timesMultipliedArray = timesMultiplied.get(x);
				
				//add the multiply amount to the array
				timesMultipliedArray.add(times);
			}			
		}
		
		//return the updated expand and multiply arrays
		return timesMultiplied;
	}
	
	/**
	 * Multiply the columns
	 * @param columns the columns
	 * @param times the number of times to multiply the columns
	 * @return the updated columns
	 */
	private ArrayList<ArrayList<Object>> multiplyColumns(ArrayList<ArrayList<Object>> columns, int times) {
		//the array to hold the new columns
		ArrayList<ArrayList<Object>> newColumns = new ArrayList<ArrayList<Object>>();
		
		//loop through all the columns
		for(int x=0; x<columns.size(); x++) {
			//get a column
			ArrayList<Object> column = columns.get(x);
			
			//make a new column
			ArrayList<Object> newColumn = new ArrayList<Object>();
			
			//add the new column to our new columns array
			newColumns.add(x, newColumn);
			
			/*
			 * multiply the column by adding all the values into the new column
			 * multiple times
			 */
			for(int y=0; y<times; y++) {
				newColumn.addAll(column);				
			}
		}
		
		//return the new multiplied columns
		return newColumns;
	}
	
	/**
	 * Multiply a single column
	 * @param column the column
	 * @param times the number of times to multiply the column
	 * @return the updated column
	 */
	private ArrayList<Object> multiplyColumn(ArrayList<Object> column, int times) {
		//the new column
		ArrayList<Object> newColumn = new ArrayList<Object>();
		
		/*
		 * multiply the column by adding all the values into the new column
		 * multiple times
		 */
		for(int y=0; y<times; y++) {
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
		//the new column
		ArrayList<Object> newColumn = new ArrayList<Object>();
		
		//loop through all the columns
		for(int x=0; x<column.size(); x++) {
			//get an element in the column
			Object columnValue = column.get(x);
			
			//add the element a certain number of times to the new column
			for(int y=0; y<times; y++) {
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
		
		//get the response
		String response = getNodeStateResponse(nodeState, nodeId);
		
		if(response != null) {
			//set the response into the cell
			tempColumn = setCellValue(tempRow, tempRowVector, tempColumn, response);
		} else {
			//increment the column counter
			tempColumn++;
			
			//add an empty element in the vector to move to the next column
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
		//get the step visit count
		Integer count = nodeIdToStepVisitCount.get(nodeId);
		
		if(count == null) {
			//there was no entry for the node id so we will intialize the value
			count = 0;
		}
		
		//increment the count
		count++;
		
		//update the new step visit count in our hashmap
		nodeIdToStepVisitCount.put(nodeId, count);
		
		return count;
	}
	
	/**
	 * Get the step visit count for a step
	 * @param nodeId the node id
	 * @return the step visit count for a step
	 */
	private int getStepVisitCount(String nodeId) {
		//get the step visit count
		Integer count = nodeIdToStepVisitCount.get(nodeId);
		
		if(count == null) {
			//there was no entry for the node id
			count = 0;
		}
		
		return count;
	}
	
	/*
	 * Clear the step revision count for all steps
	 */
	private void clearStepRevisionCount() {
		nodeIdToStepRevisionCount = new HashMap<String, Integer>();
	}
	
	/**
	 * Increase the step revision count for a step
	 * @param nodeId the node id
	 * @return the new step revision count
	 */
	private int increaseStepRevisionCount(String nodeId) {
		//get the step revision count
		Integer count = nodeIdToStepRevisionCount.get(nodeId);
		
		if(count == null) {
			//there was no entry for the node id so we will intialize the value
			count = 0;
		}
		
		//increment the count
		count++;
		
		//update the new step revision count in our hashmap
		nodeIdToStepRevisionCount.put(nodeId, count);
		
		return count;
	}
	
	/**
	 * Get the step revision count for a step
	 * @param nodeId the node id
	 * @return the step revision count for a step
	 */
	private int getStepRevisionCount(String nodeId) {
		//get the step revision count
		Integer count = nodeIdToStepRevisionCount.get(nodeId);
		
		if(count == null) {
			//there was no entry for the node id
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
		
		if(isFileTypeXLS(fileType)) {
			//create the excel workbook
			wb = new XSSFWorkbook();
			
			//create the sheet that will contain all the data
			XSSFSheet mainSheet = wb.createSheet("Latest Work For All Students");
		} else if(isFileTypeCSV(fileType)) {
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
		
		//set the student work
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
		
		if(workbook != null) {
			//workbook is not null which means we are generating an xls file
			
			//get the sheet
			mainSheet = workbook.getSheetAt(0);
			
			//get the next empty row
			rowCounter = mainSheet.getLastRowNum() + 1;
		}

		//loop through the workgroup ids
		for(int x=0; x<workgroupIds.size(); x++) {
			//create a row for this workgroup
			Row rowForWorkgroupId = createRow(mainSheet, x + rowCounter);
			Vector<String> rowForWorkgroupIdVector = createRowVector();
			
			int workgroupColumnCounter = 0;
			
			//get a workgroup id
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
			
			//get the UserInfo object for the workgroup id
			UserInfo userInfo = vleService.getUserInfoByWorkgroupId(Long.parseLong(userId));

			//get all the work for a workgroup id
			List<StepWork> stepWorksForWorkgroupId = vleService.getStepWorksByUserInfo(userInfo);
			
			//loop through all the node ids which are ordered
			for(int y=0; y<nodeIdList.size(); y++) {
				//get a node id
				String nodeId = nodeIdList.get(y);
				
				//get the content for the node
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

				//get all the step works for this node id
				List<StepWork> stepWorksForNodeId = getStepWorksForNodeId(stepWorksForWorkgroupId, nodeId);
				
				//get the latest step work that contains a response
				StepWork latestStepWorkWithResponse = getLatestStepWorkWithResponse(stepWorksForNodeId);
				
				//set the step work data into the row in the given column
				workgroupColumnCounter = setStepWorkResponse(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, latestStepWorkWithResponse, nodeId);

				//check if this step utilizes CRater scoring
				if(isCRaterType(nodeContent)) {
					//set the latest CRater score and timestamp
					workgroupColumnCounter = setLatestCRaterScoreAndTimestamp(stepWorksForNodeId, rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter);
				}
				
				//set the latest annotation score and timestamp from any of the teachers
				workgroupColumnCounter = setLatestAnnotationScoreAndTimestamp(stepWorksForNodeId, rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter);
				
				//set the latest annotation comment and timestamp from any of the teachers
				workgroupColumnCounter = setLatestAnnotationCommentAndTimestamp(stepWorksForNodeId, rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter);
			}
			
			//write the csv row if we are generating a csv file
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
			//try to see if the step is a review type of step
			if(nodeJSONObject == null) {
				//do nothing, this function will assume this step is not a review type
			} else if(nodeJSONObject.has("peerReview")) {
				reviewType = nodeJSONObject.getString("peerReview");
			} else if(nodeJSONObject.has("teacherReview")) {
				reviewType = nodeJSONObject.getString("teacherReview");
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		boolean addedReviewColumns = false;
		
		if(reviewType.equals("annotate")) {
			/*
			 * this is a step where the student reads work from their classmate and
			 * writes feedback/annotates it
			 */
			
			try {
				if(nodeJSONObject.has("peerReview")) {
					/*
					 * this is when the student receives classmate work to view and
					 * write a peer review
					 */
					
					//get the start/original node
					String associatedStartNodeId = nodeJSONObject.getString("associatedStartNode");
					Node node = vleService.getNodeByNodeIdAndRunId(associatedStartNodeId, runId);
					
					//get the PeerReviewWork row that contains the classmate matching
					PeerReviewWork peerReviewWork = vleService.getPeerReviewWorkByRunPeriodNodeReviewerUserInfo(new Long(runId), new Long(periodId), node, userInfo);
					
					if(peerReviewWork != null) {
						//get the owner of the work
						UserInfo userInfoReviewed = peerReviewWork.getUserInfo();
						
						//get the workgroup id of the owner of the work
						Long workgroupIdReviewed = userInfoReviewed.getWorkgroupId();
						
						//get the StepWork
						StepWork peerReviewStepWork = peerReviewWork.getStepWork();
						
						//get the actual work from the classmate
						String reviewedWork = getStepWorkResponse(peerReviewStepWork);
						
						if(workgroupIdReviewed == -2) {
							//the student received the canned response
							workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, "Canned Response");
							
							//get the work that the student read
							String authoredWork = nodeContent.getString("authoredWork");
							
							//set the canned work
							workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, authoredWork);
						} else {
							//set the workgroup id of their classmate
							workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, workgroupIdReviewed);
							
							//set the work from their classmate
							workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, reviewedWork);
						}
						
						addedReviewColumns = true;
					}
				} else if(nodeJSONObject.has("teacherReview")) {
					/*
					 * this is when the student receives the pre-written/canned work
					 * to view and write a peer review
					 */
					
					//get the pre-written/canned work
					String authoredWork = nodeContent.getString("authoredWork");
					
					//set the workgroup id of their classmate
					workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, "Teacher Response");
					
					//set the work from their classmate
					workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, authoredWork);
					
					addedReviewColumns = true;
				}
			} catch (JSONException e) {
				e.printStackTrace();
			}
			
			//check if we incremented the columns
			if(!addedReviewColumns) {
				//the columns need to be incremented even if there was no data
				workgroupColumnCounter += 2;
				addEmptyElementsToVector(rowForWorkgroupIdVector, 2);
			}
		} else if(reviewType.equals("revise")) {
			/*
			 * this is a step where the student reads an annotation from their classmate
			 * and revises their work based on it
			 */
			
			try {
				if(nodeJSONObject.has("peerReview")) {
					//get the start/original node
					String associatedStartNodeId = nodeJSONObject.getString("associatedStartNode");
					Node node = vleService.getNodeByNodeIdAndRunId(associatedStartNodeId, runId);
					
					//get the PeerReviewWork entry that contains the classmate matching
					PeerReviewWork peerReviewWork = vleService.getPeerReviewWorkByRunPeriodNodeWorkerUserInfo(new Long(runId), new Long(periodId), node, userInfo);
					
					if(peerReviewWork != null) {
						//get the person who reviewed me
						UserInfo reviewerUserInfo = peerReviewWork.getReviewerUserInfo();
						
						if(reviewerUserInfo != null) {
							//get the workgroup id of the reviewer
							Long reviewerWorkgroupId = reviewerUserInfo.getWorkgroupId();
							
							//get the annotation from the reviewer
							Annotation annotation = peerReviewWork.getAnnotation();
							
							if(annotation != null) {
								//get the annotation text the reviewer wrote
								String annotationData = annotation.getData();
								JSONObject annotationDataJSONObject = new JSONObject(annotationData);
								String annotationValue = annotationDataJSONObject.getString("value");
								
								//set the workgroup id of their classmate
								workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, reviewerWorkgroupId);
								
								//set the annotation from their classmate
								workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, annotationValue);
								
								addedReviewColumns = true;
							} else {
								if(reviewerWorkgroupId == -2) {
									//the student saw the canned review
									String authoredReview = nodeContent.getString("authoredReview");
									
									//set the workgroup id of their classmate
									workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, "Canned Response");
									
									//set the review the student received
									workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, authoredReview);
									
									addedReviewColumns = true;
								}
							}
						}
					}
				} else if(nodeJSONObject.has("teacherReview")) {
					//get the start/original node
					String associatedStartNodeId = nodeJSONObject.getString("associatedStartNode");
					
					//get the work for this node
					List<StepWork> stepWorksForNodeId = getStepWorksForNodeId(stepWorksForWorkgroupId, associatedStartNodeId);
					
					//get the latest work that contains a non-empty response
					StepWork latestStepWorkForNodeId = getLatestStepWorkWithResponse(stepWorksForNodeId);
					
					//get the teacher user infos
					List<UserInfo> fromWorkgroups = vleService.getUserInfoByWorkgroupIds(teacherWorkgroupIds);
					
					//get all annotation comments from all the teachers for this step work
					List<Annotation> annotations = vleService.getAnnotationByFromWorkgroupsAndStepWork(fromWorkgroups, latestStepWorkForNodeId, "comment");
					
					Annotation latestAnnotation = null;
					
					//loop through all the annotations we found to look for the latest one
					for(int x=0; x<annotations.size(); x++) {
						//get an annotation
						Annotation tempAnnotation = annotations.get(x);
						
						if(latestAnnotation == null) {
							//this is the first annotation we've found so we will set it as the latest
							latestAnnotation = tempAnnotation;
						} else {
							//check if the annotation we are on is later than our current latest
							if(tempAnnotation.getPostTime().getTime() > latestAnnotation.getPostTime().getTime()) {
								//set the annotation we are on as the latest
								latestAnnotation = tempAnnotation;
							}
						}
					}
					
					if(latestAnnotation != null) {
						//get the annotation text the teacher wrote
						String annotationData = latestAnnotation.getData();
						JSONObject annotationJSONObject = new JSONObject(annotationData);
						
						//set the workgroup id of their teacher
						workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, "Teacher Response");
						
						//set the annotation from their teacher
						workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, annotationJSONObject.getString("value"));
						
						addedReviewColumns = true;
					}
				}
			} catch (JSONException e) {
				e.printStackTrace();
			}
			
			//check if we incremented the columns
			if(!addedReviewColumns) {
				//the columns need to be incremented even if there was no data
				workgroupColumnCounter += 2;
				addEmptyElementsToVector(rowForWorkgroupIdVector, 2);
			}
		} else {
			//this work is not peer reviewed or teacher reviewed
			
			if(exportType.equals("allStudentWork")) {
				/*
				 * if this is for the all student work excel export, we will always need
				 * to fill the review cells
				 */
				workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, "N/A");
				workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, "N/A");
				addedReviewColumns = true;	
			} else if(exportType.equals("latestStudentWork")) {
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
		
		if(workbook != null) {
			//the workbook is not null which means we are generating an xls file
			mainSheet = workbook.getSheetAt(0);
		}
		
		int rowCounter = 0;
		int headerColumn = 0;
		
		//create the step title row
		Row stepTitleRow = createRow(mainSheet, rowCounter++);
		Vector<String> stepTitleRowVector = createRowVector();
		
		//create the step type row
		Row stepTypeRow = createRow(mainSheet, rowCounter++);
		Vector<String> stepTypeRowVector = createRowVector();
		
		//create the step prompt row
		Row stepPromptRow = createRow(mainSheet, rowCounter++);
		Vector<String> stepPromptRowVector = createRowVector();
		
		//create the node id row
		Row nodeIdRow = createRow(mainSheet, rowCounter++);
		Vector<String> nodeIdRowVector = createRowVector();

		//create the step type row
		Row stepExtraRow = createRow(mainSheet, rowCounter++);
		Vector<String> stepExtraRowVector = createRowVector();

		//create 5 empty columns in each of the rows because the first 5 columns are for the user data columns
		for(int x=0; x<5; x++) {
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
		for(int nodeIndex=0; nodeIndex<nodeIdList.size(); nodeIndex++) {
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

		//get the node title for the node id
		String nodeTitle = nodeIdToNodeTitlesMap.get(nodeId);
		
		JSONObject nodeJSONObject = nodeIdToNode.get(nodeId);
		
		//get the content for the node
		JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
		
		 if(isReviewType(nodeJSONObject)) {
			//the column is for a review type so we may need to allocate multiple columns
			columnCounter = setGetLatestStudentWorkReviewHeaderCells(
					stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow, 
					stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
					columnCounter, nodeId, nodeTitle, nodeJSONObject, nodeContent);
		} else if(isAssessmentListType(nodeContent)) {
			//the step is AssessmentList so we may need to allocate multiple columns 
			columnCounter = setGetLatestStudentWorkAssessmentListHeaderCells(
					stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow, 
					stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
					columnCounter, nodeId, nodeTitle, nodeContent);
		} else if(isCRaterType(nodeContent)) {
			//the step is uses CRater grading
			columnCounter = setGetLatestStudentWorkCRaterHeaderCells(
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
			if(nodeContent != null) {
				//get the node type
				nodeType = nodeContent.getString("type");
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		//get the prompt
		String nodePrompt = getPromptFromNodeContent(nodeContent);
		
		//set the step extra so the researcher knows this column is for the teacher score
		String stepExtra = "teacher score timestamp";
		
		//set the step extra cell
		columnCounter = setGetLatestStepWorkHeaderCells(
				columnCounter, 
				stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow,
				stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
				nodeTitle, nodeType, nodePrompt, nodeId, stepExtra);
		
		stepExtra = "teacher score";
		
		//set the step extra cell
		columnCounter = setGetLatestStepWorkHeaderCells(
				columnCounter, 
				stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow, 
				stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
				nodeTitle, nodeType, nodePrompt, nodeId, stepExtra);
		
		stepExtra = "teacher comment timestamp";
		
		//set the step extra cell
		columnCounter = setGetLatestStepWorkHeaderCells(
				columnCounter, 
				stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow, 
				stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
				nodeTitle, nodeType, nodePrompt, nodeId, stepExtra);
		
		//set the step extra so the researcher knows this column is for the teacher comment
		stepExtra = "teacher comment";
		
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
	 * 
	 * @param nodeJSONObject
	 * 
	 * @return the review type "start", "annotate", or "revise"
	 */
	private String getReviewType(JSONObject nodeJSONObject) {
		String reviewType = "";
		
		try {
			//check if the node is a review type
			if(nodeJSONObject == null) {
				//do nothing
			} else if(nodeJSONObject.has("peerReview")) {
				reviewType = nodeJSONObject.getString("peerReview");
			} else if(nodeJSONObject.has("teacherReview")) {
				reviewType = nodeJSONObject.getString("teacherReview");
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		return reviewType;
	}
	
	/**
	 * Check if the node is an AssessmentList
	 * 
	 * @param nodeContent
	 * 
	 * @return whether the node is an assessment list type
	 */
	private boolean isAssessmentListType(JSONObject nodeContent) {
		if(nodeContent == null) {
			return false;
		}
		
		String type = null;
		try {
			type = nodeContent.getString("type");
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		if(type == null) {
			return false;
		} else if(type.equals("AssessmentList")) {
			return true;
		} else {
			return false;
		}
	}
	
	/**
	 * Check if the node is a review type
	 * 
	 * @param nodeJSONObject
	 * 
	 * @return whether the node is a review type
	 */
	private boolean isReviewType(JSONObject nodeJSONObject) {
		if(nodeJSONObject == null) {
			return false;
		} else if(nodeJSONObject.has("peerReview") || nodeJSONObject.has("teacherReview")) {
			return true;
		} else {
			return false;			
		}
	}

	/**
	 * Check if the node is a peer review
	 * 
	 * @param nodeJSONObject
	 * 
	 * @return whether the node is a peer review
	 */
	@SuppressWarnings("unused")
	private boolean isPeerReview(JSONObject nodeJSONObject) {
		if(nodeJSONObject == null) {
			return false;
		} else if(nodeJSONObject.has("peerReview")) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Check if the node is a teacher review
	 * 
	 * @param nodeJSONObject
	 * 
	 * @return whether the node is a teacher review
	 */
	@SuppressWarnings("unused")
	private boolean isTeacherReview(JSONObject nodeJSONObject) {
		if(nodeJSONObject == null) {
			return false;
		} else if(nodeJSONObject.has("teacherReview")) {
			return true;
		} else {
			return false;
		}
	}
	
	/**
	 * Check if the review type is "annotate"
	 * 
	 * @param nodeJSONObject
	 * 
	 * @return whether the node is an annotate review type
	 */
	private boolean isAnnotateReviewType(JSONObject nodeJSONObject) {
		if(nodeJSONObject == null) {
			return false;
		} else {
			String reviewType = getReviewType(nodeJSONObject);
			
			return reviewType.equals("annotate");			
		}
	}
	
	/**
	 * Check if the review type is "revise"
	 * 
	 * @param nodeJSONObject
	 * 
	 * @return whether the node is a revise review type
	 */
	private boolean isReviseReviewType(JSONObject nodeJSONObject) {
		if(nodeJSONObject == null) {
			return false;
		} else {
			String reviewType = getReviewType(nodeJSONObject);
			
			return reviewType.equals("revise");			
		}
	}

	/**
	 * Check if the node is "annotate" or "revise" type
	 * 
	 * @param nodeJSONObject
	 * 
	 * @return whether the node is an annotate or revise review type
	 */
	private boolean isAnnotateOrReviseReviewType(JSONObject nodeJSONObject) {
		if(nodeJSONObject == null) {
			return false;
		}
		
		String reviewType = "";
		
		try {
			//check if the node is a review type
			if(nodeJSONObject.has("peerReview")) {
				reviewType = nodeJSONObject.getString("peerReview");
			} else if(nodeJSONObject.has("teacherReview")) {
				reviewType = nodeJSONObject.getString("teacherReview");
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		if(reviewType.equals("annotate") || reviewType.equals("revise")) {
			return true;
		} else {
			return false;			
		}
	}
	
	/**
	 * Check if the node utilizes CRater
	 * 
	 * @param nodeJSONObject the step content
	 * 
	 * @return whether the step uses CRater
	 */
	private boolean isCRaterType(JSONObject nodeJSONObject) {
		boolean result = false;
		
		if(nodeJSONObject == null) {
			result = false;
		} else {
			if(nodeJSONObject.has("cRater") && !nodeJSONObject.isNull("cRater")) {
				try {
					//get the CRater object in the content
					JSONObject cRaterJSONObject = nodeJSONObject.getJSONObject("cRater");
					
					if(cRaterJSONObject.has("cRaterItemId")) {
						String cRaterItemId = cRaterJSONObject.getString("cRaterItemId");
						
						//make sure the cRaterItemId is not null and not an empty string
						if(cRaterItemId != null && !cRaterItemId.equals("")) {
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
		
		//the default number of columns we need to fill for a node
		int columns = 1;
		
		if(isAnnotateOrReviseReviewType(nodeJSONObject)) {
			columns = 3;
		}

		//loop through the columns we need to fill for the current node
		for(int columnCount=0; columnCount<columns; columnCount++) {
			/*
			 * whether to set the cell value, usually this will stay true
			 * except when the cell value becomes set when we call another
			 * function that sets it for us
			 */
			boolean setCells = true;
			
			String nodeType = "";
			try {
				//get the node type
				nodeType = nodeContent.getString("type");
			} catch (JSONException e) {
				e.printStackTrace();
			}
			
			//get the node prompt
			String nodePrompt = getPromptFromNodeContent(nodeContent);
			
			//this is used for nodes that have sub parts
			String stepExtra = "";
			
			if(columns == 3) {
				if(columnCount == 0) {
					//cell 1/3
					
					//set the step extra to help researchers identify what this column represents
					if(isAnnotateReviewType(nodeJSONObject)) {
						stepExtra = "Workgroup I am writing feedback to";
					} else if(isReviseReviewType(nodeJSONObject)) {
						stepExtra = "Workgroup that is writing feedback to me";
					}
				} else if(columnCount == 1) {
					//cell 2/3
					
					//set the step extra to help researchers identify what this column represents
					if(isAnnotateReviewType(nodeJSONObject)) {
						stepExtra = "Work from other workgroup";
					} else if(isReviseReviewType(nodeJSONObject)) {
						stepExtra = "Feedback from workgroup";
					}
				} else if(columnCount == 2) {
					//cell 3/3
					
					if(isAssessmentListType(nodeContent)) {
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
						if(isAnnotateReviewType(nodeJSONObject)) {
							stepExtra = "Feedback written to other workgroup";
						} else if(isReviseReviewType(nodeJSONObject)) {
							stepExtra = "Work that I have revised based on feedback";
						}
					}
				}
			}
			
			if(setCells) {
				//set the cells
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
			//get the parts of the assessment
			assessmentParts = nodeContent.getJSONArray("assessments");
		} catch (JSONException e1) {
			e1.printStackTrace();
		}
		
		String nodeType = "";
		try {
			//get the node type
			nodeType = nodeContent.getString("type");
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		//get the prompt
		String nodePrompt = getPromptFromNodeContent(nodeContent);
		
		String stepExtra = "";
		
		//loop through each part in the assessment
		for(int x=0; x<assessmentParts.length(); x++) {
			try {
				stepExtra = "";
				
				//get an assessment part
				JSONObject assessmentPart = assessmentParts.getJSONObject(x);
				
				if(assessmentPart != null) {
					//get the prompt for the part
					String partPrompt = assessmentPart.getString("prompt");
					
					stepExtra = partPrompt;
					
					//set the header cells for the column
					columnCounter = setGetLatestStepWorkHeaderCells(columnCounter, 
							stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow, 
							stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
							nodeTitle, nodeType, nodePrompt, nodeId, stepExtra);
				}
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		
		if(nodeContent != null && nodeContent.has("isLockAfterSubmit")) {
			try {
				boolean isLockAfterSubmit = nodeContent.getBoolean("isLockAfterSubmit");
				
				if(isLockAfterSubmit) {
					/*
					 * this step locks after submit so we will create a header column
					 * for whether the student work "Is Submit"
					 */
					stepExtra = "Is Submit";
					
					//set the header cells for the column
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
			if(nodeContent != null) {
				//get the node type
				nodeType = nodeContent.getString("type");
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		//get the prompt
		String nodePrompt = getPromptFromNodeContent(nodeContent);
		
		String stepExtra = "";
		
		//set the header cells
		columnCounter = setGetLatestStepWorkHeaderCells(columnCounter, 
				stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow, 
				stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
				nodeTitle, nodeType, nodePrompt, nodeId, stepExtra);
		
		stepExtra = "CRater score timestamp";
		
		//set the crater header cells for the CRater score timestamp column
		columnCounter = setGetLatestStepWorkHeaderCells(columnCounter, 
				stepTitleRow, stepTypeRow, stepPromptRow, nodeIdRow, stepExtraRow, 
				stepTitleRowVector, stepTypeRowVector, stepPromptRowVector, nodeIdRowVector, stepExtraRowVector,
				nodeTitle, nodeType, nodePrompt, nodeId, stepExtra);
		
		stepExtra = "CRater score";
		
		//set the crater header cells for the CRater score column
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
			if(nodeContent != null) {
				//get the node type
				nodeType = nodeContent.getString("type");
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		//get the prompt
		String nodePrompt = getPromptFromNodeContent(nodeContent);
		
		String stepExtra = "";
		
		//set the header cells
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
		
		//set the cells for this column
		setCellValue(stepTitleRow, stepTitleRowVector, columnCounter, stepTitle);
		setCellValue(stepTypeRow, stepTypeRowVector, columnCounter, stepType);
		setCellValue(stepPromptRow, stepPromptRowVector, columnCounter, stepPrompt);
		setCellValue(nodeIdRow, nodeIdRowVector, columnCounter, nodeId);
		setCellValue(stepExtraRow, stepExtraRowVector, columnCounter, stepExtra);
		
		//increment the column counter
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
		
		/*
		 * loop through all the stepworks for the node id and find
		 * the latest work
		 */
		for(int z=stepWorks.size() - 1; z>=0; z--) {
			//get a step work
			StepWork tempStepWork = stepWorks.get(z);
			
			//retrieve the student work from the step work, if any
			stepWorkResponse = getStepWorkResponse(tempStepWork);
			
			/*
			 * if the step work is not empty, we are done looking
			 * for the latest work
			 */
			if(!stepWorkResponse.equals("")) {
				stepWork = tempStepWork;
				break;
			}
		}
		
		return stepWork;
	}
	
	/**
	 * Get the latest step work that has a non-empty response and return that response
	 * 
	 * @param stepWorks a list of StepWork objects
	 * 
	 * @return a String containing the latest response
	 */
	@SuppressWarnings("unused")
	private String getLatestStepWorkResponseWithResponse(List<StepWork> stepWorks) {
		StepWork latestStepWorkWithResponse = getLatestStepWorkWithResponse(stepWorks);
		
		if(latestStepWorkWithResponse != null) {
			return getStepWorkResponse(latestStepWorkWithResponse);
		} else {
			return "";
		}
	}
	
	/**
	 * Get the prompt from the node content
	 * 
	 * @param nodeContent the node content JSON
	 * 
	 * @return a string containing the prompt for the node, if nodeContent
	 * is null, we will just return ""
	 */
	private String getPromptFromNodeContent(JSONObject nodeContent) {
		String prompt = "";
		try {
			if(nodeContent != null) {
				String nodeType = nodeContent.getString("type");
				
				if(nodeType == null) {
					
				} else if(nodeType.equals("AssessmentList")) {
					prompt = nodeContent.getString("prompt");
				} else if(nodeType.equals("DataGraph")) {
					
				} else if(nodeType.equals("Draw")) {
					
				} else if(nodeType.equals("Fillin")) {
					
				} else if(nodeType.equals("Flash")) {
					
				} else if(nodeType.equals("Html")) {
					prompt = "N/A";
				} else if(nodeType.equals("MySystem")) {
					
				} else if(nodeType.equals("Brainstorm") || 
						nodeType.equals("MatchSequence") || 
						nodeType.equals("MultipleChoice") || 
						nodeType.equals("Note") || 
						nodeType.equals("OpenResponse")) {
					JSONObject assessmentItem = (JSONObject) nodeContent.get("assessmentItem");
					JSONObject interaction = (JSONObject) assessmentItem.get("interaction");
					prompt = interaction.getString("prompt");
				} else if(nodeType.equals("OutsideUrl")) {
					prompt = "N/A";
				} else if(nodeType.equals("SVGDraw")) {
					
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
	 * @param stepWorksForNodeId
	 * @param nodeId the id of the node
	 * 
	 * @return the updated column position
	 */
	private int setStepWorkResponse(Row rowForWorkgroupId, Vector<String> rowForWorkgroupIdVector, int columnCounter, StepWork stepWork, String nodeId) {
		//obtain the number of answer fields for this step
		int numberOfAnswerFields = getNumberOfAnswerFields(nodeId);
		
		if(stepWork == null) {
			/*
			 * the student did not provide any answers but we still need to shift
			 * the column counter the appropriate number of cells 
			 */
			
			//increment the column counter
			columnCounter += numberOfAnswerFields;
			addEmptyElementsToVector(rowForWorkgroupIdVector, numberOfAnswerFields);
		} else if(stepTypeContainsMultipleAnswerFields(stepWork)) {
			//the step type contains multiple answer fields
			
			//get the step work JSON data
			String stepWorkData = stepWork.getData();
			try {
				//get the step work data JSON object
				JSONObject stepWorkDataJSON = new JSONObject(stepWorkData);
				
				//get the node states
				JSONArray nodeStatesJSON = stepWorkDataJSON.getJSONArray("nodeStates");

				JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
				boolean isLockAfterSubmit = false;
				
				if(nodeContent != null && nodeContent.has("isLockAfterSubmit")) {
					//get whether this step locks after submit
					isLockAfterSubmit = nodeContent.getBoolean("isLockAfterSubmit");
				}
				
				if(nodeStatesJSON.length() != 0) {
					//get the last state
					JSONObject lastState = nodeStatesJSON.getJSONObject(nodeStatesJSON.length() - 1);
					if(lastState != null) {
						String nodeType = stepWorkDataJSON.getString("nodeType");
						if(nodeType == null) {
							//error, this should never happen
						} else if(nodeType.equals("AssessmentListNode")) {
							
							//get the assessments array that contains the students answers for each part
							JSONArray assessments = lastState.getJSONArray("assessments");
							
							/*
							 * loop through each part but only look up to the number of fields that
							 * are in the step currently. for example this is in case the step originally
							 * had 3 parts when the student answered it, and after that the author
							 * changed the step to only have 2 parts. then in that case we only want
							 * to display the student work for those 2 parts.
							 */
							for(int x=0; x<assessments.length() && x<numberOfAnswerFields; x++) {
								//get a part
								JSONObject assessmentPart = assessments.getJSONObject(x);

								//check if the response is null
								if(!assessmentPart.isNull("response")) {
									//get the response
									JSONObject responseObject = assessmentPart.getJSONObject("response");
									
									//get the response text
									String responseText = responseObject.getString("text");
									
									//set the response text into the cell and increment the counter
									columnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, columnCounter, responseText);
								} else {
									columnCounter++;
									addEmptyElementsToVector(rowForWorkgroupIdVector, 1);
								}
							}
							
							if(isLockAfterSubmit) {
								if(lastState.has("isSubmit")) {
									//this step locks after submit
									boolean isSubmit = lastState.getBoolean("isSubmit");
									
									//set whether the student work was a submit
									columnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, columnCounter, Boolean.toString(isSubmit));									
								} else {
									//set whether the student work was a submit
									columnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, columnCounter, "false");
								}
							}
							
							//set the max number of step work parts if necessary
							if(assessments.length() > maxNumberOfStepWorkParts) {
								maxNumberOfStepWorkParts = assessments.length();
							}
						}
					}
				} else {
					/*
					 * the student did not provide any answers but we still need to shift
					 * the column counter the appropriate number of cells 
					 */
					
					//increment the column counter
					columnCounter += numberOfAnswerFields;
					addEmptyElementsToVector(rowForWorkgroupIdVector, numberOfAnswerFields);
					
					if(isLockAfterSubmit) {
						/*
						 * increment the counter by one to take into consideration
						 * the column for "Is Submit"
						 */
						columnCounter++;
						addEmptyElementsToVector(rowForWorkgroupIdVector, 1);
					}
				}
			} catch (JSONException e) {
				e.printStackTrace();
			}
		} else {
			//this is a regular step type which only uses one cell
			
			//get the step work response
			String stepWorkResponse = getStepWorkResponse(stepWork);
			
			if(stepWorkResponse != null) {
				//set the response into the cell and increment the counter
				columnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, columnCounter, stepWorkResponse);
				
			} else {
				//there was no work so we will leave the cell blank and increment the counter
				columnCounter++;
				addEmptyElementsToVector(rowForWorkgroupIdVector, 1);
			}
		}
		
		//return the updated position
		return columnCounter;
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
		//get the step work data
		String stepWorkData = stepWork.getData();
		
		if(stepWorkData == null) {
			return false;
		} else {
			try {
				//get the data JSON object
				JSONObject stepWorkDataJSON = new JSONObject(stepWorkData);
				
				//get the node type
				String nodeType = stepWorkDataJSON.getString("nodeType");
				
				//get the node id
				String nodeId = stepWorkDataJSON.getString("nodeId");
				
				//get the node content
				JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
				
				if(nodeContent == null) {
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
				} else if(nodeType == null) {
					return false;
				} else if(nodeType.equals("AssessmentListNode")) {
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
	 * 
	 * @param nodeId the id of the node
	 * 
	 * @return the number of answer fields for the given step/node
	 */
	private int getNumberOfAnswerFields(String nodeId) {
		//the default number of answer fields
		int numAnswerFields = 1;
		
		//get the node content
		JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
		String nodeType = null;
		
		try {
			if(nodeContent != null) {
				//get the node type
				nodeType = nodeContent.getString("type");
				
				if(nodeType == null) {
					
				} else if(nodeType.equals("AssessmentList")) {
					//get the number of assessments
					JSONArray assessmentParts = nodeContent.getJSONArray("assessments");
					
					//the number of assessments will be the same as the number of answers
					numAnswerFields = assessmentParts.length();
					
					boolean isLockAfterSubmit = false;
					
					if(nodeContent.has("isLockAfterSubmit")) {
						isLockAfterSubmit = nodeContent.getBoolean("isLockAfterSubmit");
					}
					
					if(isLockAfterSubmit) {
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
	 * 
	 * @param stepWork a StepWork object
	 * 
	 * @return a String containing the student work/response
	 * note: HtmlNodes will return "N/A"
	 */
	private String getStepWorkResponse(StepWork stepWork) {
		String stepWorkResponse = "";
		String nodeType = "";
		Node node = null;
		Long stepWorkId = null;
		
		//get the node type
		if(stepWork != null) {
			node = stepWork.getNode();
			
			//get the step work id
			stepWorkId = stepWork.getId();
			
			if(node != null && node.getNodeType() != null) {
				//get the node type from the node object e.g. "OpenResponseNode"
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
		
		if(node != null) {
			//get the node id
			String nodeId = node.getNodeId();
			
			if(nodeId != null) {
				//get the content for the step
				JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);	
				
				if(nodeContent != null) {
					if(nodeContent.has("excelExportStringTemplate") && !nodeContent.isNull("excelExportStringTemplate")) {
						
						try {
							//get the excelExportStringTemplate field from the step content
							excelExportStringTemplate = nodeContent.getString("excelExportStringTemplate");							
						} catch(JSONException e) {
							e.printStackTrace();
						}
					}
				}
			}
		}
		
		//check if excelExportStringTemplate is provided in the step content
		if(excelExportStringTemplate != null) {
			//excelExportStringTemplate is provided
			
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
				if(stepWork != null) {
					//obtain the json string
	    			String data = stepWork.getData();
	    			
	    			if(data != null) {
	    				//parse the json string into a json object
	        			JSONObject jsonData = new JSONObject(data);
	        			
	        			if(jsonData.has("nodeStates")) {
	        				//obtain the node states array json object
	            			JSONArray jsonNodeStatesArray = jsonData.getJSONArray("nodeStates");
	            			
	            			//check if there are any elements in the node states array
	        				if(jsonNodeStatesArray != null && jsonNodeStatesArray.length() > 0) {
	        					
	        					if("latestStudentWork".equals(exportType) || "customLatestStudentWork".equals(exportType)) {
	        						//only show the data from the last state in the node states array
	        						
	        						if(!jsonNodeStatesArray.isNull(jsonNodeStatesArray.length() - 1)) {
	        							//node state is not null
	        							
	        							//obtain the last element in the node states
	                					Object nodeStateObject = jsonNodeStatesArray.get(jsonNodeStatesArray.length() - 1);
	            						//check if the nodeStateObject is a JSONObject
	                					
	            						if(nodeStateObject instanceof JSONObject) {
	            							JSONObject lastState = (JSONObject) nodeStateObject;
	                						
	            							if(excelExportStringTemplate != null) {
	            								//generate the excel export string that we will display in the cell
	            								stepWorkResponse = generateExcelExportString(excelExportStringTemplate, lastState, stepWorkId);
	            							}
	            						}
	        						}
	        					} else if("allStudentWork".equals(exportType) || "customAllStudentWork".equals(exportType)) {
	        						//show data from all the states in the node state array
	        						
	        						//string buffer to accumulate the text we will display in the cell
	        						StringBuffer stepWorkResponseStrBuf = new StringBuffer();
	        						
	        						//loop through all the node states
	        						for(int x=0; x<jsonNodeStatesArray.length(); x++) {
	        							
	        							if(!jsonNodeStatesArray.isNull(x)) {
	        								//node state is not null
	        								
	            							//get the node state
	            							Object nodeStateObject = jsonNodeStatesArray.get(x);
	            							
	        								//check if the nodeStateObject is a JSONObject
	        								if(nodeStateObject instanceof JSONObject) {
	        									JSONObject lastState = (JSONObject) nodeStateObject;

	        									if(excelExportStringTemplate != null) {
	        										//generate the excel export string with the student work inserted
	        										String nodeStateResponse = generateExcelExportString(excelExportStringTemplate, lastState, stepWorkId);
	        										
	        										if(stepWorkResponseStrBuf.length() != 0) {
	        											//add a new line to separate each node state
	        											stepWorkResponseStrBuf.append("\n");
	        										}
	        										
	        										//display the node state number
	        										stepWorkResponseStrBuf.append("Response #" + (x + 1) + ": ");
	        										
	        										//display the excel export string that contains the student data
	        										stepWorkResponseStrBuf.append(nodeStateResponse);
	        									}
	        								}
	        							}
	        						}
	        						
	        						//get the string that we will display in the cell
	        						stepWorkResponse = stepWorkResponseStrBuf.toString();
	        					}
	        				}            				
	        			}
	    			}    				
				}
			} catch(JSONException e) {
				e.printStackTrace();
			}
		} else if(nodeType.equals("OpenResponse") || nodeType.equals("Note") ||
				nodeType.equals("Brainstorm") || nodeType.equals("Fillin") ||
				nodeType.equals("MultipleChoice") || nodeType.equals("MatchSequence") ||
				nodeType.equals("AssessmentList") || nodeType.equals("Sensor") ||
				nodeType.equals("ExplanationBuilder") || nodeType.equals("SVGDraw")  ||
				nodeType.equals("Netlogo")) {
    		try {
    			//obtain the json string
    			String data = stepWork.getData();
    			
    			//parse the json string into a json object
				JSONObject jsonData = new JSONObject(data);
				
				//obtain the node states array json object
				JSONArray jsonNodeStatesArray = jsonData.getJSONArray("nodeStates");
				
				if(nodeType.equals("MultipleChoice") || nodeType.equals("Fillin") ||
						nodeType.equals("MatchSequence") || nodeType.equals("AssessmentList")) {
					/*
					 * if the stepwork is for multiple choice or fillin, we will display
					 * all node states so that researchers can see how many times
					 * the student submitted an answer within this step work visit
					 */
					
					//string buffer to maintain all the answers for this step work visit
					StringBuffer responses = new StringBuffer();
					
					//loop through all the node states
					for(int z=0; z<jsonNodeStatesArray.length(); z++) {
						Object nodeStateObject = jsonNodeStatesArray.get(z);
						if(nodeStateObject == null || nodeStateObject.toString().equals("null")) {
							//node state is null so we will skip it
						} else {
							//obtain a node state
							JSONObject nodeState = (JSONObject) nodeStateObject;
							
							if(nodeType.equals("MultipleChoice") || nodeType.equals("Fillin")) {
								if(nodeState.has("response")) {
									//this case handles mc and fillin
									
									//obtain the response
									Object jsonResponse = nodeState.get("response");
									
									StringBuffer currentResponse = new StringBuffer();
									
									if(jsonResponse instanceof JSONArray) {
										//if the object is an array obtain the first element
										JSONArray lastResponseArray = (JSONArray) jsonResponse;
										
										//loop through the response array
										for(int x=0; x<lastResponseArray.length(); x++) {
											
											if(currentResponse.length() != 0) {
												//separate the responses with a comma
												currentResponse.append(", ");
											}
											
											//append the response
											currentResponse.append((String) lastResponseArray.get(x));	
										}
									} else if(jsonResponse instanceof String) {
										//if the object is a string just use the string
										currentResponse.append((String) jsonResponse);
									}
									
									//separate answers with a comma
									if(responses.length() != 0) {
										responses.append(", ");
									}
									
									if(nodeType.equals("Fillin")) {
										//for fillin we will obtain the text entry index
										Object blankNumber = nodeState.get("textEntryInteractionIndex");
										
										if(blankNumber instanceof Integer) {
											//display the response as Blank{blank number} [submit attempt]: {student response}
											responses.append("{Blank" + (((Integer) blankNumber) + 1) + "[" + (z+1) + "]: " + currentResponse + "}");
										}
									} else if(nodeType.equals("MultipleChoice")) {
										//display the response as Answer[{attempt number}]: {student response}
										responses.append("{Answer[" + (z+1) + "]: " + currentResponse + "}");	
									}
								}
							} else if(nodeType.equals("MatchSequence")) {
								//get the array of buckets
								JSONArray buckets = (JSONArray) nodeState.get("buckets");

								//each state will be wrapped in {}
								responses.append("{");
								
								//loop through all the buckets
								for(int bucketCounter=0; bucketCounter<buckets.length(); bucketCounter++) {
									//get a bucket
									JSONObject bucket = (JSONObject) buckets.get(bucketCounter);
									
									//get the text for the bucket
									String bucketText = bucket.getString("text");
									
									//represents the beginning of a bucket
									responses.append("(");
									
									//add the bucket text to the response
									responses.append("[" + bucketText + "]: ");
									
									//get the choices in the current bucket
									JSONArray choices = (JSONArray) bucket.get("choices");
									
									StringBuffer choiceResponses = new StringBuffer();
									
									//loop through the choices
									for(int choiceCounter=0; choiceCounter<choices.length(); choiceCounter++) {
										//get a choice
										JSONObject choice = (JSONObject) choices.get(choiceCounter);
										
										//get the text for the choice
										String choiceText = choice.getString("text");
										
										/*
										 * if this is not the first choice we will need to separate
										 * the choice with a comma ,
										 */
										if(choiceResponses.length() != 0) {
											choiceResponses.append(", ");
										}
										
										//add the choice to the temporary choice text
										choiceResponses.append(choiceText);
									}
									
									//add the choice text
									responses.append(choiceResponses);
									
									//close the bucket
									responses.append(")");
								}
								
								/*
								 * close the state and add some new lines in case researcher
								 * wants to view the response in their browser
								 */
								responses.append("}<br><br>");
							} else if(nodeType.equals("AssessmentList")) {
								//wrap each node state with braces {}
								responses.append("{");
								
								if(nodeState.has("assessments")) {
									//get the array of assessment answers
									JSONArray assessments = nodeState.getJSONArray("assessments");
									
									//a string buffer to hold the accumulated responses for the node state
									StringBuffer tempResponses = new StringBuffer();
									
									//loop through all the assessment responses
									for(int assessmentCounter=0; assessmentCounter<assessments.length(); assessmentCounter++) {
										//get an assessment
										JSONObject assessment = assessments.getJSONObject(assessmentCounter);
										
										//check if the response is null
										if(!assessment.isNull("response")) {
											//get the assessment response
											JSONObject assessmentResponse = assessment.getJSONObject("response");
											
											//get the assessment response text
											String responseText = assessmentResponse.getString("text");
											
											//separate the assessment response texts with ,
											if(tempResponses.length() != 0) {
												tempResponses.append(", ");
											}
											
											//add the text to the temp container
											tempResponses.append(responseText);
										}
									}
									
									//put the responses for the assessments into the all encompassing string buffer
									responses.append(tempResponses);
								}
								
								//close the brace
								responses.append("}");
							}
						}
					}

					stepWorkResponse = responses.toString();
				} else {
					//check if there are any elements in the node states array
					if(jsonNodeStatesArray != null && jsonNodeStatesArray.length() > 0) {
						//obtain the last element in the node states
						Object nodeStateObject = jsonNodeStatesArray.get(jsonNodeStatesArray.length() - 1);
						
						if(nodeStateObject == null || nodeStateObject.toString().equals("null")) {
							//node state is null so we will skip it
						} else {
							JSONObject lastState = (JSONObject) nodeStateObject;
							
							if(nodeType.equals("ExplanationBuilderNode")) {
								if(lastState != null) {
									//just return the JSON as a string
									stepWorkResponse = lastState.toString();									
								}
							} else if(nodeType.equals("SVGDrawNode")) {
								if(lastState != null) {
									//just return the JSON as a string
									stepWorkResponse = (String) lastState.get("data");
								}
							} else if(nodeType.equals("Netlogo")) {
								if(lastState != null) {
									
									if(lastState.has("data")) {
										try {
											JSONObject netLogoData = (JSONObject) lastState.getJSONObject("data");
											
											if(netLogoData != null) {
												//just return the JSON as a string
												stepWorkResponse = netLogoData.toString();
											}											
										} catch (JSONException e) {

										}
									}
								}
							} else if(lastState.has("response")) {
								//obtain the response
								Object object = lastState.get("response");
								
								String lastResponse = "";
								
								if(object instanceof JSONArray) {
									//if the object is an array obtain the first element
									JSONArray lastResponseArray = (JSONArray) lastState.get("response");
									lastResponse = (String) lastResponseArray.get(0);
								} else if(object instanceof String) {
									//if the object is a string just use the string
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
    	} else if(nodeType.equals("Html")) {
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
		
		if(nodeState != null) {
			if(nodeState.has("response")) {
				try {
					//get the response
					response = nodeState.getString("response");
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
		
		if(nodeId != null) {
			//get the content for the step
			JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);	
			
			if(nodeContent != null) {
				//check if export columns were specified in the content
				if(nodeContent.has("exportColumns") && !nodeContent.isNull("exportColumns")) {
					
					try {
						//get the export columns
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
	 * @param studentWork the student data
	 * @return an array of objects that are found in the specified field
	 * in the student data. if the field only contains one value, there
	 * will only be one element in the array.
	 */
	private ArrayList<Object> getColumnValuesForField(JSONObject fieldObject, JSONObject studentWork) {
		//the array to hold the values
		ArrayList<Object> values = new ArrayList<Object>();
		
		if(studentWork != null) {
			try {
				if(fieldObject != null) {
					String field = null;
					JSONObject childFieldObject = null;

					//get the field
					if(fieldObject.has("field")) {
						field = fieldObject.getString("field");
					}
					
					//get the child field
					if(fieldObject.has("childField")) {
						childFieldObject = fieldObject.getJSONObject("childField");
					}

					if(field != null) {
						if(studentWork.has(field)) {
							//get the value in the field in the student work
							Object value = studentWork.get(field);

							if(value != null) {
								if(value instanceof JSONObject) {
									//the value is a JSONObject
									JSONObject jsonObjectValue = (JSONObject) value;
									
									if(childFieldObject != null) {
										//there is a childField specified so we will recursively go deeper into the student work
										values.addAll(getColumnValuesForField(childFieldObject, jsonObjectValue));							
									} else {
										//there is no childField so we have traversed as far as we need to and will get this value 
										values.add(jsonObjectValue.toString());
									}
								} else if(value instanceof JSONArray) {
									//the value is a JSONArray
									JSONArray jsonArrayValue = (JSONArray) value;
									
									if(childFieldObject != null) {
										//there is a childField specified so we will recursively go deeper into the student work
										values.addAll(getValueForField(childFieldObject, jsonArrayValue));							
									} else {
										/*
										 * there is no childField so we have traversed as far as we need to and will get this value.
										 * since this value is an array we will need to get all the values in the array.
										 */
										values.add(getArrayValues(jsonArrayValue));
									}
								} else if(value instanceof String) {
									//the value is a string
									values.add(value);
								} else if(value instanceof Boolean) {
									//the value is a boolean
									values.add(value);
								} else if(value instanceof Long) {
									//the value is a long
									values.add(value);
								} else if(value instanceof Integer) {
									//the value is an integer
									values.add(value);
								} else if(value instanceof Double) {
									//the value is a double
									values.add(value);
								} else if(value instanceof Float) {
									//the value is a Float
									values.add(value);
								}
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
	 * Get the values for the given field from an array
	 * @param fieldObject the field object that specifies what work to get
	 * @param studentWork an array that we will obtain student work values from
	 * 
	 * example
	 * 
	 * here's an example of the studentWork array that would be passed in
	 * 
	 * [
	 * 	{"text":"hello", "x":1, "y":2},
	 * 	{"text":"world", "x":3, "y":4}
	 * ]
	 * 
	 * here's an example of a fieldObject to retrieve all the text values
	 * 
	 * {
	 * 	"field":"text"
	 * }
	 * 
	 * given these two arguments we would end up returning an array like this
	 * 
	 * [
	 * 	"hello",
	 *  "world"
	 * ]
	 * 
	 * @return an array that contains the field value from each element in the array
	 */
	private ArrayList<Object> getValueForField(JSONObject fieldObject, JSONArray studentWork) {
		ArrayList<Object> values = new ArrayList<Object>();
		
		if(studentWork != null) {
			try {
				if(fieldObject != null) {
					String field = null;
					JSONObject childFieldObject = null;
					
					//get the field
					if(fieldObject.has("field")) {
						field = fieldObject.getString("field");
					}
					
					//get the child field
					if(fieldObject.has("childField")) {
						childFieldObject = fieldObject.getJSONObject("childField");
					}

					if(field != null) {
						//a field has been provided
						
						//loop through all the elements in the array
						for(int x=0; x<studentWork.length(); x++) {
							try {
								//get an element from the array
								Object arrayElement = studentWork.get(x);
								Object value = null;
								
								if(arrayElement instanceof JSONObject) {
									JSONObject arrayElementJSONObject = (JSONObject) arrayElement;
									
									if(arrayElementJSONObject != null && arrayElementJSONObject.has(field)) {
										//get the field value from the element
										value = ((JSONObject) arrayElement).get(field);
									}
								}
								
								if(value != null) {
									//we were able to retrieve the field value
									
									if(value instanceof JSONObject) {
										//the value is a JSONObject
										
										if(childFieldObject != null) {
											//there is a child field so we will traverse deeper into the student work
											values.add(getColumnValuesForField(childFieldObject, (JSONObject) value));							
										} else {
											//there is no child field so we will just get the string value of the object
											values.add(value.toString());
										}
									} else if(value instanceof JSONArray) {
										if(childFieldObject != null) {
											//there is a child field so we will traverse deeper into the student work
											values.add(getValueForField(childFieldObject, (JSONArray) value));							
										} else {
											//there is no child field so we will just get the string value of the array
											values.add(value.toString());
										}
									} else if(value instanceof String) {
										//the value is a string
										values.add(value);
									} else if(value instanceof Boolean) {
										//the value is a boolean
										values.add(value);
									} else if(value instanceof Long) {
										//the value is a long
										values.add(value);
									} else if(value instanceof Integer) {
										//the value is an integer
										values.add(value);
									} else if(value instanceof Double) {
										//the value is a double
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
						/*
						 * a field has not been provided so we will just add each element
						 * of the array
						 */

						//loop through all the elements in the array
						for(int x=0; x<studentWork.length(); x++) {
							//get an element
							Object arrayElement = studentWork.get(x);
							
							//add the element
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
		//the array to hold the values
		ArrayList<Object> values = new ArrayList<Object>();
		
		if(studentWork != null) {
			//loop through all the elements in the student work
			for(int x=0; x<studentWork.length(); x++) {
				try {
					//get an element
					Object arrayElement = studentWork.get(x);
					
					if(arrayElement instanceof JSONArray) {
						/*
						 * the element is an array so we will add all the individual elements
						 * of the array
						 */
						values.addAll(getArrayValues((JSONArray) arrayElement));
					} else {
						//add the element
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
		
		//search for the first match
		boolean foundMatch = m.find();

		//loop until we find all the matches
		while(foundMatch) {
			/*
			 * get the string that has matched our regular expression pattern
			 * e.g.
			 * {response}
			 */
			String field = m.group();
			
			/*
			 * get the the student data that we will use to
			 * insert into the excel export string template
			 */
			String replacement = getNodeStateField(field, nodeState, stepWorkId);
			
			//replace all the instances of the field with the student data
			resultString = resultString.replace(field, replacement);

			//look for the next match
			foundMatch = m.find();
		}

		//return the string
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
			
			//loop through all the fields
			for(int x=0; x<split.length; x++) {

				if(x == split.length - 1) {
					//this is the last field
					lastField = true;
				}

				//get the field name
				String fieldName = split[x];
				
				//the array index we will use if the field value is an array
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
				
				if(m.matches()) {
					//we have found a match
					
					//loop through all the groups
					for(int y=0; y<=m.groupCount(); y++) {
						
						if(y == 1) {
							//get the field name
							fieldName = m.group(y);
						} else if(y == 3) {
							if(m.group(y) != null) {
								try {
									//get the array index
									arrayIndex = Integer.parseInt(m.group(y));
								} catch(NumberFormatException e) {
									e.printStackTrace();									
								}
							}
						}
					}
					
					if(!fieldNameSoFar.equals("")) {
						//prepend the fieldNameSoFar
						fieldNameSoFar = fieldNameSoFar + "." + fieldName;
					} else {
						//the fieldNameSoFar is empty so we will just use the fieldName
						fieldNameSoFar = fieldName;
					}
				}
				
				//check for a special case where we want the CRater annotation score
				if(fieldNameSoFar != null && fieldNameSoFar.equals("cRaterAnnotationScore")) {
					//get the CRater score if any
					long cRaterScore = getCRaterScoreByStepWorkIdAndNodeState(stepWorkId, nodeState);
					
					if(cRaterScore == -1) {
						//there was no CRater score so we will just display empty string
						fieldValue = "";
					} else {
						//convert the score into a string
						fieldValue = cRaterScore + "";
					}
					
					return fieldValue;
				}

				if(currentJSONObject != null) {

					//check if the JSONObject has the given field
					if(currentJSONObject.has(fieldNameSoFar)) {
						//get the value at the field
						Object fieldObject = currentJSONObject.get(fieldNameSoFar);

						if(fieldObject instanceof JSONObject) {
							//object is a JSONObject
							
							if(lastField) {
								//this is the last field
								fieldValue = ((JSONObject) fieldObject).toString();
							} else {
								//this is not the last field
								currentJSONObject = (JSONObject) fieldObject;
							}
						} else if(fieldObject instanceof JSONArray) {
							//object is a JSONArray
							
							if(lastField) {
								//this is the last field
								fieldValue = ((JSONArray) fieldObject).toString();
							} else {
								//this is not the last field
								
								/*
								 * get the element at the given array index.
								 * this assumes the element at the given index is a JSONObject
								 */
								currentJSONObject = ((JSONArray) fieldObject).getJSONObject(arrayIndex);
							}
						} else if(fieldObject instanceof String) {
							//object is a String
							
							if(lastField) {
								//this is the last field
								fieldValue = (String) fieldObject;
							} else {
								//get the String
								String fieldObjectString = (String) fieldObject;
								
								//this is not the last field
								currentJSONObject = new JSONObject(fieldObjectString);
							}
						} else if(fieldObject instanceof Integer) {
							//object is an Integer
							
							//get the integer value
							fieldValue = ((Integer) fieldObject).toString();
							
							/*
							 * set the currentJSONObject to null because we can't go
							 * any deeper since we have hit an integer
							 */
							currentJSONObject = null;
						} else if(fieldObject instanceof Boolean) {
							//object is a boolean
							
							//get the boolean value
							fieldValue = ((Boolean) fieldObject).toString();
							
							/*
							 * set the currentJSONObject to null because we can't go
							 * any deeper since we have hit a boolean
							 */
							currentJSONObject = null;
						}
						
						//clear the fieldNameSoFar
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

		if(includeUserDataCells) {
			//output the user data header cells
			userDataHeaderRowColumnCounter = setCellValue(userDataHeaderRow, userDataHeaderRowVector, userDataHeaderRowColumnCounter, "Workgroup Id");
			userDataHeaderRowColumnCounter = setCellValue(userDataHeaderRow, userDataHeaderRowVector, userDataHeaderRowColumnCounter, "Wise Id 1");
			userDataHeaderRowColumnCounter = setCellValue(userDataHeaderRow, userDataHeaderRowVector, userDataHeaderRowColumnCounter, "Wise Id 2");
			userDataHeaderRowColumnCounter = setCellValue(userDataHeaderRow, userDataHeaderRowVector, userDataHeaderRowColumnCounter, "Wise Id 3");
			userDataHeaderRowColumnCounter = setCellValue(userDataHeaderRow, userDataHeaderRowVector, userDataHeaderRowColumnCounter, "Class Period");
		}
		
		if(includeMetaDataCells) {
			//output the meta data header cells
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
		
		if(includeUserDataCells) {
			//output the user data cells
			
			//set the first column to be the workgroup id
			workgroupColumnCounter = setCellValueConvertStringToLong(userDataRow, userDataRowVector, workgroupColumnCounter, workgroupId);
			
			//get the student user ids for the given workgroup id
			String userIds = workgroupIdToUserIds.get(Integer.parseInt(workgroupId));
			
			if(userIds != null) {
				//we found student user ids
				
				//the user ids string is delimited by ':'
				String[] userIdsArray = userIds.split(":");
				
				//sort the user ids numerically
				ArrayList<Long> userIdsList = sortUserIdsArray(userIdsArray);
				
				//loop through all the user ids in this workgroup
				for(int z=0; z<userIdsList.size(); z++) {
					//get a user id
					Long userIdLong = userIdsList.get(z);
					
					//put the user id into the cell
					workgroupColumnCounter = setCellValue(userDataRow, userDataRowVector, workgroupColumnCounter, userIdLong);
				}
				
				/*
				 * we will assume there will be at most 3 students in a workgroup so we need
				 * to increment the column counter if necessary
				 */
				int numColumnsToAdd = 3 - userIdsList.size();
				workgroupColumnCounter += numColumnsToAdd;
				addEmptyElementsToVector(userDataRowVector, numColumnsToAdd);
				
				if(periodName == null) {
					//get the period name such as 1, 2, 3, 4, etc.
					periodName = workgroupIdToPeriodName.get(Integer.parseInt(workgroupId));
				}
				
				if(periodName != null) {
					//populate the cell with the period name
					workgroupColumnCounter = setCellValueConvertStringToLong(userDataRow, userDataRowVector, workgroupColumnCounter, periodName);
				} else {
					//the period name is null so we will just increment the counter
					workgroupColumnCounter++;
					addEmptyElementsToVector(userDataRowVector, 1);
				}
			} else {
				if(periodName != null) {
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

		if(includeMetaDataCells) {
			//output the meta data cells
			
			String teacherLogin = "";
			try {
				//get the teacher login
				teacherLogin = teacherUserInfoJSONObject.getString("userName");
			} catch (JSONException e) {
				e.printStackTrace();
			}
			
			//populate the cell with the teacher login
			workgroupColumnCounter = setCellValue(userDataRow, userDataRowVector, workgroupColumnCounter, teacherLogin);
			
			//set the run and project attributes
			workgroupColumnCounter = setCellValueConvertStringToLong(userDataRow, userDataRowVector, workgroupColumnCounter, projectId);
			workgroupColumnCounter = setCellValueConvertStringToLong(userDataRow, userDataRowVector, workgroupColumnCounter, parentProjectId);
			workgroupColumnCounter = setCellValue(userDataRow, userDataRowVector, workgroupColumnCounter, projectName);
			workgroupColumnCounter = setCellValueConvertStringToLong(userDataRow, userDataRowVector, workgroupColumnCounter, runId);
			workgroupColumnCounter = setCellValue(userDataRow, userDataRowVector, workgroupColumnCounter, runName);
			
			//populate the cell with the date the run was created
			workgroupColumnCounter = setCellValue(userDataRow, userDataRowVector, workgroupColumnCounter, startTime);
			
			//populate the cell with the date the run was archived
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
		
		//the excel workbook
		XSSFWorkbook wb = null;
		
		if(isFileTypeXLS(fileType)) {
			//we are generating an xls file so we will create the workbook
			wb = new XSSFWorkbook();
		}
		
		//loop through all the workgroups
		for(int x=0; x<workgroupIds.size(); x++) {
			String workgroupId = workgroupIds.get(x);
			UserInfo userInfo = vleService.getUserInfoByWorkgroupId(Long.parseLong(workgroupId));

			//create a sheet for the workgroup
			XSSFSheet userIdSheet = null;
			
			if(wb != null) {
				userIdSheet = wb.createSheet(workgroupId);
			}
			
			int rowCounter = 0;
			
			//counter for the header column cells
			int headerColumn = 0;
			
			//create the first row which will contain the headers
			Row headerRow = createRow(userIdSheet, rowCounter++);
	    	Vector<String> headerRowVector = createRowVector();
	    	
			/*
			 * create the cells that will display the user data headers such as workgroup id,
			 * student login, teacher login, period name, etc.
			 */
			headerColumn = createUserDataHeaderRow(headerColumn, headerRow, headerRowVector, true, true);
			
			//write the csv row if we are generating a csv file
			writeCSV(headerRowVector);
	    	
	    	//vector that contains all the header column names
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
	    	
	    	//add all the header column names to the row
	    	for(int y=0; y<headerColumnNames.size(); y++) {
		    	headerColumn = setCellValue(headerRow, headerRowVector, headerColumn, headerColumnNames.get(y));
	    	}
	    	
	    	//write the csv row if we are generating a csv file
	    	writeCSV(headerRowVector);
	    	
	    	//get all the work from the workgroup
	    	List<StepWork> stepWorks = vleService.getStepWorksByUserInfo(userInfo);
	    	
	    	//loop through all the work
	    	for(int z=0; z<stepWorks.size(); z++) {
	    		StepWork stepWork = stepWorks.get(z);
	    		
	    		//get the node and node type
	    		Node node = stepWork.getNode();
	    		String nodeType = node.getNodeType();
	    		
	    		if(nodeType != null && nodeType.equals("ExplanationBuilderNode")) {
	    			//the work is for an explanation builder step
	    			
	    			//get the student work
	    			String data = stepWork.getData();
	    			
	    			try {
	    				//get the JSONObject representation of the student work
						JSONObject dataJSONObject = new JSONObject(data);
						
						//get the node states from the student work
						JSONArray nodeStates = dataJSONObject.getJSONArray("nodeStates");
						
						if(nodeStates != null && nodeStates.length() > 0) {
							//get the last node state
							JSONObject nodeState = nodeStates.getJSONObject(nodeStates.length() - 1);
							
							//get the answer the student typed in the text area
							String answer = nodeState.getString("answer");
							
							//get all the ideas used in this step
							JSONArray explanationIdeas = nodeState.getJSONArray("explanationIdeas");
							
							if(explanationIdeas != null && explanationIdeas.length() > 0) {
								//loop through all the ideas used in this step
								for(int i=0; i<explanationIdeas.length(); i++) {
									//get one of the ideas that was used
									JSONObject explanationIdea = explanationIdeas.getJSONObject(i);
									
									//create a row for this idea
									Row ideaRow = createRow(userIdSheet, rowCounter++);
					    			Vector<String> ideaRowVector = createRowVector();
					    			
					    			int columnCounter = 0;
					    			
					    			//get the step work id and node id
					    			Long stepWorkId = stepWork.getId();
					    			String nodeId = node.getNodeId();
					    			
					    			//get the title of the step
					    			String title = nodeIdToNodeTitlesMap.get(nodeId);
					    			
					    			//get the content for the step
					    			JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
					    			String prompt = ""; 
					    				
					    			if(nodeContent != null) {
					    				if(nodeContent.has("prompt")) {
					    					//get the prompt
					    					prompt = nodeContent.getString("prompt");					    					
					    				}
					    			}
					    			
					    			//get the start, end and post time for the student visit
									Timestamp startTime = stepWork.getStartTime();
									Timestamp endTime = stepWork.getEndTime();
									Timestamp postTime = stepWork.getPostTime();

							    	long timeSpentOnStep = 0;
							    	
							    	//calculate the time the student spent on the step
							    	if(endTime == null || startTime == null) {
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
									
									//set the post time
									if(postTime != null) {
										columnCounter = setCellValue(ideaRow, ideaRowVector, columnCounter, timestampToFormattedString(postTime));
									} else {
										columnCounter = setCellValue(ideaRow, ideaRowVector, columnCounter, "");
									}
									
									//set the start time
									columnCounter = setCellValue(ideaRow, ideaRowVector, columnCounter, timestampToFormattedString(startTime));
									
									//set the end time
									if(endTime != null) {
										columnCounter = setCellValue(ideaRow, ideaRowVector, columnCounter, timestampToFormattedString(endTime));
									} else {
										columnCounter = setCellValue(ideaRow, ideaRowVector, columnCounter, "");
									}
									
									//set the time spent on the step
							    	if(timeSpentOnStep == -1) {
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
							    	
							    	//write the csv row if we are generating a csv file
							    	writeCSV(ideaRowVector);
								}
							}
						}
					} catch (JSONException e) {
						e.printStackTrace();
					}
	    		}
	    	}
	    	
	    	//create a blank row for spacing
			Vector<String> emptyVector2 = createRowVector();
			writeCSV(emptyVector2);
		}
		
		return wb;
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
		
		//the excel workbook
		XSSFWorkbook wb = null;
		
		if(isFileTypeXLS(fileType)) {
			//we are generating an xls file so we will create the workbook
			wb = new XSSFWorkbook();
		}
		
		//whether to also export all the other student work
		boolean exportAllWork = true;
		
		//counter for the row that we are on
		int rowCounter = 0;
		
		//we will export everything onto one sheet
		XSSFSheet allWorkgroupsSheet = null;
		
		if(wb != null) {
			allWorkgroupsSheet = wb.createSheet("All Workgroups");
		}

		String teacherLogin = "";
		
		try {
			//get the teacher login
			teacherLogin = teacherUserInfoJSONObject.getString("userName");
		} catch (JSONException e1) {
			e1.printStackTrace();
		}
		
		//counter for the header column cells
		int headerColumn = 0;
		
		//create the first row which will contain the headers
		Row headerRow = createRow(allWorkgroupsSheet, rowCounter++);
    	
    	//vector that contains all the header column names
    	Vector<String> headerColumnNames = new Vector<String>();
    	
    	//define the text for the header cells
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
    	
    	//add all the header column names to the row
    	for(int y=0; y<headerColumnNames.size(); y++) {
	    	headerRow.createCell(headerColumn).setCellValue(headerColumnNames.get(y));
	    	headerColumn++;	    		
    	}
    	
		//loop through all the workgroups
    	for(int x=0; x<workgroupIds.size(); x++) {
    		//get the workgroup id
			String workgroupId = workgroupIds.get(x);

			UserInfo userInfo = vleService.getUserInfoByWorkgroupId(Long.parseLong(workgroupId));
			
			//get the period
			String periodName = workgroupIdToPeriodName.get(Integer.parseInt(workgroupId));
			
    		//get all the user ids for this workgroup
    		String userIds = workgroupIdToUserIds.get(Integer.parseInt(workgroupId + ""));
    		
			//the user ids string is delimited by ':'
			String[] userIdsArray = userIds.split(":");
			
			//sort the user ids numerically and put them into a list
			ArrayList<Long> userIdsList = sortUserIdsArray(userIdsArray);
			
			String wiseId1 = "";
			String wiseId2 = "";
			String wiseId3 = "";
			
			//loop through all the user ids in this workgroup
			for(int z=0; z<userIdsList.size(); z++) {
				//get a user id
				Long wiseId = userIdsList.get(z);
				
				//set the appropriate wise id
				if(z == 0) {
					wiseId1 = wiseId + "";
				} else if(z == 1) {
					wiseId2 = wiseId + "";
				} else if(z == 2) {
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
	    	
	    	//get all the work from the workgroup
	    	List<StepWork> stepWorks = vleService.getStepWorksByUserInfo(userInfo);
	    	
	    	//remember the previous response so we can determine what has changed
	    	JSONObject previousResponse = null;
	    	
	    	//stores the revision number for the node ids for the current workgroup
	    	HashMap<String, Long> nodeIdToRevisionNumber = new HashMap<String, Long>();
	    	
	    	//stores the previous response for a node id
	    	HashMap<String, JSONObject> nodeIdToPreviousResponse = new HashMap<String, JSONObject>();
	    	
	    	//loop through all the work
	    	for(int z=0; z<stepWorks.size(); z++) {
	    		StepWork stepWork = stepWorks.get(z);
	    		
    			//get the start and end time for the student visit
				Timestamp visitStartTime = stepWork.getStartTime();
				Timestamp visitEndTime = stepWork.getEndTime();
				
				if(!previousTimestamps.contains(visitStartTime)) {
					//get the node and node type
		    		Node node = stepWork.getNode();
		    		String nodeType = node.getNodeType();
		    		String nodeId = node.getNodeId();
		    		
		    		if(nodeType != null && nodeType.equals("FlashNode") && nodeId != null) {
		    			//the work is for a flash step
		    			
		    			//get the step type e.g. "Flash"
		    			String stepType = nodeType.replace("Node", "");
		    			
		    			//get the student work
		    			String data = stepWork.getData();
		    			
		    			try {
		    				//get the JSONObject representation of the student work
							JSONObject dataJSONObject = new JSONObject(data);
							
							//get the node states from the student work
							JSONArray nodeStates = dataJSONObject.getJSONArray("nodeStates");
							
							if(nodeStates != null && nodeStates.length() > 0) {
								//get the last node state
								JSONObject nodeState = nodeStates.getJSONObject(nodeStates.length() - 1);
								
								JSONObject response = nodeState.getJSONObject("response");
								
								if(response != null) {
									//get the array of items
									JSONArray dataArray = response.getJSONArray("data");
									
									//get the human readable custom grading
									String customGrading = response.getString("customGrading");
									
									//get the current revision number to use
							    	Long revisionNumber = nodeIdToRevisionNumber.get(nodeId);
							    	
							    	if(revisionNumber == null) {
							    		//initialize the value if this is the first revision
							    		revisionNumber = 1L;
							    	}
							    	
							    	//get the previous response
							    	previousResponse = nodeIdToPreviousResponse.get(nodeId);
							    	
									//loop through all the items
									for(int i=0; i<dataArray.length(); i++) {
										//get an item
										JSONObject itemLabel = dataArray.getJSONObject(i);
										
										//get the attributes of the item
										String labelText = itemLabel.getString("labelText");
										long xPos = itemLabel.getLong("xPos");
										long yPos = itemLabel.getLong("yPos");
										boolean isDeleted = itemLabel.getBoolean("isDeleted");
										long handleBarX = itemLabel.getLong("handleBarX");
										long handleBarY = itemLabel.getLong("handleBarY");
										
										//create a row for this idea
										Row itemRow = createRow(allWorkgroupsSheet, rowCounter++);
						    			Vector<String> itemRowVector = createRowVector();
						    			
						    			int columnCounter = 0;
						    			
						    			//get the step work id and node id
						    			Long stepWorkId = stepWork.getId();
						    			
						    			//get the title of the step
						    			String title = nodeIdToNodeTitlesMap.get(nodeId);
						    			
						    			//get the content for the step
						    			JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
						    			String prompt = ""; 
						    				
						    			if(nodeContent != null) {
						    				if(nodeContent.has("prompt")) {
						    					//get the prompt
						    					prompt = nodeContent.getString("prompt");					    					
						    				}
						    			}
										
										long timeSpentOnStep = 0;
								    	
								    	//calculate the time the student spent on the step
								    	if(visitEndTime == null || visitStartTime == null) {
								    		//set to -1 if either start or end was null so we can set the cell to N/A later
								    		timeSpentOnStep = -1;
								    	} else {
								    		/*
								    		 * find the difference between start and end and divide by
								    		 * 1000 to obtain the value in seconds
								    		 */
								    		timeSpentOnStep = (visitEndTime.getTime() - visitStartTime.getTime()) / 1000;	
								    	}
								    	
								    	//set the workgroup values into the row
								    	columnCounter = setCellValueConvertStringToLong(itemRow, itemRowVector, columnCounter, workgroupId);
								    	columnCounter = setCellValueConvertStringToLong(itemRow, itemRowVector, columnCounter, wiseId1);
								    	columnCounter = setCellValueConvertStringToLong(itemRow, itemRowVector, columnCounter, wiseId2);
								    	columnCounter = setCellValueConvertStringToLong(itemRow, itemRowVector, columnCounter, wiseId3);
								    	
								    	//set the project run values into the row
								    	columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, teacherLogin);
								    	columnCounter = setCellValueConvertStringToLong(itemRow, itemRowVector, columnCounter, projectId);
								    	columnCounter = setCellValueConvertStringToLong(itemRow, itemRowVector, columnCounter, parentProjectId);
								    	columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, projectName);
								    	columnCounter = setCellValueConvertStringToLong(itemRow, itemRowVector, columnCounter, runId);
								    	columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, runName);
								    	columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, startTime);
								    	columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, endTime);
								    	
								    	//set the step values into the row
								    	columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, periodName);
										columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, stepWorkId);
										columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, title);
										columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, stepType);
										columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, prompt);
										columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, nodeId);
										columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, timestampToFormattedString(visitStartTime));
										
										//set the visit end time
										if(visitEndTime != null) {
											columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, timestampToFormattedString(visitEndTime));
										} else {
											columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, "");
										}
										
										//set the time spent on the step
								    	if(timeSpentOnStep == -1) {
								    		columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, "N/A");
								    	} else {
								    		columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, timeSpentOnStep);
								    	}
								    	
								    	//set the student work values into the row
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
								    	
								    	//set the values that specify whether the student data has changed
								    	columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, getIntFromBoolean(isItemNew));
								    	columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, getIntFromBoolean(isItemLabelTextRevised));
								    	columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, getIntFromBoolean(isItemRepositioned));
								    	columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, getIntFromBoolean(isItemDeletedFalseToTrue));
								    	columnCounter = setCellValue(itemRow, itemRowVector, columnCounter, getIntFromBoolean(isItemDeletedTrueToFalse));
								    	
								    	//write the csv row if we are generating a csv file
								    	writeCSV(itemRowVector);
									}
									
									if(dataArray.length() > 0) {
										previousResponse = response;
										
										//remember the previous response
										nodeIdToPreviousResponse.put(nodeId, previousResponse);
										
										//update the revision number counter
										revisionNumber++;
										nodeIdToRevisionNumber.put(nodeId, revisionNumber);
									}
								}
							}
						} catch (JSONException e) {
							e.printStackTrace();
						}
		    		} else if(exportAllWork) {
		    			//we will export all the non flash step student work
		    			
		    			//get the student work
		    			String data = stepWork.getData();
		    			
		    			//get the work from the step work
		    			String stepWorkResponse = getStepWorkResponse(stepWork);
		    			
		    			/*
		    			 * we will display the step work if it exists and is not for
		    			 * SVGDrawNode because SVGDrawNode student data can sometimes
		    			 * cause problems when Excel tries to parse the SVG student
		    			 * data 
		    			 */
		    			if(stepWorkResponse.equals("") && !nodeType.equals("SVGDrawNode")) {
			    			//get the JSONObject representation of the student work
							try {
								JSONObject dataJSONObject = new JSONObject(data);
								
								//get the node states from the student work
								JSONArray nodeStates = dataJSONObject.getJSONArray("nodeStates");
								
								if(nodeStates != null && nodeStates.length() > 0) {
									//get the last node state
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
		    			if(nodeType.equals("IdeaBasketNode")) {
		    				stepWorkResponse = "";
		    			}
		    			
						//create a row for this idea
		    			Row workRow = createRow(allWorkgroupsSheet, rowCounter++);
		    			Vector<String> workRowVector = createRowVector();
		    			
		    			int columnCounter = 0;
		    			
		    			//get the step work id and node id
		    			Long stepWorkId = stepWork.getId();
		    			
		    			//get the title of the step
		    			String title = nodeIdToNodeTitlesMap.get(nodeId);
		    			
		    			String stepType = nodeType.replace("Node", "");
		    			
		    			//get the content for the step
		    			JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);

		    			//String prompt = "";
		    			String prompt = getPromptFromNodeContent(nodeContent);
		    			
		    			long timeSpentOnStep = 0;
				    	
				    	//calculate the time the student spent on the step
				    	if(visitEndTime == null || visitStartTime == null) {
				    		//set to -1 if either start or end was null so we can set the cell to N/A later
				    		timeSpentOnStep = -1;
				    	} else {
				    		/*
				    		 * find the difference between start and end and divide by
				    		 * 1000 to obtain the value in seconds
				    		 */
				    		timeSpentOnStep = (visitEndTime.getTime() - visitStartTime.getTime()) / 1000;	
				    	}
		    			
				    	//set the workgroup values into the row
		    			columnCounter = setCellValueConvertStringToLong(workRow, workRowVector, columnCounter, workgroupId);
				    	columnCounter = setCellValueConvertStringToLong(workRow, workRowVector, columnCounter, wiseId1);
				    	columnCounter = setCellValueConvertStringToLong(workRow, workRowVector, columnCounter, wiseId2);
				    	columnCounter = setCellValueConvertStringToLong(workRow, workRowVector, columnCounter, wiseId3);
				    	
				    	//set the run values into the row
				    	columnCounter = setCellValue(workRow, workRowVector, columnCounter, teacherLogin);
				    	columnCounter = setCellValueConvertStringToLong(workRow, workRowVector, columnCounter, projectId);
				    	columnCounter = setCellValueConvertStringToLong(workRow, workRowVector, columnCounter, parentProjectId);
				    	columnCounter = setCellValue(workRow, workRowVector, columnCounter, projectName);
				    	columnCounter = setCellValueConvertStringToLong(workRow, workRowVector, columnCounter, runId);
				    	columnCounter = setCellValue(workRow, workRowVector, columnCounter, runName);
				    	columnCounter = setCellValue(workRow, workRowVector, columnCounter, startTime);
				    	columnCounter = setCellValue(workRow, workRowVector, columnCounter, endTime);
				    	
				    	//set the step values into the row
				    	columnCounter = setCellValue(workRow, workRowVector, columnCounter, periodName);
						columnCounter = setCellValue(workRow, workRowVector, columnCounter, stepWorkId);
						columnCounter = setCellValue(workRow, workRowVector, columnCounter, title);
						columnCounter = setCellValue(workRow, workRowVector, columnCounter, stepType);
						columnCounter = setCellValue(workRow, workRowVector, columnCounter, prompt);
						columnCounter = setCellValue(workRow, workRowVector, columnCounter, nodeId);
						columnCounter = setCellValue(workRow, workRowVector, columnCounter, timestampToFormattedString(visitStartTime));
						
						//set the visit end time
						if(visitEndTime != null) {
							columnCounter = setCellValue(workRow, workRowVector, columnCounter, timestampToFormattedString(visitEndTime));
						} else {
							columnCounter = setCellValue(workRow, workRowVector, columnCounter, "");
						}
						
						//set the time spent on the step
				    	if(timeSpentOnStep == -1) {
				    		columnCounter = setCellValue(workRow, workRowVector, columnCounter, "N/A");
				    	} else {
				    		columnCounter = setCellValue(workRow, workRowVector, columnCounter, timeSpentOnStep);
				    	}
				    	
				    	columnCounter++;
				    	columnCounter++;
				    	addEmptyElementsToVector(workRowVector, 2);
				    	
				    	//set the student work into the row
				    	columnCounter = setCellValue(workRow, workRowVector, columnCounter, stepWorkResponse);
				    	
				    	//write the csv row if we are generating a csv file
				    	writeCSV(workRowVector);
		    		}
		    		
		    		//add the visit start time to our vector so we can check for duplicate entries
		    		previousTimestamps.add(visitStartTime);
				}
	    	}
		}
		
		return wb;
	}
	
	/**
	 * Determine if the item is new
	 * 
	 * @param itemLabel the item label object
	 * @param itemIndex the item index
	 * @param previousResponse the previous student work
	 * 
	 * @return whether the item is new
	 */
	private boolean isItemNew(JSONObject itemLabel, int itemIndex, JSONObject previousResponse) {
		boolean result = false;
		
		if(previousResponse == null) {
			//there was no previous student work so this item is new
			result = true;
		} else {
			try {
				//get the previous student work data
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
				if(itemIndex >= dataArray.length()) {
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
	 * 
	 * @param itemLabel the item label object
	 * @param itemIndex the item index
	 * @param previousResponse the previous student work
	 * 
	 * @return whether the item was revised
	 */
	private boolean isItemLabelTextRevised(JSONObject itemLabel, int itemIndex, JSONObject previousResponse) {
		boolean result = false;
		
		if(previousResponse != null) {
			try {
				//get the previous student work data
				JSONArray dataArray = previousResponse.getJSONArray("data");
				
				//check if the current item index is in the data array
				if(dataArray != null && dataArray.length() > itemIndex) {
					//get the previous item at the given index
					JSONObject previousItemLabel = dataArray.getJSONObject(itemIndex);

					if(previousItemLabel != null) {
						//get the text from the previous student work item
						String previousItemLabelText = previousItemLabel.getString("labelText");
						
						//get the text from the current student work item
						String itemLabelText = itemLabel.getString("labelText");
						
						if(!itemLabelText.equals(previousItemLabelText)) {
							//the label text is not the same
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
	 * 
	 * @param itemLabel the item label object
	 * @param itemIndex the item index
	 * @param previousResponse the previous student work
	 * 
	 * @return whether the item was repositioned on the canvas
	 */
	private boolean isItemRepositioned(JSONObject itemLabel, int itemIndex, JSONObject previousResponse) {
		boolean result = false;
		
		if(previousResponse != null) {
			try {
				//get the previous student work data
				JSONArray dataArray = previousResponse.getJSONArray("data");
				
				//check if the current item index is in the data array
				if(dataArray != null && dataArray.length() > itemIndex) {
					//get the previous item at the given index
					JSONObject previousItemLabel = dataArray.getJSONObject(itemIndex);

					if(previousItemLabel != null) {
						//get the x and y pos for the previous student work item
						long previousXPos = previousItemLabel.getLong("xPos");
						long previousYPos = previousItemLabel.getLong("yPos");
						
						//get the x and y pos for the current student work item
						long xPos = itemLabel.getLong("xPos");
						long yPos = itemLabel.getLong("yPos");
						
						if(previousXPos != xPos || previousYPos != yPos) {
							//the position has changed
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
	 * 
	 * @param itemLabel the item label object
	 * @param itemIndex the item index
	 * @param previousResponse the previous student work
	 * 
	 * @return whether the item was set from deleted false to true
	 */
	private boolean isItemDeletedFalseToTrue(JSONObject itemLabel, int itemIndex, JSONObject previousResponse) {
		boolean result = false;
		
		if(previousResponse == null) {
			//there was no previous student work
			
			try {
				//we will use the isDeleted value since there is no previous student work
				boolean isDeleted = itemLabel.getBoolean("isDeleted");
				result = isDeleted;
			} catch (JSONException e) {
				e.printStackTrace();
			}
		} else {
			try {
				//get the previous student data
				JSONArray dataArray = previousResponse.getJSONArray("data");
				
				//check if the current item index is in the data array
				if(dataArray != null && dataArray.length() > itemIndex) {
					//get the previous item at the given index
					JSONObject previousItemLabel = dataArray.getJSONObject(itemIndex);

					if(previousItemLabel != null) {
						//get the isDeleted value for the previous student work
						boolean previousIsDeleted = previousItemLabel.getBoolean("isDeleted");
						
						//get the isDeleted value for the current student work
						boolean isDeleted = itemLabel.getBoolean("isDeleted");
						
						if(previousIsDeleted == false && isDeleted == true) {
							//isDeleted changed from false to true
							result = true;
						}
					}
				} else {
					try {
						//we will use the isDeleted value since there is no previous student work
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
	 * 
	 * @param itemLabel the item label object
	 * @param itemIndex the item index
	 * @param previousResponse the previous student work
	 * 
	 * @return whether the item was set from deleted true to false
	 */
	private boolean isItemDeletedTrueToFalse(JSONObject itemLabel, int itemIndex, JSONObject previousResponse) {
		boolean result = false;
		
		if(previousResponse != null) {
			try {
				//get the previous student data
				JSONArray dataArray = previousResponse.getJSONArray("data");
				
				//check if the current item index is in the data array
				if(dataArray != null && dataArray.length() > itemIndex) {
					//get the previous item at the given index
					JSONObject previousItemLabel = dataArray.getJSONObject(itemIndex);

					if(previousItemLabel != null) {
						//get the isDeleted value for the previous student work
						boolean previousIsDeleted = previousItemLabel.getBoolean("isDeleted");
						
						//get the isDeleted value for the current student work
						boolean isDeleted = itemLabel.getBoolean("isDeleted");
						
						if(previousIsDeleted == true && isDeleted == false) {
							//isDeleted changed from true to false
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
	 * 
	 * @param rbgString e.g. "rgb(38, 84, 207)"
	 * 
	 * @return a string with the color name
	 */
	private String getColorNameFromRBGString(String rbgString) {
		String color = "";
		
		if(rbgString == null) {
			//do nothing
		} else if(rbgString.equals("rgb(38, 84, 207)")) {
			color = "blue";
		} else if(rbgString.equals("rgb(0, 153, 51)")) {
			color = "green";
		} else if(rbgString.equals("rgb(204, 51, 51)")) {
			color = "red";
		} else if(rbgString.equals("rgb(204, 102, 0)")) {
			color = "orange";
		} else if(rbgString.equals("rgb(153, 102, 255)")) {
			color = "purple";
		} else if(rbgString.equals("rgb(153, 51, 51)")) {
			color = "brown";
		}
		
		return color;
	}
	
	/**
	 * Get the idea basket version
	 * 
	 * @param projectMetaData the project meta data 
	 * 
	 * @return the version number of the idea basket. the version
	 * will be 1 if the project is using the original version of
	 * the idea basket that contains static sources and icons.
	 * the new version will be 2 or higher.
	 */
	private int getIdeaBasketVersion(JSONObject projectMetaData) {
		//the version will be 1 if we don't find the version in the project meta data
		int version = 1;
		
		try {
			if(projectMetaData != null) {
				if(projectMetaData.has("tools")) {
					//get the tools
					JSONObject tools = projectMetaData.getJSONObject("tools");
					
					if(tools != null) {
						if(tools.has("ideaManagerSettings")) {
							//get the idea manager settings
							JSONObject ideaManagerSettings = tools.getJSONObject("ideaManagerSettings");
							
							if(ideaManagerSettings != null) {
								if(ideaManagerSettings.has("version")) {
									//get the version
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

		//get the idea basket version that this run uses
		int ideaBasketVersion = getIdeaBasketVersion(projectMetaData);
		
		/**
		 * The idea manager settings from the project meta data will look something
		 * like this
		 * 
		 * 	"ideaManagerSettings": {
         *		"ideaTermPlural": "ideas",
         *		"ideaAttributes": [
         *		    {
         *		       "id": "eCE74fj87q",
         *		       "allowCustom": false,
         *		       "isRequired": true,
         *		       "name": "Source",
         *		       "type": "source",
         *		       "options": [
         *		       		"Evidence Step",
         *		       		"Visualization or Model",
         *		       		"Movie/Video",
         *		       		"Everyday Observation",
         *		       		"School or Teacher"
         *		       	]
         *		    },
		 *			{
         *          	"id": "KuHD6rZVBm",
         *          	"allowCustom": false,
         *          	"isRequired": true,
         *          	"name": "Water Bottle",
         *          	"type": "label",
         *          	"options": [
         *          		"Water",
         *          		"Orange Juice"
         *          	]
         *          }
         *		],
         *		"basketTerm": "Idea Basket",
         *		"addIdeaTerm": "Add Idea",
         *		"ideaTerm": "idea",
         *		"ebTerm": "Explanation Builder",
         *		"version": "2"
         * 	}
		 */
		JSONObject ideaManagerSettings = null;
		
		//will contain the ideaAttributes array from the idea manager settings
		JSONArray ideaAttributes = null;
		
		//will contain the ideaAttribute ids
		JSONArray ideaAttributeIds = new JSONArray();
		
		if(ideaBasketVersion > 1) {
			if(projectMetaData != null) {
				//check if there is a tools field in the project meta data
				if(projectMetaData.has("tools")) {
					try {
						//get the tools field
						JSONObject tools = projectMetaData.getJSONObject("tools");
						if(tools != null) {
							//check if there is an ideaManagerSettings field
							if(tools.has("ideaManagerSettings")) {
								//get the ideaManagerSettings field
								ideaManagerSettings = tools.getJSONObject("ideaManagerSettings");
								
								if(ideaManagerSettings != null) {
									//check if there is an ideaAttributes field
									if(ideaManagerSettings.has("ideaAttributes")) {
										//get the ideaAttributes
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
		
		//the excel workbook
		XSSFWorkbook wb = null;
		XSSFSheet mainSheet = null;
		
		if(isFileTypeXLS(fileType)) {
			//we are generating an xls file so we will create the workbook
			wb = new XSSFWorkbook();
			
			//this export will only contain one sheet
			mainSheet = wb.createSheet();
		}
		
		int rowCounter = 0;
		int columnCounter = 0;
		
		//create all the header fields
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
		
		if(ideaBasketVersion == 1) {
			//this run uses the first version of the idea basket which always has flag, tags, and source
			headerFields.add("Flag");
			headerFields.add("Tags");
			headerFields.add("Source");
		} else {
			//this run uses the newer version of the idea basket which can have variable and authorable fields
			if(ideaAttributes != null) {
				
				//loop through all the idea attributes
				for(int x=0; x<ideaAttributes.length(); x++) {
					try {
						//get an idea attribute
						JSONObject ideaAttribute = ideaAttributes.getJSONObject(x);
						
						if(ideaAttribute.has("name")) {
							//get the name of the attribute
							String ideaAttributeName = ideaAttribute.getString("name");
							
							//add the header for the attribute
							headerFields.add(ideaAttributeName);
							
							//get the id of the attribute
							String ideaAttributeId = ideaAttribute.getString("id");
							
							//add the id to our array of attribute ids
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

		//loop through all the header fields to add them to the excel
		for(int x=0; x<headerFields.size(); x++) {
	    	//the header column to just keep track of each row (which represents a step visit)
	    	columnCounter = setCellValue(headerRow, headerRowVector, columnCounter, headerFields.get(x));
		}
		
		//write the csv row if we are generating a csv file
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
		
		//counter for the basket revision for a workgroup
		int basketRevision = 1;
		
		//variable that will hold the previous basket revision
		JSONObject previousIdeaBasketJSON = null;
		
		//object to format timestamps
		DateFormat dateTimeInstance = DateFormat.getDateTimeInstance();
		
		//loop through all the basket revisions
		for(int x=0; x<ideaBasketRevisions.size(); x++) {
			
			//get the IdeaBasket java object
			IdeaBasket ideaBasket = ideaBasketRevisions.get(x);
			
			//get the workgroup id
			long workgroupId = ideaBasket.getWorkgroupId();

			if(workgroupId == previousWorkgroupId) {
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
			
			//get the JSON for the basket revision
			String data = ideaBasket.getData();
			
			if(data != null) {
				JSONObject ideaBasketJSON = new JSONObject();
				try {
					//create a JSON object from the basket revision
					ideaBasketJSON = new JSONObject(data);
					
					JSONArray ideas = ideaBasketJSON.getJSONArray("ideas");
					//loop through all the active ideas
					for(int ideasCounter=0; ideasCounter<ideas.length(); ideasCounter++) {
						JSONObject idea = ideas.getJSONObject(ideasCounter);
						rowCounter = createIdeaBasketRow(mainSheet, dateTimeInstance, nodeIdToNodeTitlesMap, ideaBasket, ideaAttributeIds, rowCounter, workgroupId, basketRevision, ideaBasketVersion, ideaBasketJSON, idea, previousIdeaBasketJSON);
					}
					
					JSONArray deleted = ideaBasketJSON.getJSONArray("deleted");
					//loop through all the private ideas
					for(int deletedCounter=0; deletedCounter<deleted.length(); deletedCounter++) {
						JSONObject deletedIdea = deleted.getJSONObject(deletedCounter);
						rowCounter = createIdeaBasketRow(mainSheet, dateTimeInstance, nodeIdToNodeTitlesMap, ideaBasket, ideaAttributeIds, rowCounter, workgroupId, basketRevision, ideaBasketVersion, ideaBasketJSON, deletedIdea, previousIdeaBasketJSON);
					}
					
					/*
					 * remember the workgroupid and basket so we can 
					 * compare them to the next revision
					 */
					previousWorkgroupId = workgroupId;
					previousIdeaBasketJSON = ideaBasketJSON;
					
					if(ideaBasket.isPublic() != null && ideaBasket.isPublic() && ideas.length() == 0 && deleted.length() == 0) {
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
			if(idea != null) {
				Integer ideaId = idea.getInt("id");
				
				Integer ideaWorkgroupId = null;
				
				//get the workgroup id if it is available
				if(idea.has("workgroupId")) {
					try {
						ideaWorkgroupId = idea.getInt("workgroupId");						
					} catch(JSONException e) {
						ideaWorkgroupId = null;
					}
				}
				
				//create a new row
				Row ideaBasketRow = createRow(mainSheet, rowCounter++);
				Vector<String> ideaBasketRowVector = createRowVector();
				
				String periodName = null;
				Long periodId = ideaBasket.getPeriodId();
				
				//get the period name if the period id is available
				if(periodId != null) {
					periodName = periodIdToPeriodName.get(periodId.intValue());
				}
				
				//WorkgrupId, Wise Id 1, Wise Id 2, Wise Id 3, Class Period
				columnCounter = createUserDataRow(columnCounter, ideaBasketRow, ideaBasketRowVector, workgroupId + "", true, true, periodName);
				
				//Is Public
				Boolean isPublic = ideaBasket.isPublic();
				if(isPublic == null) {
					columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(false));
				} else {
					columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(isPublic));
				}
				
				//Basket Revision
				columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, basketRevision);
				
				//Action
				String action = ideaBasket.getAction();
				if(action == null) {
					columnCounter++;
					addEmptyElementsToVector(ideaBasketRowVector, 1);
				} else {
					columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, action);
				}

				//Action Performer
				Long actionPerformer = ideaBasket.getActionPerformer();
				if(actionPerformer == null) {
					columnCounter++;
					addEmptyElementsToVector(ideaBasketRowVector, 1);
				} else {
					columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, actionPerformer);
				}

				//Changed Idea Id
				Long changedIdeaId = ideaBasket.getIdeaId();
				if(changedIdeaId == null) {
					columnCounter++;
					addEmptyElementsToVector(ideaBasketRowVector, 1);
				} else {
					columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, changedIdeaId);
				}

				//Changed Idea Workgroup Id
				Long changedIdeaWorkgroupId = ideaBasket.getIdeaWorkgroupId();
				if(changedIdeaWorkgroupId == null) {
					columnCounter++;
					addEmptyElementsToVector(ideaBasketRowVector, 1);
				} else {
					columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, changedIdeaWorkgroupId);
				}
				
				//Idea Id
				if(ideaId == null) {
					columnCounter++;
					addEmptyElementsToVector(ideaBasketRowVector, 1);
				} else {
					columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, ideaId);
				}
				
				//Idea Workgroup Id
				if(ideaWorkgroupId == null) {
					columnCounter++;
					addEmptyElementsToVector(ideaBasketRowVector, 1);
				} else {
					columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, ideaWorkgroupId);
				}
				
				//Idea Text
				columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, idea.getString("text"));

				if(ideaBasketVersion == 1) {
					//this run uses the first version of the idea basket which always has flag, tags, and source
					
					//Flag
					columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, idea.getString("flag"));
					
					//Tags
					columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, idea.getString("tags"));
					
					//Source
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
					for(int idIndex=0; idIndex<ideaAttributeIds.length(); idIndex++) {
						//get an attribute id
						String attributeId = ideaAttributeIds.getString(idIndex);
						
						//get the value the student entered for this attribute
						String value = getAttributeValueByAttributeId(idea, attributeId);
						
						//set the value into the cell
						columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, value);
					}
				}
				
				//Node Type
				columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getNodeTypeFromIdea(idea, nodeIdToNodeContent));
				
				//Node Id Created On
				columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, idea.getString("nodeId"));
				
				//Node Name Created On
				columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, idea.getString("nodeName"));
				
				//Steps Used In Count
				columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getStepsUsedInCount(idea));
				
				//Steps Used In
				columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getStepsUsedIn(idea, nodeIdToNodeTitlesMap));
				
				//Was Copied From Public
				if(idea.has("wasCopiedFromPublic")) {
					boolean wasCopiedFromPublic = idea.getBoolean("wasCopiedFromPublic");
					columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(wasCopiedFromPublic));
				} else {
					columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(false));
				}
				
				//Is Published To Public
				if(idea.has("isPublishedToPublic")) {
					boolean isPublishedToPublic = idea.getBoolean("isPublishedToPublic");
					columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(isPublishedToPublic));
				} else {
					columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(false));
				}
				
				if(idea.has("workgroupIdsThatHaveCopied")) {
					JSONArray workgroupIdsThatHaveCopied = idea.getJSONArray("workgroupIdsThatHaveCopied");
					
					//Times Copied
					int timesCopied = workgroupIdsThatHaveCopied.length();
					columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, timesCopied);
					
					//Workgroup Ids That Have Copied
					StringBuffer workgroupIdsThatHaveCopiedStringBuffer = new StringBuffer();
					
					//loop through all the workgroup ids that have copied this idea
					for(int workgroupIdsCopiedCounter=0; workgroupIdsCopiedCounter<workgroupIdsThatHaveCopied.length(); workgroupIdsCopiedCounter++) {
						long workgroupIdThatHasCopied = workgroupIdsThatHaveCopied.getLong(workgroupIdsCopiedCounter);
						
						if(workgroupIdsThatHaveCopiedStringBuffer.length() != 0) {
							//separate workgroup ids with a ,
							workgroupIdsThatHaveCopiedStringBuffer.append(",");
						}
						
						//add the workgroup id
						workgroupIdsThatHaveCopiedStringBuffer.append(workgroupIdThatHasCopied);
					}
					
					//set the workgroup ids that have copied as a comma separated string
					columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, workgroupIdsThatHaveCopiedStringBuffer.toString());
				} else {
					//this idea does not have workgroup ids that have copied
					
					//set the times copied value to 0
					columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, 0);
					
					//increment the counter to skip over the Workgroup Ids That Have Copied column
					columnCounter++;
					addEmptyElementsToVector(ideaBasketRowVector, 1);
				}
				
				//Trash
				boolean ideaInTrash = isIdeaInTrash(ideaBasketJSON, idea);
				columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(ideaInTrash));
				
				//Timestamp Basket Saved
				Timestamp postTime = ideaBasket.getPostTime();
				long time = postTime.getTime();
				Date dateBasketSaved = new Date(time);
				String timestampBasketSaved = dateTimeInstance.format(dateBasketSaved);
				columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, timestampBasketSaved);
				
				//Timestamp Idea Created
				long timeCreated = idea.getLong("timeCreated");
				Date dateCreated = new Date(timeCreated);
				String timestampIdeaCreated = dateTimeInstance.format(dateCreated);
				columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, timestampIdeaCreated);
				
				//Timestamp Idea Last Edited
				long timeLastEdited = idea.getLong("timeLastEdited");
				Date dateLastEdited = new Date(timeLastEdited);
				String timestampIdeaLastEdited = dateTimeInstance.format(dateLastEdited);
				columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, timestampIdeaLastEdited);
				
				//New
				boolean ideaNew = isIdeaNew(idea, previousIdeaBasketJSON);
				columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(ideaNew));
				
				//Copied From Public In This Revision
				boolean isCopiedFromPublicInThisRevision = false;
				/*
				 * ideas can't be copied from the public basket directly to the public basket.
				 * you can only copy an idea from the public basket to a private basket.
				 */
				if(isPublic == null || isPublic == false) {
					isCopiedFromPublicInThisRevision = isCopiedFromPublicInThisRevision(idea, ideaBasketJSON, previousIdeaBasketJSON); 
				}

				columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(isCopiedFromPublicInThisRevision));
				
				//Revised
				boolean ideaRevised = isIdeaRevised(idea, previousIdeaBasketJSON, ideaBasketVersion, ideaAttributeIds);
				columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(ideaRevised));
				
				//Repositioned
				boolean ideaPositionChanged = isIdeaPositionChanged(ideaId, ideaBasketJSON, previousIdeaBasketJSON);
				columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(ideaPositionChanged));
				
				//Steps Used In Changed
				boolean stepsUsedInChanged = isStepsUsedInChanged(idea, previousIdeaBasketJSON, nodeIdToNodeTitlesMap);
				columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(stepsUsedInChanged));
				
				//Deleted In This Revision
				boolean ideaDeletedInThisRevision = isIdeaDeletedInThisRevision(idea, ideaBasketJSON, previousIdeaBasketJSON);
				columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(ideaDeletedInThisRevision));
				
				//Restored In This Revision
				boolean ideaRestoredInThisRevision = isIdeaRestoredInThisRevision(idea, ideaBasketJSON, previousIdeaBasketJSON);
				columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(ideaRestoredInThisRevision));
				
				//Made Public
				boolean isIdeaMadePublic = isIdeaMadePublic(idea, ideaBasketJSON, previousIdeaBasketJSON);
				columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(isIdeaMadePublic));
				
				//Made Private
				boolean isIdeaMadePrivate = isIdeaMadePrivate(idea, ideaBasketJSON, previousIdeaBasketJSON);
				columnCounter = setCellValue(ideaBasketRow, ideaBasketRowVector, columnCounter, getIntFromBoolean(isIdeaMadePrivate));
				
				//Copied In This Revision
				boolean isCopiedInThisRevision = false;
				if(isCopiedFromPublicInThisRevision) {
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
				
				//Uncopied In This Revision
				boolean isUncopiedInThisRevision = false;
				if(isIdeaMadePublic) {
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
				
				//write the csv row if we are generating a csv file
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
			if(idea.has("attributes")) {
				JSONArray attributes = idea.getJSONArray("attributes");
				
				if(attributes != null) {
					//loop through all the attributes in the student idea
					for(int a=0; a<attributes.length(); a++) {
						//get an attribute
						JSONObject attribute = attributes.getJSONObject(a);
						
						//get the id of the student attribute
						String id = attribute.getString("id");
						
						if(attributeId != null && id != null && attributeId.equals(id)) {
							//the ids match so we have found the attribute we are looking for
							
							if(attribute.has("value")) {
								//get the value that the student entered for the attribute
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
			//get the ideas
			JSONArray ideas = ideaBasketJSON.getJSONArray("ideas");
			JSONArray deleted = ideaBasketJSON.getJSONArray("deleted");
			
			//loop through the active ideas from newest to oldest
			for(int x=ideas.length() - 1; x>=0; x--) {
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
				if(activeIdea != null && activeIdea.getInt("id") == ideaId &&
						(workgroupId == null || activeIdeaWorkgroupId == workgroupId.intValue())) {
					//we have found the idea we want so we will stop searching
					idea = activeIdea;
					ideaFound = true;
					break;
				}
			}
			
			if(!ideaFound) {
				//we have not found the idea yet so we will search the trash from newest to oldest
				for(int y=deleted.length() - 1; y>=0; y--) {
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
					if(deletedIdea != null && deletedIdea.getInt("id") == ideaId &&
							(workgroupId == null || deletedIdeaWorkgroupId == workgroupId.intValue())) {
						//we have found the idea we want so we will stop searching
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
	 * 
	 * @param ideaBasketJSON the basket revision
	 * 
	 * @return the number of ideas in the basket revision
	 */
	private int getNumberOfIdeas(JSONObject ideaBasketJSON) {
		int numberOfIdeas = 0;
		
		try {
			//get the ideas
			JSONArray ideas = ideaBasketJSON.getJSONArray("ideas");
			JSONArray deleted = ideaBasketJSON.getJSONArray("deleted");
			
			if(ideas != null) {
				//add the active ideas count
				numberOfIdeas += ideas.length();	
			}
			
			if(deleted != null) {
				//add the trash ideas count
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
			if(ideaBasketJSON != null) {
				//get the id
				int ideaId = idea.getInt("id");
				
				Integer workgroupId = null;
				
				if(idea.has("workgroupId")) {
					try {
						//get the workgroup id that owns the idea
						workgroupId = idea.getInt("workgroupId");						
					} catch(JSONException e) {
						workgroupId = null;
					}
				}
				
				//get the ideas
				JSONArray ideas = ideaBasketJSON.getJSONArray("ideas");
				JSONArray deleted = ideaBasketJSON.getJSONArray("deleted");
				
				//loop through the active ideas from newest to oldest
				for(int x=ideas.length() - 1; x>=0; x--) {
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
					if(activeIdea != null && activeIdea.getInt("id") == ideaId &&
							(workgroupId == null || activeIdeaWorkgroupId == workgroupId.intValue())) {
						//we have found the idea we want so we will stop searching
						idea = activeIdea;
						ideaFound = true;
						break;
					}
				}
				
				if(!ideaFound) {
					//we have not found the idea yet so we will search the trash from newest to oldest
					for(int y=deleted.length() - 1; y>=0; y--) {
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
						if(deletedIdea != null && deletedIdea.getInt("id") == ideaId &&
								(workgroupId == null || deletedIdeaWorkgroupId == workgroupId)) {
							//we have found the idea we want so we will stop searching
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
	 * 
	 * @param idea the idea
	 * @param previousIdeaBasket the previous basket revision
	 * 
	 * @return whether the idea is new
	 */
	private boolean isIdeaNew(JSONObject idea, JSONObject previousIdeaBasket) {
		boolean ideaNew = false;
		try {
			if(previousIdeaBasket == null) {
				//if there was no previous basket revision, the idea is new
				ideaNew = true;
			} else {
				//get the id
				int ideaId = idea.getInt("id");
				
				Integer workgroupId = null;
				
				if(idea.has("workgroupId")) {
					try {
						//get the workgroup id that owns the idea
						workgroupId = idea.getInt("workgroupId");						
					} catch(JSONException e) {
						workgroupId = null;
					}
				}
				
				//try to get the idea from the previous basket revision
				JSONObject previousIdeaRevision = getIdeaById(previousIdeaBasket, ideaId, workgroupId);
				
				if(previousIdeaRevision == null) {
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
	 * 
	 * @param idea the idea
	 * @param previousIdeaBasket the previous basket revision
	 * 
	 * @return whether the ideas was revised or not
	 */
	private boolean isIdeaRevised(JSONObject idea, JSONObject previousIdeaBasket, int ideaBasketVersion, JSONArray ideaAttributeIds) {
		boolean ideaRevised = false;
		try {
			if(previousIdeaBasket != null) {
				//get the id of the idea
				int ideaId = idea.getInt("id");
				
				Integer workgroupId = null;
				
				if(idea.has("workgroupId")) {
					try {
						//get the workgroup id that owns the idea
						workgroupId = idea.getInt("workgroupId");
					} catch(JSONException e) {
						workgroupId = null;
					}
				}
				
				//get the idea from the previous basket revision
				JSONObject previousIdeaRevision = getIdeaById(previousIdeaBasket, ideaId, workgroupId);
				
				if(previousIdeaRevision != null) {
					//get the time last edited timestamps
					long timeLastEdited = idea.getLong("timeLastEdited");
					long previousTimeLastEdited = previousIdeaRevision.getLong("timeLastEdited");

					//compare the time last edited timestamps
					if(timeLastEdited != previousTimeLastEdited) {
						ideaRevised = true;
					}
					
					if(ideaBasketVersion == 1) {
						//get the text
						String text = idea.getString("text");
						String previousText = previousIdeaRevision.getString("text");
						
						//compare the text
						if(text != null && !text.equals(previousText)) {
							ideaRevised = true;
						}
						
						//get the flags
						String flag = idea.getString("flag");
						String previousFlag = previousIdeaRevision.getString("flag");
						
						//compare the flags
						if(flag != null && !flag.equals(previousFlag)) {
							ideaRevised = true;
						}
						
						//get the tags
						String tags = idea.getString("tags");
						String previousTags = previousIdeaRevision.getString("tags");
						
						//compare the tags
						if(tags != null && !tags.equals(previousTags)) {
							ideaRevised = true;
						}
						
						//get the source
						String source = idea.getString("source");
						String previousSource = previousIdeaRevision.getString("source");
						
						//compare the source
						if(source != null && !source.equals(previousSource)) {
							ideaRevised = true;
						}
					} else {
						//get the text
						String text = idea.getString("text");
						String previousText = previousIdeaRevision.getString("text");
						
						//compare the text
						if(text != null && !text.equals(previousText)) {
							ideaRevised = true;
						}
						
						if(ideaAttributeIds != null) {
							//loop through all the attribute ids
							for(int x=0; x<ideaAttributeIds.length(); x++) {
								
								//get an attribute id
								String attributeId = ideaAttributeIds.getString(x);
								
								//get the value of the attribute from the current idea
								String currentValue = getAttributeValueByAttributeId(idea, attributeId);
								
								//get the value of the attribute from the previous idea
								String previousValue = getAttributeValueByAttributeId(previousIdeaRevision, attributeId);
								
								//compare the values
								if(currentValue != null && !currentValue.equals(previousValue)) {
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
	 * 
	 * @param ideaId the id of the idea
	 * @param currentIdeaBasket the current basket revision
	 * @param previousIdeaBasket the previous basket revision
	 * 
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
		
		
		if(previousPositionInIdeas == -1 && previousPositionInDeleted == -1) {
			/*
			 * idea was not in previous revision of idea basket which means
			 * it is new in the current revision. in this case we will return
			 * position changed as false
			 */
		} else {
			//try to find the position of the idea in the ideas array of the current basket revision
			currentPositionInIdeas = getPositionInIdeas(ideaId, currentIdeaBasket);
			
			if(currentPositionInIdeas == -1) {
				//we did not find it in the ideas array so we will look in the deleted array
				currentPositionInDeleted = getPositionInDeleted(ideaId, currentIdeaBasket);				
			}
			
			if(currentPositionInIdeas != -1 && previousPositionInIdeas != -1) {
				//the idea is in the ideas array of current and previous basket revisions
				
				if(currentPositionInIdeas != previousPositionInIdeas) {
					ideaPositionChanged = true;
				}
			} else if(currentPositionInDeleted != -1 && previousPositionInDeleted != -1) {
				//the idea is in the deleted array of current and previous basket revisions
				
				if(currentPositionInDeleted != previousPositionInDeleted) {
					ideaPositionChanged = true;
				}
			} else if(currentPositionInIdeas != -1 && previousPositionInDeleted != -1) {
				/*
				 * the idea is in the ideas array of the current basket revision 
				 * and in the deleted array of the previous basket revision
				 */
				ideaPositionChanged = true;
			} else if(currentPositionInDeleted != -1 && previousPositionInIdeas != -1) {
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
	 * 
	 * @param idea the idea JSONObject
	 * @param currentIdeaBasket the current basket revision
	 * @param previousIdeaBasket the previous basket revision
	 * 
	 * @return whether the idea was put into the trash in this revision
	 */
	private boolean isIdeaDeletedInThisRevision(JSONObject idea, JSONObject currentIdeaBasket, JSONObject previousIdeaBasket) {
		boolean ideaDeleted = false;

		//determine if the idea is in the trash in the current revision
		boolean ideaInCurrentTrash = isIdeaInTrash(currentIdeaBasket, idea);
		
		//determine if the idea is in the trash in the previous revision
		boolean ideaInPreviousTrash = isIdeaInTrash(previousIdeaBasket, idea);
		
		if(!ideaInPreviousTrash && ideaInCurrentTrash) {
			//the idea was not previously in the trash but now is in the trash
			ideaDeleted = true;
		}
		
		return ideaDeleted;
	}
	
	/**
	 * Determine whether the idea was taken out of the trash in this revision
	 * 
	 * @param idea the idea JSONObject
	 * @param currentIdeaBasket the current basket revision
	 * @param previousIdeaBasket the previous basket revision
	 * 
	 * @return whether the idea was taken out of the trash in this revision
	 */
	private boolean isIdeaRestoredInThisRevision(JSONObject idea, JSONObject currentIdeaBasket, JSONObject previousIdeaBasket) {
		boolean ideaRestored = false;
		
		//determine if the idea is in the trash in the current revision
		boolean ideaInCurrentTrash = isIdeaInTrash(currentIdeaBasket, idea);
		
		//determine if the idea is in the trash in the previous revision
		boolean ideaInPreviousTrash = isIdeaInTrash(previousIdeaBasket, idea);
		
		if(ideaInPreviousTrash && !ideaInCurrentTrash) {
			//the idea was previously in the trash but now is not in the trash
			ideaRestored = true;
		}
		
		return ideaRestored;
	}
	
	/**
	 * Determine if the idea was made public in this basket revision
	 * 
	 * @param idea the idea JSONObject
	 * @param currentIdeaBasket the current idea basket
	 * @param previousIdeaBasket the previous idea basket revision
	 * 
	 * @return whether the idea was made public in this basket revision
	 */
	private boolean isIdeaMadePublic(JSONObject idea, JSONObject currentIdeaBasket, JSONObject previousIdeaBasket) {
		boolean isIdeaMadePublic = false;
		
		if(idea != null) {
			try {
				/*
				 * make sure the idea has an id, workgroup id, and is published to public fields.
				 * if it does not have all these fields it can't have been published to public.
				 */
				if(idea.has("id") && idea.has("workgroupId") && idea.has("isPublishedToPublic")) {
					Integer ideaId = idea.getInt("id");
					Integer workgroupId = null;
					
					try {
						workgroupId = idea.getInt("workgroupId");
					} catch(JSONException e) {
						workgroupId = null;
					}
					
					boolean isPublishedToPublic = idea.getBoolean("isPublishedToPublic");
					
					if(previousIdeaBasket != null) {
						//get the idea from the previous basket revision
						JSONObject previousIdeaRevision = getIdeaById(previousIdeaBasket, ideaId, workgroupId);
						
						if(previousIdeaRevision == null) {
							/*
							 * the idea was not in the previous basket revision so
							 * we will just use the isPublishedToPublic value
							 */
							isIdeaMadePublic = isPublishedToPublic;
						} else {
							if(previousIdeaRevision.has("isPublishedToPublic")) {
								//get the isPublishedToPublic value from the previous idea revision
								boolean isPreviousPublishedToPublic = previousIdeaRevision.getBoolean("isPublishedToPublic");
								
								if(isPublishedToPublic && !isPreviousPublishedToPublic) {
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
	 * 
	 * @param idea the idea JSONObject
	 * @param currentIdeaBasket the current idea basket
	 * @param previousIdeaBasket the previous idea basket revision
	 * 
	 * @return whether the idea was made private in this basket revision
	 */
	private boolean isIdeaMadePrivate(JSONObject idea, JSONObject currentIdeaBasket, JSONObject previousIdeaBasket) {
		boolean isIdeaMadePrivate = false;
		
		if(idea != null) {
			try {
				/*
				 * make sure the idea has an id, workgroup id, and is published to public fields.
				 * if it does not have all these fields it can't have been published to public.
				 */
				if(idea.has("id") && idea.has("workgroupId") && idea.has("isPublishedToPublic")) {
					Integer ideaId = idea.getInt("id");
					Integer workgroupId = null;
					
					try {
						workgroupId = idea.getInt("workgroupId");
					} catch(JSONException e) {
						workgroupId = null;
					}
					
					boolean isPublishedToPublic = idea.getBoolean("isPublishedToPublic");
					boolean isPrivate = !isPublishedToPublic;
					
					if(previousIdeaBasket != null) {
						//get the idea from the previous basket revision
						JSONObject previousIdeaRevision = getIdeaById(previousIdeaBasket, ideaId, workgroupId);
						if(previousIdeaRevision == null) {
							//all ideas are initially private
							isIdeaMadePrivate = false;
						} else {
							if(previousIdeaRevision.has("isPublishedToPublic")) {
								//get the isPublishedToPublic value from the previous idea revision
								boolean isPreviousPublishedToPublic = previousIdeaRevision.getBoolean("isPublishedToPublic");
								boolean isPreviousPrivate = !isPreviousPublishedToPublic;
								
								if(isPrivate && !isPreviousPrivate) {
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
	 * Determine if the idea was was copied from the public basket
	 * in this basket revision
	 * 
	 * @param idea the idea JSONObject
	 * @param currentIdeaBasket the current idea basket
	 * @param previousIdeaBasket the previous idea basket revision
	 * 
	 * @return whether the idea was copied from the public basket in this basket revision
	 */
	private boolean isCopiedFromPublicInThisRevision(JSONObject idea, JSONObject currentIdeaBasket, JSONObject previousIdeaBasket) {
		boolean isCopiedFromPublicInThisRevision = false;
		
		if(idea != null) {
			try {
				/*
				 * make sure the idea has an id, workgroup id, and was copied from public fields.
				 * if it does not have all these fields it can't have been copied from public.
				 */
				if(idea.has("id") && idea.has("workgroupId") && idea.has("wasCopiedFromPublic")) {
					Integer ideaId = idea.getInt("id");
					Integer workgroupId = null;
					
					try {
						workgroupId = idea.getInt("workgroupId");
					} catch(JSONException e) {
						workgroupId = null;
					}
					
					boolean wasCopiedFromPublic = idea.getBoolean("wasCopiedFromPublic");
					
					if(previousIdeaBasket != null) {
						//get the idea from the previous basket revision
						JSONObject previousIdeaRevision = getIdeaById(previousIdeaBasket, ideaId, workgroupId);
						
						if(previousIdeaRevision == null) {
							/*
							 * the idea was not in the previous basket revision so
							 * we will just use the wasCopiedFromPublic value
							 */
							isCopiedFromPublicInThisRevision = wasCopiedFromPublic;
						} else {
							if(previousIdeaRevision.has("wasCopiedFromPublic")) {
								//get the wasCopiedFromPublic value from the previous idea revision
								boolean isPreviousPublishedToPublic = previousIdeaRevision.getBoolean("wasCopiedFromPublic");
								
								if(wasCopiedFromPublic && !isPreviousPublishedToPublic) {
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
	 * 
	 * @param idea the idea JSONObject
	 * @param currentIdeaBasket the current idea basket
	 * @param previousIdeaBasket the previous idea basket revision
	 * 
	 * @return whether the idea was copied by someone in this basket revision
	 */
	private boolean isCopiedInThisRevision(JSONObject idea, JSONObject currentIdeaBasket, JSONObject previousIdeaBasket) {
		boolean isCopiedInThisRevision = false;
		
		if(idea != null) {
			try {
				/*
				 * make sure the idea has an id, workgroup id, and workgroupIdsThatHaveCopied fields.
				 * if it does not have all these fields it can't have been copied.
				 */
				if(idea.has("id") && idea.has("workgroupId") && idea.has("workgroupIdsThatHaveCopied")) {
					Integer ideaId = idea.getInt("id");
					Integer workgroupId = null;
					
					try {
						workgroupId = idea.getInt("workgroupId");
					} catch(JSONException e) {
						workgroupId = null;
					}
					
					JSONArray workgroupIdsThatHaveCopied = idea.getJSONArray("workgroupIdsThatHaveCopied");
					int workgroupIdsThatHaveCopiedCount = workgroupIdsThatHaveCopied.length();
					
					if(previousIdeaBasket != null) {
						//get the idea from the previous basket revision
						JSONObject previousIdeaRevision = getIdeaById(previousIdeaBasket, ideaId, workgroupId);
						
						if(previousIdeaRevision == null) {
							/*
							 * the idea was not in the previous basket revision so
							 * we will just check if the current copied count is greater
							 * than 0
							 */
							if(workgroupIdsThatHaveCopiedCount > 0) {
								isCopiedInThisRevision = true;
							}
						} else {
							if(previousIdeaRevision.has("workgroupIdsThatHaveCopied")) {
								//get the workgroupIdsThatHaveCopied value from the previous idea revision
								JSONArray previousWorkgroupIdsThatHaveCopied = previousIdeaRevision.getJSONArray("workgroupIdsThatHaveCopied");
								int previousWorkgroupIdsThatHaveCopiedCount = previousWorkgroupIdsThatHaveCopied.length();
								
								if(workgroupIdsThatHaveCopiedCount == previousWorkgroupIdsThatHaveCopiedCount + 1) {
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
								if(workgroupIdsThatHaveCopiedCount > 0) {
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
						if(workgroupIdsThatHaveCopiedCount > 0) {
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
	 * 
	 * @param idea the idea JSONObject
	 * @param currentIdeaBasket the current idea basket
	 * @param previousIdeaBasket the previous idea basket revision
	 * 
	 * @return whether the idea was uncopied by someone in this basket revision
	 */
	private boolean isUncopiedInThisRevision(JSONObject idea, JSONObject currentIdeaBasket, JSONObject previousIdeaBasket) {
		boolean isUncopiedInThisRevision = false;
		
		if(idea != null) {
			try {
				/*
				 * make sure the idea has an id, workgroup id, and workgroupIdsThatHaveCopied fields.
				 * if it does not have all these fields it can't have been uncopied.
				 */
				if(idea.has("id") && idea.has("workgroupId") && idea.has("workgroupIdsThatHaveCopied")) {
					Integer ideaId = idea.getInt("id");
					Integer workgroupId = null;
					
					try {
						workgroupId = idea.getInt("workgroupId");
					} catch(JSONException e) {
						workgroupId = null;
					}
					
					JSONArray workgroupIdsThatHaveCopied = idea.getJSONArray("workgroupIdsThatHaveCopied");
					int workgroupIdsThatHaveCopiedCount = workgroupIdsThatHaveCopied.length();
					
					if(previousIdeaBasket != null) {
						//get the idea from the previous basket revision
						JSONObject previousIdeaRevision = getIdeaById(previousIdeaBasket, ideaId, workgroupId);
						
						if(previousIdeaRevision != null && previousIdeaRevision.has("workgroupIdsThatHaveCopied")) {
							//get the workgroupIdsThatHaveCopied value from the previous idea revision
							JSONArray previousWorkgroupIdsThatHaveCopied = previousIdeaRevision.getJSONArray("workgroupIdsThatHaveCopied");
							int previousWorkgroupIdsThatHaveCopiedCount = previousWorkgroupIdsThatHaveCopied.length();
							
							if(workgroupIdsThatHaveCopiedCount == previousWorkgroupIdsThatHaveCopiedCount - 1) {
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
	 * 
	 * @param ideaId the id of the idea
	 * @param ideaBasket the basket revision
	 * 
	 * @return the position of the idea in the ideas array, first position is 1,
	 * if the idea is not found it will return -1
	 */
	private int getPositionInIdeas(int ideaId, JSONObject ideaBasket) {
		return getPosition(ideaId, ideaBasket, "ideas");
	}
	
	/**
	 * Get the position in the deleted array
	 * 
	 * @param ideaId the id of the idea
	 * @param ideaBasket the basket revision
	 * 
	 * @return the position of the idea in the deleted array, first position is 1,
	 * if the idea is not found it will return -1
	 */
	private int getPositionInDeleted(int ideaId, JSONObject ideaBasket) {
		return getPosition(ideaId, ideaBasket, "deleted");
	}
	
	/**
	 * Get the position in the given array
	 * 
	 * @param ideaId the id of the idea
	 * @param ideaBasket the basket revision
	 * @param arrayName the name of the array to look in ("ideas" or "deleted")
	 * 
	 * @return the position of the idea in the given array, first position is 1,
	 * if the idea is not found it will return -1
	 */
	private int getPosition(int ideaId, JSONObject ideaBasket, String arrayName) {
		int position = -1;
		
		try {
			if(ideaBasket != null) {
				JSONArray ideaArray = ideaBasket.getJSONArray(arrayName);
				
				if(ideaArray != null) {
					//loop through all the ideas in the array
					for(int x=0; x<ideaArray.length(); x++) {
						//get an idea
						JSONObject idea = ideaArray.getJSONObject(x);
						
						//get the id of the idea
						int id = idea.getInt("id");
						
						if(ideaId == id) {
							//the id matches the one we want so we will return nthe position
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
	 * 
	 * @param idea the idea
	 * @param nodeIdToNodeTitlesMap a map of nodeId to nodeTitle
	 * 
	 * @return a String containing the steps that the idea is used in
	 * e.g.
	 * node_1.ht:Introduction,node_3.or:Explain your ideas
	 */
	private String getStepsUsedIn(JSONObject idea, HashMap<String, String> nodeIdToNodeTitlesMap) {
		StringBuffer stepsUsedIn = new StringBuffer();
		
		try {
			JSONArray stepsUsedInJSONArray = idea.getJSONArray("stepsUsedIn");
			
			if(stepsUsedInJSONArray != null) {
				//loop through all the steps used in
				for(int x=0; x<stepsUsedInJSONArray.length(); x++) {
					//get the node id of the step used in
					String nodeId = stepsUsedInJSONArray.getString(x);
					
					//get the step name from the map
					String nodeName = nodeIdToNodeTitlesMap.get(nodeId);
					
					if(stepsUsedIn.length() != 0) {
						//separate multiple steps with ,
						stepsUsedIn.append(",");
					}
					
					//separate the node id and the node title with :
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
	 * 
	 * @param idea the idea JSONObject
	 * 
	 * @return a count of the number of steps this idea is used in
	 */
	private int getStepsUsedInCount(JSONObject idea) {
		int count = 0;
		
		try {
			JSONArray stepsUsedInJSONArray = idea.getJSONArray("stepsUsedIn");
			
			if(stepsUsedInJSONArray != null) {
				//get the length of the array
				count = stepsUsedInJSONArray.length();
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		return count;
	}
	
	/**
	 * Determine whether the steps used in changed
	 * 
	 * @param idea the idea JSONObject
	 * @param previousIdeaBasket the previous basket revision
	 * @param nodeIdToNodeTitlesMap the map of node id to node title
	 * 
	 * @return whether the steps used in changed for the idea
	 */
	private boolean isStepsUsedInChanged(JSONObject idea, JSONObject previousIdeaBasket, HashMap<String, String> nodeIdToNodeTitlesMap) {
		boolean stepsUsedInChanged = false;
		
		try {
			if(previousIdeaBasket != null) {
				int ideaId = idea.getInt("id");
				
				Integer workgroupId = null;
				
				if(idea.has("workgroupId")) {
					try {
						//get the workgroup id that owns the idea
						workgroupId = idea.getInt("workgroupId");						
					} catch(JSONException e) {
						workgroupId = null;
					}
				}
				
				//get the idea from the previous revision
				JSONObject previousIdeaRevision = getIdeaById(previousIdeaBasket, ideaId, workgroupId);
				
				if(previousIdeaRevision != null) {
					//the idea existed in the previous basket revision
					
					//get the steps used in for the idea from the  current basket revision
					String currentStepsUsedIn = getStepsUsedIn(idea, nodeIdToNodeTitlesMap);
					
					//get the steps used in for the idea from the previous basket revision
					String previousStepsUsedIn = getStepsUsedIn(previousIdeaRevision, nodeIdToNodeTitlesMap);
					
					if(currentStepsUsedIn != null && previousStepsUsedIn != null && !currentStepsUsedIn.equals(previousStepsUsedIn)) {
						//the steps used in has changed
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
	 * 
	 * @param boolValue true of false
	 * 
	 * @return 0 or 1
	 */
	private int getIntFromBoolean(boolean boolValue) {
		int intValue = 0;
		
		if(boolValue) {
			intValue = 1;
		}
		
		return intValue;
	}
	
	/**
	 * Get the node type of the step that the idea was created on
	 * 
	 * @param idea the idea JSONObject
	 * @param nodeIdToNodeContent map of node id to node content
	 * 
	 * @return the node type the idea was created on
	 */
	private String getNodeTypeFromIdea(JSONObject idea, HashMap<String, JSONObject> nodeIdToNodeContent) {
		String nodeType = "";
		
		try {
			String nodeId = idea.getString("nodeId");
			
			//get the content for the node
			JSONObject nodeContent = nodeIdToNodeContent.get(nodeId);
			
			//get the node type
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
		//get the latest annotation score with the given parameters
		Annotation latestAnnotationScoreByStepWork = vleService.getLatestAnnotationScoreByStepWork(stepWorksForNodeId, teacherWorkgroupIds);
		String score = "";
		
		if(latestAnnotationScoreByStepWork != null) {
			try {
				//get the annotation data
				String data = latestAnnotationScoreByStepWork.getData();
				JSONObject annotation = new JSONObject(data);
				
				//get the score value
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
		//get the latest annotation comment with the given parameters
		Annotation latestAnnotationCommentByStepWork = vleService.getLatestAnnotationCommentByStepWork(stepWorksForNodeId, teacherWorkgroupIds);
		String comment = ""; 
		
		if(latestAnnotationCommentByStepWork != null) {
			try {
				//get the annotation data
				String data = latestAnnotationCommentByStepWork.getData();
				JSONObject annotation = new JSONObject(data);
				
				//get the score value
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
		
		if(latestAnnotationScoreByStepWork != null) {
			try {
				//get the annotation data
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
				
				if(value.length() > 0) {
					//get the last entry in the array
					JSONObject valueElement = value.getJSONObject(value.length() - 1);
					
					//get the score
					long score = valueElement.getLong("score");
					
					//get the timestamp for the annotation
					Timestamp postTime = latestAnnotationScoreByStepWork.getPostTime();
					
					//get the timestamp as a string
					String timestampAnnotationPostTime = timestampToFormattedString(postTime);
					
					//set the timestamp
					workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, timestampAnnotationPostTime);
					
					//set the score
					workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, score);
				}
			} catch (JSONException e) {
				e.printStackTrace();
			}
		} else {
			//there is no annotation so we will just increment the column counter
			workgroupColumnCounter += 2;
			addEmptyElementsToVector(rowForWorkgroupIdVector, 2);
		}
		
		return workgroupColumnCounter;
	}
	
	/**
	 * Get the latest annotation score and timestamp and set it into the row
	 * 
	 * @param stepWorksForNodeId the StepWork objects we want to look at
	 * for the associated annotation
	 * @param rowForWorkgroupId the row
	 * @param workgroupColumnCounter the column index
	 * 
	 * @return the updated column counter pointing to the next empty column
	 */
	private int setLatestAnnotationScoreAndTimestamp(List<StepWork> stepWorksForNodeId, Row rowForWorkgroupId, Vector<String> rowForWorkgroupIdVector, int workgroupColumnCounter) {
		/*
		 * get the latest annotation associated with any of the StepWork objects
		 * and have fromWorkgroup as any of the workgroup ids in teacherWorkgroupIds
		 */
		Annotation latestAnnotationScoreByStepWork = vleService.getLatestAnnotationScoreByStepWork(stepWorksForNodeId, teacherWorkgroupIds);
		
		if(latestAnnotationScoreByStepWork != null) {
			try {
				//get the annotation data
				String data = latestAnnotationScoreByStepWork.getData();
				JSONObject annotation = new JSONObject(data);
				
				//get the score value
				String score = annotation.getString("value");

				//get the timestamp for the annotation
				Timestamp postTime = latestAnnotationScoreByStepWork.getPostTime();
				
				//get the timestamp as a string
				String timestampAnnotationPostTime = timestampToFormattedString(postTime);
				
				//set the timestamp
				workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, timestampAnnotationPostTime);
				
				//set the score
				workgroupColumnCounter = setCellValueConvertStringToLong(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, score);
			} catch (JSONException e) {
				e.printStackTrace();
			}
		} else {
			//there is no annotation so we will just increment the column counter
			workgroupColumnCounter += 2;
			addEmptyElementsToVector(rowForWorkgroupIdVector, 2);
		}
		
		return workgroupColumnCounter;
	}
	
	/**
	 * Get the latest annotation comment and timestamp and set it into the row
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
		
		if(latestAnnotationCommentByStepWork != null) {
			try {
				//get the annotation data
				String data = latestAnnotationCommentByStepWork.getData();
				JSONObject annotation = new JSONObject(data);
				
				//get the score value
				String comment = annotation.getString("value");
				
				//get the timestamp for the annotation
				Timestamp postTime = latestAnnotationCommentByStepWork.getPostTime();
				
				//get the timestamp as a string
				String timestampAnnotationPostTime = timestampToFormattedString(postTime);
				
				//set the timestamp
				workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, timestampAnnotationPostTime);
				
				//set the comment
				workgroupColumnCounter = setCellValue(rowForWorkgroupId, rowForWorkgroupIdVector, workgroupColumnCounter, comment);
			} catch (JSONException e) {
				e.printStackTrace();
			}
		} else {
			//there is no annotation so we will just increment the column counter
			workgroupColumnCounter += 2;
			addEmptyElementsToVector(rowForWorkgroupIdVector, 2);
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
		
		if(value == null) {
			if(rowVector != null) {
				//set an empty string into the vector
				rowVector.add("");				
			}
			
			//increment the column counter
			returnValue = columnCounter++;
		} else {
			try {
				//try to convert the value to a long
				returnValue = setCellValue(row, rowVector, columnCounter, new Long(value));	
			} catch (NumberFormatException e) {
				//we were unable to convert the value to a long so we will use the string value
				returnValue = setCellValue(row, rowVector, columnCounter, value + "");
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
		if(value == null) {
			if(rowVector != null) {
				//set an empty string into the vector
				rowVector.add("");				
			}
		} else {
			if(row != null) {
				//set the value into the cell
				row.createCell(columnCounter).setCellValue(value);
			}
			
			if(rowVector != null) {
				rowVector.add(value + "");				
			}
		}
		
		//increment the column counter
		columnCounter++;
		
		return columnCounter;
	}
	
	/**
	 * Set the double value into the cell
	 * 
	 * @param row the excel row
	 * @param rowVector the vector that holds the string for the csv output
	 * @param columnCounter the column index
	 * @param value the value to set in the cell
	 * 
	 * @return the new column index for the next empty cell
	 */
	private int setCellValue(Row row, Vector<String> rowVector, int columnCounter, Double value) {
		if(value == null) {
			if(rowVector != null) {
				//set an empty string into the vector
				rowVector.add("");				
			}
		} else {
			if(row != null) {
				//set the value into the cell
				row.createCell(columnCounter).setCellValue(value);
			}
			
			if(rowVector != null) {
				rowVector.add(value + "");				
			}
		}
		
		//increment the column counter
		columnCounter++;
		
		return columnCounter;
	}
	
	/**
	 * Set the float value into the cell
	 * 
	 * @param row the excel row
	 * @param rowVector the vector that holds the string for the csv output
	 * @param columnCounter the column index
	 * @param value the value to set in the cell
	 * 
	 * @return the new column index for the next empty cell
	 */
	private int setCellValue(Row row, Vector<String> rowVector, int columnCounter, Float value) {
		if(value == null) {
			if(rowVector != null) {
				//set an empty string into the vector
				rowVector.add("");				
			}
		} else {
			if(row != null) {
				//set the value into the cell
				row.createCell(columnCounter).setCellValue(value);
			}
			
			if(rowVector != null) {
				rowVector.add(value + "");				
			}
		}
		
		//increment the column counter
		columnCounter++;
		
		return columnCounter;
	}
	
	/**
	 * Set the value in the row at the given column. if the string can be
	 * converted to a number we will do so. this makes a difference in the
	 * excel because strings are left aligned and numbers are right aligned.
	 * 
	 * @param row the row
	 * @param columnCounter the column index
	 * @param value the value to set in the cell
	 * 
	 * @return the next empty column
	 */
	private int setCellValueConvertStringToLong(Row row, Vector<String> rowVector, int columnCounter, String value) {
		if(value == null) {
			value = "";
		}
		
		try {
			if(rowVector != null) {
				rowVector.add(value);
			}
			
			if(row != null) {
				//try to convert the value to a number and then set the value into the cell
				row.createCell(columnCounter).setCellValue(Long.parseLong(value));				
			}
		} catch(NumberFormatException e) {
			//e.printStackTrace();
			
			if(rowVector != null) {
				rowVector.add(value);				
			}
			
			//check if the value has more characters than the max allowable for an excel cell
			if(value.length() > 32767) {
				//response has more characters than the max allowable so we will truncate it
				value = value.substring(0, 32767);
				
				//increment the counter to keep track of how many oversized responses we have
				oversizedResponses++;
			}
			
			if(row != null) {
				//set the string value into the cell
				row.createCell(columnCounter).setCellValue(value);				
			}
		}
		
		//increment the column counter
		columnCounter++;
		
		return columnCounter;
	}
	
	/**
	 * Set the value in the row at the given column.
	 * 
	 * @param row the row
	 * @param columnCounter the column index
	 * @param value the value to set in the cell
	 * 
	 * @return the next empty column
	 */
	private int setCellValue(Row row, Vector<String> rowVector, int columnCounter, String value) {
		if(value == null) {
			//value is null so we will just use empty string
			value = "";
		}
		
		if(rowVector != null) {
			rowVector.add(value);			
		}
		
		//check if the value has more characters than the max allowable for an excel cell
		if(value.length() > 32767) {
			//response has more characters than the max allowable so we will truncate it
			value = value.substring(0, 32767);
			
			//increment the counter to keep track of how many oversized responses we have
			oversizedResponses++;
		}
		
		if(row != null) {
			//set the value into the cell
			row.createCell(columnCounter).setCellValue(value);
		}

		//increment the column counter
		columnCounter++;
		
		return columnCounter;
	}
	
	/**
	 * Get the timestamp as a string
	 * 
	 * @param timestamp the timestamp object
	 * 
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
	 * 
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
		
		//get the JSONArray that stores all the student attendence objects for this workgroup id
		JSONArray workgroupIdStudentAttendance = workgroupIdToStudentAttendance.get(workgroupId);
		
		if(workgroupIdStudentAttendance != null) {
			
			/*
			 * loop through all the student attendance objects in the array.
			 * the array is ordered from newer to older. so the first 
			 * student attendance object with a loginTimestamp before
			 * the function argument timestamp is the student attendance
			 * object we want.
			 */
			for(int x=0; x<workgroupIdStudentAttendance.length(); x++) {
				try {
					//get a student attendance object
					JSONObject tempStudentAttendanceEntry = workgroupIdStudentAttendance.getJSONObject(x);
					
					if(tempStudentAttendanceEntry != null) {
						//get the login timestamp
						long loginTimestamp = tempStudentAttendanceEntry.getLong("loginTimestamp");
						
						if(loginTimestamp < timestamp) {
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
	 * 
	 * @param userIdsArray a String array containing student user ids
	 * 
	 * @return an ArrayList of Long objects sorted numerically
	 */
	private ArrayList<Long> sortUserIdsArray(String[] userIdsArray) {
		
		ArrayList<Long> userIdsList = new ArrayList<Long>();
		
		//loop through all the student user ids
		for(int x=0; x<userIdsArray.length; x++) {
			//get a student user id
			String userId = userIdsArray[x];
			
			try {
				if(userId != null && !userId.equals("")) {
					//add the long to the list
					userIdsList.add(Long.parseLong(userId));					
				}
			} catch(NumberFormatException e) {
				e.printStackTrace();
			}
		}
		
		//sort the list
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
		//this property needs to be set to true in order for auto sizing to work
		System.setProperty("java.awt.headless", "true");
		
		//loop through the specified number of columns
		for(int x=0; x<numColumns; x++) {
			//auto size the column
			sheet.autoSizeColumn(x);
		}
		
		//set this property back to false
		System.setProperty("java.awt.headless", "false");
	}
	
	/**
	 * Get the CRater annotation score for the given step work id if the score exists
	 * 
	 * @param stepWorkId the step work id
	 * @param nodeState the node state
	 * 
	 * @return the CRater score or -1 if there is no CRater score
	 */
	private long getCRaterScoreByStepWorkIdAndNodeState(Long stepWorkId, JSONObject nodeState) {
		//set default values
		long score = -1;
		long nodeStateId = -1;
		
		if(nodeState != null) {
			try {
				//get the node state id aka timestamp
				nodeStateId = nodeState.getLong("timestamp");
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		
		//get the step work
		StepWork stepWork = vleService.getStepWorkByStepWorkId(stepWorkId);
		
		//get the CRater score for the step work id
		Annotation cRaterAnnotationByStepWork = vleService.getCRaterAnnotationByStepWork(stepWork);
		
		if(cRaterAnnotationByStepWork != null) {
			//CRater score exists
			
			//get the annotation data
			String data = cRaterAnnotationByStepWork.getData();
			
			if(data != null) {
				try {
					/*
					 * get the data as a JSONObject
					 * 
					 * here's an example of what the annotation looks like
					 * 
					 * {
					 * 		"stepWorkId": 3388281,
					 * 		"nodeId": "node_136.or",
					 * 		"fromWorkgroup": "-1",
					 * 		"value": [
					 * 			{
					 * 				"studentResponse": {
					 * 					"response": [
					 * 						"The sun gives plants sunlight which lets them grow and release oxygen. So the sun helps animals survive by giving them plants to eat and oxygen to breath."
					 * 					],
					 * 					"timestamp": 1334610850000,
					 * 					"isCRaterSubmit": true,
					 * 					"cRaterItemId": "Photo_Sun",
					 * 					"type": "or"
					 * 				},
					 * 				"nodeStateId": 1334610850000,
					 * 				"score": 2,
					 * 				"cRaterResponse": "<crater-results>\n  <tracking id=\"1025926\"/>\n  <client id=\"WISETEST\"/>\n  <items>\n     <item id=\"Photo_Sun\">\n        <responses>\n      <response id=\"3388281\" score=\"2\" concepts=\"2\"/>\n       </responses>\n     </item>\n  </items>\n</crater-results>\r",
					 * 				"concepts": "2"
					 * 			}
					 * 		],
					 * 		"runId": "2103",
					 * 		"type": "cRater",
					 * 		"toWorkgroup": "60562"
					 * }
					 */
					JSONObject dataJSONObject = new JSONObject(data);
					
					if(dataJSONObject.has("value")) {
						//get the value
						JSONArray value = dataJSONObject.getJSONArray("value");
						
						//loop through all the objects in the value
						for(int x=0; x<value.length(); x++) {
							//get one of the objects in the value array
							JSONObject nodeStateAnnotation = value.getJSONObject(x);
							
							if(nodeStateAnnotation != null) {
								if(nodeStateAnnotation.has("nodeStateId")) {
									//get the node state id aka timestamp
									long tempNodeStateId = nodeStateAnnotation.getLong("nodeStateId");
									
									if(tempNodeStateId == nodeStateId) {
										//the ids match so we have found the annotation we want
										
										if(nodeStateAnnotation.has("score")) {
											//get the score
											score = nodeStateAnnotation.getLong("score");
										}
										
										//we have found the annotation we want so we will break out of the for loop
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
	 * 
	 * @param vectorRow the csv row to write
	 */
	private void writeCSV(Vector<String> vectorRow) {
		if(vectorRow != null) {
			//create a String array
			String[] stringArrayRow = new String[vectorRow.size()];
			
			//insert the elements in the vector into the String array
		    vectorRow.toArray(stringArrayRow);
		    
		    if(csvWriter != null) {
		    	//write the String array to the csvWriter
		    	csvWriter.writeNext(stringArrayRow);
		    }
		}
	}
	
	/**
	 * Add an empty cell into the vector
	 * 
	 * @param vector the vector to add to
	 * @param count the number of empty cells to add
	 */
	private void addEmptyElementsToVector(Vector<String> vector, int count) {
		if(vector != null) {
			for(int x=0; x<count; x++) {
				vector.add("");
			}			
		}
	}
	
	/**
	 * Create the row in the sheet
	 * 
	 * @param sheet the sheet to create the row in
	 * @param rowCounter the row index
	 * 
	 * @return the new row or null if the sheet does not exist
	 */
	private Row createRow(XSSFSheet sheet, int rowCounter) {
		Row newRow = null;
		
		if(sheet != null) {
			newRow = sheet.createRow(rowCounter);
		}
		
		return newRow;
	}
	
	/**
	 * Create a Vector if we are creating a csv file
	 * 
	 * @return an empty Vector if we are generating a csv file. we will return 
	 * null if we are not generating a csv file.
	 */
	private Vector<String> createRowVector() {
		Vector<String> rowVector = null;
		
		if(isFileTypeCSV(fileType)) {
			rowVector = new Vector<String>();
		}
		
		return rowVector;
	}
	
	/**
	 * Whether we are creating an xls file
	 * 
	 * @param fileType a file extension
	 * 
	 * @return whether we are creating an xls file
	 */
	private boolean isFileTypeXLS(String fileType) {
		boolean result = false;
		
		if(fileType != null && fileType.equals("xls")) {
			result = true;
		}
		
		return result;
	}
	
	/**
	 * Whether we are creating a csv file
	 * 
	 * @param fileType a file extension
	 * 
	 * @return whether we are creating a csv file
	 */
	private boolean isFileTypeCSV(String fileType) {
		boolean result = false;
		
		if(fileType != null && fileType.equals("csv")) {
			result = true;
		}
		
		return result;
	}

	public VLEService getVleService() {
		return vleService;
	}

	public void setVleService(VLEService vleService) {
		this.vleService = vleService;
	}

	public Properties getWiseProperties() {
		return wiseProperties;
	}

	public void setWiseProperties(Properties wiseProperties) {
		this.wiseProperties = wiseProperties;
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
}
