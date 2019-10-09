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
package org.wise.portal.presentation.web.controllers.teacher.project;

import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.impl.AddSharedTeacherParameters;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.presentation.web.exception.NotAuthorizedException;
import org.wise.portal.service.acl.AclService;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.mail.IMailFacade;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.user.UserService;

/**
 * Controller for sharing projects between teachers and
 * handling requests to grant/modify permissions on projects.
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author MattFish
 */
@Controller
@SessionAttributes("addSharedTeacherParameters")
public class ShareProjectController {

  @Autowired
  private ProjectService projectService;

  @Autowired
  private UserService userService;

  @Autowired
  private UserDetailsService userDetailsService;

  @Autowired
  private AclService<Project> aclService;

  @Autowired
  private IMailFacade mailService;

  @Autowired
  protected Properties appProperties;

  @Autowired
  private MessageSource messageSource;

  protected String formView = "teacher/projects/customized/shareproject";

  protected String successView = "teacher/projects/customized/shareproject";

  // change this to true if you are testing and do not want to send mail to the actual groups
  private static final Boolean DEBUG = false;

  // set this to your email for testing
  private static final String DEBUG_EMAIL = "youremail@email.com";

  /**
   * Called before the page is loaded to initialize values.
   * Adds the AddSharedTeacherParameters object as a form-backing
   * object. This object will be filled out and submitted for adding
   * new teachers to the shared teachers list.
   * @param modelMap the model object that contains values for the page to use when rendering the view
   * @param request the http request object
   * @return the path of the view to display
   */
  @GetMapping("/teacher/projects/customized/shareproject.html")
  public String initializeForm(ModelMap modelMap, HttpServletRequest request) throws Exception {
    User user = ControllerUtil.getSignedInUser();
    Project project = projectService.getById(Long.parseLong(request.getParameter("projectId")));
    String message = request.getParameter("message");
    populateModel(modelMap, user, project, message);
    return formView;
  }

  /**
   * Set the project, teacher names, and shared owners into the model
   * @param modelMap the model to add the objects to
   * @param user the signed in user
   * @param project the project
   * @param message the message to display
   * @return the populated model map
   * @throws Exception
   */
  private Map<String, Object> populateModel(Map<String, Object> modelMap, User user,
      Project project, String message) throws Exception {
    if (user.isAdmin() || aclService.hasPermission(project, BasePermission.ADMINISTRATION, user)) {
      if (message != null) {
        modelMap.put("message", message);
      }

      List<String> allTeacherUsernames = userDetailsService.retrieveAllTeacherUsernames();
      allTeacherUsernames.remove(project.getOwner().getUserDetails().getUsername());
      Set<User> sharedowners = project.getSharedowners();

      for (User sharedowner : sharedowners) {
        String sharedTeacherRole = projectService.getSharedTeacherRole(project, sharedowner);
        String username = sharedowner.getUserDetails().getUsername();
        allTeacherUsernames.remove(username);
        AddSharedTeacherParameters addSharedTeacherParameters = new AddSharedTeacherParameters();
        addSharedTeacherParameters.setPermission(sharedTeacherRole);
        addSharedTeacherParameters.setProject(project);
        addSharedTeacherParameters.setSharedOwnerUsername(username);
        modelMap.put(username, addSharedTeacherParameters);
      }

      modelMap.put("project", project);
      AlphabeticalStringComparator alphabeticalStringComparator = new AlphabeticalStringComparator();
      Collections.sort(allTeacherUsernames, alphabeticalStringComparator);
      String allTeacherUsernameString = StringUtils.join(allTeacherUsernames.iterator(), ":");
      modelMap.put("teacher_usernames", allTeacherUsernameString);
      AddSharedTeacherParameters params = new AddSharedTeacherParameters();
      params.setProject(project);
      params.setPermission(UserDetailsService.PROJECT_READ_ROLE);
      modelMap.put("addSharedTeacherParameters", params);
    } else {
      throw new NotAuthorizedException("You do not have permission to do that.");
    }
    return modelMap;
  }

  /**
   * On submission of the AddSharedTeacherParameters, the specified
   * teacher is granted the specified permission to the specified project.
   * @param params the object that contains values from the form
   * @param request the http request
   * @param model the model object that contains values for the page to use when rendering the view
   * @return the path of the view to display
   */
  @PostMapping("/teacher/projects/customized/shareproject.html")
  protected String onSubmit(
      @ModelAttribute("addSharedTeacherParameters") AddSharedTeacherParameters params,
      HttpServletRequest request,
      Model model) {
    String view = formView;
    User signedInUser = ControllerUtil.getSignedInUser();
    Project project = params.getProject();
    Serializable projectId = project.getId();

    try {
      project = projectService.getById(projectId);
      params.setProject(project);
    } catch (ObjectNotFoundException e1) {
      e1.printStackTrace();
    }

    String sharedOwnerUsername = params.getSharedOwnerUsername();
    User user = userService.retrieveUserByUsername(sharedOwnerUsername);
    if (user == null) {
      model.addAttribute("message", "Username not recognized. Make sure to use the exact spelling of the username.");
      view = formView;
    }  else if (!user.isTeacher()) {
      model.addAttribute("message", "The user is not a teacher and thus cannot be added as a shared teacher.");
      view = formView;
    }  else {
      if (params.getPermission().equals(UserDetailsService.PROJECT_SHARE_ROLE)) {

        if (!project.getOwner().equals(signedInUser) && !signedInUser.isAdmin()) {
          /*
           * the signed in user is not the owner of the project and is not an admin
           * so we will not let them give sharing permissions to the other user
           * and display an error message
           */
          model.addAttribute("message", "You cannot give sharing permissions because you are not the actual owner of this project.");
          view = formView;
        }
      }
      try {
        String removeUserFromProject = request.getParameter("removeUserFromProject");
        if (removeUserFromProject != null && Boolean.valueOf(removeUserFromProject)) {
          projectService.removeSharedTeacherFromProject(project, user);
        } else {
          boolean newSharedOwner = false;
          if (!project.getSharedowners().contains(user)) {
            newSharedOwner = true;
          }

          projectService.addSharedTeacherToProject(params);
          if (newSharedOwner) {
            String contextPath = request.getContextPath();
            Locale locale = request.getLocale();
            ShareProjectEmailService emailService = new ShareProjectEmailService(signedInUser, user,
                project, ControllerUtil.getBaseUrlString(request),locale, contextPath);
            Thread thread = new Thread(emailService);
            thread.start();
          }
        }

        view = successView;
      } catch (ObjectNotFoundException e) {
        // there was an error adding or removing the new shared teacher
        view = formView;
      } catch (Exception ex) {
        // exception sending email, ignore
        ex.printStackTrace();
      }
    }

    String message = null;

    Map<String, Object> asMap = model.asMap(); // get the model as a map so we can add objects to it
    try {
      // add the project, teacher names, and shared owners into the model
      populateModel(asMap, signedInUser, project, message);
    } catch (Exception e) {
      e.printStackTrace();
    }

    model.addAttribute("projectId", project.getId()); // add the project id to the model
    return view;
  }

  /**
   * Remove logged in user from a project's shared teacher list.
   * @param projectIdStr id of project
   * @param response HttpResponse
   * @return modelAndView
   * @throws Exception
   */
  @PostMapping("/teacher/projects/customized/unshareproject")
  protected void unshareSelfFromProject(
      @RequestParam("projectId") String projectIdStr,
      HttpServletResponse response) throws Exception {
    Long projectId = new Long(projectIdStr);
    Project project = projectService.getById(projectId);
    String username = ControllerUtil.getSignedInUser().getUserDetails().getUsername();
    User user = userService.retrieveUserByUsername(username);
    projectService.removeSharedTeacherFromProject(project, user);
    response.getWriter().write("success");
  }

  class ShareProjectEmailService implements Runnable {
    private User sharer;
    private User sharee;
    private Project project;
    private String portalBaseUrlString;
    private Locale locale;
    private String contextPath;

    public ShareProjectEmailService(User sharer, User sharee,
        Project project, String portalBaseUrlString, Locale locale, String contextPath) {
      this.sharer = sharer;
      this.sharee = sharee;
      this.project = project;
      this.portalBaseUrlString = portalBaseUrlString;
      this.locale = locale;
      this.contextPath = contextPath;
    }

    public void run() {
      sendEmail();
    }

    /*
     * sends an email to individuals to notify them that the project has been shared
     */
    private void sendEmail() {
      Date date = new Date();
      SimpleDateFormat sdf = new SimpleDateFormat("EEE, MMMMM d, yyyy");

      TeacherUserDetails sharerUserDetails = (TeacherUserDetails) sharer.getUserDetails();
      String sharerName = sharerUserDetails.getFirstname() + " " +
        sharerUserDetails.getLastname();
      String sharerEmailAddress = sharerUserDetails.getEmailAddress();

      TeacherUserDetails shareeDetails = (TeacherUserDetails) sharee.getUserDetails();

      String[] shareeEmailAddress = {shareeDetails.getEmailAddress()};

      String previewProjectUrl = this.portalBaseUrlString + this.contextPath + "/previewproject.html?projectId="+project.getId();

      String[] recipients = (String[]) ArrayUtils.addAll(shareeEmailAddress, appProperties.getProperty("uber_admin").split(","));

      String defaultSubject = messageSource.getMessage("presentation.web.controllers.teacher.project.customized.ShareProjectController.shareProjectConfirmationEmailSubject",
        new Object[] {sharerName}, Locale.US);
      String subject = messageSource.getMessage("presentation.web.controllers.teacher.project.customized.ShareProjectController.shareProjectConfirmationEmailSubject",
        new Object[] {sharerName}, defaultSubject, this.locale);
      String defaultMessage = messageSource.getMessage("presentation.web.controllers.teacher.project.customized.ShareProjectController.shareProjectConfirmationEmailBody",
        new Object[] {sharerName,project.getName(),project.getId(),shareeDetails.getUsername(),sdf.format(date), previewProjectUrl}, Locale.US);
      String message = messageSource.getMessage("presentation.web.controllers.teacher.project.customized.ShareProjectController.shareProjectConfirmationEmailBody",
        new Object[] {sharerName,project.getName(),project.getId(),shareeDetails.getUsername(),sdf.format(date), previewProjectUrl}, defaultMessage, this.locale);

      if (appProperties.containsKey("discourse_url")) {
        String discourseURL = appProperties.getProperty("discourse_url");
        if (discourseURL != null && !discourseURL.isEmpty()) {
          // if this WISE instance uses discourse for teacher community, append link to it in the P.S. section of the email
          String defaultPS = messageSource.getMessage("teacherEmailPSCommunity", new Object[] {discourseURL}, Locale.US);
          String pS = messageSource.getMessage("teacherEmailPSCommunity", new Object[] {discourseURL}, defaultPS, this.locale);
          message += "\n\n" + pS;
        }
      }

      String fromEmail = sharerEmailAddress;

      // for testing out the email functionality without spamming the groups
      if (DEBUG) {
        recipients[0] = DEBUG_EMAIL;
      }

      try {
        mailService.postMail(recipients, subject, message, fromEmail);
      } catch (MessagingException e) {
        // do nothing, no notification to uber_admin required.
        e.printStackTrace();
      }
    }
  }

  /**
   * Comparator used to order strings alphabetically
   */
  public static class AlphabeticalStringComparator implements Comparator<String> {

    /**
     * Compares two strings
     * @param string1 a string
     * @param string2 a string
     * @return
     * -1 if string1 comes before string2
     * 0 if string1 is the same as string2
     * 1 if string1 comes after string2
     */
    @Override
    public int compare(String string1, String string2) {
      int result = 0;
      if (string1 != null && string2 != null) {
        String string1LowerCase = string1.toLowerCase();
        String string2LowerCase = string2.toLowerCase();
        result = string1LowerCase.compareTo(string2LowerCase);
      }
      return result;
    }
  }
}
