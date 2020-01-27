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
    return (List<NotebookItem>) query.getResultList();
  }

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
    return (List<NotebookItem>) query.getResultList();
  }

  public List<NotebookItem> getNotebookItemsExport(Run run) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<NotebookItem> cq = cb.createQuery(NotebookItem.class);
    Root<NotebookItem> notebookItemRoot = cq.from(NotebookItem.class);
    cq.select(notebookItemRoot).where(cb.equal(notebookItemRoot.get("run"), run))
        .orderBy(cb.asc(notebookItemRoot.get("workgroup").get("id")),
        cb.asc(notebookItemRoot.get("id")));
    TypedQuery<NotebookItem> query = entityManager.createQuery(cq);
    return (List<NotebookItem>) query.getResultList();
  }

  public List<NotebookItem> getLatestNotebookItemsExport(Run run) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<NotebookItem> cq = cb.createQuery(NotebookItem.class);
    Root<NotebookItem> notebookItemRoot = cq.from(NotebookItem.class);
    Subquery<Long> latestNotebookItemIds = getLatestNotebookItemIds(cb, cq);
    List<Predicate> predicates = new ArrayList<>();
    predicates.add(cb.equal(notebookItemRoot.get("run"), run));
    predicates.add(notebookItemRoot.get("id").in(latestNotebookItemIds));
    cq.select(notebookItemRoot).where(predicates.toArray(new Predicate[predicates.size()]))
        .orderBy(cb.asc(notebookItemRoot.get("workgroup").get("id")),
        cb.asc(notebookItemRoot.get("id")));
    TypedQuery<NotebookItem> query = entityManager.createQuery(cq);
    return (List<NotebookItem>) query.getResultList();
  }

  private Subquery<Long> getLatestNotebookItemIds(CriteriaBuilder cb, CriteriaQuery cq) {
    Subquery<Long> notebookItemSubquery = cq.subquery(Long.class);
    Root<NotebookItem> notebookItemRoot = notebookItemSubquery.from(NotebookItem.class);
    notebookItemSubquery.select(cb.max(notebookItemRoot.get("id")))
        .groupBy(notebookItemRoot.get("workgroup").get("id"),
        notebookItemRoot.get("localNotebookItemId"));
    return notebookItemSubquery; 
  }
}
