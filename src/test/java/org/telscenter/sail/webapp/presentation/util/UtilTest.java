/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU Lesser General Public License, v2.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.telscenter.sail.webapp.presentation.util;

import static org.junit.Assert.*;

import org.junit.Before;
import org.junit.Test;
import org.junit.internal.runners.TestClassRunner;
import org.junit.runner.RunWith;
import org.springframework.mock.web.MockHttpServletRequest;


/**
 * @author hirokiterashima
 * @version $Id$
 */
@RunWith(TestClassRunner.class)
public class UtilTest {
	
	private static final String SCHEME = "http";
	
	private static final String SERVERNAME = "123.456.789.012";

	private static final int SERVERPORT = 8080;
	
	private static final String CONTEXTPATH = "/webapp";
	
	MockHttpServletRequest request;

	@Before
	public void runBeforeEveryTest() {
		request = new MockHttpServletRequest();
		request.setScheme(SCHEME);
		request.setServerName(SERVERNAME);
		request.setServerPort(SERVERPORT);
		request.setContextPath(CONTEXTPATH);
	}
	
	@Test
	public void getPortalUrl() {
		String portalUrl = Util.getPortalUrl(request);
		assertEquals(SCHEME + "://" + SERVERNAME + ":" +
				SERVERPORT + CONTEXTPATH, portalUrl);
	}
	
	
}
