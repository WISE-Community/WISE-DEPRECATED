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
import org.telscenter.sail.webapp.domain.authentication.Schoollevel;
import org.telscenter.sail.webapp.domain.authentication.impl.TeacherUserDetails;
import org.telscenter.sail.webapp.presentation.web.TeacherAccountForm;

/**
 * @author patrick lawler
 *
 */
public class TeacherAccountFormValidatorTest extends TestCase{
	
	private final static String FIRST = "John";
	
	private final static String LAST = "Doe";
	
	private final static String USERNAME = "JD";
	
	private final static String EMAIL = "noone@here.com";
	
	private final static String COUNTRY = "USA";
	
	private final static String CITY = "Berkeley";
	
	private final static String STATE = "CA";
	
	private final static String SCHOOL = "Hillside High School";
	
	private final static String DISPLAYNAME = "Ms. Thompson";
	
	private final static String[] SUBJECTS = {"math", "science", "history", "etc."};
	
	private final static Boolean LEGAL = true;
		
	private TeacherUserDetails userDetails;
	
	private TeacherAccountForm teacherAccountForm;
	
	private TeacherAccountFormValidator validator = new TeacherAccountFormValidator();
	
    protected Errors errors;
	
	@Override
	public void setUp(){
		userDetails = new TeacherUserDetails();
		userDetails.setEmailAddress(EMAIL);
		userDetails.setFirstname(FIRST);
		userDetails.setLastname(LAST);
		userDetails.setUsername(USERNAME);
		userDetails.setCountry(COUNTRY);
		userDetails.setCity(CITY);
		userDetails.setState(STATE);
		userDetails.setSchoolname(SCHOOL);
		userDetails.setDisplayname(DISPLAYNAME);
		userDetails.setCurriculumsubjects(SUBJECTS);
		userDetails.setSchoollevel(Schoollevel.OTHER);
		
		teacherAccountForm = new TeacherAccountForm(userDetails);
		teacherAccountForm.setLegalAcknowledged(LEGAL);
        errors = new BeanPropertyBindingResult(teacherAccountForm, "");
	}
	
	
	public void testAllOK(){
		validator.validate(teacherAccountForm, errors);
		assertTrue(!errors.hasErrors());
	}
	
	public void testEmailValidateNull(){
		userDetails.setEmailAddress(null);
		validator.validate(teacherAccountForm, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("userDetails.emailAddress"));
	}
	
	public void testEmailValidateIllegal(){
		userDetails.setEmailAddress("johnishere");
		validator.validate(teacherAccountForm, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1,errors.getErrorCount());
		assertNotNull(errors.getFieldError("userDetails.emailAddress"));
	}
	
	public void testCountryValidateNull(){
		userDetails.setCountry(null);
		validator.validate(teacherAccountForm, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("userDetails.country"));
	}
	
	public void testStateValidateNull(){
		userDetails.setState(null);
		validator.validate(teacherAccountForm, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("userDetails.state"));
	}
	
	public void testCityValidateNull(){
		userDetails.setCity(null);
		validator.validate(teacherAccountForm, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("userDetails.city"));		
	}
	
	public void testSchoolnameValidateNull(){
		userDetails.setSchoolname(null);
		validator.validate(teacherAccountForm, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("userDetails.schoolname"));
	}
	
	public void testDisplayNameValidateNull(){
		userDetails.setDisplayname(null);
		validator.validate(teacherAccountForm, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("userDetails.displayname"));
	}
	
	public void testCurriculumSubjectsValidateNull(){
		userDetails.setCurriculumsubjects(null);
		validator.validate(teacherAccountForm, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("userDetails.curriculumsubjects"));
	}
	
	public void testSchoollevelValidateNull(){
		userDetails.setSchoollevel(null);
		validator.validate(teacherAccountForm, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("userDetails.schoollevel"));	
	}
}
