package org.wise.portal.dao.work.impl;

import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;
import org.springframework.stereotype.Repository;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.work.NotebookItemDao;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.workgroup.WISEWorkgroup;
import org.wise.vle.domain.work.NotebookItem;

import java.util.List;

/**
 * @author Hiroki Terashima
 */
@Repository
public class HibernateNotebookItemDao
        extends AbstractHibernateDao<NotebookItem>
        implements NotebookItemDao<NotebookItem> {

    @Override
    protected String getFindAllQuery() {
        return null;
    }

    @Override
    protected Class<? extends NotebookItem> getDataObjectClass() {
        return NotebookItem.class;
    }

    @Override
    public List<NotebookItem> getNotebookItemListByParams(
            Integer id, Run run, Group period, WISEWorkgroup workgroup,
            String nodeId, String componentId) {

        Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        Criteria sessionCriteria = session.createCriteria(NotebookItem.class);
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

        return sessionCriteria.list();
    }
}
