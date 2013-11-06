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
package org.telscenter.sail.webapp.presentation.validators.general.contactwise;

import java.util.regex.Pattern;

import net.sf.sail.webapp.domain.User;

import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;
import org.telscenter.sail.webapp.domain.authentication.MutableUserDetails;
import org.telscenter.sail.webapp.domain.authentication.impl.StudentUserDetails;
import org.telscenter.sail.webapp.domain.authentication.impl.TeacherUserDetails;
import org.telscenter.sail.webapp.domain.general.contactwise.ContactWISE;
import org.telscenter.sail.webapp.domain.general.contactwise.impl.ContactWISEGeneral;
import org.telscenter.sail.webapp.domain.general.contactwise.impl.ContactWISEProject;

/**
 * Validator for TELS Contact WISE page
 * 
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 *
 * @version $Id$
 */
public class ContactWISEValidator implements Validator {

	private static final String EMAIL_REGEXP =
		"^[a-zA-Z0-9]+([_\\.-][a-zA-Z0-9]+)*@" +
			"([a-zA-Z0-9]+([\\.-][a-zA-Z0-9]+)*)+\\.[a-zA-Z]{2,}$";
	/**
	 * @see org.springframework.validation.Validator#supports(java.lang.Class)
	 */
	@SuppressWarnings("unchecked")
	public boolean supports(Class clazz) {		
		return ContactWISE.class.isAssignableFrom(clazz);
	}

	/**
	 * @see org.springframework.validation.Validator#validate(java.lang.Object, org.springframework.validation.Errors)
	 */
	public void validate(Object contactWISEIn, Errors errors) {
		ContactWISE contactWISE = (ContactWISE) contactWISEIn;
		
		/* NOTE: this check may be removed later if we never allow students to 
		   submit feedback */
		Boolean isStudent = contactWISE.getIsStudent();
		
		ValidationUtils.rejectIfEmptyOrWhitespace(errors, "name",
				"error.contactwise-name");
		
		//email is not required for students
		if(!isStudent) {
			ValidationUtils.rejectIfEmptyOrWhitespace(errors, "email",
				"error.contactwise-email-empty");	
		}
		
		if(contactWISE instanceof ContactWISEProject) {
			ValidationUtils.rejectIfEmptyOrWhitespace(errors, "projectName",
			"error.contactwise-project-empty");
		}
		
		ValidationUtils.rejectIfEmptyOrWhitespace(errors, "summary",
				"error.contactwise-summary");
		
		ValidationUtils.rejectIfEmptyOrWhitespace(errors, "description",
				"error.contactwise-description");
		
		String email = ((ContactWISE)contactWISEIn).getEmail();
		
		/* validate email if user is not a student and email is not null and 
		   not empty */
		if(!isStudent && email != null && !email.trim().equals("")) {
			validateEmail(email, errors);
		}
	}

	/*
	 * Validates the email against the email regular expression
	 */
	private void validateEmail(String email, Errors errors) {
		if(email != null && !Pattern.matches(EMAIL_REGEXP, email)) {
			errors.rejectValue("email", "error.email-invalid");
		}
	}
}
