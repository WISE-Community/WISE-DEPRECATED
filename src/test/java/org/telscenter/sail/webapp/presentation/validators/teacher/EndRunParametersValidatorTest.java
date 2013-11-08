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
package org.telscenter.sail.webapp.presentation.validators.teacher;

import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.telscenter.sail.webapp.domain.impl.EndRunParameters;

import junit.framework.TestCase;

/**
 * @author Hiroki Terashima
 * @version $Id$
 */
public class EndRunParametersValidatorTest extends TestCase {

	private EndRunParameters params;
	
	private EndRunParametersValidator validator;
	
	private Errors errors;
	
	private Long legal_runId = new Long(5);
	
	private final Long[] ILLEGAL_RUNIDS = {new Long(0), new Long(-5)};

	@Override
	protected void setUp() {
		validator = new EndRunParametersValidator();
		params = new EndRunParameters();
		params.setRunId(legal_runId);
		errors = new BeanPropertyBindingResult(params, ""); 
	}
	
	@Override
	protected void tearDown() {
		validator = null;
		params = null;
		errors = null;
	}
	
	public void testNoProblemValidate() {
		validator.validate(params, errors);
		
		assertFalse(errors.hasErrors());
	}
	
	public void testNullRunIdValidate() {
		params.setRunId(null);		
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("runId"));
	}
	
	public void testIllegalRunIdsValidate() {
		for (Long illegalRunId : ILLEGAL_RUNIDS) {
			params.setRunId(illegalRunId);
			validator.validate(params, errors);
			
			assertTrue(errors.hasErrors());
			assertEquals(1, errors.getErrorCount());
			assertNotNull(errors.getFieldError("runId"));
		}
	}
}
