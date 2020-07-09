package org.wise.portal.service.annotation;

import com.fasterxml.jackson.databind.module.SimpleModule;

import org.springframework.stereotype.Service;
import org.wise.vle.domain.annotation.wise5.Annotation;
import org.wise.vle.domain.annotation.wise5.AnnotationSerializer;

@Service
public class AnnotationJsonModule extends SimpleModule {

  private static final long serialVersionUID = 1L;

  public AnnotationJsonModule() {
    this.addSerializer(Annotation.class, new AnnotationSerializer());
  }
}