package org.wise.portal.service.agent.impl;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.wise.portal.service.agent.EchoAgentService;
import org.wise.vle.domain.WebSocketMessage;

@Service
public class EchoAgentServiceImpl implements EchoAgentService, MessageListener {
    
    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;
  
    @Override
    public void onMessage(Message message, byte[] pattern) {

        try {
                    JSONObject messageJSON = new JSONObject(new String(message.getBody()));

            if (messageJSON.get("type").equals("studentWorkToClassroom")
                    || messageJSON.get("type").equals("studentWorkToTeacher")) {
                WebSocketMessage webSockeMessage = new WebSocketMessage(
                        "studentWork", messageJSON.getString("studentWork"));
                System.out.printf("student work %s",
                        messageJSON.get("studentWork"));
                simpMessagingTemplate.convertAndSend(messageJSON.getString("topic"),
                        webSockeMessage);
            }
        } catch (MessagingException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (JSONException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
                    
        
    }


    
}