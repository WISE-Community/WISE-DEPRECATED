/**
 * Copyright (c) 2007-2017 Regents of the University of California (Regents).
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
package org.wise.portal.presentation.web.controllers.forgotaccount.student;

import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.validation.ValidationUtils;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.SessionAttributes;
import org.springframework.web.bind.support.SessionStatus;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.impl.PasswordReminderParameters;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.user.UserService;

/**
 * Controller for the wizard to "Remind the student of their password"
 *
 * The default getTargetPage() method is used to find out which page to navigate
 * to, so the controller looks for a request parameter starting with "_target"
 * and ending with a number (e.g. "_target1"). The jsp pages should provide
 * these parameters.
 *
 * General method invocation flow (when user clicks on "prev" and "next"): 1)
 * onBind 2) onBindAndValidate 3) validatePage 4) referenceData Note that on
 * user's first visit to the first page of the wizard, only referenceData will
 * be invoked, and steps 1-4 are bypassed.
 *
 * @author Anthony Perritano
 */
@Controller
@RequestMapping("/legacy/forgotaccount/student/passwordreminder")
@SessionAttributes("passwordReminderParameters")
public class PasswordReminderWizardController {

  private static final String ACCOUNT_QUESTION = "accountQuestion";

  private static final String USERNAME = "username";

  @Autowired
  protected UserService userService;

  /**
   * The default handler (page=0)
   */
  @RequestMapping
  public String getInitialPage(final ModelMap modelMap) {
    // put your initial command
    modelMap.addAttribute("passwordReminderParameters", new PasswordReminderParameters());
    // populate the model Map as needed
    return "forgotaccount/student/passwordreminder";
  }

  /**
   * Maybe you want to be provided with the _page parameter (in order to map the same method for all), as you have in
   * AbstractWizardFormController.
   */
  @RequestMapping(method = RequestMethod.POST)
  public String processPage(@RequestParam("_page") final int currentPage,
      final @ModelAttribute("passwordReminderParameters") PasswordReminderParameters passwordReminderParameters,
      BindingResult result,
      SessionStatus status,
      ModelMap modelMap,
      final HttpServletResponse response) {

    switch (currentPage) {
      case 1:
        // handle the submit username

        try {
          String username = passwordReminderParameters.getUsername();
          username = StringUtils.trimToNull(username);

          if (username == null) {
            result.rejectValue("username", "presentation.web.controllers.forgotaccount.student.PasswordReminderWizardController.errorNoUsername");
          } else if (!StringUtils.isAlphanumeric(username)) {
            result.rejectValue("username", "presentation.web.controllers.forgotaccount.student.PasswordReminderWizardController.errorNoUsername");
          } else {
            // check to see if user exists and ensure that user is a student
            User user = userService.retrieveUserByUsername(username);

            if (user == null || !(user.getUserDetails() instanceof StudentUserDetails)) {
              result.rejectValue("username", "presentation.web.controllers.forgotaccount.student.PasswordReminderWizardController.errorUsernameNotFound");
            }
          }
        } catch (EmptyResultDataAccessException e) {
          result.rejectValue("username", "presentation.web.controllers.forgotaccount.student.PasswordReminderWizardController.errorUsernameNotFound");
        }
        if (result.hasErrors()) {
          return "forgotaccount/student/passwordreminder";
        }

        // passed validation, put username and account question into page
        String username = passwordReminderParameters.getUsername();

        username = StringUtils.trimToNull(username);
        User user = userService.retrieveUserByUsername(username);

        StudentUserDetails userDetails = (StudentUserDetails) user.getUserDetails();

        modelMap.put(USERNAME, userDetails.getUsername());
        modelMap.put(ACCOUNT_QUESTION, userDetails.getAccountQuestion());

        passwordReminderParameters.setAccountQuestion(userDetails.getAccountQuestion());
        passwordReminderParameters.setAccountAnswer(userDetails.getAccountAnswer());

        return "forgotaccount/student/passwordreminder2";
      case 2:
        // handle the submit with account answer

        ValidationUtils.rejectIfEmptyOrWhitespace(result,
          "submittedAccountAnswer", "presentation.web.controllers.forgotaccount.student.PasswordReminderWizardController.errorSubmittedAccountQuestion");

        String submittedAccountAnswer = passwordReminderParameters
          .getSubmittedAccountAnswer();

        String accountAnswer = passwordReminderParameters.getAccountAnswer();

        accountAnswer = StringUtils.lowerCase(accountAnswer);

        submittedAccountAnswer = StringUtils.lowerCase(submittedAccountAnswer);

        if (accountAnswer == null) {
          /*
           * the account answer is null perhaps because the session has
           * timed out so we will redirect them back to the first
           * password reminder page where they enter their user name
           */
          return "forgotaccount/student/passwordreminder";
        } else if (!accountAnswer.equals(submittedAccountAnswer)) {
          //they have provided an incorrect account answer
          result.reject("presentation.web.controllers.forgotaccount.student.PasswordReminderWizardController.errorSubmittedAccountQuestion");
        }

        if (result.hasErrors()) {
          modelMap.put(USERNAME, passwordReminderParameters.getUsername());
          modelMap.put(ACCOUNT_QUESTION, passwordReminderParameters.getAccountQuestion());

          return "forgotaccount/student/passwordreminder2";
        }

        // passed validation, go to next page
        return "forgotaccount/student/passwordreminder3";
      case 3:
        // handle the submit with new passwords

        ValidationUtils.rejectIfEmptyOrWhitespace(result,
          "verifyPassword", "presentation.web.controllers.forgotaccount.student.PasswordReminderWizardController.errorVerifyNewPassword");

        ValidationUtils.rejectIfEmptyOrWhitespace(result,
          "newPassword", "presentation.web.controllers.forgotaccount.student.PasswordReminderWizardController.errorVerifyNewPassword");

        if (result.hasErrors()) {
          return "forgotaccount/student/passwordreminder3";
        }

        String newPassword = passwordReminderParameters.getNewPassword();

        String verifyPassword = passwordReminderParameters.getVerifyPassword();

        if (!verifyPassword.equals(newPassword)) {
          result.reject("presentation.web.controllers.forgotaccount.student.PasswordReminderWizardController.errorVerifyNewPassword");
        }
        if (result.hasErrors()) {
          return "forgotaccount/student/passwordreminder3";
        }

        // passed validation, save new password
        String usernameSubmitted = passwordReminderParameters.getUsername();

        usernameSubmitted = StringUtils.trimToNull(usernameSubmitted);
        User userSubmitted = userService.retrieveUserByUsername(usernameSubmitted);

        if (newPassword != null) {
          userService.updateUserPassword(userSubmitted, newPassword);
        }

        //clear the command object from the session
        status.setComplete();

        modelMap.put("username", passwordReminderParameters.get(PasswordReminderParameters.USERNAME));
        return "forgotaccount/student/passwordreminder4";
    }

    return null;
  }
}
