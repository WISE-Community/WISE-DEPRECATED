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


import junit.framework.TestCase;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.impl.UserImpl;
import net.sf.sail.webapp.domain.impl.WorkgroupImpl;

import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.telscenter.sail.webapp.domain.impl.ChangeWorkgroupParameters;

/**
 * @author Sally Ahn
 * @version $Id: $
 */
public class ChangeWorkgroupParametersValidatorTest extends TestCase{

	private ChangeWorkgroupParameters params;
	
	private ChangeWorkgroupParametersValidator validator;

	private Errors errors;
		
	private final User STUDENT = new UserImpl();
	
	private final Workgroup WORKGROUP_FROM = new WorkgroupImpl();
	
	private final Workgroup WORKGROUP_TO = new WorkgroupImpl();
	
	private static final Long WORKGROUP_TO_ID = new Long(5);

	private static final Long OFFERING_ID = new Long(10);

	private static final Long PERIOD_ID = new Long(2);
	
	@Override
	protected void setUp() {
		validator = new ChangeWorkgroupParametersValidator();
		params = new ChangeWorkgroupParameters();
		params.setStudent(STUDENT);
		params.setWorkgroupFrom(WORKGROUP_FROM);
		params.setWorkgroupTo(WORKGROUP_TO);
		params.setWorkgroupToId(WORKGROUP_TO_ID);
		params.setOfferingId(OFFERING_ID);
		params.setPeriodId(PERIOD_ID);
		errors = new BeanPropertyBindingResult(params, "");
	}
	
	public void testNoProblemValidate() {
		validator.validate(params, errors);
		
		assertTrue(!errors.hasErrors());
	}
	
	public void testEmptyStudentValidate() {
		params.setStudent(null);

		validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("student"));

	}
	
	public void testEmptyWorkgroupFromValidate() {
		params.setWorkgroupFrom(null);
		
		validator.validate(params, errors);
		
		assertTrue(!errors.hasErrors());
	}
	
	public void testEmptyWorkgroupToIdValidate() {
		params.setWorkgroupToId(null);

		validator.validate(params, errors);

		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("workgroupToId"));
	}
	
	public void testEmptyOfferingIdValidate() {
		params.setOfferingId(null);
		
		validator.validate(params, errors);

		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("offeringId"));
	}
	
	public void testEmptyPeriodIdValidate() {
		params.setPeriodId(null);
		
		validator.validate(params, errors);

		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertNotNull(errors.getFieldError("periodId"));
	}
	
	@Override
	protected void tearDown() {
		validator = null;
		params = null;
		errors = null;
	}
}

