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
package org.wise.portal.dao.portal.impl;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

import org.hibernate.Session;
import org.springframework.stereotype.Repository;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.portal.PortalStatisticsDao;
import org.wise.portal.domain.portal.PortalStatistics;
import org.wise.portal.domain.portal.impl.PortalStatisticsImpl;

@Repository
public class HibernatePortalStatisticsDao extends AbstractHibernateDao<PortalStatistics>
    implements PortalStatisticsDao<PortalStatistics> {

  @PersistenceContext
  private EntityManager entityManager;

  private CriteriaBuilder getCriteriaBuilder() {
    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    return session.getCriteriaBuilder();
  }

  @Override
  protected Class<? extends PortalStatistics> getDataObjectClass() {
    return null;
  }

  @Override
  protected String getFindAllQuery() {
    return null;
  }

  @SuppressWarnings("unchecked")
  public List<PortalStatistics> getAllPortalStatistics() {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<PortalStatisticsImpl> cq = cb.createQuery(PortalStatisticsImpl.class);
    Root<PortalStatisticsImpl> portalStatisticsRoot = cq.from(PortalStatisticsImpl.class);
    cq.select(portalStatisticsRoot).orderBy(cb.asc(portalStatisticsRoot.get("timestamp")));
    TypedQuery<PortalStatisticsImpl> query = entityManager.createQuery(cq);
    return (List<PortalStatistics>) (Object) query.getResultList();
  }

  public PortalStatistics getLatestPortalStatistics() {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<PortalStatisticsImpl> cq = cb.createQuery(PortalStatisticsImpl.class);
    Root<PortalStatisticsImpl> portalStatisticsRoot = cq.from(PortalStatisticsImpl.class);
    cq.select(portalStatisticsRoot).orderBy(cb.desc(portalStatisticsRoot.get("timestamp")));
    TypedQuery<PortalStatisticsImpl> query = entityManager.createQuery(cq);
    return query.getResultStream().findFirst().orElse(null);
  }
}
