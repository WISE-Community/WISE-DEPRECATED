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

import java.util.Map;

import net.sf.sail.webapp.dao.sds.SdsJnlpCreateCommand;
import net.sf.sail.webapp.domain.sds.SdsJnlp;
import net.sf.sail.webapp.domain.webservice.http.HttpPostRequest;

import org.apache.commons.httpclient.HttpStatus;

/**
 * Implementation of <code>SdsJnlpCreateCommand</code> which creates an JNLP in
 * the Sail Data Service (uses Http REST). This class is thread-safe.
 * 
 * @author Laurel Williams
 * 
 * @version $Id$
 * 
 */
public class SdsJnlpCreateCommandHttpRestImpl extends AbstractHttpRestCommand
        implements SdsJnlpCreateCommand {

    private static final ThreadLocal<SdsJnlp> SDS_JNLP = new ThreadLocal<SdsJnlp>();

    /**
     * @see net.sf.sail.webapp.dao.sds.SdsJnlpCreateCommand#setSdsJnlp(net.sf.sail.webapp.domain.sds.SdsJnlp)
     */
    public void setSdsJnlp(SdsJnlp sdsJnlp) {
        SDS_JNLP.set(sdsJnlp);
    }

    private SdsJnlp getSdsJnlp() {
        return SDS_JNLP.get();
    }

    /**
     * @see net.sf.sail.webapp.dao.sds.SdsCommand#generateRequest()
     */
    @SuppressWarnings("unchecked")
    public HttpPostRequest generateRequest() {
        final SdsJnlp sdsJnlp = this.getSdsJnlp();
        final String bodyData = "<jnlp><name>" + sdsJnlp.getName()
                + "</name><url>" + sdsJnlp.getUrl() + "</url></jnlp>";
        final String url = "/jnlp";
        return new HttpPostRequest(REQUEST_HEADERS_CONTENT, EMPTY_STRING_MAP,
                bodyData, url, HttpStatus.SC_CREATED);
    }

    /**
     * @see net.sf.sail.webapp.dao.sds.SdsCommand#execute()
     */
    public SdsJnlp execute(final HttpPostRequest httpRequest) {
        final Map<String, String> responseHeaders = this.transport
                .post(httpRequest);
        final String locationHeader = responseHeaders.get("Location");
        final SdsJnlp sdsJnlp = this.getSdsJnlp();
        // clear the thread local reference to avoid resource leak since we're
        // done executing
        SDS_JNLP.set(null);
        sdsJnlp.setSdsObjectId(new Long(locationHeader
                .substring(locationHeader.lastIndexOf("/") + 1)));
        return sdsJnlp;
    }
}