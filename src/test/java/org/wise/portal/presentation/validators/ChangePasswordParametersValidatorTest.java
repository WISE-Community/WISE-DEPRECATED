/**
 * Copyright (c) 2017 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU Lesser General Public License, v2.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.presentation.validators;

import org.easymock.EasyMock;
import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.impl.ChangePasswordParameters;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;

import junit.framework.TestCase;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.service.user.impl.UserServiceImpl;

/**
 * @author Sally Ahn
 */
@RunWith(EasyMockRunner.class)
public class ChangePasswordParametersValidatorTest extends TestCase {

  private ChangePasswordParameters params;

  @TestSubject
  private ChangePasswordParametersValidator validator = new ChangePasswordParametersValidator();

  private Errors errors;

  private static final Long TEACHER_USER_ID = 1L;

  private final String LEGAL_PASSWORD1 = "Owl08963!@#$%";

  private final String PASSWORD_TEACHER1 = LEGAL_PASSWORD1;

  private final String LEGAL_PASSWORD2 = "owl08963^&*";

  private final String PASSWORD_TOO_LONG = "morethantwentyletters";

  private final String ILLEGAL_PASSWORD = "Ceki Gülcü";

  private final String EMPTY_PASSWORD = "";

  @Mock
  private UserImpl teacherUser;

  @Mock
  private UserServiceImpl userService;

  @Before
  public void setUp() throws ObjectNotFoundException {
    params = new ChangePasswordParameters();
    Long teacherId = new Long(1);
    EasyMock.expect(teacherUser.isAdmin()).andReturn(false);
    params.setTeacherUser(teacherUser);
    params.setPasswd0(LEGAL_PASSWORD1);
    params.setPasswd1(LEGAL_PASSWORD2);
    params.setPasswd2(LEGAL_PASSWORD2);  // set up is correct (both passwords match)
    errors = new BeanPropertyBindingResult(params, "");
    EasyMock.replay(teacherUser);
    EasyMock.expect(userService.isPasswordCorrect(teacherUser, LEGAL_PASSWORD1)).andReturn(true);
    EasyMock.replay(userService);
  }

  @After
  public void tearDown() {
    EasyMock.verify(userService);
    EasyMock.verify(teacherUser);
    validator = null;
    params = null;
    errors = null;
  }

  @Test
  public void validate_allCorrectFieldsTeacherIsNotAdmin_OK() {
    validator.validate(params, errors);
    assertTrue(!errors.hasErrors());
  }

  @Test
  public void validate_allCorrectFieldsTeacherIsAdmin_OK() {
    EasyMock.reset(teacherUser);
    EasyMock.expect(teacherUser.isAdmin()).andReturn(true);
    EasyMock.replay(teacherUser);
    EasyMock.reset(userService);
    EasyMock.replay(userService);
    validator.validate(params, errors);
    assertTrue(!errors.hasErrors());
  }

  @Test
  public void validate_emptyPassword0_error() throws ObjectNotFoundException {
    params.setPasswd0(null);
    EasyMock.reset(userService);
    EasyMock.replay(userService);
    validator.validate(params, errors);
    assertTrue(errors.hasErrors());
    assertEquals(1, errors.getErrorCount());
    assertNotNull(errors.getFieldError("passwd0"));
  }

  @Test
  public void validate_incorrectPassword0_error() throws ObjectNotFoundException {
    EasyMock.reset(userService);
    EasyMock.expect(userService.isPasswordCorrect(teacherUser, LEGAL_PASSWORD1)).andReturn(false);
    EasyMock.replay(userService);
    validator.validate(params, errors);
    assertTrue(errors.hasErrors());
    assertEquals(1, errors.getErrorCount());
    assertNotNull(errors.getFieldError("passwd0"));
  }

  @Test
  public void validate_emptyPassword1_error() {
    params.setPasswd1(EMPTY_PASSWORD);
    validator.validate(params, errors);
    assertTrue(errors.hasErrors());
    assertEquals(1, errors.getErrorCount());
    assertNotNull(errors.getFieldError("passwd1"));
  }

  @Test
  public void validate_emptyPassword2_error() {
    params.setPasswd2(EMPTY_PASSWORD);
    validator.validate(params, errors);
    assertTrue(errors.hasErrors());
    assertEquals(1, errors.getErrorCount());
    assertNotNull(errors.getFieldError("passwd2"));
  }

  @Test
  public void validate_emptyPassword1Password2_error() {
    params.setPasswd1(EMPTY_PASSWORD);
    params.setPasswd2(EMPTY_PASSWORD);
    validator.validate(params, errors);
    assertTrue(errors.hasErrors());
    assertEquals(1, errors.getErrorCount());
    assertNotNull(errors.getFieldError("passwd1"));
  }

  @Test
  public void validate_passwordTooLong_error() {
    params.setPasswd1(PASSWORD_TOO_LONG);
    validator.validate(params, errors);
    assertTrue(errors.hasErrors());
    assertEquals(2, errors.getErrorCount());
    assertNotNull(errors.getFieldError("passwd1"));
  }

  @Test
  public void validate_illegalPassword_error() {
    params.setPasswd1(ILLEGAL_PASSWORD);
    validator.validate(params, errors);
    assertTrue(errors.hasErrors());
    assertEquals(1, errors.getErrorCount());
    assertNotNull(errors.getFieldError("passwd1"));
  }

  @Test
  public void validate_mismatchedPasswords_error() {
    params.setPasswd1(LEGAL_PASSWORD1);
    params.setPasswd2(LEGAL_PASSWORD2);
    validator.validate(params, errors);
    assertTrue(errors.hasErrors());
    assertEquals(1, errors.getErrorCount());
    assertNotNull(errors.getFieldError("passwd1"));
  }
}
