/**
 * Copyright (c) 2007-2015 Regents of the University of California (Regents).
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
package org.wise.portal.presentation.validators.student;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.dao.SystemWideSaltSource;
import org.springframework.security.authentication.encoding.Md5PasswordEncoder;
import org.springframework.security.authentication.encoding.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.TeamSignInForm;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.workgroup.WorkgroupService;

/**
 * Validator for the TeamSignIn form
 *
 * @author Hiroki Terashima
 */
@Component
public class TeamSignInFormValidator implements Validator {

    @Autowired
    private RunService runService;
    
	@Autowired
	private UserService userService;
	
   @Autowired
    private WorkgroupService workgroupService;
	
	@Autowired
	private SystemWideSaltSource systemSaltSource;
	
	/**
	 * @see org.springframework.validation.Validator#supports(java.lang.Class)
	 */
	@SuppressWarnings("unchecked")
	public boolean supports(Class clazz) {
		return TeamSignInForm.class.isAssignableFrom(clazz);
	}

	/**
	 * @see org.springframework.validation.Validator#validate(java.lang.Object, org.springframework.validation.Errors)
	 */
	public void validate(Object teamSignInFormIn, Errors errors) {
		TeamSignInForm teamSignInForm = (TeamSignInForm) teamSignInFormIn;
		PasswordEncoder encoder = new Md5PasswordEncoder();
		
		ValidationUtils.rejectIfEmptyOrWhitespace(errors, "username1", 
				"error.teamsignin-username-not-specified");

		if (errors.hasErrors()) {
			return;
		}

		// get the signed in user
		User signedInUser = userService.retrieveUserByUsername(teamSignInForm.getUsername1());
		if (signedInUser == null) {
			errors.rejectValue("username1", "error.teamsignin-user-does-not-exist");
			return;
		}
		
		Run run = null;
		
		try {
		    // get the run
            run = runService.retrieveById(teamSignInForm.getRunId());
        } catch (ObjectNotFoundException e) {
            e.printStackTrace();
        }
		
		// get the workgroups the signed in user is in for this run
		List<Workgroup> workgroups = workgroupService.getWorkgroupListByOfferingAndUser(run, signedInUser);

		Workgroup workgroup = null;

		// get the members in the workgroup
		Set<User> membersInWorkgroup = new HashSet<User>();

		if (workgroups != null && workgroups.size() > 0) {

		    // get the workgroup the signed in user is in
		    workgroup = workgroups.get(0);

		    // get the members in the workgroup
		    membersInWorkgroup = workgroups.get(0).getMembers();
		}

		// loop through all the users that are not signed in (2 through 10)
		for (int x = 1; x < 10; x++) {
		    int userIndex = x + 1;
		    String usernameField = "username" + userIndex;
		    String passwordField = "password" + userIndex;
		    String absentField = "absent" + userIndex;

		    // get the username, password, and whether the user is absent
		    String username = teamSignInForm.getUsernameByString(usernameField);
		    String password = teamSignInForm.getPasswordByString(passwordField);
		    boolean isAbsent = teamSignInForm.getIsAbsentByString(absentField);

		    if (!StringUtils.isEmpty(username)) {
		        /*
		         * the username field is not empty so we need to check if this user
		         * is allowed to join the workgroup
		         */

		        if (!isAbsent) {
		            // the user is not marked as absent
		            
		            // get the user
                    User user = userService.retrieveUserByUsername(username);
                    
                    if (user == null) {
                        //the username does not exist
                        errors.rejectValue(usernameField, "error.teamsignin-user-does-not-exist");
                    } else {

                        //get the user details
                        MutableUserDetails userDetails = user.getUserDetails();

                        if (userDetails instanceof TeacherUserDetails) {
                            //username is for a teacher and that is not allowed
                            errors.rejectValue(usernameField, "error.teamsignin-teacher-username-specified");
                        } else {
                            
                            /*
                             * flag to determine if we need to check the password. we do not need to
                             * check the password if the user is not allowed to join the workgroup because
                             * we will display an error message anyway.
                             */
                            boolean needToCheckPassword = true;
                            
                            if (workgroup == null) {
                                // the workgroup has not been created

                                // check if the user is already in a workgroup
                                if (workgroupService.isUserInAnyWorkgroupForRun(user, run)) {
                                    // the user is already in another workgroup in the run so we will display an error message
                                    errors.rejectValue(passwordField, "error.teamsignin-user-already-in-another-workgroup");
                                    needToCheckPassword = false;
                                }
                            } else {
                                // the workgroup has already been created

                                // check if the user is in the workgroup and not in another workgroup

                                if (workgroupService.isUserInWorkgroupForRun(user, run, workgroup)) {
                                    // the user is in the workgroup
                                } else if (workgroupService.isUserInAnotherWorkgroupForRun(user, run, workgroup)) {
                                    // the user is already in another workgroup in the run so we will display an error message
                                    errors.rejectValue(passwordField, "error.teamsignin-user-already-in-another-workgroup");
                                    needToCheckPassword = false;
                                } else {
                                    // the user is not in a workgroup for the run
                                }
                            }
                            
                            if (needToCheckPassword) {
                                // the user is allowed to join the workgroup so we will now check the password
                                
                                // get the hashed password
                                String hashedPassword = encoder.encodePassword(password, systemSaltSource.getSystemWideSalt());
                                
                                if (StringUtils.isEmpty(password)) {
                                    //the password field is empty
                                    errors.rejectValue(passwordField, "error.teamsignin-password-not-specified");
                                } else if (!user.getUserDetails().getPassword().equals(hashedPassword)) {
                                    //password is incorrect
                                    errors.rejectValue(passwordField, "error.teamsignin-incorrect-password");
                                }
                            }
                        }
                    }
		        }
		    }
		}
	}
}
