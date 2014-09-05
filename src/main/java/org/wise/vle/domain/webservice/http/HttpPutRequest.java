/**
 * Copyright (c) 2006-2014 Encore Research Group, University of Toronto
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 * 
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Public License for more details.
 *
 * You should have received a copy of the GNU Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package org.wise.vle.domain.webservice.http;

import java.util.Collections;
import java.util.Map;

import org.wise.vle.domain.webservice.BadHeaderException;


/**
 * Immutable and thread-safe class to encapsulate data required for a put
 * request (headers, body, relativeUrl and expected response).
 * 
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public final class HttpPutRequest extends AbstractHttpRequest {

	protected static final Map<String, String> EMPTY_STRING_MAP = Collections
			.emptyMap();

	private String bodyData;

	/**
	 * Creates an HttpPutRequest object with all of the data required.
	 * 
	 * @param requestHeaders
	 *            is a map of HTTP request headers
	 * @param bodyData
	 *            is the serialized string of the body of a PUT request
	 * @param relativeUrl
	 *            is the target relative URL for this request
	 * @param expectedResponseStatusCode
	 *            is the HTTP status code that is expected to be returned by the
	 *            server
	 * @throws BadHeaderException
	 *             if the request headers contain any illegal characters either
	 *             in the request field name or the request field value
	 */
	public HttpPutRequest(final Map<String, String> requestHeaders,
			final String bodyData, final String relativeUrl,
			final int expectedResponseStatusCode) throws BadHeaderException {
		super(requestHeaders, EMPTY_STRING_MAP, relativeUrl,
				expectedResponseStatusCode);
		this.bodyData = bodyData;
	}

	/*
	 * This is intentionally private - to make the HttpPutRequest object
	 * immutable.
	 */
	@SuppressWarnings("unused")
	private HttpPutRequest() {
	}

	/**
	 * Returns the body data for this request.
	 * 
	 * @return the bodyData
	 */
	public String getBodyData() {
		return bodyData;
	}

}
