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
import java.util.Set;

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
import org.wise.portal.domain.authentication.impl.PersistentUserDetails;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.domain.workgroup.impl.WorkgroupImpl;

/**
 * @author Cynick Young
 */
@Repository
public class HibernateUserDao extends AbstractHibernateDao<User> implements UserDao<User> {

  private static final String FIND_ALL_QUERY = "from UserImpl";

  @PersistenceContext
  private EntityManager entityManager;

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

  public List<StudentUserDetails> searchStudents(String firstName, String lastName, String username,
      Long userId, Long runId, Long workgroupId, String teacherUsername) {
    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    CriteriaBuilder cb = session.getCriteriaBuilder();
    CriteriaQuery<StudentUserDetails> cq = cb.createQuery(StudentUserDetails.class);
    Root<StudentUserDetails> studentUserDetailsRoot = cq.from(StudentUserDetails.class);
    List<Predicate> predicates = getSearchStudentsPredicates(cb, cq, studentUserDetailsRoot,
        firstName, lastName, username, userId, runId, workgroupId, teacherUsername);
    cq.select(studentUserDetailsRoot).where(predicates.toArray(new Predicate[predicates.size()]));
    cq.distinct(true);
    EntityManager em = entityManager;
    TypedQuery<StudentUserDetails> query = em.createQuery(cq);
    List<StudentUserDetails> studentUserDetailsResultList = query.getResultList();
    return studentUserDetailsResultList;
  }

  List<Predicate> getSearchStudentsPredicates(CriteriaBuilder cb,
      CriteriaQuery<StudentUserDetails> cq, Root<StudentUserDetails> studentUserDetailsRoot,
      String firstName, String lastName, String username, Long userId, Long runId, Long workgroupId,
      String teacherUsername) {
    List<Predicate> predicates = new ArrayList<>();
    Root<PersistentUserDetails> persistentUserDetailsRoot = null;
    Root<UserImpl> userImplRoot = null;
    Root<WorkgroupImpl> workgroupImplRoot = null;
    Root<PersistentGroup> persistentGroupRoot = null;
    Root<RunImpl> runImplRoot = null;
    if (firstName != null) {
      persistentUserDetailsRoot =
          getPersistentStudentUserDetailsRoot(cq, persistentUserDetailsRoot);
      predicates.add(cb.equal(studentUserDetailsRoot.get("firstname"), firstName));
      predicates.add(cb.equal(studentUserDetailsRoot.get("id"),
          persistentUserDetailsRoot.get("id")));
    }
    if (lastName != null) {
      persistentUserDetailsRoot =
          getPersistentStudentUserDetailsRoot(cq, persistentUserDetailsRoot);
      predicates.add(cb.equal(studentUserDetailsRoot.get("lastname"), lastName));
      predicates.add(cb.equal(studentUserDetailsRoot.get("id"),
          persistentUserDetailsRoot.get("id")));
    }
    if (username != null) {
      persistentUserDetailsRoot =
          getPersistentStudentUserDetailsRoot(cq, persistentUserDetailsRoot);
      predicates.add(cb.equal(persistentUserDetailsRoot.get("username"), username));
      predicates.add(cb.equal(studentUserDetailsRoot.get("id"),
          persistentUserDetailsRoot.get("id")));
    }
    if (userId != null) {
      userImplRoot = getStudentUserImplRoot(cq, userImplRoot);
      predicates.add(cb.equal(userImplRoot.get("id"), userId));
      predicates.add(cb.equal(userImplRoot.get("userDetails").get("id"),
          studentUserDetailsRoot.get("id")));
    }
    if (workgroupId != null) {
      workgroupImplRoot = getStudentWorkgroupImplRoot(cq, workgroupImplRoot);
      persistentGroupRoot = getStudentPersistentGroupRoot(cq, persistentGroupRoot);
      userImplRoot = getStudentUserImplRoot(cq, userImplRoot);
      predicates.add(cb.equal(workgroupImplRoot.get("id"), workgroupId));
      predicates.add(cb.equal(workgroupImplRoot.get("group"), persistentGroupRoot.get("id")));
      predicates.add(cb.isMember(userImplRoot.get("id"),
          persistentGroupRoot.<Set<User>>get("members")));
      predicates.add(cb.equal(userImplRoot.get("userDetails").get("id"),
          studentUserDetailsRoot.get("id")));
    }
    if (runId != null) {
      runImplRoot = getStudentRunImplRoot(cq, runImplRoot);
      workgroupImplRoot = getStudentWorkgroupImplRoot(cq, workgroupImplRoot);
      persistentGroupRoot = getStudentPersistentGroupRoot(cq, persistentGroupRoot);
      userImplRoot = getStudentUserImplRoot(cq, userImplRoot);
      predicates.add(cb.equal(runImplRoot.get("id"), runId));
      predicates.add(cb.equal(runImplRoot.get("id"), workgroupImplRoot.get("run")));
      predicates.add(cb.equal(workgroupImplRoot.get("teacherWorkgroup"), false));
      predicates.add(cb.equal(workgroupImplRoot.get("group"), persistentGroupRoot.get("id")));
      predicates.add(cb.isMember(userImplRoot.get("id"),
          persistentGroupRoot.<Set<User>>get("members")));
      predicates.add(cb.equal(userImplRoot.get("userDetails").get("id"),
          studentUserDetailsRoot.get("id")));
    }
    if (teacherUsername != null) {
      Root<UserImpl> userImplForTeacher = cq.from(UserImpl.class);
      Root<PersistentUserDetails> persistentUserDetailsForTeacher =
          cq.from(PersistentUserDetails.class);
      runImplRoot = getStudentRunImplRoot(cq, runImplRoot);
      workgroupImplRoot = getStudentWorkgroupImplRoot(cq, workgroupImplRoot);
      persistentGroupRoot = getStudentPersistentGroupRoot(cq, persistentGroupRoot);
      userImplRoot = getStudentUserImplRoot(cq, userImplRoot);
      predicates.add(cb.equal(runImplRoot.get("owner").get("id"), userImplForTeacher.get("id")));
      predicates.add(cb.equal(persistentUserDetailsForTeacher.get("id"),
          userImplForTeacher.get("id")));
      predicates.add(cb.equal(persistentUserDetailsForTeacher.get("username"), teacherUsername));
      predicates.add(cb.equal(runImplRoot.get("id"), workgroupImplRoot.get("run")));
      predicates.add(cb.equal(workgroupImplRoot.get("teacherWorkgroup"), false));
      predicates.add(cb.equal(workgroupImplRoot.get("group"), persistentGroupRoot.get("id")));
      predicates.add(cb.isMember(userImplRoot.get("id"),
          persistentGroupRoot.<Set<User>>get("members")));
      predicates.add(cb.equal(userImplRoot.get("userDetails").get("id"),
          studentUserDetailsRoot.get("id")));
    }
    return predicates;
  }

  Root<PersistentUserDetails> getPersistentStudentUserDetailsRoot(
      CriteriaQuery<StudentUserDetails> cq, Root<PersistentUserDetails> persistentUserDetailsRoot) {
    if (persistentUserDetailsRoot == null) {
      persistentUserDetailsRoot = cq.from(PersistentUserDetails.class);
    }
    return persistentUserDetailsRoot;
  }

  Root<UserImpl> getStudentUserImplRoot(CriteriaQuery<StudentUserDetails> cq,
      Root<UserImpl> userImplRoot) {
    if (userImplRoot == null) {
      userImplRoot = cq.from(UserImpl.class);
    }
    return userImplRoot;
  }

  Root<WorkgroupImpl> getStudentWorkgroupImplRoot(CriteriaQuery<StudentUserDetails> cq,
      Root<WorkgroupImpl> workgroupImplRoot) {
    if (workgroupImplRoot == null) {
      workgroupImplRoot = cq.from(WorkgroupImpl.class);
    }
    return workgroupImplRoot;
  }

  Root<PersistentGroup> getStudentPersistentGroupRoot(CriteriaQuery<StudentUserDetails> cq,
      Root<PersistentGroup> persistentGroupRoot) {
    if (persistentGroupRoot == null) {
      persistentGroupRoot = cq.from(PersistentGroup.class);
    }
    return persistentGroupRoot;
  }

  Root<RunImpl> getStudentRunImplRoot(CriteriaQuery<StudentUserDetails> cq,
      Root<RunImpl> runImplRoot) {
    if (runImplRoot == null) {
      runImplRoot = cq.from(RunImpl.class);
    }
    return runImplRoot;
  }

  public List<TeacherUserDetails> searchTeachers(String firstName, String lastName, String username,
      Long userId, String displayName, String city, String state, String country, String schoolName,
      String schoolLevel, String email, Long runId) {
    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    CriteriaBuilder cb = session.getCriteriaBuilder();
    CriteriaQuery<TeacherUserDetails> cq = cb.createQuery(TeacherUserDetails.class);
    Root<TeacherUserDetails> teacherUserDetailsRoot = cq.from(TeacherUserDetails.class);
    List<Predicate> predicates = getSearchTeachersPredicates(cb, cq, teacherUserDetailsRoot,
        firstName, lastName, username, userId, displayName, city, state, country, schoolName,
        schoolLevel, email, runId);
    cq.select(teacherUserDetailsRoot).where(predicates.toArray(new Predicate[predicates.size()]));
    cq.distinct(true);
    EntityManager em = entityManager;
    TypedQuery<TeacherUserDetails> query = em.createQuery(cq);
    List<TeacherUserDetails> teacherUserDetailsResultList = query.getResultList();
    return teacherUserDetailsResultList;
  }

  private List<Predicate> getSearchTeachersPredicates(CriteriaBuilder cb,
      CriteriaQuery<TeacherUserDetails> cq, Root<TeacherUserDetails> teacherUserDetailsRoot,
      String firstName, String lastName, String username, Long userId, String displayName,
      String city, String state, String country, String schoolName, String schoolLevel,
      String email, Long runId) {
    List<Predicate> predicates = new ArrayList<>();
    Root<PersistentUserDetails> persistentUserDetailsRoot = null;
    Root<UserImpl> userImplRoot = null;
    Root<RunImpl> runImplRoot = null;
    if (firstName != null) {
      persistentUserDetailsRoot =
          getPersistentTeacherUserDetailsRoot(cq, persistentUserDetailsRoot);
      predicates.add(cb.equal(teacherUserDetailsRoot.get("firstname"), firstName));
      predicates.add(cb.equal(teacherUserDetailsRoot.get("id"),
          persistentUserDetailsRoot.get("id")));
    }
    if (lastName != null) {
      persistentUserDetailsRoot =
          getPersistentTeacherUserDetailsRoot(cq, persistentUserDetailsRoot);
      predicates.add(cb.equal(teacherUserDetailsRoot.get("lastname"), lastName));
      predicates.add(cb.equal(teacherUserDetailsRoot.get("id"),
          persistentUserDetailsRoot.get("id")));
    }
    if (username != null) {
      persistentUserDetailsRoot =
          getPersistentTeacherUserDetailsRoot(cq, persistentUserDetailsRoot);
      predicates.add(cb.equal(persistentUserDetailsRoot.get("username"), username));
      predicates.add(cb.equal(teacherUserDetailsRoot.get("id"),
          persistentUserDetailsRoot.get("id")));
    }
    if (userId != null) {
      userImplRoot = getTeacherUserImplRoot(cq, userImplRoot);
      predicates.add(cb.equal(userImplRoot.get("id"), userId));
      predicates.add(cb.equal(userImplRoot.get("userDetails").get("id"),
          teacherUserDetailsRoot.get("id")));
    }
    if (displayName != null) {
      persistentUserDetailsRoot =
          getPersistentTeacherUserDetailsRoot(cq, persistentUserDetailsRoot);
      predicates.add(cb.equal(teacherUserDetailsRoot.get("displayname"), displayName));
      predicates.add(cb.equal(teacherUserDetailsRoot.get("id"),
          persistentUserDetailsRoot.get("id")));
    }
    if (city != null) {
      persistentUserDetailsRoot =
          getPersistentTeacherUserDetailsRoot(cq, persistentUserDetailsRoot);
      predicates.add(cb.equal(teacherUserDetailsRoot.get("city"), city));
      predicates.add(cb.equal(teacherUserDetailsRoot.get("id"),
          persistentUserDetailsRoot.get("id")));
    }
    if (state != null) {
      persistentUserDetailsRoot =
          getPersistentTeacherUserDetailsRoot(cq, persistentUserDetailsRoot);
      predicates.add(cb.equal(teacherUserDetailsRoot.get("state"), state));
      predicates.add(cb.equal(teacherUserDetailsRoot.get("id"),
          persistentUserDetailsRoot.get("id")));
    }
    if (country != null) {
      persistentUserDetailsRoot =
          getPersistentTeacherUserDetailsRoot(cq, persistentUserDetailsRoot);
      predicates.add(cb.equal(teacherUserDetailsRoot.get("country"), country));
      predicates.add(cb.equal(teacherUserDetailsRoot.get("id"),
          persistentUserDetailsRoot.get("id")));
    }
    if (schoolName != null) {
      persistentUserDetailsRoot =
          getPersistentTeacherUserDetailsRoot(cq, persistentUserDetailsRoot);
      predicates.add(cb.like(teacherUserDetailsRoot.get("schoolname"), "%" + schoolName + "%"));
      predicates.add(cb.equal(teacherUserDetailsRoot.get("id"),
          persistentUserDetailsRoot.get("id")));
    }
    if (schoolLevel != null) {
      persistentUserDetailsRoot =
          getPersistentTeacherUserDetailsRoot(cq, persistentUserDetailsRoot);
      predicates.add(cb.equal(teacherUserDetailsRoot.get("schoollevel"),
          Schoollevel.valueOf(schoolLevel)));
      predicates.add(cb.equal(teacherUserDetailsRoot.get("id"),
          persistentUserDetailsRoot.get("id")));
    }
    if (email != null) {
      persistentUserDetailsRoot =
          getPersistentTeacherUserDetailsRoot(cq, persistentUserDetailsRoot);
      predicates.add(cb.equal(persistentUserDetailsRoot.get("emailAddress"), email));
      predicates.add(cb.equal(teacherUserDetailsRoot.get("id"),
          persistentUserDetailsRoot.get("id")));
    }
    if (runId != null) {
      runImplRoot = getTeacherRunImplRoot(cq, runImplRoot);
      userImplRoot = getTeacherUserImplRoot(cq, userImplRoot);
      predicates.add(cb.equal(runImplRoot.get("id"), runId));
      predicates.add(cb.equal(runImplRoot.get("owner").get("id"), userImplRoot.get("id")));
      predicates.add(cb.equal(userImplRoot.get("userDetails").get("id"),
          teacherUserDetailsRoot.get("id")));
    }
    return predicates;
  }

  private Root<PersistentUserDetails> getPersistentTeacherUserDetailsRoot(
      CriteriaQuery<TeacherUserDetails> cq,
      Root<PersistentUserDetails> persistentUserDetailsRoot) {
    if (persistentUserDetailsRoot == null) {
      persistentUserDetailsRoot = cq.from(PersistentUserDetails.class);
    }
    return persistentUserDetailsRoot;
  }

  private Root<UserImpl> getTeacherUserImplRoot(CriteriaQuery<TeacherUserDetails> cq,
      Root<UserImpl> userImplRoot) {
    if (userImplRoot == null) {
      userImplRoot = cq.from(UserImpl.class);
    }
    return userImplRoot;
  }

  private Root<RunImpl> getTeacherRunImplRoot(CriteriaQuery<TeacherUserDetails> cq,
      Root<RunImpl> runImplRoot) {
    if (runImplRoot == null) {
      runImplRoot = cq.from(RunImpl.class);
    }
    return runImplRoot;
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
