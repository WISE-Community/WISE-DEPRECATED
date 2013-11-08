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
import java.io.InputStream;
import java.util.LinkedList;
import java.util.List;

import net.sf.sail.webapp.dao.sds.HttpStatusCodeException;
import net.sf.sail.webapp.domain.sds.SdsCurnit;
import net.sf.sail.webapp.domain.sds.SdsJnlp;
import net.sf.sail.webapp.domain.sds.SdsOffering;
import net.sf.sail.webapp.domain.webservice.http.HttpGetRequest;

import org.easymock.EasyMock;

/**
 * @author Cynick Young
 * 
 * @version $Id: SdsOfferingListCommandHttpRestImplTest.java 257 2007-03-30
 *          14:59:02Z cynick $
 * 
 */
public class SdsOfferingListCommandHttpRestImplTest extends
        AbstractSdsListCommandHttpRestImplTest {

    private SdsOfferingListCommandHttpRestImpl command;
    
	private static final String CURNITMAP_XML_RESPONSE = "<curnitmap>this is the curnitmap string</curnitmap>";


    /**
     * @see junit.framework.TestCase#setUp()
     */
    @Override
    protected void setUp() throws Exception {
        super.setUp();
        this.listCommand = new SdsOfferingListCommandHttpRestImpl();
        command = ((SdsOfferingListCommandHttpRestImpl) (this.listCommand));
        this.command.setTransport(this.mockTransport);
        this.httpRequest = this.command.generateRequest();
    }

    /**
     * @see junit.framework.TestCase#tearDown()
     */
    @Override
    protected void tearDown() throws Exception {
        super.tearDown();
        this.command = null;
    }

    /**
     * Test method for
     * {@link net.sf.sail.webapp.dao.sds.impl.SdsCurnitListCommandHttpRestImpl#execute(net.sf.sail.webapp.domain.sds.SdsOffering)}.
     */
    public void testExecute() throws Exception {
        final String responseString = "<offerings><offering><name>Airbag Complete</name><curnit-id>1</curnit-id><id>1</id><jnlp-id>6</jnlp-id></offering><offering><name>Air Bag Test</name><curnit-id>2</curnit-id><id>2</id><jnlp-id>6</jnlp-id></offering></offerings>";
        InputStream responseStream = setAndTestResponseStream(responseString);
        
        EasyMock.expect(this.mockTransport.get(this.httpRequest)).andReturn(
                responseStream);

		InputStream curnitMapResponseStream = setAndTestResponseStream(CURNITMAP_XML_RESPONSE);
		EasyMock.expect(this.mockTransport.get(EasyMock.isA(HttpGetRequest.class))).andReturn(
				curnitMapResponseStream);
		curnitMapResponseStream = setAndTestResponseStream(CURNITMAP_XML_RESPONSE);
		EasyMock.expect(this.mockTransport.get(EasyMock.isA(HttpGetRequest.class))).andReturn(
				curnitMapResponseStream);
		EasyMock.replay(this.mockTransport);

        
        List<SdsOffering> expectedList = new LinkedList<SdsOffering>();
        expectedList.add(createOffering(1, 1, 6, "Airbag Complete", CURNITMAP_XML_RESPONSE));
        expectedList.add(createOffering(2, 2, 6, "Air Bag Test", CURNITMAP_XML_RESPONSE));

        List<SdsOffering> actualList = this.command.execute(this.httpRequest);
        assertEquals(expectedList.size(), actualList.size());
        assertEquals((SdsOffering) expectedList.get(0), (SdsOffering) actualList.get(0));
        assertEquals((SdsOffering) expectedList.get(1), (SdsOffering) actualList.get(1));
        EasyMock.verify(this.mockTransport);
    }

    public void testExecuteBadXML() throws Exception {
        InputStream responseStream = new ByteArrayInputStream(
                "<offerings></offerings>".getBytes());
        EasyMock.expect(this.mockTransport.get(this.httpRequest)).andReturn(
                responseStream);
        EasyMock.replay(this.mockTransport);
        List<SdsOffering> actualList = this.command.execute(this.httpRequest);
        assertTrue(actualList.isEmpty());
        EasyMock.verify(this.mockTransport);

        EasyMock.reset(this.mockTransport);
        responseStream = new ByteArrayInputStream("<fred></fred>".getBytes());
        EasyMock.expect(this.mockTransport.get(this.httpRequest)).andReturn(
                responseStream);
        EasyMock.replay(this.mockTransport);
        actualList = this.command.execute(this.httpRequest);
        assertTrue(actualList.isEmpty());
        EasyMock.verify(this.mockTransport);

        EasyMock.reset(this.mockTransport);
        responseStream = new ByteArrayInputStream("<offerings>".getBytes());
        EasyMock.expect(this.mockTransport.get(this.httpRequest)).andReturn(
                responseStream);
        EasyMock.replay(this.mockTransport);
        actualList = this.command.execute(this.httpRequest);
        assertTrue(actualList.isEmpty());
        EasyMock.verify(this.mockTransport);
    }

    public void testExecuteBadStream() throws Exception {
        InputStream responseStream = new ByteArrayInputStream(
                "<offerings></offerings>".getBytes());
        responseStream.close(); // this would be the bad part
        EasyMock.expect(this.mockTransport.get(this.httpRequest)).andReturn(
                responseStream);
        EasyMock.replay(this.mockTransport);
        List<SdsOffering> actualList = this.command.execute(this.httpRequest);
        assertTrue(actualList.isEmpty());
        EasyMock.verify(this.mockTransport);
    }

    public void testExecuteExceptions() throws Exception {
        EasyMock.expect(this.mockTransport.get(this.httpRequest)).andThrow(
                new HttpStatusCodeException("exception"));
        EasyMock.replay(this.mockTransport);
        try {
            this.command.execute(this.httpRequest);
            fail("Expected HttpStatusCodeException");
        } catch (HttpStatusCodeException e) {
        }
        EasyMock.verify(this.mockTransport);

    }

    private SdsOffering createOffering(int objectId, int curnitId, int jnlpId,
            String name, String curnitmap) {
        SdsOffering offering = new SdsOffering();
        offering.setSdsObjectId(new Long(objectId));
        offering.setName(name);

        SdsCurnit curnit = new SdsCurnit();
        curnit.setSdsObjectId(new Long(curnitId));
        offering.setSdsCurnit(curnit);

        SdsJnlp jnlp = new SdsJnlp();
        jnlp.setSdsObjectId(new Long(jnlpId));
        offering.setSdsJnlp(jnlp);
        
        offering.setSdsCurnitMap(curnitmap);

        return offering;
    }
}