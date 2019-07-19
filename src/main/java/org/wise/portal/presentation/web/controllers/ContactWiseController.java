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
package org.wise.portal.presentation.web.controllers;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Properties;
import java.util.Vector;

import javax.servlet.http.HttpServletRequest;

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
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.general.contactwise.IssueType;
import org.wise.portal.domain.general.contactwise.OperatingSystem;
import org.wise.portal.domain.general.contactwise.WebBrowser;
import org.wise.portal.domain.general.contactwise.impl.ContactWISEForm;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.validators.general.contactwise.ContactWISEValidator;
import org.wise.portal.service.mail.IMailFacade;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.user.UserService;

@Controller
@SessionAttributes("contactWISEForm")
@RequestMapping("/legacy/contact/contactwise.html")
public class ContactWiseController {

  @Autowired
  protected IMailFacade mailService;

  @Autowired
  protected Properties i18nProperties;

  @Autowired
  private ProjectService projectService;

  @Autowired
  private RunService runService;

  @Autowired
  private UserService userService;

  @Autowired
  private Properties appProperties;

  @Autowired
  private ContactWISEValidator contactWISEValidator;

  // change this to true if you are testing and do not want to send mail to the actual groups
  private static final Boolean DEBUG = false;

  private static final String DEBUG_EMAIL = "youremail@gmail.com";

  // the url to the user agent parse site
  private static final String userAgentParseURL =
      "http://api.whatismybrowser.com/api/v1/user_agent_parse";

  @RequestMapping(method = RequestMethod.POST)
  public String submitContactForm(
      @ModelAttribute("contactWISEForm")ContactWISEForm contactWISEForm,
      BindingResult result,
      HttpServletRequest request)
      throws Exception {
    contactWISEValidator.validate(contactWISEForm, result);
    checkRecaptcha(request, result);
    getTeacherNameAndSetInForm(contactWISEForm);

    if (result.hasErrors()) {
      return "contact/contactwise";
    }

    // get our user key for the user agent parse site
    String userKey = appProperties.getProperty("userAgentParseKey");

    if (userKey != null && !userKey.equals("")) {
      String userAgent = request.getParameter("usersystem");
      HttpClient client = HttpClientBuilder.create().build();
      HttpPost post = new HttpPost(userAgentParseURL);

      List<NameValuePair> urlParameters = new ArrayList<NameValuePair>();
      urlParameters.add(new BasicNameValuePair("user_key", userKey));
      urlParameters.add(new BasicNameValuePair("user_agent", userAgent));

      post.setEntity(new UrlEncodedFormEntity(urlParameters));

      try {
        HttpResponse response = client.execute(post);
        BufferedReader rd = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
        StringBuffer userAgentParseResult = new StringBuffer();
        String line = "";
        while ((line = rd.readLine()) != null) {
          userAgentParseResult.append(line);
        }

        String parseResultString = userAgentParseResult.toString();

        try {
          JSONObject parseResultJSONObject = new JSONObject(parseResultString);
          String parseResult = parseResultJSONObject.getString("result");
          if (parseResult != null && parseResult.equals("success")) {
            JSONObject parse = parseResultJSONObject.getJSONObject("parse");
            String operatingSystemName = parse.getString("operating_system_name");
            String operatingSystemVersion = parse.getString("operating_system_version_full");
            String browserName = parse.getString("browser_name");
            String browserVersion = parse.getString("browser_version_full");
            contactWISEForm.setOperatingSystemName(operatingSystemName);
            contactWISEForm.setOperatingSystemVersion(operatingSystemVersion);
            contactWISEForm.setBrowserName(browserName);
            contactWISEForm.setBrowserVersion(browserVersion);
          }
        } catch(JSONException e) {
          e.printStackTrace();
        }
      } catch(IOException e) {
        e.printStackTrace();
      } catch(Exception e) {
        e.printStackTrace();
      }
    }

    String[] recipients = getMailRecipients();
    String[] cc = getMailCcs(contactWISEForm);
    String subject = contactWISEForm.getMailSubject();
    String fromEmail = contactWISEForm.getEmail();
    String message = contactWISEForm.getMailMessage();

    if (fromEmail == null) {
      /*
       * set the fromEmail to a non null and non empty string otherwise
       * an exception will be thrown
       */
      fromEmail = "null";
    }

    Long runId = contactWISEForm.getRunId();

    /*
     * if a student is submitting the contactwiseproject form, the runId will
     * be set. if a teacher is submitting the contactwiseproject form, the
     * runId will not be set. this is ok because the teacher is the run
     * owner and their email is already in the cc array
     */
    if (runId != null) {
      Run run = runService.retrieveById(runId);
      Vector<String> runOwnerEmailAddresses = new Vector<String>();
      User runOwner = run.getOwner();
      MutableUserDetails userDetails = runOwner.getUserDetails();
      String emailAddress = userDetails.getEmailAddress();

      if (emailAddress != null) {
        runOwnerEmailAddresses.add(emailAddress);
      }

      if (!runOwnerEmailAddresses.isEmpty()) {
        for (int x = 0; x < cc.length; x++) {
          if (!runOwnerEmailAddresses.contains(cc[x])) {
            runOwnerEmailAddresses.add(cc[x]);
          }
        }
        cc = new String[runOwnerEmailAddresses.size()];
        for (int x = 0; x < runOwnerEmailAddresses.size(); x++) {
          cc[x] = runOwnerEmailAddresses.get(x);
        }
      }
    }

    if (DEBUG) {
      cc = new String[1];
      cc[0] = fromEmail;
      recipients[0] = DEBUG_EMAIL;
    }

    mailService.postMail(recipients, subject, message, fromEmail, cc);
    return "contact/contactwiseconfirm";
  }

  @GetMapping
  public String initializeForm(ModelMap modelMap, HttpServletRequest request)
      throws NumberFormatException, ObjectNotFoundException {
    ContactWISEForm contactWISEForm = new ContactWISEForm();
    User user = ControllerUtil.getSignedInUser();

    // if the user is logged in to the session, auto populate the name and
    // email address in the form, if not, the fields will just be blank
    if (user != null) {
      contactWISEForm.setIsStudent(user);
      MutableUserDetails userDetails = user.getUserDetails();
      contactWISEForm.setName(userDetails.getFirstname() + " " + userDetails.getLastname());

      // TODO: this check may be removed later if we never allow students to submit feedback
      if (userDetails instanceof TeacherUserDetails) {
        contactWISEForm.setEmail(userDetails.getEmailAddress());
      }
    }

    if (request.getParameter("projectId") != null) {
      Project project = projectService.getById(Long.parseLong(request.getParameter("projectId")));
      if (project != null) {
        contactWISEForm.setProjectName(project.getName());
        contactWISEForm.setProjectId(Long.parseLong(request.getParameter("projectId")));
      }
    }

    String runId = request.getParameter("runId");
    if (runId != null) {
      contactWISEForm.setRunId(new Long(runId));
      Run run = runService.retrieveById(new Long(runId));
      User owner = run.getOwner();
      String teacherName = owner.getUserDetails().getFirstname() + " "+ owner.getUserDetails().getLastname();
      contactWISEForm.setTeacherName(teacherName);
    }

    IssueType.setProperties(i18nProperties);
    OperatingSystem.setProperties(i18nProperties);
    WebBrowser.setProperties(i18nProperties);
    modelMap.put("contactWISEForm", contactWISEForm);
    return "contact/contactwise";
  }

  /**
   * Set the issue types into the model
   * @return an array of IssueType objects that will be used to populate the
   * issue types drop down in the contact WISE form
   */
  @ModelAttribute("issuetypes")
  public IssueType[] populateIssueTypes() {
    return IssueType.values();
  }

  /**
   * Set the ReCaptcha public key
   * @return a string containing the ReCaptcha public key that will be used
   * to determine if we should display the ReCaptcha image on the bottom
   * of the form
   */
  @ModelAttribute("reCaptchaPublicKey")
  public String populateReCaptchaPublicKey() {
    return appProperties.getProperty("recaptcha_public_key");
  }

  /**
   * Set the ReCaptcha private key
   * @return a string containing the ReCaptcha private key that will be used
   * to determine if we should display the ReCaptcha image on the bottom
   * of the form
   */
  @ModelAttribute("reCaptchaPrivateKey")
  public String populateReCaptchaPrivateKey() {
    return appProperties.getProperty("recaptcha_private_key");
  }

  /**
   * Set the user object
   * @return a user object that will be used by the form
   */
  @ModelAttribute("user")
  public User populateUser() {
    return ControllerUtil.getSignedInUser();
  }

  /**
   * Set the WISE version
   * @return a string containing the WISE version
   */
  @ModelAttribute("wiseVersion")
  public Object populateWISEVersion() {
    return ControllerUtil.getWISEVersion();
  }

  /**
   * Set the teachers if the user is a student
   * @return a vector of teacher user objects that will be used to populate
   * the teacher drop down in the contact WISE form
   */
  @ModelAttribute("teachers")
  public Vector<User> populateTeachers() {
    Vector<User> teachers = new Vector<User>();
    User user = ControllerUtil.getSignedInUser();
    if (user != null) {
      MutableUserDetails userDetails = user.getUserDetails();
      if (userDetails != null && userDetails instanceof StudentUserDetails) {
        List<Run> runList = runService.getRunList(user);
        Iterator<Run> runListIterator = runList.iterator();
        while (runListIterator.hasNext()) {
          Run tempRun = runListIterator.next();
          User owner = tempRun.getOwner();
          if (!teachers.contains(owner)) {
            teachers.add(owner);
          }
        }
      }
    }
    return teachers;
  }

  /**
   * Set the Discourse SSO login url
   * @return a string containing the Discourse SSO login url that will be
   * used to display a link to the Discourse page if the user is a teacher
   */
  @ModelAttribute("discourseSSOLoginURL")
  public String populateDiscourseSSOLoginURL() {
    String discourseSSOLoginURL = null;
    User user = ControllerUtil.getSignedInUser();
    if (user != null) {
      MutableUserDetails userDetails = user.getUserDetails();
      if (userDetails != null && userDetails instanceof TeacherUserDetails) {
        // if discourse is enabled for this WISE instance, add the link to the model
        // so the view can display it
        String discourseURL = appProperties.getProperty("discourse_url");
        if (discourseURL != null && !discourseURL.isEmpty()) {
          discourseSSOLoginURL = discourseURL + "/session/sso";
        }
      }
    }
    return discourseSSOLoginURL;
  }

  /**
   * If the user is not logged in, we will check that they answered the reCaptcha correctly.
   * This is called after ContactWISEValidator.validate()
   */
  protected void checkRecaptcha(HttpServletRequest request, BindingResult result) {
    User user = ControllerUtil.getSignedInUser();
    if (user == null) {
      /*
       * the user is not signed in so we will display a reCaptcha if the server
       * has been set up with reCaptcha
       */
      if (ControllerUtil.isReCaptchaEnabled()) {
        String gRecaptchaResponse = request.getParameter("g-recaptcha-response");
        boolean isResponseValid = ControllerUtil.isReCaptchaResponseValid(gRecaptchaResponse);
        if (!isResponseValid) {
          String reCaptchaError = "";
          if (i18nProperties != null) {
            reCaptchaError = i18nProperties.getProperty("error.contactwise-recaptcha");
          }
          if (reCaptchaError == null) {
            reCaptchaError = "";
          }
          result.reject("400", reCaptchaError);
        }
      }
    }
  }

  public String[] getMailRecipients() {
    String[] recipients = new String[0];
    String contactEmail = appProperties.getProperty("contact_email");
    recipients = contactEmail.split(",");
    if (recipients.length == 0) {
      /*
       * we did not have an email address for the issue type so we will try
       * to use the uber_admin email address
       */
      String uberAdminEmailAddress = appProperties.getProperty("uber_admin");
      if (uberAdminEmailAddress != null && !uberAdminEmailAddress.equals("")) {
        recipients = uberAdminEmailAddress.split(",");
      }
    }
    return recipients;
  }

  public String[] getMailCcs(ContactWISEForm contactWISEForm) {
    String emailToCC = contactWISEForm.getEmail();
    String[] cc = {};
    List<String> list = new ArrayList<String>();
    if (emailToCC != null) {
      list.add(emailToCC);
    }

    /*
     * get the teacher id. this is only used when a student is making
     * a contact request. when a teacher is making a contact request,
     * getTeacherId() will return null and the teacher's email will
     * already have been added just above this.
     */
    Long tempTeacherId = contactWISEForm.getTeacherId();
    String teacherEmail = getTeacherEmail(tempTeacherId);
    if (teacherEmail != null) {
      list.add(teacherEmail);
    }
    return list.toArray(cc);
  }

  /**
   * Get the teacher email address
   * @param userId the teacher user id
   * @return the teacher email address or null if no user id
   * is provided or a user is not found
   */
  protected String getTeacherEmail(Long userId) {
    String email = null;
    if (userId != null) {
      try {
        User user = userService.retrieveById(userId);
        if (user != null) {
          MutableUserDetails userDetails = user.getUserDetails();
          email = userDetails.getEmailAddress();
        }
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
    return email;
  }

  /**
   * Get the teacher name
   * @param contactWISEForm the teacher user id
   * @return the teacher name or null
   */
  protected void getTeacherNameAndSetInForm(ContactWISEForm contactWISEForm) {
    String name = null;
    if (contactWISEForm.getTeacherId() != null) {
      try {
        User user = userService.retrieveById(contactWISEForm.getTeacherId());
        if (user != null) {
          MutableUserDetails userDetails = user.getUserDetails();
          if (userDetails instanceof TeacherUserDetails) {
            String firstName = ((TeacherUserDetails) userDetails).getFirstname();
            String lastName = ((TeacherUserDetails) userDetails).getLastname();
            name = firstName + " " + lastName;
          }
        }
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
    contactWISEForm.setTeacherName(name);
  }
}
