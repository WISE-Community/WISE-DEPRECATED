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

import net.sf.sail.webapp.domain.sds.SdsCurnit;

import org.easymock.EasyMock;

/**
 * @author Laurel Williams
 * 
 * @version $Id: SdsCurnitListCommandHttpRestImplTest.java 220 2007-03-23
 *          15:11:02Z laurel $
 * 
 */
public class SdsCurnitListCommandHttpRestImplTest extends
        AbstractSdsListCommandHttpRestImplTest {

    SdsCurnitListCommandHttpRestImpl command;

    /**
     * @see junit.framework.TestCase#setUp()
     */
    @Override
    protected void setUp() throws Exception {
        super.setUp();
        this.listCommand = new SdsCurnitListCommandHttpRestImpl();
        this.command = (SdsCurnitListCommandHttpRestImpl) this.listCommand;
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
        final String responseString = "<curnits><curnit><name>Airbag test</name><portal-id type=\"integer\">1</portal-id><url>http://tels-develop.soe.berkeley.edu:8080/maven-jnlp/curnit-airbag.jar</url><id type=\"integer\">3</id></curnit><curnit><name>Windbag test</name><portal-id type=\"integer\">1</portal-id><url>http://tels-develop.soe.berkeley.edu:8080/maven-jnlp/curnit-windbag.jar</url><id type=\"integer\">2</id></curnit></curnits>";
        InputStream responseStream = setAndTestResponseStream(responseString);

        EasyMock.expect(this.mockTransport.get(this.httpRequest)).andReturn(
                responseStream);
        EasyMock.replay(this.mockTransport);

        List<SdsCurnit> expectedList = new LinkedList<SdsCurnit>();
        expectedList
                .add(createCurnit(
                        3,
                        "http://tels-develop.soe.berkeley.edu:8080/maven-jnlp/curnit-airbag.jar",
                        "Airbag test"));
        expectedList
                .add(createCurnit(
                        2,
                        "http://tels-develop.soe.berkeley.edu:8080/maven-jnlp/curnit-windbag.jar",
                        "Windbag test"));

        List<SdsCurnit> actualList = this.command.execute(this.httpRequest);
        assertEquals(expectedList.size(), actualList.size());
        assertEquals(expectedList, actualList);
        EasyMock.verify(this.mockTransport);
    }

    public void testExecuteBadXML() throws Exception {
        testBadXml("<curnits></curnits>");
        testBadXml("<fred></fred>");
        testBadXml("<curnits>");
        testBadXml("");
    }

    private void testBadXml(String badXml) {
        InputStream responseStream = new ByteArrayInputStream(badXml.getBytes());
        testResponse(responseStream);
    }

    public void testExecuteBadStream() throws Exception {
        InputStream responseStream = new ByteArrayInputStream(
                "<curnits></curnits>".getBytes());
        responseStream.close(); // this would be the bad part
        testResponse(responseStream);
    }

    private void testResponse(InputStream responseStream) {
        EasyMock.expect(this.mockTransport.get(this.httpRequest)).andReturn(
                responseStream);
        EasyMock.replay(this.mockTransport);
        List<SdsCurnit> actualList = this.command.execute(this.httpRequest);
        assertTrue(actualList.isEmpty());
        EasyMock.verify(this.mockTransport);
        EasyMock.reset(this.mockTransport);
    }

    private SdsCurnit createCurnit(int objectId, String url, String name) {
        SdsCurnit curnit = new SdsCurnit();
        curnit.setSdsObjectId(new Long(objectId));
        curnit.setName(name);
        curnit.setUrl(url);

        return curnit;
    }
}