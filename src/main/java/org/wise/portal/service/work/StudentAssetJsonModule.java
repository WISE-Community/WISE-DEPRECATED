package org.wise.portal.service.work;

import com.fasterxml.jackson.databind.module.SimpleModule;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.wise.vle.domain.work.StudentAsset;
import org.wise.vle.domain.work.StudentAssetSerializer;

@Service
public class StudentAssetJsonModule extends SimpleModule {

  private static final long serialVersionUID = 1L;

  public StudentAssetJsonModule() {}

  @Autowired
  public StudentAssetJsonModule(StudentAssetSerializer serializer) {
    this.addSerializer(StudentAsset.class, serializer);
  }
}
