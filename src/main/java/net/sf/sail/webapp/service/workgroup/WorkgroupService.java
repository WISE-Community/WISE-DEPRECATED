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
package net.sf.sail.webapp.service.workgroup;

import java.util.List;
import java.util.Set;

import org.telscenter.sail.webapp.domain.impl.ChangeWorkgroupParameters;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.Offering;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;

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
     * Creates a workgroup for a preview offering.
     * 
     * @param <code>Offering</code> previewOffering
     * @param <code>User</code> previewUser
     * @return <code>Workgroup</code>
     */
    public Workgroup getPreviewWorkgroupForRooloOffering(Offering previewOffering, User previewUser);

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
     * Gets a <code>List</code> of workgroups available.
     * 
     * @return a <code>Workgroup</code> <code>List</code>.
     */
//  @Secured( { "ROLE_USER", "AFTER_ACL_COLLECTION_READ" })
    public List<Workgroup> getWorkgroupList();
   
    /**
     * Creates a new <code>SdsWorkgroup</code> on the SDS as well as a
     * <code>Workgroup</code> object in the local data store, and then associates
     * that workgroup to an offering.  A side effect is
     * that the workgroup id is set to the value that the SDS assigns to the new
     * workgroup.
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
}