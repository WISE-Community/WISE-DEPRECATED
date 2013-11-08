/**
 * Copyright (c) 2006 Encore Research Group, University of Toronto
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

import org.springframework.security.core.GrantedAuthority;

import net.sf.sail.webapp.domain.Persistable;

/**
 * This interface extends Acegi Security's <code>GrantedAuthority</code> and
 * provides mutator methods to the properties. <code>GrantedAuthority</code>
 * represents a role that can be given specific access permissions. An example
 * could be Admin, User, Manager, and Bank Teller roles.
 * 
 * @author Cynick Young
 * 
 * @version $Id$
 * @see org.acegisecurity.GrantedAuthority
 */
public interface MutableGrantedAuthority extends GrantedAuthority, Persistable {

    /**
     * Sets the name of the this authority.
     * 
     * @param authority
     */
    public void setAuthority(String authority);
}
