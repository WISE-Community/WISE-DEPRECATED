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
package org.telscenter.sail.webapp.service.student;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;
import org.telscenter.sail.webapp.domain.PeriodNotFoundException;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.StudentUserAlreadyAssociatedWithRunException;
import org.telscenter.sail.webapp.domain.impl.Projectcode;
import org.telscenter.sail.webapp.domain.run.StudentRunInfo;
import org.telscenter.sail.webapp.service.offering.RunService;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.service.AclService;
import net.sf.sail.webapp.service.group.GroupService;

/**
 * Represents the set of operations on a WISE Student user.
 *
 * @author Hiroki Terashima
 * @version $Id$
 */
public interface StudentService {

	/**
	 * Given a User object of a student and a <code>Projectcode</code>,
	 * associates the student with the <code>Run</code> by adding the 
	 * student to the period that belongs to the <code>Run</code>, 
	 * as indicated by the periodname portion of the <code>Projectcode</code>.
	 * 
	 * @param studentUser a <code>User</code> object of a WISE student
	 * @param projectcode a <code>Projectcode</code>
	 * @throws ObjectNotFoundException when the runcode portion of 
	 *      <code>Projectcode</code> could not be used to retrieve 
	 *      an existing <code>Run</code>
	 * @throws PeriodNotFoundException when the periodname portion of
	 *      <code>Projectcode</code> could not be used to retrieve
	 *      an existing period associated with the <code>Run</code>
	 * @throws StudentUserAlreadyAssociatedWithRunException when the
	 *      studentUser to be added is already associated with the run in any
	 *      of the periods that the run has been set up for
	 */
	@Transactional
	public void addStudentToRun(User studentUser, Projectcode projectcode) 
	     throws ObjectNotFoundException, PeriodNotFoundException, StudentUserAlreadyAssociatedWithRunException;
	
	/**
	 * Returns a list of teachers that this student is associated with through
	 * runs.
	 * 
	 * @param studentUser
	 * @return
	 */
	public List<User> getTeachersOfStudent(User studentUser);
	
	/**
	 * Returns true iff the specified student is associated with the specified
	 * teacher through the run that the teacher has set up.
	 * @param studentUser
	 * @param teacherUser
	 * @return
	 */
	public boolean isStudentAssociatedWithTeacher(User studentUser, User teacherUser);
	
	/**
	 * Removes the student from association with the run.  If the specified
	 * User is not associated with the run, nothing happens. If the specified
	 * User was in a workgroup for the specified run, they will be removed
	 * from that workgroup.
	 * 
	 * @param studentUser <code>User</code> student to remove from the run.
	 * @param run <code>Run</code> the run to remove the student from.
	 */
	public void removeStudentFromRun(User studentUser, Run run);
	
	/**
	 * Given a student user and a run, returns a populated
	 * <code>StudentRunInfo</code> object.
	 * 
	 * @param studentUser <code>User</code> student to lookup
	 * @param run <code>Run</code> run to lookup
	 */
	public StudentRunInfo getStudentRunInfo(User studentUser, Run run);
	
	/**
	 * @param runService <code>RunService</code> to set
	 */
	public void setRunService(RunService runService);

	/**
	 * @param groupService <code>GroupService</code> to set
	 */
	public void setGroupService(GroupService groupService);
	
	/**
	 * @param aclService <code>AclService</code> to set
	 */
	public void setAclService(AclService<Run> aclService);
}
