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
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.impl.ChangeWorkgroupParameters;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;

/**
 * @author Cynick Young
 */
public interface WorkgroupService {
    
    /**
     * Given a User, returns all of the workgroups that the user is in

     * @param user
     *            the <code>User</code> to search for
     * @return a list of workgroups that the specified user is in.
     */
    List<Workgroup> getWorkgroupsForUser(User user);

    /**
     * Gets a <code>List</code> of workgroups for a given run with the
     * specified user as a member of that workgroup.
     * 
     * @param run for the workgroup
     * @param user that is a member of the workgroup
     * @return
     */
    List<Workgroup> getWorkgroupListByRunAndUser(Run run, User user);

    /**
     * Adds members to an already-existing workgroup. If a member is
     * already in the group, do not add again. Also update the workgroup name.
     * 
     * @param workgroup
     *          an existing <code>Workgroup</code> that the members will be
     *          added to
     * @param membersToAdd
     *          <code>Set</code> of users to add to the group
     */
    void addMembers(Workgroup workgroup, Set<User> membersToAdd);
    
    /**
     * Removes members from an already-existing workgroup. Also update the workgroup name.
     * 
     * @param workgroup
     *          an existing <code>Workgroup</code> that the members will be
     *          removed from
     * @param membersToRemove
     *          <code>Set</code> of users to remove from the group
     */
	void removeMembers(Workgroup workgroup, Set<User> membersToRemove);
    
    /**
     * Retrieves the Workgroup domain object using unique workgroupId
     * 
     * @param workgroupId
     *     <code>Long</code> workgroupId to use for lookup
     * @return <code>Workgroup</code> 
     *     the Workgroup object with the workgroupId
     * @throws <code>ObjectNotFoundException</code> when workgroupId cannot
     *     be used to find an existing workgroup
     */
    Workgroup retrieveById(Long workgroupId) throws ObjectNotFoundException;
    
    /**
     * Retrieves the Workgroup domain object using unique workgroupId
     * 
     * @param workgroupId
     *     <code>Long</code> workgroupId to use for lookup
     * @param doEagerFetch
     *     <code>boolean</code> fetch all fields eagerly, same as EAGER-load
     *     
     * @return <code>Workgroup</code> 
     *     the Workgroup object with the workgroupId
     * @throws <code>ObjectNotFoundException</code> when workgroupId cannot
     *     be used to find an existing workgroup
     */
    Workgroup retrieveById(Long workgroupId, boolean doEagerFetch);

    /**
     * Updates the Workgroups by modifying its members
     *
     * @param params contains info needed to change workgroup membership
     * @return updated workgroup
     * @throws Exception when update fails
     */
    Workgroup updateWorkgroupMembership(ChangeWorkgroupParameters params) throws Exception;
    
	/**
	 * Creates a <code>Workgroup</code> with given parameters
	 * 
	 * @param name
	 * @param members
	 * @param run
	 * @param period
	 * @return the created <code>Workgroup</code>
	 * @throws ObjectNotFoundException
	 */
	Workgroup createWorkgroup(String name, Set<User> members, Run run, Group period) throws ObjectNotFoundException;
	
	/**
     * Check if a user is in any workgroup for the run
     * @param user the user
     * @param run the run
     * @return whether the user is in a workgroup for the run
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
     * @return 
     */
	boolean isUserInAnotherWorkgroupForRun(User user, Run run, Workgroup workgroup);
}