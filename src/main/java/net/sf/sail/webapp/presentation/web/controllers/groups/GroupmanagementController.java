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

import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;
import net.sf.sail.webapp.service.group.GroupService;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;

/**
 * @author Laurel Williams
 * 
 * @version $Id$
 * 
 * Puts information into the model for display in the groupsmanagement.jsp page
 */
public class GroupmanagementController extends AbstractController {

	private static final String VIEW_NAME = "groups/groupmanagement";
    private GroupService groupService;

    @Override
    protected ModelAndView handleRequestInternal(HttpServletRequest request,
            HttpServletResponse response) throws Exception {
    	ModelAndView modelAndView = new ModelAndView(VIEW_NAME);
    	ControllerUtil.addUserToModelAndView(request, modelAndView);
    	
        try {
            modelAndView.addObject("grouplist", this.groupService.getGroups());
        } catch (AccessDeniedException ade) {
            ade.printStackTrace();
            throw ade;
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
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

}