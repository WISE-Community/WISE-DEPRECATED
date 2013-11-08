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
package net.sf.sail.webapp.junit;

import net.sf.sail.webapp.spring.SpringConfiguration;
import net.sf.sail.webapp.spring.impl.SpringConfigurationImpl;

import org.springframework.test.AbstractDependencyInjectionSpringContextTests;

/**
 * Allows testers to perform integration tests which require access to the
 * Spring Beans.
 * 
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public abstract class AbstractSpringTests extends
        AbstractDependencyInjectionSpringContextTests {

    private static final SpringConfiguration SPRING_CONFIG = new SpringConfigurationImpl();

    /**
     * @see org.springframework.test.AbstractSingleSpringContextTests#getConfigLocations()
     */
    @Override
    protected String[] getConfigLocations() {
        return SPRING_CONFIG.getRootApplicationContextConfigLocations();
    }
}