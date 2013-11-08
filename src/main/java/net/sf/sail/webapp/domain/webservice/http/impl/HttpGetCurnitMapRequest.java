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
package net.sf.sail.webapp.domain.webservice.http.impl;

import java.io.IOException;
import java.util.Map;

import net.sf.sail.webapp.dao.sds.CurnitMapNotFoundException;
import net.sf.sail.webapp.dao.sds.HttpStatusCodeException;
import net.sf.sail.webapp.domain.webservice.BadHeaderException;
import net.sf.sail.webapp.domain.webservice.http.HttpGetRequest;

import org.apache.commons.httpclient.HttpMethod;

/**
 * Immutable and thread-safe class to encapsulate data required for a GET
 * request for curnitmaps specifically.
 * 
 * @author Laurel Williams
 * 
 * @version $Id$
 * 
 */
public class HttpGetCurnitMapRequest extends HttpGetRequest {

	/**
	 * Creates an HttpGetCurnitMapRequest object with all of the data required.
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
	public HttpGetCurnitMapRequest(final Map<String, String> requestHeaders,
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
	protected HttpGetCurnitMapRequest() {
		throw new UnsupportedOperationException();
	}

	/**
	 * @see net.sf.sail.webapp.domain.webservice.http.AbstractHttpRequest#isValidResponseStatus(org.apache.commons.httpclient.HttpMethod,
	 *      int)
	 */
	public boolean isValidResponseStatus(HttpMethod method, int actualStatusCode)
			throws IOException, HttpStatusCodeException {
		if (actualStatusCode == this.expectedResponseStatusCode)
			return true;

		String statusText = method.getStatusText();
		logMethodInfo(method, actualStatusCode);
		throw new CurnitMapNotFoundException(statusText);
	}

}