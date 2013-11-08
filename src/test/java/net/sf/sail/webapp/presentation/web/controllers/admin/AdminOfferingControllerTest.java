/**
 * Copyright (c) 2007 Encore Research Group, University of Toronto
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
package net.sf.sail.webapp.presentation.web.controllers.admin;


import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.Offering;
import net.sf.sail.webapp.domain.impl.AdminOfferingParameters;
import net.sf.sail.webapp.domain.impl.OfferingImpl;
import net.sf.sail.webapp.domain.sds.SdsCurnit;
import net.sf.sail.webapp.domain.sds.SdsJnlp;
import net.sf.sail.webapp.domain.sds.SdsOffering;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;
import net.sf.sail.webapp.presentation.web.controllers.ModelAndViewTests;
import net.sf.sail.webapp.service.offering.OfferingService;

import org.easymock.EasyMock;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;

/**
 * @author Laurel Williams
 * 
 * @version $Id$
 */
public class AdminOfferingControllerTest extends ModelAndViewTests {

	AdminOfferingParameters adminParameters;
	
	AdminOfferingController adminOfferingController;

	OfferingService mockOfferingsService;
	
	Offering expectedOffering;
	
	BindException errors;
	
	private Long OFFERING_ID_LONG = Long.valueOf(3);
	
	/**
	 * @see net.sf.sail.webapp.presentation.web.controllers.ModelAndViewTests#setUp()
	 */
	@Override
	protected void setUp() throws Exception {
		super.setUp();
		this.mockOfferingsService = EasyMock.createMock(OfferingService.class);
		this.adminOfferingController = new AdminOfferingController();
		this.adminOfferingController
				.setOfferingService(this.mockOfferingsService);
		
		adminParameters = new AdminOfferingParameters();
		
		SdsOffering sdsOffering = new SdsOffering();

		SdsCurnit curnit = new SdsCurnit();
		curnit.setSdsObjectId(new Long(1));
		sdsOffering.setSdsCurnit(curnit);

		SdsJnlp jnlp = new SdsJnlp();
		jnlp.setSdsObjectId(new Long(2));
		sdsOffering.setSdsJnlp(jnlp);

		sdsOffering.setName("test");
		sdsOffering.setSdsObjectId(OFFERING_ID_LONG);
		this.expectedOffering = new OfferingImpl();
		expectedOffering.setSdsOffering(sdsOffering);
	}

	/**
	 * @see net.sf.sail.webapp.presentation.web.controllers.ModelAndViewTests#tearDown()
	 */
	@Override
	protected void tearDown() throws Exception {
		super.tearDown();
		this.mockOfferingsService = null;
		this.expectedOffering = null;
	}

	public void testHandle_WithOffering() throws Exception {		
		EasyMock.expect(mockOfferingsService.getOffering(OFFERING_ID_LONG)).andReturn(
				this.expectedOffering);
		EasyMock.replay(this.mockOfferingsService);

		adminParameters.setOfferingId(OFFERING_ID_LONG);

		ModelAndView modelAndView = this.adminOfferingController.handle(request, response, adminParameters, errors);
		assertModelAttributeValue(modelAndView, AdminOfferingController.OFFERING_KEY,
				this.expectedOffering);
		assertModelAttributeValue(modelAndView, ControllerUtil.USER_KEY,
				this.user);
		assertEquals(AdminOfferingController.VIEW_NAME, modelAndView.getViewName());
		EasyMock.verify(this.mockOfferingsService);
	}

	public void testHandle_NoOffering() throws Exception {
		errors = new BindException(adminParameters, "");
		EasyMock.expect(mockOfferingsService.getOffering(null)).andThrow(new ObjectNotFoundException(OFFERING_ID_LONG, Offering.class));
		EasyMock.replay(this.mockOfferingsService);

		ModelAndView modelAndView = this.adminOfferingController.handle(request, response, adminParameters, errors);
		assertFalse(modelAndView.getModel().containsKey(AdminOfferingController.OFFERING_KEY));
		assertModelAttributeValue(modelAndView, ControllerUtil.USER_KEY,
				this.user);
		assertEquals(AdminOfferingController.ERROR_VIEW_NAME, modelAndView.getViewName());

		EasyMock.verify(this.mockOfferingsService);
	}
}