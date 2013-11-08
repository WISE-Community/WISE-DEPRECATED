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
package net.sf.sail.webapp.service;

import java.util.List;

import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.acls.model.Permission;

import net.sf.sail.webapp.domain.User;


/**
 * An interface for a Access Control list (acl) service which allows user to
 * create an acl for an object.
 * 
 * @author Laurel Williams
 * @version $Id$
 */
public interface AclService<T> extends PermissionEvaluator {

	/**
	 * Creates an acl for an object if neccessary and adds an ace for that
	 * object with the permission specified. This adds the permission to the
	 * currently-logged-in user
	 * 
	 * @param object
	 *            The object for which the acl and ace are to be created.
	 * @param permission
	 *            The permission to grant to the user on the object.
	 */
	public void addPermission(T object, Permission permission);
	
	/**
	 * Creates an acl for an object if neccessary and adds an ace for that
	 * object with the permission specified for the specified user
	 * 
	 * @param object
	 *            The object for which the acl and ace are to be created.
	 * @param permission
	 *            The permission to grant to the user on the object.
	 * @param user
	 *            A <code>User</code> who will be granted the permission on
	 *            the object.
	 */
	public void addPermission(T object, Permission permission, User user);

	/**
	 * Removes the permission of a user on an object. If the object does not
	 * have an acl or if the ace does not exist for the object, do nothing.
	 * 
	 * @param object
	 *           The object for which the permission is to be removed.
	 * @param permission
	 *           The permission to remove from the user on the object.
	 * @param user
	 *           The <code>User</code> who will lose the permission on
	 *           the object.
	 */
	public void removePermission(T object, Permission permission, User user);
	
	/**
	 * Gets a list of Permissions that the user has on the specified object.
	 * 
	 * @param object
	 *          The object to retrieve the permission on.
	 * @param user
	 * 			The <code>User</code> who is granted permissions on
	 *          the object.
	 * @return A <code>Permission</code> containing the 
	 */
	public List<Permission> getPermissions(T object, User user);

	/**
	 * Returns <code>boolean</code> true if the given <code>User</code> principle
	 * has the given <code>Permission</code> on the give <code>Object</code>, returns
	 * fale otherwise.
	 */
	public boolean hasPermission(T object, Permission permission, User user);
}