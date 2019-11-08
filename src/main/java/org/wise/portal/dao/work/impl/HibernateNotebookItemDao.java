package org.wise.portal.dao.work.impl;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.persistence.criteria.Subquery;

import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.springframework.stereotype.Repository;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.work.NotebookItemDao;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.vle.domain.work.NotebookItem;

/**
 * @author Hiroki Terashima
 */
@Repository
public class HibernateNotebookItemDao extends AbstractHibernateDao<NotebookItem>
      implements NotebookItemDao<NotebookItem> {

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
  protected Class<? extends NotebookItem> getDataObjectClass() {
    return NotebookItem.class;
  }

  @Override
  @SuppressWarnings("unchecked")
  public List<NotebookItem> getNotebookItemListByParams(Integer id, Run run, Group period,
      Workgroup workgroup, String nodeId, String componentId) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<NotebookItem> cq = cb.createQuery(NotebookItem.class);
    Subquery<Long> subQuery = cq.subquery(Long.class);
    Root<NotebookItem> subNotebookItemRoot = subQuery.from(NotebookItem.class);
    List<Predicate> subPredicates = new ArrayList<>();
    subPredicates.add(cb.equal(subNotebookItemRoot.get("run"), run));
    subPredicates.add(cb.isNull(subNotebookItemRoot.get("groups")));
    if (workgroup != null) {
      subPredicates.add(
          cb.equal(subNotebookItemRoot.get("workgroup"), workgroup));
    }
    if (period != null) {
      subPredicates.add(cb.equal(subNotebookItemRoot.get("period"), period));
    }
    if (nodeId != null) {
      subPredicates.add(cb.equal(subNotebookItemRoot.get("nodeId"), nodeId));
    }
    if (componentId != null) {
      subPredicates.add(cb.equal(subNotebookItemRoot.get("componentId"), componentId));
    }
    subQuery.select(cb.max(subNotebookItemRoot.get("id")))
        .where(subPredicates.toArray(new Predicate[subPredicates.size()]))
        .groupBy(subNotebookItemRoot.get("workgroup").get("id"),
        subNotebookItemRoot.get("localNotebookItemId"));
    Root<NotebookItem> notebookItemRoot = cq.from(NotebookItem.class);
    cq.select(notebookItemRoot).where(cb.in(notebookItemRoot.get("id")).value(subQuery));
    TypedQuery<NotebookItem> query = entityManager.createQuery(cq);
    return (List<NotebookItem>)(Object)query.getResultList();
  }

  @SuppressWarnings("unchecked")
  public List<NotebookItem> getNotebookItemByGroup(Integer runId, String groupName) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<NotebookItem> cq = cb.createQuery(NotebookItem.class);
    Subquery<Long> subQuery = cq.subquery(Long.class);
    Root<NotebookItem> subNotebookItemRoot = subQuery.from(NotebookItem.class);
    List<Predicate> subPredicates = new ArrayList<>();
    subPredicates.add(cb.equal(subNotebookItemRoot.get("run").get("id"), runId));
    subPredicates.add(cb.like(subNotebookItemRoot.get("groups"), "%" + groupName + "%"));
    subQuery.select(cb.max(subNotebookItemRoot.get("id")))
        .where(subPredicates.toArray(new Predicate[subPredicates.size()]))
        .groupBy(subNotebookItemRoot.get("workgroup").get("id"),
        subNotebookItemRoot.get("localNotebookItemId"));
    Root<NotebookItem> notebookItemRoot = cq.from(NotebookItem.class);
    cq.select(notebookItemRoot).where(cb.in(notebookItemRoot.get("id")).value(subQuery));
    TypedQuery<NotebookItem> query = entityManager.createQuery(cq);
    return (List<NotebookItem>)(Object)query.getResultList();
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
