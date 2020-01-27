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
package org.wise.portal.dao.user.impl;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.hibernate.Session;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.user.UserDao;
import org.wise.portal.domain.authentication.Gender;
import org.wise.portal.domain.authentication.Schoollevel;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;

/**
 * @author Cynick Young
 */
@Repository
public class HibernateUserDao extends AbstractHibernateDao<User> implements UserDao<User> {

  @PersistenceContext
  private EntityManager entityManager;

  private static final String FIND_ALL_QUERY = "from UserImpl";

  @Override
  protected String getFindAllQuery() {
    return FIND_ALL_QUERY;
  }

  @Override
  protected Class<UserImpl> getDataObjectClass() {
    return UserImpl.class;
  }

  private CriteriaBuilder getCriteriaBuilder() {
    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    return session.getCriteriaBuilder();
  }

  public User retrieveByUserDetails(UserDetails userDetails) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<UserImpl> cq = cb.createQuery(UserImpl.class);
    Root<UserImpl> userRoot = cq.from(UserImpl.class);
    cq.select(userRoot).where(cb.equal(userRoot.get("userDetails"), userDetails));
    TypedQuery<UserImpl> query = entityManager.createQuery(cq);
    return query.getResultStream().findFirst().orElse(null);
  }

  public List<String> retrieveAllUsernames() {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<String> cq = cb.createQuery(String.class);
    Root<UserImpl> userRoot = cq.from(UserImpl.class);
    cq.select(userRoot.get("userDetails").get("username"));
    TypedQuery<String> query = entityManager.createQuery(cq);
    return query.getResultList();
  }

  public User retrieveByUsername(String username) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<UserImpl> cq = cb.createQuery(UserImpl.class);
    Root<UserImpl> userRoot = cq.from(UserImpl.class);
    cq.select(userRoot).where(cb.equal(userRoot.get("userDetails").get("username"), username));
    TypedQuery<UserImpl> query = entityManager.createQuery(cq);
    return query.getResultStream().findFirst().orElse(null);
  }

  @SuppressWarnings("unchecked")
  public List<User> retrieveByEmailAddress(String emailAddress) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<UserImpl> cq = cb.createQuery(UserImpl.class);
    Root<UserImpl> userRoot = cq.from(UserImpl.class);
    cq.select(userRoot).where(
        cb.equal(userRoot.get("userDetails").get("emailAddress"), emailAddress));
    TypedQuery<UserImpl> query = entityManager.createQuery(cq);
    return (List<User>) (Object) query.getResultList();
  }

  public User retrieveByGoogleUserId(String googleUserId) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<UserImpl> cq = cb.createQuery(UserImpl.class);
    Root<UserImpl> userRoot = cq.from(UserImpl.class);
    cq.select(userRoot).where(
        cb.equal(userRoot.get("userDetails").get("googleUserId"), googleUserId));
    TypedQuery<UserImpl> query = entityManager.createQuery(cq);
    return query.getResultStream().findFirst().orElse(null);
  }

  @SuppressWarnings("unchecked")
  public List<User> retrieveDisabledUsers() {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<UserImpl> cq = cb.createQuery(UserImpl.class);
    Root<UserImpl> userRoot = cq.from(UserImpl.class);
    cq.select(userRoot).where(cb.isFalse(userRoot.get("userDetails").get("enabled")));
    TypedQuery<UserImpl> query = entityManager.createQuery(cq);
    return (List<User>) (Object) query.getResultList();
  }

  @SuppressWarnings("unchecked")
  public List<User> retrieveAllTeachers() {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<UserImpl> cq = cb.createQuery(UserImpl.class);
    Root<UserImpl> userRoot = cq.from(UserImpl.class);
    Root<TeacherUserDetails> teacherUserDetailsRoot = cq.from(TeacherUserDetails.class);
    List<Predicate> predicates = new ArrayList<>();
    predicates.add(cb.equal(
        userRoot.get("userDetails").get("id"), teacherUserDetailsRoot.get("id")));
    cq.select(userRoot).where(predicates.toArray(new Predicate[predicates.size()]));
    TypedQuery<UserImpl> query = entityManager.createQuery(cq);
    return (List<User>) (Object) query.getResultList();
  }

  public User retrieveTeacherById(Long id) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<UserImpl> cq = cb.createQuery(UserImpl.class);
    Root<UserImpl> userRoot = cq.from(UserImpl.class);
    Root<TeacherUserDetails> teacherUserDetailsRoot = cq.from(TeacherUserDetails.class);
    List<Predicate> predicates = new ArrayList<>();
    predicates.add(cb.equal(userRoot.get("id"), id));
    predicates.add(cb.equal(
        userRoot.get("userDetails").get("id"), teacherUserDetailsRoot.get("id")));
    cq.select(userRoot).where(predicates.toArray(new Predicate[predicates.size()]));
    TypedQuery<UserImpl> query = entityManager.createQuery(cq);
    return query.getResultStream().findFirst().orElse(null);
  }

  public List<User> retrieveTeachersByFirstName(String firstName) {
    return retrieveTeachersByFieldValue("firstname", firstName);
  }

  public List<User> retrieveTeachersByLastName(String lastName) {
    return retrieveTeachersByFieldValue("lastname", lastName);
  }

  public User retrieveTeacherByUsername(String username) {
    List<User> resultList = retrieveTeachersByFieldValue("username", username);
    return resultList.isEmpty() ? null : resultList.get(0);
  }

  public List<User> retrieveTeachersByDisplayName(String displayName) {
    return retrieveTeachersByFieldValue("displayname", displayName);
  }

  public List<User> retrieveTeachersByCity(String city) {
    return retrieveTeachersByFieldValue("city", city);
  }

  public List<User> retrieveTeachersByState(String state) {
    return retrieveTeachersByFieldValue("state", state);
  }

  public List<User> retrieveTeachersByCountry(String country) {
    return retrieveTeachersByFieldValue("country", country);
  }

  public List<User> retrieveTeachersBySchoolName(String schoolName) {
    return retrieveTeachersByFieldValue("schoolname", schoolName);
  }

  public List<User> retrieveTeachersByEmail(String emailAddress) {
    return retrieveTeachersByFieldValue("emailAddress", emailAddress);
  }

  @SuppressWarnings("unchecked")
  private List<User> retrieveTeachersByFieldValue(String field, String value) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<UserImpl> cq = cb.createQuery(UserImpl.class);
    Root<UserImpl> userRoot = cq.from(UserImpl.class);
    Root<TeacherUserDetails> teacherUserDetailsRoot = cq.from(TeacherUserDetails.class);
    List<Predicate> predicates = new ArrayList<>();
    predicates.add(cb.equal(teacherUserDetailsRoot.get(field), value));
    predicates.add(cb.equal(
        userRoot.get("userDetails").get("id"), teacherUserDetailsRoot.get("id")));
    cq.select(userRoot).where(predicates.toArray(new Predicate[predicates.size()]));
    TypedQuery<UserImpl> query = entityManager.createQuery(cq);
    return (List<User>) (Object) query.getResultList();
  }

  @SuppressWarnings("unchecked")
  public List<User> retrieveTeachersBySchoolLevel(String schoolLevel) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<UserImpl> cq = cb.createQuery(UserImpl.class);
    Root<UserImpl> userRoot = cq.from(UserImpl.class);
    Root<TeacherUserDetails> teacherUserDetailsRoot = cq.from(TeacherUserDetails.class);
    List<Predicate> predicates = new ArrayList<>();
    predicates.add(cb.equal(teacherUserDetailsRoot.get("schoollevel"), getLevel(schoolLevel)));
    predicates.add(cb.equal(
        userRoot.get("userDetails").get("id"), teacherUserDetailsRoot.get("id")));
    cq.select(userRoot).where(predicates.toArray(new Predicate[predicates.size()]));
    TypedQuery<UserImpl> query = entityManager.createQuery(cq);
    return (List<User>) (Object) query.getResultList();
  }

  private Schoollevel getLevel(String level) {
    for (Schoollevel schoolLevel : Schoollevel.values()) {
      if (schoolLevel.toString().toUpperCase().contains(level.toUpperCase())) {
        return schoolLevel;
      }
    }
    return Schoollevel.OTHER;
  }

  @SuppressWarnings("unchecked")
  public List<User> retrieveAllStudents() {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<UserImpl> cq = cb.createQuery(UserImpl.class);
    Root<UserImpl> userRoot = cq.from(UserImpl.class);
    Root<StudentUserDetails> studentUserDetailsRoot = cq.from(StudentUserDetails.class);
    List<Predicate> predicates = new ArrayList<>();
    predicates.add(cb.equal(
        userRoot.get("userDetails").get("id"), studentUserDetailsRoot.get("id")));
    cq.select(userRoot).where(predicates.toArray(new Predicate[predicates.size()]));
    TypedQuery<UserImpl> query = entityManager.createQuery(cq);
    return (List<User>) (Object) query.getResultList();
  }

  public User retrieveStudentById(Long id) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<UserImpl> cq = cb.createQuery(UserImpl.class);
    Root<UserImpl> userRoot = cq.from(UserImpl.class);
    Root<StudentUserDetails> studentUserDetailsRoot = cq.from(StudentUserDetails.class);
    List<Predicate> predicates = new ArrayList<>();
    predicates.add(cb.equal(userRoot.get("id"), id));
    predicates.add(cb.equal(
        userRoot.get("userDetails").get("id"), studentUserDetailsRoot.get("id")));
    cq.select(userRoot).where(predicates.toArray(new Predicate[predicates.size()]));
    TypedQuery<UserImpl> query = entityManager.createQuery(cq);
    return query.getResultStream().findFirst().orElse(null);
  }

  public List<User> retrieveStudentsByFirstName(String firstName) {
    return retrieveStudentsByFieldValue("firstname", firstName);
  }

  public List<User> retrieveStudentsByLastName(String lastName) {
    return retrieveStudentsByFieldValue("lastname", lastName);
  }

  public User retrieveStudentByUsername(String username) {
    List<User> resultList = retrieveStudentsByFieldValue("username", username);
    return resultList.isEmpty() ? null : resultList.get(0);
  }

  @SuppressWarnings("unchecked")
  private List<User> retrieveStudentsByFieldValue(String field, String value) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<UserImpl> cq = cb.createQuery(UserImpl.class);
    Root<UserImpl> userRoot = cq.from(UserImpl.class);
    Root<StudentUserDetails> studentUserDetailsRoot = cq.from(StudentUserDetails.class);
    List<Predicate> predicates = new ArrayList<>();
    predicates.add(cb.equal(studentUserDetailsRoot.get(field), value));
    predicates.add(cb.equal(
        userRoot.get("userDetails").get("id"), studentUserDetailsRoot.get("id")));
    cq.select(userRoot).where(predicates.toArray(new Predicate[predicates.size()]));
    TypedQuery<UserImpl> query = entityManager.createQuery(cq);
    return (List<User>) (Object) query.getResultList();
  }

  @SuppressWarnings("unchecked")
  public List<User> retrieveStudentsByGender(String gender) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<UserImpl> cq = cb.createQuery(UserImpl.class);
    Root<UserImpl> userRoot = cq.from(UserImpl.class);
    Root<StudentUserDetails> studentUserDetailsRoot = cq.from(StudentUserDetails.class);
    List<Predicate> predicates = new ArrayList<>();
    predicates.add(cb.equal(
        studentUserDetailsRoot.get("gender"), Gender.valueOf(gender.toUpperCase())));
    predicates.add(cb.equal(
        userRoot.get("userDetails").get("id"), studentUserDetailsRoot.get("id")));
    cq.select(userRoot).where(predicates.toArray(new Predicate[predicates.size()]));
    TypedQuery<UserImpl> query = entityManager.createQuery(cq);
    return (List<User>) (Object) query.getResultList();
  }

  @SuppressWarnings("unchecked")
  public List<User> retrieveStudentsByNameAndBirthday(String firstName, String lastName,
      Integer birthMonth, Integer birthDay) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<UserImpl> cq = cb.createQuery(UserImpl.class);
    Root<UserImpl> userRoot = cq.from(UserImpl.class);
    Root<StudentUserDetails> studentUserDetailsRoot = cq.from(StudentUserDetails.class);
    List<Predicate> predicates = new ArrayList<>();
    predicates.add(cb.equal(
        userRoot.get("userDetails").get("id"), studentUserDetailsRoot.get("id")));
    predicates.add(cb.equal(studentUserDetailsRoot.get("firstname"), firstName));
    predicates.add(cb.equal(studentUserDetailsRoot.get("lastname"), lastName));
    predicates.add(cb.equal(
        cb.function("MONTH", Integer.class, studentUserDetailsRoot.get("birthday")),
        birthMonth));
    predicates.add(cb.equal(
        cb.function("DAY", Integer.class, studentUserDetailsRoot.get("birthday")),
        birthDay));
    cq.select(userRoot).where(predicates.toArray(new Predicate[predicates.size()]));
    TypedQuery<UserImpl> query = entityManager.createQuery(cq);
    return (List<User>) (Object) query.getResultList();
  }

  @SuppressWarnings("unchecked")
  public List<User> retrieveTeachersByName(String firstName, String lastName) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<UserImpl> cq = cb.createQuery(UserImpl.class);
    Root<UserImpl> userRoot = cq.from(UserImpl.class);
    Root<TeacherUserDetails> teacherUserDetailsRoot = cq.from(TeacherUserDetails.class);
    List<Predicate> predicates = new ArrayList<>();
    predicates.add(cb.equal(
        userRoot.get("userDetails").get("id"), teacherUserDetailsRoot.get("id")));
    predicates.add(cb.equal(teacherUserDetailsRoot.get("firstname"), firstName));
    predicates.add(cb.equal(teacherUserDetailsRoot.get("lastname"), lastName));
    cq.select(userRoot).where(predicates.toArray(new Predicate[predicates.size()]));
    TypedQuery<UserImpl> query = entityManager.createQuery(cq);
    return (List<User>) (Object) query.getResultList();
  }

  /**
   * This seems to be only used by WISE4
   */
  @Override
  public User retrieveByResetPasswordKey(String resetPasswordKey) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<UserImpl> cq = cb.createQuery(UserImpl.class);
    Root<UserImpl> userRoot = cq.from(UserImpl.class);
    cq.select(userRoot).where(
        cb.equal(userRoot.get("userDetails").get("resetPasswordKey"), resetPasswordKey));
    TypedQuery<UserImpl> query = entityManager.createQuery(cq);
    return query.getResultStream().findFirst().orElse(null);
  }

  public List<User> retrieveTeacherUsersJoinedSinceYesterday() {
    return retrieveUsersJoinedSinceYesterday("teacher");
  }

  public List<User> retrieveStudentUsersJoinedSinceYesterday() {
    return retrieveUsersJoinedSinceYesterday("student");
  }

  @SuppressWarnings("unchecked")
  public List<User> retrieveUsersJoinedSinceYesterday(String userType) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<UserImpl> cq = cb.createQuery(UserImpl.class);
    Root<UserImpl> userRoot = cq.from(UserImpl.class);
    List<Predicate> predicates = new ArrayList<>();
    Date compareDate = getCompareDate("sinceYesterday");
    if ("student".equals(userType)) {
      Root<StudentUserDetails> studentUserDetailsRoot = cq.from(StudentUserDetails.class);
      predicates.add(
          cb.greaterThanOrEqualTo(studentUserDetailsRoot.get("signupdate"), compareDate));
      predicates.add(cb.equal(
          userRoot.get("userDetails").get("id"), studentUserDetailsRoot.get("id")));
    } else if ("teacher".equals(userType)) {
      Root<TeacherUserDetails> teacherUserDetailsRoot = cq.from(TeacherUserDetails.class);
      predicates.add(
          cb.greaterThanOrEqualTo(teacherUserDetailsRoot.get("signupdate"), compareDate));
      predicates.add(cb.equal(
          userRoot.get("userDetails").get("id"), teacherUserDetailsRoot.get("id")));
    }
    cq.select(userRoot).where(predicates.toArray(new Predicate[predicates.size()]));
    TypedQuery<UserImpl> query = entityManager.createQuery(cq);
    return (List<User>) (Object) query.getResultList();
  }

  public List<User> retrieveTeacherUsersWhoLoggedInSinceYesterday() {
    return retrieveTeacherUsersWhoLoggedInRecently("sinceYesterday");
  }

  public List<User> retrieveTeacherUsersWhoLoggedInToday() {
    return retrieveTeacherUsersWhoLoggedInRecently("today");
  }

  public List<User> retrieveTeacherUsersWhoLoggedInThisWeek() {
    return retrieveTeacherUsersWhoLoggedInRecently("thisWeek");
  }

  public List<User> retrieveTeacherUsersWhoLoggedInThisMonth() {
    return retrieveTeacherUsersWhoLoggedInRecently("thisMonth");
  }

  public List<User> retrieveTeacherUsersWhoLoggedInThisYear() {
    return retrieveTeacherUsersWhoLoggedInRecently("thisYear");
  }

  @SuppressWarnings("unchecked")
  public List<User> retrieveTeacherUsersWhoLoggedInRecently(String when) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<UserImpl> cq = cb.createQuery(UserImpl.class);
    Root<UserImpl> userRoot = cq.from(UserImpl.class);
    Root<TeacherUserDetails> teacherUserDetailsRoot = cq.from(TeacherUserDetails.class);
    List<Predicate> predicates = new ArrayList<>();
    Date compareDate = getCompareDate(when);
    predicates.add(
        cb.greaterThanOrEqualTo(teacherUserDetailsRoot.get("lastLoginTime"), compareDate));
    predicates.add(
        cb.equal(userRoot.get("userDetails").get("id"), teacherUserDetailsRoot.get("id")));
    cq.select(userRoot).where(predicates.toArray(new Predicate[predicates.size()]));
    TypedQuery<UserImpl> query = entityManager.createQuery(cq);
    return (List<User>) (Object) query.getResultList();
  }

  public List<User> retrieveStudentUsersWhoLoggedInSinceYesterday() {
    return retrieveStudentUsersWhoLoggedInRecently("sinceYesterday");
  }

  public List<User> retrieveStudentUsersWhoLoggedInToday() {
    return retrieveStudentUsersWhoLoggedInRecently("today");
  }

  public List<User> retrieveStudentUsersWhoLoggedInThisWeek() {
    return retrieveStudentUsersWhoLoggedInRecently("thisWeek");
  }

  public List<User> retrieveStudentUsersWhoLoggedInThisMonth() {
    return retrieveStudentUsersWhoLoggedInRecently("thisMonth");
  }

  public List<User> retrieveStudentUsersWhoLoggedInThisYear() {
    return retrieveStudentUsersWhoLoggedInRecently("thisYear");
  }

  @SuppressWarnings("unchecked")
  public List<User> retrieveStudentUsersWhoLoggedInRecently(String when) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<UserImpl> cq = cb.createQuery(UserImpl.class);
    Root<UserImpl> userRoot = cq.from(UserImpl.class);
    Root<StudentUserDetails> studentUserDetailsRoot = cq.from(StudentUserDetails.class);
    List<Predicate> predicates = new ArrayList<>();
    Date compareDate = getCompareDate(when);
    predicates.add(
        cb.greaterThanOrEqualTo(studentUserDetailsRoot.get("lastLoginTime"), compareDate));
    predicates.add(
        cb.equal(userRoot.get("userDetails").get("id"), studentUserDetailsRoot.get("id")));
    cq.select(userRoot).where(predicates.toArray(new Predicate[predicates.size()]));
    TypedQuery<UserImpl> query = entityManager.createQuery(cq);
    return (List<User>) (Object) query.getResultList();
  }

  private Date getCompareDate(String when) {
    Calendar c = Calendar.getInstance();
    if ("sinceYesterday".equals(when)) {
      c.add(Calendar.DAY_OF_YEAR, -1);
    } else if ("today".equals(when)) {
      c.set(Calendar.HOUR_OF_DAY, 0);
      c.set(Calendar.MINUTE, 0);
      c.set(Calendar.SECOND, 0);
      c.set(Calendar.MILLISECOND, 0);
    } else if ("thisWeek".equals(when)) {
      c.set(Calendar.DAY_OF_WEEK, 1);
    } else if ("thisMonth".equals(when)) {
      c.set(Calendar.DAY_OF_MONTH, 1);
    } else if ("thisYear".equals(when)) {
      c.set(Calendar.DAY_OF_YEAR, 1);
    }
    return c.getTime();
  }
}
