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
package org.wise.portal.presentation.validators;

import java.util.Set;




import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.project.impl.Projectcode;
import org.wise.portal.domain.run.Run;
import org.wise.portal.presentation.web.StudentAccountForm;
import org.wise.portal.service.run.RunService;

/**
 * @author Patrick Lawler
 */
@Component
public class StudentAccountFormValidator extends UserAccountFormValidator {

  @Autowired
  private RunService runService;

  @SuppressWarnings("unchecked")
  @Override
  public boolean supports(Class clazz) {
    return StudentAccountForm.class.isAssignableFrom(clazz);
  }

  @Override
  public void validate(Object userAccountFormIn, Errors errors) {
    super.validate(userAccountFormIn, errors);

    if (errors.hasErrors())
      return;

    StudentAccountForm studentAccountForm = (StudentAccountForm) userAccountFormIn;
    StudentUserDetails userDetails = (StudentUserDetails) studentAccountForm.getUserDetails();

    if (studentAccountForm.isNewAccount()) {
      if (userDetails.getPassword() == null || userDetails.getPassword().length() < 1 ||
        !userDetails.getPassword().equals(studentAccountForm.getRepeatedPassword())) {
        errors.reject("error.passwords-mismatch",
          "Passwords did not match or were not provided. Matching passwords are required.");
      }

      String projectCode = studentAccountForm.getProjectCode();
      if (projectCode == null || projectCode.length() < 1) {
        errors.reject("error.projectcode-empty",
          "Project Code must be specified. Get this from your teacher.");
        return;
      } else {
        Projectcode projectcode = new Projectcode(projectCode);
        if (!projectcode.isLegalProjectcode()) {
          errors.reject("error.projectcode-invalid",
            "Project Code is invalid. Get this from your teacher.");
          return;
        }
        String runcode = projectcode.getRuncode();
        String periodName = projectcode.getRunPeriod();
        Run run = null;
        try {
          run = runService.retrieveRunByRuncode(runcode);
        } catch (ObjectNotFoundException e) {
          errors.reject("error.projectcode-not-in-db",
            "Project Code is invalid. Get this from your teacher.");
          return;
        }
        if (run == null) {
          errors.reject("error.projectcode-not-in-db",
            "Project Code is invalid. Get this from your teacher.");
          return;
        } else {
          boolean periodExists = false;
          Set<Group> periods = run.getPeriods();
          for (Group period : periods) {
            if (periodName.equals(period.getName())) {
              periodExists = true;
            }
          }
          if (!periodExists) {
            errors.reject("error.projectcode-not-in-db",
              "Project Code is invalid. Get this from your teacher.");
            return;
          }
        }
      }
    } else {
      // if this is not a new account form (student is updating account info), we don't need to check any more.
      return;
    }

    ValidationUtils.rejectIfEmptyOrWhitespace(errors, "userDetails.gender",
      "error.gender-not-specified");

    ValidationUtils.rejectIfEmptyOrWhitespace(errors, "userDetails.accountQuestion",
      "error.no-accountquestion");

    ValidationUtils.rejectIfEmptyOrWhitespace(errors, "userDetails.accountAnswer",
      "error.no-accountanswer");


    ValidationUtils.rejectIfEmptyOrWhitespace(errors, "projectCode",
      "error.no-projectcode");

    if (errors.hasErrors())
      userDetails.setPassword("");
  }
}
