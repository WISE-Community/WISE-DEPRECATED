/**
 * Copyright (c) 2007-2015 Encore Research Group, University of Toronto
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Public License for more details.
 *
 * You should have received a copy of the GNU Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package org.wise.portal.dao.authentication.impl;

import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

import org.hibernate.Session;
import org.springframework.stereotype.Repository;
import org.wise.portal.dao.authentication.GrantedAuthorityDao;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.domain.authentication.MutableGrantedAuthority;
import org.wise.portal.domain.authentication.impl.PersistentGrantedAuthority;

/**
 * Class that implements the <code>GrantedAuthorityDao</code> interface using
 * Hibernate.
 *
 * @author Cynick Young
 */
@Repository
public class HibernateGrantedAuthorityDao extends
    AbstractHibernateDao<MutableGrantedAuthority> implements
    GrantedAuthorityDao<MutableGrantedAuthority> {

  @PersistenceContext
  private EntityManager entityManager;

  private static final String FIND_ALL_QUERY = "from PersistentGrantedAuthority";

  public MutableGrantedAuthority retrieveByName(String authority) {
    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    CriteriaBuilder cb = session.getCriteriaBuilder();
    CriteriaQuery<PersistentGrantedAuthority> cq = cb.createQuery(PersistentGrantedAuthority.class);
    Root<PersistentGrantedAuthority> persistentGrantedAuthorityRoot = 
        cq.from(PersistentGrantedAuthority.class);
    cq.select(persistentGrantedAuthorityRoot).where(
        cb.equal(persistentGrantedAuthorityRoot.get("authority"), authority));
    TypedQuery<PersistentGrantedAuthority> query = entityManager.createQuery(cq);
    return query.getResultStream().findFirst().orElse(null);
  }

  public boolean hasRole(String authority) {
    return (this.retrieveByName(authority) != null);
  }
  @Override
  protected String getFindAllQuery() {
    return FIND_ALL_QUERY;
  }

  @Override
  protected Class<PersistentGrantedAuthority> getDataObjectClass() {
    return PersistentGrantedAuthority.class;
  }
}
