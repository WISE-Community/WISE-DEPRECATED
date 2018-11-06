package org.wise.portal.presentation.web.controllers.teacher;

import org.apache.commons.lang3.RandomStringUtils;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.mail.IMailFacade;
import org.wise.portal.service.user.UserService;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.List;
import java.util.Properties;

@RestController
@RequestMapping("/api/teacher/forgot")
public class TeacherForgotAccountAPIController {

  @Autowired
  private Properties wiseProperties;

  @Autowired
  private UserService userService;

  @Autowired
  protected IMailFacade mailService;

  @RequestMapping(value = "/username", method = RequestMethod.POST)
  protected String sendForgotUsernameEmail(HttpServletRequest request,
                                           @RequestParam("email") String email) throws JSONException {
    List<User> users = userService.retrieveUserByEmailAddress(email);
    JSONObject response;
    if (users.isEmpty()) {
      response = getEmailNotFoundFailureResponse();
    } else {
      User user = users.get(0);
      String username = user.getUserDetails().getUsername();
      String from = wiseProperties.getProperty("portalemailaddress");
      String [] to = new String[] {email};
      String subject = "Your WISE Username";
      String signInUrl = getSignInUrl(request);
      String body = "Username: " + username + "\n\nPlease sign in at " + signInUrl + "\n\nThank you for choosing WISE\n - WISE Team";
      boolean successfullySentEmail = sendEmail(to, subject, body, from);
      if (successfullySentEmail) {
        response = getEmailSentSuccessResponse();
      } else {
        response = getFailedToSendEmailFailureResponse();
      }
    }
    return response.toString();
  }

  private String getSignInUrl(HttpServletRequest request) {
    return ControllerUtil.getPortalUrlString(request) + "/login";
  }

  private boolean sendEmail(String[] to, String subject, String body, String from) {
    try {
      mailService.postMail(to, subject, body, from);
      return true;
    } catch (MessagingException e) {
      e.printStackTrace();
      return false;
    }
  }

  @RequestMapping(value = "/password/verification-code", method = RequestMethod.GET)
  protected String sendVerificationCodeEmail(@RequestParam("username") String username)
    throws JSONException {
    JSONObject response;
    User user = userService.retrieveUserByUsername(username);
    if (user != null && user.isTeacher()) {
      if (isTooManyVerificationCodeAttempts(user)) {
        response = getVerificationCodeTooManyAttemptsFailureResponse();
      } else {
        boolean successfullySentEmail = sendVerificationCodeEmail(user);
        if (successfullySentEmail) {
          response = getEmailSentSuccessResponse();
        } else {
          response = getFailedToSendEmailFailureResponse();
        }
      }
    } else {
      response = getUsernameNotFoundFailureResponse();
    }

    return response.toString();
  }

  private boolean sendVerificationCodeEmail(User user) {
    String from = wiseProperties.getProperty("portalemailaddress");
    String email = user.getUserDetails().getEmailAddress();
    String [] to = new String[] {email};
    String subject = "Reset WISE Password Verification Code";
    String verificationCode = getVerificationCode(user);
    String body = "You have requested to change your password. After you enter the verification code, you will be able to change your password.\n\nVerification code: " + verificationCode + "\n\nThank you for choosing WISE\n - WISE Team";
    boolean successfullySentEmail = sendEmail(to, subject, body, from);
    return successfullySentEmail;
  }

  private boolean isTooManyVerificationCodeAttempts(User user) {
    Date recentFailedVerificationCodeAttemptTime =
      user.getUserDetails().getRecentFailedVerificationCodeAttemptTime();
    Integer numberOfRecentFailedVerificationCodeAttempts =
      user.getUserDetails().getNumberOfRecentFailedVerificationCodeAttempts();
    if (recentFailedVerificationCodeAttemptTime == null || numberOfRecentFailedVerificationCodeAttempts == null) {
      return false;
    } else {
      return isWithinLast10Minutes(recentFailedVerificationCodeAttemptTime) &&
        numberOfRecentFailedVerificationCodeAttempts >= 5;
    }
  }

  private boolean isWithinLast10Minutes(Date date) {
    if (date == null) {
      return false;
    } else {
      long timeDifferenceInMilliseconds = getTimeDifferenceInMilliseconds(new Date(), date);
      int tenMinutesInMilliseconds = minutesToMilliseconds(10);
      return timeDifferenceInMilliseconds < tenMinutesInMilliseconds;
    }
  }

  private int minutesToMilliseconds(int minutes) {
    return minutes * 60 * 1000;
  }

  @RequestMapping(value = "/password/verification-code", method = RequestMethod.POST)
  protected String checkVerificationCode(@RequestParam("username") String username,
                                         @RequestParam("verificationCode") String verificationCode) throws JSONException {
    JSONObject response = new JSONObject();
    User user = userService.retrieveUserByUsername(username);
    if (user != null) {
      boolean isVerificationCodeExpired = isVerificationCodeExpired(user);
      boolean isVerificationCodeCorrect = isVerificationCodeCorrect(user, verificationCode);
      if (isTooManyVerificationCodeAttempts(user)) {
        response = getVerificationCodeTooManyAttemptsFailureResponse();
      } else if (isVerificationCodeExpired) {
        response = getVerificationCodeExpiredFailureResponse();
      } else if (!isVerificationCodeCorrect) {
        incrementFailedVerificationCodeAttempt(user);
        response = getVerificationCodeIncorrectFailureResponse();
      } else if (!isVerificationCodeExpired && isVerificationCodeCorrect) {
        response = getVerificationCodeCorrectSuccessResponse();
      }
    } else {
      response = getUsernameNotFoundFailureResponse();
    }

    return response.toString();
  }

  private void incrementFailedVerificationCodeAttempt(User user) {
    user.getUserDetails().setRecentFailedVerificationCodeAttemptTime(new Date());
    user.getUserDetails().incrementNumberOfRecentFailedVerificationCodeAttempts();
    userService.updateUser(user);
  }

  @RequestMapping(value = "/password/change", method = RequestMethod.POST)
  protected String changePassword(@RequestParam("username") String username,
                                  @RequestParam("verificationCode") String verificationCode,
                                  @RequestParam("password") String password,
                                  @RequestParam("confirmPassword") String confirmPassword) throws JSONException {
    JSONObject response = new JSONObject();
    User user = userService.retrieveUserByUsername(username);
    if (user != null) {
      boolean isTooManyVerificationCodeAttempts = isTooManyVerificationCodeAttempts(user);
      boolean isVerificationCodeExpired = isVerificationCodeExpired(user);
      boolean isVerificationCodeCorrect = isVerificationCodeCorrect(user, verificationCode);
      boolean isPasswordBlank = isPasswordBlank(password, confirmPassword);
      boolean isPasswordsMatch = isPasswordsMatch(password, confirmPassword);

      if (isTooManyVerificationCodeAttempts) {
        response = getVerificationCodeTooManyAttemptsFailureResponse();
      } else if (isVerificationCodeExpired) {
        response = getVerificationCodeExpiredFailureResponse();
      } else if (!isVerificationCodeCorrect) {
        response = getVerificationCodeIncorrectFailureResponse();
      } else if (isPasswordBlank) {
        response = getPasswordIsBlankFailureResponse();
      } else if (!isPasswordsMatch) {
        response = getPasswordsDoNotMatchFailureResponse();
      } else if (!isVerificationCodeExpired && isVerificationCodeCorrect && !isPasswordBlank && isPasswordsMatch) {
        userService.updateUserPassword(user, password);
        response = getVerificationCodeCorrectSuccessResponse();
        clearVerificationCodeData(user);
      }
    } else {
      response = getUsernameNotFoundFailureResponse();
    }

    return response.toString();
  }

  private boolean isVerificationCodeCorrect(User user, String verificationCode) {
    String correctVerificationCode = user.getUserDetails().getResetPasswordVerificationCode();
    if (verificationCode == null || correctVerificationCode == null) {
      return false;
    } else if (verificationCode.equals(correctVerificationCode)) {
      return true;
    } else {
      return false;
    }
  }

  private boolean isVerificationCodeExpired(User user) {
    Date verificationCodeCreationTime = user.getUserDetails().getResetPasswordVerificationCodeRequestTime();
    Date now = new Date();
    long timeDifferenceInMilliseconds = getTimeDifferenceInMilliseconds(now, verificationCodeCreationTime);
    int expirationInMinutes = 15;
    int expirationInMilliseconds = expirationInMinutes * 60 * 1000;
    return timeDifferenceInMilliseconds > expirationInMilliseconds;
  }

  private long getTimeDifferenceInMilliseconds(Date laterTime, Date earlierTime) {
    return laterTime.getTime() - earlierTime.getTime();
  }

  private String getVerificationCode(User user) {
    String verificationCode = RandomStringUtils.randomNumeric(6);
    user.getUserDetails().setResetPasswordVerificationCode(verificationCode);
    Date now = new Date();
    user.getUserDetails().setResetPasswordVerificationCodeRequestTime(now);
    userService.updateUser(user);
    return verificationCode;
  }
  private boolean isPasswordBlank(String password1, String password2) {
    return password1 == null || password2 == null || password1.equals("") || password2.equals("");
  }

  private boolean isPasswordsMatch(String password, String confirmPassword) {
    return password.equals(confirmPassword);
  }

  private void clearVerificationCodeData(User user) {
    user.getUserDetails().clearResetPasswordVerificationCode();
    user.getUserDetails().clearResetPasswordVerificationCodeRequestTime();
    user.getUserDetails().clearRecentFailedVerificationCodeAttemptTime();
    user.getUserDetails().clearNumberOfRecentFailedVerificationCodeAttempts();
    userService.updateUser(user);
  }

  private JSONObject getEmailSentSuccessResponse() throws JSONException {
    JSONObject response = new JSONObject();
    response.put("status", "success");
    response.put("messageCode", "emailSent");
    return response;
  }

  private JSONObject getFailedToSendEmailFailureResponse() throws JSONException {
    JSONObject response = new JSONObject();
    response.put("status", "failure");
    response.put("messageCode", "failedToSendEmail");
    return response;
  }

  private JSONObject getEmailNotFoundFailureResponse() throws JSONException {
    JSONObject response = new JSONObject();
    response.put("status", "failure");
    response.put("messageCode", "emailNotFound");
    return response;
  }

  private JSONObject getUsernameNotFoundFailureResponse() throws JSONException {
    JSONObject response = new JSONObject();
    response.put("status", "failure");
    response.put("messageCode", "usernameNotFound");
    return response;
  }

  private JSONObject getVerificationCodeExpiredFailureResponse() throws JSONException {
    JSONObject response = new JSONObject();
    response.put("status", "failure");
    response.put("messageCode", "verificationCodeExpired");
    return response;
  }

  private JSONObject getVerificationCodeIncorrectFailureResponse() throws JSONException {
    JSONObject response = new JSONObject();
    response.put("status", "failure");
    response.put("messageCode", "verificationCodeIncorrect");
    return response;
  }

  private JSONObject getVerificationCodeTooManyAttemptsFailureResponse() throws JSONException {
    JSONObject response = new JSONObject();
    response.put("status", "failure");
    response.put("messageCode", "tooManyVerificationCodeAttempts");
    return response;
  }

  private JSONObject getVerificationCodeCorrectSuccessResponse() throws JSONException {
    JSONObject response = new JSONObject();
    response.put("status", "success");
    response.put("messageCode", "verificationCodeCorrect");
    return response;
  }

  private JSONObject getPasswordIsBlankFailureResponse() throws JSONException {
    JSONObject response = new JSONObject();
    response.put("status", "failure");
    response.put("messageCode", "passwordIsBlank");
    return response;
  }

  private JSONObject getPasswordsDoNotMatchFailureResponse() throws JSONException {
    JSONObject response = new JSONObject();
    response.put("status", "failure");
    response.put("messageCode", "passwordsDoNotMatch");
    return response;
  }
}
