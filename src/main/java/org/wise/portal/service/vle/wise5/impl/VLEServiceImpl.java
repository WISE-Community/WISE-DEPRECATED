/**
 * Copyright (c) 2008-2015 Regents of the University of California (Regents).
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.service.vle.wise5.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.work.ComponentStateDao;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.workgroup.WISEWorkgroup;
import org.wise.portal.service.group.GroupService;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.vle.wise5.VLEService;
import org.wise.portal.service.workgroup.WorkgroupService;
import org.wise.vle.domain.work.ComponentState;

import java.sql.Timestamp;
import java.util.Calendar;
import java.util.List;

/**
 * Services for the WISE Virtual Learning Environment (WISE VLE v5)
 * @author Hiroki Terashima
 */
@Service("wise5VLEService")
public class VLEServiceImpl implements VLEService {

    @Autowired
    private ComponentStateDao componentStateDao;

    @Autowired
    private RunService runService;

    @Autowired
    private GroupService groupService;

    @Autowired
    private WorkgroupService workgroupService;

    @Override
    public List<ComponentState> getComponentStates(Integer id, Integer runId, Integer periodId, Integer workgroupId,
                                                   String nodeId, String componentId, String componentType) {
        Run run = null;
        if (runId != null) {
            try {
                boolean doEagerFetch = false;
                run = runService.retrieveById(new Long(runId), doEagerFetch);
            } catch (ObjectNotFoundException e) {
                e.printStackTrace();
            }
        }
        Group period = null;
        if (periodId != null) {
            try {
                period = groupService.retrieveById(new Long(periodId));
            } catch (ObjectNotFoundException e) {
                e.printStackTrace();
            }
        }
        WISEWorkgroup workgroup = null;
        if (workgroupId != null) {
            try {
                workgroup = (WISEWorkgroup) workgroupService.retrieveById(new Long(workgroupId));
            } catch (ObjectNotFoundException e) {
                e.printStackTrace();
            }
        }

        return componentStateDao.getComponentStatesByParams(id, run, period, workgroup, nodeId, componentId, componentType);
    }

    @Override
    public ComponentState saveComponentState(Integer id, Integer runId, Integer periodId, Integer workgroupId,
                                             String nodeId, String componentId, String componentType,
                                             String clientSaveTime, String studentData) {
        ComponentState componentState;
        if (id != null) {
            // if the id is passed in, the client is requesting an update, so fetch the ComponentState from data store
            List<ComponentState> componentStates = getComponentStates(id, null, null, null, null, null, null);
            if (componentStates != null && componentStates.size() > 0) {
                // TODO: maybe we want a getComponentStateById method here?
                componentState = componentStates.get(0);
            } else {
                return null;
            }
        } else {
            // the id was not passed in, so we're creating a new ComponentState from scratch
            componentState = new ComponentState();
        }
        if (runId != null) {
            try {
                boolean doEagerFetch = false;
                componentState.setRun(runService.retrieveById(new Long(runId), doEagerFetch));
            } catch (ObjectNotFoundException e) {
                e.printStackTrace();
            }
        }
        if (periodId != null) {
            try {
                componentState.setPeriod(groupService.retrieveById(new Long(periodId)));
            } catch (ObjectNotFoundException e) {
                e.printStackTrace();
            }
        }
        if (workgroupId != null) {
            try {
                componentState.setWorkgroup((WISEWorkgroup) workgroupService.retrieveById(new Long(workgroupId)));
            } catch (ObjectNotFoundException e) {
                e.printStackTrace();
            }
        }
        if (nodeId != null) {
            componentState.setNodeId(nodeId);
        }
        if (componentId != null) {
            componentState.setComponentId(componentId);
        }
        if (componentType != null) {
            componentState.setComponentType(componentType);
        }

        if (clientSaveTime != null) {
            Timestamp clientSaveTimestamp = new Timestamp(new Long(clientSaveTime));
            componentState.setClientSaveTime(clientSaveTimestamp);
        }

        // set postTime
        Calendar now = Calendar.getInstance();
        Timestamp serverSaveTimestamp = new Timestamp(now.getTimeInMillis());
        componentState.setServerSaveTime(serverSaveTimestamp);

        if (studentData != null) {
            componentState.setStudentData(studentData);
        }

        componentStateDao.save(componentState);

        return componentState;
    }
}
