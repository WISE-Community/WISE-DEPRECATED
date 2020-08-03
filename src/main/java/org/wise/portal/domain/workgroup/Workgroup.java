/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
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
package org.wise.portal.domain.workgroup;

import java.util.Set;

import org.wise.portal.domain.Persistable;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.Tag;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;

/**
 * Workgroup is a group of users that work on the same run, like a team of users.
 * It is made up of one or more users and the work is stored for the workgroup, not for the user.
 *
 * @author Hiroki Terashima
 */
public interface Workgroup extends Persistable {

  /**
   * @return the members in this workgroup
   */
  Set<User> getMembers();

  /**
   * @param members the members in this workgroup
   */
  void setMembers(Set<User> members);

  /**
   * @param member the member to add in this workgroup
   */
  void addMember(User member);

  /**
   * @param member the member to remove in this workgroup
   */
  void removeMember(User member);

  /**
   * @return the run this workgroup is in
   */
  Run getRun();

  /**
   * @param run the run this workgroup is in
   */
  void setRun(Run run);

  /**
   * @return the group containing members
   */
  Group getGroup();

  /**
   * @param group the group containing members
   */
  void setGroup(Group group);

  /**
   * @return the id
   */
  Long getId();

  void setId(Long id);

  /**
   * Generates a name for this workgroup.
   *
   * @return <code>String</code> a name for this workgroup
   */
  String generateWorkgroupName();

  /**
   * Gets the period that this workgroup belongs in
   *
   * @return <code>Group</code> (Period) that this workgroup belongs in
   */
  Group getPeriod();

  /**
   * Sets the periods that this workgroup belongs in
   *
   * @param period the <code>Group</code> to set
   */
  void setPeriod(Group period);

  /**
   * @return the teacherWorkgroup if this workgroup is a teacher's workgroup
   */
  boolean isTeacherWorkgroup();

  /**
   * @param teacherWorkgroup the teacherWorkgroup to set
   */
  void setTeacherWorkgroup(boolean teacherWorkgroup);

  /**
   * @return true is this workgroup is a student workgroup
   */
  boolean isStudentWorkgroup();

  Set<Tag> getTags();

  void setTags(Set<Tag> tags);

  void addTag(Tag tag);

  void removeTag(Tag tag);
}
