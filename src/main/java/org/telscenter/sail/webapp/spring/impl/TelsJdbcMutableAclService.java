/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU Lesser General Public License, v2.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.telscenter.sail.webapp.spring.impl;

import java.io.IOException;
import java.util.Properties;

import javax.sql.DataSource;

import org.springframework.security.acls.jdbc.JdbcMutableAclService;
import org.springframework.security.acls.jdbc.LookupStrategy;
import org.springframework.security.acls.model.AclCache;

/**
 * Extends JdbcMutableAclService to handle different database types
 * @author Hiroki Terashima
 * @version $Id:$
 */
public class TelsJdbcMutableAclService extends JdbcMutableAclService {

	public TelsJdbcMutableAclService(DataSource dataSource,
			LookupStrategy lookupStrategy, AclCache aclCache) {
		super(dataSource, lookupStrategy, aclCache);
		Properties portalProperties = new Properties();
    	try {
    		portalProperties.load(TelsAnnotationSessionFactoryBean.class.getClassLoader().getResourceAsStream("portal.properties"));
    		if (portalProperties.containsKey("hibernate.connection.driver_class")) {
    			String driverClass = (String) portalProperties.get("hibernate.connection.driver_class");
    			if ("com.mysql.jdbc.Driver".equals(driverClass)) {
    				this.setClassIdentityQuery("SELECT @@IDENTITY");
    				this.setSidIdentityQuery("SELECT @@IDENTITY");
    			}
    		}
		} catch (IOException e) {
			// pretend like nothing happened.
			e.printStackTrace();
		}

	}

}
