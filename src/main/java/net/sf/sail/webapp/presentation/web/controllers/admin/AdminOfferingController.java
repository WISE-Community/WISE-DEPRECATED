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

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.Offering;
import net.sf.sail.webapp.domain.impl.AdminOfferingParameters;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;
import net.sf.sail.webapp.presentation.web.controllers.offerings.OfferingListController;
import net.sf.sail.webapp.service.offering.OfferingService;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractCommandController;

/**
 * @author Laurel Williams
 * 
 * @version $Id$
 */
public class AdminOfferingController extends AbstractCommandController {

	private OfferingService offeringService;

	protected final static String OFFERING_ID_KEY = "offeringId";

	protected final static String OFFERING_KEY = "offering";

	public static final String VIEW_NAME = "admin/adminoffering";
	
	public static String ERROR_VIEW_NAME = "redirect:offeringlist.html";

	static {
		String requestParamString = 
			OfferingListController.REQUEST_PARAMETER_KEY_ERROR + "=" +
			OfferingListController.REQUEST_PARAMETER_VALUE_ERROR;
		ERROR_VIEW_NAME += "?" + requestParamString;
	}
	
	/**
	 * @param offeringService
	 *            the offeringService to set
	 */
	@Required
	public void setOfferingService(OfferingService offeringService) {
		this.offeringService = offeringService;
	}

	@Override
	protected ModelAndView handle(HttpServletRequest servletRequest,
			HttpServletResponse servletResponse, Object command, BindException errors) {
		ModelAndView modelAndView = new ModelAndView(VIEW_NAME);
		ControllerUtil.addUserToModelAndView(servletRequest, modelAndView);

		AdminOfferingParameters adminOfferingParameters = (AdminOfferingParameters) command;
		Offering offering;
		try {
			offering = this.offeringService.getOffering(adminOfferingParameters.getOfferingId());
			modelAndView.addObject(OFFERING_KEY, offering);
		} catch (ObjectNotFoundException e) {
			modelAndView.setViewName(ERROR_VIEW_NAME);
		}
		return modelAndView;	
	}
}