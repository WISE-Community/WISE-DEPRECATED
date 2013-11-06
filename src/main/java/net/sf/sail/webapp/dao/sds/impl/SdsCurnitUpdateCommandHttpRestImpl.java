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

import net.sf.sail.webapp.dao.sds.SdsCurnitUpdateCommand;
import net.sf.sail.webapp.domain.sds.SdsCurnit;
import net.sf.sail.webapp.domain.webservice.http.HttpPutRequest;

import org.apache.commons.httpclient.HttpStatus;

/**
 * Implementation of <code>SdsCurnitUpdateCommand</code> which updates an
 * existing user in the Sail Data Service (uses Http REST). This class is
 * thread-safe.
 * 
 * @author Laurel Williams
 * 
 * @version $Id$
 * 
 */
public class SdsCurnitUpdateCommandHttpRestImpl extends AbstractHttpRestCommand
		implements SdsCurnitUpdateCommand {

	private static final ThreadLocal<SdsCurnit> SDS_CURNIT = new ThreadLocal<SdsCurnit>();

	public void setSdsCurnit(SdsCurnit sdsCurnit) {
		SDS_CURNIT.set(sdsCurnit);
	}

	private SdsCurnit getSdsCurnit() {
		return SDS_CURNIT.get();
	}

	/**
	 * @see net.sf.sail.webapp.dao.sds.SdsCommand#generateRequest()
	 */
	public HttpPutRequest generateRequest() {
		final SdsCurnit sdsCurnit = this.getSdsCurnit();
		final String bodyData = "<curnit><name>" + sdsCurnit.getName()
				+ "</name><url>" + sdsCurnit.getUrl() + "</url></curnit>";
		final String url = "/curnit/" + sdsCurnit.getSdsObjectId().toString();
		return new HttpPutRequest(REQUEST_HEADERS_CONTENT, bodyData, url,
				HttpStatus.SC_CREATED);
	}

	/**
	 * @see net.sf.sail.webapp.dao.sds.SdsCommand#execute()
	 */
	public SdsCurnit execute(final HttpPutRequest httpRequest) {
		this.transport.put(httpRequest);
		final SdsCurnit sdsCurnit = this.getSdsCurnit();
		// clear the thread local reference to avoid resource leak since we're
		// done executing
		SDS_CURNIT.set(null);
		// no need to change sdsCurnit (unlike post) since nothing has changed
		// locally.
		return sdsCurnit;
	}
}