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

import net.sf.sail.webapp.domain.authentication.MutableUserDetails;

import org.apache.commons.lang.StringUtils;
import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;

/**
 * The validator for the signup page.
 * 
 * @author Laurel Williams
 * 
 * @version $Id$
 */
public class UserDetailsValidator implements Validator {

    public static final int MAX_USERNAME_LENGTH = 50;

    @SuppressWarnings("unchecked")
    public boolean supports(Class clazz) {
        return MutableUserDetails.class.isAssignableFrom(clazz);
    }

    public void validate(Object userDetailsIn, Errors errors) {
        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "password",
                "error.password.not-specified");
        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "username",
                "error.username.not-specified");
        if (errors.getFieldErrorCount("username") > 0) {
            return;
        }
        MutableUserDetails userDetails = (MutableUserDetails) userDetailsIn;
        if (!StringUtils.isAlphanumeric(userDetails.getUsername())) {
            errors.rejectValue("username", "error.username.illegal-characters");
        }
        if (userDetails.getUsername().length() > MAX_USERNAME_LENGTH) {
            errors.rejectValue("username", "error.username.too-long");
        }
        if (errors.hasErrors())
            userDetails.setPassword("");
    }
}