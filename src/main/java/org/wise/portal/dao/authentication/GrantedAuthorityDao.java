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
package org.wise.portal.dao.authentication;

import org.wise.portal.dao.SimpleDao;
import org.wise.portal.domain.authentication.MutableGrantedAuthority;

/**
 * Interface that extends <code>SimpleDao</code> used for
 * <code>GrantedAuthority</code>.
 *
 * @author Cynick Young
 */
public interface GrantedAuthorityDao<T extends MutableGrantedAuthority> extends SimpleDao<T> {

  /**
   * Given a string representing a role, determines if this granted authority
   * has this role.
   *
   * @param authority
   *            The role string
   * @return True if the GrantedAuthority has this role, false otherwise.
   */
  boolean hasRole(String authority);

  /**
   * Given an input string retrieve a corresponding record from data store.
   *
   * @param name
   *            A string representing the name of the data in the data store.
   * @return A new instance of a data object.
   */
  T retrieveByName(String name);
}
