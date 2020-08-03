/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
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
package org.wise.portal.service.tag.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.project.TagDao;
import org.wise.portal.domain.Tag;
import org.wise.portal.domain.impl.TagImpl;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.acl.AclService;
import org.wise.portal.service.tag.TagService;
import org.wise.portal.service.user.UserService;

/**
 * @author Patrick Lawler
 */
@Service
public class TagServiceImpl implements TagService {

  @Autowired
  private TagDao<Tag> tagDao;

  @Autowired
  private AclService<Tag> aclService;

  @Autowired
  private UserService userService;

  @Transactional(readOnly = true)
  public Tag getTagById(Integer id) {
    try {
      return tagDao.getById(id);
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Transactional
  public Tag createOrGetTag(String name) {
    Tag tag = tagDao.getTagByName(name);
    if (tag == null) {
      tag = new TagImpl();
      tag.setName(name.toLowerCase());
      tagDao.save(tag);
    }
    return tag;
  }

  public boolean isFromDatabase(Tag tag) {
    if (tag.getId() == null) {
      return false;
    } else {
      return true;
    }
  }

  @Transactional
  public void removeIfOrphaned(Integer tagId) {
    tagDao.removeIfOrphaned(tagId);
  }

  @Override
  public List<Tag> getTagsForRun(Run run) {
    return tagDao.getTags(run);
  }

  @Override
  @Transactional()
  public Tag createTag(Run run, String name) {
    Tag tag = tagDao.getTag(run, name);
    if (tag == null) {
      tag = new TagImpl();
      tag.setRun(run);
      tag.setName(name);
      tagDao.save(tag);
      aclService.addPermission(tag, BasePermission.ADMINISTRATION);
      aclService.addPermission(tag, BasePermission.WRITE);
      aclService.addPermission(tag, BasePermission.READ);
    }
    return tag;
  }

  @Override
  public Tag updateTag(Tag tag) {
    tagDao.save(tag);
    return tag;
  }

  public boolean canEditTag(Authentication auth, Tag tag) {
    return aclService.hasPermission(auth, tag, BasePermission.WRITE);
  }

  @Override
  @Transactional()
  public void deleteTag(Authentication auth, Tag tag) {
    tagDao.delete(tag);
    User user = userService.retrieveUserByUsername(auth.getName());
    aclService.removePermission(tag, BasePermission.ADMINISTRATION, user);
    aclService.removePermission(tag, BasePermission.WRITE, user);
    aclService.removePermission(tag, BasePermission.READ, user);
  }
}
