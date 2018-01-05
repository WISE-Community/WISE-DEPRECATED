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
package org.wise.portal.service.group;

import java.util.List;
import java.util.Set;

import org.springframework.security.access.annotation.Secured;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.GroupParameters;
import org.wise.portal.domain.user.User;

/**
 * Performs actions on groups which should be transactional.
 * @author Hiroki Terashima
 */
public interface GroupService {

  /**
   * Given a <code>GroupParameters</code> object, create a group and save it
   * in the data store. If groupParameters contains a name and a null parent
   * id, then a root type group is created. If groupParameters has both a name
   * and a parent group id then an intermediate type group is created. If the
   * parent group id given is not in the data store then a root group type is
   * created.
   *
   * @param groupParameters
   *
   * @return The Group that was created
   */
  //  @Secured( { "ROLE_TEACHER", "ROLE_ADMINISTRATOR", "ROLE_RESEARCHER", "ROLE_TA" })
  Group createGroup(GroupParameters groupParameters);

  /**
   * Update an existing group with values in groupParameters
   *
   * @param groupParameters <code>GroupParameters</code> containing the group's new
   * attribute values
   * @throws ObjectNotFoundException when the group to modify does not exist
   */
  void updateGroup(GroupParameters groupParameters) throws ObjectNotFoundException;

  /**
   * Change an existing group name.
   *
   * @param group an existing <code>Group</code> that should have its name changed
   * @param newName <code>String</code> name of new group
   */
  void changeGroupName(Group group, String newName);

  /**
   * Makes a group into a child of another group
   *
   * @throws CyclicalGroupException when this action creates a cycle
   */
  void moveGroup(Group newParent, Group groupToBeMoved) throws CyclicalGroupException;

  /**
   * Adds members to an already-existing group If a member already exists in
   * the group, do not add again
   *
   * @param group and existing <code>Group</code> that the members should be added to
   * @param membersToAdd <code>Set</code> of users to add to the group
   */
  void addMembers(Group group, Set<User> membersToAdd);

  /**
   * Adds the specified user to the specified group
   * @param groupId
   * @param user
   * @throws ObjectNotFoundException
   */
  void addMember(Long groupId, User user) throws ObjectNotFoundException;

  /**
   * Removes the members from an already-existing group. If the member does
   * not exist in the group, do nothing
   *
   * @param group an existing <code>Group</code> that the members should be removed from.
   * @param membersToRemove <code>Set</code> containing users to remove from the group.
   */
  void removeMembers(Group group, Set<User> membersToRemove);

  /**
   * Removes a member from a group
   * @param group the group
   * @param memberToRemove the member to remove
   */
  void removeMember(Group group, User memberToRemove);

  /**
   * Gets all the groups available.
   *
   * @return <code>List</code> of <code>Group</code>
   */
  @Secured( { "ROLE_USER", "AFTER_ACL_COLLECTION_READ" })
  List<Group> getGroups();

  /**
   * Retrieves Group domain object using unique groupId
   *
   * @param groupId <code>Long</code> groupId to use for lookup
   * @return <code>Group</code> the Group object with the given groupId
   * @throws <code>ObjectNotFoundException</code> when groupId cannot be used
   * to find an existing group
   */
  Group retrieveById(Long groupId) throws ObjectNotFoundException;
}
