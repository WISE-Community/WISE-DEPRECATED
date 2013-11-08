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
package org.telscenter.sail.webapp.presentation.web.controllers.teacher.management;

import java.util.Set;
import java.util.TreeSet;

import javax.servlet.http.HttpSession;

import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.domain.group.impl.PersistentGroup;

import org.easymock.EasyMock;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.internal.runners.TestClassRunner;
import org.junit.runner.RunWith;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.AbstractModelAndViewTests;
import org.springframework.web.servlet.ModelAndView;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.impl.RunImpl;
import org.telscenter.sail.webapp.service.offering.RunService;

import static org.easymock.EasyMock.*;

/**
 * @author Hiroki Terashima
 * @version $Id$
 */
@RunWith(TestClassRunner.class)
public class StudentListControllerTest extends AbstractModelAndViewTests {

	private MockHttpServletRequest request;

	private MockHttpServletResponse response;

	private RunService mockRunService;
	
	private StudentListController studentListController;
	
	private String requestedRunId = "4";
	
	private Run requestedRun;
	
	private Set<Group> periodsInRun;

	/**
	 * @see junit.framework.TestCase#setUp()
	 */
	@Before
	public void setUp() {
		request = new MockHttpServletRequest();
		response = new MockHttpServletResponse();
		HttpSession mockSession = new MockHttpSession();
		request.setSession(mockSession);
		
		mockRunService = EasyMock.createMock(RunService.class);
		
		studentListController = new StudentListController();
		studentListController.setRunService(mockRunService);
	}
	
	/**
	 * @see junit.framework.TestCase#tearDown()
	 */
	@After
	public void tearDown() {
		mockRunService = null;
		request = null;
		response = null;
		studentListController = null;
	}
	
	@Test
	public void testNoPeriodFilter_RunWithNoPeriods() throws Exception {
		// request does not have any filter
		// the run has not periods
		requestedRun = new RunImpl();
		periodsInRun = new TreeSet<Group>();
		requestedRun.setPeriods(periodsInRun);
		request.setParameter(StudentListController.RUNID_PARAM_KEY, requestedRunId);
		
		expect(mockRunService.retrieveById(Long.parseLong(requestedRunId))).andReturn(requestedRun);
		replay(mockRunService);
		
		ModelAndView modelAndView = studentListController.handleRequestInternal(request, response);
		assertModelAttributeValue(modelAndView, StudentListController.RUN, requestedRun);
		assertModelAttributeValue(modelAndView, StudentListController.PERIODS, periodsInRun);
		
		verify(mockRunService);
	}

	@SuppressWarnings("unchecked")
	@Test
	public void testNoPeriodFilter_RunWithPeriods() throws Exception {
		// request does not have any filter
		// the run has not periods
		requestedRun = new RunImpl();
		periodsInRun = new TreeSet<Group>();
		periodsInRun.add(new PersistentGroup());
		requestedRun.setPeriods(periodsInRun);
		request.setParameter(StudentListController.RUNID_PARAM_KEY, requestedRunId);
		
		expect(mockRunService.retrieveById(Long.parseLong(requestedRunId))).andReturn(requestedRun);
		replay(mockRunService);
		
		ModelAndView modelAndView = studentListController.handleRequestInternal(request, response);
		assertModelAttributeValue(modelAndView, StudentListController.RUN, requestedRun);
		assertModelAttributeAvailable(modelAndView, StudentListController.PERIODS);
		Set<Group> periods = (Set<Group>) modelAndView.getModel().get(StudentListController.PERIODS);
		assertEquals(1, periods.size());
		
		verify(mockRunService);
	}

		
	
}
