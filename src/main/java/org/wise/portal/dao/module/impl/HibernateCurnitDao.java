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
package org.wise.portal.dao.module.impl;


import org.springframework.stereotype.Repository;
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
@Repository
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