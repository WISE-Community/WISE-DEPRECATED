/**
 * Copyright (c) 2006 Encore Research Group, University of Toronto
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

import net.sf.sail.webapp.domain.group.impl.GroupParameters;

import org.apache.commons.lang.StringUtils;
import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;

/**
 * The validator for the addgroup page.
 * 
 * @author Laurel Williams
 * 
 * @version $Id$
 * 
 * A validator for the add groups page.
 */
public class GroupParametersValidator implements Validator {

    public static final int MAX_GROUP_NAME_LENGTH = 50;

    /**
     * @see org.springframework.validation.Validator#supports(java.lang.Class)
     */
    @SuppressWarnings("unchecked")
    public boolean supports(Class clazz) {
        return GroupParameters.class.isAssignableFrom(clazz);
    }

	/**
	 * @see org.springframework.validation.Validator#validate(java.lang.Object, org.springframework.validation.Errors)
	 */
	public void validate(Object groupParametersIn, Errors errors) {
		ValidationUtils.rejectIfEmptyOrWhitespace(errors, "name",
				"error.groupname.not-specified");
		if (errors.getFieldErrorCount("name") > 0) {
			return;
		}
		GroupParameters groupParameters = (GroupParameters) groupParametersIn;
		if (!StringUtils.isAlphanumeric(groupParameters.getName())) {
			errors.rejectValue("name", "error.groupname.illegal-characters");
		}
		if (groupParameters.getName().length() > MAX_GROUP_NAME_LENGTH) {
			errors.rejectValue("name", "error.groupname.too-long");
		}
		if (groupParameters.getParentId() < 0) {
			errors.rejectValue("parentId", "error.groupparent.must-be-non-negative");
		}
	}

}