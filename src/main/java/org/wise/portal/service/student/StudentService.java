/**
 * Copyright (c) 2007-2017 Regents of the University of California (Regents).
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.service.student;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.PeriodNotFoundException;
import org.wise.portal.domain.RunHasEndedException;
import org.wise.portal.domain.StudentUserAlreadyAssociatedWithRunException;
import org.wise.portal.domain.project.impl.Projectcode;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.StudentRunInfo;
import org.wise.portal.domain.user.User;

/**
 * Represents the set of operations on a WISE Student user.
 * @author Hiroki Terashima
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
   * @throws ObjectNotFoundException when the runcode portion of <code>Projectcode</code>
   * could not be used to retrieve an existing <code>Run</code>
   * @throws PeriodNotFoundException when the periodname portion of <code>Projectcode</code>
   * could not be used to retrieve an existing period associated with the <code>Run</code>
   * @throws StudentUserAlreadyAssociatedWithRunException when the studentUser to be added
   * is already associated with the run in any of the periods that the run has been set up for
   */
  @Transactional
  void addStudentToRun(User studentUser, Projectcode projectcode)
      throws ObjectNotFoundException, PeriodNotFoundException,
      StudentUserAlreadyAssociatedWithRunException, RunHasEndedException;

  /**
   * Returns a list of teachers that this student is associated with through runs.
   * @param studentUser
   * @return
   */
  List<User> getTeachersOfStudent(User studentUser);

  /**
   * Returns true iff the specified student is associated with the specified
   * teacher through the run that the teacher has set up.
   * @param studentUser
   * @param teacherUser
   * @return
   */
  boolean isStudentAssociatedWithTeacher(User studentUser, User teacherUser);

  /**
   * Removes the student from association with the run.  If the specified
   * User is not associated with the run, nothing happens. If the specified
   * User was in a workgroup for the specified run, they will be removed
   * from that workgroup.
   * @param studentUser <code>User</code> student to remove from the run.
   * @param run <code>Run</code> the run to remove the student from.
   */
  void removeStudentFromRun(User studentUser, Run run);

  /**
   * Given a student user and a run, returns a populated
   * <code>StudentRunInfo</code> object.
   * @param studentUser <code>User</code> student to lookup
   * @param run <code>Run</code> run to lookup
   */
  StudentRunInfo getStudentRunInfo(User studentUser, Run run);
}
