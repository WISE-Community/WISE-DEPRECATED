/**
 * Copyright (c) 2007-2019 Encore Research Group, University of Toronto
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Public License for more details.
 *
 * You should have received a copy of the GNU Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package org.wise.portal.service.authentication.impl;

import java.util.Calendar;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
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
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

  @Autowired
  protected UserDetailsDao<MutableUserDetails> userDetailsDao;

  @Autowired
  private GrantedAuthorityDao<MutableGrantedAuthority> grantedAuthorityDao;

  @Transactional(readOnly = true)
  public UserDetails loadUserByUsername(String username)
      throws UsernameNotFoundException, DataAccessException {
    UserDetails userDetails = userDetailsDao.retrieveByName(username);
    if (userDetails == null) {
      throw new UsernameNotFoundException("Username: " + username + " not found.");
    }
    return userDetails;
  }

  public UserDetails loadUserByGoogleUserId(String googleUserId) {
    return this.userDetailsDao.retrieveByGoogleUserId(googleUserId);
  }

  @Override
  public void updateStatsOnSuccessfulLogin(MutableUserDetails userDetails) {
    ((MutableUserDetails) userDetails).incrementNumberOfLogins();
    ((MutableUserDetails) userDetails).setLastLoginTime(Calendar.getInstance().getTime());
    ((MutableUserDetails) userDetails).setNumberOfRecentFailedLoginAttempts(0);
    this.updateUserDetails((MutableUserDetails) userDetails);
  }

  @Transactional(rollbackFor = { DuplicateAuthorityException.class })
  public MutableGrantedAuthority createGrantedAuthority(
      MutableGrantedAuthority mutableGrantedAuthority) throws DuplicateAuthorityException {
    checkNoAuthorityCreationErrors(mutableGrantedAuthority.getAuthority());
    grantedAuthorityDao.save(mutableGrantedAuthority);
    return mutableGrantedAuthority;
  }

  /**
   * Validates user input checks that the data store does not already contain
   * an authority with the same name
   *
   * @param authority The authority to be checked for in the data store.
   * @throws DuplicateAuthorityException if the authority is the same as an authority
   * already in data store.
   */
  private void checkNoAuthorityCreationErrors(String authority) throws DuplicateAuthorityException {
    if (grantedAuthorityDao.hasRole(authority)) {
      throw new DuplicateAuthorityException(authority);
    }
  }

  @Transactional(readOnly = true)
  public GrantedAuthority loadAuthorityByName(String authority) throws AuthorityNotFoundException {
    GrantedAuthority grantedAuthority = grantedAuthorityDao.retrieveByName(authority);
    if (grantedAuthority == null) {
      throw new AuthorityNotFoundException(authority);
    }
    return grantedAuthority;
  }

  @Transactional(readOnly = true)
  public List<MutableGrantedAuthority> retrieveAllAuthorities() {
    return  grantedAuthorityDao.getList();
  }

  @Transactional
  public void updateUserDetails(MutableUserDetails userDetails) {
    userDetailsDao.save(userDetails);
  }

  public List<String> retrieveAllTeacherUsernames() {
    return userDetailsDao.retrieveAllTeacherUsernames();
  }

  public List<String> retrieveAllStudentUsernames() {
    return userDetailsDao.retrieveAllStudentUsernames();
  }
}
