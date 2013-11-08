package org.telscenter.sail.webapp.presentation.validators;

import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;
import org.telscenter.sail.webapp.domain.impl.ReminderParameters;

public class SearchForStudentUserNameValidator implements Validator {

	   @SuppressWarnings("unchecked")
	    public boolean supports(Class clazz) {
	        return ReminderParameters.class.isAssignableFrom(clazz);
	    }

	    public void validate(Object reminderParameters, Errors errors) {
	    	//make sure first name field is not empty
	    	ValidationUtils.rejectIfEmptyOrWhitespace(errors, "firstName","error.firstname-not-specified");
	    	
	    	//make sure last name field is not empty
	    	ValidationUtils.rejectIfEmptyOrWhitespace(errors, "lastName","error.lastname-not-specified");
	    }

}
