/**
 * Copyright (c) 2007-2019 Regents of the University of California (Regents).
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
package org.wise.portal.service.group.impl;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.security.acls.model.AlreadyExistsException;
import org.springframework.security.acls.model.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.group.GroupDao;
import org.wise.portal.dao.user.UserDao;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.GroupParameters;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.acl.AclService;
import org.wise.portal.service.group.CyclicalGroupException;
import org.wise.portal.service.group.GroupService;

/**
 * A class to provide services for Group objects.
 *
 * @author Hiroki Terashima
 * @author Patrick Lawler
 */
@Service
public class GroupServiceImpl implements GroupService {

  @Autowired
  protected GroupDao<Group> groupDao;

  @Autowired
  private UserDao<User> userDao;

  @Autowired
  private AclService<Group> aclService;

  @Transactional()
  public void changeGroupName(Group group, String newName) {
    group.setName(newName);
    groupDao.save(group);
  }

  @Transactional(rollbackFor = { AlreadyExistsException.class,
      NotFoundException.class, DataIntegrityViolationException.class })
  public Group createGroup(GroupParameters groupParameters) {
    Group group = new PersistentGroup();
    group.setName(groupParameters.getName());
    Long parentId = groupParameters.getParentId();
    if (parentId != 0) {
      try {
        Group parentGroup = groupDao.getById(parentId);
        group.setParent(parentGroup);
      } catch (ObjectNotFoundException e) {
        parentId = new Long(0);
      }
    }

    for (Long memberId : groupParameters.getMemberIds()) {
      try {
        User user = userDao.getById(memberId);
        group.addMember(user);
      }
      catch (ObjectNotFoundException e) {
        // no member to add - ignore
      }
    }

    groupDao.save(group);
    aclService.addPermission(group, BasePermission.ADMINISTRATION);
    return group;
  }

  @Transactional()
  public void updateGroup(GroupParameters groupParameters) throws ObjectNotFoundException {
    Group group = retrieveById(groupParameters.getGroupId());
    group.setName(groupParameters.getName());
    try {
      group.setParent(retrieveById(groupParameters.getParentId()));
    } catch (ObjectNotFoundException e) {
      group.setParent(null);
    }
    Set<User> members = new HashSet<User>();
    for (Long userId : groupParameters.getMemberIds()) {
      User user = userDao.getById(userId);
      members.add(user);
    }
    group.setMembers(members);
    groupDao.save(group);
  }

  @Transactional()
  public void moveGroup(Group newParent, Group groupToBeMoved) throws CyclicalGroupException {
    Group previousParent = groupToBeMoved.getParent();
    groupToBeMoved.setParent(newParent);
    if (cycleExists(groupToBeMoved)) {
      // if cycle exists, reset groupToBeMoved's parent
      groupToBeMoved.setParent(previousParent);
      throw new CyclicalGroupException("Cycle will be created"
        + " when this group is moved.");
    }
    groupDao.save(groupToBeMoved);
  }

  @Transactional()
  public void addMembers(Group group, Set<User> membersToAdd) {
    for (User member : membersToAdd) {
      group.addMember(member);
    }
    groupDao.save(group);
  }

  @Transactional()
  public void addMember(Long groupId, User user) throws ObjectNotFoundException {
    Group group = retrieveById(groupId);
    group.addMember(user);
    groupDao.save(group);
  }

  @Transactional()
  public void removeMembers(Group group, Set<User> membersToRemove) {
    for (User member : membersToRemove) {
      group.removeMember(member);
    }
    groupDao.save(group);
  }

  @Transactional()
  public void removeMember(Group group, User memberToRemove) {
    group.removeMember(memberToRemove);
    groupDao.save(group);
  }

  /**
   * Checks to see if the given group contains a cycle
   *
   * @param group <code>Group</code> group to be checked for cycles
   * @return boolean true iff the given group contains a cycle
   */
  private boolean cycleExists(Group group) {
    if (group.getParent().equals(group)) {
      return true;
    }

    // traverse up the parent until null (no cycle) or
    // until group is reached again (cycle)
    List<Group> visitedSoFar = new ArrayList<Group>();
    Group toCheck = group;
    while ((toCheck = toCheck.getParent()) != null) {
      if (visitedSoFar.contains(toCheck)) {
        // use the equals() to check for equality
        // don't use TreeSet&hashCode, or it will
        // go into infinite loop
        return true;
      } else {
        visitedSoFar.add(toCheck);
      }
    }
    return false;
  }

  @Transactional(readOnly = true)
  public List<Group> getGroups() {
    return groupDao.getList();
  }

  @Transactional(readOnly = true)
  public Group retrieveById(Long groupId) throws ObjectNotFoundException {
    return groupDao.getById(groupId);
  }
}
