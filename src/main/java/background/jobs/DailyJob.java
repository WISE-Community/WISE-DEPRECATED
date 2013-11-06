package background.jobs;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.Date;
import java.util.Vector;

import org.hibernate.cfg.AnnotationConfiguration;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.slf4j.LoggerFactory;

import vle.domain.statistics.VLEStatistics;

public class DailyJob implements Job {
	
	public void execute(JobExecutionContext context) throws JobExecutionException {
		try {
			//get the user name and password for the db
			AnnotationConfiguration configure = new AnnotationConfiguration().configure();
            String userName = configure.getProperty("connection.username");
            String password = configure.getProperty("connection.password");
			
			//create a connection to the mysql db
			Class.forName("com.mysql.jdbc.Driver").newInstance();
			Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/vle_database", userName, password);
	    	
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
	    	vleStatisticsObject.saveOrUpdate();
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
}