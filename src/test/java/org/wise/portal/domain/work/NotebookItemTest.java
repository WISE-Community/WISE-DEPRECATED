package org.wise.portal.domain.work;

import static org.junit.Assert.assertEquals;

import java.sql.Timestamp;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.Before;
import org.junit.Test;
import org.wise.portal.domain.DomainTest;
import org.wise.portal.service.notebook.NotebookItemJsonModule;
import org.wise.vle.domain.work.NotebookItem;
import org.wise.vle.domain.work.StudentAsset;
import org.wise.vle.domain.work.StudentWork;

public class NotebookItemTest extends DomainTest {

  StudentWork studentWork;

  StudentAsset studentAsset;

  NotebookItem item;

  @Before
  public void setup() {
    super.setup();
    studentWork = new StudentWork();
    studentWork.setId(154);
    studentAsset = new StudentAsset();
    studentAsset.setId(45);

    item = new NotebookItem();
    item.setId(99);
    item.setRun(run);
    item.setPeriod(period);
    item.setWorkgroup(workgroup);
    item.setNodeId("node78");
    item.setLocalNotebookItemId("ooacs8tls7");
    item.setType("note");
    item.setTitle("Note from first step");
    item.setContent("{\"text\":\"my note!\"}");
    item.setClientSaveTime(new Timestamp(1582337976000L));
    item.setServerSaveTime(new Timestamp(1582338031000L));
    item.setStudentWork(studentWork);
    item.setStudentAsset(studentAsset);
  }

  @Test
  public void serialize() throws Exception {
    ObjectMapper mapper = new ObjectMapper();
    mapper.registerModule(new NotebookItemJsonModule());
    String json = mapper.writeValueAsString(item);
    assertEquals("{\"id\":99,\"runId\":1,\"workgroupId\":64,\"type\":\"note\"" +
        ",\"localNotebookItemId\":\"ooacs8tls7\"" +
        ",\"content\":\"{\\\"text\\\":\\\"my note!\\\"}\"" +
        ",\"clientSaveTime\":1582337976000,\"serverSaveTime\":1582338031000" +
        ",\"periodId\":100,\"nodeId\":\"node78\",\"title\":\"Note from first step\"}", json);
  }

}
