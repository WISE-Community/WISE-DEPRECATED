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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.Offering;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.webservice.http.HttpRestTransport;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;
import net.sf.sail.webapp.service.offering.OfferingService;
import net.sf.sail.webapp.service.workgroup.WorkgroupService;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;

/**
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 * Puts offering details into the model to be retrieved and displayed on
 * offeringlist.jsp
 * 
 */
public class OfferingListController extends AbstractController {

	private OfferingService offeringService;

	private WorkgroupService workgroupService;

	private HttpRestTransport httpRestTransport;

	protected final static String HTTP_TRANSPORT_KEY = "http_transport";

	protected final static String OFFERING_LIST_KEY = "offering_list";

	protected final static String WORKGROUP_MAP_KEY = "workgroup_map";

	static final String DEFAULT_PREVIEW_WORKGROUP_NAME = "Your test workgroup";
	
	private static final String VIEW_NAME = "offerings/offeringlist";

	public static final String REQUEST_PARAMETER_KEY_ERROR = "error";

	public static final String REQUEST_PARAMETER_VALUE_ERROR = "cannotFindOffering";

	protected static final String ERROR_MODEL_NAME = "error";

	protected static final Object ERROR_MODEL_OBJECT = "Error: cannot find specified offering";

	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest,
	 *      javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(
			HttpServletRequest servletRequest,
			HttpServletResponse servletResponse) throws Exception {
		
    	ModelAndView modelAndView = new ModelAndView(VIEW_NAME);
    	ControllerUtil.addUserToModelAndView(servletRequest, modelAndView);
    	
    	String errorType = servletRequest.getParameter(REQUEST_PARAMETER_KEY_ERROR);
    	if (errorType != null && errorType.equals(REQUEST_PARAMETER_VALUE_ERROR)) {
    		modelAndView.addObject(ERROR_MODEL_NAME, ERROR_MODEL_OBJECT);
    	}
 
		User user = (User) modelAndView.getModel().get(ControllerUtil.USER_KEY);
		List<Offering> offeringList = this.offeringService.getOfferingList();
		Map<Offering, List<Workgroup>> workgroupMap = new HashMap<Offering, List<Workgroup>>();
		for (Offering offering : offeringList) {
			List<Workgroup> workgroupList = this.workgroupService
					.getWorkgroupListByOfferingAndUser(offering, user);
			workgroupList = this.workgroupService
					.createPreviewWorkgroupForOfferingIfNecessary(offering,
							workgroupList, user, DEFAULT_PREVIEW_WORKGROUP_NAME);
			workgroupMap.put(offering, workgroupList);
		}
		
		modelAndView.addObject(OFFERING_LIST_KEY, offeringList);
		modelAndView.addObject(WORKGROUP_MAP_KEY, workgroupMap);
		modelAndView.addObject(HTTP_TRANSPORT_KEY, this.httpRestTransport);
		return modelAndView;
	}

	/**
	 * @param workgroupService
	 *            the workgroupService to set
	 */
	@Required
	public void setWorkgroupService(WorkgroupService workgroupService) {
		this.workgroupService = workgroupService;
	}

	/**
	 * @param offeringService
	 *            the offeringService to set
	 */
	@Required
	public void setOfferingService(OfferingService offeringService) {
		this.offeringService = offeringService;
	}

	/**
	 * @param httpRestTransport
	 *            the httpRestTransport to set
	 */
	@Required
	public void setHttpRestTransport(HttpRestTransport httpRestTransport) {
		this.httpRestTransport = httpRestTransport;
	}
}