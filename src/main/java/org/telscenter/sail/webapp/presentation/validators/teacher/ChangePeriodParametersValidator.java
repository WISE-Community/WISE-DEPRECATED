/**
 * Copyright (c) 2007 Regents of the University of California (Regents). Created
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
package org.telscenter.sail.webapp.presentation.validators.teacher;

import org.springframework.validation.Errors;
import org.springframework.validation.Validator;
import org.springframework.validation.ValidationUtils;
import org.telscenter.sail.webapp.domain.impl.ChangePeriodParameters;

/**
 * @author patrick lawler
 */
public class ChangePeriodParametersValidator implements Validator{

	public boolean supports(Class clazz){
		return ChangePeriodParameters.class.isAssignableFrom(clazz);
	}
		
	public void validate(Object params, Errors errors){
		
		ValidationUtils.rejectIfEmptyOrWhitespace(errors, "run", "error.changeperiod.run");
		
		if (errors.getErrorCount() != 0) {
			return;
		}
		
		ValidationUtils.rejectIfEmptyOrWhitespace(errors, "student", "error.changeperiod.student");
		
		if (errors.getErrorCount() != 0) {
			return;
		}
		
		ValidationUtils.rejectIfEmptyOrWhitespace(errors, "projectcode", "error.changeperiod.projectcode");
		
		if (errors.getErrorCount() != 0) {
			return;
		}
		
		ValidationUtils.rejectIfEmptyOrWhitespace(errors, "projectcodeTo", "error.changeperiod.projectcode-To");
		
	}
}
