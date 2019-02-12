/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
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
package org.wise.portal.presentation.validators.teacher.management;

import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;
import org.wise.portal.domain.teacher.management.RemoveStudentFromRunParameters;

/**
 * Validates <code>RemoveStudentFromRunParameters</code>
 *
 * @author Hiroki Terashima
 */
@Component
public class RemoveStudentFromRunParametersValidator implements Validator {

  @SuppressWarnings("unchecked")
  public boolean supports(Class clazz) {
    return RemoveStudentFromRunParameters.class.isAssignableFrom(clazz);
  }

  public void validate(Object paramsIn, Errors errors) {
    RemoveStudentFromRunParameters params = (RemoveStudentFromRunParameters) paramsIn;
    ValidationUtils.rejectIfEmptyOrWhitespace(errors, "runId", "error.no-runId");
    if (errors.getErrorCount() != 0) {
      return;
    }

    Long runId = params.getRunId();
    if (runId < 1) {
      errors.rejectValue("runId", "error.illegal-runId");
      return;
    }

    ValidationUtils.rejectIfEmptyOrWhitespace(errors, "userId", "error.userId-not-specified");
    if (errors.getErrorCount() != 0) {
      return;
    }

    Long userId = params.getUserId();
    if (userId < 1) {
      errors.rejectValue("userId", "error.illegal-userId");
      return;
    }
  }
}
