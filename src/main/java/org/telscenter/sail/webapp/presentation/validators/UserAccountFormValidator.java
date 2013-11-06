/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
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
package org.telscenter.sail.webapp.presentation.validators;

import org.apache.commons.lang.StringUtils;
import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;
import org.telscenter.sail.webapp.domain.authentication.MutableUserDetails;
import org.telscenter.sail.webapp.presentation.web.UserAccountForm;

/**
 * @author Hiroki Terashima
 * @author Patrick Lawler
 *
 * @version $Id$
 */
public class UserAccountFormValidator implements Validator {

	protected static final int MAX_PASSWORD_LENGTH = 20;

	/**
	 * @see org.springframework.validation.Validator#supports(java.lang.Class)
	 */
	public boolean supports(Class clazz) {
		return UserAccountForm.class.isAssignableFrom(clazz);
	}

	/**
	 * @see org.springframework.validation.Validator#validate(java.lang.Object, org.springframework.validation.Errors)
	 */
	public void validate(Object userAccountFormIn, Errors errors) {
		UserAccountForm userAccountForm = (UserAccountForm) userAccountFormIn;
		MutableUserDetails userDetails = userAccountForm.getUserDetails();
		
		if (userAccountForm.isNewAccount()) {
			ValidationUtils.rejectIfEmptyOrWhitespace(errors, "userDetails.password",
			"error.password-not-specified");
			
			if (errors.getFieldErrorCount("userDetails.password") > 0) {
				return;
			}

			if (userDetails.getPassword().length() > MAX_PASSWORD_LENGTH) {
				errors.rejectValue("userDetails.password", "error.password-too-long");
				return;
			}

			if (!StringUtils.isAlphanumeric(userDetails.getPassword())) {
				errors.rejectValue("userDetails.password", "presentation.validators.ChangePasswordParametersValidator.errorPasswordContainsIllegalCharacters");
				return;
			}
			
		    if (userDetails.getSignupdate() == null) {
		    	errors.rejectValue("userDetails.signupdate", "error.signupdate-not-specified");
		    	return;
		    }
		} else {
			ValidationUtils.rejectIfEmptyOrWhitespace(errors, "userDetails.username", 
			"error.username-not-specified");
			
	        if (!StringUtils.isAlphanumeric(userDetails.getUsername())) {
	            errors.rejectValue("userDetails.username", "error.username-illegal-characters");
	        }
		}
		
		ValidationUtils.rejectIfEmptyOrWhitespace(errors, "userDetails.firstname", 
		"error.firstname-not-specified");

		ValidationUtils.rejectIfEmptyOrWhitespace(errors, "userDetails.lastname", 
		"error.lastname-not-specified");
		
		if (!StringUtils.isAlphanumeric(userDetails.getFirstname()) ||
				!StringUtils.isAsciiPrintable(userDetails.getFirstname())) {
			errors.rejectValue("userDetails.firstname", "error.firstname-illegal-characters");
			return;
		}

		if (!StringUtils.isAlphanumeric(userDetails.getLastname()) ||
				!StringUtils.isAsciiPrintable(userDetails.getLastname())) {
			errors.rejectValue("userDetails.lastname", "error.lastname-illegal-characters");
			return;
		}
		
		if (errors.hasErrors())
			userDetails.setPassword("");
	}

}
