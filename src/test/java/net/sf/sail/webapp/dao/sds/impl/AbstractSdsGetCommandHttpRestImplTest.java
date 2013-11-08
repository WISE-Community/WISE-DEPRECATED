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

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

import junit.framework.TestCase;
import net.sf.sail.webapp.dao.sds.HttpStatusCodeException;
import net.sf.sail.webapp.dao.sds.SdsCommand;
import net.sf.sail.webapp.domain.webservice.http.HttpGetRequest;
import net.sf.sail.webapp.domain.webservice.http.HttpRestTransport;

import org.easymock.EasyMock;

/**
 * @author Laurel Williams
 * 
 * @version $Id: AbstractSdsGetCommandHttpRestImplTest.java 1095 2007-09-12
 *          18:27:13Z laurel $
 */
public abstract class AbstractSdsGetCommandHttpRestImplTest extends TestCase {

	protected HttpRestTransport mockTransport;

	protected HttpGetRequest httpRequest;

	protected SdsCommand<?, HttpGetRequest> getCommand;

	/**
	 * @see junit.framework.TestCase#setUp()
	 */
	@Override
	protected void setUp() throws Exception {
		super.setUp();
		this.mockTransport = EasyMock.createMock(HttpRestTransport.class);
	}

	/**
	 * @see junit.framework.TestCase#tearDown()
	 */
	@Override
	protected void tearDown() throws Exception {
		super.tearDown();
		this.mockTransport = null;
		this.getCommand = null;
		this.httpRequest = null;
	}

	protected InputStream setAndTestResponseStream(final String responseString)
			throws IOException {
		final InputStream responseStream = new ByteArrayInputStream(
				responseString.getBytes());

		final byte[] streamBytes = new byte[responseString.length()];
		assertEquals(responseString.length(), responseStream.read(streamBytes));
		assertEquals(responseString, new String(streamBytes));
		responseStream.reset();
		
		return responseStream;

	}

	@SuppressWarnings("unchecked")
	public void testExecuteExceptions() throws Exception {
		EasyMock.expect(this.mockTransport.get(this.httpRequest)).andThrow(
				new HttpStatusCodeException("exception"));
		EasyMock.replay(this.mockTransport);
		try {
			this.getCommand.execute(this.httpRequest);
			fail("Expected HttpStatusCodeException");
		} catch (HttpStatusCodeException e) {
		}
		EasyMock.verify(this.mockTransport);

	}

	/**
	 * Not testing this since we would be essentially testing info that is hard
	 * coded.
	 */
	public void testGenerateRequest() {
	}

}
