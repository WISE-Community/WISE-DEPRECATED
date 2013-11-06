package org.telscenter.sail.webapp.presentation.validators;

import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;
import org.telscenter.sail.webapp.domain.impl.ReminderParameters;
/**
 * 
 * 
 * @author aperritano
 */
public class LostPasswordStudentProjectCodeValidator implements Validator {

	
	   @SuppressWarnings("unchecked")
	    public boolean supports(Class clazz) {
	        return ReminderParameters.class.isAssignableFrom(clazz);
	    }

	    public void validate(Object reminderParameters, Errors errors) {
			ValidationUtils.rejectIfEmptyOrWhitespace(errors, "projectCode","error.no-projectcode");
	    }
	    
}
