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
package org.wise.portal.dao.impl;

import java.io.Serializable;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.support.HibernateDaoSupport;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.SimpleDao;

/**
 * @author Cynick Young
 */
public abstract class AbstractHibernateDao<T> extends HibernateDaoSupport
    implements SimpleDao<T> {

  @PersistenceContext
  private EntityManager entityManager;

  @Autowired
  @Transactional
  public void init() {
    entityManager = entityManager.getEntityManagerFactory().createEntityManager();
    Session session = (Session) entityManager.unwrap(Session.class);
    SessionFactory sessionFactory = session.getSessionFactory();
    setSessionFactory(sessionFactory);
  }

  @Transactional
  public void delete(T object) {
    this.getHibernateTemplate().delete(object);
  }

  @Transactional
  public void save(T object) {
    this.getHibernateTemplate().saveOrUpdate(object);
  }

  @SuppressWarnings("unchecked")
  public List<T> getList() {
    return (List<T>) this.getHibernateTemplate().find(this.getFindAllQuery());
  }

  @SuppressWarnings("unchecked")
  public T getById(Serializable id) throws ObjectNotFoundException {
    T object = null;
    try {
      if (id instanceof Integer) {
        object = (T) this.getHibernateTemplate().get(
          this.getDataObjectClass(), Integer.valueOf(id.toString()));
      } else {
        object = (T) this.getHibernateTemplate().get(
          this.getDataObjectClass(), Long.valueOf(id.toString()));
      }
    } catch (NumberFormatException e) {
      return null;
    }
    if (object == null) {
      // TODO: make ObjectNotFoundException accept non-long id's. We'll need this for Integer id's.
      throw new ObjectNotFoundException((Long) id, this.getDataObjectClass());
    }
    return object;
  }

  /**
   * Gets a string that will perform a query to retrieve all available objects
   * from the persistent data store.
   *
   * @return <code>String</code> query
   */
  protected abstract String getFindAllQuery();

  protected abstract Class<? extends T> getDataObjectClass();

}
