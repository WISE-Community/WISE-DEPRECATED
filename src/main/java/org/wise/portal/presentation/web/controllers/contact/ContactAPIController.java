package org.wise.portal.presentation.web.controllers.contact;

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.general.contactwise.IssueType;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.mail.IMailFacade;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.user.UserService;

import javax.mail.MessagingException;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

@RestController
@RequestMapping("/api/contact")
public class ContactAPIController {

  @Autowired
  private Properties appProperties;

  @Autowired
  protected UserService userService;

  @Autowired
  protected IMailFacade mailService;

  @Autowired
  private ProjectService projectService;

  @Autowired
  private RunService runService;

  @Autowired
  private Properties i18nProperties;

  private static final String userAgentParseURL = "http://api.whatismybrowser.com/api/v1/user_agent_parse";

  @RequestMapping(value = "", method = RequestMethod.POST)
  protected String sendContactMessage(@RequestParam(value = "name") String name,
      @RequestParam(value = "email", required = false) String email,
      @RequestParam(value = "teacherUsername", required = false) String teacherUsername,
      @RequestParam(value = "issueType") String issueType,
      @RequestParam(value = "summary") String summary,
      @RequestParam(value = "description") String description,
      @RequestParam(value = "runId", required = false) Long runId,
      @RequestParam(value = "projectId", required = false) Integer projectId,
      @RequestParam(value = "userAgent", required = false) String userAgent,
      @RequestParam(value = "recaptchaResponse", required = false) String recaptchaResponse)
      throws JSONException {
    if (this.isAuthorized(recaptchaResponse)) {
      boolean isStudent = isStudent();
      String issueTypeValue = getIssueTypeValue(issueType);
      String fromEmail = appProperties.getProperty("portalemailaddress");
      String[] toEmails = getContactMessageToEmails(isStudent, runId, teacherUsername);
      String[] cc = getContactMessageCCs(email, isStudent);
      String subject = getSubject(issueTypeValue, summary);
      String body = getContactEmailBody(name, email, teacherUsername, description, runId, projectId,
          userAgent, isStudent);
      JSONObject response = sendEmail(fromEmail, toEmails, cc, subject, body);
      return response.toString();
    } else {
      return ControllerUtil.createErrorResponse().toString();
    }
  }

  private boolean isAuthorized(String recaptchaResponse) {
    return isSignedIn() || !isRecaptchaEnabled()
        || ControllerUtil.isReCaptchaResponseValid(recaptchaResponse);
  }

  private boolean isSignedIn() {
    return ControllerUtil.getSignedInUser() != null;
  }

  private boolean isRecaptchaEnabled() {
    String recaptchaPublicKey = appProperties.getProperty("recaptcha_public_key");
    String recaptchaPrivateKey = appProperties.getProperty("recaptcha_private_key");
    return recaptchaPublicKey != null && !recaptchaPublicKey.equals("")
        && recaptchaPrivateKey != null && !recaptchaPrivateKey.equals("");
  }

  private boolean isStudent() {
    User signedInUser = ControllerUtil.getSignedInUser();
    if (signedInUser != null) {
      return signedInUser.isStudent();
    }
    return false;
  }

  private String getIssueTypeValue(String issueType) {
    IssueType.setProperties(i18nProperties);
    return IssueType.valueOf(issueType).toString();
  }

  private void appendLine(StringBuffer body, String text) {
    body.append(text);
    body.append("\n");
  }

  private JSONObject sendEmail(String fromEmail, String[] toEmails, String[] cc, String subject,
      String body) throws JSONException {
    try {
      mailService.postMail(toEmails, subject, body, fromEmail, cc);
      return ControllerUtil.createSuccessResponse();
    } catch (MessagingException e) {
      e.printStackTrace();
      return ControllerUtil.createErrorResponse();
    }
  }

  private String getSubject(String issueType, String summary) {
    String contactWISEString = i18nProperties.getProperty("contact_wise");
    return "[" + contactWISEString + "] " + issueType + ": " + summary;
  }

  protected String[] getContactMessageToEmails(boolean isStudent, Long runId,
      String teacherUsername) {
    if (isStudent) {
      if (runId != null) {
        return new String[] { getTeacherEmail(runId) };
      } else if (teacherUsername != null) {
        return new String[] { getTeacherEmail(teacherUsername) };
      }
    }
    String contactEmailString = appProperties.getProperty("contact_email");
    return contactEmailString.split(",");
  }

  protected String[] getContactMessageCCs(String email, boolean isStudent) {
    if (isStudent) {
      String contactEmailString = appProperties.getProperty("contact_email");
      return contactEmailString.split(",");
    } else {
      return new String[] { email };
    }
  }

  private String getContactEmailBody(String name, String email, String teacherUsername,
      String description, Long runId, Integer projectId, String userAgent, Boolean isStudent) {
    StringBuffer body = new StringBuffer();
    if (isStudent) {
      addStudentGeneratedRequestBody(body, description, name, runId, teacherUsername);
    } else {
      addTeacherGeneratedRequestBody(body, description, name, email);
    }
    addProjectAndRunDetailsToBody(body, runId, projectId);
    try {
      addUserSystemDetailsToBody(body, userAgent);
    } catch (IOException e) {
      e.printStackTrace();
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return body.toString();
  }

  private void addStudentGeneratedRequestBody(StringBuffer body, String description, String name,
      Long runId, String teacherUsername) {
    User teacher = null;
    if (runId != null) {
      teacher = getTeacherForRun(runId);
    } else if (teacherUsername != null) {
      teacher = getTeacherByUsername(teacherUsername);
    }
    if (teacher != null) {
      TeacherUserDetails teacherUserDetails = (TeacherUserDetails) teacher.getUserDetails();
      String displayName = teacherUserDetails.getDisplayname();
      appendLine(body, getTranslationString("contact.email.studentGenerated", displayName));
    }
    appendLine(body, getTranslationString("contact.email.description", description));
    appendLine(body, getTranslationString("contact.email.name", name));
  }

  private User getTeacherForRun(Long runId) {
    try {
      Run run = runService.retrieveById(runId);
      User owner = run.getOwner();
      return owner;
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    }
    return null;
  }

  private String getTeacherEmail(Long runId) {
    User teacher = getTeacherForRun(runId);
    TeacherUserDetails teacherUserDetails = (TeacherUserDetails) teacher.getUserDetails();
    return teacherUserDetails.getEmailAddress();
  }

  private String getTeacherEmail(String teacherUsername) {
    User teacher = getTeacherByUsername(teacherUsername);
    TeacherUserDetails teacherUserDetails = (TeacherUserDetails) teacher.getUserDetails();
    return teacherUserDetails.getEmailAddress();
  }

  private User getTeacherByUsername(String teacherUsername) {
    return userService.retrieveUserByUsername(teacherUsername);
  }

  private void addTeacherGeneratedRequestBody(StringBuffer body, String description, String name,
      String email) {
    appendLine(body, getTranslationString("contact.email.teacherGenerated", name));
    appendLine(body, getTranslationString("contact.email.description", description));
    appendLine(body, getTranslationString("contact.email.name", name));
    appendLine(body, getTranslationString("contact.email.email", email));
  }

  private void addProjectAndRunDetailsToBody(StringBuffer body, Long runId, Integer projectId) {
    if (runId != null) {
      try {
        Run run = runService.retrieveById(runId);
        Project project = run.getProject();
        appendLine(body, getTranslationString("contact.email.projectName", project.getName()));
        appendLine(body,
            getTranslationString("contact.email.projectId", project.getId().toString()));
        appendLine(body, getTranslationString("contact.email.runId", runId.toString()));
      } catch (ObjectNotFoundException e) {
      }
    } else if (projectId != null) {
      try {
        Project project = projectService.getById(projectId);
        appendLine(body, getTranslationString("contact.email.projectName", project.getName()));
        appendLine(body,
            getTranslationString("contact.email.projectId", project.getId().toString()));
      } catch (ObjectNotFoundException e) {
      }
    }
  }

  private void addUserSystemDetailsToBody(StringBuffer body, String userAgent)
      throws IOException, JSONException {
    if (appPropertiesHasUserAgentParseKey()) {
      JSONObject userSystemDetails = getUserAgentParseResult(userAgent);
      addOperatingSystemToBody(body, userSystemDetails);
      addBrowserToBody(body, userSystemDetails);
    }
  }

  private void addOperatingSystemToBody(StringBuffer body, JSONObject userSystemDetails) {
    appendLine(body, getTranslationString("contact.email.operatingSystem",
        getOperatingSystem(userSystemDetails)));
  }

  private String getOperatingSystem(JSONObject userSystemDetails) {
    try {
      String operatingSystemName = userSystemDetails.getString("operating_system");
      String operatingSystemVersion = userSystemDetails.getString("operating_system_version_full");
      return operatingSystemName + " " + operatingSystemVersion;
    } catch (JSONException e) {
    }
    return "";
  }

  private void addBrowserToBody(StringBuffer body, JSONObject userSystemDetails) {
    appendLine(body, getTranslationString("contact.email.browser", getBrowser(userSystemDetails)));
  }

  private String getBrowser(JSONObject userSystemDetails) {
    try {
      String browserName = userSystemDetails.getString("browser_name");
      String browserVersion = userSystemDetails.getString("browser_version_full");
      return browserName + " " + browserVersion;
    } catch (JSONException e) {
    }
    return "";
  }

  private boolean appPropertiesHasUserAgentParseKey() {
    String userKey = appProperties.getProperty("userAgentParseKey");
    return userKey != null && !userKey.equals("");
  }

  private JSONObject getUserAgentParseResult(String userAgent) throws IOException, JSONException {
    HttpPost post = prepareUserAgentParseRequest(userAgent);
    JSONObject userAgentResponse = makeUserAgentParseRequest(post);
    if (isUserAgentResponseSuccess(userAgentResponse)) {
      JSONObject parse = userAgentResponse.getJSONObject("parse");
      return parse;
    }
    return null;
  }

  private HttpPost prepareUserAgentParseRequest(String userAgent) {
    String userKey = appProperties.getProperty("userAgentParseKey");
    HttpPost post = new HttpPost(userAgentParseURL);
    List<NameValuePair> urlParameters = new ArrayList<NameValuePair>();
    urlParameters.add(new BasicNameValuePair("user_key", userKey));
    urlParameters.add(new BasicNameValuePair("user_agent", userAgent));
    try {
      post.setEntity(new UrlEncodedFormEntity(urlParameters));
    } catch (UnsupportedEncodingException e) {

    }
    return post;
  }

  private JSONObject makeUserAgentParseRequest(HttpPost post) throws IOException, JSONException {
    HttpClient client = HttpClientBuilder.create().build();
    HttpResponse response = client.execute(post);
    BufferedReader rd = new BufferedReader(
        new InputStreamReader(response.getEntity().getContent()));
    StringBuffer userAgentParseResult = new StringBuffer();
    String line = "";
    while ((line = rd.readLine()) != null) {
      userAgentParseResult.append(line);
    }
    String parseResultString = userAgentParseResult.toString();
    JSONObject parseResultJSONObject = new JSONObject(parseResultString);
    return parseResultJSONObject;
  }

  private boolean isUserAgentResponseSuccess(JSONObject userAgentResponse) {
    try {
      String parseResult = userAgentResponse.getString("result");
      return "success".equals(parseResult);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return false;
  }

  private String getTranslationString(String key, String param1) {
    return MessageFormat.format(i18nProperties.getProperty(key), param1);
  }
}
