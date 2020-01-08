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
package org.wise.portal.dao.user.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.context.junit4.SpringRunner;
import org.wise.portal.domain.authentication.Gender;
import org.wise.portal.domain.authentication.Schoollevel;
import org.wise.portal.domain.user.User;
import org.wise.portal.junit.AbstractTransactionalDbTests;

/**
 * @author Geoffrey Kwan
 */
@SpringBootTest
@RunWith(SpringRunner.class)
public class HibernateUserDaoTest extends AbstractTransactionalDbTests {

  private User teacher1, teacher2, student1, student2;

  @Autowired
  private HibernateUserDao userDao;

  @Before
  public void setUp() throws Exception {
    teacher1 = createTeacherUser("Mrs", "Puff", "MrsPuff", "Mrs. Puff", "boat", "Bikini Bottom",
        "Water State", "Pacific Ocean", "mrspuff@bikinibottom.com", "Boating School",
        Schoollevel.COLLEGE, "1234567890");
    teacher2 = createTeacherUser("Mr", "Krabs", "MrKrabs", "Mr. Krabs", "restaurant",
        "Bikini Bottom", "Water State", "Pacific Ocean", "mrkrabs@bikinibottom.com",
        "Krusty Krab", Schoollevel.HIGH_SCHOOL, "abcdefghij");
    student1 = createStudentUser("Spongebob", "Squarepants", "SpongebobS0101", "burger", 1, 1,
        Gender.MALE);
    student2 = createStudentUser("Patrick", "Star", "PatrickS0101", "rock", 1, 1, Gender.MALE);
  }

  @Test
  public void retrieveByUserDetails_ShouldReturnTheUser() {
    UserDetails userDetails = teacher1.getUserDetails();
    User user = userDao.retrieveByUserDetails(userDetails);
    assertEquals(teacher1.getId(), user.getId());
  }

  @Test
  public void retrieveAllUsernames_ShouldReturnAllUsernames() {
    List<String> usernames = userDao.retrieveAllUsernames();
    assertEquals(6, usernames.size());
    assertTrue(usernames.contains("admin"));
    assertTrue(usernames.contains("preview"));
    assertTrue(usernames.contains("MrsPuff"));
    assertTrue(usernames.contains("MrKrabs"));
    assertTrue(usernames.contains("SpongebobS0101"));
    assertTrue(usernames.contains("PatrickS0101"));
  }

  @Test
  public void retrieveByUsername_WithExistingTeacherUsername_ShouldReturnTeacher() {
    User user = userDao.retrieveByUsername("MrsPuff");
    UserDetails userDetails = user.getUserDetails();
    assertEquals("MrsPuff", userDetails.getUsername());
  }

  @Test
  public void retrieveByUsername_WithExistingStudentUsername_ShouldReturnStudent() {
    User user = userDao.retrieveByUsername("SpongebobS0101");
    UserDetails userDetails = user.getUserDetails();
    assertEquals("SpongebobS0101", userDetails.getUsername());
  }

  @Test
  public void retrieveByEmailAddress_WithExistingEmail_ShouldReturnTheUser() {
    List<User> users = userDao.retrieveByEmailAddress("mrspuff@bikinibottom.com");
    assertEquals(1, users.size());
    assertEquals("MrsPuff", users.get(0).getUserDetails().getUsername());
  }

  @Test
  public void retrieveByGoogleUserId_WithExistingGoogleUserId_ShouldReturnTheUser() {
    User user = userDao.retrieveByGoogleUserId("1234567890");
    assertEquals("MrsPuff", user.getUserDetails().getUsername());
  }

  @Test
  public void retrieveDisabledUsers_WhenThereAreNoDisabledUsers_ShouldReturnNoUsers() {
    List<User> users = userDao.retrieveDisabledUsers();
    assertEquals(0, users.size());
  }

  @Test
  public void retrieveDisabledUsers_WhenThereIsOneDisabledUser_ShouldReturnOneUser() {
    teacher1.getUserDetails().setEnabled(false);
    List<User> users = userDao.retrieveDisabledUsers();
    assertEquals(1, users.size());
  }

  @Test
  public void retrieveAllTeachers_ShouldReturnAllTeachers() {
    List<User> users = userDao.retrieveAllTeachers();
    assertEquals(4, users.size());
  }

  @Test
  public void retrieveTeacherById_WithTeacherId_ShouldReturnTheTeacher() {
    User user = userDao.retrieveTeacherById(teacher1.getId());
    assertEquals(teacher1.getUserDetails().getUsername(),
        user.getUserDetails().getUsername());
  }

  @Test
  public void retrieveTeacherById_WithStudentId_ShouldNotReturnAnyUser() {
    User user = userDao.retrieveTeacherById(student1.getId());
    assertNull(user);
  }

  @Test
  public void retrieveTeachersByFirstName_WithNonExistingTeacherFirstName_ShouldNotReturnAnyUser() {
    List<User> users = userDao.retrieveTeachersByFirstName("Ann");
    assertEquals(0, users.size());
  }

  @Test
  public void retrieveTeachersByFirstName_WithExistingTeacherFirstName_ShouldSucceed() {
    List<User> users = userDao.retrieveTeachersByFirstName("Mrs");
    assertEquals(1, users.size());
  }

  @Test
  public void retrieveTeachersByLastName_WithNonExistingTeacherLastName_ShouldNotReturnAnyUser() {
    List<User> users = userDao.retrieveTeachersByLastName("Doe");
    assertEquals(0, users.size());
  }

  @Test
  public void retrieveTeachersByLastName_WithExistingTeacherLastName_ShouldSucceed() {
    List<User> users = userDao.retrieveTeachersByLastName("Puff");
    assertEquals(1, users.size());
  }

  @Test
  public void retrieveTeachersByUsername_WithNonExistingTeacherUsername_ShouldNotReturnAnyUser() {
    User user = userDao.retrieveTeacherByUsername("AnnDoe");
    assertNull(user);
  }

  @Test
  public void retrieveTeacherByUsername_WithExistingTeacherUsername_ShouldSucceed() {
    User user = userDao.retrieveTeacherByUsername("MrsPuff");
    assertEquals(teacher1.getId(), user.getId());
  }

  @Test
  public void retrieveTeachersByDisplayName_WithNonExistingDisplayName_ShouldNotReturnAnyUser() {
    List<User> users = userDao.retrieveTeachersByDisplayName("Ann Doe");
    assertEquals(0, users.size());
  }

  @Test
  public void retrieveTeachersByDisplayName_WithExistingDisplayName_ShouldSucceed() {
    List<User> users = userDao.retrieveTeachersByDisplayName("Mrs. Puff");
    assertEquals(1, users.size());
  }

  @Test
  public void retrieveTeachersByCity_WithNonExistingCity_ShouldNotReturnAnyUser() {
    List<User> users = userDao.retrieveTeachersByCity("Alameda");
    assertEquals(0, users.size());
  }

  @Test
  public void retrieveTeachersByCity_WithExistingCity_ShouldSucceed() {
    List<User> users = userDao.retrieveTeachersByCity("Bikini Bottom");
    assertEquals(2, users.size());
  }

  @Test
  public void retrieveTeachersByState_WithNonExistingState_ShouldNotReturnAnyUser() {
    List<User> users = userDao.retrieveTeachersByState("New York");
    assertEquals(0, users.size());
  }

  @Test
  public void retrieveTeachersByState_WithExistingState_ShouldSucceed() {
    List<User> users = userDao.retrieveTeachersByState("Water State");
    assertEquals(2, users.size());
  }

  @Test
  public void retrieveTeachersByCountry_WithNonExistingCountry_ShouldNotReturnAnyUser() {
    List<User> users = userDao.retrieveTeachersByCountry("Atlantic Ocean");
    assertEquals(0, users.size());
  }

  @Test
  public void retrieveTeachersByCountry_WithExistingCountry_ShouldSucceed() {
    List<User> users = userDao.retrieveTeachersByCountry("Pacific Ocean");
    assertEquals(2, users.size());
  }

  @Test
  public void retrieveTeachersBySchoolName_WithNonExistingSchoolName_ShouldNotReturnAnyUser() {
    List<User> users = userDao.retrieveTeachersBySchoolName("Fishing School");
    assertEquals(0, users.size());
  }

  @Test
  public void retrieveTeachersBySchoolName_WithExistingSchoolName_ShouldSucceed() {
    List<User> users = userDao.retrieveTeachersBySchoolName("Boating School");
    assertEquals(1, users.size());
  }

  @Test
  public void retrieveTeachersByEmail_WithNonExistingEmail_ShouldNotReturnAnyUser() {
    List<User> users = userDao.retrieveTeachersByEmail("ann@bikinibottom.com");
    assertEquals(0, users.size());
  }

  @Test
  public void retrieveTeachersByEmail_WithExistingEmail_ShouldSucceed() {
    List<User> users = userDao.retrieveTeachersByEmail("mrspuff@bikinibottom.com");
    assertEquals(1, users.size());
  }

  @Test
  public void retrieveTeachersBySchoolLevel_WithNotUsedSchoolLevel_ShouldNotReturnAnyUser() {
    List<User> users = userDao.retrieveTeachersBySchoolLevel(
        Schoollevel.ELEMENTARY_SCHOOL.toString());
    assertEquals(0, users.size());
  }

  @Test
  public void retrieveTeachersBySchoolLevel_WithExistingSchoolLevel_ShouldSucceed() {
    List<User> users = userDao.retrieveTeachersBySchoolLevel(Schoollevel.COLLEGE.toString());
    assertEquals(3, users.size());
  }

  @Test
  public void retrieveAllStudents_ShouldSucceed() {
    List<User> users = userDao.retrieveAllStudents();
    assertEquals(2, users.size());
  }

  @Test
  public void retrieveStudentById_WithTeacherId_ShouldNotReturnAnyUser() {
    User user = userDao.retrieveStudentById(4L);
    assertNull(user);
  }

  @Test
  public void retrieveStudentsById_WithStudentId_ShouldReturnUser() {
    User user = userDao.retrieveStudentById(student1.getId());
    assertEquals(student1.getUserDetails().getUsername(),
        user.getUserDetails().getUsername());
  }

  @Test
  public void retrieveStudentsByFirstName_WithNonExistingFirstName_ShouldNotReturnAnyUser() {
    List<User> users = userDao.retrieveStudentsByFirstName("Bill");
    assertEquals(0, users.size());
  }

  @Test
  public void retrieveStudentsByFirstName_WithExistingFirstName_ShouldReturnUser() {
    List<User> users = userDao.retrieveStudentsByFirstName("Spongebob");
    assertEquals(1, users.size());
  }

  @Test
  public void retrieveStudentsByLastName_WithNonExistingLastName_ShouldNotReturnAnyUser() {
    List<User> users = userDao.retrieveStudentsByLastName("Doe");
    assertEquals(0, users.size());
  }

  @Test
  public void retrieveStudentsByLastName_WithExistingLastName_ShouldReturnUser() {
    List<User> users = userDao.retrieveStudentsByLastName("Squarepants");
    assertEquals(1, users.size());
  }

  @Test
  public void retrieveStudentByUsername_WithNonExistingUsername_ShouldNotReturnAnyUser() {
    User user = userDao.retrieveStudentByUsername("BillD0101");
    assertNull(user);
  }

  @Test
  public void retrieveStudentsByUsername_WithExistingUsername_ShouldReturnUser() {
    User user = userDao.retrieveStudentByUsername("SpongebobS0101");
    assertEquals(student1.getId(), user.getId());
  }

  @Test
  public void retrieveStudentsByGender_WithNotUsedGender_ShouldNotReturnAnyUser() {
    List<User> users = userDao.retrieveStudentsByGender("female");
    assertEquals(0, users.size());
  }

  @Test
  public void retrieveStudentsByGender_WithUsedGender_ShouldReturnUser() {
    List<User> users = userDao.retrieveStudentsByGender("male");
    assertEquals(2, users.size());
  }

  @Test
  public void retrieveStudentsByNameAndBirthday_WithNonExistingBirthday_ShouldNotReturnAnyUser() {
    List<User> users = userDao.retrieveStudentsByNameAndBirthday("Spongebob", "Squarepants", 1, 2);
    assertEquals(0, users.size());
  }

  @Test
  public void retrieveStudentsByNameAndBirthday_WithExistingBirthday_ShouldReturnUser() {
    List<User> users = userDao.retrieveStudentsByNameAndBirthday("Spongebob", "Squarepants", 1, 1);
    assertEquals(1, users.size());
  }

  @Test
  public void retrieveTeachersByName_WithNonExistingName_ShouldNotReturnAnyUser() {
    List<User> users = userDao.retrieveTeachersByName("Master", "Splinter");
    assertEquals(0, users.size());
  }

  @Test
  public void retrieveTeachersByName_WithExistingName_ShouldReturnUser() {
    List<User> users = userDao.retrieveTeachersByName("Mrs", "Puff");
    assertEquals(1, users.size());
  }

  @Test
  public void retrieveTeachersByResetPasswordKey_WithExistingResetPasswordKey_ShouldReturnUser() {
    teacher1.getUserDetails().setResetPasswordKey("qwerty");
    User user = userDao.retrieveByResetPasswordKey("qwerty");
    assertEquals("MrsPuff", user.getUserDetails().getUsername());
  }

  @Test
  public void retrieveTeacherUsersJoinedSinceYesterday_WithNewRecentTeachers_ShouldReturnUsers() {
    List<User> users = userDao.retrieveTeacherUsersJoinedSinceYesterday();
    assertEquals(2, users.size());
  }

  @Test
  public void retrieveTeacherUsersWhoLoggedInSinceYesterday_NoRecentLogins_ShouldReturnNoUsers() {
    List<User> users = userDao.retrieveTeacherUsersWhoLoggedInSinceYesterday();
    assertEquals(0, users.size());
  }

  @Test
  public void retrieveTeacherUsersWhoLoggedInSinceYesterday_WithRecentLogin_ShouldReturnUsers() {
    teacher1.getUserDetails().setLastLoginTime(new Date());
    List<User> users = userDao.retrieveTeacherUsersWhoLoggedInSinceYesterday();
    assertEquals(1, users.size());
  }

  @Test
  public void retrieveTeacherUsersWhoLoggedInToday_WithRecentLogin_ShouldReturnUsers() {
    teacher1.getUserDetails().setLastLoginTime(new Date());
    teacher2.getUserDetails().setLastLoginTime(new Date());
    List<User> users = userDao.retrieveTeacherUsersWhoLoggedInToday();
    assertEquals(2, users.size());
  }

  @Test
  public void retrieveTeacherUsersWhoLoggedInThisWeek_WithRecentLogin_ShouldReturnUsers() {
    teacher1.getUserDetails().setLastLoginTime(getDateXDaysFromNow(-8));
    Calendar c = Calendar.getInstance();
    c.set(Calendar.DAY_OF_WEEK, 1);
    teacher2.getUserDetails().setLastLoginTime(new Date(c.getTimeInMillis() + 1000));
    List<User> users = userDao.retrieveTeacherUsersWhoLoggedInThisWeek();
    assertEquals(1, users.size());
  }

  @Test
  public void retrieveTeacherUsersWhoLoggedInThisMonth_WithRecentLogin_ShouldReturnUsers() {
    teacher1.getUserDetails().setLastLoginTime(getDateXDaysFromNow(-32));
    Calendar c = Calendar.getInstance();
    c.set(Calendar.DAY_OF_MONTH, 1);
    teacher2.getUserDetails().setLastLoginTime(new Date(c.getTimeInMillis() + 1000));
    List<User> users = userDao.retrieveTeacherUsersWhoLoggedInThisMonth();
    assertEquals(1, users.size());
  }

  @Test
  public void retrieveTeacherUsersWhoLoggedInThisYear_WithRecentLogin_ShouldReturnUsers() {
    teacher1.getUserDetails().setLastLoginTime(getDateXDaysFromNow(-366));
    Calendar c = Calendar.getInstance();
    c.set(Calendar.DAY_OF_YEAR, 1);
    teacher2.getUserDetails().setLastLoginTime(new Date(c.getTimeInMillis() + 1000));
    List<User> users = userDao.retrieveTeacherUsersWhoLoggedInThisYear();
    assertEquals(1, users.size());
  }

  @Test
  public void retrieveStudentUsersWhoLoggedInSinceYesterday_WithRecentLogin_ShouldReturnUsers() {
    student1.getUserDetails().setLastLoginTime(new Date());
    List<User> users = userDao.retrieveStudentUsersWhoLoggedInSinceYesterday();
    assertEquals(1, users.size());
  }

  @Test
  public void retrieveStudentUsersWhoLoggedInToday_WithRecentLogin_ShouldReturnUsers() {
    student1.getUserDetails().setLastLoginTime(new Date());
    student2.getUserDetails().setLastLoginTime(new Date());
    List<User> users = userDao.retrieveStudentUsersWhoLoggedInToday();
    assertEquals(2, users.size());
  }

  @Test
  public void retrieveStudentUsersWhoLoggedInThisWeek_WithRecentLogin_ShouldReturnUsers() {
    student1.getUserDetails().setLastLoginTime(getDateXDaysFromNow(-8));
    Calendar c = Calendar.getInstance();
    c.set(Calendar.DAY_OF_WEEK, 1);
    student2.getUserDetails().setLastLoginTime(new Date(c.getTimeInMillis() + 1000));
    List<User> users = userDao.retrieveStudentUsersWhoLoggedInThisWeek();
    assertEquals(1, users.size());
  }

  @Test
  public void retrieveStudentUsersWhoLoggedInThisMonth_WithRecentLogin_ShouldReturnUsers() {
    student1.getUserDetails().setLastLoginTime(getDateXDaysFromNow(-32));
    Calendar c = Calendar.getInstance();
    c.set(Calendar.DAY_OF_MONTH, 1);
    student2.getUserDetails().setLastLoginTime(new Date(c.getTimeInMillis() + 1000));
    List<User> users = userDao.retrieveStudentUsersWhoLoggedInThisMonth();
    assertEquals(1, users.size());
  }

  @Test
  public void retrieveStudentUsersWhoLoggedInThisYear_WithRecentLogin_ShouldReturnUsers() {
    student1.getUserDetails().setLastLoginTime(getDateXDaysFromNow(-366));
    Calendar c = Calendar.getInstance();
    c.set(Calendar.DAY_OF_YEAR, 1);
    student2.getUserDetails().setLastLoginTime(new Date(c.getTimeInMillis() + 1000));
    List<User> users = userDao.retrieveStudentUsersWhoLoggedInThisYear();
    assertEquals(1, users.size());
  }
}