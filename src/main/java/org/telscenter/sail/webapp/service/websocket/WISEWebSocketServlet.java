/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.telscenter.sail.webapp.service.websocket;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.List;
import java.util.Properties;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.authentication.MutableUserDetails;
import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;
import net.sf.sail.webapp.service.UserService;
import net.sf.sail.webapp.service.workgroup.WorkgroupService;

import org.apache.catalina.websocket.MessageInbound;
import org.apache.catalina.websocket.StreamInbound;
import org.apache.catalina.websocket.WebSocketServlet;
import org.apache.catalina.websocket.WsOutbound;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.authentication.impl.StudentUserDetails;
import org.telscenter.sail.webapp.domain.authentication.impl.TeacherUserDetails;
import org.telscenter.sail.webapp.presentation.util.json.JSONArray;
import org.telscenter.sail.webapp.presentation.util.json.JSONException;
import org.telscenter.sail.webapp.presentation.util.json.JSONObject;
import org.telscenter.sail.webapp.service.offering.RunService;

/**
 * Example web socket servlet for chat.
 */
public class WISEWebSocketServlet extends WebSocketServlet {

    private static final long serialVersionUID = 1L;

    //boolean flag to check if we have initialized the services
    private static boolean servicesInitialized = false;
    
    //the run service
    private static RunService runService = null;
    
    //the user service
    private static UserService userService = null;
    
    //the workgroup service
    private static WorkgroupService workgroupService = null;
    
    //the portal properties
    private static Properties portalProperties = null;
    
    //the hashtable to store the run id to set of student connections
    private static Hashtable<Long, Set<WISEMessageInbound>> runToStudentConnections = new Hashtable<Long,Set<WISEMessageInbound>>();
    
    //the hashtable to store the run id to set of teacher connections
    private static Hashtable<Long, Set<WISEMessageInbound>> runToTeacherConnections = new Hashtable<Long,Set<WISEMessageInbound>>();

    /**
     * Initialize the services
     */
    private void initializeServices() {
    	//initialize the services if it has not been done yet
    	if(!servicesInitialized) {
    		//initialize the services
    		
    		ServletContext servletContext = this.getServletContext();
    		WebApplicationContext ctx = WebApplicationContextUtils.getWebApplicationContext(servletContext);
    		
    		//get the services
    		runService = (RunService) ctx.getBean("runService");
    		userService = (UserService) ctx.getBean("userService");
    		workgroupService = (WorkgroupService) ctx.getBean("wiseWorkgroupService");
    		portalProperties = (Properties) ctx.getBean("portalproperties");
    		
    		//set this flag to true so we don't need to initialize the services again
    		servicesInitialized = true;
    	}
    }
    
    /**
     * Add a connection
     * @param wiseMessageInbound the object which represents a connection
     */
    private void addConnection(WISEMessageInbound wiseMessageInbound) {
    	if(wiseMessageInbound.isTeacher()) {
    		//connection is for a teacher so we will add this connection to the set of teachers
    		addTeacherConnection(wiseMessageInbound);
    	} else {
    		//connection is for a student so we will add this connection to the set of students
    		addStudentConnection(wiseMessageInbound);
    	}
    }
    
    /**
     * Remove a connection
     * @param wiseMessageInbound the object which represents a connection
     */
    private void removeConnection(WISEMessageInbound wiseMessageInbound) {
    	if(wiseMessageInbound.isTeacher()) {
    		//connection is for a teacher so we will remove the connection from the set of teachers
    		removeTeacherConnection(wiseMessageInbound);
    	} else {
    		//connection is for a student so we will remove the connection from the set of students
    		removeStudentConnection(wiseMessageInbound);
    	}
    }
    
    /**
     * Add a student connection
     * @param wiseMessageInbound the object which represents a connection
     */
    private void addStudentConnection(WISEMessageInbound wiseMessageInbound) {
    	//get the run id
    	Long runId = wiseMessageInbound.getRunId();
    	
    	if(runId != null) {
    		//get the set of student connections for the run
    		Set<WISEMessageInbound> studentConnectionsForRun = getStudentConnectionsForRun(runId);
    		
    		//add this student connection
    		studentConnectionsForRun.add(wiseMessageInbound);
    	}
    }
    
    /**
     * Remove a student connection
     * @param chatMessageInbound
     */
    private void removeStudentConnection(WISEMessageInbound chatMessageInbound) {
    	//get the run id
    	Long runId = chatMessageInbound.getRunId();
    	
    	if(runId != null) {
    		//get the set of student connections for the run
    		Set<WISEMessageInbound> studentConnectionsForRun = getStudentConnectionsForRun(runId);
    		
    		//remove this student connection
    		studentConnectionsForRun.remove(chatMessageInbound);
    	}
    }
    
    /**
     * Get the student connections for a run
     * @param runId the run id
     * @return a set of student connections for the run
     */
    private Set<WISEMessageInbound> getStudentConnectionsForRun(Long runId) {
    	Set<WISEMessageInbound> studentConnectionsForRun = null;
    	
    	//get the set of student connections for the run
    	studentConnectionsForRun = runToStudentConnections.get(runId);
    	
    	if(studentConnectionsForRun == null) {
    		//the set does not exist for the run so we will create a set
    		studentConnectionsForRun = new CopyOnWriteArraySet<WISEMessageInbound>();
    		
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
    private Set<WISEMessageInbound> getStudentConnectionsForPeriod(Long runId, Long periodId) {
    	Set<WISEMessageInbound> studentConnectionsForRun = null;
    	Set<WISEMessageInbound> studentConnectionsForPeriod = new CopyOnWriteArraySet<WISEMessageInbound>();
    	
    	//get the set of student connections for the run
    	studentConnectionsForRun = runToStudentConnections.get(runId);
    	
    	if(studentConnectionsForRun == null) {
    		//the set does not exist for the run so we will create a set
    		studentConnectionsForRun = new CopyOnWriteArraySet<WISEMessageInbound>();
    		
    		//put the set of student connections into the hashtable that maps run to student connection sets
    		runToStudentConnections.put(runId, studentConnectionsForRun);
    	}
    	
    	//loop through all the student connections for the run
    	Iterator<WISEMessageInbound> studentConnectionsForRunIter = studentConnectionsForRun.iterator();
    	while(studentConnectionsForRunIter.hasNext()) {
    		//get a student connection
    		WISEMessageInbound studentConnection = studentConnectionsForRunIter.next();
    		
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
     * Add a teacher connection
     * @param wiseMessageInbound the object that represents a connection
     */
    private void addTeacherConnection(WISEMessageInbound wiseMessageInbound) {
    	//get the run id
    	Long runId = wiseMessageInbound.getRunId();
    	
    	if(runId != null) {
    		//get the set of teacher connections for the run
    		Set<WISEMessageInbound> teacherConnectionsForRun = getTeacherConnectionsForRun(runId);
    		
    		//add the teacher connection
    		teacherConnectionsForRun.add(wiseMessageInbound);
    	}
    }
    
    /**
     * Remove a teacher connection
     * @param chatMessageInbound the object that represents a connection
     */
    private void removeTeacherConnection(WISEMessageInbound chatMessageInbound) {
    	//get the run id
    	Long runId = chatMessageInbound.getRunId();
    	
    	if(runId != null) {
    		//get the set of teacher connections for the run
    		Set<WISEMessageInbound> teacherConnectionsForRun = getTeacherConnectionsForRun(runId);
    		
    		//remove the teacher connection
    		teacherConnectionsForRun.remove(chatMessageInbound);
    	}
    }
    
    /**
     * Get the teacher connections for a run
     * @param runId the run id
     * @return a set of teacher connections
     */
    private Set<WISEMessageInbound> getTeacherConnectionsForRun(Long runId) {
    	Set<WISEMessageInbound> teacherConnectionsForRun = null;
    	
    	//get the set of teacher connections for the run
    	teacherConnectionsForRun = runToTeacherConnections.get(runId);
    	
    	if(teacherConnectionsForRun == null) {
    		//the set does not exist for the run so we will create a set
    		teacherConnectionsForRun = new CopyOnWriteArraySet<WISEMessageInbound>();
    		
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
    private Set<WISEMessageInbound> getAllConnectionsForRun(Long runId) {
    	//create a set to hold all the connections
    	Set<WISEMessageInbound> allConnectionsForRun = new CopyOnWriteArraySet<WISEMessageInbound>();
    	
    	//get all the student connections for the run
    	Set<WISEMessageInbound> studentConnectionsForRun = getStudentConnectionsForRun(runId);
    	
    	//get all the teacher connections for the run
    	Set<WISEMessageInbound> teacherConnectionsForRun = getTeacherConnectionsForRun(runId);
    	
    	//add the student and teacher connections to the set we will return
    	allConnectionsForRun.addAll(studentConnectionsForRun);
    	allConnectionsForRun.addAll(teacherConnectionsForRun);
    	
    	return allConnectionsForRun;
    }
    
    /**
     * Verify that the request is coming from the WISE protal
     * @param origin the host the request is coming from
     * e.g. http://wise.berkeley.edu
     * @return whether the host of the request matches the
     * portal base url
     */
    @Override
    protected boolean verifyOrigin(String origin) {
    	//initialize the services if necessary
    	initializeServices();
    	
    	boolean verified = false;
    	
    	if(portalProperties != null) {
    		//get the portal base url e.g. http://wise.berkeley.edu:8080/webapp
    		String portalBaseUrl = portalProperties.getProperty("portal_baseurl");
    		
    		//remove the /webapp to leave the host e.g. http://wise.berkeley.edu:8080
    		portalBaseUrl = portalBaseUrl.replace("/webapp", "");
    		
    		//check if the origin matches the portal base url
    		if(origin != null && origin.equals(portalBaseUrl)) {
    			//the origin matches
    			verified = true;
    		}
    	}
    	
    	return verified;
    }

    /**
     * Create a websocket connection object
     * @param subProtocol
     * @param request
     */
    @Override
	protected StreamInbound createWebSocketInbound(String subProtocol, HttpServletRequest request) {
    	//initialize the services if necessary
		initializeServices();
		
		//get the signed in user
    	User signedInUser = ControllerUtil.getSignedInUser();
    	
    	//validate the user
    	boolean validated = validateUser(signedInUser, request);
    	
    	StreamInbound streamInbound = null;
    	
    	if(validated) {
    		//create the connection object
    		streamInbound = new WISEMessageInbound(signedInUser, request);
    	}
    	
        return streamInbound;
    }
	
    /**
     * Get the workgroup id from the request
     * @param request
     * @return the workgroup id from the request
     */
	private static Long getWorkgroupId(HttpServletRequest request) {
		Long workgroupId = null;
		
		if(request != null) {
			//get the workgroup id string
			String workgroupIdString = request.getParameter("workgroupId");
			
			try {
				if(workgroupIdString != null) {
					//create the Long from the string
					workgroupId = new Long(workgroupIdString);					
				}
			} catch(NumberFormatException e) {
				e.printStackTrace();
			}
		}
		
		return workgroupId;
	}
	
	/**
	 * Get the run id from the request
	 * @param request
	 * @return the run id from the request
	 */
	private static Long getRunId(HttpServletRequest request) {
		Long runId = null;
		
		if(request != null) {
			//get the run id string
			String runIdString = request.getParameter("runId");
			
			try {
				if(runIdString != null) {
					//create the Long from the string
					runId = new Long(runIdString);					
				}
			} catch(NumberFormatException e) {
				e.printStackTrace();
			}
		}
		
		return runId;
	}
	
	/**
	 * Get the period id from the request
	 * @param request
	 * @return the period id from the request
	 */
	private static Long getPeriodId(HttpServletRequest request) {
		Long periodId = null;
		
		if(request != null) {
			//get the period id string
			String periodIdString = request.getParameter("periodId");
			
			try {
				if(periodIdString != null) {
					//create the Long from the string
					periodId = new Long(periodIdString);					
				}
			} catch(NumberFormatException e) {
				e.printStackTrace();
			}
		}
		
		return periodId;
	}
	
	/**
	 * Get the first name of the user
	 * @param user the user
	 * @return the first name of the user
	 */
	private static String getFirstName(User user) {
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
	private static String getLastName(User user) {
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
	private static String getUserName(User user) {
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
	private static String getWorkgroupUserNames(Long workgroupId) {
		//create a string buffer to accumulate the user names
		StringBuffer workgroupUserNames = new StringBuffer();
		
		try {
			//get the workgroup
			Workgroup workgroup = workgroupService.retrieveById(workgroupId);
			
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
	
	/**
	 * Validate the user
	 * @param user the user
	 * @param request
	 * @return whether the user has been validated
	 */
	private boolean validateUser(User user, HttpServletRequest request) {
		boolean validated = false;
		
		if(user != null) {
    		if(isTeacher(user)) {
    			//user is a teacher
    			
    			//get the run id
    	    	Long runId = getRunId(request);
    	    	
    	    	//make sure the teacher is the owner of the run
    			validated = validateTeacher(user, runId);
    		} else if(isStudent(user)) {
    			//get the run id, period id, workgroup id
    	    	Long runId = getRunId(request);
    	    	Long periodId = getPeriodId(request);
    	    	Long workgroupId = getWorkgroupId(request);
    	    	
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
		boolean validated = false;
		
		if(user != null && runId != null && periodId != null && workgroupId != null) {
			//get the list of runs this user is in
			List<Run> runList = runService.getRunList(user);
			
			if(runList != null) {
				Iterator<Run> runListIter = runList.iterator();
				
				//loop through all the runs this user is in
				while(runListIter.hasNext()) {
					//get a run
					Run tempRun = runListIter.next();
					
					//get the run id
					Long tempRunId = tempRun.getId();
					
					//check if the run id matches the one we are searching for
					if(runId.equals(tempRunId)) {
						//we have found the matching run id
						
						//get the period of the student for this run
						Group periodOfStudent = tempRun.getPeriodOfStudent(user);
						
						//get the period id
						Long tempPeriodId = periodOfStudent.getId();

						//check if the period id matches the one we are searching for
						if(periodId.equals(tempPeriodId)) {
							//we have found the matching period id
							
							//get the workgroups the user is in for the run
							List<Workgroup> workgroupListByOfferingAndUser = workgroupService.getWorkgroupListByOfferingAndUser(tempRun, user);
							
							if(workgroupListByOfferingAndUser != null) {
								Iterator<Workgroup> workgroupsIter = workgroupListByOfferingAndUser.iterator();

								//loop through all the workgroups the user is in for the run
								while(workgroupsIter.hasNext()) {
									//get a workgroup
									Workgroup workgroup = workgroupsIter.next();
									
									//get the workgroup id
									Long tempWorkgroupId = workgroup.getId();

									//check if the workgroup id matches the one we are searching for
									if(workgroupId.equals(tempWorkgroupId)) {
										//we have found the matching workgroup id
										return true;
									}
								}
							}
						}
					}
				}
			}
		}
		
		return validated;
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
					
					if(owners.contains(user) || sharedowners.contains(user)) {
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
	 * The class that represents a web socket connection for a user
	 */
    private final class WISEMessageInbound extends MessageInbound {

        private String userName = null;
        private String firstName = null;
        private String lastName = null;
        private Long runId = null;
        private Long periodId = null;
        private Long workgroupId = null;
        private boolean isTeacher = false;

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

		/**
		 * Constructor for the WISEMessageInbound
		 * @param user the user
		 * @param request the request to open the web socket connection
		 */
		private WISEMessageInbound(User user, HttpServletRequest request) {
			//get the run id from the request
			Long runId = WISEWebSocketServlet.getRunId(request);
			
			//get the first and last name from the request
			String firstName = WISEWebSocketServlet.getFirstName(user);
			String lastName = WISEWebSocketServlet.getLastName(user);
			
			if(WISEWebSocketServlet.isTeacher(user)) {
				//the user is a teacher
				
				//get the user name
				String userName = WISEWebSocketServlet.getUserName(user);
				
				//set the fields
				setRunId(runId);
				setFirstName(firstName);
				setLastName(lastName);
				setUserName(userName);
				setTeacher(true);
			} else if(WISEWebSocketServlet.isStudent(user)) {
				//the user is a student
				
				//get the period id from the request
				Long periodId = WISEWebSocketServlet.getPeriodId(request);
				
				//get the workgroup id
				Long workgroupId = WISEWebSocketServlet.getWorkgroupId(request);
				
				//get the user names in the workgroup
				String userName = WISEWebSocketServlet.getWorkgroupUserNames(workgroupId);
				
				//set the fields
				setRunId(runId);
				setPeriodId(periodId);
				setWorkgroupId(workgroupId);
				setFirstName(firstName);
				setLastName(lastName);
				setUserName(userName);
				setTeacher(false);
			} else {
				
			}
		}

		/**
		 * Called when the web socket connection has opened
		 */
        @Override
        protected void onOpen(WsOutbound outbound) {
        	/*
        	 * add this connection to our list of connections so we can access
        	 * it in the future
        	 */
        	addConnection(this);
        	
        	try {
        		/*
        		 * create the message JSON to notify other signed in users that
        		 * this user has connected
        		 */
        		JSONObject messageJSON = new JSONObject();
        		
        		if(isTeacher()) {
        			//the user is a teacher
        			messageJSON.put("messageType", "teacherConnected");
        		} else {
        			//the user is a student
        			messageJSON.put("messageType", "studentConnected");
        			
        			//add the period id and workgroup id
        			messageJSON.put("periodId", getPeriodId());
        			messageJSON.put("workgroupId", getWorkgroupId());
        		}
        		
        		//add the user name and run id
        		messageJSON.put("userName", getUserName());
        		messageJSON.put("runId", getRunId());
				
        		//get the message as a string
	        	String message = messageJSON.toString();
	        	
	        	//get the run id
	        	Long runId = getRunId();
	        	
	        	//get all the teachers that are currently connected for this run
	        	Set<WISEMessageInbound> teacherConnectionsForRun = getTeacherConnectionsForRun(runId);
	        	
	        	//send the message to all the teacher currently connected for this run
	        	sendMessageToConnections(message, teacherConnectionsForRun);
	        	
	        	if(isTeacher()) {
	        		/*
	        		 * the user that has just connected is a teacher so we will send
	        		 * them a list of students that are also currently connected 
	        		 */
	        		
	        		//get all the students that are currently connected for this run
		        	Set<WISEMessageInbound> studentConnectionsForRun = getStudentConnectionsForRun(runId);
		        	
		        	//create the message that will contain the list of connected students
		        	JSONObject studentsConnectedMessage = new JSONObject();
		        	
		        	//set the message type
		        	studentsConnectedMessage.put("messageType", "studentsOnlineList");
		        	
		        	/*
		        	 * the array that will contain the workgroup ids of the students
		        	 * that are currently connected for this run
		        	 */
		        	JSONArray studentsOnlineList = new JSONArray();
		        	
		        	Iterator<WISEMessageInbound> studentConnectionIterator = studentConnectionsForRun.iterator();
		        	
		        	//loop through all the students that are currently connected for this run
		        	while(studentConnectionIterator.hasNext()) {
		        		//get a student connection
		        		WISEMessageInbound studentConnection = studentConnectionIterator.next();
		        		
		        		//get the workgroup id
		        		Long studentConnectionWorkgroupId = studentConnection.getWorkgroupId();
		        		
		        		//add the workgroup id to the array
		        		studentsOnlineList.put(studentConnectionWorkgroupId);
		        	}
		        	
		        	//add the array of connected students to the message
		        	studentsConnectedMessage.put("studentsOnlineList", studentsOnlineList);
		        	
		        	//send the message that contains the list of connected students for the run
		        	sendMessage(studentsConnectedMessage.toString());
	        	}
			} catch (JSONException e) {
				e.printStackTrace();
			}
        }

        /**
         * Called when the web socket connection has closed
         */
        @Override
        protected void onClose(int status) {
        	//remove this connection from our list of connections
        	removeConnection(this);
        	
        	try {
        		/*
        		 * create the message JSON to notify signed in users that
        		 * this user has disconnected
        		 */
        		JSONObject messageJSON = new JSONObject();
        		
        		if(isTeacher()) {
        			//the user is a teacher
        			messageJSON.put("messageType", "teacherDisconnected");
        		} else {
        			//the user is a student
        			messageJSON.put("messageType", "studentDisconnected");
        			
        			//add the period id and workgroup id
        			messageJSON.put("periodId", getPeriodId());
        			messageJSON.put("workgroupId", getWorkgroupId());
        		}
        		
        		//add the user name and run id
        		messageJSON.put("userName", getUserName());
        		messageJSON.put("runId", getRunId());
				
        		//get the message as a string
	        	String message = messageJSON.toString();
	        	
	        	//get the run id
	        	Long runId = getRunId();
	        	
	        	//get all the teachers that are currently connected for this run
	        	Set<WISEMessageInbound> teacherConnectionsForRun = getTeacherConnectionsForRun(runId);
	        	
	        	//send the message to all the teacher currently connected for this run
	        	sendMessageToConnections(message, teacherConnectionsForRun);
			} catch (JSONException e) {
				e.printStackTrace();
			}
        }

        /**
         * Called when the web socket connection receives a binary message.
         * We do not support binary messages.
         * @param message the binary message
         */
        @Override
        protected void onBinaryMessage(ByteBuffer message) throws IOException {
            throw new UnsupportedOperationException("Binary message not supported.");
        }

        /**
         * Called when the user sends a message to the server. We will read
         * the message and determine who we need to forward the message to.
         * @param message the text message
         */
        @Override
        protected void onTextMessage(CharBuffer message) throws IOException {
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
						sendStudentToTeachersMessage(messageJSON);
					} else if(messageParticipants.equals("studentToGroup")) {
						//TODO
					} else if(messageParticipants.equals("teacherToStudent")) {
						//TODO
					} else if(messageParticipants.equals("teacherToGroup")) {
						//TODO
					} else if(messageParticipants.equals("teacherToStudentsInPeriod")) {
						//the teacher is sending a message to the students in a period
						sendTeacherToStudentsInPeriodMessage(messageJSON);
					} else if(messageParticipants.equals("teacherToStudentsInRun")) {
						//the teacher is sending a message to the students in a run
						sendTeacherToStudentsInRunMessage(messageJSON);
					} else {
						//TODO
					}
				}
			} catch (JSONException e) {
				e.printStackTrace();
			}
        }
        
        /**
         * Handle the message that a student is sending to the teachers
         * @param messageJSON the message to send
         */
        private void sendStudentToTeachersMessage(JSONObject messageJSON) {
        	try {
        		//add the run id, period id, and workgroup id of the student into the message
        		Long runId = getRunId();
				messageJSON.put("runId", runId);
				messageJSON.put("periodId", getPeriodId());
				messageJSON.put("workgroupId", getWorkgroupId());
				
				//get the message as a string 
				String message = messageJSON.toString();
				
				//get all the currently connected teachers for the run
				Set<WISEMessageInbound> teacherConnectionsForRun = getTeacherConnectionsForRun(runId);
				
				//send the message to all the currently connected teachers for the run
				sendMessageToConnections(message, teacherConnectionsForRun);
			} catch (JSONException e) {
				e.printStackTrace();
			}
			
        }

        /**
         * Handle the message that a teacher is sending to the students of a run
         * @param messageJSON the message to send
         */
        private void sendTeacherToStudentsInRunMessage(JSONObject messageJSON) {
        	try {
        		//add the run id into the message
	        	Long runId = getRunId();
	        	messageJSON.put("runId", getRunId());
	        	
	        	//get the message as a string
	        	String message = messageJSON.toString();
	        	
	        	//get all the currently connected students for the run
	        	Set<WISEMessageInbound> studentConnectionsForRun = getStudentConnectionsForRun(runId);
	        	
	        	//get all the currently connected teachers for the run
	        	Set<WISEMessageInbound> teacherConnectionsForRun = getTeacherConnectionsForRun(runId);
	        	
	        	//create a set to combine all the connections
	        	Set<WISEMessageInbound> connections = new CopyOnWriteArraySet<WISEMessageInbound>();
	        	
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
         * @param messageJSON the message to send
         */
        private void sendTeacherToStudentsInPeriodMessage(JSONObject messageJSON) {
        	try {
        		//add the run id into the message
	        	Long runId = getRunId();
	        	messageJSON.put("runId", getRunId());
	        	
	        	if(messageJSON.has("periodId")) {
		        	//get the period id
		        	Long periodId = messageJSON.getLong("periodId");
		        	
		        	//get the message as a string
		        	String message = messageJSON.toString();
		        	
		        	//get all the currently connected students for the period
		        	Set<WISEMessageInbound> studentConnectionsForRun = getStudentConnectionsForPeriod(runId, periodId);
		        	
		        	//get all the currently connected teachers for the run
		        	Set<WISEMessageInbound> teacherConnectionsForRun = getTeacherConnectionsForRun(runId);
		        	
		        	//create a set to combine all the connections
		        	Set<WISEMessageInbound> connections = new CopyOnWriteArraySet<WISEMessageInbound>();
		        	
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
         * Send the message to the connections
         * @param message the message to send
         * @param connections the connections to send the message to
         */
        private void sendMessageToConnections(String message, Set<WISEMessageInbound> connections) {
        	//loop through all the connections
            for (WISEMessageInbound connection : connections) {
                try {
                	//send the message to the connection
                    CharBuffer buffer = CharBuffer.wrap(message);
                    connection.getWsOutbound().writeTextMessage(buffer);
                } catch (IOException ignore) {
                    //ignore
                }
            }
        }
        
        /**
         * Send the message to this connection
         * @param message the message to send
         */
        private void sendMessage(String message) {
        	try {
        		//send the message to this connection
        		CharBuffer buffer = CharBuffer.wrap(message);
        		getWsOutbound().writeTextMessage(buffer);
            } catch (IOException ignore) {
                //ignore
            }
        }
    }
}