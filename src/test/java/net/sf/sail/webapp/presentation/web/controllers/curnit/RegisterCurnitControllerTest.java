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
package net.sf.sail.webapp.presentation.web.controllers.curnit;

import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.Curnit;
import net.sf.sail.webapp.domain.impl.CurnitImpl;
import net.sf.sail.webapp.domain.impl.CurnitParameters;
import net.sf.sail.webapp.service.curnit.CurnitService;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.springframework.context.ApplicationContext;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.AbstractModelAndViewTests;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;

import static org.easymock.EasyMock.*;

/**
 * @author Hiroki Terashima
 * @version $Id$
 */
public class RegisterCurnitControllerTest extends AbstractModelAndViewTests {
	
	private static final String CURNIT_NAME = "Default curnit name";
	
	private static final String CURNIT_URL = "http://validcurniturl.jar";
	
	private static final String SUCCESS = "WooHoo";

	private static final String FORM = "Form view";

	ApplicationContext mockApplicationContext;

	MockHttpServletRequest request;

	HttpServletResponse response;
	
	BindException errors;
	
	CurnitParameters curnitParameters;
	
	CurnitService mockCurnitService;
	
	@Before
	protected void setUp() throws Exception {
		super.setUp();
		request = new MockHttpServletRequest();
		response = new MockHttpServletResponse();
		curnitParameters = new CurnitParameters();
		curnitParameters.setName(CURNIT_NAME);
		curnitParameters.setUrl(CURNIT_URL);
		errors = new BindException(curnitParameters, "");
		mockCurnitService = createMock(CurnitService.class);
		mockApplicationContext = createMock(ApplicationContext.class);
	}
	
	@Test
	public void testOnSubmit_success() {
		// test submission of form with correct curnitParameter info.
		// should get ModelAndView back containing view which is instance of
		// RedirectView, with name of success view as URL.
		
		Curnit curnit = new CurnitImpl();
		expect(mockCurnitService.createCurnit(curnitParameters))
		    .andReturn(curnit);
		replay(mockCurnitService);
		
		RegisterCurnitController registerCurnitController = 
			new RegisterCurnitController();
		registerCurnitController.setApplicationContext(mockApplicationContext);
		registerCurnitController.setCurnitService(mockCurnitService);
		registerCurnitController.setSuccessView(SUCCESS);
		registerCurnitController.setFormView(FORM);
		ModelAndView modelAndView = registerCurnitController.onSubmit(
				request, response, curnitParameters, errors);
		
		verify(mockCurnitService);
	}
	
	@After
	protected void tearDown() throws Exception {
		super.tearDown();
		request = null;
		response = null;
		curnitParameters = null;
		errors = null;
		mockCurnitService = null;
	}
	
}
