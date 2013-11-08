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

import net.sf.sail.webapp.dao.sds.SdsWorkgroupUpdateCommand;
import net.sf.sail.webapp.domain.sds.SdsWorkgroup;
import net.sf.sail.webapp.domain.webservice.http.HttpPutRequest;

import org.apache.commons.httpclient.HttpStatus;

/**
 * Implementation of <code>SdsWorkgroupUpdateCommand</code> which updates a
 * workgroup in the Sail Data Service (uses Http REST). This class is
 * thread-safe.
 * 
 * @author Laurel Williams
 * 
 * @version $Id$
 * 
 */
public class SdsWorkgroupUpdateCommandHttpRestImpl extends
        AbstractHttpRestCommand implements SdsWorkgroupUpdateCommand {

    private static final ThreadLocal<SdsWorkgroup> SDS_WORKGROUP = new ThreadLocal<SdsWorkgroup>();

    /**
     * @see net.sf.sail.webapp.dao.sds.SdsWorkgroupUpdateCommand#setSdsWorkgroup(net.sf.sail.webapp.domain.sds.SdsWorkgroup)
     */
    public void setSdsWorkgroup(SdsWorkgroup workgroup) {
        SDS_WORKGROUP.set(workgroup);
    }

    private SdsWorkgroup getSdsWorkgroup() {
        return SDS_WORKGROUP.get();
    }

    /**
     * @see net.sf.sail.webapp.dao.sds.SdsCommand#execute(net.sf.sail.webapp.domain.webservice.http.AbstractHttpRequest)
     */
    public SdsWorkgroup execute(final HttpPutRequest httpRequest) {
        this.transport.put(httpRequest);
        SdsWorkgroup workgroup = this.getSdsWorkgroup();
        this.setSdsWorkgroup(null);
        return workgroup;
    }

    /**
     * @see net.sf.sail.webapp.dao.sds.SdsCommand#generateRequest()
     */
    public HttpPutRequest generateRequest() {
        final SdsWorkgroup workgroup = this.getSdsWorkgroup();
        final String bodyData = "<workgroup><name>" + workgroup.getName()
                + "</name><offering-id>"
                + workgroup.getSdsOffering().getSdsObjectId()
                + "</offering-id></workgroup>";
        final String url = "/workgroup/" + workgroup.getSdsObjectId();
        return new HttpPutRequest(REQUEST_HEADERS_CONTENT, bodyData, url, HttpStatus.SC_CREATED);
    }
}