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
package org.wise.portal.dao.run.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.group.impl.HibernateGroupDao;
import org.wise.portal.dao.project.impl.HibernateProjectDao;
import org.wise.portal.dao.user.impl.HibernateUserDao;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.PersistentUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.ProjectImpl;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.junit.AbstractTransactionalDbTests;

/**
 * @author Hiroki Terashima
 */
@SpringBootTest
@RunWith(SpringRunner.class)
public class HibernateRunDaoTest extends AbstractTransactionalDbTests {

  private static final String projectName = "Airbags";

	private static Project project;

    private Group group1, group2, group3;

    private final Date startTime = Calendar.getInstance().getTime();

    private Date endTime = null;

    private final String runcode = "diamonds12345";

    private final String runcodeNotInDB = "diamonds54321";

    private RunImpl run;

    @Autowired
    private HibernateRunDao runDao;

    @Autowired
    private HibernateGroupDao groupDao;

    @Autowired
    private HibernateUserDao userDao;

    @Autowired
    private HibernateProjectDao projectDao;

    private Long projectId = 1L;

    @Before
    public void setUp() throws Exception {
        super.setUp();
        verifyRunAndJoinTablesAreEmpty();
        group1 = new PersistentGroup();
        group1.setName("Period 1");

        group2 = new PersistentGroup();
        group2.setName("Period 2");

        group3 = new PersistentGroup();
        group3.setName("Period 3");

        this.run = new RunImpl();
        this.run.setId(projectId++);
        this.run.setStarttime(startTime);
        this.run.setRuncode(runcode);
        this.run.setArchiveReminderTime(new Date());
        this.run.setPostLevel(5);

        MutableUserDetails userDetails = new PersistentUserDetails();
        userDetails.setPassword(projectName);
        userDetails.setUsername(projectName);
        User owner = new UserImpl();
        owner.setUserDetails(userDetails);
        userDao.save(owner);
        this.sessionFactory.getCurrentSession().flush();
        this.run.setOwner(owner);

        project = new ProjectImpl();
        project.setId(projectId++);
        project.setName("Airbags");
        project.setDateCreated(new Date());
        project.setOwner(owner);
        projectDao.save(project);
        this.sessionFactory.getCurrentSession().flush();
        this.run.setProject(project);
    }

    private void assertNumRuns(int expected) {
      assertEquals("Number of rows in the [runs] table.", expected, countRowsInTable("runs"));
   }

    @Test
    public void testSave() {
        this.runDao.save(this.run);
        this.sessionFactory.getCurrentSession().flush();

        assertNumRuns(1);
        List<?> runsList = retrieveRunListFromDb();
        assertEquals(0, retrieveRunsRelatedToGroupsListFromDb().size());
        assertEquals(0, retrieveRunsAndGroupsListFromDb().size());

        Map<?, ?> runMap = (Map<?, ?>) runsList.get(0);
        assertEquals(this.startTime, runMap
                .get(RunImpl.COLUMN_NAME_STARTTIME.toUpperCase()));
        assertEquals(this.runcode, runMap.get(RunImpl.COLUMN_NAME_RUN_CODE
                .toUpperCase()));
        assertNull(runMap.get(RunImpl.COLUMN_NAME_ENDTIME.toUpperCase()));

        Set<Group> periods = new TreeSet<Group>();
        periods.add(group1);
        periods.add(group2);
        this.groupDao.save(group1);
        this.groupDao.save(group2);
        this.run.setPeriods(periods);

        this.runDao.save(this.run);
        this.toilet.flush();

        runsList = retrieveRunListFromDb();
        assertNumRuns(1);
        // TODO retrieve run and test that the periods saved correctly

        this.endTime = Calendar.getInstance().getTime();
        this.run.setEndtime(this.endTime);

        this.runDao.save(this.run);
        this.toilet.flush();

        runsList = retrieveRunListFromDb();
        runMap = (Map<?, ?>) runsList.get(0);
        assertEquals(this.endTime, runMap.get(RunImpl.COLUMN_NAME_ENDTIME
            .toUpperCase()));
    }

    @Test
    public void testSave_withoutProject() {
        this.run.setProject(null);
        try {
          this.runDao.save(this.run);
          this.sessionFactory.getCurrentSession().flush();
        	fail("Exception expected to be thrown but was not");
        } catch (Exception e) {
        }
    }

    @Test
    public void testRetrieveByRunCode() throws Exception {
        this.runDao.save(this.run);
        this.sessionFactory.getCurrentSession().flush();

        Run run = this.runDao.retrieveByRunCode(runcode);
        assertTrue(run instanceof RunImpl);
        assertTrue(run.getClass() == RunImpl.class);

        assertEquals(run.getRuncode(), runcode);
        assertEquals(run.getStarttime(), startTime);
    }

    @Test
    public void testRetrieveNonExistingRuncode() {
        try {
        	this.runDao.retrieveByRunCode(runcodeNotInDB);
        	fail ("Expected ObjectNotFoundException");
        } catch (ObjectNotFoundException e) {
        }
    }

    @Test
    public void testGetById() throws Exception {
        this.runDao.save(this.run);
        this.sessionFactory.getCurrentSession().flush();
        assertNotNull(this.runDao.getById(this.run.getId()));
    }

    private void verifyRunAndJoinTablesAreEmpty() {
        assertTrue(this.retrieveRunListFromDb().isEmpty());
        assertTrue(this.retrieveRunsRelatedToGroupsListFromDb().isEmpty());
    }

    private List<?> retrieveRunsRelatedToGroupsListFromDb() {
        return this.jdbcTemplate.queryForList("SELECT * FROM "
                + RunImpl.PERIODS_JOIN_TABLE_NAME);
    }

    private List<?> retrieveRunListFromDb() {
        return this.jdbcTemplate.queryForList("SELECT * FROM "
                + RunImpl.DATA_STORE_NAME, (Object[]) null);
    }

    private List<?> retrieveRunsAndGroupsListFromDb() {
        return this.jdbcTemplate.queryForList("SELECT * FROM "
                + RunImpl.DATA_STORE_NAME + ", " + RunImpl.PERIODS_JOIN_TABLE_NAME
                + ", " + PersistentGroup.DATA_STORE_NAME + " WHERE "
                + RunImpl.DATA_STORE_NAME + ".id = " + RunImpl.PERIODS_JOIN_TABLE_NAME
                + "." + RunImpl.RUNS_JOIN_COLUMN_NAME + " AND "
                + PersistentGroup.DATA_STORE_NAME + ".id = "
                + RunImpl.PERIODS_JOIN_TABLE_NAME + "."
                + RunImpl.PERIODS_JOIN_COLUMN_NAME, (Object[]) null);
    }
}
