package org.wise.portal.presentation.validators;

import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;
import org.wise.portal.domain.impl.PasswordReminderParameters;

@Component
public class SearchForStudentUserNameValidator implements Validator {

	   @SuppressWarnings("unchecked")
	    public boolean supports(Class clazz) {
	        return PasswordReminderParameters.class.isAssignableFrom(clazz);
	    }

	    public void validate(Object passwordReminderParameters, Errors errors) {
	    	//make sure first name field is not empty
	    	ValidationUtils.rejectIfEmptyOrWhitespace(errors, "firstName","error.firstname-not-specified");
	    	
	    	//make sure last name field is not empty
	    	ValidationUtils.rejectIfEmptyOrWhitespace(errors, "lastName","error.lastname-not-specified");
	    }

}
