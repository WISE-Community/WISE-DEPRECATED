package org.wise.portal.presentation.validators;

import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;
import org.wise.portal.domain.impl.PasswordReminderParameters;
/**
 * 
 * 
 * @author aperritano
 */
public class LostPasswordStudentProjectCodeValidator implements Validator {

	
	   @SuppressWarnings("unchecked")
	    public boolean supports(Class clazz) {
	        return PasswordReminderParameters.class.isAssignableFrom(clazz);
	    }

	    public void validate(Object passwordReminderParameters, Errors errors) {
			ValidationUtils.rejectIfEmptyOrWhitespace(errors, "projectCode","error.no-projectcode");
	    }
	    
}
