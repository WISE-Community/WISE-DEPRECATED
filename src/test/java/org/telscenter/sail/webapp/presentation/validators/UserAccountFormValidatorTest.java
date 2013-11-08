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

import java.util.Calendar;
import java.util.Date;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;
import org.telscenter.sail.webapp.presentation.web.UserAccountForm;
import org.telscenter.sail.webapp.domain.authentication.MutableUserDetails;
import org.telscenter.sail.webapp.domain.authentication.impl.TeacherUserDetails;

import junit.framework.TestCase;

/**
 * @author patrick lawler
 *
 */
public class UserAccountFormValidatorTest extends TestCase {

    protected static final String USERNAME = "NAME";

    protected static final String PASSWORD = "PASS";

    protected static final String FIRSTNAME = "firstname";
    
    protected static final String LASTNAME = "lastname";
    
    protected static final Date SIGNUPDATE = Calendar.getInstance().getTime();
    
    protected static final String EMPTY = "";

    protected static final String SPACES = "    ";

	protected static final String PASSWORD_TOO_LONG = "abcdefghijklmnopqrstuvwxyz";
	
	protected static final String ILLEGAL = "@-/";
    
    protected Validator userAccountFormValidator;
    
    protected Errors errors;
    
    protected MutableUserDetails userDetails;
    
    protected UserAccountForm userAccountForm;
    
    @Override
    protected void setUp() throws Exception {
        super.setUp();
        userDetails = new TeacherUserDetails();
        userDetails.setUsername(USERNAME);
        userDetails.setPassword(PASSWORD);
        userDetails.setFirstname(FIRSTNAME);
        userDetails.setLastname(LASTNAME);
        userDetails.setSignupdate(SIGNUPDATE);
        
        userAccountFormValidator = new UserAccountFormValidator();
        userAccountForm = new UserAccountForm();
        userAccountForm.setUserDetails(userDetails);
        userAccountForm.setNewAccount(true);
        errors = new BeanPropertyBindingResult(userAccountForm, "");
    }
    
    //test with both newaccount set to true and newaccount set to false
    public void testNoProblemValidate() {
    	userAccountFormValidator.validate(userAccountForm, errors);
    	assertTrue(!errors.hasErrors());
    	
    	userAccountForm.setNewAccount(false);
    	userAccountFormValidator.validate(userAccountForm, errors);
    	assertTrue(!errors.hasErrors());
    }
    
    //tests with newaccount set to true - bypasses the
    //password check
    public void testNewAccountTrueValidate(){
        userAccountForm.setNewAccount(false);
        userDetails.setPassword(null);
        
        userAccountFormValidator.validate(userAccountForm, errors);
        assertTrue(!errors.hasErrors());
    }
    
    //tests when password is null
    public void testPasswordNullValidate() {
        userDetails.setPassword(null);

        userAccountFormValidator.validate(userAccountForm, errors);
        
        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNotNull(errors.getFieldError("userDetails.password"));
    }
    
    public void testPasswordEmptyValidate(){
    	userDetails.setPassword(EMPTY);
    	
    	userAccountFormValidator.validate(userAccountForm, errors);
    	
    	assertTrue(errors.hasErrors());
    	assertEquals(1, errors.getErrorCount());
    	assertNotNull(errors.getFieldError("userDetails.password"));
    }

    public void testPasswordSpacesValidate() {
        userDetails.setPassword(SPACES);

        userAccountFormValidator.validate(userAccountForm, errors);

        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNotNull(errors.getFieldError("userDetails.password"));
    }
    
    public void testPasswordTooLongValidate() {
    	userDetails.setPassword(PASSWORD_TOO_LONG);
    	
    	userAccountFormValidator.validate(userAccountForm, errors);
    	
    	assertTrue(errors.hasErrors());
    	assertEquals(1, errors.getErrorCount());
    	assertNotNull(errors.getFieldError("userDetails.password"));
    }
    
    public void testPasswordIllegalChars1Validate() {
        userDetails.setPassword(ILLEGAL);
        userAccountFormValidator.validate(userAccountForm, errors);
        
        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNotNull(errors.getFieldError("userDetails.password"));
    }
    
    //test when both newaccount is true and false
    public void testSignupdateNullValidate() {
        userDetails.setSignupdate(null);
        
        userAccountFormValidator.validate(userAccountForm, errors);
        
        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNotNull(errors.getFieldError("userDetails.signupdate"));  
        

        errors = new BeanPropertyBindingResult(userAccountForm, "");
        userAccountForm.setNewAccount(false);
        userAccountFormValidator.validate(userAccountForm, errors);
        assertTrue(!errors.hasErrors());       
    }
    
    //test when both newaccount is true and false
    public void testFirstnameValidate(){
        userDetails.setFirstname(null);
        
        userAccountFormValidator.validate(userAccountForm, errors);
    	
        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNotNull(errors.getFieldError("userDetails.firstname"));
        
    	errors = new BeanPropertyBindingResult(userAccountForm, "");
    	userAccountForm.setNewAccount(false);
    	userAccountFormValidator.validate(userAccountForm, errors);
    	
        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNotNull(errors.getFieldError("userDetails.firstname"));
    }
    
    //test when both newaccount is true and false
    public void testLastnameValidate(){
        userDetails.setLastname(null);
        
        userAccountFormValidator.validate(userAccountForm, errors);
    	
        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNotNull(errors.getFieldError("userDetails.lastname"));
        
    	errors = new BeanPropertyBindingResult(userAccountForm, "");
    	userAccountForm.setNewAccount(false);
    	userAccountFormValidator.validate(userAccountForm, errors);
    	
        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNotNull(errors.getFieldError("userDetails.lastname"));
    }
    
    //test when both newaccount is true and false
    public void testUsernameEmptyValidate(){
        userDetails.setUsername("");
        
        userAccountFormValidator.validate(userAccountForm, errors);
    	
        assertTrue(!errors.hasErrors());
        
    	errors = new BeanPropertyBindingResult(userAccountForm, "");
    	userAccountForm.setNewAccount(false);
    	userAccountFormValidator.validate(userAccountForm, errors);
    	
        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNotNull(errors.getFieldError("userDetails.username"));
    }
    
    //test when both newaccount is true and false
    public void testUsernameIllegalValidate(){
        userDetails.setUsername(ILLEGAL);
        
        userAccountFormValidator.validate(userAccountForm, errors);
    	
        assertTrue(!errors.hasErrors());
        
    	errors = new BeanPropertyBindingResult(userAccountForm, "");
    	userAccountForm.setNewAccount(false);
    	userAccountFormValidator.validate(userAccountForm, errors);
    	
        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNotNull(errors.getFieldError("userDetails.username"));
    }
    
}
