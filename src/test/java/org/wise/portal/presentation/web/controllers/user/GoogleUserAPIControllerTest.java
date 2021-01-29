package org.wise.portal.presentation.web.controllers.user;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

import java.util.HashMap;

import org.easymock.TestSubject;
import org.junit.Test;
import org.wise.portal.presentation.web.exception.InvalidPasswordExcpetion;

public class GoogleUserAPIControllerTest extends UserAPIControllerTest {

  @TestSubject
  private GoogleUserAPIController controller = new GoogleUserAPIController();

  @Test
  public void isGoogleIdExist_GoogleUserExists_ReturnTrue() {
    expect(userService.retrieveUserByGoogleUserId(STUDENT1_GOOGLE_ID)).andReturn(student1);
    replay(userService);
    assertTrue(controller.isGoogleIdExist(STUDENT1_GOOGLE_ID));
    verify(userService);
  }

  @Test
  public void isGoogleIdExist_InvalidGoogleUserId_ReturnFalse() {
    String invalidGoogleId = "google-id-not-exists-in-db";
    expect(userService.retrieveUserByGoogleUserId(invalidGoogleId)).andReturn(null);
    replay(userService);
    assertFalse(controller.isGoogleIdExist(invalidGoogleId));
    verify(userService);
  }

  @Test
  public void isGoogleIdMatches_GoogleUserIdAndUserIdMatch_ReturnTrue() {
    expect(userService.retrieveUserByGoogleUserId(STUDENT1_GOOGLE_ID)).andReturn(student1);
    replay(userService);
    assertTrue(controller.isGoogleIdMatches(STUDENT1_GOOGLE_ID, student1Id.toString()));
    verify(userService);
  }

  @Test
  public void isGoogleIdMatches_InvalidGoogleUserId_ReturnFalse() {
    String invalidGoogleId = "google-id-not-exists-in-db";
    expect(userService.retrieveUserByGoogleUserId(invalidGoogleId)).andReturn(null);
    replay(userService);
    assertFalse(controller.isGoogleIdMatches(invalidGoogleId, student1Id.toString()));
    verify(userService);
  }

  @Test
  public void isGoogleIdMatches_GoogleUserIdAndUserIdDoNotMatch_ReturnFalse() {
    expect(userService.retrieveUserByGoogleUserId(STUDENT1_GOOGLE_ID)).andReturn(teacher1);
    replay(userService);
    assertFalse(controller.isGoogleIdMatches(STUDENT1_GOOGLE_ID, teacher1.toString()));
    verify(userService);
  }

  @Test
  public void getUserByGoogleId_GoogleUserExists_ReturnSuccessResponse() {
    expect(userService.retrieveUserByGoogleUserId(STUDENT1_GOOGLE_ID)).andReturn(student1);
    replay(userService);
    HashMap<String, Object> response = controller.getUserByGoogleId(STUDENT1_GOOGLE_ID);
    assertEquals("success", response.get("status"));
    assertEquals(student1.getId(), response.get("userId"));
    verify(userService);
  }

  @Test
  public void getUserByGoogleId_InvalidGoogleUserId_ReturnErrorResponse() {
    String invalidGoogleId = "google-id-not-exists-in-db";
    expect(userService.retrieveUserByGoogleUserId(invalidGoogleId)).andReturn(null);
    replay(userService);
    HashMap<String, Object> response = controller.getUserByGoogleId(invalidGoogleId);
    assertEquals("error", response.get("status"));
    verify(userService);
  }

  @Test
  public void unlinkGoogleAccount_InvalidNewPassword_ThrowException() {
    expect(userService.retrieveUserByUsername(STUDENT_USERNAME)).andReturn(student1);
    replay(userService);
    String newPass = "";
    try {
      controller.unlinkGoogleAccount(studentAuth, newPass);
      fail("InvalidPasswordException was expected");
    } catch (Exception e) {
    }
  }

  @Test
  public void unlinkGoogleAccount_ValidNewPassword_ReturnUpdatedUserMap()
      throws InvalidPasswordExcpetion {
    String newPassword = "my new pass";
    assertTrue(student1.getUserDetails().isGoogleUser());
    expect(userService.retrieveUserByUsername(STUDENT_USERNAME)).andReturn(student1).times(2);
    expect(userService.updateUserPassword(student1, newPassword)).andReturn(student1);
    expect(appProperties.getProperty("send_email_enabled", "false")).andReturn("false");
    replay(userService, appProperties);
    controller.unlinkGoogleAccount(studentAuth, newPassword);
    verify(userService, appProperties);
  }
}
