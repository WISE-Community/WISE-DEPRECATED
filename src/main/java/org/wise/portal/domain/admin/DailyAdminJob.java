/**
 * Copyright (c) 2008-2019 Regents of the University of California (Regents).
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
package org.wise.portal.domain.admin;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.text.DateFormat;
import java.util.*;

import javax.mail.MessagingException;

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.run.RunDao;
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
import org.wise.portal.service.user.UserService;
import org.wise.vle.domain.statistics.VLEStatistics;

/**
 * Jobs to be run daily such as creating and sending usage reports
 * 
 * @author Geoffrey Kwan
 */
@Component
public class DailyAdminJob {

  @Autowired
  private UserService userService;

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
  private Properties appProperties;

  @Autowired
  private PortalService portalService;

  @Autowired
  private PortalStatisticsService portalStatisticsService;

  private static final String WISE_HUB_URL = "http://wise5.org/postWISEStatistics.php";

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
  @Scheduled(cron = "0 0 0 * * ?")
  public void doJob() {
    // query for the portal statistics and save a new row in the portalStatistics table
    gatherPortalStatistics();

    // query the vle tables and save a new row in the vleStatistics table
    gatherVLEStatistics();

    // create and send a message to uber_admin
    String messageBody = getSummaryMessage();
    sendEmail(messageBody);

    // post statistics to hub if allowed
    try {
      Portal portal = portalService.getById(1);
      if (portal.isSendStatisticsToHub()) {
        try {
          JSONObject wiseStatisticsJSONObject = new JSONObject();
          wiseStatisticsJSONObject.put("wiseName", appProperties.getProperty("wise.name"));

          PortalStatistics latestPortalStatistics = portalStatisticsService
              .getLatestPortalStatistics();
          wiseStatisticsJSONObject.put("portal", latestPortalStatistics.getJSONObject());
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

    List<User> allStudents = userDao.retrieveAllStudents();
    long totalNumberStudents = allStudents.size();
    debugOutput("Number of students: " + totalNumberStudents);

    List<User> allTeachers = userDao.retrieveAllTeachers();
    long totalNumberTeachers = allTeachers.size();
    debugOutput("Number of teachers: " + totalNumberTeachers);

    long totalNumberStudentLogins = 0;
    for (int x = 0; x < allStudents.size(); x++) {
      User user = allStudents.get(x);
      MutableUserDetails userDetails = user.getUserDetails();
      totalNumberStudentLogins += ((StudentUserDetails) userDetails).getNumberOfLogins();
    }
    debugOutput("Number of student logins: " + totalNumberStudentLogins);

    long totalNumberTeacherLogins = 0;
    for (int x = 0; x < allTeachers.size(); x++) {
      User user = allTeachers.get(x);
      MutableUserDetails userDetails = user.getUserDetails();
      totalNumberTeacherLogins += ((TeacherUserDetails) userDetails).getNumberOfLogins();
    }
    debugOutput("Number of teacher logins: " + totalNumberTeacherLogins);

    List<Project> projectList = projectDao.getList();
    long totalNumberProjects = projectList.size();
    debugOutput("Number of projects: " + totalNumberProjects);

    List<Run> runList = runDao.getList();
    long totalNumberRuns = runList.size();
    debugOutput("Number of runs: " + totalNumberRuns);

    long totalNumberProjectsRun = 0;
    for (int x = 0; x < runList.size(); x++) {
      Run run = runList.get(x);
      Integer timesRun = run.getTimesRun();
      if (timesRun != null) {
        totalNumberProjectsRun += timesRun;
      }
    }
    debugOutput("Number of projects run: " + totalNumberProjectsRun);

    PortalStatisticsImpl newPortalStatistics = new PortalStatisticsImpl();
    newPortalStatistics.setTimestamp(new Date());
    newPortalStatistics.setTotalNumberStudents(totalNumberStudents);
    newPortalStatistics.setTotalNumberStudentLogins(totalNumberStudentLogins);
    newPortalStatistics.setTotalNumberTeachers(totalNumberTeachers);
    newPortalStatistics.setTotalNumberTeacherLogins(totalNumberTeacherLogins);
    newPortalStatistics.setTotalNumberProjects(totalNumberProjects);
    newPortalStatistics.setTotalNumberRuns(totalNumberRuns);
    newPortalStatistics.setTotalNumberProjectsRun(totalNumberProjectsRun);

    portalStatisticsDao.save(newPortalStatistics);
    debugOutput("gatherPortalStatistics end");
  }

  public void gatherVLEStatistics() {
    try {
      String username = appProperties.getProperty("spring.datasource.username");
      String password = appProperties.getProperty("spring.datasource.password");
      String url = appProperties.getProperty("spring.datasource.url");
      Class.forName("com.mysql.jdbc.Driver").newInstance();
      Connection conn = DriverManager.getConnection(url, username, password);
      Statement statement = conn.createStatement();
      JSONObject vleStatistics = new JSONObject();
      gatherStepWorkStatistics(statement, vleStatistics);
      gatherNodeStatistics(statement, vleStatistics);
      gatherAnnotationStatistics(statement, vleStatistics);
      gatherHintStatistics(statement, vleStatistics);
      Date date = new Date();
      Timestamp timestamp = new Timestamp(date.getTime());
      vleStatistics.put("timestamp", timestamp.getTime());
      VLEStatistics vleStatisticsObject = new VLEStatistics();
      vleStatisticsObject.setTimestamp(timestamp);
      vleStatisticsObject.setData(vleStatistics.toString());
      conn.close();
    } catch (Exception ex) {
      LoggerFactory.getLogger(getClass()).error(ex.getMessage());
    }
  }

  /**
   * Gather the StepWork statistics. This includes the total number of StepWork rows as well as how
   * many StepWork rows for each step type.
   * 
   * @param statement
   *                        the object to execute queries
   * @param vleStatistics
   *                        the JSONObject to store the statistics in
   */
  private void gatherStepWorkStatistics(Statement statement, JSONObject vleStatistics) {
    try {
      long stepWorkCount = 0;
      JSONArray stepWorkNodeTypeCounts = new JSONArray();

      /*
       * the query to get the total step work rows for each node type e.g.
       *
       * nodeType | count(*) ------------------------------ AssessmentListNode | 331053
       * BrainstormNode | 10936 CarGraphNode | 9 etc.
       *
       */
      ResultSet stepWorkNodeTypeCountQuery = statement.executeQuery(
          "select node.nodeType, count(*) from stepwork, node where stepwork.node_id=node.id group by nodeType");

      while (stepWorkNodeTypeCountQuery.next()) {
        String nodeType = stepWorkNodeTypeCountQuery.getString(1);
        long nodeTypeCount = stepWorkNodeTypeCountQuery.getLong(2);
        try {
          if (nodeType != null && !nodeType.toLowerCase().equals("null")) {
            JSONObject stepWorkNodeTypeObject = new JSONObject();
            stepWorkNodeTypeObject.put("nodeType", nodeType);
            stepWorkNodeTypeObject.put("count", nodeTypeCount);
            stepWorkNodeTypeCounts.put(stepWorkNodeTypeObject);
            stepWorkCount += nodeTypeCount;
          }
        } catch (JSONException e) {
          e.printStackTrace();
        }
      }

      vleStatistics.put("individualStepWorkNodeTypeCounts", stepWorkNodeTypeCounts);
      vleStatistics.put("totalStepWorkCount", stepWorkCount);
    } catch (SQLException e) {
      e.printStackTrace();
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  /**
   * Gather the Annotation statistics. This includes the total number of Annotation rows as well as
   * how many Annotation nodes for each annotation type.
   * 
   * @param statement
   *                        the object to execute queries
   * @param vleStatistics
   *                        the JSONObject to store the statistics in
   */
  private void gatherAnnotationStatistics(Statement statement, JSONObject vleStatistics) {
    try {
      ResultSet annotationCountQuery = statement.executeQuery("select count(*) from annotation");
      if (annotationCountQuery.first()) {
        long annotationCount = annotationCountQuery.getLong(1);
        try {
          vleStatistics.put("totalAnnotationCount", annotationCount);
        } catch (JSONException e) {
          e.printStackTrace();
        }
      }

      // this will hold all the annotation types e.g. "comment", "score", "flag"
      Vector<String> annotationTypes = new Vector<String>();

      ResultSet annotationTypeQuery = statement
          .executeQuery("select distinct type from annotation");

      while (annotationTypeQuery.next()) {
        String annotationType = annotationTypeQuery.getString(1);
        annotationTypes.add(annotationType);
      }

      JSONArray annotationCounts = new JSONArray();
      for (String annotationType : annotationTypes) {
        if (annotationType != null && !annotationType.equals("") && !annotationType.equals("null")
            && !annotationType.equals("NULL")) {
          ResultSet annotationTypeCountQuery = statement
              .executeQuery("select count(*) from annotation where type='" + annotationType + "'");

          if (annotationTypeCountQuery.first()) {
            long annotationTypeCount = annotationTypeCountQuery.getLong(1);

            try {
              JSONObject annotationObject = new JSONObject();
              annotationObject.put("annotationType", annotationType);
              annotationObject.put("count", annotationTypeCount);

              annotationCounts.put(annotationObject);
            } catch (JSONException e) {
              e.printStackTrace();
            }
          }
        }
      }
      vleStatistics.put("individualAnnotationCounts", annotationCounts);
    } catch (SQLException e) {
      e.printStackTrace();
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  /**
   * Get the node statistics. This includes the total number of step nodes as well as how many step
   * nodes for each node type.
   * 
   * @param statement
   *                        the object to execute queries
   * @param vleStatistics
   *                        the JSONObject to store the statistics in
   */
  private void gatherNodeStatistics(Statement statement, JSONObject vleStatistics) {
    try {
      long nodeCount = 0;
      JSONArray nodeTypeCounts = new JSONArray();

      /*
       * the query to get the total number of nodes for each node type e.g.
       *
       * nodeType | count(*) ------------------------------ AssessmentListNode | 3408 BrainstormNode
       * | 98 CarGraphNode | 9 etc.
       *
       */
      ResultSet nodeTypeCountQuery = statement
          .executeQuery("select nodeType, count(*) from node group by nodeType");

      while (nodeTypeCountQuery.next()) {
        String nodeType = nodeTypeCountQuery.getString(1);
        long nodeTypeCount = nodeTypeCountQuery.getLong(2);

        if (nodeType != null && !nodeType.toLowerCase().equals("null")) {
          try {
            JSONObject nodeTypeObject = new JSONObject();
            nodeTypeObject.put("nodeType", nodeType);
            nodeTypeObject.put("count", nodeTypeCount);
            nodeTypeCounts.put(nodeTypeObject);
            nodeCount += nodeTypeCount;
          } catch (JSONException e) {
            e.printStackTrace();
          }
        }
      }

      vleStatistics.put("individualNodeTypeCounts", nodeTypeCounts);
      vleStatistics.put("totalNodeCount", nodeCount);
    } catch (SQLException e) {
      e.printStackTrace();
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  /**
   * Get the number of times hints were viewed by a student
   * 
   * @param statement
   *                        the object to execute queries
   * @param vleStatistics
   *                        the JSONObject to store the statistics in
   */
  private void gatherHintStatistics(Statement statement, JSONObject vleStatistics) {
    try {
      ResultSet hintCountQuery = statement
          .executeQuery("select count(*) from stepwork where data like '%hintStates\":[{%]%'");

      if (hintCountQuery.first()) {
        long hintCount = hintCountQuery.getLong(1);
        vleStatistics.put("totalHintViewCount", hintCount);
      }
    } catch (SQLException e) {
      e.printStackTrace();
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  public String getSummaryMessage() {
    String messageBody = "";
    DateFormat df = DateFormat.getDateInstance(DateFormat.LONG);

    List<Run> runsCreatedSinceYesterday = findRunsCreatedSinceYesterday();
    messageBody += "Number of Runs started between " + df.format(yesterday) + " and "
        + df.format(today) + ": " + runsCreatedSinceYesterday.size() + "\n";

    // show info about the run
    for (Run run : runsCreatedSinceYesterday) {
      messageBody += "\tProject:" + run.getProject().getName();
      User owner = run.getOwner();
      TeacherUserDetails teacherUserDetails = (TeacherUserDetails) owner.getUserDetails();
      String schoolName = teacherUserDetails.getSchoolname();
      String schoolCity = teacherUserDetails.getCity();
      String schoolState = teacherUserDetails.getState();

      messageBody += "\n\tTeacher Username:" + teacherUserDetails.getUsername();
      messageBody += "\n\tTeacher School Info: " + schoolName + ", " + schoolCity + ", "
          + schoolState;
      messageBody += "\n\n";
    }

    List<User> teachersJoinedSinceYesterday = findUsersJoinedSinceYesterday("teacherUserDetails");
    messageBody += "\n\n";
    messageBody += "Number of Teachers joined between " + df.format(yesterday) + " and "
        + df.format(today) + ": " + teachersJoinedSinceYesterday.size();

    List<User> studentsJoinedSinceYesterday = findUsersJoinedSinceYesterday("studentUserDetails");
    messageBody += "\n\n";
    messageBody += "Number of Students joined between " + df.format(yesterday) + " and "
        + df.format(today) + ": " + studentsJoinedSinceYesterday.size();

    // Number of Users that logged in at least once in the last day
    List<User> studentsWhoLoggedInSinceYesterday = findUsersWhoLoggedInSinceYesterday(
        "studentUserDetails");
    List<User> teachersWhoLoggedInSinceYesterday = findUsersWhoLoggedInSinceYesterday(
        "teacherUserDetails");
    int totalNumUsersLoggedInSinceYesterday = studentsWhoLoggedInSinceYesterday.size()
        + teachersWhoLoggedInSinceYesterday.size();
    messageBody += "\n\n";
    messageBody += "Number of users who logged in at least once between " + df.format(yesterday)
        + " and " + df.format(today) + ": " + totalNumUsersLoggedInSinceYesterday;
    return messageBody;
  }

  public List<User> findUsersJoinedSinceYesterday(String who) {
    List<User> users = new ArrayList<User>();
    if ("studentUserDetails".equals(who)) {
      users = userService.retrieveStudentUsersJoinedSinceYesterday();
    } else if ("teacherUserDetails".equals(who)) {
      users = userService.retrieveTeacherUsersJoinedSinceYesterday();
    }
    return users;
  }

  /**
   * Finds number of runs that were created since yesterday
   */
  public List<Run> findRunsCreatedSinceYesterday() {
    String field = "starttime";
    String type = ">";
    Object term = yesterday;
    List<Run> runsStartedSinceYesterday = runDao.retrieveByField(field, type, term);
    return runsStartedSinceYesterday;
  }

  public List<User> findUsersWhoLoggedInSinceYesterday(String who) {
    List<User> users = new ArrayList<User>();
    if ("studentUserDetails".equals(who)) {
      users = userService.retrieveStudentUsersWhoLoggedInSinceYesterday();
    } else if ("teacherUserDetails".equals(who)) {
      users = userService.retrieveTeacherUsersWhoLoggedInSinceYesterday();
    }
    return users;
  }

  public void sendEmail(String message) {
    String[] recipients = appProperties.getProperty("uber_admin").split(",");
    String subject = "Daily Admin Report on Portal: " + " ("
        + appProperties.getProperty("wise.name") + ")";

    String msg = message;
    String fromEmail = "wise_gateway@berkeley.edu";
    try {
      mailService.postMail(recipients, subject, msg, fromEmail);
    } catch (MessagingException e) {
    }
  }

  /**
   * POSTs WISE usage statistics to central hub
   */
  public void postStatistics(String wiseStatisticsString) {

    if (WISE_HUB_URL != null) {
      HttpClient client = HttpClientBuilder.create().build();
      HttpPost post = new HttpPost(WISE_HUB_URL);
      List<NameValuePair> urlParameters = new ArrayList<NameValuePair>();
      urlParameters.add(new BasicNameValuePair("name", appProperties.getProperty("wise.name")));
      urlParameters.add(new BasicNameValuePair("stats", wiseStatisticsString));

      try {
        post.setEntity(new UrlEncodedFormEntity(urlParameters));
        HttpResponse response = client.execute(post);
        if (response.getStatusLine().getStatusCode() != HttpStatus.SC_OK) {
          System.err.println("Method failed: " + response.getStatusLine());
        }
        // Use caution: ensure correct character encoding and is not binary data
      } catch (IOException e) {
        System.err.println("Fatal transport error: " + e.getMessage());
        e.printStackTrace();
      } finally {
        post.releaseConnection();
      }
    }
  }

  /**
   * Outputs the string to System.out if DEBUG is true
   * 
   * @param output
   *                 a String to output to System.out
   */
  private void debugOutput(String output) {
    if (DEBUG) {
      System.out.println(output);
    }
  }

  public void setYesterday(Date yesterday) {
    this.yesterday = yesterday;
  }

  public void setToday(Date today) {
    this.today = today;
  }
}
