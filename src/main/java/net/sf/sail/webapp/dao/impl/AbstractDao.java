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

/**
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public abstract class AbstractDao<T> implements SimpleDao<T> {

    /**
     * @see net.sf.sail.webapp.dao.SimpleDao#delete(java.lang.Object)
     */
    public void delete(T object) {
        // default behaviour for subclasses that do not override this method
        throw new UnsupportedOperationException();
    }

    /**
     * @see net.sf.sail.webapp.dao.SimpleDao#save(java.lang.Object)
     */
    public void save(T object) {
        // default behaviour for subclasses that do not override this method
        throw new UnsupportedOperationException();
    }

    /**
     * @see net.sf.sail.webapp.dao.SimpleDao#getList()
     */
    public List<T> getList() {
        // default behaviour for subclasses that do not override this method
        throw new UnsupportedOperationException();
    }
    
    /**
     * @see net.sf.sail.webapp.dao.SimpleDao#getById(java.lang.Integer)
     */
    public T getById(Serializable id) throws ObjectNotFoundException {
        // default behaviour for subclasses that do not override this method
        throw new UnsupportedOperationException();
    }
}