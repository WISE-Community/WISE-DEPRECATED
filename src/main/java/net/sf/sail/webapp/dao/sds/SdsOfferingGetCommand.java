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
package net.sf.sail.webapp.dao.sds;

import net.sf.sail.webapp.domain.sds.SdsOffering;
import net.sf.sail.webapp.domain.webservice.http.HttpGetRequest;

/**
 * Interface for a command which gets an sds offering from the sds.
 * 
 * @author Laurel Williams
 * 
 * @version $Id$
 * 
 */
public interface SdsOfferingGetCommand extends
		SdsCommand<SdsOffering, HttpGetRequest> {

	/**
	 * Sets the sdsOffering for this command.
	 * 
	 * @param sdsOffering
	 */
	public void setSdsOffering(SdsOffering sdsOffering);

	/**
	 * Retrieves the curnitmap for this sdsOffering from the sds, independently
	 * of the retrieving the sds offering itself.
	 * 
	 * @param sdsOffering.
	 *            All that is really required to pass in is that the sdsObjectId
	 *            of the sdsOffering is set. The retrieved sdsCurnitMap is
	 *            stored in the sdsOffering and can be retrieved by using
	 *            sdsOffering.getSdsCurnitMap() {
	 * 
	 * @throws CurnitMapNotFoundException
	 *             Is thrown if the curnitMap cannot be retrieved from the sds.
	 *             In this case, it is possible to store the sdsOffering in the
	 *             exception for retrieval, so that when this exception is
	 *             thrown, we can still retrieve the offering without the valid
	 *             curnitmap.
	 * 
	 */

	public void getSdsCurnitMap(SdsOffering sdsOffering)
			throws CurnitMapNotFoundException;
}