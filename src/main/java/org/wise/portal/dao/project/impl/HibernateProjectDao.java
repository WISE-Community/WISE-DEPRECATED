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

import org.hibernate.Criteria;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Property;
import org.hibernate.criterion.Restrictions;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.project.ProjectDao;
import org.wise.portal.domain.project.FamilyTag;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.ProjectInfo;
import org.wise.portal.domain.project.Tag;
import org.wise.portal.domain.project.impl.ProjectImpl;
import org.wise.portal.domain.user.User;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * @author Hiroki Terashima
 */
@Repository
public class HibernateProjectDao extends AbstractHibernateDao<Project> implements
    ProjectDao<Project> {

  private static final String FIND_ALL_QUERY = "from ProjectImpl";

  /**
   * @see org.wise.portal.dao.run.RunDao#retrieveByRunCode(String)
   */
  @SuppressWarnings("unchecked")
  public List<Project> retrieveListByTag(FamilyTag familytag) throws ObjectNotFoundException {
    List<Project> projects = (List<Project>) this
      .getHibernateTemplate()
      .findByNamedParam(
        "from ProjectImpl as project where project.familytag = :familytag",
        "familytag", familytag);
    if (projects == null)
      throw new ObjectNotFoundException(familytag, this
        .getDataObjectClass());
    return projects;
  }

  /**
   * @see org.wise.portal.dao.run.RunDao#retrieveByRunCode(String)
   */
  @SuppressWarnings("unchecked")
  public List<Project> retrieveListByTag(String projectinfotag) throws ObjectNotFoundException {
    List<Project> projects = (List<Project>) this
      .getHibernateTemplate()
      .findByNamedParam(
        "from ProjectImpl as project where upper(project.projectinfotag) = :projectinfotag",
        "projectinfotag", projectinfotag.toString().toUpperCase());
    if (projects == null)
      throw new ObjectNotFoundException(projectinfotag, this
        .getDataObjectClass());
    return projects;
  }

  /**
   * @see org.wise.portal.dao.impl.AbstractHibernateDao#getFindAllQuery()
   */
  @Override
  protected String getFindAllQuery() {
    return FIND_ALL_QUERY;
  }

  /**
   * @see org.wise.portal.dao.impl.AbstractHibernateDao#getDataObjectClass()
   */
  @Override
  protected Class<? extends ProjectImpl> getDataObjectClass() {
    return ProjectImpl.class;
  }

  public Project createEmptyProject() {
    return new ProjectImpl();
  }

  public List<Project> retrieveListByInfo(ProjectInfo projectinfo)
    throws ObjectNotFoundException {

    return this.retrieveListByTag(projectinfo.getFamilyTag());
  }

  /**
   * @see org.wise.portal.dao.project.ProjectDao#getProjectListByUAR(net.sf.sail.webapp.domain.User, java.lang.String)
   */
  public List<Project> getProjectListByUAR(User user, String role){
    String q = "select project from ProjectImpl project inner join project." +
      role + "s " + role + " where " + role + ".id='" + user.getId() + "'" +
      " order by project.id desc";
    return (List<Project>) this.getHibernateTemplate().find(q);
  }

  /**
   * @see org.wise.portal.dao.project.ProjectDao#getProjectList(java.lang.String)
   */
  public List<Project> getProjectList(String query){
    return (List<Project>) this.getHibernateTemplate().find(query);
  }

  /**
   * @see org.wise.portal.dao.SimpleDao#getList()
   */
  @SuppressWarnings("unchecked")
  @Override
  public List<Project> getList() {
    return (List<Project>) this.getHibernateTemplate().find(this.getFindAllQuery());
  }

  /**
   * @see org.wise.portal.dao.SimpleDao#getById(java.lang.Integer)
   */
  @SuppressWarnings("unchecked")
  @Override
  public Project getById(Serializable id) throws ObjectNotFoundException {
    Project object = null;
    try {
      object = (Project) this.getHibernateTemplate().get(
        this.getDataObjectClass(),  Long.valueOf(id.toString()));
    } catch (NumberFormatException e) {
      return null;
    }
    if (object == null)
      throw new ObjectNotFoundException((Long) id, this.getDataObjectClass());

    return object;
  }

  @SuppressWarnings("unchecked")
  public List<Project> getProjectListByOwner(User owner) {
    if (owner == null) {
      return new ArrayList<Project>();
    }

    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    List<Project> result = session.createCriteria(ProjectImpl.class)
      .add(Restrictions.eq("owner", owner))
      .addOrder(Order.desc("id"))
      .list();

    return result;
  }

  /**
   * @see org.wise.portal.dao.project.ProjectDao#getProjectListByTags(java.util.Set)
   */
  @SuppressWarnings("unchecked")
  @Transactional
  public List<Project> getProjectListByTagNames(Set<String> tagNames) {
    String tagString = "";
    for(String name : tagNames){
      tagString += "'" + name + "',";
    }
    tagString = tagString.substring(0, tagString.length() - 1);

    String q = "select distinct project from ProjectImpl project inner join project.tags tag with tag.name in (" + tagString + ") ";
    List<Project> projects = (List<Project>) this.getHibernateTemplate().find(q);
    List<Project> result = new ArrayList<Project>();
    for (Project project : projects) {
      int numMatches = 0;
      for (Tag projectTag : project.getTags()) {
        if (tagNames.contains(projectTag.getName())) {
          numMatches++;
        }
      }
      if (numMatches == tagNames.size()) {
        result.add(project);
      }
    }
    return result;
  }

  /**
   * @see org.wise.portal.dao.project.ProjectDao#getProjectListByAuthorName(java.lang.String)
   */
  @Override
  public List<Project> getProjectListByAuthorName(String authorName) {
    List<Project> projects = (List<Project>) this
      .getHibernateTemplate()
      .findByNamedParam(
        "from ProjectImpl as project where project.metadataObj.author like :authorName",
        "authorName", "%"+authorName+"%");
    return projects;
  }

  /**
   * @see org.wise.portal.dao.project.ProjectDao#getProjectListByTitle(java.lang.String)
   */
  @Override
  public List<Project> getProjectListByTitle(String title) {
    List<Project> projects = (List<Project>) this
      .getHibernateTemplate()
      .findByNamedParam(
        "from ProjectImpl as project where project.name like :title",
        "title", "%"+title+"%");
    return projects;
  }

  /**
   * @see org.wise.portal.dao.project.ProjectDao#getProjectWithoutMetadata(java.lang.Long)
   */
  public Project getProjectWithoutMetadata(Long projectId){
    try {
      return (Project) this.getHibernateTemplate().get(this.getDataObjectClass(),  projectId);
    } catch (NumberFormatException e) {
      return null;
    }
  }

  /**
   * @see org.wise.portal.dao.project.ProjectDao#getProjectCopies(java.lang.Long)
   */
  public List<Project> getProjectCopies(Long projectId) {
    List<Project> projects = (List<Project>) this
      .getHibernateTemplate()
      .findByNamedParam(
        "from ProjectImpl as project where project.parentProjectId = :parentProjectId",
        "parentProjectId", projectId);
    return projects;
  }

  public List<Project> getProjectsWithoutRuns(User user) {
    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    SQLQuery sqlQuery = session
      .createSQLQuery("SELECT * FROM projects as p "
        + "WHERE p.owner_fk = :ownerId "
        + "AND p.id not in (select project_fk from runs) order by id desc");
    sqlQuery.addEntity("project", ProjectImpl.class);
    sqlQuery.setParameter("ownerId", user.getId());
    return sqlQuery.list();
  }

  public List<Project> getAllSharedProjects() {
    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    SQLQuery sqlQuery = session
      .createSQLQuery("SELECT * FROM projects as p "
        + "where p.id in "
        + "(select distinct projects_fk from projects_related_to_shared_owners)"
        + "order by id desc");
    sqlQuery.addEntity("project", ProjectImpl.class);
    return sqlQuery.list();
  }

  @Override
  public long getMaxProjectId() {
    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    Criteria crit = session.createCriteria(ProjectImpl.class);
    crit.setProjection(Projections.max("id"));
    List<Long> results = crit.list();
    try {
      return results.get(0);
    } catch (NullPointerException npe) {
      return 0;
    }
  }
}
