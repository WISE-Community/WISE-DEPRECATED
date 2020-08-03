package org.wise.portal.domain.work;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.sql.Timestamp;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.Before;
import org.junit.Test;
import org.wise.portal.domain.DomainTest;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.ProjectImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.service.work.EventJsonModule;
import org.wise.vle.domain.work.Event;

public class EventTest extends DomainTest {

  Event event;
  Project project;
  User user;

  @Before
  public void setup() {
    super.setup();
    project = new ProjectImpl();
    project.setId(10L);
    user = new UserImpl();
    user.setId(10000L);
    event = new Event();
    event.setId(100000);
    event.setRun(run);
    event.setProject(project);
    event.setPeriod(period);
    event.setWorkgroup(workgroup);
    event.setUser(user);
    event.setData("{\"selectedChoice\":\"dbf9824t1m\"}");
    event.setCategory("Navigation");
    event.setClientSaveTime(new Timestamp(1000000000000L));
    event.setServerSaveTime(new Timestamp(2000000000000L));
    event.setContext("VLE");
    event.setNodeId("node1");
    event.setComponentId("4t890paw3t");
    event.setComponentType("MultipleChoice");
    event.setEvent("choiceSelected");
  }

  @Test
  public void serialize() throws Exception {
    ObjectMapper mapper = new ObjectMapper();
    mapper.registerModule(new EventJsonModule());
    String json = mapper.writeValueAsString(event);
    String expectedJson = "{\"id\":100000,\"category\":\"Navigation\","
        + "\"clientSaveTime\":1000000000000,\"componentId\":\"4t890paw3t\","
        + "\"componentType\":\"MultipleChoice\",\"context\":\"VLE\","
        + "\"data\":{\"selectedChoice\":\"dbf9824t1m\"},\"event\":\"choiceSelected\","
        + "\"nodeId\":\"node1\",\"periodId\":100,\"projectId\":10,\"runId\":1,"
        + "\"serverSaveTime\":2000000000000,\"workgroupId\":64,\"userId\":10000}";
    assertEquals(expectedJson, json);
  }

  @Test
  public void serializeWithNullableFields() throws Exception {
    ObjectMapper mapper = new ObjectMapper();
    mapper.registerModule(new EventJsonModule());
    event.setComponentId(null);
    event.setComponentType(null);
    event.setNodeId(null);
    event.setPeriod(null);
    event.setRun(null);
    event.setWorkgroup(null);
    event.setProject(null);
    event.setUser(null);
    String json = mapper.writeValueAsString(event);
    String expectedJson = "{\"id\":100000,\"category\":\"Navigation\","
        + "\"clientSaveTime\":1000000000000,\"componentId\":null,\"componentType\":null,"
        + "\"context\":\"VLE\",\"data\":{\"selectedChoice\":\"dbf9824t1m\"},"
        + "\"event\":\"choiceSelected\",\"nodeId\":null,\"serverSaveTime\":2000000000000}";
    assertEquals(expectedJson, json);
  }
}
