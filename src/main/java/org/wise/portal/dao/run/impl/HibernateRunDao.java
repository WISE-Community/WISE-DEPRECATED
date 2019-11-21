/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
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
package org.wise.portal.dao.run.impl;

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
import org.springframework.stereotype.Repository;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.run.RunDao;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.domain.workgroup.impl.WorkgroupImpl;

/**
 * DAO for WISE run, which extends run
 *
 * @author Hiroki Terashima
 */
@Repository
public class HibernateRunDao extends AbstractHibernateDao<Run> implements RunDao<Run> {

  @PersistenceContext
  private EntityManager entityManager;
  
  private static final String FIND_ALL_QUERY = "from RunImpl";

  @Override
  protected String getFindAllQuery() {
    return FIND_ALL_QUERY;
  }

  @Override
  protected Class<RunImpl> getDataObjectClass() {
    return RunImpl.class;
  }

  private CriteriaBuilder getCriteriaBuilder() {
    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    return session.getCriteriaBuilder(); 
  }

  public Run retrieveByRunCode(String runcode) throws ObjectNotFoundException {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<RunImpl> cq = cb.createQuery(RunImpl.class); 
    Root<RunImpl> runRoot = cq.from(RunImpl.class); 
    cq.select(runRoot).where(cb.equal(runRoot.get("runcode"), runcode))
        .orderBy(cb.desc(runRoot.get("id")));
    TypedQuery<RunImpl> query = entityManager.createQuery(cq);
    List<RunImpl> runResult = query.getResultList();
    if (runResult.size() == 0) {
      throw new ObjectNotFoundException(runcode, this.getDataObjectClass());
    } else {
      return runResult.get(0);
    }
  }

  @SuppressWarnings("unchecked")
  public List<Workgroup> getWorkgroupsForRun(Long runId) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<WorkgroupImpl> cq = cb.createQuery(WorkgroupImpl.class); 
    Root<WorkgroupImpl> workgroupRoot = cq.from(WorkgroupImpl.class);
    cq.select(workgroupRoot).where(cb.equal(workgroupRoot.get("run").get("id"), runId));
    TypedQuery<WorkgroupImpl> query = entityManager.createQuery(cq);
    List<WorkgroupImpl> workgroupResultList = query.getResultList();
    return (List<Workgroup>) (Object) workgroupResultList;
  }

  @SuppressWarnings("unchecked")
  public List<Workgroup> getWorkgroupsForRunAndPeriod(Long runId, Long periodId) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<WorkgroupImpl> cq = cb.createQuery(WorkgroupImpl.class); 
    Root<WorkgroupImpl> workgroupRoot = cq.from(WorkgroupImpl.class);
    List<Predicate> predicates = new ArrayList<>();
    predicates.add(cb.equal(workgroupRoot.get("run").get("id"), runId));
    predicates.add(cb.equal(workgroupRoot.get("period").get("id"), periodId));
    predicates.add(cb.isFalse(workgroupRoot.get("teacherWorkgroup")));
    cq.select(workgroupRoot).where(predicates.toArray(new Predicate[predicates.size()]));
    TypedQuery<WorkgroupImpl> query = entityManager.createQuery(cq);
    List<WorkgroupImpl> workgroupResultList = query.getResultList();
    return (List<Workgroup>) (Object) workgroupResultList;
  }

  @SuppressWarnings("unchecked")
  public List<Run> retrieveByField(String field, String type, Object term) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<RunImpl> cq = cb.createQuery(RunImpl.class); 
    Root<RunImpl> runRoot = cq.from(RunImpl.class);
    if (type.equals(">")) {
      cq.select(runRoot).where(cb.greaterThan(runRoot.get(field), (Date)term));
    } else if (type.equals("like")) {
      cq.select(runRoot).where(cb.like(runRoot.get(field), (String)term));
    }
    TypedQuery<RunImpl> query = entityManager.createQuery(cq);
    List<RunImpl> runResultList = query.getResultList();
    return (List<Run>) (Object) runResultList; 
  }

  @SuppressWarnings("unchecked")
  public List<Run> getRunListByUser(User user) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<RunImpl> cq = cb.createQuery(RunImpl.class); 
    Root<RunImpl> runRoot = cq.from(RunImpl.class);
    Root<UserImpl> userRoot = cq.from(UserImpl.class);
    Root<PersistentGroup> periodGroupRoot = cq.from(PersistentGroup.class);
    List<Predicate> predicates = new ArrayList<>();
    predicates.add(cb.equal(userRoot.get("id"), user.getId()));
    predicates.add(cb.isMember(userRoot.get("id"), periodGroupRoot.<Set<User>>get("members")));
    predicates.add(cb.isMember(periodGroupRoot, runRoot.<Set<PersistentGroup>>get("periods")));
    cq.select(runRoot).where(predicates.toArray(new Predicate[predicates.size()]));
    TypedQuery<RunImpl> query = entityManager.createQuery(cq);
    List<RunImpl> runResultList = query.getResultList();
    return (List<Run>) (Object) runResultList;
  }

  @SuppressWarnings("unchecked")
  public List<Run> getRunsOfProject(Long projectId) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<RunImpl> cq = cb.createQuery(RunImpl.class); 
    Root<RunImpl> runRoot = cq.from(RunImpl.class);
    cq.select(runRoot).where(cb.equal(runRoot.get("project").get("id"), projectId));
    TypedQuery<RunImpl> query = entityManager.createQuery(cq);
    List<RunImpl> runResultList = query.getResultList();
    return (List<Run>) (Object) runResultList;
  }

  @SuppressWarnings("unchecked")
  public List<Run> getRunListByOwner(User owner) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<RunImpl> cq = cb.createQuery(RunImpl.class);
    Root<RunImpl> runRoot = cq.from(RunImpl.class);
    cq.select(runRoot).where(cb.equal(runRoot.get("owner").get("id"), owner.getId()))
        .orderBy(cb.desc(runRoot.get("id")));
    TypedQuery<RunImpl> query = entityManager.createQuery(cq);
    List<RunImpl> runResultList = query.getResultList();
    return (List<Run>) (Object) runResultList;
  }

  @SuppressWarnings("unchecked")
  public List<Run> getRunListBySharedOwner(User owner) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<RunImpl> cq = cb.createQuery(RunImpl.class);
    Root<RunImpl> runRoot = cq.from(RunImpl.class);
    Root<UserImpl> userRoot = cq.from(UserImpl.class);
    cq.select(runRoot).where(cb.and(
        cb.equal(userRoot.get("id"), owner.getId()),
        cb.isMember(userRoot.get("id"), runRoot.<Set<User>>get("sharedowners"))))
        .orderBy(cb.desc(runRoot.get("id")));
    TypedQuery<RunImpl> query = entityManager.createQuery(cq);
    List<RunImpl> runResultList = query.getResultList();
    return (List<Run>) (Object) runResultList;
  }

  @SuppressWarnings("unchecked")
  public List<Run> getRunsRunWithinTimePeriod(String timePeriod) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<RunImpl> cq = cb.createQuery(RunImpl.class);
    Root<RunImpl> runRoot = cq.from(RunImpl.class);
    int days = 0;
    if (timePeriod.equals("today")) {
      days = 1;
    } else if (timePeriod.equals("week")) {
      days = 7;
    } else if (timePeriod.equals("month")) {
      days = 30;
    }
    Calendar c = Calendar.getInstance();
    c.add(Calendar.DAY_OF_YEAR, -days);
    Date compareDate = c.getTime();
    cq.select(runRoot).where(cb.greaterThanOrEqualTo(runRoot.get("lastRun"), compareDate));
    TypedQuery<RunImpl> query = entityManager.createQuery(cq);
    List<RunImpl> runResultList = query.getResultList();
    return (List<Run>) (Object) runResultList;
  }

  @SuppressWarnings("unchecked")
  public List<Run> getRunsByActivity() {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<RunImpl> cq = cb.createQuery(RunImpl.class);
    Root<RunImpl> runRoot = cq.from(RunImpl.class);
    cq.select(runRoot).where(cb.isNotNull(runRoot.get("timesRun")))
        .orderBy(cb.desc(runRoot.get("timesRun")));
    TypedQuery<RunImpl> query = entityManager.createQuery(cq);
    List<RunImpl> runResultList = query.getResultList();
    return (List<Run>) (Object) runResultList;
  }

  @Override
  public long getMaxRunId() {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<Long> cq = cb.createQuery(Long.class);
    Root<RunImpl> runRoot = cq.from(RunImpl.class);
    cq.select(cb.max(runRoot.<Long>get("id")));
    TypedQuery<Long> query = entityManager.createQuery(cq);
    try {
      return query.getSingleResult();
    } catch (NullPointerException e) {
      return 0;
    }
  }
}
