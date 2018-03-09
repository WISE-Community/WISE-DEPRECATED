package org.wise.portal.dao.work.impl;

import org.hibernate.Criteria;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;
import org.springframework.stereotype.Repository;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.work.NotebookItemDao;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.vle.domain.work.NotebookItem;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Hiroki Terashima
 */
@Repository
public class HibernateNotebookItemDao extends AbstractHibernateDao<NotebookItem>
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
    Integer id, Run run, Group period, Workgroup workgroup,
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

  public List<NotebookItem> getNotebookItemByGroup(Integer runId, String groupName) {
    String queryString = "select n.* from notebookItems n " +
        "inner join " +
        "(select max(id) as maxId, workgroupId, localNotebookItemId from notebookItems " +
        "where runId = :runId group by workgroupId, localNotebookItemId) n2 " +
        "on n.id = n2.maxId and n.groups like :groupName";
    Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
    SQLQuery query = session.createSQLQuery(queryString).addEntity("n", NotebookItem.class);
    query.setParameter("runId", runId);
    query.setParameter("groupName", "%\"" + groupName + "\"%");
    return (List<NotebookItem>) query.list();
  }

  public List<Object[]> getNotebookItemExport(Integer runId) {
    String queryString =
      "SELECT n.id, n.localNotebookItemId, n.nodeId, n.componentId, 'step number', 'step title', 'component part number', " +
        "n.clientSaveTime, n.serverSaveTime, n.type, n.content, n.periodId, n.runId, n.workgroupId, " +
        "g.name as \"Period Name\", ud.username as \"Teacher Username\", r.project_fk as \"Project ID\", GROUP_CONCAT(gu.user_fk SEPARATOR ', ') \"WISE IDs\" " +
        "FROM notebookItems n, " +
        "workgroups w, " +
        "groups_related_to_users gu, " +
        "groups g, " +
        "runs r, " +
        "users u, " +
        "user_details ud " +
        "where n.runId = :runId and n.workgroupId = w.id and w.group_fk = gu.group_fk and g.id = n.periodId and " +
        "n.runId = r.id and r.owner_fk = u.id and u.user_details_fk = ud.id " +
        "group by n.id, n.localNotebookItemId, n.nodeId, n.componentId, n.clientSaveTime, n.serverSaveTime, n.type, n.content, n.periodId, n.runId, n.workgroupId, g.name, ud.username, r.project_fk order by workgroupId";
    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    SQLQuery query = session.createSQLQuery(queryString);
    query.setParameter("runId", runId);
    List resultList = new ArrayList<Object[]>();
    Object[] headerRow = new String[]{"id","note item id","node id","component id","step number","step title","component part number",
      "client save time","server save time","type","content","period id","run id","workgroup id",
      "period name", "teacher username", "project id", "WISE ids"};
    resultList.add(headerRow);
    resultList.addAll(query.list());
    return resultList;
  }
}
