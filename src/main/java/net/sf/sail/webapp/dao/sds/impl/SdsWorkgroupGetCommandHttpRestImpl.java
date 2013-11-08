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

import net.sf.sail.webapp.dao.sds.SdsWorkgroupGetCommand;
import net.sf.sail.webapp.domain.sds.SdsOffering;
import net.sf.sail.webapp.domain.sds.SdsWorkgroup;
import net.sf.sail.webapp.domain.webservice.http.HttpGetRequest;

import org.apache.commons.httpclient.HttpStatus;
import org.jdom.Document;
import org.jdom.Element;

/**
 * Implementation of <code>SdsWorkgroupGetCommand</code> which gets a single
 * workgroup from the Sail Data Service (uses Http REST) based on workgroup id.
 * This class is thread-safe.
 * 
 * @author Laurel Williams
 * 
 * @version $Id$
 * 
 */
public class SdsWorkgroupGetCommandHttpRestImpl extends AbstractHttpRestCommand
		implements SdsWorkgroupGetCommand {

	private static final ThreadLocal<SdsWorkgroup> SDS_WORKGROUP = new ThreadLocal<SdsWorkgroup>();

	public void setSdsWorkgroup(SdsWorkgroup sdsWorkgroup) {
		SDS_WORKGROUP.set(sdsWorkgroup);
	}

	private SdsWorkgroup getSdsWorkgroup() {
		return SDS_WORKGROUP.get();
	}

	//TODO LAW check on thread safety of these methods

	/**
	 * @see net.sf.sail.webapp.dao.sds.SdsCommand#execute()
	 */
	@SuppressWarnings("unchecked")
	public SdsWorkgroup execute(HttpGetRequest httpRequest) {
		//TODO LAW check on thread safety of these methods
		final SdsWorkgroup sdsWorkgroup = this.getSdsWorkgroup();
		SDS_WORKGROUP.set(null);
		Document doc = convertXmlInputStreamToXmlDocument(this.transport
				.get(httpRequest));
		if (doc == null) {
			return sdsWorkgroup;
		}

		Element sdsWorkgroupElement = doc.getRootElement();
		sdsWorkgroup.setName(sdsWorkgroupElement.getChild("name").getValue());
		sdsWorkgroup.setSdsObjectId(new Long(sdsWorkgroupElement.getChild("id")
				.getValue()));

		SdsOffering sdsOffering = new SdsOffering();
		sdsOffering.setSdsObjectId(new Long(sdsWorkgroupElement.getChild(
				"offering-id").getValue()));
		sdsWorkgroup.setSdsOffering(sdsOffering);

		HttpGetRequest sessionBundleRequest = this
				.generateSessionBundleRequest(sdsWorkgroup.getSdsObjectId(), sdsOffering.getSdsObjectId());
		sdsWorkgroup.setSdsSessionBundle(this.getSdsSessionBundle(sessionBundleRequest));
		return sdsWorkgroup;
	}

	protected String getSdsSessionBundle(HttpGetRequest sessionBundleRequest) {
		return convertXMLInputStreamToString(this.transport.get(sessionBundleRequest));
	}

	// add the /1 at the end for now for workgroup version.
	protected HttpGetRequest generateSessionBundleRequest(Long sdsWorkgroupId, Long sdsOfferingId) {
		final String url = "/offering/" + sdsOfferingId + "/bundle/" + sdsWorkgroupId + "/0";

		return new HttpGetRequest(REQUEST_HEADERS_ACCEPT, EMPTY_STRING_MAP,
				url, HttpStatus.SC_OK);
	}

	/**
	 * @see net.sf.sail.webapp.dao.sds.SdsCommand#generateRequest()
	 */
	public HttpGetRequest generateRequest() {
		final SdsWorkgroup sdsWorkgroup = this.getSdsWorkgroup();
		final String url = "/workgroup/" + sdsWorkgroup.getSdsObjectId();
		return new HttpGetRequest(REQUEST_HEADERS_ACCEPT, EMPTY_STRING_MAP,
				url, HttpStatus.SC_OK);
	}

}