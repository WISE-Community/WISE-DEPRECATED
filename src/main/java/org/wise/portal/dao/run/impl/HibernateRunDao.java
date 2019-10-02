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
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

import org.hibernate.Criteria;
import org.hibernate.FetchMode;
import org.hibernate.Session;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Restrictions;
import org.springframework.dao.support.DataAccessUtils;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.run.RunDao;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;

/**
 * DAO for WISE run, which extends run
 *
 * @author Hiroki Terashima
 */
@Repository
public class HibernateRunDao extends AbstractHibernateDao<Run> implements RunDao<Run> {

  private static final String FIND_ALL_QUERY = "from RunImpl";

  /**
   * @see org.wise.portal.dao.impl.AbstractHibernateDao#getFindAllQuery()
   */
  @Override
  protected String getFindAllQuery() {
    return FIND_ALL_QUERY;
  }

  /**
   * @see org.wise.portal.dao.run.RunDao#retrieveByRunCode(String)
   */
  public Run retrieveByRunCode(String runcode) throws ObjectNotFoundException {
    Run run = (Run) DataAccessUtils
      .uniqueResult(this
        .getHibernateTemplate()
        .findByNamedParam(
          "from RunImpl as run where upper(run.runcode) = :runcode",
          "runcode", runcode.toUpperCase()));
    if (run == null)
      throw new ObjectNotFoundException(runcode, this
        .getDataObjectClass());
    return run;
  }

  /**
   * @see org.wise.portal.dao.impl.AbstractHibernateDao#getDataObjectClass()
   */
  @Override
  protected Class<RunImpl> getDataObjectClass() {
    return RunImpl.class;
  }

  /**
   * TODO HT comment and test this method
   */
  @SuppressWarnings("unchecked")
  public Set<Workgroup> getWorkgroupsForRun(Long runId) {
    List<Workgroup> workgroupList =  (List<Workgroup>) this.getHibernateTemplate()
      .findByNamedParam(
        "from WorkgroupImpl as workgroup where workgroup.run.id = :runId",
        "runId", runId);

    Set<Workgroup> workgroupSet = new TreeSet<Workgroup>();
    workgroupSet.addAll(workgroupList);
    return workgroupSet;
  }

  /**
   * @see org.wise.portal.dao.run.RunDao#getWorkgroupsForRunAndPeriod(java.lang.Long, java.lang.Long)
   */
  @SuppressWarnings("unchecked")
  public Set<Workgroup> getWorkgroupsForRunAndPeriod(Long runId, Long periodId) {
    String q = "select workgroup from WorkgroupImpl workgroup where workgroup.run.id = '" + runId + "' and " +
      "workgroup.period.id = '" + periodId + "' and workgroup.teacherWorkgroup = false";
    List<Workgroup> workgroupList = (List<Workgroup>) this.getHibernateTemplate().find(q);
    return new TreeSet<Workgroup>(workgroupList);
  }

  /**
   * @see org.wise.portal.dao.run.RunDao#retrieveByField(String, String, Object)
   */
  @SuppressWarnings("unchecked")
  public List<Run> retrieveByField(String field, String type, Object term){
    return (List<Run>) this.getHibernateTemplate().findByNamedParam(
      "select run from RunImpl run where run." + field + " " + type + " :term", "term", term);
  }

  /**
   * @see org.wise.portal.dao.run.RunDao#getRunListByUserInPeriod(User)
   */
  @SuppressWarnings("unchecked")
  public List<Run> getRunListByUserInPeriod(User user){
    String q = "select run from RunImpl run inner join run.periods period inner " +
      "join period.members user where user.id='" + user.getId() + "' order by run.id desc ";
    return (List<Run>) this.getHibernateTemplate().find(q);
  }

  /**
   * @see org.wise.portal.dao.run.RunDao#getRunsOfProject(java.lang.Long)
   */
  @SuppressWarnings("unchecked")
  public List<Run> getRunsOfProject(Long id){
    String q = "select run from RunImpl run where run.project.id=" + id;
    return (List<Run>) this.getHibernateTemplate().find(q);
  }

  @SuppressWarnings("unchecked")
  public List<Run> getRunListByOwner(User owner) {
    if (owner == null) {
      return new ArrayList<Run>();
    }

    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    List<Run> result = session.createCriteria(RunImpl.class)
      .add(Restrictions.eq("owner", owner))
      .addOrder(Order.desc("id"))
      .list();

    return result;
  }

  @SuppressWarnings("unchecked")
  public List<Run> getRunListBySharedOwner(User owner) {
    String q = "select run from RunImpl run inner join run.sharedowners owner where owner.id='" + owner.getId() + "' order by run.id desc";
    return (List<Run>) this.getHibernateTemplate().find(q);
  }

  /**
   * @see org.wise.portal.dao.run.RunDao#getRunsRunWithinPeriod(java.lang.String)
   */
  @SuppressWarnings("unchecked")
  public List<Run> getRunsRunWithinPeriod(String period){
    String oper = null, value = null;

    if(period.equals("today")){
      oper = " = ";
      value = "0";
    } else if(period.equals("week")){
      oper = " <= ";
      value = "7";
    } else if(period.equals("month")){
      oper = " <= ";
      value = String.valueOf(Calendar.getInstance().getActualMaximum(Calendar.DAY_OF_MONTH));
    }

    return (List<Run>) this.getHibernateTemplate().find("select run from RunImpl run where datediff(curdate(), run.lastRun)" + oper + value);
  }

  /**
   * @see org.wise.portal.dao.run.RunDao#getRunsByActivity()
   */
  @SuppressWarnings("unchecked")
  public List<Run> getRunsByActivity(){
    String q = "select run from RunImpl run where run.timesRun <> null order by run.timesRun desc";
    return (List<Run>) this.getHibernateTemplate().find(q);
  }

  @Override
  @Transactional(readOnly=true)
  public Run getById(Long runId, boolean doEagerFetch) {

    Run result = null;
    if (doEagerFetch) {
      Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
      result = (Run) session.createCriteria(RunImpl.class)
        .setFetchMode("project", FetchMode.JOIN)
        .setFetchMode("periods", FetchMode.JOIN)
        .setFetchMode("owners", FetchMode.JOIN)
        .setFetchMode("sharedowners", FetchMode.JOIN)
        .setFetchMode("announcements", FetchMode.JOIN)
        .add( Restrictions.eq("id", runId))
        .uniqueResult();
    } else {
      result = (Run) this.getHibernateTemplate().get(
        this.getDataObjectClass(), runId);
    }
    return result;
  }

  @Override
  public long getMaxRunId() {
    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    Criteria crit = session.createCriteria(RunImpl.class);
    crit.setProjection(Projections.max("id"));
    List<Long> results = crit.list();
    try {
      return results.get(0);
    } catch (NullPointerException npe) {
      return 0;
    }
  }
}
