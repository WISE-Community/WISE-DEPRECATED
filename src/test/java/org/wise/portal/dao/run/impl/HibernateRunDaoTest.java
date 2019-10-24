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

import java.util.ArrayList;
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
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.ProjectImpl;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.junit.AbstractTransactionalDbTests;

/**
 * @author Hiroki Terashima
 */
@SpringBootTest
@RunWith(SpringRunner.class)
public class HibernateRunDaoTest extends AbstractTransactionalDbTests {

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

        run = new RunImpl();
        run.setId(projectId++);
        run.setStarttime(startTime);
        run.setRuncode(runcode);
        run.setArchiveReminderTime(new Date());
        run.setPostLevel(5);

        User owner = createUser();
        userDao.save(owner);
        toilet.flush();
        run.setOwner(owner);

        project = new ProjectImpl();
        project.setId(projectId++);
        project.setName("Airbags");
        project.setDateCreated(new Date());
        project.setOwner(owner);
        projectDao.save(project);
        toilet.flush();
        run.setProject(project);
    }

    private void assertNumRuns(int expected) {
      assertEquals("Number of rows in the [runs] table.", expected, countRowsInTable("runs"));
   }

    @Test
    public void save_NewRun_Success() {
        runDao.save(run);
        toilet.flush();

        assertNumRuns(1);
        List<?> runsList = retrieveRunListFromDb();
        assertEquals(0, retrieveRunsRelatedToGroupsListFromDb().size());
        assertEquals(0, retrieveRunsAndGroupsListFromDb().size());

        Map<?, ?> runMap = (Map<?, ?>) runsList.get(0);
        assertEquals(startTime, runMap
                .get(RunImpl.COLUMN_NAME_STARTTIME.toUpperCase()));
        assertEquals(runcode, runMap.get(RunImpl.COLUMN_NAME_RUN_CODE
                .toUpperCase()));
        assertNull(runMap.get(RunImpl.COLUMN_NAME_ENDTIME.toUpperCase()));

        Set<Group> periods = new TreeSet<Group>();
        periods.add(group1);
        periods.add(group2);
        groupDao.save(group1);
        groupDao.save(group2);
        run.setPeriods(periods);

        runDao.save(run);
        toilet.flush();

        runsList = retrieveRunListFromDb();
        assertNumRuns(1);

        List<?> runsAndGroups = retrieveRunsAndGroupsListFromDb();
        assertEquals(1, runsList.size());
        assertEquals(2, retrieveRunsRelatedToGroupsListFromDb().size());
        assertEquals(2, runsAndGroups.size());

        List<String> periodNames = new ArrayList<String>();
        periodNames.add(group1.getName());
        periodNames.add(group2.getName());

        for (int i = 0; i < runsAndGroups.size(); i++) {
            Map<?, ?> allRunMap = (Map<?, ?>) runsAndGroups.get(i);
            String periodName = (String) allRunMap
                    .get("periodName");
            assertTrue(periodNames.contains(periodName));
            periodNames.remove(periodName);
        }

        endTime = Calendar.getInstance().getTime();
        run.setEndtime(endTime);

        runDao.save(run);
        toilet.flush();

        runsList = retrieveRunListFromDb();
        runMap = (Map<?, ?>) runsList.get(0);
        assertEquals(endTime, runMap.get(RunImpl.COLUMN_NAME_ENDTIME
            .toUpperCase()));
    }

    @Test
    public void save_WithoutProject_ShouldThrowException() {
        run.setProject(null);
        try {
          runDao.save(run);
          toilet.flush();
        	fail("Exception expected to be thrown but was not");
        } catch (Exception e) {
        }
    }

    @Test
    public void retrieveByRunCode_ValidRunCode_Success() throws Exception {
        runDao.save(run);
        toilet.flush();

        Run run = runDao.retrieveByRunCode(runcode);
        assertTrue(run instanceof RunImpl);
        assertTrue(run.getClass() == RunImpl.class);

        assertEquals(run.getRuncode(), runcode);
        assertEquals(run.getStarttime(), startTime);
    }

    @Test
    public void retrieveByRunCode_NonExistingRuncode_ShouldThrowException() {
        try {
        	runDao.retrieveByRunCode(runcodeNotInDB);
        	fail ("Expected ObjectNotFoundException");
        } catch (ObjectNotFoundException e) {
        }
    }

    @Test
    public void getById_ExistingRunId_Success() throws Exception {
        runDao.save(run);
        toilet.flush();
        assertNotNull(runDao.getById(run.getId()));
    }

    private void verifyRunAndJoinTablesAreEmpty() {
        assertTrue(retrieveRunListFromDb().isEmpty());
        assertTrue(retrieveRunsRelatedToGroupsListFromDb().isEmpty());
    }

    private List<?> retrieveRunsRelatedToGroupsListFromDb() {
        return jdbcTemplate.queryForList("SELECT * FROM "
                + RunImpl.PERIODS_JOIN_TABLE_NAME);
    }

    private List<?> retrieveRunListFromDb() {
        return jdbcTemplate.queryForList("SELECT * FROM "
                + RunImpl.DATA_STORE_NAME, (Object[]) null);
    }

    private List<?> retrieveRunsAndGroupsListFromDb() {
        return jdbcTemplate.queryForList("SELECT *, " + PersistentGroup.DATA_STORE_NAME + ".name as periodName FROM "
                + RunImpl.DATA_STORE_NAME + ", " + RunImpl.PERIODS_JOIN_TABLE_NAME
                + ", " + PersistentGroup.DATA_STORE_NAME + " WHERE "
                + RunImpl.DATA_STORE_NAME + ".id = " + RunImpl.PERIODS_JOIN_TABLE_NAME
                + "." + RunImpl.RUNS_JOIN_COLUMN_NAME + " AND "
                + PersistentGroup.DATA_STORE_NAME + ".id = "
                + RunImpl.PERIODS_JOIN_TABLE_NAME + "."
                + RunImpl.PERIODS_JOIN_COLUMN_NAME, (Object[]) null);
    }
}
