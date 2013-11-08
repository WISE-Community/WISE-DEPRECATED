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

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.UserImpl;

import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.telscenter.sail.webapp.domain.impl.NewsItemParameters;
import org.telscenter.sail.webapp.presentation.validators.NewsItemParametersValidator;

import junit.framework.TestCase;
import java.util.Calendar;
import java.util.Date;

/**
 * @author parick lawler
 *
 */
public class NewsItemParametersValidatorTest extends TestCase {

	private NewsItemParameters newsItemParameters;
	
	private NewsItemParameters nullNewsItemParameters;
	
	private NewsItemParametersValidator validator;
	
	private Errors errors;
	
	private Errors null_errors;
	
	private final static String TITLE = "News of the day";
	
	private final static Date DATE = Calendar.getInstance().getTime();
	
	private final static User OWNER = new UserImpl();
	
	private final static String NEWS = "this is the news";
	
	@Override
	protected void setUp(){
		newsItemParameters = new NewsItemParameters();
		nullNewsItemParameters = new NewsItemParameters();
		
		newsItemParameters.setDate(DATE);
		newsItemParameters.setNews(NEWS);
		newsItemParameters.setOwner(OWNER);
		newsItemParameters.setTitle(TITLE);
		
		nullNewsItemParameters.setDate(DATE);
		nullNewsItemParameters.setNews(NEWS);
		nullNewsItemParameters.setOwner(OWNER);
		nullNewsItemParameters.setTitle(TITLE);
		
		validator = new NewsItemParametersValidator();
		errors = new BeanPropertyBindingResult(newsItemParameters, "");
		null_errors = new BeanPropertyBindingResult(nullNewsItemParameters, "");
	}
	
	@Override
	protected void tearDown(){
		newsItemParameters = null;
		nullNewsItemParameters = null;
		validator = null;
		errors = null;
		null_errors = null;
	}
	
	public void testSuccessfulValidate(){
		validator.validate(newsItemParameters, errors);
		assertTrue(!errors.hasErrors());
	}
	
	public void testNullNews(){
		nullNewsItemParameters.setNews(null);
		validator.validate(nullNewsItemParameters, null_errors);
		
		assertTrue(null_errors.hasErrors());
		assertEquals(1, null_errors.getErrorCount());
	}
		
	public void testNullTitle(){
		nullNewsItemParameters.setTitle(null);
		validator.validate(nullNewsItemParameters, null_errors);
		
		assertTrue(null_errors.hasErrors());
		assertEquals(1,null_errors.getErrorCount());
	}
	
	public void testMiserableFailure(){
		nullNewsItemParameters.setDate(null);
		nullNewsItemParameters.setNews(null);
		nullNewsItemParameters.setOwner(null);
		nullNewsItemParameters.setTitle(null);
		validator.validate(nullNewsItemParameters, null_errors);
		
		assertTrue(null_errors.hasErrors());
		assertEquals(1,null_errors.getErrorCount());
	}
	
}
