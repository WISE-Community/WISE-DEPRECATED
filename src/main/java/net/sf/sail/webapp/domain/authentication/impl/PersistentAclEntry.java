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
package net.sf.sail.webapp.domain.authentication.impl;

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

import org.springframework.security.acls.model.Acl;
import org.springframework.security.acls.model.Permission;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.security.acls.domain.DefaultPermissionFactory;
import org.springframework.security.acls.model.Sid;

import net.sf.sail.webapp.domain.authentication.ImmutableAclEntry;
import net.sf.sail.webapp.domain.authentication.MutableAclSid;
import net.sf.sail.webapp.domain.authentication.MutableAclTargetObjectIdentity;


/**
 * Concrete implementation of <code>MutableAclEntry</code> marked with EJB3
 * annotations for persistence.
 * 
 * @author Cynick Young
 * 
 * @version $Id$
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
    private Integer aceOrder;

    @ManyToOne(cascade = CascadeType.ALL, targetEntity = PersistentAclSid.class)
    @JoinColumn(name = COLUMN_NAME_SID, nullable = false)
    private MutableAclSid sid;

    @SuppressWarnings("unused")
    @Column(name = COLUMN_NAME_MASK, nullable = false)
    private Integer mask;

    @Transient
    private Permission permission;

    @Column(name = COLUMN_NAME_GRANTING, nullable = false)
    private Boolean granting;

    @Column(name = COLUMN_NAME_AUDIT_SUCCESS, nullable = false)
    private Boolean auditSuccess;

    @Column(name = COLUMN_NAME_AUDIT_FAILURE, nullable = false)
    private Boolean auditFailure;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @SuppressWarnings("unused")
    @Version
    @Column(name = "OPTLOCK")
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

    /**
     * @see org.acegisecurity.acls.AccessControlEntry#getAcl()
     */
    public Acl getAcl() {
        return null;
    }

    /**
     * @see org.acegisecurity.acls.AccessControlEntry#getId()
     */
    public Serializable getId() {
        return this.id;
    }

    /**
     * @see org.acegisecurity.acls.AccessControlEntry#getPermission()
     */
    public Permission getPermission() {
        return this.permission;
    }

    /**
     * @see org.acegisecurity.acls.AccessControlEntry#getSid()
     */
    public Sid getSid() {
        return this.sid;
    }

    /**
     * @see org.acegisecurity.acls.AccessControlEntry#isGranting()
     */
    public boolean isGranting() {
        return this.granting;
    }

    /**
     * @see org.acegisecurity.acls.AuditableAccessControlEntry#isAuditFailure()
     */
    public boolean isAuditFailure() {
        return this.auditFailure;
    }

    /**
     * @see org.acegisecurity.acls.AuditableAccessControlEntry#isAuditSuccess()
     */
    public boolean isAuditSuccess() {
        return this.auditSuccess;
    }

    /**
     * @param targetObjectIdentity
     *                the targetObjectIdentity to set
     */
    @SuppressWarnings("unused")
    private void setTargetObjectIdentity(
            MutableAclTargetObjectIdentity targetObjectIdentity) {
        this.targetObjectIdentity = targetObjectIdentity;
    }

    /**
     * @param aceOrder
     *                the aceOrder to set
     */
    @SuppressWarnings("unused")
    private void setAceOrder(Integer aceOrder) {
        this.aceOrder = aceOrder;
    }

    /**
     * @param sid
     *                the sid to set
     */
    @SuppressWarnings("unused")
    private void setSid(MutableAclSid sid) {
        this.sid = sid;
    }

    /**
     * @param mask
     *                the mask to set
     */
    @SuppressWarnings("unused")
    private void setMask(Integer mask) {
        this.mask = mask;
        DefaultPermissionFactory dpf = new DefaultPermissionFactory();
        this.permission = dpf.buildFromMask(mask);
    }

    /**
     * @param granting
     *                the granting to set
     */
    @SuppressWarnings("unused")
    private void setGranting(Boolean granting) {
        this.granting = granting;
    }

    /**
     * @param auditSuccess
     *                the auditSuccess to set
     */
    @SuppressWarnings("unused")
    private void setAuditSuccess(Boolean auditSuccess) {
        this.auditSuccess = auditSuccess;
    }

    /**
     * @param auditFailure
     *                the auditFailure to set
     */
    @SuppressWarnings("unused")
    private void setAuditFailure(Boolean auditFailure) {
        this.auditFailure = auditFailure;
    }

    /**
     * @param id
     *                the id to set
     */
    @SuppressWarnings("unused")
    private void setId(Long id) {
        this.id = id;
    }

    /**
     * @param version
     *                the version to set
     */
    @SuppressWarnings("unused")
    private void setVersion(Integer version) {
        this.version = version;
    }
}