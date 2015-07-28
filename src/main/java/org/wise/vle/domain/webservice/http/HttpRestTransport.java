/**
 * Copyright (c) 2006-2015 Encore Research Group, University of Toronto
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

import java.io.InputStream;
import java.util.Map;

import org.apache.commons.httpclient.methods.PostMethod;
import org.wise.vle.domain.webservice.HttpStatusCodeException;

/**
 * An HTTP REST facade.
 * 
 * @author Cynick Young
 */
public interface HttpRestTransport {

	String APPLICATION_XML = "application/xml";

	/**
	 * Performs the POST operation given the data required for the post.
	 * 
	 * @param httpRequestData
	 *            All the data required for this post request.
	 * @return A <code>Map</code> of response headers where the key is the
	 *         header name and the value is the header value.
	 * @throws HttpStatusCodeException
	 *             for exceptions which should be handled by the calling method.
	 * @throws RuntimeExceptions
	 *             for exceptions we can ignore because they are unrecoverable
	 */
	PostMethod post(HttpPostRequest httpRequestData)
			throws HttpStatusCodeException;

	/**
	 * Performs the GET operation given the data required for the get.
	 * 
	 * @param httpRequestData
	 *            All the data required for this get request.
	 * @return An <code>InputStream</code> containing the response body.
	 * @throws HttpStatusCodeException
	 *             for exceptions which are the result of getting an unexpected
	 *             HttpStatusCode in the response. These can be handled by the calling
	 *             method or ignored as required by the situation.
	 * @throws RuntimeExceptions
	 *             for exceptions we can ignore because they are unrecoverable
	 */
	InputStream get(HttpGetRequest httpRequestData)
			throws HttpStatusCodeException;

	/**
	 * Performs the PUT operation given the data required for the put.
	 * 
	 * @param httpRequestData
	 *            All the data required for this put request
	 * @return A <code>Map</code> of response headers where the key is the
	 *         header name and the value is the header value.
	 * @throws HttpStatusCodeException
	 *             for exceptions which should be handled by the calling method.
	 * @throws RuntimeExceptions
	 *             for exceptions we can ignore because they are unrecoverable
	 */
	Map<String, String> put(HttpPutRequest httpRequestData)
			throws HttpStatusCodeException;

	/**
	 * Get the base url bound to this HTTP transport.
	 * 
	 * @return the baseUrl
	 */
	String getBaseUrl();
}