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

import net.sf.sail.webapp.domain.impl.UserImpl;
import net.sf.sail.webapp.service.UserService;
import org.easymock.EasyMock;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.telscenter.sail.webapp.domain.impl.FindProjectParameters;

import junit.framework.TestCase;

/**
 * @author patrick lawler
 *
 */
public class FindProjectRunsByTeacherParametersValidatorTest extends TestCase{
	
	private FindProjectParameters params;
	
	private FindProjectParametersValidator validator;
	
	private Errors errors;
	
	private UserService userService;

	private final static String USERNAME = "johnsmith";
	
	private final static String EMPTY = "";
	
	@Override
	protected void setUp(){
		this.params = new FindProjectParameters();
		this.validator = new FindProjectParametersValidator();
		this.errors = new BeanPropertyBindingResult(this.params, "");
		this.userService = EasyMock.createMock(UserService.class);
		this.validator.setUserService(this.userService);
	}
	
	@Override
	protected void tearDown(){
		this.userService = null;
		this.validator = null;
		this.errors = null;
		this.params = null;
	}
	
	public void testAllOK(){
		this.params.setUserName(USERNAME);
		
		EasyMock.expect(this.userService.retrieveUserByUsername(params.getUserName()))
			.andReturn(new UserImpl());
		EasyMock.replay(this.userService);
		
		this.validator.validate(params, errors);
		
		assertTrue(!errors.hasErrors());
		
		EasyMock.verify(this.userService);
	}
	
	public void testNullUser(){
		this.params.setUserName(USERNAME);
		
		EasyMock.expect(this.userService.retrieveUserByUsername(params.getUserName()))
			.andReturn(null);
		EasyMock.replay(this.userService);
		
		this.validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertTrue(errors.hasFieldErrors("username"));
		
		EasyMock.verify(this.userService);
	}
	
	public void testEmpty(){
		this.params.setUserName(EMPTY);
		
		this.validator.validate(params, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
		assertTrue(errors.hasFieldErrors("username"));
	}
}
