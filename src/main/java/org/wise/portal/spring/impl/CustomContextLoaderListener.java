/**
 * Copyright (c) 2007-2015 Encore Research Group, University of Toronto
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Public License for more details.
 *
 * You should have received a copy of the GNU Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package org.wise.portal.spring.impl;

import java.security.InvalidParameterException;

import javax.servlet.ServletContext;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContextException;
import org.springframework.web.context.ConfigurableWebApplicationContext;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.WebApplicationContext;
import org.wise.portal.spring.SpringConfiguration;

/**
 * Custom implementation for creating and returning our <code>WebApplicationContext</code>
 *
 * @author Cynick Young
 */
public class CustomContextLoaderListener extends ContextLoaderListener {

  private static final Log LOGGER = LogFactory.getLog(CustomContextLoaderListener.class);

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
   * @see org.springframework.web.context.ContextLoader#createWebApplicationContext(ServletContext)
   */
  @Override
  protected WebApplicationContext createWebApplicationContext(ServletContext servletContext)
      throws BeansException {
    Class<?> contextClass = determineContextClass(servletContext);
    if (!ConfigurableWebApplicationContext.class.isAssignableFrom(contextClass)) {
      throw new ApplicationContextException("Custom context class ["
          + contextClass.getName() + "] is not of type ConfigurableWebApplicationContext");
    }

    ConfigurableWebApplicationContext webApplicationContext =
        (ConfigurableWebApplicationContext) BeanUtils.instantiateClass(contextClass);
    webApplicationContext.setServletContext(servletContext);

    String configClass = servletContext.getInitParameter(CONFIG_CLASS_PARAM);
    if (configClass != null) {
      try {
        SpringConfiguration springConfig =
            (SpringConfiguration) BeanUtils.instantiateClass(Class.forName(configClass));
        webApplicationContext
            .setConfigLocations(springConfig.getRootApplicationContextConfigLocations());
      } catch (ClassNotFoundException e) {
        if (LOGGER.isErrorEnabled()) {
          LOGGER.error(CONFIG_CLASS_PARAM + " <" + configClass + "> not found.", e);
        }
        throw new InvalidParameterException("ClassNotFoundException: " + configClass);
      }
    } else {
      throw new InvalidParameterException(
          "No value defined for the required: " + CONFIG_CLASS_PARAM);
    }
    webApplicationContext.refresh();
    return webApplicationContext;
  }
}
