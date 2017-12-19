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

  private final String LEGAL_PASSWORD1 = "Owl08963!@#$%";

  private final String LEGAL_PASSWORD2 = "owl08963^&*";

  private final String ILLEGAL_PASSWORD1 = "morethantwentyletters";

  private final String ILLEGAL_PASSWORD2 = "Ceki Gülcü";

  private final String EMPTY_PASSWORD = "";

  @Mock
  private UserImpl teacherUser;

  @Mock
  private UserServiceImpl userServiceImpl;

  @Before
  public void setUp() throws ObjectNotFoundException {
    params = new ChangePasswordParameters();
    Long teacherId = new Long(1);
    EasyMock.expect(teacherUser.getId()).andReturn(teacherId);
    EasyMock.expect(userServiceImpl.retrieveById(teacherId)).andReturn(teacherUser);
    EasyMock.expect(teacherUser.isAdmin()).andReturn(true);
    params.setTeacherUser(teacherUser);
    params.setPasswd0(LEGAL_PASSWORD1);
    params.setPasswd1(LEGAL_PASSWORD1);
    params.setPasswd2(LEGAL_PASSWORD1);  // set up is correct (both passwords match)
    errors = new BeanPropertyBindingResult(params, "");
    EasyMock.replay(userServiceImpl);
    EasyMock.replay(teacherUser);
  }

  @Test
  public void noProblem() {
    validator.validate(params, errors);
    assertTrue(!errors.hasErrors());
  }

  @Test
  public void emptyPassword1() {
    params.setPasswd1(EMPTY_PASSWORD);
    validator.validate(params, errors);

    assertTrue(errors.hasErrors());
    assertEquals(1, errors.getErrorCount());
    assertNotNull(errors.getFieldError("passwd1"));
  }

  @Test
  public void emptyPassword2() {
    params.setPasswd2(EMPTY_PASSWORD);
    validator.validate(params, errors);

    assertTrue(errors.hasErrors());
    assertEquals(1, errors.getErrorCount());
    assertNotNull(errors.getFieldError("passwd2"));
  }

  @Test
  public void emptyPasswords() {
    params.setPasswd1(EMPTY_PASSWORD);
    params.setPasswd2(EMPTY_PASSWORD);
    validator.validate(params, errors);
    assertTrue(errors.hasErrors());
    assertEquals(1, errors.getErrorCount());
    assertNotNull(errors.getFieldError("passwd1"));
  }

  @Test
  public void illegalPassword1() {
    params.setPasswd1(ILLEGAL_PASSWORD1);
    validator.validate(params, errors);
    EasyMock.verify(teacherUser);
    assertTrue(errors.hasErrors());
    assertEquals(2, errors.getErrorCount());
    assertNotNull(errors.getFieldError("passwd1"));
  }

  @Test
  public void illegalPassword2() {
    params.setPasswd1(ILLEGAL_PASSWORD2);
    validator.validate(params, errors);
    EasyMock.verify(teacherUser);
    assertTrue(errors.hasErrors());
    assertEquals(1, errors.getErrorCount());
    assertNotNull(errors.getFieldError("passwd1"));
  }

  @Test
  public void misMatchedPasswords() {
    params.setPasswd1(LEGAL_PASSWORD1);
    params.setPasswd2(LEGAL_PASSWORD2);
    validator.validate(params, errors);

    assertTrue(errors.hasErrors());
    assertEquals(1, errors.getErrorCount());
    assertNotNull(errors.getFieldError("passwd1"));
  }

  @After
  public void tearDown() {
    EasyMock.verify(userServiceImpl);
    EasyMock.verify(teacherUser);
    validator = null;
    params = null;
    errors = null;
  }
}
