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

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import net.sf.sail.webapp.dao.authentication.GrantedAuthorityDao;
import net.sf.sail.webapp.dao.authentication.UserDetailsDao;
import net.sf.sail.webapp.domain.authentication.MutableGrantedAuthority;
import net.sf.sail.webapp.domain.authentication.MutableUserDetails;
import net.sf.sail.webapp.junit.AbstractTransactionalDbTests;
import net.sf.sail.webapp.service.authentication.DuplicateAuthorityException;
import net.sf.sail.webapp.service.authentication.UserDetailsService;

/**
 * @author Cynick Young
 * @author Laurel Williams
 * 
 * @version $Id$
 * 
 */
public class UserDetailsServiceImplTest extends AbstractTransactionalDbTests {

    private static final String USERNAME = "user name";

    private static final String ROLE = "user";

    private static final String PASSWORD = "password";

    private MutableUserDetails expectedUserDetails;

    private UserDetailsService userDetailsService;

    private UserDetailsDao<MutableUserDetails> userDetailsDao;

    private GrantedAuthorityDao<MutableGrantedAuthority> authorityDao;

    /**
     * @param userDetailsDao
     *            the userDetailsDao to set
     */
    public void setUserDetailsDao(
            UserDetailsDao<MutableUserDetails> userDetailsDao) {
        this.userDetailsDao = userDetailsDao;
    }

    /**
     * @param userDetailsService
     *            the userDetailsService to set
     */
    public void setUserDetailsService(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    /**
     * @see org.springframework.test.AbstractTransactionalSpringContextTests#onSetUpBeforeTransaction()
     */
    @Override
    protected void onSetUpBeforeTransaction() throws Exception {
        super.onSetUpBeforeTransaction();
        this.expectedUserDetails = (MutableUserDetails) this.applicationContext
                .getBean("mutableUserDetails");
        this.expectedUserDetails.setUsername(USERNAME);
        this.expectedUserDetails.setPassword(PASSWORD);
    }

    /**
     * @see org.springframework.test.AbstractTransactionalSpringContextTests#onSetUpInTransaction()
     */
    @Override
    protected void onSetUpInTransaction() throws Exception {
        super.onSetUpInTransaction();
        this.userDetailsDao.save(this.expectedUserDetails);
    }

    /**
     * @see org.springframework.test.AbstractTransactionalSpringContextTests#onTearDownAfterTransaction()
     */
    @Override
    protected void onTearDownAfterTransaction() throws Exception {
        super.onTearDownAfterTransaction();
        this.expectedUserDetails = null;
    }

    public void testLoadUserByUsername() {

        final String unknownUser = "user not found";
        try {
            this.userDetailsService.loadUserByUsername(unknownUser);
            fail("should have caught UsernameNotFoundException");
        } catch (UsernameNotFoundException expected) {
        }
        UserDetails actual = this.userDetailsService
                .loadUserByUsername(USERNAME);
        assertEquals(expectedUserDetails, actual);
    }

    public void testDuplicateAuthorityErrors() throws Exception {
        // create 2 authorities and attempt to save to DB
        // second authority should cause exception to be thrown
        MutableGrantedAuthority authority1 = (MutableGrantedAuthority) this.applicationContext
                .getBean("mutableGrantedAuthority");
        authority1.setAuthority(ROLE);
        this.userDetailsService.createGrantedAuthority(authority1);
        try {
            MutableGrantedAuthority authority2 = (MutableGrantedAuthority) this.applicationContext
                    .getBean("mutableGrantedAuthority");
            authority2.setAuthority(ROLE);
            this.userDetailsService.createGrantedAuthority(authority2);
            fail("DuplicateAuthorityException expected and not caught.");
        } catch (DuplicateAuthorityException e) {
        }

    }

    public void testCreateAuthority() throws Exception {
        MutableGrantedAuthority mutableGrantedAuthority = (MutableGrantedAuthority) this.applicationContext
                .getBean("mutableGrantedAuthority");
        mutableGrantedAuthority.setAuthority(ROLE);
        mutableGrantedAuthority = this.userDetailsService
                .createGrantedAuthority(mutableGrantedAuthority);

        GrantedAuthority actual = this.userDetailsService
                .loadAuthorityByName(ROLE);
        assertEquals(mutableGrantedAuthority, actual);
    }
    
    public void testUpdateUserDetails() {
    	assertEquals(expectedUserDetails.getPassword(), PASSWORD);
    	assertEquals(expectedUserDetails.getUsername(), USERNAME);
    	expectedUserDetails.setPassword("testPassword");
    	assertFalse(expectedUserDetails.getPassword().equals(PASSWORD));
    	userDetailsService.updateUserDetails(expectedUserDetails);
    	assertEquals(userDetailsService.loadUserByUsername(USERNAME).getPassword(), "testPassword");
    	assertFalse(userDetailsService.loadUserByUsername(USERNAME).getPassword().equals(PASSWORD));
    }

    public GrantedAuthorityDao<MutableGrantedAuthority> getAuthorityDao() {
        return authorityDao;
    }

    public void setAuthorityDao(
            GrantedAuthorityDao<MutableGrantedAuthority> authorityDao) {
        this.authorityDao = authorityDao;
    }

}