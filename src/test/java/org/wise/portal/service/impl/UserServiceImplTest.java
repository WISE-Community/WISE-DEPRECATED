/**
 * Copyright (c) 2007 Regents of the University of California (Regents). Created
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
package org.wise.portal.service.impl;

import static junit.framework.TestCase.assertTrue;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertEquals;

import java.util.Calendar;
import java.util.Date;

import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.wise.portal.dao.authentication.GrantedAuthorityDao;
import org.wise.portal.dao.authentication.UserDetailsDao;
import org.wise.portal.dao.user.UserDao;
import org.wise.portal.domain.authentication.Gender;
import org.wise.portal.domain.authentication.MutableGrantedAuthority;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.PersistentGrantedAuthority;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.user.impl.UserServiceImpl;

/**
 * @author Hiroki Terashima
 */
@RunWith(EasyMockRunner.class)
public class UserServiceImplTest {

  @TestSubject
  private UserService userService = new UserServiceImpl();

  @Mock
  private UserDao<User> userDao;

  @Mock
  private UserDetailsDao<MutableUserDetails> userDetailsDao;

  @Mock
  private GrantedAuthorityDao<MutableGrantedAuthority> grantedAuthorityDao;

  @Mock
  private PasswordEncoder passwordEncoder;

  private static final String PASSWORD = "password";

  private static final String ENCODED_PASSWORD = "drowssap";

  private static final String FIRSTNAME = "Billy";

  private static final String LASTNAME = "Bob";

  private static Date BIRTHDAY;

  private static int BIRTHYEAR = 1990;

  private static int BIRTHMONTH = 12;

  private static int BIRTHDATE = 19;

  static {
    Calendar cal = Calendar.getInstance();
    cal.set(BIRTHYEAR, BIRTHMONTH - 1, BIRTHDATE);
    BIRTHDAY = cal.getTime();
  }

  private static final Date SIGNUPDATE = Calendar.getInstance().getTime();

  private static final Gender GENDER = Gender.FEMALE;

  private StudentUserDetails studentUserDetails;

  private TeacherUserDetails teacherUserDetails;

  private MutableGrantedAuthority studentAuthority;

  private MutableGrantedAuthority teacherAuthority;

  private MutableGrantedAuthority authorAuthority;

  private MutableGrantedAuthority userAuthority;

  private Integer DEFAULT_NUMBEROFLOGINS = new Integer(9);

  private static final String DEFAULT_ACCOUNT_QUESTION = "what is the name of your middle name?";

  private static final String DEFAULT_ACCOUNT_ANSWER = "John";

  @Before
  public void setupCreateTest() {
    studentUserDetails = new StudentUserDetails();
    studentUserDetails.setPassword(PASSWORD);
    studentUserDetails.setFirstname(FIRSTNAME);
    studentUserDetails.setLastname(LASTNAME);
    studentUserDetails.setSignupdate(SIGNUPDATE);
    studentUserDetails.setGender(GENDER);
    studentUserDetails.setBirthday(BIRTHDAY);
    studentUserDetails.setNumberOfLogins(DEFAULT_NUMBEROFLOGINS);
    studentUserDetails.setAccountQuestion(DEFAULT_ACCOUNT_QUESTION);
    studentUserDetails.setAccountAnswer(DEFAULT_ACCOUNT_ANSWER);

    teacherUserDetails = new TeacherUserDetails();
    teacherUserDetails.setPassword(PASSWORD);
    teacherUserDetails.setFirstname(FIRSTNAME);
    teacherUserDetails.setLastname(LASTNAME);

    userAuthority = new PersistentGrantedAuthority();
    userAuthority.setAuthority(UserDetailsService.USER_ROLE);
    studentAuthority = new PersistentGrantedAuthority();
    studentAuthority.setAuthority(UserDetailsService.STUDENT_ROLE);
    teacherAuthority = new PersistentGrantedAuthority();
    teacherAuthority.setAuthority(UserDetailsService.TEACHER_ROLE);
    authorAuthority = new PersistentGrantedAuthority();
    authorAuthority.setAuthority(UserDetailsService.AUTHOR_ROLE);
  }

  @Test
  public void createUser_ValidStudentUser_ShouldCreateStudentUser()
      throws Exception {
    expectStudentAuthorityLookup();
    expect(userDetailsDao.hasUsername("BillyB1219")).andReturn(false);
    replay(userDetailsDao);
    expect(passwordEncoder.encode(studentUserDetails.getPassword())).andReturn(ENCODED_PASSWORD);
    replay(passwordEncoder);
    userService.createUser(studentUserDetails);
    verify(grantedAuthorityDao);
    verify(userDetailsDao);
    assertEquals("BillyB1219", studentUserDetails.getUsername());
    assertEquals(ENCODED_PASSWORD, studentUserDetails.getPassword());
    assertUserHasStudentAuthorities();
  }

  @Test
  public void createUser_DuplicateStudentUsername_ShouldAppendSuffixToStudentUsername()
      throws Exception {
    expectStudentAuthorityLookup();
    expect(userDetailsDao.hasUsername("BillyB1219")).andReturn(true);
    expect(userDetailsDao.hasUsername("BillyB1219a")).andReturn(false);
    replay(userDetailsDao);
    expect(passwordEncoder.encode(studentUserDetails.getPassword())).andReturn(ENCODED_PASSWORD);
    replay(passwordEncoder);
    userService.createUser(studentUserDetails);
    verify(grantedAuthorityDao);
    verify(userDetailsDao);
    assertEquals("BillyB1219a", studentUserDetails.getUsername());
    assertEquals(ENCODED_PASSWORD, studentUserDetails.getPassword());
    assertUserHasStudentAuthorities();
  }

  @Test
  public void createUser_ValidTeacherUser_ShouldCreateTeacherUser()
      throws Exception {
    expectTeacherAuthorityLookup();
    expect(userDetailsDao.hasUsername("BillyBob")).andReturn(false);
    replay(userDetailsDao);
    expect(passwordEncoder.encode(teacherUserDetails.getPassword()))
        .andReturn(ENCODED_PASSWORD);
    replay(passwordEncoder);
    userService.createUser(teacherUserDetails);
    verify(grantedAuthorityDao);
    verify(userDetailsDao);
    assertEquals("BillyBob", teacherUserDetails.getUsername());
    assertEquals(ENCODED_PASSWORD, teacherUserDetails.getPassword());
    assertUserHasTeacherAuthorities();
  }

  @Test
  public void createUser_TeacherUserWithSpacesInName_ShouldCreateTeacherUserWithoutSpaces()
      throws Exception {
    teacherUserDetails.setFirstname("  Billy   ");
    teacherUserDetails.setLastname(" Bob       ");
    expectTeacherAuthorityLookup();
    expect(userDetailsDao.hasUsername("BillyBob")).andReturn(false);
    replay(userDetailsDao);
    expect(passwordEncoder.encode(teacherUserDetails.getPassword()))
        .andReturn(ENCODED_PASSWORD);
    replay(passwordEncoder);
    userService.createUser(teacherUserDetails);
    verify(grantedAuthorityDao);
    verify(userDetailsDao);
    assertEquals("BillyBob", teacherUserDetails.getUsername());
    assertEquals(ENCODED_PASSWORD, teacherUserDetails.getPassword());
    assertUserHasTeacherAuthorities();
  }

  private void expectStudentAuthorityLookup() {
    expect(grantedAuthorityDao.retrieveByName(UserDetailsService.STUDENT_ROLE))
        .andReturn(studentAuthority);
    expect(grantedAuthorityDao.retrieveByName(UserDetailsService.USER_ROLE))
        .andReturn(userAuthority);
    replay(grantedAuthorityDao);
  }

  private void assertUserHasStudentAuthorities() {
    assertTrue(studentUserDetails.hasGrantedAuthority(UserDetailsService.USER_ROLE));
    assertTrue(studentUserDetails.hasGrantedAuthority(UserDetailsService.STUDENT_ROLE));
  }

  private void expectTeacherAuthorityLookup() {
    expect(grantedAuthorityDao.retrieveByName(UserDetailsService.TEACHER_ROLE))
        .andReturn(teacherAuthority);
    expect(grantedAuthorityDao.retrieveByName(UserDetailsService.AUTHOR_ROLE))
        .andReturn(authorAuthority);
    expect(grantedAuthorityDao.retrieveByName(UserDetailsService.USER_ROLE))
        .andReturn(userAuthority);
    replay(grantedAuthorityDao);
  }

  private void assertUserHasTeacherAuthorities() {
    assertTrue(teacherUserDetails.hasGrantedAuthority(UserDetailsService.USER_ROLE));
    assertTrue(teacherUserDetails.hasGrantedAuthority(UserDetailsService.TEACHER_ROLE));
    assertTrue(teacherUserDetails.hasGrantedAuthority(UserDetailsService.AUTHOR_ROLE));
  }
}
