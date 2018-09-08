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

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
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
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.workgroup.WorkgroupService;

/**
 * Validator for the TeamSignIn form
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

  @SuppressWarnings("unchecked")
  public boolean supports(Class clazz) {
    return TeamSignInForm.class.isAssignableFrom(clazz);
  }

  public void validate(Object teamSignInFormIn, Errors errors) {
    TeamSignInForm teamSignInForm = (TeamSignInForm) teamSignInFormIn;

    ValidationUtils.rejectIfEmptyOrWhitespace(errors, "username1",
        "error.teamsignin-username-not-specified");

    if (errors.hasErrors()) {
      return;
    }

    User signedInUser = userService.retrieveUserByUsername(teamSignInForm.getUsername1());
    if (signedInUser == null) {
      errors.rejectValue("username1", "error.teamsignin-user-does-not-exist");
      return;
    }

    Run run = null;
    try {
      run = runService.retrieveById(teamSignInForm.getRunId());
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    }

    List<Workgroup> workgroups = workgroupService.getWorkgroupListByRunAndUser(run, signedInUser);
    Workgroup workgroup = null;
    Set<User> membersInWorkgroup = new HashSet<User>();
    if (workgroups != null && workgroups.size() > 0) {
      workgroup = workgroups.get(0);
      membersInWorkgroup = workgroups.get(0).getMembers();
    }

    for (int x = 1; x < 10; x++) {
      int userIndex = x + 1;
      String usernameField = "username" + userIndex;
      String passwordField = "password" + userIndex;
      String absentField = "absent" + userIndex;
      String username = teamSignInForm.getUsernameByString(usernameField);
      String password = teamSignInForm.getPasswordByString(passwordField);
      boolean isAbsent = teamSignInForm.getIsAbsentByString(absentField);

      if (!StringUtils.isEmpty(username)) {
        if (!isAbsent) {
          User user = userService.retrieveUserByUsername(username);
          if (user == null) {
            errors.rejectValue(usernameField, "error.teamsignin-user-does-not-exist");
          } else {
            MutableUserDetails userDetails = user.getUserDetails();
            if (userDetails instanceof TeacherUserDetails) {
              errors.rejectValue(usernameField, "error.teamsignin-teacher-username-specified");
            } else {
              /*
               * flag to determine if we need to check the password. we do not need to
               * check the password if the user is not allowed to join the workgroup because
               * we will display an error message anyway.
               */
              boolean needToCheckPassword = true;

              if (workgroup == null) {
                if (workgroupService.isUserInAnyWorkgroupForRun(user, run)) {
                  errors.rejectValue(passwordField, "error.teamsignin-user-already-in-another-workgroup");
                  needToCheckPassword = false;
                }
              } else {
                if (workgroupService.isUserInWorkgroupForRun(user, run, workgroup)) {
                } else if (workgroupService.isUserInAnotherWorkgroupForRun(user, run, workgroup)) {
                  errors.rejectValue(passwordField, "error.teamsignin-user-already-in-another-workgroup");
                  needToCheckPassword = false;
                } else {
                }
              }

              if (needToCheckPassword) {
                if (StringUtils.isEmpty(password)) {
                  errors.rejectValue(passwordField, "error.teamsignin-password-not-specified");
                } else if (!userService.isPasswordCorrect(user, password)) {
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
