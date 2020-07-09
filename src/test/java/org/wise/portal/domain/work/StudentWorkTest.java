package org.wise.portal.domain.work;

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
import org.wise.portal.service.work.StudentWorkJsonModule;
import org.wise.vle.domain.work.StudentWork;

public class StudentWorkTest {

  StudentWork studentWork;
  Run run;
  Group period;
  Workgroup workgroup;

  @Before
  public void setup() {
    run = new RunImpl();
    run.setId(1L);
    period = new PersistentGroup();
    period.setId(10L);
    workgroup = new WorkgroupImpl();
    workgroup.setId(100L);
    studentWork = new StudentWork();
    studentWork.setId(1000);
    studentWork.setStudentData("{\"response\":\"Hello World\"}");
    studentWork.setRun(run);
    studentWork.setPeriod(period);
    studentWork.setWorkgroup(workgroup);
    studentWork.setClientSaveTime(new Timestamp(1582338031000L));
    studentWork.setServerSaveTime(new Timestamp(1582338031000L));
    studentWork.setComponentId("9gyphw34j8");
    studentWork.setComponentType("OpenResponse");
    studentWork.setIsAutoSave(true);
    studentWork.setIsSubmit(false);
    studentWork.setNodeId("node1");
  }

  @Test
  public void serialize() throws Exception {
    ObjectMapper mapper = new ObjectMapper();
    mapper.registerModule(new StudentWorkJsonModule());
    String json = mapper.writeValueAsString(studentWork);
    String expectedJson = "{\"id\":1000,\"clientSaveTime\":1582338031000,"
        + "\"componentId\":\"9gyphw34j8\",\"componentType\":\"OpenResponse\",\"isAutoSave\":true,"
        + "\"isSubmit\":false,\"nodeId\":\"node1\",\"periodId\":10,\"runId\":1,"
        + "\"serverSaveTime\":1582338031000,\"studentData\":{\"response\":\"Hello World\"},"
        + "\"workgroupId\":100}";
    assertEquals(expectedJson, json);
  }

  @Test
  public void serializeWithNullableFields() throws Exception {
    ObjectMapper mapper = new ObjectMapper();
    mapper.registerModule(new StudentWorkJsonModule());
    studentWork.setComponentId(null);
    studentWork.setComponentType(null);
    String json = mapper.writeValueAsString(studentWork);
    String expectedJson = "{\"id\":1000,\"clientSaveTime\":1582338031000,\"componentId\":null,"
        + "\"componentType\":null,\"isAutoSave\":true,\"isSubmit\":false,\"nodeId\":\"node1\","
        + "\"periodId\":10,\"runId\":1,\"serverSaveTime\":1582338031000,"
        + "\"studentData\":{\"response\":\"Hello World\"},\"workgroupId\":100}";
    assertEquals(expectedJson, json);
  }
}