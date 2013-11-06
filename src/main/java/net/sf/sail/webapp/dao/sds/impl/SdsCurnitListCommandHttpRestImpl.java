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

import net.sf.sail.webapp.dao.sds.SdsCurnitListCommand;
import net.sf.sail.webapp.domain.sds.SdsCurnit;
import net.sf.sail.webapp.domain.webservice.http.HttpGetRequest;

import org.apache.commons.httpclient.HttpStatus;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.xpath.XPath;

/**
 * Implementation of <code>SdsCurnitListCommand</code> which lists all the
 * offerings from the Sail Data Service (uses Http REST). This class is
 * thread-safe.
 * 
 * @author Cynick Young
 * 
 * @version $Id: SdsCurnitListCommandHttpRestImpl.java 220 2007-03-23 15:11:02Z
 *          laurel $
 * 
 */
public class SdsCurnitListCommandHttpRestImpl extends AbstractHttpRestCommand
        implements SdsCurnitListCommand {

    private static final List<SdsCurnit> EMPTY_SDSCURNIT_LIST = Collections
            .emptyList();

    /**
     * @see net.sf.sail.webapp.dao.sds.SdsCommand#execute()
     */
    @SuppressWarnings("unchecked")
    public List<SdsCurnit> execute(HttpGetRequest httpRequest) {
        Document doc = convertXmlInputStreamToXmlDocument(this.transport
                .get(httpRequest));
        if (doc == null) {
            return EMPTY_SDSCURNIT_LIST;
        }

        List<Element> nodeList;
        try {
            nodeList = XPath.newInstance("/curnits/curnit").selectNodes(doc);
        } catch (JDOMException e) {
            if (logger.isErrorEnabled()) {
                logger.error(e.getMessage(), e);
            }
            return EMPTY_SDSCURNIT_LIST;
        }

        List<SdsCurnit> sdsCurnitList = new LinkedList<SdsCurnit>();
        for (Element curnitNode : nodeList) {
            SdsCurnit sdsCurnit = new SdsCurnit();
            sdsCurnit.setName(curnitNode.getChild("name").getValue());
            sdsCurnit.setSdsObjectId(new Long(curnitNode.getChild("id")
                    .getValue()));
            sdsCurnit.setUrl(curnitNode.getChild("url").getValue());

            sdsCurnitList.add(sdsCurnit);
        }
        return sdsCurnitList;
    }

    /**
     * @see net.sf.sail.webapp.dao.sds.SdsCommand#generateRequest()
     */
    public HttpGetRequest generateRequest() {
        final String url = "/curnit";

        return new HttpGetRequest(REQUEST_HEADERS_ACCEPT, EMPTY_STRING_MAP,
                url, HttpStatus.SC_OK);
    }
}