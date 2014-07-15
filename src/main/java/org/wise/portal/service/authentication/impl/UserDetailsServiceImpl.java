/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU Lesser General Public License, v2.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.service.authentication.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Required;
import org.springframework.dao.DataAccessException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.authentication.GrantedAuthorityDao;
import org.wise.portal.dao.authentication.UserDetailsDao;
import org.wise.portal.domain.authentication.MutableGrantedAuthority;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.service.authentication.AuthorityNotFoundException;
import org.wise.portal.service.authentication.DuplicateAuthorityException;
import org.wise.portal.service.authentication.UserDetailsService;

/**
 * @author Hiroki Terashima
 * @version $Id$
 */
public class UserDetailsServiceImpl
		implements UserDetailsService {
	
	@Autowired
	protected UserDetailsDao<MutableUserDetails> userDetailsDao;

	@Autowired
    private GrantedAuthorityDao<MutableGrantedAuthority> grantedAuthorityDao;
    
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
    
    @Transactional(readOnly = true)
	public List<MutableGrantedAuthority> retrieveAllAuthorities() {
		return  this.grantedAuthorityDao.getList();
	}

    /**
     * @override @see net.sf.sail.webapp.service.authentication.UserDetailsService#updateUserDetails(net.sf.sail.webapp.domain.authentication.MutableUserDetails)
     */
    @Transactional
	public void updateUserDetails(MutableUserDetails userDetails) {
		this.userDetailsDao.save(userDetails);
	}

	public List<MutableUserDetails> retrieveAllUserDetails(
			String userDetailsClassname) {
			return 	this.userDetailsDao.retrieveAll(userDetailsClassname);
	}

	public List<String> retrieveAllUsernames(String userDetailsClassName) {
		return this.userDetailsDao.retrieveAll(userDetailsClassName, "username");
	}
	
}
