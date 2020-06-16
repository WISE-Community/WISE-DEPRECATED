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

import org.hibernate.Session;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.stereotype.Repository;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.work.StudentWorkDao;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.vle.domain.work.StudentWork;

/**
 * @author Hiroki Terashima
 */
@Repository
public class HibernateStudentWorkDao extends AbstractHibernateDao<StudentWork>
    implements StudentWorkDao<StudentWork> {

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
  protected Class<? extends StudentWork> getDataObjectClass() {
    return StudentWork.class;
  }

  @Override
  public List<StudentWork> getStudentWorkListByParams(Integer id, Run run, Group period,
      Workgroup workgroup, Boolean isAutoSave, Boolean isSubmit, String nodeId, String componentId,
      String componentType, List<JSONObject> components) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<StudentWork> cq = cb.createQuery(StudentWork.class);
    Root<StudentWork> studentWorkRoot = cq.from(StudentWork.class);
    List<Predicate> predicates = getStudentWorkListByParamsPredicates(cb, studentWorkRoot,
        id, run, period, workgroup, isAutoSave, isSubmit, nodeId, componentId, componentType,
        components);
    cq.select(studentWorkRoot).where(predicates.toArray(new Predicate[predicates.size()]))
        .orderBy(cb.asc(studentWorkRoot.get("serverSaveTime")));
    TypedQuery<StudentWork> query = entityManager.createQuery(cq);
    return (List<StudentWork>) query.getResultList();
  }

  private List<Predicate> getStudentWorkListByParamsPredicates(CriteriaBuilder cb,
      Root<StudentWork> studentWorkRoot, Integer id, Run run, Group period, Workgroup workgroup,
      Boolean isAutoSave, Boolean isSubmit, String nodeId, String componentId, String componentType,
      List<JSONObject> components) {
    List<Predicate> predicates = new ArrayList<>();
    if (id != null) {
      predicates.add(cb.equal(studentWorkRoot.get("id"), id));
    }
    if (run != null) {
      predicates.add(cb.equal(studentWorkRoot.get("run"), run));
    }
    if (period != null) {
      predicates.add(cb.equal(studentWorkRoot.get("period"), period));
    }
    if (workgroup != null) {
      predicates.add(cb.equal(studentWorkRoot.get("workgroup"), workgroup));
    }
    if (isAutoSave != null) {
      predicates.add(cb.equal(studentWorkRoot.get("isAutoSave"), isAutoSave));
    }
    if (isSubmit != null) {
      predicates.add(cb.equal(studentWorkRoot.get("isSubmit"), isSubmit));
    }
    if (nodeId != null) {
      predicates.add(cb.equal(studentWorkRoot.get("nodeId"), nodeId));
    }
    if (componentId != null) {
      predicates.add(cb.equal(studentWorkRoot.get("componentId"), componentId));
    }
    if (componentType != null) {
      predicates.add(cb.equal(studentWorkRoot.get("componentType"), componentType));
    }
    if (components != null) {
      List<Predicate> componentsPredicates = new ArrayList<>();
      for (int c = 0; c < components.size(); c++) {
        JSONObject component = components.get(c);
        try {
          componentsPredicates.add(cb.and(
              cb.equal(studentWorkRoot.get("nodeId"), component.getString("nodeId")),
              cb.equal(studentWorkRoot.get("componentId"), component.getString("componentId"))));
        } catch (JSONException e) {
          e.printStackTrace();
        }
      }
      predicates.add(cb.or(
          componentsPredicates.toArray(new Predicate[componentsPredicates.size()])));
    }
    return predicates;
  }
}
