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

import net.sf.sail.webapp.dao.sds.SdsUserUpdateCommand;
import net.sf.sail.webapp.domain.sds.SdsUser;
import net.sf.sail.webapp.domain.webservice.http.HttpPutRequest;

import org.apache.commons.httpclient.HttpStatus;

/**
 * Implementation of <code>SdsUserUpdateCommand</code> which updates a user in
 * the Sail Data Service (uses Http REST). This class is thread-safe.
 * 
 * @author Laurel Williams
 * 
 * @version $Id$
 * 
 */
public class SdsUserUpdateCommandHttpRestImpl extends AbstractHttpRestCommand
		implements SdsUserUpdateCommand {

	private static final ThreadLocal<SdsUser> SDS_USER = new ThreadLocal<SdsUser>();

	/**
	 * @see net.sf.sail.webapp.dao.sds.SdsUserCreateCommand#setSdsUser(net.sf.sail.webapp.domain.sds.SdsUser)
	 */
	public void setSdsUser(SdsUser sdsUser) {
		SDS_USER.set(sdsUser);
	}

	/**
	 * Returns an SdsUser object
	 * 
	 * @return an SdsUser object
	 */
	private SdsUser getSdsUser() {
		return SDS_USER.get();
	}

	/**
	 * @see net.sf.sail.webapp.dao.sds.SdsCommand#generateRequest()
	 */
	public HttpPutRequest generateRequest() {
		final SdsUser sdsUser = this.getSdsUser();
		final String bodyData = "<user><first-name>" + sdsUser.getFirstName()
				+ "</first-name><last-name>" + sdsUser.getLastName()
				+ "</last-name></user>";

		final String url = "/sail_user/" + sdsUser.getSdsObjectId();

		return new HttpPutRequest(REQUEST_HEADERS_CONTENT, bodyData, url,
				HttpStatus.SC_CREATED);
	}

	/**
	 * @see net.sf.sail.webapp.dao.sds.SdsCommand#execute()
	 */
	public SdsUser execute(final HttpPutRequest httpRequest) {
		this.transport.put(httpRequest);
		final SdsUser sdsUser = this.getSdsUser();
		// clear the thread local reference to avoid resource leak since we're
		// done executing
		SDS_USER.set(null);
		return sdsUser;
	}
}