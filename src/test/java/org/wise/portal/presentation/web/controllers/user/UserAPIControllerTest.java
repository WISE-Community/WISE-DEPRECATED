package org.wise.portal.presentation.web.controllers.user;

import static org.easymock.EasyMock.*;
import static org.junit.Assert.*;

import java.util.HashMap;
import java.util.List;
import java.util.Properties;

import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.security.core.Authentication;
import org.wise.portal.presentation.web.controllers.APIControllerTest;
import org.wise.portal.presentation.web.exception.IncorrectPasswordException;
import org.wise.portal.presentation.web.response.SimpleResponse;
import org.wise.portal.service.user.UserService;

@RunWith(EasyMockRunner.class)
public class UserAPIControllerTest extends APIControllerTest {

  @TestSubject
  private UserAPIController userAPIController = new UserAPIController();

  @Mock
  private UserService userService;

  @Mock
  private Properties appProperties;

  @Override
  @Before
  public void setUp() {
    super.setUp();
  }

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
    expect(appProperties.get("recaptcha_public_key")).andReturn("recaptcha-123-abc");
    replay(appProperties);
    HashMap<String, Object> config = userAPIController.getConfig(request);
    assertEquals("wise", config.get("contextPath"));
    assertEquals("wise/logout", config.get("logOutURL"));
    assertFalse((boolean) config.get("isGoogleClassroomEnabled"));
    verify(request);
    verify(appProperties);
  }

  @Test
  public void checkAuthentication_UserNotInDB_ReturnInvalidUsernameResponse() {
    expect(userService.retrieveUserByUsername(USERNAME_NOT_IN_DB)).andReturn(null);
    replay(userService);
    String password = "s3cur3";
    HashMap<String, Object> response = userAPIController.checkAuthentication(
        USERNAME_NOT_IN_DB, password);
    assertFalse((boolean) response.get("isUsernameValid"));
    assertFalse((boolean) response.get("isPasswordValid"));
    verify(userService);
  }

  @Test
  public void checkAuthentication_StudentUserCorrectPassword_ReturnValidUsernameResponse() {
    expect(userService.retrieveUserByUsername(STUDENT_USERNAME)).andReturn(student1);
    expect(userService.isPasswordCorrect(student1, STUDENT_PASSWORD)).andReturn(true);
    replay(userService);
    HashMap<String, Object> response = userAPIController.checkAuthentication(
        STUDENT_USERNAME, STUDENT_PASSWORD);
    assertTrue((boolean) response.get("isUsernameValid"));
    assertTrue((boolean) response.get("isPasswordValid"));
    assertEquals(student1Id, (Long) response.get("userId"));
    verify(userService);
  }

  @Test
  public void changePassword_CorrectOldPassword_ChangePassword()
      throws IncorrectPasswordException {
    String newPassword = "newPass";
    expect(userService.retrieveUserByUsername(STUDENT_USERNAME)).andReturn(student1);
    expect(userService.updateUserPassword(student1, STUDENT_PASSWORD, newPassword)).andReturn(
        student1);
    replay(userService);
    SimpleResponse response = userAPIController.changePassword(studentAuth, STUDENT_PASSWORD,
        newPassword);
    assertEquals("success", response.getMessage());
    verify(userService);
  }

  @Test
  public void changePassword_IncorrectOldPassword_PasswordStaysSame()
      throws IncorrectPasswordException {
    String badPassword = "badPass";
    String newPassword = "newPass";
    expect(userService.retrieveUserByUsername(STUDENT_USERNAME)).andReturn(student1);
    expect(userService.updateUserPassword(student1, badPassword, newPassword)).andStubThrow(
        new IncorrectPasswordException());
    replay(userService);
    SimpleResponse response = userAPIController.changePassword(studentAuth, badPassword,
        newPassword);
    assertEquals("incorrect password", response.getMessage());
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
  public void isGoogleIdExist_GoogleUserExists_ReturnTrue() {
    expect(userService.retrieveUserByGoogleUserId(STUEDENT1_GOOGLE_ID)).andReturn(student1);
    replay(userService);
    assertTrue(userAPIController.isGoogleIdExist(STUEDENT1_GOOGLE_ID));
    verify(userService);
  }

  @Test
  public void isGoogleIdExist_InvalidGoogleUserId_ReturnFalse() {
    String invalidGoogleId = "google-id-not-exists-in-db";
    expect(userService.retrieveUserByGoogleUserId(invalidGoogleId)).andReturn(null);
    replay(userService);
    assertFalse(userAPIController.isGoogleIdExist(invalidGoogleId));
    verify(userService);
  }

  @Test
  public void isGoogleIdMatches_GoogleUserIdAndUserIdMatch_ReturnTrue() {
    expect(userService.retrieveUserByGoogleUserId(STUEDENT1_GOOGLE_ID)).andReturn(student1);
    replay(userService);
    assertTrue(userAPIController.isGoogleIdMatches(STUEDENT1_GOOGLE_ID, student1Id.toString()));
    verify(userService);
  }

  @Test
  public void isGoogleIdMatches_InvalidGoogleUserId_ReturnFalse() {
    String invalidGoogleId = "google-id-not-exists-in-db";
    expect(userService.retrieveUserByGoogleUserId(invalidGoogleId)).andReturn(null);
    replay(userService);
    assertFalse(userAPIController.isGoogleIdMatches(invalidGoogleId, student1Id.toString()));
    verify(userService);
  }

  @Test
  public void isGoogleIdMatches_GoogleUserIdAndUserIdDoNotMatch_ReturnFalse() {
    expect(userService.retrieveUserByGoogleUserId(STUEDENT1_GOOGLE_ID)).andReturn(teacher1);
    replay(userService);
    assertFalse(userAPIController.isGoogleIdMatches(STUEDENT1_GOOGLE_ID, teacher1.toString()));
    verify(userService);
  }

  @Test
  public void getUserByGoogleId_GoogleUserExists_ReturnSuccessResponse() {
    expect(userService.retrieveUserByGoogleUserId(STUEDENT1_GOOGLE_ID)).andReturn(student1);
    replay(userService);
    HashMap<String, Object> response = userAPIController.getUserByGoogleId(STUEDENT1_GOOGLE_ID);
    assertEquals("success", response.get("status"));
    assertEquals(student1.getId(), response.get("userId"));
    verify(userService);
  }

  @Test
  public void getUserByGoogleId_InvalidGoogleUserId_ReturnErrorResponse() {
    String invalidGoogleId = "google-id-not-exists-in-db";
    expect(userService.retrieveUserByGoogleUserId(invalidGoogleId)).andReturn(null);
    replay(userService);
    HashMap<String, Object> response = userAPIController.getUserByGoogleId(invalidGoogleId);
    assertEquals("error", response.get("status"));
    verify(userService);
  }
}
