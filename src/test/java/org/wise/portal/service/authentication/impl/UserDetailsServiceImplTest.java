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
package org.wise.portal.service.authentication.impl;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.wise.portal.dao.authentication.GrantedAuthorityDao;
import org.wise.portal.dao.authentication.UserDetailsDao;
import org.wise.portal.domain.authentication.MutableGrantedAuthority;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.PersistentGrantedAuthority;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.service.authentication.DuplicateAuthorityException;
import org.wise.portal.service.authentication.UserDetailsService;

/**
 * @author Cynick Young
 * @author Laurel Williams
 * @author Hiroki Terashima
 */
@RunWith(EasyMockRunner.class)
public class UserDetailsServiceImplTest {

  @TestSubject
  private UserDetailsService userDetailsService = new UserDetailsServiceImpl();

  @Mock
  private UserDetailsDao<MutableUserDetails> userDetailsDao;

  @Mock
  private GrantedAuthorityDao<MutableGrantedAuthority> authorityDao;

  private static final String TEACHER_ROLE = "teacherRole";

  MutableGrantedAuthority teacherAuthority;

  private MutableUserDetails teacherUserDetails;

  String TEACHER_USERNAME = "usernameInDB";

  String UNKNOWN_USERNAME = "usernameNotInDB";

  @Before
  public void setUp() {
    teacherUserDetails = new TeacherUserDetails();
    teacherUserDetails.setUsername(TEACHER_USERNAME);
    teacherAuthority = new PersistentGrantedAuthority();
    teacherAuthority.setAuthority(TEACHER_ROLE);
  }

  @After
  public void tearDown() {
    teacherUserDetails = null;
    teacherAuthority = null;
  }

  @Test
  public void loadUserByUsername_UsernameNotInDB_ShouldThrowException() {
    expect(userDetailsDao.retrieveByName(UNKNOWN_USERNAME)).andReturn(null);
    replay(userDetailsDao);
    try {
      userDetailsService.loadUserByUsername(UNKNOWN_USERNAME);
      fail("should have caught UsernameNotFoundException");
    } catch (UsernameNotFoundException e) {
      assertEquals("Username: " + UNKNOWN_USERNAME + " not found.",
          e.getMessage());
    }
    verify(userDetailsDao);
  }

  @Test
  public void loadUserByUsername_UsernameInDB_ShouldReturnUserDetails() {
    expect(userDetailsDao.retrieveByName(TEACHER_USERNAME)).andReturn(teacherUserDetails);
    replay(userDetailsDao);
    UserDetails userDetails = userDetailsService.loadUserByUsername(TEACHER_USERNAME);
    assertEquals(TEACHER_USERNAME, userDetails.getUsername());
    verify(userDetailsDao);
  }

  @Test
  public void createGrantedAuthority_AuthorityAlreadyInDB_ShouldThrowException() {
    expect(authorityDao.hasRole(TEACHER_ROLE)).andReturn(true);
    replay(authorityDao);
    try {
      userDetailsService.createGrantedAuthority(teacherAuthority);
      fail("DuplicateAuthorityException expected and not caught.");
    } catch (DuplicateAuthorityException e) {
      assertEquals("Granted Authority:" + TEACHER_ROLE + " already in use.",
          e.getMessage());
    }
    verify(authorityDao);
  }

  @Test
  public void createAuthority_NewAuthority_ShouldCreateAuthority() {
    expect(authorityDao.hasRole(TEACHER_ROLE)).andReturn(false);
    authorityDao.save(teacherAuthority);
    expectLastCall();
    replay(authorityDao);
    try {
      MutableGrantedAuthority grantedAuthority = userDetailsService.createGrantedAuthority(teacherAuthority);
      assertEquals(TEACHER_ROLE, grantedAuthority.getAuthority());
    } catch (DuplicateAuthorityException e) {
      fail("DuplicateAuthorityException was not expected to be thrown");
    }
    verify(authorityDao);
  }
}
