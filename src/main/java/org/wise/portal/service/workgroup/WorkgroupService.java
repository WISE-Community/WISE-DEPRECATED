/**
 * Copyright (c) 2007-2014 Encore Research Group, University of Toronto
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
import org.wise.portal.domain.run.Offering;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.WISEWorkgroup;
import org.wise.portal.domain.workgroup.Workgroup;

/**
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public interface WorkgroupService {

    /**
     * Given a list of workgroups for a particular offering, if the list is
     * empty (i.e. there are no workgroups), then create a default "preview"
     * workgroup with just the user in it. If there exists workgroups already,
     * then do nothing.
     * 
     * @param offering
     *            the given offering associated with the workgroups
     * @param workgroupList
     *            <code>List</code> of workgroups belonging to the given
     *            offering
     * @param user
     *            the <code>User</code> that should be put into the preview
     *            workgroup
     * @param previewWorkgroupName
     *            <code>String</code> that specifies the default preview
     *            workgroup name
     * @return
     */
    public List<Workgroup> createPreviewWorkgroupForOfferingIfNecessary(
            Offering offering, List<Workgroup> workgroupList, User user,
            String previewWorkgroupName);
    
    /**
     * Given a User, returns all of the workgroups that the user is in

     * @param user
     *            the <code>User</code> to search for
     * @return a list of workgroups that the specified user is in.
     */
    public List<Workgroup> getWorkgroupsForUser(User user);
    
    /**
     * Given a PreviewOffering, returns a workgroup that is used to preview it
     * If a workgroup has not been created yet, a new workgroup is created
     * with a default preview user
     * @param previewOffering
     * @param previewUser
     * @return workgroup
     */
    public Workgroup getWorkgroupForPreviewOffering(Offering previewOffering, User previewUser);

    /**
     * Gets a <code>List</code> of workgroups for a given offering with the
     * specified user as a member of that workgroup.
     * 
     * @param offering
     *            for the workgroup
     * @param user
     *            that is a member of the workgroup
     * @return
     */
    public List<Workgroup> getWorkgroupListByOfferingAndUser(Offering offering,
            User user);

    /**
     * Creates a new <code>Workgroup</code> object in the local data store, and then associates
     * that workgroup to an offering. 
     * 
     * @param name
     *            <code>String</code> name of the workgroup you want to create
     * @parm members
     *            <code>Set</code> of <code>User</code> objects that belong in
     *            the workgroup
     * @param offering
     *            The offering to associate the workgroup to
     * @return a <code>Workgroup</code> that is created.
     */
    public Workgroup createWorkgroup(String name, Set<User> members, Offering offering);
    
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
    public void addMembers(Workgroup workgroup, Set<User> membersToAdd);
    
    /**
     * Removes members from an already-existing workgroup. Also update the workgroup name.
     * 
     * @param workgroup
     *          an existing <code>Workgroup</code> that the members will be
     *          removed from
     * @param membersToRemove
     *          <code>Set</code> of users to remove from the group
     */
	public void removeMembers(Workgroup workgroup, Set<User> membersToRemove);
    
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
    public Workgroup retrieveById(Long workgroupId) throws ObjectNotFoundException;
    
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
    public Workgroup retrieveById(Long workgroupId, boolean doEagerFetch);

    /**
     * Updates the Workgroups by modifying its members
     * 
     * @param student
     * 		the student to move from one workgroup to another
     * @param workgroupFrom
     * 		the workgroup that loses the student
     * @param workgroupTo
     * 		the workgroup that receives the student
     * 		if workgroupTo does not exist, workgroupTo is null, and
     * 		a new workgroup is created
     * @throws <code>Exception</code> when update fails
     * 
     */
    public Workgroup updateWorkgroupMembership(ChangeWorkgroupParameters params)throws Exception;
    
	/**
	 * Creates a <code>WISEWorkgroup</code> with given parameters
	 * 
	 * @param name
	 * @param members
	 * @param run
	 * @param period
	 * @return the created <code>WISEWorkgroup</code>
	 * @throws ObjectNotFoundException when the curnitmap could not be
	 *     retrieved for the <code>Run</code>
	 */
	public WISEWorkgroup createWISEWorkgroup(String name, Set<User> members, Run run, Group period) throws ObjectNotFoundException;
}