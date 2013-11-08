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
package net.sf.sail.webapp.service.workgroup.impl;

import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;

import junit.framework.TestCase;
import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.dao.group.GroupDao;
import net.sf.sail.webapp.dao.sds.HttpStatusCodeException;
import net.sf.sail.webapp.dao.sds.SdsWorkgroupDao;
import net.sf.sail.webapp.dao.workgroup.WorkgroupDao;
import net.sf.sail.webapp.domain.Offering;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.authentication.MutableUserDetails;
import net.sf.sail.webapp.domain.authentication.impl.PersistentUserDetails;
import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.domain.impl.OfferingImpl;
import net.sf.sail.webapp.domain.impl.UserImpl;
import net.sf.sail.webapp.domain.impl.WorkgroupImpl;
import net.sf.sail.webapp.domain.sds.SdsWorkgroup;
import net.sf.sail.webapp.service.AclService;

import org.easymock.EasyMock;

/**
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public class WorkgroupServiceImplTest extends TestCase {

    private SdsWorkgroupDao mockSdsWorkgroupDao;

    private SdsWorkgroup sdsWorkgroup;

    private WorkgroupDao<Workgroup> mockWorkgroupDao;
    
    private GroupDao<Group> mockGroupDao;

	private AclService<Workgroup> mockAclService;

    private Workgroup workgroup;

    private WorkgroupServiceImpl workgroupServiceImpl;
    
    private static final String DEFAULT_WORKGROUP_NAME = "default workgroup";

	private static final String USERNAME_1 = "username 1";

	private static final String USERNAME_2 = "username 2";
	
	private static final String USERNAME_3 = "username 3";

    /**
     * @see junit.framework.TestCase#setUp()
     */
    @Override
    @SuppressWarnings("unchecked")
    protected void setUp() throws Exception {
        super.setUp();
        this.workgroupServiceImpl = new WorkgroupServiceImpl();

        this.mockSdsWorkgroupDao = EasyMock.createMock(SdsWorkgroupDao.class);
        this.workgroupServiceImpl.setSdsWorkgroupDao(this.mockSdsWorkgroupDao);

        this.mockWorkgroupDao = EasyMock.createMock(WorkgroupDao.class);
        this.workgroupServiceImpl.setWorkgroupDao(this.mockWorkgroupDao);
        
        this.mockGroupDao = EasyMock.createMock(GroupDao.class);
        this.workgroupServiceImpl.setGroupDao(this.mockGroupDao);
        
		this.mockAclService = EasyMock.createMock(AclService.class);
		this.workgroupServiceImpl.setAclService(mockAclService);

        this.sdsWorkgroup = new SdsWorkgroup();

        this.workgroup = new WorkgroupImpl();
        this.workgroup.setSdsWorkgroup(this.sdsWorkgroup);
    }

    /**
     * @see junit.framework.TestCase#tearDown()
     */
    @Override
    protected void tearDown() throws Exception {
        super.tearDown();
        this.workgroupServiceImpl = null;
        this.mockSdsWorkgroupDao = null;
        this.sdsWorkgroup = null;
        this.mockWorkgroupDao = null;
        this.mockGroupDao = null;
        this.workgroup = null;
        this.mockAclService = null;
    }

    // TODO: LW OR HT: needs replay() and verify()
    public void testCreatePreviewWorkgroupForOfferingIfNecessary_Necessary() {
        Offering expectedOffering = new OfferingImpl();
        User expectedUser = new UserImpl();
        MutableUserDetails userDetails1 = new PersistentUserDetails();
        userDetails1.setUsername(USERNAME_1);
        expectedUser.setUserDetails(userDetails1);
                
        List<Workgroup> inputList = new LinkedList<Workgroup>();

        this.mockGroupDao.save(null);
        EasyMock.expectLastCall();
        this.mockSdsWorkgroupDao.save(null);
        EasyMock.expectLastCall();
        this.mockWorkgroupDao.save(null);
        EasyMock.expectLastCall();

        List<Workgroup> actualList = this.workgroupServiceImpl
                .createPreviewWorkgroupForOfferingIfNecessary(expectedOffering,
                        inputList, expectedUser, null);
        assertEquals(1, actualList.size());
        Workgroup actualWorkgroup = actualList.get(0);
        assertEquals(expectedOffering, actualWorkgroup.getOffering());
        assertEquals(1, actualWorkgroup.getMembers().size());
        assertTrue(actualWorkgroup.getMembers().contains(expectedUser));
    }

    public void testCreatePreviewWorkgroupForOfferingIfNecessary_NotNecessary() {
        List<Workgroup> expectedList = new LinkedList<Workgroup>();
        expectedList.add(this.workgroup);
        Offering expectedOffering = new OfferingImpl();

        EasyMock.replay(this.mockSdsWorkgroupDao);
        EasyMock.replay(this.mockWorkgroupDao);

        assertEquals(expectedList, this.workgroupServiceImpl
                .createPreviewWorkgroupForOfferingIfNecessary(expectedOffering,
                        expectedList, null, null));
        EasyMock.verify(this.mockSdsWorkgroupDao);
        EasyMock.verify(this.mockWorkgroupDao);
    }

    public void testGetWorkgroupListByOfferingAndUser() {
        List<Workgroup> expectedList = new LinkedList<Workgroup>();
        expectedList.add(this.workgroup);

        EasyMock.expect(
                this.mockWorkgroupDao.getListByOfferingAndUser(null, null))
                .andReturn(expectedList);
        EasyMock.replay(this.mockWorkgroupDao);
        assertEquals(expectedList, workgroupServiceImpl
                .getWorkgroupListByOfferingAndUser(null, null));
        EasyMock.verify(this.mockWorkgroupDao);
    }

    public void testGetWorkgroupList() throws Exception {
        List<Workgroup> expectedList = new LinkedList<Workgroup>();
        expectedList.add(this.workgroup);

        EasyMock.expect(this.mockWorkgroupDao.getList())
                .andReturn(expectedList);
        EasyMock.replay(this.mockWorkgroupDao);
        assertEquals(expectedList, workgroupServiceImpl.getWorkgroupList());
        EasyMock.verify(this.mockWorkgroupDao);
    }
   
    // tests that the command is delegated to the DAOs and that the DAOs are
    // called once
    public void testCreateWorkgroup() throws Exception {
    	// test for createWorkgroup(String, Set<User>, Offering) method.
    	
    	this.mockGroupDao.save(EasyMock.isA(Group.class));
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockGroupDao);

        this.mockSdsWorkgroupDao.save(EasyMock.isA(SdsWorkgroup.class));
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockSdsWorkgroupDao);

        this.mockWorkgroupDao.save(EasyMock.isA(Workgroup.class));
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockWorkgroupDao);

        // test when we want to create a workgroup with no members
        Set<User> members = new HashSet<User>();
        Offering offering = new OfferingImpl();
        offering.setSdsOffering(this.sdsWorkgroup.getSdsOffering());
        Workgroup createdWorkgroup = 
        	this.workgroupServiceImpl.createWorkgroup(DEFAULT_WORKGROUP_NAME, members, offering);

        assertEquals(0, createdWorkgroup.getMembers().size());
        EasyMock.verify(this.mockGroupDao);
        EasyMock.verify(this.mockSdsWorkgroupDao);
        EasyMock.verify(this.mockWorkgroupDao);

        // now test when we want to create a workgroup with at least one member
        EasyMock.reset(this.mockGroupDao);
        EasyMock.reset(this.mockSdsWorkgroupDao);
        EasyMock.reset(this.mockWorkgroupDao);
        
    	this.mockGroupDao.save(EasyMock.isA(Group.class));
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockGroupDao);
        
        this.mockSdsWorkgroupDao.save(EasyMock.isA(SdsWorkgroup.class));
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockSdsWorkgroupDao);

        this.mockWorkgroupDao.save(EasyMock.isA(Workgroup.class));
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockWorkgroupDao);

        User newuser = new UserImpl();
        MutableUserDetails userDetails1 = new PersistentUserDetails();
        userDetails1.setUsername(USERNAME_1);
        newuser.setUserDetails(userDetails1);
        members.add(newuser);
        
        createdWorkgroup = 
        	this.workgroupServiceImpl.createWorkgroup(DEFAULT_WORKGROUP_NAME, members, offering);

        assertEquals(1, createdWorkgroup.getMembers().size());
        EasyMock.verify(this.mockGroupDao);
        EasyMock.verify(this.mockSdsWorkgroupDao);
        EasyMock.verify(this.mockWorkgroupDao);
    }
    
    public void testCreateWorkgroup_BadRequestException() throws Exception {
    	// test for createWorkgroup(String, Set<User>, Offering) method.
        this.mockSdsWorkgroupDao.save(EasyMock.isA(SdsWorkgroup.class));
        EasyMock.expectLastCall().andThrow(
                new HttpStatusCodeException("bad request"));
        EasyMock.replay(this.mockSdsWorkgroupDao);

        // expecting no calls to groupDao.save() and workgroupDao.save()
        EasyMock.replay(this.mockGroupDao);
        EasyMock.replay(this.mockWorkgroupDao);

        try {
        	 Set<User> members = new HashSet<User>();
             Offering offering = new OfferingImpl();
             offering.setSdsOffering(this.sdsWorkgroup.getSdsOffering());
            this.workgroupServiceImpl.createWorkgroup(DEFAULT_WORKGROUP_NAME, members, offering);
            fail("HttpStatusCodeException expected");
        } catch (HttpStatusCodeException expected) {
        }
        
        EasyMock.verify(this.mockSdsWorkgroupDao);
        EasyMock.verify(this.mockGroupDao);   
        EasyMock.verify(this.mockWorkgroupDao);
    }

    public void testCreateWorkgroup_NetworkTransportException()
            throws Exception {
    	// test for createWorkgroup(String, Set<User>, Offering) method.

        this.mockSdsWorkgroupDao.save(EasyMock.isA(SdsWorkgroup.class));
        EasyMock.expectLastCall().andThrow(
                new HttpStatusCodeException("http status code exception"));
        EasyMock.replay(this.mockSdsWorkgroupDao);

        // expecting no calls to groupDao.save() and workgroupDao.save()
        EasyMock.replay(this.mockGroupDao);
        EasyMock.replay(this.mockWorkgroupDao);

        try {
        	Set<User> members = new HashSet<User>();
        	Offering offering = new OfferingImpl();
        	offering.setSdsOffering(this.sdsWorkgroup.getSdsOffering());
        	this.workgroupServiceImpl.createWorkgroup(DEFAULT_WORKGROUP_NAME, members, offering);
        	fail("HttpStatusCodeException expected");
        } catch (HttpStatusCodeException expected) {
        }
        EasyMock.verify(this.mockSdsWorkgroupDao);
        EasyMock.verify(this.mockGroupDao);   
        EasyMock.verify(this.mockWorkgroupDao);
    }
    
    public void testAddMembers() {
    	this.mockGroupDao.save(EasyMock.isA(Group.class));
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockGroupDao);

        this.mockSdsWorkgroupDao.save(EasyMock.isA(SdsWorkgroup.class));
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockSdsWorkgroupDao);

        this.mockWorkgroupDao.save(EasyMock.isA(Workgroup.class));
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockWorkgroupDao);

        // test when we want to create a workgroup with no members
        Set<User> members = new HashSet<User>();
        Offering offering = new OfferingImpl();
        offering.setSdsOffering(this.sdsWorkgroup.getSdsOffering());

        this.workgroupServiceImpl.createWorkgroup(DEFAULT_WORKGROUP_NAME, members, offering);

        EasyMock.verify(this.mockSdsWorkgroupDao);
        EasyMock.verify(this.mockGroupDao);
        EasyMock.verify(this.mockWorkgroupDao);
        EasyMock.reset(this.mockGroupDao);
        EasyMock.reset(this.mockWorkgroupDao);
        EasyMock.reset(this.mockSdsWorkgroupDao);

        // now add one member to that workgroup
        User newuser = new UserImpl();
        MutableUserDetails userDetails1 = new PersistentUserDetails();
        userDetails1.setUsername(USERNAME_1);
        newuser.setUserDetails(userDetails1);
        this.workgroup.addMember(newuser);
    	this.mockGroupDao.save(EasyMock.isA(Group.class));
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockGroupDao);

        this.mockWorkgroupDao.save(this.workgroup);
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockWorkgroupDao);
        
        this.sdsWorkgroup.addMember(newuser.getSdsUser());
        this.mockSdsWorkgroupDao.save(this.sdsWorkgroup);
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockSdsWorkgroupDao);
                
        Set<User> membersToAdd = new HashSet<User>();
        membersToAdd.add(newuser);
        this.workgroupServiceImpl.addMembers(this.workgroup, membersToAdd);

        assertEquals(1, this.workgroup.getMembers().size());
        EasyMock.verify(this.mockSdsWorkgroupDao);
        EasyMock.verify(this.mockGroupDao);
        EasyMock.verify(this.mockWorkgroupDao);
        
        // try to add a new user to that workgroup. should increase membership by 1
        EasyMock.reset(this.mockGroupDao);
        EasyMock.reset(this.mockWorkgroupDao);
        EasyMock.reset(this.mockSdsWorkgroupDao);

        User newuser2 = new UserImpl();
        MutableUserDetails userDetails2 = new PersistentUserDetails();
        userDetails2.setUsername(USERNAME_2);
        newuser2.setUserDetails(userDetails2);
        this.workgroup.addMember(newuser2);
    	this.mockGroupDao.save(EasyMock.isA(Group.class));
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockGroupDao);

        this.mockWorkgroupDao.save(this.workgroup);
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockWorkgroupDao);
        
        this.sdsWorkgroup.addMember(newuser2.getSdsUser());
        this.mockSdsWorkgroupDao.save(this.sdsWorkgroup);
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockSdsWorkgroupDao);
                
        membersToAdd.add(newuser2);
        this.workgroupServiceImpl.addMembers(this.workgroup, membersToAdd);

        assertEquals(2, this.workgroup.getMembers().size());
        EasyMock.verify(this.mockSdsWorkgroupDao);
        EasyMock.verify(this.mockGroupDao);
        EasyMock.verify(this.mockWorkgroupDao);

        // try to add the already-existing user again...should not add
        EasyMock.reset(this.mockWorkgroupDao);
        EasyMock.reset(this.mockGroupDao);
        EasyMock.reset(this.mockSdsWorkgroupDao);

        this.workgroup.addMember(newuser);
    	this.mockGroupDao.save(EasyMock.isA(Group.class));
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockGroupDao);

        this.mockWorkgroupDao.save(this.workgroup);
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockWorkgroupDao);
        
        this.sdsWorkgroup.addMember(newuser.getSdsUser());
        this.mockSdsWorkgroupDao.save(this.sdsWorkgroup);
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockSdsWorkgroupDao);
        
        membersToAdd = new HashSet<User>();
        membersToAdd.add(newuser);
        this.workgroupServiceImpl.addMembers(this.workgroup, membersToAdd);

        assertEquals(2, this.workgroup.getMembers().size());
        EasyMock.verify(this.mockSdsWorkgroupDao);
        EasyMock.verify(this.mockGroupDao);
        EasyMock.verify(this.mockWorkgroupDao);
    }
    
    public void testRemoveMembers() {
        this.mockSdsWorkgroupDao.save(EasyMock.isA(SdsWorkgroup.class));
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockSdsWorkgroupDao);

        this.mockWorkgroupDao.save(EasyMock.isA(Workgroup.class));
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockWorkgroupDao);

        // test when we want to create a workgroup with no members
        Set<User> members = new HashSet<User>();
        Offering offering = new OfferingImpl();
        offering.setSdsOffering(this.sdsWorkgroup.getSdsOffering());

        this.workgroupServiceImpl.createWorkgroup(DEFAULT_WORKGROUP_NAME, members, offering);

        EasyMock.verify(this.mockSdsWorkgroupDao);
        EasyMock.verify(this.mockWorkgroupDao);
        EasyMock.reset(this.mockWorkgroupDao);
        EasyMock.reset(this.mockSdsWorkgroupDao);

        // now add one member to that workgroup
        User newuser = new UserImpl();
        MutableUserDetails userDetails1 = new PersistentUserDetails();
        userDetails1.setUsername(USERNAME_1);
        newuser.setUserDetails(userDetails1);
        this.workgroup.addMember(newuser);
        this.mockWorkgroupDao.save(this.workgroup);
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockWorkgroupDao);
        
        this.sdsWorkgroup.addMember(newuser.getSdsUser());
        this.mockSdsWorkgroupDao.save(this.sdsWorkgroup);
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockSdsWorkgroupDao);
                
        Set<User> membersToAdd = new HashSet<User>();
        membersToAdd.add(newuser);
        this.workgroupServiceImpl.addMembers(this.workgroup, membersToAdd);

        assertEquals(1, this.workgroup.getMembers().size());
        EasyMock.verify(this.mockSdsWorkgroupDao);
        EasyMock.verify(this.mockWorkgroupDao);
        
        // try to remove that user from that workgroup. should decrease membership by 1
        EasyMock.reset(this.mockWorkgroupDao);
        EasyMock.reset(this.mockSdsWorkgroupDao);

        // make sure workgroup was not deleted
        assertEquals(1, this.workgroup.getMembers().size());
        
        this.workgroup.removeMember(newuser);
        this.mockWorkgroupDao.save(this.workgroup);
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockWorkgroupDao);
        
        this.sdsWorkgroup.removeMember(newuser.getSdsUser());
        this.mockSdsWorkgroupDao.save(this.sdsWorkgroup);
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockSdsWorkgroupDao);

        Set<User> membersToRemove = new HashSet<User>();
        membersToRemove.add(newuser);
        this.workgroupServiceImpl.removeMembers(this.workgroup, membersToRemove);
        
        assertEquals(0, this.workgroup.getMembers().size());
        EasyMock.verify(this.mockSdsWorkgroupDao);
        EasyMock.verify(this.mockWorkgroupDao);
        
     // try to remove two users from the workgroup. should decrease membership by 2
        EasyMock.reset(this.mockWorkgroupDao);
        EasyMock.reset(this.mockSdsWorkgroupDao);

        assertEquals(0, this.workgroup.getMembers().size());

        User newuser2 = new UserImpl();
        MutableUserDetails userDetails2 = new PersistentUserDetails();
        userDetails2.setUsername(USERNAME_2);
        newuser2.setUserDetails(userDetails2);
        this.workgroup.addMember(newuser2);
        this.workgroup.addMember(newuser);
        
        membersToRemove.add(newuser2);
        
        this.workgroup.removeMember(newuser);
        this.workgroup.removeMember(newuser2);
        this.mockWorkgroupDao.save(this.workgroup);
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockWorkgroupDao);
        
        this.sdsWorkgroup.removeMember(newuser.getSdsUser());
        this.sdsWorkgroup.removeMember(newuser2.getSdsUser());
        this.mockSdsWorkgroupDao.save(this.sdsWorkgroup);
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockSdsWorkgroupDao);
        
        membersToRemove.add(newuser2);
        this.workgroupServiceImpl.removeMembers(this.workgroup, membersToRemove);      
        
        assertEquals(0, this.workgroup.getMembers().size());
        EasyMock.verify(this.mockSdsWorkgroupDao);
        EasyMock.verify(this.mockWorkgroupDao);
        
     // try to remove two users from a workgroup of 3. should decrease membership by 2. 1 member remains
        EasyMock.reset(this.mockWorkgroupDao);
        EasyMock.reset(this.mockSdsWorkgroupDao);
        
        User newuser3 = new UserImpl();
        MutableUserDetails userDetails3 = new PersistentUserDetails();
        userDetails3.setUsername(USERNAME_3);
        newuser3.setUserDetails(userDetails3);
        this.workgroup.addMember(newuser3);
        this.workgroup.addMember(newuser2);
        this.workgroup.addMember(newuser);
        
        membersToRemove.add(newuser3);
        assertEquals(3, membersToRemove.size());
        
        this.workgroup.removeMember(newuser);
        this.workgroup.removeMember(newuser3);
        this.mockWorkgroupDao.save(this.workgroup);
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockWorkgroupDao);
        
        this.sdsWorkgroup.removeMember(newuser.getSdsUser());
        this.sdsWorkgroup.removeMember(newuser3.getSdsUser());
        this.mockSdsWorkgroupDao.save(this.sdsWorkgroup);
        EasyMock.expectLastCall();
        EasyMock.replay(this.mockSdsWorkgroupDao);
        
        membersToRemove.remove(newuser2);
        this.workgroupServiceImpl.removeMembers(this.workgroup, membersToRemove);      
        
        assertEquals(1, this.workgroup.getMembers().size());
        EasyMock.verify(this.mockSdsWorkgroupDao);
        EasyMock.verify(this.mockWorkgroupDao);

    }
    
    public void testRetrieveById() throws Exception {
    	Workgroup workgroup = new WorkgroupImpl();
    	Long workgroupId = new Long(5);
    	EasyMock.expect(this.mockWorkgroupDao.getById(workgroupId)).andReturn(workgroup);
    	EasyMock.replay(this.mockWorkgroupDao);
    	Workgroup retrievedWorkgroup = null;
    	retrievedWorkgroup = workgroupServiceImpl.retrieveById(workgroupId);
    	
    	assertEquals(workgroup, retrievedWorkgroup);
    	EasyMock.verify(this.mockWorkgroupDao);
    	
    	EasyMock.reset(this.mockWorkgroupDao);
    	EasyMock.expect(this.mockWorkgroupDao.getById(workgroupId)).andThrow(new ObjectNotFoundException(workgroupId, Workgroup.class));
    	EasyMock.replay(this.mockWorkgroupDao);
    	retrievedWorkgroup = null;
    	try {
    		retrievedWorkgroup = workgroupServiceImpl.retrieveById(workgroupId);
    		fail("ObjectNotFoundException not thrown but should have been thrown");
		} catch (ObjectNotFoundException e) {
		}
		
		assertNull(retrievedWorkgroup);
		EasyMock.verify(this.mockWorkgroupDao);
    }
}