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
package net.sf.sail.webapp.dao.annotation.impl;

import org.springframework.dao.support.DataAccessUtils;

import net.sf.sail.webapp.dao.annotation.AnnotationBundleDao;
import net.sf.sail.webapp.dao.impl.AbstractHibernateDao;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.annotation.AnnotationBundle;
import net.sf.sail.webapp.domain.annotation.impl.AnnotationBundleImpl;

/**
 * @author Laurel Williams
 * 
 * @version $Id$
 * 
 * Hibernate implementation of the AnnotationBundleDao.
 */
public class HibernateAnnotationBundleDao extends AbstractHibernateDao<AnnotationBundle> implements
        AnnotationBundleDao<AnnotationBundle> {

    private static final String FIND_ALL_QUERY = "from AnnotationBundleImpl";
    
    /**
     * @see net.sf.sail.webapp.dao.impl.AbstractHibernateDao#getFindAllQuery()
     */
    @Override
    protected String getFindAllQuery() {
        return FIND_ALL_QUERY;
    }
    
    protected Class<AnnotationBundleImpl> getDataObjectClass() {
    	return AnnotationBundleImpl.class;
    }

    /**
     * @see net.sf.sail.webapp.dao.annotation.AnnotationBundleDao#retrieveAnnotationBundle(net.sf.sail.webapp.domain.Workgroup)
     */
	public AnnotationBundle retrieveAnnotationBundle(Workgroup workgroup) {
		return (AnnotationBundle) DataAccessUtils
		    .uniqueResult(
		    		this.getHibernateTemplate()
		    		.findByNamedParam(
		    				"from AnnotationBundleImpl as annotationbundle where " +
		    				"annotationbundle.workgroup = :workgroup", 
		    				"workgroup", workgroup));
	}
}