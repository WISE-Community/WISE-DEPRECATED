/**
 * Copyright (c) 2007 Encore Research Group, University of Toronto
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
package org.wise.portal.dao.module.impl;


import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.module.CurnitDao;
import org.wise.portal.domain.module.Curnit;
import org.wise.portal.domain.module.impl.CurnitImpl;

/**
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public class HibernateCurnitDao extends AbstractHibernateDao<Curnit> implements
        CurnitDao<Curnit> {

    private static final String FIND_ALL_QUERY = "from CurnitImpl";
    
    /**
     * @see org.wise.portal.dao.impl.AbstractHibernateDao#getFindAllQuery()
     */
    @Override
    protected String getFindAllQuery() {
        return FIND_ALL_QUERY;
    }
    
    protected Class<CurnitImpl> getDataObjectClass() {
    	return CurnitImpl.class;
    }

	public Long getLatestId(){
		String q = "select Max(curnit.id) from CurnitImpl curnit";
		return (Long) this.getHibernateTemplate().find(q).get(0);
	}
}