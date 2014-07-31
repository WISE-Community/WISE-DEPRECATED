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
package org.wise.portal.dao.authentication.impl;

import java.util.List;

import org.springframework.dao.support.DataAccessUtils;
import org.springframework.stereotype.Repository;
import org.wise.portal.dao.authentication.UserDetailsDao;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.PersistentUserDetails;

/**
 * Class that implements the <code>UserDetailsDao</code> interface using
 * Hibernate.
 * 
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
@Repository
public class HibernateUserDetailsDao extends
        AbstractHibernateDao<MutableUserDetails> implements
        UserDetailsDao<MutableUserDetails> {

	private static final String FIND_ALL_QUERY = "from PersistentUserDetails";

    /**
     * Retrieve the user, by username. Returns null if user is not found.
     * 
     * @see org.wise.portal.dao.authentication.UserDetailsDao#retrieveByName(java.lang.String)
     */
    public MutableUserDetails retrieveByName(String username) {
        return (MutableUserDetails) DataAccessUtils
                .uniqueResult(this
                        .getHibernateTemplate()
                        .findByNamedParam(
                                "from PersistentUserDetails as user_details where upper(user_details.username) = :username",
                                "username", username.toUpperCase()));
    }
    

	@SuppressWarnings("unchecked")
	public List<MutableUserDetails> retrieveAll(String userDetailsClassName) {
		   return (List<MutableUserDetails>) this
                   .getHibernateTemplate()
                   .find("from " + userDetailsClassName);
	}
	
	@SuppressWarnings("unchecked")
	public List<String> retrieveAll(String userDetailsClassName, String field) {
		   return (List<String>) this
                   .getHibernateTemplate()
                   .find("select user_details."+ field +" from PersistentUserDetails as user_details, " + userDetailsClassName + 
                		   " as user_details_child where user_details.id=user_details_child.id");
	}

	/**
     * @see org.wise.portal.dao.authentication.UserDetailsDao#hasUsername(java.lang.String)
     */
    public boolean hasUsername(String username) {
        return (this.retrieveByName(username) != null);
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
	protected Class<PersistentUserDetails> getDataObjectClass() {
		return PersistentUserDetails.class;
	}
}