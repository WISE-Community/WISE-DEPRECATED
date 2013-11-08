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

import junit.framework.TestCase;
import net.sf.sail.webapp.domain.group.impl.GroupParameters;

import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

/**
 * @author Laurel Williams
 * 
 * @version $Id$
 */
public class GroupParametersValidatorTest extends TestCase {

	private GroupParameters groupParameters;
    private Validator groupParametersValidator;
    private Errors errors;

	private static final String NAME = "Laurel";
	private static final String LONG_NAME = "1234567890123456789012345678901234567890123456789012345";

	protected void setUp() throws Exception {
		super.setUp();
		groupParameters = new GroupParameters();
		errors = new BeanPropertyBindingResult(groupParameters, "");
		groupParametersValidator = new GroupParametersValidator();
	}

	public void testNameParentIdNullValidate() {
		groupParameters.setName(NAME);
		groupParametersValidator.validate(groupParameters, errors);
		assertFalse(errors.hasErrors());
	}
	
	public void testNameNullValidate() {
		groupParametersValidator.validate(groupParameters, errors);
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("name"));
	}
	
	public void testNameBlanksValidate() {
		groupParameters.setName("    ");
		groupParametersValidator.validate(groupParameters, errors);
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("name"));
	}

	public void testNameLongValidate() {
		groupParameters.setName(LONG_NAME);
		groupParametersValidator.validate(groupParameters, errors);
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("name"));
	}
	
	public void testNameIllegalCharsValidate() {
		groupParameters.setName("under_score");
		groupParametersValidator.validate(groupParameters, errors);
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("name"));
		
		groupParameters.setName("apostrophe's");
		groupParametersValidator.validate(groupParameters, errors);
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("name"));
		
	}
	
	public void testParentIdNegative() {
		groupParameters.setName("legalname");
		groupParameters.setParentId(new Long(-3));
		groupParametersValidator.validate(groupParameters, errors);
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("parentId"));
	}

	protected void tearDown() throws Exception {
		super.tearDown();
		groupParameters = null;
		groupParametersValidator = null;
		errors = null;
	}

}
