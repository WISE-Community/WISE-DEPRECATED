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

import javax.servlet.ServletContext;

import net.sf.sail.webapp.spring.SpringConfiguration;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextException;
import org.springframework.web.context.ConfigurableWebApplicationContext;
import org.springframework.web.context.ContextLoader;
import org.springframework.web.context.WebApplicationContext;

/**
 * Customized implementation that ignores the web.xml context parameter for
 * configLocations that is normally used to list all of the spring configuration
 * files. Instead, we pull the values out of SpringConfigurationImpl class.
 * 
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public class CustomContextLoader extends ContextLoader {

    private static final Log LOGGER = LogFactory
            .getLog(CustomContextLoader.class);

    /**
     * Name of servlet context parameter that specifies the implementation class
     * which holds all the config locations. Use "contextConfigClass".
     */
    public static final String CONFIG_CLASS_PARAM = "contextConfigClass";

    /**
     * The behaviour of this method is the same as the superclass except for
     * setting of the config locations.
     * 
     * @throws ClassNotFoundException
     * 
     * @see org.springframework.web.context.ContextLoader#createWebApplicationContext(javax.servlet.ServletContext,
     *      org.springframework.context.ApplicationContext)
     */
    @Override
    protected WebApplicationContext createWebApplicationContext(
            ServletContext servletContext)
            throws BeansException {

        Class<?> contextClass = determineContextClass(servletContext);
        if (!ConfigurableWebApplicationContext.class
                .isAssignableFrom(contextClass)) {
            throw new ApplicationContextException("Custom context class ["
                    + contextClass.getName()
                    + "] is not of type ConfigurableWebApplicationContext");
        }

        ConfigurableWebApplicationContext webApplicationContext = (ConfigurableWebApplicationContext) BeanUtils
                .instantiateClass(contextClass);
        webApplicationContext.setServletContext(servletContext);

        String configClass = servletContext
                .getInitParameter(CONFIG_CLASS_PARAM);
        if (configClass != null) {
            try {
                SpringConfiguration springConfig = (SpringConfiguration) BeanUtils
                        .instantiateClass(Class.forName(configClass));
                webApplicationContext.setConfigLocations(springConfig
                        .getRootApplicationContextConfigLocations());
            } catch (ClassNotFoundException e) {
                if (LOGGER.isErrorEnabled()) {
                    LOGGER.error(CONFIG_CLASS_PARAM + " <" + configClass
                            + "> not found.", e);
                }
                throw new InvalidParameterException("ClassNotFoundException: "
                        + configClass);
            }
        } else {
            throw new InvalidParameterException(
                    "No value defined for the required: " + CONFIG_CLASS_PARAM);
        }

        webApplicationContext.refresh();
        return webApplicationContext;
    }
}