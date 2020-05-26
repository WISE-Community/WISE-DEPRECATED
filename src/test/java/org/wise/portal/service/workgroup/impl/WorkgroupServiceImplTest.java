/**
 * Copyright (c) 2007 Encore Research Group, University of Toronto
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package org.wise.portal.service.workgroup.impl;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.isA;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertEquals;

import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;

import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.wise.portal.dao.group.GroupDao;
import org.wise.portal.dao.workgroup.WorkgroupDao;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.PersistentUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.domain.workgroup.impl.WorkgroupImpl;
import org.wise.portal.service.acl.AclService;
import org.wise.portal.service.group.GroupService;

/**
 * @author Cynick Young
 * @author Hiroki Terashima
 */
@RunWith(EasyMockRunner.class)
public class WorkgroupServiceImplTest {

  @Mock
  private WorkgroupDao<Workgroup> workgroupDao;

  @Mock
  private GroupDao<Group> groupDao;

  @Mock
  private AclService<Workgroup> aclService;

  @Mock
  private GroupService groupService;

  private Workgroup workgroup;

  private Run run;

  private User user1, user2, user3;

  private Group period1, period2;

  @TestSubject
  private WorkgroupServiceImpl workgroupService = new WorkgroupServiceImpl();

  private static final String WORKGROUP_NAME = "default workgroup";

  private static final String USERNAME_1 = "username 1";

  private static final String USERNAME_2 = "username 2";

  private static final String USERNAME_3 = "username 3";

  @Before
  public void setUp() {
    workgroup = new WorkgroupImpl();
    run = new RunImpl();
    period1 = new PersistentGroup();
    period1.setName("period1");
    period2 = new PersistentGroup();
    period2.setName("period2");
    user1 = new UserImpl();
    MutableUserDetails userDetails1 = new PersistentUserDetails();
    userDetails1.setUsername(USERNAME_1);
    user1.setUserDetails(userDetails1);
    user2 = new UserImpl();
    MutableUserDetails userDetails2 = new PersistentUserDetails();
    userDetails2.setUsername(USERNAME_2);
    user2.setUserDetails(userDetails2);
    user3 = new UserImpl();
    MutableUserDetails userDetails3 = new PersistentUserDetails();
    userDetails3.setUsername(USERNAME_3);
    user3.setUserDetails(userDetails3);
  }

  @After
  public void tearDown() {
    workgroupService = null;
    workgroupDao = null;
    groupDao = null;
    workgroup = null;
    run = null;
    user1 = null;
    user2 = null;
    user3 = null;
    aclService = null;
  }

  @Test
  public void getWorkgroupListByRunAndUser_RunAndUser_ShouldReturnWorkgroupList() {
    List<Workgroup> expectedList = new LinkedList<Workgroup>();
    expectedList.add(workgroup);
    expect(workgroupDao.getListByRunAndUser(run, user1)).andReturn(expectedList);
    replay(workgroupDao);
    assertEquals(expectedList, workgroupService.getWorkgroupListByRunAndUser(run, user1));
    verify(workgroupDao);
  }

  @Test
  public void getWorkgroupListForUser_User_ShouldReturnList() {
    List<Workgroup> expectedList = new LinkedList<Workgroup>();
    expectedList.add(workgroup);
    expect(workgroupDao.getListByUser(user1)).andReturn(expectedList);
    replay(workgroupDao);
    assertEquals(expectedList, workgroupService.getWorkgroupsForUser(user1));
    verify(workgroupDao);
  }

  @Test
  public void createWorkgroup_NoMembers_ShouldCreateWorkgroup() {
    groupDao.save(isA(Group.class));
    replay(groupDao);
    workgroupDao.save(isA(Workgroup.class));
    expectLastCall();
    replay(workgroupDao);
    Set<User> members = new HashSet<User>();
    Workgroup createdWorkgroup = workgroupService.createWorkgroup(
        WORKGROUP_NAME, members, run, period1);
    verify(workgroupDao);
    verify(groupDao);
    assertEquals(0, createdWorkgroup.getMembers().size());
  }

  @Test
  public void createWorkgroup_OneMembers_ShouldCreateWorkgroup() {
    Set<User> members = new HashSet<User>();
    members.add(user1);
    Workgroup createdWorkgroup = workgroupService.createWorkgroup(
        WORKGROUP_NAME, members, run, period1);
    assertEquals(1, createdWorkgroup.getMembers().size());
    assertEquals(" username 1", createdWorkgroup.getGroup().getName());
  }

  @Test
  public void addMembers_TwoMembersToOneMemberWorkgroup_ShouldAddMembers() {
    Workgroup workgroup = new WorkgroupImpl();
    workgroup.getMembers().add(user1);
    Set<User> newMembers = new HashSet<User>();
    newMembers.add(user2);
    newMembers.add(user3);
    groupDao.save(isA(Group.class));
    expectLastCall();
    replay(groupDao);
    workgroupDao.save(isA(Workgroup.class));
    expectLastCall();
    replay(workgroupDao);
    workgroupService.addMembers(workgroup, newMembers);
    assertEquals(3, workgroup.getMembers().size());
    assertEquals(" username 2 username 3 username 1", workgroup.getGroup().getName());
    verify(groupDao);
    verify(workgroupDao);
  }

  @Test
  public void removeMembers_TwoMembersFromThreeMemberWorkgroup_ShouldRemoveMembers() {
    Workgroup workgroup = new WorkgroupImpl();
    workgroup.getMembers().add(user1);
    workgroup.getMembers().add(user2);
    workgroup.getMembers().add(user3);
    Set<User> membersToRemove = new HashSet<User>();
    membersToRemove.add(user2);
    membersToRemove.add(user3);
    workgroupService.removeMembers(workgroup, membersToRemove);
    assertEquals(1, workgroup.getMembers().size());
  }

  @Test
  public void changePeriod_NewPeriod_ShouldMoveMembersAndChangePeriod() {
    Workgroup workgroup = new WorkgroupImpl();
    workgroup.setPeriod(period1);
    Set<User> members = new HashSet<User>();
    members.add(user1);
    members.add(user2);
    workgroup.setMembers(members);
    groupService.removeMembers(period1, members);
    expectLastCall();
    groupService.addMembers(period2, members);
    expectLastCall();
    workgroupDao.save(isA(Workgroup.class));
    expectLastCall();
    workgroupService.changePeriod(workgroup, period2);
    assertEquals(period2, workgroup.getPeriod());
    assertEquals(2, workgroup.getMembers().size());
  }
}
