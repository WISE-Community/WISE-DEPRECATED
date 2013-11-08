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
package org.telscenter.sail.webapp.service.student.impl;

import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.reset;
import static org.easymock.EasyMock.verify;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import java.util.TreeSet;

import junit.framework.TestCase;
import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.domain.group.impl.PersistentGroup;
import net.sf.sail.webapp.domain.impl.UserImpl;
import net.sf.sail.webapp.service.AclService;
import net.sf.sail.webapp.service.group.GroupService;
import net.sf.sail.webapp.service.workgroup.WorkgroupService;

import org.telscenter.sail.webapp.domain.PeriodNotFoundException;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.StudentUserAlreadyAssociatedWithRunException;
import org.telscenter.sail.webapp.domain.impl.Projectcode;
import org.telscenter.sail.webapp.domain.impl.RunImpl;
import org.telscenter.sail.webapp.service.offering.RunService;
import org.telscenter.sail.webapp.service.student.StudentService;

/**
 * @author Hiroki Terashima
 * @version $Id$
 */
public class StudentServiceImplTest extends TestCase {

	private StudentServiceImpl studentService;
	
	private RunService mockRunService;
	
	private GroupService mockGroupService;
	
	private AclService<Run> mockAclService;
	
	private WorkgroupService mockWorkgroupService;
	
	private User studentUser;
	
	private Projectcode projectcode;
	
	private final String RUNCODE = "falcon4432";
	
	private final String PERIODNAME = "3";

	private final String NON_EXISTING_PERIODNAME = "4";

	private Run run;
	
	private final Long runId = new Long(3);
	
	@SuppressWarnings("unchecked")
	@Override
	protected void setUp() throws Exception {
		super.setUp();
		mockRunService = createMock(RunService.class);
		mockGroupService = createMock(GroupService.class);
		mockAclService = createMock(AclService.class);
		mockWorkgroupService = createMock(WorkgroupService.class);
		studentUser = new UserImpl();
		projectcode = new Projectcode(RUNCODE, PERIODNAME);
		studentService = new StudentServiceImpl();
		studentService.setAclService(mockAclService);
		studentService.setRunService(mockRunService);
		studentService.setGroupService(mockGroupService);
		studentService.setWorkgroupService(mockWorkgroupService);
		run = new RunImpl();
		Set<Group> periods = new TreeSet<Group>();
		Group period3 = new PersistentGroup();
		period3.setName(PERIODNAME);
		periods.add(period3);
		run.setPeriods(periods);
	}
	
	@Override
	protected void tearDown() throws Exception {
		super.tearDown();
		mockRunService = null;
		mockGroupService = null;
		mockAclService = null;
		studentUser = null;
		projectcode = null;		
		studentService = null;
	}
	
	public void testAddStudentToRun_success() 
	     throws ObjectNotFoundException, PeriodNotFoundException, 
	     StudentUserAlreadyAssociatedWithRunException {
  	    expect(mockRunService.retrieveRunByRuncode(RUNCODE)).andReturn(run);
  	    replay(mockRunService);
  	    Group period = run.getPeriodByName(PERIODNAME);
  	    Set<User> membersToAdd = new HashSet<User>();
  	    membersToAdd.add(studentUser);
  	    mockGroupService.addMembers(period, membersToAdd);
  	    expectLastCall();
  	    replay(mockGroupService);
  	    
  	    studentService.addStudentToRun(studentUser, projectcode);
  	    
  	    verify(mockRunService);
  	    verify(mockGroupService);
	}
	
	public void testAddStudentToRun_RunNotFoundException() 
	    throws PeriodNotFoundException, ObjectNotFoundException {
  	    expect(mockRunService.retrieveRunByRuncode(RUNCODE))
  	        .andThrow(new ObjectNotFoundException(runId, Run.class));
  	    replay(mockRunService);
  	    replay(mockGroupService);  // not expecting mockGroupService to be called at all
  	                               // because of the exception
  	    
  	    try {
			studentService.addStudentToRun(studentUser, projectcode);
			fail("ObjectNotFoundException was expected to be thrown but was not");
		} catch (ObjectNotFoundException oe) {
		} catch (PeriodNotFoundException pe) {
			fail("PeriodNotFoundException was not expected to be thrown");
		} catch (StudentUserAlreadyAssociatedWithRunException se) {
			fail("StudentUserAlreadyAssociatedWithRunException was not expected to be thrown");
		}
  	    
  	    verify(mockRunService);
  	    verify(mockGroupService);
	}
	
	public void testAddStudentsToRun_PeriodNotFoundException() 
	    throws ObjectNotFoundException, PeriodNotFoundException {
  	    expect(mockRunService.retrieveRunByRuncode(RUNCODE)).andReturn(run);
  	    replay(mockRunService);
  	    try {
  	        @SuppressWarnings("unused")
			Group period = run.getPeriodByName(NON_EXISTING_PERIODNAME);
			fail("PeriodNotFoundException was expected to be thrown but was not");
  	    } catch (PeriodNotFoundException e) {
  	    }
  	    replay(mockGroupService);  // not expecting mockGroupService to be called at all
                                   // because of the exception
  	    
  	    try {
			studentService.addStudentToRun(studentUser, 
					new Projectcode(RUNCODE, NON_EXISTING_PERIODNAME));
			fail("PeriodNotFoundException was expected to be thrown but was not");
		} catch (ObjectNotFoundException oe) {
			fail("ObjectNotFoundException was not expected to be thrown");
		} catch (PeriodNotFoundException pe) {
		} catch (StudentUserAlreadyAssociatedWithRunException se) {
			fail("StudentUserAlreadyAssociatedWithRunException was not expected to be thrown");
		}
  	    
  	    verify(mockRunService);
  	    verify(mockGroupService);	
	}
	
	public void testAddStudentsToRun_StudentAlreadyAssociatedWithRunException() 
        throws ObjectNotFoundException, PeriodNotFoundException {
  	    expect(mockRunService.retrieveRunByRuncode(RUNCODE)).andReturn(run);
  	    replay(mockRunService);
  	    Group period = run.getPeriodByName(PERIODNAME);
  	    Set<User> membersToAdd = new HashSet<User>();
  	    membersToAdd.add(studentUser);
  	    mockGroupService.addMembers(period, membersToAdd);
  	    expectLastCall();
  	    replay(mockGroupService);
  	    
  	    try {
  	        studentService.addStudentToRun(studentUser, projectcode);
		} catch (ObjectNotFoundException oe) {
			fail("ObjectNotFoundException was not expected to be thrown");
		} catch (PeriodNotFoundException pe) {
			fail("PeriodNotFoundException was not expected to be thrown");
		} catch (StudentUserAlreadyAssociatedWithRunException se) {
			fail("StudentUserAlreadyAssociatedWithRunException was not expected to be thrown");
		}
  	    verify(mockRunService);
  	    verify(mockGroupService);

  	    reset(mockRunService);
  	    run.getPeriodByName(PERIODNAME).addMember(studentUser);
  	    expect(mockRunService.retrieveRunByRuncode(RUNCODE)).andReturn(run);
  	    replay(mockRunService);

  	    // now, if we try to add the studentUser again, we expect 
  	    // StudentUserAlreadyAssociatedWithRunException to be thrown
		try {
  	        studentService.addStudentToRun(studentUser, projectcode);
		} catch (ObjectNotFoundException oe) {
			fail("ObjectNotFoundException was not expected to be thrown");
		} catch (PeriodNotFoundException pe) {
			fail("PeriodNotFoundException was not expected to be thrown");
		} catch (StudentUserAlreadyAssociatedWithRunException se) {
		}
  	    verify(mockRunService);
	}
	
	public void testRemoveStudentFromRun_student_in_run() throws PeriodNotFoundException {
		Group period = run.getPeriodByName(PERIODNAME);
		period.addMember(studentUser);
		Set<User> membersToRemove = new HashSet<User>();
		membersToRemove.add(studentUser);
		mockGroupService.removeMembers(period, membersToRemove);
		expectLastCall();
		replay(mockGroupService);
		
		expect(mockWorkgroupService.getWorkgroupListByOfferingAndUser(run, studentUser))
		    .andReturn(new ArrayList<Workgroup>());
		replay(mockWorkgroupService);

		studentService.removeStudentFromRun(studentUser, run);

		verify(mockGroupService);
		verify(mockWorkgroupService);
	}
	
	public void testRemoveStudentFromRun_student_not_in_run() throws PeriodNotFoundException {
		Group period = run.getPeriodByName(PERIODNAME);
		Set<User> membersToRemove = new HashSet<User>();
		membersToRemove.add(studentUser);
		replay(mockGroupService);  // groupService methods should not
		// be invoked in this case, as there is no member to remove

		studentService.removeStudentFromRun(studentUser, run);

		verify(mockGroupService);
	}

	// TODO Hiroki test getStudentRunInfo()
	
}
