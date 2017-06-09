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
package org.wise.portal.service.project.impl;

import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.reset;
import static org.easymock.EasyMock.verify;

import java.util.ArrayList;
import java.util.List;

import junit.framework.TestCase;

import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.project.ProjectDao;
import org.wise.portal.domain.module.Curnit;
import org.wise.portal.domain.module.impl.CurnitImpl;
import org.wise.portal.domain.project.FamilyTag;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.ProjectImpl;
import org.wise.portal.domain.project.impl.ProjectParameters;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.run.impl.RunParameters;
import org.wise.portal.service.acl.AclService;
import org.wise.portal.service.module.CurnitService;
import org.wise.portal.service.offering.RunService;


/**
 * @author Hiroki Terashima
 * @version $Id$
 */
public class ProjectServiceImplTest extends TestCase {

	private LdProjectServiceImpl projectServiceImpl;

	private ProjectDao<Project> mockProjectDao;
	
	private CurnitService mockCurnitService;
	
	private RunService mockRunService;
	
	private AclService<Project> mockAclService;
	
	private static final Long EXISTING_PROJECT_ID = new Long(10);

	private static final Long NONEXISTING_PROJECT_ID = new Long(103);
	
	private static final Long EXISTING_CURNIT_ID = new Long(100);

	private static final Long EXISTING_JNLP_ID = new Long(2);
	
	private static final FamilyTag EXISTING_PROJECT_FAMILY_TAG = FamilyTag.TELS;
	
	@SuppressWarnings("unchecked")
	protected void setUp() throws Exception {
		super.setUp();
		this.projectServiceImpl = new LdProjectServiceImpl();
		this.mockProjectDao = createMock(ProjectDao.class);
		this.projectServiceImpl.setProjectDao(mockProjectDao);
		this.mockCurnitService = createMock(CurnitService.class);
		this.projectServiceImpl.setCurnitService(mockCurnitService);
		this.mockRunService = createMock(RunService.class);
		this.projectServiceImpl.setRunService(mockRunService);
		this.mockAclService = createMock(AclService.class);
		this.projectServiceImpl.setAclService(mockAclService);
	}
	
	public void testGetById() throws Exception {
		Project expectedProject = new ProjectImpl();
		expect(mockProjectDao.getById(EXISTING_PROJECT_ID)).andReturn(expectedProject);
    	replay(mockProjectDao);
    	assertEquals(expectedProject, projectServiceImpl.getById(EXISTING_PROJECT_ID));
    	verify(mockProjectDao);
    	reset(mockProjectDao);

    	// now check when curnit is not found
    	expect(mockProjectDao.getById(NONEXISTING_PROJECT_ID)).andThrow(new ObjectNotFoundException(NONEXISTING_PROJECT_ID, Project.class));
    	replay(mockProjectDao);
    	try {
    		projectServiceImpl.getById(NONEXISTING_PROJECT_ID);
    		fail("ObjectNotFoundException expected but was not thrown");
    	} catch (ObjectNotFoundException e) {
    	}
    	verify(mockProjectDao);
	}
	
	public void testGetProjectListByTag() throws Exception {
		// by familytag
		List<Project> expectedList = new ArrayList<Project> ();
		Project expectedProject = new ProjectImpl();
		expectedProject.getProjectInfo().setFamilyTag(EXISTING_PROJECT_FAMILY_TAG);
		expectedList.add(expectedProject);
		expect(mockProjectDao.retrieveListByTag(EXISTING_PROJECT_FAMILY_TAG)).andReturn(expectedList);
		replay(mockProjectDao);
		assertEquals(expectedList, projectServiceImpl.getProjectListByTag(EXISTING_PROJECT_FAMILY_TAG));
		verify(mockProjectDao);
		reset(mockProjectDao);
				
		// by projectinfotag
		// TODO: after projectinfotag defined in ProjectImpl
	}
	
	public void testGetProjectListByTag_EmptyList() throws Exception {
		List<Project> expectedList = new ArrayList<Project> ();
		expect(mockProjectDao.retrieveListByTag(EXISTING_PROJECT_FAMILY_TAG)).andReturn(expectedList);
		replay(mockProjectDao);
		assertEquals(expectedList, projectServiceImpl.getProjectListByTag(EXISTING_PROJECT_FAMILY_TAG));
		verify(mockProjectDao);
		reset(mockProjectDao);
	}
	
	public void testCreateProject_success() throws Exception {
		Curnit expectedCurnit = new CurnitImpl();
		expect(mockCurnitService.getById(EXISTING_CURNIT_ID)).andReturn(expectedCurnit);
		replay(mockCurnitService);
		Project projectToCreate = new ProjectImpl();
		expect(mockProjectDao.createEmptyProject()).andReturn(projectToCreate);
		projectToCreate.setCurnit(expectedCurnit);
		
		mockProjectDao.save(projectToCreate);
		expectLastCall();

		RunParameters expectedRunParameters = new RunParameters();
		expectedRunParameters.setCurnitId(EXISTING_CURNIT_ID);
		expectedRunParameters.setJnlpId(EXISTING_JNLP_ID);
		expectedRunParameters.setName("Preview Run Name");
		expectedRunParameters.setOwners(null);
		expectedRunParameters.setPeriodNames(null);
		expectedRunParameters.setProject(projectToCreate);
		Run expectedPreviewRun = new RunImpl();
		expect(this.mockRunService.createRun(expectedRunParameters)).andReturn(expectedPreviewRun );
		replay(mockRunService);
		projectToCreate.setPreviewRun(expectedPreviewRun);

		mockProjectDao.save(projectToCreate);
		expectLastCall();

		replay(mockProjectDao);
		
		ProjectParameters projectParameters = new ProjectParameters();
		Project createdProject = projectServiceImpl.createProject(projectParameters);

		assertEquals(createdProject.getPreviewRun(), expectedPreviewRun);
		assertEquals(createdProject.getCurnit(), expectedCurnit);
		verify(mockProjectDao);
		verify(mockCurnitService);
		verify(mockRunService);
	}
	
	public void testCreateProject_nonexistent_curnit() {
		// TODO: Hiroki implement
		assertTrue(true);
	}
	
	public void testCreateProject_nonexistent_jnlp() {
		// TODO: Hiroki implement
		assertTrue(true);
	}

}
