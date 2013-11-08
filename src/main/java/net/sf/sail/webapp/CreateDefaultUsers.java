/**
 * Copyright (c) 2006 Encore Research Group, University of Toronto
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
package net.sf.sail.webapp;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.authentication.MutableGrantedAuthority;
import net.sf.sail.webapp.domain.authentication.MutableUserDetails;
import net.sf.sail.webapp.service.UserService;
import net.sf.sail.webapp.service.authentication.AuthorityNotFoundException;
import net.sf.sail.webapp.service.authentication.DuplicateAuthorityException;
import net.sf.sail.webapp.service.authentication.DuplicateUsernameException;
import net.sf.sail.webapp.service.authentication.UserDetailsService;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.context.ApplicationContext;
import org.springframework.security.core.GrantedAuthority;

/**
 * A disposable class that is used to create default roles in the data store and
 * to create a default administrator account.
 * 
 * @author Laurel Williams
 * @author Cynick Young
 * 
 * @version $Id$
 */
public class CreateDefaultUsers {

    private UserDetailsService userDetailsService = null;

    private UserService userService = null;

    /**
     * @param applicationContext
     */
    public CreateDefaultUsers(ApplicationContext applicationContext) {
        init(applicationContext);
    }

    private void init(ApplicationContext context) {
        this.setUserDetailsService((UserDetailsService) context
                .getBean("userDetailsService"));
        this.setUserService((UserService) context.getBean("userService"));
    }

    /**
     * Given a MutableUserDetails object (with username and password set),
     * creates a user with both UserDetailsService.USER_ROLE and
     * UserDetailsService.ADMIN_ROLE authorities. These roles must be set
     * already by using createRoles();
     * 
     * @param applicationContext
     *            The Spring application context that contains the beans.
     * @param username
     *            The username.
     * @param password
     *            The password.
     * @return A User object with UserDetails set including username and
     *         password that were input and with roles
     *         UserDetailsService.USER_ROLE and UserDetailsService.ADMIN_ROLE
     *         authorities.
     * @throws AuthorityNotFoundException
     *             If the user or admin roles are not already loaded into the
     *             granted authority table in data store.
     * @throws UserCreationException
     *             If the user cannot be created (duplicate user name, null
     *             username or null password)
     */
    public User createAdministrator(ApplicationContext applicationContext,
            String username, String password)
            throws AuthorityNotFoundException, DuplicateUsernameException {
        MutableUserDetails userDetails = (MutableUserDetails) applicationContext
                .getBean("mutableUserDetails");
        userDetails.setUsername(username);
        userDetails.setPassword(password);
        GrantedAuthority authority = this.userDetailsService
                .loadAuthorityByName(UserDetailsService.ADMIN_ROLE);
        userDetails.addAuthority(authority);
        return this.userService.createUser(userDetails);
    }

    /**
     * Creates two default roles in the the data store authorities table. These
     * are UserDetailsService.USER_ROLE and UserDetailsService.ADMIN_ROLE
     * authorities. This method should be run before attempting to create users.
     * 
     * @param applicationContext
     *            The Spring application context that contains the beans.
     * @throws DuplicateAuthorityException
     *             if authority to be created is not unique
     */
    public void createRoles(ApplicationContext applicationContext)
            throws DuplicateAuthorityException {
        createRole(applicationContext, UserDetailsService.USER_ROLE);
        createRole(applicationContext, UserDetailsService.ADMIN_ROLE);
    }

    private void createRole(ApplicationContext applicationContext, String role)
            throws DuplicateAuthorityException {
        MutableGrantedAuthority mutableGrantedAuthority = (MutableGrantedAuthority) applicationContext
                .getBean("mutableGrantedAuthority");
        mutableGrantedAuthority.setAuthority(role);
        this.userDetailsService.createGrantedAuthority(mutableGrantedAuthority);
    }

    /**
     * @param userService
     *            the userService to set
     */
    @Required
    public void setUserService(UserService userService) {
        this.userService = userService;
    }

    /**
     * Sets the UserDetailsService.
     * 
     * @param userDetailsService
     */
    @Required
    public void setUserDetailsService(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }
}