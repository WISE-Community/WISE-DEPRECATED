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
package net.sf.sail.webapp.dao.sds.impl;

import java.io.InputStream;

import net.sf.sail.webapp.dao.sds.CurnitMapNotFoundException;
import net.sf.sail.webapp.domain.sds.SdsOffering;
import net.sf.sail.webapp.domain.webservice.http.impl.HttpGetCurnitMapRequest;

import org.apache.commons.httpclient.HttpStatus;

/**
 * A utility class which allows us to retrieve a curnitmap from the sds. Not a
 * full fledged sdsCommand, but is required to be associated with an offering
 * GET command.
 * 
 * @author Laurel Williams
 * 
 * @version $Id$
 */
public class SdsCurnitMapGetter {

	AbstractHttpRestCommand command;

	public SdsCurnitMapGetter(AbstractHttpRestCommand command) {
		super();
		this.command = command;
	}

	/**
	 * A method which allows a command to pass in an sdsOffering and to have
	 * it's curnitmap set via an sds retrieval.
	 * 
	 * @param sdsOffering
	 *            The offering to which we want to add the sdscurnit.
	 * @throws CurnitMapNotFoundException
	 *             If the curnitmap cannot be retrieved for any reason. A side
	 *             effect of throwing this exception is that the sdsCurnitMap
	 *             field of the sdsOffering is set to a blank string and the
	 *             offering is stored in the exception so that it can be
	 *             retrieved later.
	 * 
	 */
	protected void setSdsOfferingCurnitMap(SdsOffering sdsOffering)
			throws CurnitMapNotFoundException {
		HttpGetCurnitMapRequest curnitMapRequest = this
				.generateCurnitMapRequest(sdsOffering);
		try {
			sdsOffering.setSdsCurnitMap(this.getSdsCurnitMap(curnitMapRequest));
		} catch (CurnitMapNotFoundException cmnfe) {
			sdsOffering.setSdsCurnitMap("");
			cmnfe.setSdsOffering(sdsOffering);
			throw cmnfe;
		}
	}

	private String getSdsCurnitMap(HttpGetCurnitMapRequest curnitMapRequest)
			throws CurnitMapNotFoundException {
		InputStream curnitMapResponse = command.transport.get(curnitMapRequest);
		return AbstractHttpRestCommand
				.convertXMLInputStreamToString(curnitMapResponse);
	}

	private HttpGetCurnitMapRequest generateCurnitMapRequest(SdsOffering sdsOffering) {
		final String url;
		if (sdsOffering.getRetrieveContentUrl() != null) {
		  url = "/offering/" + sdsOffering.getSdsObjectId() + "/curnitmap" +
		      "?sailotrunk.otmlurl=" + sdsOffering.getRetrieveContentUrl();
		} else {
		  url = "/offering/" + sdsOffering.getSdsObjectId() + "/curnitmap";
		}
		
		return new HttpGetCurnitMapRequest(
				AbstractHttpRestCommand.REQUEST_HEADERS_ACCEPT,
				AbstractHttpRestCommand.EMPTY_STRING_MAP, url, HttpStatus.SC_OK);
	}

}
