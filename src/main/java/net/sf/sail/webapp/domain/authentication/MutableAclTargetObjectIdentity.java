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
package net.sf.sail.webapp.domain.authentication;

import org.springframework.security.acls.model.ObjectIdentity;

import net.sf.sail.webapp.domain.Persistable;

/**
 * Mutable extension of <code>ObjectIdentity</code>. Represents the object
 * identity of a Java object that will be authorized according to an access
 * control list (ACL).
 * 
 * @author Cynick Young
 * 
 * @version $Id: MutableAclTargetObjectIdentity.java 595 2007-07-05 17:55:23Z
 *          cynick $
 * @see org.acegisecurity.acls.objectidentity.ObjectIdentity
 */
public interface MutableAclTargetObjectIdentity extends ObjectIdentity,
        Persistable {

    /**
     * @return the aclTargetObject
     */
    public abstract MutableAclTargetObject getAclTargetObject();

    /**
     * @param aclTargetObject
     *                the aclTargetObject to set
     */
    public abstract void setAclTargetObject(
            MutableAclTargetObject aclTargetObject);

    /**
     * @return the aclTargetObjectId
     */
    public abstract Long getAclTargetObjectId();

    /**
     * @param aclTargetObjectId
     *                the aclTargetObjectId to set
     */
    public abstract void setAclTargetObjectId(Long aclTargetObjectId);

    /**
     * @return the inheriting
     */
    public abstract Boolean isInheriting();

    /**
     * @param inheriting
     *                the inheriting to set
     */
    public abstract void setInheriting(Boolean isInheriting);

    /**
     * @return the ownerSid
     */
    public abstract MutableAclSid getOwnerSid();

    /**
     * @param ownerSid
     *                the ownerSid to set
     */
    public abstract void setOwnerSid(MutableAclSid ownerSid);

    /**
     * @return the parent
     */
    public abstract MutableAclTargetObjectIdentity getParent();

    /**
     * @param parent
     *                the parent to set
     */
    public abstract void setParent(MutableAclTargetObjectIdentity parent);

}