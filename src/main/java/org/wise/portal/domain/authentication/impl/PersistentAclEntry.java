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
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.UniqueConstraint;
import javax.persistence.Version;

import lombok.Getter;
import lombok.Setter;
import org.springframework.security.acls.domain.DefaultPermissionFactory;
import org.springframework.security.acls.model.Acl;
import org.springframework.security.acls.model.Permission;
import org.springframework.security.acls.model.Sid;
import org.wise.portal.domain.authentication.ImmutableAclEntry;
import org.wise.portal.domain.authentication.MutableAclSid;
import org.wise.portal.domain.authentication.MutableAclTargetObjectIdentity;

/**
 * Concrete implementation of <code>MutableAclEntry</code> marked with EJB3
 * annotations for persistence.
 *
 * @author Cynick Young
 */
@Entity
@Table(name = PersistentAclEntry.DATA_STORE_NAME, uniqueConstraints = { @UniqueConstraint(columnNames = {
  PersistentAclEntry.COLUMN_NAME_TARGET_OBJECT_ID,
  PersistentAclEntry.COLUMN_NAME_ACE_ORDER }) })
public class PersistentAclEntry implements ImmutableAclEntry, Serializable {

  @Transient
  private static final long serialVersionUID = 1L;

  @Transient
  public static final String DATA_STORE_NAME = "acl_entry";

  @Transient
  static final String COLUMN_NAME_TARGET_OBJECT_ID = "acl_object_identity";

  @Transient
  public static final String COLUMN_NAME_ACE_ORDER = "ace_order";

  @Transient
  static final String COLUMN_NAME_SID = "sid";

  @Transient
  public static final String COLUMN_NAME_MASK = "mask";

  @Transient
  public static final String COLUMN_NAME_GRANTING = "granting";

  @Transient
  public static final String COLUMN_NAME_AUDIT_SUCCESS = "audit_success";

  @Transient
  public static final String COLUMN_NAME_AUDIT_FAILURE = "audit_failure";

  @SuppressWarnings("unused")
  @ManyToOne(cascade = CascadeType.ALL, targetEntity = PersistentAclTargetObjectIdentity.class)
  @JoinColumn(name = COLUMN_NAME_TARGET_OBJECT_ID, nullable = false)
  private MutableAclTargetObjectIdentity targetObjectIdentity;

  @SuppressWarnings("unused")
  @Column(name = COLUMN_NAME_ACE_ORDER, nullable = false)
  @Setter
  private Integer aceOrder;

  @ManyToOne(cascade = CascadeType.ALL, targetEntity = PersistentAclSid.class)
  @JoinColumn(name = COLUMN_NAME_SID, nullable = false)
  @Getter
  @Setter
  private MutableAclSid sid;

  @SuppressWarnings("unused")
  @Column(name = COLUMN_NAME_MASK, nullable = false)
  private Integer mask;

  @Transient
  @Getter
  private Permission permission;

  @Column(name = COLUMN_NAME_GRANTING, nullable = false)
  @Setter
  private Boolean granting;

  @Column(name = COLUMN_NAME_AUDIT_SUCCESS, nullable = false)
  @Setter
  private Boolean auditSuccess;

  @Column(name = COLUMN_NAME_AUDIT_FAILURE, nullable = false)
  @Setter
  private Boolean auditFailure;

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  @Getter
  @Setter
  private Long id;

  @SuppressWarnings("unused")
  @Version
  @Column(name = "OPTLOCK")
  @Setter
  private Integer version = null;

  /**
   * @param targetObjectIdentity
   * @param aceOrder
   * @param sid
   * @param permission
   * @param granting
   * @param auditSuccess
   * @param auditFailure
   */
  public PersistentAclEntry(
    MutableAclTargetObjectIdentity targetObjectIdentity,
    Integer aceOrder, MutableAclSid sid, Permission permission,
    Boolean granting, Boolean auditSuccess, Boolean auditFailure) {
    super();
    this.targetObjectIdentity = targetObjectIdentity;
    this.aceOrder = aceOrder;
    this.sid = sid;
    this.permission = permission;
    this.mask = permission.getMask();
    this.granting = granting;
    this.auditSuccess = auditSuccess;
    this.auditFailure = auditFailure;
  }

  public Acl getAcl() {
    return null;
  }

  public boolean isGranting() {
    return this.granting;
  }

  public boolean isAuditFailure() {
    return this.auditFailure;
  }

  public boolean isAuditSuccess() {
    return this.auditSuccess;
  }

  @SuppressWarnings("unused")
  private void setTargetObjectIdentity(
    MutableAclTargetObjectIdentity targetObjectIdentity) {
    this.targetObjectIdentity = targetObjectIdentity;
  }

  @SuppressWarnings("unused")
  private void setMask(Integer mask) {
    this.mask = mask;
    DefaultPermissionFactory dpf = new DefaultPermissionFactory();
    this.permission = dpf.buildFromMask(mask);
  }
}
