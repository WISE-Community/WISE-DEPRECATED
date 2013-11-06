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
package org.telscenter.sail.webapp;

import java.util.Calendar;
import java.util.Date;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.authentication.MutableGrantedAuthority;
import net.sf.sail.webapp.service.UserService;
import net.sf.sail.webapp.service.authentication.AuthorityNotFoundException;
import net.sf.sail.webapp.service.authentication.DuplicateAuthorityException;
import net.sf.sail.webapp.service.authentication.DuplicateUsernameException;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.context.ApplicationContext;
import org.springframework.security.core.GrantedAuthority;
import org.telscenter.sail.webapp.domain.authentication.Schoollevel;
import org.telscenter.sail.webapp.domain.authentication.impl.TeacherUserDetails;
import org.telscenter.sail.webapp.service.authentication.UserDetailsService;

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

    private static final String DEFAULT_CITY = "Berkeley";

	private static final String DEFAULT_COUNTRY = "USA";

	private static final String DEFAULT_STATE = "CA";

	private static final String[] DEFAULT_CURRICULUMSUBJECTS = {"biology"};

	private static final Schoollevel DEFAULT_SCHOOLLEVEL = Schoollevel.COLLEGE;

	private static final String DEFAULT_SCHOOLNAME = "Berkeley";

	private static final Date DEFAULT_SIGNUPDATE = Calendar.getInstance().getTime();

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
     *                The Spring application context that contains the beans.
     * @param firstname
     *                The firstname.
     * @param lastname
     *                The lastname.
     * @param password
     *                The password.
     * @return A User object with UserDetails set including username and
     *         password that were input and with roles
     *         UserDetailsService.USER_ROLE and UserDetailsService.ADMIN_ROLE
     *         authorities.
     * @throws AuthorityNotFoundException
     *                 If the user or admin roles are not already loaded into
     *                 the granted authority table in data store.
     * @throws UserCreationException
     *                 If the user cannot be created (duplicate user name, null
     *                 username or null password)
     */
    public User createAdministrator(ApplicationContext applicationContext,
            String firstname, String lastname, String password)
            throws AuthorityNotFoundException, DuplicateUsernameException {
        TeacherUserDetails userDetails = (TeacherUserDetails) applicationContext
                .getBean("teacherUserDetails");
        userDetails.setPassword(password);
        userDetails.setFirstname(firstname);
        userDetails.setLastname(lastname);
        userDetails.setCity(DEFAULT_CITY);
        userDetails.setCountry(DEFAULT_COUNTRY);
        userDetails.setCurriculumsubjects(DEFAULT_CURRICULUMSUBJECTS);
        userDetails.setState(DEFAULT_STATE);
        userDetails.setSchoollevel(DEFAULT_SCHOOLLEVEL);
        userDetails.setSchoolname(DEFAULT_SCHOOLNAME);
        userDetails.setSignupdate(DEFAULT_SIGNUPDATE);
        GrantedAuthority adminAuthority = this.userDetailsService
                .loadAuthorityByName(UserDetailsService.ADMIN_ROLE);
        GrantedAuthority teacherAuthority = this.userDetailsService
                .loadAuthorityByName(UserDetailsService.TEACHER_ROLE);
        userDetails.addAuthority(adminAuthority);
        userDetails.addAuthority(teacherAuthority);

        return this.userService.createUser(userDetails);
    }
    
    /**
     * Creates a PreviewUser that will be used in 'Instant Preview' page to allow 
     * any visitor to the site to preview projects without having to log in.
     * 
     * The PreviewUser is granted the same ROLES as a Teacher user
     * 
     * @param applicationContext
     *                The Spring application context that contains the beans.
     * @param firstname
     *                The firstname.
     * @param lastname
     *                The lastname.
     * @param password
     *                The password.
     * @return A User object with UserDetails set including username and
     *         password that were input and with roles
     *         UserDetailsService.USER_ROLE and UserDetailsService.ADMIN_ROLE
     *         authorities.
     * @throws AuthorityNotFoundException
     *                 If the user or admin roles are not already loaded into
     *                 the granted authority table in data store.
     * @throws UserCreationException
     *                 If the user cannot be created (duplicate user name, null
     *                 username or null password)
     */
    public User createPreviewUser(ApplicationContext applicationContext,
            String firstname, String lastname, String password)
            throws AuthorityNotFoundException, DuplicateUsernameException {
        TeacherUserDetails userDetails = (TeacherUserDetails) applicationContext
                .getBean("teacherUserDetails");
        userDetails.setPassword(password);
        userDetails.setFirstname(firstname);
        userDetails.setLastname(lastname);
        userDetails.setCity(DEFAULT_CITY);
        userDetails.setCountry(DEFAULT_COUNTRY);
        userDetails.setCurriculumsubjects(DEFAULT_CURRICULUMSUBJECTS);
        userDetails.setState(DEFAULT_STATE);
        userDetails.setSchoollevel(DEFAULT_SCHOOLLEVEL);
        userDetails.setSchoolname(DEFAULT_SCHOOLNAME);
        userDetails.setSignupdate(DEFAULT_SIGNUPDATE);
        GrantedAuthority teacherAuthority = this.userDetailsService
                .loadAuthorityByName(UserDetailsService.TEACHER_ROLE);
        userDetails.addAuthority(teacherAuthority);

        return this.userService.createUser(userDetails);
    }

    /**
     * Creates two default roles in the the data store authorities table. These
     * are UserDetailsService.USER_ROLE and UserDetailsService.ADMIN_ROLE
     * authorities. This method should be run before attempting to create users.
     * 
     * @param applicationContext
     *                The Spring application context that contains the beans.
     * @throws DuplicateAuthorityException
     *                 if authority to be created is not unique
     */
    public void createRoles(ApplicationContext applicationContext)
            throws DuplicateAuthorityException {
        createRole(applicationContext, UserDetailsService.USER_ROLE);
        createRole(applicationContext, UserDetailsService.ADMIN_ROLE);
        createRole(applicationContext, UserDetailsService.TEACHER_ROLE);
        createRole(applicationContext, UserDetailsService.STUDENT_ROLE);
        createRole(applicationContext, UserDetailsService.AUTHOR_ROLE);
        createRole(applicationContext, UserDetailsService.RESEARCHER_ROLE);
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
     *                the userService to set
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