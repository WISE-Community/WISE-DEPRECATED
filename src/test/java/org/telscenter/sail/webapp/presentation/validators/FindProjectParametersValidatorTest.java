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

import org.easymock.EasyMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.telscenter.sail.webapp.domain.impl.FindProjectParameters;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.domain.project.impl.ProjectImpl;
import org.telscenter.sail.webapp.service.project.ProjectService;
import net.sf.sail.webapp.dao.ObjectNotFoundException;

/**
 * @author patrick lawler
 *
 */
public class FindProjectParametersValidatorTest extends TestCase{

	private FindProjectParameters findProjectParameters;
	
	private FindProjectParametersValidator validator;
	
	private Errors errors;
	
	private ProjectService projectService;
	
	private Project project;
	
	private final static String LEGAL_ID = "1";
	
	private final static String NON_NUMERIC_ID = "A";
	
	private final static String NON_MATCHING_ID = "2";
	
	private final static String NULL_ID = null;
	
	@Override
	protected void setUp(){
		this.findProjectParameters = new FindProjectParameters();
		this.validator = new FindProjectParametersValidator();
		this.errors = new BeanPropertyBindingResult(findProjectParameters, "");
		this.project = new ProjectImpl();
		this.projectService = EasyMock.createMock(ProjectService.class);
		this.validator.setProjectService(this.projectService);
	}
	
	@Override
	protected void tearDown(){
		this.errors = null;
		this.validator = null;
		this.findProjectParameters = null;
	}
	
	public void testAllOK() throws Exception{
		this.findProjectParameters.setProjectId(this.LEGAL_ID);
		
		expect(projectService.getById(new Long(1))).andReturn(project);
		replay(projectService);
		validator.validate(this.findProjectParameters, this.errors);
		
		assertTrue(!errors.hasErrors());
	}
	
	public void testNotNumeric() throws Exception{
		this.findProjectParameters.setProjectId(this.NON_NUMERIC_ID);
		
		expect(projectService.getById(new Long(1))).andReturn(project);
		replay(projectService);
		validator.validate(this.findProjectParameters, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
	}
	
	public void testNull() throws Exception{
		this.findProjectParameters.setProjectId(this.NULL_ID);
		
		expect(projectService.getById(new Long(1))).andReturn(project);
		replay(projectService);
		validator.validate(this.findProjectParameters, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
	}
	
	public void testNotFound() throws Exception{
		this.findProjectParameters.setProjectId(this.NON_MATCHING_ID);
		
		ObjectNotFoundException exception = 
			new ObjectNotFoundException(new Long(2), FindProjectParameters.class);
		
		expect(projectService.getById(new Long(2))).andThrow(exception);
		replay(projectService);
		validator.validate(this.findProjectParameters, errors);
		
		assertTrue(errors.hasErrors());
		assertEquals(1, errors.getErrorCount());
	}
}
