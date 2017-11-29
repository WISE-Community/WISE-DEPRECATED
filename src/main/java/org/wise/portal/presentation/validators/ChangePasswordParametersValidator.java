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
import org.springframework.security.authentication.dao.SystemWideSaltSource;
import org.springframework.security.authentication.encoding.Md5PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;
import org.wise.portal.domain.authentication.impl.BatchStudentChangePasswordParameters;
import org.wise.portal.domain.authentication.impl.ChangePasswordParameters;
import org.wise.portal.domain.user.User;

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
  private SystemWideSaltSource systemSaltSource;

  /**
   * @see Validator#supports(Class)
   */
  @SuppressWarnings("unchecked")
  public boolean supports(Class clazz) {
    return ChangePasswordParameters.class.isAssignableFrom(clazz)
        || BatchStudentChangePasswordParameters.class.isAssignableFrom(clazz);
  }

  /**
   * @see Validator#validate(Object, Errors)
   */
  public void validate(Object paramsIn, Errors errors) {
    ChangePasswordParameters params = (ChangePasswordParameters) paramsIn;

    validatePasswd0(errors,params);

    if (errors.getErrorCount() != 0) {
      return;
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
  public void validatePasswd0(Errors errors, ChangePasswordParameters params) {
    User userToCheckPasswordFor = null;

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

    //if the user is not an admin we need to make sure they typed in the current teacher password
    if (!userToCheckPasswordFor.isAdmin()) {
      Md5PasswordEncoder encoder = new Md5PasswordEncoder();
      String typedInCurrentPassword = params.getPasswd0();
      if (typedInCurrentPassword != null) {
        String hashedTypedInCurrentPassword = encoder.encodePassword(typedInCurrentPassword, systemSaltSource.getSystemWideSalt());
        String hashedActualCurrentPassword = userToCheckPasswordFor.getUserDetails().getPassword();
        if (hashedTypedInCurrentPassword != null && hashedActualCurrentPassword != null &&
          hashedTypedInCurrentPassword.equals(hashedActualCurrentPassword)) {
        } else {
          errors.rejectValue("passwd0", "presentation.validators.ChangePasswordParametersValidator.errorIncorrectCurrentPassword");
        }
      } else {
        errors.rejectValue("passwd0", "presentation.validators.ChangePasswordParametersValidator.errorCurrentPasswordMissing");
      }
    }
  }

  public void validatePasswd1(Errors errors, ChangePasswordParameters params) {
    ValidationUtils.rejectIfEmptyOrWhitespace(errors, "passwd1",
        "presentation.validators.ChangePasswordParametersValidator.errorNewPasswordMissing");

    if (errors.getErrorCount() != 0) {
      return;
    }
    this.validatePasswordAsciiPrintable(errors, params.getPasswd1());
  }

  public void validatePasswd2(Errors errors, ChangePasswordParameters params) {
    ValidationUtils.rejectIfEmptyOrWhitespace(errors, "passwd2",
        "presentation.validators.ChangePasswordParametersValidator.errorNewPasswordMissing");

    if (errors.getErrorCount() != 0) {
      return;
    }
    this.validatePasswordAsciiPrintable(errors, params.getPasswd2());
  }

  private void validatePasswordsMatch(Errors errors, String password1, String password2, ChangePasswordParameters params) {
    validatePasswordLength(errors, params);

    if (!password1.equals(password2)) {
      errors.rejectValue("passwd1", "presentation.validators.ChangePasswordParametersValidator.errorNewPasswordsDoNotMatch");
    }
  }

  public void validatePasswordAsciiPrintable(Errors errors, String passwd) {
    if (!StringUtils.isAsciiPrintable(passwd))
      errors.rejectValue("passwd1", "presentation.validators.ChangePasswordParametersValidator.errorPasswordContainsIllegalCharacters");

  }

  public void validatePasswordLength(Errors errors, ChangePasswordParameters params) {
    if (params.getPasswd1().length() > MAX_PASSWORD_LENGTH
        || params.getPasswd2().length() > MAX_PASSWORD_LENGTH) {
      errors.rejectValue("passwd1", "presentation.validators.ChangePasswordParametersValidator.errorPasswordTooLong");
    }
  }
}
