/**
 * Copyright (c) 2007-2017 Regents of the University of California (Regents).
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

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;
import org.wise.portal.domain.authentication.impl.BatchStudentChangePasswordParameters;
import org.wise.portal.domain.authentication.impl.ChangePasswordParameters;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.user.UserService;

/**
 * Validator for student's ChangePasswordParameters
 *
 * @author Patrick Lawler
 * @author Sally Ahn
 */
@Component
public class ChangePasswordParametersValidator implements Validator {

  protected static final int MAX_PASSWORD_LENGTH = 20;

  @Autowired
  private UserService userService;

  @SuppressWarnings("unchecked")
  public boolean supports(Class clazz) {
    return ChangePasswordParameters.class.isAssignableFrom(clazz) ||
        BatchStudentChangePasswordParameters.class.isAssignableFrom(clazz);
  }

  public void validate(Object paramsIn, Errors errors) {
    ChangePasswordParameters params = (ChangePasswordParameters) paramsIn;

    if (params.getUser() != null && !params.getUser().getUserDetails().isGoogleUser() ||
        params.getTeacherUser() != null && !params.getTeacherUser().getUserDetails().isGoogleUser()) {
      validatePasswd0(errors,params);
      if (errors.getErrorCount() != 0) {
        return;
      }
    }

    validatePasswd1(errors,params);
    if (errors.getErrorCount() != 0) {
      return;
    }

    validatePasswd2(errors,params);
    if (errors.getErrorCount() != 0) {
      return;
    }

    validatePasswordsMatch(errors, params.getPasswd1(), params.getPasswd2(), params);
  }

  /**
   * Validate the current password the user has entered
   * @param errors
   * @param params
   */
  private void validatePasswd0(Errors errors, ChangePasswordParameters params) {
    User userToCheckPasswordFor;

    if (params.getTeacherUser() != null) {
      /*
       * the teacher is changing the password for a student so we need
       * to check that the teacher has typed in their current password
       * correctly
       */
      userToCheckPasswordFor = params.getTeacherUser();
    } else {
      /*
       * the teacher or student is changing their own password so we need
       * to check if they typed in their current password correctly
       */
      userToCheckPasswordFor = params.getUser();
    }

    String currentPassword = params.getPasswd0();
    if (currentPassword != null) {
      if (!userService.isPasswordCorrect(userToCheckPasswordFor, currentPassword)) {
        errors.rejectValue("passwd0", "presentation.validators.ChangePasswordParametersValidator.errorIncorrectCurrentPassword");
      }
    } else {
      errors.rejectValue("passwd0", "presentation.validators.ChangePasswordParametersValidator.errorCurrentPasswordMissing");
    }
  }

  private void validatePasswd1(Errors errors, ChangePasswordParameters params) {
    ValidationUtils.rejectIfEmptyOrWhitespace(errors, "passwd1",
        "presentation.validators.ChangePasswordParametersValidator.errorNewPasswordMissing");

    if (errors.getErrorCount() != 0) {
      return;
    }
    validatePasswordAsciiPrintable(errors, params.getPasswd1());
  }

  private void validatePasswd2(Errors errors, ChangePasswordParameters params) {
    ValidationUtils.rejectIfEmptyOrWhitespace(errors, "passwd2",
        "presentation.validators.ChangePasswordParametersValidator.errorNewPasswordMissing");

    if (errors.getErrorCount() != 0) {
      return;
    }
    validatePasswordAsciiPrintable(errors, params.getPasswd2());
  }

  private void validatePasswordsMatch(Errors errors, String password1, String password2, ChangePasswordParameters params) {
    validatePasswordLength(errors, params);

    if (!password1.equals(password2)) {
      errors.rejectValue("passwd1", "presentation.validators.ChangePasswordParametersValidator.errorNewPasswordsDoNotMatch");
    }
  }

  private void validatePasswordAsciiPrintable(Errors errors, String passwd) {
    if (!StringUtils.isAsciiPrintable(passwd))
      errors.rejectValue("passwd1", "presentation.validators.ChangePasswordParametersValidator.errorPasswordContainsIllegalCharacters");

  }

  private void validatePasswordLength(Errors errors, ChangePasswordParameters params) {
    if (params.getPasswd1().length() > MAX_PASSWORD_LENGTH
        || params.getPasswd2().length() > MAX_PASSWORD_LENGTH) {
      errors.rejectValue("passwd1", "presentation.validators.ChangePasswordParametersValidator.errorPasswordTooLong");
    }
  }
}
