/**
 * Copyright (c) 2007-2015 Encore Research Group, University of Toronto
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

import java.util.Map;

import org.wise.vle.domain.webservice.BadHeaderException;

/**
 * Immutable and thread-safe class to encapsulate data required for a GET
 * request (headers, parameters, relativeUrl and expected response).
 * 
 * @author Cynick Young
 */
public class HttpGetRequest extends AbstractHttpRequest {

	/**
	 * Creates an HttpGetRequest object with all of the data required.
	 * 
	 * @param requestHeaders
	 *            is a map of HTTP request headers
	 * @param requestParameters
	 *            is a map of HTTP request parameters
	 * @param relativeUrl
	 *            is the target relative URL for this request
	 * @param expectedResponseStatusCode
	 *            is the HTTP status code that is expected to be returned by the
	 *            server
	 * @throws BadHeaderException
	 *             if the request headers contain any illegal characters either
	 *             in the request field name or the request field value
	 */
	public HttpGetRequest(final Map<String, String> requestHeaders,
			final Map<String, String> requestParameters,
			final String relativeUrl, final int expectedResponseStatusCode)
			throws BadHeaderException {

		super(requestHeaders, requestParameters, relativeUrl,
				expectedResponseStatusCode);
	}

	/**
	 * DO NOT USE THIS METHOD
	 */
	@SuppressWarnings("unused")
	protected HttpGetRequest() {
		throw new UnsupportedOperationException();
	}

}