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

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.acls.model.Sid;

import net.sf.sail.webapp.domain.Persistable;

/**
 * Mutable extension of the <code>Sid</code> (security id) interface. This
 * interface supports both principal and granted authority based
 * <code>Sid</code> in a single interface. There is no need for separate
 * implementations.
 * 
 * @author Cynick Young
 * 
 * @version $Id$
 * @see org.acegisecurity.acls.sid.Sid
 */
public interface MutableAclSid extends Sid, Persistable {

    /**
     * Tests whether this instance of <code>Sid</code> was created as a
     * principal.
     * 
     * @return <code>true</code> if this instance of <code>Sid</code> has
     *         been created using a principal, <code>false</code> if this has
     *         been created using a granted authority, and <code>null</code>
     *         if this instance has not been initialized properly.
     */
    public abstract Boolean isPrincipal();

    /**
     * Gets the <code>Sid</code> as a <code>String</code> if this instance
     * has been created using a principal.
     * 
     * @return the principal
     * @throws UnsupportedOperationException
     *                 if this instance of Sid is not a principal
     */
    public abstract String getPrincipal();

    /**
     * Sets the <code>Sid</code> using an <code>Authentication</code>
     * principal.
     * 
     * @param authentication
     *                to set
     */
    public abstract void setPrincipal(Authentication authentication);

    /**
     * Sets the <code>Sid</code> using a <code>GrantedAuthority</code>.
     * 
     * @param grantedAuthority
     *                to set
     */
    public abstract void setGrantedAuthority(GrantedAuthority grantedAuthority);

    /**
     * Gets the <code>Sid</code> as a <code>String</code> if this instance
     * has been created using a granted authority.
     * 
     * @return the granted authority
     * @throws UnsupportedOperationException
     *                 if this instance of Sid is not a granted authority
     */
    public abstract String getGrantedAuthority();

}