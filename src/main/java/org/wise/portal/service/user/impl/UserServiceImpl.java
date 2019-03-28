/**
 * Copyright (c) 2007-2017 Encore Research Group, University of Toronto
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
package org.wise.portal.service.user.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.authentication.GrantedAuthorityDao;
import org.wise.portal.dao.authentication.UserDetailsDao;
import org.wise.portal.dao.user.UserDao;
import org.wise.portal.domain.authentication.MutableGrantedAuthority;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.presentation.web.exception.IncorrectPasswordException;
import org.wise.portal.service.authentication.DuplicateUsernameException;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.spring.impl.DefaultPasswordEncoderFactories;

import java.util.Calendar;
import java.util.List;

/**
 * Implementation class that uses daos to interact with the data store.
 *
 * @author Laurel Williams
 * @author Hiroki Terashima
 */
@Service
public class UserServiceImpl implements UserService {

  @Autowired
  private UserDetailsDao<MutableUserDetails> userDetailsDao;

  @Autowired
  private GrantedAuthorityDao<MutableGrantedAuthority> grantedAuthorityDao;

  @Autowired
  private UserDao<User> userDao;

  @Autowired
  protected PasswordEncoder passwordEncoder;

  @Transactional(readOnly = true)
  public User retrieveUser(UserDetails userDetails) {
    return userDao.retrieveByUserDetails(userDetails);
  }

  @Transactional(readOnly = true)
  public List<User> retrieveUsersByUsername(String username) {
    return retrieveByField("username", "like", "%" + username + "%", "teacherUserDetails");
  }

  @Override
  public List<User> retrieveDisabledUsers() {
    return userDao.retrieveDisabledUsers();
  }

  @Transactional(readOnly = true)
  public List<User> retrieveUserByEmailAddress(String emailAddress) {
    return userDao.retrieveByEmailAddress(emailAddress);
  }

  @Transactional(readOnly = true)
  public User retrieveUserByGoogleUserId(String googleUserId) {
    return this.userDao.retrieveByGoogleUserId(googleUserId);
  }

  @Override
  @Transactional(rollbackFor = { DuplicateUsernameException.class})
  public User createUser(final MutableUserDetails userDetails) {
    MutableUserDetails details = userDetails;
    if (userDetails instanceof StudentUserDetails) {
      assignRole(userDetails, UserDetailsService.STUDENT_ROLE);
    } else if (userDetails instanceof TeacherUserDetails) {
      assignRole(userDetails, UserDetailsService.TEACHER_ROLE);
      assignRole(userDetails, UserDetailsService.AUTHOR_ROLE);
    }

    details.setFirstname(details.getFirstname().trim());
    details.setLastname(details.getLastname().trim());
    details.setNumberOfLogins(0);
    details.setSignupdate(Calendar.getInstance().getTime());

    String currentUsernameSuffix = null;
    User createdUser = null;
    boolean done = false;

    while (!done) {
      try {
        currentUsernameSuffix = details.getNextUsernameSuffix(currentUsernameSuffix);
        String coreUsername = details.getCoreUsername();
        details.setUsername(coreUsername + currentUsernameSuffix);
        checkUserErrors(userDetails.getUsername());
        assignRole(userDetails, UserDetailsService.USER_ROLE);
        encodePassword(userDetails);

        createdUser = new UserImpl();
        createdUser.setUserDetails(userDetails);
        userDao.save(createdUser);
        done = true;
      } catch (DuplicateUsernameException e) {
        // the username already exists; try the next possible username
        continue;
      }
    }
    return createdUser;
  }

  void encodePassword(MutableUserDetails userDetails) {
    userDetails.setPassword(passwordEncoder.encode(userDetails.getPassword()));
  }

  public void assignRole(MutableUserDetails userDetails, final String role) {
    GrantedAuthority authority = this.grantedAuthorityDao.retrieveByName(role);
    userDetails.addAuthority(authority);
  }

  /**
   * Validates user input checks that the data store does not already contain
   * a user with the same username
   *
   * @param username The username to check for in the data store
   * @throws DuplicateUsernameException if the username is the same as a username already in data
   * store.
   */
  private void checkUserErrors(final String username)
    throws DuplicateUsernameException {
    if (userDetailsDao.hasUsername(username)) {
      throw new DuplicateUsernameException(username);
    }
  }

  @Transactional()
  public User updateUserPassword(User user, String newPassword) {
    MutableUserDetails userDetails = user.getUserDetails();
    userDetails.setPassword(newPassword);
    encodePassword(userDetails);
    userDao.save(user);
    return user;
  }

  @Override
  public User updateUserPassword(User user, String oldPassword, String newPassword) throws IncorrectPasswordException {
    /*
    Md5PasswordEncoder encoder = new Md5PasswordEncoder();
    String encodedOldPassword =
        this.passwordEncoder.encodePassword(oldPassword, this.saltSource.getSalt(user.getUserDetails()));

    if (user.getUserDetails().getPassword().equals(encodedOldPassword)) {
      return this.updateUserPassword(user, newPassword);
    } else {
      throw new IncorrectPasswordException();
    }
    */
    return null;
  }

  public List<User> retrieveAllUsers() {
    return userDao.getList();
  }

  public List<String> retrieveAllUsernames() {
    return userDao.retrieveAll("userDetails.username");
  }

  @Transactional(readOnly = true)
  public User retrieveById(Long userId) throws ObjectNotFoundException {
    return userDao.getById(userId);
  }

  @Transactional
  public void updateUser(User user) {
    userDao.save(user);
  }

  @Transactional()
  public List<User> retrieveByField(String field, String type, Object term, String classVar) {
    return userDao.retrieveByField(field, type, term, classVar);
  }

  /**
   * Given an array of fields and an array of values and classVar, retrieves a list of Users
   * @param fields an array of field names
   * @param types an array of values, the index of a value must line up with
   * the index in the field array
   *
   * e.g.
   * fields[0] = "firstname"
   * fields[1] = "lastname"
   *
   * values[0] = "Spongebob"
   * values[1] = "Squarepants"
   *
   * @param classVar 'studentUserDetails' or 'teacherUserDetails'
   * @return a list of Users that have matching values for the given fields
   */
  public List<User> retrieveByFields(String[] fields, String[] types, String classVar) {
    return userDao.retrieveByFields(fields, types, classVar);
  }

  @Override
  public User retrieveUserByUsername(String username) {
    if (username == null || username.isEmpty()) {
      return null;
    }
    try {
      return userDao.retrieveByUsername(username);
    } catch (EmptyResultDataAccessException e) {
      return null;
    }
  }

  /**
   * Get the User object given the reset password key
   * @param resetPasswordKey an alphanumeric string
   * @return a User object or null if there is no user with the given reset password key
   */
  @Transactional()
  public User retrieveByResetPasswordKey(String resetPasswordKey) {
    return userDao.retrieveByResetPasswordKey(resetPasswordKey);
  }

  public boolean isPasswordCorrect(User user, String password) {
    /*
    String hashedPassword = passwordEncoder.encodePassword(
        password, saltSource.getSalt(user.getUserDetails()));
    return hashedPassword.equals(user.getUserDetails().getPassword());
    */
    return false;
  }

}
