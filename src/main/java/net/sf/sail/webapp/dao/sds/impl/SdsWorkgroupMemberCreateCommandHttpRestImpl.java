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

import java.util.Set;
import java.util.TreeSet;

import net.sf.sail.webapp.dao.sds.SdsWorkgroupMemberCreateCommand;
import net.sf.sail.webapp.domain.sds.SdsUser;
import net.sf.sail.webapp.domain.sds.SdsWorkgroup;
import net.sf.sail.webapp.domain.webservice.http.HttpPostRequest;

import org.apache.commons.httpclient.HttpStatus;

/**
 * Implementation of <code>SdsWorkgroupMemberCreateCommand</code> which
 * creates a membership list for a given workgroup in the Sail Data Service
 * (uses Http REST). This class is thread-safe.
 * 
 * @author Hiroki Terashima
 * 
 * @version $Id$
 * 
 */
public class SdsWorkgroupMemberCreateCommandHttpRestImpl extends
        AbstractHttpRestCommand implements SdsWorkgroupMemberCreateCommand {

    private static final ThreadLocal<SdsWorkgroup> SDS_WORKGROUP = new ThreadLocal<SdsWorkgroup>();

    /**
     * @see net.sf.sail.webapp.dao.sds.SdsWorkgroupMemberCreateCommand#setWorkgroup(net.sf.sail.webapp.domain.sds.SdsWorkgroup)
     */
    public void setWorkgroup(SdsWorkgroup workgroup) {
        SDS_WORKGROUP.set(workgroup);
    }

    private SdsWorkgroup getWorkgroup() {
        return SDS_WORKGROUP.get();
    }

    /**
     * @see net.sf.sail.webapp.dao.sds.SdsCommand#execute(net.sf.sail.webapp.domain.webservice.http.AbstractHttpRequest)
     */
    public SdsWorkgroup execute(final HttpPostRequest httpRequest) {
        this.transport.post(httpRequest);
        SdsWorkgroup workgroup = this.getWorkgroup();

        // release the thread local reference to the actual object to prevent
        // resource leak problem
        this.setWorkgroup(null);
        return workgroup;
    }

    /**
     * @see net.sf.sail.webapp.dao.sds.SdsCommand#generateRequest()
     */
    public HttpPostRequest generateRequest() {
        final SdsWorkgroup workgroup = this.getWorkgroup();
        final Set<SdsUser> membersList = workgroup.getMembers();
        String membersString = "";
        System.out.println(membersList.size());
        SdsUser sdsUser = membersList.iterator().next();
        System.out.println(sdsUser);
        System.out.println(sdsUser.getFirstName());
        for (SdsUser member : membersList) {
            membersString += "<workgroup-membership><sail-user-id>"
                    + member.getSdsObjectId()
                    + "</sail-user-id></workgroup-membership>";
        }
        final String bodyData = "<workgroup-memberships>" + membersString
                + "</workgroup-memberships>";
        final String url = "/workgroup/" + workgroup.getSdsObjectId()
                + "/membership";
        return new HttpPostRequest(REQUEST_HEADERS_CONTENT, EMPTY_STRING_MAP,
                bodyData, url, HttpStatus.SC_CREATED);
    }
}
