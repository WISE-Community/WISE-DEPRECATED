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
import com.google.api.services.classroom.model.CourseWork;
import com.google.api.services.classroom.model.Link;
import com.google.api.services.classroom.model.Material;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.util.Pair;
import org.wise.portal.presentation.web.controllers.ControllerUtil;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping(value = "/api/google-classroom", produces = "application/json;charset=UTF-8")
public class GoogleClassroomAPIController {

  @Value("${classroomClientId:}")
  private String clientId;

  @Value("${classroomClientSecret:}")
  private String clientSecret;

  @Value("${wise.name:}")
  private String applicationName;

  private static final List<String> SCOPES = new ArrayList<>();
  private static final String TOKENS_DIRECTORY_PATH = "tokens";
  private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();
  private LocalServerReceiver receiver;
  private GoogleAuthorizationCodeFlow flow;

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
    flow = new GoogleAuthorizationCodeFlow.Builder(HTTP_TRANSPORT, JSON_FACTORY, clientSecrets, SCOPES)
      .setDataStoreFactory(new FileDataStoreFactory(new java.io.File(TOKENS_DIRECTORY_PATH)))
      .setAccessType("online")
      .setApprovalPrompt("force")
      .build();
    Credential credential = flow.loadCredential(username);
    if (credential != null && (credential.getRefreshToken() != null || credential.getExpiresInSeconds() == null || credential.getExpiresInSeconds() > 60)) {
      return new ImmutablePair<>(null, credential);
    }
    receiver = new LocalServerReceiver.Builder().setPort(8888).build();
    String redirectUri = receiver.getRedirectUri();
    AuthorizationCodeRequestUrl authorizationUrl = flow.newAuthorizationUrl().setRedirectUri(redirectUri);
    onAuthorize(username);
    System.out.println(authorizationUrl.build());
    return new ImmutablePair<>(authorizationUrl.build(), null);
  }

  private void onAuthorize(String username) throws Exception {
    String code = receiver.waitForCode();
    TokenResponse response = flow.newTokenRequest(code).setRedirectUri(receiver.getRedirectUri()).execute();
    receiver.stop();
    flow.createAndStoreCredential(response, username);
  }

  private Classroom connectToClassroomAPI(Credential credential) throws Exception {
    final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
    return new Classroom.Builder(HTTP_TRANSPORT, JSON_FACTORY, credential).setApplicationName(applicationName).build();
  }

  @RequestMapping(value = "/list-courses", method = RequestMethod.POST)
  protected String listCourses(HttpServletRequest request,
                               @RequestParam("username") String username,
                               @RequestParam("authPending") String authPending) throws Exception {
    JSONObject response = new JSONObject();
    ImmutablePair<String, Credential> pair = authorize(username);
    String authorizationUrl = pair.getLeft();
    Credential credential = pair.getRight();
    if (authorizationUrl != null) {
      response.put("authorizationUrl", authorizationUrl);
      return response.toString();
    }
    Classroom classroom = connectToClassroomAPI(credential);
    response.put("courses", classroom.courses().list().execute().toString());
    return response.toString();
  }

  @RequestMapping(value = "/create-assignment", method = RequestMethod.POST)
  protected String createAssignment(HttpServletRequest request,
                                  @RequestParam("accessCode") String accessCode,
                                  @RequestParam("unitTitle") String unitTitle,
                                  @RequestParam("courseId") String courseId,
                                  @RequestParam("username") String username) throws Exception {
    String description = "Hi class! Please complete the \"" + unitTitle + "\" WISE unit. (Access Code: " + accessCode + ")";
    ImmutablePair<String, Credential> pair = authorize(username);
    String authorizationUrl = pair.getLeft();
    Credential credential = pair.getRight();
    if (authorizationUrl != null) {
      return "error!";
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
    return "success!";
  }
}
