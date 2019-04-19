package org.wise.portal.presentation.web.controllers.teacher;

import com.google.api.client.auth.oauth2.AuthorizationCodeRequestUrl;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.classroom.Classroom;
import com.google.api.services.classroom.ClassroomScopes;
import com.google.api.services.classroom.model.*;
import com.google.api.services.classroom.model.Date;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.wise.portal.presentation.web.controllers.ControllerUtil;

import javax.servlet.http.HttpServletRequest;
import java.util.*;

@RestController
@RequestMapping(value = "/api/google-classroom", produces = "application/json;charset=UTF-8")
public class GoogleClassroomAPIController {
  @Value("${google.classroom.clientId:}")
  private String clientId;

  @Value("${google.classroom.clientSecret:}")
  private String clientSecret;

  @Value("${wise.name:}")
  private String applicationName;

  private static final List<String> SCOPES = new ArrayList<>();
  private static final String TOKENS_DIRECTORY_PATH = "tokens";
  private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();
  private Map<String, String> pendingPermissionRequests = new HashMap<>();

  static {
    SCOPES.add(ClassroomScopes.CLASSROOM_COURSEWORK_STUDENTS);
    SCOPES.add(ClassroomScopes.CLASSROOM_COURSES);
  }

  private class AuthorizationCodeRequestUrlCallbackRunnable implements Runnable {
    private LocalServerReceiver receiver;
    private GoogleAuthorizationCodeFlow flow;
    private String redirectUri, username;
    Map<String, String> pendingPermissionRequests;
    AuthorizationCodeRequestUrlCallbackRunnable(LocalServerReceiver receiver, GoogleAuthorizationCodeFlow flow,
                                                String redirectUri, String username,
                                                Map<String, String> pendingPermissionRequests) {
      this.receiver = receiver;
      this.flow = flow;
      this.redirectUri = redirectUri;
      this.username = username;
      this.pendingPermissionRequests = pendingPermissionRequests;
    }
    @Override
    public void run() {
      try {
        String code = receiver.waitForCode();
        TokenResponse response = flow.newTokenRequest(code).setRedirectUri(redirectUri).execute();
        flow.createAndStoreCredential(response, username);
        this.pendingPermissionRequests.remove(username);
        receiver.stop();
      } catch (Exception e) {
        System.out.println(e.getMessage());
      }
    }
  }

  private ImmutablePair<String, Credential> authorize(String username) throws Exception {
    NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
    GoogleClientSecrets.Details credentials = new GoogleClientSecrets.Details();
    credentials.setClientId(clientId);
    credentials.setClientSecret(clientSecret);
    GoogleClientSecrets clientSecrets = new GoogleClientSecrets();
    clientSecrets.setInstalled(credentials);
    GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(HTTP_TRANSPORT, JSON_FACTORY,
      clientSecrets, SCOPES).setDataStoreFactory(new FileDataStoreFactory(new java.io.File(TOKENS_DIRECTORY_PATH)))
      .build();
    Credential credential = flow.loadCredential(username);
    if (credential != null && (credential.getRefreshToken() != null || credential.getExpiresInSeconds() == null ||
      credential.getExpiresInSeconds() > 60)) {
      return new ImmutablePair<>(null, credential);
    }

    if (pendingPermissionRequests.containsKey(username)) {
      return new ImmutablePair<>(pendingPermissionRequests.get(username), null);
    }

    // start code receiver server
    LocalServerReceiver receiver = new LocalServerReceiver.Builder().build();
    String redirectUri = receiver.getRedirectUri();
    AuthorizationCodeRequestUrl authorizationUrl = flow.newAuthorizationUrl().setRedirectUri(redirectUri);

    // start a new thread to wait for code once the user allows for classroom permissions
    new Thread(new AuthorizationCodeRequestUrlCallbackRunnable(receiver, flow, redirectUri, username, pendingPermissionRequests)).start();
    String authorizationUri = authorizationUrl.build();
    pendingPermissionRequests.put(username, authorizationUri);
    return new ImmutablePair<>(authorizationUri, null);
  }

  private Classroom connectToClassroomAPI(Credential credential) throws Exception {
    final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
    return new Classroom.Builder(HTTP_TRANSPORT, JSON_FACTORY, credential).setApplicationName(applicationName).build();
  }

  @RequestMapping(value = "/get-authorization-url", method = RequestMethod.GET)
  protected String getClassroomAuthorizationUrl(@RequestParam("username") String username) throws Exception {
    JSONObject response = new JSONObject();
    response.put("authorizationUrl", authorize(username).getLeft());
    return response.toString();
  }

  @RequestMapping(value = "/list-courses", method = RequestMethod.GET)
  protected List<Course> getClassroomCourses(@RequestParam("username") String username) throws Exception {
    Credential credential = authorize(username).getRight();
    if (credential == null) {
      return null;
    }
    List<Course> activeCourses = new ArrayList<>();
    for (Course course: connectToClassroomAPI(credential).courses().list().execute().getCourses()) {
      if (!course.getCourseState().equals("ARCHIVED")) {
        activeCourses.add(course);
      }
    }
    return activeCourses;
  }

  @RequestMapping(value = "/create-assignment", method = RequestMethod.POST)
  protected String addToClassroom(HttpServletRequest request,
                                  @RequestParam("accessCode") String accessCode,
                                  @RequestParam("unitTitle") String unitTitle,
                                  @RequestParam("courseId") String courseId,
                                  @RequestParam("username") String username,
                                  @RequestParam("endTime") String endTime) throws Exception {
    JSONObject response = new JSONObject();
    String description = "Hi class! Please complete the \"" + unitTitle + "\" WISE unit. (Access Code: " + accessCode + ")";
    ImmutablePair<String, Credential> pair = authorize(username);
    String authorizationUrl = pair.getLeft();
    Credential credential = pair.getRight();
    if (authorizationUrl != null) {
      response.put("error", true);
      return response.toString();
    }
    Classroom classroom = connectToClassroomAPI(credential);
    List<Material> materials = new ArrayList<>();
    Material material = new Material();
    Link link = new Link();
    link.setUrl(ControllerUtil.getBaseUrlString(request) + "/login?accessCode=" + accessCode);
    link.setTitle("WISE");
    material.setLink(link);
    materials.add(material);
    CourseWork coursework = new CourseWork();
    coursework.set("title", unitTitle);
    coursework.set("description", description);
    coursework.set("materials", materials);
    coursework.set("workType", "ASSIGNMENT");
    coursework.set("state", "PUBLISHED");
    if (!endTime.equals("")) {
      Date dueDate = new Date();
      Calendar cal = Calendar.getInstance();
      cal.setTimeInMillis(Long.parseLong(endTime));
      cal.setTimeZone(TimeZone.getTimeZone("UTC"));
      dueDate.setYear(cal.get(Calendar.YEAR));
      dueDate.setMonth(cal.get(Calendar.MONTH) + 1);
      dueDate.setDay(cal.get(Calendar.DAY_OF_MONTH));
      TimeOfDay dueTime = new TimeOfDay();
      dueTime.setHours(cal.get(Calendar.HOUR_OF_DAY));
      dueTime.setMinutes(cal.get(Calendar.MINUTE));
      dueTime.setSeconds(cal.get(Calendar.SECOND));
      dueTime.setNanos(0);
      coursework.put("dueDate", dueDate);
      coursework.put("dueTime", dueTime);
    }
    classroom.courses().courseWork().create(courseId, coursework).execute();
    return response.toString();
  }
}
