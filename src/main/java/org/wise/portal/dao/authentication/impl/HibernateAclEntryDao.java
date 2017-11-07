/**
 * Copyright (c) 2007-2015 Encore Research Group, University of Toronto
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package org.wise.portal.dao.authentication.impl;

import org.springframework.stereotype.Repository;
import org.wise.portal.dao.authentication.AclEntryDao;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.domain.authentication.ImmutableAclEntry;
import org.wise.portal.domain.authentication.impl.PersistentAclEntry;

/**
 * A dao for PersistentAclEntry.
 * This class is not being used. Tried to implement Hibernate versions of the acl
 * services and became bogged down, so went back to jdbc versions. Keeping this
 * class around in case we want to try again later.
 *
 * @author Cynick Young
 */
@Repository
public class HibernateAclEntryDao extends AbstractHibernateDao<ImmutableAclEntry> implements
  AclEntryDao<ImmutableAclEntry> {

  private static final String FIND_ALL_QUERY = "from PersistentAclEntry";

  /**
   * @see org.wise.portal.dao.impl.AbstractHibernateDao#getDataObjectClass()
   */
  @Override
  protected Class<? extends ImmutableAclEntry> getDataObjectClass() {
    return PersistentAclEntry.class;
  }

  /**
   * @see org.wise.portal.dao.impl.AbstractHibernateDao#getFindAllQuery()
   */
  @Override
  protected String getFindAllQuery() {
    return FIND_ALL_QUERY;
  }
}
