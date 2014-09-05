/**
 * Copyright (c) 2008-2014 Regents of the University of California (Regents). 
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
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 * 
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.domain.admin;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Properties;
import java.util.Set;
import java.util.Vector;

import javax.mail.MessagingException;

import org.apache.commons.httpclient.DefaultHttpMethodRetryHandler;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpException;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.params.HttpMethodParams;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.crater.CRaterRequestDao;
import org.wise.portal.dao.offering.RunDao;
import org.wise.portal.dao.portal.PortalStatisticsDao;
import org.wise.portal.dao.project.ProjectDao;
import org.wise.portal.dao.user.UserDao;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.portal.Portal;
import org.wise.portal.domain.portal.PortalStatistics;
import org.wise.portal.domain.portal.impl.PortalStatisticsImpl;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.mail.IMailFacade;
import org.wise.portal.service.portal.PortalService;
import org.wise.portal.service.portal.PortalStatisticsService;
import org.wise.portal.service.vle.VLEService;
import org.wise.vle.domain.cRater.CRaterRequest;
import org.wise.vle.domain.statistics.VLEStatistics;
import org.wise.vle.domain.work.StepWork;
import org.wise.vle.web.VLEAnnotationController;

public class DailyAdminJob {

	@Autowired
	private IMailFacade mailService;

	@Autowired
	private RunDao<Run> runDao;
	
	@Autowired
	private UserDao<User> userDao;
	
	@Autowired
	private ProjectDao<Project> projectDao;
	
	@Autowired
	private PortalStatisticsDao<PortalStatistics> portalStatisticsDao;
	
	@Autowired
	private VLEService vleService;
	
	@Autowired
	private Properties wiseProperties;
	
	@Autowired
	private PortalService portalService;
	
	@Autowired
	private PortalStatisticsService portalStatisticsService;
	
	@Autowired
	private CRaterRequestDao<CRaterRequest> cRaterRequestDao;
	
	private static final String WISE_HUB_URL = "http://wise4.org/postWISEStatistics.php";

	private boolean DEBUG = false;

	private Date yesterday = null;
	
	private Date today = null;
	
	{
		Calendar todayCal = Calendar.getInstance();
		today = new java.sql.Date(todayCal.getTimeInMillis());
		todayCal.add(Calendar.DATE, -1);
		yesterday = new java.sql.Date(todayCal.getTimeInMillis());
	}
	
	@Transactional
	public void doJob() {

		//query for the portal statistics and save a new row in the portalStatistics table
		gatherPortalStatistics();
		
		//query the vle tables and save a new row in the vleStatistics table
		gatherVLEStatistics();
		
		//try to score the CRater student work that previously failed to be scored
		handleIncompleteCRaterRequests();
		
		//create and send a message to uber_admin
		String messageBody = getSummaryMessage();
		sendEmail(messageBody);
		
		//post statistics to hub if allowed
        try {
			Portal portal = portalService.getById(1);
			if (portal.isSendStatisticsToHub()) {
				try {
					JSONObject wiseStatisticsJSONObject = new JSONObject();
					wiseStatisticsJSONObject.put("wiseName", wiseProperties.getProperty("wise.name"));
					wiseStatisticsJSONObject.put("wiseBaseURL", wiseProperties.getProperty("wiseBaseURL"));
					
					PortalStatistics latestPortalStatistics = portalStatisticsService.getLatestPortalStatistics();
					wiseStatisticsJSONObject.put("portal", latestPortalStatistics.getJSONObject());
				
					VLEStatistics latestVLEStatistics = vleService.getLatestVLEStatistics();
					wiseStatisticsJSONObject.put("vle", latestVLEStatistics.getJSONObject());
					postStatistics(wiseStatisticsJSONObject.toString());
				} catch (JSONException e) {
					e.printStackTrace();
				}

		    }
        } catch (ObjectNotFoundException e) {
			// do nothing
		}
	}
	
	/**
	 * query for the portal statistics and save a new row in the portalStatistics table
	 */
	private void gatherPortalStatistics() {
		debugOutput("gatherPortalStatistics start");
		
		//get all the students
		List<User> allStudents = userDao.retrieveByField(null, null, null, "studentUserDetails");
		long totalNumberStudents = allStudents.size();
		debugOutput("Number of students: " + totalNumberStudents);
		
		//get all the teachers
		List<User> allTeachers = userDao.retrieveByField(null, null, null, "teacherUserDetails");
		long totalNumberTeachers = allTeachers.size();
		debugOutput("Number of teachers: " + totalNumberTeachers);
		
		//get the number of student logins
		long totalNumberStudentLogins = 0;
		for(int x=0; x<allStudents.size(); x++) {
			User user = allStudents.get(x);
			MutableUserDetails userDetails = user.getUserDetails();
			totalNumberStudentLogins += ((StudentUserDetails) userDetails).getNumberOfLogins();
		}
		debugOutput("Number of student logins: " + totalNumberStudentLogins);
		
		//get the number of teacher logins
		long totalNumberTeacherLogins = 0;
		for(int x=0; x<allTeachers.size(); x++) {
			User user = allTeachers.get(x);
			MutableUserDetails userDetails = user.getUserDetails();
			totalNumberTeacherLogins += ((TeacherUserDetails) userDetails).getNumberOfLogins();
		}
		debugOutput("Number of teacher logins: " + totalNumberTeacherLogins);
		
		//get the number of projects
		List<Project> projectList = projectDao.getList();
		long totalNumberProjects = projectList.size();
		debugOutput("Number of projects: " + totalNumberProjects);
		
		//get the number of runs
		List<Run> runList = runDao.getList();
		long totalNumberRuns = runList.size();
		debugOutput("Number of runs: " + totalNumberRuns);
		
		//get the number of projects run (how many times students have clicked on the "Run Project" button)
		long totalNumberProjectsRun = 0;
		for(int x=0; x<runList.size(); x++) {
			Run run = runList.get(x);
			Integer timesRun = run.getTimesRun();
			
			if(timesRun != null) {
				totalNumberProjectsRun += timesRun;				
			}
		}
		debugOutput("Number of projects run: " + totalNumberProjectsRun);
		
		//create a new portal statistics object and populate it
		PortalStatisticsImpl newPortalStatistics = new PortalStatisticsImpl();
		newPortalStatistics.setTimestamp(new Date());
		newPortalStatistics.setTotalNumberStudents(totalNumberStudents);
		newPortalStatistics.setTotalNumberStudentLogins(totalNumberStudentLogins);
		newPortalStatistics.setTotalNumberTeachers(totalNumberTeachers);
		newPortalStatistics.setTotalNumberTeacherLogins(totalNumberTeacherLogins);
		newPortalStatistics.setTotalNumberProjects(totalNumberProjects);
		newPortalStatistics.setTotalNumberRuns(totalNumberRuns);
		newPortalStatistics.setTotalNumberProjectsRun(totalNumberProjectsRun);
		
		//save the new portal statistics
		portalStatisticsDao.save(newPortalStatistics);
		
		debugOutput("gatherPortalStatistics end");
	}
	
	/**
	 * Get the VLE statistics from the vle tables
	 * @param context
	 * @throws JobExecutionException
	 */
	public void gatherVLEStatistics() {
		try {
			//get the user name, password, and url for the db
			String userName = this.wiseProperties.getProperty("hibernate.connection.username");
			String password = this.wiseProperties.getProperty("hibernate.connection.password");
			String url = this.wiseProperties.getProperty("hibernate.connection.url");
			
			//create a connection to the mysql db
			Class.forName("com.mysql.jdbc.Driver").newInstance();
			Connection conn = DriverManager.getConnection(url, userName, password);

			//create a statement to run db queries
			Statement statement = conn.createStatement();

			//the JSONObject that we will store all the statistics in and then store in the db
			JSONObject vleStatistics = new JSONObject();
			
			//gather the StepWork statistics
			gatherStepWorkStatistics(statement, vleStatistics);
			
			//gather the Node statistics
			gatherNodeStatistics(statement, vleStatistics);
			
			//gather the Annotation statistics
			gatherAnnotationStatistics(statement, vleStatistics);
			
			//gather the Hint statistics
			gatherHintStatistics(statement, vleStatistics);
			
	    	//get the current timestamp
	    	Date date = new Date();
	    	Timestamp timestamp = new Timestamp(date.getTime());
	    	
	    	//set the timestamp in milliseconds into the JSONObject
	    	vleStatistics.put("timestamp", timestamp.getTime());
	    	
	    	//save the vle statistics row
	    	VLEStatistics vleStatisticsObject = new VLEStatistics();
	    	vleStatisticsObject.setTimestamp(timestamp);
	    	vleStatisticsObject.setData(vleStatistics.toString());
	    	this.vleService.saveVLEStatistics(vleStatisticsObject);

	    	//close the db connection
	    	conn.close();
		} catch (Exception ex) {
			LoggerFactory.getLogger(getClass()).error(ex.getMessage());
		}
	}
	
	/**
	 * Gather the StepWork statistics. This includes the total number of StepWork
	 * rows as well as how many StepWork rows for each step type.
	 * @param statement the object to execute queries
	 * @param vleStatistics the JSONObject to store the statistics in
	 */
	private void gatherStepWorkStatistics(Statement statement, JSONObject vleStatistics) {
		try {
			//counter for total step work rows
			long stepWorkCount = 0;
			
			//array to hold the counts for each node type
			JSONArray stepWorkNodeTypeCounts = new JSONArray();
			
			/*
			 * the query to get the total step work rows for each node type
			 * e.g.
			 * 
			 * nodeType           | count(*)
			 * ------------------------------
			 * AssessmentListNode | 331053
			 * BrainstormNode     | 10936
			 * CarGraphNode       | 9
			 * etc.
			 * 
			 */
			ResultSet stepWorkNodeTypeCountQuery = statement.executeQuery("select node.nodeType, count(*) from stepwork, node where stepwork.node_id=node.id group by nodeType");
			
			//loop through all the rows from the query
			while(stepWorkNodeTypeCountQuery.next()) {
				//get the nodeType
				String nodeType = stepWorkNodeTypeCountQuery.getString(1);
				
				//get the count
				long nodeTypeCount = stepWorkNodeTypeCountQuery.getLong(2);
				
				try {
					if(nodeType != null && !nodeType.toLowerCase().equals("null")) {
						//create the object that will store the nodeType and count
						JSONObject stepWorkNodeTypeObject = new JSONObject();
						stepWorkNodeTypeObject.put("nodeType", nodeType);
						stepWorkNodeTypeObject.put("count", nodeTypeCount);
						
						//put the object into our array
						stepWorkNodeTypeCounts.put(stepWorkNodeTypeObject);
						
						//update the total count
						stepWorkCount += nodeTypeCount;
					}
				} catch(JSONException e) {
					e.printStackTrace();
				}
			}
			
			//add the step work statistics to the vleStatistics object
			vleStatistics.put("individualStepWorkNodeTypeCounts", stepWorkNodeTypeCounts);
			vleStatistics.put("totalStepWorkCount", stepWorkCount);
		} catch(SQLException e) {
			e.printStackTrace();
		} catch(JSONException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * Gather the Annotation statistics. This includes the total number of Annotation
	 * rows as well as how many Annotation nodes for each annotation type.
	 * @param statement the object to execute queries
	 * @param vleStatistics the JSONObject to store the statistics in
	 */
	private void gatherAnnotationStatistics(Statement statement, JSONObject vleStatistics) {
		try {
			//get the total number of annotations
			ResultSet annotationCountQuery = statement.executeQuery("select count(*) from annotation");
			
			if(annotationCountQuery.first()) {
				//get the total number of annotations
				long annotationCount = annotationCountQuery.getLong(1);
				
				try {
					//add the total annotation count to the vle statistics
					vleStatistics.put("totalAnnotationCount", annotationCount);
				} catch(JSONException e) {
					e.printStackTrace();
				}
			}
			
			//this will hold all the annotation types e.g. "comment", "score", "flag", "cRater"
			Vector<String> annotationTypes = new Vector<String>();
			
			//get all the different types of annotations
			ResultSet annotationTypeQuery = statement.executeQuery("select distinct type from annotation");
			
			while(annotationTypeQuery.next()) {
				String annotationType = annotationTypeQuery.getString(1);
				annotationTypes.add(annotationType);
			}
			
			//the array to store the counts for each annotation type
			JSONArray annotationCounts = new JSONArray();
			
			//loop through all the annotation types
			for(String annotationType : annotationTypes) {
				if(annotationType != null && !annotationType.equals("")
						&& !annotationType.equals("null") && !annotationType.equals("NULL")) {
					//get the total number of annotations for the current annotation type
					ResultSet annotationTypeCountQuery = statement.executeQuery("select count(*) from annotation where type='" + annotationType + "'");
					
					if(annotationTypeCountQuery.first()) {
						//get the count for the current annotation type
						long annotationTypeCount = annotationTypeCountQuery.getLong(1);
						
						try {
							//create an object to store the type and count in
							JSONObject annotationObject = new JSONObject();
							annotationObject.put("annotationType", annotationType);
							annotationObject.put("count", annotationTypeCount);
							
							annotationCounts.put(annotationObject);
						} catch(JSONException e) {
							e.printStackTrace();
						}
					}					
				}
			}
			
			//add the annotation statistics to the vle statistics
			vleStatistics.put("individualAnnotationCounts", annotationCounts);			
		} catch(SQLException e) {
			e.printStackTrace();
		} catch(JSONException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * Get the node statistics. This includes the total number of step nodes as well
	 * as how many step nodes for each node type.
	 * @param statement the object to execute queries
	 * @param vleStatistics the JSONObject to store the statistics in
	 */
	private void gatherNodeStatistics(Statement statement, JSONObject vleStatistics) {
		try {
			//counter for the total number of nodes
			long nodeCount = 0;
			
			//array to hold all the counts for each node type
			JSONArray nodeTypeCounts = new JSONArray();
			
			/*
			 * the query to get the total number of nodes for each node type
			 * e.g.
			 * 
			 * nodeType           | count(*)
			 * ------------------------------
			 * AssessmentListNode | 3408
			 * BrainstormNode     | 98
			 * CarGraphNode       | 9
			 * etc.
			 * 
			 */ 
			ResultSet nodeTypeCountQuery = statement.executeQuery("select nodeType, count(*) from node group by nodeType");
			
			//loop through all the rows
			while(nodeTypeCountQuery.next()) {
				//get a node type and the count
				String nodeType = nodeTypeCountQuery.getString(1);
				long nodeTypeCount = nodeTypeCountQuery.getLong(2);
				
				if(nodeType != null && !nodeType.toLowerCase().equals("null")) {
					try {
						//create an object to hold the node type and count
						JSONObject nodeTypeObject = new JSONObject();
						nodeTypeObject.put("nodeType", nodeType);
						nodeTypeObject.put("count", nodeTypeCount);
						
						//add the object to our array
						nodeTypeCounts.put(nodeTypeObject);
						
						//update the total count
						nodeCount += nodeTypeCount;
					} catch(JSONException e) {
						e.printStackTrace();
					}
				}
			}
			
			//add the counts to the vle statistics
			vleStatistics.put("individualNodeTypeCounts", nodeTypeCounts);
			vleStatistics.put("totalNodeCount", nodeCount);			
		} catch(SQLException e) {
			e.printStackTrace();
		} catch(JSONException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * Get the number of times hints were viewed by a student
	 * @param statement the object to execute queries
	 * @param vleStatistics the JSONObject to store the statistics in
	 */
	private void gatherHintStatistics(Statement statement, JSONObject vleStatistics) {
		try {
			//get the total number of times a hint was viewed by a student
			ResultSet hintCountQuery = statement.executeQuery("select count(*) from stepwork where data like '%hintStates\":[{%]%'");
			
			if(hintCountQuery.first()) {
				//add the count to the vle statistics
				long hintCount = hintCountQuery.getLong(1);
				vleStatistics.put("totalHintViewCount", hintCount);
			}			
		} catch(SQLException e) {
			e.printStackTrace();
		} catch(JSONException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * Try to score the CRater student work that previously failed to be scored
	 */
	private void handleIncompleteCRaterRequests() {
		//get the CRater url and client id
		String cRaterScoringUrl = this.wiseProperties.getProperty("cRater_scoring_url");
		String cRaterClientId = this.wiseProperties.getProperty("cRater_client_id");
		
		//get the Henry url and client id
		String henryScoringUrl = this.wiseProperties.getProperty("henry_scoring_url");
		String henryClientId = this.wiseProperties.getProperty("henry_client_id");
		
		if(cRaterScoringUrl != null || henryScoringUrl != null) {
			//get all the incomplete CRater requests
			List<CRaterRequest> incompleteCRaterRequests = this.cRaterRequestDao.getIncompleteCRaterRequests();
			
			//loop through all the incomplete requests
			for(int x=0; x<incompleteCRaterRequests.size(); x++) {
				//get a CRater request that needs to be scored
				CRaterRequest cRaterRequest = incompleteCRaterRequests.get(x);
				String cRaterItemType = cRaterRequest.getcRaterItemType();
				
				String scoringUrl = "";
				String clientId = "";
				
				//get the appropriate scoring url and client id
				if(cRaterItemType == null) {
					scoringUrl = cRaterScoringUrl;
					clientId = cRaterClientId;
				} else if(cRaterItemType.equals("CRATER")) {
					scoringUrl = cRaterScoringUrl;
					clientId = cRaterClientId;
				} else if(cRaterItemType.equals("HENRY")) {
					scoringUrl = henryScoringUrl;
					clientId = henryClientId;
				}
				
				StepWork stepWork = cRaterRequest.getStepWork();
				Long stepWorkId = stepWork.getId();
				Long nodeStateId = cRaterRequest.getNodeStateId();
				String runId = cRaterRequest.getRunId().toString();
				String annotationType = "cRater";
				
				//make the request to score the student CRater work
				VLEAnnotationController.getCRaterAnnotation(this.vleService, nodeStateId, runId, stepWorkId, annotationType, scoringUrl, clientId);
				
				//sleep for 10 seconds between each request
				try {
					Thread.sleep(10000);
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
			}			
		}
	}
	
	public String getSummaryMessage() {
		// do the actual work
		String messageBody = "";
		DateFormat df = DateFormat.getDateInstance(DateFormat.LONG);

		List<Run> runsCreatedSinceYesterday = findRunsCreatedSinceYesterday();
		messageBody += "Number of Runs started between " 
			+ df.format(yesterday) + " and " + df.format(today) + ": "
			+ runsCreatedSinceYesterday.size() + "\n";
		
		// show info about the run
		for (Run run : runsCreatedSinceYesterday) {
			messageBody += "\tProject:" + run.getProject().getName();
			Set<User> owners = run.getOwners();
			User owner = owners.iterator().next();
			TeacherUserDetails teacherUserDetails = (TeacherUserDetails) owner.getUserDetails();
			String schoolName = teacherUserDetails.getSchoolname();
			String schoolCity = teacherUserDetails.getCity();
			String schoolState = teacherUserDetails.getState();
			
			messageBody += "\n\tTeacher Username:" + teacherUserDetails.getUsername();
			messageBody += "\n\tTeacher School Info: " + schoolName + ", " + schoolCity + ", " + schoolState;
			messageBody += "\n\n";
		}
		 
		List<User> teachersJoinedSinceYesterday = findUsersJoinedSinceYesterday("teacherUserDetails");
		messageBody += "\n\n";
		messageBody += "Number of Teachers joined between " 
			+ df.format(yesterday) + " and " + df.format(today) + ": "
			+ teachersJoinedSinceYesterday.size();

		List<User> studentsJoinedSinceYesterday = findUsersJoinedSinceYesterday("studentUserDetails");
		messageBody += "\n\n";
		messageBody += "Number of Students joined between " 
			+ df.format(yesterday) + " and " + df.format(today) + ": "
			+ studentsJoinedSinceYesterday.size();
		
		// Number of Users that logged in at least once in the last day
		List<User> studentsWhoLoggedInSinceYesterday = findUsersWhoLoggedInSinceYesterday("studentUserDetails");
		List<User> teachersWhoLoggedInSinceYesterday = findUsersWhoLoggedInSinceYesterday("teacherUserDetails");
		int totalNumUsersLoggedInSinceYesterday = studentsWhoLoggedInSinceYesterday.size() + teachersWhoLoggedInSinceYesterday.size();
		messageBody += "\n\n";
		messageBody += "Number of users who logged in at least once between " 
			+ df.format(yesterday) + " and " + df.format(today) + ": "
			+ totalNumUsersLoggedInSinceYesterday;
		return messageBody;
	}

	public List<User> findUsersJoinedSinceYesterday(String who) {
		String field = "signupdate";
		String type = ">";
		Object term = yesterday;
		String classVar = who;

		List<User> usersJoinedSinceYesterday =
			userDao.retrieveByField(field, type, term, classVar);
		
		return usersJoinedSinceYesterday;
	}


	/**
	 * Finds number of runs that were created since yesterday
	 */
	public List<Run> findRunsCreatedSinceYesterday() {
		String field = "starttime";
		String type = ">";
		Object term = yesterday;
		List<Run> runsStartedSinceYesterday = 
			runDao.retrieveByField(field, type, term);

		return runsStartedSinceYesterday;
	}

	public List<User> findUsersWhoLoggedInSinceYesterday(String who) {
		String field = "lastLoginTime";
		String type = ">";
		Object term = yesterday;
		String classVar = who;

		List<User> usersJoinedSinceYesterday =
			userDao.retrieveByField(field, type, term, classVar);
		
		return usersJoinedSinceYesterday;		
	}
	
	public void sendEmail(String message) {
		String[] recipients = wiseProperties.getProperty("uber_admin").split(",");
		
		String subject = "Daily Admin Report on Portal: "
		    + " (" + wiseProperties.getProperty("wise.name") + ")";		

		String msg = message;
		
		String fromEmail = "wise_gateway@berkeley.edu";
		
		//sends the email to the recipients
		try {
			mailService.postMail(recipients, subject, msg, fromEmail);
		} catch (MessagingException e) {
		}
	}
	
	/**
	 * POSTs WISE usage statistics to central hub
	 */
	public void postStatistics(String wiseStatisticsString) {
		
		if(WISE_HUB_URL != null) {
			HttpClient client = new HttpClient();

			// Create a method instance.
			PostMethod method = new PostMethod(WISE_HUB_URL);

			// Provide custom retry handler is necessary
			method.getParams().setParameter(HttpMethodParams.RETRY_HANDLER, new DefaultHttpMethodRetryHandler(3, false));
		
			method.addParameter("name", wiseProperties.getProperty("wise.name"));
			method.addParameter("wiseBaseURL", wiseProperties.getProperty("wiseBaseURL"));
			method.addParameter("stats", wiseStatisticsString);
			
			try {
				
				// Execute the method.
				int statusCode = client.executeMethod(method);

				if (statusCode != HttpStatus.SC_OK) {
					System.err.println("Method failed: " + method.getStatusLine());
				}
				// Read the response body.
				//byte[] responseBody = null;
				//responseBody = method.getResponseBody();
				//String responseString = new String(responseBody);
				//System.out.println(responseString);

				// Deal with the response.
				// Use caution: ensure correct character encoding and is not binary data
			} catch (HttpException e) {
				System.err.println("Fatal protocol violation: " + e.getMessage());
				e.printStackTrace();
			} catch (IOException e) {
				System.err.println("Fatal transport error: " + e.getMessage());
				e.printStackTrace();
			} finally {
				// Release the connection.
				method.releaseConnection();
			}
		}
	}
	
	
	/**
	 * A function that outputs the string to System.out if DEBUG is true
	 * @param output a String to output to System.out
	 */
	private void debugOutput(String output) {
		if(DEBUG) {
			System.out.println(output);
		}
	}

	/**
	 * @param yesterday the yesterday to set
	 */
	public void setYesterday(Date yesterday) {
		this.yesterday = yesterday;
	}

	/**
	 * @param today the today to set
	 */
	public void setToday(Date today) {
		this.today = today;
	}
}
