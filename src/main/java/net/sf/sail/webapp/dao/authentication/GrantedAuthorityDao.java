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
package net.sf.sail.webapp.dao.authentication;

import net.sf.sail.webapp.dao.SimpleDao;
import net.sf.sail.webapp.domain.authentication.MutableGrantedAuthority;

/**
 * Interface that extends <code>SimpleDao</code> used for
 * <code>GrantedAuthority</code>.
 * 
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public interface GrantedAuthorityDao<T extends MutableGrantedAuthority> extends
        SimpleDao<T> {

    /**
     * Given a string representing a role, determines if this granted authority
     * has this role.
     * 
     * @param authority
     *            The role string
     * @return True if the GrantedAuthority has this role, false otherwise.
     */
    public boolean hasRole(String authority);

    /**
     * Given an input string retrieve a corresponding record from data store.
     * 
     * @param name
     *            A string representing the name of the data in the data store.
     * @return A new instance of a data object.
     */
    public T retrieveByName(String name);
}