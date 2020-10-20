package org.wise.vle.domain.work;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializerProvider;

import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;

public class EventSerializer extends JsonSerializer<Event> {

  @Override
  public void serialize(Event event, JsonGenerator gen, SerializerProvider serializers)
      throws IOException {
    gen.writeStartObject();
    gen.writeObjectField("id", event.getId());
    gen.writeObjectField("category", event.getCategory());
    gen.writeObjectField("clientSaveTime", event.getClientSaveTime().getTime());
    gen.writeObjectField("componentId", event.getComponentId());
    gen.writeObjectField("componentType", event.getComponentType());
    gen.writeObjectField("context", event.getContext());
    ObjectMapper objectMapper = new ObjectMapper();
    gen.writeObjectField("data", objectMapper.readTree(event.getData()));
    gen.writeObjectField("event", event.getEvent());
    gen.writeObjectField("nodeId", event.getNodeId());
    Group period = event.getPeriod();
    if (period != null) {
      gen.writeObjectField("periodId", period.getId());
    }
    Project project = event.getProject();
    if (project != null) {
      gen.writeObjectField("projectId", project.getId());
    }
    Run run = event.getRun();
    if (run != null) {
      gen.writeObjectField("runId", run.getId());
    }
    gen.writeObjectField("serverSaveTime", event.getServerSaveTime().getTime());
    Workgroup workgroup = event.getWorkgroup();
    if (workgroup != null) {
      gen.writeObjectField("workgroupId", workgroup.getId());
    }
    User user = event.getUser();
    if (user != null) {
      gen.writeObjectField("userId", user.getId());
    }
    gen.writeEndObject();
  }
}
