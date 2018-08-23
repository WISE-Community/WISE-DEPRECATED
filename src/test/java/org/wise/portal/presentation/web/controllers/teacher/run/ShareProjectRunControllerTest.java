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
package org.wise.portal.presentation.web.controllers.teacher.run;

import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;

import java.util.HashSet;
import java.util.Set;

import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.AbstractModelAndViewTests;
import org.springframework.ui.Model;
import org.springframework.validation.BindException;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.support.SessionStatus;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.impl.AddSharedTeacherParameters;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.user.UserService;

/**
 * @author Hiroki Terashima
 * @version $Id$
 */
public class ShareProjectRunControllerTest extends AbstractModelAndViewTests {

	private static final String SUCCESS_VIEW = "WooHoo";

	private static final String FORM_VIEW = "Form";

	private static final String USERNAME = "sumoman";

	private ShareProjectRunController shareProjectRunController;

	private MockHttpServletRequest request;

	private MockHttpServletResponse response;

	private RunService mockRunService;

	private UserService mockUserService;

	private static final Long RUNID = new Long(4);

	private BindingResult errors;

	private SessionStatus status;

	private Model model;

	private Run run;

	private User user;

	private AddSharedTeacherParameters addSharedTeacherParameters;

	/**
	 * @see junit.framework.TestCase#setUp()
	 */
	protected void setUp() throws Exception {
		super.setUp();
		this.request = new MockHttpServletRequest();
		this.response = new MockHttpServletResponse();
		this.request.setParameter(ShareProjectRunController.RUNID_PARAM_NAME, RUNID.toString());

		this.user = new UserImpl();

		this.mockRunService = createMock(RunService.class);
		this.mockUserService = createMock(UserService.class);
		run = new RunImpl();
		Set<User> sharedowners = new HashSet<User>();
		sharedowners.add(user);
		run.setOwners(sharedowners);

		addSharedTeacherParameters = new AddSharedTeacherParameters();
		addSharedTeacherParameters.setPermission(UserDetailsService.RUN_READ_ROLE);
		addSharedTeacherParameters.setRun(run);
		addSharedTeacherParameters.setSharedOwnerUsername(USERNAME);

		errors = new BindException(addSharedTeacherParameters, "");

		shareProjectRunController = new ShareProjectRunController();
	}

	/**
	 * @see junit.framework.TestCase#tearDown()
	 */
	protected void tearDown() throws Exception {
		super.tearDown();
		this.request = null;
		this.response = null;
		this.mockRunService = null;
		this.shareProjectRunController = null;
	}

	public void testOnSubmit_success() throws ObjectNotFoundException {
		expect(mockUserService.retrieveUserByUsername(USERNAME)).andReturn(user);
		replay(mockUserService);
		mockRunService.addSharedTeacher(addSharedTeacherParameters);
		expectLastCall();
		replay(mockRunService);

		String view = this.shareProjectRunController.onSubmit(addSharedTeacherParameters, errors, request, model, status);
		verify(mockUserService);
		verify(mockRunService);
	}

	public void testOnSubmit_failure() throws ObjectNotFoundException {
		expect(mockUserService.retrieveUserByUsername(USERNAME)).andReturn(user);
		replay(mockUserService);
		mockRunService.addSharedTeacher(addSharedTeacherParameters);
		expectLastCall().andThrow(new ObjectNotFoundException("run not found", Run.class));
		replay(mockRunService);
		String view = this.shareProjectRunController.onSubmit(addSharedTeacherParameters, errors, request, model, status);
		verify(mockUserService);
		verify(mockRunService);
	}
}
