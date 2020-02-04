package org.wise.portal.spring.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.data.redis.serializer.GenericToStringSerializer;
import org.springframework.session.data.redis.config.ConfigureRedisAction;
import org.wise.portal.spring.data.redis.MessagePublisher;
import org.wise.portal.spring.data.redis.RedisMessagePublisher;
import org.wise.portal.spring.data.redis.RedisMessageSubscriber;
import redis.clients.jedis.JedisPoolConfig;

@Configuration
public class RedisConfig {

  @Value("${spring.redis.host}")
  private String redisHostName;

  @Value("${spring.redis.port}")
  private int redisPort;

  @Value("${spring.redis.password:#{null}}")
  private String redisPassword;

  @Value("${spring.redis.pool.max.total}")
  private int redisPoolMaxTotal;

  @Bean
  public RedisConnectionFactory redisConnectionFactory() {
    JedisPoolConfig poolConfig = new JedisPoolConfig();
    poolConfig.setMaxTotal(redisPoolMaxTotal);
    poolConfig.setTestOnBorrow(true);
    poolConfig.setTestOnReturn(true);
    RedisStandaloneConfiguration config = new RedisStandaloneConfiguration(redisHostName, redisPort);
    if (redisPassword != null) {
      config.setPassword(redisPassword);
    }
    return new JedisConnectionFactory(config);
  }

  @Bean
  public RedisTemplate<String, Object> redisTemplate() {
    RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
    redisTemplate.setConnectionFactory(redisConnectionFactory());
    redisTemplate.setValueSerializer(new GenericToStringSerializer<Object>(Object.class));
    return redisTemplate;
  }

  @Bean
  public StringRedisTemplate stringRedisTemplate() {
    return new StringRedisTemplate(redisConnectionFactory());
  }

  @Bean
  public static ConfigureRedisAction configureRedisAction() {
    return ConfigureRedisAction.NO_OP;
  }

  @Bean
  MessageListenerAdapter messageListener() {
    return new MessageListenerAdapter(redisMessageSubscriber());
  }

  @Bean
  RedisMessageSubscriber redisMessageSubscriber() {
    return new RedisMessageSubscriber();
  }

  @Bean
  RedisMessageListenerContainer redisContainer() {
    RedisMessageListenerContainer container = new RedisMessageListenerContainer();
    container.setConnectionFactory(redisConnectionFactory());
    container.addMessageListener(messageListener(), topic());
    return container;
  }

  @Bean
  MessagePublisher redisPublisher() {
    return new RedisMessagePublisher(redisTemplate(), topic());
  }

  @Bean
  ChannelTopic topic() {
    return new ChannelTopic("messageQueue");
  }
}
