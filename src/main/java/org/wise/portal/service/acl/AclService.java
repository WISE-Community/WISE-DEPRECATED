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
package org.wise.portal.service.acl;

import java.util.List;

import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.acls.model.Permission;
import org.springframework.security.core.userdetails.UserDetails;
import org.wise.portal.domain.user.User;

/**
 * An interface for a Access Control list (acl) service which allows user to
 * create an acl for an object.
 *
 * @author Laurel Williams
 */
public interface AclService<T> extends PermissionEvaluator {

  /**
   * Creates an acl for an object if neccessary and adds an ace for that
   * object with the permission specified. This adds the permission to the
   * currently-logged-in user
   *
   * @param object The object for which the acl and ace are to be created.
   * @param permission The permission to grant to the user on the object.
   */
  void addPermission(T object, Permission permission);

  /**
   * Creates an acl for an object if neccessary and adds an ace for that
   * object with the permission specified for the specified user
   *
   * @param object The object for which the acl and ace are to be created.
   * @param permission The permission to grant to the user on the object.
   * @param user A <code>User</code> who will be granted the permission on the object.
   */
  void addPermission(T object, Permission permission, User user);

  /**
   * Removes the permission of a user on an object. If the object does not
   * have an acl or if the ace does not exist for the object, do nothing.
   *
   * @param object The object for which the permission is to be removed.
   * @param permission The permission to remove from the user on the object.
   * @param user The <code>User</code> who will lose the permission on the object.
   */
  void removePermission(T object, Permission permission, User user);

  /**
   * Gets a list of Permissions that the user has on the specified object.
   *
   * @param object The object to retrieve the permission on.
   * @param userDetails The <code>UserDetails</code> who is granted permissions on the object.
   * @return A <code>Permission</code> containing the
   */
  List<Permission> getPermissions(T object, UserDetails userDetails);

  /**
   * Returns <code>boolean</code> true if the given <code>User</code> principle
   * has the given <code>Permission</code> on the give <code>Object</code>, returns
   * fale otherwise.
   */
  boolean hasPermission(T object, Permission permission, User user);

  /**
   * Returns <code>boolean</code> true if the given <code>User</code> principle
   * has the given <code>Permission</code> on the give <code>Object</code>, returns
   * fale otherwise.
   */
  boolean hasPermission(T object, Permission permission, UserDetails userDetails);

  boolean hasSpecificPermission(T object, Permission permission, UserDetails userDetails);
}
