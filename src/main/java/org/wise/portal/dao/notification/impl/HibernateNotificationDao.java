package org.wise.portal.dao.notification.impl;

import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;
import org.springframework.stereotype.Repository;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.notification.NotificationDao;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.workgroup.WISEWorkgroup;
import org.wise.vle.domain.notification.Notification;

import java.util.List;

/**
 * @author Hiroki Terashima
 */
@Repository
public class HibernateNotificationDao
    extends AbstractHibernateDao<Notification>
    implements NotificationDao<Notification> {

    @Override
    protected String getFindAllQuery() {
        return null;
    }

    @Override
    protected Class<? extends Notification> getDataObjectClass() {
        return Notification.class;
    }

    @Override
    public List<Notification> getNotificationListByParams(
            Integer id, Run run, Group period, WISEWorkgroup toWorkgroup,
            String nodeId, String componentId) {

        Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        Criteria sessionCriteria = session.createCriteria(Notification.class);
        if (id != null) {
            sessionCriteria.add(Restrictions.eq("id", id));
        }
        if (run != null) {
            sessionCriteria.add(Restrictions.eq("run", run));
        }
        if (period != null) {
            sessionCriteria.add(Restrictions.eq("period", period));
        }
        if (toWorkgroup != null) {
            sessionCriteria.add(Restrictions.eq("toWorkgroup", toWorkgroup));
        }
        if (nodeId != null) {
            sessionCriteria.add(Restrictions.eq("nodeId", nodeId));
        }
        if (componentId != null) {
            sessionCriteria.add(Restrictions.eq("componentId", componentId));
        }

        return sessionCriteria.list();
    }
}
