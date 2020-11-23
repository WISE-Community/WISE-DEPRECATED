package org.wise.portal.service.work;

import com.fasterxml.jackson.databind.module.SimpleModule;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.wise.vle.domain.achievement.Achievement;
import org.wise.vle.domain.achievement.AchievementSerializer;

@Service
public class AchievementJsonModule extends SimpleModule {

  private static final long serialVersionUID = 1L;

  public AchievementJsonModule() {}

  @Autowired
  public AchievementJsonModule(AchievementSerializer serializer) {
    this.addSerializer(Achievement.class, serializer);
  }
}
