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
package org.wise.portal.presentation.web.controllers.teacher.run;

import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.impl.AddSharedTeacherParameters;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.presentation.web.exception.NotAuthorizedException;
import org.wise.portal.service.acl.AclService;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.mail.IMailFacade;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.workgroup.WorkgroupService;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Controller for sharing runs between teachers and
 * handling requests to grant/modify permissions on project runs.
 *
 * @author Hiroki Terashima
 * @author Patrick Lawler
 * @author Geoffrey Kwan
 * @author Matt Fishbach
 */
@Controller
@SessionAttributes("addSharedTeacherParameters")
public class ShareProjectRunController {

  @Autowired
  private RunService runService;

  @Autowired
  private WorkgroupService workgroupService;

  @Autowired
  private UserService userService;

  @Autowired
  private UserDetailsService userDetailsService;

  @Autowired
  private AclService<Run> aclService;

  @Autowired
  private IMailFacade mailService;

  @Autowired
  protected Properties appProperties;

  @Autowired
  private MessageSource messageSource;

  protected static final String RUNID_PARAM_NAME = "runId";

  protected static final String RUN_PARAM_NAME = "run";

  private static final String ALL_TEACHER_USERNAMES = "teacher_usernames";

  private String formView = "teacher/run/shareprojectrun";

  private String successView = "teacher/run/shareprojectrun";

  // change this to true if you are testing and do not want to send mail to the actual groups
  private static final Boolean DEBUG = false;

  // set this to your email
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
  @RequestMapping(method = RequestMethod.GET, value = "/teacher/run/shareprojectrun.html")
  public String initializeForm(ModelMap modelMap, HttpServletRequest request) throws Exception {
    User user = ControllerUtil.getSignedInUser();
    Run run = runService.retrieveById(Long.parseLong(request.getParameter(RUNID_PARAM_NAME)));
    String message = request.getParameter("message");
    populateModel(modelMap, user, run, message);
    return formView;
  }

  /**
   * Set the run, teacher names, and shared owners into the model
   * @param modelMap the model to add the objects to
   * @param user the signed in user
   * @param run the run
   * @param message the message to display
   * @return the populated model map
   * @throws Exception
   */
  private Map<String, Object> populateModel(Map<String, Object> modelMap,
      User user, Run run, String message) throws Exception {
    if (user.isAdmin() || aclService.hasPermission(run, BasePermission.ADMINISTRATION, user)) {
      if (message != null) {
        modelMap.put("message", message);
      }
      List<String> allTeacherUsernames = userDetailsService.retrieveAllTeacherUsernames();
      allTeacherUsernames.remove(run.getOwner().getUserDetails().getUsername());
      Set<User> sharedowners = run.getSharedowners();
      for (User sharedowner : sharedowners) {
        String sharedTeacherRole = runService.getSharedTeacherRole(run, sharedowner);
        String username = sharedowner.getUserDetails().getUsername();
        allTeacherUsernames.remove(username);
        AddSharedTeacherParameters addSharedTeacherParameters = new AddSharedTeacherParameters();
        addSharedTeacherParameters.setPermission(sharedTeacherRole);
        addSharedTeacherParameters.setRun(run);
        addSharedTeacherParameters.setSharedOwnerUsername(username);
        modelMap.put(username, addSharedTeacherParameters);
      }
      modelMap.put(RUN_PARAM_NAME, run);
      modelMap.put(RUNID_PARAM_NAME, run.getId());
      AlphabeticalStringComparator alphabeticalStringComparator = new AlphabeticalStringComparator();
      Collections.sort(allTeacherUsernames, alphabeticalStringComparator);
      String allTeacherUsernameString = StringUtils.join(allTeacherUsernames.iterator(), ":");
      modelMap.put(ALL_TEACHER_USERNAMES, allTeacherUsernameString);
      AddSharedTeacherParameters params = new AddSharedTeacherParameters();
      params.setRun(run);
      params.setPermission(UserDetailsService.RUN_READ_ROLE);
      modelMap.put("addSharedTeacherParameters", params);
    } else {
      throw new NotAuthorizedException("You do not have permission to share this run.");
    }
    return modelMap;
  }

  /**
   * On submission of the AddSharedTeacherParameters, the specified
   * teacher is granted the specified permission to the specified run.
   * Only teachers can be added as a shared teacher to a run.
   * @param params the model object that contains values for the page to use when rendering the view
   * @param request the http request object
   * @param model the object that contains values to be displayed on the page
   * @return the path of the view to display
   */
  @RequestMapping(method = RequestMethod.POST, value = "/teacher/run/shareprojectrun.html")
  protected String onSubmit(
      @ModelAttribute("addSharedTeacherParameters") AddSharedTeacherParameters params,
      HttpServletRequest request,
      Model model) {
    String view = formView;
    User signedInUser = ControllerUtil.getSignedInUser();
    Run run = params.getRun();
    Long runId = run.getId();

    try {
      run = runService.retrieveById(runId);
      params.setRun(run);
    } catch (ObjectNotFoundException e1) {
      e1.printStackTrace();
    }

    String message = null;
    User shareWithUser = userService.retrieveUserByUsername(params.getSharedOwnerUsername());
    if (shareWithUser == null) {
      message = "Username not recognized. Make sure to use the exact spelling of the username.";
      view = formView;
    } else if (!shareWithUser.getUserDetails().hasGrantedAuthority(UserDetailsService.TEACHER_ROLE)) {
      message = "The user is not a teacher and thus cannot be added as a shared teacher.";
      view = formView;
    } else {
      try {
        String removeUserFromRun = request.getParameter("removeUserFromRun");
        if (removeUserFromRun != null && Boolean.valueOf(removeUserFromRun)) {
          runService.removeSharedTeacher(params.getSharedOwnerUsername(), run.getId());
        } else {
          if (run.getSharedowners().contains(shareWithUser)) {
            runService.updateSharedTeacherForRun(params);
          } else {
            runService.addSharedTeacher(params);
            String sharedOwnerUsername = params.getSharedOwnerUsername();
            User sharedOwner = userService.retrieveUserByUsername(sharedOwnerUsername);
            Set<User> sharedOwners = new HashSet<User>();
            sharedOwners.add(sharedOwner);
            workgroupService.createWorkgroup("teacher", sharedOwners, run, null);

            Locale locale = request.getLocale();
            ProjectRunEmailService emailService = new ProjectRunEmailService(signedInUser, shareWithUser,  run, locale);
            Thread thread = new Thread(emailService);
            thread.start();
          }
        }
      } catch (ObjectNotFoundException e) {
        view = formView;
      }
      view = successView;
    }

    Map<String, Object> asMap = model.asMap();
    try {
      populateModel(asMap, signedInUser, run, message);
    } catch (Exception e) {
      e.printStackTrace();
    }
    return view;
  }

  /**
   * Removes logged-in user from the specified run's shared teacher list
   * @param runId
   * @param response
   * @return
   * @throws Exception
   */
  @RequestMapping(method = RequestMethod.POST, value = "/teacher/run/unshareprojectrun")
  protected ModelAndView unshareSelfFromRun(
      @RequestParam("runId") String runId,
      HttpServletResponse response) throws Exception {
    Long runIdToRemove = new Long(runId);
    String usernameToRemove = ControllerUtil.getSignedInUser().getUserDetails().getUsername();
    runService.removeSharedTeacher(usernameToRemove, runIdToRemove);
    response.getWriter().write("success");
    return null;
  }

  class ProjectRunEmailService implements Runnable {
    private User sharer;
    private User sharee;
    private Run run;
    private Locale locale;

    public ProjectRunEmailService(User sharer, User sharee, Run run, Locale locale) {
      this.sharer = sharer;
      this.sharee = sharee;
      this.run = run;
      this.locale = locale;
    }

    public void run() {
      sendEmail();
    }

    /**
     * Sends an email to individuals to notify them that the run has been shared
     * On exception sending the email, ignore.
     */
    private void sendEmail() {
      Date date = new Date();
      SimpleDateFormat sdf = new SimpleDateFormat("EEE, MMMMM d, yyyy");

      TeacherUserDetails sharerUserDetails = (TeacherUserDetails) sharer.getUserDetails();
      String sharerName = sharerUserDetails.getFirstname() + " " + sharerUserDetails.getLastname();
      String sharerEmailAddress = sharerUserDetails.getEmailAddress();

      TeacherUserDetails shareeDetails = (TeacherUserDetails) sharee.getUserDetails();

      String[] shareeEmailAddress = {shareeDetails.getEmailAddress()};
      String[] recipients = (String[]) ArrayUtils.addAll(shareeEmailAddress, appProperties.getProperty("uber_admin").split(","));

      String defaultSubject = messageSource.getMessage("presentation.web.controllers.teacher.run.ShareProjectRunController.shareProjectRunConfirmationEmailSubject",
          new Object[] {sharerName}, Locale.US);
      String subject = messageSource.getMessage("presentation.web.controllers.teacher.run.ShareProjectRunController.shareProjectRunConfirmationEmailSubject",
          new Object[] {sharerName}, defaultSubject, locale);

      String defaultMessage = messageSource.getMessage("presentation.web.controllers.teacher.run.ShareProjectRunController.shareProjectRunConfirmationEmailBody",
          new Object[] {sharerName}, Locale.US);
      String message = messageSource.getMessage("presentation.web.controllers.teacher.run.ShareProjectRunController.shareProjectRunConfirmationEmailBody",
          new Object[] {sharerName, run.getName(), run.getId(), run.getProject().getName(), run.getProject().getId(), shareeDetails.getUsername(), sdf.format(date) },
          defaultMessage, locale);

      if (appProperties.containsKey("discourse_url")) {
        String discourseURL = appProperties.getProperty("discourse_url");
        if (discourseURL != null && !discourseURL.isEmpty()) {
          // if this WISE instance uses discourse for teacher community, append link to it in the P.S. section of the email
          String defaultPS = messageSource.getMessage("teacherEmailPSCommunity", new Object[] {discourseURL}, Locale.US);
          String pS = messageSource.getMessage("teacherEmailPSCommunity", new Object[] {discourseURL}, defaultPS, locale);
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
