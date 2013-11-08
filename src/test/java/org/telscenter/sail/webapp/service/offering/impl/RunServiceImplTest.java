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
package org.telscenter.sail.webapp.service.offering.impl;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;

import junit.framework.TestCase;
import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.dao.curnit.CurnitDao;
import net.sf.sail.webapp.dao.group.GroupDao;
import net.sf.sail.webapp.dao.jnlp.JnlpDao;
import net.sf.sail.webapp.dao.sds.SdsOfferingDao;
import net.sf.sail.webapp.domain.Curnit;
import net.sf.sail.webapp.domain.Jnlp;
import net.sf.sail.webapp.domain.Offering;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.domain.group.impl.PersistentGroup;
import net.sf.sail.webapp.domain.impl.CurnitImpl;
import net.sf.sail.webapp.domain.impl.JnlpImpl;
import net.sf.sail.webapp.domain.impl.UserImpl;
import net.sf.sail.webapp.domain.sds.SdsCurnit;
import net.sf.sail.webapp.domain.sds.SdsJnlp;
import net.sf.sail.webapp.service.AclService;

import org.easymock.EasyMock;
import org.telscenter.sail.webapp.dao.offering.RunDao;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.impl.RunImpl;
import org.telscenter.sail.webapp.domain.impl.RunParameters;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.domain.project.impl.ProjectImpl;

/**
 * Test class for RunServiceImpl class
 * 
 * @author Hiroki Terashima
 * @version $Id$
 */
public class RunServiceImplTest extends TestCase {

    private static final String CURNIT_NAME = "name";

    private static final String CURNIT_URL = "url";

    private static final String JNLP_NAME = "jname";

    private static final String JNLP_URL = "jurl";

    private static final Long CURNIT_ID = new Long(3);

	private static final String PROJECT_NAME = "Airbags!!!";

    private static Set<String> periodNames = new HashSet<String>();

    private Set<User> owners = new HashSet<User>();
    
    static {
    	periodNames.add("Period 1");
    	periodNames.add("Period 2");
    }

    private SdsOfferingDao mockSdsOfferingDao;

    private CurnitDao<Curnit> mockCurnitDao;

    private JnlpDao<Jnlp> mockJnlpDao;

    private RunDao<Run> mockRunDao;

    private GroupDao<Group> mockGroupDao;
    
    private RunServiceImpl runServiceImpl;
    
	private AclService<Offering> mockAclService;
	
	private Run run;
	
	private Project project;

    /**
     * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onSetUpInTransaction()
     */
    @SuppressWarnings("unchecked")
    @Override
    protected void setUp() throws Exception {
        super.setUp();

        this.runServiceImpl = new RunServiceImpl();

        this.mockSdsOfferingDao = EasyMock.createMock(SdsOfferingDao.class);
        this.runServiceImpl.setSdsOfferingDao(this.mockSdsOfferingDao);

        this.mockCurnitDao = EasyMock.createMock(CurnitDao.class);
        this.runServiceImpl.setCurnitDao(this.mockCurnitDao);

        this.mockJnlpDao = EasyMock.createMock(JnlpDao.class);
        this.runServiceImpl.setJnlpDao(this.mockJnlpDao);

        this.mockGroupDao = EasyMock.createMock(GroupDao.class);
        this.runServiceImpl.setGroupDao(mockGroupDao);

        this.mockRunDao = EasyMock.createNiceMock(RunDao.class);
        this.runServiceImpl.setRunDao(this.mockRunDao);
        
		this.mockAclService = EasyMock.createMock(AclService.class);
		this.runServiceImpl.setAclService(mockAclService);
        
        User user = new UserImpl();
		owners.add(user);
		
		this.project = new ProjectImpl();
		this.project.setName(PROJECT_NAME);
		
		this.run = new RunImpl();
		this.run.setStarttime(Calendar.getInstance().getTime());
		this.run.setProject(project);
    }

    /**
     * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onTearDownAfterTransaction()
     */
    @Override
    protected void tearDown() throws Exception {
        super.tearDown();
        this.runServiceImpl = null;
        this.mockSdsOfferingDao = null;
        this.mockRunDao = null;
		this.mockAclService = null;
		this.run = null;
    }

    public void testGetRunList() throws Exception {
        List<Run> expectedList = new LinkedList<Run>();
        expectedList.add(new RunImpl());

        EasyMock.expect(this.mockRunDao.getList()).andReturn(expectedList);
        EasyMock.replay(this.mockRunDao);
        assertEquals(expectedList, runServiceImpl.getRunList());
        EasyMock.verify(this.mockRunDao);
    }
    
    public void testGetRunListGivenUser() throws Exception {
    	User user = new UserImpl();
    	List<Group> expectedGroups = new LinkedList<Group>();
    	Group group = new PersistentGroup();
    	group.addMember(user);
    	expectedGroups.add(group);
        List<Run> expectedList = new LinkedList<Run>();
        Run run = new RunImpl();
        Set<Group> groups = new HashSet<Group>();
        groups.add(group);
        run.setPeriods(groups);
        expectedList.add(run);

        EasyMock.expect(this.mockRunDao.getList()).andReturn(expectedList);
        EasyMock.replay(this.mockRunDao);
        assertEquals(expectedList, runServiceImpl.getRunList(user));
        EasyMock.verify(this.mockRunDao);
    }

    public void testCreateRunWithoutPeriods() throws Exception {
        SdsJnlp sdsJnlp = new SdsJnlp();
        sdsJnlp.setName(JNLP_NAME);
        sdsJnlp.setUrl(JNLP_URL);
        Jnlp jnlp = new JnlpImpl();
        jnlp.setSdsJnlp(sdsJnlp);
        List<Jnlp> jnlpList = new ArrayList<Jnlp>();
        jnlpList.add(jnlp);
        EasyMock.expect(this.mockJnlpDao.getList()).andReturn(jnlpList);
        EasyMock.replay(this.mockJnlpDao);

        SdsCurnit sdsCurnit = new SdsCurnit();
        sdsCurnit.setName(CURNIT_NAME);
        sdsCurnit.setUrl(CURNIT_URL);
        Curnit curnit = new CurnitImpl();
        curnit.setSdsCurnit(sdsCurnit);
        EasyMock.expect(this.mockCurnitDao.getById(CURNIT_ID))
                .andReturn(curnit);
        EasyMock.replay(this.mockCurnitDao);

        this.project.setCurnit(curnit);
        this.project.setJnlp(jnlp);

        RunParameters runParameters = new RunParameters();
        runParameters.setName(CURNIT_NAME);
        runParameters.setOwners(owners);
        runParameters.setProject(this.project);
        
        this.mockRunDao.retrieveByRunCode(EasyMock.isA(String.class));
        EasyMock.expectLastCall().andThrow(new ObjectNotFoundException("runcode", Run.class));
        EasyMock.replay(this.mockRunDao);

        Run run = runServiceImpl.createRun(runParameters);
        assertNull(run.getEndtime());
        assertNotNull(run.getRuncode());
        assertTrue(run.getRuncode() instanceof String);

        assertEquals(CURNIT_NAME, run.getSdsOffering().getSdsCurnit().getName());
        assertEquals(CURNIT_URL, run.getSdsOffering().getSdsCurnit().getUrl());
        assertEquals(JNLP_NAME, run.getSdsOffering().getSdsJnlp().getName());
        assertEquals(JNLP_URL, run.getSdsOffering().getSdsJnlp().getUrl());
        assertEquals(CURNIT_NAME, run.getSdsOffering().getName());
        assertEquals(0, run.getPeriods().size());
        EasyMock.verify(this.mockRunDao);
    }

    public void testCreateRunWithPeriods() throws Exception {
        SdsJnlp sdsJnlp = new SdsJnlp();
        sdsJnlp.setName(JNLP_NAME);
        sdsJnlp.setUrl(JNLP_URL);
        Jnlp jnlp = new JnlpImpl();
        jnlp.setSdsJnlp(sdsJnlp);
        List<Jnlp> jnlpList = new ArrayList<Jnlp>();
        jnlpList.add(jnlp);
        EasyMock.expect(this.mockJnlpDao.getList()).andReturn(jnlpList);
        EasyMock.replay(this.mockJnlpDao);

        SdsCurnit sdsCurnit = new SdsCurnit();
        sdsCurnit.setName(CURNIT_NAME);
        sdsCurnit.setUrl(CURNIT_URL);
        Curnit curnit = new CurnitImpl();
        curnit.setSdsCurnit(sdsCurnit);
        EasyMock.expect(this.mockCurnitDao.getById(CURNIT_ID))
                .andReturn(curnit);
        EasyMock.replay(this.mockCurnitDao);

        Group group = null;
        for (String periodName : periodNames) {
        	group = new PersistentGroup();
        	group.setName(periodName);
        	this.mockGroupDao.save(group);
            EasyMock.expectLastCall();
        }
        EasyMock.replay(this.mockGroupDao);

        // TODO LAW figure out how to get this from the beans
        RunParameters runParameters = new RunParameters();
        project.setCurnit(curnit);
        runParameters.setName(CURNIT_NAME);
        runParameters.setPeriodNames(periodNames);
        runParameters.setOwners(owners);
        runParameters.setProject(project);
        
        this.mockRunDao.retrieveByRunCode(EasyMock.isA(String.class));
        EasyMock.expectLastCall().andThrow(new ObjectNotFoundException("runcode", Run.class));
        EasyMock.replay(this.mockRunDao);

        Run run = runServiceImpl.createRun(runParameters);
        assertNull(run.getEndtime());
        assertNotNull(run.getRuncode());
        assertTrue(run.getRuncode() instanceof String);

        assertEquals(CURNIT_NAME, run.getSdsOffering().getSdsCurnit().getName());
        assertEquals(CURNIT_URL, run.getSdsOffering().getSdsCurnit().getUrl());
        assertEquals(JNLP_NAME, run.getSdsOffering().getSdsJnlp().getName());
        assertEquals(JNLP_URL, run.getSdsOffering().getSdsJnlp().getUrl());
        assertEquals(CURNIT_NAME, run.getSdsOffering().getName());
        assertEquals(2, run.getPeriods().size());
        for (Group period : run.getPeriods()) {
        	assertTrue(periodNames.contains(period.getName()));
        }
        EasyMock.verify(this.mockRunDao);
    }
    
    public void testRetrieveById() throws Exception {
    	Run run = new RunImpl();
    	Long runId = new Long(5);
        EasyMock.expect(this.mockRunDao.getById(runId)).andReturn(run);
        EasyMock.replay(this.mockRunDao);
        Run retrievedRun = null;
       	retrievedRun = runServiceImpl.retrieveById(runId);
		
       	assertEquals(run, retrievedRun);
        EasyMock.verify(this.mockRunDao);

        EasyMock.reset(this.mockRunDao);
        EasyMock.expect(this.mockRunDao.getById(runId)).andThrow(new ObjectNotFoundException(runId, Run.class));
        EasyMock.replay(this.mockRunDao);
        retrievedRun = null;
        try {
			retrievedRun = runServiceImpl.retrieveById(runId);
			fail("ObjectNotFoundException not thrown but should have been thrown");
		} catch (ObjectNotFoundException e) {
		}
		
		assertNull(retrievedRun);
        EasyMock.verify(this.mockRunDao);
    }
    
    public void testRetrieveRunByRuncode() throws Exception {
    	Run run = new RunImpl();

    	String good_runcode = "falcon8989";
    	String bad_runcode = "badbadbad3454";
    	EasyMock.expect(this.mockRunDao.retrieveByRunCode(good_runcode)).andReturn(run);
        EasyMock.replay(this.mockRunDao);

    	Run retrievedRun = null;
    	try {
    		retrievedRun = runServiceImpl.retrieveRunByRuncode(good_runcode);
    	} catch (ObjectNotFoundException e) {
    		fail("ObjectNotFoundException thrown but should not have been thrown");
    	}
    	assertEquals(run, retrievedRun);
        EasyMock.verify(this.mockRunDao);

        EasyMock.reset(this.mockRunDao);
    	EasyMock.expect(this.mockRunDao.retrieveByRunCode(bad_runcode)).andThrow(new ObjectNotFoundException(bad_runcode, Run.class));
        EasyMock.replay(this.mockRunDao);
        retrievedRun = null;
        try {
			retrievedRun = runServiceImpl.retrieveRunByRuncode(bad_runcode);
			fail("ObjectNotFoundException not thrown but should have been thrown");
		} catch (ObjectNotFoundException e) {
		}

		assertNull(retrievedRun);
        EasyMock.verify(this.mockRunDao);
    }
    
    public void testEndRun_on_Ongoing_Run() {
    	// this test also tests the isEnded() method.
    	assertNull(run.getEndtime());
    	assertFalse(run.isEnded());
    	this.mockRunDao.save(run);
    	EasyMock.expectLastCall();
    	EasyMock.replay(this.mockRunDao);
    	runServiceImpl.endRun(run);

    	assertTrue(run.isEnded());
    	assertNotNull(run.getEndtime());
    	assertTrue(!run.getStarttime().after(run.getEndtime()));
        EasyMock.verify(this.mockRunDao);
    }

    public void testEndRun_on_Ended_Run() {
    	// this test also tests the isEnded() method.
    	Date endtime = Calendar.getInstance().getTime();
    	run.setEndtime(endtime);
    	assertTrue(run.isEnded());
    	EasyMock.replay(this.mockRunDao);
    	runServiceImpl.endRun(run);

    	assertNotNull(run.getEndtime());
    	assertTrue(run.isEnded());
    	// check that endtime didn't change
    	assertEquals(endtime, run.getEndtime());
    	assertTrue(!run.getStarttime().after(run.getEndtime()));
        EasyMock.verify(this.mockRunDao);
    }

    public void testStartRun_on_Ongoing_Run() {
    	// this test also tests the isEnded() method.
    	assertNull(run.getEndtime());
    	assertFalse(run.isEnded());
    	EasyMock.replay(this.mockRunDao);
    	runServiceImpl.startRun(run);

    	assertFalse(run.isEnded());
    	assertNull(run.getEndtime());
        EasyMock.verify(this.mockRunDao);
    }
    
    public void testStartRun_on_Ended_Run() {
    	// this test also tests the isEnded() method.
    	Date endtime = Calendar.getInstance().getTime();
    	run.setEndtime(endtime);
    	assertTrue(run.isEnded());
    	assertTrue(!run.getStarttime().after(run.getEndtime()));
    	EasyMock.replay(this.mockRunDao);
    	runServiceImpl.startRun(run);

    	assertNull(run.getEndtime());
    	assertFalse(run.isEnded());
        EasyMock.verify(this.mockRunDao);
    }
    
    public void testGetWorkgroups() {
    	assertTrue(true);
    	// TODO PatrickLawler test testGetWorkgroups
    }
    // TODO HT: test when duplicate runcode is generated by the
    // runcode generator http://www.telscenter.org/jira//browse/TELSP-202
    
    // TODO HT: test creating a run without specifying a project
}
