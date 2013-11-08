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
package org.telscenter.sail.webapp.service.project.impl;

import java.util.ArrayList;
import java.util.List;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.Curnit;
import net.sf.sail.webapp.domain.Jnlp;
import net.sf.sail.webapp.domain.impl.CurnitImpl;
import net.sf.sail.webapp.domain.impl.JnlpImpl;
import net.sf.sail.webapp.domain.sds.SdsCurnit;
import net.sf.sail.webapp.service.AclService;
import net.sf.sail.webapp.service.curnit.CurnitService;
import net.sf.sail.webapp.service.jnlp.JnlpService;

import org.telscenter.sail.webapp.dao.project.ProjectDao;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.impl.ProjectParameters;
import org.telscenter.sail.webapp.domain.impl.RunImpl;
import org.telscenter.sail.webapp.domain.impl.RunParameters;
import org.telscenter.sail.webapp.domain.project.FamilyTag;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.domain.project.impl.ProjectImpl;
import org.telscenter.sail.webapp.service.offering.RunService;

import junit.framework.TestCase;

import static org.easymock.EasyMock.*;


/**
 * @author Hiroki Terashima
 * @version $Id$
 */
public class ProjectServiceImplTest extends TestCase {

	private LdProjectServiceImpl projectServiceImpl;

	private ProjectDao<Project> mockProjectDao;
	
	private CurnitService mockCurnitService;
	
	private JnlpService mockJnlpService;
	
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
		SdsCurnit sdsCurnit = new SdsCurnit();
		sdsCurnit.setName("airbags");
		expectedCurnit.setSdsCurnit(sdsCurnit);
		expect(mockCurnitService.getById(EXISTING_CURNIT_ID)).andReturn(expectedCurnit);
		replay(mockCurnitService);
		Jnlp expectedJnlp = new JnlpImpl();
		expect(mockJnlpService.getById(EXISTING_JNLP_ID)).andReturn(expectedJnlp);
		replay(mockJnlpService);
		Project projectToCreate = new ProjectImpl();
		expect(mockProjectDao.createEmptyProject()).andReturn(projectToCreate);
		projectToCreate.setCurnit(expectedCurnit);
		projectToCreate.setJnlp(expectedJnlp);
		
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
		projectParameters.setCurnitId(EXISTING_CURNIT_ID);
		projectParameters.setJnlpId(EXISTING_JNLP_ID);
		Project createdProject = projectServiceImpl.createProject(projectParameters);

		assertEquals(createdProject.getPreviewRun(), expectedPreviewRun);
		assertEquals(createdProject.getCurnit(), expectedCurnit);
		assertEquals(createdProject.getJnlp(), expectedJnlp);
		verify(mockProjectDao);
		verify(mockCurnitService);
		verify(mockJnlpService);
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
