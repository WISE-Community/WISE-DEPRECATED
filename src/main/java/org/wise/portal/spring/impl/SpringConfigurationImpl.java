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
package org.wise.portal.spring.impl;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.wise.portal.spring.SpringConfiguration;


/**
 * Implementation of <code>SpringConfiguration</code> specifically for the
 * TELS portal.
 * 
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public final class SpringConfigurationImpl implements SpringConfiguration {

    private static String[] ROOT_APPLICATION_CONTEXT_CONFIG_LOCATIONS = new String[] {
        "classpath:configurations/applicationContexts/pas/acegiSecurity.xml",
        "classpath:configurations/applicationContexts/pas/datasource.xml",
        "classpath:configurations/applicationContexts/pas/hibernate.xml",
        "classpath:configurations/applicationContexts/pas/security.xml",
        "classpath:configurations/applicationContexts/pas/spring.xml",
        "classpath:configurations/applicationContexts/pas/user.xml",
        "classpath:configurations/applicationContexts/pas/javamail.xml"};

    private static final String[] DISPATCHER_SERVLET_CONTEXT_CONFIG_LOCATIONS = new String[] {
            "classpath:configurations/dispatcherServlet/pas/config.xml",
            "classpath:configurations/dispatcherServlet/pas/controllers.xml",            
            "classpath:configurations/dispatcherServlet/tels/controllers.xml",
            "classpath:configurations/dispatcherServlet/tels/extensions.xml",
            "classpath:configurations/dispatcherServlet/tels/overrides.xml" };

    static {
        final List<String> configLocationsList = Collections.list(Collections
                .enumeration(Arrays.asList(ROOT_APPLICATION_CONTEXT_CONFIG_LOCATIONS)));
        configLocationsList
                .add("classpath:configurations/applicationContexts/tels/extensions.xml");
        // Keep the overrides as the last item to be added to the list to ensure
        // that the overridden bean has indeed been defined.
        configLocationsList
                .add("classpath:configurations/applicationContexts/tels/overrides.xml");
        
        ROOT_APPLICATION_CONTEXT_CONFIG_LOCATIONS = configLocationsList.toArray(new String[0]);
    }

    /**
     * @see org.wise.portal.spring.SpringConfiguration#getDispatcherServletContextConfigLocations()
     */
    public String[] getDispatcherServletContextConfigLocations() {
        return DISPATCHER_SERVLET_CONTEXT_CONFIG_LOCATIONS;
    }

    /**
     * @see org.wise.portal.spring.SpringConfiguration#getRootApplicationContextConfigLocations()
     */
    public String[] getRootApplicationContextConfigLocations() {
        return ROOT_APPLICATION_CONTEXT_CONFIG_LOCATIONS;
    }
}