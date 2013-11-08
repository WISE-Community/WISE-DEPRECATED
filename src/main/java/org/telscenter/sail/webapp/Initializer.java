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
package org.telscenter.sail.webapp;

import net.sf.sail.webapp.domain.Curnit;
import net.sf.sail.webapp.domain.Jnlp;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.service.authentication.UserDetailsService;
import net.sf.sail.webapp.spring.SpringConfiguration;

import org.springframework.beans.BeanUtils;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.GrantedAuthorityImpl;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.telscenter.sail.webapp.domain.project.Project;

/**
 * A disposable class that is used to initialize the system.
 * 
 * @author Cynick Young
 * 
 * @version $Id$
 */
public class Initializer {

    /**
     * @param args
     */
    public static void main(String[] args) {
        if (args.length < 1) {
            System.out.println("Usage: Initializer "
                    + "<spring-configuration-classname> ");
            System.exit(1);
        }
        ConfigurableApplicationContext applicationContext = null;
        try {
            SpringConfiguration springConfig = (SpringConfiguration) BeanUtils
                    .instantiateClass(Class.forName(args[0]));
            applicationContext = new ClassPathXmlApplicationContext(
                    springConfig.getRootApplicationContextConfigLocations());
            CreateDefaultUsers createDefaultUsers = new CreateDefaultUsers(
                    applicationContext);
            createDefaultUsers.createRoles(applicationContext);
            // note: change this admin's password once the portal is deployed on server
            User adminUser = createDefaultUsers.createAdministrator(applicationContext, "ad", "min",
                    "pass");
            
			// createDefaultOfferings requires security context so that ACL
			// entries can be created for the default offerings.
			// this also means that the only user allowed to "see" offerings at
			// the initial login will be the admin user.
			Authentication authority = new UsernamePasswordAuthenticationToken(
					adminUser.getUserDetails(),
					new GrantedAuthority[] { new GrantedAuthorityImpl(
							UserDetailsService.ADMIN_ROLE) });
			SecurityContext securityContext = new SecurityContextImpl();
			securityContext.setAuthentication(authority);
			SecurityContextHolder.setContext(securityContext);
            
			// next create a preview user, who is just another teacher
			// this user will be used to preview projects (in 'Instant Preview' page)
			User previewUser = createDefaultUsers.createPreviewUser(applicationContext, "preview", 
					"user", "preview");
            
			// BEGIN: CREATES OFFERINGS USING LD-BASED PROJECTS
			OfferingInitializer offeringInitializer = 
				new OfferingInitializer(applicationContext);
			//offeringInitializer.createDefaultOfferings(adminUser);
			// END: CREATES OFFERINGS USING LD-BASED PROJECTS

			
			
			
			// BEGIN: CREATES OFFERINGS USING PRE-LD-BASED PROJECTS
			/*
            CreateDefaultOfferings createDefaultOfferings = new CreateDefaultOfferings(
                    applicationContext);
            Curnit[] curnits = createDefaultOfferings
                    .createDefaultCurnits(applicationContext);
            Jnlp[] jnlps = createDefaultOfferings
                    .createDefaultJnlps(applicationContext);
            Project[] projects = createDefaultOfferings
                    .createDefaultProjects(applicationContext, curnits, jnlps);
			*/
			// END: CREATES OFFERINGS USING PRE-LD-BASED PROJECTS
            
            
//    		System.setProperty("org.apache.jackrabbit.repository.conf", "/Users/hirokiterashima/eclipseworkspaces/telsportalworkspace3.3/webapp/repository.xml");
//    		System.setProperty("org.apache.jackrabbit.repository.home", "/Users/hirokiterashima/eclipseworkspaces/telsportalworkspace3.3/webapp/repository");
//			CreateDefaultCurnits cdc = new CreateDefaultCurnits(applicationContext);
//			cdc.createDefaultCurnits(applicationContext);

        } catch (Exception all) {
            System.err.println(all.getLocalizedMessage());
            all.printStackTrace(System.out);
            System.exit(2);
        } finally {
            applicationContext.close();
        }
    }

}