package org.wise.portal.presentation.web.controllers.user;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.HashMap;
import java.util.List;

import org.easymock.EasyMockRunner;
import org.easymock.TestSubject;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.security.core.Authentication;
import org.wise.portal.presentation.web.controllers.APIControllerTest;
import org.wise.portal.presentation.web.exception.IncorrectPasswordException;
import org.wise.portal.presentation.web.response.SimpleResponse;

@RunWith(EasyMockRunner.class)
public class UserAPIControllerTest extends APIControllerTest {

  @TestSubject
  private UserAPIController userAPIController = new UserAPIController();

  @Test
  public void getUserInfo_UnAuthenticatedUser_ReturnPassedInUsername() {
    Authentication auth = null;
    String username = "SpongeBobS0101";
    HashMap<String, Object> userMap = userAPIController.getUserInfo(auth, username);
    assertEquals(username, userMap.get("username"));
  }

  @Test
  public void getUserInfo_Student_ReturnInfo() {
    expect(userService.retrieveUserByUsername(STUDENT_USERNAME)).andReturn(student1);
    replay(userService);
    String username = "";
    HashMap<String, Object> userMap = userAPIController.getUserInfo(studentAuth, username);
    assertEquals(STUDENT_FIRSTNAME, userMap.get("firstName"));
    assertEquals("student", userMap.get("role"));
    assertTrue((boolean) userMap.get("isGoogleUser"));
    verify(userService);
  }

  @Test
  public void getUserInfo_Teacher_ReturnInfo() {
    expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
    replay(userService);
    String username = "";
    HashMap<String, Object> userMap = userAPIController.getUserInfo(teacherAuth, username);
    assertEquals(TEACHER_FIRSTNAME, userMap.get("firstName"));
    assertEquals("teacher", userMap.get("role"));
    assertFalse((boolean) userMap.get("isGoogleUser"));
    verify(userService);
  }

  @Test
  public void getConfig_WISEContextPath_ReturnConfig() {
    expect(request.getContextPath()).andReturn("wise");
    replay(request);
    expect(appProperties.get("google_analytics_id")).andReturn("UA-XXXXXX-1");
    expect(appProperties.get("recaptcha_public_key")).andReturn("recaptcha-123-abc");
    expect(appProperties.get("wise4.hostname")).andReturn("http://localhost:8080/legacy");
    expect(appProperties.getOrDefault("discourse_url", null)).andReturn("http://localhost:9292");
    expect(appProperties.get("wise.hostname")).andReturn("http://localhost:8080");
    replay(appProperties);
    HashMap<String, Object> config = userAPIController.getConfig(request);
    assertEquals("wise", config.get("contextPath"));
    assertEquals("wise/logout", config.get("logOutURL"));
    assertFalse((boolean) config.get("isGoogleClassroomEnabled"));
    assertEquals("UA-XXXXXX-1", config.get("googleAnalyticsId"));
    verify(request);
    verify(appProperties);
  }

  @Test
  public void checkAuthentication_UserNotInDB_ReturnInvalidUsernameResponse() {
    expect(userService.retrieveUserByUsername(USERNAME_NOT_IN_DB)).andReturn(null);
    replay(userService);
    String password = "s3cur3";
    HashMap<String, Object> response = userAPIController.checkAuthentication(USERNAME_NOT_IN_DB,
        password);
    assertFalse((boolean) response.get("isUsernameValid"));
    assertFalse((boolean) response.get("isPasswordValid"));
    verify(userService);
  }

  @Test
  public void checkAuthentication_StudentUserCorrectPassword_ReturnValidUsernameResponse() {
    expect(userService.retrieveUserByUsername(STUDENT_USERNAME)).andReturn(student1);
    expect(userService.isPasswordCorrect(student1, STUDENT_PASSWORD)).andReturn(true);
    replay(userService);
    HashMap<String, Object> response = userAPIController.checkAuthentication(STUDENT_USERNAME,
        STUDENT_PASSWORD);
    assertTrue((boolean) response.get("isUsernameValid"));
    assertTrue((boolean) response.get("isPasswordValid"));
    assertEquals(student1Id, (Long) response.get("userId"));
    verify(userService);
  }

  @Test
  public void changePassword_CorrectOldPassword_ChangePassword() throws IncorrectPasswordException {
    String newPassword = "newPass";
    expect(userService.retrieveUserByUsername(STUDENT_USERNAME)).andReturn(student1);
    expect(userService.updateUserPassword(student1, STUDENT_PASSWORD, newPassword))
        .andReturn(student1);
    replay(userService);
    SimpleResponse response = userAPIController.changePassword(studentAuth, STUDENT_PASSWORD,
        newPassword);
    assertEquals("success", response.getStatus());
    assertEquals("passwordUpdated", response.getMessageCode());
    verify(userService);
  }

  @Test
  public void changePassword_IncorrectOldPassword_PasswordStaysSame()
      throws IncorrectPasswordException {
    String badPassword = "badPass";
    String newPassword = "newPass";
    expect(userService.retrieveUserByUsername(STUDENT_USERNAME)).andReturn(student1);
    expect(userService.updateUserPassword(student1, badPassword, newPassword))
        .andStubThrow(new IncorrectPasswordException());
    replay(userService);
    SimpleResponse response = userAPIController.changePassword(studentAuth, badPassword,
        newPassword);
    assertEquals("error", response.getStatus());
    assertEquals("incorrectPassword", response.getMessageCode());
    verify(userService);
  }

  @Test
  public void getSupportedLanguages_ThreeSupportedLocales_ReturnLanguageArray() {
    expect(appProperties.getProperty("supportedLocales", "")).andReturn("en,ja,zh_tw");
    replay(appProperties);
    List<HashMap<String, String>> langs = userAPIController.getSupportedLanguages();
    assertEquals(3, langs.size());
    assertEquals("English", langs.get(0).get("language"));
    assertEquals("Japanese", langs.get(1).get("language"));
    assertEquals("Chinese (Traditional)", langs.get(2).get("language"));
    verify(appProperties);
  }

  @Test
  public void isNameValid_InvalidName_ReturnFalse() {
    assertFalse(userAPIController.isNameValid(""));
    assertFalse(userAPIController.isNameValid("Spongebob!"));
    assertFalse(userAPIController.isNameValid("Spongebób"));
    assertFalse(userAPIController.isNameValid("海绵宝宝"));
  }

  @Test
  public void isNameValid_ValidName_ReturnTrue() {
    assertTrue(userAPIController.isNameValid("Spongebob"));
  }

  @Test
  public void isFirstNameAndLastNameValid_ValidFirstNameInvalidLastName_ReturnFalse() {
    assertFalse(userAPIController.isFirstNameAndLastNameValid("Spongebob", "Squarepants!"));
  }

  @Test
  public void isFirstNameAndLastNameValid_InvalidFirstNameValidLastName_ReturnFalse() {
    assertFalse(userAPIController.isFirstNameAndLastNameValid("Spongebob!", "Squarepants"));
  }

  @Test
  public void isFirstNameAndLastNameValid_InvalidFirstNameInvalidLastName_ReturnFalse() {
    assertFalse(userAPIController.isFirstNameAndLastNameValid("Spongebob!", "Squarepants!"));
  }

  @Test
  public void isFirstNameAndLastNameValid_ValidFirstNameValidLastName_ReturnTrue() {
    assertTrue(userAPIController.isFirstNameAndLastNameValid("Spongebob", "Squarepants"));
  }

  @Test
  public void getInvalidNameMessageCode_InvalidFirstName_ReturnInvalidFirstNameMessageCode() {
    assertEquals(userAPIController.getInvalidNameMessageCode("a!", "a"), "invalidFirstName");
  }

  @Test
  public void getInvalidNameMessageCode_InvalidLastName_ReturnInvalidLastNameMessageCode() {
    assertEquals(userAPIController.getInvalidNameMessageCode("a", "a!"), "invalidLastName");
  }

  @Test
  public void getInvalidNameMessageCode_InvalidFirstAndLastName_ReturnInvalidNameMessageCode() {
    assertEquals(userAPIController.getInvalidNameMessageCode("a!", "a!"),
        "invalidFirstAndLastName");
  }

  @Test
  public void createRegisterSuccessResponse_Username_ReturnSuccessResponse() {
    String username = "Spongebob Squarepants";
    HashMap<String, Object> response = userAPIController.createRegisterSuccessResponse(username);
    assertEquals(response.get("status"), "success");
    assertEquals(response.get("username"), username);
  }
}
