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
package org.wise.portal.service.group.impl;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.reset;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.fail;

import java.util.HashSet;
import java.util.Set;

import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.security.acls.domain.BasePermission;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.group.GroupDao;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.PersistentUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.GroupParameters;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.service.acl.AclService;
import org.wise.portal.service.group.CyclicalGroupException;
import org.wise.portal.service.group.GroupService;

/**
 * @author Hiroki Terashima
 */
@RunWith(EasyMockRunner.class)
public class GroupServiceImplTest {

  @TestSubject
  private GroupService groupService = new GroupServiceImpl();

  @Mock
  private GroupDao<Group> groupDao;

  @Mock
  private AclService<Group> groupAclService;

  private Group group1, group2, group3;

  private final String[] DEFAULT_GROUP_NAMES = { "Period 1", "Period 2",
      "My Science Class" };

  private User user1, user2, user3;

  private final String USERNAME_1 = "Badger";

  private final String USERNAME_2 = "Monkey";

  private final String USERNAME_3 = "Duck";

  @Before
  public void setUp() throws Exception {
    group1 = new PersistentGroup();
    group2 = new PersistentGroup();
    group3 = new PersistentGroup();
    user1 = new UserImpl();
    user2 = new UserImpl();
    user3 = new UserImpl();
    MutableUserDetails userDetails1 = new PersistentUserDetails();
    userDetails1.setUsername(USERNAME_1);
    user1.setUserDetails(userDetails1);
    MutableUserDetails userDetails2 = new PersistentUserDetails();
    userDetails2.setUsername(USERNAME_2);
    user2.setUserDetails(userDetails2);
    MutableUserDetails userDetails3 = new PersistentUserDetails();
    userDetails3.setUsername(USERNAME_3);
    user3.setUserDetails(userDetails3);
  }

  @After
  public void tearDown() throws Exception {
    groupService = null;
    groupDao = null;
    group1 = null;
    group2 = null;
    group3 = null;
    user1 = null;
    user2 = null;
    user3 = null;
  }

  // Group 1 (root node)
  // name: DEFAULT_GROUP_NAMES[0]
  // parent: none
  // members: none
  private void createGroup1() {
    group1.setName(DEFAULT_GROUP_NAMES[0]);
    groupDao.save(group1);
    expectLastCall();
    replay(groupDao);

    groupAclService.addPermission(group1, BasePermission.ADMINISTRATION);
    expectLastCall();
    replay(groupAclService);

    GroupParameters groupParameters = new GroupParameters();
    groupParameters.setName(DEFAULT_GROUP_NAMES[0]);
    group1 = groupService.createGroup(groupParameters);
    verify(groupDao);
    reset(groupDao);
    verify(groupAclService);
    reset(groupAclService);
    assertEquals(0, group1.getMembers().size());
    assertEquals(DEFAULT_GROUP_NAMES[0], group1.getName());
    assertNull(group1.getParent());
  }

  // Group 2 (root node)
  // name: DEFAULT_GROUP_NAMES[0]
  // parent: none
  // members: none
  private void createGroup2() {
    group2.setName(DEFAULT_GROUP_NAMES[0]);
    groupDao.save(group2);
    expectLastCall();
    replay(groupDao);

    groupAclService.addPermission(group2, BasePermission.ADMINISTRATION);
    expectLastCall();
    replay(groupAclService);

    GroupParameters groupParameters = new GroupParameters();
    groupParameters.setName(DEFAULT_GROUP_NAMES[0]);
    group2 = groupService.createGroup(groupParameters);
    verify(groupDao);
    reset(groupDao);
    verify(groupAclService);
    reset(groupAclService);
    assertEquals(0, group2.getMembers().size());
    assertEquals(DEFAULT_GROUP_NAMES[0], group2.getName());
    assertNull(group2.getParent());
  }

  // Group 3 (intermediate node)
  // name: DEFAULT_GROUP_NAMES[2]
  // parent: group 1
  // members: none
  private void createGroup3() throws Exception {
    group3.setName(DEFAULT_GROUP_NAMES[2]);
    group3.setParent(group1);

    expect(groupDao.getById(new Long(3))).andReturn(group1);
    groupDao.save(group3);
    expectLastCall();
    replay(groupDao);

    groupAclService.addPermission(group3, BasePermission.ADMINISTRATION);
    expectLastCall();
    replay(groupAclService);

    GroupParameters groupParameters = new GroupParameters();
    groupParameters.setName(DEFAULT_GROUP_NAMES[2]);
    groupParameters.setParentId(new Long(3));
    group3 = groupService.createGroup(groupParameters);
    verify(groupDao);
    reset(groupDao);
    verify(groupAclService);
    reset(groupAclService);
    assertEquals(DEFAULT_GROUP_NAMES[2], group3.getName());
    assertEquals(0, group3.getMembers().size());
  }

  @Test
  public void createGroup_TwoGroupsWithSameName_ShouldSucceed() {
    createGroup1();
    createGroup2();
    assertEquals(group2.getName(), group1.getName());
  }

  @Test
  public void createGroup_CreateSubGroup_NoCycleShouldBeCreated_hereisalongsenthis() throws Exception {
    createGroup1();
    createGroup3(); // create a new group whose parent is group1
    assertEquals(group3.getParent(), group1);
  }

  @Test
  public void changeGroupName_ValidGroupName_ShouldSucceed() {
    createGroup1();

    group1.setName(DEFAULT_GROUP_NAMES[1]); // change group1's name
    groupDao.save(group1);
    expectLastCall();
    replay(groupDao);

    groupService.changeGroupName(group1, DEFAULT_GROUP_NAMES[1]);
    verify(groupDao);
    reset(groupDao);
    assertEquals(DEFAULT_GROUP_NAMES[1], group1.getName());
  }

  @Test
  public void moveGroup_ChangeParent_NoCycleShouldBeCreated() {
    // Start with two root nodes. Have the second root node's parent
    // point to the first. This should not create a cycle
    // A A
    // => ^
    // |
    // B B
    createGroup1(); // Root node A
    createGroup2(); // Root node B
    group2.setParent(group1);
    groupDao.save(group2);
    expectLastCall(); // since there is no cycle, expect group2 to be saved
    replay(groupDao);

    try {
      groupService.moveGroup(group1, group2);
    } catch (CyclicalGroupException e) {
      fail("CyclicalException NOT expected");
    }
    verify(groupDao);
    reset(groupDao);
    assertEquals(group2.getParent(), group1);
  }

  @Test
  public void moveGroup_SetGroupParentToItself_ShouldThrowCycleException()
      throws Exception {
    // test making a group's parent be itself. This should create a cycle.
    createGroup1();
    try {
      groupService.moveGroup(group1, group1);
      fail("CyclicalException expected");
    } catch (CyclicalGroupException e) {
    }

    // Now test that CyclicalGroupException is thrown for this:
    // A A
    // ^ ^ \
    // | => | |
    // B B |
    // ^ /
    // |/
    createGroup2(); // Root node A
    createGroup3(); // intermediate node B
    group3.setParent(group2);
    try {
      groupService.moveGroup(group3, group2);
      fail("CyclicalException expected");
    } catch (CyclicalGroupException e) {
    }
    assertNull(group2.getParent()); // group node A's parent shouldn't have
                                    // changed
  }

  @Test
  public void addMembers_TwoDifferentMembers_ShouldSucceed() {
    createGroup1();

    Set<User> members = new HashSet<User>();
    members.add(user1);
    members.add(user2);
    group1.setMembers(members);
    groupDao.save(group1);
    expectLastCall();
    replay(groupDao);

    groupService.addMembers(group1, members);
    verify(groupDao);
    reset(groupDao);
    assertEquals(2, group1.getMembers().size());
  }

  @Test
  public void addMembers_ExistingMembers_ShouldNotAddToGroupAgain() {
    createGroup1();

    Set<User> members = new HashSet<User>();
    members.add(user1);
    group1.setMembers(members);
    groupDao.save(group1);
    expectLastCall();
    replay(groupDao);

    groupService.addMembers(group1, members);
    verify(groupDao);
    reset(groupDao);
    assertEquals(1, group1.getMembers().size());

    // now try adding 2 more members, only 1 of which is new
    Set<User> newMembers = new HashSet<User>();
    newMembers.add(user1);
    newMembers.add(user3);
    groupDao.save(group1);
    expectLastCall();
    replay(groupDao);
    groupService.addMembers(group1, newMembers);
    verify(groupDao);
    assertEquals(2, group1.getMembers().size());
  }

  @Test
  public void retrieveById_WithExistingGroupId_ShouldReturnGroup()
      throws Exception {
    createGroup1();

    Long groupId = group1.getId();
    expect(groupDao.getById(groupId)).andReturn(group1);
    replay(groupDao);

    Group retrievedGroup = groupService.retrieveById(groupId);
    assertEquals(group1, retrievedGroup);
    verify(groupDao);
  }

  @Test
  public void retrieveById_WithNonExistingGroupId_ShouldThrowException()
      throws Exception {
    Long groupId = new Long(-1);
    expect(groupDao.getById(groupId))
        .andThrow(new ObjectNotFoundException(groupId, Group.class));
    replay(groupDao);

    try {
      groupService.retrieveById(groupId);
      fail("ObjectNotFoundException not thrown but should have been thrown");
    } catch (ObjectNotFoundException e) {
    }
    verify(groupDao);
  }
}
