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

import net.sf.sail.webapp.dao.sds.CurnitMapNotFoundException;
import net.sf.sail.webapp.dao.sds.SdsOfferingGetCommand;
import net.sf.sail.webapp.domain.sds.SdsCurnit;
import net.sf.sail.webapp.domain.sds.SdsJnlp;
import net.sf.sail.webapp.domain.sds.SdsOffering;
import net.sf.sail.webapp.domain.webservice.http.HttpGetRequest;

import org.apache.commons.httpclient.HttpStatus;
import org.jdom.Document;
import org.jdom.Element;

/**
 * Implementation of <code>SdsOfferingGetCommand</code> which gets a single
 * offering from the Sail Data Service (uses Http REST) based on offering id.
 * This class is thread-safe.
 * 
 * @author Laurel Williams
 * 
 * @version $Id: SdsOfferingGetCommandHttpRestImpl.java 1143 2007-09-17
 *          15:25:53Z laurel $
 * 
 */
public class SdsOfferingGetCommandHttpRestImpl extends AbstractHttpRestCommand
		implements SdsOfferingGetCommand {

	private static final ThreadLocal<SdsOffering> SDS_OFFERING = new ThreadLocal<SdsOffering>();

	public void setSdsOffering(SdsOffering sdsOffering) {
		SDS_OFFERING.set(sdsOffering);
	}

	private SdsOffering getSdsOffering() {
		return SDS_OFFERING.get();
	}
	
	private SdsCurnitMapGetter curnitMapGetter = new SdsCurnitMapGetter(this);
	
	// TODO LAW check on thread safety of these method

	/**
	 * @see net.sf.sail.webapp.dao.sds.SdsCommand#execute()
	 */
	@SuppressWarnings("unchecked")
	public SdsOffering execute(HttpGetRequest httpRequest)
			throws CurnitMapNotFoundException {
		// TODO LAW check on thread safety of these method
		final SdsOffering sdsOffering = this.getSdsOffering();
		SDS_OFFERING.set(null);
		Document doc = convertXmlInputStreamToXmlDocument(this.transport
				.get(httpRequest));
		if (doc == null) {
			return sdsOffering;
		}

		Element sdsOfferingElement = doc.getRootElement();
		sdsOffering.setName(sdsOfferingElement.getChild("name").getValue());
		sdsOffering.setSdsObjectId(new Long(sdsOfferingElement.getChild("id")
				.getValue()));

		SdsCurnit sdsCurnit = new SdsCurnit();
		sdsCurnit.setSdsObjectId(new Long(sdsOfferingElement.getChild(
				"curnit-id").getValue()));
		sdsOffering.setSdsCurnit(sdsCurnit);

		SdsJnlp sdsJnlp = new SdsJnlp();
		sdsJnlp.setSdsObjectId(new Long(sdsOfferingElement.getChild("jnlp-id")
				.getValue()));
		sdsOffering.setSdsJnlp(sdsJnlp);

		curnitMapGetter.setSdsOfferingCurnitMap(sdsOffering);
		return sdsOffering;

	}

	/**
	 * @see net.sf.sail.webapp.dao.sds.SdsCommand#generateRequest()
	 */
	public HttpGetRequest generateRequest() {
		final SdsOffering sdsOffering = this.getSdsOffering();
		final String url = "/offering/" + sdsOffering.getSdsObjectId();
		return new HttpGetRequest(REQUEST_HEADERS_ACCEPT, EMPTY_STRING_MAP,
				url, HttpStatus.SC_OK);
	}

	/**
	 * @see net.sf.sail.webapp.dao.sds.SdsOfferingGetCommand#getSdsCurnitMap(java.lang.Long)
	 */
	public void getSdsCurnitMap(SdsOffering sdsOffering) throws CurnitMapNotFoundException {
		curnitMapGetter.setSdsOfferingCurnitMap(sdsOffering);
	}

}