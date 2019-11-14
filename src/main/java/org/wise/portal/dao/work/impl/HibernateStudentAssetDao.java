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
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.work.StudentAssetDao;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.vle.domain.work.StudentAsset;

/**
 * @author Hiroki Terashima
 */
@Repository
public class HibernateStudentAssetDao extends AbstractHibernateDao<StudentAsset>
    implements StudentAssetDao<StudentAsset> {

  @PersistenceContext
  private EntityManager entityManager;
  
  @Override
  protected String getFindAllQuery() {
    return null;
  }

  @Override
  protected Class<? extends StudentAsset> getDataObjectClass() {
    return StudentAsset.class;
  }

  private CriteriaBuilder getCriteriaBuilder() {
    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    return session.getCriteriaBuilder(); 
  }

  @Override
  public List<StudentAsset> getStudentAssetListByParams(Integer id, Run run, Group period,
      Workgroup workgroup, String nodeId, String componentId, String componentType,
      Boolean isReferenced) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<StudentAsset> cq = cb.createQuery(StudentAsset.class); 
    Root<StudentAsset> studentAssetRoot = cq.from(StudentAsset.class);
    List<Predicate> predicates = new ArrayList<>();
    if (id != null) {
      predicates.add(cb.equal(studentAssetRoot.get("id"), id));
    }
    if (run != null) {
      predicates.add(cb.equal(studentAssetRoot.get("run"), run));
    }
    if (period != null) {
      predicates.add(cb.equal(studentAssetRoot.get("period"), period));
    }
    if (workgroup != null) {
      predicates.add(cb.equal(studentAssetRoot.get("workgroup"), workgroup));
    }
    if (nodeId != null) {
      predicates.add(cb.equal(studentAssetRoot.get("nodeId"), nodeId));
    }
    if (componentId != null) {
      predicates.add(cb.equal(studentAssetRoot.get("componentId"), componentId));
    }
    if (componentType != null) {
      predicates.add(cb.equal(studentAssetRoot.get("componentType"), componentType));
    }
    if (isReferenced != null) {
      predicates.add(cb.equal(studentAssetRoot.get("isReferenced"), isReferenced));
    }
    cq.select(studentAssetRoot).where(predicates.toArray(new Predicate[predicates.size()]));
    TypedQuery<StudentAsset> query = entityManager.createQuery(cq);
    List<StudentAsset> studentAssetResultList = query.getResultList();
    return (List<StudentAsset>) studentAssetResultList;
  }
}
