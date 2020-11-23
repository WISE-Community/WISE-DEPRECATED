package org.wise.vle.domain.achievement;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializerProvider;

import org.springframework.stereotype.Service;

@Service
public class AchievementSerializer extends JsonSerializer<Achievement> {

  @Override
  public void serialize(Achievement achievement, JsonGenerator gen, SerializerProvider serializers)
      throws IOException {
    gen.writeStartObject();
    gen.writeObjectField("id", achievement.getId());
    gen.writeObjectField("runId", achievement.getRun().getId());
    gen.writeObjectField("workgroupId", achievement.getWorkgroup().getId());
    gen.writeObjectField("achievementId", achievement.getAchievementId());
    gen.writeObjectField("type", achievement.getType());
    gen.writeObjectField("achievementTime", achievement.getAchievementTime().getTime());
    String data = achievement.getData();
    ObjectMapper mapper = new ObjectMapper();
    gen.writeObjectField("data", mapper.readTree(data));
    gen.writeEndObject();
  }
}
