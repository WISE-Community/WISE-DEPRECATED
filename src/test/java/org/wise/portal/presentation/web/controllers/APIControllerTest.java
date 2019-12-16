package org.wise.portal.presentation.web.controllers;

import javax.servlet.http.HttpServletRequest;

import org.easymock.Mock;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.wise.portal.domain.authentication.impl.PersistentGrantedAuthority;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.service.authentication.UserDetailsService;

public class APIControllerTest {

  protected final String STUDENT_FIRSTNAME = "SpongeBob";

  protected final String STUDENT_LASTNAME = "Squarepants";

  protected final String STUDENT_USERNAME = "SpongeBobS0101";

  protected final String STUDENT_PASSWORD = "studentPass";

  protected final String STUEDENT1_GOOGLE_ID = "google-user-12345";

  protected final String TEACHER_FIRSTNAME = "Squidward";

  protected final String TEACHER_LASTNAME = "Tentacles";

  protected final String TEACHER_USERNAME = "SquidwardTentacles";

  protected final String USERNAME_NOT_IN_DB = "usernameNotInDB";

  protected Long student1Id = 94678L;

  protected Long teacher1Id = 94210L;

  protected User student1, teacher1, teacher2;

  protected Authentication studentAuth, teacherAuth;

  protected StudentUserDetails student1UserDetails;

  protected TeacherUserDetails teacher1UserDetails;

  @Mock
  protected HttpServletRequest request;

  public void setUp() {
    student1 = new UserImpl();
    student1.setId(student1Id);
    PersistentGrantedAuthority studentAuthority = new PersistentGrantedAuthority();
    studentAuthority.setAuthority(UserDetailsService.STUDENT_ROLE);
    student1UserDetails = new StudentUserDetails();
    student1UserDetails.setFirstname(STUDENT_FIRSTNAME);
    student1UserDetails.setLastname(STUDENT_LASTNAME);
    student1UserDetails.setUsername(STUDENT_USERNAME);
    student1UserDetails.setAuthorities(new GrantedAuthority[] { studentAuthority });
    student1UserDetails.setGoogleUserId(STUEDENT1_GOOGLE_ID);
    student1.setUserDetails(student1UserDetails);
    Object credentials = null;
    studentAuth = new TestingAuthenticationToken(student1UserDetails, credentials);
    teacher1 = new UserImpl();
    teacher1.setId(teacher1Id);
    PersistentGrantedAuthority teacherAuthority = new PersistentGrantedAuthority();
    teacherAuthority.setAuthority(UserDetailsService.TEACHER_ROLE);
    teacher1UserDetails = new TeacherUserDetails();
    teacher1UserDetails.setFirstname(TEACHER_FIRSTNAME);
    teacher1UserDetails.setLastname(TEACHER_LASTNAME);
    teacher1UserDetails.setUsername(TEACHER_USERNAME);
    teacher1UserDetails.setAuthorities(new GrantedAuthority[] { teacherAuthority });
    teacher1.setUserDetails(teacher1UserDetails);
    teacherAuth = new TestingAuthenticationToken(teacher1UserDetails, credentials);
  }

  public APIControllerTest() {
  }
}
