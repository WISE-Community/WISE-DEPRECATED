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
package net.sf.sail.webapp.service.authentication;

import org.springframework.security.core.GrantedAuthority;

import net.sf.sail.webapp.domain.authentication.MutableGrantedAuthority;
import net.sf.sail.webapp.domain.authentication.MutableUserDetails;


/**
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public interface UserDetailsService extends
	org.springframework.security.core.userdetails.UserDetailsService {

    public static final String USER_ROLE = "ROLE_USER";

    public static final String ADMIN_ROLE = "ROLE_ADMINISTRATOR";

    /**
     * Given an object representing a role, created the granted authority record
     * in the data store.
     * 
     * @param mutableGrantedAuthority
     *            to create in the data store
     * @return the <code>MutableGrantedAuthority</code> object after it has
     *         been saved in the data store
     * @throws DuplicateAuthorityException
     *             if authority is not unique.
     */

    public MutableGrantedAuthority createGrantedAuthority(
            MutableGrantedAuthority mutableGrantedAuthority)
            throws DuplicateAuthorityException;

    /**
     * Given an authority string, loads an authority from the data store.
     * 
     * @param authority
     * @return A MutableGrantedAuthority object
     * @throws AuthorityNotFoundException
     *             If authority is not in data store.
     */
    public GrantedAuthority loadAuthorityByName(String authority)
            throws AuthorityNotFoundException;
    
    /**
     * Given a MutableUserDetails, updates the data of that object in the database
     * @param userDetails
     */
    public void updateUserDetails(final MutableUserDetails userDetails);
    

}