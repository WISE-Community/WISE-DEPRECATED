/**
 * Copyright (c) 2007 Regents of the University of California (Regents). Created
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

import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpSession;

import net.sf.sail.webapp.domain.Offering;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.impl.UserImpl;
import net.sf.sail.webapp.domain.sds.SdsCurnit;
import net.sf.sail.webapp.domain.sds.SdsJnlp;
import net.sf.sail.webapp.domain.sds.SdsOffering;
import net.sf.sail.webapp.domain.webservice.http.HttpRestTransport;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;
import net.sf.sail.webapp.service.workgroup.WorkgroupService;

import org.easymock.EasyMock;
import org.junit.After;
import org.junit.Before;
import org.junit.Ignore;
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
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.presentation.web.controllers.teacher.management.ViewMyStudentsController;
import org.telscenter.sail.webapp.service.offering.RunService;


/**
 * @author patricklawler
 * @version $Id:$
 */
@RunWith(TestClassRunner.class)
public class ViewMyStudentsControllerTest extends AbstractModelAndViewTests {

	private ViewMyStudentsController viewMyStudentsController;

	private HttpRestTransport mockHttpTransport;

	private MockHttpServletRequest request;

	private MockHttpServletResponse response;

	private RunService mockRunService;

	private WorkgroupService mockWorkgroupService;

	private List<Run> expectedRunList;

	private User user;
	
	private String default_runId = "5";
	
	private Run run;
	
	private Project mockProject;

	/**
	 * @see junit.framework.TestCase#setUp()
	 */
	@Before
	public void setUp() throws Exception {
		super.setUp();
		this.request = new MockHttpServletRequest();
		this.response = new MockHttpServletResponse();
		HttpSession mockSession = new MockHttpSession();
		this.user = new UserImpl();
		
		mockSession.setAttribute(User.CURRENT_USER_SESSION_KEY, this.user);
		this.request.setSession(mockSession);
		this.request.addParameter("runId", default_runId);

		this.mockRunService = EasyMock.createMock(RunService.class);
		this.mockWorkgroupService = EasyMock.createMock(WorkgroupService.class);
		SdsOffering sdsOffering = new SdsOffering();

		SdsCurnit curnit = new SdsCurnit();
		curnit.setSdsObjectId(new Long(1));
		sdsOffering.setSdsCurnit(curnit);

		SdsJnlp jnlp = new SdsJnlp();
		jnlp.setSdsObjectId(new Long(2));
		sdsOffering.setSdsJnlp(jnlp);

		sdsOffering.setName("test");
		sdsOffering.setSdsObjectId(new Long(3));
		run = new RunImpl();
		run.setSdsOffering(sdsOffering);
		Set<User> owners = new HashSet<User>();
		owners.add(user);
		run.setOwners(owners);
		this.mockProject = EasyMock.createMock(Project.class);
		run.setProject(mockProject);
		

		this.expectedRunList = new LinkedList<Run>();
		this.expectedRunList.add(run);

		this.mockHttpTransport = EasyMock.createMock(HttpRestTransport.class);
		this.viewMyStudentsController = new ViewMyStudentsController();
		this.viewMyStudentsController
		.setRunService(this.mockRunService);
		this.viewMyStudentsController
		.setWorkgroupService(this.mockWorkgroupService);
		this.viewMyStudentsController
		.setHttpRestTransport(this.mockHttpTransport);
	}

	/**
	 * @see junit.framework.TestCase#tearDown()
	 */
	@After
	public void tearDown() throws Exception {
		super.tearDown();
		this.request = null;
		this.response = null;
		this.mockRunService = null;
	}

	@Test
	@Ignore
	public void testHandleRequestInternal_WithOffering() throws Exception {
		EasyMock.expect(mockRunService.getRunList()).andReturn(
				this.expectedRunList);
				
		List<Workgroup> emptyWorkgroupList = Collections.emptyList();
		Offering offering = this.expectedRunList.get(0);
		Map<Offering, List<Workgroup>> expectedWorkgroupMap = new HashMap<Offering, List<Workgroup>>(
				1);
		expectedWorkgroupMap.put(offering, emptyWorkgroupList);
		
		EasyMock.expect(mockRunService.retrieveById(Long.valueOf(default_runId))).andReturn(run);

		EasyMock.expect(
				this.mockWorkgroupService.getWorkgroupListByOfferingAndUser(
						offering, this.user)).andReturn(emptyWorkgroupList);

		EasyMock.replay(this.mockRunService);
		EasyMock.replay(this.mockWorkgroupService);

		ModelAndView modelAndView = viewMyStudentsController.handleRequestInternal(request, response);
		assertModelAttributeValue(modelAndView,	ViewMyStudentsController.CURRENT_RUN_LIST_KEY, this.expectedRunList);
		assertModelAttributeValue(modelAndView, ViewMyStudentsController.WORKGROUP_MAP_KEY, expectedWorkgroupMap);
		assertModelAttributeValue(modelAndView,	ControllerUtil.USER_KEY, this.user);
		assertModelAttributeValue(modelAndView,	ViewMyStudentsController.HTTP_TRANSPORT_KEY, this.mockHttpTransport);
		EasyMock.verify(this.mockRunService);
		EasyMock.verify(this.mockWorkgroupService);
	}

	@Test
	public void testHandleRequestInternal_NoOfferings() throws Exception {
		List<Run> emptyRunList = Collections.emptyList();
		Map<Offering, List<Workgroup>> emptyWorkgroupMap = Collections
		.emptyMap();
		EasyMock.expect(mockRunService.getRunList()).andReturn(
				emptyRunList);
		EasyMock.expect(mockRunService.retrieveById(Long.valueOf(default_runId))).andReturn(run);
		EasyMock.expect(mockRunService.getWorkgroups(Long.valueOf(default_runId))).andReturn(null);
		EasyMock.expect(mockProject.getId()).andReturn((long) 1);
		
		EasyMock.replay(this.mockRunService);
		EasyMock.replay(this.mockWorkgroupService);
		EasyMock.replay(this.mockProject);

		ModelAndView modelAndView = viewMyStudentsController
		.handleRequestInternal(request, response);
		assertModelAttributeValue(modelAndView, ViewMyStudentsController.CURRENT_RUN_LIST_KEY, emptyRunList);
		assertModelAttributeValue(modelAndView, ViewMyStudentsController.WORKGROUP_MAP_KEY, emptyWorkgroupMap);
		assertModelAttributeValue(modelAndView, ControllerUtil.USER_KEY, this.user);
		assertModelAttributeValue(modelAndView, ViewMyStudentsController.RUN_KEY, run);
		assertModelAttributeValue(modelAndView, ViewMyStudentsController.HTTP_TRANSPORT_KEY, this.mockHttpTransport);
		EasyMock.verify(this.mockRunService);
		EasyMock.verify(this.mockWorkgroupService);
		EasyMock.verify(this.mockProject);
	}
}
