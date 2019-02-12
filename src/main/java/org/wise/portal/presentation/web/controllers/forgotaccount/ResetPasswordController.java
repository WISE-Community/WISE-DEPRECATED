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
package org.wise.portal.presentation.web.controllers.forgotaccount;

import java.util.Date;
import java.util.Locale;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.impl.PasswordReminderParameters;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.mail.MailService;
import org.wise.portal.service.user.UserService;

@Controller
@RequestMapping("/legacy/forgotaccount/resetpassword.html")
public class ResetPasswordController {

  @Autowired
  protected UserService userService;

  @Autowired
  private Properties wiseProperties;

  @Autowired
  protected MailService mailService;

  @Autowired
  private MessageSource messageSource;

  protected String formView = "/forgotaccount/resetpassword";

  /**
   * Performs processing whenever the resetpassword.html form is shown.
   * This handles displaying the form when the user is requested to
   * enter a new password and also handles displaying the form when
   * the user successfully changes their password.
   * @param passwordReminderParameters the object that contains values from the form
   * @param bindingResult the object used for validation in which errors will be stored
   * @param modelMap the model object that contains values for the page to use when rendering the view
   * @param request the http request
   * @return the path of the view to display
   */
  @RequestMapping(method = RequestMethod.GET)
  public String initializeForm(
      @ModelAttribute("passwordReminderParameters") PasswordReminderParameters passwordReminderParameters,
      BindingResult bindingResult, ModelMap modelMap, HttpServletRequest request) {
    String resetPasswordKey = request.getParameter("k");
    boolean displayForgotPasswordSelectAccountTypeLink = false;
    boolean displayLoginLink = false;
    boolean passwordResetSuccess = false;

    /*
     * determine if we have successfully reset the password.
     * this will only be true after they have submitted the
     * password change form successfully and we call showForm()
     * again.
     */
    if (request.getAttribute("passwordResetSuccess") != null) {
      passwordResetSuccess = (Boolean) request.getAttribute("passwordResetSuccess");
    }

    if (passwordResetSuccess) {
      displayLoginLink = true;
    } else {
      if (resetPasswordKey != null) {
        User user = userService.retrieveByResetPasswordKey(resetPasswordKey);
        if (user != null) {
          MutableUserDetails userDetails = user.getUserDetails();
          Date resetPasswordRequestTime = userDetails.getResetPasswordRequestTime();
          long resetPasswordRequestTimeMs = resetPasswordRequestTime.getTime();

          Date now = new Date();
          long nowMs = now.getTime();

          /*
           * check if the reset password request has expired because it was made
           * more than 30 minutes ago
           * 1000 * 60 * 30 = 1800000
           */
          if (nowMs - resetPasswordRequestTimeMs > 1800000) {
            bindingResult.reject("error.password-reset-timeout");
            displayForgotPasswordSelectAccountTypeLink = true;
          }
        } else {
          bindingResult.reject("error.invalid-password-reset-url");
          displayForgotPasswordSelectAccountTypeLink = true;
        }
      } else {
        bindingResult.reject("error.invalid-password-reset-url");
        displayForgotPasswordSelectAccountTypeLink = true;
      }
    }
    modelMap.addAttribute("displayForgotPasswordSelectAccountTypeLink", displayForgotPasswordSelectAccountTypeLink);
    modelMap.addAttribute("displayLoginLink", displayLoginLink);
    return formView;
  }

  /**
   * Called when the user chooses a new password and submits the form.
   * @param passwordReminderParameters the object that contains values from the form
   * @param bindingResult the object used for validation in which errors will be stored
   * @param model the model object that contains values for the page to use when rendering the view
   * @param request the http request
   * @return the path of the view to display
   */
  @RequestMapping(method = RequestMethod.POST)
  protected String onSubmit(
      @ModelAttribute("passwordReminderParameters") PasswordReminderParameters passwordReminderParameters,
      BindingResult bindingResult, Model model, HttpServletRequest request) throws Exception {
    String view = formView;
    String newPassword = passwordReminderParameters.getNewPassword();
    String verifyPassword = passwordReminderParameters.getVerifyPassword();

    if (!verifyPassword.equals(newPassword)) {
      bindingResult.reject("error.verify-newpassword");
      model.addAttribute("displayForgotPasswordSelectAccountTypeLink", false);
      model.addAttribute("displayLoginLink", false);
    } else if(verifyPassword.equals("")) {
      bindingResult.reject("error.verify-password-empty");
      model.addAttribute("displayForgotPasswordSelectAccountTypeLink", false);
      model.addAttribute("displayLoginLink", false);
    } else {
      String resetPasswordKey = request.getParameter("k");
      User user = userService.retrieveByResetPasswordKey(resetPasswordKey);
      userService.updateUserPassword(user, verifyPassword);
      user.getUserDetails().setResetPasswordKey(null);
      user.getUserDetails().setResetPasswordRequestTime(null);
      userService.updateUser(user);
      String username = user.getUserDetails().getUsername();
      String portalName = wiseProperties.getProperty("wise.name");
      String userEmail = user.getUserDetails().getEmailAddress();
      String[] recipients = new String[]{userEmail};
      Locale userLocale = request.getLocale();
      String defaultSubject = messageSource.getMessage("forgotaccount.teacher.index.passwordChangedEmailSubject", new Object[]{portalName}, Locale.US);
      String subject = messageSource.getMessage("forgotaccount.teacher.index.passwordChangedEmailSubject", new Object[]{portalName}, defaultSubject, userLocale);
      String defaultBody = messageSource.getMessage("forgotaccount.teacher.index.passwordChangedEmailBody", new Object[]{username,portalName}, Locale.US);
      String body = messageSource.getMessage("forgotaccount.teacher.index.passwordChangedEmailBody", new Object[] {username,portalName}, defaultBody, userLocale);
      mailService.postMail(recipients, subject, body, userEmail);
      bindingResult.reject("changePassword_success");
      request.setAttribute("passwordResetSuccess", true);
      model.addAttribute("displayForgotPasswordSelectAccountTypeLink", false);
      model.addAttribute("displayLoginLink", true);
    }
    return view;
  }
}
