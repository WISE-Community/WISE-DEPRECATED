package org.wise.vle.domain.notification;

import java.io.IOException;
import java.sql.Timestamp;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.ObjectCodec;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.service.group.GroupService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.workgroup.WorkgroupService;

import lombok.Setter;

@Service
public class NotificationDeserializer extends JsonDeserializer<Notification> {

  @Autowired
  @Setter
  RunService runService;

  @Autowired
  @Setter
  GroupService groupService;

  @Autowired
  @Setter
  WorkgroupService workgroupService;

  @Override
  public Notification deserialize(JsonParser parser, DeserializationContext ctxt)
      throws IOException, JsonProcessingException {
    ObjectCodec objectCodec = parser.getCodec();
    JsonNode node = objectCodec.readTree(parser);
    Notification notification = new Notification();
    if (node.has("id")) {
      notification.setId(node.get("id").asInt());
    }
    notification.setType(node.get("type").asText());
    if (node.has("data")) {
      notification.setData(node.get("data").toString());
    }
    notification.setMessage(node.get("message").asText());
    if (node.has("groupId")) {
      notification.setGroupId(node.get("groupId").asText());
    }
    notification.setNodeId(node.get("nodeId").asText());
    notification.setComponentId(node.get("componentId").asText());
    if (node.has("componentType")) {
      notification.setComponentType(node.get("componentType").asText());
    }
    notification.setTimeGenerated(new Timestamp(node.get("timeGenerated").asLong()));
    if (node.has("serverSaveTime")) {
      notification.setServerSaveTime(new Timestamp(node.get("serverSaveTime").asLong()));
    }
    if (node.has("timeDismissed")) {
      notification.setTimeDismissed(new Timestamp(node.get("timeDismissed").asLong()));
    }
    try {
      notification.setRun(runService.retrieveById(node.get("runId").asLong()));
      notification.setPeriod(groupService.retrieveById(node.get("periodId").asLong()));
      notification
          .setToWorkgroup(workgroupService.retrieveById(node.get("toWorkgroupId").asLong()));
      notification
          .setFromWorkgroup(workgroupService.retrieveById(node.get("fromWorkgroupId").asLong()));
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    }
    return notification;
  }
}
