/**
 * Copyright (c) 2006 Encore Research Group, University of Toronto
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
package net.sf.sail.webapp.presentation.web.controllers;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.authentication.MutableUserDetails;
import net.sf.sail.webapp.service.UserService;
import net.sf.sail.webapp.service.authentication.DuplicateUsernameException;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.SimpleFormController;
import org.springframework.web.servlet.view.RedirectView;

/**
 * The controller for the signup page.
 * 
 * @author Laurel Williams
 * 
 * @version $Id$
 */
public class SignupController extends SimpleFormController {

    protected UserService userService = null;

    /**
     * On submission of the signup form, a user is created and saved to the data
     * store.
     * 
     * @see org.springframework.web.servlet.mvc.SimpleFormController#onSubmit(javax.servlet.http.HttpServletRequest,
     *      javax.servlet.http.HttpServletResponse, java.lang.Object,
     *      org.springframework.validation.BindException)
     */
    @Override
    protected ModelAndView onSubmit(HttpServletRequest request,
            HttpServletResponse response, Object command, BindException errors)
            throws Exception {
        MutableUserDetails userDetails = (MutableUserDetails) command;

        try {
            userService.createUser(userDetails);
        } catch (DuplicateUsernameException e) {
            errors.rejectValue("username", "error.duplicate-username",
                    new Object[] { userDetails.getUsername() },
                    "Duplicate Username.");
            return showForm(request, response, errors);
        }
        return new ModelAndView(new RedirectView(getSuccessView()));
    }

    /**
     * Sets the userDetailsService object.
     * 
     * @param userDetailsService
     */
    @Required
    public void setUserService(UserService userService) {
        this.userService = userService;
    }
}