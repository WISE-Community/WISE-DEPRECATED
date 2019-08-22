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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.Session;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.dao.support.DataAccessUtils;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.user.UserDao;
import org.wise.portal.domain.authentication.impl.PersistentUserDetails;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
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

  /**
   * @see org.wise.portal.dao.impl.AbstractHibernateDao#getFindAllQuery()
   */
  @Override
  protected String getFindAllQuery() {
    return FIND_ALL_QUERY;
  }

  /**
   * @see org.wise.portal.dao.user.UserDao#retrieveByUserDetails(org.acegisecurity.userdetails.UserDetails)
   */
  public User retrieveByUserDetails(UserDetails userDetails) {
    return (User) DataAccessUtils
      .uniqueResult(this
        .getHibernateTemplate()
        .findByNamedParam(
          "from UserImpl as user where user.userDetails = :userDetails",
          "userDetails", userDetails));
  }

  /**
   * @see org.wise.portal.dao.impl.AbstractHibernateDao#getDataObjectClass()
   */
  @Override
  protected Class<UserImpl> getDataObjectClass() {
    return UserImpl.class;
  }

  /**
   * @see org.wise.portal.dao.user.UserDao#retrieveAllUsernames()
   */
  @SuppressWarnings("unchecked")
  public List<String> retrieveAll(String selectClause) {
    return (List<String>) this.getHibernateTemplate().find("select " + selectClause + " from UserImpl");
  }

  /**
   * @see org.wise.portal.dao.user.UserDao#retrieveByUsername(java.lang.String)
   */
  public User retrieveByUsername(String username) {
    return (User) DataAccessUtils
      .requiredUniqueResult(this
        .getHibernateTemplate()
        .findByNamedParam(
          "from UserImpl as user where upper(user.userDetails.username) = :username",
          "username", username.toUpperCase()));
  }

  /**
   * @see org.wise.portal.dao.user.UserDao#retrieveByEmailAddress(java.lang.String)
   */
  @SuppressWarnings("unchecked")
  public List<User> retrieveByEmailAddress(String emailAddress) {
    return (List<User>) this
      .getHibernateTemplate()
      .findByNamedParam(
        "from UserImpl as user where user.userDetails.emailAddress = :emailAddress",
        "emailAddress", emailAddress);
  }

  @Override
  public User retrieveByGoogleUserId(String googleUserId) {
    List<User> users = (List<User>) this
        .getHibernateTemplate()
        .findByNamedParam(
          "from UserImpl as user where user.userDetails.googleUserId = :googleUserId",
          "googleUserId", googleUserId);
    if (users != null & users.size() > 0) {
      return users.get(0);
    }
    return null;
  }

  /**
   * @see org.wise.portal.dao.user.UserDao#retrieveDisabledUsers()
   */
  @SuppressWarnings("unchecked")
  public List<User> retrieveDisabledUsers() {
    return (List<User>) this
      .getHibernateTemplate()
      .findByNamedParam(
        "from UserImpl as user where user.userDetails.enabled = :enabled",
        "enabled", false);
  }

  /**
   * @see org.wise.portal.dao.user.UserDao#retrieveByField(java.lang.String, java.lang.String, java.lang.String, java.lang.String)
   */
  @SuppressWarnings("unchecked")
  public List<User> retrieveByField(String field, String type, Object term, String classVar){
    if (field == null && type == null && term == null) {
      return (List<User>) this.getHibernateTemplate().find(
        "select user from UserImpl user, " + capitalizeFirst(classVar) + " " +
          classVar +  " where user.userDetails.id = " + classVar + ".id");
    } else if ("id".equals(field)) {
      // handle id specifically by looking for user.id instead of user.userDetails.id
      return (List<User>) this.getHibernateTemplate().findByNamedParam(
        "select user from UserImpl user, " + capitalizeFirst(classVar) + " " +
          classVar +  " where user.userDetails.id = " + classVar + ".id and user.id " + type + " :term", "term", term);
    } else {
      return (List<User>) this.getHibernateTemplate().findByNamedParam(
        "select user from UserImpl user, " + capitalizeFirst(classVar) + " " +
          classVar +  " where user.userDetails.id = " + classVar + ".id and " +
          classVar + "."  + field + " " +  type + " :term", "term", term);
    }
  }

  /**
   * Capitalizes the first letter of a given String
   *
   * @param string
   * @return String
   */
  private String capitalizeFirst(String string){
    return StringUtils.upperCase(StringUtils.left(string, 1))
      + StringUtils.right(string, string.length() - 1);
  }

  /**
   * Get all the Users that have fields with the given matching values
   * @param fields an array of field names
   * e.g.
   * 'firstname'
   * 'lastname'
   * 'birthmonth'
   * 'birthday'
   *
   * @param values an array of values, the index of a value must line up with
   * the index in the field array
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
  @SuppressWarnings("unchecked")
  public List<User> retrieveByFields(String[] fields, String[] values, String classVar) {
    HashMap<String, Object> params = new HashMap<>();
    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    StringBuffer query = new StringBuffer();

    // make the beginning of the query
    query.append("select user from UserImpl user, " + capitalizeFirst(classVar) + " " + classVar + " where ");
    query.append("user.userDetails.id=" + classVar + ".id");

    // loop through all the fields so we can add more constraints to the 'where' clause
    for (int x = 0; x < fields.length; x++) {
      query.append(" and ");

      if (fields[x] != null && (fields[x].equals("birthmonth") || fields[x].equals("birthday"))) {
        //field is a birth month or birth day so we need to use a special function call
        if (fields[x].equals("birthmonth")) {
          query.append("month(" + classVar + ".birthday)=:birthmonth");
          params.put("birthmonth", Integer.parseInt(values[x]));
        } else if(fields[x].equals("birthday")) {
          query.append("day(" + classVar + ".birthday)=:birthday");
          params.put("birthday", Integer.parseInt(values[x]));
        }
      } else {
        //add the constraint
        query.append(classVar + "." + fields[x] + "=:" + fields[x]);
        params.put(fields[x], values[x]);
      }
    }

    Query queryObject = session.createQuery(query.toString());
    for (Map.Entry<String, Object> entry : params.entrySet()) {
      queryObject.setParameter(entry.getKey(), entry.getValue());
    }

    // run the query and return the results
    List<User> result = queryObject.getResultList();
    return result;
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
      persistentUserDetailsRoot = getPersistentUserDetailsRoot(cq, persistentUserDetailsRoot);
      predicates.add(cb.equal(studentUserDetailsRoot.get("firstname"), firstName));
      predicates.add(cb.equal(studentUserDetailsRoot.get("id"),
          persistentUserDetailsRoot.get("id")));
    }
    if (lastName != null) {
      persistentUserDetailsRoot = getPersistentUserDetailsRoot(cq, persistentUserDetailsRoot);
      predicates.add(cb.equal(studentUserDetailsRoot.get("lastname"), lastName));
      predicates.add(cb.equal(studentUserDetailsRoot.get("id"),
          persistentUserDetailsRoot.get("id")));
    }
    if (username != null) {
      persistentUserDetailsRoot = getPersistentUserDetailsRoot(cq, persistentUserDetailsRoot);
      predicates.add(cb.equal(persistentUserDetailsRoot.get("username"), username));
      predicates.add(cb.equal(studentUserDetailsRoot.get("id"),
          persistentUserDetailsRoot.get("id")));
    }
    if (userId != null) {
      userImplRoot = getUserImplRoot(cq, userImplRoot);
      predicates.add(cb.equal(userImplRoot.get("id"), userId));
      predicates.add(cb.equal(userImplRoot.get("userDetails").get("id"),
          studentUserDetailsRoot.get("id")));
    }
    if (workgroupId != null) {
      workgroupImplRoot = getWorkgroupImplRoot(cq, workgroupImplRoot);
      persistentGroupRoot = getPersistentGroupRoot(cq, persistentGroupRoot);
      userImplRoot = getUserImplRoot(cq, userImplRoot);
      predicates.add(cb.equal(workgroupImplRoot.get("id"), workgroupId));
      predicates.add(cb.equal(workgroupImplRoot.get("group"), persistentGroupRoot.get("id")));
      predicates.add(cb.isMember(userImplRoot.get("id"),
          persistentGroupRoot.<Set<User>>get("members")));
      predicates.add(cb.equal(userImplRoot.get("userDetails").get("id"),
          studentUserDetailsRoot.get("id")));
    }
    if (runId != null) {
      runImplRoot = getRunImplRoot(cq, runImplRoot);
      workgroupImplRoot = getWorkgroupImplRoot(cq, workgroupImplRoot);
      persistentGroupRoot = getPersistentGroupRoot(cq, persistentGroupRoot);
      userImplRoot = getUserImplRoot(cq, userImplRoot);
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
      runImplRoot = getRunImplRoot(cq, runImplRoot);
      workgroupImplRoot = getWorkgroupImplRoot(cq, workgroupImplRoot);
      persistentGroupRoot = getPersistentGroupRoot(cq, persistentGroupRoot);
      userImplRoot = getUserImplRoot(cq, userImplRoot);
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

  Root<PersistentUserDetails> getPersistentUserDetailsRoot(CriteriaQuery<StudentUserDetails> cq,
      Root<PersistentUserDetails> persistentUserDetailsRoot) {
    if (persistentUserDetailsRoot == null) {
      persistentUserDetailsRoot = cq.from(PersistentUserDetails.class);
    }
    return persistentUserDetailsRoot;
  }

  Root<UserImpl> getUserImplRoot(CriteriaQuery<StudentUserDetails> cq,
      Root<UserImpl> userImplRoot) {
    if (userImplRoot == null) {
      userImplRoot = cq.from(UserImpl.class);
    }
    return userImplRoot;
  }

  Root<WorkgroupImpl> getWorkgroupImplRoot(CriteriaQuery<StudentUserDetails> cq,
      Root<WorkgroupImpl> workgroupImplRoot) {
    if (workgroupImplRoot == null) {
      workgroupImplRoot = cq.from(WorkgroupImpl.class);
    }
    return workgroupImplRoot;
  }

  Root<PersistentGroup> getPersistentGroupRoot(CriteriaQuery<StudentUserDetails> cq,
      Root<PersistentGroup> persistentGroupRoot) {
    if (persistentGroupRoot == null) {
      persistentGroupRoot = cq.from(PersistentGroup.class);
    }
    return persistentGroupRoot;
  }

  Root<RunImpl> getRunImplRoot(CriteriaQuery<StudentUserDetails> cq, Root<RunImpl> runImplRoot) {
    if (runImplRoot == null) {
      runImplRoot = cq.from(RunImpl.class);
    }
    return runImplRoot;
  }

  /**
   * Given a reset password key retrieve a corresponding user.
   * @param resetPasswordKey an alphanumeric key
   * @return a User object or null if there is no user with the given reset password key
   */
  @Override
  public User retrieveByResetPasswordKey(String resetPasswordKey) {
    User user = null;
    try {
      user = (User) DataAccessUtils
        .requiredUniqueResult(this
          .getHibernateTemplate()
          .findByNamedParam(
            "from UserImpl as user where user.userDetails.resetPasswordKey = :resetPasswordKey",
            "resetPasswordKey", resetPasswordKey));
    } catch(EmptyResultDataAccessException e) {
      e.printStackTrace();
    }

    return user;
  }
}
