/**
 * Copyright (c) 2007-2015 Regents of the University of California (Regents).
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
package org.wise.portal.domain.run;

import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;

/**
 * Stores information about a WISE student on a particular
 * <code>Run</code>:
 * * <code>User</code> student user. Must not be null
 * * <code>Run</code> which Run the student is in. Must not be null
 * * <code>Workgroup</code> which workgroup the student is in for
 *     this run. Can be null, if student is not in a workgroup yet
 *     for this run
 * * <code>Group</code> which period the student is in for this
 *     run. Must not be null
 *
 * @author Hiroki Terashima
 */
public class StudentRunInfo implements Comparable<StudentRunInfo>{

  private User studentUser;

  private Run run;

  private Workgroup workgroup;

  private Group group;

  /**
   * @param studentUser the studentUser to set
   */
  public void setStudentUser(User studentUser) {
    this.studentUser = studentUser;
  }

  /**
   * @return the run
   */
  public Run getRun() {
    return run;
  }

  /**
   * @param run the run to set
   */
  public void setRun(Run run) {
    this.run = run;
  }

  /**
   * @return the workgroup
   */
  public Workgroup getWorkgroup() {
    return workgroup;
  }

  /**
   * @param workgroup the workgroup to set
   */
  public void setWorkgroup(Workgroup workgroup) {
    this.workgroup = workgroup;
  }

  /**
   * @return the group
   */
  public Group getGroup() {
    return group;
  }

  /**
   * @param group the group to set
   */
  public void setGroup(Group group) {
    this.group = group;
  }

  public int compareTo(StudentRunInfo o){
    TeacherUserDetails bestDetails = (TeacherUserDetails) this.run.getOwner().getUserDetails();
    TeacherUserDetails incomingDetails = (TeacherUserDetails) o.run.getOwner().getUserDetails();

    if(!bestDetails.getLastname().equals(incomingDetails.getLastname())){
      return bestDetails.getLastname().compareTo(incomingDetails.getLastname());
    } else if(!bestDetails.getFirstname().equals(incomingDetails.getFirstname())){
      return bestDetails.getFirstname().compareTo(incomingDetails.getFirstname());
    } else {
      if (this.run.getName() == null || o.run.getName() == null) {
        return 0;
      } else {
        return this.run.getName().compareTo(o.run.getName());
      }
    }
  }
}
