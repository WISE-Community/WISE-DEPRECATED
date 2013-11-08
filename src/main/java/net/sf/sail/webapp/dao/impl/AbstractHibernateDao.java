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
package net.sf.sail.webapp.dao.impl;

import java.io.Serializable;
import java.util.List;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.dao.SimpleDao;

import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

/**
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public abstract class AbstractHibernateDao<T> extends HibernateDaoSupport
		implements SimpleDao<T> {

	/**
	 * @see net.sf.sail.webapp.dao.SimpleDao#delete(java.lang.Object)
	 */
	public void delete(T object) {
		this.getHibernateTemplate().delete(object);
	}

	/**
	 * @see net.sf.sail.webapp.dao.SimpleDao#save(java.lang.Object)
	 */
	public void save(T object) {
		this.getHibernateTemplate().saveOrUpdate(object);
	}

	/**
	 * @see net.sf.sail.webapp.dao.SimpleDao#getList()
	 */
	@SuppressWarnings("unchecked")
	public List<T> getList() {
		return this.getHibernateTemplate().find(this.getFindAllQuery());
	}

	/**
	 * Gets a string that will perform a query to retrieve all available objects
	 * from the persistent data store.
	 * 
	 * @return <code>String</code> query
	 */
	protected abstract String getFindAllQuery();

	/**
	 * @see net.sf.sail.webapp.dao.SimpleDao#getById(java.lang.Integer)
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