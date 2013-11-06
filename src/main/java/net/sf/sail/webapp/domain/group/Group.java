/**
 * Copyright (c) 2007 Encore Research Group, University of Toronto
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package net.sf.sail.webapp.domain.group;

import java.util.Set;

import net.sf.sail.webapp.domain.Persistable;
import net.sf.sail.webapp.domain.User;

/**
 * An interface that defines the concept of a group that can be nested in a
 * hierarchy. Group objects are nodes in a group tree hierarchy. Leaf nodes in
 * the tree contain a list of members.
 * 
 * @author Cynick Young
 * 
 * @version $Id$
 */
public interface Group extends Persistable, Comparable<Group> {

    /**
     * Add a single member to the group.
     * 
     * @param member
     *            single member to add
     */
    public void addMember(User member);
    
    /**
     * Removes a single member from the group.
     * 
     * @param member
     *            single member to remove
     */
    public void removeMember(User member);

    /**
     * Replace any existing list of members with the new list.
     * 
     * @param members
     *            new <code>List</code> of members to set
     */
    public void setMembers(Set<User> members);

    /**
     * Get the list of members of this group.
     * 
     * @return <code>List</code> of <code>User</code> objects that belong to
     *         this group.
     */
    public Set<User> getMembers();

    /**
     * Gets the name of this group.
     * 
     * @return the name of the current group
     */
    public String getName();

    /**
     * Sets the name of this group.
     * 
     * @param name
     *            the name to set for this group.
     */
    public void setName(String name);

    /**
     * Gets the parent group for this group. If is the group at the top of the
     * group hierarchy, then null is returned.
     * 
     * @return the parent
     */
    public Group getParent();

    /**
     * Sets the parent group for this group.
     * 
     * @param parent
     *            the parent to set
     */
    public void setParent(Group parent);

    /**
     * Gets the id for this object.
     * 
     * @return the id
     */
    public Long getId();
}