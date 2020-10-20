package org.wise.vle.domain.notification;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializerProvider;

import org.springframework.stereotype.Service;

@Service
public class NotificationSerializer extends JsonSerializer<Notification> {

  @Override
  public void serialize(Notification notification, JsonGenerator gen,
      SerializerProvider serializers) throws IOException {
    gen.writeStartObject();
    gen.writeObjectField("id", notification.getId());
    gen.writeObjectField("runId", notification.getRun().getId());
    gen.writeObjectField("periodId", notification.getPeriod().getId());
    gen.writeObjectField("toWorkgroupId", notification.getToWorkgroup().getId());
    gen.writeObjectField("fromWorkgroupId", notification.getFromWorkgroup().getId());
    gen.writeObjectField("type", notification.getType());
    gen.writeObjectField("message", notification.getMessage());
    gen.writeObjectField("groupId", notification.getGroupId());
    gen.writeObjectField("nodeId", notification.getNodeId());
    gen.writeObjectField("componentId", notification.getComponentId());
    gen.writeObjectField("componentType", notification.getComponentType());
    if (notification.getData() != null) {
      ObjectMapper objectMapper = new ObjectMapper();
      gen.writeObjectField("data", objectMapper.readTree(notification.getData()));
    } else {
      gen.writeObjectField("data", null);
    }
    gen.writeObjectField("timeGenerated", notification.getTimeGenerated().getTime());
    gen.writeObjectField("serverSaveTime", notification.getServerSaveTime().getTime());
    if (notification.getTimeDismissed() != null) {
      gen.writeObjectField("timeDismissed", notification.getTimeDismissed().getTime());
    }
    gen.writeEndObject();
  }


}
