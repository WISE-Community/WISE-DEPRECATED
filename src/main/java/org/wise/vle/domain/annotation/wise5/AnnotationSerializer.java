package org.wise.vle.domain.annotation.wise5;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializerProvider;

import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.vle.domain.work.NotebookItem;
import org.wise.vle.domain.work.StudentWork;

public class AnnotationSerializer extends JsonSerializer<Annotation> {

  @Override
  public void serialize(Annotation annotation, JsonGenerator gen, SerializerProvider serializers)
      throws IOException {
    gen.writeStartObject();
    gen.writeObjectField("id", annotation.getId());
    gen.writeObjectField("clientSaveTime", annotation.getClientSaveTime().getTime());
    gen.writeObjectField("componentId", annotation.getComponentId());
    ObjectMapper objectMapper = new ObjectMapper();
    gen.writeObjectField("data", objectMapper.readTree(annotation.getData()));
    Workgroup fromWorkgroup = annotation.getFromWorkgroup();
    if (fromWorkgroup != null) {
      gen.writeObjectField("fromWorkgroupId", annotation.getFromWorkgroup().getId());
    }
    gen.writeObjectField("toWorkgroupId", annotation.getToWorkgroup().getId());
    gen.writeObjectField("localNotebookItemId", annotation.getLocalNotebookItemId());
    gen.writeObjectField("nodeId", annotation.getNodeId());
    NotebookItem notebookItem = annotation.getNotebookItem();
    if (notebookItem != null) {
      gen.writeObjectField("notebookItemId", notebookItem.getId());
    }
    gen.writeObjectField("periodId", annotation.getPeriod().getId());
    gen.writeObjectField("runId", annotation.getRun().getId());
    gen.writeObjectField("serverSaveTime", annotation.getServerSaveTime().getTime());
    StudentWork studentWork = annotation.getStudentWork();
    if (studentWork != null) {
      gen.writeObjectField("studentWorkId", studentWork.getId());
    }
    gen.writeObjectField("type", annotation.getType());
    gen.writeEndObject();
  }
}
