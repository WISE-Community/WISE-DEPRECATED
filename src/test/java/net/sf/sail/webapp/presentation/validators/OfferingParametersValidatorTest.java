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

import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

import net.sf.sail.webapp.domain.impl.OfferingParameters;
import junit.framework.TestCase;

/**
 * @author Hiroki Terashima
 * @version $Id: $
 */
public class OfferingParametersValidatorTest extends TestCase {
	
	private OfferingParameters offeringParameters;
	
	private Errors errors;
	
	private static final String LEGAL_OFFERING_NAME = "Airbags Offering Spring 2006";

	private static final String ILLEGAL_OFFERING_NAME = "Airbags Offering 4/4/2006";
	
    private static final String LONG_OFFERING_NAME = "abcdefghijhijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

	private static final Long LEGAL_CURNIT_ID = new Long(5);

	private static final Long ILLEGAL_CURNIT_ID = new Long(-1);

	private static final String EMPTY = "";
	
	private Validator offeringParametersValidator;
	
	@Override
	protected void setUp() throws Exception {
		super.setUp();
		offeringParameters = new OfferingParameters();
		offeringParameters.setName(LEGAL_OFFERING_NAME);
		offeringParameters.setCurnitId(LEGAL_CURNIT_ID);
		errors = new BeanPropertyBindingResult(offeringParameters, "");
		offeringParametersValidator = new OfferingParametersValidator();
	}
	
	public void testAllLegal() {
		offeringParametersValidator.validate(offeringParameters, errors);
		
		assertFalse(errors.hasErrors());
		assertEquals(0, errors.getErrorCount());
		assertNull(errors.getFieldError("name"));
		assertNull(errors.getFieldError("curnitId"));

	}
	
	public void testOfferingnameNullValidate() {
		offeringParameters.setName(null);
		
		offeringParametersValidator.validate(offeringParameters, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("name"));
		assertNull(errors.getFieldError("curnitId"));
	}
	
	public void testOfferingnameEmptyValidate() {
		offeringParameters.setName(EMPTY);
		
		offeringParametersValidator.validate(offeringParameters, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("name"));
		assertNull(errors.getFieldError("curnitId"));
	}
	
	public void testCurnitIdNullValidate() {
		offeringParameters.setCurnitId(null);
		offeringParametersValidator.validate(offeringParameters, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNull(errors.getFieldError("name"));
		assertNotNull(errors.getFieldError("curnitId"));
	}
	
	public void testOfferingnameAndCurnitIdNullValidator() {
		offeringParameters.setName(null);
		offeringParameters.setCurnitId(null);
		offeringParametersValidator.validate(offeringParameters, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(2, errors.getErrorCount());
		assertNotNull(errors.getFieldError("name"));
		assertNotNull(errors.getFieldError("curnitId"));
	}
	
	public void testOfferingnameNotAlphaNumeric() {
		offeringParameters.setName(ILLEGAL_OFFERING_NAME);
		
		offeringParametersValidator.validate(offeringParameters, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("name"));
		assertNull(errors.getFieldError("curnitId"));
	}
	
	public void testOfferingnameTooLong() {
		offeringParameters.setName(LONG_OFFERING_NAME);
		
		offeringParametersValidator.validate(offeringParameters, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("name"));
		assertNull(errors.getFieldError("curnitId"));	
	}
	
	public void testCurnitIdTooSmall() {
		offeringParameters.setCurnitId(ILLEGAL_CURNIT_ID);
		offeringParametersValidator.validate(offeringParameters, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNull(errors.getFieldError("name"));
		assertNotNull(errors.getFieldError("curnitId"));
	}
	
	@Override
	protected void tearDown() throws Exception {
		super.tearDown();
		offeringParameters = null;
		offeringParametersValidator = null;
		errors = null;
	}

}
