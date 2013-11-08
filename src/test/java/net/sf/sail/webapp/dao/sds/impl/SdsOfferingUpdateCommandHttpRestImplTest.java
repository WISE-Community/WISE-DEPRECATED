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

import net.sf.sail.webapp.domain.sds.SdsCurnit;
import net.sf.sail.webapp.domain.sds.SdsJnlp;
import net.sf.sail.webapp.domain.sds.SdsOffering;

import org.easymock.EasyMock;

/**
 * @author Laurel Williams
 * 
 * @version $Id: SdsOfferingCreateCommandHttpRestImplTest.java 257 2007-03-30
 *          14:59:02Z cynick $
 * 
 */
public class SdsOfferingUpdateCommandHttpRestImplTest extends
        AbstractSdsUpdateCommandHttpRestImplTest {

    private static final String EXPECTED_NAME = "Blah";

    private static final Long EXPECTED_CURNIT_ID = new Long(5);

    private static final Long EXPECTED_JNLP_ID = new Long(5);

    private static final String OFFERING_DIRECTORY = "offering/";

    private SdsOfferingUpdateCommandHttpRestImpl command = null;

    private SdsOffering expectedSdsOffering;

    private SdsCurnit expectedSdsCurnit;

    private SdsJnlp expectedSdsJnlp;

    /**
     * @see junit.framework.TestCase#setUp()
     */
    @Override
    protected void setUp() throws Exception {
        super.setUp();
        this.expectedSdsOffering = new SdsOffering();

        this.expectedSdsCurnit = new SdsCurnit();
        this.expectedSdsCurnit.setSdsObjectId(EXPECTED_CURNIT_ID);
        this.expectedSdsOffering.setSdsCurnit(this.expectedSdsCurnit);

        this.expectedSdsJnlp = new SdsJnlp();
        this.expectedSdsJnlp.setSdsObjectId(EXPECTED_JNLP_ID);
        this.expectedSdsOffering.setSdsJnlp(this.expectedSdsJnlp);

        this.expectedSdsOffering.setSdsObjectId(EXPECTED_ID);
        this.expectedSdsOffering.setName(EXPECTED_NAME);
        
        this.updateCommand = new SdsOfferingUpdateCommandHttpRestImpl();
        command = ((SdsOfferingUpdateCommandHttpRestImpl) (this.updateCommand));
        command.setTransport(this.mockTransport);
        command.setSdsOffering(this.expectedSdsOffering);
        this.httpRequest = command.generateRequest();
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
        assertEquals(this.expectedSdsOffering,
                (SdsOffering) doExecuteTest(OFFERING_DIRECTORY));
        EasyMock.verify(this.mockTransport);
    }
}