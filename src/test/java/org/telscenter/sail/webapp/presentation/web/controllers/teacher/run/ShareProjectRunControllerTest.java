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
package org.telscenter.sail.webapp.presentation.web.controllers.teacher.run;

import static org.easymock.EasyMock.*;

import java.util.HashSet;
import java.util.Set;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.UserImpl;
import net.sf.sail.webapp.domain.sds.SdsCurnit;
import net.sf.sail.webapp.domain.sds.SdsJnlp;
import net.sf.sail.webapp.domain.sds.SdsOffering;
import net.sf.sail.webapp.service.UserService;

import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.AbstractModelAndViewTests;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.impl.AddSharedTeacherParameters;
import org.telscenter.sail.webapp.domain.impl.RunImpl;
import org.telscenter.sail.webapp.service.authentication.UserDetailsService;
import org.telscenter.sail.webapp.service.offering.RunService;

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
	
	private BindException errors;
	
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
		Set<User> sharedowners = new HashSet<User>();
		sharedowners.add(user);
		run.setOwners(sharedowners);

		addSharedTeacherParameters = new AddSharedTeacherParameters();
		addSharedTeacherParameters.setPermission(UserDetailsService.RUN_READ_ROLE);
		addSharedTeacherParameters.setRun(run);
		addSharedTeacherParameters.setSharedOwnerUsername(USERNAME);
		
		errors = new BindException(addSharedTeacherParameters, "");
		
		shareProjectRunController = new ShareProjectRunController();
		shareProjectRunController.setRunService(mockRunService);
		shareProjectRunController.setUserService(mockUserService);
		shareProjectRunController.setFormView(FORM_VIEW);
		shareProjectRunController.setSuccessView(SUCCESS_VIEW);
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
		mockRunService.addSharedTeacherToRun(addSharedTeacherParameters);
		expectLastCall();		
		replay(mockRunService);
		ModelAndView modelAndView = this.shareProjectRunController.onSubmit(
				request, response, addSharedTeacherParameters, errors);
		assertModelAttributeAvailable(modelAndView, ShareProjectRunController.RUNID_PARAM_NAME);
		verify(mockUserService);
		verify(mockRunService);
	}
	
	public void testOnSubmit_failure() throws ObjectNotFoundException {
		expect(mockUserService.retrieveUserByUsername(USERNAME)).andReturn(user);
		replay(mockUserService);
		mockRunService.addSharedTeacherToRun(addSharedTeacherParameters);
		expectLastCall().andThrow(new ObjectNotFoundException("run not found", Run.class));
		replay(mockRunService);
		ModelAndView modelAndView = this.shareProjectRunController.onSubmit(
				request, response, addSharedTeacherParameters, errors);
		assertModelAttributeAvailable(modelAndView, ShareProjectRunController.RUNID_PARAM_NAME);
		verify(mockUserService);
		verify(mockRunService);
	}
}
