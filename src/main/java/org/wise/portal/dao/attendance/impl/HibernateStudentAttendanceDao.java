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
package org.wise.portal.dao.attendance.impl;

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
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.attendance.StudentAttendanceDao;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.domain.attendance.StudentAttendance;
import org.wise.portal.domain.attendance.impl.StudentAttendanceImpl;

@Repository
public class HibernateStudentAttendanceDao extends AbstractHibernateDao<StudentAttendance>
    implements StudentAttendanceDao<StudentAttendance> {

  @PersistenceContext
  private EntityManager entityManager;
  
  @Transactional(readOnly=true)
  @SuppressWarnings("unchecked")
  public List<StudentAttendance> getStudentAttendanceByRunId(Long runId) {
    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    CriteriaBuilder cb = session.getCriteriaBuilder();
    CriteriaQuery<StudentAttendanceImpl> cq = cb.createQuery(StudentAttendanceImpl.class);
    Root<StudentAttendanceImpl> studentAttendanceRoot = cq.from(StudentAttendanceImpl.class);
    cq.select(studentAttendanceRoot).where(cb.equal(studentAttendanceRoot.get("runId"), runId))
        .orderBy(cb.desc(studentAttendanceRoot.get("loginTimestamp")));
    TypedQuery<StudentAttendanceImpl> query = entityManager.createQuery(cq);
    return (List<StudentAttendance>) (Object) query.getResultList();
  }

  @SuppressWarnings("unchecked")
  @Override
  @Transactional(readOnly=true)
  public List<StudentAttendance> getStudentAttendanceByRunIdAndPeriod(
      Long runId, int lookBackNumDays) {
    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    CriteriaBuilder cb = session.getCriteriaBuilder();
    CriteriaQuery<StudentAttendanceImpl> cq = cb.createQuery(StudentAttendanceImpl.class);
    Root<StudentAttendanceImpl> studentAttendanceRoot = cq.from(StudentAttendanceImpl.class);
    List<Predicate> predicates = new ArrayList<>();
    Calendar c = Calendar.getInstance();
    c.add(Calendar.DAY_OF_YEAR, -lookBackNumDays);
    Date compareDate = c.getTime();
    predicates.add(
        cb.greaterThanOrEqualTo(studentAttendanceRoot.get("loginTimestamp"), compareDate));
    predicates.add(cb.equal(studentAttendanceRoot.get("runId"), runId));
    cq.select(studentAttendanceRoot).where(predicates.toArray(new Predicate[predicates.size()]))
        .orderBy(cb.desc(studentAttendanceRoot.get("loginTimestamp")));
    TypedQuery<StudentAttendanceImpl> query = entityManager.createQuery(cq);
    return (List<StudentAttendance>) (Object) query.getResultList();
  }

  @Override
  protected Class<? extends StudentAttendance> getDataObjectClass() {
    return null;
  }

  @Override
  protected String getFindAllQuery() {
    return null;
  }
}
