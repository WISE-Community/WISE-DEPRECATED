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

import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.telscenter.sail.webapp.domain.authentication.Gender;
import org.telscenter.sail.webapp.domain.authentication.impl.StudentUserDetails;
import org.telscenter.sail.webapp.presentation.web.StudentAccountForm;

import junit.framework.TestCase;

/**
 * @author patrick lawler
 *
 */
public class StudentAccountFormValidatorTest extends TestCase{
	
	private final static String FIRST = "Tip";
	
	private final static String LAST = "Top";
	
	private final static String NAME = "TipTop";
	
	private final static Gender GENDER = Gender.UNSPECIFIED;
	
	private final static String QUESTION = "what is it";
	
	private final static String ANSWER = "i don't know";
	
	private final static String MONTH = "04";
	
	private final static String DATE = "01";
	
	private final static String PROJECTCODE = "elf002-4";
	
	private StudentUserDetails userDetails;
	
	private StudentAccountForm studentAccountForm;
	
	private StudentAccountFormValidator validator = new StudentAccountFormValidator();
	
    protected Errors errors;
	
	@Override
	public void setUp() throws Exception {
		super.setUp();
		userDetails = new StudentUserDetails();
		userDetails.setFirstname(FIRST);
		userDetails.setLastname(LAST);
		userDetails.setUsername(NAME);
		userDetails.setGender(GENDER);
		userDetails.setAccountQuestion(QUESTION);
		userDetails.setAccountAnswer(ANSWER);
		
		studentAccountForm = new StudentAccountForm(userDetails);
		studentAccountForm.setBirthmonth(MONTH);
		studentAccountForm.setBirthdate(DATE);
		studentAccountForm.setProjectCode(PROJECTCODE);
		studentAccountForm.setNewAccount(false);
        errors = new BeanPropertyBindingResult(studentAccountForm, "");
	}
	
	public void testAllOK(){
		validator.validate(studentAccountForm, errors);
		assertTrue(!errors.hasErrors());
	}
	
	public void testGenderValidateNull(){
		userDetails.setGender(null);
		validator.validate(studentAccountForm, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("userDetails.gender"));
	}
	
	public void testQuestionValidateNull(){
		userDetails.setAccountQuestion(null);
		validator.validate(studentAccountForm, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("userDetails.accountQuestion"));
	}
	
	public void testAnswerValidateNull(){
		userDetails.setAccountAnswer(null);
		validator.validate(studentAccountForm, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("userDetails.accountAnswer"));
	}
	
	public void testMonthValidateNull(){
		studentAccountForm.setBirthmonth(null);
		validator.validate(studentAccountForm, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("birthmonth"));
	}
	
	public void testDateValidateNull(){
		studentAccountForm.setBirthdate(null);
		validator.validate(studentAccountForm, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("birthdate"));
	}
	
	public void testProjectCodeValidateNull(){
		studentAccountForm.setProjectCode(null);
		validator.validate(studentAccountForm, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("projectCode"));	
	}
}
