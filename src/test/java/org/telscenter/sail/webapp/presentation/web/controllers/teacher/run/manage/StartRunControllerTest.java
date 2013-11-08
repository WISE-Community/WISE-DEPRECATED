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
package org.telscenter.sail.webapp.presentation.web.controllers.teacher.run.manage;

import static org.easymock.EasyMock.createMock;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

import javax.servlet.http.HttpSession;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.authentication.impl.PersistentUserDetails;
import net.sf.sail.webapp.domain.impl.UserImpl;

import org.easymock.EasyMock;
import org.springframework.context.ApplicationContext;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.AbstractModelAndViewTests;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.impl.RunImpl;
import org.telscenter.sail.webapp.domain.impl.StartRunParameters;
import org.telscenter.sail.webapp.service.offering.RunService;

import com.ibm.icu.util.Calendar;

/**
 * @author Hiroki Terashima
 * @version $Id$
 */
public class StartRunControllerTest extends AbstractModelAndViewTests {
	
	private StartRunController startRunController;
	
	private StartRunParameters startRunParameters;

	private RunService mockRunService;
	
	private ApplicationContext mockApplicationContext;
	
	private MockHttpServletRequest request;

	private MockHttpServletResponse response;
	
	private HttpSession mockSession;
	
	private BindException errors;
	
	private Run run;
	
	private User user;

	private static final Long LEGAL_RUNID = new Long(5);

	private static final Long INVALID_RUNID = new Long(999999);

	private static final Date DEFAULT_STARTTIME = Calendar.getInstance().getTime();

	private static final String SUCCESS = "successview";

	private static final String FORM = "formview";

	/**
	 * @throws Exception 
	 * @see junit.framework.TestCase#setUp()
	 */
	@Override
	protected void setUp() throws Exception {
		super.setUp();
		mockApplicationContext = createMock(ApplicationContext.class);
		request = new MockHttpServletRequest();
		response = new MockHttpServletResponse();
		startRunParameters = new StartRunParameters();
		startRunParameters.setRunId(LEGAL_RUNID);
		errors = new BindException(startRunParameters, "");

		mockSession = EasyMock.createMock(HttpSession.class);
		user = new UserImpl();
		user.setUserDetails(new PersistentUserDetails());
		request.setSession(mockSession);

		run = new RunImpl();
		run.setStarttime(DEFAULT_STARTTIME);
		Set<User> owners = new HashSet<User>();
		owners.add(user);
		run.setOwners(owners);

		mockRunService = EasyMock.createMock(RunService.class);
		startRunController = new StartRunController();
		startRunController.setApplicationContext(mockApplicationContext);
		startRunController.setRunService(mockRunService);
		startRunController.setSuccessView(SUCCESS);
		startRunController.setFormView(FORM);
	}
	
	@Override
	protected void tearDown() throws Exception {
		super.tearDown();
		mockApplicationContext = null;
		request = null;
		response = null;
		mockSession = null;
		mockRunService = null;
		startRunController = null;
		startRunParameters = null;
		errors = null;
		run = null;
	}
	
	public void testOnSubmit_success() throws Exception {
		// test submission of form with correct runId.
		// should get ModelAndView back containing success view.
		EasyMock.expect(mockSession.getAttribute(User.CURRENT_USER_SESSION_KEY))
		     .andReturn(user);
		EasyMock.replay(mockSession);
		EasyMock.expect(mockRunService.retrieveById(LEGAL_RUNID)).andReturn(run);
		mockRunService.startRun(run);
		EasyMock.expectLastCall();
		EasyMock.replay(mockRunService);
		
		ModelAndView modelAndView = startRunController
		     .onSubmit(request, response, startRunParameters, errors);

		assertEquals(SUCCESS, modelAndView.getViewName());
		assertFalse(errors.hasErrors());
		EasyMock.verify(mockSession);
		EasyMock.verify(mockRunService);
	}

	public void testOnSubmit_NotOwner() throws Exception {
		// tests when the logged-in user is not a owner of the run
		// that is being closed.  Should get ModelAndView back
		// containing form view. Ideally, an email will be sent to
		// WISE admin about this
		EasyMock.expect(mockSession.getAttribute(User.CURRENT_USER_SESSION_KEY))
	         .andReturn(new UserImpl());
		EasyMock.replay(mockSession);
		EasyMock.expect(mockRunService.retrieveById(LEGAL_RUNID)).andReturn(run);
		EasyMock.replay(mockRunService);

		ModelAndView modelAndView = startRunController
		     .onSubmit(request, response, startRunParameters, errors);

		assertEquals(FORM, modelAndView.getViewName());
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getFieldErrorCount());
		assertNotNull(errors.getFieldError("runId"));
		EasyMock.verify(mockSession);
		EasyMock.verify(mockRunService);
	}
	
	public void testOnSubmit_RunNotFound() throws Exception {
		// tests when the runId does not belong to any existing run.
		// this could happen when the run was removed during the
		// transaction.
		EasyMock.expect(mockSession.getAttribute(User.CURRENT_USER_SESSION_KEY))
		     .andReturn(user);
		EasyMock.replay(mockSession);
		EasyMock.expect(mockRunService.retrieveById(INVALID_RUNID)).andThrow(new ObjectNotFoundException(INVALID_RUNID, Run.class));
		EasyMock.replay(mockRunService);

		startRunParameters.setRunId(INVALID_RUNID);
		ModelAndView modelAndView = startRunController
		     .onSubmit(request, response, startRunParameters, errors);

		assertEquals(FORM, modelAndView.getViewName());
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getFieldErrorCount());
		assertNotNull(errors.getFieldError("runId"));
		EasyMock.verify(mockSession);
		EasyMock.verify(mockRunService);
	}	
}
