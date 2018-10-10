package org.wise.portal.presentation.web.controllers.user;

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.general.contactwise.IssueType;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.presentation.web.exception.IncorrectPasswordException;
import org.wise.portal.presentation.web.exception.NotAuthorizedException;
import org.wise.portal.presentation.web.response.SimpleResponse;
import org.wise.portal.service.mail.IMailFacade;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.user.UserService;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import java.io.*;
import java.util.*;

/**
 * Controller for User REST API
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author Jonathan Lim-Breitbart
 */
@RestController
@RequestMapping("/site/api/user")
public class UserAPIController {

  @Autowired
  private Properties wiseProperties;

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

  @RequestMapping(value = "/user", method = RequestMethod.GET)
  protected String getUserInfo(ModelMap modelMap,
      @RequestParam(value = "pLT", required = false) String previousLoginTime) throws Exception {
    User user = ControllerUtil.getSignedInUser();
    if (user != null) {
      MutableUserDetails userDetails = user.getUserDetails();

      Boolean isStudent = false;
      Boolean isAdmin = false;
      Boolean isResearcher = false;
      Boolean isTeacher = false;
      for (GrantedAuthority authority : userDetails.getAuthorities()) {
        if (authority.getAuthority().equals("ROLE_STUDENT")) {
          isStudent = true;
          break;
        } else if (authority.getAuthority().equals("ROLE_ADMINISTRATOR")) {
          isAdmin = true;
          break;
        } else if (authority.getAuthority().equals("ROLE_RESEARCHER")) {
          isResearcher = true;
        } else if (authority.getAuthority().equals("ROLE_TEACHER")) {
          isTeacher = true;
        }
      }

      JSONObject userJSON = new JSONObject();
      userJSON.put("id", user.getId());
      userJSON.put("firstName", userDetails.getFirstname());
      userJSON.put("lastName", userDetails.getLastname());
      userJSON.put("userName", userDetails.getUsername());

      if (isStudent) {
        userJSON.put("role", "student");
      } else if (isAdmin) {
        userJSON.put("role", "admin");
      } else if (isResearcher) {
        userJSON.put("role", "researcher");
      } else if (isTeacher) {
        userJSON.put("role", "teacher");
      }

      if (!isStudent) {
        TeacherUserDetails teacherUserDetails = (TeacherUserDetails) userDetails;
        userJSON.put("displayName", teacherUserDetails.getDisplayname());
        userJSON.put("email", teacherUserDetails.getEmailAddress());
        userJSON.put("city", teacherUserDetails.getCity());
        userJSON.put("state", teacherUserDetails.getState());
        userJSON.put("country", teacherUserDetails.getCountry());
        userJSON.put("schoolName", teacherUserDetails.getSchoolname());
        userJSON.put("schoolLevel", teacherUserDetails.getSchoollevel());
      }
      String language = userDetails.getLanguage();
      if (language == null) {
        language = "en";
      }
      userJSON.put("language", language);

      return userJSON.toString();
    } else {
      JSONObject userJSON = new JSONObject();
      return userJSON.toString();
    }
  }

  @RequestMapping(value = "/config", method = RequestMethod.GET)
  protected String getConfig(ModelMap modelMap, HttpServletRequest request) throws JSONException {
    JSONObject configJSON = new JSONObject();
    String contextPath = request.getContextPath();
    configJSON.put("contextPath", contextPath);
    configJSON.put("googleClientId", wiseProperties.get("google.clientId"));
    configJSON.put("logOutURL", contextPath + "/logout");
    return configJSON.toString();
  }

  @ResponseBody
  @RequestMapping(value = "/password", method = RequestMethod.POST)
  protected SimpleResponse changePassword(@RequestParam("username") String username,
      @RequestParam("oldPassword") String oldPassword,
      @RequestParam("newPassword") String newPassword) throws NotAuthorizedException, JSONException {
    User user = ControllerUtil.getSignedInUser();
    if (user.getUserDetails().getUsername().equals(username)) {
      try {
        User result = userService.updateUserPassword(user, oldPassword, newPassword);
        return new SimpleResponse("message", "success");
      } catch(IncorrectPasswordException e) {
        return new SimpleResponse("message", "incorrect password");
      }
    } else {
      throw new NotAuthorizedException("username is not the same as signed in user");
    }
  }

  @ResponseBody
  @RequestMapping(value = "/languages", method = RequestMethod.GET)
  protected String getSupportedLanguages() throws JSONException {
    String supportedLocales = wiseProperties.getProperty("supportedLocales");
    String[] supportedLocalesArray = supportedLocales.split(",");
    JSONArray supportedLocalesJSONArray = new JSONArray();
    for (String localeString: supportedLocalesArray) {
      String language = getLanguageName(localeString);
      JSONObject localeAndLanguage = new JSONObject();
      localeAndLanguage.put("locale", localeString);
      localeAndLanguage.put("language", language);
      supportedLocalesJSONArray.put(localeAndLanguage);
    }
    return supportedLocalesJSONArray.toString();
  }

  protected String getLanguageName(String localeString) {
    if (localeString.toLowerCase().equals("zh_tw")) {
      return "Chinese (Traditional)";
    } else if (localeString.toLowerCase().equals("zh_cn")) {
      return "Chinese (Simplified)";
    } else {
      Locale locale = new Locale(localeString);
      return locale.getDisplayLanguage();
    }
  }

  @ResponseBody
  @RequestMapping(value = "/contact", method = RequestMethod.POST)
  protected String sendContactMessage(
      @RequestParam(value = "name") String name,
      @RequestParam(value = "email", required = false) String email,
      @RequestParam(value = "issueType") String issueType,
      @RequestParam(value = "summary") String summary,
      @RequestParam(value = "description") String description,
      @RequestParam(value = "runId", required = false) Long runId,
      @RequestParam(value = "projectId", required = false) Integer projectId,
      @RequestParam(value = "userAgent", required = false) String userAgent) throws JSONException {
    User signedInUser = ControllerUtil.getSignedInUser();
    boolean isStudent = signedInUser.isStudent();
    String issueTypeValue = getIssueTypeValue(issueType);
    String fromEmail = wiseProperties.getProperty("portalemailaddress");
    String[] toEmails = getContactMessageRecipients(email, runId);
    String[] cc = new String[0];
    String subject = getSubject(issueTypeValue, summary);
    String body = getContactEmailBody(name, email, issueTypeValue, summary, description, runId, projectId, userAgent, isStudent);
    JSONObject response = sendEmail(fromEmail, toEmails, cc, subject, body);
    return response.toString();
  }

  private JSONObject sendEmail(String fromEmail, String[] toEmails, String[] cc, String subject, String body) throws JSONException {
    JSONObject response = new JSONObject();
    try {
      mailService.postMail(toEmails, subject, body, fromEmail, cc);
      response.put("status", "success");
    } catch (MessagingException e) {
      e.printStackTrace();
      response.put("status", "failure");
    }
    return response;
  }

  private String getSubject(String issueType, String summary) {
    String contactWISEString = i18nProperties.getProperty("contact_wise");
    return "[" + contactWISEString + "] " + issueType + ": " + summary;
  }

  protected String[] getContactMessageRecipients(String email, Long runId) {
    String contactEmailString = wiseProperties.getProperty("contact_email");
    String[] recipients = contactEmailString.split(",");
    ArrayList<String> allRecipients = new ArrayList<String>(Arrays.asList(recipients));
    if (email != null) {
      allRecipients.add(email);
    } else if (runId != null) {
      allRecipients.add(getTeacherEmail(runId));
    }
    return allRecipients.toArray(new String[allRecipients.size()]);
  }

  private String getContactEmailBody(String name, String email, String issueType,
                                     String summary, String description, Long runId,
                                     Integer projectId, String userAgent, Boolean isStudent) {

    StringBuffer body = new StringBuffer();
    if (isStudent) {
      addStudentGeneratedRequestBody(body, description, name, runId);
    } else {
      addTeacherGeneratedRequestBody(body, description, name, email);
    }

    addProjectAndRunDetailsToBody(body, runId, projectId);

    try {
      addUserSystemDetailsToBody(body, userAgent);
    } catch (IOException e) {
    } catch (JSONException e) {
    }
    return body.toString();
  }

  private void appendLine(StringBuffer body, String text) {
    body.append(text);
    body.append("\n");
  }

  private String getIssueTypeValue(String issueType) {
    IssueType.setProperties(i18nProperties);
    return IssueType.valueOf(issueType).toString();
  }

  private void addStudentGeneratedRequestBody(StringBuffer body, String description, String name, Long runId) {
    if (runId != null) {
      User teacher = getTeacherForRun(runId);
      TeacherUserDetails teacherUserDetails = (TeacherUserDetails) teacher.getUserDetails();
      String displayName = teacherUserDetails.getDisplayname();
      appendLine(body, "Dear " + displayName + ",\n");
      appendLine(body, "One of your students has submitted a WISE trouble ticket. We recommend that you follow up with your student if necessary. If you need further assistance, you can 'Reply to all' on this email to contact us.\n");
    }
    appendLine(body, "Description: " + description);
    appendLine(body, "Name: " + name);
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

  private void addTeacherGeneratedRequestBody(StringBuffer body, String description, String name, String email) {
    appendLine(body, "Your message has been sent. Thank you for contacting WISE. We will try to get back to you as soon as possible.\n");
    appendLine(body, "Description: " + description);
    appendLine(body, "Name: " + name);
    appendLine(body, "Email: " + email);
  }

  private void addProjectAndRunDetailsToBody(StringBuffer body, Long runId, Integer projectId) {
    if (runId != null) {
      try {
        Run run = runService.retrieveById(runId);
        Project project = run.getProject();
        appendLine(body, "Project Name: " + project.getName());
        appendLine(body, "Project ID: " + project.getId());
        appendLine(body, "Run ID: " + runId);
      } catch (ObjectNotFoundException e) {
      }
    } else if (projectId != null) {
      try {
        Project project = projectService.getById(projectId);
        appendLine(body, "Project Name: " + project.getName());
        appendLine(body, "Project ID: " + projectId);
      } catch (ObjectNotFoundException e) {
      }
    }
  }

  private void addUserSystemDetailsToBody(StringBuffer body, String userAgent)
      throws IOException, JSONException {
    if(wisePropertiesHasUserAgentParseKey()) {
      JSONObject userSystemDetails = getUserAgentParseResult(userAgent);
      addOperatingSystemToBody(body, userSystemDetails);
      addBrowserToBody(body, userSystemDetails);
    }
  }

  private void addOperatingSystemToBody(StringBuffer body, JSONObject userSystemDetails) {
    try {
      String operatingSystemName = userSystemDetails.getString("operating_system");
      String operatingSystemVersion = userSystemDetails.getString("operating_system_version_full");
      appendLine(body, "Operating System: " + operatingSystemName + " " + operatingSystemVersion);
    } catch(JSONException e) {
    }
  }

  private void addBrowserToBody(StringBuffer body, JSONObject userSystemDetails) {
    try {
      String browserName = userSystemDetails.getString("browser_name");
      String browserVersion = userSystemDetails.getString("browser_version_full");
      appendLine(body, "Browser: " + browserName + " " + browserVersion);
    } catch(JSONException e) {

    }
  }

  private boolean wisePropertiesHasUserAgentParseKey() {
    String userKey = wiseProperties.getProperty("userAgentParseKey");
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
    String userKey = wiseProperties.getProperty("userAgentParseKey");
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
    BufferedReader rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
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
}
