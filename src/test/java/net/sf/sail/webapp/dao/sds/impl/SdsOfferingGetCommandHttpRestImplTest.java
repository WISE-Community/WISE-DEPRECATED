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

import java.io.IOException;
import java.io.InputStream;

import net.sf.sail.webapp.dao.sds.CurnitMapNotFoundException;
import net.sf.sail.webapp.domain.sds.SdsCurnit;
import net.sf.sail.webapp.domain.sds.SdsJnlp;
import net.sf.sail.webapp.domain.sds.SdsOffering;
import net.sf.sail.webapp.domain.webservice.http.HttpGetRequest;
import net.sf.sail.webapp.domain.webservice.http.impl.HttpGetCurnitMapRequest;

import org.easymock.EasyMock;

/**
 * @author Laurel Williams
 * 
 * @version $Id: SdsOfferingGetCommandHttpRestImplTest.java 1143 2007-09-17
 *          15:25:53Z laurel $
 * 
 */
public class SdsOfferingGetCommandHttpRestImplTest extends
		AbstractSdsGetCommandHttpRestImplTest {

	private SdsOfferingGetCommandHttpRestImpl command;

	private SdsOffering expectedSdsOffering;

	private static final Long ID = new Long(1);

	private static final SdsCurnit SDS_CURNIT = new SdsCurnit();

	private static final SdsJnlp SDS_JNLP = new SdsJnlp();

	private static final String NAME = "the heros";

	private static final String URL = "http://woohoo";

	private static final String XML_RESPONSE = "<offering><name>" + NAME
			+ "</name><curnit-id>" + ID + "</curnit-id><id>" + ID
			+ "</id><jnlp-id>" + ID + "</jnlp-id></offering>";

	private static final String CURNITMAP_XML_RESPONSE = "<curnitmap>this is the curnitmap string</curnitmap>";

	/**
	 * @see junit.framework.TestCase#setUp()
	 */
	@Override
	protected void setUp() throws Exception {
		super.setUp();
		SDS_CURNIT.setName(NAME);
		SDS_CURNIT.setUrl(URL);
		SDS_CURNIT.setSdsObjectId(ID);

		SDS_JNLP.setName(NAME);
		SDS_JNLP.setUrl(URL);
		SDS_JNLP.setSdsObjectId(ID);

		this.expectedSdsOffering = new SdsOffering();
		this.expectedSdsOffering.setSdsCurnit(SDS_CURNIT);
		this.expectedSdsOffering.setSdsJnlp(SDS_JNLP);
		this.expectedSdsOffering.setSdsObjectId(ID);
		this.expectedSdsOffering.setName(NAME);

		this.getCommand = new SdsOfferingGetCommandHttpRestImpl();
		this.command = (SdsOfferingGetCommandHttpRestImpl) this.getCommand;
		this.command.setTransport(this.mockTransport);
		this.command.setSdsOffering(this.expectedSdsOffering);
		this.httpRequest = this.command.generateRequest();
	}

	/**
	 * @see junit.framework.TestCase#tearDown()
	 */
	@Override
	protected void tearDown() throws Exception {
		super.tearDown();
		this.command = null;
		this.expectedSdsOffering = null;
	}

	public void testExecute() throws Exception {
		InputStream responseStream = setAndTestResponseStream(XML_RESPONSE);
		EasyMock.expect(this.mockTransport.get(this.httpRequest)).andReturn(
				responseStream);

		InputStream curnitMapResponseStream = setAndTestResponseStream(CURNITMAP_XML_RESPONSE);
		EasyMock.expect(
				this.mockTransport.get(EasyMock
						.isA(HttpGetCurnitMapRequest.class))).andReturn(
				curnitMapResponseStream);
		EasyMock.replay(this.mockTransport);

		SdsOffering actualOffering = this.command.execute(this.httpRequest);
		assertEquals(NAME, actualOffering.getName());
		assertEquals(SDS_CURNIT.getSdsObjectId(), actualOffering.getSdsCurnit()
				.getSdsObjectId());
		assertEquals(SDS_JNLP.getSdsObjectId(), actualOffering.getSdsJnlp()
				.getSdsObjectId());
		assertEquals(ID, actualOffering.getSdsObjectId());
		assertEquals(CURNITMAP_XML_RESPONSE, actualOffering.getSdsCurnitMap());
		EasyMock.verify(this.mockTransport);
	}

	public void testExecuteThrowsCurnitMapNotFoundException() throws Exception {
		InputStream responseStream = setAndTestResponseStream(XML_RESPONSE);
		EasyMock.expect(this.mockTransport.get(this.httpRequest)).andReturn(
				responseStream);

		EasyMock.expect(
				this.mockTransport.get(EasyMock
						.isA(HttpGetCurnitMapRequest.class))).andThrow(
				new CurnitMapNotFoundException("whatever"));
		EasyMock.replay(this.mockTransport);

		try {
			this.command.execute(this.httpRequest);
			fail("CurnitMapNotFoundException expected");
		} catch (CurnitMapNotFoundException cmnfe) {
			SdsOffering actualOffering = cmnfe.getSdsOffering();
			assertEquals(NAME, actualOffering.getName());
			assertEquals(SDS_CURNIT.getSdsObjectId(), actualOffering
					.getSdsCurnit().getSdsObjectId());
			assertEquals(SDS_JNLP.getSdsObjectId(), actualOffering.getSdsJnlp()
					.getSdsObjectId());
			assertEquals(ID, actualOffering.getSdsObjectId());
			assertEquals("", actualOffering.getSdsCurnitMap());
			EasyMock.verify(this.mockTransport);
		}

	}

	public void testGetSdsCurnitMap() throws IOException {
		InputStream curnitMapResponseStream = setAndTestResponseStream(CURNITMAP_XML_RESPONSE);
		EasyMock.expect(
				this.mockTransport.get(EasyMock
						.isA(HttpGetCurnitMapRequest.class))).andReturn(
				curnitMapResponseStream);
		EasyMock.replay(this.mockTransport);

		assertNull(this.expectedSdsOffering.getSdsCurnitMap());
		this.command.getSdsCurnitMap(this.expectedSdsOffering);
		assertNotNull(this.expectedSdsOffering.getSdsCurnitMap());
		assertEquals(CURNITMAP_XML_RESPONSE, this.expectedSdsOffering
				.getSdsCurnitMap());
		EasyMock.verify(this.mockTransport);

	}

	public void testGetSdsCurnitMap_expectCurnitMapNotFoundException()
			throws IOException {
		EasyMock.expect(
				this.mockTransport.get(EasyMock
						.isA(HttpGetCurnitMapRequest.class))).andThrow(
				new CurnitMapNotFoundException("whatever"));
		EasyMock.replay(this.mockTransport);

		assertNull(this.expectedSdsOffering.getSdsCurnitMap());
		try {
			this.command.getSdsCurnitMap(this.expectedSdsOffering);
			fail("CurnitMapNotFoundException expected");
		} catch (CurnitMapNotFoundException cmnfe) {
			this.expectedSdsOffering = cmnfe.getSdsOffering();
			assertEquals("", this.expectedSdsOffering.getSdsCurnitMap());
			EasyMock.verify(this.mockTransport);
		}
	}

	public void testGenerateRequest() {
		HttpGetRequest request = this.command.generateRequest();
		assertEquals("/offering/" + ID, request.getRelativeUrl());
	}
}