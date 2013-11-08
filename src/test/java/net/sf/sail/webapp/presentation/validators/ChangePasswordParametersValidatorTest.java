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

import net.sf.sail.webapp.domain.impl.ChangePasswordParameters;
import net.sf.sail.webapp.presentation.validators.ChangePasswordParametersValidator;

import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import junit.framework.TestCase;

/**
 * @author Sally Ahn
 * @version $Id: $
 */
public class ChangePasswordParametersValidatorTest extends TestCase{

	private ChangePasswordParameters params;
	
	private ChangePasswordParametersValidator validator;
	
	private Errors errors;
	
	private final String LEGAL_PASSWORD1 = "Owl08963";
	
	private final String LEGAL_PASSWORD2 = "owl08963";
	
	private final String[] ILLEGAL_PASSWORDS = {"Owl 0896", "morethantwentyletters", "-3", "-"};	
	
	private final String EMPTY_PASSWORD = "";
	
	@Override
	protected void setUp() {
		validator = new ChangePasswordParametersValidator();
		params = new ChangePasswordParameters();
		params.setPasswd1(LEGAL_PASSWORD1);
		params.setPasswd2(LEGAL_PASSWORD1);  // set up is correct (both passwords match)
		errors = new BeanPropertyBindingResult(params, "");
	}
	
	public void testNoProblemValidate() {
		validator.validate(params, errors);
		
		assertTrue(!errors.hasErrors());
	}
	
	public void testEmptyPasswordValidate() {
		params.setPasswd1(EMPTY_PASSWORD);
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("passwd1"));
		
		setUp();
		params.setPasswd2(EMPTY_PASSWORD);
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("passwd2"));
		
		setUp();
		params.setPasswd1(EMPTY_PASSWORD);
		params.setPasswd2(EMPTY_PASSWORD);
		validator.validate(params, errors);
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("passwd1"));
	}
	
	
	public void testIllegalPasswordsValidate() {
		for (String illegalPassword : ILLEGAL_PASSWORDS) {
			params.setPasswd1(illegalPassword);
			validator.validate(params, errors);

			assertTrue(errors.hasErrors());
			assertEquals(1, errors.getErrorCount());
			assertNotNull(errors.getFieldError("passwd1"));
		}
		
		for (String illegalPassword : ILLEGAL_PASSWORDS) {
			params.setPasswd2(illegalPassword);
			validator.validate(params, errors);

			assertTrue(errors.hasErrors());
			assertEquals(1, errors.getErrorCount());
			assertNotNull(errors.getFieldError("passwd1"));
		}
	}
	
	public void testMisMatchedPasswordsValidate() {
		params.setPasswd1(LEGAL_PASSWORD1);
		params.setPasswd2(LEGAL_PASSWORD2);
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("passwd1"));
	}
	
	@Override
	protected void tearDown() {
		validator = null;
		params = null;
		errors = null;
	}
}

