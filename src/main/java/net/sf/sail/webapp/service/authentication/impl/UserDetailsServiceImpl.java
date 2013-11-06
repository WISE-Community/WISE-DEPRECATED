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
package net.sf.sail.webapp.service.authentication.impl;

import net.sf.sail.webapp.dao.authentication.GrantedAuthorityDao;
import net.sf.sail.webapp.dao.authentication.UserDetailsDao;
import net.sf.sail.webapp.domain.authentication.MutableGrantedAuthority;
import net.sf.sail.webapp.domain.authentication.MutableUserDetails;
import net.sf.sail.webapp.service.authentication.AuthorityNotFoundException;
import net.sf.sail.webapp.service.authentication.DuplicateAuthorityException;
import net.sf.sail.webapp.service.authentication.UserDetailsService;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.dao.DataAccessException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.transaction.annotation.Transactional;

/**
 * A class to provide services for MutableUserDetails objects.
 * 
 * @author Cynick Young
 * @author Laurel Willliams
 * 
 * @version $Id$
 * 
 */
public class UserDetailsServiceImpl implements UserDetailsService {

    protected UserDetailsDao<MutableUserDetails> userDetailsDao;

    private GrantedAuthorityDao<MutableGrantedAuthority> grantedAuthorityDao;

    /**
     * @param grantedAuthorityDao
     *            The granted authority to set.
     */
    @Required
    public void setGrantedAuthorityDao(
            GrantedAuthorityDao<MutableGrantedAuthority> grantedAuthorityDao) {
        this.grantedAuthorityDao = grantedAuthorityDao;
    }

    /**
     * @see org.acegisecurity.userdetails.UserDetailsService#loadUserByUsername(java.lang.String)
     */
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException, DataAccessException {
        UserDetails userDetails = this.userDetailsDao.retrieveByName(username);
        if (userDetails == null) {
            throw new UsernameNotFoundException("Username: " + username
                    + " not found.");
        }
        return userDetails;
    }

    /**
     * @param userDetailsDao
     *            The userDetailsDao to set.
     */
    @Required
    public void setUserDetailsDao(
            UserDetailsDao<MutableUserDetails> userDetailsDao) {
        this.userDetailsDao = userDetailsDao;
    }

    /**
     * @see net.sf.sail.webapp.service.authentication.UserDetailsService#createGrantedAuthority(net.sf.sail.webapp.domain.authentication.MutableGrantedAuthority)
     */
    @Transactional(rollbackFor = { DuplicateAuthorityException.class })
    public MutableGrantedAuthority createGrantedAuthority(
            MutableGrantedAuthority mutableGrantedAuthority)
            throws DuplicateAuthorityException {

        this.checkNoAuthorityCreationErrors(mutableGrantedAuthority
                .getAuthority());
        this.grantedAuthorityDao.save(mutableGrantedAuthority);
        return mutableGrantedAuthority;
    }

    /**
     * Validates user input checks that the data store does not already contain
     * an authority with the same name
     * 
     * @param authority
     *            The authority to be checked for in the data store.
     * @throws DuplicateAuthorityException
     *             If the authority is the same as an authority already in data
     *             store.
     */
    private void checkNoAuthorityCreationErrors(String authority)
            throws DuplicateAuthorityException {

        if (this.grantedAuthorityDao.hasRole(authority)) {
            throw new DuplicateAuthorityException(authority);
        }
    }

    /**
     * @see net.sf.sail.webapp.service.authentication.UserDetailsService#loadAuthorityByName(java.lang.String)
     */
    @Transactional(readOnly = true)
    public GrantedAuthority loadAuthorityByName(String authority)
            throws AuthorityNotFoundException {
        GrantedAuthority grantedAuthority = this.grantedAuthorityDao
                .retrieveByName(authority);
        if (grantedAuthority == null) {
            throw new AuthorityNotFoundException(authority);
        }
        return grantedAuthority;
    }
    
    /**
     * @override @see net.sf.sail.webapp.service.authentication.UserDetailsService#updateUserDetails(net.sf.sail.webapp.domain.authentication.MutableUserDetails)
     */
    @Transactional
	public void updateUserDetails(MutableUserDetails userDetails) {
		this.userDetailsDao.save(userDetails);
	}
    
}