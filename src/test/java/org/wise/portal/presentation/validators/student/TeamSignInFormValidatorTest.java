/**
 * Copyright (c) 2007-2018 Regents of the University of California (Regents). Created
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
package org.wise.portal.presentation.validators.student;

import junit.framework.TestCase;

import org.easymock.EasyMock;
import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.impl.PersistentUserDetails;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.domain.workgroup.impl.WorkgroupImpl;
import org.wise.portal.presentation.web.TeamSignInForm;
import org.wise.portal.service.run.impl.RunServiceImpl;
import org.wise.portal.service.user.impl.UserServiceImpl;
import org.wise.portal.service.workgroup.impl.WorkgroupServiceImpl;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Hiroki Terashima
 */
@RunWith(EasyMockRunner.class)
public class TeamSignInFormValidatorTest extends TestCase {

  private static final String USERNAME1 = "HirokiT619";

  private static final String USERNAME2 = "FrodoH11";

  private static final String USERNAME3 = "SebastianS619";

  private static final String PASSWORD2 = "pass2";

  private static final String PASSWORD3 = "pass3";

  private static final Long RUNID = 1L;

  private static final String EMPTY = "";

  private TeamSignInForm form;

  private Run run;

  private User user1;

  private User user2;

  private User user3;

  @TestSubject
  private TeamSignInFormValidator validator = new TeamSignInFormValidator();

  private Errors errors;

  @Mock
  private UserServiceImpl userService;

  @Mock
  private RunServiceImpl runService;

  @Mock
  private WorkgroupServiceImpl workgroupService;

  @Before
  public void setUp() {
    run = new RunImpl();
    user1 = new UserImpl();
    user2 = new UserImpl();
    user2.setUserDetails(new PersistentUserDetails());
    user3 = new UserImpl();
    user3.setUserDetails(new PersistentUserDetails());

    form = new TeamSignInForm();
    form.setUsername1(USERNAME1);
    form.setRunId(RUNID);
    errors = new BeanPropertyBindingResult(form, "");
  }

  @Test
  public void validate_OneMemberOnly_OK() {
    EasyMock.expect(userService.retrieveUserByUsername(USERNAME1)).andReturn(user1);
    EasyMock.replay(userService);
    try {
      EasyMock.expect(runService.retrieveById(RUNID)).andReturn(run);
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    }
    EasyMock.replay(runService);
    validator.validate(form, errors);
    assertTrue(!errors.hasErrors());
    EasyMock.verify(userService);
    EasyMock.verify(runService);
  }

  @Test
  public void validate_OneMemberOnlyEmptyUsername_error() {
    form.setUsername1(EMPTY);
    validator.validate(form, errors);
    assertTrue(errors.hasErrors());
    assertEquals(1, errors.getErrorCount());
    assertNotNull(errors.getFieldValue("username1"));
  }

  @Test
  public void validate_OneMemberOnlyNullUser_error() {
    EasyMock.expect(userService.retrieveUserByUsername(USERNAME1)).andReturn(null);
    EasyMock.replay(userService);
    validator.validate(form, errors);
    assertTrue(errors.hasErrors());
    assertEquals(1, errors.getErrorCount());
    assertNotNull(errors.getFieldValue("username1"));
    EasyMock.verify(userService);
  }

  @Test
  public void validate_UserOneUserTwo_OK() throws ObjectNotFoundException {
    EasyMock.expect(userService.retrieveUserByUsername(USERNAME1)).andReturn(user1);
    EasyMock.expect(runService.retrieveById(RUNID)).andReturn(run);
    EasyMock.replay(runService);
    List<Workgroup> workgroups = new ArrayList<Workgroup>();
    Workgroup workgroup = new WorkgroupImpl();
    workgroups.add(workgroup);
    EasyMock.expect(workgroupService.getWorkgroupListByRunAndUser(run, user1))
        .andReturn(workgroups);
    EasyMock.expect(userService.retrieveUserByUsername(USERNAME2)).andReturn(user2);
    EasyMock.expect(workgroupService.isUserInWorkgroupForRun(user2, run, workgroup))
        .andReturn(true);
    EasyMock.expect(userService.isPasswordCorrect(user2, PASSWORD2)).andReturn(true);
    EasyMock.replay(workgroupService);
    EasyMock.replay(userService);

    form.setUsername2(USERNAME2);
    form.setPassword2(PASSWORD2);
    validator.validate(form, errors);

    assertTrue(!errors.hasErrors());
    EasyMock.verify(userService);
    EasyMock.verify(runService);
  }

  @Test
  public void validate_UserTwoBadUsername_Error() throws ObjectNotFoundException {
    EasyMock.expect(userService.retrieveUserByUsername(USERNAME1)).andReturn(user1);
    EasyMock.expect(runService.retrieveById(RUNID)).andReturn(run);
    EasyMock.replay(runService);
    List<Workgroup> workgroups = new ArrayList<Workgroup>();
    Workgroup workgroup = new WorkgroupImpl();
    workgroups.add(workgroup);
    EasyMock.expect(workgroupService.getWorkgroupListByRunAndUser(run, user1))
        .andReturn(workgroups);
    EasyMock.expect(userService.retrieveUserByUsername(USERNAME2)).andReturn(null);
    EasyMock.replay(workgroupService);
    EasyMock.replay(userService);

    form.setUsername2(USERNAME2);
    form.setPassword2(PASSWORD2);
    validator.validate(form, errors);

    assertTrue(errors.hasErrors());
    EasyMock.verify(userService);
    EasyMock.verify(runService);
  }

  @Test
  public void validate_UserTwoBadPassword_Error() throws ObjectNotFoundException {
    EasyMock.expect(userService.retrieveUserByUsername(USERNAME1)).andReturn(user1);
    EasyMock.expect(runService.retrieveById(RUNID)).andReturn(run);
    EasyMock.replay(runService);
    List<Workgroup> workgroups = new ArrayList<Workgroup>();
    Workgroup workgroup = new WorkgroupImpl();
    workgroups.add(workgroup);
    EasyMock.expect(workgroupService.getWorkgroupListByRunAndUser(run, user1))
        .andReturn(workgroups);
    EasyMock.expect(userService.retrieveUserByUsername(USERNAME2)).andReturn(user2);
    EasyMock.expect(workgroupService.isUserInWorkgroupForRun(user2, run, workgroup))
        .andReturn(true);
    EasyMock.expect(userService.isPasswordCorrect(user2, PASSWORD3)).andReturn(false);
    EasyMock.replay(workgroupService);
    EasyMock.replay(userService);

    form.setUsername2(USERNAME2);
    form.setPassword2(PASSWORD3);
    validator.validate(form, errors);

    assertTrue(errors.hasErrors());
    EasyMock.verify(userService);
    EasyMock.verify(runService);
  }

  @Test
  public void validate_UserOneUserThree_OK() throws ObjectNotFoundException {
    EasyMock.expect(userService.retrieveUserByUsername(USERNAME1)).andReturn(user1);
    EasyMock.expect(runService.retrieveById(RUNID)).andReturn(run);
    EasyMock.replay(runService);
    List<Workgroup> workgroups = new ArrayList<Workgroup>();
    Workgroup workgroup = new WorkgroupImpl();
    workgroups.add(workgroup);
    EasyMock.expect(workgroupService.getWorkgroupListByRunAndUser(run, user1))
        .andReturn(workgroups);
    EasyMock.expect(userService.retrieveUserByUsername(USERNAME3)).andReturn(user3);
    EasyMock.expect(workgroupService.isUserInWorkgroupForRun(user3, run, workgroup))
        .andReturn(true);
    EasyMock.expect(userService.isPasswordCorrect(user3, PASSWORD3)).andReturn(true);
    EasyMock.replay(workgroupService);
    EasyMock.replay(userService);

    form.setUsername3(USERNAME3);
    form.setPassword3(PASSWORD3);
    validator.validate(form, errors);

    assertTrue(!errors.hasErrors());
    EasyMock.verify(userService);
    EasyMock.verify(runService);
  }

  @After
  public void tearDown() {
    form = null;
    validator = null;
    errors = null;
  }
}
