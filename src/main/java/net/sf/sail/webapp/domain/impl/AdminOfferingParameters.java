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
package net.sf.sail.webapp.domain.impl;
/**
 * A backing object for adminOfferings page.
 * 
 * @author Laurel Williams
 * 
 * @version $Id$
 * 
 */
public class AdminOfferingParameters {

	Long offeringId;

	/**
	 * @return the offeringId
	 */
	public Long getOfferingId() {
		return offeringId;
	}

	/**
	 * @param offeringId the offeringId to set
	 */
	public void setOfferingId(Long offeringId) {
		this.offeringId = offeringId;
	}
	
}
