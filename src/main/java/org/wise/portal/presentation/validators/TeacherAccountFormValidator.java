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

import java.util.regex.Pattern;

import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.presentation.web.TeacherAccountForm;

/**
 * @author Hiroki Terashima
 * @author Patrick Lawler
 */
@Component
public class TeacherAccountFormValidator extends UserAccountFormValidator {
	
	private static final String EMAIL_REGEXP =
		"^[a-zA-Z0-9]+([_\\.-][a-zA-Z0-9]+)*@" +
			"([a-zA-Z0-9]+([\\.-][a-zA-Z0-9]+)*)+\\.[a-zA-Z]{2,}$";
	
	@SuppressWarnings("unchecked")
	@Override
	public boolean supports(Class clazz) {
		return TeacherAccountForm.class.isAssignableFrom(clazz);
	}

	@Override
	public void validate(Object userAccountFormIn, Errors errors) {
		super.validate(userAccountFormIn, errors);
		
        if (errors.hasErrors())
            return;
        TeacherAccountForm teacherAccountForm = (TeacherAccountForm) userAccountFormIn;
        TeacherUserDetails userDetails = (TeacherUserDetails) teacherAccountForm.getUserDetails();

        if (!teacherAccountForm.isNewAccount()) {
        	ValidationUtils.rejectIfEmptyOrWhitespace(errors, "userDetails.displayname", 
    		"error.displayname-not-specified");
        } else {
    		if (!errors.hasErrors() && (userDetails.getPassword() == null || userDetails.getPassword().length() < 1 ||
    				!userDetails.getPassword().equals(teacherAccountForm.getRepeatedPassword()))) {
    			errors.reject("error.passwords-mismatch",
    			"Passwords did not match or were not provided. Matching passwords are required.");
    		}
        }
        
        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "userDetails.emailAddress",
                "error.email-not-specified");

        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "userDetails.country",
                "error.country-not-specified");

        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "userDetails.schoolname",
                "error.schoolname-not-specified");

        //ValidationUtils.rejectIfEmptyOrWhitespace(errors, "userDetails.curriculumsubjects",
        //        "error.curriculumsubjects-not-specified");

        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "userDetails.schoollevel",
                "error.schoollevel-not-specified");
        
        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "userDetails.city", 
        		"error.city-not-specified");
        
        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "userDetails.state",
        		"error.state-not-specified");

        if (!teacherAccountForm.isLegalAcknowledged()) {
        	errors.reject("error.legal-not-acknowledged", "You must agree to the terms of use");
        }
        
        // TODO HT: CHECK FOR ILLEGAL EMAIL ADDRESS FORMAT
		String email = userDetails.getEmailAddress();
		
		//validate email if it is not null and not empty
		if (email != null && !email.trim().equals("")) {
			validateEmail(email, errors);
		}
		

        if (errors.hasErrors())
            userDetails.setPassword("");
	}
	
	/*
	 * Validates the email against the email regular expression
	 */
	private void validateEmail(String email, Errors errors) {
		if (email != null && !Pattern.matches(EMAIL_REGEXP, email)) {
			errors.rejectValue("userDetails.emailAddress", "error.email-invalid");
		}
	}
}
