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
package net.sf.sail.webapp.service.impl;

import junit.framework.TestCase;
import net.sf.sail.webapp.domain.group.Group;

import org.easymock.EasyMock;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.GrantedAuthorityImpl;
import org.springframework.security.acls.model.MutableAcl;
import org.springframework.security.acls.model.MutableAclService;
import org.springframework.security.acls.model.NotFoundException;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.security.acls.model.ObjectIdentity;
import org.springframework.security.acls.domain.ObjectIdentityImpl;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.authentication.TestingAuthenticationToken;

/**
 * @author Laurel Williams
 * 
 * @version $Id$
 */
public class AclServiceImplTest extends TestCase {

	private MutableAclService mutableAclService;
	private AclServiceImpl<Group> groupAclService;
	private TestingAuthenticationToken authority;
	private SecurityContext securityContext;
	private Group group;
	private ObjectIdentity objectIdentity;
	private MutableAcl mockMutableAcl;

	/**
	 * @see junit.framework.TestCase#setUp()
	 */
	protected void setUp() throws Exception {
		super.setUp();

		authority = new TestingAuthenticationToken("admin",
				new GrantedAuthority[] { new GrantedAuthorityImpl(
						"ROLE_ADMINISTRATOR") });
		authority.setAuthenticated(true);
		securityContext = new SecurityContextImpl();
		securityContext.setAuthentication(authority);
		SecurityContextHolder.setContext(securityContext);

		groupAclService = new AclServiceImpl<Group>();
		mutableAclService = EasyMock.createMock(MutableAclService.class);
		groupAclService.setMutableAclService(mutableAclService);
		
		group = EasyMock.createMock(Group.class);
		EasyMock.expect(group.getId()).andReturn(new Long(1)).anyTimes();
		EasyMock.replay(group);
		
		objectIdentity = 
			new ObjectIdentityImpl(group.getClass(), group.getId());
		
		mockMutableAcl = EasyMock.createNiceMock(MutableAcl.class);

	}

	/**
	 * @see junit.framework.TestCase#tearDown()
	 */
	protected void tearDown() throws Exception {
		super.tearDown();
		groupAclService = null;
		mutableAclService = null;
		authority = null;
		securityContext = null;
		group = null;
		objectIdentity = null;
		mockMutableAcl = null;
	}

	public void testAddPermission() {
		// here, test that acl doesn't exist yet, so a new acl 
		// will be created and a new ace will be added to that
		EasyMock.expect(mutableAclService.readAclById(objectIdentity))
		     .andThrow(new NotFoundException("acl not found"));
		EasyMock.expect(mutableAclService.createAcl(objectIdentity)).andStubReturn(mockMutableAcl);
		EasyMock.expect(mutableAclService.updateAcl(mockMutableAcl)).andReturn(mockMutableAcl);
		EasyMock.replay(mutableAclService);
		EasyMock.replay(mockMutableAcl);
		
		groupAclService.addPermission(group, BasePermission.ADMINISTRATION);
		
		EasyMock.verify(group);
		EasyMock.verify(mockMutableAcl);
		EasyMock.verify(mutableAclService);
	}
	
	public void testAddPermission_acl_exists() {
		// test the case in which the acl already exists in the db.
		// in this case, a new ace is added to the acl.
		EasyMock.expect(mutableAclService.readAclById(objectIdentity)).andStubReturn(mockMutableAcl);
		EasyMock.expect(mutableAclService.updateAcl(mockMutableAcl)).andReturn(mockMutableAcl);
		EasyMock.replay(mutableAclService);
		EasyMock.replay(mockMutableAcl);
		
		groupAclService.addPermission(group, BasePermission.ADMINISTRATION);
		
		EasyMock.verify(group);
		EasyMock.verify(mockMutableAcl);
		EasyMock.verify(mutableAclService);
	}
	
	public void testAddPermission_null_object() {
		try {
  		     groupAclService.addPermission(null, BasePermission.ADMINISTRATION);
  		     fail("Exception expected but was not thrown");
		} catch (IllegalArgumentException e) {
		}
	}

}
