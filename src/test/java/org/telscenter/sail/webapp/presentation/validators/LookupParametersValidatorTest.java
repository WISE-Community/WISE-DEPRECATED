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
package org.telscenter.sail.webapp.presentation.validators;

import junit.framework.TestCase;

import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.telscenter.sail.webapp.domain.impl.LookupParameters;

/**
 * @author patrick lawler
 *
 */
public class LookupParametersValidatorTest extends TestCase{

	private LookupParameters params;
	
	private LookupParametersValidator validator;
	
	private Errors errors;
	
	private final static String FIELD = "FIRSTNAME";
	
	private final static String CRITERIA = "MATCHES";
	
	private final static String DATA = "Sarah";
	
	private final static String EMPTY = "";
	
	@Override
	protected void setUp(){
		this.params = new LookupParameters();
		this.params.setLookupCriteria(CRITERIA);
		this.params.setLookupField(FIELD);
		this.params.setLookupData(DATA);
		
		this.validator = new LookupParametersValidator();
		this.errors = new BeanPropertyBindingResult(this.params, "");
	}
	
	@Override
	protected void tearDown(){
		this.errors = null;
		this.validator = null;
		this.params = null;
	}
	
	public void testAllOK(){
		this.validator.validate(params, errors);
		
		assertTrue(!errors.hasErrors());
	}
	
	public void testEmptyData(){
		this.params.setLookupData(EMPTY);
		
		this.validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertTrue(errors.hasFieldErrors("lookupData"));
	}
	
	public void testEmptyField(){
		this.params.setLookupField(EMPTY);
		
		this.validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertTrue(errors.hasFieldErrors("lookupField"));
	}
	
	public void testEmptyCriteria(){
		this.params.setLookupCriteria(EMPTY);
		
		this.validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertTrue(errors.hasFieldErrors("lookupCriteria"));
	}
}
