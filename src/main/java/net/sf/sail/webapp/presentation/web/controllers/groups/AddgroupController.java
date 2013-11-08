/**
 * Copyright (c) 20067 Encore Research Group, University of Toronto
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
package net.sf.sail.webapp.presentation.web.controllers.groups;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.group.impl.GroupParameters;
import net.sf.sail.webapp.service.UserService;
import net.sf.sail.webapp.service.group.GroupService;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.SimpleFormController;
import org.springframework.web.servlet.view.RedirectView;

/**
 * @author Laurel Williams
 * 
 * @version $Id$
 * 
 * A controller for the page which allows users to add groups (addgroup.jsp).
 */
public class AddgroupController extends SimpleFormController {

	private GroupService groupService;
	
	private UserService userService;

	/**
	 * @param userService the userService to set
	 */
	@Required
	public void setUserService(UserService userService) {
		this.userService = userService;
	}

	/**
	 * @param groupService
	 *            the groupService to set
	 */
	@Required
	public void setGroupService(GroupService groupService) {
		this.groupService = groupService;
	}

	/**
	 * @see org.springframework.web.servlet.mvc.SimpleFormController#showForm(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse, org.springframework.validation.BindException)
	 */
	@Override
	protected ModelAndView showForm(HttpServletRequest request, HttpServletResponse response, BindException bindException) throws Exception {
		ModelAndView modelAndView = super.showForm(request, response, bindException);
//		TODO would like to sort groups by parent group
        modelAndView.addObject("grouplist", this.groupService.getGroups());
        modelAndView.addObject("userlist", this.userService.retrieveAllUsers());
		return modelAndView;
	}

	/**
	 * @see org.springframework.web.servlet.mvc.SimpleFormController#onSubmit(javax.servlet.http.HttpServletRequest,
	 *      javax.servlet.http.HttpServletResponse, java.lang.Object,
	 *      org.springframework.validation.BindException)
	 */
	@Override
	protected ModelAndView onSubmit(HttpServletRequest request,
			HttpServletResponse response, Object command, BindException errors)
			throws Exception {
		GroupParameters groupParameters = (GroupParameters) command;
		groupService.createGroup(groupParameters);
		return new ModelAndView(new RedirectView(getSuccessView()));
	}

}