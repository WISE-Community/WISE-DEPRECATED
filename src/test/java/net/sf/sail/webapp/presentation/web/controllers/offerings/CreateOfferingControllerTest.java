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
package net.sf.sail.webapp.presentation.web.controllers.offerings;

import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;

import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.Offering;
import net.sf.sail.webapp.domain.impl.OfferingImpl;
import net.sf.sail.webapp.domain.impl.OfferingParameters;
import net.sf.sail.webapp.service.offering.OfferingService;

import org.springframework.context.ApplicationContext;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.AbstractModelAndViewTests;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;

/**
 * @author Hiroki Terashima
 * @version $Id$
 */
public class CreateOfferingControllerTest extends AbstractModelAndViewTests {

	private static final String OFFERING_NAME = "Default offering name!";
	
	private static final Long CURNIT_ID = new Long(5);
	
	private static final String SUCCESS = "WooHoo";

	private static final String FORM = "Form view";

	ApplicationContext mockApplicationContext;

	MockHttpServletRequest request;

	HttpServletResponse response;
	
	BindException errors;
	
	OfferingParameters offeringParameters;
	
	OfferingService mockOfferingService;
	
	@Override
	protected void setUp() throws Exception {
		super.setUp();
		request = new MockHttpServletRequest();
		response = new MockHttpServletResponse();
		offeringParameters = new OfferingParameters();
		offeringParameters.setCurnitId(CURNIT_ID);
		offeringParameters.setName(OFFERING_NAME);
		errors = new BindException(offeringParameters, "");
		mockOfferingService = createMock(OfferingService.class);
		mockApplicationContext = createMock(ApplicationContext.class);
	}
	
	public void testOnSubmit() throws Exception {
		// test submission of form with correct offeringParameter info.
		// should get ModelAndView back containing view which is instance of
		// RedirectView, with name of success view as URL.
		
		Offering offering = new OfferingImpl();
		expect(mockOfferingService.createOffering(offeringParameters))
		     .andReturn(offering);
		replay(mockOfferingService);
		
		CreateOfferingController createOfferingController = new CreateOfferingController();
		createOfferingController.setApplicationContext(mockApplicationContext);
		createOfferingController.setOfferingService(mockOfferingService);
		createOfferingController.setSuccessView(SUCCESS);
		ModelAndView modelAndView = createOfferingController.onSubmit(request, 
				response, offeringParameters, errors);
		
		assertTrue(modelAndView.getView() instanceof RedirectView);
		assertEquals(SUCCESS, ((RedirectView) modelAndView.getView()).getUrl());
		verify(mockOfferingService);
	}
	
	public void testOnSubmitObjectNotFoundException() throws Exception {
		// test submission of form with offeringParameter.curnitId
		// that does not exist in the data store.  Should get ModelAndView
		// back with original form returned with name of Form View as set.
		expect(mockOfferingService.createOffering(this.offeringParameters))
		    .andThrow(new ObjectNotFoundException(offeringParameters.getCurnitId(), Offering.class));
		replay(mockOfferingService);
		
		CreateOfferingController createOfferingController = new CreateOfferingController();
		createOfferingController.setApplicationContext(mockApplicationContext);
		createOfferingController.setOfferingService(mockOfferingService);
		createOfferingController.setFormView(FORM);

		ModelAndView modelAndView = createOfferingController.onSubmit(request, 
				response, offeringParameters, errors);
		
		assertViewName(modelAndView, FORM);
		assertEquals(1, errors.getErrorCount());
		assertEquals(1, errors.getFieldErrorCount("curnitId"));
		verify(mockOfferingService);
	}
	
	// TODO LAW test RuntimeException that gets thrown (JNLPNotFoundException)
	
	@Override
	protected void tearDown() throws Exception {
		super.tearDown();
		request = null;
		response = null;
		offeringParameters = null;
		errors = null;
		mockOfferingService = null;
	}
}
