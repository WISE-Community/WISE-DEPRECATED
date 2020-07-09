package org.wise.portal.service.work;

import com.fasterxml.jackson.databind.module.SimpleModule;

import org.springframework.stereotype.Service;
import org.wise.vle.domain.work.StudentWork;
import org.wise.vle.domain.work.StudentWorkSerializer;

@Service
public class StudentWorkJsonModule extends SimpleModule {

  private static final long serialVersionUID = 1L;

  public StudentWorkJsonModule() {
    this.addSerializer(StudentWork.class, new StudentWorkSerializer());
  }
}