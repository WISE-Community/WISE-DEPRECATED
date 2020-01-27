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
package org.wise.portal.service.user;

import java.util.List;

import org.springframework.security.core.userdetails.UserDetails;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.exception.IncorrectPasswordException;
import org.wise.portal.service.authentication.DuplicateUsernameException;

/**
 * Represents the set of operations on a user.
 *
 * @author Cynick Young
 * @author Laurel Williams
 * @author Hiroki Terashima
 */
public interface UserService {

  /**
   * Given a MutableUserDetails object with a unique name, creates a new user. If username is
   * not unique throws a DuplicateUsernameException.
   * @param userDetails A user object.
   * @return A reference to a <code>User</code> object
   * @throws DuplicateUsernameException If username is not unique.
   */
  User createUser(MutableUserDetails userDetails) throws DuplicateUsernameException;

  /**
   * Retrieve user with the given user details.
   * @param userDetails that has valid authentication credentials
   * @return <code>User</code> associated with the given user details
   */
  User retrieveUser(UserDetails userDetails);

  /**
   * Retrieve user with the give username
   * @param username
   * @return <code>User</code> associated with the given username
   */
  User retrieveUserByUsername(String username);

  /**
   * Retrieve users with the given emailAddress
   * @param emailAddress
   * @return <code>Users</code> associated with the given emailaddress
   */
  List<User> retrieveUserByEmailAddress(String emailAddress);

  /**
   * Retrieve user with the given google user id.
   * @param googleUserId
   * @return <code>User</code> with the given google user id.
   */
  User retrieveUserByGoogleUserId(String googleUserId);

  /**
   * Retrieve a list of users whose accounts have been disabled
   * @return <code>Users</code> whose accounts have been disabled
   */
  List<User> retrieveDisabledUsers();

  /**
   * Encodes a new password and updates a user in the persistent data store.
   * @param user The user that you want to update
   * @param newPassword The UN-ENCODED new password that you want to put in place for
   * this user
   * @return The user with the newly encoded password.
   */
  User updateUserPassword(final User user, String newPassword);

  User updateUserPassword(User user, String oldPassword, String newPassword) throws IncorrectPasswordException;

  /**
   * Gets all users from persistent data store.
   * Note: this is server-intensive. Consider using retrieveAllUsernames() instead
   *
   * @return a Set of all users.
   */
  List<User> retrieveAllUsers();

  /**
   * @return a list of all usernames in the data store.
   */
  List<String> retrieveAllUsernames();

  /**
   * Retrieves User domain object using unique userId
   * @param userId <code>Long</code> userId to use for lookup
   * @return <code>User</code> the User object with the given userId
   * @throws ObjectNotFoundException when userId cannot be used to find the existing user
   */
  User retrieveById(Long userId) throws ObjectNotFoundException;

  /**
   * Updates the existing <code>MutableUserDetails</code> object
   */
  void updateUser(User user);

  /**
   * Get the User object given the reset password key
   * @param resetPasswordKey an alphanumeric string
   * @return a User object or null if there is no user with the given reset password key
   */
  User retrieveByResetPasswordKey(String resetPasswordKey);

  /**
   * Assigns the specified role to the user. Does not save to database
   * @param userDetails
   * @param role
   */
  void assignRole(MutableUserDetails userDetails, final String role);

  /**
   * Returns true iff the password (non-hashed) is correct for the user
   * @param user WISE user
   * @param password password to check, un-hashed
   * @return true iff the password is correct.
   */
  boolean isPasswordCorrect(User user, String password);

  List<User> retrieveStudentsByNameAndBirthday(String firstName, String lastName,
      Integer birthMonth, Integer birthDay);
  List<User> retrieveTeachersByName(String firstName, String lastName);
  User retrieveTeacherById(Long id);
  List<User> retrieveTeachersByFirstName(String firstName);
  List<User> retrieveTeachersByLastName(String lastName);
  User retrieveTeacherByUsername(String username);
  List<User> retrieveTeachersByDisplayName(String displayName);
  List<User> retrieveTeachersByCity(String city);
  List<User> retrieveTeachersByState(String state);
  List<User> retrieveTeachersByCountry(String country);
  List<User> retrieveTeachersBySchoolName(String schoolName);
  List<User> retrieveTeachersBySchoolLevel(String schoolLevel);
  List<User> retrieveTeachersByEmail(String email);
  User retrieveStudentById(Long id);
  List<User> retrieveStudentsByFirstName(String firstName);
  List<User> retrieveStudentsByLastName(String lastName);
  User retrieveStudentByUsername(String username);
  List<User> retrieveStudentsByGender(String gender);
  List<User> retrieveTeacherUsersJoinedSinceYesterday();
  List<User> retrieveStudentUsersJoinedSinceYesterday();
  List<User> retrieveTeacherUsersWhoLoggedInSinceYesterday();
  List<User> retrieveTeacherUsersWhoLoggedInToday();
  List<User> retrieveTeacherUsersWhoLoggedInThisWeek();
  List<User> retrieveTeacherUsersWhoLoggedInThisMonth();
  List<User> retrieveTeacherUsersWhoLoggedInThisYear();
  List<User> retrieveStudentUsersWhoLoggedInSinceYesterday();
  List<User> retrieveStudentUsersWhoLoggedInToday();
  List<User> retrieveStudentUsersWhoLoggedInThisWeek();
  List<User> retrieveStudentUsersWhoLoggedInThisMonth();
  List<User> retrieveStudentUsersWhoLoggedInThisYear();
}
