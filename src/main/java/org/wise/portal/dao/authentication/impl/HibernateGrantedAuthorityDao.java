/**
 * Copyright (c) 2007-2014 Encore Research Group, University of Toronto
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


import org.springframework.dao.support.DataAccessUtils;
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
 * 
 * @version $Id: HibernateGrantedAuthorityDao.java 257 2007-03-30 14:59:02Z
 *          cynick $
 * 
 */
@Repository
public class HibernateGrantedAuthorityDao extends
        AbstractHibernateDao<MutableGrantedAuthority> implements
        GrantedAuthorityDao<MutableGrantedAuthority> {

    private static final String FIND_ALL_QUERY = "from PersistentGrantedAuthority";

    /**
     * Retrieve the granted authority by name. Returns null if the specified
     * authority name is not found.
     * 
     * @see org.wise.portal.dao.authentication.GrantedAuthorityDao#retrieveByName(java.lang.String)
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
     * @see org.wise.portal.dao.authentication.GrantedAuthorityDao#hasRole(java.lang.String)
     */
    public boolean hasRole(String authority) {
        return (this.retrieveByName(authority) != null);
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
	protected Class<PersistentGrantedAuthority> getDataObjectClass() {
		return PersistentGrantedAuthority.class;
	}
}