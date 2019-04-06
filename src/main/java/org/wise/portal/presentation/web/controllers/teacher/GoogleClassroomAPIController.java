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
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.util.Pair;
import org.wise.portal.presentation.web.controllers.ControllerUtil;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping(value = "/api/google-classroom", produces = "application/json;charset=UTF-8")
public class GoogleClassroomAPIController {
  
  private class AuthorizationCodeRequestUrlCallbackRunnable implements Runnable {
    private LocalServerReceiver receiver;
    private GoogleAuthorizationCodeFlow flow;
    private String redirectUri, username;
    AuthorizationCodeRequestUrlCallbackRunnable(LocalServerReceiver receiver,
                                                GoogleAuthorizationCodeFlow flow,
                                                String redirectUri, String username) {
      this.receiver = receiver;
      this.flow = flow;
      this.redirectUri = redirectUri;
      this.username = username;
    }
    @Override
    public void run() {
      try {
        String code = receiver.waitForCode();
        TokenResponse response = flow.newTokenRequest(code).setRedirectUri(redirectUri).execute();
        flow.createAndStoreCredential(response, username);
        receiver.stop();
      } catch (Exception e) {
        System.out.println(e.getMessage());
      }
    }
  }

  @Value("${classroomClientId:}")
  private String clientId;

  @Value("${classroomClientSecret:}")
  private String clientSecret;

  @Value("${wise.name:}")
  private String applicationName;

  private static final List<String> SCOPES = new ArrayList<>();
  private static final String TOKENS_DIRECTORY_PATH = "tokens";
  private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();

  static {
    SCOPES.add(ClassroomScopes.CLASSROOM_COURSEWORK_STUDENTS);
    SCOPES.add(ClassroomScopes.CLASSROOM_COURSES);
  }

  private ImmutablePair<String, Credential> authorize(String username) throws Exception {
    NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
    GoogleClientSecrets.Details credentials = new GoogleClientSecrets.Details();
    credentials.setClientId(clientId);
    credentials.setClientSecret(clientSecret);
    GoogleClientSecrets clientSecrets = new GoogleClientSecrets();
    clientSecrets.setInstalled(credentials);
    GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(HTTP_TRANSPORT, JSON_FACTORY, clientSecrets, SCOPES)
      .setDataStoreFactory(new FileDataStoreFactory(new java.io.File(TOKENS_DIRECTORY_PATH)))
      .setAccessType("online")
      .setApprovalPrompt("force")
      .build();
    Credential credential = flow.loadCredential(username);
    if (credential != null && (credential.getRefreshToken() != null || credential.getExpiresInSeconds() == null || credential.getExpiresInSeconds() > 60)) {
      return new ImmutablePair<>(null, credential);
    }

    // start code receiver server
    LocalServerReceiver receiver = new LocalServerReceiver.Builder().setPort(8888).build();
    String redirectUri = receiver.getRedirectUri();
    AuthorizationCodeRequestUrl authorizationUrl = flow.newAuthorizationUrl().setRedirectUri(redirectUri);

    // start a new thread to wait for code once the user allows for classroom permissions
    new Thread(new AuthorizationCodeRequestUrlCallbackRunnable(receiver, flow, redirectUri, username)).start();
    return new ImmutablePair<>(authorizationUrl.build(), null);
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
    return connectToClassroomAPI(credential).courses().list().execute().getCourses();
  }

  @RequestMapping(value = "/create-assignment", method = RequestMethod.POST)
  protected String addToClassroom(HttpServletRequest request,
                                  @RequestParam("accessCode") String accessCode,
                                  @RequestParam("unitTitle") String unitTitle,
                                  @RequestParam("courseId") String courseId,
                                  @RequestParam("username") String username) throws Exception {
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
    classroom.courses().courseWork().create(courseId, coursework).execute();
    return response.toString();
  }
}
