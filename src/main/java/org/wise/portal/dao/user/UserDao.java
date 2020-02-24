/**
 * Copyright (c) 2006-2015 Encore Research Group, University of Toronto
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
package org.wise.portal.dao.user;

import java.util.List;

import org.springframework.security.core.userdetails.UserDetails;
import org.wise.portal.dao.SimpleDao;
import org.wise.portal.domain.user.User;

/**
 * @author Cynick Young
 */
public interface UserDao<T extends User> extends SimpleDao<T> {

  T retrieveByUserDetails(UserDetails userDetails);
  T retrieveByUsername(String username);
  List<T> retrieveDisabledUsers();
  List<T> retrieveByEmailAddress(String emailAddress);
  T retrieveByGoogleUserId(String googleUserId);
  List<String> retrieveAllUsernames();
  T retrieveByResetPasswordKey(String resetPasswordKey);
  List<User> retrieveStudentsByNameAndBirthday(String firstName, String lastName,
      Integer birthMonth, Integer birthDay);
  List<User> retrieveTeachersByName(String firstName, String lastName);
  List<User> retrieveAllTeachers();
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
  List<User> retrieveAllStudents();
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
