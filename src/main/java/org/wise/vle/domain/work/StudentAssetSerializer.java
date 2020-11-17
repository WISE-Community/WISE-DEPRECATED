package org.wise.vle.domain.work;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

import org.springframework.stereotype.Service;

@Service
public class StudentAssetSerializer extends JsonSerializer<StudentAsset> {

  @Override
  public void serialize(StudentAsset asset, JsonGenerator gen, SerializerProvider serializers)
      throws IOException {
    gen.writeStartObject();
    gen.writeObjectField("id", asset.getId());
    gen.writeObjectField("runId", asset.getRun().getId());
    gen.writeObjectField("periodId", asset.getPeriod().getId());
    gen.writeObjectField("workgroupId", asset.getWorkgroup().getId());
    gen.writeObjectField("nodeId", asset.getNodeId());
    gen.writeObjectField("componentId", asset.getComponentId());
    gen.writeObjectField("componentType", asset.getComponentType());
    gen.writeObjectField("isReferenced", asset.getIsReferenced());
    gen.writeObjectField("fileName", asset.getFileName());
    gen.writeObjectField("filePath", asset.getFilePath());
    gen.writeObjectField("fileSize", asset.getFileSize());
    gen.writeObjectField("clientSaveTime", asset.getClientSaveTime().getTime());
    gen.writeObjectField("serverSaveTime", asset.getServerSaveTime().getTime());
    if (asset.getClientDeleteTime() != null) {
      gen.writeObjectField("clientDeleteTime", asset.getClientDeleteTime().getTime());
      gen.writeObjectField("serverDeleteTime", asset.getServerDeleteTime().getTime());
    }
    gen.writeEndObject();
  }
}
