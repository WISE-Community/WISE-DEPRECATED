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

import junit.framework.TestCase;
import net.sf.sail.webapp.domain.impl.AdminOfferingParameters;

import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

/**
 * @author Laurel Williams
 * 
 * @version $Id$
 */
public class AdminOfferingValidatorTest extends TestCase {

	private AdminOfferingParameters adminParameters;
    private Validator adminParametersValidator;
    private Errors errors;

	protected void setUp() throws Exception {
		super.setUp();
		adminParameters = new AdminOfferingParameters();
		errors = new BeanPropertyBindingResult(adminParameters, "");
		adminParametersValidator = new AdminOfferingValidator();
	}

	public void testOfferingIdNullValidate() {
		adminParametersValidator.validate(adminParameters, errors);
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("offeringId"));
	}
		
	public void testOfferingIdNegative() {
		adminParameters.setOfferingId(new Long(-3));
		adminParametersValidator.validate(adminParameters, errors);
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("offeringId"));
	}

	protected void tearDown() throws Exception {
		super.tearDown();
		adminParameters = null;
		adminParametersValidator = null;
		errors = null;
	}

}
