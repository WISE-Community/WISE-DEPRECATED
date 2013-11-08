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
package net.sf.sail.webapp.service.group.impl;

import java.util.HashSet;
import java.util.Set;

import junit.framework.TestCase;
import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.dao.group.GroupDao;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.authentication.MutableUserDetails;
import net.sf.sail.webapp.domain.authentication.impl.PersistentUserDetails;
import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.domain.group.impl.GroupParameters;
import net.sf.sail.webapp.domain.group.impl.PersistentGroup;
import net.sf.sail.webapp.domain.impl.UserImpl;
import net.sf.sail.webapp.service.AclService;
import net.sf.sail.webapp.service.group.CyclicalGroupException;

import org.easymock.EasyMock;
import org.springframework.security.acls.domain.BasePermission;

import static org.easymock.EasyMock.*;

/**
 * @author Hiroki Terashima
 * @version $Id$
 */
public class GroupServiceImplTest extends TestCase {

	private GroupDao<Group> mockGroupDao;
	
	private AclService<Group> mockGroupAclService;

	private Group group1, group2, group3;

	private GroupServiceImpl groupServiceImpl;

	private final String[] DEFAULT_GROUP_NAMES = { "Period 1", "Period 2",
			"My Science Class" };

	private User user1, user2, user3;

	private final String USERNAME_1 = "Badger";

	private final String USERNAME_2 = "Monkey";

	private final String USERNAME_3 = "Duck";

	/**
	 * @see junit.framework.TestCase#setUp()
	 */
	@Override
	@SuppressWarnings("unchecked")
	protected void setUp() throws Exception {
		super.setUp();
		this.groupServiceImpl = new GroupServiceImpl();

		this.mockGroupDao = createMock(GroupDao.class);
		this.mockGroupAclService = createMock(AclService.class);
		this.groupServiceImpl.setGroupDao(this.mockGroupDao);
		this.groupServiceImpl.setAclService(this.mockGroupAclService);
		
		this.group1 = new PersistentGroup();
		this.group2 = new PersistentGroup();
		this.group3 = new PersistentGroup();
		this.user1 = new UserImpl();
		this.user2 = new UserImpl();
		this.user3 = new UserImpl();

		MutableUserDetails userDetails1 = new PersistentUserDetails();
		userDetails1.setUsername(USERNAME_1);
		this.user1.setUserDetails(userDetails1);
		MutableUserDetails userDetails2 = new PersistentUserDetails();
		userDetails2.setUsername(USERNAME_2);
		this.user2.setUserDetails(userDetails2);
		MutableUserDetails userDetails3 = new PersistentUserDetails();
		userDetails3.setUsername(USERNAME_3);
		this.user3.setUserDetails(userDetails3);

	}

	/**
	 * @see junit.framework.TestCase#tearDown()
	 */
	@Override
	protected void tearDown() throws Exception {
		super.tearDown();
		this.groupServiceImpl = null;
		this.mockGroupDao = null;
		this.mockGroupAclService = null;

		this.group1 = null;
		this.group2 = null;
		this.group3 = null;
		this.user1 = null;
		this.user2 = null;
		this.user3 = null;
	}
		
	// Group 1 (root node)
	// name: DEFAULT_GROUP_NAMES[0]
	// parent: none
	// members: none
	private void createGroup1() {
		this.group1.setName(DEFAULT_GROUP_NAMES[0]);
		this.mockGroupDao.save(this.group1);
		expectLastCall();
		replay(this.mockGroupDao);
		
		this.mockGroupAclService.addPermission(this.group1, BasePermission.ADMINISTRATION);
		expectLastCall();
		replay(this.mockGroupAclService);

		GroupParameters groupParameters = new GroupParameters();
		groupParameters.setName(DEFAULT_GROUP_NAMES[0]);
		this.group1 = this.groupServiceImpl.createGroup(groupParameters);
		verify(this.mockGroupDao);
		reset(this.mockGroupDao);
		verify(this.mockGroupAclService);
		reset(this.mockGroupAclService);
		assertEquals(0, this.group1.getMembers().size());
		assertEquals(DEFAULT_GROUP_NAMES[0], this.group1.getName());
		assertNull(this.group1.getParent());
	}

	// Group 2 (root node)
	// name: DEFAULT_GROUP_NAMES[0]
	// parent: none
	// members: none
	private void createGroup2() {
		this.group2.setName(DEFAULT_GROUP_NAMES[0]);
		this.mockGroupDao.save(this.group2);
		expectLastCall();
		replay(this.mockGroupDao);

		this.mockGroupAclService.addPermission(this.group2, BasePermission.ADMINISTRATION);
		expectLastCall();
		replay(this.mockGroupAclService);

		GroupParameters groupParameters = new GroupParameters();
		groupParameters.setName(DEFAULT_GROUP_NAMES[0]);
		this.group2 = this.groupServiceImpl.createGroup(groupParameters);
		verify(this.mockGroupDao);
		reset(this.mockGroupDao);
		verify(this.mockGroupAclService);
		reset(this.mockGroupAclService);
		assertEquals(0, this.group2.getMembers().size());
		assertEquals(DEFAULT_GROUP_NAMES[0], this.group2.getName());
		assertNull(this.group2.getParent());
	}

	// Group 3 (intermediate node)
	// name: DEFAULT_GROUP_NAMES[2]
	// parent: group 1
	// members: none
	private void createGroup3() throws Exception {
		this.group3.setName(DEFAULT_GROUP_NAMES[2]);
		this.group3.setParent(this.group1);

		expect(this.mockGroupDao.getById(new Long(3))).andReturn(this.group1);
		this.mockGroupDao.save(this.group3);
		expectLastCall();
		replay(this.mockGroupDao);
		
		this.mockGroupAclService.addPermission(this.group3, BasePermission.ADMINISTRATION);
		expectLastCall();
		replay(this.mockGroupAclService);

		GroupParameters groupParameters = new GroupParameters();
		groupParameters.setName(DEFAULT_GROUP_NAMES[2]);
		groupParameters.setParentId(new Long(3));
		this.group3 = this.groupServiceImpl.createGroup(groupParameters);
		verify(this.mockGroupDao);
		reset(this.mockGroupDao);
		verify(this.mockGroupAclService);
		reset(this.mockGroupAclService);
		assertEquals(DEFAULT_GROUP_NAMES[2], this.group3.getName());
		assertEquals(0, this.group3.getMembers().size());
	}

	public void testCreateGroup() {

		// create group1
		createGroup1();

		// create another group with the same name
		createGroup2();

		assertEquals(this.group2.getName(), this.group1.getName());

	}

	public void testChangeGroupName() {

		// create group1
		createGroup1();

		// change group1's name
		this.group1.setName(DEFAULT_GROUP_NAMES[1]);
		this.mockGroupDao.save(this.group1);
		expectLastCall();
		replay(this.mockGroupDao);
		
		this.groupServiceImpl.changeGroupName(this.group1,
				DEFAULT_GROUP_NAMES[1]);
		verify(this.mockGroupDao);
		reset(this.mockGroupDao);
		assertEquals(DEFAULT_GROUP_NAMES[1], this.group1.getName());
	}

	// test creating a sub group. Creating this new group
	// will not create any cycle
	public void testCreateSubGroup_NoCycle() throws Exception {

		// create group1
		createGroup1();

		// create a new group whose parent is group1
		createGroup3();

		assertEquals(this.group3.getParent(), this.group1);
	}

	// test creating a sub group. Creating this new group
	// will create a cycle
	// However, right now, there is no way for this to happen
	// public void testCreateSubGroup_Cycle() {
	// }

	// test moving a group that won't result in cycles being created
	public void testMoveGroup_NoCycle() {
		// Start with two root nodes. Have the second root node's parent
		// point to the first. This should not create a cycle
		// A      A
		//    =>  ^
		//        |
		// B      B
		createGroup1(); // Root node A
		createGroup2(); // Root node B

		this.group2.setParent(this.group1);
		this.mockGroupDao.save(this.group2);
		// since there is no cycle, expect group2 to be saved
		expectLastCall();
		replay(this.mockGroupDao);
		
		try {
			this.groupServiceImpl.moveGroup(this.group1, this.group2);
		} catch (CyclicalGroupException e) {
			fail("CyclicalException NOT expected");
		}
		verify(this.mockGroupDao);
		reset(this.mockGroupDao);
		assertEquals(this.group2.getParent(), this.group1);
	}

	// test moving a group that results in a cycle being created
	public void testMoveGroup_Cycle_1() throws Exception {
		// test making a group's parent be itself.
		// This should create a cycle.
		createGroup1();
		try {
			this.groupServiceImpl.moveGroup(group1, group1);
			fail("CyclicalException expected");
		} catch (CyclicalGroupException e) {
		}

		// Now test that CyclicalGroupException is thrown for this:
		//         A            A
        //         ^            ^  \
		//         |    =>      |   |  
		//         B            B   |
		//                      ^  /
		//                      |/
		createGroup2(); // Root node A
		createGroup3(); // intermediate node B
		this.group3.setParent(this.group2);
		try {
			this.groupServiceImpl.moveGroup(this.group3, this.group2);
			fail("CyclicalException expected");
		} catch (CyclicalGroupException e) {
		}
		// assert that group node A's parent didn't get changed
		assertNull(this.group2.getParent());
	}

	public void testAddMembers() {

		// first create a group
		createGroup1();

		// add two members to this group
		Set<User> members = new HashSet<User>();
		members.add(this.user1);
		members.add(this.user2);
		this.group1.setMembers(members);

		this.mockGroupDao.save(this.group1);
		expectLastCall();
		replay(this.mockGroupDao);
		
		this.groupServiceImpl.addMembers(this.group1, members);

		verify(this.mockGroupDao);
		reset(this.mockGroupDao);

		assertEquals(2, this.group1.getMembers().size());

		// now try adding 2 more members, only 1 of which is new
		Set<User> newMembers = new HashSet<User>();
		newMembers.add(this.user3);
		newMembers.add(this.user1);
		this.groupServiceImpl.addMembers(this.group1, newMembers);
		assertEquals(3, this.group1.getMembers().size());
	}
	
	public void testRetrieveById() throws Exception {
		Group group = new PersistentGroup();
		Long groupId = new Long(5);
		expect(this.mockGroupDao.getById(groupId)).andReturn(group);
		replay(this.mockGroupDao);
		Group retrievedGroup = null;
		retrievedGroup = groupServiceImpl.retrieveById(groupId);
		
		assertEquals(group, retrievedGroup);
		verify(this.mockGroupDao);
		
		reset(this.mockGroupDao);
		expect(this.mockGroupDao.getById(groupId)).andThrow(new ObjectNotFoundException(groupId, Group.class));
		replay(this.mockGroupDao);
		retrievedGroup = null;
		try {
			retrievedGroup = groupServiceImpl.retrieveById(groupId);
			fail("ObjectNotFoundException not thrown but should have been thrown");
		} catch (ObjectNotFoundException e) {
		}
		
		assertNull(retrievedGroup);
		EasyMock.verify(this.mockGroupDao);
	}
}
