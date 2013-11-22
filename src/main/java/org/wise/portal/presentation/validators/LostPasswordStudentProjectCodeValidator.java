package org.wise.portal.presentation.validators;

import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;
import org.wise.portal.domain.impl.ReminderParameters;
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
