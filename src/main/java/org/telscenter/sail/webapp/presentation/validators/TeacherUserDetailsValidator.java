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
package org.telscenter.sail.webapp.presentation.validators;

import java.util.regex.Pattern;

import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.telscenter.sail.webapp.domain.authentication.impl.TeacherUserDetails;

/**
 * @author Hiroki Terashima
 * @version $Id: TeacherUserDetailsValidator.java 353 2007-04-27 22:20:37Z
 *          hiroki $
 */
public class TeacherUserDetailsValidator extends UserDetailsValidator {
	
	private static final String EMAIL_REGEXP =
		"^[a-zA-Z0-9]+([_\\.-][a-zA-Z0-9]+)*@" +
			"([a-zA-Z0-9]+([\\.-][a-zA-Z0-9]+)*)+\\.[a-zA-Z]{2,}$";

    /**
     * @see org.springframework.validation.Validator#supports(java.lang.Class)
     */
    @SuppressWarnings("unchecked")
    @Override
    public boolean supports(Class clazz) {
        return TeacherUserDetails.class.isAssignableFrom(clazz);
    }

    /**
     * @see org.springframework.validation.Validator#validate(java.lang.Object,
     *      org.springframework.validation.Errors)
     */
    @Override
    public void validate(Object userDetailsIn, Errors errors) {
        super.validate(userDetailsIn, errors);

        if (errors.hasErrors())
            return;

        TeacherUserDetails userDetails = (TeacherUserDetails) userDetailsIn;

        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "emailAddress",
                "error.email-not-specified");

        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "country",
                "error.country-not-specified");

        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "schoolname",
                "error.schoolname-not-specified");

        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "curriculumsubjects",
                "error.curriculumsubjects-not-specified");

        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "schoollevel",
                "error.schoollevel-not-specified");

        
        // TODO HT: CHECK FOR ILLEGAL EMAIL ADDRESS FORMAT
		String email = userDetails.getEmailAddress();
		
		//validate email if it is not null and not empty
		if(email != null && !email.trim().equals("")) {
			validateEmail(email, errors);
		}
		

        if (errors.hasErrors())
            userDetails.setPassword("");
    }
    
	/*
	 * Validates the email against the email regular expression
	 */
	private void validateEmail(String email, Errors errors) {
		if(email != null && !Pattern.matches(EMAIL_REGEXP, email)) {
			errors.rejectValue("emailAddress", "error.email-invalid");
		}
	}
}
