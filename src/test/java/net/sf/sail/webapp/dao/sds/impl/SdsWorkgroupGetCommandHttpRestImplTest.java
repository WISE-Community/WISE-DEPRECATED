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

import java.io.InputStream;

import net.sf.sail.webapp.domain.sds.SdsOffering;
import net.sf.sail.webapp.domain.sds.SdsWorkgroup;
import net.sf.sail.webapp.domain.webservice.http.HttpGetRequest;

import org.easymock.EasyMock;

/**
 * @author Laurel Williams
 * 
 * @version $Id: SdsOfferingGetCommandHttpRestImplTest.java 1143 2007-09-17
 *          15:25:53Z laurel $
 * 
 */
public class SdsWorkgroupGetCommandHttpRestImplTest extends
		AbstractSdsGetCommandHttpRestImplTest {

	private SdsWorkgroupGetCommandHttpRestImpl command;
	
	private SdsWorkgroup expectedSdsWorkgroup;

	private static final Long ID = new Long(1);
	
	private static final String NAME = "objectname";

	private static final SdsOffering SDS_OFFERING = new SdsOffering();

	private static final String XML_RESPONSE = "<workgroup><name>" + NAME + "</name><id>" + ID + "</id><offering-id>" + ID + "</offering-id></workgroup>";

	private static final String SESSIONBUNDLE_XML_RESPONSE = "<bundle>this is the session bundle string</bundle>";

	/**
	 * @see junit.framework.TestCase#setUp()
	 */
	@Override
	protected void setUp() throws Exception {
		super.setUp();
		
		SDS_OFFERING.setName(NAME);
		SDS_OFFERING.setSdsObjectId(ID);

		this.expectedSdsWorkgroup = new SdsWorkgroup();
		this.expectedSdsWorkgroup.setSdsObjectId(ID);
		this.expectedSdsWorkgroup.setName(NAME);
		this.expectedSdsWorkgroup.setSdsOffering(SDS_OFFERING);
		
		this.getCommand = new SdsWorkgroupGetCommandHttpRestImpl();
		this.command = (SdsWorkgroupGetCommandHttpRestImpl) this.getCommand;
		this.command.setTransport(this.mockTransport);
		this.command.setSdsWorkgroup(this.expectedSdsWorkgroup);
		this.httpRequest = this.command.generateRequest();
	}

	/**
	 * @see junit.framework.TestCase#tearDown()
	 */
	@Override
	protected void tearDown() throws Exception {
		super.tearDown();
		this.command = null;
		this.expectedSdsWorkgroup = null;
	}

	public void testExecute() throws Exception {
		InputStream responseStream = setAndTestResponseStream(XML_RESPONSE);
		EasyMock.expect(this.mockTransport.get(this.httpRequest)).andReturn(
				responseStream);

		InputStream sessionBundleResponseStream = setAndTestResponseStream(SESSIONBUNDLE_XML_RESPONSE);
		EasyMock.expect(this.mockTransport.get(EasyMock.isA(HttpGetRequest.class))).andReturn(
				sessionBundleResponseStream);
		EasyMock.replay(this.mockTransport);

		SdsWorkgroup actualWorkgroup = this.command.execute(this.httpRequest);
		assertEquals(NAME, actualWorkgroup.getName());
		assertEquals(SDS_OFFERING.getSdsObjectId(), actualWorkgroup.getSdsOffering()	.getSdsObjectId());
		assertEquals(ID, actualWorkgroup.getSdsObjectId());
		assertEquals(SESSIONBUNDLE_XML_RESPONSE, actualWorkgroup.getSdsSessionBundle());
		EasyMock.verify(this.mockTransport);
	}

	public void testGenerateRequest() {
		HttpGetRequest request = this.command.generateRequest();
		assertEquals("/workgroup/" + ID, request.getRelativeUrl());
	}
	
	public void testGenerateSessionBundleRequest() {
		Long sdsOfferingId = new Long(5);
		Long sdsWorkgroupId = new Long(3);
		HttpGetRequest request = this.command.generateSessionBundleRequest(sdsWorkgroupId,sdsOfferingId);
		assertEquals("/offering/" + sdsOfferingId + "/bundle/" + sdsWorkgroupId + "/0", request.getRelativeUrl());
		
	}
}