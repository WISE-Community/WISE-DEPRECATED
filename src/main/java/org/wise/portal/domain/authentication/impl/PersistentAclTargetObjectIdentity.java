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
package org.wise.portal.domain.authentication.impl;

import java.io.Serializable;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.UniqueConstraint;
import javax.persistence.Version;

import lombok.Getter;
import lombok.Setter;
import org.wise.portal.domain.authentication.MutableAclSid;
import org.wise.portal.domain.authentication.MutableAclTargetObject;
import org.wise.portal.domain.authentication.MutableAclTargetObjectIdentity;

/**
 * Concrete implementation of <code>MutableAclTargetObjectIdentity</code>
 * marked with EJB3 annotations for persistence.
 *
 * @author Cynick Young
 * @see org.springframework.security.acls.model.ObjectIdentity
 */
@Entity
@Table(name = PersistentAclTargetObjectIdentity.DATA_STORE_NAME, uniqueConstraints = { @UniqueConstraint(columnNames = {
  PersistentAclTargetObjectIdentity.COLUMN_NAME_TARGET_OBJECT,
  PersistentAclTargetObjectIdentity.COLUMN_NAME_TARGET_OBJECT_ID }) })
public class PersistentAclTargetObjectIdentity implements MutableAclTargetObjectIdentity {

  @Transient
  private static final long serialVersionUID = 1L;

  @Transient
  public static final String DATA_STORE_NAME = "acl_object_identity";

  @Transient
  static final String COLUMN_NAME_TARGET_OBJECT = "object_id_class";

  @Transient
  public static final String COLUMN_NAME_TARGET_OBJECT_ID = "object_id_identity";

  @Transient
  public static final String COLUMN_NAME_TARGET_OBJECT_ID_NUM = "object_id_identity_num";

  @Transient
  static final String COLUMN_NAME_PARENT = "parent_object";

  @Transient
  static final String COLUMN_NAME_OWNER_SID = "owner_sid";

  @Transient
  static final String COLUMN_NAME_INHERITING = "entries_inheriting";

  @OneToOne(cascade = CascadeType.ALL, targetEntity = PersistentAclTargetObject.class)
  @JoinColumn(name = COLUMN_NAME_TARGET_OBJECT, nullable = false)
  @Getter
  @Setter
  private MutableAclTargetObject aclTargetObject;

  @Column(name = COLUMN_NAME_TARGET_OBJECT_ID, nullable = false)
  @Getter
  @Setter
  private Long aclTargetObjectId;

  @Column(name = COLUMN_NAME_TARGET_OBJECT_ID_NUM)
  private Integer aclTargetObjectIdNum;

  @ManyToOne(cascade = CascadeType.ALL, targetEntity = PersistentAclTargetObjectIdentity.class)
  @JoinColumn(name = COLUMN_NAME_PARENT)
  @Getter
  @Setter
  private MutableAclTargetObjectIdentity parent;

  @OneToOne(cascade = CascadeType.ALL, targetEntity = PersistentAclSid.class)
  @JoinColumn(name = COLUMN_NAME_OWNER_SID)
  @Getter
  @Setter
  private MutableAclSid ownerSid;

  @Column(name = COLUMN_NAME_INHERITING, nullable = false)
  private Boolean inheriting;

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Getter
  @Setter
  private Long id;

  @Version
  @Column(name = "OPTLOCK")
  private Integer version = null;

  @Override
  public String getType() {
    // TODO Auto-generated method stub
    return null;
  }

  public Boolean isInheriting() {
    return this.getInheriting();
  }

  private Boolean getInheriting() {
    return this.inheriting;
  }

  public void setInheriting(Boolean isInheriting) {
    this.inheriting = isInheriting;
  }

  @Override
  public int hashCode() {
    final int PRIME = 31;
    int result = 1;
    result = PRIME * result
      + ((aclTargetObject == null) ? 0 : aclTargetObject.hashCode());
    result = PRIME
      * result
      + ((aclTargetObjectId == null) ? 0 : aclTargetObjectId
      .hashCode());
    return result;
  }

  @Override
  public boolean equals(Object obj) {
    if (this == obj)
      return true;
    if (obj == null)
      return false;
    if (getClass() != obj.getClass())
      return false;
    final PersistentAclTargetObjectIdentity other = (PersistentAclTargetObjectIdentity) obj;
    if (aclTargetObject == null) {
      if (other.aclTargetObject != null)
        return false;
    } else if (!aclTargetObject.equals(other.aclTargetObject))
      return false;
    if (aclTargetObjectId == null) {
      if (other.aclTargetObjectId != null)
        return false;
    } else if (!aclTargetObjectId.equals(other.aclTargetObjectId))
      return false;
    return true;
  }

  public Serializable getIdentifier() {
    return this.getAclTargetObjectId();
  }

  public Class<?> getJavaType() {
    try {
      return Class.forName(this.getAclTargetObject().getClassname());
    } catch (ClassNotFoundException e) {
      e.printStackTrace();
      return null;
    }
  }
}
