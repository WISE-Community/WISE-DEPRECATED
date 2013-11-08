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

import net.sf.sail.webapp.dao.sds.SdsCurnitCreateCommand;
import net.sf.sail.webapp.domain.sds.SdsCurnit;
import net.sf.sail.webapp.domain.webservice.http.HttpPostRequest;

import org.apache.commons.httpclient.HttpStatus;

/**
 * Implementation of <code>SdsCurnitCreateCommand</code> which creates a user
 * in the Sail Data Service (uses Http REST). This class is thread-safe.
 * 
 * @author Laurel Williams
 * 
 * @version $Id: SdsCurnitCreateCommandHttpRestImpl.java 257 2007-03-30
 *          14:59:02Z cynick $
 * 
 */
public class SdsCurnitCreateCommandHttpRestImpl extends AbstractHttpRestCommand
        implements SdsCurnitCreateCommand {

    private static final ThreadLocal<SdsCurnit> SDS_CURNIT = new ThreadLocal<SdsCurnit>();

    /**
     * @see net.sf.sail.webapp.dao.sds.SdsCurnitCreateCommand#setSdsCurnit(net.sf.sail.webapp.domain.sds.SdsCurnit)
     */
    public void setSdsCurnit(SdsCurnit sdsCurnit) {
        SDS_CURNIT.set(sdsCurnit);
    }

    private SdsCurnit getSdsCurnit() {
        return SDS_CURNIT.get();
    }

    /**
     * @see net.sf.sail.webapp.dao.sds.SdsCommand#generateRequest()
     */
    public HttpPostRequest generateRequest() {
        final SdsCurnit sdsCurnit = this.getSdsCurnit();
        final String bodyData = "<curnit><name>" + sdsCurnit.getName()
                + "</name><url>" + sdsCurnit.getUrl() + "</url></curnit>";
        final String url = "/curnit";
        return new HttpPostRequest(REQUEST_HEADERS_CONTENT, EMPTY_STRING_MAP,
                bodyData, url, HttpStatus.SC_CREATED);
    }

    /**
     * @see net.sf.sail.webapp.dao.sds.SdsCommand#execute()
     */
    public SdsCurnit execute(final HttpPostRequest httpRequest) {
        final Map<String, String> responseHeaders = this.transport
                .post(httpRequest);
        final String locationHeader = responseHeaders.get("Location");
        final SdsCurnit sdsCurnit = this.getSdsCurnit();
        // clear the thread local reference to avoid resource leak since we're
        // done executing
        SDS_CURNIT.set(null);
        sdsCurnit.setSdsObjectId(new Long(locationHeader
                .substring(locationHeader.lastIndexOf("/") + 1)));
        return sdsCurnit;
    }
}