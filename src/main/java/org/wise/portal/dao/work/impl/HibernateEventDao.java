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
package org.wise.portal.dao.work.impl;

import org.hibernate.Criteria;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;
import org.springframework.stereotype.Repository;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.work.EventDao;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.workgroup.WISEWorkgroup;
import org.wise.vle.domain.work.Event;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Hiroki Terashima
 */
@Repository
public class HibernateEventDao extends AbstractHibernateDao<Event> implements EventDao<Event> {

    @Override
    protected String getFindAllQuery() {
        return null;
    }

    @Override
    protected Class<? extends Event> getDataObjectClass() {
        return Event.class;
    }

    public List<Object[]> getStudentEventExport(Integer runId) {
        String queryString =
                "SELECT e.id, e.nodeId, e.componentId, e.componentType, 'step number', 'step title', 'component part number', " +
                        "e.clientSaveTime, e.serverSaveTime, e.category, e.context, e.event, e.data, e.periodId, e.runId, e.workgroupId, " +
                        "g.name as \"Period Name\", ud.username as \"Teacher Username\", r.project_fk as \"Project ID\", GROUP_CONCAT(gu.user_fk SEPARATOR ', ') \"WISE IDs\" " +
                        "FROM events e, " +
                        "workgroups w, " +
                        "groups_related_to_users gu, " +
                        "groups g, " +
                        "runs r, " +
                        "users u, " +
                        "user_details ud " +
                        "where e.runId = :runId and e.workgroupId = w.id and w.group_fk = gu.group_fk and g.id = e.periodId and " +
                        "e.runId = r.id and r.owner_fk = u.id and u.user_details_fk = ud.id " +
                        "group by e.id, e.nodeId, e.componentId, e.componentType, e.clientSaveTime, e.serverSaveTime, e.category, e.context, e.event, e.data, e.periodId, e.runId, e.workgroupId, g.name, ud.username, r.project_fk order by workgroupId ";

        Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        SQLQuery query = session.createSQLQuery(queryString);
        query.setParameter("runId", runId);
        List resultList = new ArrayList<Object[]>();
        Object[] headerRow = new String[]{"id","node id","component id","component type","step number","step title","component part number",
                "client save time","server save time","category", "context", "event", "data","period id","run id","workgroup id",
                "period name", "teacher username", "project id", "WISE ids"};
        resultList.add(headerRow);
        resultList.addAll(query.list());
        return resultList;
    }

    @Override
    public List<Event> getEventsByParams(Integer id, Run run, Group period, WISEWorkgroup workgroup,
                                            String nodeId, String componentId, String componentType,
                                            String context, String category, String event) {

        Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        Criteria sessionCriteria = session.createCriteria(Event.class);

        if (id != null) {
            sessionCriteria.add(Restrictions.eq("id", id));
        }
        if (run != null) {
            sessionCriteria.add(Restrictions.eq("run", run));
        }
        if (period != null) {
            sessionCriteria.add(Restrictions.eq("period", period));
        }
        if (workgroup != null) {
            sessionCriteria.add(Restrictions.eq("workgroup", workgroup));
        }
        if (nodeId != null) {
            sessionCriteria.add(Restrictions.eq("nodeId", nodeId));
        }
        if (componentId != null) {
            sessionCriteria.add(Restrictions.eq("componentId", componentId));
        }
        if (componentType != null) {
            sessionCriteria.add(Restrictions.eq("componentType", componentType));
        }
        if (context != null) {
            sessionCriteria.add(Restrictions.eq("context", context));
        }
        if (category != null) {
            sessionCriteria.add(Restrictions.eq("category", category));
        }
        if (event != null) {
            sessionCriteria.add(Restrictions.eq("event", event));
        }

        return sessionCriteria.list();
    }
}
