package org.wise.portal.spring.data.redis;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;

public class RedisMessagePublisher implements MessagePublisher {

  @Autowired
  private RedisTemplate<String, Object> redisTemplate;

  @Autowired
  private ChannelTopic topic;

  public RedisMessagePublisher() {
  }

  public RedisMessagePublisher(
    RedisTemplate<String, Object> redisTemplate, ChannelTopic topic) {
    this.redisTemplate = redisTemplate;
    this.topic = topic;
  }

  public void publish(Object message) {
    redisTemplate.convertAndSend(topic.getTopic(), message);
  }
}
