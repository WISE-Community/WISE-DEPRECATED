/**
 * Copyright (c) 2007-2017 Encore Research Group, University of Toronto
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Public License for more details.
 *
 * You should have received a copy of the GNU Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package org.wise.portal.service.workgroup;

import java.util.List;
import java.util.Set;

import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.Tag;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.impl.ChangeWorkgroupParameters;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;

/**
 * Services for working with Workgroups
 * @author Cynick Young
 * @author Hiroki Terashima
 */
public interface WorkgroupService {

  /**
   * Given a User, returns all of the workgroups that the user is in
   * @param user the <code>User</code> to search for
   * @return a list of workgroups that the specified user is in.
   */
  List<Workgroup> getWorkgroupsForUser(User user);

  /**
   * Gets a <code>List</code> of workgroups for a given run with the
   * specified user as a member of that workgroup.
   *
   * @param run for the workgroup
   * @param user that is a member of the workgroup
   * @return a list of workgroups that the user is in for the specified run
   */
  List<Workgroup> getWorkgroupListByRunAndUser(Run run, User user);

  /**
   * Adds members to an already-existing workgroup. If a member is
   * already in the group, do not add again. Also update the workgroup name.
   *
   * @param workgroup an existing <code>Workgroup</code> to add the members to
   * @param membersToAdd  <code>Set</code> of users to add to the group
   */
  void addMembers(Workgroup workgroup, Set<User> membersToAdd);

  /**
   * Removes members from an already-existing workgroup. Also update the workgroup name.
   *
   * @param workgroup an existing <code>Workgroup</code> to remove members from
   * @param membersToRemove <code>Set</code> of users to remove from the workggroup
   */
  void removeMembers(Workgroup workgroup, Set<User> membersToRemove);

  /**
   * Retrieves the Workgroup domain object using unique workgroupId
   *
   * @param workgroupId <code>Long</code> workgroupId to use for lookup
   * @return <code>Workgroup</code> the Workgroup object with the workgroupId
   * @throws <code>ObjectNotFoundException</code> when workgroupId cannot
   * be used to find an existing workgroup
   */
  Workgroup retrieveById(Long workgroupId) throws ObjectNotFoundException;

  /**
   * Updates the Workgroups by modifying its members
   *
   * @param params contains info needed to change workgroup membership
   * @return updated workgroup
   * @throws Exception when update fails
   */
  Workgroup updateWorkgroupMembership(ChangeWorkgroupParameters params)
      throws Exception;

  /**
   * Creates a <code>Workgroup</code> with given parameters
   *
   * @param name Name of the workgroup
   * @param members members in the workgroup
   * @param run Run this workgroup is in
   * @param period period this workgroup is in
   * @return the created <code>Workgroup</code>
   * @throws ObjectNotFoundException
   */
  Workgroup createWorkgroup(String name, Set<User> members, Run run, Group period)
      throws ObjectNotFoundException;

  /**
   * Check if a user is in any workgroup for the run
   * @param user the user to check
   * @param run the run to check
   * @return whether the user is in a workgroup for the specified run
   */
  boolean isUserInAnyWorkgroupForRun(User user, Run run);

  /**
   * Check if a user is in a specific workgroup for the run
   * @param user the user
   * @param run the run
   * @param workgroup the workgroup
   * @return whether the user is in the workgroup
   */
  boolean isUserInWorkgroupForRun(User user, Run run, Workgroup workgroup);

  /**
   * Check if a user is in a workgroup besides the one provided for the run
   * @param user the user
   * @param run the run
   * @param workgroup the workgroup
   * @return whether the user is in another workgroup for the run
   */
  boolean isUserInAnotherWorkgroupForRun(User user, Run run, Workgroup workgroup);

  /**
   * Changes the workgroup's period and all of its memebers' periods
   * to a new period
   * @param workgroup the workgroup
   * @param newPeriod period to move the workgroup and its members to
   */
  void changePeriod(Workgroup workgroup, Group newPeriod);

  /**
   * Adds the tag to workgroup. If workgroup already has the tag, do not add again
   */
  void addTag(Workgroup workgroup, Tag tag);

  /**
   * Removes tag from workgroup. If workgroup does not have tag, do nothing
   */
  void removeTag(Workgroup workgroup, Tag tag);
}
