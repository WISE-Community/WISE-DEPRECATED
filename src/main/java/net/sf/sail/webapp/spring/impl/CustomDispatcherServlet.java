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
package net.sf.sail.webapp.spring.impl;

import java.security.InvalidParameterException;

import net.sf.sail.webapp.spring.SpringConfiguration;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeansException;
import org.springframework.util.StringUtils;
import org.springframework.web.context.ConfigurableWebApplicationContext;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.DispatcherServlet;

/**
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public class CustomDispatcherServlet extends DispatcherServlet {

    private static final long serialVersionUID = 1L;

    /**
     * Name of servlet initialization parameter that specifies the
     * implementation class which holds all the config locations. Use
     * "contextConfigClass".
     */
    public static final String CONFIG_CLASS_PARAM = "contextConfigClass";

    private String contextConfigClass;

    /**
     * Constructor that adds a required servlet initialization parameter
     * CONFIG_CLASS_PARAM
     */
    public CustomDispatcherServlet() {
        super();
        this.addRequiredProperty(CONFIG_CLASS_PARAM);
    }

    /**
     * @param contextConfigClass
     *            the contextConfigClass to set
     */
    public void setContextConfigClass(String contextConfigClass) {
        this.contextConfigClass = contextConfigClass;
    }

    private String getContextConfigClass() {
        return this.contextConfigClass;
    }

    /**
     * @see org.springframework.web.servlet.FrameworkServlet#createWebApplicationContext(org.springframework.web.context.WebApplicationContext)
     */
    @Override
    protected WebApplicationContext createWebApplicationContext(
            WebApplicationContext parent) throws BeansException {
        try {
            SpringConfiguration springConfig = (SpringConfiguration) BeanUtils
                    .instantiateClass(Class.forName(this
                            .getContextConfigClass()));
            this
                    .setContextConfigLocation(StringUtils
                            .arrayToDelimitedString(
                                    springConfig
                                            .getDispatcherServletContextConfigLocations(),
                                    ConfigurableWebApplicationContext.CONFIG_LOCATION_DELIMITERS));
        } catch (ClassNotFoundException e) {
            if (this.logger.isErrorEnabled()) {
                this.logger.error(CONFIG_CLASS_PARAM + " <"
                        + this.getContextConfigClass() + "> not found.", e);
            }
            throw new InvalidParameterException("ClassNotFoundException: "
                    + this.getContextConfigClass());
        }
        return super.createWebApplicationContext(parent);
    }

}