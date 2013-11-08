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
package org.telscenter.sail.webapp.service.grading.impl;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

import net.sf.sail.webapp.dao.ObjectNotFoundException;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.authentication.MutableUserDetails;
import net.sf.sail.webapp.domain.authentication.impl.PersistentUserDetails;
import net.sf.sail.webapp.domain.impl.UserImpl;
import net.sf.sail.webapp.domain.impl.WorkgroupImpl;
import net.sf.sail.webapp.domain.sds.SdsOffering;

import static org.easymock.EasyMock.*;


import org.telscenter.pas.emf.pas.EActivity;
import org.telscenter.pas.emf.pas.ECurnitmap;
import org.telscenter.pas.emf.pas.EStep;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.grading.IndividualScore;
import org.telscenter.sail.webapp.domain.grading.impl.IndividualScoreNumericImpl;
import org.telscenter.sail.webapp.domain.impl.RunImpl;
import org.telscenter.sail.webapp.service.grading.SessionBundleService;
import org.telscenter.sail.webapp.service.offering.RunService;

import junit.framework.TestCase;

/**
 * Test for GradingServiceImpl class
 *
 * @author Hiroki Terashima
 * @version $Id$
 */
public class GradingServiceImplTest extends TestCase {

	private static final String USERNAME_USER2 = "username_user1";

	private static final String USERNAME_USER1 = "username_user2";

	private Long runId;

	private GradingServiceImpl gradingService;
	
	private SessionBundleService sessionBundleService;
	
	private RunService runService;
	
	private String sdsCurnitmap =  "<?xml version=\"1.0\" encoding=\"ASCII\"?>" +
		"<pas:ECurnitmap xmi:version=\"2.0\" xmlns:xmi=\"http://www.omg.org/XMI\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:pas=\"pas\" xsi:schemaLocation=\"pas pas.ecore\">" +
		"<project podUUID=\"cccccccc-0002-3878-0000-000000000000\"	title=\"Global Warming: Virtual Earth\">" +
		"<activity podUUID=\"dddddddd-6004-0000-0000-000000000000\"	title=\"Identifying the Problem\" number=\"0\">" +
		"<step podUUID=\"dddddddd-6004-0001-0000-000000000000\"	title=\"1. Global Warming is happening\" number=\"0\" type=\"Display\"		classname=\"org.telscenter.pas.steps.Display\" />" +
		"<step podUUID=\"dddddddd-6004-0002-0000-000000000000\"	title=\"2. Take notes on the Science behind Global Warming part 1\" number=\"1\"			type=\"Note\" classname=\"org.telscenter.pas.steps.Note\" ><rim rimname=\"undefined6\" prompt=\"html-stylized prompt for step 2 goes here\"/></step>" +
		"<step podUUID=\"dddddddd-6004-0003-0000-000000000000\"	title=\"3. Take notes on the Science behind Global Warming part 2\" number=\"2\"			type=\"Note\" classname=\"org.telscenter.pas.steps.Note\" ><rim rimname=\"undefined7\" prompt=\"html-stylized prompt for step 3 goes here\"/></step>" +
		"</activity></project></pas:ECurnitmap>";	
	
	@Override
	protected void setUp() throws Exception {
		super.setUp();
		
		runId = new Long(5);
		
		gradingService = new GradingServiceImpl();
		sessionBundleService = createMock(SessionBundleService.class);
		gradingService.setSessionBundleService(sessionBundleService);
		runService = createMock(RunService.class);
		gradingService.setRunService(runService);
	}
	
	@Override
	protected void tearDown() throws Exception {
		super.tearDown();
		
		runId = null;
		gradingService = null;
	}
	
	public void testGetCurnitmap_success() 
	    throws ObjectNotFoundException {
		Run run = new RunImpl();
		SdsOffering sdsOffering = new SdsOffering();
		sdsOffering.setSdsCurnitMap(sdsCurnitmap);
		run.setSdsOffering(sdsOffering);
		ECurnitmap curnitmap = null;
		expect(runService.retrieveById(runId)).andReturn(run);
		replay(runService);
		curnitmap = gradingService.getCurnitmap(runId);
		assertNotNull(curnitmap);
	}
	
	public void testGetCurnitmap_runId_invalid() 
	    throws ObjectNotFoundException {
		Run run = new RunImpl();
		SdsOffering sdsOffering = new SdsOffering();
		sdsOffering.setSdsCurnitMap(sdsCurnitmap);
		run.setSdsOffering(sdsOffering);
		expect(runService.retrieveById(runId)).andThrow(new ObjectNotFoundException(runId, Run.class));
		replay(runService);

		ECurnitmap curnitmap = null;
		try {
			curnitmap = gradingService.getCurnitmap(runId);
			fail("expected ObjectNotFoundException to be thrown");
		} catch (ObjectNotFoundException e) {
			assertNull(curnitmap);
		}
	}
	
	public void testGetTotalPossibleScore() throws ObjectNotFoundException {
		Run run = new RunImpl();
		SdsOffering sdsOffering = new SdsOffering();
		sdsOffering.setSdsCurnitMap(sdsCurnitmap);
		run.setSdsOffering(sdsOffering);
		ECurnitmap eCurnitmap = null;
		expect(runService.retrieveById(runId)).andReturn(run);
		replay(runService);
	}
	

}
