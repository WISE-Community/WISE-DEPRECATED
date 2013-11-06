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
package org.telscenter.sail.webapp.presentation.web.controllers.admin;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;

import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.springframework.web.servlet.mvc.SimpleFormController;
import org.telscenter.sail.webapp.domain.portal.Portal;
import org.telscenter.sail.webapp.domain.project.FamilyTag;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.service.portal.PortalService;

/**
 * Controller for configuring this portal.
 * 
 * @author hirokiterashima
 * @version $Id$
 */
public class ManagePortalController extends AbstractController {
	
	private static final String VIEW_NAME = "admin/portal/manageportal";

	private static final String PORTAL_ID_PARAM = "portalId";

	private static final String PORTAL_PARAM = "portal";

	private PortalService portalService;
	
	/**
	 * @override @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		String portalId = request.getParameter(PORTAL_ID_PARAM);
		if (portalId == null) {
			portalId = "0";
		}

		Portal portal = portalService.getById(Long.valueOf(portalId));

		if (request.getMethod().equals("GET")) {
			ModelAndView modelAndView = new ModelAndView(VIEW_NAME);
			modelAndView.addObject(PORTAL_PARAM, portal);
			return modelAndView;		
		} else {
			// handle posting changes to project
			ModelAndView mav = new ModelAndView();
			try {
				String attr = request.getParameter("attr");
				if (attr.equals("isLoginAllowed")) {
					portal.setLoginAllowed(Boolean.valueOf(request.getParameter("val")));
					portalService.updatePortal(portal);
					mav.addObject("msg", "success");
				} else {
					mav.addObject("msg", "error: permission denied");
				}
				return mav;
			} catch (Exception e) {
				e.printStackTrace();
				mav.addObject("msg", "error");
				return mav;
			}
		}
	}
	
	
	/**
	 * @param portalService the portalService to set
	 */
	public void setPortalService(PortalService portalService) {
		this.portalService = portalService;
	}

}
