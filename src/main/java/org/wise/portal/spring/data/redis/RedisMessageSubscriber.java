package org.wise.portal.spring.data.redis;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.wise.vle.domain.WebSocketMessage;

@Service
public class RedisMessageSubscriber implements MessageListener {

  @Autowired
  private SimpMessagingTemplate simpMessagingTemplate;

  public void onMessage(Message message, byte[] pattern) {
    try {
      JSONObject messageJSON = new JSONObject(new String(message.getBody()));
      if (messageJSON.get("type").equals("currentAuthors")) {
        simpMessagingTemplate.convertAndSend(messageJSON.getString("topic"),
            messageJSON.getJSONArray("currentAuthors").toString());
      } else if (messageJSON.get("type").equals("studentWorkToClassroom") ||
          messageJSON.get("type").equals("studentWorkToTeacher")) {
        WebSocketMessage webSockeMessage = new WebSocketMessage("studentWork", messageJSON.getString("studentWork"));
        simpMessagingTemplate.convertAndSend(messageJSON.getString("topic"), webSockeMessage);
      } else if (messageJSON.get("type").equals("annotationToTeacher")) {
        WebSocketMessage webSockeMessage = new WebSocketMessage("annotation", messageJSON.getString("annotation"));
        simpMessagingTemplate.convertAndSend(messageJSON.getString("topic"), webSockeMessage);
      } else if (messageJSON.get("type").equals("studentStatusToTeacher")) {
        WebSocketMessage webSockeMessage = new WebSocketMessage("studentStatus", messageJSON.getString("studentStatus"));
        simpMessagingTemplate.convertAndSend(messageJSON.getString("topic"), webSockeMessage);
      } else if (messageJSON.get("type").equals("achievementToTeacher")) {
        WebSocketMessage webSockeMessage = new WebSocketMessage("newStudentAchievement", messageJSON.getString("achievement"));
        simpMessagingTemplate.convertAndSend(messageJSON.getString("topic"), webSockeMessage);
      } else if (messageJSON.get("type").equals("annotationToStudent")) {
        WebSocketMessage webSockeMessage = new WebSocketMessage("annotation", messageJSON.getString("annotation"));
        simpMessagingTemplate.convertAndSend(messageJSON.getString("topic"), webSockeMessage);
      } else if (messageJSON.get("type").equals("notification")) {
        WebSocketMessage webSockeMessage = new WebSocketMessage("notification", messageJSON.getString("notification"));
        simpMessagingTemplate.convertAndSend(messageJSON.getString("topic"), webSockeMessage);
      } else if (messageJSON.get("type").equals("pause")) {
        WebSocketMessage webSockeMessage = new WebSocketMessage("pause", "");
        simpMessagingTemplate.convertAndSend(messageJSON.getString("topic"), webSockeMessage);
      } else if (messageJSON.get("type").equals("unpause")) {
        WebSocketMessage webSockeMessage = new WebSocketMessage("unpause", "");
        simpMessagingTemplate.convertAndSend(messageJSON.getString("topic"), webSockeMessage);
      } else if (messageJSON.get("type").equals("node")) {
        WebSocketMessage webSockeMessage = new WebSocketMessage("node",
            messageJSON.getString("node"));
        simpMessagingTemplate.convertAndSend(messageJSON.getString("topic"),
            webSockeMessage);
        simpMessagingTemplate.convertAndSend(messageJSON.getString("topic"), webSockeMessage);
      } else if (messageJSON.get("type").equals("tagsToWorkgroup")) {
        WebSocketMessage webSockeMessage = new WebSocketMessage("tagsToWorkgroup", messageJSON.getString("tags"));
        simpMessagingTemplate.convertAndSend(messageJSON.getString("topic"), webSockeMessage);
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }
}
