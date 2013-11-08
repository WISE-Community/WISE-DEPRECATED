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
package net.sf.sail.webapp.presentation.web.controllers.offerings;

import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import net.sf.sail.webapp.domain.Offering;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.impl.OfferingImpl;
import net.sf.sail.webapp.domain.sds.SdsCurnit;
import net.sf.sail.webapp.domain.sds.SdsJnlp;
import net.sf.sail.webapp.domain.sds.SdsOffering;
import net.sf.sail.webapp.domain.webservice.http.HttpRestTransport;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;
import net.sf.sail.webapp.presentation.web.controllers.ModelAndViewTests;
import net.sf.sail.webapp.service.offering.OfferingService;
import net.sf.sail.webapp.service.workgroup.WorkgroupService;

import org.easymock.EasyMock;
import org.springframework.web.servlet.ModelAndView;

/**
 * @author Laurel Williams
 * 
 * @version $Id$
 */
public class OfferingListControllerTest extends ModelAndViewTests {

	private OfferingListController offeringListController;

	private HttpRestTransport mockHttpTransport;

	private OfferingService mockOfferingsService;

	private WorkgroupService mockWorkgroupService;

	private List<Offering> expectedOfferingList;

	/**
	 * @see junit.framework.TestCase#setUp()
	 */
	protected void setUp() throws Exception {
		super.setUp();
		this.mockOfferingsService = EasyMock.createMock(OfferingService.class);
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
		Offering offering = new OfferingImpl();
		offering.setSdsOffering(sdsOffering);

		this.expectedOfferingList = new LinkedList<Offering>();
		this.expectedOfferingList.add(offering);

		this.mockHttpTransport = EasyMock.createMock(HttpRestTransport.class);
		this.offeringListController = new OfferingListController();
		this.offeringListController
				.setOfferingService(this.mockOfferingsService);
		this.offeringListController
				.setWorkgroupService(this.mockWorkgroupService);
		this.offeringListController
				.setHttpRestTransport(this.mockHttpTransport);
	}

	/**
	 * @see junit.framework.TestCase#tearDown()
	 */
	protected void tearDown() throws Exception {
		super.tearDown();
		this.mockOfferingsService = null;
	}

	public void testHandleRequestInternal_WithOffering() throws Exception {
		EasyMock.expect(mockOfferingsService.getOfferingList()).andReturn(
				this.expectedOfferingList);
		List<Workgroup> emptyWorkgroupList = Collections.emptyList();
		Offering offering = this.expectedOfferingList.get(0);
		Map<Offering, List<Workgroup>> expectedWorkgroupMap = new HashMap<Offering, List<Workgroup>>(
				1);
		expectedWorkgroupMap.put(offering, emptyWorkgroupList);

		EasyMock.expect(
				this.mockWorkgroupService.getWorkgroupListByOfferingAndUser(
						offering, this.user)).andReturn(emptyWorkgroupList);
		EasyMock
				.expect(
						this.mockWorkgroupService
								.createPreviewWorkgroupForOfferingIfNecessary(
										offering,
										emptyWorkgroupList,
										this.user,
										OfferingListController.DEFAULT_PREVIEW_WORKGROUP_NAME))
				.andReturn(emptyWorkgroupList);
		EasyMock.replay(this.mockOfferingsService);
		EasyMock.replay(this.mockWorkgroupService);

		ModelAndView modelAndView = offeringListController
				.handleRequestInternal(request, response);
		assertModelAttributeValue(modelAndView,
				OfferingListController.OFFERING_LIST_KEY,
				this.expectedOfferingList);
		assertModelAttributeValue(modelAndView,
				OfferingListController.WORKGROUP_MAP_KEY, expectedWorkgroupMap);
		assertModelAttributeValue(modelAndView, ControllerUtil.USER_KEY,
				this.user);
		assertModelAttributeValue(modelAndView,
				OfferingListController.HTTP_TRANSPORT_KEY,
				this.mockHttpTransport);
		assertNull(modelAndView.getModelMap().
				get(OfferingListController.ERROR_MODEL_NAME));
		EasyMock.verify(this.mockOfferingsService);
		EasyMock.verify(this.mockWorkgroupService);
	}

	public void testHandleRequestInternal_NoOfferings() throws Exception {
		List<Offering> emptyOfferingList = Collections.emptyList();
		Map<Offering, List<Workgroup>> emptyWorkgroupMap = Collections
				.emptyMap();
		EasyMock.expect(mockOfferingsService.getOfferingList()).andReturn(
				emptyOfferingList);
		EasyMock.replay(this.mockOfferingsService);
		EasyMock.replay(this.mockWorkgroupService);

		ModelAndView modelAndView = offeringListController
				.handleRequestInternal(request, response);
		assertModelAttributeValue(modelAndView,
				OfferingListController.OFFERING_LIST_KEY, emptyOfferingList);
		assertModelAttributeValue(modelAndView,
				OfferingListController.WORKGROUP_MAP_KEY, emptyWorkgroupMap);
		assertModelAttributeValue(modelAndView, ControllerUtil.USER_KEY,
				this.user);
		assertModelAttributeValue(modelAndView,
				OfferingListController.HTTP_TRANSPORT_KEY,
				this.mockHttpTransport);
		assertNull(modelAndView.getModelMap().
				get(OfferingListController.ERROR_MODEL_NAME));
		EasyMock.verify(this.mockOfferingsService);
		EasyMock.verify(this.mockWorkgroupService);
	}
	
	public void testHandleRequestInternal_withError() throws Exception {
		// tests when an ?error=cannotFindOffering parameter is passed 
		// into the offeringlist.jsp page. Should add a model object
		// called error with modelObject "Error: cannot find specified offering"
		// for this test, model after testHandleRequestInternal_NoOfferings()
		List<Offering> emptyOfferingList = Collections.emptyList();
		Map<Offering, List<Workgroup>> emptyWorkgroupMap = Collections
				.emptyMap();
		EasyMock.expect(mockOfferingsService.getOfferingList()).andReturn(
				emptyOfferingList);
		EasyMock.replay(this.mockOfferingsService);
		EasyMock.replay(this.mockWorkgroupService);
		
		request.addParameter(OfferingListController.REQUEST_PARAMETER_KEY_ERROR,
				OfferingListController.REQUEST_PARAMETER_VALUE_ERROR);
		ModelAndView modelAndView = offeringListController
		    .handleRequestInternal(request, response);		
		assertModelAttributeValue(modelAndView, 
				OfferingListController.ERROR_MODEL_NAME,
				OfferingListController.ERROR_MODEL_OBJECT);
		
		assertModelAttributeValue(modelAndView,
				OfferingListController.OFFERING_LIST_KEY, emptyOfferingList);
		assertModelAttributeValue(modelAndView,
				OfferingListController.WORKGROUP_MAP_KEY, emptyWorkgroupMap);
		assertModelAttributeValue(modelAndView, ControllerUtil.USER_KEY,
				this.user);
		assertModelAttributeValue(modelAndView,
				OfferingListController.HTTP_TRANSPORT_KEY,
				this.mockHttpTransport);
		EasyMock.verify(this.mockOfferingsService);
		EasyMock.verify(this.mockWorkgroupService);
	}
}