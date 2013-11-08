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
package net.sf.sail.webapp.presentation.web.controllers.groups;

import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;

import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.domain.group.impl.GroupParameters;
import net.sf.sail.webapp.domain.group.impl.PersistentGroup;
import net.sf.sail.webapp.service.group.GroupService;

import org.springframework.context.ApplicationContext;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.AbstractModelAndViewTests;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;

/**
 * @author Laurel Williams
 * @author Cynick Young
 * 
 * @version $Id$
 */
public class AddgroupControllerTest extends AbstractModelAndViewTests {

	private static final String NAME = "GroupName";

	private static final String SUCCESS = "WooHoo";

	ApplicationContext mockApplicationContext;

	MockHttpServletRequest request;

	HttpServletResponse response;

	GroupParameters groupParameters;

	BindException errors;

	GroupService mockGroupService;

	@Override
	protected void setUp() throws Exception {
		super.setUp();
		request = new MockHttpServletRequest();
		response = new MockHttpServletResponse();
		groupParameters = new GroupParameters();
		groupParameters.setName(NAME);
		errors = new BindException(groupParameters, "");
		mockGroupService = createMock(GroupService.class);
		mockApplicationContext = createMock(ApplicationContext.class);
	}

	public void testOnSubmitGroupNameOnly() throws Exception {
		// test submission of form with group name only.
		// should get ModelAndView back containing view which is instance of
		// RedirectView, with name of success view as URL.
		Group group = new PersistentGroup();
		group.setName(NAME);
		
		expect(mockGroupService.createGroup(groupParameters)).andReturn(group);
		replay(mockGroupService);

		groupParameters.setName(NAME);
		request.addParameter("name", NAME);
		AddgroupController addgroupController = new AddgroupController();
		addgroupController.setGroupService(mockGroupService);
		addgroupController.setSuccessView(SUCCESS);
		ModelAndView modelAndView = addgroupController.onSubmit(request,
				response, groupParameters, errors);

		assertTrue(modelAndView.getView() instanceof RedirectView);
		assertEquals(SUCCESS, ((RedirectView) modelAndView.getView()).getUrl());
		verify(mockGroupService);
	}
	
	public void testOnSubmitGroupWithParent() throws Exception {
		// test submission of form with group name and a parent.
		// should get ModelAndView back containing view which is instance of
		// RedirectView, with name of success view as URL.
		Group group = new PersistentGroup();
		Group parentGroup = new PersistentGroup();
		group.setName(NAME);
		parentGroup.setName(NAME);
		group.setParent(parentGroup);
		
		expect(mockGroupService.createGroup(groupParameters)).andReturn(group);
		replay(mockGroupService);

		groupParameters.setName(NAME);
		groupParameters.setParentId(new Long(3));
		request.addParameter("name", NAME);
		request.addParameter("parentid", "3");
		AddgroupController addgroupController = new AddgroupController();
		addgroupController.setGroupService(mockGroupService);
		addgroupController.setSuccessView(SUCCESS);
		ModelAndView modelAndView = addgroupController.onSubmit(request,
				response, groupParameters, errors);

		assertTrue(modelAndView.getView() instanceof RedirectView);
		assertEquals(SUCCESS, ((RedirectView) modelAndView.getView()).getUrl());
		verify(mockGroupService);
	}

	public void testOnSubmitGroupRuntimeException() throws Exception {
		// test submission of form where RuntimeException is thrown.
		// should catch a RuntimeException
		
		expect(mockGroupService.createGroup(groupParameters)).andThrow(
				new RuntimeException());
		replay(mockGroupService);
		
		AddgroupController addgroupController = new AddgroupController();
		addgroupController.setGroupService(mockGroupService);
		try {
			addgroupController.onSubmit(request, response, groupParameters, errors);
			fail("Expected RuntimeException but it never happened.");
		} catch (RuntimeException expected) {
		}
		verify(mockGroupService);
	}

	@Override
	protected void tearDown() throws Exception {
		super.tearDown();
		request = null;
		response = null;
		groupParameters = null;
		errors = null;
		mockGroupService = null;
	}
}