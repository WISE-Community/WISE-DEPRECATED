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
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.annotation.wise5.AnnotationDao;
import org.wise.portal.dao.work.ComponentStateDao;
import org.wise.portal.dao.work.EventDao;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.workgroup.WISEWorkgroup;
import org.wise.portal.service.group.GroupService;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.vle.wise5.VLEService;
import org.wise.portal.service.workgroup.WorkgroupService;
import org.wise.vle.domain.annotation.wise5.Annotation;
import org.wise.vle.domain.work.ComponentState;
import org.wise.vle.domain.work.Event;

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
    private EventDao eventDao;

    @Autowired @Qualifier("wise5AnnotationDao")
    private AnnotationDao annotationDao;

    @Autowired
    private RunService runService;

    @Autowired
    private GroupService groupService;

    @Autowired
    private WorkgroupService workgroupService;

    @Override
    public List<ComponentState> getComponentStates(Integer id, Integer runId, Integer periodId, Integer workgroupId,
                                                   Boolean isAutoSave, String nodeId,
                                                   String componentId, String componentType) {
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

        return componentStateDao.getComponentStatesByParams(id, run, period, workgroup,
                isAutoSave, nodeId, componentId, componentType);
    }

    @Override
    public ComponentState saveComponentState(Integer id, Integer runId, Integer periodId, Integer workgroupId,
                                             Boolean isAutoSave, String nodeId, String componentId, String componentType,
                                             String studentData, String clientSaveTime) {
        ComponentState componentState;
        if (id != null) {
            // if the id is passed in, the client is requesting an update, so fetch the ComponentState from data store
            try {
                componentState = (ComponentState) componentStateDao.getById(id);
            } catch (ObjectNotFoundException e) {
                e.printStackTrace();
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

        if (isAutoSave != null) {
            componentState.setIsAutoSave(isAutoSave);
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

    @Override
    public List<Event> getEvents(Integer id, Integer runId, Integer periodId, Integer workgroupId,
                                 String nodeId, String componentId, String componentType,
                                 String context, String category, String event) {
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

        return eventDao.getEventsByParams(id, run, period, workgroup, nodeId, componentId, componentType,
                context, category, event);
    }

    @Override
    public Event saveEvent(Integer id, Integer runId, Integer periodId, Integer workgroupId,
                           String nodeId, String componentId, String componentType,
                           String context, String category, String eventString, String data,
                           String clientSaveTime) throws ObjectNotFoundException {
        Event event;
        if (id != null) {
            // if the id is passed in, the client is requesting an update, so fetch the Event from data store
            List<Event> events = getEvents(id, null, null, null, null, null, null, null, null, null);
            if (events != null && events.size() > 0) {
                // TODO: maybe we want a getEventById method here?
                event = events.get(0);
            } else {
                return null;
            }
        } else {
            // the id was not passed in, so we're creating a new Event from scratch
            event = new Event();
        }
        if (runId != null) {
            try {
                boolean doEagerFetch = false;
                event.setRun(runService.retrieveById(new Long(runId), doEagerFetch));
            } catch (ObjectNotFoundException e) {
                e.printStackTrace();
            }
        }
        if (periodId != null) {
            try {
                event.setPeriod(groupService.retrieveById(new Long(periodId)));
            } catch (ObjectNotFoundException e) {
                e.printStackTrace();
            }
        }
        if (workgroupId != null) {
            try {
                event.setWorkgroup((WISEWorkgroup) workgroupService.retrieveById(new Long(workgroupId)));
            } catch (ObjectNotFoundException e) {
                e.printStackTrace();
            }
        }
        if (nodeId != null) {
            event.setNodeId(nodeId);
        }
        if (componentId != null) {
            event.setComponentId(componentId);
        }
        if (componentType != null) {
            event.setComponentType(componentType);
        }
        if (context != null) {
            event.setContext(context);
        }
        if (category != null) {
            event.setCategory(category);
        }
        if (eventString != null) {
            event.setEvent(eventString);
        }
        if (data != null) {
            event.setData(data);
        }
        if (clientSaveTime != null) {
            Timestamp clientSaveTimestamp = new Timestamp(new Long(clientSaveTime));
            event.setClientSaveTime(clientSaveTimestamp);
        }
        // set postTime
        Calendar now = Calendar.getInstance();
        Timestamp serverSaveTimestamp = new Timestamp(now.getTimeInMillis());
        event.setServerSaveTime(serverSaveTimestamp);

        eventDao.save(event);
        return event;
    }

    @Override
    public List<Annotation> getAnnotations(
            Integer id, Integer runId, Integer periodId, Integer fromWorkgroupId, Integer toWorkgroupId,
            String nodeId, String componentId, Integer componentStateId, String type) {
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
        WISEWorkgroup fromWorkgroup = null;
        if (fromWorkgroupId != null) {
            try {
                fromWorkgroup = (WISEWorkgroup) workgroupService.retrieveById(new Long(fromWorkgroupId));
            } catch (ObjectNotFoundException e) {
                e.printStackTrace();
            }
        }
        WISEWorkgroup toWorkgroup = null;
        if (toWorkgroupId != null) {
            try {
                toWorkgroup = (WISEWorkgroup) workgroupService.retrieveById(new Long(toWorkgroupId));
            } catch (ObjectNotFoundException e) {
                e.printStackTrace();
            }
        }
        ComponentState componentState = null;
        if (componentStateId != null) {
            try {
                componentState = (ComponentState) componentStateDao.getById(componentStateId);
            } catch (ObjectNotFoundException e) {
                e.printStackTrace();
            }
        }

        return annotationDao.getAnnotationsByParams(id, run, period, fromWorkgroup, toWorkgroup,
                nodeId, componentId, componentState, type);
    }

    @Override
    public Annotation saveAnnotation(
            Integer id, Integer runId, Integer periodId, Integer fromWorkgroupId, Integer toWorkgroupId,
            String nodeId, String componentId, Integer componentStateId,
            String type, String data, String clientSaveTime) throws ObjectNotFoundException {
        Annotation annotation;
        if (id != null) {
            // if the id is passed in, the client is requesting an update, so fetch the Event from data store
            List<Annotation> annotations = getAnnotations(id, null, null, null, null, null, null, null, null);
            if (annotations != null && annotations.size() > 0) {
                // TODO: maybe we want a getEventById method here?
                annotation = annotations.get(0);
            } else {
                return null;
            }
        } else {
            // the id was not passed in, so we're creating a new Event from scratch
            annotation = new Annotation();
        }
        if (runId != null) {
            try {
                boolean doEagerFetch = false;
                annotation.setRun(runService.retrieveById(new Long(runId), doEagerFetch));
            } catch (ObjectNotFoundException e) {
                e.printStackTrace();
            }
        }
        if (periodId != null) {
            try {
                annotation.setPeriod(groupService.retrieveById(new Long(periodId)));
            } catch (ObjectNotFoundException e) {
                e.printStackTrace();
            }
        }
        if (fromWorkgroupId != null) {
            try {
                annotation.setFromWorkgroup((WISEWorkgroup) workgroupService.retrieveById(new Long(fromWorkgroupId)));
            } catch (ObjectNotFoundException e) {
                e.printStackTrace();
            }
        }
        if (toWorkgroupId != null) {
            try {
                annotation.setToWorkgroup((WISEWorkgroup) workgroupService.retrieveById(new Long(toWorkgroupId)));
            } catch (ObjectNotFoundException e) {
                e.printStackTrace();
            }
        }
        if (nodeId != null) {
            annotation.setNodeId(nodeId);
        }
        if (componentId != null) {
            annotation.setComponentId(componentId);
        }
        if (componentStateId != null) {
            try {
                annotation.setComponentState((ComponentState) componentStateDao.getById(componentStateId));
            } catch (ObjectNotFoundException e) {
                e.printStackTrace();
            }
        }
        if (type != null) {
            annotation.setType(type);
        }
        if (data != null) {
            annotation.setData(data);
        }
        if (clientSaveTime != null) {
            Timestamp clientSaveTimestamp = new Timestamp(new Long(clientSaveTime));
            annotation.setClientSaveTime(clientSaveTimestamp);
        }
        // set postTime
        Calendar now = Calendar.getInstance();
        Timestamp serverSaveTimestamp = new Timestamp(now.getTimeInMillis());
        annotation.setServerSaveTime(serverSaveTimestamp);

        annotationDao.save(annotation);
        return annotation;
    }
}
