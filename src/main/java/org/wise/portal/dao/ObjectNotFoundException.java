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

/**
 * @author Laurel Williams
 */
public class ObjectNotFoundException extends Exception {

  private static final long serialVersionUID = 1L;

  private String message;

  @SuppressWarnings("unchecked")
  public ObjectNotFoundException(Serializable id, Class objectClass) {
    this.message = "Object with id " + id.toString() + "of type " + objectClass + " not found.";
  }

  public String getMessage() {
    return this.message;
  }
}
