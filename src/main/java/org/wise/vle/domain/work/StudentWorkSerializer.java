package org.wise.vle.domain.work;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializerProvider;

public class StudentWorkSerializer extends JsonSerializer<StudentWork> {

  @Override
  public void serialize(StudentWork studentWork, JsonGenerator gen, SerializerProvider serializers)
      throws IOException {
    gen.writeStartObject();
    gen.writeObjectField("id", studentWork.getId());
    gen.writeObjectField("clientSaveTime", studentWork.getClientSaveTime().getTime());
    gen.writeObjectField("componentId", studentWork.getComponentId());
    gen.writeObjectField("componentType", studentWork.getComponentType());
    gen.writeObjectField("isAutoSave", studentWork.getIsAutoSave());
    gen.writeObjectField("isSubmit", studentWork.getIsSubmit());
    gen.writeObjectField("nodeId", studentWork.getNodeId());
    gen.writeObjectField("periodId", studentWork.getPeriod().getId());
    gen.writeObjectField("runId", studentWork.getRun().getId());
    gen.writeObjectField("serverSaveTime", studentWork.getServerSaveTime().getTime());
    ObjectMapper objectMapper = new ObjectMapper();
    gen.writeObjectField("studentData", objectMapper.readTree(studentWork.getStudentData()));
    gen.writeObjectField("workgroupId", studentWork.getWorkgroup().getId());
    gen.writeEndObject();
  }
}
