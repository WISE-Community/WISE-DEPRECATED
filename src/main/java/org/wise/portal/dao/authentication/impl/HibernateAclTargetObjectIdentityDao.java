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
import org.springframework.security.acls.model.ObjectIdentity;
import org.springframework.stereotype.Repository;
import org.wise.portal.dao.authentication.AclTargetObjectIdentityDao;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.domain.authentication.MutableAclTargetObjectIdentity;
import org.wise.portal.domain.authentication.impl.PersistentAclTargetObjectIdentity;

/**
 * This class is not being used. Tried to implement Hibernate versions of the acl
 * services and became bogged down, so went back to jdbc versions. Keeping this
 * class around in case we want to try again later.
 * 
 * @author Cynick Young
 */
@Repository
public class HibernateAclTargetObjectIdentityDao extends
    AbstractHibernateDao<MutableAclTargetObjectIdentity> implements
    AclTargetObjectIdentityDao<MutableAclTargetObjectIdentity> {

  @PersistenceContext
  private EntityManager entityManager;

  private static final String FIND_ALL_QUERY = "from PersistentAclTargetObjectIdentity";

  public MutableAclTargetObjectIdentity retrieveByObjectIdentity(ObjectIdentity objectIdentity) {
    Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
    CriteriaBuilder cb = session.getCriteriaBuilder();
    CriteriaQuery<PersistentAclTargetObjectIdentity> cq = 
        cb.createQuery(PersistentAclTargetObjectIdentity.class);
    Root<PersistentAclTargetObjectIdentity> persistentAclTargetObjectIdentityRoot = 
        cq.from(PersistentAclTargetObjectIdentity.class);
    cq.select(persistentAclTargetObjectIdentityRoot).where(
        cb.equal(persistentAclTargetObjectIdentityRoot.get("classname"), objectIdentity.getType()));
    cq.select(persistentAclTargetObjectIdentityRoot).where(
        cb.equal(persistentAclTargetObjectIdentityRoot.get("id"), objectIdentity.getIdentifier()));
    TypedQuery<PersistentAclTargetObjectIdentity> query = entityManager.createQuery(cq);
    return query.getResultStream().findFirst().orElse(null);
  }

  public MutableAclTargetObjectIdentity[] findChildren(
      ObjectIdentity parentIdentity) {
    throw new UnsupportedOperationException();
    // TODO CY - not really sure what the requirements are for this method
    // List<?> list = this
    // .getHibernateTemplate()
    // .findByNamedParam(
    // "from PersistentAclTargetObjectIdentity as object_identity where
    // object_identity.parent = :parent",
    // new String[] { "parent" },
    // new Object[] { parentIdentity });
    // return list.toArray(SAMPLE);
  }

  @Override
  protected Class<PersistentAclTargetObjectIdentity> getDataObjectClass() {
    return PersistentAclTargetObjectIdentity.class;
  }

  @Override
  protected String getFindAllQuery() {
    return FIND_ALL_QUERY;
  }
}