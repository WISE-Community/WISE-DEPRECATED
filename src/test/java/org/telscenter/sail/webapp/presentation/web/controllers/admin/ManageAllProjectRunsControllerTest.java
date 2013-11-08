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
package org.telscenter.sail.webapp.presentation.web.controllers.admin;

import static org.easymock.EasyMock.*;

import java.util.ArrayList;
import java.util.List;

import org.easymock.EasyMock;
import org.junit.After;
import org.junit.Before;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.AbstractModelAndViewTests;
import org.springframework.web.servlet.ModelAndView;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.impl.RunImpl;
import org.telscenter.sail.webapp.service.offering.RunService;

/**
 * @author Hiroki Terashima
 * @version $Id$
 */
public class ManageAllProjectRunsControllerTest extends
		AbstractModelAndViewTests {

	private MockHttpServletRequest request;

	private MockHttpServletResponse response;
	
	private ManageAllProjectRunsController controller;
	
	private RunService runService;
	
	private ArrayList<Run> runList;
	
	private Run run;
	
	@Before
	public void setUp() {
		this.request = new MockHttpServletRequest();
		this.response = new MockHttpServletResponse();
		this.runService = createMock(RunService.class);
		this.controller = new ManageAllProjectRunsController();
		this.controller.setRunService(this.runService);
		this.runList = new ArrayList<Run>();
		this.run = new RunImpl();
	}
	
	@After
	public void tearDown() {
		this.request = new MockHttpServletRequest();
		this.response = new MockHttpServletResponse();
		this.runService = createMock(RunService.class);
		this.controller = new ManageAllProjectRunsController();
		this.runList = null;
		this.run = null;
	}
	
	public void testHandleRequestInternal_no_runs() {
		expect(runService.getAllRunList()).andReturn(runList);
		replay(runService);
		ModelAndView modelAndView = null; 
		try {
			modelAndView = controller.handleRequestInternal(request, response);
		} catch (Exception e) {
			fail("unexpected exception");
		}
		
		assertModelAttributeValue(modelAndView, 
				ManageAllProjectRunsController.RUNLIST_PARAM_NAME, runList);
		EasyMock.verify(runService);
	}
	
	@SuppressWarnings("unchecked")
	public void testHandleRequestInternal_runs() {
		runList.add(run);
		expect(runService.getAllRunList()).andReturn(runList);
		replay(runService);
		ModelAndView modelAndView = null; 
		try {
			modelAndView = controller.handleRequestInternal(request, response);
		} catch (Exception e) {
			fail("unexpected exception");
		}
		
		assertModelAttributeValue(modelAndView, 
				ManageAllProjectRunsController.RUNLIST_PARAM_NAME, runList);
		List<Run> returnedRunList = (List<Run>) modelAndView.getModel()
				.get(ManageAllProjectRunsController.RUNLIST_PARAM_NAME);
		assertEquals(returnedRunList.size(), 1);
		assertEquals(returnedRunList.get(0), run);
		EasyMock.verify(runService);
	}
}
