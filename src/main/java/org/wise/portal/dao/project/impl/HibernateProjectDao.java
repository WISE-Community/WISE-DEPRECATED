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
package org.wise.portal.dao.project.impl;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.persistence.criteria.Subquery;

import org.hibernate.Session;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.project.ProjectDao;
import org.wise.portal.domain.impl.TagImpl;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.ProjectImpl;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;

/**
 * @author Hiroki Terashima
 */
@Repository
public class HibernateProjectDao extends AbstractHibernateDao<Project> implements
    ProjectDao<Project> {

  @PersistenceContext
  private EntityManager entityManager;

  private static final String FIND_ALL_QUERY = "from ProjectImpl";

  @Override
  protected String getFindAllQuery() {
    return FIND_ALL_QUERY;
  }

  @Override
  protected Class<? extends ProjectImpl> getDataObjectClass() {
    return ProjectImpl.class;
  }

  public Project createEmptyProject() {
    return new ProjectImpl();
  }

  private CriteriaBuilder getCriteriaBuilder() {
    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    return session.getCriteriaBuilder();
  }

  @SuppressWarnings("unchecked")
  public List<Project> getSharedProjectsWithoutRun(User user) {
    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    CriteriaBuilder cb = session.getCriteriaBuilder();
    CriteriaQuery<ProjectImpl> cq = cb.createQuery(ProjectImpl.class);
    Root<ProjectImpl> projectRoot = cq.from(ProjectImpl.class);
    Root<UserImpl> userRoot = cq.from(UserImpl.class);
    Subquery<RunImpl> runProjectIds = getRunProjectIds(cq);
    List<Predicate> predicates = new ArrayList<>();
    predicates.add(cb.equal(userRoot.get("id"), user.getId()));
    predicates.add(cb.isMember(userRoot.get("id"), projectRoot.<Set<User>>get("sharedowners")));
    predicates.add(cb.not(projectRoot.get("id").in(runProjectIds)));
    cq.select(projectRoot).where(predicates.toArray(new Predicate[predicates.size()]));
    TypedQuery<ProjectImpl> query = entityManager.createQuery(cq);
    List<ProjectImpl> projectResultList = query.getResultList();
    return (List<Project>) (Object) projectResultList;
  }

  private Subquery<RunImpl> getRunProjectIds(CriteriaQuery cq) {
    Subquery<RunImpl> runsSubquery = cq.subquery(RunImpl.class);
    Root<RunImpl> runRoot = runsSubquery.from(RunImpl.class);
    runsSubquery.select(runRoot.get("project").get("id"));
    return runsSubquery;
  }

  @SuppressWarnings("unchecked")
  public List<Project> getProjectListByUAR(User user, String role) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<ProjectImpl> cq = cb.createQuery(ProjectImpl.class);
    Root<ProjectImpl> projectRoot = cq.from(ProjectImpl.class);
    Root<UserImpl> userRoot = cq.from(UserImpl.class);
    List<Predicate> predicates = new ArrayList<>();
    predicates.add(cb.equal(userRoot.get("id"), user.getId()));
    predicates.add(cb.isMember(userRoot, projectRoot.<Set<UserImpl>>get(role)));
    cq.select(projectRoot).where(predicates.toArray(new Predicate[predicates.size()]));
    TypedQuery<ProjectImpl> query = entityManager.createQuery(cq);
    List<ProjectImpl> projectResultList = query.getResultList();
    return (List<Project>) (Object) projectResultList;
  }

  @SuppressWarnings("unchecked")
  @Override
  public List<Project> getList() {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<ProjectImpl> cq = cb.createQuery(ProjectImpl.class);
    Root<ProjectImpl> projectRoot = cq.from(ProjectImpl.class);
    cq.select(projectRoot);
    TypedQuery<ProjectImpl> query = entityManager.createQuery(cq);
    List<ProjectImpl> projectResultList = query.getResultList();
    return (List<Project>) (Object) projectResultList;
  }

  @Override
  public Project getById(Serializable id) throws ObjectNotFoundException {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<ProjectImpl> cq = cb.createQuery(ProjectImpl.class);
    Root<ProjectImpl> projectRoot = cq.from(ProjectImpl.class);
    cq.select(projectRoot).where(cb.equal(projectRoot.get("id"), id));
    TypedQuery<ProjectImpl> query = entityManager.createQuery(cq);
    try {
      return query.setMaxResults(1).getSingleResult();
    } catch(NoResultException e) {
      throw new ObjectNotFoundException((Long) id, ProjectImpl.class);
    }
  }

  @SuppressWarnings("unchecked")
  public List<Project> getProjectListByOwner(User owner) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<ProjectImpl> cq = cb.createQuery(ProjectImpl.class);
    Root<ProjectImpl> projectRoot = cq.from(ProjectImpl.class);
    cq.select(projectRoot).where(cb.equal(projectRoot.get("owner").get("id"), owner.getId()))
        .orderBy(cb.desc(projectRoot.get("id")));
    TypedQuery<ProjectImpl> query = entityManager.createQuery(cq);
    List<ProjectImpl> projectResultList = query.getResultList();
    return (List<Project>) (Object) projectResultList;
  }

  @SuppressWarnings("unchecked")
  @Transactional
  public List<Project> getProjectListByTagNames(Set<String> tagNames) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<ProjectImpl> cq = cb.createQuery(ProjectImpl.class);
    Root<ProjectImpl> projectRoot = cq.from(ProjectImpl.class);
    Root<TagImpl> tagRoot = cq.from(TagImpl.class);
    cq.select(projectRoot).where(cb.and(tagRoot.get("name").in(tagNames),
        cb.isMember(tagRoot, projectRoot.<Set<TagImpl>>get("tags")))).distinct(true);
    TypedQuery<ProjectImpl> query = entityManager.createQuery(cq);
    List<ProjectImpl> projectResultList = query.getResultList();
    return (List<Project>) (Object) projectResultList;
  }

  @SuppressWarnings("unchecked")
  @Override
  public List<Project> getProjectListByAuthorName(String authorName) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<ProjectImpl> cq = cb.createQuery(ProjectImpl.class);
    Root<ProjectImpl> projectRoot = cq.from(ProjectImpl.class);
    cq.select(projectRoot).where(cb.like(
        projectRoot.get("owner").get("userDetails").get("username"), "%" + authorName + "%"));
    TypedQuery<ProjectImpl> query = entityManager.createQuery(cq);
    List<ProjectImpl> projectResultList = query.getResultList();
    return (List<Project>) (Object) projectResultList;
  }

  @SuppressWarnings("unchecked")
  @Override
  public List<Project> getProjectListByTitle(String title) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<ProjectImpl> cq = cb.createQuery(ProjectImpl.class);
    Root<ProjectImpl> projectRoot = cq.from(ProjectImpl.class);
    cq.select(projectRoot).where(cb.like(projectRoot.get("name"), "%" + title + "%"));
    TypedQuery<ProjectImpl> query = entityManager.createQuery(cq);
    List<ProjectImpl> projectResultList = query.getResultList();
    return (List<Project>) (Object) projectResultList;
  }

  @SuppressWarnings("unchecked")
  public List<Project> getProjectCopies(Long parentProjectId) {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<ProjectImpl> cq = cb.createQuery(ProjectImpl.class);
    Root<ProjectImpl> projectRoot = cq.from(ProjectImpl.class);
    cq.select(projectRoot).where(cb.equal(projectRoot.get("parentProjectId"), parentProjectId));
    TypedQuery<ProjectImpl> query = entityManager.createQuery(cq);
    List<ProjectImpl> projectResultList = query.getResultList();
    return (List<Project>) (Object) projectResultList;
  }

  @SuppressWarnings("unchecked")
  public List<Project> getProjectsWithoutRuns(User user) {
    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    CriteriaBuilder cb = session.getCriteriaBuilder();
    CriteriaQuery<ProjectImpl> cq = cb.createQuery(ProjectImpl.class);
    Root<ProjectImpl> projectRoot = cq.from(ProjectImpl.class);
    Root<UserImpl> userRoot = cq.from(UserImpl.class);
    Subquery<RunImpl> runProjectIds = getRunProjectIds(cq);
    List<Predicate> predicates = new ArrayList<>();
    predicates.add(cb.equal(userRoot.get("id"), user.getId()));
    predicates.add(cb.equal(userRoot.get("id"), projectRoot.get("owner")));
    predicates.add(cb.not(projectRoot.get("id").in(runProjectIds)));
    cq.select(projectRoot).where(predicates.toArray(new Predicate[predicates.size()]));
    TypedQuery<ProjectImpl> query = entityManager.createQuery(cq);
    List<ProjectImpl> projectResultList = query.getResultList();
    return (List<Project>) (Object) projectResultList;
  }

  @SuppressWarnings("unchecked")
  public List<Project> getAllSharedProjects() {
    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    CriteriaBuilder cb = session.getCriteriaBuilder();
    CriteriaQuery<ProjectImpl> cq = cb.createQuery(ProjectImpl.class);
    Root<ProjectImpl> projectRoot = cq.from(ProjectImpl.class);
    cq.select(projectRoot).where(cb.isNotEmpty(projectRoot.get("sharedowners")));
    TypedQuery<ProjectImpl> query = entityManager.createQuery(cq);
    List<ProjectImpl> projectResultList = query.getResultList();
    return (List<Project>) (Object) projectResultList;
  }

  @Override
  public long getMaxProjectId() {
    CriteriaBuilder cb = getCriteriaBuilder();
    CriteriaQuery<Long> cq = cb.createQuery(Long.class);
    Root<ProjectImpl> runRoot = cq.from(ProjectImpl.class);
    cq.select(cb.max(runRoot.<Long>get("id")));
    TypedQuery<Long> query = entityManager.createQuery(cq);
    try {
      return query.getSingleResult();
    } catch (NullPointerException e) {
      return 0;
    }
  }
}
