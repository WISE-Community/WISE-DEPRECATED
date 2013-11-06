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
package net.sf.sail.webapp.dao.sds.impl;

import net.sf.sail.webapp.dao.sds.SdsOfferingUpdateCommand;
import net.sf.sail.webapp.domain.sds.SdsOffering;
import net.sf.sail.webapp.domain.webservice.http.HttpPutRequest;

import org.apache.commons.httpclient.HttpStatus;

/**
 * Implementation of <code>SdsOfferingUpdateCommand</code> which updates a
 * user in the Sail Data Service (uses Http REST). This class is thread-safe.
 * 
 * @author Laurel Williams
 * 
 * @version $Id$
 * 
 */
public class SdsOfferingUpdateCommandHttpRestImpl extends
		AbstractHttpRestCommand implements SdsOfferingUpdateCommand {

	private static final ThreadLocal<SdsOffering> SDS_OFFERING = new ThreadLocal<SdsOffering>();

	/**
	 * @see net.sf.sail.webapp.dao.sds.SdsJnlpCreateCommand#setSdsJnlp(net.sf.sail.webapp.domain.sds.SdsJnlp)
	 */
	public void setSdsOffering(SdsOffering sdsOffering) {
		SDS_OFFERING.set(sdsOffering);
	}

	private SdsOffering getSdsOffering() {
		return SDS_OFFERING.get();
	}

	/**
	 * @see net.sf.sail.webapp.dao.sds.SdsCommand#generateRequest()
	 */
	@SuppressWarnings("unchecked")
	public HttpPutRequest generateRequest() {
		final SdsOffering sdsOffering = this.getSdsOffering();
		final String bodyData = "<offering><name>" + sdsOffering.getName()
				+ "</name><curnit-id>"
				+ sdsOffering.getSdsCurnit().getSdsObjectId()
				+ "</curnit-id><jnlp-id>"
				+ sdsOffering.getSdsJnlp().getSdsObjectId()
				+ "</jnlp-id></offering>";
		final String url = "/offering/" + sdsOffering.getSdsObjectId();
		return new HttpPutRequest(REQUEST_HEADERS_CONTENT, bodyData, url,
				HttpStatus.SC_CREATED);
	}

	/**
	 * @see net.sf.sail.webapp.dao.sds.SdsCommand#execute()
	 */
	public SdsOffering execute(final HttpPutRequest httpRequest) {
		this.transport.put(httpRequest);
		final SdsOffering sdsOffering = this.getSdsOffering();
		SDS_OFFERING.set(null);
		return sdsOffering;
	}
}