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
package org.wise.portal.domain.run.impl;

/**
 * @author Laurel Williams
 * 
 * @version $Id$
 * 
 * Parameters that a user would probably need to supply in order to create an
 * offering from the UI.
 * 
 */
public class OfferingParameters {
	
	private String name;

	private Long curnitId;
	
	private Long jnlpId;

	/**
	 * @return the name
	 */
	public String getName() {
		return name;
	}

	/**
	 * @param name
	 *            the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 * @return the curnitId
	 */
	public Long getCurnitId() {
		return curnitId;
	}

	/**
	 * @param curnitId
	 *            the curnitId to set
	 */
	public void setCurnitId(Long curnitId) {
		this.curnitId = curnitId;
	}

	/**
	 * @return the jnlpId
	 */
	public Long getJnlpId() {
		return jnlpId;
	}

	/**
	 * @param jnlpId the jnlpId to set
	 */
	public void setJnlpId(Long jnlpId) {
		this.jnlpId = jnlpId;
	}

}
