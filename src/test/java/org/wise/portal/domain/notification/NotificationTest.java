package org.wise.portal.domain.notification;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertEquals;

import java.sql.Timestamp;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.wise.portal.domain.DomainTest;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.domain.workgroup.impl.WorkgroupImpl;
import org.wise.portal.service.group.GroupService;
import org.wise.portal.service.notification.NotificationJsonModule;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.workgroup.WorkgroupService;
import org.wise.vle.domain.notification.Notification;
import org.wise.vle.domain.notification.NotificationDeserializer;
import org.wise.vle.domain.notification.NotificationSerializer;

@RunWith(EasyMockRunner.class)
public class NotificationTest extends DomainTest {

  Notification notification;

  ObjectMapper mapper;

  @Mock
  WorkgroupService workgroupService;

  @Mock
  RunService runService;

  @Mock
  GroupService groupService;

  NotificationSerializer notificationSerializer = new NotificationSerializer();

  Workgroup toWorkgroup, fromWorkgroup;

  NotificationJsonModule notificationJsonModule = new NotificationJsonModule();

  @Before
  public void setup() {
    super.setup();
    NotificationDeserializer notificationDeserializer = new NotificationDeserializer();
    notificationDeserializer.setWorkgroupService(workgroupService);
    notificationDeserializer.setRunService(runService);
    notificationDeserializer.setGroupService(groupService);
    notificationJsonModule.addSerializer(Notification.class, new NotificationSerializer());
    notificationJsonModule.addDeserializer(Notification.class, notificationDeserializer);
    mapper = new ObjectMapper();
    mapper.registerModule(notificationJsonModule);
    notification = new Notification();
    notification.setId(22);
    notification.setRun(run);
    notification.setPeriod(period);
    notification.setToWorkgroup(workgroup);
    notification.setFromWorkgroup(workgroup2);
    notification.setType("teacherToStudent");
    notification.setMessage("teacher gave you feedback");
    notification.setData("{\"annotationId\":543543}");
    notification.setTimeGenerated(new Timestamp(1L));
    notification.setServerSaveTime(new Timestamp(2L));
    notification.setTimeDismissed(new Timestamp(3L));
    toWorkgroup = new WorkgroupImpl();
    toWorkgroup.setId(64L);
    fromWorkgroup = new WorkgroupImpl();
    fromWorkgroup.setId(68L);
  }

  @Test
  public void serialize() throws Exception {
    String json = mapper.writeValueAsString(notification);
    assertEquals("{\"id\":22,\"runId\":1,\"periodId\":100,"
        + "\"toWorkgroupId\":64,\"fromWorkgroupId\":68,"
        + "\"type\":\"teacherToStudent\",\"message\":\"teacher gave you feedback\","
        + "\"groupId\":null,\"nodeId\":null,\"componentId\":null,\"componentType\":null,"
        + "\"data\":{\"annotationId\":543543},\"timeGenerated\":1,"
        + "\"serverSaveTime\":2,\"timeDismissed\":3}", json);
  }

  @Test
  public void deserialize() throws Exception {
    expect(workgroupService.retrieveById(64L)).andReturn(toWorkgroup);
    expect(workgroupService.retrieveById(68L)).andReturn(fromWorkgroup);
    expect(runService.retrieveById(1L)).andReturn(run);
    expect(groupService.retrieveById(100L)).andReturn(period);
    replay(workgroupService, runService, groupService);
    Notification notification = mapper.readValue(
        "{\"id\":22,\"toWorkgroupId\":64,\"fromWorkgroupId\":68,"
        + "\"runId\":1,\"periodId\":100,"
        + "\"groupId\":\"public-1\",\"nodeId\":\"node33\","
        + "\"componentId\":\"xyzabc\",\"componentType\":\"OpenResponse\","
        + "\"type\":\"teacherToStudent\",\"message\":\"teacher gave you feedback\","
        + "\"data\":{\"annotationId\":543543},"
        + "\"timeGenerated\":1,\"serverSaveTime\":2,\"timeDismissed\":3}", Notification.class);
    assertEquals(22, notification.getId().intValue());
    assertEquals(1, notification.getRun().getId().longValue());
    assertEquals(100, notification.getPeriod().getId().longValue());
    assertEquals(64, notification.getToWorkgroup().getId().longValue());
    assertEquals(68, notification.getFromWorkgroup().getId().longValue());
    assertEquals("public-1", notification.getGroupId());
    assertEquals("node33", notification.getNodeId());
    assertEquals("xyzabc", notification.getComponentId());
    assertEquals("OpenResponse", notification.getComponentType());
    assertEquals(new Timestamp(1L), notification.getTimeGenerated());
    assertEquals(new Timestamp(2L), notification.getServerSaveTime());
    assertEquals(new Timestamp(3L), notification.getTimeDismissed());
    assertEquals("{\"annotationId\":543543}", notification.getData());
    assertEquals("teacherToStudent", notification.getType());
    assertEquals("teacher gave you feedback", notification.getMessage());
    verify(workgroupService, runService, groupService);
  }
}
