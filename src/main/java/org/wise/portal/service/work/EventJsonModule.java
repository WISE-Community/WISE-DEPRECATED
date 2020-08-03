package org.wise.portal.service.work;

import com.fasterxml.jackson.databind.module.SimpleModule;

import org.springframework.stereotype.Service;
import org.wise.vle.domain.work.Event;
import org.wise.vle.domain.work.EventSerializer;

@Service
public class EventJsonModule extends SimpleModule {

  private static final long serialVersionUID = 1L;

  public EventJsonModule() {
    this.addSerializer(Event.class, new EventSerializer());
  }
}