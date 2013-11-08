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

import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;

import java.util.ArrayList;

import org.easymock.EasyMock;
import org.junit.After;
import org.junit.Before;
import org.springframework.context.ApplicationContext;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.AbstractModelAndViewTests;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.impl.FindProjectParameters;
import org.telscenter.sail.webapp.service.offering.RunService;

/**
 * @author patrick lawler
 *
 */
public class FindProjectRunsControllerTest extends AbstractModelAndViewTests  {

	private final static String VIEW = "admin/manageallprojectruns";
	
	private MockHttpServletRequest request;

	private MockHttpServletResponse response;
	
	private ApplicationContext mockApplicationContext;
	
	private FindProjectRunsController controller;
	
	private BindException errors;
	
	private RunService runService;
	
	private ArrayList<Run> runList;
	
	private FindProjectParameters findProjectParameters;
	
	@Before
	public void setUp() {
		this.request = new MockHttpServletRequest();
		this.response = new MockHttpServletResponse();
		this.mockApplicationContext = createMock(ApplicationContext.class);
		this.runService = createMock(RunService.class);
		this.controller = new FindProjectRunsController();
		this.runList = new ArrayList<Run>();
		this.findProjectParameters = new FindProjectParameters();
		this.errors = new BindException(findProjectParameters, "");

		this.controller.setRunService(this.runService);
		this.controller.setApplicationContext(this.mockApplicationContext);
		this.controller.setSuccessView(VIEW);
	}
	
	@After
	public void tearDown() {
		this.request = null;
		this.response = null;
		this.mockApplicationContext = null;
		this.runService = null;
		this.controller = null;
		this.runList = null;
		this.errors = null;
		this.findProjectParameters = null;
	}
	
	public void testOnSubmitNoRuns() {
		findProjectParameters.setProjectId("1");
		expect(runService.getAllRunList()).andReturn(runList);
		replay(runService);
		ModelAndView modelAndView = null; 
		try {
			modelAndView = controller.onSubmit(request, response, findProjectParameters, errors);
		} catch (Exception e) {
			fail("unexpected exception");
		}
		
		assertModelAttributeValue(modelAndView, "runList", runList);
		assertEquals(VIEW, modelAndView.getViewName());
		EasyMock.verify(runService);
	}

}
