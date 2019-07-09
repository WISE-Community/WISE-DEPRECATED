package org.wise.portal.spring.data.redis;

public interface MessagePublisher {
  void publish(Object message);
}
