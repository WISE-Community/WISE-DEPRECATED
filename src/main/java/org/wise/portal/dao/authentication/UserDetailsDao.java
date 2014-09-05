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
package org.wise.portal.dao.authentication;

import java.util.List;


import org.wise.portal.dao.SimpleDao;
import org.wise.portal.domain.authentication.MutableUserDetails;

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