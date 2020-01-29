package org.wise.portal.score.agent;

import org.wise.portal.score.AgentService;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Service;

@Service
public class AgentServiceImpl implements AgentService, MessageListener {

  @Override
  public void onMessage(Message message, byte[] pattern) {
    // TODO Auto-generated method stub
  }

}
