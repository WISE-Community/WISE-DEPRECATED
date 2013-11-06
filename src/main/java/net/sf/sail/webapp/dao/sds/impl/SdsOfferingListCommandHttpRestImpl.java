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

import java.util.Collections;
import java.util.LinkedList;
import java.util.List;

import net.sf.sail.webapp.dao.sds.CurnitMapNotFoundException;
import net.sf.sail.webapp.dao.sds.SdsOfferingListCommand;
import net.sf.sail.webapp.domain.sds.SdsCurnit;
import net.sf.sail.webapp.domain.sds.SdsJnlp;
import net.sf.sail.webapp.domain.sds.SdsOffering;
import net.sf.sail.webapp.domain.webservice.http.HttpGetRequest;

import org.apache.commons.httpclient.HttpStatus;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.xpath.XPath;

/**
 * Implementation of <code>SdsOfferingListCommand</code> which lists all the
 * offerings from the Sail Data Service (uses Http REST). This class is
 * thread-safe.
 * 
 * @author Cynick Young
 * 
 * @version $Id: SdsOfferingListCommandHttpRestImpl.java 257 2007-03-30
 *          14:59:02Z cynick $
 * 
 */
public class SdsOfferingListCommandHttpRestImpl extends AbstractHttpRestCommand
		implements SdsOfferingListCommand {

	private static final List<SdsOffering> EMPTY_SDSOFFERING_LIST = Collections
			.emptyList();

	private SdsCurnitMapGetter curnitMapGetter = new SdsCurnitMapGetter(this);

	/**
	 * @see net.sf.sail.webapp.dao.sds.SdsCommand#execute()
	 */
	@SuppressWarnings("unchecked")
	public List<SdsOffering> execute(HttpGetRequest httpRequest) {
		Document doc = convertXmlInputStreamToXmlDocument(this.transport
				.get(httpRequest));
		if (doc == null) {
			return EMPTY_SDSOFFERING_LIST;
		}

		List<Element> nodeList;
		try {
			nodeList = XPath.newInstance("/offerings/offering")
					.selectNodes(doc);
		} catch (JDOMException e) {
			if (logger.isErrorEnabled()) {
				logger.error(e.getMessage(), e);
			}
			return EMPTY_SDSOFFERING_LIST;
		}

		List<SdsOffering> sdsOfferingList = new LinkedList<SdsOffering>();
		for (Element offeringNode : nodeList) {
			SdsOffering sdsOffering = new SdsOffering();
			sdsOffering.setName(offeringNode.getChild("name").getValue());
			sdsOffering.setSdsObjectId(new Long(offeringNode.getChild("id")
					.getValue()));

			SdsCurnit sdsCurnit = new SdsCurnit();
			sdsCurnit.setSdsObjectId(new Long(offeringNode
					.getChild("curnit-id").getValue()));
			sdsOffering.setSdsCurnit(sdsCurnit);

			SdsJnlp sdsJnlp = new SdsJnlp();
			sdsJnlp.setSdsObjectId(new Long(offeringNode.getChild("jnlp-id")
					.getValue()));
			sdsOffering.setSdsJnlp(sdsJnlp);

			try {
				curnitMapGetter.setSdsOfferingCurnitMap(sdsOffering);
			} catch (CurnitMapNotFoundException cmnfe) {
				sdsOffering = cmnfe.getSdsOffering();
				// TODO LAW note here that if the curnitmap is not found a blank
				// curnitmap is inserted. There is nothing otherwise to alert us
				// that a curnitmap was not found
			}
			sdsOfferingList.add(sdsOffering);
		}
		return sdsOfferingList;
	}

	/**
	 * @see net.sf.sail.webapp.dao.sds.SdsCommand#generateRequest()
	 */
	public HttpGetRequest generateRequest() {
		final String url = "/offering";

		return new HttpGetRequest(REQUEST_HEADERS_ACCEPT, EMPTY_STRING_MAP,
				url, HttpStatus.SC_OK);
	}

}