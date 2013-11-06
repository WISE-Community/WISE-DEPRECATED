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
package net.sf.sail.webapp.presentation.web.controllers;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.service.curnit.CurnitService;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;

/**
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 * This class is not currently used but is being left in place in case we need
 * to get a list of curnits at a later time.
 * 
 */
public class CurnitListController extends AbstractController {
    private CurnitService curnitService;

    /**
     * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest,
     *      javax.servlet.http.HttpServletResponse)
     */
    @Override
    protected ModelAndView handleRequestInternal(
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) throws Exception {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView
                .addObject("curnitlist", this.curnitService.getCurnitList());
        return modelAndView;
    }

    /**
     * @param curnitService
     *            the curnitService to set
     */
    @Required
    public void setCurnitService(CurnitService curnitService) {
        this.curnitService = curnitService;
    }
}