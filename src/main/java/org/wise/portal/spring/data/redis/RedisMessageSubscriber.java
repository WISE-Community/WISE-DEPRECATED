package org.wise.portal.spring.data.redis;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RedisMessageSubscriber implements MessageListener {

  public static List<String> messageList = new ArrayList<>();

  @Autowired
  private SimpMessagingTemplate simpMessagingTemplate;

  public void onMessage(Message message, byte[] pattern) {
    messageList.add(message.toString());
    try {
      JSONObject messageJSON = new JSONObject(new String(message.getBody()));
      if (messageJSON.get("type").equals("currentAuthors")) {
        simpMessagingTemplate.convertAndSend(messageJSON.getString("topic"),
            messageJSON.getJSONArray("currentAuthors").toString());
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }
}
