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
package org.wise.portal.service.websocket;

import java.io.IOException;
import java.net.URI;
import java.sql.Timestamp;
import java.util.*;
import java.util.concurrent.CopyOnWriteArraySet;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.listeners.WISESessionListener;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.vle.VLEService;
import org.wise.portal.service.workgroup.WorkgroupService;
import org.wise.vle.domain.status.StudentStatus;

import javax.servlet.ServletContext;

/**
 * @author Geoffrey Kwan
 */
public class WISETextWebSocketHandler extends TextWebSocketHandler implements WISEWebSocketHandler {

  @Autowired
  private RunService runService;

  @Autowired
  private WorkgroupService workgroupService;

  @Autowired
  private VLEService vleService;

  @Autowired
  private UserService userService;

  @Autowired
  ServletContext servletContext;

  // stores run id to set of student connections
  private static Hashtable<Long, Set<WISEWebSocketSession>> runToStudentConnections = new Hashtable<Long,Set<WISEWebSocketSession>>();

  // stores run id to set of teacher connections
  private static Hashtable<Long, Set<WISEWebSocketSession>> runToTeacherConnections = new Hashtable<Long,Set<WISEWebSocketSession>>();

  // stores project id to set of author (teacher) connections
  private static Hashtable<Long, Set<WISEWebSocketSession>> projectToAuthorConnections = new Hashtable<Long,Set<WISEWebSocketSession>>();

  // stores mappings between WebSocketSession objects and WISEWebSocketSession objects
  private static Hashtable<WebSocketSession, WISEWebSocketSession> sessionToWISEWebSocketSession = new Hashtable<WebSocketSession, WISEWebSocketSession>();

  // stores mappings between User objects and WISEWebSocketSession objects
  private static Hashtable<User, WISEWebSocketSession> userToWISEWebSocketSession = new Hashtable<User, WISEWebSocketSession>();

  /**
   * Called when a connection is opened
   * @param session the websocket session
   */
  @Override
  @Transactional
  public void afterConnectionEstablished(WebSocketSession session) throws Exception {
    onOpen(session);
  }

  /**
   * Called when a text message is received
   * @param session the websocket session
   * @param message the text message object
   */
  @Override
  @Transactional
  public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
    Object payload = message.getPayload();
    handleMessage(session, payload.toString());
  }

  /**
   * Called when a connection is closed
   * @param session the websocket session
   * @param status the session status
   */
  @Override
  public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
    onClose(session);
  }

  /**
   * Called when a websocket connection is opened
   * @param session the websocket session object
   * @throws IOException
   */
  public void onOpen(WebSocketSession session) throws IOException {
    Map<String, Object> attributes = session.getAttributes();
    Object signedInUserObject = attributes.get("signedInUser");
    User signedInUser = null;
    if (signedInUserObject != null) {
      try {
        User signedInUserFromAttributes = (User) signedInUserObject;
        Long signedInUserId = signedInUserFromAttributes.getId();
        signedInUser = userService.retrieveById(signedInUserId);
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
        return;
      }
    }

    if (validateUser(signedInUser, session)) {
      WISEWebSocketSession wiseWebSocketSession = new WISEWebSocketSession(session, signedInUser);
      addSession(wiseWebSocketSession);
      handleUserConnecting(wiseWebSocketSession);
    }
  }

  private JSONObject createStudentsOnlineMessage(WISEWebSocketSession wiseWebSocketSession) {
    try {
      Long runId = wiseWebSocketSession.getRunId();
      JSONObject studentsConnectedMessage = new JSONObject();
      studentsConnectedMessage.put("messageType", "studentsOnlineList");

      // add the array of connected students to the message
      // get all the students that are currently connected for this run
      Set<WISEWebSocketSession> studentConnectionsForRun = getStudentConnectionsForRun(runId);
      JSONArray studentsOnlineList = new JSONArray();
      for (WISEWebSocketSession studentConnection : studentConnectionsForRun) {
        Long studentConnectionWorkgroupId = studentConnection.getWorkgroupId();
        studentsOnlineList.put(studentConnectionWorkgroupId);
      }
      studentsConnectedMessage.put("studentsOnlineList", studentsOnlineList);
      return studentsConnectedMessage;
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return null;
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
      if (wiseWebSocketSession.isTeacher()) {
        messageJSON.put("messageType", "teacherConnected");
      } else {
        Long periodId = wiseWebSocketSession.getPeriodId();
        Long workgroupId = wiseWebSocketSession.getWorkgroupId();
        messageJSON.put("messageType", "studentConnected");
        messageJSON.put("periodId", periodId);
        messageJSON.put("workgroupId", workgroupId);
      }

      String userName = wiseWebSocketSession.getUserName();
      Long runId = wiseWebSocketSession.getRunId();
      WebSocketSession session = wiseWebSocketSession.getSession();
      messageJSON.put("userName", userName);
      messageJSON.put("runId", runId);
      String message = messageJSON.toString();
      if (runId != null) {
        Set<WISEWebSocketSession> teacherConnectionsForRun = getTeacherConnectionsForRun(runId);
        sendMessageToConnections(message, teacherConnectionsForRun);
        JSONObject studentsOnlineMessage = createStudentsOnlineMessage(wiseWebSocketSession);
        sendMessageToConnections(studentsOnlineMessage.toString(), teacherConnectionsForRun);

        if (wiseWebSocketSession.isStudent()) {
          JSONObject teachersConnectedMessage = new JSONObject();
          teachersConnectedMessage.put("messageType", "teachersOnlineList");
          JSONArray teachersOnlineList = new JSONArray();
          for (WISEWebSocketSession teacherConnection : teacherConnectionsForRun) {
            Long teacherConnectionWorkgroupId = teacherConnection.getWorkgroupId();
            teachersOnlineList.put(teacherConnectionWorkgroupId);
          }
          teachersConnectedMessage.put("teachersOnlineList", teachersOnlineList);
          sendMessage(session, teachersConnectedMessage.toString());
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  /**
   * Called when a websocket connection is closed
   * @param session the websocket session that has closed
   * @throws IOException
   */
  public void onClose(WebSocketSession session) throws IOException {
    WISEWebSocketSession wiseWebSocketSession = sessionToWISEWebSocketSession.get(session);
    removeSession(wiseWebSocketSession);
    handleUserDisconnecting(wiseWebSocketSession);
  }

  /**
   * Handle when a user disconnects
   * @param wiseWebSocketSession a WISEWebSocketSession object which contains user
   * related values such as user name, workgroup id, session, etc.
   */
  private void handleUserDisconnecting(WISEWebSocketSession wiseWebSocketSession) {
    try {
      JSONObject messageJSON = new JSONObject();
      if (wiseWebSocketSession.isTeacher()) {
        messageJSON.put("messageType", "teacherDisconnected");
      } else {
        Long periodId = wiseWebSocketSession.getPeriodId();
        Long workgroupId = wiseWebSocketSession.getWorkgroupId();
        messageJSON.put("messageType", "studentDisconnected");
        messageJSON.put("periodId", periodId);
        messageJSON.put("workgroupId", workgroupId);
      }

      String userName = wiseWebSocketSession.getUserName();
      Long runId = wiseWebSocketSession.getRunId();
      if (runId != null) {
        messageJSON.put("userName", userName);
        messageJSON.put("runId", runId);
        String message = messageJSON.toString();
        Set<WISEWebSocketSession> teacherConnectionsForRun = getTeacherConnectionsForRun(runId);
        sendMessageToConnections(message, teacherConnectionsForRun);
        JSONObject studentsOnlineMessage = createStudentsOnlineMessage(wiseWebSocketSession);
        sendMessageToConnections(studentsOnlineMessage.toString(), teacherConnectionsForRun);
      }
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
    Long runId = wiseWebSocketSession.getRunId();
    if (runId != null) {
      Set<WISEWebSocketSession> connectionsForRun;
      if (wiseWebSocketSession.isTeacher()) {
        connectionsForRun = runToTeacherConnections.get(runId);
        if (connectionsForRun == null) {
          connectionsForRun = new CopyOnWriteArraySet<WISEWebSocketSession>();
          runToTeacherConnections.put(runId, connectionsForRun);
        }
      } else {
        connectionsForRun = runToStudentConnections.get(runId);
        if (connectionsForRun == null) {
          connectionsForRun = new CopyOnWriteArraySet<WISEWebSocketSession>();
          runToStudentConnections.put(runId, connectionsForRun);
        }
      }

      if (connectionsForRun != null) {
        connectionsForRun.add(wiseWebSocketSession);
        WebSocketSession session = wiseWebSocketSession.getSession();
        sessionToWISEWebSocketSession.put(session, wiseWebSocketSession);
        User user = wiseWebSocketSession.getUser();
        userToWISEWebSocketSession.put(user, wiseWebSocketSession);
      }
    }

    Long projectId = wiseWebSocketSession.getProjectId();
    if (projectId != null) {
      Set<WISEWebSocketSession> connectionsForProject = null;
      if (wiseWebSocketSession.isTeacher()) {
        connectionsForProject = projectToAuthorConnections.get(projectId);
        if (connectionsForProject == null) {
          connectionsForProject = new CopyOnWriteArraySet<WISEWebSocketSession>();
          projectToAuthorConnections.put(projectId, connectionsForProject);
        }
      }

      if (connectionsForProject != null) {
        connectionsForProject.add(wiseWebSocketSession);
        WebSocketSession session = wiseWebSocketSession.getSession();
        sessionToWISEWebSocketSession.put(session, wiseWebSocketSession);
        User user = wiseWebSocketSession.getUser();
        userToWISEWebSocketSession.put(user, wiseWebSocketSession);
      }
    }

    if (projectId == null && runId == null) {
      // user just opened the WISE5 AT, with no project selected.
      WebSocketSession session = wiseWebSocketSession.getSession();
      sessionToWISEWebSocketSession.put(session, wiseWebSocketSession);
      User user = wiseWebSocketSession.getUser();
      userToWISEWebSocketSession.put(user, wiseWebSocketSession);
    }
  }

  /**
   * Remove the WISEWebSocketSession from our collections of sessions
   * @param wiseWebSocketSession the WISEWebSocketSession to remove from our collections
   */
  private void removeSession(WISEWebSocketSession wiseWebSocketSession) {
    removeWebSocketSessionFromRunConnections(wiseWebSocketSession);
    removeWebSocketSessionfromSessions(wiseWebSocketSession);
    removeWebSocketSessionFromUsers(wiseWebSocketSession);
  }

  private void removeWebSocketSessionFromUsers(WISEWebSocketSession wiseWebSocketSession) {
    User user = wiseWebSocketSession.getUser();
    userToWISEWebSocketSession.remove(user);
  }

  private void removeWebSocketSessionfromSessions(WISEWebSocketSession wiseWebSocketSession) {
    WebSocketSession session = wiseWebSocketSession.getSession();
    sessionToWISEWebSocketSession.remove(session);
  }

  private void removeWebSocketSessionFromRunConnections(WISEWebSocketSession wiseWebSocketSession) {
    WebSocketSession session = wiseWebSocketSession.getSession();
    Long runId = getValueFromSession(session, "runId");
    if (runId != null) {
      if (wiseWebSocketSession.isTeacher()) {
        Set<WISEWebSocketSession> teacherConnectionsForRun = runToTeacherConnections.get(runId);
        if (teacherConnectionsForRun != null) {
          teacherConnectionsForRun.remove(wiseWebSocketSession);
        }
      } else {
        Set<WISEWebSocketSession> studentConnectionsForRun = runToStudentConnections.get(runId);
        if (studentConnectionsForRun != null) {
          studentConnectionsForRun.remove(wiseWebSocketSession);
        }
      }
    }
  }

  /**
   * Get the student connections for a run
   * @param runId the run id
   * @return a set of student connections for the run
   */
  private Set<WISEWebSocketSession> getStudentConnectionsForRun(Long runId) {
    Set<WISEWebSocketSession> studentConnectionsForRun = runToStudentConnections.get(runId);
    if (studentConnectionsForRun == null) {
      studentConnectionsForRun = new CopyOnWriteArraySet<WISEWebSocketSession>();
      runToStudentConnections.put(runId, studentConnectionsForRun);
    }
    return studentConnectionsForRun;
  }

  /**
   * Get the specific student connection for a run
   * @param runId the run id
   * @param workgroupId the workgroup id
   * @return a set of student connections for the run
   */
  private WISEWebSocketSession getStudentConnection(Long runId, Long workgroupId) {
    Set<WISEWebSocketSession> studentConnectionsForRun = runToStudentConnections.get(runId);
    WISEWebSocketSession studentConnectionResult = null;
    if (studentConnectionsForRun == null) {
      studentConnectionsForRun = new CopyOnWriteArraySet<WISEWebSocketSession>();
      runToStudentConnections.put(runId, studentConnectionsForRun);
    }
    for (WISEWebSocketSession studentConnection : studentConnectionsForRun) {
      Long studentConnectionWorkgroupId = studentConnection.getWorkgroupId();
      if (workgroupId.equals(studentConnectionWorkgroupId)) {
        studentConnectionResult = studentConnection;
        break;
      }
    }
    return studentConnectionResult;
  }

  /**
   * Get the student connections for a period
   * @param runId the run id
   * @param periodId the period id
   * @return a set of student connections for the period
   */
  private Set<WISEWebSocketSession> getStudentConnectionsForPeriod(Long runId, Long periodId) {
    Set<WISEWebSocketSession> studentConnectionsForRun = runToStudentConnections.get(runId);
    Set<WISEWebSocketSession> studentConnectionsForPeriod = new CopyOnWriteArraySet<WISEWebSocketSession>();
    if (studentConnectionsForRun == null) {
      studentConnectionsForRun = new CopyOnWriteArraySet<WISEWebSocketSession>();
      runToStudentConnections.put(runId, studentConnectionsForRun);
    }
    for (WISEWebSocketSession studentConnection : studentConnectionsForRun) {
      Long studentConnectionPeriodId = studentConnection.getPeriodId();
      if (periodId.equals(studentConnectionPeriodId)) {
        studentConnectionsForPeriod.add(studentConnection);
      }
    }
    return studentConnectionsForPeriod;
  }

  /**
   * Returns a set of users who are currently authoring the project
   * @param projectId
   * @return
   */
  private Set<User> getCurrentAuthors(String projectId) {
    Set<User> currentAuthors = new HashSet<User>();
    HashMap<String, ArrayList<String>> openedProjectsToSessions =
        (HashMap<String, ArrayList<String>>)
        servletContext.getAttribute("openedProjectsToSessions");

    if (openedProjectsToSessions == null) {
      openedProjectsToSessions = new HashMap<String, ArrayList<String>>();
      servletContext.setAttribute("openedProjectsToSessions", openedProjectsToSessions);
    }

    ArrayList<String> sessions = openedProjectsToSessions.get(projectId);
    if (sessions != null) {
      HashMap<String, User> allLoggedInUsers = (HashMap<String, User>) servletContext
        .getAttribute(WISESessionListener.ALL_LOGGED_IN_USERS);
      if (allLoggedInUsers != null) {
        for (String sessionId : sessions) {
          User user = allLoggedInUsers.get(sessionId);
          currentAuthors.add(user);
        }
      }
    }
    return currentAuthors;
  }

  /**
   * Get the sessions of authors who are currently authoring the project
   * @param projectId the projectId
   * @return a set of teacher connections
   */
  private Set<WISEWebSocketSession> getAuthorConnectionsForProject(String projectId) {
    Set<WISEWebSocketSession> authorConnectionsForProject = new CopyOnWriteArraySet<WISEWebSocketSession>();
    Set<User> currentAuthors = getCurrentAuthors(projectId);
    for (User user : currentAuthors) {
      WISEWebSocketSession wiseWebSocketSession = userToWISEWebSocketSession.get(user);
      authorConnectionsForProject.add(wiseWebSocketSession);
    }
    return authorConnectionsForProject;
  }

  /**
   * Get the teacher connections for a run
   * @param runId the run id
   * @return a set of teacher connections
   */
  private Set<WISEWebSocketSession> getTeacherConnectionsForRun(Long runId) {
    Set<WISEWebSocketSession> teacherConnectionsForRun = runToTeacherConnections.get(runId);
    if (teacherConnectionsForRun == null) {
      teacherConnectionsForRun = new CopyOnWriteArraySet<WISEWebSocketSession>();
      runToTeacherConnections.put(runId, teacherConnectionsForRun);
    }
    return teacherConnectionsForRun;
  }

  /**
   * Get a value from the session
   * @param session the websocket session
   * @param key the key for the value we want
   * e.g. runId
   * @return the value from the key
   * e.g. 1
   */
  private Long getValueFromSession(WebSocketSession session, String key) {
    Long value = null;
    if (session != null && key != null) {
      URI uri = session.getUri();
      value = getLongValueFromURI(uri, key);
    }
    return value;
  }

  /**
   * Get the long value of a key from the URI for
   * @param uri the uri path
   * e.g. /wise/websocket?runId=1&periodId=1&workgroupId=2
   * @param key the key
   * e.g. runId
   * @return the value associated with the key
   * e.g. 1
   */
  private Long getLongValueFromURI(URI uri, String key) {
    Long value = null;
    if (uri != null) {
      //get the query e.g. runId=1&periodId=1&workgroupId=2
      String query = uri.getQuery();

      /*
       * split the query by '&' so that we obtain something like
       * [
       * "runId=1",
       * "periodId=1",
       * "workgroupId=2",
       * ]
       */
      if (query != null) {
        String[] querySplit = query.split("&");
        for (String parameter : querySplit) {
          if (parameter != null) {
            /*
             * split the string by '=' so we obtain something like
             * [
             * "runId",
             * "1"
             * ]
             */
            String[] parameterSplit = parameter.split("=");
            if (parameterSplit != null && parameterSplit.length >= 2) {
              //get the individual elements which will be the key and value
              String parameterName = parameterSplit[0];
              String parameterValue = parameterSplit[1];

              //check if the key matches the one we want
              if (key.equals(parameterName)) {
                try {
                  value = Long.parseLong(parameterValue);
                } catch (NumberFormatException e) {

                }
              }
            }
          }
        }
      }
    }
    return value;
  }

  /**
   * Handle the message sent by the user. This function can be called from anywhere as
   * long as a handle to this WISETextWebSocketHandler bean is obtained.
   * @param user the signed in user
   * @param message the message to send
   */
  public void handleMessage(User user, String message) {
    WISEWebSocketSession wiseWebSocketSession = userToWISEWebSocketSession.get(user);
    if (wiseWebSocketSession != null) {
      WebSocketSession session = wiseWebSocketSession.getSession();
      if (session != null) {
        handleMessage(session, message);
      }
    }
  }

  /**
   * A user has sent a websocket message so we will perform any necessary
   * processing and send out a websocket message to other users if necessary
   * @param session the websocket session
   * @param message the text message the user has sent
   */
  public void handleMessage(WebSocketSession session, String message) {
    String messageString = message.toString();
    try {
      if (!messageString.isEmpty()) {
        JSONObject messageJSON = new JSONObject(messageString);
        if (messageJSON.has("messageParticipants")) {
          /*
           * get the message participants which will tell us who is sending
           * the message and who should receive the message
           */
          String messageParticipants = messageJSON.getString("messageParticipants");
          if (messageParticipants == null) {

          } else if (messageParticipants.equals("studentToStudent")) {
            //TODO
          } else if (messageParticipants.equals("studentToTeachers")) {
            sendStudentToTeachersMessage(session, messageJSON);
          } else if (messageParticipants.equals("studentToGroup")) {
            //TODO
          } else if (messageParticipants.equals("teacherToStudent")) {
            sendTeacherToStudentMessage(session, messageJSON);
          } else if (messageParticipants.equals("teacherToGroup")) {
            //TODO
          } else if (messageParticipants.equals("teacherToStudentsInPeriod")) {
            sendTeacherToStudentsInPeriodMessage(session, messageJSON);
          } else if (messageParticipants.equals("teacherToStudentsInRun")) {
            sendTeacherToStudentsInRunMessage(session, messageJSON);
          } else if (messageParticipants.equals("studentToClassmatesInPeriod")) {
            sendStudentToClassmatesInPeriodMessage(session, messageJSON);
          } else if (messageParticipants.equals("authorToAuthors")) {
            sendAuthorToAuthorsMessage(session, messageJSON);
          } else {
            //TODO
          }
        }

        if (messageJSON.has("messageType")) {
          String messageType = messageJSON.optString("messageType");
          if (messageType != null && messageType.equals("studentStatus")) {
            saveStudentStatusToDatabase(session, messageJSON);
          }
        }
      } else {
        // TODO: is this necessary, or can we just pass in a JSONObject to this method?
        outputSessionInformation(session, messageString);
      }
    } catch (JSONException e) {
      e.printStackTrace();
      outputSessionInformation(session, messageString);
    }
  }

  /**
   * Output the session information to System.out so we can try to figure out why
   * the message was empty
   *
   * @param session the web socket session object
   * @param message the web socket message string
   */
  private void outputSessionInformation(WebSocketSession session, String message) {
    String userName = null;
    String firstName = null;
    String lastName = null;
    Integer textMessageSizeLimit = null;
    URI uri = null;
    if (session != null) {
      Map<String, Object> sessionAttributes = session.getAttributes();
      if (sessionAttributes != null) {
        Object signedInUserObject = sessionAttributes.get("signedInUser");
        if (signedInUserObject != null && signedInUserObject instanceof UserImpl) {
          MutableUserDetails userDetails = ((UserImpl) signedInUserObject).getUserDetails();
          if (userDetails != null) {
            userName = userDetails.getUsername();
            firstName = userDetails.getFirstname();
            lastName = userDetails.getLastname();
          }
        }
      }
      textMessageSizeLimit = session.getTextMessageSizeLimit();
      uri = session.getUri();
    }
    System.out.println("Error: a web socket error occurred");
    System.out.println("message=" + message);
    System.out.println("userName=" + userName);
    System.out.println("firstName=" + firstName);
    System.out.println("lastName=" + lastName);
    System.out.println("textMessageSizeLimit=" + textMessageSizeLimit);
    System.out.println("uri=" + uri);
  }

  /**
   * An object that contains a session object as well as other user related
   * variables
   */
  private final class WISEWebSocketSession {
    WebSocketSession session;
    private User user = null;
    private String userName = null;
    private String firstName = null;
    private String lastName = null;
    private Long runId = null;
    private Long projectId = null;
    private Long periodId = null;
    private Long workgroupId = null;
    private boolean isTeacher = false;

    /**
     * The contstructor for WISEWebSocketSession
     * @param session a websocket session object
     * @param signedInUser the signed in user object
     */
    public WISEWebSocketSession(WebSocketSession session, User signedInUser) {
      Long workgroupId = getValueFromSession(session, "workgroupId");
      Long runId = getValueFromSession(session, "runId");
      Long projectId = getValueFromSession(session, "projectId");
      setUser(signedInUser);
      String userName = null;
      setRunId(runId);
      setProjectId(projectId);
      setWorkgroupId(workgroupId);
      String firstName = getFirstName(user);
      String lastName = getLastName(user);
      setFirstName(firstName);
      setLastName(lastName);
      if (signedInUser.isTeacher()) {
        userName = getUserName(user);
        setTeacher(true);
      } else if (signedInUser.isStudent()) {
        userName = getWorkgroupUserNames(workgroupId);
        setTeacher(false);
        Long periodId = getValueFromSession(session, "periodId");
        setPeriodId(periodId);
      }
      setUserName(userName);
      setSession(session);
    }

    public String getFirstName(User user) {
      MutableUserDetails userDetails = user.getUserDetails();
      return userDetails.getFirstname();
    }

    public String getLastName(User user) {
      MutableUserDetails userDetails = user.getUserDetails();
      return userDetails.getLastname();
    }

    public String getUserName(User user) {
      MutableUserDetails userDetails = user.getUserDetails();
      return userDetails.getUsername();
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
      StringBuffer workgroupUserNames = new StringBuffer();
      try {
        Workgroup workgroup = workgroupService.retrieveById(workgroupId);
        for (User user : workgroup.getMembers()) {
          String firstName = getFirstName(user);
          String lastName = getLastName(user);
          String userName = getUserName(user);
          //separate members in the workgroup with a ,
          if (workgroupUserNames.length() != 0) {
            workgroupUserNames.append(", ");
          }
          workgroupUserNames.append(firstName);
          workgroupUserNames.append(" ");
          workgroupUserNames.append(lastName);
          workgroupUserNames.append("(");
          workgroupUserNames.append(userName);
          workgroupUserNames.append(")");
        }
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
      return workgroupUserNames.toString();
    }

    public WebSocketSession getSession() {
      return session;
    }

    public void setSession(WebSocketSession session) {
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

    private Long getProjectId() {
      return projectId;
    }

    private void setProjectId(Long projectId) {
      this.projectId = projectId;
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

    private boolean isStudent() {
      return !isTeacher;
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
  private boolean validateUser(User user, WebSocketSession session) {
    boolean validated = false;
    Long runId = getValueFromSession(session, "runId");
    if (user.isTeacher() && runId != null) {
      validated = validateTeacher(user, runId);
    } else if (user.isStudent()) {
      Long periodId = getValueFromSession(session, "periodId");
      Long workgroupId = getValueFromSession(session, "workgroupId");
      validated = validateStudent(user, runId, periodId, workgroupId);
    } else {
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
    if (user != null && runId != null && periodId != null && workgroupId != null) {
      try {
        Run run = runService.retrieveById(runId, true);
        if (run.isStudentAssociatedToThisRun(user)) {
          Workgroup workgroup = workgroupService.retrieveById(workgroupId, true);
          if (workgroup.getMembers().contains(user)) {
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
    if (user != null && runId != null) {
      try {
        Run run = runService.retrieveById(runId);
        if (run != null) {
          User owner = run.getOwner();
          Set<User> sharedowners = run.getSharedowners();
          if (owner.equals(user) || sharedowners.contains(user) || user.isAdmin()) {
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
   * Save the student status to the database. This function will inject
   * the run id, period id, and workgroup id into the student status JSON.
   * @param session the websocket session
   * @param messageJSON the student status JSON
   */
  private void saveStudentStatusToDatabase(WebSocketSession session, JSONObject messageJSON) {
    WISEWebSocketSession wiseWebSocketSession = sessionToWISEWebSocketSession.get(session);
    Long runId = wiseWebSocketSession.getRunId();
    Long periodId = wiseWebSocketSession.getPeriodId();
    Long workgroupId = wiseWebSocketSession.getWorkgroupId();

    User signedInUser = wiseWebSocketSession.getUser();
    if (validateStudent(signedInUser, runId, periodId, workgroupId)) {
      try {
        messageJSON.put("runId", runId);
        messageJSON.put("periodId", periodId);
        messageJSON.put("workgroupId", workgroupId);
      } catch (JSONException e) {
        e.printStackTrace();
      }
      StudentStatus studentStatus = vleService.getStudentStatusByWorkgroupId(workgroupId);
      if (studentStatus == null) {
        studentStatus = new StudentStatus(runId, periodId, workgroupId, messageJSON.toString());
      } else {
        Calendar now = Calendar.getInstance();
        studentStatus.setTimestamp(new Timestamp(now.getTimeInMillis()));
        studentStatus.setStatus(messageJSON.toString());
      }
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
  private void sendStudentToTeachersMessage(WebSocketSession session, JSONObject messageJSON) {
    try {
      WISEWebSocketSession wiseWebSocketSession = sessionToWISEWebSocketSession.get(session);
      Long runId = wiseWebSocketSession.getRunId();
      Long periodId = wiseWebSocketSession.getPeriodId();
      Long workgroupId = wiseWebSocketSession.getWorkgroupId();
      messageJSON.put("runId", runId);
      messageJSON.put("periodId", periodId);
      messageJSON.put("workgroupId", workgroupId);
      Calendar now = Calendar.getInstance();
      messageJSON.put("postTimestamp", now.getTimeInMillis());
      String message = messageJSON.toString();
      Set<WISEWebSocketSession> teacherConnectionsForRun = getTeacherConnectionsForRun(runId);
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
  private void sendTeacherToStudentsInRunMessage(WebSocketSession session, JSONObject messageJSON) {
    try {
      WISEWebSocketSession wiseWebSocketSession = sessionToWISEWebSocketSession.get(session);
      Long runId = wiseWebSocketSession.getRunId();
      messageJSON.put("runId", runId);
      String message = messageJSON.toString();
      Set<WISEWebSocketSession> studentConnectionsForRun = getStudentConnectionsForRun(runId);
      Set<WISEWebSocketSession> teacherConnectionsForRun = getTeacherConnectionsForRun(runId);
      Set<WISEWebSocketSession> connections = new CopyOnWriteArraySet<WISEWebSocketSession>();
      connections.addAll(studentConnectionsForRun);
      connections.addAll(teacherConnectionsForRun);
      sendMessageToConnections(message, connections);
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  /**
   * Handle the message that a teacher is sending to a student
   * @param session the websocket session
   * @param messageJSON the message to send
   */
  private void sendTeacherToStudentMessage(WebSocketSession session, JSONObject messageJSON) {
    try {
      WISEWebSocketSession wiseWebSocketSession = sessionToWISEWebSocketSession.get(session);
      Long runId = wiseWebSocketSession.getRunId();
      messageJSON.put("runId", runId);
      Long toWorkgroupId = messageJSON.getLong("toWorkgroupId");
      String message = messageJSON.toString();
      WISEWebSocketSession studentConnection = getStudentConnection(runId, toWorkgroupId);
      Set<WISEWebSocketSession> connections = new CopyOnWriteArraySet<WISEWebSocketSession>();
      connections.add(studentConnection);
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
  private void sendTeacherToStudentsInPeriodMessage(
      WebSocketSession session, JSONObject messageJSON) {
    try {
      WISEWebSocketSession wiseWebSocketSession = sessionToWISEWebSocketSession.get(session);
      Long runId = wiseWebSocketSession.getRunId();
      messageJSON.put("runId", runId);
      if (messageJSON.has("periodId")) {
        Long periodId = messageJSON.getLong("periodId");
        String message = messageJSON.toString();
        Set<WISEWebSocketSession> studentConnectionsForRun = getStudentConnectionsForPeriod(runId, periodId);
        Set<WISEWebSocketSession> teacherConnectionsForRun = getTeacherConnectionsForRun(runId);
        Set<WISEWebSocketSession> connections = new CopyOnWriteArraySet<WISEWebSocketSession>();
        connections.addAll(studentConnectionsForRun);
        connections.addAll(teacherConnectionsForRun);
        sendMessageToConnections(message, connections);
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  /**
   * Handle the message that a student is sending to their classmates in a period
   * @param session the websocket session object
   * @param messageJSON the message JSON object
   */
  private void sendStudentToClassmatesInPeriodMessage(WebSocketSession session,
      JSONObject messageJSON) {
    try {
      WISEWebSocketSession wiseWebSocketSession = sessionToWISEWebSocketSession.get(session);
      if (wiseWebSocketSession != null) {
        Long runId = wiseWebSocketSession.getRunId();
        Long periodId = wiseWebSocketSession.getPeriodId();
        messageJSON.put("runId", runId);
        String message = messageJSON.toString();
        Set<WISEWebSocketSession> studentConnectionsForRun =
            getStudentConnectionsForPeriod(runId, periodId);
        sendMessageToConnections(message, studentConnectionsForRun);
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  /**
   * Handle the message that an author is sending to other authors
   * @param session the websocket session object
   * @param messageJSON the message JSON object
   */
  private void sendAuthorToAuthorsMessage(WebSocketSession session, JSONObject messageJSON) {
    try {
      WISEWebSocketSession wiseWebSocketSession = sessionToWISEWebSocketSession.get(session);
      if (wiseWebSocketSession != null) {
        String messageType = messageJSON.getString("messageType");
        if ("currentAuthors".equals(messageType)) {
          String projectId = messageJSON.getString("projectId");
          Set<WISEWebSocketSession> authorConnections = getAuthorConnectionsForProject(projectId);
          Set<User> currentAuthors = getCurrentAuthors(projectId);
          JSONArray currentAuthorsUsernames = new JSONArray();
          for (User currentAuthor : currentAuthors) {
            currentAuthorsUsernames.put(currentAuthor.getUserDetails().getUsername());
          }
          messageJSON.put("currentAuthorsUsernames", currentAuthorsUsernames);
          String message = messageJSON.toString();
          sendMessageToConnections(message, authorConnections);
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
    for (WISEWebSocketSession connection : connections) {
      try {
        WebSocketSession session = connection.getSession();
        TextMessage textMessage = new TextMessage(message);
        session.sendMessage(textMessage);
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
  private void sendMessage(WebSocketSession session, String message) {
    if (session != null) {
      try {
        TextMessage textMessage = new TextMessage(message);
        session.sendMessage(textMessage);
      } catch (IOException ignore) {
        //ignore
      }
    }
  }
}
