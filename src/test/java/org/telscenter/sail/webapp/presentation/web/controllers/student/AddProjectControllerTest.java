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
package org.telscenter.sail.webapp.presentation.web.controllers.student;

import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;

import java.util.HashSet;
import java.util.Set;

import javax.servlet.http.HttpSession;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.domain.group.impl.PersistentGroup;
import net.sf.sail.webapp.domain.impl.UserImpl;

import org.springframework.context.ApplicationContext;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.AbstractModelAndViewTests;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.telscenter.sail.webapp.domain.PeriodNotFoundException;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.StudentUserAlreadyAssociatedWithRunException;
import org.telscenter.sail.webapp.domain.impl.AddProjectParameters;
import org.telscenter.sail.webapp.domain.impl.Projectcode;
import org.telscenter.sail.webapp.domain.impl.RunImpl;
import org.telscenter.sail.webapp.service.student.StudentService;

/**
 * @author Hiroki Terashima
 * @version $Id$
 */
public class AddProjectControllerTest extends AbstractModelAndViewTests {
	
	private static final String RUNCODE = "fly8978";
		
	private static final String PERIODNAME = "3";
	
	private static final String LEGAL_PROJECTCODE = RUNCODE + "-" + PERIODNAME;

	private final String RUNCODE_NOT_IN_DB = "abc1234";
	
	private final String PERIODNAME_NOT_IN_DB = "thisperioddoesnotexist";

	private static final String SUCCESS = "SUCCESS VIEW";

	private static final String FORM = "FORM VIEW";

	private AddProjectController addProjectController;
	
	private AddProjectParameters addProjectParameters;
	
	private StudentService mockStudentService;
	
	private ApplicationContext mockApplicationContext;
	
	private MockHttpServletRequest request;

	private MockHttpServletResponse response;
	
	private HttpSession mockSession;
	
	private BindException errors;
	
	private Run run;
	
	private Group group;
	
	private User user;
	
	/**
	 * @throws Exception 
	 * @see junit.framework.TestCase#setUp()
	 */
	@SuppressWarnings("unchecked")
	protected void setUp() throws Exception {
		super.setUp();
		mockApplicationContext = createMock(ApplicationContext.class);
		request = new MockHttpServletRequest();
		response = new MockHttpServletResponse();
		addProjectParameters = new AddProjectParameters();
		addProjectParameters.setProjectcode(LEGAL_PROJECTCODE);
		errors = new BindException(addProjectParameters, "");

		mockSession = new MockHttpSession();
		this.user = new UserImpl();
		mockSession.setAttribute(User.CURRENT_USER_SESSION_KEY, this.user);
		this.request.setSession(mockSession);
		
		run = new RunImpl();
		group = new PersistentGroup();
		group.setName(PERIODNAME);
		Set<Group> periods = new HashSet<Group>();
		periods.add(group);
		run.setPeriods(periods);
		
		this.mockStudentService = createMock(StudentService.class);
		addProjectController = new AddProjectController();
		addProjectController.setApplicationContext(mockApplicationContext);
		addProjectController.setStudentService(mockStudentService);
		addProjectController.setSuccessView(SUCCESS);
		addProjectController.setFormView(FORM);
	}
	
	public void testOnSubmit_success() throws Exception {
		// test submission of form with correct projectcode info.
		// should get ModelAndView back containing success view
		mockStudentService.addStudentToRun(user, new Projectcode(LEGAL_PROJECTCODE));
		expectLastCall();
		replay(mockStudentService);
		
		ModelAndView modelAndView = addProjectController.onSubmit(request, response, addProjectParameters, errors);
		assertEquals(SUCCESS, modelAndView.getViewName());
		assertTrue(!errors.hasErrors());
		verify(mockStudentService);
	}

	public void testOnSubmit_failure_bad_runcode() throws Exception {
		// test submission of form with projectcode that has a runcode
		// that does not exist in datastore.
		// should get ModelAndView back containing form view
		addProjectParameters.setProjectcode(RUNCODE_NOT_IN_DB + "-" + PERIODNAME);
		mockStudentService.addStudentToRun(user, new Projectcode(RUNCODE_NOT_IN_DB, PERIODNAME));
		expectLastCall().andThrow(new ObjectNotFoundException(RUNCODE_NOT_IN_DB, Run.class));
		replay(mockStudentService);

		ModelAndView modelAndView = addProjectController.onSubmit(request, response, addProjectParameters, errors);
		assertEquals(FORM, modelAndView.getViewName());
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getFieldErrorCount());

		assertNotNull(errors.getFieldError("projectcode"));
		verify(mockStudentService);
	}
	
	public void testOnSubmit_failure_bad_periodname() throws Exception {
		// test submission of form with projectcode that has a periodname
		// that does not exist in datastore.
		// should get ModelAndView back containing form view
		addProjectParameters.setProjectcode(RUNCODE + "-" + PERIODNAME_NOT_IN_DB);
		mockStudentService.addStudentToRun(user, new Projectcode(RUNCODE, PERIODNAME_NOT_IN_DB));
		expectLastCall().andThrow(new PeriodNotFoundException(PERIODNAME_NOT_IN_DB + " was not found"));
		replay(mockStudentService);

		ModelAndView modelAndView = addProjectController.onSubmit(request, response, addProjectParameters, errors);
		assertEquals(FORM, modelAndView.getViewName());
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getFieldErrorCount());
		assertNotNull(errors.getFieldError("projectcode"));
		verify(mockStudentService);		
	}
	
	public void testOnSubmit_failure_student_already_associated_with_run() throws Exception {
		// test submission of form with correct projectcode info
		// but the student is already associated with the run.
		// should get ModelAndView back containing success view
		mockStudentService.addStudentToRun(user, new Projectcode(LEGAL_PROJECTCODE));
		expectLastCall().andThrow(new StudentUserAlreadyAssociatedWithRunException(
				"student user is already associated with this run."));
		replay(mockStudentService);
		
		ModelAndView modelAndView = addProjectController.onSubmit(request, response, addProjectParameters, errors);
		assertEquals(FORM, modelAndView.getViewName());
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getFieldErrorCount());
		assertNotNull(errors.getFieldError("projectcode"));
		verify(mockStudentService);		
	}

}
