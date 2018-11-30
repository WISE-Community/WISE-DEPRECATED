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
package org.wise.portal.spring;

/**
 * Provides a single access point for applicationContext configuration files.
 *
 * @author Cynick Young
 */
public interface SpringConfiguration {

  /**
   * Get the list of applicationContext XML files used to instantiate the
   * beans in the Spring container.
   *
   * @return <code>String[]</code> such that each string in the array
   * defines the location of an applicationContext XML configuration
   * file used by the Spring container
   */
  String[] getRootApplicationContextConfigLocations();

  /**
   * Get the list of XML files used to instantiate the beans within the
   * DispatcherServlet context.
   *
   * @return <code>String[]</code> such that each string in the array
   * defines the location of an XML configuration file used by the
   * DispatcherServlet context
   */
  String[] getDispatcherServletContextConfigLocations();
}
