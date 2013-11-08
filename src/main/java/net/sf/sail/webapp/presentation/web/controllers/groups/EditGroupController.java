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
package net.sf.sail.webapp.presentation.web.controllers.groups;

import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.domain.group.impl.GroupParameters;
import net.sf.sail.webapp.service.UserService;
import net.sf.sail.webapp.service.group.GroupService;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.SimpleFormController;
import org.springframework.web.servlet.view.RedirectView;

/**
 * Controller to allow Admin users to perform edit operation on a group
 * Edit operations include:
 * - changing group's name
 * - changing group's parent
 * - changing group's membership
 *
 * @author Hiroki Terashima
 * @version $Id$
 */
public class EditGroupController extends SimpleFormController {

	private GroupService groupService;
	
	private UserService userService;
	
	/**
	 * @see org.springframework.web.servlet.mvc.AbstractFormController#formBackingObject(
	 *     javax.servlet.http.HttpServletRequest)
	 */
	@Override
	protected Object formBackingObject(HttpServletRequest request) throws Exception {
		Long groupId = Long.parseLong(request.getParameter("groupId"));
		Group group = groupService.retrieveById(groupId);
		GroupParameters groupParameters = new GroupParameters();
		groupParameters.setGroupId(groupId);
		groupParameters.setName(group.getName());
		Set<User> members = group.getMembers();
		Long[] memberIds = new Long[members.size()];
		int i = 0;
		for (User member : members) {
			memberIds[i++] = member.getId();
		}
		groupParameters.setMemberIds(memberIds);
		Group parentGroup = group.getParent();
		Long parentId = new Long(0);
		if (parentGroup != null) {
			parentId = parentGroup.getId();
		}
		groupParameters.setParentId(parentId);
		return groupParameters;
	}
	/**
	 * @see org.springframework.web.servlet.mvc.SimpleFormController#onSubmit(
	 *     javax.servlet.http.HttpServletRequest, 
	 *     javax.servlet.http.HttpServletResponse, 
	 *     java.lang.Object, 
	 *     org.springframework.validation.BindException)
	 */
	@Override
	protected ModelAndView onSubmit(HttpServletRequest request,
			HttpServletResponse response, Object command, BindException errors)
			throws Exception {
		GroupParameters groupParameters = (GroupParameters) command;
		groupService.updateGroup(groupParameters);
		return new ModelAndView(new RedirectView(getSuccessView()));
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
	 * @param groupService
	 *            the groupService to set
	 */
	@Required
	public void setGroupService(GroupService groupService) {
		this.groupService = groupService;
	}
	
	/**
	 * @param userService the userService to set
	 */
	@Required
	public void setUserService(UserService userService) {
		this.userService = userService;
	}

}
