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
package net.sf.sail.webapp.domain;

import net.sf.sail.webapp.domain.authentication.MutableUserDetails;
import net.sf.sail.webapp.domain.sds.SdsUser;

/**
 * @author Cynick Young
 * @author Laurel Williams
 * @version $Id$
 */
public interface User extends Persistable {

    public static final String CURRENT_USER_SESSION_KEY = "CURRENT_USER";

    public Long getId();

    /**
     * Gets the UserDetails object.
     * 
     * @return the userDetails
     */
    public abstract MutableUserDetails getUserDetails();

    /**
     * Sets the UserDetails object
     * 
     * @param userDetails
     *            the userDetails to set
     */
    public abstract void setUserDetails(MutableUserDetails userDetails);

    /**
     * Sets the sdsUser object.
     * 
     * @param sdsUser
     *            the sdsUser to set
     */
    public abstract void setSdsUser(SdsUser sdsUser);

    /**
     * Gets the sdsUser object.
     * 
     * @return the sdsUser
     */
    public SdsUser getSdsUser();
    
    /**
     * Returns true if this use is an admin, false otherwise.
     * 
     * @return boolean
     */
    public boolean isAdmin();
}