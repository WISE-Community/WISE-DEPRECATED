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
import org.telscenter.sail.webapp.domain.authentication.Schoollevel;
import org.telscenter.sail.webapp.domain.authentication.impl.TeacherUserDetails;

/**
 * Test class for TeacherUserDetailsValidator
 *
 * @author Hiroki Terashima
 * @version $Id$
 */
public class TeacherUserDetailsValidatorTest extends UserDetailsValidatorTest {

	private TeacherUserDetails userDetails;
    
    private static final String CITY = "Berkeley";
    
    private static final String STATE = "California";
    
    private static final String COUNTRY = "U.S.A.";

    private static final String SCHOOLNAME = "U.C. Berkeley";

	private static final String[] CURRICULUMSUBJECTS = {"Biology"};

	private static final Schoollevel SCHOOLLEVEL = Schoollevel.HIGH_SCHOOL;

    protected void setUp() throws Exception {
        super.setUp();
        userDetails = new TeacherUserDetails();
        userDetails.setUsername(USERNAME);
        userDetails.setPassword(PASSWORD);
        userDetails.setFirstname(FIRSTNAME);
        userDetails.setLastname(LASTNAME);
        userDetails.setSignupdate(SIGNUPDATE);
        userDetails.setEmailAddress(EMAIL);
        userDetails.setCity(CITY);
        userDetails.setState(STATE);
        userDetails.setCountry(COUNTRY);
        userDetails.setSchoolname(SCHOOLNAME);
        userDetails.setCurriculumsubjects(CURRICULUMSUBJECTS);
        userDetails.setSchoollevel(SCHOOLLEVEL);
        errors = new BeanPropertyBindingResult(userDetails, "");
        userDetailsValidator = new TeacherUserDetailsValidator();
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
    
    public void testEmailEmptyValidate() {
        userDetails.setEmailAddress(EMPTY);

        userDetailsValidator.validate(userDetails, errors);

        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNotNull(errors.getFieldError("emailAddress"));
    }

    public void testEmailSpacesValidate() {
        userDetails.setEmailAddress(SPACES);

        userDetailsValidator.validate(userDetails, errors);

        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNotNull(errors.getFieldError("emailAddress"));
    }
    
    /* TODO HT: 
     * 1) Add email validation to TeacherUserDetailsValidator
     * 2) uncomment this code
    public void testEmailIllegalFormatValidate() {
        userDetails.setEmailAddress(SPACES);

        userDetailsValidator.validate(userDetails, errors);

        assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
        assertNull(errors.getFieldError("username"));
        assertNotNull(errors.getFieldError("password"));
    }
    */
    
    public void testCityNullValidate() {
    	userDetails.setCity(null);
    	
    	userDetailsValidator.validate(userDetails, errors);
    	
    	assertTrue(!errors.hasErrors());
    }
    
    public void testCityEmptyValidate() {
    	userDetails.setCity(EMPTY);
    	
    	userDetailsValidator.validate(userDetails, errors);
    	
    	assertTrue(!errors.hasErrors());   	
    }
    
    public void testStateNullValidate() {
    	userDetails.setState(null);
    	
    	userDetailsValidator.validate(userDetails, errors);
    	
    	assertTrue(!errors.hasErrors());
    }
    
    public void testStateEmptyValidate() {
    	userDetails.setState(EMPTY);
    	
    	userDetailsValidator.validate(userDetails, errors);
    	
    	assertTrue(!errors.hasErrors());   	
    }
    
    public void testCityStateEmptyValidate() {
    	userDetails.setCity(EMPTY);
    	userDetails.setState(EMPTY);
    	
    	userDetailsValidator.validate(userDetails, errors);
    	
    	assertTrue(!errors.hasErrors());
    }
    
    public void testCountryNullValidate() {
    	userDetails.setCountry(null);
    	
    	userDetailsValidator.validate(userDetails, errors);
    	
    	assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
    	assertNotNull(errors.getFieldError("country"));
    }
    
    public void testCountryEmptyValidate() {
    	userDetails.setCountry(EMPTY);
    	
    	userDetailsValidator.validate(userDetails, errors);
    	
    	assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
    	assertNotNull(errors.getFieldError("country"));
    }
    
    public void testSchoolnameNullValidate() {
    	userDetails.setSchoolname(null);
    	
    	userDetailsValidator.validate(userDetails, errors);
    	
    	assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
    	assertNotNull(errors.getFieldError("schoolname"));
    }
    
    public void testSchoolnameEmptyValidate() {
    	userDetails.setSchoolname(EMPTY);
    	
    	userDetailsValidator.validate(userDetails, errors);
    	
    	assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
    	assertNotNull(errors.getFieldError("schoolname"));
    }
    
    public void testCurriclumsubjectsNullValidate() {
    	userDetails.setCurriculumsubjects(null);
    	
    	userDetailsValidator.validate(userDetails, errors);
    	
    	assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
    	assertNotNull(errors.getFieldError("curriculumsubjects"));
    }
    
    public void testSchoollevelNullValidate() {
    	userDetails.setSchoollevel(null);
    	
    	userDetailsValidator.validate(userDetails, errors);
    	
    	assertTrue(errors.hasErrors());
        assertEquals(1, errors.getErrorCount());
    	assertNotNull(errors.getFieldError("schoollevel"));
    }
    
    protected void tearDown() throws Exception {
        super.tearDown();
        userDetails = null;
        errors = null;
    }


}
