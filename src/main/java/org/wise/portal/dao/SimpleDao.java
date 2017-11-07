/**
 * Copyright (c) 2007-2015 Encore Research Group, University of Toronto
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
package org.wise.portal.dao;

import java.io.Serializable;
import java.util.List;

/**
 * Data Access Object (DAO) interface that defines simple generic operations for
 * dealing with a persistent store.
 *
 * @author Cynick Young
 */
public interface SimpleDao<T> {

  /**
   * Saves the object to a persistent data store.
   *
   * @param object
   */
  void save(T object);

  /**
   * Deletes the object from a persistent data store.
   *
   * @param object
   */
  void delete(T object);

  /**
   * Gets a list of objects from a persistent data store.
   *
   * @return <code>List</code> of objects
   */
  List<T> getList();

  /**
   * Retrieves a single object from persistent data store based on the primary key.
   *
   * @param id The id of the object you are retrieving.
   *
   * @return The object.
   */
  T getById(Serializable id) throws ObjectNotFoundException;
}
