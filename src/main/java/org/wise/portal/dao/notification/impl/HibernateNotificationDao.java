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
package org.wise.portal.dao.notification.impl;

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
import org.wise.portal.dao.notification.NotificationDao;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.vle.domain.notification.Notification;

/**
 * Domain Access Object hibernate implementation for Notifications
 * @author Hiroki Terashima
 */
@Repository
public class HibernateNotificationDao extends AbstractHibernateDao<Notification>
    implements NotificationDao<Notification> {

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
  protected Class<? extends Notification> getDataObjectClass() {
    return Notification.class;
  }

  @Override
  public List<Notification> getNotificationListByParams(Integer id, Run run, Group period,
      Workgroup toWorkgroup, String groupId, String nodeId, String componentId) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<Notification> cq = cb.createQuery(Notification.class);
    Root<Notification> notificationRoot = cq.from(Notification.class);
    List<Predicate> predicates = new ArrayList<>();
    if (id != null) {
      predicates.add(cb.equal(notificationRoot.get("id"), id));
    }
    if (run != null) {
      predicates.add(cb.equal(notificationRoot.get("run"), run));
    }
    if (period != null) {
      predicates.add(cb.equal(notificationRoot.get("period"), period));
    }
    if (toWorkgroup != null) {
      predicates.add(cb.equal(notificationRoot.get("toWorkgroup"), toWorkgroup));
    }
    if (groupId != null) {
      predicates.add(cb.equal(notificationRoot.get("groupId"), groupId));
    }
    if (nodeId != null) {
      predicates.add(cb.equal(notificationRoot.get("nodeId"), nodeId));
    }
    if (componentId != null) {
      predicates.add(cb.equal(notificationRoot.get("componentId"), componentId));
    }
    cq.select(notificationRoot).where(predicates.toArray(new Predicate[predicates.size()]));
    TypedQuery<Notification> query = entityManager.createQuery(cq);
    return (List<Notification>) query.getResultList();
  }

  @Override
  public List<Notification> getExport(Run run) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<Notification> cq = cb.createQuery(Notification.class);
    Root<Notification> notificationRoot = cq.from(Notification.class);
    List<Predicate> predicates = new ArrayList<>();
    predicates.add(cb.equal(notificationRoot.get("run"), run));
    cq.select(notificationRoot).where(predicates.toArray(new Predicate[predicates.size()]))
        .orderBy(cb.asc(notificationRoot.get("toWorkgroup")), cb.asc(notificationRoot.get("id")));
    TypedQuery<Notification> query = entityManager.createQuery(cq);
    return (List<Notification>) query.getResultList();
  }
}
