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

import net.sf.sail.webapp.domain.sds.SdsUser;

import org.easymock.EasyMock;

/**
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public class SdsUserCreateCommandHttpRestImplTest extends
        AbstractSdsCreateCommandHttpRestImplTest {

    private static final Long EXPECTED_ID = new Long(1);

    private static final String EXPECTED_FIRST_NAME = "Blah";

    private static final String EXPECTED_LAST_NAME = "Last";

    private static final String USER_DIRECTORY = "user/";

    private SdsUserCreateCommandHttpRestImpl command;

    private SdsUser expectedSdsUser;

    /**
     * @see junit.framework.TestCase#setUp()
     */
    @Override
    protected void setUp() throws Exception {
        super.setUp();
        this.expectedSdsUser = new SdsUser();
        this.expectedSdsUser.setFirstName(EXPECTED_FIRST_NAME);
        this.expectedSdsUser.setLastName(EXPECTED_LAST_NAME);
        this.expectedSdsUser.setSdsObjectId(EXPECTED_ID);

        this.createCommand = new SdsUserCreateCommandHttpRestImpl();
        command = ((SdsUserCreateCommandHttpRestImpl) (this.createCommand));
        command.setTransport(this.mockTransport);
        command.setSdsUser(this.expectedSdsUser);
        this.httpRequest = command.generateRequest();
    }

    /**
     * @see junit.framework.TestCase#tearDown()
     */
    @Override
    protected void tearDown() throws Exception {
        super.tearDown();
        this.command = null;
        this.expectedSdsUser = null;
    }

    public void testExecute() throws Exception {
        assertEquals(this.expectedSdsUser,
                (SdsUser) doExecuteTest(USER_DIRECTORY));
        EasyMock.verify(this.mockTransport);
    }
}