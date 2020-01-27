package org.wise.portal.dao.annotation.wise5.impl;

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
import org.wise.portal.dao.annotation.wise5.AnnotationDao;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.vle.domain.annotation.wise5.Annotation;
import org.wise.vle.domain.work.NotebookItem;
import org.wise.vle.domain.work.StudentWork;

/**
 * @author Hiroki Terashima
 */
@Repository("wise5AnnotationDao")
public class HibernateAnnotationDao extends AbstractHibernateDao<Annotation>
    implements AnnotationDao<Annotation> {

  @PersistenceContext
  private EntityManager entityManager;

  @Override
  protected String getFindAllQuery() {
    return null;
  }

  @Override
  protected Class<? extends Annotation> getDataObjectClass() {
    return null;
  }

  @Override
  @SuppressWarnings("unchecked")
  public List<Annotation> getAnnotationsByParams(
      Integer id, Run run, Group period, Workgroup fromWorkgroup, Workgroup toWorkgroup,
      String nodeId, String componentId, StudentWork studentWork, String localNotebookItemId,
      NotebookItem notebookItem, String type) {
    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    CriteriaBuilder cb = session.getCriteriaBuilder();
    CriteriaQuery<Annotation> cq = cb.createQuery(Annotation.class);
    Root<Annotation> annotationRoot = cq.from(Annotation.class);
    List<Predicate> predicates = new ArrayList<>();
    if (id != null) {
      predicates.add(cb.equal(annotationRoot.get("id"), id));
    }
    if (run != null) {
      predicates.add(cb.equal(annotationRoot.get("run"), run));
    }
    if (period != null) {
      predicates.add(cb.equal(annotationRoot.get("period"), period));
    }
    if (fromWorkgroup != null) {
      predicates.add(cb.equal(annotationRoot.get("fromWorkgroup"), fromWorkgroup));
    }
    if (toWorkgroup != null) {
      predicates.add(cb.equal(annotationRoot.get("toWorkgroup"), toWorkgroup));
    }
    if (nodeId != null) {
      predicates.add(cb.equal(annotationRoot.get("nodeId"), nodeId));
    }
    if (componentId != null) {
      predicates.add(cb.equal(annotationRoot.get("componentId"), componentId));
    }
    if (studentWork != null) {
      predicates.add(cb.equal(annotationRoot.get("studentWork"), studentWork));
    }
    if (notebookItem != null) {
      predicates.add(cb.equal(annotationRoot.get("notebookItem"), notebookItem));
    }
    if (localNotebookItemId != null) {
      predicates.add(cb.equal(annotationRoot.get("localNotebookItemId"), localNotebookItemId));
    }
    if (type != null) {
      predicates.add(cb.equal(annotationRoot.get("type"), type));
    }
    cq.select(annotationRoot).where(predicates.toArray(new Predicate[predicates.size()]));
    TypedQuery<Annotation> query = entityManager.createQuery(cq);
    return (List<Annotation>) (Object) query.getResultList();
  }
}
