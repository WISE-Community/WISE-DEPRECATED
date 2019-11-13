/**
 * Copyright (c) 2008-2015 Regents of the University of California (Regents).
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.dao.status.impl;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

import org.hibernate.Session;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.status.StudentStatusDao;
import org.wise.vle.domain.status.StudentStatus;

@Repository
public class HibernateStudentStatusDao extends AbstractHibernateDao<StudentStatus>
    implements StudentStatusDao<StudentStatus> {
  
  @PersistenceContext
  private EntityManager entityManager;

  private CriteriaBuilder getCriteriaBuilder() {
    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    return session.getCriteriaBuilder(); 
  }

  @Override
  protected String getFindAllQuery() {
    return null;
  }

  @Override
  protected Class<? extends StudentStatus> getDataObjectClass() {
    return null;
  }

  @Transactional
  public void saveStudentStatus(StudentStatus studentStatus) {
    save(studentStatus);
  }

  @Transactional
  public StudentStatus getStudentStatusByWorkgroupId(Long workgroupId) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<StudentStatus> cq = cb.createQuery(StudentStatus.class);
    Root<StudentStatus> studentStatusRoot = cq.from(StudentStatus.class);
    cq.select(studentStatusRoot).where(cb.equal(studentStatusRoot.get("workgroupId"), workgroupId))
        .orderBy(cb.desc(studentStatusRoot.get("id")));
    TypedQuery<StudentStatus> query = entityManager.createQuery(cq);
    return query.getResultStream().findFirst().orElse(null);
  }

  @Transactional
  public List<StudentStatus> getStudentStatusesByPeriodId(Long periodId) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<StudentStatus> cq = cb.createQuery(StudentStatus.class);
    Root<StudentStatus> studentStatusRoot = cq.from(StudentStatus.class);
    cq.select(studentStatusRoot).where(cb.equal(studentStatusRoot.get("periodId"), periodId));
    TypedQuery<StudentStatus> query = entityManager.createQuery(cq);
    return (List<StudentStatus>) query.getResultList();
  }

  @Transactional
  public List<StudentStatus> getStudentStatusesByRunId(Long runId) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<StudentStatus> cq = cb.createQuery(StudentStatus.class);
    Root<StudentStatus> studentStatusRoot = cq.from(StudentStatus.class);
    cq.select(studentStatusRoot).where(cb.equal(studentStatusRoot.get("runId"), runId));
    TypedQuery<StudentStatus> query = entityManager.createQuery(cq);
    return (List<StudentStatus>) query.getResultList();
  }
}
