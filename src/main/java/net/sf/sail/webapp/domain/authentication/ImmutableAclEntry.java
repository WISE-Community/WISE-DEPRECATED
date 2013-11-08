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

import org.springframework.security.acls.model.AccessControlEntry;
import org.springframework.security.acls.model.AuditableAccessControlEntry;

import net.sf.sail.webapp.domain.Persistable;


/**
 * Represents the Access Control List (ACL) entry (ACE) that grants permissions
 * to a Security ID (SID) for a particular secured object.
 * 
 * @author Cynick Young
 * 
 * @version $Id$
 */
public interface ImmutableAclEntry extends AccessControlEntry,
        AuditableAccessControlEntry, Persistable {
//
//    /**
//     * @return the aceOrder
//     */
//    public abstract Integer getAceOrder();
//
//    /**
//     * @return the targetObjectIdentity
//     */
//    public abstract MutableAclTargetObjectIdentity getTargetObjectIdentity();
}