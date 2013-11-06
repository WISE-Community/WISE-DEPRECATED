/**
 * Copyright (c) 2006 Encore Research Group, University of Toronto
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
package net.sf.sail.webapp.dao.authentication.impl;

import net.sf.sail.webapp.dao.authentication.GrantedAuthorityDao;
import net.sf.sail.webapp.dao.impl.AbstractHibernateDao;
import net.sf.sail.webapp.domain.authentication.MutableGrantedAuthority;
import net.sf.sail.webapp.domain.authentication.impl.PersistentGrantedAuthority;

import org.springframework.dao.support.DataAccessUtils;

/**
 * Class that implements the <code>GrantedAuthorityDao</code> interface using
 * Hibernate.
 * 
 * @author Cynick Young
 * 
 * @version $Id: HibernateGrantedAuthorityDao.java 257 2007-03-30 14:59:02Z
 *          cynick $
 * 
 */
public class HibernateGrantedAuthorityDao extends
        AbstractHibernateDao<MutableGrantedAuthority> implements
        GrantedAuthorityDao<MutableGrantedAuthority> {

    private static final String FIND_ALL_QUERY = "from PersistentGrantedAuthority";

    /**
     * Retrieve the granted authority by name. Returns null if the specified
     * authority name is not found.
     * 
     * @see net.sf.sail.webapp.dao.authentication.GrantedAuthorityDao#retrieveByName(java.lang.String)
     */
    public MutableGrantedAuthority retrieveByName(String authority) {
        return (MutableGrantedAuthority) DataAccessUtils
                .uniqueResult(this
                        .getHibernateTemplate()
                        .findByNamedParam(
                                "from PersistentGrantedAuthority as granted_authority where granted_authority.authority = :authority",
                                new String[] { "authority" },
                                new Object[] { authority }));
    }

    /**
     * @see net.sf.sail.webapp.dao.authentication.GrantedAuthorityDao#hasRole(java.lang.String)
     */
    public boolean hasRole(String authority) {
        return (this.retrieveByName(authority) != null);
    }

    /**
     * @see net.sf.sail.webapp.dao.impl.AbstractHibernateDao#getFindAllQuery()
     */
    @Override
    protected String getFindAllQuery() {
        return FIND_ALL_QUERY;
    }

	/**
	 * @see net.sf.sail.webapp.dao.impl.AbstractHibernateDao#getDataObjectClass()
	 */
	@Override
	protected Class<PersistentGrantedAuthority> getDataObjectClass() {
		return PersistentGrantedAuthority.class;
	}
}