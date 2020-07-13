package org.wise.portal.domain.annotation;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.sql.Timestamp;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.Before;
import org.junit.Test;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.domain.workgroup.impl.WorkgroupImpl;
import org.wise.portal.service.annotation.AnnotationJsonModule;
import org.wise.vle.domain.annotation.wise5.Annotation;
import org.wise.vle.domain.work.NotebookItem;
import org.wise.vle.domain.work.StudentWork;

public class AnnotationTest {

  Annotation annotation;
  Run run;
  Group period;
  Workgroup fromWorkgroup;
  Workgroup toWorkgroup;
  StudentWork studentWork;
  NotebookItem notebookItem;

  @Before
  public void setup() {
    run = new RunImpl();
    run.setId(1L);
    period = new PersistentGroup();
    period.setId(100L);
    fromWorkgroup = new WorkgroupImpl();
    fromWorkgroup.setId(1001L);
    toWorkgroup = new WorkgroupImpl();
    toWorkgroup.setId(1002L);
    studentWork = new StudentWork();
    studentWork.setId(10000);
    notebookItem = new NotebookItem();
    notebookItem.setId(100000);
    annotation = new Annotation();
    annotation.setId(1000000);
    annotation.setRun(run);
    annotation.setPeriod(period);
    annotation.setFromWorkgroup(fromWorkgroup);
    annotation.setToWorkgroup(toWorkgroup);
    annotation.setClientSaveTime(new Timestamp(1000000000000L));
    annotation.setServerSaveTime(new Timestamp(2000000000000L));
    annotation.setComponentId("ybr89qetnj");
    annotation.setData("{\"value\":5}");
    annotation.setNodeId("node1");
    annotation.setType("score");
    annotation.setLocalNotebookItemId("localNotebookItemId1");
    annotation.setNotebookItem(notebookItem);
    annotation.setStudentWork(studentWork);
  }

  @Test
  public void serialize() throws Exception {
    ObjectMapper mapper = new ObjectMapper();
    mapper.registerModule(new AnnotationJsonModule());
    String json = mapper.writeValueAsString(annotation);
    String expectedJson = "{\"id\":1000000,\"clientSaveTime\":1000000000000,"
        + "\"componentId\":\"ybr89qetnj\",\"data\":{\"value\":5},\"fromWorkgroupId\":1001,"
        + "\"toWorkgroupId\":1002,\"localNotebookItemId\":\"localNotebookItemId1\","
        + "\"nodeId\":\"node1\",\"notebookItemId\":100000,\"periodId\":100,\"runId\":1,"
        + "\"serverSaveTime\":2000000000000,\"studentWorkId\":10000,\"type\":\"score\"}";
    assertEquals(expectedJson, json);
  }

  @Test
  public void serializeWithNullableFields() throws Exception {
    ObjectMapper mapper = new ObjectMapper();
    mapper.registerModule(new AnnotationJsonModule());
    annotation.setComponentId(null);
    annotation.setNodeId(null);
    annotation.setFromWorkgroup(null);
    annotation.setStudentWork(null);
    annotation.setLocalNotebookItemId(null);
    annotation.setNotebookItem(null);
    String json = mapper.writeValueAsString(annotation);
    String expectedJson = "{\"id\":1000000,\"clientSaveTime\":1000000000000,\"componentId\":null,"
        + "\"data\":{\"value\":5},\"toWorkgroupId\":1002,\"localNotebookItemId\":null,"
        + "\"nodeId\":null,\"periodId\":100,\"runId\":1,\"serverSaveTime\":2000000000000,"
        + "\"type\":\"score\"}";
    assertEquals(expectedJson, json);
  }
}