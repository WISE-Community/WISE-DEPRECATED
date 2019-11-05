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
package org.wise.portal.dao.authentication.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.wise.portal.dao.user.impl.HibernateUserDao;
import org.wise.portal.domain.authentication.Gender;
import org.wise.portal.domain.authentication.Schoollevel;
import org.wise.portal.domain.authentication.impl.PersistentUserDetails;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.junit.AbstractTransactionalDbTests;
import org.wise.portal.service.authentication.DuplicateUsernameException;
import org.wise.portal.service.user.UserService;

/**
 * @author Geoffrey Kwan
 */
@SpringBootTest
@RunWith(SpringRunner.class)
public class HibernateUserDetailsDaoTest extends AbstractTransactionalDbTests {

  @Autowired
  private HibernateUserDetailsDao userDetailsDao;

  @Autowired
  private HibernateUserDao userDao;
  
  @Autowired
  private UserService userService;

  @Before
  public void setUp() throws Exception {
    createTeacherUser("Mrs", "Puff", "MrsPuff", "Mrs. Puff", "boat", "Bikini Bottom",
        "Water State", "Pacific Ocean", "mrspuff@bikinibottom.com", "Boating School",
        Schoollevel.COLLEGE, "1234567890");
    createTeacherUser("Mr", "Krabs", "MrKrabs", "Mr. Krabs", "restaurant",
        "Bikini Bottom", "Water State", "Pacific Ocean", "mrkrabs@bikinibottom.com",
        "Krusty Krab", Schoollevel.HIGH_SCHOOL, "abcdefghij");
    createStudentUser("Spongebob", "Squarepants", "SpongebobS0101", "burger", 1, 1,
        Gender.MALE);
    createStudentUser("Patrick", "Star", "PatrickS0101", "rock", 1, 1, Gender.MALE);
  }

  private User createTeacherUser(String firstName, String lastName, String username,
        String displayName, String password, String city, String state, String country,
        String email, String schoolName, Schoollevel schoolLevel, String googleUserId)
        throws DuplicateUsernameException {
    TeacherUserDetails userDetails = new TeacherUserDetails();
    userDetails.setFirstname(firstName);
    userDetails.setLastname(lastName);
    userDetails.setUsername(username);
    userDetails.setDisplayname(displayName);
    userDetails.setPassword(password);
    userDetails.setCity(city);
    userDetails.setState(state);
    userDetails.setCountry(country);
    userDetails.setEmailAddress(email);
    userDetails.setSchoolname(schoolName);
    userDetails.setSchoollevel(schoolLevel);
    userDetails.setGoogleUserId(googleUserId);
    User user = userService.createUser(userDetails);
    userDao.save(user);
    return user;
  }

  private User createStudentUser(String firstName, String lastName, String  username, 
        String password, int birthMonth, int birthDay, Gender gender)
        throws DuplicateUsernameException {
    StudentUserDetails userDetails = new StudentUserDetails();
    userDetails.setFirstname(firstName);
    userDetails.setLastname(lastName);
    userDetails.setUsername(username);
    userDetails.setPassword(password);
    Calendar calendar = Calendar.getInstance();
    calendar.set(Calendar.MONTH, birthMonth - 1);
    calendar.set(Calendar.DAY_OF_MONTH, birthDay);
    userDetails.setBirthday(new Date(calendar.getTimeInMillis()));
    userDetails.setGender(gender);
    User user = userService.createUser(userDetails);
    userDao.save(user);
    return user;
  }

  @Test
  public void retrieveByName_WithNonExistingName_ShouldReturnNoUser() {
    assertNull(userDetailsDao.retrieveByName("Donatello"));
  }

  @Test
  public void retrieveByName_WithExistingTeacherName_ShouldReturnUser() {
    PersistentUserDetails userDetails = userDetailsDao.retrieveByName("MrsPuff");
    assertNotNull(userDetails);
    assertEquals("MrsPuff", userDetails.getUsername());
  }

  @Test
  public void retrieveByName_WithExistingStudentName_ShouldReturnUser() {
    PersistentUserDetails userDetails = userDetailsDao.retrieveByName("SpongebobS0101");
    assertNotNull(userDetails);
    assertEquals("SpongebobS0101", userDetails.getUsername());
  }

  @Test
  public void retrieveAllTeacherUsernames_WhenThereAreTeachers_ShouldReturnTeacherUsernames() {
    List<String> usernames = userDetailsDao.retrieveAllTeacherUsernames();
    assertEquals(4, usernames.size());
  }

  @Test
  public void retrieveAllStudentUsernames_WhenThereAreStudents_ShouldReturnStudentUsernames() {
    List<String> usernames = userDetailsDao.retrieveAllStudentUsernames();
    assertEquals(2, usernames.size());
  }

  @Test
  public void retrieveByGoogleUserId_WithNonExistingId_ShouldReturnNoUser() {
    assertNull(userDetailsDao.retrieveByGoogleUserId("0000000000"));
  }

  @Test
  public void retrieveByGoogleUserId_WithExistingId_ShouldReturnUser() {
    PersistentUserDetails userDetails = userDetailsDao.retrieveByGoogleUserId("1234567890");
    assertNotNull(userDetails);
    assertEquals("MrsPuff", userDetails.getUsername());
  }

  @Test
  public void hasUsername_WithNonExistingUsername_ShouldReturnFalse() {
    assertFalse(userDetailsDao.hasUsername("Donatello"));
  }

  @Test
  public void hasUsername_WithExistingTeacherUsername_ShouldReturnTrue() {
    assertTrue(userDetailsDao.hasUsername("MrKrabs"));
  }

  @Test
  public void hasUsername_WithExistingStudentUsername_ShouldReturnTrue() {
    assertTrue(userDetailsDao.hasUsername("PatrickS0101"));
  }
}