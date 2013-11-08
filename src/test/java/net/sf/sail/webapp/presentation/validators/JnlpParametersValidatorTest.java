/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
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

import static org.junit.Assert.*;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;

import org.junit.After;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

import net.sf.sail.webapp.domain.impl.JnlpParameters;

/**
 * Test class for JnlpParametersValidator
 * 
 * @author Hiroki Terashima
 * @version $Id$
 */
public class JnlpParametersValidatorTest {
	
	private static final String LEGAL_JNLP_NAME = "JNLP that works with Airbags";

	private static final String LEGAL_JNLP_URL = "http://legaljnlpurl.jnlp";

	private static final String EMPTY_STRING = "";
	
	private static final String INVALID_URL_1 = "www.utoronto.ca";
	
	private JnlpParameters jnlpParameters;
	
	private Validator jnlpParametersValidator;
	
	private Errors errors;
	
	@Before
	public void setUp() {
		jnlpParameters = new JnlpParameters();
		jnlpParameters.setName(LEGAL_JNLP_NAME);
		jnlpParameters.setUrl(LEGAL_JNLP_URL);
		errors = new BeanPropertyBindingResult(jnlpParameters, "");
		jnlpParametersValidator = new JnlpParametersValidator();
	}
	
	@After
	public void tearDown() {
		jnlpParameters = null;
		errors = null;
		jnlpParametersValidator = null;
	}
	
	@Test
	public void testAllLegal() {
		jnlpParametersValidator.validate(jnlpParameters, errors);
		assertFalse(errors.hasErrors());
		assertEquals(0, errors.getErrorCount());
		assertNull(errors.getFieldError(JnlpParameters.FIELD_NAME));
		assertNull(errors.getFieldError(JnlpParameters.FIELD_URL));
	}
	
	@Test
	public void testEmptyJnlpName() {
		jnlpParameters.setName(EMPTY_STRING);

		jnlpParametersValidator.validate(jnlpParameters, errors);
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError(JnlpParameters.FIELD_NAME));
		assertNull(errors.getFieldError(JnlpParameters.FIELD_URL));
	}

	@Test
	public void testNullJnlpName() {
		jnlpParameters.setName(null);

		jnlpParametersValidator.validate(jnlpParameters, errors);
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError(JnlpParameters.FIELD_NAME));
		assertNull(errors.getFieldError(JnlpParameters.FIELD_URL));
	}

	@Test
	public void testEmptyJnlpUrl() {
		jnlpParameters.setUrl(EMPTY_STRING);
		
		jnlpParametersValidator.validate(jnlpParameters, errors);
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNull(errors.getFieldError(JnlpParameters.FIELD_NAME));
		assertNotNull(errors.getFieldError(JnlpParameters.FIELD_URL));
	}

	@Test
	public void testNullJnlpUrl() {
		jnlpParameters.setUrl(null);
		
		jnlpParametersValidator.validate(jnlpParameters, errors);
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNull(errors.getFieldError(JnlpParameters.FIELD_NAME));
		assertNotNull(errors.getFieldError(JnlpParameters.FIELD_URL));
	}
	
	@Test
	public void testJnlpNameJnlpUrlEmpty() {
		jnlpParameters.setName(EMPTY_STRING);
		jnlpParameters.setUrl(EMPTY_STRING);
		
		jnlpParametersValidator.validate(jnlpParameters, errors);
		assertTrue(errors.hasErrors());
		assertEquals(2, errors.getErrorCount());
		assertNotNull(errors.getFieldError(JnlpParameters.FIELD_NAME));
		assertNotNull(errors.getFieldError(JnlpParameters.FIELD_URL));
	}

	@Test
	public void testJnlpNameJnlpUrlNull() {
		jnlpParameters.setName(null);
		jnlpParameters.setUrl(null);
		
		jnlpParametersValidator.validate(jnlpParameters, errors);
		assertTrue(errors.hasErrors());
		assertEquals(2, errors.getErrorCount());
		assertNotNull(errors.getFieldError(JnlpParameters.FIELD_NAME));
		assertNotNull(errors.getFieldError(JnlpParameters.FIELD_URL));
	}
	
	@Test
	@Ignore
	public void testJnlpNameInvalid() {
		// TODO Hiroki: finish writing this and remove
		// the @Ignore tag when ready
	}
	
	@Test
	@Ignore
	public void testJnlpUrlInvalid() {
		// TODO Laurel: finish writing this and remove
		// the @Ignore tag when ready
		
	}

}
