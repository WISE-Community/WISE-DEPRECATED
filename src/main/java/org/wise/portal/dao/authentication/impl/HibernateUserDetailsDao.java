/**
 * Copyright (c) 2007-2015 Encore Research Group, University of Toronto
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
package org.wise.portal.dao.authentication.impl;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

import org.hibernate.Session;
import org.springframework.stereotype.Repository;
import org.wise.portal.dao.authentication.UserDetailsDao;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.PersistentUserDetails;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;

/**
 * Class that implements the <code>UserDetailsDao</code> interface using
 * Hibernate.
 *
 * @author Cynick Young
 */
@Repository
public class HibernateUserDetailsDao extends AbstractHibernateDao<MutableUserDetails> implements
    UserDetailsDao<MutableUserDetails> {

  @PersistenceContext
  private EntityManager entityManager;

  private static final String FIND_ALL_QUERY = "from PersistentUserDetails";

  private CriteriaBuilder getCriteriaBuilder() {
    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    return session.getCriteriaBuilder();
  }

  public PersistentUserDetails retrieveByName(String username) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<PersistentUserDetails> cq = cb.createQuery(PersistentUserDetails.class);
    Root<PersistentUserDetails> persistentUserDetailsRoot = cq.from(PersistentUserDetails.class);
    cq.select(persistentUserDetailsRoot).where(
        cb.equal(persistentUserDetailsRoot.get("username"), username));
    TypedQuery<PersistentUserDetails> query = entityManager.createQuery(cq);
    return query.getResultStream().findFirst().orElse(null);
  }

  public List<String> retrieveAllTeacherUsernames() {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<String> cq = cb.createQuery(String.class);
    Root<PersistentUserDetails> persistentUserDetailsRoot = cq.from(PersistentUserDetails.class);
    Root<TeacherUserDetails> teacherUserDetailsRoot = cq.from(TeacherUserDetails.class);
    cq.select(persistentUserDetailsRoot.get("username")).where(
        cb.equal(persistentUserDetailsRoot.get("id"), teacherUserDetailsRoot.get("id")));
    TypedQuery<String> query = entityManager.createQuery(cq);
    return query.getResultList();
  }

  public List<String> retrieveAllStudentUsernames() {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<String> cq = cb.createQuery(String.class);
    Root<PersistentUserDetails> persistentUserDetailsRoot = cq.from(PersistentUserDetails.class);
    Root<StudentUserDetails> studentUserDetailsRoot = cq.from(StudentUserDetails.class);
    cq.select(persistentUserDetailsRoot.get("username")).where(
        cb.equal(persistentUserDetailsRoot.get("id"), studentUserDetailsRoot.get("id")));
    TypedQuery<String> query = entityManager.createQuery(cq);
    return query.getResultList();
  }

  public PersistentUserDetails retrieveByGoogleUserId(String googleUserId) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<PersistentUserDetails> cq = cb.createQuery(PersistentUserDetails.class);
    Root<PersistentUserDetails> persistentUserDetailsRoot = cq.from(PersistentUserDetails.class);
    cq.select(persistentUserDetailsRoot).where(
        cb.equal(persistentUserDetailsRoot.get("googleUserId"), googleUserId));
    TypedQuery<PersistentUserDetails> query = entityManager.createQuery(cq);
    return query.getResultStream().findFirst().orElse(null);
  }

  public boolean hasUsername(String username) {
    return this.retrieveByName(username) != null;
  }

  @Override
  protected String getFindAllQuery() {
    return FIND_ALL_QUERY;
  }

  @Override
  protected Class<PersistentUserDetails> getDataObjectClass() {
    return PersistentUserDetails.class;
  }
}
