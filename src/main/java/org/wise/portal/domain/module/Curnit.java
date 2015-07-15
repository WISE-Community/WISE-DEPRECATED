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
package org.wise.portal.domain.module;

import org.wise.portal.domain.Persistable;

/**
 * Curnit domain object interface
 * 
 * @author Cynick Young
 */
public interface Curnit extends Persistable {

	/**
	 * @return The id of the curnit in the persistent data store
	 */
	Long getId();
	
	/**
	 * Visitor pattern, accepts CurnitVisitors
	 * @param visitor
	 */
	Object accept(CurnitVisitor visitor);
}