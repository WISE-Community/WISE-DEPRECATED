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

import net.sf.sail.webapp.domain.sds.SdsOffering;
import net.sf.sail.webapp.domain.sds.SdsWorkgroup;

import org.easymock.EasyMock;

/**
 * @author Cynick Young
 * 
 * @version $Id: SdsWorkgroupCreateCommandHttpRestImplTest.java 257 2007-03-30
 *          14:59:02Z cynick $
 * 
 */
public class SdsWorkgroupCreateCommandHttpRestImplTest extends
        AbstractSdsCreateCommandHttpRestImplTest {

    private static final String WORKGROUP_DIRECTORY = "workgroup/";

    private static final String SOME_NAME = "pineapples";

    private SdsWorkgroupCreateCommandHttpRestImpl command = null;

    private SdsWorkgroup expectedSdsWorkgroup;

    /**
     * @see junit.framework.TestCase#setUp()
     */
    @Override
    protected void setUp() throws Exception {
        super.setUp();

        expectedSdsWorkgroup = new SdsWorkgroup();
        expectedSdsWorkgroup.setName(SOME_NAME);
        SdsOffering existingOffering = new SdsOffering();
        Long existingOfferingId = new Long(42);
        existingOffering.setSdsObjectId(existingOfferingId);
        expectedSdsWorkgroup.setSdsOffering(existingOffering);

        this.createCommand = new SdsWorkgroupCreateCommandHttpRestImpl();
        command = ((SdsWorkgroupCreateCommandHttpRestImpl) (this.createCommand));
        command.setTransport(this.mockTransport);
        command.setSdsWorkgroup(this.expectedSdsWorkgroup);
        this.httpRequest = command.generateRequest();
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
        assertEquals(this.expectedSdsWorkgroup,
                (SdsWorkgroup) doExecuteTest(WORKGROUP_DIRECTORY));
        EasyMock.verify(this.mockTransport);
    }

}