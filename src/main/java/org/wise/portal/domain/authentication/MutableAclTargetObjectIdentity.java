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
package org.wise.portal.domain.authentication;

import org.springframework.security.acls.model.ObjectIdentity;
import org.wise.portal.domain.Persistable;

/**
 * Mutable extension of <code>ObjectIdentity</code>. Represents the object
 * identity of a Java object that will be authorized according to an access
 * control list (ACL).
 *
 * @author Cynick Young
 *
 * @see ObjectIdentity
 */
public interface MutableAclTargetObjectIdentity extends ObjectIdentity, Persistable {

  /**
   * @return the aclTargetObject
   */
  MutableAclTargetObject getAclTargetObject();

  /**
   * @param aclTargetObject the aclTargetObject to set
   */
  void setAclTargetObject(MutableAclTargetObject aclTargetObject);

  /**
   * @return the aclTargetObjectId
   */
  Long getAclTargetObjectId();

  /**
   * @param aclTargetObjectId the aclTargetObjectId to set
   */
  void setAclTargetObjectId(Long aclTargetObjectId);

  /**
   * @return the inheriting
   */
  Boolean isInheriting();

  /**
   * @param isInheriting the inheriting to set
   */
  void setInheriting(Boolean isInheriting);

  /**
   * @return the ownerSid
   */
  MutableAclSid getOwnerSid();

  /**
   * @param ownerSid the ownerSid to set
   */
  void setOwnerSid(MutableAclSid ownerSid);

  /**
   * @return the parent
   */
  MutableAclTargetObjectIdentity getParent();

  /**
   * @param parent the parent to set
   */
  void setParent(MutableAclTargetObjectIdentity parent);
}
