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
package org.wise.portal.dao.impl;

import java.io.Serializable;
import java.util.List;

import org.springframework.orm.hibernate4.support.HibernateDaoSupport;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.SimpleDao;

/**
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public abstract class AbstractHibernateDao<T> extends HibernateDaoSupport
		implements SimpleDao<T> {

	/**
	 * @see org.wise.portal.dao.SimpleDao#delete(java.lang.Object)
	 */
	@Transactional
	public void delete(T object) {
		this.getHibernateTemplate().delete(object);
	}

	/**
	 * @see org.wise.portal.dao.SimpleDao#save(java.lang.Object)
	 */
	@Transactional
	public void save(T object) {
		this.getHibernateTemplate().saveOrUpdate(object);
	}

	/**
	 * @see org.wise.portal.dao.SimpleDao#getList()
	 */
	@SuppressWarnings("unchecked")
	public List<T> getList() {
		return (List<T>) this.getHibernateTemplate().find(this.getFindAllQuery());
	}

	/**
	 * Gets a string that will perform a query to retrieve all available objects
	 * from the persistent data store.
	 * 
	 * @return <code>String</code> query
	 */
	protected abstract String getFindAllQuery();

	/**
	 * @see org.wise.portal.dao.SimpleDao#getById(java.lang.Integer)
	 */
	@SuppressWarnings("unchecked")
	public T getById(Serializable id) throws ObjectNotFoundException {
		T object = null;
		try {
			object = (T) this.getHibernateTemplate().get(
					this.getDataObjectClass(),  Long.valueOf(id.toString()));
		} catch (NumberFormatException e) {
			return null;
		}
		if (object == null)
			throw new ObjectNotFoundException((Long) id, this.getDataObjectClass());
		return object;
	}

	/**
	 * Gets the class of the persistent entity.
	 * 
	 * @return the Class
	 */
	protected abstract Class<? extends T> getDataObjectClass();

}