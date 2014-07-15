package org.wise.portal.service.websocket;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.Calendar;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.Executor;

import javax.websocket.EndpointConfig;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;
import javax.xml.transform.Source;
import javax.xml.ws.Binding;
import javax.xml.ws.Endpoint;
import javax.xml.ws.EndpointReference;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.support.SpringBeanAutowiringSupport;
import org.w3c.dom.Element;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.vle.VLEService;
import org.wise.portal.service.workgroup.WorkgroupService;
import org.wise.vle.domain.status.StudentStatus;

@Service("wiseEndPoint")
@ServerEndpoint(value = "/websocket.html", configurator = WISEConfigurator.class)
public class WISEEndPoint extends Endpoint {

    //the run service
	@Autowired
    private RunService runService;
    
    //the workgroup service
	@Autowired
    private WorkgroupService wiseWorkgroupService;
    
    //the vle service
	@Autowired
    private VLEService vleService;
    
    //the portal properties
	@Autowired
    private Properties wiseProperties;
    
    //the hashtable that stores run id to set of student connections
    private static Hashtable<Long, Set<WISEWebSocketSession>> runToStudentConnections = new Hashtable<Long,Set<WISEWebSocketSession>>();
    
    //the hashtable that stores run id to set of teacher connections
    private static Hashtable<Long, Set<WISEWebSocketSession>> runToTeacherConnections = new Hashtable<Long,Set<WISEWebSocketSession>>();
	
    //the hashtable that stores mappings between Session objects and WISEWebSocketSession objects 
    private static Hashtable<Session, WISEWebSocketSession> sessionToWISEWebSocketSession = new Hashtable<Session, WISEEndPoint.WISEWebSocketSession>();
    
    //the hashtable that stores mappings between User objects and WISEWebSocketSession objects
    private static Hashtable<User, WISEWebSocketSession> userToWISEWebSocketSession = new Hashtable<User, WISEEndPoint.WISEWebSocketSession>();
    
    /**
     * Called when a websocket connection is opened
     * @param session the session object
     * @param config object used to obtain the signed in user
     * @throws IOException
     */
	@OnOpen
	@Transactional
    public void onOpen(Session session, EndpointConfig config) throws IOException {
		//inject autowired properties
        SpringBeanAutowiringSupport.processInjectionBasedOnCurrentContext (this);
        
        if(session != null) {
        	//set the max message size
        	session.setMaxTextMessageBufferSize(32768);
        	session.setMaxBinaryMessageBufferSize(32768);
        	
        	//get the signed in user from the user properties
        	Map<String, Object> userProperties = config.getUserProperties();
        	User signedInUser = (User) userProperties.get("signedInUser");

        	//validate the user to make sure they are who they say they are
        	validateUser(signedInUser, session);
        	
        	/*
        	 * create a WISEWebSocketSession object which wraps the session object
        	 * along with other user related values
        	 */
        	WISEWebSocketSession wiseWebSocketSession = new WISEWebSocketSession(session, signedInUser);
        	
        	if(wiseWebSocketSession != null) {
        		/*
        		 * add this WISEWebSocketSession to our collection of WISEWebSocketSessions
        		 * so we can access it again later when we send or receive messages from them
        		 */
        		addSession(wiseWebSocketSession);
        		
        		//send any websocket message to announce this user has connected
        		handleUserConnecting(wiseWebSocketSession);
        	}
        }
    }
	
	/**
	 * Handle when a user connects
	 * @param wiseWebSocketSession a WISEWebSocketSession object which contains user
	 * related values such as user name, workgroup id, session, etc.
	 */
	private void handleUserConnecting(WISEWebSocketSession wiseWebSocketSession) {
		try {
    		/*
    		 * create the message JSON to notify other signed in users that
    		 * this user has connected
    		 */
    		JSONObject messageJSON = new JSONObject();
    		
    		if(wiseWebSocketSession.isTeacher()) {
    			//the user is a teacher
    			messageJSON.put("messageType", "teacherConnected");
    		} else {
    			Long periodId = wiseWebSocketSession.getPeriodId();
    			Long workgroupId = wiseWebSocketSession.getWorkgroupId();
    			
    			//the user is a student
    			messageJSON.put("messageType", "studentConnected");
    			
    			//add the period id and workgroup id
    			messageJSON.put("periodId", periodId);
    			messageJSON.put("workgroupId", workgroupId);
    		}
    		
    		String userName = wiseWebSocketSession.getUserName();
    		Long runId = wiseWebSocketSession.getRunId();
    		Session session = wiseWebSocketSession.getSession();
    		
    		//add the user name and run id
    		messageJSON.put("userName", userName);
    		messageJSON.put("runId", runId);
			
    		//get the message as a string
        	String message = messageJSON.toString();
        	
        	//get all the teachers that are currently connected for this run
        	Set<WISEWebSocketSession> teacherConnectionsForRun = getTeacherConnectionsForRun(runId);
        	
        	//send the message to all the teacher currently connected for this run
        	sendMessageToConnections(message, teacherConnectionsForRun);
        	
        	if(wiseWebSocketSession.isTeacher()) {
        		/*
        		 * the user that has just connected is a teacher so we will send
        		 * them a list of students that are also currently connected 
        		 */
        		
        		//get all the students that are currently connected for this run
	        	Set<WISEWebSocketSession> studentConnectionsForRun = getStudentConnectionsForRun(runId);
	        	
	        	//create the message that will contain the list of connected students
	        	JSONObject studentsConnectedMessage = new JSONObject();
	        	
	        	//set the message type
	        	studentsConnectedMessage.put("messageType", "studentsOnlineList");
	        	
	        	/*
	        	 * the array that will contain the workgroup ids of the students
	        	 * that are currently connected for this run
	        	 */
	        	JSONArray studentsOnlineList = new JSONArray();
	        	
	        	Iterator<WISEWebSocketSession> studentConnectionIterator = studentConnectionsForRun.iterator();
	        	
	        	//loop through all the students that are currently connected for this run
	        	while(studentConnectionIterator.hasNext()) {
	        		//get a student connection
	        		WISEWebSocketSession studentConnection = studentConnectionIterator.next();
	        		
	        		//get the workgroup id
	        		Long studentConnectionWorkgroupId = studentConnection.getWorkgroupId();
	        		
	        		//add the workgroup id to the array
	        		studentsOnlineList.put(studentConnectionWorkgroupId);
	        	}
	        	
	        	//add the array of connected students to the message
	        	studentsConnectedMessage.put("studentsOnlineList", studentsOnlineList);
	        	
	        	//send the message that contains the list of connected students for the run
	        	sendMessage(session, studentsConnectedMessage.toString());
        	} else if(!wiseWebSocketSession.isTeacher()) {
        		/*
        		 * the user that has just connected is a student so we will
        		 * send them a list of teachers that are also currently connected
        		 */
        		
	        	//create the message that will contain the list of connected teachers
	        	JSONObject teachersConnectedMessage = new JSONObject();
	        	
	        	//set the message type
	        	teachersConnectedMessage.put("messageType", "teachersOnlineList");
	        	
	        	/*
	        	 * the array that will contain the workgroup ids of the teachers
	        	 * that are currently connected for this run
	        	 */
	        	JSONArray teachersOnlineList = new JSONArray();
	        	
	        	Iterator<WISEWebSocketSession> teacherConnectionIterator = teacherConnectionsForRun.iterator();
	        	
	        	//loop through all the teachers that are currently connected for this run
	        	while(teacherConnectionIterator.hasNext()) {
	        		//get a teacher connection
	        		WISEWebSocketSession teacherConnection = teacherConnectionIterator.next();
	        		
	        		//get the workgroup id
	        		Long teacherConnectionWorkgroupId = teacherConnection.getWorkgroupId();
	        		
	        		//add the workgroup id to the array
	        		teachersOnlineList.put(teacherConnectionWorkgroupId);
	        	}
	        	
	        	//add the array of connected teachers to the message
	        	teachersConnectedMessage.put("teachersOnlineList", teachersOnlineList);
	        	
	        	//send the message that contains the list of connected teachers for the run
	        	sendMessage(session, teachersConnectedMessage.toString());
        	}
		} catch (JSONException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * Called when a websocket connection is closed
	 * @param session
	 * @throws IOException
	 */
	@OnClose
	public void onClose(Session session) throws IOException {
		//get the WISEWebSocketSession for the session
		WISEWebSocketSession wiseWebSocketSession = sessionToWISEWebSocketSession.get(session);
		
		//remove the WISEWebSocketSession from our collection of WISEWebSocketSessions
		removeSession(wiseWebSocketSession);
		
		//send any websocket message to announce this user has disconnected
		handleUserDisconnecting(wiseWebSocketSession);
	}
	
	/**
	 * Handle when a user disconnects
	 * @param wiseWebSocketSession a WISEWebSocketSession object which contains user
	 * related values such as user name, workgroup id, session, etc.
	 */
	private void handleUserDisconnecting(WISEWebSocketSession wiseWebSocketSession) {
    	try {
    		/*
    		 * create the message JSON to notify signed in users that
    		 * this user has disconnected
    		 */
    		JSONObject messageJSON = new JSONObject();
    		
    		if(wiseWebSocketSession.isTeacher()) {
    			//the user is a teacher
    			messageJSON.put("messageType", "teacherDisconnected");
    		} else {
    			Long periodId = wiseWebSocketSession.getPeriodId();
    			Long workgroupId = wiseWebSocketSession.getWorkgroupId();
    			
    			//the user is a student
    			messageJSON.put("messageType", "studentDisconnected");
    			
    			//add the period id and workgroup id
    			messageJSON.put("periodId", periodId);
    			messageJSON.put("workgroupId", workgroupId);
    		}
    		
    		String userName = wiseWebSocketSession.getUserName();
    		Long runId = wiseWebSocketSession.getRunId();
    		
    		//add the user name and run id
    		messageJSON.put("userName", userName);
    		messageJSON.put("runId", runId);
			
    		//get the message as a string
        	String message = messageJSON.toString();
        	
        	//get all the teachers that are currently connected for this run
        	Set<WISEWebSocketSession> teacherConnectionsForRun = getTeacherConnectionsForRun(runId);
        	
        	//send the message to all the teachers currently connected for this run
        	sendMessageToConnections(message, teacherConnectionsForRun);
		} catch (JSONException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * Add the WISEWebSocketSession to our collections so that we can access it
	 * again later
	 * @param wiseWebSocketSession the WISEWebSocketSession object
	 */
	private void addSession(WISEWebSocketSession wiseWebSocketSession) {
		
		//get the run id
		Long runId = wiseWebSocketSession.getRunId();
		
		if(runId != null) {
			Set<WISEWebSocketSession> connectionsForRun = null;
			
			if(wiseWebSocketSession.isTeacher()) {
				/*
				 * user is a teacher so we will retrieve the collection of teacher connections
				 * for this run
				 */
				connectionsForRun = runToTeacherConnections.get(runId);
				
				if(connectionsForRun == null) {
					/*
					 * we have not created a set of teacher connections for this run so we will
					 * create it now
					 */
					connectionsForRun = new CopyOnWriteArraySet<WISEWebSocketSession>();
					runToTeacherConnections.put(runId, connectionsForRun);
				}
			} else {
				/*
				 * user is a student so we will retrieve the collection of student connections
				 * for this run
				 */
				connectionsForRun = runToStudentConnections.get(runId);
				
				if(connectionsForRun == null) {
					/*
					 * we have not created a set of student connections for this run so we will
					 * create it now
					 */
					connectionsForRun = new CopyOnWriteArraySet<WISEWebSocketSession>();
					runToStudentConnections.put(runId, connectionsForRun);
				}
			}
			
			if(connectionsForRun != null) {
				//add the WISEWebSocketSession to the set of connections
				connectionsForRun.add(wiseWebSocketSession);
				
				//get the session object from the wiseWebSocketSession
				Session session = wiseWebSocketSession.getSession();
				
				//add the mapping from session to wiseWebSocketSession
				sessionToWISEWebSocketSession.put(session, wiseWebSocketSession);
				
				//get the user
				User user = wiseWebSocketSession.getUser();
				
				//add the mapping from user to wiseWebSocketSession
				userToWISEWebSocketSession.put(user, wiseWebSocketSession);
			}
		}
	}

	/**
	 * Remove the WISEWebSocketSession from our collections of sessions
	 * @param wiseWebSocketSession the WISEWebSocketSession to remove from our collections
	 */
	private void removeSession(WISEWebSocketSession wiseWebSocketSession) {
		
		if(wiseWebSocketSession != null) {
			//get the session
	        Session session = wiseWebSocketSession.getSession();
	        
	        //get the user
	        User user = wiseWebSocketSession.getUser();
	        
	        if(session != null) {
	        	//get the run id
	        	Long runId = getValueFromSession(session, "runId");
	        	
	        	if(wiseWebSocketSession.isTeacher()) {
	        		//user is a teacher so we will get the set of teacher connections for the run
	        		Set<WISEWebSocketSession> teacherConnectionsForRun = runToTeacherConnections.get(runId);
	        		
	        		if(teacherConnectionsForRun != null) {
	        			//remove the teacher session from the set of teacher connections for the run
	        			teacherConnectionsForRun.remove(wiseWebSocketSession);
	        		}
	        	} else {
	        		//user is a student so we will get the set of student connections for the run
	        		Set<WISEWebSocketSession> studentConnectionsForRun = runToStudentConnections.get(runId);
	        		
	        		if(studentConnectionsForRun != null) {
	        			//remove the student session from the set of student connections for the run
	        			studentConnectionsForRun.remove(wiseWebSocketSession);
	        		}
	        	}
	        	
	        	sessionToWISEWebSocketSession.remove(session);
	        	userToWISEWebSocketSession.remove(user);
	        }
		}
	}
	
    /**
     * Get the student connections for a run
     * @param runId the run id
     * @return a set of student connections for the run
     */
    private Set<WISEWebSocketSession> getStudentConnectionsForRun(Long runId) {
    	Set<WISEWebSocketSession> studentConnectionsForRun = null;
    	
    	//get the set of student connections for the run
    	studentConnectionsForRun = runToStudentConnections.get(runId);
    	
    	if(studentConnectionsForRun == null) {
    		//the set does not exist for the run so we will create a set
    		studentConnectionsForRun = new CopyOnWriteArraySet<WISEWebSocketSession>();
    		
    		//put the set of student connections into the hashtable that maps run to student connection sets
    		runToStudentConnections.put(runId, studentConnectionsForRun);
    	}
    	
    	//return the set of student connections for the run
    	return studentConnectionsForRun;
    }
    
    /**
     * Get the student connections for a period
     * @param runId the run id
     * @param periodId the period id
     * @return a set of student connections for the period
     */
    private Set<WISEWebSocketSession> getStudentConnectionsForPeriod(Long runId, Long periodId) {
    	Set<WISEWebSocketSession> studentConnectionsForRun = null;
    	Set<WISEWebSocketSession> studentConnectionsForPeriod = new CopyOnWriteArraySet<WISEWebSocketSession>();
    	
    	//get the set of student connections for the run
    	studentConnectionsForRun = runToStudentConnections.get(runId);
    	
    	if(studentConnectionsForRun == null) {
    		//the set does not exist for the run so we will create a set
    		studentConnectionsForRun = new CopyOnWriteArraySet<WISEWebSocketSession>();
    		
    		//put the set of student connections into the hashtable that maps run to student connection sets
    		runToStudentConnections.put(runId, studentConnectionsForRun);
    	}
    	
    	//loop through all the student connections for the run
    	Iterator<WISEWebSocketSession> studentConnectionsForRunIter = studentConnectionsForRun.iterator();
    	
    	while(studentConnectionsForRunIter.hasNext()) {
    		//get a student connection
    		WISEWebSocketSession studentConnection = studentConnectionsForRunIter.next();
    		
    		//get the period id of the student connection
    		Long studentConnectionPeriodId = studentConnection.getPeriodId();
    		
    		//check if the period id matches the one we want
    		if(periodId.equals(studentConnectionPeriodId)) {
    			/*
    			 * the period id matches so we will add this student connection to
    			 * our set of student connections to return
    			 */
    			studentConnectionsForPeriod.add(studentConnection);
    		}
    	}
    	
    	//return the set of student connections for the run
    	return studentConnectionsForPeriod;
    }
    
    /**
     * Get the teacher connections for a run
     * @param runId the run id
     * @return a set of teacher connections
     */
    private Set<WISEWebSocketSession> getTeacherConnectionsForRun(Long runId) {
    	Set<WISEWebSocketSession> teacherConnectionsForRun = null;
    	
    	//get the set of teacher connections for the run
    	teacherConnectionsForRun = runToTeacherConnections.get(runId);
    	
    	if(teacherConnectionsForRun == null) {
    		//the set does not exist for the run so we will create a set
    		teacherConnectionsForRun = new CopyOnWriteArraySet<WISEWebSocketSession>();
    		
    		//put the set of teacher connections into the hashtable that maps run to teacher connection sets
    		runToTeacherConnections.put(runId, teacherConnectionsForRun);
    	}
    	
    	//return the set of teacher connections for the run
    	return teacherConnectionsForRun;
    }
    
    /**
     * Get all the connections for a run
     * @param runId the run id
     * @return all the connections including student and teacher connections
     * for a run
     */
    private Set<WISEWebSocketSession> getAllConnectionsForRun(Long runId) {
    	//create a set to hold all the connections
    	Set<WISEWebSocketSession> allConnectionsForRun = new CopyOnWriteArraySet<WISEWebSocketSession>();
    	
    	//get all the student connections for the run
    	Set<WISEWebSocketSession> studentConnectionsForRun = getStudentConnectionsForRun(runId);
    	
    	//get all the teacher connections for the run
    	Set<WISEWebSocketSession> teacherConnectionsForRun = getTeacherConnectionsForRun(runId);
    	
    	//add the student and teacher connections to the set we will return
    	allConnectionsForRun.addAll(studentConnectionsForRun);
    	allConnectionsForRun.addAll(teacherConnectionsForRun);
    	
    	return allConnectionsForRun;
    }
    
    /**
     * Get a value from the session
     * @param session the session
     * @param key the key for the value we want
     * @return the value from the key
     */
	private Long getValueFromSession(Session session, String key) {
		Long value = null;
		
		if(session != null && key != null) {
			//get the session parameters
			Map<String, List<String>> requestParameterMap = session.getRequestParameterMap();
			
			if(requestParameterMap != null && requestParameterMap.containsKey(key)) {
				//get the list of values with the given key
				List<String> valueList = requestParameterMap.get(key);
				
				if(valueList != null && valueList.size() > 0) {
					//get the first value in the list
					String valueString = valueList.get(0);
					
					if(valueString != null) {
						//get the value as a long
						value = Long.parseLong(valueString);
					}
				}
			}
		}
		
		return value;
	}
	
	/**
	 * Handle the message sent by the user. This function can be called from anywhere as
	 * long as a handle to this WISEEndPoint bean is obtained.
	 * @param user the signed in user
	 * @param message the message to send
	 */
	public void handleMessage(User user, String message) {
		//get the wiseWebSocketSession for the given user
		WISEWebSocketSession wiseWebSocketSession = userToWISEWebSocketSession.get(user);
		
		if(wiseWebSocketSession != null) {
			//get the session object
			Session session = wiseWebSocketSession.getSession();
			
			if(session != null) {
				/*
				 * handle the message and perform any necessary processing and broadcasting
				 * of the message
				 */
				handleMessage(session, message);				
			}
		}
	}
	
	/**
	 * A user has sent a websocket message so we will perform any necessary
	 * processing and send out a websocket message to other users if necessary
	 * @param session the session
	 * @param message the text message the user has sent
	 */
	@OnMessage
	public void handleMessage(Session session, String message) {
    	//get the message as a string
    	String messageString = message.toString();
    	
    	try {
			JSONObject messageJSON = new JSONObject(messageString);
			
			if(messageJSON.has("messageParticipants")) {
				/*
				 * get the message participants which will tell us who is sending
				 * the message and who should receive the message
				 */
				String messageParticipants = messageJSON.getString("messageParticipants");
				
				if(messageParticipants == null) {
					
				} else if(messageParticipants.equals("studentToStudent")) {
					//TODO
				} else if(messageParticipants.equals("studentToTeachers")) {
					//the student is sending a message to the teachers
					sendStudentToTeachersMessage(session, messageJSON);
				} else if(messageParticipants.equals("studentToGroup")) {
					//TODO
				} else if(messageParticipants.equals("teacherToStudent")) {
					//TODO
				} else if(messageParticipants.equals("teacherToGroup")) {
					//TODO
				} else if(messageParticipants.equals("teacherToStudentsInPeriod")) {
					//the teacher is sending a message to the students in a period
					sendTeacherToStudentsInPeriodMessage(session, messageJSON);
				} else if(messageParticipants.equals("teacherToStudentsInRun")) {
					//the teacher is sending a message to the students in a run
					sendTeacherToStudentsInRunMessage(session, messageJSON);
				} else if(messageParticipants.equals("studentToClassmatesInPeriod")) {
					//the student is sending a message to the classmates in a period
					sendStudentToClassmatesInPeriodMessage(session, messageJSON);
				} else {
					//TODO
				}
			}
			
			//if this is a student status message we will save it to the database
			if(messageJSON.has("messageType")) {
				String messageType = messageJSON.optString("messageType");
				
				if(messageType != null && messageType.equals("studentStatus")) {
					//this is a student status message so we will save the student status to the database
					saveStudentStatusToDatabase(session, messageJSON);
				}
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
	}
	
	@Override
	public Binding getBinding() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public EndpointReference getEndpointReference(Element... arg0) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public <T extends EndpointReference> T getEndpointReference(Class<T> arg0,
			Element... arg1) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Executor getExecutor() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Object getImplementor() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<Source> getMetadata() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Map<String, Object> getProperties() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean isPublished() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public void publish(String arg0) {
		// TODO Auto-generated method stub

	}

	@Override
	public void publish(Object arg0) {
		// TODO Auto-generated method stub

	}

	@Override
	public void setExecutor(Executor arg0) {
		// TODO Auto-generated method stub

	}

	@Override
	public void setMetadata(List<Source> arg0) {
		// TODO Auto-generated method stub

	}

	@Override
	public void setProperties(Map<String, Object> arg0) {
		// TODO Auto-generated method stub

	}

	@Override
	public void stop() {
		// TODO Auto-generated method stub

	}

	/**
	 * An object that contains a session object as well as other user related
	 * variables
	 */
	private final class WISEWebSocketSession {
		Session session;
    	private User user = null;
        private String userName = null;
        private String firstName = null;
        private String lastName = null;
        private Long runId = null;
        private Long periodId = null;
        private Long workgroupId = null;
        private boolean isTeacher = false;

        /**
         * The contstructor for WISEWebSocketSession
         * @param session a session object
         * @param signedInUser the signed in user object
         */
        public WISEWebSocketSession(Session session, User signedInUser) {
        	//get the workgroup id and run id from the session
        	Long workgroupId = getValueFromSession(session, "workgroupId");
        	Long runId = getValueFromSession(session, "runId");
        	
        	//get the first and last name from the request
			String firstName = getFirstName(user);
			String lastName = getLastName(user);
			
			String userName = null;
			
			//set user related variables
        	setUser(signedInUser);
        	setRunId(runId);
        	setWorkgroupId(workgroupId);
        	setFirstName(firstName);
        	setLastName(lastName);
        	
        	
        	if(WISEEndPoint.isTeacher(signedInUser)) {
        		//get the user name
        		userName = getUserName(user);
        		
        		//the user is a teacher
        		setTeacher(true);
        	} else if(WISEEndPoint.isStudent(signedInUser)) {
        		//the user is a student so we will get the user names of everyone in their workgroup
        		userName = getWorkgroupUserNames(workgroupId);
        		
        		//the user is a student
        		setTeacher(false);
        		
        		//set the period
        		Long periodId = getValueFromSession(session, "periodId");
        		setPeriodId(periodId);
        	}
        	
        	//set the user name
        	setUserName(userName);
        	
        	//set the session
        	setSession(session);
        }
        
    	/**
    	 * Get the first name of the user
    	 * @param user the user
    	 * @return the first name of the user
    	 */
    	public String getFirstName(User user) {
    		String firstName = null;
    		
    		if(user != null) {
    			//get the user details
    			MutableUserDetails userDetails = user.getUserDetails();
    			
    			//get the first name
    			if(userDetails instanceof TeacherUserDetails) {
    				firstName = ((TeacherUserDetails) userDetails).getFirstname();
    			} else if(userDetails instanceof StudentUserDetails) {
    				firstName = ((StudentUserDetails) userDetails).getFirstname();
    			} else {
    				
    			}
    		}
    		
    		return firstName;
    	}
    	
    	/**
    	 * Get the last name of the user
    	 * @param user the user
    	 * @return the last name of the user
    	 */
    	public String getLastName(User user) {
    		String lastName = null;
    		
    		if(user != null) {
    			//get the user details
    			MutableUserDetails userDetails = user.getUserDetails();
    			
    			//get the last name
    			if(userDetails instanceof TeacherUserDetails) {
    				lastName = ((TeacherUserDetails) userDetails).getLastname();
    			} else if(userDetails instanceof StudentUserDetails) {
    				lastName = ((StudentUserDetails) userDetails).getLastname();
    			} else {
    				
    			}
    		}
    		
    		return lastName;
    	}
    	
    	/**
    	 * Get the user name of the user
    	 * @param user the user
    	 * @return the user name of the user
    	 */
    	public String getUserName(User user) {
    		String userName = null;
    		
    		if(user != null) {
    			//get the user details
    			MutableUserDetails userDetails = user.getUserDetails();
    			
    			//get the user name
    			if(userDetails instanceof TeacherUserDetails) {
    				userName = ((TeacherUserDetails) userDetails).getUsername();
    			} else if(userDetails instanceof StudentUserDetails) {
    				userName = ((StudentUserDetails) userDetails).getUsername();
    			} else {
    				
    			}
    		}
    		
    		return userName;
    	}
    	
    	/**
    	 * Get the user names in the workgroup. This will include the
    	 * first name, last name, and user name for all the students
    	 * in the workgroup.
    	 * e.g. Spongebob Squarepants (SpongebobS0101), Patrick Star (PatrickS0101)
    	 * @param workgroupId the workgroup id
    	 * @return the workgroup user names
    	 */
    	public String getWorkgroupUserNames(Long workgroupId) {
    		//create a string buffer to accumulate the user names
    		StringBuffer workgroupUserNames = new StringBuffer();
    		
    		try {
    			//get the workgroup
    			Workgroup workgroup = wiseWorkgroupService.retrieveById(workgroupId);
    			
    			//get the members in the workgroup
    			Set<User> members = workgroup.getMembers();
    			
    			Iterator<User> membersIterator = members.iterator();
    			
    			//loop through all the members in the workgroup
    			while(membersIterator.hasNext()) {
    				//get a member in the workgroup
    				User user = membersIterator.next();
    				
    				//get the first name, last name, user name
    				String firstName = getFirstName(user);
    				String lastName = getLastName(user);
    				String userName = getUserName(user);
    				
    				//separate members in the workgroup with a ,
    				if(workgroupUserNames.length() != 0) {
    					workgroupUserNames.append(", ");
    				}
    				
    				//add the first name
    				workgroupUserNames.append(firstName);
    				workgroupUserNames.append(" ");
    				
    				//add the last name
    				workgroupUserNames.append(lastName);
    				
    				//add the user name surrounded by parens
    				workgroupUserNames.append("(");
    				workgroupUserNames.append(userName);
    				workgroupUserNames.append(")");
    			}
    		} catch (ObjectNotFoundException e) {
    			e.printStackTrace();
    		}
    		
    		return workgroupUserNames.toString();
    	}
        
		public Session getSession() {
			return session;
		}

		public void setSession(Session session) {
			this.session = session;
		}
		
		public User getUser() {
			return user;
		}

		public void setUser(User user) {
			this.user = user;
		}
		
		public String getUserName() {
			return userName;
		}

		public void setUserName(String userName) {
			this.userName = userName;
		}
		
        private String getFirstName() {
			return firstName;
		}

		private void setFirstName(String firstName) {
			this.firstName = firstName;
		}

		private String getLastName() {
			return lastName;
		}

		private void setLastName(String lastName) {
			this.lastName = lastName;
		}
		
		private String getFullName() {
			return this.firstName + " " + this.lastName;
		}

		private Long getRunId() {
			return runId;
		}

		private void setRunId(Long runId) {
			this.runId = runId;
		}

		private Long getPeriodId() {
			return periodId;
		}

		private void setPeriodId(Long periodId) {
			this.periodId = periodId;
		}

		private Long getWorkgroupId() {
			return workgroupId;
		}

		private void setWorkgroupId(Long workgroupId) {
			this.workgroupId = workgroupId;
		}

		private boolean isTeacher() {
			return isTeacher;
		}

		private void setTeacher(boolean isTeacher) {
			this.isTeacher = isTeacher;
		}
	}

	/**
	 * Validate the user
	 * @param user the user
	 * @param session the session
	 * @return whether the user has been validated
	 */
	private boolean validateUser(User user, Session session) {
		boolean validated = false;
		
		if(user != null) {
    		if(isTeacher(user)) {
    			//user is a teacher
    			
    			//get the run id
    			Long runId = getValueFromSession(session, "runId");
    	    	
    	    	//make sure the teacher is the owner of the run
    			validated = validateTeacher(user, runId);
    		} else if(isStudent(user)) {
    			//get the run id, period id, workgroup id
    	    	Long runId = getValueFromSession(session, "runId");
    	    	Long periodId = getValueFromSession(session, "periodId");
    	    	Long workgroupId = getValueFromSession(session, "workgroupId");
    	    	
    	    	//make sure the student is in the run id, period id, and workgroup id
    			validated = validateStudent(user, runId, periodId, workgroupId);
    		} else {
    			
    		}
    	}
		
		return validated;
	}
	
	/**
	 * Validate the student by making sure the user is in
	 * the run id, period id, and workgroup id.
	 * @param user the signed in user
	 * @param runId the run id
	 * @param periodId the period id
	 * @param workgroupId the workgroup id
	 * @return whether the user is in the run id, period id,
	 * and workgroup id
	 */
	private boolean validateStudent(User user, Long runId, Long periodId, Long workgroupId) {
		boolean result = false;
		
		if(user != null && runId != null && periodId != null && workgroupId != null) {
			try {
				//get the run
				Run run = runService.retrieveById(runId);
				
				//check if the user is in the run
				if (run.isStudentAssociatedToThisRun(user)) {
					//get the workgroup
					Workgroup workgroup = wiseWorkgroupService.retrieveById(workgroupId);
					
					//check if the user is in the workgroup
					if(workgroup.getMembers().contains(user)) {
						result = true;
					}
				}
			} catch (Exception e) {
				result = false;
			}
		}
		
		return result;
	}
	
	/**
	 * Validate the teacher by making sure they are the owner of the run
	 * @param user the signed in user
	 * @param runId the run id
	 * @return whether the user is an owner of the run
	 */
	private boolean validateTeacher(User user, Long runId) {
		boolean validated = false;
		
		if(user != null && runId != null) {
			try {
				//get the run
				Run run = runService.retrieveById(runId);
				
				if(run != null) {
					//get the owners and shared owners
					Set<User> owners = run.getOwners();
					Set<User> sharedowners = run.getSharedowners();
					
					if(owners.contains(user) || sharedowners.contains(user) || user.isAdmin()) {
						//the user is the owner or a shared owner
						validated = true;
					}
				}
			} catch (ObjectNotFoundException e) {
				e.printStackTrace();
			}			
		}
		
		return validated;
	}
	
	/**
	 * Check if the user is a teacher
	 * @param user the user
	 * @return whether the user is a teacher
	 */
	private static boolean isTeacher(User user) {
		boolean isTeacher = false;
		
		if(user != null) {
			//get the user details
			MutableUserDetails userDetails = user.getUserDetails();
			
			if(userDetails != null) {
				//check if the user details is a teacher user details
				if(userDetails instanceof TeacherUserDetails) {
					//the user is a teacher
					isTeacher = true;
				}
			}
		}
		
		return isTeacher;
	}
	
	/**
	 * Check if the user is a student
	 * @param user the user
	 * @return whether the user is a student
	 */
	private static boolean isStudent(User user) {
		boolean isStudent = false;
		
		if(user != null) {
			//get the user details
			MutableUserDetails userDetails = user.getUserDetails();
			
			if(userDetails != null) {
				//check if the user details is a student user details
				if(userDetails instanceof StudentUserDetails) {
					//the user is a student
					isStudent = true;
				}
			}
		}
		
		return isStudent;
	}
	
    /**
     * Save the student status to the database. This function will inject
     * the run id, period id, and workgroup id into the student status JSON.
     * @param session the websocket session
     * @param messageJSON the student status JSON
     */
    private void saveStudentStatusToDatabase(Session session, JSONObject messageJSON) {
    	//get the wiseWebSocketSession related to the given session
		WISEWebSocketSession wiseWebSocketSession = sessionToWISEWebSocketSession.get(session);
		
		Long runId = wiseWebSocketSession.getRunId();
		Long periodId = wiseWebSocketSession.getPeriodId();
		Long workgroupId = wiseWebSocketSession.getWorkgroupId();
    	
    	//get the signed in user
    	User signedInUser = wiseWebSocketSession.getUser();
    	
		//make sure the user is actually in the given run id, period id, and workgroup id
		if(validateStudent(signedInUser, runId, periodId, workgroupId)) {
			try {
				//add the run id, period id, and workgroup id of the student into the message
				messageJSON.put("runId", runId);
				messageJSON.put("periodId", periodId);
				messageJSON.put("workgroupId", workgroupId);
			} catch (JSONException e) {
				e.printStackTrace();
			}
			
			//get the student status object for the workgroup id if it already exists
			StudentStatus studentStatus = vleService.getStudentStatusByWorkgroupId(workgroupId);
			
			if(studentStatus == null) {
				//the student status object does not already exist so we will create it
				studentStatus = new StudentStatus(runId, periodId, workgroupId, messageJSON.toString());			
			} else {
				//the student status object already exists so we will update the timestamp and status
				Calendar now = Calendar.getInstance();
				studentStatus.setTimestamp(new Timestamp(now.getTimeInMillis()));
				studentStatus.setStatus(messageJSON.toString());
			}
			
			//save the student status to the database
			vleService.saveStudentStatus(studentStatus);
		}
    }
    
    /**
     * Handle the message that a student is sending to the teachers.
     * This function will inject the run id, period id, and workgroup id
     * into the messageJSON object.
     * @param session the websocket session
     * @param messageJSON the message to send
     */
    private void sendStudentToTeachersMessage(Session session, JSONObject messageJSON) {
    	try {
    		//get the wiseWebSocketSession related to the given session
    		WISEWebSocketSession wiseWebSocketSession = sessionToWISEWebSocketSession.get(session);
    		
    		Long runId = wiseWebSocketSession.getRunId();
    		Long periodId = wiseWebSocketSession.getPeriodId();
    		Long workgroupId = wiseWebSocketSession.getWorkgroupId();
    		
    		//add the run id, period id, and workgroup id of the student into the message
			messageJSON.put("runId", runId);
			messageJSON.put("periodId", periodId);
			messageJSON.put("workgroupId", workgroupId);
			
			//get the message as a string 
			String message = messageJSON.toString();
			
			//get all the currently connected teachers for the run
			Set<WISEWebSocketSession> teacherConnectionsForRun = getTeacherConnectionsForRun(runId);
			
			//send the message to all the currently connected teachers for the run
			sendMessageToConnections(message, teacherConnectionsForRun);
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
    }

    /**
     * Handle the message that a teacher is sending to the students of a run
     * @param session the websocket session
     * @param messageJSON the message to send
     */
    private void sendTeacherToStudentsInRunMessage(Session session, JSONObject messageJSON) {
    	try {
    		//get the wiseWebSocketSession related to the given session
    		WISEWebSocketSession wiseWebSocketSession = sessionToWISEWebSocketSession.get(session);
    		
    		Long runId = wiseWebSocketSession.getRunId();
    		
    		//add the run id into the message
        	messageJSON.put("runId", runId);
        	
        	//get the message as a string
        	String message = messageJSON.toString();
        	
        	//get all the currently connected students for the run
        	Set<WISEWebSocketSession> studentConnectionsForRun = getStudentConnectionsForRun(runId);
        	
        	//get all the currently connected teachers for the run
        	Set<WISEWebSocketSession> teacherConnectionsForRun = getTeacherConnectionsForRun(runId);
        	
        	//create a set to combine all the connections
        	Set<WISEWebSocketSession> connections = new CopyOnWriteArraySet<WISEWebSocketSession>();
        	
        	//gather all the connections
        	connections.addAll(studentConnectionsForRun);
        	connections.addAll(teacherConnectionsForRun);
        	
        	//send the message to all the currently connected students for the run
        	sendMessageToConnections(message, connections);
		} catch (JSONException e) {
			e.printStackTrace();
		}
    }
    
    /**
     * Handle the message that a teacher is sending to the students of a period
     * @param session the websocket session
     * @param messageJSON the message to send
     */
    private void sendTeacherToStudentsInPeriodMessage(Session session, JSONObject messageJSON) {
    	try {
    		//get the wiseWebSocketSession related to the given session
    		WISEWebSocketSession wiseWebSocketSession = sessionToWISEWebSocketSession.get(session);
    		
    		Long runId = wiseWebSocketSession.getRunId();
    		
    		//add the run id into the message
        	messageJSON.put("runId", runId);
        	
        	if(messageJSON.has("periodId")) {
	        	//get the period id
	        	Long periodId = messageJSON.getLong("periodId");
	        	
	        	//get the message as a string
	        	String message = messageJSON.toString();
	        	
	        	//get all the currently connected students for the period
	        	Set<WISEWebSocketSession> studentConnectionsForRun = getStudentConnectionsForPeriod(runId, periodId);
	        	
	        	//get all the currently connected teachers for the run
	        	Set<WISEWebSocketSession> teacherConnectionsForRun = getTeacherConnectionsForRun(runId);
	        	
	        	//create a set to combine all the connections
	        	Set<WISEWebSocketSession> connections = new CopyOnWriteArraySet<WISEWebSocketSession>();
	        	
	        	//gather all the connections
	        	connections.addAll(studentConnectionsForRun);
	        	connections.addAll(teacherConnectionsForRun);
	        	
	        	//send the message to all the currently connected students for the period
	        	sendMessageToConnections(message, connections);
        	}
		} catch (JSONException e) {
			e.printStackTrace();
		}
    }
    
    /**
     * Handle the message that a student is sending to their classmates in a period
     * @param session the session object
     * @param messageJSON the message JSON object
     */
    private void sendStudentToClassmatesInPeriodMessage(Session session, JSONObject messageJSON) {
    	try {
    		if(session != null) {
        		//get the wiseWebSocketSession related to the given session
        		WISEWebSocketSession wiseWebSocketSession = sessionToWISEWebSocketSession.get(session);
        		
        		if(wiseWebSocketSession != null) {
            		Long runId = wiseWebSocketSession.getRunId();
            		Long periodId = wiseWebSocketSession.getPeriodId();
            		
            		//add the run id into the message
                	messageJSON.put("runId", runId);
                	
    	        	//get the message as a string
    	        	String message = messageJSON.toString();
    	        	
    	        	//get all the currently connected students in the period
    	        	Set<WISEWebSocketSession> studentConnectionsForRun = getStudentConnectionsForPeriod(runId, periodId);
    	        	
    	        	/*
    	        	 * remove the student that is sending the message since they don't need
    	        	 * to receive their own message
    	        	 */
    	        	studentConnectionsForRun.remove(wiseWebSocketSession);
    	        	
    	        	//send the message to all the currently connected students in the period
    	        	sendMessageToConnections(message, studentConnectionsForRun);
        		}
    		}
		} catch (JSONException e) {
			e.printStackTrace();
		}
    }

    /**
     * Send the message to the connections
     * @param message the message to send
     * @param connections the connections to send the message to
     */
    private void sendMessageToConnections(String message, Set<WISEWebSocketSession> connections) {
    	//loop through all the connections
        for (WISEWebSocketSession connection : connections) {
            try {
            	//get a session
            	Session session = connection.getSession();
            	
            	//send the message to the session
            	session.getBasicRemote().sendText(message);
            } catch (IOException ignore) {
                //ignore
            }
        }
    }
    
    /**
     * Send the message to a connection
     * @param session the websocket session to send the message to
     * @param message the message to send
     */
    private void sendMessage(Session session, String message) {
    	if(session != null) {
        	try {
        		//send the message to this session
        		session.getBasicRemote().sendText(message);
            } catch (IOException ignore) {
                //ignore
            }
    	}
    }
}
