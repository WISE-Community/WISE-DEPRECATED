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
import org.telscenter.sail.webapp.domain.authentication.Gender;
import org.telscenter.sail.webapp.domain.authentication.impl.StudentUserDetails;

/**
 * @author Hiroki Terashima
 *
 * @version $Id$
 */
public class StudentUserDetailsValidatorTest extends UserDetailsValidatorTest {
	
	private StudentUserDetails userDetails;

    private static final Gender GENDER = Gender.FEMALE;
    private static final String ACCOUNT_QUESTION = "what is the name of your middle name?";
    private static final String ACCOUNT_ANSWER = "John";
    
    protected void setUp() throws Exception {
        super.setUp();
        userDetails = new StudentUserDetails();
        userDetails.setUsername(USERNAME);
        userDetails.setPassword(PASSWORD);
        userDetails.setFirstname(FIRSTNAME);
        userDetails.setLastname(LASTNAME);
        userDetails.setGender(GENDER);
        userDetails.setSignupdate(SIGNUPDATE);
        userDetails.setAccountQuestion(ACCOUNT_QUESTION);
        userDetails.setAccountAnswer(ACCOUNT_ANSWER);
        errors = new BeanPropertyBindingResult(userDetails, "");
        userDetailsValidator = new StudentUserDetailsValidator();
    }

    public void testNoProblemValidate() {
    	super.testNoProblemValidate(userDetails, errors);
    }
    
    public void testPasswordNullValidate() {
    	super.testPasswordNullValidate(userDetails, errors);
    }

    public void testPasswordEmptyValidate() {
        super.testPasswordEmptyValidate(userDetails, errors);
    }

    public void testPasswordSpacesValidate() {
    	super.testPasswordSpacesValidate(userDetails, errors);
    }
    
    public void testPasswordTooLongValidate() {
    	super.testPasswordSpacesValidate(userDetails, errors);
    }
    
    public void testPasswordIllegalChars1Validate() {
    	super.testPasswordIllegalChars1Validate(userDetails, errors);
    }
    
    public void testSignupdateNullValidate() {
    	super.testSignupdateNullValidate(userDetails, errors);
    }
    
    public void testAccountQuestionNullValidate() {
    	 userDetails.setAccountQuestion(null);
         userDetailsValidator.validate(userDetails, errors);
         assertTrue(errors.hasErrors());
         assertEquals(1, errors.getErrorCount());
         assertNull(errors.getFieldError("username"));
         assertNotNull(errors.getFieldError("accountQuestion"));    	
    }
    
    public void testAccountAnswerNullValidate() {
    	 userDetails.setAccountAnswer(null);
         userDetailsValidator.validate(userDetails, errors);
         assertTrue(errors.hasErrors());
         assertEquals(1, errors.getErrorCount());
         assertNull(errors.getFieldError("username"));
         assertNotNull(errors.getFieldError("accountAnswer"));    
    }

    protected void tearDown() throws Exception {
        super.tearDown();
        userDetails = null;
        errors = null;
    }


}
