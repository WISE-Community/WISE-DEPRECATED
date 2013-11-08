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
package net.sf.sail.webapp.presentation.validators;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.ChangePasswordParameters;

import org.apache.commons.lang.StringUtils;
import org.springframework.security.authentication.dao.SystemWideSaltSource;
import org.springframework.security.authentication.encoding.Md5PasswordEncoder;
import org.springframework.security.authentication.encoding.PasswordEncoder;
import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;
import org.telscenter.sail.webapp.domain.impl.BatchStudentChangePasswordParameters;
import org.telscenter.sail.webapp.domain.impl.Passwords;

/**
 * Validator for student's ChangePasswordParameters
 * 
 * @author Patrick Lawler
 * @author Sally Ahn 
 * @version $Id:$
 */
public class ChangePasswordParametersValidator implements Validator {

	protected static final int MAX_PASSWORD_LENGTH = 20;
	private SystemWideSaltSource systemSaltSource;

	/**
	 * @see org.springframework.validation.Validator#supports(java.lang.Class)
	 */
	@SuppressWarnings("unchecked")
	public boolean supports(Class clazz) {
		return ChangePasswordParameters.class.isAssignableFrom(clazz)
				|| BatchStudentChangePasswordParameters.class
						.isAssignableFrom(clazz);
	}

	/**
	 * @see org.springframework.validation.Validator#validate(java.lang.Object,
	 *      org.springframework.validation.Errors)
	 */
	public void validate(Object paramsIn, Errors errors) {
		ChangePasswordParameters params = (ChangePasswordParameters) paramsIn;

		validatePasswd0(errors,params);
		
		if( errors.getErrorCount() != 0 )
			return;
		
		validatePasswd1(errors,params);
		
		if( errors.getErrorCount() != 0 )
			return;
		
		validatePasswd2(errors,params);
		
		if( errors.getErrorCount() != 0 )
			return;
		
		
		Passwords passwords = new Passwords(params.getPasswd1(), params.getPasswd2());
		validatePasswordsMatch(errors, passwords, params);
	}
	
	/**
	 * Validate the current password the user has entered
	 * @param errors
	 * @param params
	 */
	public void validatePasswd0(Errors errors, ChangePasswordParameters params) {
		User userToCheckPasswordFor = null;
		
		if(params.getTeacherUser() != null) {
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
		if(!userToCheckPasswordFor.isAdmin()) {
			//the user is not an admin
			
			PasswordEncoder encoder = new Md5PasswordEncoder();
			
			//get the typed in current password the user has entered
			String typedInCurrentPassword = params.getPasswd0();
			
			if(typedInCurrentPassword != null) {
				//get the hashed typed in current password
				String hashedTypedInCurrentPassword = encoder.encodePassword(typedInCurrentPassword, systemSaltSource.getSystemWideSalt());
				
				//get the hashed actual current password
				String hashedActualCurrentPassword = userToCheckPasswordFor.getUserDetails().getPassword();
				
				if(hashedTypedInCurrentPassword != null && hashedActualCurrentPassword != null &&
						hashedTypedInCurrentPassword.equals(hashedActualCurrentPassword)) {
					//the user has typed in the correct current password
				} else {
					//the user has not typed in the correct current password
					errors.rejectValue("passwd0", "presentation.validators.ChangePasswordParametersValidator.errorIncorrectCurrentPassword");
				}
			} else {
				//typed in current password is null
				errors.rejectValue("passwd0", "presentation.validators.ChangePasswordParametersValidator.errorCurrentPasswordMissing");
			}
		}
	}

	public void validatePasswd1(Errors errors, ChangePasswordParameters params) {
		ValidationUtils.rejectIfEmptyOrWhitespace(errors, "passwd1",
		"presentation.validators.ChangePasswordParametersValidator.errorNewPasswordMissing");
		
		if( errors.getErrorCount() != 0 )
			return;
		this.validatePasswordAlphaNumeric(errors, params.getPasswd1());
	}
	
	public void validatePasswd2(Errors errors, ChangePasswordParameters params) {
		ValidationUtils.rejectIfEmptyOrWhitespace(errors, "passwd2",
		"presentation.validators.ChangePasswordParametersValidator.errorNewPasswordMissing");
		
		if( errors.getErrorCount() != 0 )
			return;
		
		this.validatePasswordAlphaNumeric(errors, params.getPasswd2());
	}

	private void validatePasswordsMatch(Errors errors, Passwords passwords, ChangePasswordParameters params) {
		
		//lengths match
		validatePasswordLength(errors, params);
		
		if (!passwords.match()) {
			errors.rejectValue("passwd1", "presentation.validators.ChangePasswordParametersValidator.errorNewPasswordsDoNotMatch");
		}
	}

	public void validatePasswordAlphaNumeric(Errors errors,
			String passwd) {
		if (!StringUtils.isAlphanumeric(passwd))
			errors.rejectValue("passwd1", "presentation.validators.ChangePasswordParametersValidator.errorPasswordContainsIllegalCharacters");
		
	}

	public void validatePasswordLength(Errors errors,
			ChangePasswordParameters params) {
		if (params.getPasswd1().length() > MAX_PASSWORD_LENGTH
				|| params.getPasswd2().length() > MAX_PASSWORD_LENGTH) {
			errors.rejectValue("passwd1", "presentation.validators.ChangePasswordParametersValidator.errorPasswordTooLong");
		}
	}

	
	public String getInputFieldValidationMessage(String formInputId, String formInputValue) {
		return "this is a message error";
	}
	
	public boolean test(String str) {
		return true;
	}
	/**
	 * Get the validation message for an individual input field of a model
	 * object.
	 * 
	 * @param modelObject
	 *            The object to validate against.
	 * @param formInputId
	 *            The id attribute of the form input field.
	 * @param formInputValue
	 *            The input value to be validated.
	 * @return The validation message.
	 */
//	public String getInputFieldValidationMessage(String formInputId,
//			String formInputValue) {
//
//		String validationMessage = "";
//
//		try {
//			Object formBackingObject = new ChangePasswordParameters();
//			Errors errors = new BindException(formBackingObject, "command");
//
//			formInputId = formInputId.split("\\.")[1]; // Ignore the preceding
//			// "command." portion of
//			// the id
//			String capitalizedFormInputId = StringUtils.capitalize(formInputId);
//
//			// Invoke the set[formInputId] method on the Account instance
//			String accountMethodName = "set" + capitalizedFormInputId;
//			Class setterArgs[] = new Class[] { String.class };
//			Method accountMethod = formBackingObject.getClass().getMethod(
//					accountMethodName, setterArgs);
//			accountMethod.invoke(formBackingObject,
//					new Object[] { formInputValue });
//
//			// Invoke the validate[formInputId] method of the AccountValidator
//			// instance
//			String validationMethodName = "validate" + capitalizedFormInputId;
//			Class validationArgs[] = new Class[] { String.class, Errors.class };
//			Method validationMethod = getClass().getMethod(
//					validationMethodName, validationArgs);
//			validationMethod.invoke(this,
//					new Object[] { formInputValue, errors });
//
//			validationMessage = getValidationMessage(errors, formInputId);
//		} catch (Exception e) {
//			// Handle appropriately for your application
//			System.out.println("New code exception: " + e);
//		}
//
//		return validationMessage;
//	}
//
//	/**
//	 * Get the FieldError validation message from the underlying MessageSource
//	 * for the given fieldName.
//	 * 
//	 * @param errors
//	 *            The validation errors.
//	 * @param fieldName
//	 *            The fieldName to retrieve the error message from.
//	 * @return The validation message or an empty String.
//	 */
//	protected String getValidationMessage(Errors errors, String fieldName) {
//		String message = "";
//
//		FieldError fieldError = errors.getFieldError(fieldName);
//
//		if (fieldError != null) {
//			message = messageSource.getMessage(fieldError.getCode(), null,
//					"This field is invalid", Locale.ENGLISH);
//		}
//
//		return message;
//	}

	public SystemWideSaltSource getSystemSaltSource() {
		return systemSaltSource;
	}

	public void setSystemSaltSource(SystemWideSaltSource systemSaltSource) {
		this.systemSaltSource = systemSaltSource;
	}
}
