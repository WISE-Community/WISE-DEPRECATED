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

import org.hibernate.Criteria;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;
import org.springframework.stereotype.Repository;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.notification.NotificationDao;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.workgroup.WISEWorkgroup;
import org.wise.vle.domain.notification.Notification;

import java.util.ArrayList;
import java.util.List;

/**
 * Domain Access Object hibernate implementation for Notifications
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

    public List<Object[]> getNotificationExport(Integer runId) {
        String queryString =
                "SELECT n.id, n.nodeId, n.componentId, n.componentType, 'step number', 'step title', 'component part number', " +
                "n.serverSaveTime, n.timeGenerated, n.timeDismissed, n.type, n.groupId, n.message, n.data, n.periodId, n.runId, n.fromWorkgroupId, n.toWorkgroupId, " +
                "g.name as \"Period Name\", ud.username as \"Teacher Username\", r.project_fk as \"Project ID\", GROUP_CONCAT(gu.user_fk SEPARATOR ', ') as \"WISE IDs\" "+
                "FROM notification n, "+
                "workgroups w, "+
                "groups_related_to_users gu, "+
                "groups g, "+
                "runs r, "+
                "users u, "+
                "user_details ud "+
                "where n.runId = :runId and n.toWorkgroupId = w.id and w.group_fk = gu.group_fk and g.id = n.periodId and "+
                "n.runId = r.id and r.owner_fk = u.id and u.user_details_fk = ud.id "+
                "group by n.id, n.nodeId, n.componentId, n.componentType, n.serverSaveTime, n.timeGenerated, n.timeDismissed, n.type, n.groupId, n.message, n.data, n.periodId, n.runId, n.fromWorkgroupId, n.toWorkgroupId, "+
                "g.name, ud.username, r.project_fk order by n.toWorkgroupId";

        Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        SQLQuery query = session.createSQLQuery(queryString);
        query.setParameter("runId", runId);
        List resultList = new ArrayList<Object[]>();
        Object[] headerRow = new String[]{"id","node id","component id","component type","step number","step title","component part number",
                "serverSaveTime","timeGenerated","timeDismissed","type","group id","message","data","period id","run id","from workgroup id","to workgroup id",
                "period name", "teacher username", "project id", "WISE ids"};
        resultList.add(headerRow);
        resultList.addAll(query.list());
        return resultList;
    }

    @Override
    public List<Notification> getNotificationListByParams(
            Integer id, Run run, Group period, WISEWorkgroup toWorkgroup,
            String groupId, String nodeId, String componentId) {

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
        if (groupId != null) {
            sessionCriteria.add(Restrictions.eq("groupId", groupId));
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
