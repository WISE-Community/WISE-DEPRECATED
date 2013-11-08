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
package net.sf.sail.webapp.domain.authentication.impl;

import junit.framework.TestCase;

import net.sf.sail.webapp.domain.authentication.MutableAclSid;

import org.easymock.EasyMock;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Unit test for domain object PersistentAclSid.
 * 
 * @author Cynick Young
 * 
 * @version $Id$
 */
public class PersistentSidTest extends TestCase {

    private static final String PRINCIPAL = "some principal";

    private static final String ROLE = "some role";

    private MutableAclSid sid;

    /**
     * @see junit.framework.TestCase#setUp()
     */
    protected void setUp() throws Exception {
        super.setUp();
        this.sid = new PersistentAclSid();
    }

    /**
     * @see junit.framework.TestCase#tearDown()
     */
    protected void tearDown() throws Exception {
        super.tearDown();
        this.sid = null;
    }

    /**
     * Test method for
     * {@link net.sf.sail.webapp.domain.authentication.impl.PersistentAclSid#getIsPrincipal()}.
     */
    public void testGetIsPrincipal_Empty() {
        assertNull(this.sid.isPrincipal());
    }

    /**
     * Test method for
     * {@link net.sf.sail.webapp.domain.authentication.impl.PersistentAclSid#IsPrincipal()}.
     */
    public void testIsPrincipal_Principal() {
        // test when the principal is any implementation of a principal (usually
        // a string)
        Authentication authentication = setupPrincipalAsString(PRINCIPAL);
        this.sid.setPrincipal(authentication);
        EasyMock.verify(authentication);
        assertTrue(this.sid.isPrincipal());

        EasyMock.reset(authentication);

        // test when the principal is an user details
        authentication = setupPrincipalAsUserDetails(PRINCIPAL);
        this.sid.setPrincipal(authentication);
        EasyMock.verify(authentication);
        assertTrue(this.sid.isPrincipal());
    }

    /**
     * Test method for
     * {@link net.sf.sail.webapp.domain.authentication.impl.PersistentAclSid#isPrincipal()}.
     */
    public void testGetIsPrincipal_GrantedAuthority() {
        GrantedAuthority grantedAuthority = setupGrantedAuthority(ROLE);
        this.sid.setGrantedAuthority(grantedAuthority);
        EasyMock.verify(grantedAuthority);
        assertFalse(sid.isPrincipal());
    }

    /**
     * Test method for
     * {@link net.sf.sail.webapp.domain.authentication.impl.PersistentAclSid#getPrincipal()}.
     */
    public void testGetPrincipal_Empty() {
        try {
            this.sid.getPrincipal();
            fail("IllegalStateException expected");
        } catch (IllegalStateException expected) {
        }
    }

    public void testSetAndGetPrincipal_Principal() {
        // test when the principal is any implementation of a principal (usually
        // a string)
        Authentication authentication = setupPrincipalAsString(PRINCIPAL);
        this.sid.setPrincipal(authentication);
        EasyMock.verify(authentication);
        assertEquals(PRINCIPAL, this.sid.getPrincipal().toString());

        EasyMock.reset(authentication);

        // test when the principal is an user details
        authentication = setupPrincipalAsUserDetails(PRINCIPAL);
        this.sid.setPrincipal(authentication);
        EasyMock.verify(authentication);
        assertEquals(PRINCIPAL, this.sid.getPrincipal().toString());
    }

    public void testSetAndGetPrincipal_GrantedAuthority() {
        GrantedAuthority grantedAuthority = setupGrantedAuthority(ROLE);
        this.sid.setGrantedAuthority(grantedAuthority);
        EasyMock.verify(grantedAuthority);
        try {
            this.sid.getPrincipal();
            fail("UnsupportedOperationException expected");
        } catch (UnsupportedOperationException expected) {
        }
    }

    public void testSetAndGetGrantedAuthority_Principal() {
        Authentication authentication = setupPrincipalAsString(PRINCIPAL);
        this.sid.setPrincipal(authentication);
        EasyMock.verify(authentication);
        try {
            this.sid.getGrantedAuthority();
            fail("UnsupportedOperationException expected");
        } catch (UnsupportedOperationException expected) {
        }
    }

    public void testSetAndGetGrantedAuthority_GrantedAuthority() {
        GrantedAuthority grantedAuthority = setupGrantedAuthority(ROLE);
        this.sid.setGrantedAuthority(grantedAuthority);
        EasyMock.verify(grantedAuthority);
        assertEquals(ROLE, this.sid.getGrantedAuthority());
    }

    private Authentication setupPrincipalAsString(String principal) {
        Authentication authentication = EasyMock
                .createMock(Authentication.class);

        EasyMock.expect(authentication.getPrincipal()).andReturn(principal);
        EasyMock.expectLastCall().times(2);
        EasyMock.replay(authentication);
        return authentication;
    }

    private Authentication setupPrincipalAsUserDetails(String principal) {
        UserDetails userDetails = EasyMock.createMock(UserDetails.class);
        EasyMock.expect(userDetails.getUsername()).andReturn(principal);
        EasyMock.replay(userDetails);

        Authentication authentication = EasyMock
                .createMock(Authentication.class);
        EasyMock.expect(authentication.getPrincipal()).andReturn(userDetails);
        EasyMock.expectLastCall().times(2);
        EasyMock.replay(authentication);
        return authentication;
    }

    private GrantedAuthority setupGrantedAuthority(String role) {
        GrantedAuthority grantedAuthority = EasyMock
                .createMock(GrantedAuthority.class);

        EasyMock.expect(grantedAuthority.getAuthority()).andReturn(role);
        EasyMock.replay(grantedAuthority);
        return grantedAuthority;
    }

}