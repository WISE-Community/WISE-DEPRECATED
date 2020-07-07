/**
 * Copyright (c) 2007-2015 Encore Research Group, University of Toronto
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
package org.wise.portal.domain.group;

import java.util.Set;

import org.wise.portal.domain.Persistable;
import org.wise.portal.domain.user.User;

/**
 * An interface that defines the concept of a group that can be nested in a
 * hierarchy. Group objects are nodes in a group tree hierarchy. Leaf nodes in
 * the tree contain a list of members.
 *
 * @author Cynick Young
 */
public interface Group extends Persistable, Comparable<Group> {

  /**
   * Add a single member to the group.
   *
   * @param member single member to add
   */
  void addMember(User member);

  /**
   * Removes a single member from the group.
   *
   * @param member single member to remove
   */
  void removeMember(User member);

  /**
   * Replace any existing list of members with the new list.
   *
   * @param members new <code>List</code> of members to set
   */
  void setMembers(Set<User> members);

  /**
   * Get the list of members of this group.
   *
   * @return <code>List</code> of <code>User</code> objects that belong to this group.
   */
  Set<User> getMembers();

  /**
   * Gets the name of this group.
   *
   * @return the name of the current group
   */
  String getName();

  /**
   * Sets the name of this group.
   *
   * @param name the name to set for this group.
   */
  void setName(String name);

  /**
   * Gets the parent group for this group. If is the group at the top of the
   * group hierarchy, then null is returned.
   *
   * @return the parent
   */
  Group getParent();

  /**
   * Sets the parent group for this group.
   *
   * @param parent the parent to set
   */
  void setParent(Group parent);

  /**
   * Gets the id for this object.
   *
   * @return the id
   */
  Long getId();

  /**
   * Sets the id for this object.
   */
  void setId(Long id);
}
