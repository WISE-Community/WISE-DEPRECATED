package org.wise.vle.domain.work;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializerProvider;

public class NotebookItemSerializer extends JsonSerializer<NotebookItem> {

  @Override
  public void serialize(NotebookItem item, JsonGenerator gen, SerializerProvider serializers)
      throws IOException {
    gen.writeStartObject();
    gen.writeObjectField("id", item.getId());
    gen.writeObjectField("runId", item.getRun().getId());
    gen.writeObjectField("workgroupId", item.getWorkgroup().getId());
    gen.writeStringField("type", item.getType());
    gen.writeStringField("localNotebookItemId", item.getLocalNotebookItemId());
    gen.writeStringField("content", item.getContent());
    gen.writeObjectField("clientSaveTime", item.getClientSaveTime().getTime());
    gen.writeObjectField("serverSaveTime", item.getServerSaveTime().getTime());
    if (item.getClientDeleteTime() != null) {
      gen.writeObjectField("clientDeleteTime", item.getClientDeleteTime().getTime());
    }
    if (item.getServerDeleteTime() != null) {
      gen.writeObjectField("serverDeleteTime", item.getServerDeleteTime().getTime());
    }
    if (item.getType().equals("note")) {
      addNoteFields(gen, item);
    }
    gen.writeEndObject();
  }

  private void addNoteFields(JsonGenerator gen, NotebookItem item) throws IOException {
    gen.writeObjectField("periodId", item.getPeriod().getId());
    gen.writeStringField("nodeId", item.getNodeId());
    gen.writeStringField("title", item.getTitle());
    ObjectMapper objectMapper = new ObjectMapper();
    if (item.getGroups() != null) {
      gen.writeObjectField("groups", objectMapper.readTree(item.getGroups()));
    }
    if (item.getParentNotebookItemId() != null) {
      gen.writeObjectField("parentNotebookItemId", item.getParentNotebookItemId());
    }
  }
}
