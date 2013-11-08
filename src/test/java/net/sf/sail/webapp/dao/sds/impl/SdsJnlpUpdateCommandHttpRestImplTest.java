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

import net.sf.sail.webapp.domain.sds.SdsJnlp;

import org.easymock.EasyMock;

/**
 * @author Laurel Williams
 * 
 * @version $Id$
 * 
 */
public class SdsJnlpUpdateCommandHttpRestImplTest extends
		AbstractSdsUpdateCommandHttpRestImplTest {

	private static final Long EXPECTED_ID = new Long(1);

	private static final String EXPECTED_NAME = "Blah";

	private static final String EXPECTED_URL = "http://tels-develop.soe.berkeley.edu:8080/maven-jnlp/basic-emf.jnlp";

	private static final String JNLP_DIRECTORY = "jnlp/";

	private SdsJnlpUpdateCommandHttpRestImpl command;

	private SdsJnlp expectedSdsJnlp;

	/**
	 * @see junit.framework.TestCase#setUp()
	 */
	@Override
	protected void setUp() throws Exception {
		super.setUp();
		this.expectedSdsJnlp = new SdsJnlp();
		this.expectedSdsJnlp.setName(EXPECTED_NAME);
		this.expectedSdsJnlp.setUrl(EXPECTED_URL);
		this.expectedSdsJnlp.setSdsObjectId(EXPECTED_ID);

		this.updateCommand = new SdsJnlpUpdateCommandHttpRestImpl();
		command = ((SdsJnlpUpdateCommandHttpRestImpl) (this.updateCommand));
		this.command.setTransport(this.mockTransport);
		this.command.setSdsJnlp(this.expectedSdsJnlp);
		this.httpRequest = this.command.generateRequest();
	}

	/**
	 * @see junit.framework.TestCase#tearDown()
	 */
	@Override
	protected void tearDown() throws Exception {
		super.tearDown();
		this.command = null;
		this.expectedSdsJnlp = null;
	}

	public void testExecute() throws Exception {
		assertEquals(this.expectedSdsJnlp, (SdsJnlp) doExecuteTest(JNLP_DIRECTORY));
		EasyMock.verify(this.mockTransport);
	}

}