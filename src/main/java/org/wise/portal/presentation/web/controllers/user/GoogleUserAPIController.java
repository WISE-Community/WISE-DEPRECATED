package org.wise.portal.presentation.web.controllers.user;

import java.util.HashMap;
import java.util.Locale;

import javax.mail.MessagingException;

import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.wise.portal.domain.authentication.impl.PersistentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.exception.InvalidPasswordExcpetion;

@RestController
@RequestMapping("/api/google-user")
public class GoogleUserAPIController extends UserAPIController {

  @GetMapping("/check-user-exists")
  boolean isGoogleIdExist(@RequestParam String googleUserId) {
    return userService.retrieveUserByGoogleUserId(googleUserId) != null;
  }

  @GetMapping("/check-user-matches")
  boolean isGoogleIdMatches(@RequestParam String googleUserId, @RequestParam String userId) {
    User user = userService.retrieveUserByGoogleUserId(googleUserId);
    return user != null && user.getId().toString().equals(userId);
  }

  @GetMapping("/get-user")
  HashMap<String, Object> getUserByGoogleId(@RequestParam String googleUserId) {
    User user = userService.retrieveUserByGoogleUserId(googleUserId);
    HashMap<String, Object> response = new HashMap<String, Object>();
    if (user == null) {
      response.put("status", "error");
    } else {
      response.put("status", "success");
      response.put("userId", user.getId());
      response.put("username", user.getUserDetails().getUsername());
      response.put("firstName", user.getUserDetails().getFirstname());
      response.put("lastName", user.getUserDetails().getLastname());
    }
    return response;
  }

  @Secured("ROLE_USER")
  @PostMapping("/unlink-account")
  HashMap<String, Object> unlinkGoogleAccount(Authentication auth, @RequestParam String newPassword)
      throws InvalidPasswordExcpetion {
    if (newPassword.isEmpty()) {
      throw new InvalidPasswordExcpetion();
    }
    String username = auth.getName();
    User user = userService.retrieveUserByUsername(username);
    ((PersistentUserDetails) user.getUserDetails()).setGoogleUserId(null);
    userService.updateUserPassword(user, newPassword);
    boolean isSendEmail = Boolean.parseBoolean(appProperties.getProperty("send_email_enabled", "false"));
    if (isSendEmail && user.isTeacher()) {
      this.sendUnlinkGoogleEmail((TeacherUserDetails) user.getUserDetails());
    }
    return this.getUserInfo(auth, username);
  }

  private void sendUnlinkGoogleEmail(TeacherUserDetails userDetails) {
    String[] recipients = { userDetails.getEmailAddress() };
    String subject = messageSource.getMessage("unlink_google_account_success_email_subject", null,
      "Successfully Unlinked Google Account", new Locale(userDetails.getLanguage()));
    String username = userDetails.getUsername();
    String message = messageSource.getMessage("unlink_google_account_success_email_body",
      new Object[]{username},
      "You have unlinked your Google account from WISE. To sign in to WISE in the future, please use your username and the password you just created. Your username is: " + username,
      new Locale(userDetails.getLanguage()));
    try {
      mailService.postMail(recipients, subject, message, appProperties.getProperty("portalemailaddress"));
    } catch (MessagingException e) {
      e.printStackTrace();
    }
  }
}
