package org.wise.portal.service.notification;

import com.fasterxml.jackson.databind.module.SimpleModule;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.wise.vle.domain.notification.Notification;
import org.wise.vle.domain.notification.NotificationDeserializer;
import org.wise.vle.domain.notification.NotificationSerializer;

@Service
public class NotificationJsonModule extends SimpleModule {

  private static final long serialVersionUID = 1L;

  public NotificationJsonModule() {
  }

  @Autowired
  public NotificationJsonModule(NotificationSerializer serializer,
      NotificationDeserializer deserializer) {
    this.addSerializer(Notification.class, serializer);
    this.addDeserializer(Notification.class, deserializer);
  }
}
