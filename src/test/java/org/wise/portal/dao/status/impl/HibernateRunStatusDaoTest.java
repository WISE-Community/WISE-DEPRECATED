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
package org.wise.portal.dao.status.impl;

import static org.junit.Assert.assertEquals;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Map;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.wise.portal.junit.AbstractTransactionalDbTests;
import org.wise.vle.domain.status.RunStatus;

/**
 * @author Eric Khumalo
 */
@SpringBootTest
@RunWith(SpringRunner.class)
public class HibernateRunStatusDaoTest extends AbstractTransactionalDbTests {

    private final String status =  "status";

    @Autowired
    private HibernateRunStatusDao runStatusDao;

    @Before
    public void setUp() throws Exception {
        super.setUp();
    }

    @Test
    public void testSaveRunStatus() {
        Long runId = 1L;
        Timestamp timeStamp = new Timestamp(Calendar.getInstance().getTimeInMillis());
        runStatusDao.save(createMockRunStatus(runId, timeStamp));
        toilet.flush();

        List<?> fetchedRunStatusList  = retrieveRunStatusFromDb();
        Map<?, ?> fetchedRunStatusMap = (Map<?, ?>) fetchedRunStatusList.get(0);
        
        assertEquals(runId, fetchedRunStatusMap.get("RUNID"));
        assertEquals(status, fetchedRunStatusMap.get("STATUS"));
        assertEquals(timeStamp, fetchedRunStatusMap.get("TIMESTAMP"));
    }

    @Test
    public void testgetRunStatusByRunIdSuccess() {
        ArrayList<Timestamp> mockTimeStamps = new ArrayList<Timestamp>();
        Long runId = 73L;
        int numRunStatus = 10;
        for (int i = 0; i < numRunStatus; i++) {
            Timestamp timeStamp = new Timestamp(Calendar.getInstance().getTimeInMillis());
            runStatusDao.save(createMockRunStatus(runId, timeStamp));
            toilet.flush();
            mockTimeStamps.add(timeStamp);
        }

        List<?> fetchedRunStatusList  = retrieveRunStatusByRunIdFromDb(runId);

        for (int i = 0; i < numRunStatus; i++) {
            Map<?, ?> fetchedRunStatusMap = (Map<?, ?>) fetchedRunStatusList.get(i);
        
            assertEquals(runId, fetchedRunStatusMap.get("RUNID"));
            assertEquals(status, fetchedRunStatusMap.get("STATUS"));
            assertEquals(mockTimeStamps.get(i), fetchedRunStatusMap.get("TIMESTAMP"));
        }
    }

    @Test
    public void testgetRunStatusByRunIdFailure() {
        Long existingRunId = 37L;
        Long notFoundRunId = 999L;
        Timestamp timeStamp = new Timestamp(Calendar.getInstance().getTimeInMillis());
        runStatusDao.save(createMockRunStatus(existingRunId, timeStamp));
        toilet.flush();

        List<?> fetchedRunStatusList  = retrieveRunStatusByRunIdFromDb(notFoundRunId);
        
        assertEquals(true, fetchedRunStatusList.isEmpty());

        fetchedRunStatusList  = retrieveRunStatusByRunIdFromDb(existingRunId);
        Map<?, ?> fetchedRunStatusMap = (Map<?, ?>) fetchedRunStatusList.get(0);
        
        assertEquals(existingRunId, fetchedRunStatusMap.get("RUNID"));
        assertEquals(status, fetchedRunStatusMap.get("STATUS"));
        assertEquals(timeStamp, fetchedRunStatusMap.get("TIMESTAMP"));
    }

    private RunStatus createMockRunStatus(Long runId, Timestamp timeStamp) {
        RunStatus runStatus = new RunStatus();
        runStatus.setRunId(runId);
        runStatus.setStatus(status);
        runStatus.setTimestamp(timeStamp);
        return runStatus;
    }

    private List<?> retrieveRunStatusFromDb() {
        return jdbcTemplate.queryForList("SELECT * FROM runstatus", (Object[]) null);
    }

    private List<?> retrieveRunStatusByRunIdFromDb(Long runId) {
        return jdbcTemplate.queryForList("SELECT * FROM runstatus WHERE runId = " + runId, (Object[]) null);
    }
}
