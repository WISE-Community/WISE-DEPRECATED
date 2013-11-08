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
package net.sf.sail.webapp.service.group;

import java.util.List;
import java.util.Set;

import org.springframework.security.annotation.Secured;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.domain.group.impl.GroupParameters;

/**
 * @author Hiroki Terashima
 * @version $Id$
 * 
 * Performs actions on groups which should be transactional.
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
    public Group createGroup(GroupParameters groupParameters);

    /**
     * Update an existing group with values in groupParameters
     * 
     * @param groupParameters
     *           <code>GroupParameters</code> containing the group's new 
     *           attribute values
     * @throws ObjectNotFoundException when the group to modify does not exist
     */
    public void updateGroup(GroupParameters groupParameters) throws ObjectNotFoundException;
    
    /**
     * Change an existing group name.
     * 
     * @param group
     *            an existing <code>Group</code> that should have its name
     *            changed
     * @param name
     *            <code>String</code> name of new group
     */
    public void changeGroupName(Group group, String newName);

    /**
     * Makes a group into a child of another group
     * 
     * @throws CyclicalGroupException
     *             when this action creates a cycle
     */
    public void moveGroup(Group newParent, Group groupToBeMoved)
            throws CyclicalGroupException;

    /**
     * Adds members to an already-existing group If a member already exists in
     * the group, do not add again
     * 
     * @param group
     *            and existing <code>Group</code> that the members should be
     *            added to
     * @param membersToAdd
     *            <code>Set</code> of users to add to the group
     */
    public void addMembers(Group group, Set<User> membersToAdd);
    
    /**
     * Adds the specified user to the specified group
     * @param groupId
     * @param studentUser
     * @throws ObjectNotFoundException 
     */
	public void addMember(Long groupId, User user) throws ObjectNotFoundException;

    /**
     * Removes the members from an already-existing group. If the member does
     * not exist in the group, do nothing
     * 
     * @param group an existing <code>Group</code> that the members
     *              should be removed from.
     * @param membersToRemove
     *              <code>Set</code> containing users to remove from the group.
     */
    public void removeMembers(Group group, Set<User> membersToRemove);

    /**
     * Gets all the groups available.
     * 
     * @return <code>List</code> of <code>Group</code>
     */
/*
 * Example usage:
 * "ROLE_USER" specifies the role required to call this method.
 * "AFTER_ACL_COLLECTION_READ" specifies the filtering of objects returned in the collection to only contain objects with the proper access control list entry permission
 * Some sample data for hsqldb
INSERT INTO ACL_CLASS VALUES(1,NULL,'net.sf.sail.webapp.domain.group.impl.PersistentGroup')
INSERT INTO ACL_ENTRY VALUES(1,1,1,TRUE,TRUE,TRUE,NULL,1,1)
INSERT INTO ACL_OBJECT_IDENTITY VALUES(1,2,TRUE,NULL,1,1,NULL)
INSERT INTO ACL_SID VALUES(1,NULL,TRUE,'test')
INSERT INTO CURNITS VALUES(1,0,1)
INSERT INTO CURNITS VALUES(2,0,2)
INSERT INTO GRANTED_AUTHORITIES VALUES(1,0,'ROLE_USER')
INSERT INTO GRANTED_AUTHORITIES VALUES(2,0,'ROLE_ADMINISTRATOR')
INSERT INTO GROUPS VALUES(1,0,'duckies',NULL)
INSERT INTO GROUPS VALUES(2,0,'fishies',1)
INSERT INTO JNLPS VALUES(1,0,1)
INSERT INTO OFFERINGS VALUES(1,0,1)
INSERT INTO OFFERINGS VALUES(2,0,2)
INSERT INTO SDS_CURNITS VALUES(1,0,2671,'Direct and Emergent Processes for Engineering Science','http://www.encorewiki.org/download/attachments/2113/converted-wise-dev.berkeley.edu-24500.jar')
INSERT INTO SDS_CURNITS VALUES(2,0,2672,'Two Kinds of Processes','http://www.encorewiki.org/download/attachments/2113/converted-wise-dev.berkeley.edu-16704.jar')
INSERT INTO SDS_JNLPS VALUES(1,0,2562,'PLR Everything JDIC snapshot 20070125-0811','http://www.encorewiki.org/download/attachments/2114/plr-everything-jdic-snapshot-20070125-0811.jnlp')
INSERT INTO SDS_OFFERINGS VALUES(1,0,'Direct and Emergent Processes for Engineering Science',3580,1,1)
INSERT INTO SDS_OFFERINGS VALUES(2,0,'Two Kinds of Processes',3581,1,2)
INSERT INTO SDS_USERS VALUES(1,0,6991,'admin','admin')
INSERT INTO SDS_USERS VALUES(2,0,7007,'test','test')
INSERT INTO SDS_WORKGROUPS VALUES(1,0,3925,'Preview',1)
INSERT INTO SDS_WORKGROUPS VALUES(2,0,3926,'Preview',2)
INSERT INTO SDS_WORKGROUPS VALUES(3,0,3927,'Preview',1)
INSERT INTO SDS_WORKGROUPS VALUES(4,0,3928,'Preview',2)
INSERT INTO SDS_WORKGROUPS_RELATED_TO_SDS_USERS VALUES(1,2)
INSERT INTO SDS_WORKGROUPS_RELATED_TO_SDS_USERS VALUES(2,2)
INSERT INTO SDS_WORKGROUPS_RELATED_TO_SDS_USERS VALUES(3,1)
INSERT INTO SDS_WORKGROUPS_RELATED_TO_SDS_USERS VALUES(4,1)
INSERT INTO USER_DETAILS VALUES(1,0,'24c002f26c14d8e087ade986531c7b5d','admin',NULL,TRUE,TRUE,TRUE,TRUE)
INSERT INTO USER_DETAILS VALUES(2,0,'f52877f15e867957b887aa9d6530c2be','test',NULL,TRUE,TRUE,TRUE,TRUE)
INSERT INTO USER_DETAILS_RELATED_TO_ROLES VALUES(1,1)
INSERT INTO USER_DETAILS_RELATED_TO_ROLES VALUES(1,2)
INSERT INTO USER_DETAILS_RELATED_TO_ROLES VALUES(2,1)
INSERT INTO USERS VALUES(1,0,1,1)
INSERT INTO USERS VALUES(2,0,2,2)
INSERT INTO WORKGROUPS VALUES(1,0,1,1)
INSERT INTO WORKGROUPS VALUES(2,0,2,2)
INSERT INTO WORKGROUPS VALUES(3,0,1,3)
INSERT INTO WORKGROUPS VALUES(4,0,2,4)
INSERT INTO WORKGROUPS_RELATED_TO_USERS VALUES(1,2)
INSERT INTO WORKGROUPS_RELATED_TO_USERS VALUES(2,2)
INSERT INTO WORKGROUPS_RELATED_TO_USERS VALUES(3,1)
INSERT INTO WORKGROUPS_RELATED_TO_USERS VALUES(4,1)
*/
    @Secured( { "ROLE_USER", "AFTER_ACL_COLLECTION_READ" })
    public List<Group> getGroups();
    
    /**
     * Retrieves Group domain object using unique groupId
     * 
     * @param groupId
     *     <code>Long</code> groupId to use for lookup
     * @return <code>Group</code>
     *     the Group object with the given groupId
     * @throws <code>ObjectNotFoundException</code> when groupId
     *     cannot be used to find an existing group
     */
    public Group retrieveById(Long groupId) throws ObjectNotFoundException;

}