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
import org.hibernate.criterion.Conjunction;
import org.hibernate.criterion.Disjunction;
import org.hibernate.criterion.LogicalExpression;
import org.hibernate.criterion.Restrictions;
import org.hibernate.criterion.SimpleExpression;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.stereotype.Repository;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.work.StudentWorkDao;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.workgroup.WISEWorkgroup;
import org.wise.vle.domain.work.StudentWork;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Hiroki Terashima
 */
@Repository
public class HibernateStudentWorkDao extends AbstractHibernateDao<StudentWork> implements StudentWorkDao<StudentWork> {
    @Override
    protected String getFindAllQuery() {
        return null;
    }

    @Override
    protected Class<? extends StudentWork> getDataObjectClass() {
        return StudentWork.class;
    }

    public List<Object[]> getStudentWorkExport(Integer runId) {
        String queryString =
                "SELECT sw.id, sw.nodeId, sw.componentId, sw.componentType, 'step number', 'step title', 'component part number', " +
                "sw.isAutoSave, sw.isSubmit, sw.clientSaveTime, sw.serverSaveTime, sw.studentData, sw.periodId, sw.runId, sw.workgroupId, " +
                "g.name as \"Period Name\", ud.username as \"Teacher Username\", r.project_fk as \"Project ID\", GROUP_CONCAT(gu.user_fk SEPARATOR ', ') \"WISE IDs\" " +
                "FROM studentWork sw, " +
                "workgroups w, " +
                "groups_related_to_users gu, " +
                "groups g, " +
                "runs r, " +
                "users u, " +
                "user_details ud " +
                "where sw.runId = :runId and sw.workgroupId = w.id and w.group_fk = gu.group_fk and g.id = sw.periodId and " +
                "sw.runId = r.id and r.owner_fk = u.id and u.user_details_fk = ud.id " +
                "group by sw.id, sw.nodeId, sw.componentId, sw.componentType, sw.isAutoSave, sw.isSubmit, sw.clientSaveTime, sw.serverSaveTime, sw.studentData, sw.periodId, sw.runId, sw.workgroupId, g.name, ud.username, r.project_fk order by workgroupId";
        Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        SQLQuery query = session.createSQLQuery(queryString);
        query.setParameter("runId", runId);
        List resultList = new ArrayList<Object[]>();
        Object[] headerRow = new String[]{"id","node id","component id","component type","step number","step title","component part number",
                "isAutoSave","isSubmit","client save time","server save time","student data","period id","run id","workgroup id",
                "period name", "teacher username", "project id", "WISE ids"};
        resultList.add(headerRow);
        resultList.addAll(query.list());
        return resultList;
    }

    @Override
    public List<StudentWork> getStudentWorkListByParams(
            Integer id, Run run, Group period, WISEWorkgroup workgroup,
            Boolean isAutoSave, Boolean isSubmit,
            String nodeId, String componentId, String componentType,
            List<JSONObject> components) {

        Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        Criteria sessionCriteria = session.createCriteria(StudentWork.class);

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
        if (isAutoSave != null) {
            sessionCriteria.add(Restrictions.eq("isAutoSave", isAutoSave));
        }
        if (isSubmit != null) {
            sessionCriteria.add(Restrictions.eq("isSubmit", isSubmit));
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
        if (components != null) {

            // create the criteria to accept any of the components by using an 'or' conditional
            Disjunction disjunction = Restrictions.disjunction();

            // loop through all the components
            for (int c = 0; c < components.size(); c++) {
                JSONObject component = components.get(c);

                if (component != null) {
                    try {
                        // get the node id and component id of the component
                        String tempNodeId = component.getString("nodeId");
                        String tempComponentId = component.getString("componentId");

                        // create restrictions to match the node id and component id
                        SimpleExpression nodeIdRestriction = Restrictions.eq("nodeId", tempNodeId);
                        SimpleExpression componentIdRestriction = Restrictions.eq("componentId", tempComponentId);

                        // require the node id and component id to match by using an 'and' conditional
                        Conjunction conjunction = Restrictions.conjunction(nodeIdRestriction, componentIdRestriction);

                        // add the restriction to the 'or' conditional
                        disjunction.add(conjunction);
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }
            }

            // add the restriction to the main criteria
            sessionCriteria.add(disjunction);
        }

        return sessionCriteria.list();
    }
}
