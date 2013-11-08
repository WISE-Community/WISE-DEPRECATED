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
package net.sf.sail.webapp.dao.authentication;

import java.util.List;

import org.telscenter.sail.webapp.domain.authentication.impl.TeacherUserDetails;

import net.sf.sail.webapp.dao.SimpleDao;
import net.sf.sail.webapp.domain.authentication.MutableUserDetails;

/**
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public interface UserDetailsDao<T extends MutableUserDetails> extends
        SimpleDao<T> {

    /**
     * Check if the username exists in the data store.
     * 
     * @param username
     * @return true if the data store contains a user with the corresponding
     *         username, false otherwise.
     */
    public boolean hasUsername(String username);

    /**
     * Given an input string retrieve a corresponding record from data store.
     * 
     * @param name
     *            A string representing the name of the data in the data store.
     * @return A new instance of a data object.
     */
    public T retrieveByName(String name);
    
    /**
     * Given an input string retrieve a corresponding record from data store.
     * 
     * @param name
     *            A string representing the name of the data in the data store.
     * @return A new instance of a data object.
     */
    public List<T> retrieveAll(String className);
    
    /**
     * Given an input string retrieve a corresponding record from data store.
     * 
     * @param name
     *            A string representing the name of the data in the data store.
     * @param field
     *            A string representing the field of the data in the data store. e.g. username
     *            
     * @return A new instance of a data object.
     */
    public List<String> retrieveAll(String className, String field);
}