/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
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

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.achievement.AchievementDao;
import org.wise.portal.dao.annotation.wise5.AnnotationDao;
import org.wise.portal.dao.notification.NotificationDao;
import org.wise.portal.dao.work.NotebookItemDao;
import org.wise.portal.dao.work.StudentAssetDao;
import org.wise.portal.dao.work.StudentWorkDao;
import org.wise.portal.dao.work.EventDao;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.service.group.GroupService;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.vle.wise5.VLEService;
import org.wise.portal.service.workgroup.WorkgroupService;
import org.wise.vle.domain.achievement.Achievement;
import org.wise.vle.domain.annotation.wise5.Annotation;
import org.wise.vle.domain.notification.Notification;
import org.wise.vle.domain.work.Event;
import org.wise.vle.domain.work.NotebookItem;
import org.wise.vle.domain.work.StudentAsset;
import org.wise.vle.domain.work.StudentWork;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.List;

/**
 * Services for the WISE Virtual Learning Environment (WISE VLE v5)
 * @author Hiroki Terashima
 */
@Service("wise5VLEService")
public class VLEServiceImpl implements VLEService {

  @Autowired
  private StudentWorkDao studentWorkDao;

  @Autowired
  private EventDao eventDao;

  @Autowired
  private AchievementDao achievementDao;

  @Autowired @Qualifier("wise5AnnotationDao")
  private AnnotationDao annotationDao;

  @Autowired
  private StudentAssetDao studentAssetDao;

  @Autowired
  private NotebookItemDao notebookItemDao;

  @Autowired
  private NotificationDao notificationDao;

  @Autowired
  private ProjectService projectService;

  @Autowired
  private RunService runService;

  @Autowired
  private UserService userService;

  @Autowired
  private GroupService groupService;

  @Autowired
  private WorkgroupService workgroupService;

  @Override
  public List<StudentWork> getStudentWorkList(
      Integer id, Integer runId, Integer periodId, Integer workgroupId,
      Boolean isAutoSave, Boolean isSubmit, String nodeId, String componentId, String componentType,
      List<JSONObject> components, Boolean onlyGetLatest) {
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
    Workgroup workgroup = null;
    if (workgroupId != null) {
      try {
        workgroup = workgroupService.retrieveById(new Long(workgroupId));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }

    return studentWorkDao.getStudentWorkListByParams(id, run, period, workgroup,
      isAutoSave, isSubmit, nodeId, componentId, componentType, components, onlyGetLatest);
  }

  public JSONArray getNotebookExport(Integer runId) {
    SimpleDateFormat df = new SimpleDateFormat("YYYY/MM/dd HH:mm:ss");
    List<Object[]> notebookItemExport = notebookItemDao.getNotebookItemExport(runId);
    for (int i = 1; i < notebookItemExport.size(); i++) {
      // skip header row
      Object[] notebookItemExportRow = notebookItemExport.get(i);

      // format the timestamps so they don't have a trailing ".0" at the end and mess up display in excel
      Timestamp notebookItemExportRowClientSaveTimeTimestamp = (Timestamp) notebookItemExportRow[7];
      notebookItemExportRow[7] = df.format(notebookItemExportRowClientSaveTimeTimestamp);
      Timestamp notebookItemExportRowServerSaveTimeTimestamp = (Timestamp) notebookItemExportRow[8];
      notebookItemExportRow[8] = df.format(notebookItemExportRowServerSaveTimeTimestamp);

      String notebookItemExportRowStudentDataString = (String) notebookItemExportRow[10];
      try {
        notebookItemExportRow[10] = new JSONObject(notebookItemExportRowStudentDataString);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return new JSONArray(notebookItemExport);
  }

  public JSONArray getStudentWorkExport(Integer runId) {
    SimpleDateFormat df = new SimpleDateFormat("YYYY/MM/dd HH:mm:ss");
    List<Object[]> studentWorkExport = studentWorkDao.getStudentWorkExport(runId);
    for (int i = 1; i < studentWorkExport.size(); i++) {
      // skip header row
      Object[] studentWorkExportRow = studentWorkExport.get(i);

      // format the timestamps so they don't have a trailing ".0" at the end and mess up display in excel
      Timestamp studentWorkExportRowClientSaveTimeTimestamp = (Timestamp) studentWorkExportRow[9];
      studentWorkExportRow[9] = df.format(studentWorkExportRowClientSaveTimeTimestamp);
      Timestamp studentWorkExportRowServerSaveTimeTimestamp = (Timestamp) studentWorkExportRow[10];
      studentWorkExportRow[10] = df.format(studentWorkExportRowServerSaveTimeTimestamp);

      // set TRUE=1, FALSE=0 instead of "TRUE" and "FALSE"
      boolean studentWorkExportRowIsAutoSave = (boolean) studentWorkExportRow[7];
      studentWorkExportRow[7] = studentWorkExportRowIsAutoSave ? 1 : 0;

      boolean studentWorkExportRowIsSubmit = (boolean) studentWorkExportRow[8];
      studentWorkExportRow[8] = studentWorkExportRowIsSubmit ? 1 : 0;

      String studentWorkExportRowStudentDataString = (String) studentWorkExportRow[11];
      try {
        studentWorkExportRow[11] = new JSONObject(studentWorkExportRowStudentDataString);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return new JSONArray(studentWorkExport);
  }

  public JSONArray getStudentEventExport(Integer runId) {
    SimpleDateFormat df = new SimpleDateFormat("YYYY/MM/dd HH:mm:ss");
    List<Object[]> studentEventExport = eventDao.getStudentEventExport(runId);
    for (int i = 1; i < studentEventExport.size(); i++) {
      // skip header row
      Object[] studentEventExportRow = studentEventExport.get(i);

      // format the timestamps so they don't have a trailing ".0" at the end and mess up display in excel
      Timestamp studentEventExportRowClientSaveTimeTimestamp = (Timestamp) studentEventExportRow[7];
      studentEventExportRow[7] = df.format(studentEventExportRowClientSaveTimeTimestamp);
      Timestamp studentEventExportRowServerSaveTimeTimestamp = (Timestamp) studentEventExportRow[8];
      studentEventExportRow[8] = df.format(studentEventExportRowServerSaveTimeTimestamp);

      String studentEventExportRowDataString = (String) studentEventExportRow[12];
      try {
        studentEventExportRow[12] = new JSONObject(studentEventExportRowDataString);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return new JSONArray(studentEventExport);
  }

  public JSONArray getNotificationExport(Integer runId) {
    SimpleDateFormat df = new SimpleDateFormat("YYYY/MM/dd HH:mm:ss");
    List<Object[]> notificationExport = notificationDao.getNotificationExport(runId);
    for (int i = 1; i < notificationExport.size(); i++) {
      // skip header row
      Object[] notificationExportRow = notificationExport.get(i);

      // format the timestamps so they don't have a trailing ".0" at the end and mess up display in excel
      Timestamp notificationExportRowServerSaveTimeTimestamp = (Timestamp) notificationExportRow[7];
      notificationExportRow[7] = df.format(notificationExportRowServerSaveTimeTimestamp);
      Timestamp notificationExportRowTimeGeneratedTimestamp = (Timestamp) notificationExportRow[8];
      notificationExportRow[8] = df.format(notificationExportRowTimeGeneratedTimestamp);
      Timestamp notificationExportRowTimeDismissedTimeTimestamp = (Timestamp) notificationExportRow[9];
      if (notificationExportRowTimeDismissedTimeTimestamp != null) {
        notificationExportRow[9] = df.format(notificationExportRowTimeDismissedTimeTimestamp);
      }

      String notificationExportRowStudentDataString = (String) notificationExportRow[13];
      try {
        if (notificationExportRowStudentDataString != null) {
          notificationExportRow[13] = new JSONObject(notificationExportRowStudentDataString);
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return new JSONArray(notificationExport);
  }

  @Override
  public StudentWork saveStudentWork(
      Integer id, Integer runId, Integer periodId, Integer workgroupId,
      Boolean isAutoSave, Boolean isSubmit, String nodeId, String componentId, String componentType,
      String studentData, String clientSaveTime) {
    StudentWork studentWork;
    if (id != null) {
      // if the id is passed in, the client is requesting an update, so fetch the StudentWork from data store
      try {
        studentWork = (StudentWork) studentWorkDao.getById(id);
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
        return null;
      }
    } else {
      // the id was not passed in, so we're creating a new StudentWork from scratch
      studentWork = new StudentWork();
    }
    if (runId != null) {
      try {
        boolean doEagerFetch = false;
        studentWork.setRun(runService.retrieveById(new Long(runId), doEagerFetch));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
    if (periodId != null) {
      try {
        studentWork.setPeriod(groupService.retrieveById(new Long(periodId)));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
    if (workgroupId != null) {
      try {
        studentWork.setWorkgroup(workgroupService.retrieveById(new Long(workgroupId)));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }

    if (isAutoSave != null) {
      studentWork.setIsAutoSave(isAutoSave);
    } else {
      studentWork.setIsAutoSave(false);
    }

    if (isSubmit != null) {
      studentWork.setIsSubmit(isSubmit);
    } else {
      studentWork.setIsSubmit(false);
    }

    if (nodeId != null) {
      studentWork.setNodeId(nodeId);
    }
    if (componentId != null) {
      studentWork.setComponentId(componentId);
    }
    if (componentType != null) {
      studentWork.setComponentType(componentType);
    }
    if (clientSaveTime != null) {
      Timestamp clientSaveTimestamp = new Timestamp(new Long(clientSaveTime));
      studentWork.setClientSaveTime(clientSaveTimestamp);
    }

    // set postTime
    Calendar now = Calendar.getInstance();
    Timestamp serverSaveTimestamp = new Timestamp(now.getTimeInMillis());
    studentWork.setServerSaveTime(serverSaveTimestamp);

    if (studentData != null) {
      studentWork.setStudentData(studentData);
    }

    studentWorkDao.save(studentWork);
    return studentWork;
  }

  @Override
  public List<Event> getEvents(Integer id, Integer runId, Integer periodId, Integer workgroupId,
      String nodeId, String componentId, String componentType, String context, String category,
      String event, List<JSONObject> components) {
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
    Workgroup workgroup = null;
    if (workgroupId != null) {
      try {
        workgroup = workgroupService.retrieveById(new Long(workgroupId));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }

    return eventDao.getEventsByParams(id, run, period, workgroup, nodeId, componentId, componentType,
      context, category, event, components);
  }

  @Override
  public Event saveEvent(Integer id, Integer runId, Integer periodId, Integer workgroupId,
      String nodeId, String componentId, String componentType,  String context, String category,
      String eventString, String data, String clientSaveTime, Integer projectId, Integer userId)
      throws ObjectNotFoundException {
    Event event;
    if (id != null) {
      // if the id is passed in, the client is requesting an update, so fetch the Event from data store
      List<Event> events = getEvents(id, null, null, null, null, null, null, null, null, null, null);
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
        event.setWorkgroup(workgroupService.retrieveById(new Long(workgroupId)));
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
    if (projectId != null) {
      try {
        event.setProject(projectService.getById(new Long(projectId)));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
    if (userId != null) {
      try {
        event.setUser(userService.retrieveById(new Long(userId)));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
    // set postTime
    Calendar now = Calendar.getInstance();
    Timestamp serverSaveTimestamp = new Timestamp(now.getTimeInMillis());
    event.setServerSaveTime(serverSaveTimestamp);

    eventDao.save(event);
    return event;
  }

  public List<Achievement> getAchievements(Integer id, Integer runId, Integer workgroupId,
      String achievementId, String type) {
    Run run = null;
    if (runId != null) {
      try {
        boolean doEagerFetch = false;
        run = runService.retrieveById(new Long(runId), doEagerFetch);
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
    Workgroup workgroup = null;
    if (workgroupId != null) {
      try {
        workgroup = workgroupService.retrieveById(new Long(workgroupId));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }

    return achievementDao.getAchievementsByParams(id, run, workgroup, achievementId, type);
  }

  public Achievement saveAchievement(Integer id, Integer runId, Integer workgroupId,
      String achievementId, String type, String data) {
    Achievement achievement;
    if (id != null) {
      // if the id is passed in, the client is requesting an update, so fetch the Achievement from data store
      try {
        achievement = (Achievement) achievementDao.getById(id);
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
        achievement = new Achievement();  // couldn't find the achievement with the id, so create one from scratch
      }
    } else {
      // the id was not passed in, so we're creating a new Achievement from scratch
      achievement = new Achievement();
    }
    if (runId != null) {
      try {
        boolean doEagerFetch = false;
        achievement.setRun(runService.retrieveById(new Long(runId), doEagerFetch));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
    if (workgroupId != null) {
      try {
        achievement.setWorkgroup(workgroupService.retrieveById(new Long(workgroupId)));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
    if (achievementId != null) {
      achievement.setAchievementId(achievementId);
    }
    if (type != null) {
      achievement.setType(type);
    }
    if (data != null) {
      achievement.setData(data);
    }
    // set postTime
    Calendar now = Calendar.getInstance();
    Timestamp serverSaveTimestamp = new Timestamp(now.getTimeInMillis());
    achievement.setAchievementTime(serverSaveTimestamp);

    achievementDao.save(achievement);
    return achievement;
  }

  @Override
  public List<Annotation> getAnnotations(
      Integer id, Integer runId, Integer periodId, Integer fromWorkgroupId, Integer toWorkgroupId,
      String nodeId, String componentId, Integer studentWorkId, String localNotebookItemId,
      Integer notebookItemId, String type) {
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
    Workgroup fromWorkgroup = null;
    if (fromWorkgroupId != null) {
      try {
        fromWorkgroup = workgroupService.retrieveById(new Long(fromWorkgroupId));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
    Workgroup toWorkgroup = null;
    if (toWorkgroupId != null) {
      try {
        toWorkgroup = workgroupService.retrieveById(new Long(toWorkgroupId));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
    StudentWork studentWork = null;
    if (studentWorkId != null) {
      try {
        studentWork = (StudentWork) studentWorkDao.getById(studentWorkId);
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }

    NotebookItem notebookItem = null;
    if (notebookItemId != null) {
      try {
        notebookItem = (NotebookItem) notebookItemDao.getById(notebookItemId);
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }

    return annotationDao.getAnnotationsByParams(id, run, period, fromWorkgroup, toWorkgroup,
      nodeId, componentId, studentWork, localNotebookItemId,  notebookItem, type);
  }

  @Override
  public Annotation saveAnnotation(Integer id, Integer runId, Integer periodId,
      Integer fromWorkgroupId, Integer toWorkgroupId, String nodeId, String componentId,
      Integer studentWorkId, String localNotebookItemId, Integer notebookItemId,
      String type, String data, String clientSaveTime) throws ObjectNotFoundException {
    Annotation annotation;
    if (id != null) {
      // if the id is passed in, the client is requesting an update, so fetch the Event from data store
      List<Annotation> annotations = getAnnotations(id, null, null, null, null, null, null, null, null, null, null);
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
        annotation.setFromWorkgroup(workgroupService.retrieveById(new Long(fromWorkgroupId)));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
    if (toWorkgroupId != null) {
      try {
        annotation.setToWorkgroup(workgroupService.retrieveById(new Long(toWorkgroupId)));
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
    if (studentWorkId != null) {
      try {
        annotation.setStudentWork((StudentWork) studentWorkDao.getById(studentWorkId));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
    if (localNotebookItemId != null) {
      annotation.setLocalNotebookItemId(localNotebookItemId);
    }
    if (notebookItemId != null) {
      try {
        annotation.setNotebookItem((NotebookItem) notebookItemDao.getById(notebookItemId));
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

  @Override
  public List<StudentAsset> getStudentAssets(
      Integer id, Integer runId, Integer periodId, Integer workgroupId,
      String nodeId, String componentId, String componentType,
      Boolean isReferenced) throws ObjectNotFoundException {
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
    Workgroup workgroup = null;
    if (workgroupId != null) {
      try {
        workgroup = workgroupService.retrieveById(new Long(workgroupId));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }

    return studentAssetDao.getStudentAssetListByParams(
      id, run, period, workgroup,
      nodeId, componentId, componentType,
      isReferenced);
  }

  @Override
  public StudentAsset saveStudentAsset(
      Integer id, Integer runId, Integer periodId, Integer workgroupId,
      String nodeId, String componentId, String componentType,
      Boolean isReferenced, String fileName, String filePath, Long fileSize,
      String clientSaveTime, String clientDeleteTime) throws ObjectNotFoundException {
    StudentAsset studentAsset;
    if (id != null) {
      // if the id is passed in, the client is requesting an update, so fetch the StudentWork from data store
      try {
        studentAsset = (StudentAsset) studentAssetDao.getById(id);
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
        return null;
      }
    } else {
      // the id was not passed in, so we're creating a new StudentWork from scratch
      studentAsset = new StudentAsset();
    }
    if (runId != null) {
      try {
        boolean doEagerFetch = false;
        studentAsset.setRun(runService.retrieveById(new Long(runId), doEagerFetch));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
    if (periodId != null) {
      try {
        studentAsset.setPeriod(groupService.retrieveById(new Long(periodId)));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
    if (workgroupId != null) {
      try {
        studentAsset.setWorkgroup(workgroupService.retrieveById(new Long(workgroupId)));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
    if (nodeId != null) {
      studentAsset.setNodeId(nodeId);
    }
    if (componentId != null) {
      studentAsset.setComponentId(componentId);
    }
    if (componentType != null) {
      studentAsset.setComponentType(componentType);
    }
    if (isReferenced != null) {
      studentAsset.setIsReferenced(isReferenced);
    }
    if (fileName != null) {
      studentAsset.setFileName(fileName);
    }
    if (filePath != null) {
      studentAsset.setFilePath(filePath);
    }
    if (fileSize != null) {
      studentAsset.setFileSize(fileSize);
    }
    if (clientSaveTime != null) {
      Timestamp clientSaveTimestamp = new Timestamp(new Long(clientSaveTime));
      studentAsset.setClientSaveTime(clientSaveTimestamp);

      // set serverSaveTime
      Calendar now = Calendar.getInstance();
      Timestamp serverSaveTimestamp = new Timestamp(now.getTimeInMillis());
      studentAsset.setServerSaveTime(serverSaveTimestamp);
    }
    if (clientDeleteTime != null) {
      Timestamp clientDeleteTimestamp = new Timestamp(new Long(clientDeleteTime));
      studentAsset.setClientDeleteTime(clientDeleteTimestamp);

      // set serverDeleteTime
      Calendar now = Calendar.getInstance();
      Timestamp serverDeleteTimestamp = new Timestamp(now.getTimeInMillis());
      studentAsset.setServerDeleteTime(serverDeleteTimestamp);
    }

    studentAssetDao.save(studentAsset);
    return studentAsset;
  }

  @Override
  public StudentAsset getStudentAssetById(Integer studentAssetId) throws ObjectNotFoundException {
    return (StudentAsset) studentAssetDao.getById(studentAssetId);
  }

  @Override
  public StudentAsset deleteStudentAsset(Integer studentAssetId, Long clientDeleteTime) {
    StudentAsset studentAsset = null;
    if (studentAssetId != null) {
      // if the id is passed in, the client is requesting an update, so fetch the StudentWork from data store
      try {
        studentAsset = (StudentAsset) studentAssetDao.getById(studentAssetId);
        studentAsset.setClientDeleteTime(new Timestamp(clientDeleteTime));
        Calendar now = Calendar.getInstance();
        studentAsset.setServerDeleteTime(new Timestamp(now.getTimeInMillis()));
        studentAssetDao.save(studentAsset);
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
        return null;
      }
    }
    return studentAsset;
  }

  @Override
  public List<NotebookItem> getNotebookItems(Integer id, Integer runId, Integer periodId,
      Integer workgroupId, String nodeId, String componentId) {

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
    Workgroup workgroup = null;
    if (workgroupId != null) {
      try {
        workgroup = workgroupService.retrieveById(new Long(workgroupId));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }

    return notebookItemDao.getNotebookItemListByParams(
      id, run, period, workgroup,
      nodeId, componentId);
  }

  public List<NotebookItem> getNotebookItemsByGroup(Integer runId, String groupName) {
    return notebookItemDao.getNotebookItemByGroup(runId, groupName);
  }

  @Override
  public NotebookItem saveNotebookItem(Integer id, Integer runId, Integer periodId,
      Integer workgroupId, String nodeId, String componentId, Integer studentWorkId,
      Integer studentAssetId, String localNotebookItemId, String type, String title, String content,
      String clientSaveTime, String clientDeleteTime) {
    NotebookItem notebookItem;
    if (id != null) {
      // if the id is passed in, the client is requesting an update, so fetch the StudentWork from data store
      try {
        notebookItem = (NotebookItem) notebookItemDao.getById(id);
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
        return null;
      }
    } else {
      // the id was not passed in, so we're creating a new StudentWork from scratch
      notebookItem = new NotebookItem();
    }
    if (runId != null) {
      try {
        boolean doEagerFetch = false;
        notebookItem.setRun(runService.retrieveById(new Long(runId), doEagerFetch));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
    if (periodId != null) {
      try {
        notebookItem.setPeriod(groupService.retrieveById(new Long(periodId)));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
    if (workgroupId != null) {
      try {
        notebookItem.setWorkgroup(workgroupService.retrieveById(new Long(workgroupId)));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
    if (nodeId != null) {
      notebookItem.setNodeId(nodeId);
    }
    if (componentId != null) {
      notebookItem.setComponentId(componentId);
    }
    if (studentWorkId != null) {
      try {
        notebookItem.setStudentWork((StudentWork) studentWorkDao.getById(studentWorkId));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
    if (studentAssetId != null) {
      try {
        notebookItem.setStudentAsset((StudentAsset) studentAssetDao.getById(studentAssetId));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
    if (localNotebookItemId != null) {
      notebookItem.setLocalNotebookItemId(localNotebookItemId);
    }
    if (type != null) {
      notebookItem.setType(type);
    }
    if (title != null) {
      notebookItem.setTitle(title);
    }
    if (content != null) {
      notebookItem.setContent(content);
    }
    if (clientSaveTime != null && !clientSaveTime.isEmpty()) {
      Timestamp clientSaveTimestamp = new Timestamp(new Long(clientSaveTime));
      notebookItem.setClientSaveTime(clientSaveTimestamp);

      // set serverSaveTime
      Calendar now = Calendar.getInstance();
      Timestamp serverSaveTimestamp = new Timestamp(now.getTimeInMillis());
      notebookItem.setServerSaveTime(serverSaveTimestamp);
    }
    if (clientDeleteTime != null && !clientDeleteTime.isEmpty()) {
      Timestamp clientDeleteTimestamp = new Timestamp(new Long(clientDeleteTime));
      notebookItem.setClientDeleteTime(clientDeleteTimestamp);

      // set serverDeleteTime if not set already
      if (notebookItem.getServerDeleteTime() == null) {
        Calendar now = Calendar.getInstance();
        Timestamp serverDeleteTimestamp = new Timestamp(now.getTimeInMillis());
        notebookItem.setServerDeleteTime(serverDeleteTimestamp);
      }
    } else {
      // user un-deleted the item, so also un-set the server delete time
      notebookItem.setServerDeleteTime(null);
    }

    notebookItemDao.save(notebookItem);
    return notebookItem;
  }

  public NotebookItem addNotebookItemToGroup(
    Integer notebookItemId, String group, String clientSaveTime) {
    try {
      NotebookItem notebookItem = (NotebookItem) notebookItemDao.getById(notebookItemId);
      NotebookItem copiedNotebookItem = notebookItem.copy();
      if (copiedNotebookItem.isInGroup(group)) {
        return copiedNotebookItem;
      }
      String groups = copiedNotebookItem.getGroups();
      try {
        JSONArray groupsJSONArray;
        if (groups == null) {
          groupsJSONArray = new JSONArray();
        } else {
          groupsJSONArray = new JSONArray(groups);
        }
        groupsJSONArray.put(group);
        copiedNotebookItem.setGroups(groupsJSONArray.toString());
        copiedNotebookItem.setClientSaveTime(new Timestamp(new Long(clientSaveTime)));
        notebookItemDao.save(copiedNotebookItem);
      } catch (JSONException e) {
        e.printStackTrace();
      }
      return copiedNotebookItem;
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
      return null;
    }
  }

  public NotebookItem copyNotebookItem(
      Integer workgroupId, Integer parentNotebookItemId, String clientSaveTime) {
    try {
      NotebookItem notebookItem = (NotebookItem) notebookItemDao.getById(parentNotebookItemId);
      Workgroup workgroup = workgroupService.retrieveById(new Long(workgroupId));
      NotebookItem copiedNotebookItem = notebookItem.copy(workgroup, clientSaveTime);
      notebookItemDao.save(copiedNotebookItem);
      return copiedNotebookItem;
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
      return null;
    }
  }


  @Override
  public Notification getNotificationById(Integer notificationId) throws ObjectNotFoundException {
    return (Notification) notificationDao.getById(notificationId);
  }

  @Override
  public List<Notification> getNotificationsByGroupId(String groupId)
      throws ObjectNotFoundException {
    return this.getNotifications(null, null, null, null, groupId, null, null);
  }

  @Override
  public List<Notification> getNotifications(
      Integer id, Integer runId, Integer periodId, Integer toWorkgroupId,
      String groupId, String nodeId, String componentId) {
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
    Workgroup workgroup = null;
    if (toWorkgroupId != null) {
      try {
        workgroup = workgroupService.retrieveById(new Long(toWorkgroupId));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }

    return notificationDao.getNotificationListByParams(
      id, run, period, workgroup,
      groupId, nodeId, componentId);
  }

  @Override
  public Notification saveNotification(
      Integer id, Integer runId, Integer periodId,
      Integer fromWorkgroupId, Integer toWorkgroupId,
      String groupId, String nodeId, String componentId, String componentType,
      String type, String message, String data,
      String timeGenerated, String timeDismissed) {
    Notification notification;
    if (id != null) {
      // if the id is passed in, the client is requesting an update, so fetch the StudentWork from data store
      try {
        notification = (Notification) notificationDao.getById(id);
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
        return null;
      }
    } else {
      // the id was not passed in, so we're creating a new StudentWork from scratch
      notification = new Notification();
    }
    if (runId != null) {
      try {
        boolean doEagerFetch = false;
        notification.setRun(runService.retrieveById(new Long(runId), doEagerFetch));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
    if (periodId != null) {
      try {
        notification.setPeriod(groupService.retrieveById(new Long(periodId)));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
    if (fromWorkgroupId != null) {
      try {
        notification.setFromWorkgroup(workgroupService.retrieveById(new Long(fromWorkgroupId)));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
    if (toWorkgroupId != null) {
      try {
        notification.setToWorkgroup(workgroupService.retrieveById(new Long(toWorkgroupId)));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      }
    }
    if (groupId != null) {
      notification.setGroupId(groupId);
    }
    if (nodeId != null) {
      notification.setNodeId(nodeId);
    }
    if (componentId != null) {
      notification.setComponentId(componentId);
    }
    if (componentType != null) {
      notification.setComponentType(componentType);
    }
    if (type != null) {
      notification.setType(type);
    }
    if (message != null) {
      notification.setMessage(message);
    }
    if (data != null) {
      notification.setData(data);
    }
    if (timeGenerated != null) {
      Timestamp timeGeneratedTimestamp = new Timestamp(new Long(timeGenerated));
      notification.setTimeGenerated(timeGeneratedTimestamp);
    }
    if (timeDismissed != null) {
      Timestamp timeDismissedTimestamp = new Timestamp(new Long(timeDismissed));
      notification.setTimeDismissed(timeDismissedTimestamp);
    }
    // set serverSaveTime
    Calendar now = Calendar.getInstance();
    Timestamp serverSaveTimestamp = new Timestamp(now.getTimeInMillis());
    notification.setServerSaveTime(serverSaveTimestamp);

    notificationDao.save(notification);
    return notification;
  }

  @Override
  public Notification dismissNotification(Notification notification, String timeDismissed) {
    if (timeDismissed != null) {
      Timestamp timeDismissedTimestamp = new Timestamp(new Long(timeDismissed));
      notification.setTimeDismissed(timeDismissedTimestamp);
    }
    notificationDao.save(notification);
    return notification;
  }
}
