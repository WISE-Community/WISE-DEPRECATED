package org.wise.portal.presentation.web.controllers;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;

import org.easymock.Mock;
import org.junit.After;
import org.junit.Before;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.wise.portal.domain.Tag;
import org.wise.portal.domain.authentication.Gender;
import org.wise.portal.domain.authentication.Schoollevel;
import org.wise.portal.domain.authentication.impl.PersistentGrantedAuthority;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.ProjectImpl;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.domain.workgroup.impl.WorkgroupImpl;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.portal.PortalService;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.vle.wise5.VLEService;
import org.wise.portal.service.workgroup.WorkgroupService;

public class APIControllerTest {

  protected final String STUDENT_FIRSTNAME = "SpongeBob";

  protected final String STUDENT_LASTNAME = "Squarepants";

  protected final String STUDENT_USERNAME = "SpongeBobS0101";

  protected final String STUDENT_PASSWORD = "studentPass";

  protected final String STUDENT1_GOOGLE_ID = "google-user-12345";

  protected final String TEACHER_FIRSTNAME = "Squidward";

  protected final String TEACHER_LASTNAME = "Tentacles";

  protected final String TEACHER_USERNAME = "SquidwardTentacles";

  protected final String TEACHER2_USERNAME = "SandyCheeks";

  protected final String ADMIN_USERNAME = "MrKrabb";

  protected final String USERNAME_NOT_IN_DB = "usernameNotInDB";

  protected Long student1Id = 94678L;

  protected Long teacher1Id = 94210L;

  protected User student1, teacher1, teacher2, admin1;

  protected Authentication studentAuth, teacherAuth, adminAuth;

  protected StudentUserDetails student1UserDetails;

  protected TeacherUserDetails teacher1UserDetails, admin1UserDetails;

  protected Long runId1 = 1L;

  protected Long runId2 = 2L;

  protected Long runId3 = 3L;

  protected Long projectId1 = 1L;

  protected String RUN1_RUNCODE = "orca123";

  protected String RUN1_PERIOD1_NAME = "1";

  protected String RUN1_PERIOD2_NAME = "2";

  protected Run run1, run2, run3;

  protected List<Run> runs;

  protected List<Tag> run1Tags;

  protected Workgroup workgroup1, teacher1Run1Workgroup;

  protected Project project1, project2, project3;

  protected Group run1Period1, run1Period2;

  @Mock
  protected HttpServletRequest request;

  @Mock
  protected UserService userService;

  @Mock
  protected RunService runService;

  @Mock
  protected VLEService vleService;

  @Mock
  protected WorkgroupService workgroupService;

  @Mock
  protected ProjectService projectService;

  @Mock
  protected PortalService portalService;

  @Mock
  protected Properties appProperties;

  @Before
  public void setUp() {
    student1 = new UserImpl();
    student1.setId(student1Id);
    PersistentGrantedAuthority studentAuthority = new PersistentGrantedAuthority();
    studentAuthority.setAuthority(UserDetailsService.STUDENT_ROLE);
    student1UserDetails = new StudentUserDetails();
    student1UserDetails.setFirstname(STUDENT_FIRSTNAME);
    student1UserDetails.setLastname(STUDENT_LASTNAME);
    student1UserDetails.setUsername(STUDENT_USERNAME);
    student1UserDetails.setGender(Gender.FEMALE);
    student1UserDetails.setNumberOfLogins(5);
    student1UserDetails.setAuthorities(new GrantedAuthority[] { studentAuthority });
    student1UserDetails.setGoogleUserId(STUDENT1_GOOGLE_ID);
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
    teacher1UserDetails.setSchoollevel(Schoollevel.COLLEGE);
    teacher1UserDetails.setNumberOfLogins(5);
    teacher1UserDetails.setAuthorities(new GrantedAuthority[] { teacherAuthority });
    teacher1.setUserDetails(teacher1UserDetails);
    teacherAuth = new TestingAuthenticationToken(teacher1UserDetails, credentials);
    admin1 = new UserImpl();
    admin1UserDetails = new TeacherUserDetails();
    PersistentGrantedAuthority adminAuthority = new PersistentGrantedAuthority();
    adminAuthority.setAuthority(UserDetailsService.ADMIN_ROLE);
    admin1UserDetails.setAuthorities(new GrantedAuthority[] { adminAuthority });
    admin1UserDetails.setUsername(ADMIN_USERNAME);
    admin1.setUserDetails(admin1UserDetails);
    adminAuth = new TestingAuthenticationToken(admin1UserDetails, credentials);
    run1 = new RunImpl();
    run1.setId(runId1);
    run1.setOwner(teacher1);
    run1.setStarttime(new Date());
    run1.setMaxWorkgroupSize(3);
    run1.setRuncode(RUN1_RUNCODE);
    HashSet<Group> run1Periods = new HashSet<Group>();
    run1Period1 = new PersistentGroup();
    run1Period1.setName(RUN1_PERIOD1_NAME);
    run1Period1.addMember(student1);
    run1Periods.add(run1Period1);
    run1Period2 = new PersistentGroup();
    run1Period2.setName(RUN1_PERIOD2_NAME);
    run1Periods.add(run1Period2);
    run1.setPeriods(run1Periods);
    project1 = new ProjectImpl();
    project1.setId(projectId1);
    project1.setModulePath("/1/project.json");
    project1.setOwner(teacher1);
    project1.setWISEVersion(5);
    project1.setMaxTotalAssetsSize(15728640L);
    run1.setProject(project1);
    run1.setLastRun(new Date());
    workgroup1 = new WorkgroupImpl();
    workgroup1.addMember(student1);
    workgroup1.setPeriod(run1Period1);
    workgroup1.setRun(run1);
    teacher1Run1Workgroup = new WorkgroupImpl();
    teacher1Run1Workgroup.addMember(teacher1);
    teacher1Run1Workgroup.setRun(run1);
    teacher2 = new UserImpl();
    TeacherUserDetails tud2 = new TeacherUserDetails();
    tud2.setUsername(TEACHER2_USERNAME);
    teacher2.setUserDetails(tud2);
    runs = new ArrayList<Run>();
    run2 = new RunImpl();
    run2.setId(runId2);
    run2.setOwner(teacher1);
    run2.setStarttime(new Date());
    HashSet<Group> run2Periods = new HashSet<Group>();
    Group run2Period2 = new PersistentGroup();
    run2Period2.setName("2");
    run2Period2.addMember(student1);
    run2Periods.add(run2Period2);
    run2.setPeriods(run2Periods);
    project2 = new ProjectImpl();
    project2.setModulePath("/2/project.json");
    project2.setOwner(teacher2);
    run2.setProject(project2);
    run3 = new RunImpl();
    run3.setId(runId3);
    run3.setOwner(teacher2);
    run3.setStarttime(new Date());
    HashSet<Group> run3Periods = new HashSet<Group>();
    Group run3Period4 = new PersistentGroup();
    run3Period4.setName("4");
    run3Period4.addMember(student1);
    run3Periods.add(run3Period4);
    run3.setPeriods(run3Periods);
    project3 = new ProjectImpl();
    project3.setModulePath("/3/project.json");
    project3.setOwner(teacher2);
    run3.setProject(project3);
    runs.add(run1);
    runs.add(run2);
    runs.add(run3);
  }

  @After
  public void tearDown() {
    student1 = null;
    teacher1 = null;
    teacher2 = null;
    run1 = null;
    run2 = null;
    run3 = null;
    runs = null;
  }

  public APIControllerTest() {
  }
}
