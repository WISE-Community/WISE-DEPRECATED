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

import net.sf.sail.webapp.domain.impl.OfferingParameters;

import org.apache.commons.lang.StringUtils;
import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;

/**
 * The validator for offering parameter objects e.g. when creating new offerings
 * 
 * @author Hiroki Terashima
 * @version $Id: OfferingParametersValidator.java 552 2007-06-28 01:11:36Z
 *          hiroki $
 */
public class OfferingParametersValidator implements Validator {

    protected static final int MAX_OFFERINGNAME_LENGTH = 50;

    @SuppressWarnings("unchecked")
    public boolean supports(Class clazz) {
        return OfferingParameters.class.isAssignableFrom(clazz);
    }

    public void validate(Object offeringParametersIn, Errors errors) {

        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "name",
                "error.offeringname-not-specified");

        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "curnitId",
                "error.offeringcurnitid-not-specified");

        if (errors.hasErrors()) {
            return;
        }

        OfferingParameters offeringParameters = (OfferingParameters) offeringParametersIn;

        if (!StringUtils.isAlphanumericSpace(offeringParameters.getName())) {
            errors.rejectValue("name", "error.offeringname-illegal-characters");
            return;
        }

        if (offeringParameters.getName().length() > MAX_OFFERINGNAME_LENGTH) {
            errors.rejectValue("name", "error.offeringname-too-long");
            return;
        }

        if (offeringParameters.getCurnitId() < 1) {
            errors.rejectValue("curnitId", "error.offeringcurnitid-too-small");
            return;
        }
    }

}
