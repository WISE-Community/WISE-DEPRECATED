/**
 * Copyright (c) 2008-2015 Regents of the University of California (Regents).
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 * 
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 * 
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 * 
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 * 
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.domain.general.contactwise;

import java.util.Properties;

/**
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
public enum OperatingSystem {

	MAC_OSX_LEOPARD, MAC_OSX_TIGER, MAC_OS9, 
	WINDOWS_VISTA, WINDOWS_XP, WINDOWS_2K_NT,
	WINDOWS_98, LINUX, OTHER;
	
	//the properties file that contains the user friendly values
	private static Properties i18nProperties;
	
	/**
	 * @param properties the properties file that contains the user friendly
	 * (regular casing and spaces instead of underscores) values i.e.
	 * WINDOWS_XP_NT_2K would be resolved to Windows XP/NT/2000
	 */
	public static void setProperties(Properties properties) {
		i18nProperties = properties;
	}


	/**
	 * Returns the user-friendly string representation of
	 * the IssueType
	 * @return String
	 */
	@Override
	public String toString() {
		return i18nProperties.getProperty("operatingsystems." + this.name());
	}

	/*
	 * This is required because the jsp needs to retrieve the declared
	 * value and not the user friendly value
	 * @return the value of the enum as declared i.e. TROUBLE_LOGGING_IN
	 */
	public String getName() {
		return name();
	}
}
