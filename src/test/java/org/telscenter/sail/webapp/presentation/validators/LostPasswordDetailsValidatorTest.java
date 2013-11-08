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
import org.springframework.validation.Validator;
import org.telscenter.sail.webapp.domain.authentication.impl.TeacherUserDetails;

/**
 * @author Anthony Perritano
 * @version $$Id: $$
 */
public class LostPasswordDetailsValidatorTest extends
		TestCase {
	
	protected TeacherUserDetails userDetails;
	protected Validator userDetailsValidator;
	protected Errors errors;
	
    protected void setUp() throws Exception {
        userDetails = new TeacherUserDetails();
       
        errors = new BeanPropertyBindingResult(userDetails, "");
        userDetailsValidator = new TeacherUserDetailsValidator();
    }

    public void testBothUsernameAndEmailNullValidate() {
    	userDetails.setEmailAddress(null);
    	userDetails.setUsername(null);
    	
    	userDetailsValidator.validate(userDetails, errors);
    	
    	assertTrue(errors.hasErrors());   	
    }
    
    public void testBothUsernameAndEmailNotNullValidate() {
    	userDetails.setEmailAddress("username");
    	userDetails.setUsername("email");
    	
    	userDetailsValidator.validate(userDetails, errors);
    	
    	assertTrue(errors.hasErrors());   	
    }
    
    protected void tearDown() throws Exception {
        super.tearDown();
        userDetails = null;
        errors = null;
    }
}
