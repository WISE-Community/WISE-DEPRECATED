/**
 * Copyright (c) 2007 Encore Research Group, University of Toronto
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package net.sf.sail.webapp.presentation.validators;

import net.sf.sail.webapp.domain.impl.AdminOfferingParameters;

import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;

/**
 * The validator for the adminOfferings page.
 * 
 * @author Laurel Williams
 * 
 * @version $Id$
 * 
 */
public class AdminOfferingValidator implements Validator {

    /**
     * @see org.springframework.validation.Validator#supports(java.lang.Class)
     */
    @SuppressWarnings("unchecked")
    public boolean supports(Class clazz) {
        return AdminOfferingParameters.class.isAssignableFrom(clazz);
    }

	/**
	 * @see org.springframework.validation.Validator#validate(java.lang.Object, org.springframework.validation.Errors)
	 */
	public void validate(Object adminOfferingParametersIn, Errors errors) {
		AdminOfferingParameters adminOfferingParameters = (AdminOfferingParameters) adminOfferingParametersIn;
		ValidationUtils.rejectIfEmptyOrWhitespace(errors, "offeringId", "error.groupname.not-specified");
		if (errors.getFieldErrorCount("offeringId") > 0) {
			return;
		}
		if (adminOfferingParameters.getOfferingId() < 0) {
			errors.rejectValue("offeringId", "error.groupparent.must-be-non-negative");
		}
	}

}