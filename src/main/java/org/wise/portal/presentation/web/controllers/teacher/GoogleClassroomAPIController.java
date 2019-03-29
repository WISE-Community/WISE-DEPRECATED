package org.wise.portal.presentation.web.controllers.teacher;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
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
import com.google.api.services.classroom.model.ListCoursesResponse;
import com.google.api.services.classroom.model.Material;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
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

  static {
    SCOPES.add(ClassroomScopes.CLASSROOM_COURSEWORK_STUDENTS);
    SCOPES.add(ClassroomScopes.CLASSROOM_COURSES);
  }

  private Classroom connectToClassroomAPI() throws Exception {
    final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
    GoogleClientSecrets.Details credentials = new GoogleClientSecrets.Details();
    credentials.setClientId(clientId);
    credentials.setClientSecret(clientSecret);

    GoogleClientSecrets clientSecrets = new GoogleClientSecrets();
    clientSecrets.setInstalled(credentials);

    GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
      HTTP_TRANSPORT, JSON_FACTORY, clientSecrets, SCOPES)
      .setDataStoreFactory(new FileDataStoreFactory(new java.io.File(TOKENS_DIRECTORY_PATH)))
      .setAccessType("offline")
      .build();
    LocalServerReceiver receiver = new LocalServerReceiver.Builder().setPort(8888).build();
    Credential authorization = new AuthorizationCodeInstalledApp(flow, receiver).authorize("user6");

    return new Classroom.Builder(HTTP_TRANSPORT, JSON_FACTORY, authorization).setApplicationName(applicationName).build();
  }

  @RequestMapping(value = "/list-courses", method = RequestMethod.GET)
  protected ListCoursesResponse listCourses() throws Exception {
    Classroom service = connectToClassroomAPI();
    return service.courses().list().execute();
  }

  @RequestMapping(value = "/create-assignment", method = RequestMethod.POST)
  protected void createAssignment(HttpServletRequest request,
                             @RequestParam("accessCode") String accessCode,
                             @RequestParam("unitTitle") String unitTitle,
                             @RequestParam("courseId") String courseId) throws Exception {
    String description = "Hi class! Please complete the \"" + unitTitle + "\" WISE unit. (Access Code: " + accessCode + ")";
    Classroom service = connectToClassroomAPI();
    List<Material> materials = new ArrayList<>();
    Material material = new Material();
    Link link = new Link();
    link.setUrl(ControllerUtil.getBaseUrlString(request));
    link.setTitle("WISE");
    material.setLink(link);
    materials.add(material);
    CourseWork coursework = new CourseWork();
    coursework.set("title", unitTitle);
    coursework.set("description", description);
    coursework.set("materials", materials);
    coursework.set("workType", "ASSIGNMENT");
    coursework.set("state", "PUBLISHED");
    service.courses().courseWork().create(courseId, coursework).execute();
  }
}
