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
import org.telscenter.sail.webapp.domain.authentication.impl.StudentUserDetails;

/**
 * @author Anthony Perritano
 * @version $$Id: $$
 */
public class LostPasswordStudentUsernameValidatorTest extends
		TestCase {
	
	protected StudentUserDetails userDetails;
	protected Validator lostPasswordStudentUsernameValidator;
	protected Errors errors;
	
    protected void setUp() throws Exception {
        userDetails = new StudentUserDetails();
       
        errors = new BeanPropertyBindingResult(userDetails, "");
        lostPasswordStudentUsernameValidator = new LostPasswordStudentUsernameValidator();
    }

    public void testUsernameNullValidate() {
    	userDetails.setUsername(null);
    	
    	lostPasswordStudentUsernameValidator.validate(userDetails, errors);
    	
    	assertTrue(errors.hasErrors());   	
    }
    
    protected void tearDown() throws Exception {
        super.tearDown();
        userDetails = null;
        errors = null;
    }
}
