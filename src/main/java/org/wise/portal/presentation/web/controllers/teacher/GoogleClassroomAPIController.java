package org.wise.portal.presentation.web.controllers.teacher;

import com.google.api.client.auth.oauth2.AuthorizationCodeRequestUrl;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.TokenResponse;
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
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.authentication.UserDetailsService;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.math.BigInteger;
import java.security.GeneralSecurityException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.TimeZone;

@RestController
@RequestMapping(value = "/api/google-classroom", produces = "application/json;charset=UTF-8")
public class GoogleClassroomAPIController {

  @Autowired
  private UserDetailsService userDetailsService;

  @Value("${google.clientId:}")
  private String googleClientId;

  @Value("${google.clientSecret:}")
  private String googleClientSecret;

  @Value("${wise.name:}")
  private String applicationName;

  @Value("${google.tokens.dir:~/tokens}")
  private String tokensDirectoryPath;

  private static final List<String> SCOPES = new ArrayList<>();
  private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();

  static {
    SCOPES.add(ClassroomScopes.CLASSROOM_COURSES);
    SCOPES.add(ClassroomScopes.CLASSROOM_COURSEWORK_STUDENTS);
  }

  @RequestMapping(value = "/oauth", method = RequestMethod.GET)
  private String googleOAuthToken(@RequestParam String code, HttpServletRequest request)
      throws GeneralSecurityException, IOException {
    String state = request.getParameter("state");
    String sessionState = (String) request.getSession().getAttribute("state");
    if (!state.equals(sessionState)) {
      throw new GeneralSecurityException("Invalid State Parameter.");
    }
    String username = ControllerUtil.getSignedInUser().getUserDetails().getUsername();
    NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
    GoogleClientSecrets.Details credentials = new GoogleClientSecrets.Details();
    credentials.setClientId(googleClientId);
    credentials.setClientSecret(googleClientSecret);
    GoogleClientSecrets clientSecrets = new GoogleClientSecrets();
    clientSecrets.setInstalled(credentials);
    GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(HTTP_TRANSPORT, JSON_FACTORY,
        clientSecrets, SCOPES).setDataStoreFactory(new FileDataStoreFactory(new java.io.File(tokensDirectoryPath)))
        .build();
    TokenResponse response = flow.newTokenRequest(code).setRedirectUri(getRedirectUri()).execute();
    flow.createAndStoreCredential(response, username);
    return "Successfully linked with Google Classroom. Please close this window to proceed.";
  }

  private ImmutablePair<String, Credential> authorize(String username) throws Exception {
    NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
    GoogleClientSecrets.Details credentials = new GoogleClientSecrets.Details();
    credentials.setClientId(googleClientId);
    credentials.setClientSecret(googleClientSecret);
    GoogleClientSecrets clientSecrets = new GoogleClientSecrets();
    clientSecrets.setInstalled(credentials);
    GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(HTTP_TRANSPORT, JSON_FACTORY,
        clientSecrets, SCOPES).setDataStoreFactory(new FileDataStoreFactory(new java.io.File(tokensDirectoryPath)))
        .build();
    Credential credential = flow.loadCredential(username);
    if (credential != null && (credential.getRefreshToken() != null || credential.getExpiresInSeconds() == null ||
        credential.getExpiresInSeconds() > 60)) {
      return new ImmutablePair<>(null, credential);
    }

    AuthorizationCodeRequestUrl authorizationUrl = flow.newAuthorizationUrl().setRedirectUri(getRedirectUri());
    String state = getState();
    String authorizationUri = authorizationUrl.setState(state).build();
    HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
    request.getSession().setAttribute("state", state);
    return new ImmutablePair<>(authorizationUri, null);
  }

  private String getState() throws NoSuchAlgorithmException {
    return new BigInteger(130, new SecureRandom()).toString(32);
  }

  private String getRedirectUri() {
    return ControllerUtil.getPortalUrlString() + "/api/google-classroom/oauth";
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
    List<Course> courses = connectToClassroomAPI(credential).courses().list().execute().getCourses();
    if (courses == null) {
      return activeCourses;
    }
    MutableUserDetails userDetails = (MutableUserDetails) userDetailsService.loadUserByUsername(username);
    for (Course course: courses) {
      if (!course.getCourseState().equals("ARCHIVED") && course.getOwnerId().equals(userDetails.getGoogleUserId())) {
        activeCourses.add(course);
      }
    }
    return activeCourses;
  }

  @RequestMapping(value = "/create-assignment", method = RequestMethod.POST)
  protected String addToClassroom(HttpServletRequest request,
                                  @RequestParam("accessCode") String accessCode,
                                  @RequestParam("unitTitle") String unitTitle,
                                  @RequestParam("username") String username,
                                  @RequestParam("endTime") String endTime,
                                  @RequestParam("description") String description,
                                  @RequestParam("courseIds") String courseIdsString) throws Exception {
    JSONObject response = new JSONObject();
    ImmutablePair<String, Credential> pair = authorize(username);
    String authorizationUrl = pair.getLeft();
    Credential credential = pair.getRight();
    if (authorizationUrl != null) {
      response.put("error", "authorizationUrl was set");
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
    response.put("courses", addAssignmentToCourses(classroom, coursework, courseIdsString));
    return response.toString();
  }

  private JSONArray addAssignmentToCourses(Classroom classroom, CourseWork coursework,
      String courseIdsString) throws JSONException {
    JSONArray courses = new JSONArray();
    JSONArray courseIds = new JSONArray(courseIdsString);
    for (int c = 0; c < courseIds.length(); c++) {
      courses.put(addAssignmentToCourse(classroom, coursework, courseIds.getString(c)));
    }
    return courses;
  }

  private JSONObject addAssignmentToCourse(Classroom classroom, CourseWork coursework,
      String courseId) throws JSONException {
    JSONObject courseJSON = new JSONObject();
    courseJSON.put("id", courseId);
    try {
      classroom.courses().courseWork().create(courseId, coursework).execute();
      courseJSON.put("success", true);
    } catch(Exception e) {
      courseJSON.put("success", false);
    }
    return courseJSON;
  }
}
