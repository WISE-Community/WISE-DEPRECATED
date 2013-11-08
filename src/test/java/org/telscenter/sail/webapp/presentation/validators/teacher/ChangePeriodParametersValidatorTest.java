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

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.UserImpl;

import org.springframework.validation.Errors;
import junit.framework.TestCase;
import org.telscenter.sail.webapp.presentation.validators.teacher.ChangePeriodParametersValidator;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.impl.ChangePeriodParameters;
import org.telscenter.sail.webapp.domain.impl.RunImpl;
import org.springframework.validation.BeanPropertyBindingResult;

/**
 * @author patrick lawler
 *
 */
public class ChangePeriodParametersValidatorTest extends TestCase {

	private Errors errors;
	
	private ChangePeriodParameters params;
	
	private ChangePeriodParametersValidator validator;
	
	private final static User STUDENT = new UserImpl();
	
	private final static Run RUN = new RunImpl();
	
	private final static String PROJECTCODE = "ZEBRA111-3";
	
	private final static String PROJECTCODETO = "ZEBRA111-4";
	
	@Override
	protected void setUp(){
		params = new ChangePeriodParameters();
		params.setProjectcode(PROJECTCODE);
		params.setProjectcodeTo(PROJECTCODETO);
		params.setRun(RUN);
		params.setStudent(STUDENT);
		validator = new ChangePeriodParametersValidator();
		errors = new BeanPropertyBindingResult(params, "");
	}
	
	@Override
	protected void tearDown(){
		params = null;
		validator = null;
		errors = null;
	}
	
	public void testAllGood(){
		validator.validate(params, errors);
		assertTrue(!errors.hasErrors());
	}
	
	public void testNullRun(){
		params.setRun(null);
		
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(errors.getErrorCount(), 1);
		assertNotNull(errors.getFieldError("run"));
	}
	
	public void testNullStudent(){
		params.setStudent(null);
		
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(errors.getErrorCount(), 1);
		assertNotNull(errors.getFieldError("student"));
	}
	
	public void testNullProjectcode(){
		params.setProjectcode(null);
		
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(errors.getErrorCount(), 1);
		assertNotNull(errors.getFieldError("projectcode"));
	}
	
	public void testNullProjectcodeTo(){
		params.setProjectcodeTo(null);
		
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(errors.getErrorCount(), 1);
		assertNotNull(errors.getFieldError("projectcodeTo"));
	}
	
}
