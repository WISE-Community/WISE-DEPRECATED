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
package org.wise.portal.dao.achievement;

import java.util.ArrayList;
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
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.vle.domain.achievement.Achievement;

/**
 * Domain Access Object hibernate implementation for Achievements
 * @author Hiroki Terashima
 */
@Repository
public class HibernateAchievementDao extends AbstractHibernateDao<Achievement>
    implements AchievementDao<Achievement> {

  @PersistenceContext
  private EntityManager entityManager;

  @Override
  @SuppressWarnings("unchecked")
  public List<Achievement> getAchievementsByParams(Integer id, Run run, Workgroup workgroup,
      String achievementId, String type) {
    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    CriteriaBuilder cb = session.getCriteriaBuilder();
    CriteriaQuery<Achievement> cq = cb.createQuery(Achievement.class);
    Root<Achievement> achievementRoot = cq.from(Achievement.class);
    List<Predicate> predicates = new ArrayList<>();
    if (id != null) {
      predicates.add(cb.equal(achievementRoot.get("id"), id));
    }
    if (run != null) {
      predicates.add(cb.equal(achievementRoot.get("run"), run));
    }
    if (workgroup != null) {
      predicates.add(cb.equal(achievementRoot.get("workgroup"), workgroup));
    }
    if (achievementId != null) {
      predicates.add(cb.equal(achievementRoot.get("achievementId"), achievementId));
    }
    if (type != null) {
      predicates.add(cb.equal(achievementRoot.get("type"), type));
    }
    cq.select(achievementRoot).where(predicates.toArray(new Predicate[predicates.size()]))
        .orderBy(cb.asc(achievementRoot.get("achievementTime")));
    TypedQuery<Achievement> query = entityManager.createQuery(cq);
    return (List<Achievement>) (Object) query.getResultList();
  }

  @Override
  protected String getFindAllQuery() {
    return null;
  }

  @Override
  protected Class<? extends Achievement> getDataObjectClass() {
    return Achievement.class;
  }
}
