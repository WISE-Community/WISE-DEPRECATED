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

import org.springframework.validation.Errors;
import org.springframework.validation.Validator;
import org.telscenter.sail.webapp.domain.authentication.MutableUserDetails;

/**
 * Test class for TELS's UserDetailsValidator
 *
 * @author Hiroki Terashima
 * @version $Id: $
 */
public class UserDetailsValidatorTest extends
		net.sf.sail.webapp.presentation.validators.UserDetailsValidatorTest {
	
    protected static final String USERNAME = "NAME";

    protected static final String PASSWORD = "PASS";

    protected static final String FIRSTNAME = "firstname";
    
    protected static final String LASTNAME = "lastname";
    
    protected static final Date SIGNUPDATE = Calendar.getInstance().getTime();
    
    protected static final String EMAIL = "email@email.com";
    
    protected static final String EMPTY = "";

    protected static final String SPACES = "    ";

	protected static final String PASSWORD_TOO_LONG = "abcdefghijklmnopqrstuvwxyz";
    
    protected Validator userDetailsValidator;
    
    protected Errors errors;
    
    public void testNoProblemValidate(MutableUserDetails userDetails, Errors errors) {
    	userDetailsValidator.validate(userDetails, errors);
    	
    	assertTrue(!errors.hasErrors());
    }
    
    public void testPasswordNullValidate(MutableUserDetails userDetails, Errors errors) {
        userDetails.setPassword(null);

        userDetailsValidator.validate(userDetails, errors);

        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNull(errors.getFieldError("username"));
        assertNotNull(errors.getFieldError("password"));
    }
    
    public void testPasswordEmptyValidate(MutableUserDetails userDetails, Errors errors) {
        userDetails.setPassword(EMPTY);

        userDetailsValidator.validate(userDetails, errors);

        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNull(errors.getFieldError("username"));
        assertNotNull(errors.getFieldError("password"));
    }

    public void testPasswordSpacesValidate(MutableUserDetails userDetails, Errors errors) {
        userDetails.setPassword(SPACES);

        userDetailsValidator.validate(userDetails, errors);

        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNull(errors.getFieldError("username"));
        assertNotNull(errors.getFieldError("password"));
    }
    
    public void testPasswordTooLongValidate(MutableUserDetails userDetails, Errors errors) {
    	assertTrue(PASSWORD_TOO_LONG.length() > TeacherUserDetailsValidator.MAX_PASSWORD_LENGTH);
    	userDetails.setPassword(PASSWORD_TOO_LONG);
    	
    	userDetailsValidator.validate(userDetails, errors);
    	assertTrue(errors.hasErrors());
    	assertEquals(1, errors.getErrorCount());
    	assertNull(errors.getFieldError("username"));
    	assertNotNull(errors.getFieldError("password"));
    }
    
    public void testPasswordIllegalChars1Validate(MutableUserDetails userDetails, Errors errors) {
        userDetails.setPassword(ILLEGAL1);
        userDetailsValidator.validate(userDetails, errors);
        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNull(errors.getFieldError("username"));
        assertNotNull(errors.getFieldError("password"));
    }
    
    public void testSignupdateNullValidate(MutableUserDetails userDetails, Errors errors) {
        userDetails.setSignupdate(null);
        userDetailsValidator.validate(userDetails, errors);
        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNull(errors.getFieldError("username"));
        assertNotNull(errors.getFieldError("signupdate"));    	
    }
}
