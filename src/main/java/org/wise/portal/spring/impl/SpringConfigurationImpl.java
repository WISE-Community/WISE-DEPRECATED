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

import org.wise.portal.spring.SpringConfiguration;


/**
 * Implementation of <code>SpringConfiguration</code> specifically for the
 * WISE portal.
 * 
 * @author Cynick Young
 * @author Hiroki Terashima
 * 
 * @version $Id$
 * 
 */
public final class SpringConfigurationImpl implements SpringConfiguration {

    /**
     * @see org.wise.portal.spring.SpringConfiguration#getDispatcherServletContextConfigLocations()
     */
    public String[] getDispatcherServletContextConfigLocations() {
        return new String[] {
                "classpath:configurations/dispatcherServletContexts.xml"
        };
    }

    /**
     * @see org.wise.portal.spring.SpringConfiguration#getRootApplicationContextConfigLocations()
     */
    public String[] getRootApplicationContextConfigLocations() {
        return new String[] {
            	"classpath:configurations/applicationContexts.xml"
        };
    }
}