/**
 * Copyright (c) 2007-2017 Encore Research Group, University of Toronto
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

import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeansException;
import org.springframework.util.StringUtils;
import org.springframework.web.context.ConfigurableWebApplicationContext;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.DispatcherServlet;
import org.wise.portal.spring.SpringConfiguration;

import javax.servlet.annotation.WebServlet;

/**
 * @author Cynick Young
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
    addRequiredProperty(CONFIG_CLASS_PARAM);
  }

  public void setContextConfigClass(String contextConfigClass) {
    this.contextConfigClass = contextConfigClass;
  }

  @Override
  protected WebApplicationContext createWebApplicationContext(WebApplicationContext parent)
      throws BeansException {
    try {
      SpringConfiguration springConfig =
          (SpringConfiguration) BeanUtils.instantiateClass(Class.forName(contextConfigClass));

      setContextConfigLocation(StringUtils.arrayToDelimitedString(
          springConfig.getDispatcherServletContextConfigLocations(),
          ConfigurableWebApplicationContext.CONFIG_LOCATION_DELIMITERS));
    } catch (ClassNotFoundException e) {
      if (logger.isErrorEnabled()) {
        logger.error(
            CONFIG_CLASS_PARAM + " <"  + contextConfigClass + "> not found.", e);
      }
      throw new InvalidParameterException("ClassNotFoundException: " + contextConfigClass);
    }
    return super.createWebApplicationContext(parent);
  }

}
