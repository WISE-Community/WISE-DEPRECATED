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
package org.wise.portal.service.impl;

import static org.easymock.EasyMock.createNiceMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.fail;

import java.util.Collections;

import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.security.acls.domain.ObjectIdentityImpl;
import org.springframework.security.acls.model.MutableAcl;
import org.springframework.security.acls.model.MutableAclService;
import org.springframework.security.acls.model.NotFoundException;
import org.springframework.security.acls.model.ObjectIdentity;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextImpl;
import org.wise.portal.domain.group.Group;
import org.wise.portal.service.acl.impl.AclServiceImpl;

/**
 * @author Laurel Williams
 * @author Hiroki Terashima
 */
@RunWith(EasyMockRunner.class)
public class AclServiceImplTest {

  @Mock
  private MutableAclService mutableAclService;

  @Mock
  private Group group;

  @TestSubject
  private AclServiceImpl<Group> groupAclService = new AclServiceImpl<Group>();

  private TestingAuthenticationToken authority;

  private SecurityContext securityContext;

  private ObjectIdentity objectIdentity;

  private MutableAcl mockMutableAcl;

  @Before
  public void setUp() {
    authority = new TestingAuthenticationToken("admin",
        new GrantedAuthority[] { new SimpleGrantedAuthority("ROLE_ADMINISTRATOR") });
    authority.setAuthenticated(true);
    securityContext = new SecurityContextImpl();
    securityContext.setAuthentication(authority);
    SecurityContextHolder.setContext(securityContext);

    expect(group.getId()).andReturn(new Long(1)).anyTimes();
    replay(group);
    mockMutableAcl = createNiceMock(MutableAcl.class);
    objectIdentity = new ObjectIdentityImpl(group.getClass(), group.getId());
  }

  @After
  public void tearDown() {
    groupAclService = null;
    mutableAclService = null;
    authority = null;
    securityContext = null;
    group = null;
    objectIdentity = null;
    mockMutableAcl = null;
  }

  @Test
  public void addPermission_AclDoesNotExist_ShouldCreateNewAclWithAce() {
    expect(mutableAclService.readAclById(objectIdentity))
        .andThrow(new NotFoundException("acl not found"));
    expect(mutableAclService.createAcl(objectIdentity)).andStubReturn(mockMutableAcl);
    expect(mockMutableAcl.getEntries()).andStubReturn(Collections.emptyList());
    expect(mutableAclService.updateAcl(mockMutableAcl)).andReturn(mockMutableAcl);
    replay(mutableAclService);
    replay(mockMutableAcl);

    groupAclService.addPermission(group, BasePermission.ADMINISTRATION);

    verify(group);
    verify(mockMutableAcl);
    verify(mutableAclService);
  }

  @Test
  public void addPermission_AclExists_ShouldAddAceInAcl() {
    expect(mutableAclService.readAclById(objectIdentity)).andStubReturn(mockMutableAcl);
    expect(mockMutableAcl.getEntries()).andStubReturn(Collections.emptyList());
    expect(mutableAclService.updateAcl(mockMutableAcl)).andReturn(mockMutableAcl);
    replay(mutableAclService);
    replay(mockMutableAcl);

    groupAclService.addPermission(group, BasePermission.ADMINISTRATION);

    verify(group);
    verify(mockMutableAcl);
    verify(mutableAclService);
  }

  @Test
  public void addPermission_NullObject_ShouldThrowException() {
    try {
      groupAclService.addPermission(null, BasePermission.ADMINISTRATION);
      fail("Exception expected but was not thrown");
    } catch (IllegalArgumentException e) {
    }
  }

}
