/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
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
package org.telscenter.sail.webapp.presentation.validators.general.contactwise;

import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.telscenter.sail.webapp.domain.general.contactwise.ContactWISE;
import org.telscenter.sail.webapp.domain.general.contactwise.IssueType;
import org.telscenter.sail.webapp.domain.general.contactwise.OperatingSystem;
import org.telscenter.sail.webapp.domain.general.contactwise.WebBrowser;
import org.telscenter.sail.webapp.domain.general.contactwise.impl.ContactWISEGeneral;

import junit.framework.TestCase;


/**
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 *
 * @version $Id$
 */
public class ContactWISEValidatorTest extends TestCase {
	
	private static final String NAME = "testname";

	private static final String EMAIL = "testname@test.com";

	private static final IssueType ISSUETYPE = IssueType.TROUBLE_LOGGING_IN;

	private static final OperatingSystem OPERATINGSYSTEM = OperatingSystem.MAC_OS9;

	private static final WebBrowser WEBBROWSER = WebBrowser.FIREFOX;

	private static final String DESCRIPTION = "I can't log in";

	private static final String SUMMARY = "I type in my username and password but it says my username does not exist.";

	private ContactWISE params;
	
	private ContactWISEValidator validator;
	
	private Errors errors;
	
	@Override
	protected void setUp() {
		validator = new ContactWISEValidator();
		params = new ContactWISEGeneral();
		errors = new BeanPropertyBindingResult(params, "");
		
		params.setName(NAME);
		params.setEmail(EMAIL);
		params.setIssuetype(ISSUETYPE);
		params.setDescription(DESCRIPTION);
		params.setSummary(SUMMARY);
	}
	
	public void testNoProblemValidate() {
		validator.validate(params, errors);
		
		assertTrue(!errors.hasErrors());
	}
	
	public void testNullNameValidate() {
		params.setName(null);
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("name"));
	}
	
	public void testEmptyNameValidate() {
		params.setName("");
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("name"));
	}
	
	public void testNullEmailValidate() {
		params.setEmail(null);
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("email"));
	}
	
	public void testEmptyEmailValidate() {
		params.setEmail("");
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("email"));
	}
	
	public void testEmptyNameAndEmailValidate() {
		params.setName("");
		params.setEmail("");
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(2, errors.getErrorCount());
		assertNotNull(errors.getFieldError("name"));
		assertNotNull(errors.getFieldError("email"));
	}

	public void testNullDescriptionValidate() {
		params.setDescription(null);
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("description"));
	}
	
	public void testEmptyDescriptionValidate() {
		params.setDescription("");
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("description"));
	}
	
	public void testNullSummaryValidate() {
		params.setSummary(null);
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("summary"));
	}
	
	public void testEmptySummaryValidate() {
		params.setSummary("");
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("summary"));
	}
	
	//TODO: Geoff - Validate email with correct email syntax
	public void testEmailValidateFail1() {
		params.setEmail("abc");
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("email"));
	}
	
	public void testEmailValidateFail2() {
		params.setEmail("abc!@berkeley.edu");
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("email"));
	}
	
	public void testEmailValidateFail3() {
		params.setEmail("abc@berkeley!.edu");
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("email"));
	}
	
	public void testEmailValidateFail4() {
		params.setEmail("abc@berkeley.edu!");
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("email"));
	}
	
	public void testEmailValidateFail5() {
		params.setEmail(".@.");
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("email"));
	}
	
	public void testEmailValidateFail6() {
		params.setEmail("a.b.c.@berkeley.edu");
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("email"));
	}
	
	public void testEmailValidateFail7() {
		params.setEmail(".a.b.c@berkeley.edu");
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("email"));
	}
	
	public void testEmailValidateFail8() {
		params.setEmail("a.b.c@berk@eley.edu");
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("email"));
	}
	
	public void testEmailValidateFail9() {
		params.setEmail("a.b.c@berkeley.e");
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("email"));
	}
	
	public void testEmailValidateFail10() {
		params.setEmail(".abc@berkeley.edu");
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("email"));
	}
	
	public void testEmailValidateFail11() {
		params.setEmail("_abc@berkeley.edu");
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("email"));
	}
	
	public void testEmailValidateFail12() {
		params.setEmail("a..b@berkeley.edu");
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("email"));
	}
	
	public void testEmailValidateFail13() {
		params.setEmail("a.b.c@berk..eley.edu.");
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("email"));
	}
	
	public void testEmailValidateFail14() {
		params.setEmail("abc@");
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("email"));
	}
	
	public void testEmailValidateFail15() {
		params.setEmail("@.");
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("email"));
	}
	
	public void testEmailValidateFail16() {
		params.setEmail("@berkeley.");
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("email"));
	}
	
	public void testEmailValidateFail17() {
		params.setEmail("@.com");
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("email"));
	}
	
	public void testEmailValidateFail18() {
		params.setEmail(" ");
		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("email"));
	}
	
	public void testEmailValidatePass1() {
		params.setEmail("abc@berkeley.edu");
		validator.validate(params, errors);
		
		assertTrue(!errors.hasErrors());
		assertEquals(0, errors.getErrorCount());
	}
	
	public void testEmailValidatePass2() {
		params.setEmail("a.b.c@berkeley.edu");
		validator.validate(params, errors);
		
		assertTrue(!errors.hasErrors());
		assertEquals(0, errors.getErrorCount());
	}
	
	public void testEmailValidatePass3() {
		params.setEmail("a_b_c@berk.eley.edu");
		validator.validate(params, errors);
		
		assertTrue(!errors.hasErrors());
		assertEquals(0, errors.getErrorCount());
	}
	
	public void testEmailValidatePass4() {
		params.setEmail("abc123@berkeley123.edu");
		validator.validate(params, errors);
		
		assertTrue(!errors.hasErrors());
		assertEquals(0, errors.getErrorCount());
	}
	
	public void testEmailValidatePass5() {
		params.setEmail("abc123@berk-eley.edu");
		validator.validate(params, errors);
		
		assertTrue(!errors.hasErrors());
		assertEquals(0, errors.getErrorCount());
	}
	
	public void testEmailValidatePass6() {
		params.setEmail("ABC123@BERKELEY.EDU");
		validator.validate(params, errors);
		
		assertTrue(!errors.hasErrors());
		assertEquals(0, errors.getErrorCount());
	}
	
	public void testEmailValidatePass7() {
		params.setEmail("abc123@berkeley.eduuuuuuuuuuuuuuuuuuuuuuuuu");
		validator.validate(params, errors);
		
		assertTrue(!errors.hasErrors());
		assertEquals(0, errors.getErrorCount());
	}
	
	
	
	@Override
	protected void tearDown() {
		validator = null;
		params = null;
		errors = null;
	}
}
